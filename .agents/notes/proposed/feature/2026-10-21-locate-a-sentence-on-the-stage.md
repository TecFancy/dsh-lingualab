# Agent Note: locate a sentence by dragging on the stage

Status: proposed

## Problem

The transcript is how a user jumps to a sentence far from the one on stage: scroll the list, tap the line. Once the
side column can be collapsed on an iPad (planned on 2026-10-21), that way is one more press away, and opening the
column takes its width back from the stage. The other ways are poor for a long jump. The progress bar maps the whole
episode onto a few hundred pixels, so on a long recording one pixel is several seconds and landing on a given sentence
takes several tries. Previous and next move one sentence at a time.

The question raised on 2026-10-21 was whether holding the sentence on the stage and dragging it up or down could move
through the sentences, as the transcript does. It was kept for later, after the collapse ships. A smaller change raised in the same discussion,
fine scrubbing on the progress bar, shipped on its own first.

## Proposal

**Hold, then drag, on the stage.** A press that stays still for about 300ms, then moves up or down, enters locate mode.
The hold is what separates it from the gesture the stage already has: a finger that drags across the English words at
once picks a phrase to keep (`practice-stage`, with `touch-action:none` on the English line), and that stays as it is.
The hold changes two things about a press on a word: once the hold completes, a phrase drag that had started is dropped,
and a release without moving after the hold cancels instead of opening the word popover.

- **What the user sees.** A ring fills during the 0.3s hold, then the stage dims, playback pauses, and a small wheel
  appears on the half of the stage away from the finger, so the finger never covers it: the target sentence with one or
  two neighbours above and below, its place (「第 123 / 845 句」), its time and how far it is from the start
  (「往后 6 句」). A thin bar beside it shows where the sentence sits in the whole episode. Nothing plays during the drag.
  An open word popover closes when locate mode starts.
- **Speed matters.** A slow drag moves one sentence per step (about 24px); a fast flick moves dozens, and the wheel
  shows the step size (「每格 10 句」), so a jump across a long recording is a few flicks and then a slow drag to land.
- **It can be cancelled.** Releasing within about 12px of the starting point, or outside the stage, leaves everything as
  it was, and the wheel says so before the finger lifts.
- **Release does what a tap in the transcript does.** It selects or plays the sentence by the rules the transcript
  already follows, not by new ones.
- **Where it is off.** Not while the timing panel is open (the panel owns the sentence then), not on a masked sentence
  in a blind run (the English line ignores the pointer there, so a hold lands on the stage and must be ignored
  explicitly), and not in the large picture mode, where the stage shows only the picture.
- **Discovering it.** A one-time hint at the bottom of the stage (「按住舞台不动，再上下拖…」 with 「知道了」), and no
  permanent marker on the stage.
- **iOS details.** The Chinese line and the `<video>` element need `-webkit-touch-callout:none` and `user-select:none`,
  or a hold opens the system's long-press menu.

**A fallback without the hold, only where the stage does not scroll.** A vertical drag that starts at once on the
Chinese line, on the lines either side of the sentence or on the empty stage could enter locate mode without the hold.
But the part above the player card (`.dsh-lingualab-practice-main`) scrolls on a short iPad, and the fallback needs
`touch-action:none`, which would take that scroll away. So either the fallback is on only while that part does not
overflow, or there is no fallback and the hold is the only way in. The time range on the stage is a button and is never
a starting point. Which of the two is decided when this is built, by trying both on an iPad.

Design reference (proportions only, the host's tokens win): <https://claude.ai/artifact/47tXyDmtsB2YkPa8QkjoGD>.

## Alternatives considered

- **Only the overlay drawer of the side column** (see the related note). It brings the list back for a lookup, but a
  lookup that is only "go back about forty sentences" is faster under the thumb than in a list that has to be opened,
  scrolled and closed. The two do not exclude each other; which to build first depends on how often the collapsed
  column gets opened in use.
- **Drag on the English words without a hold.** It would collide with picking a phrase, which is the stage's main
  gesture.
- **A two-finger vertical swipe.** No collision at all, but it is the hardest to discover, and it has to be told apart
  from the browser's pinch zoom.
- **Horizontal swipes for previous and next.** Easy to learn, but still one sentence per swipe, which does not solve
  the long jump.
- **A "go to sentence N" field.** Exact, but it needs the keyboard on a touch screen and the user rarely knows the number.

Related: [the side column over a narrow stage](2026-10-21-side-column-over-a-narrow-stage.md),
[the layout answers to the practice column](../../implemented/architecture/2026-10-14-layout-answers-to-the-practice-column.md).
