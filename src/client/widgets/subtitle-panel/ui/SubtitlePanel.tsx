/**
 * The subtitle list — the page's spine, and its only scroller.
 *
 * One row per cue, the playing row kept in view, and a second, independent highlight
 * for keyboard selection: `↑`/`↓` move the selection without moving the audio, and
 * `Enter` plays it. That split matters in a listening session — scanning ahead for the
 * next phrase to work on must not cost you your place in what is playing.
 *
 * The two actions a row owns sit on the active or selected row only: loop it, or keep
 * it with the star. A kept row shows its star all the time, filled, so the list reads
 * as a map of what you have already taken from the episode.
 *
 * The column is shared with the kept sentences; the switch between the two is the page's and
 * sits in this heading in place of a title.
 */
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { visibleCueLines, type Cue, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import { LoopIcon, StarIcon } from '../../../shared/ui/icons.tsx'
import { ListSkeleton } from '../../../shared/ui/Skeleton.tsx'
import type { Translate } from '../../../context.ts'
import { bringIntoView } from '../lib/scroll.ts'

export interface SubtitlePanelProps {
  readonly t: Translate
  /** The column's 「字幕 / 收藏」 switch, which the page owns. */
  readonly switcher: ReactNode
  readonly cues: readonly Cue[]
  /** The subtitles are still being fetched, so an empty list is not yet "no subtitles". */
  readonly loading: boolean
  /** The sentence the audio is inside right now. */
  readonly activeIndex: number
  /** The sentence the keyboard points at; may differ from {@link activeIndex}. */
  readonly selectedIndex: number
  readonly zhMode: SubtitleZhMode
  /** Cue indexes that already carry a note, so the row can show it. */
  readonly notedIndexes: ReadonlySet<number>
  /** Whether the list scrolls itself to the playing sentence. */
  readonly follow: boolean
  readonly onFollow: (on: boolean) => void
  readonly onSelect: (index: number) => void
  readonly onPlay: (index: number) => void
  /** Keeps the sentence, or takes it back when it is already kept. */
  readonly onKeep: (index: number) => void
}

/** The scrolling list of cues. */
export function SubtitlePanel({
  t,
  switcher,
  cues,
  loading,
  activeIndex,
  selectedIndex,
  zhMode,
  notedIndexes,
  follow,
  onFollow,
  onSelect,
  onPlay,
  onKeep,
}: SubtitlePanelProps) {
  const listRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef<HTMLDivElement | null>(null)
  const selectedRef = useRef<HTMLDivElement | null>(null)
  // The row's loop button shows the same state as the control bar's: on for the sentence that is looping.
  const loopingSentence = useMediaPlayer((state) => state.loopMode === 'sentence')

  // Follow playback, but never fight the reader: nothing moves while the active row is
  // already in the middle band, and nothing moves at all once follow is switched off.
  useEffect(() => {
    if (!follow || listRef.current === null || activeRef.current === null) return
    bringIntoView(listRef.current, activeRef.current, true)
  }, [activeIndex, follow])

  // The list appearing (the column expanded, or switched back from the kept sentences) lands on the playing sentence at
  // once, follow or not: it was not following while it was not there, and a list at its top is no place to keep.
  const hasList = cues.length > 0
  useLayoutEffect(() => {
    if (hasList && listRef.current !== null && activeRef.current !== null) bringIntoView(listRef.current, activeRef.current, false)
  }, [hasList])

  // A keyboard move is a deliberate jump, so that one is scrolled to even without follow.
  useEffect(() => {
    if (listRef.current === null || selectedRef.current === null) return
    bringIntoView(listRef.current, selectedRef.current, false)
  }, [selectedIndex])

  return (
    <aside className="dsh-lingualab-transcript">
      <div className="dsh-lingualab-transcript-head">
        {switcher}
        <span className="dsh-lingualab-spacer" />
        <label className="dsh-lingualab-switch" title={t('followHint')}>
          <input
            type="checkbox"
            className="dsh-lingualab-visually-hidden"
            checked={follow}
            onChange={(event) => onFollow(event.target.checked)}
            aria-label={t('follow')}
          />
          <span className="dsh-lingualab-switch-track" aria-hidden>
            <span className="dsh-lingualab-switch-knob" />
          </span>
          {/* A narrow column shows the short word; the long one stays as the input's name. */}
          <span className="dsh-lingualab-label-long">{t('follow')}</span>
          <span className="dsh-lingualab-label-short">{t('followShort')}</span>
        </label>
      </div>

      {cues.length === 0 && loading ? (
        <ListSkeleton label={`${t('stageLoading')}…`} />
      ) : cues.length === 0 ? (
        <div className="dsh-lingualab-empty">{t('noSubtitles')}</div>
      ) : (
        <div className="dsh-lingualab-list" data-zh={zhMode} ref={listRef}>
          {cues.map((cue, index) => {
            const isActive = index === activeIndex
            const isSelected = index === selectedIndex
            const kept = notedIndexes.has(index)
            const lines = visibleCueLines(cue.text, zhMode, isActive)
            const looping = loopingSentence && isActive
            return (
              <div
                key={`${cue.start}-${index}`}
                ref={isActive ? activeRef : isSelected ? selectedRef : null}
                className={`dsh-lingualab-row${isActive ? ' is-active' : ''}${isSelected && !isActive ? ' is-selected' : ''}`}
                onClick={() => {
                  onSelect(index)
                  onPlay(index)
                }}
              >
                <span className="dsh-lingualab-row-time">{formatClock(cue.start)}</span>
                <span>
                  {lines.map((line, lineIndex) => (
                    <div key={lineIndex} className={line.secondary ? 'dsh-lingualab-row-zh' : 'dsh-lingualab-row-en'}>
                      {line.text}
                    </div>
                  ))}
                </span>
                <span className={`dsh-lingualab-row-actions${kept ? ' is-kept' : ''}`}>
                  <button
                    type="button"
                    className={`dsh-lingualab-icon-btn is-small${looping ? ' is-on' : ''}`}
                    title={t('loopSentence')}
                    aria-pressed={looping}
                    onClick={(event) => {
                      // The row itself plays; the loop button must not also seek, or the
                      // click would land twice and the second one would win.
                      event.stopPropagation()
                      onSelect(index)
                      useMediaPlayer.getState().toggleSentenceLoop(index)
                    }}
                  >
                    <LoopIcon />
                  </button>
                  <button
                    type="button"
                    className={`dsh-lingualab-icon-btn is-small is-star${kept ? ' is-on' : ''}`}
                    title={kept ? t('unkeepHint') : t('keepHint')}
                    aria-pressed={kept}
                    onClick={(event) => {
                      event.stopPropagation()
                      onKeep(index)
                    }}
                  >
                    <StarIcon filled={kept} />
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </aside>
  )
}