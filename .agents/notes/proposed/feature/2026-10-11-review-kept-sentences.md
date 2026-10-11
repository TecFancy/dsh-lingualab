# Agent Note: review kept sentences

Status: proposed

## Problem

Keeping a sentence is one tap on the star, and that part works. What comes after does not:

- The notes drawer is modal. Its scrim covers the stage and the transport, so a reader looking
  through kept sentences cannot see the subtitles, and a sentence replayed from the drawer could
  not even be paused until the drawer was closed (fixed on its own, but the cause is the layout).
- A kept sentence carries three hand-kept marks: a tick for 「记住了」 and two tag toggles,
  「#想不起」 (`#review`) and 「#还记不住」 (`#hard`). Nothing on screen says how they relate, and
  any combination of the three is possible.
- There is no way to review. The list is a list: going through the kept sentences one by one,
  listening to each a few times, means clicking each card in turn.
- Review is per episode, while the method is not. A fresh `notes.md` opens with 「想不起的加
  `#review`，周日还记不住的加 `#hard`」, a weekly pass over everything, and the page only ever
  shows one episode's sentences.
- A word picked on the stage goes into the sentence's note as `[word]`, and nothing on screen
  takes it out again: the popover says 「已记下」 and stops there, and the card shows the word as a
  chip with no way to remove it, short of editing `notes.md` by hand.
- Only one word at a time can be picked. A collocation or a phrase (「her skirt」, 「get down
  here」) is often the thing worth keeping, and there is no way to keep it as one.

## Decision

**The right column switches between 「字幕」 and 「收藏」.** The notes drawer and its scrim go
away; the kept sentences take the subtitle column's place, with its width and its scroll. The
stage and the transport stay usable the whole time. The top bar's 「笔记 n」 chip and `N` switch
the column to 「收藏」 and back. Clicking a card does what clicking a subtitle line does, plus
the loop: the sentence goes on stage, loops and plays. The card of the sentence on stage is
highlighted and is the only expanded one: its note, its words and its grade show there, so the
list stays a list of sentences. The three filters (「还在练」「已记住」「全部」) stay, as a small
segmented control in the column head. The five-steps drawer is not part of this change.

**A kept sentence has one state, set by grading it.**

| State | Shown as | In `notes.md` |
|---|---|---|
| New | 「新收藏」 | `- [ ]`, neither tag |
| Fuzzy | 「模糊」 | `- [ ]` with `#review` |
| Not yet | 「没记住」 | `- [ ]` with `#hard` |
| Got it | 「记住了」 | `- [x]` |

Grading is three buttons on the expanded card and three keys, `1` 「记住了」, `2` 「模糊」,
`3` 「没记住」, which act on the kept sentence on stage in practice and in review alike. A grade
replaces the previous state: it clears the tick and both tags, then sets its own. Other tags a
reader wrote by hand are kept. The checkbox and the two tag toggles leave the card, which shows
the state as one chip. The line format of `notes.md` does not change, so older files and the
agent's grep read as before; a line with both tags reads as 「没记住」. A fresh `notes.md` opens
with a preamble that explains the grades instead of the tags.

**Words and phrases can be taken back, and a phrase can be kept as one.** On the stage, a
click picks a word as today, and dragging across words or `Shift`-clicking a second word picks
the span between them; the popover then offers the phrase with the same 「复制」 and 「记下」. A
phrase is stored as `[her skirt]`, which the note's marker already allows (`splitNote` reads
any text between brackets), so the format does not change. 「已记下」 becomes a toggle that removes
the word or phrase again, and every chip on the card carries a remove button. Removing a marker
takes out the `[...]` and nothing else of the note.

**Review is a mode of the practice page.** 「复习」 in the 「收藏」 column head starts it for the
episode on screen. The queue is the episode's sentences that are not 「记住了」, in play order
(segment, then time). Each item goes on stage with its English hidden, the way shadowing hides
it, and loops; `R` or a click reveals it, `1` to `3` grade it and move on, `→` skips it ungraded,
`Space` pauses, `Esc` leaves review. A strip above the stage reads 「复习 3 / 12」, with the
segment when there is one, and the three grade buttons. At the end the finish card counts the
grades and offers to go again over the ones graded 「没记住」.

**Review across episodes starts from the home.** A card on the home reads 「复习收藏 · 还在练
42 句，来自 5 集」 and starts the same mode with a queue over the whole library: episodes in the
library's order (folders, then loose files), then play order inside each. An item in another
episode or segment opens it through the existing open path and then seeks, exactly as replaying
a kept sentence from another segment already does, so a grade is written by the episode that is
open, through the existing `POST /lingualab/notes`. An item whose episode is gone is skipped and
counted in the summary.

**The host grows one read route.**

```ts
// GET /lingualab/review: every kept sentence not ticked done, across the library.
export interface ReviewPayload {
  readonly ok: boolean
  readonly reason: string | null
  /** Episodes with at least one such sentence, in library order. */
  readonly episodes: readonly ReviewEpisode[]
  /** Sentences across all of them. */
  readonly total: number
}

export interface ReviewEpisode {
  readonly episode: string
  readonly title: string
  readonly kind: 'folder' | 'file'
  /** Not-done phrases, in play order. */
  readonly phrases: readonly NotePhrase[]
}
```

It reads folder episodes' `notes.md` and file episodes' phrases from the plugin state, with the
same parser and the same safety checks as `GET /lingualab/notes`. It never writes.

**Out of scope:** scheduling (due dates, spaced intervals) and any per-phrase history, which
would need a new field in the line format; statistics beyond the session's summary; moving the
five steps out of their drawer; and editing a note from the review strip.

## Alternatives considered

- **Keep the tick and the two tags, and add review on top.** Less to change, but the confusion
  is the three independent marks; a review that asks for a grade and then leaves the reader to
  set marks by hand would ask twice.
- **Spaced repetition with due dates.** It is where a review list naturally goes, but it needs
  each phrase's history (last review, interval), which the line format has no room for. Adding a
  column changes a format that people edit by hand and the agent greps. Grades now keep that door
  open: a later note can add scheduling on top of the same four states.
- **Keep the drawer and drop the scrim.** A smaller change, but two right-hand panels would fight
  over the width, and the list would still sit over the stage it is meant to drive.
- **A separate review page with its own player.** Cleaner to describe, but it would duplicate the
  player, the cue handling and the segment open that the practice page already has, and the
  reader would review without the subtitles, the speed and the loop they practise with.
- **Collect the library's notes in the browser, one request per episode.** No host change, but a
  library of fifty episodes would be fifty requests before the home card can show a count.

## Consequences

- The notes drawer, its scrim and its time chip go away; the pause fix for the chip becomes the
  card's normal behaviour (`Space` and the transport are always reachable).
- `#review` and `#hard` now mean the latest grade rather than the day a phrase was missed. An
  older file reads naturally: a `#review` line shows as 「模糊」, a `#hard` line as 「没记住」.
- The word popover changes from one word to a span, so the stage's tokens need a selection state;
  a single click still behaves as it does today.
- `1`, `2` and `3` become shortcuts and join the key list in 「更多」.
- A new route means `dsh-plugin.naming.json`, the README route table and `check-host.mjs` all
  change, and the host half needs a restart.
- The Figma frame `Notes / Light` no longer describes the page; it needs a 「收藏」 column frame and
  a review strip.
- The seven-phrase ceiling note
  ([2026-10-08-seven-phrase-ceiling](../../implemented/feature/2026-10-08-seven-phrase-ceiling.md))
  argued for a short working set by choice. Grades are that choice, made per sentence while
  listening rather than by ticking boxes afterwards.
