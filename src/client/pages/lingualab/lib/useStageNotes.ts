/**
 * What the page does to the notes on behalf of the sentence on stage: keep it, grade it, put a word in its note.
 *
 * The notes feature stores phrases and knows nothing of cues; the player knows cues and nothing of notes. The page is
 * where they meet, and this is the part of that meeting that is about the sentence being worked on. How a cue and a
 * kept phrase find each other is in `stage-notes.ts`.
 */
import { useCallback, useMemo } from 'react'
import type { Cue } from '../../../entities/cue/index.ts'
import { addWordToNote, type NotesState } from '../../../features/notes/index.ts'
import { withGrade, type GivenGrade } from '../../../shared/notes-format.ts'
import type { StagePhrase } from './panel.ts'
import { notedIndexesOf, phraseOfCue, stagePhraseOf, toggledNote } from './stage-notes.ts'

/** What the notes work reads from the page. */
export interface StageNotesOptions {
  readonly notes: NotesState
  readonly cues: readonly Cue[]
  /** The sentence on stage. */
  readonly activeIndex: number
  readonly segmentId: string | null
  /** A star that is refused (the sentence has work behind it) shows the kept sentences instead. */
  readonly onProtected: () => void
}

/** What the page does with the sentence on stage's notes. */
export interface StageNotes {
  /** The kept phrase of the sentence on stage, with its place in the stored list; `null` when it is not kept. */
  readonly stagePhrase: StagePhrase | null
  /** The cue indexes whose sentence is kept, so the list can mark them. */
  readonly notedIndexes: ReadonlySet<number>
  /**
   * Keep or un-keep one sentence (the one on stage when no index is given); the same star on the row and on the
   * transport.
   *
   * A sentence the reader has already worked on (a note, a grade) is not removed by a star, because a star is a reflex
   * and the work behind it is not. The 「收藏」 column shows it instead, where removing it is a button with an undo.
   */
  readonly keep: (index?: number) => void
  /**
   * Put a picked word or phrase into the note of the sentence on stage, keeping the sentence if it was not; take it
   * out again when the note already holds it.
   */
  readonly toggleWord: (word: string) => void
  /** Grade the kept sentence on stage; a sentence that is not kept has no grade to give. */
  readonly gradeStage: (grade: GivenGrade) => void
}

/** Keep, grade and annotate the sentence on stage. */
export function useStageNotes({ notes, cues, activeIndex, segmentId, onProtected }: StageNotesOptions): StageNotes {
  const stagePhrase = useMemo(
    () => stagePhraseOf(cues, activeIndex, notes.phrases, segmentId),
    [cues, activeIndex, notes.phrases, segmentId],
  )

  // Decided by the same key the toggle uses (whole second plus text), not by asking which cue is playing at a phrase's
  // timestamp: `notes.md` stores whole seconds, and the cue playing at `00:12` can be the one before the one that was kept.
  const notedIndexes = useMemo(() => notedIndexesOf(cues, notes.phrases, segmentId), [notes.phrases, cues, segmentId])

  const keep = useCallback(
    (index?: number): void => {
      const target = cues[index ?? activeIndex]
      if (target === undefined) return
      const outcome = notes.toggle(phraseOfCue(target, segmentId))
      if (outcome === 'protected') onProtected()
    },
    [cues, activeIndex, notes, segmentId, onProtected],
  )

  const toggleWord = useCallback(
    (word: string): void => {
      const cue = cues[activeIndex]
      if (cue === undefined) return
      const existing = stagePhrase?.phrase
      if (stagePhrase !== null && existing !== undefined) {
        notes.update(stagePhrase.index, { note: toggledNote(existing.note, word) })
        return
      }
      notes.add(phraseOfCue(cue, segmentId, addWordToNote('', word)))
    },
    [cues, activeIndex, notes, stagePhrase, segmentId],
  )

  const gradeStage = useCallback(
    (grade: GivenGrade): void => {
      const phrase = stagePhrase?.phrase
      if (stagePhrase === null || phrase === undefined) return
      notes.update(stagePhrase.index, withGrade(phrase, grade))
    },
    [notes, stagePhrase],
  )

  return { stagePhrase, notedIndexes, keep, toggleWord, gradeStage }
}
