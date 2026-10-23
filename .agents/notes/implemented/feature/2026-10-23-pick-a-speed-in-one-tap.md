# Agent Note: pick a playback speed in one tap

Status: implemented

## Problem

The speed button on the control bar stepped up one preset per click and wrapped from the top back to the bottom. There
are ten presets (0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.15, 1.25, 1.5, 2), so where the user wanted to go decided how many
clicks it took, and going slower always meant going round through the faster ones:

- From 1× to 0.6× was six clicks, past 2×.
- Back to 1× from 2× was six clicks, through every slow preset.
- One click too many cost a full lap: nine more clicks to land where the user meant to be.

`[` and `]` step down and up without wrapping, which helps at a keyboard, but a long jump is still one press per
preset, and on an iPad there is no keyboard at all. Changing speed is a frequent gesture for a learner (slow down a
hard sentence, then go back), so the click count was paid many times a session.

The user raised this on 2026-10-23. The plan was written the same day and built the same day, in two steps: the
picker, then the `=` key.

## Decision

**The speed button opens a picker; one tap on a preset sets it.**

- The button still shows the speed in force. A click opens a popover above it with all ten presets as chips in three
  rows: the five slower ones, then 1× alone across the whole row, then the four faster ones. 1× is the speed a reader
  comes back to most, so it gets the biggest target. The speed in force is outlined and has `aria-pressed`.
- A tap on a chip sets that speed, closes the picker and puts focus back on the button. Any speed is two taps away,
  and a wrong pick is undone with two more.
- The picker opens from the button's left edge, because the button is at the left end of the row, and is capped at
  the viewport's width.
- It closes the way 「字幕」 does: a press outside it or `Esc`, after which focus goes back to the button. The picker
  and the 「更多」 menu share one open state, and opening either closes 「字幕」, so only one popover is open at a time.
- The press-outside effect is one hook, `widgets/control-bar/lib/usePopover.ts`, used by all three popovers. It still
  listens for `mousedown` on `window`, as the two copies it replaced did.
- On a touch screen every chip is at least 44px by 44px. The chips have their own class rather than the row's
  button class, and the timing mode's rule that hides the row's popovers leaves this one alone: the speed button is
  the one control the timing mode keeps, and its picker works there too.
- `nextSpeedWrapping` had no caller left and was removed.

**`=` goes back to 1×, and a second press goes back to the speed before it.**

- At any speed other than 1×, `=` sets 1×.
- At 1×, `=` sets the last speed other than 1× that was in force, however it was chosen (the picker, `[` `]` or `=`).
  With no such speed yet the key is not the page's: the keymap returns nothing, and the browser gets the key.
- The remembered speed is `lastSpeedIndex` in the player's store, next to `speedIndex`. Like the speed it survives a
  change of episode and not a reload.
- What a change of speed remembers and where `=` goes are two pure functions in
  `features/media-player/lib/speed.ts` (`chooseSpeed`, `speedResetIndex`), which now also holds the presets. Every
  speed action in the store goes through `chooseSpeed`. The keymap learns whether `=` has somewhere to go through
  `canResetSpeed` in its context, the way `V` learns whether there is a video.
- The shortcut table in 「更多」 lists `[  ]  =` as slower, faster and normal speed.

## Measured

In a dsh web 0.2.1-rc.2 instance with this branch linked, on a copy of one episode (496 sentences), at 1400 by 900:

- The picker was 326px wide, its left edge on the button's (501px). Rows: five chips of 57px, one of 300px, four of
  72px, each 32px high with a mouse.
- A press on 0.6× set the button to 0.6× and the media element's `playbackRate` to 0.6, closed the picker and left
  focus on the button.
- Opening the picker and then 「更多」 left only 「更多」 open, and the other way round. `Esc` closed the picker with focus
  on the button; a press on the stage closed it.
- With the timing panel open the picker opened and showed the speed in force; two presses of `Esc` closed the picker,
  then the panel.
- `=` at 1× before any other speed: nothing changed and the event was not default-prevented. Then `]` (1.15×), `=`
  (1×), `=` (1.15×); a pick of 0.7× in the picker, `=` (1×), `=` (0.7×). `playbackRate` followed each time.
- At 768 by 1024 the picker stayed inside the viewport (101px to 427px). The console stayed clean.

The 44px chips were checked through the stylesheet test only; the picker has not been tried with a finger on an iPad.

## Alternatives considered

- **Minus and plus buttons on either side of the speed.** A wrong click is undone with one tap, but a long jump is
  still one tap per preset: 1× to 0.6× is four.
- **A slider.** One drag for any speed, but hard to stop on a given preset with a finger, and it needs room the
  control bar does not have.
- **All presets on the control bar as a segmented row.** No popover at all, but ten chips do not fit beside the other
  controls on the row.
- **One row of ten chips in the picker, with 1× set apart by a gap.** This was the plan. Three rows give 1× a target
  as wide as the picker and keep each chip wide enough for a finger in a popover the size of 「更多」.
- **Long press or double click on the button to go back to 1×.** Nothing on screen says it exists, and a double click
  fires a single click first, which moves the speed before it resets it.
- **Cycle only through a few favourite speeds.** Fewer clicks, but it needs a setting to choose the favourites, and
  a speed outside them is no longer reachable from the button.
- **`=` that only goes back to 1×.** Simpler, but the learner who slows down a hard sentence and returns would have to
  open the picker every time to slow down again.
- **`=` that always acts, and does nothing at 1× with no speed remembered.** One less field in the keymap's context,
  but the key would be spent without doing anything, which the page does not do with any other key.

## Consequences

- "Normal speed" is `DEFAULT_SPEED_INDEX`. If the default ever stops being 1×, `=` goes to the new default and the
  shortcut table's text has to change with it.
- The `ControlBar` function got shorter by one size band, and the baseline in `.betterer.results` was updated. The
  file is near the top of its own band (460 counted lines), so the next control on the row needs a component of its
  own, as the picker has.
- `toggledMenu`, `escapeToClose` and `focusButton` moved into `usePopover.ts` with the hook, so a fourth popover on the
  row reuses them rather than copying the handlers.
- The key-cap row under the player still shows no speed keys; `[  ]  =` are listed only in 「更多」.
- The repository renders components to strings, so the popover's outside press is tested through `watchOutside`, the
  body of the hook's effect, and the menu transitions through `toggledMenu`, rather than by pressing real buttons.

Related: [choose an episode's subtitles by hand](2026-10-12-choose-subtitles-by-hand.md), whose 「字幕」 popover the
picker follows.
