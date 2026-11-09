## Description

Adds **LiquidSegment**, a segmented control whose selection stretches like liquid between options and inverts the labels it covers. Made for short lists of choices, like a billing period or a package manager.

```tsx
<LiquidSegment
  aria-label="Billing period"
  options={[{ value: "monthly", label: "Monthly" }, { value: "annual", label: "Annual" }]}
/>
```

## Changes

- **Component**: `LiquidSegment` with `options`, `value`, `defaultValue`, `onValueChange`, `duration` and `color` props. Built on `motion`.
- **Performance**: Two springs move the edges of the liquid and redraw one `clip-path`, so a switch never re-renders React. At rest the pill is a percentage inset, so it matches server output and follows resizes without measuring.
- **Accessibility**: A `radiogroup` of `radio` buttons with one tab stop. Arrow keys, Home and End move focus and selection together, wrap around and skip disabled options. With reduced motion the pill slides without stretching.
- **Demos**: A pricing card that switches the billing period, a package manager picker for an install command, and a digest signup with a custom color and a disabled option.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Pricing pages, settings and install guides need a compact way to pick one of a few options, with motion that shows the change.
- `animated-theme-toggler` only switches the theme and `animated-subscribe-button` flips one button between two states. Neither offers a set of options to choose from.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/liquid-segment/desktop-light.png" width="420" alt="LiquidSegment on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/liquid-segment/mobile-light.png" width="190" alt="LiquidSegment on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/liquid-segment/desktop-dark.png" width="420" alt="LiquidSegment on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/liquid-segment/mobile-dark.png" width="190" alt="LiquidSegment on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/liquid-segment/demo.gif" width="560" alt="LiquidSegment stretching between Monthly and Annual">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
