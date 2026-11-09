import ts from "typescript-api";
import { objectLiterals, property, staticValue, stringValue } from "../ast.ts";
import type { Commands } from "./git.ts";
import type { File } from "./states.ts";

/**
 * Upstream mirrors every registry keyframe into the docs site's own
 * stylesheet (see #769 and #936), so the docs page animates too.
 */
export const GLOBALS = "apps/www/styles/globals.css";

export type Frame = [selector: string, declarations: [string, string][]];
export interface Animations {
  /** `cssVars.theme["animate-<name>"]` as `[name, value]`, in entry order. */
  variables: [string, string][];
  /** `css["@keyframes <name>"]` as `[name, frames]`, in entry order. */
  keyframes: [string, Frame[]][];
  /** Other `cssVars` / `css` keys, which have no globals.css mirror here. */
  unsupported: string[];
}

const NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const SELECTOR = /^(?:from|to|\d+(?:\.\d+)?%)$/;
const literal = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const kebab = (name: string) =>
  name.startsWith("--")
    ? name
    : name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

function cssValue(value: unknown, where: string): string {
  const text = typeof value === "number" ? String(value) : value;
  if (typeof text !== "string" || !text.trim() || /[;{}\n\r]/.test(text))
    throw new Error(`${where} must be a one-line CSS value`);
  return text.trim();
}

/** The slug's `animate-*` theme variables and `@keyframes` from registry-ui.ts. */
export function registryAnimations(source: string, slug: string): Animations {
  const result: Animations = { variables: [], keyframes: [], unsupported: [] };
  const found = objectLiterals(source).filter(
    (object) =>
      ts.isArrayLiteralExpression(object.parent) &&
      stringValue(property(object, "name")) === slug,
  );
  if (found.length > 1)
    throw new Error(`registry-ui.ts: ${slug} has more than one entry`);
  const entry = found[0];
  if (!entry) return result;
  const where = `registry-ui.ts ${slug}`;
  const read = (key: string) => {
    const node = entry.properties.find(
      (p) =>
        p.name &&
        (ts.isIdentifier(p.name) ? p.name.text : stringValue(p.name)) === key,
    );
    if (!node) return undefined;
    const value = ts.isPropertyAssignment(node)
      ? staticValue(node.initializer)
      : undefined;
    if (!record(value))
      throw new Error(`${where}: ${key} must be a static object literal`);
    return value;
  };
  for (const [group, vars] of Object.entries(read("cssVars") ?? {})) {
    if (group !== "theme" || !record(vars)) {
      result.unsupported.push(`cssVars.${group}`);
      continue;
    }
    for (const [key, value] of Object.entries(vars)) {
      const name = /^animate-(.+)$/.exec(key)?.[1];
      if (name === undefined) {
        result.unsupported.push(`cssVars.theme.${key}`);
        continue;
      }
      if (!NAME.test(name))
        throw new Error(`${where}: cssVars.theme.${key} is not a plain name`);
      result.variables.push([
        name,
        cssValue(value, `${where}: cssVars.theme.${key}`),
      ]);
    }
  }
  for (const [key, frames] of Object.entries(read("css") ?? {})) {
    const name = /^@keyframes\s+(\S+)$/.exec(key)?.[1];
    if (name === undefined) {
      result.unsupported.push(`css["${key}"]`);
      continue;
    }
    if (!NAME.test(name) || !record(frames))
      throw new Error(`${where}: css["${key}"] must name and map its frames`);
    result.keyframes.push([
      name,
      Object.entries(frames).map(([selector, declarations]): Frame => {
        const at = `${where}: css["${key}"]["${selector}"]`;
        if (!selector.split(",").every((part) => SELECTOR.test(part.trim())))
          throw new Error(`${at} is not a keyframe selector`);
        if (!record(declarations) || !Object.keys(declarations).length)
          throw new Error(`${at} must map properties to values`);
        return [
          selector,
          Object.entries(declarations).map(([prop, value]) => {
            if (!/^(?:--)?[A-Za-z][A-Za-z0-9-]*$/.test(prop))
              throw new Error(`${at}.${prop} is not a CSS property`);
            return [kebab(prop), cssValue(value, `${at}.${prop}`)];
          }),
        ];
      }),
    ]);
  }
  return result;
}

export const hasAnimations = ({ variables, keyframes }: Animations) =>
  variables.length > 0 || keyframes.length > 0;
export const animationNames = ({ variables, keyframes }: Animations) => [
  ...variables.map(([name]) => `--animate-${name}`),
  ...keyframes.map(([name]) => `@keyframes ${name}`),
];

/** globals.css at `ref`, or undefined when that tree has none. */
export async function readGlobals(
  git: Commands,
  cwd: string,
  ref: string,
): Promise<File | undefined> {
  const entry = (await git.git(cwd, ["ls-tree", "-z", ref, "--", GLOBALS]))
    .toString()
    .split("\0")[0];
  const match = /^(\d+) blob ([a-f0-9]+)\t/.exec(entry ?? "");
  if (!match) return undefined;
  if (match[1] !== "100644")
    throw new Error(`Unsupported file mode upstream: ${GLOBALS} (${match[1]})`);
  return {
    mode: match[1],
    bytes: await git.git(cwd, ["cat-file", "blob", match[2]!]),
  };
}

const definesVariable = (css: string, name: string) =>
  new RegExp(`--animate-${literal(name)}\\s*:`).test(css);
const definesKeyframes = (css: string, name: string) =>
  new RegExp(`@keyframes\\s+${literal(name)}(?![\\w-])`).test(css);

