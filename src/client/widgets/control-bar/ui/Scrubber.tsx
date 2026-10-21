/**
 * The whole-episode progress bar: where you are, what is around it, and a way to jump.
 *
 * The previous bar only showed how far into the *sentence* you were, and was read-only on
 * purpose, because dragging inside one sentence is a different gesture from moving
 * through the episode. This one is the other bar: it spans the episode, every sentence
 * start is a hairline on it so the shape of the dialogue is visible, hovering shows the
 * time and the sentence under the pointer without moving anything, and a click or a drag
 * lands on the sentence that contains the point.
 *
 * Holding the thumb and moving away from the bar, up or down, scrubs slower in steps
 * (`lib/fine-scrub.ts`), and while the thumb is held a label above it says the speed, the
 * time, the sentence number and the sentence.
 *
 * A drag is previewed locally and committed once on release. A seek per pointer move
 * would raise the player's seek gate dozens of times a second and make the audio stutter
 * through every sentence the pointer crossed.
 *
 * It is not a tab stop. The arrow keys already mean "previous / next sentence" on the
 * page, and a focused slider would claim them for itself.
 */
import { memo, useMemo, useRef } from 'react'
import type { Cue } from '../../../entities/cue/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import type { Translate } from '../../../context.ts'
import { placeLabel, SCRUB_SPEED_KEYS, type LabelPlacement } from '../lib/fine-scrub.ts'
import { scrubPoint, type ScrubPoint } from '../lib/scrub-point.ts'
import { useScrubGesture } from '../lib/useScrubGesture.ts'

/** The SVG's own coordinate width; the element is stretched over the bar. */
const TICK_SPACE = 1000

export interface ScrubberProps {
  readonly t: Translate
  readonly disabled?: boolean
}

/** Hairlines at every sentence start, drawn as a single path so a long episode stays cheap. */
const Ticks = memo(function Ticks({ cues, duration }: { readonly cues: readonly Cue[]; readonly duration: number }) {
  const path = useMemo(() => {
    if (!(duration > 0)) return ''
    let d = ''
    for (const cue of cues) {
      const x = (Math.min(duration, Math.max(0, cue.start)) / duration) * TICK_SPACE
      d += `M${x.toFixed(1)} 0V6`
    }
    return d
  }, [cues, duration])
  if (path === '') return null
  return (
    <svg className="dsh-lingualab-scrub-ticks" viewBox={`0 0 ${String(TICK_SPACE)} 6`} preserveAspectRatio="none" aria-hidden>
      <path d={path} vectorEffect="non-scaling-stroke" />
    </svg>
  )
})

interface ScrubTipProps {
  readonly t: Translate
  readonly point: ScrubPoint
  readonly place: LabelPlacement
  /** The fine-scrub step while the thumb is held; null for a hover, which shows only the time and the sentence. */
  readonly step: number | null
}

/** The label above the bar: the place under the pointer on a hover, the thumb's place and speed during a drag. */
function ScrubTip({ t, point, place, step }: ScrubTipProps) {
  const clock = <b>{formatClock(point.time)}</b>
  return (
    <div
      className={`dsh-lingualab-scrub-tip${step === null ? '' : ' is-held'}`}
      style={{ left: `${String(place.left)}px`, maxWidth: `${String(place.maxWidth)}px` }}
    >
      {step === null ? (
        clock
      ) : (
        <div className="dsh-lingualab-scrub-tip-head">
          <span className={`dsh-lingualab-scrub-speed${step > 0 ? ' is-slow' : ''}`}>{t(SCRUB_SPEED_KEYS[step] ?? 'scrubFull')}</span>
          {clock}
          {point.index >= 0 ? <i>{t('scrubCue', { n: point.index + 1 })}</i> : null}
        </div>
      )}
      {point.english.length > 0 ? <span>{point.english}</span> : null}
    </div>
  )
}

/** The scrubber with its two clocks. */
export function Scrubber({ t, disabled = false }: ScrubberProps) {
  const currentTime = useMediaPlayer((state) => state.currentTime)
  const duration = useMediaPlayer((state) => state.duration)
  const cues = useMediaPlayer((state) => state.cues)
  const track = useRef<HTMLDivElement>(null)
  const usable = !disabled && duration > 0
  const { hover, drag, geometry, handlers } = useScrubGesture(track, usable, (fraction) => {
    // Never exactly the end: a seek to the last frame fires `ended` before it plays.
    useMediaPlayer.getState().seek(Math.min(fraction * duration, Math.max(0, duration - 0.05)))
  })

  const live = drag?.fraction ?? (duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0)
  // While the thumb is held the label follows the thumb, which a slow step moves slower than the finger.
  const labelAt = drag === null ? hover : drag.fraction
  const tip =
    labelAt === null || geometry === null ? null : (
      <ScrubTip
        t={t}
        point={scrubPoint(cues, duration, labelAt)}
        place={placeLabel({ x: labelAt * geometry.width, ...geometry })}
        step={drag?.step ?? null}
      />
    )

  return (
    <div className={`dsh-lingualab-scrub${usable ? '' : ' is-disabled'}${drag === null ? '' : ' is-held'}`}>
      <span className="dsh-lingualab-time">{formatClock(drag === null ? currentTime : drag.fraction * duration)}</span>
      <div
        ref={track}
        className="dsh-lingualab-scrub-track"
        role="slider"
        aria-label={t('seekBar')}
        aria-valuemin={0}
        aria-valuemax={Math.floor(duration)}
        aria-valuenow={Math.floor(currentTime)}
        aria-valuetext={formatClock(currentTime)}
        aria-disabled={!usable}
        {...handlers}
      >
        <div className="dsh-lingualab-scrub-rail">
          <Ticks cues={cues} duration={duration} />
          <div className="dsh-lingualab-scrub-fill" style={{ width: `${String(live * 100)}%` }} />
          {hover !== null ? (
            <div className="dsh-lingualab-scrub-ghost" style={{ left: `${String(hover * 100)}%` }} />
          ) : null}
        </div>
        <div className="dsh-lingualab-scrub-knob" style={{ left: `${String(live * 100)}%` }} />
        {tip}
      </div>
      <span className="dsh-lingualab-time">{formatClock(duration)}</span>
    </div>
  )
}
