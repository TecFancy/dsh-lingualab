# Agent Note: over the stage, and collapsed by default, when the practice column is narrow

Status: proposed

## Problem

On an iPad the practice column is 440 to 630px wide, because the host's sidebar takes 56px or 280px and the
transcript takes another 260 to 440px. The first answer, planned on 2026-10-21, is a side column the user can
collapse: three states (collapsed, transcript, kept), a toggle in the top bar, and the choice kept per device.

That answer still leaves two cases. In a narrow column (an iPad in portrait, or in landscape with the host's sidebar
open) opening the transcript to look something up takes its width away from the stage, so the picture, the sentence
and the player card jump to the narrow layout and back each time. And a user opening the plugin on an iPad for the
first time meets the narrow layout before finding the toggle. Both ideas were raised in the same discussion and kept
for later, so that the collapse ships first and is used for a while before the next step is chosen.

## Proposal

- **Over the stage where the column is narrow.** When the row the column shares with the stage is narrow, the
  expanded transcript or kept column opens from the right as a drawer over the stage, with a scrim, the way the five
  steps drawer does, instead of taking width from it. The stage keeps its wide layout under the drawer. A press on
  the scrim, `Esc` or the toggle closes it. Where the row is wide, the column stays beside the stage as it does now.
  The threshold is the row's width (`ll-body`), not the window's, for the reason the layout note gives.
- **Collapsed by default where the column is narrow.** A device with no stored choice starts collapsed when the row
  is narrow, and expanded otherwise. Once the user has pressed the toggle, the stored choice wins and the width is
  no longer consulted.

## Alternatives considered

- **Only the collapse, with no drawer.** This is what ships first. It may turn out to be enough: a user who
  collapses the column on an iPad may rarely open it. The drawer is worth building only if opening and closing it
  in a narrow column turns out to be common.
- **A rail of about 40px when collapsed.** It keeps the column one press away, but costs width exactly where width
  is short, and the top bar's toggle already does that.
- **Follow the width alone, with no stored choice.** Simpler, but a user who wants the transcript on an iPad
  could not keep it, and a rule that changes the layout when the host's sidebar opens would surprise.
- **A bottom sheet in portrait.** It suits a phone, but on an iPad in portrait the stage already stacks its parts
  vertically, and a sheet would cover the player card, which the layout note puts on screen before anything else.

Design reference, with the overlay drawer in portrait (proportions only, the host's tokens win):
<https://claude.ai/artifact/8xXbV93vDTvCdWoVhicX1s>.

Related: [the layout answers to the practice column](../../implemented/architecture/2026-10-14-layout-answers-to-the-practice-column.md).
