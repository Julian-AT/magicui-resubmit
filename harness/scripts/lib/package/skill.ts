// Where each component is listed in the magic-ui skill, as dither-field
// (#1038) did: a line in its family in references/components.md and, where
// one fits, a mention on a SKILL.md heuristic line.

export const SKILL = "skills/magic-ui/SKILL.md";
export const REFERENCE = "skills/magic-ui/references/components.md";

export interface Listing {
  /** `### <family>` heading in references/components.md. */
  family: string;
  /** SKILL.md line that starts with `- <heuristic>: `, if one fits. */
  heuristic?: string;
}

export const SKILLS: Record<string, Listing> = {
  "icon-honeycomb": {
    family: "Layout And Social Proof",
    heuristic: "Social proof/logo rails",
  },
  "peek-list": { family: "Layout And Social Proof" },
  "scroll-trace": { family: "Layout And Social Proof" },
  "agent-trace": { family: "Layout And Social Proof" },
  "live-island": { family: "Layout And Social Proof" },
  "keycap-sequence": { family: "Layout And Social Proof" },
  "expanding-frame": {
    family: "Hero And Visual Anchors",
    heuristic: "Hero visual impact",
  },
  "poised-surface": {
    family: "Hero And Visual Anchors",
    heuristic: "Hero visual impact",
  },
  "morph-mask": { family: "Hero And Visual Anchors" },
  "departure-board": { family: "Text Motion", heuristic: "Text animation" },
  "footer-wordmark": { family: "Text Motion", heuristic: "Text animation" },
  "ink-reveal": { family: "Text Motion", heuristic: "Text animation" },
  "cursor-lean": {
    family: "Buttons And CTA Emphasis",
    heuristic: "CTA emphasis",
  },
  "liquid-segment": { family: "Buttons And CTA Emphasis" },
  "contour-field": {
    family: "Ambient Effects",
    heuristic: "Ambient backgrounds",
  },
  "moire-field": {
    family: "Ambient Effects",
    heuristic: "Ambient backgrounds",
  },
  "plucked-rule": { family: "Ambient Effects" },
};

/**
 * The two skill files with the slug listed. Each is null when it already
 * lists the slug (or, for SKILL.md, when no heuristic line fits).
 */
export function listInSkill(
  slug: string,
  reference: string,
  skill: string,
): { reference: string | null; skill: string | null } {
  const listing = SKILLS[slug];
  if (!listing) throw new Error(`${slug} has no family in the magic-ui skill`);
  const { family, heuristic } = listing;
  const result: { reference: string | null; skill: string | null } = {
    reference: null,
    skill: null,
  };

  const item = `- \`${slug}\``;
  const lines = reference.split("\n");
  if (!lines.includes(item)) {
    const heading = lines.indexOf(`### ${family}`);
    if (heading < 0) throw new Error(`${REFERENCE}: no "### ${family}"`);
    let last = heading + 1;
    while (last < lines.length && !lines[last]!.startsWith("- ")) last++;
    while (last + 1 < lines.length && lines[last + 1]!.startsWith("- ")) last++;
    lines.splice(last + 1, 0, item);
    result.reference = lines.join("\n");
  }

  if (heuristic) {
    const skillLines = skill.split("\n");
    const index = skillLines.findIndex((line) =>
      line.startsWith(`- ${heuristic}: `),
    );
    if (index < 0) throw new Error(`${SKILL}: no "- ${heuristic}:" line`);
    if (!skillLines[index]!.includes(`\`${slug}\``)) {
      skillLines[index] = `${skillLines[index]}, \`${slug}\``;
      result.skill = skillLines.join("\n");
    }
  }
  return result;
}
