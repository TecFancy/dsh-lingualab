/**
 * The request a timing save makes, and the report a successful one hands back.
 *
 * Kept apart from the hook so that both are a pure function of the session and the cue list: the
 * host call is the hook's, the data it needs is this. `target` is the neighbour a step is moving to,
 * or `null` for a plain save.
 */
import {
  timingEdits,
  type Cue,
  type SubtitleTrack,
} from '../../../entities/cue/index.ts'
import type { TimingEdit } from '../../../shared/protocol.ts'
import type { SavedTiming, TimingSession } from '../model/types.ts'

/** What a save writes, and what it reports once the host takes it. */
export interface TimingWrite {
  readonly edits: readonly TimingEdit[]
  readonly saved: SavedTiming
}

/**
 * Build a timing save, or `null` when the session's cue cannot be matched to a subtitle line.
 * @param session - the open sentence.
 * @param cues - the cue list the save is made from.
 * @param english - the English track.
 * @param chinese - the Chinese track, when it is its own file.
 * @param target - the neighbour a step is moving to, or `null`.
 */
export function timingWrite(
  session: TimingSession,
  cues: readonly Cue[],
  english: SubtitleTrack | null,
  chinese: SubtitleTrack | null,
  target: number | null,
): TimingWrite | null {
  const edits = timingEdits(cues, session.index, session.range, english, chinese)
  if (edits === null) return null
  return {
    edits,
    saved: {
      index: session.index,
      cue: session.cue,
      before: session.base,
      after: session.range,
      target,
      pushed: session.pushed.flatMap((neighbour) => {
        const cue = cues[neighbour.index]
        return cue === undefined ? [] : [{ index: neighbour.index, cue, before: neighbour.before, after: neighbour.after }]
      }),
    },
  }
}
