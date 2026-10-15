/**
 * How the sentences on screen and the sentences kept from them find each other, apart from React.
 *
 * `notes.md` holds whole seconds, so a cue and a kept phrase are matched by the same key everywhere (whole second plus
 * English plus segment, `keptSentenceKey`) and never by asking which cue plays at a phrase's timestamp: the cue
 * playing at `00:12` can be the one before the one that was kept. These are the questions the page asks of that match,
 * as plain functions of the cue list and the stored phrases; `useStageNotes.ts` is the hook that holds them.
 */
import { splitCue, type Cue } from '../../../entities/cue/index.ts'
import { addWordToNote, noteHasWord, removeWordFromNote } from '../../../features/notes/index.ts'
import { keptSentenceKey, sameKeptSentence } from '../../../shared/notes-format.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'
import type { StagePhrase } from './panel.ts'

/**
 * The phrase a cue becomes when it is kept: its English, its Chinese gloss, an empty note, the segment it is in.
 * The segment is recorded with the sentence because seconds only mean something inside one.
 * @param note - the note to start it with, empty for a plain star.
 */
export function phraseOfCue(cue: Cue, segmentId: string | null, note = ''): NotePhrase {
  const { english, chinese } = splitCue(cue)
  return { at: cue.start, text: english, zh: chinese, note, tags: [], done: false, segment: segmentId ?? undefined }
}

/** The indexes of the cues whose sentence is kept, so the list can mark them. */
export function notedIndexesOf(cues: readonly Cue[], phrases: readonly NotePhrase[], segmentId: string | null): ReadonlySet<number> {
  const kept = new Set(phrases.map((phrase) => keptSentenceKey(phrase)))
  const marked = new Set<number>()
  cues.forEach((cue, index) => {
    if (kept.has(keptSentenceKey({ at: cue.start, text: splitCue(cue).english, segment: segmentId ?? undefined }))) {
      marked.add(index)
    }
  })
  return marked
}

/** The kept phrase of the sentence on stage, with its place in the stored list, or `null` when it is not kept. */
export function stagePhraseOf(
  cues: readonly Cue[],
  activeIndex: number,
  phrases: readonly NotePhrase[],
  segmentId: string | null,
): StagePhrase | null {
  const cue = cues[activeIndex]
  if (cue === undefined) return null
  const key = { at: cue.start, text: splitCue(cue).english, segment: segmentId ?? undefined }
  const index = phrases.findIndex((phrase) => sameKeptSentence(phrase, key))
  return index < 0 ? null : { index, phrase: phrases[index] }
}

/** The note with a picked word taken out when it already holds it, and put in when it does not. */
export function toggledNote(note: string, word: string): string {
  return noteHasWord(note, word) ? removeWordFromNote(note, word) : addWordToNote(note, word)
}
