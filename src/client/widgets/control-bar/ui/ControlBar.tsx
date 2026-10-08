/**
 * Transport controls: what a listening session touches most often.
 *
 * Order follows frequency of use, left to right: sentence steps, play, speed,
 * then the loop controls, then the subtitle mode. The A-B pair keeps its own
 * undo (`清掉 A-B`) because setting a wrong B point is the one mistake that
 * silently changes what you hear next.
 */
import { SPEED_PRESETS, useMediaPlayer } from '../../../features/media-player/index.ts'
import { SUBTITLE_ZH_MODES, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import type { Translate } from '../../../context.ts'

/** Repeat counts offered by the loop counter; `0` means until stopped. */
const REPEAT_CHOICES: readonly number[] = [0, 1, 2, 3, 5]

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
  readonly disabled?: boolean
}

/** The row of buttons above the subtitle list. */
export function ControlBar({ t, zhMode, onZhMode, disabled = false }: ControlBarProps) {
  const isPlaying = useMediaPlayer((state) => state.isPlaying)
  const currentTime = useMediaPlayer((state) => state.currentTime)
  const duration = useMediaPlayer((state) => state.duration)
  const speedIndex = useMediaPlayer((state) => state.speedIndex)
  const loopMode = useMediaPlayer((state) => state.loopMode)
  const repeats = useMediaPlayer((state) => state.repeats)
  const pointA = useMediaPlayer((state) => state.pointA)
  const pointB = useMediaPlayer((state) => state.pointB)

  const store = useMediaPlayer.getState

  return (
    <div className="dsh-lingualab-bar">
      <button
        type="button"
        className="dsh-lingualab-btn"
        onClick={() => store().stepCue(-1)}
        disabled={disabled}
        title={t('prevCue')}
      >
        ⏮
      </button>
      <button
        type="button"
        className="dsh-lingualab-btn"
        onClick={() => store().toggle()}
        disabled={disabled}
        style={{ minWidth: 64 }}
      >
        {isPlaying ? `⏸ ${t('pause')}` : `▶ ${t('play')}`}
      </button>
      <button
        type="button"
        className="dsh-lingualab-btn"
        onClick={() => store().stepCue(1)}
        disabled={disabled}
        title={t('nextCue')}
      >
        ⏭
      </button>

      <span className="dsh-lingualab-time">
        {formatClock(currentTime)} / {formatClock(duration)}
      </span>

      <span className="dsh-lingualab-spacer" />

      <button
        type="button"
        className="dsh-lingualab-btn"
        onClick={() => store().cycleSpeed(-1)}
        disabled={disabled}
        title={t('speed')}
      >
        −
      </button>
      <span className="dsh-lingualab-time">{SPEED_PRESETS[speedIndex] ?? 1}×</span>
      <button
        type="button"
        className="dsh-lingualab-btn"
        onClick={() => store().cycleSpeed(1)}
        disabled={disabled}
        title={t('speed')}
      >
        +
      </button>

      <button
        type="button"
        className={`dsh-lingualab-btn${loopMode === 'sentence' ? ' is-on' : ''}`}
        onClick={() => (loopMode === 'sentence' ? store().setLoopMode('none') : store().loopSentence())}
        disabled={disabled}
      >
        🔂 {t('loopSentence')}
      </button>
      <button
        type="button"
        className="dsh-lingualab-btn"
        onClick={() => store().setPoint('a')}
        disabled={disabled}
        title={t('setA')}
      >
        A
      </button>
      <button
        type="button"
        className="dsh-lingualab-btn"
        onClick={() => store().setPoint('b')}
        disabled={disabled}
        title={t('setB')}
      >
        B
      </button>
      {pointA !== null || pointB !== null ? (
        <>
          <span className="dsh-lingualab-time">
            {pointA === null ? '–' : formatClock(pointA)}–{pointB === null ? '–' : formatClock(pointB)}
          </span>
          <button type="button" className="dsh-lingualab-btn" onClick={() => store().clearAB()} disabled={disabled}>
            ✕
          </button>
        </>
      ) : null}

      <select
        className="dsh-lingualab-select"
        value={String(repeats)}
        onChange={(event) => store().setRepeats(Number(event.target.value))}
        title={t('loopAb')}
        disabled={disabled}
      >
        {REPEAT_CHOICES.map((count) => (
          <option key={count} value={count}>
            {count === 0 ? '∞' : `×${count}`}
          </option>
        ))}
      </select>

      <select
        className="dsh-lingualab-select"
        value={zhMode}
        onChange={(event) => onZhMode(event.target.value as SubtitleZhMode)}
        title={t('zhMode')}
      >
        {SUBTITLE_ZH_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {t(ZH_MODE_KEYS[mode])}
          </option>
        ))}
      </select>
    </div>
  )
}
