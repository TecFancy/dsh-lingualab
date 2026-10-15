/**
 * What a timing save does to the kept sentences, apart from React.
 *
 * A kept sentence is matched by its whole second, so a start that crosses a second leaves the star behind unless the
 * phrase moves with it. The save says which sentences moved (the one edited, and the neighbours its edge pushed); this
 * says which stored phrases follow them, as plain data the hook then writes.
 */
import { splitCue } from '../../../entities/cue/index.ts'
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
