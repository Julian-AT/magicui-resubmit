## Description

Adds **ExpandingFrame**, a rounded product window that grows into view and opens to full width as you scroll. Made for landing pages that reveal the product under the hero.

```tsx
<ExpandingFrame>
  <img src="/dashboard.png" alt="Product dashboard" />
</ExpandingFrame>
```

## Changes

- **Component**: `ExpandingFrame` with `travel`, `inset`, `borderRadius`, `scale`, `duration`, `delay` and `frameClassName` props. Built on `motion`.
- **Performance**: Pins while it opens, in the window or inside its own scroller. Measures at most once per frame, and keeps a compositor layer only while it moves, so text stays sharp at rest.
- **Accessibility**: Respects reduced motion by showing the frame fully open, with no pinning or zoom. Opens fully while a keyboard-focused element is inside, so focused content stays in view.
- **Demos**: A reconciliation workspace under a finance hero, a launch announcement with `scale={1}` and a deeper `inset`, and a feature section with a square, rounded frame and a shorter `travel`.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Product landing pages often show the app in a framed window that opens up as you scroll past the hero.
- `safari` frames a static screenshot, `hero-video-dialog` plays a video in an overlay, and `scroll-progress` shows how far the page has scrolled. None ties a product reveal to scroll.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/expanding-frame/desktop-light.png" width="420" alt="ExpandingFrame on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/expanding-frame/mobile-light.png" width="190" alt="ExpandingFrame on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/expanding-frame/desktop-dark.png" width="420" alt="ExpandingFrame on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/expanding-frame/mobile-dark.png" width="190" alt="ExpandingFrame on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/expanding-frame/demo.gif" width="560" alt="ExpandingFrame opening from a rounded window to full width as the demo scrolls">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
