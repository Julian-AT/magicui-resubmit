## Description

Adds **MoireField**, a background of fine concentric rings that bloom into a slowly turning rosette behind your content. Two ring sets drawn on canvas form the fans where they overlap.

```tsx
<div className="relative h-[500px] overflow-hidden rounded-lg border">
  <MoireField />
  <div className="relative z-10 p-8">
    <h2>Every release, in focus</h2>
  </div>
</div>
```

## Changes

- **Component**: `MoireField` with `color`, `duration`, `delay`, `size`, `bands` and `interactive` props. A mouse or pen steers the fans. No dependencies.
- **Performance**: Both ring sets are drawn once and redrawn only when the size, color or props change. Each frame moves one canvas with a transform. Pauses off-screen and in a hidden tab. Resolution is capped at 2x DPR.
- **Accessibility**: Respects reduced motion with a still rosette, also when the preference changes while mounted. The layer is `aria-hidden` and ignores pointer events.
- **Demos**: A product hero, a call to action in a brand color, and a row of stat cards with a small rosette in one card.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Hero and section backgrounds often need quiet motion that stays behind the copy.
- `dot-pattern` lays out a grid of dots, `ripple` pulses a few large circles, and `dither-field` renders dithered dots. None builds a pattern from two overlapping sets of fine lines.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/moire-field/desktop-light.png" width="420" alt="MoireField on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/moire-field/mobile-light.png" width="190" alt="MoireField on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/moire-field/desktop-dark.png" width="420" alt="MoireField on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/moire-field/mobile-dark.png" width="190" alt="MoireField on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/moire-field/demo.gif" width="560" alt="MoireField blooming from aligned rings into a turning rosette">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
