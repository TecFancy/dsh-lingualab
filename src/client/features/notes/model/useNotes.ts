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
 * Every save sends the version of the file it was based on, and the host refuses a save
 * against a file that has changed since (another tab, a hand edit, the agent). The page then
 * reads the notes again and says so, and any write still waiting from before is dropped,
 * since it was built on the old list. Reads and saves go out one at a time, in order, so a
 * save never races the page's own previous save, and a read never answers with the file as
 * it was before a save the page had already sent.
 *
 * The phrases of an episode cut into segments carry the segment they are from, and the
 * same sentence in two segments is two phrases: matching goes through
 * `sameKeptSentence`, which takes the segment into account.
 *
 * There is no ceiling to ask about any more. Keeping a sentence is one gesture, and
 * the same gesture on the same sentence takes it back, so the star on a row is a
 * switch and not a button with a side effect.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { MAX_PHRASES, phraseCapacity, sameKeptSentence, type KeptSentence } from '../../../shared/notes-format.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'
import { fetchNotes, saveNotes } from '../../../shared/lib/api.ts'

/** How long the panel waits after the last change before writing. */
const SAVE_DEBOUNCE_MS = 600

/** `reloaded`: a save was refused because the file had changed, and the list was read again. */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'reloaded'

export interface NotesState {
  /** The episode whose phrases these are, or `null` while the open one is still loading. */
  readonly episode: string | null
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
   * A sentence the reader has put work into (a note, a grade) is never removed by a
   * star: that is 'protected', and the caller shows the kept sentences so removing it is a
   * deliberate act with an undo, not a reflex keystroke.
   */
  readonly toggle: (phrase: NotePhrase) => 'added' | 'removed' | 'protected' | 'full'
  /**
   * Whether this sentence is already kept. Matches by whole second and text, as the file
   * stores it, and by segment when the episode has them.
   */
  readonly has: (sentence: KeptSentence) => boolean
  readonly update: (index: number, patch: Partial<NotePhrase>) => void
  readonly remove: (index: number) => void
  /** Put a removed phrase back where it was, for the undo after a delete. */
  readonly restore: (phrase: NotePhrase, index: number) => void
  /** Write what is waiting for its debounce now; resolves once the host has answered. */
  readonly flush: () => Promise<void>
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
  /** The episode's reload count when the write was made; a reload since makes it obsolete. */
  readonly generation: number
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
  /** Per episode, the version of the file as last read or written; what the next save expects. */
  const versions = useRef(new Map<string, string | null>())
  /** Per episode, how many times a stale save made the page read the notes again. */
  const generations = useRef(new Map<string, number>())
  /** The last request sent; the next one waits for its answer. */
  const queue = useRef<Promise<unknown>>(Promise.resolve())

  /** Run one notes request once every earlier one has been answered. */
  const enqueue = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const next = queue.current.then(task, task)
    queue.current = next.catch(() => undefined)
    return next
  }, [])

  /** Read an episode's notes, remembering the version the next save will expect. */
  const read = useCallback(async (id: string) => {
    const payload = await fetchNotes(id)
    versions.current.set(id, payload.ok ? payload.version : null)
    return payload
  }, [])

  /**
   * Save one episode's phrases in turn. A write made before the last reload of its episode is
   * dropped; a stale answer reads the notes again and puts them on screen if that episode
   * still is.
   */
  const write = useCallback(
    (id: string, phrases: readonly NotePhrase[], generation: number): Promise<void> =>
      enqueue(async () => {
        if ((generations.current.get(id) ?? 0) !== generation) return
        const payload = await saveNotes(id, phrases, versions.current.get(id) ?? null)
        if (payload.ok) versions.current.set(id, payload.version)
        setReason(payload.reason)
        if (!payload.stale) {
          setStatus(payload.ok ? 'saved' : 'error')
          return
        }
        generations.current.set(id, generation + 1)
        const fresh = await read(id)
        if (fresh.ok) setLoaded((current) => (current.id === id ? { id, phrases: fresh.phrases } : current))
        setStatus(fresh.ok ? 'reloaded' : 'error')
      }),
    [enqueue, read],
  )

  /** Write what the timer was holding, right now. */
  const flush = useCallback(async (): Promise<void> => {
    const job = pending.current
    pending.current = null
    if (job === null) return
    clearTimeout(job.timer)
    await write(job.id, job.phrases, job.generation)
  }, [write])

  useEffect(() => {
    // A switch flushes what is pending under the *old* id, so the write can never
    // land under the new one.
    void flush()
    if (episodeId === null) return
    let cancelled = false
    void (async () => {
      const payload = await enqueue(() => read(episodeId))
      if (cancelled) return
      setLoaded({ id: episodeId, phrases: payload.phrases })
      setReason(payload.reason)
      setStatus(payload.ok ? 'idle' : 'error')
    })()
    return () => {
      cancelled = true
    }
  }, [episodeId, enqueue, flush, read])

  const schedule = useCallback(
    (next: readonly NotePhrase[]) => {
      const id = loaded.id
      if (id === null) return
      if (pending.current !== null) clearTimeout(pending.current.timer)
      setStatus('saving')
      const generation = generations.current.get(id) ?? 0
      const timer = setTimeout(() => {
        pending.current = null
        void write(id, next, generation)
      }, SAVE_DEBOUNCE_MS)
      pending.current = { id, phrases: next, generation, timer }
    },
    [loaded.id, write],
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
    (sentence: KeptSentence): boolean => visible.some((phrase) => sameKeptSentence(phrase, sentence)),
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
    episode: loaded.id === episodeId ? loaded.id : null,
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
    flush,
  }
}

export { MAX_PHRASES }
