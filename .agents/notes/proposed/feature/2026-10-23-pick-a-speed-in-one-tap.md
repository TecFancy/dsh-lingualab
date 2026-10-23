# Agent Note: pick a playback speed in one tap

Status: proposed

## Problem

The speed button on the control bar steps up one preset per click and wraps from the top back to the bottom. There
are ten presets (0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.15, 1.25, 1.5, 2), so where the user wants to go decides how many
clicks it takes, and going slower always means going round through the faster ones:

- From 1× to 0.6× is six clicks, past 2×.
- Back to 1× from 2× is six clicks, through every slow preset.
- One click too many costs a full lap: nine more clicks to land where the user meant to be.

`[` and `]` step down and up without wrapping, which helps at a keyboard, but a long jump is still one press per
preset, and on an iPad there is no keyboard at all. Changing speed is a frequent gesture for a learner (slow down a
hard sentence, then go back), so the click count is paid many times a session.

The user raised this on 2026-10-23 and asked for a plan to build later.

## Proposal

**The speed button opens a picker; one tap on a preset sets it.**

- The button still shows the speed in force. A click opens a small popover above it, as 「字幕」 does, with all ten
  presets as chips: the slower ones, then 1× set a little apart so it is easy to hit, then the faster ones. The speed
  in force is outlined.
- A tap on a chip sets that speed and closes the popover. Any speed is two taps away, and a wrong pick is undone with
  two more.
- The popover closes the way 「字幕」 does: a press outside it or `Esc`, after which focus goes back to the button. A
  press on another popover's button is a press outside, so only one is open at a time.
- Chips are at least 44px tall, for a finger on an iPad.
- Wrapping goes away with the cycle: `nextSpeedWrapping` has no caller left and is removed.

**`=` goes back to 1×, and a second press goes back to the speed before it.**

- At any speed other than 1×, `=` sets 1×.
- At 1×, `=` sets the last speed other than 1× that was in force, however it was chosen (the picker, `[` `]` or `=`).
  So "slow down, back to normal, slow down again" is one key each way. With no such speed yet, `=` does nothing.
- `=` is a key the page does not use, and on a US layout it sits beside `[` and `]`, so the three keys read as one
  group. `[` and `]` keep their meaning. The shortcut table lists `[  ]  =`, and its text says slower, faster and normal.
- The remembered speed lives in the player's store next to the speed, and like the speed it survives a change of
  episode but not a reload.

**Shape.** The popover is its own component in the control-bar widget (`ui/SpeedMenu.tsx`), because `ControlBar.tsx`
sits at its size baseline and cannot grow. The open, close and close-on-outside-press logic becomes one hook in the
widget's `lib/`, used by the 「字幕」 popover, the 「更多」 menu and the new picker, which takes the two copies of that
effect out of `ControlBar` and leaves it shorter than now. The key is a new `speed-reset` action in the page's keymap;
what it sets is a pure function of the speed in force and the remembered one, with its own tests.

## Alternatives considered

- **Minus and plus buttons on either side of the speed.** A wrong click is undone with one tap, but a long jump is
  still one tap per preset: 1× to 0.6× is four.
- **A slider.** One drag for any speed, but hard to stop on a given preset with a finger, and it needs room the
  control bar does not have.
- **All presets on the control bar as a segmented row.** No popover at all, but ten chips do not fit beside the other
  controls on the row.
- **Long press or double click on the button to go back to 1×.** Nothing on screen says it exists, and a double click
  fires a single click first, which moves the speed before it resets it.
- **Cycle only through a few favourite speeds.** Fewer clicks, but it needs a setting to choose the favourites, and
  a speed outside them is no longer reachable from the button.
- **`=` that only goes back to 1×.** Simpler, but the learner who slows down a hard sentence and returns would have to
  open the picker every time to slow down again.

Related: [choose an episode's subtitles by hand](../../implemented/feature/2026-10-12-choose-subtitles-by-hand.md),
whose 「字幕」 popover the picker follows.
