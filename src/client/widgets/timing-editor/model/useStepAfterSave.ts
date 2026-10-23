/**
 * The move a timing save was asked to make, once the save has gone through.
 *
 * A step that has something to save cannot open the neighbour at once: the save is written, the
 * subtitles are read back, and only then does the cue list on screen hold the sentence to open.
 * This hook remembers where the move was going while that happens. It also owns the short `saved`
 * note the header shows after such a move.
 *
 * `moving` stays true from the moment the save starts until the new list arrives, so the page can
 * keep the panel mounted and the editor can keep swallowing the keys. The effect below hands the
 * first list that is not the one the move was saved from to `arrive`; keeping that decision in the
 * callback lets a test drive it without an effect, as the page's hook tests do.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Cue, RetimeEdge } from '../../../entities/cue/index.ts'

/** How long the header says a move saved, after it opens the neighbour. */
export const SAVED_NOTICE_MS = 1500

/** Where a save was asked to move, and the cue list it was saved from. */
interface PendingStep {
  readonly target: number
  readonly focus: RetimeEdge
  readonly count: number
  readonly cues: readonly Cue[]
}

export interface StepAfterSaveOptions {
  /** The cue list on screen: a different one means the saved file has been read back. */
  readonly cues: readonly Cue[]
  /** Open the target sentence, keeping the focused edge. */
  readonly open: (index: number, focus: RetimeEdge) => void
  /** The move is over, either way: the panel may stop showing the save in progress. */
  readonly settle: () => void
}

export interface StepAfterSave {
  /** A save is on its way to a neighbour. */
  readonly moving: boolean
  /** A move just saved: the header says so for {@link SAVED_NOTICE_MS}. */
  readonly savedNotice: boolean
  /** Remember where the save should move to. */
  readonly begin: (target: number, focus: RetimeEdge, savedCues: readonly Cue[]) => void
  /** Give the move up: the save was refused, or the panel is closing. */
  readonly cancel: () => void
  /** Take the new cue list: open the neighbour when it is the same length, otherwise give the move up. */
  readonly arrive: (nextCues: readonly Cue[]) => void
  /** Hide the `saved` note now (the reader changed the range or closed the panel). */
  readonly clearNotice: () => void
}

/** Remember a save's move across the reload that ends the strip's session, and time its note. */
export function useStepAfterSave({ cues, open, settle }: StepAfterSaveOptions): StepAfterSave {
  const pending = useRef<PendingStep | null>(null)
  const [moving, setMoving] = useState(false)
  const [notice, setNotice] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback((): void => {
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
  }, [])

  // A note still on screen when the strip goes away has nothing left to time it.
  useEffect(() => clearTimer, [clearTimer])

  const clearNotice = useCallback((): void => {
    clearTimer()
    setNotice(false)
  }, [clearTimer])

  const begin = useCallback(
    (target: number, focus: RetimeEdge, savedCues: readonly Cue[]): void => {
      pending.current = { target, focus, count: savedCues.length, cues: savedCues }
      setMoving(true)
      clearNotice()
    },
    [clearNotice],
  )

  const cancel = useCallback((): void => {
    pending.current = null
    setMoving(false)
    clearNotice()
  }, [clearNotice])

  const arrive = useCallback(
    (nextCues: readonly Cue[]): void => {
      const move = pending.current
      if (move === null || move.cues === nextCues) return
      pending.current = null
      if (nextCues.length !== move.count || nextCues[move.target] === undefined) {
        setMoving(false)
        settle()
        return
      }
      // Open first, then stop saying the save is moving: even if the two commits are not batched,
      // the next render already holds the target session and the panel does not start to leave.
      open(move.target, move.focus)
      setMoving(false)
      settle()
      setNotice(true)
      clearTimer()
      timer.current = setTimeout(() => setNotice(false), SAVED_NOTICE_MS)
    },
    [clearTimer, open, settle],
  )

  // The page reloads the subtitles after a save; the new list is the first that is not the saved one.
  // The page calls `useResume` before `useRetime`, and its reset effect before both, so this runs
  // after the player has been reset and the resume has seeked: the target opened here has the last word.
  useEffect(() => {
    arrive(cues)
  }, [arrive, cues])

  return { moving, savedNotice: notice, begin, cancel, arrive, clearNotice }
}
