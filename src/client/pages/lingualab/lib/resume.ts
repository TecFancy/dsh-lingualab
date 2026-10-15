/**
 * The rules for where listening resumes and when its place is written down, apart from React.
 *
 * Two things about a position are easy to get wrong and have been: a seek that arrives before the new source can take
 * it is lost, and a bookmark written at the wrong moment overwrites the very place it was about to restore. The
 * hook in `useResume.ts` holds the timing (effects, refs, the audio element); what it decides is here, as plain
 * functions of the values it has, so each rule is tested without an element or a store.
 */
import { splitCue, type Cue } from '../../../entities/cue/index.ts'
import { keptSentenceKey } from '../../../shared/notes-format.ts'
import type { EpisodeMedia } from '../../../shared/protocol.ts'
import type { View } from './panel.ts'

/**
 * Where a kept sentence starts in the cue list on screen.
 *
 * `notes.md` holds whole seconds, so a sentence that starts at 135.08 s reads back as 135,
 * which can sit in the gap before it: seeking there made the previous sentence the active
 * one, and that was the sentence the replay looped. The cue with the same second and the
 * same English is the one that was kept, by the rule the star already uses.
 */
export function keptCueStart(cues: readonly Cue[], at: number, text: string): number {
  const key = keptSentenceKey({ at, text })
  return cues.find((cue) => keptSentenceKey({ at: cue.start, text: splitCue(cue).english }) === key)?.start ?? at
}

/**
 * Whether the cue list is settled enough for a resume to seek: it has cues, or what is open has no subtitles at all
 * (and will never have any). While a subtitled episode's list is still empty it is still being read, and the reset
 * that follows its arrival would zero a position set before it.
 */
export function cuesAreReady(cueCount: number, media: EpisodeMedia | null): boolean {
  const subtitled = media !== null && (media.subtitleEnUrl !== null || media.subtitleZhUrl !== null)
  return cueCount > 0 || (media !== null && !subtitled)
}

/** Where a resume that is ready puts the player. */
export interface ResumeSeek {
  readonly at: number
  /** Loop the sentence there once it has been seeked to, and play it: a replayed note, not a resume. */
  readonly loop: boolean
}

/**
 * What a resume does once the source knows its length.
 *
 * `text` is the English of a replayed note, so the seek lands on its cue rather than on its whole second. A bookmark
 * past the end (the file was replaced by a shorter one, or the segment was listened to the end) starts over: `null`,
 * and the player stays at the top. A length that is not known yet (`NaN`) does not block the seek.
 */
export function resumeSeek(at: number, loop: boolean, text: string | null, cues: readonly Cue[], duration: number): ResumeSeek | null {
  const target = text === null ? at : keptCueStart(cues, at, text)
  if (Number.isFinite(duration) && target >= duration - 1) return null
  return { at: target, loop }
}

/**
 * Whether the listening position may be written down now.
 *
 * Not while a resume is still waiting to be applied: the player sits at the start until it is, and writing that
 * would overwrite the very bookmark it is about to use. Not during a review either, which jumps between kept
 * sentences and would drag 「继续」 to wherever the review last was.
 */
export function canBookmark(resumePending: boolean, reviewing: boolean): boolean {
  return !resumePending && !reviewing
}

/**
 * Whether the end of the audio may be written down as finished: the practice view is showing, the length is known,
 * and a review is not the one moving the position.
 */
export function canMarkFinished(view: View, duration: number, reviewing: boolean): boolean {
  return view === 'practice' && duration > 0 && !reviewing
}
