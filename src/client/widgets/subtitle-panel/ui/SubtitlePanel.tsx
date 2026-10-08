/**
 * The subtitle list — the page's spine, and its only scroller.
 *
 * One row per cue, the playing row kept in view, and a second, independent highlight
 * for keyboard selection: `↑`/`↓` move the selection without moving the audio, and
 * `Enter` plays it. That split matters in a listening session — scanning ahead for the
 * next phrase to work on must not cost you your place in what is playing.
 *
 * The two actions a row owns sit on the active or selected row only: loop it, or note
 * it. They used to appear on hover, which put the control you needed out of sight
 * exactly when the pointer was somewhere else.
 */
import { useEffect, useRef } from 'react'
import { visibleCueLines, type Cue, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import { LoopIcon, NoteIcon } from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'

export interface SubtitlePanelProps {
  readonly t: Translate
  readonly cues: readonly Cue[]
  /** The sentence the audio is inside right now. */
  readonly activeIndex: number
  /** The sentence the keyboard points at; may differ from {@link activeIndex}. */
  readonly selectedIndex: number
  readonly zhMode: SubtitleZhMode
  /** Cue indexes that already carry a note, so the row can show it. */
  readonly notedIndexes: ReadonlySet<number>
  readonly onSelect: (index: number) => void
  readonly onPlay: (index: number) => void
  readonly onRecord: (index: number) => void
}

/** The scrolling list of cues. */
export function SubtitlePanel({
  t,
  cues,
  activeIndex,
  selectedIndex,
  zhMode,
  notedIndexes,
  onSelect,
  onPlay,
  onRecord,
}: SubtitlePanelProps) {
  const activeRef = useRef<HTMLDivElement | null>(null)
  const selectedRef = useRef<HTMLDivElement | null>(null)

  // Follow playback, but never fight the reader: `block: 'nearest'` leaves the list
  // alone while the active row is already on screen.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  // A keyboard move is a deliberate jump, so that one does get scrolled to.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (cues.length === 0) {
    return <div className="dsh-lingualab-empty">{t('noSubtitles')}</div>
  }

  return (
    <div className="dsh-lingualab-list">
      {cues.map((cue, index) => {
        const isActive = index === activeIndex
        const isSelected = index === selectedIndex
        const lines = visibleCueLines(cue.text, zhMode, isActive)
        return (
          <div
            key={`${cue.start}-${index}`}
            ref={isActive ? activeRef : isSelected ? selectedRef : null}
            className={`dsh-lingualab-row${isActive ? ' is-active' : ''}`}
            style={
              isSelected && !isActive
                ? { background: 'var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,0.1))' }
                : undefined
            }
            onClick={() => {
              onSelect(index)
              onPlay(index)
            }}
          >
            <span className="dsh-lingualab-row-time">
              {formatClock(cue.start)}
              {notedIndexes.has(index) ? (
                <span className="dsh-lingualab-row-flag" title={t('notesMarked')}>
                  {' ●'}
                </span>
              ) : null}
            </span>
            <span>
              {lines.map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  className={line.secondary ? 'dsh-lingualab-row-zh' : 'dsh-lingualab-row-en'}
                >
                  {line.text}
                </div>
              ))}
            </span>
            <span className="dsh-lingualab-row-actions">
              <button
                type="button"
                className="dsh-lingualab-icon-btn"
                title={t('loopSentence')}
                onClick={(event) => {
                  // The row itself plays; the loop button must not also seek, or the
                  // click would land twice and the second one would win.
                  event.stopPropagation()
                  onSelect(index)
                  useMediaPlayer.getState().loopSentence(index)
                }}
              >
                <LoopIcon />
              </button>
              <button
                type="button"
                className="dsh-lingualab-icon-btn"
                title={t('recordHint')}
                onClick={(event) => {
                  event.stopPropagation()
                  onRecord(index)
                }}
              >
                <NoteIcon />
              </button>
            </span>
          </div>
        )
      })}
    </div>
  )
}
