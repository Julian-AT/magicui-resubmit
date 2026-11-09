// Resubmits the closed component PRs (#1051-#1067) as single-commit PRs on
// current main, with the AI assistance stated, as the maintainer asked on
// #1051 (2026-11-09). At most `maxOpen` are open at once; after the first
// batch, a new one opens only when a slot frees up (a merge), at most one a
// day. Anything a person should look at (a PR closed without merging, a
// comment, changes requested, failing checks) stops new PRs and notifies.
//
//   node harness/scripts/resubmit.ts status
//   node harness/scripts/resubmit.ts prepare <slug>     local branch only
//   node harness/scripts/resubmit.ts start [--dry-run]  first batch, now
//   node harness/scripts/resubmit.ts tick [--dry-run]   the daily run
//   node harness/scripts/resubmit.ts resume             after a pause
//   node harness/scripts/resubmit.ts install [--at 10:00] [--print] | uninstall
//
// Commits carry their real date and the noreply identity. Nothing here sets
// a date, rewrites history or force-pushes, except rebuilding an open PR's
// own single commit when it conflicts with main (with a lease on that commit).
import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import {
  GLOBALS,
  hasAnimations,
  onlyAddsAnimations,
  projectGlobals,
  registryAnimations,
} from "./lib/package/globals.ts";
import { bodyErrors, subjectErrors } from "./lib/package/messages.ts";
import { listInSkill, REFERENCE, SKILL } from "./lib/package/skill.ts";
import {
  classify,
  entryBytes,
  isCandidate,
  ownGenerated,
  projectShared,
  REGISTRY_UI,
  shared,
  unexpected,
} from "./lib/package/states.ts";
import {
  applyPrInfo,
  branchOf,
  day,
  holdReasons,
  imageUrls,
  isBot,
  type Item,
  needsRefresh,
  nextToOpen,
  OWNER,
  type PrInfo,
  pauseReason,
  resumed,
  type State,
  titleOf,
  withDisclosure,
} from "./lib/resubmit.ts";

const LAB = join(import.meta.dirname, "../..");
const WT =
  process.env.RESUBMIT_WORKTREE ??
  join(homedir(), "Developer/magicui-wt/pr-pack");
const UPSTREAM = "magicuidesign/magicui";
const STATE = join(LAB, "state/resubmit.json");
const LOGS = join(LAB, "runs/_resubmit");
const LABEL = "com.julian-at.magicui-resubmit";
const PLIST = join(homedir(), "Library/LaunchAgents", `${LABEL}.plist`);
const IDENTITY = [
  "-c",
  "user.name=Julian S.",
  "-c",
  "user.email=70039325+Julian-AT@users.noreply.github.com",
];
const NEXT_DIR = join(WT, "apps/www/.next");

// ---------- shell helpers ----------

function run(
  cmd: string,
  args: string[],
  options: { cwd?: string; input?: string } = {},
): string {
  try {
    return execFileSync(cmd, args, {
      cwd: options.cwd ?? WT,
      input: options.input,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      maxBuffer: 256 * 1024 * 1024,
    });
  } catch (error) {
    const stderr = String((error as { stderr?: unknown }).stderr ?? "");
    const stdout = String((error as { stdout?: unknown }).stdout ?? "");
    throw new Error(
      `${cmd} ${args.join(" ")} failed:\n${(stderr || stdout).trim().slice(-2000)}`,
    );
  }
}
const git = (...args: string[]) => run("git", args).trim();
/** Untrimmed file text at a ref: files must keep their final newline. */
const text = (ref: string, path: string) =>
  run("git", ["show", `${ref}:${path}`]);
const blob = (ref: string, path: string) =>
  execFileSync("git", ["show", `${ref}:${path}`], {
    cwd: WT,
    maxBuffer: 256 * 1024 * 1024,
  });
const read = (path: string) => readFileSync(join(WT, path), "utf8");
function write(path: string, data: string | Buffer) {
  mkdirSync(dirname(join(WT, path)), { recursive: true });
  writeFileSync(join(WT, path), data);
}

/** Long commands write straight to a log file, which stays on failure. */
function logged(logFile: string, cmd: string, args: string[]) {
  const fd = openSync(logFile, "w");
  try {
    execFileSync(cmd, args, { cwd: WT, stdio: ["ignore", fd, fd] });
  } catch {
    throw new Error(`${cmd} ${args.join(" ")} failed; see ${logFile}`);
  } finally {
    closeSync(fd);
  }
}

