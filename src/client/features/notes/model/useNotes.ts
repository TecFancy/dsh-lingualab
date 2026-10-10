/**
 * The notes list for one episode.
 *
 * Saving is debounced and whole-file: the panel writes after a pause, and each write
 * replaces that episode's markdown. Two details are the difference between "usually
 * works" and "lost my notes once":
 *
 *   · every pending write is flushed when the episode changes, so an edit made
 *     half a second before switching is not thrown away with the timer;
 *   · the list is tagged with the episode it belongs to, and a mutation that
 *     arrives after a switch is dropped rather than written under the new id.
 *
 * There is no ceiling to ask about any more. Keeping a sentence is one gesture, and
 * the same gesture on the same sentence takes it back, so the star on a row is a
 * switch and not a button with a side effect.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { MAX_PHRASES, phraseCapacity, sameKeptSentence } from '../../../shared/notes-format.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'
import { fetchNotes, saveNotes } from '../../../shared/lib/api.ts'

/** How long the panel waits after the last change before writing. */
const SAVE_DEBOUNCE_MS = 600

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface NotesState {
  readonly phrases: readonly NotePhrase[]
  readonly status: SaveStatus
  readonly reason: string | null
  /** True only at the sanity ceiling, which no listening session reaches. */
  readonly full: boolean
  /** Append a phrase; nothing is added, and `false` returned, at the ceiling. */
  readonly add: (phrase: NotePhrase) => boolean
  /**
   * Keep this sentence, or take it back if it is already kept.
   *
   * A sentence the reader has put work into (a note, a tag, a tick) is never removed by a
   * star: that is 'protected', and the caller opens the drawer so removing it is a
   * deliberate act with a confirmation, not a reflex keystroke.
   */
  readonly toggle: (phrase: NotePhrase) => 'added' | 'removed' | 'protected' | 'full'
  /** Whether this sentence is already kept. Matches by whole second and text, as the file stores it. */
  readonly has: (sentence: { readonly at: number; readonly text: string }) => boolean
  readonly update: (index: number, patch: Partial<NotePhrase>) => void
  readonly remove: (index: number) => void
  /** Put a removed phrase back where it was, for the undo after a delete. */
  readonly restore: (phrase: NotePhrase, index: number) => void
}

/** Phrases plus the episode they belong to. */
interface LoadedNotes {
  readonly id: string | null
  readonly phrases: readonly NotePhrase[]
}

const NOTHING_LOADED: LoadedNotes = { id: null, phrases: [] }

/** Same reason as `NO_CUES` in the library hook: a stable identity per render. */
const NO_PHRASES: readonly NotePhrase[] = []

/** A write waiting for its debounce to elapse. */
interface PendingWrite {
  readonly id: string
  readonly phrases: readonly NotePhrase[]
  readonly timer: ReturnType<typeof setTimeout>
}

/** Whether the reader has done anything to a kept sentence beyond keeping it. */
function hasUserWork(phrase: NotePhrase): boolean {
  return phrase.note.length > 0 || phrase.tags.length > 0 || phrase.done
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

  const visible = loaded.id === episodeId ? loaded.phrases : NO_PHRASES
  const capacity = phraseCapacity(visible)

  const has = useCallback(
    (sentence: { readonly at: number; readonly text: string }): boolean =>
      visible.some((phrase) => sameKeptSentence(phrase, sentence)),
    [visible],
  )

  const add = useCallback(
    (phrase: NotePhrase): boolean => {
      if (capacity.full) return false
      mutate((current) => [...current, phrase])
      return true
    },
    [capacity.full, mutate],
  )

  const toggle = useCallback(
    (phrase: NotePhrase): 'added' | 'removed' | 'protected' | 'full' => {
      const existing = visible.find((item) => sameKeptSentence(item, phrase))
      if (existing !== undefined) {
        if (hasUserWork(existing)) return 'protected'
        mutate((current) => current.filter((item) => !sameKeptSentence(item, phrase)))
        return 'removed'
      }
      return add(phrase) ? 'added' : 'full'
    },
    [add, mutate, visible],
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

  const restore = useCallback(
    (phrase: NotePhrase, index: number) => {
      mutate((current) => {
        if (current.some((item) => sameKeptSentence(item, phrase))) return current
        const at = Math.min(Math.max(index, 0), current.length)
        return [...current.slice(0, at), phrase, ...current.slice(at)]
      })
    },
    [mutate],
  )

  return {
    phrases: visible,
    status,
    reason,
    full: capacity.full,
    add,
    toggle,
    has,
    update,
    remove,
    restore,
  }
}

export { MAX_PHRASES }
