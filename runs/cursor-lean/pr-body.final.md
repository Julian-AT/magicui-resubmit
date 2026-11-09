## Description

Adds **CursorLean**, a wrapper that draws a button or link toward a nearby cursor, with an optional label that travels further for depth. Made for the main call to action in a hero or pricing section.

```tsx
<CursorLean>
  <button type="button">
    <CursorLeanLabel>Create your portfolio</CursorLeanLabel>
  </button>
</CursorLean>
```

## Changes

- **Component**: `CursorLean` with `distance`, `offset`, `depth`, `duration`, `bounce` and `isStatic` props, plus `CursorLeanLabel` for the text layer. Built on `motion`.
- **Performance**: Springs drive motion values, so pointer moves never re-render React or read layout. Bounds refresh on resize and scroll, and tracking stops off-screen or in a hidden tab.
- **Accessibility**: Stays still for keyboard focus, reduced motion, touch input, and disabled or inert controls. Both wrappers are plain spans, so the control keeps its own role, focus and clicks.
- **Demos**: A portfolio hero, two calls to action side by side, and a recommended pricing plan with a wider, stronger pull.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Hero and pricing sections need a primary button that responds as the cursor gets close, before it is hovered.
- `interactive-hover-button` and `dock` react once the pointer is over them, and `smooth-cursor` restyles the cursor itself. None draws a control toward a cursor that is only nearby.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/cursor-lean/desktop-light.png" width="420" alt="CursorLean on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/cursor-lean/mobile-light.png" width="190" alt="CursorLean on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/cursor-lean/desktop-dark.png" width="420" alt="CursorLean on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/cursor-lean/mobile-dark.png" width="190" alt="CursorLean on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/cursor-lean/demo.gif" width="560" alt="CursorLean drawing a button toward a cursor that circles it and leaves">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
