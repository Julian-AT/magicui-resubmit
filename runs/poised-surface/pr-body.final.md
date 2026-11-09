## Description

Adds **PoisedSurface**, a container that leans a product screenshot or device mock back in perspective and swings it slightly toward the pointer. Made for landing page heroes that show off an app or a device.

```tsx
<PoisedSurface className="mb-10 max-w-3xl rounded-2xl">
  <img src="/dashboard.png" alt="Your app" className="rounded-[inherit] border" />
</PoisedSurface>
```

## Changes

- **Component**: `PoisedSurface` with `pose`, `tilt`, `duration` and `shadowOpacity` props. No new dependencies. Wraps `Safari` and `Iphone` so the frame and its screen tilt as one.
- **Performance**: CSS transitions do the motion, and pointer moves update once per frame. The surface leans in once, when it scrolls into view. `will-change` is set only while it swings and dropped at rest, so text stays crisp.
- **Accessibility**: Respects reduced motion by keeping the surface flat. Touch never tilts it, so scrolling and taps stay steady. Children stay interactive, and the shadow layers are hidden from screen readers.
- **Demos**: A broadcast app hero in `Safari`, a writing app in an `Iphone` turned toward its copy with `pose="end"`, and a pricing card with a working billing toggle.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Landing pages often present product screenshots and device mocks in the hero, leaning back in perspective.
- `safari`, `iphone` and `android` draw the device but stay flat, and `magic-card` follows the pointer with a spotlight, not a tilt. None of them gives a surface depth.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/poised-surface/desktop-light.png" width="420" alt="PoisedSurface on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/poised-surface/mobile-light.png" width="190" alt="PoisedSurface on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/poised-surface/desktop-dark.png" width="420" alt="PoisedSurface on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/poised-surface/mobile-dark.png" width="190" alt="PoisedSurface on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/poised-surface/demo.gif" width="560" alt="PoisedSurface leaning in and swinging toward the pointer">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
