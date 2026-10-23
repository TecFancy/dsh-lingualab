# Agent Note: over the stage, and collapsed by default, when the practice column is narrow

Status: implemented

## Problem

On an iPad the practice column is 440 to 630px wide, because the host's sidebar takes 56px or 280px and the
transcript takes another 260 to 440px. The first answer, shipped in 0.15.0, is a side column the user can
collapse: three states (collapsed, transcript, kept), a toggle in the top bar, and the choice kept per device.

That answer still left two cases. In a narrow column (an iPad in portrait, or in landscape with the host's sidebar
open) opening the transcript to look something up took its width away from the stage, so the picture, the sentence
and the player card jumped to the narrow layout and back each time. And a user opening the plugin on an iPad for the
first time met the narrow layout before finding the toggle. Both ideas were raised in the same discussion and kept
for later, so that the collapse shipped first.

## Decision

- **A narrow row is one under 982px.** The question is the width of the row the stage shares with the column
  (`.dsh-lingualab-body`), not the window's, for the reason the layout note gives. The column is 260px in a row of
  820px or less and `clamp(300px,34%,440px)` above that, so any row under 982px would leave the stage under 648px
  beside it, a 600px content box, which is where the narrow-column rules start. The rule is `sideFloats` in
  `pages/lingualab/lib/side-column.ts`, and `useSideFloating` measures the row with a `ResizeObserver`.
- **On a narrow row an expanded column is a drawer.** The body carries `is-side-floating`, the column is placed from
  the right over the stage, 360px wide (less where the row cannot leave 48px of stage), with a scrim between it and
  the stage. The top bar is outside the body, so its toggle and kept chip stay in reach. The stage lays out as it
  does when the column is collapsed, so opening the drawer changes nothing under it. A press on the scrim, `Esc` or
  the toggle puts the column away; `Esc` closes the five-steps drawer first when both are open. The drawer and its
  scrim sit over the finish card (z-index 15) and under the five-steps drawer (21 and 22), and do not move under
  `prefers-reduced-motion`.
- **A device with no choice follows the width.** `sideCollapsed` is `true`, `false` or `null`, and only a stored
  boolean is a choice. With `null` the page shows the column collapsed on a narrow row and expanded on a wide one, and
  follows the width when the iPad turns or the host's sidebar opens.
- **Only the toggle stores a choice.** The top bar's toggle and `\` always store what they set. While there is no
  choice, the other moves (`N`, the kept chip, a protected sentence that opens the kept view, `Esc`, the scrim) change
  the column for this visit only. A look at the kept sentences on an iPad should not make every later visit open
  the drawer. Once there is a choice, every move stores, as before.

## Measured

- The drawer, built from the real stylesheet in a browser: 360px wide at rows of 764 and 540, 252px at 300 (48px of
  stage left), its top at the body's top, under the top bar. The stage keeps the whole row, and the 260px width of the
  narrow-row rule does not reach the drawer.
- The default, with the real hook and React in a browser, rendered with `flushSync`: on a 764px row with no choice the
  column is collapsed by the end of the first task. The two expanded renders before the measurement never reach a
  paint. `N` then opens the drawer and stores nothing; the toggle stores `false`. A 1200px row with no choice stays
  expanded beside the stage.

## Alternatives considered

- **Only the collapse, with no drawer.** This shipped first, in 0.15.0. Once the collapse existed, opening the column
  on an iPad still pushed the stage into its narrow layout, which is the jump the collapse was for.
- **A rail of about 40px when collapsed.** It keeps the column one press away, but costs width exactly where width
  is short, and the top bar's toggle already does that.
- **Follow the width alone, with no stored choice.** Simpler, but a user who wants the transcript on an iPad
  could not keep it, and a rule that changes the layout when the host's sidebar opens would surprise.
- **Store every move, as the collapse did.** Simpler state, but on a device with no choice the first `N` would store
  "expanded", and the default would be gone after one look at the kept sentences.
- **Decide the drawer in the stylesheet alone, with a container query.** The layout could, but `Esc` and the scrim
  need to know whether the column floats, and two answers to one question (a query and a measurement) can disagree
  at the threshold.
- **A bottom sheet in portrait.** It suits a phone, but on an iPad in portrait the stage already stacks its parts
  vertically, and a sheet would cover the player card, which the layout note puts on screen before anything else.

Design reference, with the overlay drawer in portrait (proportions only, the host's tokens win):
<https://claude.ai/artifact/8xXbV93vDTvCdWoVhicX1s>.

## Consequences

- A browser that stored any setting under 0.15.0 also stored `sideCollapsed: false`, because every write saved the
  whole record. On such a device the column is a choice already, so a narrow row opens with the drawer rather than
  collapsed; one press of the toggle stores the collapse.
- The threshold restates the column's widths from the stylesheet. Changing the column's `clamp` or the 820px rule
  means changing `SIDE_FLOAT_BELOW` with it.
- Not yet checked on an iPad itself; the measurements above are a desktop browser at iPad widths.

Related: [the layout answers to the practice column](../architecture/2026-10-14-layout-answers-to-the-practice-column.md),
[the right column collapses](2026-10-21-collapse-the-side-column.md).
