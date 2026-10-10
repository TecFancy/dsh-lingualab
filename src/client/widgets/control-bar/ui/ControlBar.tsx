/**
 * The transport row at the bottom of the stage.
 *
 * It sits under the sentence rather than in a bar of its own, because "play this
 * sentence again" and "which sentence" are one thought. Only the controls used every
 * minute stay on the row: sentence steps, play, speed, loop-this-sentence, and the
 * Chinese display. Everything that is a setup step rather than a gesture — the A and
 * B marks, how many times an A-B loop repeats — lives in the 「更多」 menu, because a
 * row of thirteen controls was the reason a first-time reader did not know which one
 * to press.
 *
 * The modes are chips, not form controls: a chip says its state by being outlined,
 * which a `<select>` cannot do.
 */
import { useEffect, useRef, useState } from 'react'
import { SPEED_PRESETS, useMediaPlayer } from '../../../features/media-player/index.ts'
import { SUBTITLE_ZH_MODES, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import {
  LoopIcon,
  MoreIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  StarIcon,
} from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'

/** Repeat counts offered while an A-B loop is on; `0` means until stopped. */
const REPEAT_CHOICES: readonly number[] = [0, 1, 2, 3, 5]

/** The keys the page listens for, with the dictionary key that says what each does. */
const SHORTCUTS: readonly (readonly [string, string])[] = [
  ['Space', 'keyPlay'],
  ['← →', 'keySentence'],
  ['↑ ↓  Enter', 'keyBrowse'],
  ['L', 'keyLoop'],
  ['S', 'keyKeep'],
  ['C', 'keyChinese'],
  ['[  ]', 'keySpeed'],
  ['A  B', 'keyMarks'],
]

/** Labels for the four Chinese display modes, in the order they are offered. */
const ZH_MODE_KEYS: Readonly<Record<SubtitleZhMode, string>> = {
  always: 'zhAlways',
  dim: 'zhDim',
  'active-only': 'zhActiveOnly',
  hidden: 'zhHidden',
}

export interface ControlBarProps {
  readonly t: Translate
  readonly zhMode: SubtitleZhMode
  readonly onZhMode: (mode: SubtitleZhMode) => void
  /** Whether the sentence playing now is already kept. */
  readonly kept: boolean
  /** Keeps or un-keeps the sentence playing now; the page decides what that touches. */
  readonly onToggleKeep: () => void
  readonly disabled?: boolean
}

/** The row under the sentence. */
export function ControlBar({ t, zhMode, onZhMode, kept, onToggleKeep, disabled = false }: ControlBarProps) {
  const isPlaying = useMediaPlayer((state) => state.isPlaying)
  const currentTime = useMediaPlayer((state) => state.currentTime)
  const speedIndex = useMediaPlayer((state) => state.speedIndex)
  const loopMode = useMediaPlayer((state) => state.loopMode)
  const repeats = useMediaPlayer((state) => state.repeats)
  const pointA = useMediaPlayer((state) => state.pointA)
  const pointB = useMediaPlayer((state) => state.pointB)
  const cues = useMediaPlayer((state) => state.cues)
  const activeIndex = useMediaPlayer((state) => state.activeIndex)

  const [menu, setMenu] = useState(false)
  const holder = useRef<HTMLSpanElement>(null)
  const store = useMediaPlayer.getState
  const cue = cues[activeIndex]
  const start = cue?.start ?? 0
  const end = cue?.end ?? 0
  const span = Math.max(0.001, end - start)
  const within = Math.min(1, Math.max(0, (currentTime - start) / span))

  // A menu that stays open after you click elsewhere is a menu you have to close twice.
  useEffect(() => {
    if (!menu) return
    const onDown = (event: MouseEvent): void => {
      if (holder.current !== null && !holder.current.contains(event.target as Node)) setMenu(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [menu])

  const abOn = pointA !== null || pointB !== null

  return (
    <div className="dsh-lingualab-transport">
      <button
        type="button"
        className="dsh-lingualab-bar-btn"
        onClick={() => store().stepCue(-1)}
        disabled={disabled}
        title={t('prevCue')}
      >
        <PrevIcon />
      </button>
      <button
        type="button"
        className="dsh-lingualab-play"
        onClick={() => store().toggle()}
        disabled={disabled}
        title={isPlaying ? t('pause') : t('play')}
      >
        {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
      </button>
      <button
        type="button"
        className="dsh-lingualab-bar-btn"
        onClick={() => store().stepCue(1)}
        disabled={disabled}
        title={t('nextCue')}
      >
        <NextIcon />
      </button>

      <span className="dsh-lingualab-time">
        {formatClock(currentTime)} / {formatClock(end)}
      </span>
      {/* Sentence progress: read-only on purpose. Dragging inside one sentence is a
          different gesture from seeking the episode, and shipping the wrong one is
          worse than shipping none. */}
      <span className="dsh-lingualab-progress" title={`${formatClock(start)} – ${formatClock(end)}`}>
        <span className="dsh-lingualab-progress-fill" style={{ width: `${String(within * 100)}%` }} />
      </span>

      <span className="dsh-lingualab-spacer" />

      <button
        type="button"
        className="dsh-lingualab-bar-btn"
        onClick={() => store().nextSpeedWrapping()}
        disabled={disabled}
        title={t('speed')}
      >
        {SPEED_PRESETS[speedIndex] ?? 1}×
      </button>

      <button
        type="button"
        className={`dsh-lingualab-bar-btn${loopMode === 'sentence' ? ' is-on' : ''}`}
        onClick={() => (loopMode === 'sentence' ? store().setLoopMode('none') : store().loopSentence())}
        disabled={disabled}
        title={t('loopSentence')}
      >
        <LoopIcon /> {t('loopShort')}
      </button>

      <button
        type="button"
        className="dsh-lingualab-bar-btn"
        onClick={() => onZhMode(nextZhMode(zhMode))}
        title={t('zhMode')}
      >
        {t(ZH_MODE_KEYS[zhMode])}
      </button>

      <button
        type="button"
        className={`dsh-lingualab-bar-btn is-star${kept ? ' is-on' : ''}`}
        onClick={onToggleKeep}
        disabled={disabled}
        title={kept ? t('unkeepHint') : t('keepHint')}
        aria-pressed={kept}
      >
        <StarIcon filled={kept} /> {kept ? t('kept') : t('keep')}
      </button>

      <span className="dsh-lingualab-menu-holder" ref={holder}>
        <button
          type="button"
          className={`dsh-lingualab-bar-btn${menu || abOn ? ' is-on' : ''}`}
          onClick={() => setMenu(!menu)}
          disabled={disabled}
          title={t('more')}
          aria-expanded={menu}
        >
          <MoreIcon />
        </button>
        {menu ? (
          <div className="dsh-lingualab-menu" role="menu">
            <div className="dsh-lingualab-menu-title">{t('loopAb')}</div>
            <div className="dsh-lingualab-actions">
              <button
                type="button"
                className={`dsh-lingualab-btn${pointA !== null ? ' is-on' : ''}`}
                onClick={() => (pointA === null ? store().setPoint('a') : store().clearAB())}
                title={pointA === null ? t('setA') : t('clearAb')}
              >
                {pointA === null ? t('setA') : `A ${formatClock(pointA)}`}
              </button>
              <button
                type="button"
                className={`dsh-lingualab-btn${pointB !== null ? ' is-on' : ''}`}
                onClick={() => store().setPoint('b')}
                disabled={pointA === null}
                title={t('setB')}
              >
                {pointB === null ? t('setB') : `B ${formatClock(pointB)}`}
              </button>
              {abOn ? (
                <button type="button" className="dsh-lingualab-btn" onClick={() => store().clearAB()}>
                  {t('clearAb')}
                </button>
              ) : null}
            </div>
            {loopMode === 'ab' ? (
              <label className="dsh-lingualab-menu-row">
                <span>{t('repeatTimes')}</span>
                <select
                  className="dsh-lingualab-bar-btn"
                  value={String(repeats)}
                  onChange={(event) => store().setRepeats(Number(event.target.value))}
                >
                  {REPEAT_CHOICES.map((count) => (
                    <option key={count} value={count}>
                      {count === 0 ? '∞' : `×${count}`}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <dl className="dsh-lingualab-menu-keys">
              {SHORTCUTS.map(([keys, label]) => (
                <div key={keys} style={{ display: 'contents' }}>
                  <dt>{keys}</dt>
                  <dd>{t(label)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </span>
    </div>
  )
}

/** The next Chinese mode in the cycle: the chip shows one name and means "the next one". */
export function nextZhMode(mode: SubtitleZhMode): SubtitleZhMode {
  const index = SUBTITLE_ZH_MODES.indexOf(mode)
  return SUBTITLE_ZH_MODES[(index + 1) % SUBTITLE_ZH_MODES.length] ?? 'dim'
}
