## Description

Adds **InkReveal**, a wrapper that hides its content under a paper cover and reveals it with a spreading ink stain when it scrolls into view. Made for product shots and feature cards on landing pages.

```tsx
<InkReveal className="rounded-xl border">
  <img src="/dashboard.png" alt="The revenue dashboard" />
</InkReveal>
```

## Changes

- **Component**: `InkReveal` with `duration`, `delay`, `color` and `background` props, plus every `div` prop. Drawn on a 2D canvas with no dependencies.
- **Performance**: Repaints only the tiles the stain's edge touches. Builds the stain in small slices from about a viewport away, so it is ready on arrival. A hidden tab resumes where it left off, and the canvas is removed once the reveal ends.
- **Accessibility**: Respects reduced motion, even when it is turned on mid-reveal. The children always stay in the DOM and the cover is `aria-hidden`, so screen readers, print and pages without JavaScript get the content.
- **Demos**: A dashboard under a product hero, three feature cards staggered with `delay`, and an integrations panel with purple ink on a tinted surface.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Landing pages often bring in a product shot or feature card as it scrolls into view, and some brands want that moment to feel hand-made.
- `blur-fade` fades and unblurs the whole block evenly, and `pixel-image` resolves a single image through a square grid. Neither has an organic edge that travels across any content.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/ink-reveal/desktop-light.png" width="420" alt="InkReveal on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/ink-reveal/mobile-light.png" width="190" alt="InkReveal on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/ink-reveal/desktop-dark.png" width="420" alt="InkReveal on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/ink-reveal/mobile-dark.png" width="190" alt="InkReveal on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/ink-reveal/demo.gif" width="560" alt="InkReveal spreading an ink stain across a dashboard until it is fully revealed">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
