/**
 * The state of the timing strip: which sentence, its edges as they stand, and saving them.
 *
 * Opening the strip pins the player to the sentence (see `EditWindow` in the player store), so it
 * loops between the edges being edited and every change is heard on the next pass. A change also
 * moves the playhead to where it can be heard: a new start plays from the start, a new end plays
 * the last moment and a half before it, which is where a clipped word or a stray syllable sits.
 *
 * The strip owns the keyboard while it is open, through {@link TimingEditor.handleKey}, which the
 * page asks first. `↑` and `↓` reopen it on the sentence before or after, as opening it there would
 * but on the edge that had the focus; a changed range that can be saved stays where it is. Saving
 * goes to the host, which writes only that cue's timecode; what to do after (move the kept sentence,
 * read the subtitles again) is the page's, through the two callbacks.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  initialRange,
  isLrc,
  moveEdge,
  pushedNeighbours,
  retimeLimits,
  timingEdits,
  type Cue,
  type RetimeEdge,
  type RetimeRange,
} from '../../../entities/cue/index.ts'
import { togglePlayback, useMediaPlayer } from '../../../features/media-player/index.ts'
import { saveSubtitleTiming } from '../../../shared/lib/api.ts'
import { BIG_STEP_MS, STEP_MS, timingKeyAction } from '../lib/keys.ts'
import { neighbour } from '../lib/neighbours.ts'
import { focusAfterStep, rangeChanged, stepAllowed, stepTarget } from '../lib/step.ts'
import type { SavedTiming, TimingEditor, TimingEditorOptions, TimingSession } from './types.ts'

export { BIG_STEP_MS, STEP_MS }
export type { MovedCue, SavedTiming, TimingEditor, TimingEditorOptions, TimingSession } from './types.ts'

/** How much of a sentence's end is replayed after the end moves. */
const END_PREVIEW_MS = 1500

/** What the strip holds while it is open. */
interface EditorState {
  readonly index: number
  readonly range: RetimeRange
  readonly focus: RetimeEdge
  readonly cues: readonly Cue[]
}

/** Pin the player to a range, and move the playhead to where the change is heard. */
function pinPlayer(index: number, range: RetimeRange, heard: RetimeEdge | null): void {
  const player = useMediaPlayer.getState()
  player.setEditWindow({ index, start: range.start / 1000, end: range.end / 1000 })
  if (heard === 'start') player.seek(range.start / 1000)
  if (heard === 'end') player.seek(Math.max(range.start, range.end - END_PREVIEW_MS) / 1000)
}

