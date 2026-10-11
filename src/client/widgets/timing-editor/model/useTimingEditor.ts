/**
 * The state of the timing strip: which sentence, its edges as they stand, and saving them.
 *
 * Opening the strip pins the player to the sentence (see `EditWindow` in the player store), so it
 * loops between the edges being edited and every change is heard on the next pass. A change also
 * moves the playhead to where it can be heard: a new start plays from the start, a new end plays
 * the last moment and a half before it, which is where a clipped word or a stray syllable sits.
 *
 * The strip owns the keyboard while it is open, through {@link TimingEditor.handleKey}, which the
 * page asks first. Saving goes to the host, which writes only that cue's timecode; what to do after
 * (move the kept sentence, read the subtitles again) is the page's, through the two callbacks.
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
  type PushedNeighbour,
  type RetimeEdge,
  type RetimeLimits,
  type RetimeRange,
} from '../../../entities/cue/index.ts'
import type { SubtitleTracks } from '../../../features/library/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { saveSubtitleTiming } from '../../../shared/lib/api.ts'

/** One nudge, and one with Shift held. */
export const STEP_MS = 50
const BIG_STEP_MS = 250

/** How much of a sentence's end is replayed after the end moves. */
const END_PREVIEW_MS = 1500

/** One cue a save moved. */
export interface MovedCue {
  readonly cue: Cue
  readonly before: RetimeRange
  readonly after: RetimeRange
}

/** What the page learns after a save: the sentence, and the neighbours it pushed. */
export interface SavedTiming extends MovedCue {
  readonly index: number
  readonly pushed: readonly MovedCue[]
}

export interface TimingEditorOptions {
  readonly cues: readonly Cue[]
  readonly tracks: SubtitleTracks
  readonly episodeId: string | null
  /** Why this episode's subtitles cannot be saved, or `null` when they can. The strip still opens to listen. */
  readonly blocked: string | null
  readonly onSaved: (saved: SavedTiming) => void
  /** The host says the file changed since it was read: the page reads the subtitles again. */
  readonly onStale: () => void
}

/** The open strip. */
export interface TimingSession {
  readonly index: number
  readonly cue: Cue
  readonly range: RetimeRange
  /** The range the strip opened with, so "changed" and the after-save move are known. */
  readonly base: RetimeRange
  readonly focus: RetimeEdge
  readonly limits: RetimeLimits
  readonly lrc: boolean
  /** The neighbours the range pushes as it stands, saved with it. */
  readonly pushed: readonly PushedNeighbour[]
}

export interface TimingEditor {
  readonly session: TimingSession | null
  readonly saving: boolean
  /** The host's reason for the last refusal. */
  readonly error: string | null
  /** True when the refusal was a stale file, so the strip offers to read it again. */
  readonly stale: boolean
  readonly open: (index: number) => void
  readonly close: () => void
  readonly setFocus: (edge: RetimeEdge) => void
  readonly nudge: (edge: RetimeEdge, deltaMs: number) => void
  readonly toPlayhead: (edge: RetimeEdge) => void
  readonly save: () => void
  readonly reloadStale: () => void
  /** The page's key handler asks here first while the strip is open; true means the key was used. */
  readonly handleKey: (event: ReactKeyboardEvent) => boolean
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
  const [state, setState] = useState<{
    index: number
    range: RetimeRange
    focus: RetimeEdge
    cues: readonly Cue[]
  } | null>(null)
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
    return {
      index: state.index,
      cue,
      range: state.range,
      base: initialRange(cue),
      focus: state.focus,
      limits: retimeLimits(cues, state.index, lrc, duration > 0 ? Math.round(duration * 1000) : null),
      lrc,
      pushed: pushedNeighbours(cues, state.index, state.range, lrc),
    }
  }, [state, cues, pinned, lrc, duration])

  /** Put a range on screen and in the player, and move the playhead to where the change is heard. */
  const apply = useCallback(
    (index: number, range: RetimeRange, focus: RetimeEdge, heard: RetimeEdge | null): void => {
      setState({ index, range, focus, cues })
      setError(null)
      const player = useMediaPlayer.getState()
      player.setEditWindow({
        index,
        start: range.start / 1000,
        end: range.end / 1000,
      })
      if (heard === 'start') player.seek(range.start / 1000)
      if (heard === 'end') player.seek(Math.max(range.start, range.end - END_PREVIEW_MS) / 1000)
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
    const unchanged = session.range.start === session.base.start && session.range.end === session.base.end
    if (unchanged) {
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
      const step = event.shiftKey ? BIG_STEP_MS : STEP_MS
      switch (event.key) {
        case 'Tab':
          setFocus(session.focus === 'start' ? 'end' : 'start')
          return true
        case 'ArrowLeft':
          nudge(session.focus, -step)
          return true
        case 'ArrowRight':
          nudge(session.focus, step)
          return true
        case 'i':
        case 'I':
          toPlayhead('start')
          return true
        case 'o':
        case 'O':
          toPlayhead('end')
          return true
        case ' ':
          useMediaPlayer.getState().toggle()
          return true
        case 'Enter':
          save()
          return true
        case 'Escape':
          close()
          return true
        default:
          // Everything else is swallowed while the strip is open: a stray L or an arrow up must
          // not move the sentence the edges belong to.
          return true
      }
    },
    [session, setFocus, nudge, toPlayhead, save, close],
  )

  return {
    session,
    saving,
    error: error?.reason ?? null,
    stale: error?.stale ?? false,
    open,
    close,
    setFocus,
    nudge,
    toPlayhead,
    save,
    reloadStale,
    handleKey,
  }
}
