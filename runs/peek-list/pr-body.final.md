## Description

Adds **PeekList**, a large typographic list with one floating card that opens beside the pointer and glides between rows, showing a preview of each item. Made for landing pages that list customers, integrations or articles by name.

```tsx
<PeekList
  items={[
    { id: "northwind", title: "Northwind Freight", meta: "Logistics", preview: <Story /> },
    { id: "halcyon", title: "Halcyon Health", meta: "Care", preview: <Story /> },
  ]}
/>
```

## Changes

- **Component**: `PeekList` and the `PeekListItem` type, with `items`, `size`, `duration` and `intro` props. Built on `motion`.
- **Behaviour**: From a `36rem` container with a mouse or trackpad, the card follows the pointer on a spring and swaps previews with a clip transition. In narrower containers and on touch, it is a static panel above the list.
- **Accessibility**: Rows are links or buttons, and keyboard focus opens the card beside the row. Previews are hidden from screen readers, and reduced motion keeps the card still beside the active row.
- **Demos**: Customer stories with a metric and a quote, an integrations list with product previews, and a blog index in a narrow container.
- **Docs and registry**: Docs page, sidebar entry, registry entries, and a listing in the magic-ui skill.

## Motivation

- Landing pages often list customers, case studies or integrations by name, and visitors want a quick look at each one without leaving the list.
- `bento-grid` shows every card at once and `pointer` swaps the cursor for a custom one. Neither pairs a list of links with a preview that follows the pointer.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/peek-list/desktop-light.png" width="420" alt="PeekList on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/peek-list/mobile-light.png" width="190" alt="PeekList on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/peek-list/desktop-dark.png" width="420" alt="PeekList on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/peek-list/mobile-dark.png" width="190" alt="PeekList on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/peek-list/demo.gif" width="560" alt="PeekList card opening beside a row and gliding to the next">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
