# Agent Note: animate the side column and regroup the top bar

Status: proposed

## Problem

Version 0.15.0 made the right column collapsible: the column is either not drawn at all or it sits beside the stage, and the
stage takes the width back. The arrival and the departure happen in one frame. That was deliberate — the note that
introduced the collapse rejected a width animation because every frame of it re-lays out the stage (the picture, the number
of rows in the play card, the timing layout), which is exactly the movement the collapse was meant to remove. See
[the collapse note](../../implemented/feature/2026-10-21-collapse-the-side-column.md).

Used for a day, the swap reads as a jump. The eye is on a sentence in the list, the user presses `\` to give the stage room,
and lands on a picture that has already finished moving; when the column comes back it appears at once, and nothing shows
that the sentence it lands on is the same one that was playing. The change is also abrupt enough that the two states feel
like different pages rather than one row with one part hidden.

The top bar has the same kind of problem in space rather than time. It carries the back button, the title with its segment
line, the segment picker, the kept chip, the column toggle, the five steps and the settings. Version 0.15.0 made the back
and kept buttons drop to icons below 720px and gave every button a 44px touch target, but the row still has no grouping:
the two buttons that act on the column sit between the segment control and the step tracker, and the settings, the steps
and the column toggle have no order that says what they belong to. The row is organized by what fit, not by what belongs
together.

## Proposal

- **Animate the column with a short transition.** Expanding and collapsing should take about 160 to 220 milliseconds: the
  column's width and opacity move together, and the stage's share follows in the same transition, so the picture grows or
  shrinks with the column rather than after it. Under `prefers-reduced-motion` the swap stays instant.
- **Keep the column unmounted once it is gone.** The exit animation runs on a wrapper that still holds the current list;
  when it finishes, the wrapper is removed. The remount and the scroll-to-the-playing-sentence behaviour stay as they are.
- **Regroup the top bar by what each control acts on.** The kept chip and the column toggle stay together as one pair,
  apart from the episode controls (back, title, segments) and from the per-episode progress (steps). The steps and the
  settings move to the far right as their own group, and the low-frequency controls may fold into one overflow. The 44px
  touch targets, the icon-only behaviour under 720px, the title's room, and the `N` and `\` hints stay as they are.
- **Measure before choosing the kind of animation.** The earlier note's objection was the cost per frame. On the real
  iPad, record a trace while the column opens and closes. If animating the width holds a steady frame budget, use it; if
  not, animate only opacity and let the stage settle once at the end. The note that records the work says which one was
  chosen and why.

## Alternatives considered

- **Leave the swap instant.** This is the standing decision and the cheapest, and it is rejected because the ask came
  after using the feature: the jump is the thing the user noticed.
- **Fade only and snap the width.** Cheaper than moving the width, but with 260 to 440px between the two states the
  column still appears to pop, and the stage still jumps.
- **Animate the stage instead of the column.** The column is the part appearing or disappearing; animating the stage alone
  would move the part that did not change.
- **Keep the column mounted and animate its width.** It preserves the scroll position, but the hidden list cannot follow
  the playing sentence, and the existing decision already rejected keeping it mounted for that reason.
- **Hide more of the top bar's text.** It frees pixels, not hierarchy; the buttons are still in an order that has to be
  read each time.
- **Put every top-bar control behind one "more" menu.** It makes the bar quiet, but the kept chip and the column toggle
  are used every session, and a menu would cost a tap each time.
