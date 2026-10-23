/**
 * What a timing save does to the kept sentences, apart from React.
 *
 * A kept sentence is matched by its whole second, so a start that crosses a second leaves the star behind unless the
 * phrase moves with it. The save says which sentences moved (the one edited, and the neighbours its edge pushed); this
 * says which stored phrases follow them, as plain data the hook then writes.
 */
import { originalRange, splitCue, type Cue } from '../../../entities/cue/index.ts'
import { sameKeptSentence } from '../../../shared/notes-format.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'
import type { SavedTiming } from '../../../widgets/timing-editor/index.ts'

/** A stored phrase that follows its sentence to a new second. */
export interface KeptMove {
  /** Its place in the stored list. */
  readonly index: number
  /** The second it moves to, as the file now holds the start. */
  readonly at: number
}

/**
 * The stored phrases to move after a save.
 *
 * Only a sentence whose whole second changed needs it: a nudge inside a second leaves the match as it was. The phrase
 * is found by the sentence as it was before the save (whole second, English, segment), so a sentence that is not kept
 * moves nothing. All of them are found in the list as it stands, which is how the page used to write them one by one.
 */
export function keptMoves(saved: SavedTiming, phrases: readonly NotePhrase[], segmentId: string | null): KeptMove[] {
  const moves: KeptMove[] = []
  for (const moved of [saved, ...saved.pushed]) {
    const before = moved.before.start / 1000
    const after = moved.after.start / 1000
    if (Math.floor(before) === Math.floor(after)) continue
    const key = { at: before, text: splitCue(moved.cue).english, segment: segmentId ?? undefined }
    const index = phrases.findIndex((phrase) => sameKeptSentence(phrase, key))
    if (index >= 0) moves.push({ index, at: after })
  }
  return moves
}

/**
 * Where the playhead goes after a save, in seconds.
 *
 * A plain save stays on the sentence it wrote. A step save goes to the neighbour it is about to open:
 * that sentence's start in the list the save was made from, unless this save pushed it, in which case
 * the file now holds the pushed start. Only a pushed end rewrites the next sentence's start; a pushed
 * previous sentence keeps its own.
 * @param saved - what the save reported, including the neighbour a step is going to.
 * @param cues - the cue list the save was made from, before the reload.
 */
export function resumeAfterSave(saved: SavedTiming, cues: readonly Cue[]): number {
  if (saved.target === null) return saved.after.start / 1000
  const cue = cues[saved.target]
  if (cue === undefined) return saved.after.start / 1000
  const pushed = saved.pushed.find((move) => move.index === saved.target)
  return (pushed?.after.start ?? originalRange(cue).start) / 1000
}

/**
 * Why a file episode's subtitles cannot be saved from the timing strip, or `null` when they can.
 *
 * The page only writes files inside the library: a folder episode always is, a file episode only when it is a loose
 * file at the library root. The host checks the same thing again.
 * @param kind - the open episode's kind, or `null` when none is open.
 * @param inLibraryRoot - whether the open episode is one of the loose files the library lists.
 * @param outside - the message for an episode outside the library.
 */
export function timingBlockedReason(kind: 'folder' | 'file' | null, inLibraryRoot: boolean, outside: string): string | null {
  if (kind === null || kind === 'folder') return null
  return inLibraryRoot ? null : outside
}
