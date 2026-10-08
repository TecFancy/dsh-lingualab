/**
 * The subtitle list — the page's spine.
 *
 * One row per cue, the active row kept in view, and a loop button on every row so
 * "play this sentence again" costs one click instead of two A/B keystrokes. The
 * Chinese line is rendered according to the current display mode rather than
 * hidden by hand, so the four modes stay in {@link visibleCueLines} where they
 * are tested.
 */
import { useEffect, useRef } from 'react'
import { visibleCueLines, type Cue, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import type { Translate } from '../../../context.ts'

export interface SubtitlePanelProps {
  readonly t: Translate
  readonly cues: readonly Cue[]
  readonly activeIndex: number
  readonly zhMode: SubtitleZhMode
}

/** The scrolling list of cues. */
export function SubtitlePanel({ t, cues, activeIndex, zhMode }: SubtitlePanelProps) {
  const activeRef = useRef<HTMLDivElement | null>(null)

  // Follow playback, but never fight the reader: `block: 'nearest'` leaves the
  // list alone while the active row is already on screen.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (cues.length === 0) {
    return <div className="dsh-lingualab-empty">{t('noSubtitles')}</div>
  }

  return (
    <div className="dsh-lingualab-cues">
      {cues.map((cue, index) => {
        const isActive = index === activeIndex
        const lines = visibleCueLines(cue.text, zhMode, isActive)
        return (
          <div
            key={`${cue.start}-${index}`}
            ref={isActive ? activeRef : null}
            className={`dsh-lingualab-cue${isActive ? ' is-active' : ''}`}
            onClick={() => useMediaPlayer.getState().seek(cue.start)}
          >
            <span className="dsh-lingualab-cue-time">{formatClock(cue.start)}</span>
            <span>
              {lines.map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  className={line.secondary ? 'dsh-lingualab-cue-zh' : 'dsh-lingualab-cue-en'}
                >
                  {line.text}
                </div>
              ))}
            </span>
            <button
              type="button"
              className="dsh-lingualab-cue-loop"
              title={t('loopSentence')}
              onClick={(event) => {
                // The row itself seeks; the loop button must not also seek, or the
                // click would land twice and the second one would win.
                event.stopPropagation()
                useMediaPlayer.getState().loopSentence(index)
              }}
            >
              🔂
            </button>
          </div>
        )
      })}
    </div>
  )
}
