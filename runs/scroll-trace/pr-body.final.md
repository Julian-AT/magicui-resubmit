## Description

Adds **ScrollTrace**, a gradient line that follows the scroll down a list of steps and lights each step it reaches. Made for how-it-works sections, changelogs and roadmaps.

```tsx
<ScrollTrace className="space-y-16">
  <article>Connect a repository</article>
  <article>Ship a release</article>
</ScrollTrace>
```

## Changes

- **Component**: `ScrollTrace` with `colorFrom`, `colorTo`, `curvature` and `duration` props. Each direct child is a step and gets `data-reached` once the line passes it. Built on `motion`.
- **Performance**: A spring moves the line and its tip outside React, and lighting a step re-renders only its marker. Follows the page or the nearest scrolling container, and re-measures when the steps resize.
- **Accessibility**: Respects reduced motion by showing the finished trace at once. The line is hidden from screen readers, so the steps read as plain content.
- **Demos**: A how-it-works section, a changelog with a straight line and custom colors, and a roadmap with a stronger curve.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Timelines, changelogs and how-it-works sections need to show how far the reader has come through a list of steps.
- `scroll-progress` fills one bar for the whole page and `animated-beam` loops a beam between two elements. Neither marks each step as the reader scrolls past it.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/scroll-trace/desktop-light.png" width="420" alt="ScrollTrace on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/scroll-trace/mobile-light.png" width="190" alt="ScrollTrace on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/scroll-trace/desktop-dark.png" width="420" alt="ScrollTrace on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/scroll-trace/mobile-dark.png" width="190" alt="ScrollTrace on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/scroll-trace/demo.gif" width="560" alt="ScrollTrace lighting each step as the section scrolls from top to bottom">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
