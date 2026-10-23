/**
 * The timing panel's status: what the loop is doing, or that the move just saved.
 *
 * The `saved` note is the panel's own, shown for a moment after a step wrote the file before it
 * opened the neighbour; it replaces the loop status rather than sitting beside it, so the header
 * keeps one place to look. The classes are the status line's, so no new style is needed.
 */
import type { Translate } from '../../../context.ts'

export interface TimingStatusProps {
  readonly t: Translate
  readonly playing: boolean
  /** Whether the last move saved, which the header says for a moment. */
  readonly saved: boolean
}

/** The header's status line. */
export function TimingStatus({ t, playing, saved }: TimingStatusProps) {
  const paused = !saved && !playing
  return (
    <span className={`dsh-lingualab-timing-status${paused ? ' is-paused' : ''}`} role="status">
      {saved ? t('saved') : playing ? t('timingLooping') : t('timingPaused')}
    </span>
  )
}
