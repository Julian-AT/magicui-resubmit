## Description

Adds **ContourField**, an animated topographic background. Contour lines rise into view, drift slowly and lift under a mouse or pen.

```tsx
<div className="relative h-96 rounded-lg border">
  <ContourField />
  <div className="relative z-10">Your content</div>
</div>
```

## Changes

- **Component**: `ContourField` with `color`, `duration`, `levels` and `interactive` props. No dependencies beyond React.
- **Performance**: Draws on one canvas with the pixel ratio capped at 2, and caps the sampling work on large boxes. Pauses off-screen and in a hidden tab.
- **Accessibility**: Respects reduced motion with one still frame and no pointer lift. The field is hidden from screen readers and never takes pointer events.
- **Demos**: A product hero, a call to action in a brand color, and a feature card that stays still under the pointer.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Hero and section backgrounds often need a calm texture that frames the copy without competing with it.
- `dot-pattern`, `grid-pattern` and `flickering-grid` repeat a fixed grid, and `dither-field` is a pixel dither. None draws organic, flowing lines.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/contour-field/desktop-light.png" width="420" alt="ContourField on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/contour-field/mobile-light.png" width="190" alt="ContourField on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/contour-field/desktop-dark.png" width="420" alt="ContourField on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/contour-field/mobile-dark.png" width="190" alt="ContourField on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/contour-field/demo.gif" width="560" alt="ContourField rising into view and lifting under the pointer">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
