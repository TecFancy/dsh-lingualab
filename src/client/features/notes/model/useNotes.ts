/**
 * The notes list for one episode, and the ceiling that gives it its point.
 *
 * Saving is debounced and whole-file: the panel writes after a pause in typing,
 * and each write replaces that episode's markdown. Two details are the difference
 * between "usually works" and "lost my notes once":
 *
 *   · every pending write is flushed when the episode changes, so an edit made
 *     half a second before switching is not thrown away with the timer;
 *   · the list is tagged with the episode it belongs to, and a mutation that
 *     arrives after a switch is dropped rather than written under the new id.
 *
 * The ceiling is enforced here so the UI can ask *which* phrase to replace, and
 * again in the host half so a client that skips the question is still refused.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { MAX_PHRASES, phraseCapacity } from '../../../shared/notes-format.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'
import { fetchNotes, saveNotes } from '../../../shared/lib/api.ts'

/** How long the panel waits after the last change before writing. */
const SAVE_DEBOUNCE_MS = 600

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface NotesState {
  readonly phrases: readonly NotePhrase[]
  readonly status: SaveStatus
  readonly reason: string | null
  readonly full: boolean
  readonly remaining: number
  /** Append a phrase; when the list is full, nothing is added and `full` is true. */
  readonly add: (phrase: NotePhrase) => boolean
  /** Replace the phrase at `index`, which is how the eighth phrase gets in. */
  readonly replaceAt: (index: number, phrase: NotePhrase) => void
  readonly update: (index: number, patch: Partial<NotePhrase>) => void
  readonly remove: (index: number) => void
}

/** Phrases plus the episode they belong to. */
interface LoadedNotes {
  readonly id: string | null
  readonly phrases: readonly NotePhrase[]
}

const NOTHING_LOADED: LoadedNotes = { id: null, phrases: [] }

/** A write waiting for its debounce to elapse. */
interface PendingWrite {
  readonly id: string
  readonly phrases: readonly NotePhrase[]
  readonly timer: ReturnType<typeof setTimeout>
}

/** Load, edit and persist one episode's phrases. */
export function useNotes(episodeId: string | null): NotesState {
  const [loaded, setLoaded] = useState<LoadedNotes>(NOTHING_LOADED)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [reason, setReason] = useState<string | null>(null)
  /** The timer and the payload it will write, so a switch can flush them first. */
  const pending = useRef<PendingWrite | null>(null)

  /** Write what the timer was holding, right now. */
  const flush = useCallback(() => {
    const job = pending.current
    pending.current = null
    if (job === null) return
    clearTimeout(job.timer)
    void (async () => {
      const payload = await saveNotes(job.id, job.phrases)
      setReason(payload.reason)
      setStatus(payload.ok ? 'saved' : 'error')
    })()
  }, [])

  useEffect(() => {
    // A switch flushes what is pending under the *old* id, so the write can never
    // land under the new one.
    flush()
    if (episodeId === null) return
    let cancelled = false
    void (async () => {
      const payload = await fetchNotes(episodeId)
      if (cancelled) return
      setLoaded({ id: episodeId, phrases: payload.phrases })
      setReason(payload.reason)
      setStatus(payload.ok ? 'idle' : 'error')
    })()
    return () => {
      cancelled = true
    }
  }, [episodeId, flush])

  const schedule = useCallback(
    (next: readonly NotePhrase[]) => {
      const id = loaded.id
      if (id === null) return
      if (pending.current !== null) clearTimeout(pending.current.timer)
      setStatus('saving')
      const timer = setTimeout(() => {
        pending.current = null
        void (async () => {
          const payload = await saveNotes(id, next)
          setReason(payload.reason)
          setStatus(payload.ok ? 'saved' : 'error')
        })()
      }, SAVE_DEBOUNCE_MS)
      pending.current = { id, phrases: next, timer }
    },
    [loaded.id],
  )

  const mutate = useCallback(
    (update: (current: readonly NotePhrase[]) => readonly NotePhrase[]) => {
      // A mutation for an episode that is no longer on screen is dropped: the file
      // it belongs to is not the file the panel is looking at.
      if (loaded.id === null || loaded.id !== episodeId) return
      const next = update(loaded.phrases)
      setLoaded({ id: loaded.id, phrases: next })
      schedule(next)
    },
    [episodeId, loaded, schedule],
  )

  const visible = loaded.id === episodeId ? loaded.phrases : []
  const capacity = phraseCapacity(visible)

  const add = useCallback(
    (phrase: NotePhrase): boolean => {
      if (capacity.full) return false
      mutate((current) => [...current, phrase])
      return true
    },
    [capacity.full, mutate],
  )

  const replaceAt = useCallback(
    (index: number, phrase: NotePhrase) => {
      mutate((current) => current.map((item, at) => (at === index ? phrase : item)))
    },
    [mutate],
  )

  const update = useCallback(
    (index: number, patch: Partial<NotePhrase>) => {
      mutate((current) => current.map((item, at) => (at === index ? { ...item, ...patch } : item)))
    },
    [mutate],
  )

  const remove = useCallback(
    (index: number) => {
      mutate((current) => current.filter((_, at) => at !== index))
    },
    [mutate],
  )

  return {
    phrases: visible,
    status,
    reason,
    full: capacity.full,
    remaining: capacity.remaining,
    add,
    replaceAt,
    update,
    remove,
  }
}

export { MAX_PHRASES }
