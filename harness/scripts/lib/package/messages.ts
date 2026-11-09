import { readFile } from "node:fs/promises";

/** Message text is never rewritten: anything that fails these rules is rejected. */
export interface CommitMessage {
  state: string;
  subject: string;
  body: string;
}

const TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "chore",
  "build",
  "ci",
  "revert",
];
// Words that reveal how the component was made. Checked with the slug removed,
// so `agent-trace` / `AgentTrace` / `Agent Trace` are fine but "agent" is not.
const BANNED: [RegExp, string][] = [
  [/\bstudios?\b/i, "studio"],
  [/\bagent(?:s|ic)?\b/i, "agent"],
  [/\breviewers?\b/i, "reviewer"],
  [/\borchestrat\w*/i, "orchestrator"],
  [/\bharness(?:es)?\b/i, "harness"],
  [/\brounds?\b/i, "round"],
  [/\bbriefs?\b/i, "brief"],
  [/\bcodex\b/i, "Codex"],
  [/\bclaude\b/i, "Claude"],
  [/\bjulian\b/i, "Julian"],
  [/\bpanels?\b/i, "panel"],
  [/\bfindings\b/i, "findings"],
  [/\b200[\s-]+lines?\b/i, "200 lines"],
  [/\bt\d+(?:ms)?\b/i, "frame timestamp"],
  [/\bruns\//i, "runs/"],
];
const literal = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function banned(text: string, slug: string): string[] {
  const forms = new RegExp(slug.split("-").map(literal).join("[-_ ]?"), "gi");
  const stripped = text.replace(forms, " ");
  return BANNED.flatMap(([pattern, label]) => {
    const match = pattern.exec(stripped);
    return match ? [`"${match[0]}" (${label})`] : [];
  });
}

const IMPERATIVE = new Set([
  "access",
  "address",
  "bypass",
  "embed",
  "focus",
  "pass",
  "process",
  "shed",
  "shred",
  "bring",
  "ping",
  "ring",
  "string",
  "swing",
]);
function imperative(word: string): boolean {
  if (IMPERATIVE.has(word)) return true;
  if (/ed$/.test(word) && !/eed$/.test(word)) return false;
  if (/ing$/.test(word)) return false;
  return !/s$/.test(word) || /(?:ss|us)$/.test(word);
}

export function subjectErrors(
  subject: string,
  slug: string,
  first = false,
): string[] {
  const errors: string[] = [];
  if (/[^\x20-\x7e]/.test(subject))
    errors.push("subject must be one line of printable ASCII");
  if (subject.length > 72)
    errors.push(`subject is ${subject.length} characters; the limit is 72`);
  if (subject !== subject.trim())
    errors.push("subject has leading or trailing spaces");
  if (/\.$/.test(subject)) errors.push("subject ends with a period");
  const match = /^([a-z]+)\(([^()]+)\): (\S.*)$/.exec(subject);
  if (!match)
    errors.push(
      `subject must read "type(${slug}): lowercase imperative summary"`,
    );
  else {
    const [, type, scope, summary] = match as unknown as [
      string,
      string,
      string,
      string,
    ];
    if (!TYPES.includes(type))
      errors.push(`unknown type "${type}" (use ${TYPES.join(", ")})`);
    if (scope !== slug && scope !== "registry")
      errors.push(`scope must be ${slug} (or registry), not "${scope}"`);
    if (first && (type !== "feat" || scope !== slug))
      errors.push(`the first commit must be feat(${slug}): ...`);
    if (!/^[a-z]/.test(summary))
      errors.push("summary must start with a lowercase letter");
    const word = summary.split(" ")[0]!;
    if (/^[a-z]/.test(word) && !imperative(word))
      errors.push(`summary must start with an imperative verb, not "${word}"`);
  }
  errors.push(
    ...banned(subject, slug).map((word) => `subject contains ${word}`),
  );
  return errors;
}

/** One prose paragraph, then optionally one block of `- ` bullets. */
export function bodyErrors(body: string, slug: string): string[] {
  if (body === "") return [];
  const errors: string[] = [];
  if (/[^\x20-\x7e\n]/.test(body))
    errors.push("body must be printable ASCII (no tabs or Unicode punctuation)");
  if (/^\s|\s$/.test(body))
    errors.push("body must not start or end with spaces or blank lines");
  if (/\n{3,}/.test(body))
    errors.push("body must not contain consecutive blank lines");
  for (const [index, line] of body.split("\n").entries()) {
    if (line.length > 72)
      errors.push(
        `body line ${index + 1} is ${line.length} characters; wrap at 72`,
      );
    if (/ $/.test(line)) errors.push(`body line ${index + 1} ends with a space`);
  }
  if (/^[A-Za-z-]+-by: /im.test(body))
    errors.push("body must not contain trailers (--trailers adds them)");
  const [paragraph = "", ...rest] = body.split(/\n\n+/);
  if (/^(?:[-*+] |\d+[.)] |\s)/m.test(paragraph))
    errors.push(
      "body must open with one prose paragraph (no bullets or indentation)",
    );
  if (rest.length > 1)
    errors.push(
      "body must be one prose paragraph followed by at most one block of - bullets",
    );
  const list = rest[0]?.split("\n") ?? [];
  if (
    list.length &&
    (!list[0]!.startsWith("- ") ||
      list.some((line) => !/^(?:- \S| {2}\S)/.test(line)))
  )
    errors.push(
      'the block after the paragraph must be "- " bullets (continuation lines indent two spaces)',
    );
  errors.push(...banned(body, slug).map((word) => `body contains ${word}`));
  return errors;
}

