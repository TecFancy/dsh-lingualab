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
 * but on the edge that had the focus. A changed range that can be saved is written first: the panel
 * stays where it is, the subtitles are read back, and the neighbour opens on the new list with
 * `saved` shown for a moment. A changed range on an episode that cannot be saved moves at once,
 * because it has nowhere to be written. Saving goes to the host, which writes only that cue's
 * timecode; what to do after (move the kept sentence, read the subtitles again) is the page's,
 * through the two callbacks.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  initialRange,
  isLrc,
  moveEdge,
  type Cue,
  type RetimeEdge,
  type RetimeRange,
} from '../../../entities/cue/index.ts'
import { togglePlayback, useMediaPlayer } from '../../../features/media-player/index.ts'
import { saveSubtitleTiming } from '../../../shared/lib/api.ts'
import { BIG_STEP_MS, STEP_MS, timingKeyAction } from '../lib/keys.ts'
import { timingSession } from '../lib/session.ts'
import { focusAfterStep, rangeChanged, stepNeedsSave, stepTarget } from '../lib/step.ts'
import { timingWrite } from '../lib/write.ts'
import type { TimingEditor, TimingEditorOptions, TimingSession } from './types.ts'
import { useStepAfterSave } from './useStepAfterSave.ts'

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
  const lrc = tracks.english !== null && isLrc(tracks.english.file)

  const session = useMemo((): TimingSession | null => {
    if (state === null || state.cues !== cues || pinned === null || pinned.index !== state.index) return null
    return timingSession(
      state.index,
      state.range,
      state.focus,
      cues,
      lrc,
      duration > 0 ? Math.round(duration * 1000) : null,
    )
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

  /** Open a sentence on its own edges, keeping the edge a step carries over. */
  const moveTo = useCallback(
    (target: number, focus: RetimeEdge): void => {
      const cue = cues[target]
      if (cue === undefined) return
      // Only an LRC line has an end that cannot be moved.
      apply(target, initialRange(cue), focusAfterStep(focus, !lrc), 'start')
      useMediaPlayer.getState().setPlaying(true)
    },
    [cues, lrc, apply],
  )

  const settleMove = useCallback((): void => setSaving(false), [])
  const afterSave = useStepAfterSave({ cues, open: moveTo, settle: settleMove })

  const open = useCallback(
    (index: number): void => {
      const cue = cues[index]
      if (cue === undefined) return
      afterSave.clearNotice()
      apply(index, initialRange(cue), 'start', 'start')
      // Listening is how an edge is placed, so the strip starts the loop playing.
      useMediaPlayer.getState().setPlaying(true)
    },
    [cues, apply, afterSave],
  )

  const close = useCallback((): void => {
    afterSave.cancel()
    setState(null)
    setSaving(false)
    setError(null)
    useMediaPlayer.getState().setEditWindow(null)
  }, [afterSave])

  // Leaving the page (or the strip's owner unmounting) lets go of the player.
  useEffect(() => () => useMediaPlayer.getState().setEditWindow(null), [])

  const setEdge = useCallback(
    (edge: RetimeEdge, value: number): void => {
      // An LRC line has no end of its own to move.
      if (session === null || (edge === 'end' && !session.limits.endEditable)) return
      afterSave.clearNotice()
      apply(session.index, moveEdge(session.range, edge, value, session.limits), edge, edge)
    },
    [session, apply, afterSave],
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
    afterSave.clearNotice()
    apply(session.index, session.base, session.focus, session.focus)
  }, [session, apply, afterSave])

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

  /** Write the open range; `target` is the neighbour a step should open once the new list arrives. */
  const write = useCallback(
    (target: number | null): void => {
      if (session === null || saving || blocked !== null || episodeId === null) return
      const request = timingWrite(session, cues, tracks.english, tracks.chinese, target)
      if (request === null) return
      if (!rangeChanged(session.range, session.base)) {
        close()
        return
      }
      if (target === null) afterSave.clearNotice()
      else afterSave.begin(target, focusAfterStep(session.focus, session.limits.endEditable), cues)
      setSaving(true)
      void (async () => {
        const result = await saveSubtitleTiming(episodeId, request.edits)
        if (!result.ok) {
          setSaving(false)
          afterSave.cancel()
          setError({ reason: result.reason ?? '', stale: result.code === 'stale' })
          return
        }
        if (target === null) {
          setSaving(false)
          close()
        }
        onSaved(request.saved)
      })()
    },
    [session, saving, blocked, episodeId, cues, tracks, close, afterSave, onSaved],
  )

  const save = useCallback((): void => write(null), [write])

  const step = useCallback(
    (direction: -1 | 1): void => {
      if (session === null || saving) return
      const target = stepTarget(session.index, direction, cues.length)
      if (target === null) return
      if (stepNeedsSave(blocked, rangeChanged(session.range, session.base))) {
        write(target)
        return
      }
      afterSave.clearNotice()
      moveTo(target, session.focus)
    },
    [session, saving, cues.length, blocked, write, afterSave, moveTo],
  )

  const reloadStale = useCallback((): void => {
    close()
    onStale()
  }, [close, onStale])

  const handleKey = useCallback(
    (event: ReactKeyboardEvent): boolean => {
      // A save on its way to the neighbour swallows every key and does nothing with it, even after
      // the new list has ended the session but before the panel has opened the target.
      if (afterSave.moving) return true
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
    [afterSave.moving, session, setFocus, nudge, toPlayhead, save, close, step],
  )

  return {
    session,
    saving,
    moving: afterSave.moving,
    savedNotice: afterSave.savedNotice,
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
