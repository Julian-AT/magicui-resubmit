// Pacing rules for resubmitting the closed component PRs (#1051-#1067) as
// single-commit PRs, after the maintainer asked for 2-3 at a time with the AI
// assistance stated. Pure functions; harness/scripts/resubmit.ts does the I/O.

/** "dropped": closed without merging, acknowledged with `resume`. */
export type Status =
  "queued" | "prepared" | "open" | "merged" | "closed" | "dropped";

export interface Item {
  slug: string;
  /** The closed PR this one replaces. */
  oldPr: number;
  status: Status;
  /** The single commit, and the upstream/main it sits on. */
  head?: string;
  base?: string;
  pr?: number;
  openedAt?: string;
  mergedAt?: string;
  closedAt?: string;
}

export interface State {
  /** Most resubmission PRs open at once. */
  maxOpen: number;
  paused: { reason: string; at: string } | null;
  /** Queue order: the first items go up first. */
  items: Item[];
}

export interface PrInfo {
  number: number;
  state: "OPEN" | "CLOSED" | "MERGED";
  mergedAt: string | null;
  closedAt: string | null;
  mergeable: "MERGEABLE" | "CONFLICTING" | "UNKNOWN";
  reviewDecision: string | null;
  headSha: string;
  /** Latest comment or non-approving review by someone other than the owner or a bot. */
  lastMaintainerAt: string | null;
  lastMaintainer: string | null;
  /** The owner's latest comment or review. */
  lastOwnAt: string | null;
  failingChecks: string[];
}

export const OWNER = "Julian-AT";
const BOTS = new Set([
  "vercel",
  "github-actions",
  "coderabbitai",
  "dependabot",
]);
export const isBot = (login: string) =>
  BOTS.has(login) || /\[bot\]$|bot$/i.test(login);

export const branchOf = (slug: string) => `feat/${slug}-v2`;
export const titleOf = (slug: string) => `feat(${slug}): add ${slug} component`;

/** Local calendar day, YYYY-MM-DD. */
export const day = (date: Date) => date.toLocaleDateString("sv-SE");

/** Statuses and timestamps from GitHub. */
export function applyPrInfo(state: State, infos: PrInfo[]): State {
  const byNumber = new Map(infos.map((info) => [info.number, info]));
  return {
    ...state,
    items: state.items.map((item) => {
      const info = item.pr === undefined ? undefined : byNumber.get(item.pr);
      if (!info) return item;
      if (info.state === "MERGED")
        return {
          ...item,
          status: "merged",
          mergedAt: info.mergedAt ?? undefined,
        };
      if (info.state === "CLOSED")
        return {
          ...item,
          status: "closed",
          closedAt: info.closedAt ?? undefined,
        };
      return { ...item, status: "open" };
    }),
  };
}

/** A PR closed without merging stops everything until Julian resumes. */
export function pauseReason(state: State): string | null {
  const closed = state.items.filter((item) => item.status === "closed");
  if (!closed.length) return null;
  return `${closed.map((item) => `#${item.pr} (${item.slug})`).join(", ")} closed without merging. Read the thread, then run: resubmit.ts resume`;
}

/** Open PRs that need Julian before another one goes up. */
export function holdReasons(state: State, infos: PrInfo[]): string[] {
  const byNumber = new Map(infos.map((info) => [info.number, info]));
  const reasons: string[] = [];
  for (const item of state.items) {
    if (item.status !== "open" || item.pr === undefined) continue;
    const info = byNumber.get(item.pr);
    if (!info) continue;
    if (info.reviewDecision === "CHANGES_REQUESTED")
      reasons.push(`#${item.pr} (${item.slug}): changes requested`);
    else if (
      info.lastMaintainerAt &&
      (!info.lastOwnAt || info.lastMaintainerAt > info.lastOwnAt)
    )
      reasons.push(
        `#${item.pr} (${item.slug}): ${info.lastMaintainer} commented, waiting for your reply`,
      );
    if (info.failingChecks.length)
      reasons.push(
        `#${item.pr} (${item.slug}): failing checks: ${info.failingChecks.join(", ")}`,
      );
  }
  return reasons;
}

/** Open PRs that conflict with main and still hold only our single commit. */
export function needsRefresh(
  state: State,
  infos: PrInfo[],
): { refresh: Item[]; manual: string[] } {
  const byNumber = new Map(infos.map((info) => [info.number, info]));
  const refresh: Item[] = [];
  const manual: string[] = [];
  for (const item of state.items) {
    if (item.status !== "open" || item.pr === undefined) continue;
    const info = byNumber.get(item.pr);
    if (info?.mergeable !== "CONFLICTING") continue;
    if (info.headSha === item.head) refresh.push(item);
    else
      manual.push(
        `#${item.pr} (${item.slug}) conflicts with main and has commits the script did not make; update it by hand`,
      );
  }
  return { refresh, manual };
}

/**
 * The next item to open, or why nothing opens. `batch` (the first run) fills
 * every free slot today; a daily tick opens at most one per day.
 */
export function nextToOpen(
  state: State,
  today: string,
  batch: boolean,
): { item: Item } | { wait: string } {
  if (state.paused) return { wait: `paused: ${state.paused.reason}` };
  const open = state.items.filter((item) => item.status === "open").length;
  if (open >= state.maxOpen)
    return {
      wait: `${open} of ${state.maxOpen} open; the next one opens after a merge`,
    };
  if (
    !batch &&
    state.items.some(
      (item) => item.openedAt && day(new Date(item.openedAt)) === today,
    )
  )
    return { wait: "one already opened today" };
  const item = state.items.find(
    (item) => item.status === "queued" || item.status === "prepared",
  );
  return item ? { item } : { wait: "queue is empty" };
}

/** The AI assistance note the maintainer asked for, in every description. */
export const AI_NOTE =
  "**AI assistance:** Built with AI coding agents (Claude Code and OpenAI Codex). I picked the idea from a shortlist and reviewed the result in the browser; the agents wrote the code, demos, docs and this description, and fixed them against automated browser, accessibility and performance checks.";

/** The approved description with the AI note and the closed PR it replaces. */
export function withDisclosure(body: string, oldPr: number): string {
  const marker = "\n## Changes\n";
  const at = body.indexOf(marker);
  if (at < 0) throw new Error('description has no "## Changes" section');
  if (body.includes("**AI assistance:**"))
    throw new Error("description already has an AI assistance note");
  const note = `${AI_NOTE}\n\nResubmits #${oldPr} as a single commit on current main.\n`;
  return `${body.slice(0, at).trimEnd()}\n\n${note}${body.slice(at)}`;
}

/** Clear a pause; PRs closed without merging leave the queue for good. */
export function resumed(state: State): State {
  return {
    ...state,
    paused: null,
    items: state.items.map((item) =>
      item.status === "closed" ? { ...item, status: "dropped" } : item,
    ),
  };
}

/** Hosted image URLs in a description (not the `src` in usage snippets). */
export const imageUrls = (body: string) =>
  [...body.matchAll(/<img src="(https:\/\/[^"]+)"/g)].map((match) => match[1]!);
