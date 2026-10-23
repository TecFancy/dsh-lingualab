# Agent Note: animate the side column and regroup the top bar

Status: implemented

## Problem

Version 0.15.0 made the right column collapsible: the column is either not drawn at all or it sits beside the stage, and
the stage takes the width back. The arrival and the departure happened in one frame. That was deliberate: the note that
introduced the collapse rejected a width animation because every frame of it re-lays out the stage (the picture, the
number of rows in the play card, the timing layout), which is exactly the movement the collapse was meant to remove. See
[the collapse note](2026-10-21-collapse-the-side-column.md).

Used for a day, the swap read as a jump. The eye is on a sentence in the list, the user presses `\` to give the stage
room, and lands on a picture that has already finished moving; when the column comes back it appears at once. The two
states felt like different pages rather than one row with one part hidden. On a narrow row the drawer slid in, but left
in one frame.

The top bar had the same kind of problem in space rather than time. Its right side carried the kept chip, the column
toggle, the five steps and the settings at the same 8px spacing, so nothing said that the first two act on the column
and the last two on this episode's progress and the page's settings. The row was organized by what fit, not by what
belongs together.

The plan was written on 2026-10-21 and built on 2026-10-23, in two steps: the column's motion, then the top bar.

## Decision

**The column slides in and out over 200ms, with the stage and the picture moving in the same transition.**

- The column sits in a slot (`ui/PracticeSideSlot.tsx`) driven by `usePresence(open, SIDE_MS)`. The slot's width and
  opacity are what transition; the stage beside it is `flex:1`, so it gives the width back in the same frames.
- The list inside keeps its full width (`--ll-side-w`, `clamp(300px,34cqw,440px)`) the whole way and the slot clips it.
  The subtitle rows never rewrap on the frames of the transition, and the column reads as sliding out rather than
  narrowing.
- On the way out the list stays mounted for 200ms with its current rows, but it cannot be pressed (`pointer-events:none`)
  and a screen reader skips it (`aria-hidden`). It is unmounted afterwards, so expanding still mounts it again and the
  list still lands on the playing sentence.
- The picture follows: `--ll-pic-share` and `--ll-pic-w` are registered with `@property`, so the change that
  `is-side-collapsed` makes to them is a transition rather than a jump.
- On a narrow row the drawer now leaves the way it arrives: it slides out to the right while its scrim fades, and both
  unmount together. The body carries `is-side-narrow` and the slot carries `is-floating` from the row's width, not from
  the open state, so the leaving drawer keeps its absolute place instead of dropping into the flow on its first frame.
- Under `prefers-reduced-motion` the page's rule zeroes every transition and `usePresence` waits for nothing, so the swap
  is instant as before.

**The top bar's right side is two groups with a line between them.** The kept chip and the column toggle form the
「右栏」 group; the five steps and the settings form the 「进度与设置」 group at the far right. Each is a `role="group"`
with a name, a 1px line in the chips' border token separates them, and the spacing inside a group stays 8px, which is
what the 44px touch targets were measured against. The left side (back, title, segments) is unchanged. There is no
overflow menu: the second group has only two buttons, and a menu would cost each of them a tap.

## Measured

In a dsh web 0.2.1-rc.2 instance with this branch linked, on a copy of one episode (496 sentences). The browser pane
was a background page, so its frames were throttled and frame-by-frame timings were not trustworthy; the transitions
were read with `document.getAnimations()`, paused at 100ms:

- At 1400 by 900, opening: the slot had `width` and `opacity` transitions of 200ms; at 100ms it was 306 of its 381px,
  the stage 814 on its way from 1120 to 739, and the list inside stayed 382px wide. Closing at 100ms: slot 75px, stage
  1045, `aria-hidden` and `pointer-events:none` on the slot, the list still 382px; the slot was gone after the
  transition.
- The picture, made visible by hand because the episode has none: opening the column, `--ll-pic-share` was 0.711 at
  100ms on its way from 1 to 0.64.
- At 1000 by 800 (a 944px row): the drawer was absolutely placed over the stage, and while it left it stayed absolute,
  translated 290px to the right at 100ms with its scrim at 0.2 opacity; both unmounted together.
- The top bar at 900 and 700 wide: two groups and the line, 8px inside each group; at 700 the kept chip dropped to its
  icon and nothing overflowed. The five steps' drawer still opened flush with the page's right edge. The console stayed
  clean.

The plan asked for a trace on a real iPad before choosing between a width transition and a fade. That trace has not
been recorded; the width transition was chosen because on the desktop it ran without the list rewrapping, and the
fallback is a change to the slot's rules only (see Consequences).

## Alternatives considered

- **Leave the swap instant.** This was the standing decision and the cheapest; it was set aside because the ask came
  after using the feature: the jump was the thing the user noticed.
- **Fade only and snap the width.** Cheaper than moving the width, but with 260 to 440px between the two states the
  column still appears to pop, and the stage still jumps. It stays the fallback if the iPad cannot hold the width.
- **Animate the stage instead of the column.** The column is the part appearing or disappearing; animating the stage
  alone would move the part that did not change.
- **Keep the column mounted and animate its width.** It preserves the scroll position, but the hidden list cannot follow
  the playing sentence, which is why the collapse note unmounts it.
- **Narrow the list with the slot.** One element instead of two, but every frame would rewrap every visible subtitle row.
- **Hide more of the top bar's text.** It frees pixels, not hierarchy.
- **Put every top-bar control behind one "more" menu.** A quiet bar, but the kept chip and the column toggle are used
  every session, and a menu would cost a tap each time.

## Consequences

- Each frame of the width transition re-lays out the stage, which is the cost the collapse note warned about. It has not
  been traced on an iPad. If it drops frames there, transition only the slot's opacity and let the width snap at the
  end; the slot and `SIDE_MS` stay as they are.
- `SIDE_MS` in `PracticeSideSlot.tsx` and the `.2s` in `styles-side.ts` are one number written twice; change both.
- When the column opens, the picture's transition starts on the click, when `is-side-collapsed` goes, and the slot's
  two frames later, when `usePresence` adds `is-open`. In a foreground page that is about 33ms. Closing starts both on
  the same render.
- Registering `--ll-pic-share` and `--ll-pic-w` makes every change to them a transition, including the container
  queries that set them when the window is resized.
- The repository's component tests render static markup, so the slot's timer is tested through `presenceDelay` and its
  frames rather than by mounting and advancing time.
- `settingsOpen` and `settingsTitle` were the same string in both languages; the button now uses `settingsTitle`, which
  kept `locale.ts` inside its size band after the two group names were added.

Related: [the right column over a narrow stage](2026-10-21-side-column-over-a-narrow-stage.md).
