## Description

Adds **PluckedRule**, a section divider that bends under the cursor, then slips free and rings out like a plucked string. It plucks itself once when it first comes into view, and a tap near the line plucks it on touch screens.

```tsx
import { PluckedRule } from "@/components/ui/plucked-rule"

<PluckedRule className="my-10" />
```

## Changes

- **Component**: `PluckedRule` with `colorFrom`, `colorTo`, `size`, `amplitude`, `duration`, `frequency` and `delay` props. An `<hr>` plus an SVG path, with no new dependencies.
- **Performance**: Animates only while the line moves. Listens for the pointer only while the rule is near the viewport and the tab is visible, with passive listeners.
- **Accessibility**: Respects reduced motion and stays a still hairline. The rule is a native `<hr>` separator, and `aria-hidden` hides it when it is purely decorative.
- **Demos**: A feature section, a plan comparison whose rows pluck one after another, and a card with a heavier, brand-colored rule.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Landing pages split sections with plain rules. This one stays a hairline until the cursor passes through it, which adds a quiet interaction without extra visual weight.
- `border-beam` and `shine-border` animate the edge of a box, and `animated-beam` draws a beam between elements. None of them is a divider between sections, or reacts to the pointer crossing it.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/plucked-rule/desktop-light.png" width="420" alt="PluckedRule on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/plucked-rule/mobile-light.png" width="190" alt="PluckedRule on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/plucked-rule/desktop-dark.png" width="420" alt="PluckedRule on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/plucked-rule/mobile-dark.png" width="190" alt="PluckedRule on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/plucked-rule/demo.gif" width="560" alt="PluckedRule ringing out after the cursor plucks it">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
