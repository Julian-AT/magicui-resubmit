## Description

Adds **DepartureBoard**, a split-flap board that flips each character into place, like an airport departure sign. Made for stats, launch dates and counters on landing pages.

```tsx
<DepartureBoard className="text-5xl">18,640</DepartureBoard>

<h2 className="text-4xl font-semibold">
  Now boarding at <DepartureBoard>GATE B12</DepartureBoard>
</h2>
```

## Changes

- **Component**: `DepartureBoard` takes its text as `children`, with `characterSets`, `duration`, `delay` and `startOnView` props. Takes the font size of the text around it. Uses the Web Animations API, with no dependencies.
- **Behaviour**: Flips in when a third of the board scrolls into view. Each flap flips forward through its set, so digits count up instead of scrambling. When the text changes, only the characters that differ flip, and punctuation stays still.
- **Accessibility**: Respects reduced motion: the text shows at once, and turning it on mid-flip stops the flip. Screen readers read the text once, not each flap.
- **Demos**: A stats row, a launch banner, and a waitlist counter where only the changed digits flip.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Landing pages show stats, launch dates and waitlist counters, and want them to land with some motion.
- `number-ticker` counts numbers, `hyper-text` scrambles letters, and `text-3d-flip` flips letters on hover. None draws split-flap tiles that flip each character forward into place.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/departure-board/desktop-light.png" width="420" alt="DepartureBoard on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/departure-board/mobile-light.png" width="190" alt="DepartureBoard on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/departure-board/desktop-dark.png" width="420" alt="DepartureBoard on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/departure-board/mobile-dark.png" width="190" alt="DepartureBoard on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/departure-board/demo.gif" width="560" alt="DepartureBoard flipping from blank flaps to the final numbers">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
