## Description

Adds **AgentTrace**, an animated checklist that works through a list of steps, times each one, and lands on a result. Made for landing pages that show a product doing a job, like a coding tool opening a pull request.

```tsx
<AgentTrace
  steps={[{ label: "Validate the import" }, { label: "Save the changes" }]}
  result="Imported 248 customers"
/>
```

## Changes

- **Component**: `AgentTrace` with `steps`, `result`, `repeatDelay`, `color` and `loop` props. Built on `motion`.
- **Performance**: One clock drives the run and updates the timers outside React. Pauses off-screen, in a hidden tab, or from its pause button.
- **Accessibility**: Respects reduced motion. Screen readers get the steps as a list and the result as text.
- **Demos**: A product hero, a deploy section with a custom color, and a support ticket that plays once.
- **Docs and registry**: Docs page, sidebar entry, registry entries, keyframes in `globals.css`, and a listing in the magic-ui skill.

## Motivation

- Automation products need to show work happening step by step, ending in a result.
- `animated-list` stacks notifications and `terminal` types commands. Neither shows an ordered plan with timing and an outcome.

## Breaking Changes

None.

## Screenshots

> Device / Browser / Viewport: macOS / Chromium 156 / 1280x800 and 390x844

| | Desktop | Mobile |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/agent-trace/desktop-light.png" width="420" alt="AgentTrace on desktop, light"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/agent-trace/mobile-light.png" width="190" alt="AgentTrace on mobile, light"> |
| Dark | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/agent-trace/desktop-dark.png" width="420" alt="AgentTrace on desktop, dark"> | <img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/agent-trace/mobile-dark.png" width="190" alt="AgentTrace on mobile, dark"> |

<img src="https://raw.githubusercontent.com/Julian-AT/magicui/ee474bd9f2d4273a7694e299a0ad943b54b1cec4/agent-trace/demo.gif" width="560" alt="AgentTrace running from the first step to the result">

## Checklist

- [x] `pnpm check` passes locally
- [x] `pnpm build` passes locally
- [x] `pnpm build:registry` was run and the generated files are committed
