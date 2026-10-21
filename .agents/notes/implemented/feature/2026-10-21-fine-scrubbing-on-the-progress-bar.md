# Agent Note: fine scrubbing on the progress bar

Status: implemented

## Problem

The progress bar in the player card maps the whole episode onto a few hundred pixels. On an iPad in landscape the bar
is about 546px wide, so on a recording of an hour and a half one pixel is close to ten seconds, and landing on a given
sentence takes several tries. A press shows nothing until it is released, so each try is a seek and a listen.

The question raised on 2026-10-21 was how a user finds a sentence far from the one on stage once the side column can be
collapsed. Two answers were proposed together: a hold-and-drag gesture on the stage, which is still a proposal, and
finer scrubbing on the progress bar, recorded here. The bar was the cheaper of the two: it changes one existing control
and collides with no gesture.

## Decision

**While the thumb is held, moving the finger away from the bar, up or down, lowers the scrub speed in steps, as the iOS
music player does, and a label above the thumb says where the thumb is.**

- **Three speeds, 44px apart.** Full on the bar and within 44px of it, half from 44px, a quarter from 88px. The distance
  counts either way from the bar: in landscape the bar sits only about 120 to 140px above the bottom of the visible
  area (139px in the layout measured below, less under the host's own chrome), so below the bar there is room for three
  steps of this size and no more.
- **Changing step never moves the thumb.** Horizontal movement is applied at the current speed relative to where the
  step was entered; the move that crosses into a new step is applied at the old speed, then the new step is anchored
  where the thumb is. At full speed, before any change of step, the thumb is under the finger exactly as before, so a
  plain drag and a click behave as they always did. Coming back to full speed does not snap the thumb back under the
  finger either. A slow step keeps moving the thumb once the finger is past either end of the bar, until the thumb
  reaches the end.
- **The label.** While the thumb is held, a label above it shows the speed (「全速」, 「半速」, 「四分之一」), the
  time, the sentence number (「第 646 句」) and up to two lines of that sentence. It is at most 240px wide and is slid
  inward so it stays inside the player card, over the clocks if need be; on a card narrower than that it narrows to the
  card. It follows the thumb, not the finger. A mouse hover still shows the shorter label it showed before (the time
  and the sentence), now placed by the same rule.
- **Release seeks once**, to where the thumb is, as the bar always did. The keyboard is untouched: the bar is still not
  a tab stop, and the arrow keys still move by sentence.
- **Where it lives.** The speed and position arithmetic and the label's placement are pure functions in
  `widgets/control-bar/lib/fine-scrub.ts`, with tests; what the label says about a place is `scrub-point.ts`; the
  pointer handling is the `useScrubGesture` hook, which keeps the drag in a ref as well as in state so moves that
  arrive between two renders build on each other. The bar's existing `touch-action:none` and pointer capture are what
  let a finger leave the bar without scrolling the page or pressing the buttons under it. The bar's rules moved from
  `shared/lib/styles.ts` to `styles-scrub.ts` beside it, interpolated at the same place in the sheet, because the size
  gate had no room left in `styles.ts`; six locale keys nothing read were removed for the same reason.

Measured in Chromium with touch emulation, with the real control bar and stylesheet in a practice-column layout, at
1180 by 820, 820 by 1180 and 1180 by 746: 40px of finger moved the thumb 40px at full speed, 20px at half and 10px at a
quarter; entering a step moved the thumb by less than a pixel; the label was 240 by 72px and stayed inside the card at
both ends of the bar; release sought to the time the label showed.

## Alternatives considered

- **A drag that is always relative**, so the thumb never jumps to the press. It would make the first touch on a short
  episode feel dead, and it changes what a click does; keeping full speed absolute leaves both as they were.
- **More steps (an eighth from 132px).** The design sketch had room for it only above the bar. A step that exists in one
  direction only is hard to learn, so the speeds stop at a quarter.
- **Speed from how fast the finger moves**, as some video players do. It cannot be seen before it acts, and the label
  could only report it afterwards; distance from the bar is visible and repeatable.
- **Snapping the release to the start of the sentence.** Not done here: the bar has always landed on the point and let
  the player find the sentence that contains it, and the label already names that sentence.

## To verify on a real iPad

Safari's own behaviour under a finger that leaves the bar (the edge swipe near the bottom of the screen, and whether
the label is readable beside the finger) has not been tried on a device.