/** Index just past the `}` closing the `{` at `open`; skips comments and strings. */
function closing(css: string, open: number): number {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    const char = css[i];
    if (char === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      if (end < 0) break;
      i = end + 1;
    } else if (char === '"' || char === "'") {
      for (i++; i < css.length && css[i] !== char; i++)
        if (css[i] === "\\") i++;
    } else if (char === "{") depth++;
    else if (char === "}" && --depth === 0) return i + 1;
  }
  throw new Error(`${GLOBALS}: unbalanced braces`);
}
const lineEnd = (css: string, index: number) => {
  const end = css.indexOf("\n", index);
  return end < 0 ? css.length : end + 1;
};

/** Upstream's layout: selector lists one per line, 2/4/6-space indents. */
export function keyframesBlock(name: string, frames: Frame[]): string {
  return [
    `  @keyframes ${name} {\n`,
    ...frames.map(
      ([selector, declarations]) =>
        `    ${selector
          .split(",")
          .map((part) => part.trim())
          .join(",\n    ")} {\n${declarations
          .map(([prop, value]) => `      ${prop}: ${value};\n`)
          .join("")}    }\n`,
    ),
    "  }\n",
  ].join("");
}

/**
 * Add the slug's animations to upstream's `@theme inline` block: each
 * `--animate-*` line after the last existing one, each `@keyframes` block
 * (after a blank line) after the last existing one. Nothing else moves.
 */
export function projectGlobals(css: string, animations: Animations): string {
  const { variables, keyframes } = animations;
  if (!hasAnimations(animations)) return css;
  const taken = [
    ...variables
      .filter(([name]) => definesVariable(css, name))
      .map(([name]) => `--animate-${name}`),
    ...keyframes
      .filter(([name]) => definesKeyframes(css, name))
      .map(([name]) => `@keyframes ${name}`),
  ];
  if (taken.length)
    throw new Error(
      `${GLOBALS} already defines ${taken.join(", ")} upstream; rename the animation in the registry entry`,
    );
  const themes = [...css.matchAll(/^@theme inline \{[ \t]*$/gm)];
  if (themes.length !== 1)
    throw new Error(
      `${GLOBALS}: expected exactly one "@theme inline {" block upstream, found ${themes.length}`,
    );
  const open = css.indexOf("{", themes[0]!.index);
  const end = closing(css, open);
  const theme = css.slice(0, end);
  const inserts: [number, string][] = [];
  if (variables.length) {
    const last = [...theme.matchAll(/^ {2}--animate-[\w-]+\s*:/gm)].at(-1);
    if (!last || last.index < open)
      throw new Error(`${GLOBALS}: no --animate-* list in @theme inline`);
    const semicolon = css.indexOf(";", last.index);
    if (
      semicolon < 0 ||
      semicolon > end ||
      css.slice(semicolon + 1, lineEnd(css, semicolon)).trim()
    )
      throw new Error(
        `${GLOBALS}: the last --animate-* line must end with ";"`,
      );
    inserts.push([
      lineEnd(css, semicolon),
      variables
        .map(([name, value]) => `  --animate-${name}: ${value};\n`)
        .join(""),
    ]);
  }
  if (keyframes.length) {
    const last = [...theme.matchAll(/^ {2}@keyframes [\w-]+ \{[ \t]*$/gm)].at(
      -1,
    );
    if (!last || last.index < open)
      throw new Error(`${GLOBALS}: no @keyframes in @theme inline`);
    const close = closing(css, css.indexOf("{", last.index));
    if (css.slice(close, lineEnd(css, close)).trim())
      throw new Error(
        `${GLOBALS}: the last @keyframes must close on its own line`,
      );
    inserts.push([
      lineEnd(css, close),
      keyframes
        .map(([name, frames]) => `\n${keyframesBlock(name, frames)}`)
        .join(""),
    ]);
  }
  let result = css;
  for (const [index, text] of inserts.sort((a, b) => b[0] - a[0]))
    result = result.slice(0, index) + text + result.slice(index);
  return result;
}

/**
 * Scope rule for a candidate's own globals.css edit: it may only add the
 * `--animate-*` declarations and `@keyframes` blocks its registry entry
 * names (plus blank lines), wherever it puts them; nothing else may change.
 */
export function onlyAddsAnimations(
  before: string,
  after: string,
  animations: Animations,
): boolean {
  const variables = new Set(animations.variables.map(([name]) => name));
  const keyframes = new Set(animations.keyframes.map(([name]) => name));
  if (
    [...variables].some((name) => definesVariable(before, name)) ||
    [...keyframes].some((name) => definesKeyframes(before, name))
  )
    return false;
  const lines = after.split("\n");
  const kept: string[] = [];
  let added = 0;
  const braces = (line: string) =>
    (line.match(/\{/g)?.length ?? 0) - (line.match(/\}/g)?.length ?? 0);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const variable = /^\s*--animate-([\w-]+)\s*:/.exec(line)?.[1];
    const keyframe = /^\s*@keyframes\s+([\w-]+)\s*\{\s*$/.exec(line)?.[1];
    if (variable !== undefined && variables.has(variable)) {
      while (i < lines.length && !lines[i]!.includes(";")) i++;
      if (!/;\s*$/.test(lines[i] ?? "")) return false;
      added++;
    } else if (keyframe !== undefined && keyframes.has(keyframe)) {
      let depth = braces(line);
      while (depth > 0 && ++i < lines.length) depth += braces(lines[i]!);
      if (depth !== 0 || !/^\s*\}\s*$/.test(lines[i] ?? "")) return false;
      added++;
    } else kept.push(line);
  }
  const original = before.split("\n");
  let position = 0;
  for (const line of kept)
    if (line === original[position]) position++;
    else if (line.trim()) return false;
  return added > 0 && position === original.length;
}
