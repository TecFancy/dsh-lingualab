/**
 * The timing strip's types: what the page hands the editor, what a save reports, and the open session.
 *
 * In their own file so that `useTimingEditor.ts` holds the hook alone.
 */
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { Cue, PushedNeighbour, RetimeEdge, RetimeLimits, RetimeRange } from '../../../entities/cue/index.ts'
import type { SubtitleTracks } from '../../../features/library/index.ts'

/** One cue a save moved. */
export interface MovedCue {
  /** Its place in the cue list the save was made from. */
  readonly index: number
  readonly cue: Cue
  readonly before: RetimeRange
  readonly after: RetimeRange
}

/**
 * What the page learns after a save: the sentence, the neighbours it pushed, and the neighbour a
 * step should open once the new cue list arrives.
 */
export interface SavedTiming extends MovedCue {
  readonly target: number | null
  readonly pushed: readonly MovedCue[]
}

export interface TimingEditorOptions {
  readonly cues: readonly Cue[]
  readonly tracks: SubtitleTracks
  readonly episodeId: string | null
  /** Why this episode's subtitles cannot be saved, or `null` when they can. The strip still opens to listen. */
  readonly blocked: string | null
  readonly onSaved: (saved: SavedTiming) => void
  /** The host says the file changed since it was read: the page reads the subtitles again. */
  readonly onStale: () => void
}

/** The open strip. */
export interface TimingSession {
  readonly index: number
  readonly cue: Cue
  readonly range: RetimeRange
  /** The range the strip opened with, so "changed" and the after-save move are known. */
  readonly base: RetimeRange
  /** Whether there is a sentence before and after this one to step to. */
  readonly canStepPrevious: boolean
  readonly canStepNext: boolean
  readonly focus: RetimeEdge
  readonly limits: RetimeLimits
  readonly lrc: boolean
  /** The neighbours the range pushes as it stands, saved with it. */
  readonly pushed: readonly PushedNeighbour[]
  /**
   * The sentence before this one and the sentence after it, as the file will hold them if the range
   * is saved as it stands: an edge that pushed a neighbour shows the neighbour where it lands. For
   * LRC the previous line ends where this one starts, since a line has no end of its own. `null`
   * where there is no such sentence.
   */
  readonly previous: RetimeRange | null
  readonly next: RetimeRange | null
}

export interface TimingEditor {
  readonly session: TimingSession | null
  readonly saving: boolean
  /** A save is on its way to opening the neighbour: the panel stays up and the keys do nothing. */
  readonly moving: boolean
  /** The last move saved, so the header says `saved` for a moment. */
  readonly savedNotice: boolean
  /** The host's reason for the last refusal. */
  readonly error: string | null
  /** True when the refusal was a stale file, so the strip offers to read it again. */
  readonly stale: boolean
  readonly open: (index: number) => void
  /** Reopen the strip on the sentence before (-1) or after (1), keeping the focused edge. */
  readonly step: (direction: -1 | 1) => void
  readonly close: () => void
  readonly setFocus: (edge: RetimeEdge) => void
  readonly nudge: (edge: RetimeEdge, deltaMs: number) => void
  readonly toPlayhead: (edge: RetimeEdge) => void
  /** Put both edges back where the strip opened with them. */
  readonly reset: () => void
  readonly save: () => void
  readonly reloadStale: () => void
  /** The page's key handler asks here first while the strip is open; true means the key was used. */
  readonly handleKey: (event: ReactKeyboardEvent) => boolean
}
