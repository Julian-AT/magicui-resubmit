## Description

Adds **LiveIsland**, a small live pill that opens into one notification at a time, like a payment, a signup or a deploy, then closes again. Made for landing pages and dashboards that show live activity without moving the layout around it.

```tsx
<LiveIsland
  label="Orders"
  updates={[{ title: "New order", description: "Canvas tote, $58", time: "now" }]}
  onUpdateOpen={(index) => setActiveOrder(index)}
/>
```

## Changes

- **Component**: `LiveIsland` with `updates`, `label`, `duration`, `repeatDelay`, `color` and `onUpdateOpen` props. Built on `motion`.
- **Performance**: One timer drives the loop and stops while paused, off-screen, or in a hidden tab. The open size is reserved from the first render, so the layout never shifts.
- **Accessibility**: The island is a button that pauses and resumes the updates, with `aria-pressed` and a screen reader label. With reduced motion it skips the animation, and each press shows the next update.
- **Demos**: Live activity with the default updates, store orders with a custom color, and a compact inbox scaled with `text-sm`.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- SaaS and store pages want to show live activity, like payments, signups and deploys, in a small space that does not push content around.
- `animated-list` stacks notifications into a growing list and `word-rotate` swaps one line of text. Neither opens a compact pill into a full notification, one update at a time.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/live-island/desktop-light.png" width="420" alt="LiveIsland on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/live-island/mobile-light.png" width="190" alt="LiveIsland on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/live-island/desktop-dark.png" width="420" alt="LiveIsland on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/live-island/mobile-dark.png" width="190" alt="LiveIsland on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/live-island/demo.gif" width="560" alt="LiveIsland opening from the pill into an update and closing again">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
