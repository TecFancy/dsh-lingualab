/**
 * Whether the row the stage and the right column share is too narrow, measured.
 *
 * The layout asks the row, not the window (see `sideFloats` for the 982px). The body is drawn by the practice view, after
 * the page, so the page cannot read it once in an effect and be done: this hook takes a callback ref for the body div,
 * measures that element when it mounts and on every resize of it, and gives the answer back. Before the body appears,
 * and without a `ResizeObserver` (a test, a render to a string), nothing floats.
 *
 * A callback ref rather than a ref object because the body is not in the page's own markup: a ref object read in a layout
 * effect while the home is the view would still be `null` when the practice view later mounts.
 */
import { useLayoutEffect, useState } from 'react'
import { sideFloats } from './side-column.ts'

/** The body's ref and the width it reports. */
export interface SideFloating {
  /** Attach to `.dsh-lingualab-body`; stable, so React does not detach and reattach it on every render. */
  readonly attachBody: (body: HTMLDivElement | null) => void
  /** The row is too narrow to keep an expanded column beside the stage. */
  readonly narrow: boolean
}

/** Measure the row and say whether the column has to float. */
export function useSideFloating(): SideFloating {
  const [body, setBody] = useState<HTMLDivElement | null>(null)
  const [narrow, setNarrow] = useState(false)

  useLayoutEffect(() => {
    // Without a body or a `ResizeObserver` the answer stays what it starts as: the row is wide, nothing floats.
    if (body === null || typeof ResizeObserver === 'undefined') return
    const row: HTMLDivElement = body
    const observer = new ResizeObserver(() => measure())
    function measure(): void {
      setNarrow(sideFloats(row.clientWidth))
    }
    observer.observe(row)
    measure()
    return () => observer.disconnect()
  }, [body])

  return { attachBody: setBody, narrow }
}
