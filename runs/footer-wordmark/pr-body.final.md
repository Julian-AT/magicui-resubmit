## Description

Adds **FooterWordmark**, a brand name that spans its container edge to edge and rises into view letter by letter. Made for site footers that close on the name set large.

```tsx
<FooterWordmark>Meridian</FooterWordmark>
```

## Changes

- **Component**: `FooterWordmark` with `duration`, `delay`, `crop` and `startOnView` props. No dependencies.
- **Fit**: Measures the ink of the first and last letters, so the word fills the width in any font set through `className`. Sizes with container query units and measures again when a web font loads.
- **Accessibility**: Respects reduced motion, where the word shows without the rise. Screen readers get the name once as text.
- **Demos**: A product footer with link columns, a cropped wordmark in a card, and a serif wordmark under a call to action.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Landing pages often end the footer on the brand name, set edge to edge. Fitting it by hand means tuning a font size for every font and name.
- `text-animate` animates text in by letter or word, and `scroll-based-velocity` scrolls large text. Neither fits a word to the width of its container.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/footer-wordmark/desktop-light.png" width="420" alt="FooterWordmark on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/footer-wordmark/mobile-light.png" width="190" alt="FooterWordmark on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/footer-wordmark/desktop-dark.png" width="420" alt="FooterWordmark on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/footer-wordmark/mobile-dark.png" width="190" alt="FooterWordmark on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/footer-wordmark/demo.gif" width="560" alt="FooterWordmark rising into place letter by letter">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
