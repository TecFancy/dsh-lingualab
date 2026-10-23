# Agent Note: move to the previous or next sentence while retiming

Status: implemented

## Problem

The timing panel edits one sentence. A subtitle file that is off is rarely off in one place: a
stretch of sentences tends to start late by about the same amount, so fixing them means fixing one,
saving, closing the panel, moving to the next sentence and opening the panel again, for every
sentence in the stretch. While the panel is open the arrow keys nudge an edge, so the usual way of
moving between sentences (`←` / `→` on the page) is not available, and every key the panel does not
use is swallowed on purpose so that a stray key cannot move the sentence being edited.

The question raised on 2026-10-12 was whether the panel can move to the previous or next sentence
itself. The plan was accepted the same day and built on 2026-10-23, in two steps: moving when nothing
changed, then saving before moving.

## Decision

**`↑` and `↓` in the panel move it to the previous and next sentence**, with two small buttons in
the panel's header for the mouse and a hint in its footer (`↑ ↓ 上一句 / 下一句`, the page's own
strings). Both keys were swallowed by the panel before, so nothing that worked changes meaning.

- **Nothing changed: move at once.** The panel reopens on the neighbour as opening it there would:
  the loop moves with it, the playhead goes to the neighbour's start and it plays. The one
  difference is the focused edge, which is kept, because a stretch that is off is usually off at the
  same edge. An LRC line, whose end cannot move, falls back to the start. Opening the panel by hand
  still starts on the start.
- **Something changed: save, then move.** The sentence is saved as `Enter` saves it, then the
  subtitles are read back and the panel opens on the neighbour of the new list.
  - The panel stays on the page through the reload: the presence that mounts it counts a move in
    flight as open, the save button says 「保存中…」 and the header buttons are off. Every key is
    swallowed and does nothing until the neighbour opens, `Esc` included.
  - The page resumes on the neighbour's start, without looping. When the save pushed that sentence,
    the start is the pushed one, so the neighbour arrives already moved and the user carries on from
    there.
  - The neighbour opens when the first list that is not the saved one arrives. A save cannot change
    the number of sentences, so the index still names the right one; a list of another length means
    something else happened (another segment), and the move is dropped.
  - The header shows 「已保存」 (the string the notes panel already uses) in place of the loop
    status for 1.5 seconds. A write the user cannot see is the kind they later doubt. The note never
    delays the move and clears early on the next change, step or close.
  - A refused save (a stale file, or another refusal from the host) drops the move: the panel stays
    on the sentence with the edits and the reason, as a refused `Enter` does.
- **An episode that cannot be saved moves at once,** changed or not. The panel opens there for
  listening, and edits that have nowhere to be written are not worth a stop.
- **The ends of the list do nothing.** On the first or last sentence of the episode or segment the
  key is a no-op and the button is disabled.

The rules are pure functions in the widget's `lib/` (the key table, when a step needs a save, the
session and the save request), and the move across the reload is `model/useStepAfterSave.ts`.
Where the page resumes after a save is `resumeAfterSave` in `pages/lingualab/lib/retime.ts`.

## Measured

In a dsh web 0.2.1-rc.2 instance with this branch linked, on a copy of one episode (496 sentences),
at 1400 by 900:

- Unchanged, with the end focused, `↓` from sentence 2 opened sentence 3 with the end still focused
  and the loop on it.
- The end of sentence 3 moved from 08.400 to 08.500, then `↓`. Sampled every 20ms: the panel never
  left the page, the button said 「保存中…」, and about 200ms later sentence 4 opened with the end
  focused, starting at 08.500 (pushed from 08.480), with 「已保存」 for 1.5 seconds. Both subtitle
  files changed in exactly those two timecode lines, with a `.bak` before the first write.
- With the file changed on disk, a changed start and `↑` were refused: the panel stayed on sentence 4
  with its edit and showed the reason and the reload button.
- On sentence 1 the previous button was disabled and `↑` did nothing. The console stayed clean.

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
- **Let the panel close and reopen across the reload.** Simpler, but the panel would fade out and in
  around every saved move, and the stage would leave timing mode and come back with it.

## Consequences

- The move depends on the order of the page's effects when the new list arrives: the player's reset,
  then the resume's seek, then the panel. `LingualabPage` declares them in that order (the reset
  effect, `useResume`, `useRetime`); moving `useRetime` above either would let the reset drop the pin
  the panel just set.
- While a move is in flight the keys do nothing. If the reload never brings a new list, the move
  stays pending until the panel's close button cancels it.
- `useTimingEditor` sits at 199 of the 200 lines its size band allows. The next change to it has to
  take something out first.
- Not yet tried with touch on an iPad; the buttons are the touch path.

Related: [edit a sentence's timing](2026-10-11-edit-subtitle-timing.md).