/** Drive the strip. */
export function useTimingEditor({
  cues,
  tracks,
  episodeId,
  blocked,
  onSaved,
  onStale,
}: TimingEditorOptions): TimingEditor {
  /**
   * What the strip holds. The cue list it was opened on is kept with it: a new list (another
   * segment, or the same file read again) means the index names a different sentence, and the
   * session is over without anything having to clear it.
   */
  const [state, setState] = useState<EditorState | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<{ reason: string; stale: boolean } | null>(null)
  const duration = useMediaPlayer((player) => player.duration)
  // The player lets go of the sentence by itself when the transport moves to another one or loops
  // one; the strip closes with it rather than editing edges nothing is playing.
  const pinned = useMediaPlayer((player) => player.editWindow)
  const file = tracks.english?.file ?? null
  const lrc = file !== null && isLrc(file)

  const session = useMemo((): TimingSession | null => {
    if (state === null || state.cues !== cues || pinned === null || pinned.index !== state.index) return null
    const cue = cues[state.index]
    if (cue === undefined) return null
    const base = initialRange(cue)
    const pushed = pushedNeighbours(cues, state.index, state.range, lrc)
    return {
      index: state.index,
      cue,
      range: state.range,
      base,
      canStepPrevious: stepTarget(state.index, -1, cues.length) !== null,
      canStepNext: stepTarget(state.index, 1, cues.length) !== null,
      focus: state.focus,
      limits: retimeLimits(cues, state.index, lrc, duration > 0 ? Math.round(duration * 1000) : null),
      lrc,
      pushed,
      previous: neighbour(cues, state.index - 1, 'previous', pushed, state.range, lrc),
      next: neighbour(cues, state.index + 1, 'next', pushed, state.range, lrc),
    }
  }, [state, cues, pinned, lrc, duration])

  /** Put a range on screen and in the player. */
  const apply = useCallback(
    (index: number, range: RetimeRange, focus: RetimeEdge, heard: RetimeEdge | null): void => {
      setState({ index, range, focus, cues })
      setError(null)
      pinPlayer(index, range, heard)
    },
    [cues],
  )

  const open = useCallback(
    (index: number): void => {
      const cue = cues[index]
      if (cue === undefined) return
      apply(index, initialRange(cue), 'start', 'start')
      // Listening is how an edge is placed, so the strip starts the loop playing.
      useMediaPlayer.getState().setPlaying(true)
    },
    [cues, apply],
  )

  const step = useCallback(
    (direction: -1 | 1): void => {
      if (session === null) return
      const target = stepTarget(session.index, direction, cues.length)
      if (target === null) return
      // A changed range that can be saved is not dropped by a key press.
      if (!stepAllowed(blocked, rangeChanged(session.range, session.base))) return
      const cue = cues[target]
      if (cue === undefined) return
      const limits = retimeLimits(cues, target, lrc, duration > 0 ? Math.round(duration * 1000) : null)
      apply(target, initialRange(cue), focusAfterStep(session.focus, limits.endEditable), 'start')
      useMediaPlayer.getState().setPlaying(true)
    },
    [session, cues, blocked, lrc, duration, apply],
  )

  const close = useCallback((): void => {
    setState(null)
    setError(null)
    useMediaPlayer.getState().setEditWindow(null)
  }, [])

  // Leaving the page (or the strip's owner unmounting) lets go of the player.
  useEffect(() => () => useMediaPlayer.getState().setEditWindow(null), [])

  const setEdge = useCallback(
    (edge: RetimeEdge, value: number): void => {
      // An LRC line has no end of its own to move.
      if (session === null || (edge === 'end' && !session.limits.endEditable)) return
      apply(session.index, moveEdge(session.range, edge, value, session.limits), edge, edge)
    },
    [session, apply],
  )

  const nudge = useCallback(
    (edge: RetimeEdge, deltaMs: number): void => {
      if (session === null) return
      setEdge(edge, (edge === 'start' ? session.range.start : session.range.end) + deltaMs)
    },
    [session, setEdge],
  )

  const toPlayhead = useCallback(
    (edge: RetimeEdge): void => setEdge(edge, useMediaPlayer.getState().currentTime * 1000),
    [setEdge],
  )

  const reset = useCallback((): void => {
    if (session === null) return
    apply(session.index, session.base, session.focus, session.focus)
  }, [session, apply])

  const setFocus = useCallback(
    (edge: RetimeEdge): void => {
      if (session === null) return
      setState({
        index: session.index,
        range: session.range,
        focus: session.limits.endEditable ? edge : 'start',
        cues,
      })
    },
    [session, cues],
  )

  const save = useCallback((): void => {
    if (session === null || saving || blocked !== null || episodeId === null) return
    const edits = timingEdits(cues, session.index, session.range, tracks.english, tracks.chinese)
    if (edits === null) return
    if (!rangeChanged(session.range, session.base)) {
      close()
      return
    }
    setSaving(true)
    void (async () => {
      const result = await saveSubtitleTiming(episodeId, edits)
      setSaving(false)
      if (!result.ok) {
        setError({
          reason: result.reason ?? '',
          stale: result.code === 'stale',
        })
        return
      }
      const saved: SavedTiming = {
        index: session.index,
        cue: session.cue,
        before: session.base,
        after: session.range,
        pushed: session.pushed.flatMap((neighbour) => {
          const cue = cues[neighbour.index]
          return cue === undefined ? [] : [{ cue, before: neighbour.before, after: neighbour.after }]
        }),
      }
      close()
      onSaved(saved)
    })()
  }, [session, saving, blocked, episodeId, cues, tracks, close, onSaved])

  const reloadStale = useCallback((): void => {
    close()
    onStale()
  }, [close, onStale])

  const handleKey = useCallback(
    (event: ReactKeyboardEvent): boolean => {
      if (session === null) return false
      const action = timingKeyAction(event.key, event.shiftKey)
      switch (action.kind) {
        case 'switch':
          setFocus(session.focus === 'start' ? 'end' : 'start')
          break
        case 'nudge':
          nudge(session.focus, action.delta)
          break
        case 'toPlayhead':
          toPlayhead(action.edge)
          break
        case 'toggle':
          togglePlayback()
          break
        case 'save':
          save()
          break
        case 'close':
          close()
          break
        case 'step':
          step(action.direction)
          break
        default:
          // Everything else is swallowed while the strip is open: a stray L must not move the
          // sentence the edges belong to.
          break
      }
      return true
    },
    [session, setFocus, nudge, toPlayhead, save, close, step],
  )

  return {
    session,
    saving,
    error: error?.reason ?? null,
    stale: error?.stale ?? false,
    open,
    step,
    close,
    setFocus,
    nudge,
    toPlayhead,
    reset,
    save,
    reloadStale,
    handleKey,
  }
}
