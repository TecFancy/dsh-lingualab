/**
 * The transport row at the bottom of the stage.
 *
 * It sits under the sentence rather than in a bar of its own, because "play this
 * sentence again" and "which sentence" are one thought. Order follows frequency:
 * sentence steps, play, then the sentence's own progress, then the modes that change
 * what the next pass sounds like — speed, loop, A-B — and finally the one action that
 * leaves the player alone, `记下`.
 *
 * The modes are chips, not form controls: a chip says its state by being outlined,
 * which a `<select>` cannot do, and the two dropdowns that used to live here were the
 * main reason the row wrapped on a narrow page.
 */
import { SPEED_PRESETS, useMediaPlayer } from '../../../features/media-player/index.ts'
import { SUBTITLE_ZH_MODES, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import { LoopIcon, NextIcon, NoteIcon, PauseIcon, PlayIcon, PrevIcon } from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'

/** Repeat counts offered while an A-B loop is on; `0` means until stopped. */
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
  /** Notes the sentence playing now; the page decides what that opens. */
  readonly onRecord: () => void
  readonly disabled?: boolean
}

/** The row under the sentence. */
export function ControlBar({ t, zhMode, onZhMode, onRecord, disabled = false }: ControlBarProps) {
  const isPlaying = useMediaPlayer((state) => state.isPlaying)
  const currentTime = useMediaPlayer((state) => state.currentTime)
  const speedIndex = useMediaPlayer((state) => state.speedIndex)
  const loopMode = useMediaPlayer((state) => state.loopMode)
  const repeats = useMediaPlayer((state) => state.repeats)
  const pointA = useMediaPlayer((state) => state.pointA)
  const pointB = useMediaPlayer((state) => state.pointB)
  const cues = useMediaPlayer((state) => state.cues)
  const activeIndex = useMediaPlayer((state) => state.activeIndex)

  const store = useMediaPlayer.getState
  const cue = cues[activeIndex]
  const start = cue?.start ?? 0
  const end = cue?.end ?? 0
  const span = Math.max(0.001, end - start)
  const within = Math.min(1, Math.max(0, (currentTime - start) / span))

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

      <button
        type="button"
        className="dsh-lingualab-bar-btn"
        onClick={() => store().cycleSpeed(1)}
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
        className={`dsh-lingualab-bar-btn${pointA !== null ? ' is-on' : ''}`}
        onClick={() => (pointA === null ? store().setPoint('a') : store().clearAB())}
        disabled={disabled}
        title={pointA === null ? t('setA') : t('clearAb')}
      >
        A
      </button>
      <button
        type="button"
        className={`dsh-lingualab-bar-btn${pointB !== null ? ' is-on' : ''}`}
        onClick={() => store().setPoint('b')}
        disabled={disabled}
        title={t('setB')}
      >
        B
      </button>
      {pointA !== null || pointB !== null ? (
        <span className="dsh-lingualab-time" title={t('loopAb')}>
          {pointA === null ? '–' : formatClock(pointA)}–{pointB === null ? '–' : formatClock(pointB)}
        </span>
      ) : null}
      {loopMode === 'ab' ? (
        <select
          className="dsh-lingualab-bar-btn"
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
      ) : null}

      <span className="dsh-lingualab-spacer" />

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
        className="dsh-lingualab-bar-btn"
        onClick={onRecord}
        disabled={disabled}
        title={t('recordHint')}
      >
        <NoteIcon /> {t('recordThis')}
      </button>
    </div>
  )
}

/** The next Chinese mode in the cycle: the chip shows one name and means "the next one". */
export function nextZhMode(mode: SubtitleZhMode): SubtitleZhMode {
  const index = SUBTITLE_ZH_MODES.indexOf(mode)
  return SUBTITLE_ZH_MODES[(index + 1) % SUBTITLE_ZH_MODES.length] ?? 'dim'
}
