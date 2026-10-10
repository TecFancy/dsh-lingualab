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
 * A drag is previewed locally and committed once on release. A seek per pointer move
 * would raise the player's seek gate dozens of times a second and make the audio stutter
 * through every sentence the pointer crossed.
 *
 * It is not a tab stop. The arrow keys already mean "previous / next sentence" on the
 * page, and a focused slider would claim them for itself.
 */
import { memo, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { findActiveCue, splitCue, type Cue } from '../../../entities/cue/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import type { Translate } from '../../../context.ts'

/** The SVG's own coordinate width; the element is stretched over the bar. */
const TICK_SPACE = 1000

/** Half the tooltip's width, so it stays inside the bar near either end. */
const TIP_HALF = 110

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

/** The scrubber with its two clocks. */
export function Scrubber({ t, disabled = false }: ScrubberProps) {
  const currentTime = useMediaPlayer((state) => state.currentTime)
  const duration = useMediaPlayer((state) => state.duration)
  const cues = useMediaPlayer((state) => state.cues)
  const track = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ readonly fraction: number; readonly x: number; readonly width: number } | null>(null)
  const [drag, setDrag] = useState<number | null>(null)

  const usable = !disabled && duration > 0

  /** Where along the bar a pointer is, as 0..1, with the bar's pixel width for the tooltip. */
  const measure = (event: ReactPointerEvent<HTMLDivElement>): { fraction: number; x: number; width: number } => {
    const rect = (track.current ?? event.currentTarget).getBoundingClientRect()
    const x = Math.min(rect.width, Math.max(0, event.clientX - rect.left))
    return { fraction: rect.width > 0 ? x / rect.width : 0, x, width: rect.width }
  }

  const live = drag ?? (duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0)
  const pointed = hover === null ? null : hover.fraction * duration
  const cueIndex = pointed === null ? -1 : findActiveCue(cues, pointed)
  const cue = cueIndex >= 0 ? cues[cueIndex] : undefined
  const preview = cue === undefined ? '' : splitCue(cue).english

  return (
    <div className={`dsh-lingualab-scrub${usable ? '' : ' is-disabled'}`}>
      <span className="dsh-lingualab-time">{formatClock(drag === null ? currentTime : drag * duration)}</span>
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
        onPointerMove={(event) => {
          if (!usable) return
          const next = measure(event)
          setHover(next)
          if (drag !== null) setDrag(next.fraction)
        }}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(event) => {
          if (!usable || event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          const next = measure(event)
          setHover(next)
          setDrag(next.fraction)
        }}
        onPointerUp={(event) => {
          if (drag === null) return
          const next = measure(event)
          setDrag(null)
          // Never exactly the end: a seek to the last frame fires `ended` before it plays.
          useMediaPlayer.getState().seek(Math.min(next.fraction * duration, Math.max(0, duration - 0.05)))
        }}
        onPointerCancel={() => setDrag(null)}
      >
        <div className="dsh-lingualab-scrub-rail">
          <Ticks cues={cues} duration={duration} />
          <div className="dsh-lingualab-scrub-fill" style={{ width: `${String(live * 100)}%` }} />
          {hover !== null ? (
            <div className="dsh-lingualab-scrub-ghost" style={{ left: `${String(hover.fraction * 100)}%` }} />
          ) : null}
        </div>
        <div className="dsh-lingualab-scrub-knob" style={{ left: `${String(live * 100)}%` }} />
        {hover !== null && pointed !== null ? (
          <div
            className="dsh-lingualab-scrub-tip"
            style={{ left: `${String(Math.min(Math.max(hover.x, TIP_HALF), Math.max(TIP_HALF, hover.width - TIP_HALF)))}px` }}
          >
            <b>{formatClock(pointed)}</b>
            {preview.length > 0 ? <span>{preview}</span> : null}
          </div>
        ) : null}
      </div>
      <span className="dsh-lingualab-time">{formatClock(duration)}</span>
    </div>
  )
}
