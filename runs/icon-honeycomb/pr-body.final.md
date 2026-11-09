## Description

Adds **IconHoneycomb**, a draggable honeycomb of round icon tiles that shrink toward the rim and settle on the nearest tile when thrown. Made for integration pages and app pickers with more icons than fit at once.

```tsx
<IconHoneycomb aria-label="Integrations">
  {integrations.map(({ name, href, icon: Icon }) => (
    <a key={name} href={href} aria-label={name}><Icon className="size-2/5" /></a>
  ))}
</IconHoneycomb>
```

## Changes

- **Component**: `IconHoneycomb` with `iconSize`, `minScale`, `duration` and `delay` props. Each child becomes a round tile, spiralling out from the centre. Built on `motion`.
- **Behaviour**: Drag or throw the field and one spring settles it on the nearest tile. Tiles move through motion values outside React, and the ambient drift pauses off-screen and in a hidden tab.
- **Accessibility**: The field is one Tab stop. Arrow keys move between tiles, Home returns to the centre, and the focused tile springs to the middle. Respects reduced motion.
- **Demos**: An integrations section with 90 brand icons, a split feature row, and a compact app picker that toggles apps on and off.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Integration pages and app grids often show dozens of logos, more than fit in one view.
- `icon-cloud` spins icons on a 3D sphere, `dock` magnifies a single row, and `orbiting-circles` moves a few icons around a centre. None gives a large grid you can drag through.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/icon-honeycomb/desktop-light.png" width="420" alt="IconHoneycomb on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/icon-honeycomb/mobile-light.png" width="190" alt="IconHoneycomb on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/icon-honeycomb/desktop-dark.png" width="420" alt="IconHoneycomb on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/icon-honeycomb/mobile-dark.png" width="190" alt="IconHoneycomb on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/icon-honeycomb/demo.gif" width="560" alt="IconHoneycomb dragged, released and settling on the nearest tile">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