export function defaultSubject(id: string, slug: string, name: string) {
  return (
    {
      component: `feat(${slug}): add ${name} component`,
      demos: `feat(${slug}): add demos`,
      registry: `chore(registry): register ${slug}`,
      docs: `docs(${slug}): add docs page and sidebar entry`,
    }[id] ?? `fix(${slug}): address review feedback`
  );
}

/** Validate a messages file: exactly one entry per planned commit. */
export async function loadMessages(
  path: string,
  ids: string[],
  slug: string,
): Promise<Map<string, CommitMessage>> {
  let data: unknown;
  try {
    data = JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(
      `Cannot read --messages ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  const errors: string[] = [];
  const result = new Map<string, CommitMessage>();
  if (!Array.isArray(data))
    throw new Error(`--messages ${path} must be a JSON array`);
  for (const [index, item] of data.entries()) {
    const where = `entry ${index + 1}`;
    if (
      !item ||
      typeof item !== "object" ||
      Object.keys(item).sort().join() !== "body,state,subject" ||
      Object.values(item).some((value) => typeof value !== "string")
    ) {
      errors.push(`${where}: must be { "state", "subject", "body" } strings`);
      continue;
    }
    const message = item as CommitMessage;
    if (!ids.includes(message.state)) {
      errors.push(`${where}: unknown state "${message.state}"`);
      continue;
    }
    if (result.has(message.state)) {
      errors.push(`${where}: duplicate state "${message.state}"`);
      continue;
    }
    result.set(message.state, message);
    errors.push(
      ...[
        ...subjectErrors(message.subject, slug, message.state === ids[0]),
        ...bodyErrors(message.body, slug),
      ].map((error) => `${message.state}: ${error}`),
    );
  }
  for (const id of ids)
    if (!result.has(id)) errors.push(`missing a message for state "${id}"`);
  if (errors.length)
    throw new Error(
      [`Invalid --messages ${path}:`, ...errors.map((e) => `- ${e}`)].join(
        "\n",
      ),
    );
  return result;
}

export function compose(
  subject: string,
  body: string,
  trailers: boolean,
): string {
  return `${subject}\n${body ? `\n${body}\n` : ""}${trailers ? "\nCo-Authored-By: Codex <noreply@openai.com>\n" : ""}`;
}
