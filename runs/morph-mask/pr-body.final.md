## Description

Adds **MorphMask**, a mask that springs between rounded shapes while the content inside stays still. Made for heroes and cards that frame a product screen or an image in a shape that changes.

```tsx
<MorphMask className="w-64">
  <img src="/release.png" alt="Spring release" />
</MorphMask>
```

## Changes

- **Component**: `MorphMask` with `shapes`, `index`, `duration` and `repeatDelay` props. Ships six named shapes and accepts an `(angle) => radius` function. Built on `motion`.
- **Performance**: The spring writes the clip straight to the element, outside React. The loop only runs while the mask is in view and the tab is visible.
- **Accessibility**: Respects reduced motion. The mask holds still, and a new `index` jumps straight to its shape. A focused child gets a ring around the whole mask, since the clip would cut off its own.
- **Demos**: A changelog hero, feature cards whose icons change shape on hover, and a setup stepper with a custom shape.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Heroes and cards often show a product screen, image or video inside a rounded shape. A shape that changes adds motion without moving what is inside.
- `morphing-text` blends one word into the next and `video-text` fills text with a video. Neither clips content to a shape that morphs.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/morph-mask/desktop-light.png" width="420" alt="MorphMask on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/morph-mask/mobile-light.png" width="190" alt="MorphMask on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/morph-mask/desktop-dark.png" width="420" alt="MorphMask on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/morph-mask/mobile-dark.png" width="190" alt="MorphMask on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/morph-mask/demo.gif" width="560" alt="MorphMask springing from a squircle to a hexagon to a circle and back">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
