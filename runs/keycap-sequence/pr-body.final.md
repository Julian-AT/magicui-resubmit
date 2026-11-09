## Description

Adds **KeycapSequence**, keycaps that press through a keyboard shortcut and spring back in reverse order. Made for feature sections and command bars that show a shortcut.

```tsx
<KeycapSequence keys={["Ctrl", "Shift", "P"]} />
```

## Changes

- **Component**: `KeycapSequence` with `keys`, `size`, `duration`, `delay` and `repeatDelay` props. Built on `motion`.
- **Behaviour**: Keys go down in order, hold, then let go in reverse. Hovering replays them. The loop only runs while at least half of it is on screen and the tab is visible.
- **Accessibility**: Respects reduced motion by keeping the keys at rest. Screen readers hear the key names, such as "Command K", or a custom `aria-label`.
- **Demos**: A notes app hero with a search bar, a feature card with a deploy shortcut, and a shortcut list that presses its rows in turn.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Landing pages often point to a keyboard shortcut next to a feature or in a command bar, and showing the keys pressed in order makes the chord clear.
- `typing-animation` types text and `terminal` types commands. Neither shows keys being pressed as a shortcut.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/keycap-sequence/desktop-light.png" width="420" alt="KeycapSequence on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/keycap-sequence/mobile-light.png" width="190" alt="KeycapSequence on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/keycap-sequence/desktop-dark.png" width="420" alt="KeycapSequence on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/keycap-sequence/mobile-dark.png" width="190" alt="KeycapSequence on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/keycap-sequence/demo.gif" width="560" alt="KeycapSequence pressing Command K and letting go in reverse">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