function wrap(prose: string): string {
  const lines: string[] = [];
  let line = "";
  for (const word of prose.split(/\s+/)) {
    if (line && `${line} ${word}`.length > 72) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

// ---------- state, log, notifications ----------

const load = (): State => JSON.parse(readFileSync(STATE, "utf8")) as State;
const save = (state: State) =>
  writeFileSync(STATE, `${JSON.stringify(state, null, 2)}\n`);
const update = (state: State, item: Item): State => ({
  ...state,
  items: state.items.map((i) => (i.slug === item.slug ? item : i)),
});

function log(message: string) {
  mkdirSync(LOGS, { recursive: true });
  appendFileSync(
    join(LOGS, "log.txt"),
    `${new Date().toISOString()} ${message}\n`,
  );
  console.log(message);
}
/**
 * Tell Julian: a macOS notification locally; on GitHub Actions a line in
 * notices.txt, which the workflow posts as an issue comment (so GitHub emails
 * it). The same notice twice in a row is only logged, so a pause or a hold
 * doesn't repeat every day.
 */
function notify(message: string) {
  log(message);
  const last = join(LOGS, "last-notice.txt");
  if (existsSync(last) && readFileSync(last, "utf8") === message) return;
  writeFileSync(last, message);
  if (process.env.GITHUB_ACTIONS === "true") {
    appendFileSync(join(LOGS, "notices.txt"), `- ${message}\n`);
    return;
  }
  if (process.platform !== "darwin") return;
  try {
    execFileSync("osascript", [
      "-e",
      `display notification ${JSON.stringify(message.slice(0, 220))} with title "MagicUI resubmit"`,
    ]);
  } catch {
    // A missing notification never fails the run; the log has the message.
  }
}

function lock(): () => void {
  mkdirSync(LOGS, { recursive: true });
  const path = join(LOGS, "lock");
  try {
    writeFileSync(path, String(process.pid), { flag: "wx" });
  } catch {
    const pid = Number(readFileSync(path, "utf8"));
    let alive = false;
    try {
      process.kill(pid, 0);
      alive = true;
    } catch {
      alive = false;
    }
    if (alive) throw new Error(`another resubmit run (pid ${pid}) is active`);
    writeFileSync(path, String(process.pid));
  }
  return () => rmSync(path, { force: true });
}

// ---------- prepare: one commit on current main ----------

interface Prepared {
  head: string;
  base: string;
  bodyPath: string;
}

/**
 * Rebuild `source`'s component on current upstream/main as one commit on
 * feat/<slug>-v2, run the pre-PR checks, and write the description. Local
 * only. `source` is the closed PR's branch, or for a refresh the open PR's
 * own commit.
 */
async function prepare(item: Item, source: string): Promise<Prepared> {
  const { slug } = item;
  const branch = branchOf(slug);
  const dir = join(LAB, "runs", slug, "resubmit");
  mkdirSync(dir, { recursive: true });
  if (git("status", "--porcelain"))
    throw new Error(`${WT} has uncommitted changes`);
  git("fetch", "--quiet", "--no-tags", "upstream", "main");
  const base = git("rev-parse", "upstream/main");
  const src = git("rev-parse", source);
  const oldBase = git("merge-base", src, base);
  const changed = git("diff", "--name-only", "--no-renames", oldBase, src)
    .split("\n")
    .filter(Boolean);
  unexpected(changed, slug, source);

  git("checkout", "--quiet", "-B", branch, base);
  try {
    let demos = 0;
    let keyframes = false;
    for (const path of changed) {
      if (path === GLOBALS) {
        const animations = registryAnimations(text(src, REGISTRY_UI), slug);
        if (
          !hasAnimations(animations) ||
          text(src, GLOBALS) !==
            projectGlobals(text(oldBase, GLOBALS), animations)
        )
          throw new Error(
            `${GLOBALS}: ${source} changes more than the ${slug} keyframes`,
          );
        const current = read(GLOBALS);
        const next = projectGlobals(current, animations);
        if (!onlyAddsAnimations(current, next, animations))
          throw new Error(`${GLOBALS}: adding the keyframes changed more`);
        write(GLOBALS, next);
        keyframes = true;
        continue;
      }
      if (path === SKILL || path === REFERENCE) continue;
      const kind = classify(path, slug);
      if (isCandidate(kind)) {
        write(path, blob(src, path));
        if (kind === "demo") demos++;
        continue;
      }
      if (kind === "shared") {
        const before = text(oldBase, path);
        const after = text(src, path);
        let rest = after;
        for (const entry of entryBytes(after, path, slug))
          rest = rest.replace(entry, "");
        if (rest !== before)
          throw new Error(
            `${path}: ${source} changes more than the ${slug} entries`,
          );
        write(path, projectShared(read(path), after, path, slug));
        continue;
      }
      if (kind === "generated") continue; // rebuilt by build:registry below
      throw new Error(
        `${source} changes ${path}; a resubmission carries only the component, demos, docs, registry and skill entries`,
      );
    }

    // The skill listing, checked against the closed branch's own listing.
    const was = listInSkill(
      slug,
      text(oldBase, REFERENCE),
      text(oldBase, SKILL),
    );
    if (
      (was.reference ?? text(oldBase, REFERENCE)) !== text(src, REFERENCE) ||
      (was.skill ?? text(oldBase, SKILL)) !== text(src, SKILL)
    )
      throw new Error(
        `${source}: the magic-ui skill change is not the listing`,
      );
    const listed = listInSkill(slug, read(REFERENCE), read(SKILL));
    if (listed.reference !== null) write(REFERENCE, listed.reference);
    if (listed.skill !== null) write(SKILL, listed.skill);

    logged(join(dir, "build-registry.log"), "pnpm", ["build:registry"]);
    git("add", "-A");
    const staged = git("diff", "--cached", "--name-only", "--no-renames")
      .split("\n")
      .filter(Boolean);
    const stray = staged.filter(
      (path) =>
        !isCandidate(classify(path, slug)) &&
        !shared.includes(path) &&
        !ownGenerated(path, slug) &&
        ![GLOBALS, SKILL, REFERENCE].includes(path),
    );
    if (stray.length)
      throw new Error(
        `unexpected changes after build:registry: ${stray.join(", ")}`,
      );
    // On the same main, the rebuild must equal the closed branch's final tree.
    if (
      base === oldBase &&
      git("write-tree") !== git("rev-parse", `${src}^{tree}`)
    )
      throw new Error(
        `the rebuilt tree differs from ${source}:\n${git("diff", "--cached", "--stat", src)}`,
      );

    // The CONTRIBUTING pre-PR checks, on exactly what gets committed.
    logged(join(dir, "check.log"), "pnpm", ["check"]);
    rmSync(NEXT_DIR, { recursive: true, force: true });
    logged(join(dir, "build.log"), "pnpm", ["build"]);
    rmSync(NEXT_DIR, { recursive: true, force: true });
    if (
      run("git", ["status", "--porcelain", "--untracked-files=all"])
        .split("\n")
        .some((l) => l && !/^[AM] /.test(l))
    )
      throw new Error("the checks or the build changed files in the worktree");

    const pascal = slug
      .split("-")
      .map((word) => word[0]!.toUpperCase() + word.slice(1))
      .join("");
    const subject = titleOf(slug);
    const body = wrap(
      `Add ${pascal} with ${demos} demo${demos === 1 ? "" : "s"}, a docs page and sidebar entry, its registry entries${keyframes ? ", its keyframes in globals.css" : ""} and a listing in the magic-ui skill.`,
    );
    const errors = [
      ...subjectErrors(subject, slug, true),
      ...bodyErrors(body, slug),
    ];
    if (errors.length) throw new Error(`${subject}: ${errors.join("; ")}`);
    const message = `${subject}\n\n${body}\n`;
    run("pnpm", ["exec", "commitlint"], { input: message });
    const messageFile = join(dir, "message.txt");
    writeFileSync(messageFile, message);
    git(...IDENTITY, "commit", "--quiet", "-F", messageFile);

    const head = git("rev-parse", "HEAD");
    if (git("rev-list", "--count", `${base}..${head}`) !== "1")
      throw new Error(`${branch} is not one commit on upstream/main`);
    for (const format of ["%aI", "%cI"])
      if (
        day(new Date(git("log", "-1", `--format=${format}`, head))) !==
        day(new Date())
      )
        throw new Error(`${branch}: the commit does not carry today's date`);

    const description = withDisclosure(
      readFileSync(join(LAB, "runs", slug, "pr-body.final.md"), "utf8"),
      item.oldPr,
    );
    if (/[^\n\x20-\x7e]/.test(description))
      throw new Error("the description must be printable ASCII");
    for (const url of imageUrls(description)) {
      const response = await fetch(url, { method: "HEAD" });
      if (!response.ok) throw new Error(`${url} returns ${response.status}`);
    }
    const bodyPath = join(dir, "pr-body.md");
    writeFileSync(bodyPath, description);
    log(
      `${slug}: prepared ${head.slice(0, 8)} on upstream/main ${base.slice(0, 8)}`,
    );
    return { head, base, bodyPath };
  } catch (error) {
    // Leave the worktree clean for the next run; the logs stay in runs/.
    git("reset", "--quiet", "--hard", "HEAD");
    git("clean", "-fdq");
    throw error;
  }
}

// ---------- GitHub ----------

interface GhActor {
  login?: string;
}
interface GhPr {
  number: number;
  state: PrInfo["state"];
  mergedAt: string | null;
  closedAt: string | null;
  mergeable: PrInfo["mergeable"];
  reviewDecision: string | null;
  headRefOid: string;
  comments: { author: GhActor | null; createdAt: string }[];
  reviews: {
    author: GhActor | null;
    submittedAt: string | null;
    state: string;
  }[];
  statusCheckRollup:
    | { name?: string; context?: string; conclusion?: string; state?: string }[]
    | null;
}

const FAILED = new Set([
  "FAILURE",
  "ERROR",
  "TIMED_OUT",
  "CANCELLED",
  "ACTION_REQUIRED",
  "STARTUP_FAILURE",
]);

function prInfo(number: number): PrInfo {
  const pr = JSON.parse(
    run("gh", [
      "pr",
      "view",
      String(number),
      "--repo",
      UPSTREAM,
      "--json",
      "number,state,mergedAt,closedAt,mergeable,reviewDecision,headRefOid,comments,reviews,statusCheckRollup",
    ]),
  ) as GhPr;
  const activity = [
    ...pr.comments.map((c) => ({
      login: c.author?.login ?? "",
      at: c.createdAt,
      approval: false,
    })),
    ...pr.reviews.map((r) => ({
      login: r.author?.login ?? "",
      at: r.submittedAt ?? "",
      approval: r.state === "APPROVED",
    })),
  ]
    .filter((a) => a.at)
    .sort((a, b) => a.at.localeCompare(b.at));
  const theirs = activity
    .filter((a) => a.login !== OWNER && !isBot(a.login) && !a.approval)
    .at(-1);
  return {
    number: pr.number,
    state: pr.state,
    mergedAt: pr.mergedAt,
    closedAt: pr.closedAt,
    mergeable: pr.mergeable,
    reviewDecision: pr.reviewDecision || null,
    headSha: pr.headRefOid,
    lastMaintainerAt: theirs?.at ?? null,
    lastMaintainer: theirs?.login ?? null,
    lastOwnAt: activity.filter((a) => a.login === OWNER).at(-1)?.at ?? null,
    failingChecks: (pr.statusCheckRollup ?? [])
      .filter((check) => !/vercel/i.test(check.name ?? check.context ?? ""))
      .filter((check) => FAILED.has(check.conclusion || check.state || ""))
      .map((check) => check.name ?? check.context ?? "check"),
  };
}

async function publish(
  state: State,
  item: Item,
  dryRun: boolean,
): Promise<State> {
  const branch = branchOf(item.slug);
  git("fetch", "--quiet", "--no-tags", "upstream", "main");
  let current = item;
  let local = "";
  try {
    local = git("rev-parse", "--verify", "--quiet", `refs/heads/${branch}`);
  } catch {
    local = "";
  }
  if (
    item.status !== "prepared" ||
    item.base !== git("rev-parse", "upstream/main") ||
    local !== item.head
  ) {
    const prepared = await prepare(item, `origin/feat/${item.slug}`);
    current = {
      ...item,
      status: "prepared",
      head: prepared.head,
      base: prepared.base,
    };
    state = update(state, current);
    save(state);
  }
  const bodyPath = join(LAB, "runs", item.slug, "resubmit", "pr-body.md");
  const remote =
    git("ls-remote", "--heads", "origin", `refs/heads/${branch}`).split(
      /\s/,
    )[0] ?? "";
  if (remote && remote !== current.head)
    throw new Error(`${branch} already exists on the fork at ${remote}`);
  const push = ["push", "origin", `${branch}:refs/heads/${branch}`];
  const create = [
    "pr",
    "create",
    "--repo",
    UPSTREAM,
    "--base",
    "main",
    "--head",
    `${OWNER}:${branch}`,
    "--title",
    titleOf(item.slug),
    "--body-file",
    bodyPath,
  ];
  if (dryRun) {
    console.log(
      `[dry run] git ${push.join(" ")}\n[dry run] gh ${create.join(" ")}`,
    );
    return update(state, {
      ...current,
      status: "open",
      openedAt: new Date().toISOString(),
    });
  }
  if (!remote) git(...push);
  const existing = JSON.parse(
    run("gh", [
      "pr",
      "list",
      "--repo",
      UPSTREAM,
      "--author",
      OWNER,
      "--head",
      branch,
      "--state",
      "open",
      "--json",
      "number",
    ]),
  ) as { number: number }[];
  const number =
    existing[0]?.number ??
    Number(/\/pull\/(\d+)/.exec(run("gh", create))?.[1] ?? Number.NaN);
  if (!Number.isInteger(number))
    throw new Error(`gh pr create gave no PR number for ${branch}`);
  current = {
    ...current,
    status: "open",
    pr: number,
    openedAt: new Date().toISOString(),
  };
  state = update(state, current);
  save(state);
  notify(`Opened #${number}: ${titleOf(item.slug)}`);
  return state;
}

/** Rebuild an open PR's single commit on current main when it conflicts. */
async function refresh(
  state: State,
  item: Item,
  dryRun: boolean,
): Promise<State> {
  const branch = branchOf(item.slug);
  git("fetch", "--quiet", "--no-tags", "origin", branch);
  if (git("rev-parse", `origin/${branch}`) !== item.head)
    throw new Error(
      `${branch} on the fork has commits the script did not make`,
    );
  const prepared = await prepare(item, item.head!);
  const push = [
    "push",
    `--force-with-lease=refs/heads/${branch}:${item.head}`,
    "origin",
    `${branch}:refs/heads/${branch}`,
  ];
  if (dryRun) {
    console.log(`[dry run] git ${push.join(" ")}`);
    return state;
  }
  git(...push);
  state = update(state, { ...item, head: prepared.head, base: prepared.base });
  save(state);
  notify(
    `#${item.pr} (${item.slug}) conflicted with main; rebuilt it as one commit on current main`,
  );
  return state;
}

// ---------- commands ----------

async function tick(batch: boolean, dryRun: boolean) {
  const release = lock();
  try {
    let state = load();
    if (state.paused) {
      notify(`Paused: ${state.paused.reason}`);
      return;
    }
    const tracked = state.items.filter(
      (item) => item.status === "open" && item.pr !== undefined,
    );
    const infos = tracked.map((item) => prInfo(item.pr!));
    const before = new Map(state.items.map((item) => [item.slug, item.status]));
    state = applyPrInfo(state, infos);
    for (const item of state.items)
      if (item.status === "merged" && before.get(item.slug) !== "merged")
        notify(`#${item.pr} (${item.slug}) was merged`);
    if (!dryRun) save(state);

    const pause = pauseReason(state);
    if (pause) {
      state = {
        ...state,
        paused: { reason: pause, at: new Date().toISOString() },
      };
      if (!dryRun) save(state);
      notify(`Paused: ${pause}`);
      return;
    }

    const { refresh: stale, manual } = needsRefresh(state, infos);
    for (const item of stale) {
      try {
        state = await refresh(state, item, dryRun);
      } catch (error) {
        manual.push(
          `#${item.pr} (${item.slug}) conflicts with main and could not be rebuilt: ${error instanceof Error ? error.message.split("\n")[0] : error}`,
        );
      }
    }
    const holds = [...manual, ...holdReasons(state, infos)];
    if (holds.length) {
      notify(`No new PR today. ${holds.join("; ")}`);
      return;
    }

    for (;;) {
      const next = nextToOpen(state, day(new Date()), batch);
      if ("wait" in next) {
        log(`Nothing to open: ${next.wait}`);
        return;
      }
      try {
        state = await publish(state, next.item, dryRun);
      } catch (error) {
        notify(
          `Could not open ${next.item.slug}: ${error instanceof Error ? error.message.split("\n")[0] : error}. Log: runs/${next.item.slug}/resubmit/`,
        );
        throw error;
      }
      if (!batch) return;
    }
  } finally {
    release();
  }
}

function status() {
  const state = load();
  const rows = state.items.map((item) =>
    [
      item.slug.padEnd(16),
      item.status.padEnd(8),
      `was #${item.oldPr}`,
      item.pr ? `now #${item.pr}` : "",
      item.openedAt ? `opened ${day(new Date(item.openedAt))}` : "",
      item.mergedAt ? `merged ${day(new Date(item.mergedAt))}` : "",
    ]
      .filter(Boolean)
      .join("  "),
  );
  console.log(rows.join("\n"));
  console.log(
    `\nmax open: ${state.maxOpen}. ${state.paused ? `PAUSED: ${state.paused.reason}` : "not paused."} Daily job: ${existsSync(PLIST) ? "installed" : "not installed"}.`,
  );
}

function resume() {
  save(resumed(load()));
  console.log("Resumed. The next daily run continues the queue.");
}

function install(at: string, print: boolean) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(at);
  if (!match) throw new Error(`--at must be HH:MM, not ${at}`);
  const path = [
    dirname(process.execPath),
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin",
  ].join(":");
  mkdirSync(LOGS, { recursive: true });
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${process.execPath}</string>
    <string>--disable-warning=ExperimentalWarning</string>
    <string>${join(LAB, "harness/scripts/resubmit.ts")}</string>
    <string>tick</string>
  </array>
  <key>WorkingDirectory</key><string>${LAB}</string>
  <key>EnvironmentVariables</key>
  <dict><key>PATH</key><string>${path}</string></dict>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>${Number(match[1])}</integer><key>Minute</key><integer>${Number(match[2])}</integer></dict>
  <key>StandardOutPath</key><string>${join(LOGS, "launchd.log")}</string>
  <key>StandardErrorPath</key><string>${join(LOGS, "launchd.log")}</string>
</dict>
</plist>
`;
  if (print) {
    process.stdout.write(plist);
    return;
  }
  mkdirSync(dirname(PLIST), { recursive: true });
  writeFileSync(PLIST, plist);
  const domain = `gui/${process.getuid?.() ?? 501}`;
  try {
    execFileSync("launchctl", ["bootout", `${domain}/${LABEL}`], {
      stdio: "ignore",
    });
  } catch {
    // Not loaded yet.
  }
  execFileSync("launchctl", ["bootstrap", domain, PLIST]);
  console.log(`Installed ${PLIST}: runs "tick" every day at ${at}.`);
}

function uninstall() {
  const domain = `gui/${process.getuid?.() ?? 501}`;
  try {
    execFileSync("launchctl", ["bootout", `${domain}/${LABEL}`], {
      stdio: "ignore",
    });
  } catch {
    // Not loaded.
  }
  rmSync(PLIST, { force: true });
  console.log("Daily job removed.");
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      "dry-run": { type: "boolean", default: false },
      at: { type: "string", default: "10:00" },
      print: { type: "boolean", default: false },
    },
  });
  for (const name of ["GIT_AUTHOR_DATE", "GIT_COMMITTER_DATE"])
    if (process.env[name])
      throw new Error(
        `${name} is set; refusing. Commits carry their real date.`,
      );
  const [command, slug] = positionals;
  const dryRun = values["dry-run"];
  if (command === "status") return status();
  if (command === "start") return tick(true, dryRun);
  if (command === "tick") return tick(false, dryRun);
  if (command === "resume") return resume();
  if (command === "install") return install(values.at, values.print);
  if (command === "uninstall") return uninstall();
  if (command === "prepare" && slug) {
    const release = lock();
    try {
      let state = load();
      const item = state.items.find((i) => i.slug === slug);
      if (!item) throw new Error(`${slug} is not in ${STATE}`);
      if (item.status !== "queued" && item.status !== "prepared")
        throw new Error(
          `${slug} is ${item.status}; only queued items are prepared`,
        );
      const prepared = await prepare(item, `origin/feat/${slug}`);
      state = update(state, {
        ...item,
        status: "prepared",
        head: prepared.head,
        base: prepared.base,
      });
      save(state);
      return;
    } finally {
      release();
    }
  }
  throw new Error(
    "usage: resubmit.ts status | prepare <slug> | start [--dry-run] | tick [--dry-run] | resume | install [--at HH:MM] [--print] | uninstall",
  );
}

try {
  await main();
} catch (error) {
  log(`error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
