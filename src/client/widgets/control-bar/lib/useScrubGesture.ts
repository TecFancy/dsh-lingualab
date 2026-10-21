/**
 * The pointer side of the progress bar: hover, press, the fine-scrub drag and the seek on release.
 *
 * The drag lives in a ref as well as in state, so pointer moves that arrive between two renders each build on the last
 * one. Geometry is read on every event (the bar's box and the player card's), because the card moves with the layout.
 */
import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { distanceFromBar, moveScrub, startScrub, type ScrubDrag } from './fine-scrub.ts'

/** The bar and the card around it, in viewport pixels. */
export interface ScrubGeometry {
  readonly width: number
  readonly barLeft: number
  readonly top: number
  readonly bottom: number
  readonly cardLeft: number
  readonly cardWidth: number
}

/** What the bar draws from the gesture. */
export interface ScrubGesture {
  /** The pointer's place along the bar as 0..1, while it is over the bar or held. */
  readonly hover: number | null
  readonly drag: ScrubDrag | null
  readonly geometry: ScrubGeometry | null
  readonly handlers: {
    readonly onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void
    readonly onPointerLeave: () => void
    readonly onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
    readonly onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void
    readonly onPointerCancel: () => void
  }
}

/** The player card the bar sits in; the label stays inside it. */
const CARD = '.dsh-lingualab-deck'

function measure(track: HTMLElement): ScrubGeometry {
  const bar = track.getBoundingClientRect()
  const card = (track.closest(CARD) ?? track).getBoundingClientRect()
  return { width: bar.width, barLeft: bar.left, top: bar.top, bottom: bar.bottom, cardLeft: card.left, cardWidth: card.width }
}

/** Drive the bar. `onSeek` gets the released place as 0..1, once per drag. */
export function useScrubGesture(
  track: RefObject<HTMLDivElement | null>,
  usable: boolean,
  onSeek: (fraction: number) => void,
): ScrubGesture {
  const [hover, setHover] = useState<number | null>(null)
  const [drag, setDragState] = useState<ScrubDrag | null>(null)
  const [geometry, setGeometry] = useState<ScrubGeometry | null>(null)
  const dragRef = useRef<ScrubDrag | null>(null)

  const setDrag = (next: ScrubDrag | null): void => {
    dragRef.current = next
    setDragState(next)
  }
  /** Measure, remember the geometry and the hover point, and say where the pointer is relative to the bar. */
  const read = (event: ReactPointerEvent<HTMLDivElement>): { geo: ScrubGeometry; x: number; distance: number } => {
    const geo = measure(track.current ?? event.currentTarget)
    const x = event.clientX - geo.barLeft
    setGeometry(geo)
    setHover(geo.width > 0 ? Math.min(1, Math.max(0, x / geo.width)) : 0)
    return { geo, x, distance: distanceFromBar(event.clientY, geo.top, geo.bottom) }
  }
  const follow = (event: ReactPointerEvent<HTMLDivElement>): ScrubDrag | null => {
    const held = dragRef.current
    if (held === null) return null
    const { geo, x, distance } = read(event)
    return moveScrub(held, x, distance, geo.width)
  }

  const handlers = {
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!usable) return
      if (dragRef.current === null) read(event)
      else setDrag(follow(event))
    },
    onPointerLeave: () => setHover(null),
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!usable || event.button !== 0) return
      event.currentTarget.setPointerCapture(event.pointerId)
      const { geo, x } = read(event)
      setDrag(startScrub(x, geo.width))
    },
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => {
      const last = follow(event)
      if (last === null) return
      setDrag(null)
      onSeek(last.fraction)
    },
    onPointerCancel: () => setDrag(null),
  }
  return { hover, drag, geometry, handlers }
}
