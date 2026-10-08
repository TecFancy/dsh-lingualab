/**
 * The notes list for one episode, and the ceiling that gives it its point.
 *
 * Saving is debounced and whole-file: the panel writes after a pause in typing
 * rather than on every keystroke, and each write replaces the episode's markdown.
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

/** Load, edit and persist one episode's phrases. */
export function useNotes(episodeId: string | null): NotesState {
  const [phrases, setPhrases] = useState<readonly NotePhrase[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [reason, setReason] = useState<string | null>(null)
  const dirty = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    dirty.current = false
    if (timer.current !== null) clearTimeout(timer.current)
    // Nothing to load without an episode; the panel is not rendered then either.
    if (episodeId === null) return
    let cancelled = false
    void (async () => {
      const payload = await fetchNotes(episodeId)
      if (cancelled) return
      setPhrases(payload.phrases)
      setReason(payload.reason)
      setStatus(payload.ok ? 'idle' : 'error')
    })()
    return () => {
      cancelled = true
    }
  }, [episodeId])

  const schedule = useCallback(
    (next: readonly NotePhrase[]) => {
      if (episodeId === null) return
      dirty.current = true
      setStatus('saving')
      if (timer.current !== null) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        void (async () => {
          const payload = await saveNotes(episodeId, next)
          // A later edit may have landed while this write was in flight; only the
          // last writer's verdict is allowed to clear the dirty flag.
          if (!dirty.current) return
          dirty.current = false
          setReason(payload.reason)
          setStatus(payload.ok ? 'saved' : 'error')
        })()
      }, SAVE_DEBOUNCE_MS)
    },
    [episodeId],
  )

  const mutate = useCallback(
    (update: (current: readonly NotePhrase[]) => readonly NotePhrase[]) => {
      setPhrases((current) => {
        const next = update(current)
        schedule(next)
        return next
      })
    },
    [schedule],
  )

  const capacity = phraseCapacity(phrases)

  const add = useCallback(
    (phrase: NotePhrase): boolean => {
      if (phraseCapacity(phrases).full) return false
      mutate((current) => [...current, phrase])
      return true
    },
    [mutate, phrases],
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
    phrases,
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
