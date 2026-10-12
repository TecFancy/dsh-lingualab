# Agent Note: move to the previous or next sentence while retiming

Status: proposed

## Problem

The timing panel edits one sentence. A subtitle file that is off is rarely off in one place: a
stretch of sentences tends to start late by about the same amount, so fixing them means fixing one,
saving, closing the panel, moving to the next sentence and opening the panel again, for every
sentence in the stretch. While the panel is open the arrow keys nudge an edge, so the usual way of
moving between sentences (`←` / `→` on the page) is not available, and every key the panel does not
use is swallowed on purpose so that a stray key cannot move the sentence being edited.

The question raised on 2026-10-12 was whether the panel can move to the previous or next sentence
itself. The evaluation below was accepted the same day: the feature is planned, not built yet.

## Proposal

**`↑` and `↓` in the panel move it to the previous and next sentence**, with two small buttons in
the panel header for the mouse. Both keys are free inside the panel today (it swallows them), so
nothing that works now changes meaning.

- **Nothing changed: move at once.** The panel reopens on the neighbour, the loop moves with it and
  the playhead goes to the neighbour's start, as opening the panel there would.
- **Something changed: save, then move.** The current sentence is saved as `Enter` would save it,
  and once the subtitles have been read back the panel reopens on the neighbour. The page has to keep
  "reopen on index *i* ± 1" across that reload, because the reload replaces the cue list and that
  ends the current session by design. A save cannot change the number of cues, so the index still
  names the right sentence afterwards. If the save is refused (a stale file, or an episode outside
  the library) the panel stays where it is and shows the reason, as it does now.
- **A pushed neighbour arrives already moved.** When the edit pushed the next sentence's start, that
  push is saved with it, so the next sentence opens with its new start and the user can carry on from
  there.
- **The ends of the list do nothing.** On the first or last sentence of the episode or segment the key
  is a no-op, and the button is disabled.
- **An episode that cannot be saved still moves.** The panel opens for listening there anyway, and
  moving between sentences is still useful for that.

The panel's footer gains one hint (`↑ ↓ 上一句 / 下一句`), and the timing note's description of the
panel's keys is updated when this is built.

## Alternatives considered

- **Keep unsaved edits for several sentences and save them together.** The host already accepts up to
  six cue edits in one write, so a batch is possible. But a draft that spans sentences has to
  reconcile pushes between drafted sentences, and a stale file would refuse the whole batch and lose
  several sentences of work at once. Saving per sentence keeps each step small and recoverable.
- **Discard unsaved changes on move, or ask first.** Discarding loses work on a key press; a
  confirmation adds a dialog to the one flow that is meant to be quick. Saving is the cheaper choice,
  because a saved edge can be moved back the same way.
- **Only "save and go to the next" (`Shift+Enter`).** Covers the common forward pass, but not going
  back to the sentence just saved when the next one shows it was moved too far.
- **A global offset for a range of sentences.** Faster for a stretch that is off by exactly the same
  amount, but the timing note already set this aside: drift is per sentence in practice, and the
  lead-in setting in 「更多」 covers the "subtitles are slightly late everywhere" case without editing
  the file at all.

## Settled details

The evaluation left two questions open; both were settled when the plan was accepted.

- **A move that saved says so.** The panel briefly shows 「已保存」 (the string the notes panel already
  uses) after it reopens on the neighbour. The move writes the subtitle file, and a write the user cannot
  see is the kind they later doubt. The message never delays the move or needs dismissing.
- **The focused edge is kept.** A stretch that is off is usually off at the same edge (every start a little
  late), so the panel reopens with the edge that had the focus. Opening the panel by hand still starts on
  the start, as it does now.

Related: [edit a sentence's timing](../../implemented/feature/2026-10-11-edit-subtitle-timing.md).
