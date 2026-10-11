/**
 * Keep something on screen for as long as its way out takes.
 *
 * A panel that is rendered only while it is open disappears the instant it closes, which leaves
 * nothing to animate. `usePresence` splits "open" into the two things a transition needs: `mounted`,
 * which stays true for `ms` after `open` turns false so the element is still there to fade out, and
 * `shown`, which only turns true a couple of frames after the element is mounted so the browser has
 * painted its closed look first and the change to the open look runs as a transition instead of
 * being the first style it ever sees.
 *
 *   const { mounted, shown } = usePresence(open, 240)
 *   return mounted ? <div className={shown ? 'is-open' : ''} /> : null
 *
 * `ms` should match the CSS duration of the way out. Under `prefers-reduced-motion` the page's
 * stylesheet zeroes every transition, so the delay is zeroed here too and nothing lingers.
 */
import { useEffect, useState } from 'react'

/** What a caller renders from. */
export interface Presence {
  /** Render the element: true while open and for `ms` after it closes. */
  readonly mounted: boolean
  /** Give the element its open look: true once it has been painted closed, and false as soon as `open` is. */
  readonly shown: boolean
}

/** Whether the reader asked the system for less motion. False where there is no `matchMedia` to ask. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

/** How long to keep an element mounted on its way out: `ms`, or nothing when motion is reduced. */
export function presenceDelay(ms: number, reducedMotion: boolean): number {
  return reducedMotion ? 0 : Math.max(0, ms)
}

/**
 * @param open - whether the thing is open.
 * @param ms - how long its way out takes, in milliseconds.
 */
export function usePresence(open: boolean, ms: number): Presence {
  const [mounted, setMounted] = useState(open)
  /** True once the closed look has been painted; `shown` is this while open. */
  const [armed, setArmed] = useState(false)

  // Opening mounts at once, during render, so there is no frame where `open` is true and nothing is
  // there (the same way the stage drops a popover when its sentence changes).
  if (open && !mounted) setMounted(true)

  // Two frames: the first lets the closed look commit and paint, the second flips to the open look.
  useEffect(() => {
    if (!open) return
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setArmed(true))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [open])

  // Closing lets go of the element once the way out is over; opening again before then cancels that.
  useEffect(() => {
    if (open || !mounted) return
    const timer = setTimeout(() => {
      setMounted(false)
      setArmed(false)
    }, presenceDelay(ms, prefersReducedMotion()))
    return () => clearTimeout(timer)
  }, [open, mounted, ms])

  return { mounted: mounted || open, shown: open && armed }
}
