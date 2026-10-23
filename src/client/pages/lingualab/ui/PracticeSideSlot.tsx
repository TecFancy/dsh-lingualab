/**
 * The right column's place in the row: its width, its way in and out, and the scrim of the drawer it becomes on a narrow
 * row.
 *
 * The column used to be mounted and unmounted with the collapse, which made the swap one frame. The slot stays on the
 * page for `SIDE_MS` after the column closes, carries the current list for the whole way out, and only then lets go;
 * opening mounts it at once, closed, and gives it its open look two frames later, so the browser has a closed frame to
 * transition from. The list inside keeps its full width while the slot shrinks, which is what keeps the subtitle rows
 * from rewrapping on every frame; the slot clips the part that hangs past its right edge, so the column reads as sliding
 * out rather than narrowing.
 *
 * The slot also owns the scrim on a narrow row, so the scrim and the drawer leave on the same timer. Both the timer and
 * the stylesheet have to agree on how long that is.
 */
import type { ReactNode } from 'react'
import { usePresence } from '../../../shared/lib/usePresence.ts'

/** How long the column takes to open or close; the stylesheet's `.2s` is the same. Change both together. */
export const SIDE_MS = 200

/** What the slot draws and what it holds. */
export interface PracticeSideSlotProps {
  /** The column is expanded. */
  readonly open: boolean
  /** The row is narrow, so the column is a drawer placed from its right edge; true even while it leaves. */
  readonly floating: boolean
  /** The scrim's name for a screen reader: the same word the top bar's toggle uses. */
  readonly scrimLabel: string
  /** A press on the scrim puts the column away. */
  readonly onScrim: () => void
  readonly children: ReactNode
}

/** The slot at one point of its presence, with no timer of its own, so its looks can be read and tested. */
export interface PracticeSideSlotFrameProps {
  /** The column is on the page, open or leaving. */
  readonly mounted: boolean
  /** The column has its open look; false while it fades in and from the frame it starts to leave. */
  readonly shown: boolean
  /** The row is narrow, so the column is a drawer placed from its right edge; true even while it leaves. */
  readonly floating: boolean
  /** The scrim's name for a screen reader: the same word the top bar's toggle uses. */
  readonly scrimLabel: string
  /** A press on the scrim puts the column away. */
  readonly onScrim: () => void
  readonly children: ReactNode
}

/** The slot as the presence says to draw it: nothing, the closed look, or the open look. */
export function PracticeSideSlotFrame({
  mounted,
  shown,
  floating,
  scrimLabel,
  onScrim,
  children,
}: PracticeSideSlotFrameProps) {
  if (!mounted) return null
  return (
    <>
      {floating ? (
        <button
          type="button"
          className={`dsh-lingualab-side-scrim${shown ? ' is-open' : ''}`}
          aria-label={scrimLabel}
          aria-hidden={!shown}
          tabIndex={shown ? 0 : -1}
          onClick={onScrim}
        />
      ) : null}
      <div
        className={`dsh-lingualab-side-slot${shown ? ' is-open' : ''}${floating ? ' is-floating' : ''}`}
        aria-hidden={!shown}
      >
        {children}
      </div>
    </>
  )
}

/** The right column in the row, kept for its way out. */
export function PracticeSideSlot({ open, ...rest }: PracticeSideSlotProps) {
  const { mounted, shown } = usePresence(open, SIDE_MS)
  return <PracticeSideSlotFrame mounted={mounted} shown={shown} {...rest} />
}
