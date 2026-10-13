/**
 * Remembering a local video between visits, where the browser allows it.
 *
 * An object URL dies with the page, but a `FileSystemFileHandle` (File System Access API, Chromium on a
 * secure origin) can be kept in IndexedDB and asked about again later: the browser wants one click for
 * permission to read it, and then hands the file back. So the page keeps one handle per segment, here, on this
 * device only. Nothing about it goes to the host, and nothing here is needed to play: where the API or
 * IndexedDB is missing, or any call fails, the store simply remembers nothing and the reader picks the file again.
 *
 * The storage is a three-method backend so the rules above (never throw, never trust what comes back) can be
 * tested without a browser; the IndexedDB one is the thin part.
 */

/** What a stored handle is asked to do. The API is Chromium's and not in the standard DOM typings. */
export interface LocalHandle {
  readonly name: string
  getFile(): Promise<File>
  requestPermission?(descriptor: { mode: 'read' }): Promise<'granted' | 'denied' | 'prompt'>
}

/** Where handles are kept: any async key-value store that can hold a structured clone of a handle. */
export interface HandleBackend {
  get(key: string): Promise<unknown>
  set(key: string, value: LocalHandle): Promise<void>
  remove(key: string): Promise<void>
}

/** The store the page uses: every call is safe to make and none of them throws. */
export interface HandleStore {
  /** The handle kept for a segment, or `null` when there is none or it cannot be read back. */
  get(key: string): Promise<LocalHandle | null>
  /** Keep a handle for a segment; `false` when it could not be kept. */
  put(key: string, handle: LocalHandle): Promise<boolean>
  /** Forget the handle of a segment. */
  remove(key: string): Promise<void>
}

/** Whether something read back from storage is a handle this page can use. */
function isHandle(value: unknown): value is LocalHandle {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { name?: unknown }).name === 'string' &&
    typeof (value as { getFile?: unknown }).getFile === 'function'
  )
}

/**
 * A handle store over a backend.
 * @param backend - where to keep them, or `null` for no storage at all (then nothing is remembered).
 */
export function handleStore(backend: HandleBackend | null): HandleStore {
  return {
    async get(key) {
      if (backend === null) return null
      try {
        const value = await backend.get(key)
        return isHandle(value) ? value : null
      } catch {
        return null
      }
    },
    async put(key, handle) {
      if (backend === null) return false
      try {
        await backend.set(key, handle)
        return true
      } catch {
        return false
      }
    },
    async remove(key) {
      if (backend === null) return
      try {
        await backend.remove(key)
      } catch {
        // Nothing to forget, or nowhere to forget it from.
      }
    },
  }
}

const DB_NAME = 'dsh-lingualab'
const STORE_NAME = 'local-video-handles'

/** Open the database, creating the one object store the first time. */
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('indexedDB open failed'))
    request.onblocked = () => reject(new Error('indexedDB open blocked'))
  })
}

/** Run one request against the store, and close the database again. */
async function run<T>(mode: IDBTransactionMode, make: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode)
      const request = make(transaction.objectStore(STORE_NAME))
      transaction.oncomplete = () => resolve(request.result)
      transaction.onerror = () => reject(transaction.error ?? new Error('indexedDB transaction failed'))
      transaction.onabort = () => reject(transaction.error ?? new Error('indexedDB transaction aborted'))
    })
  } finally {
    db.close()
  }
}

/**
 * The browser's IndexedDB as a backend.
 * @returns the backend, or `null` where there is no IndexedDB (or touching it throws, as it does with site data blocked).
 */
export function indexedDbBackend(): HandleBackend | null {
  try {
    if (typeof indexedDB === 'undefined') return null
  } catch {
    return null
  }
  return {
    get: (key) => run('readonly', (store) => store.get(key)),
    set: async (key, value) => {
      await run('readwrite', (store) => store.put(value, key))
    },
    remove: async (key) => {
      await run('readwrite', (store) => store.delete(key))
    },
  }
}

/** The one store of this page: IndexedDB when there is one. */
export const localHandles: HandleStore = handleStore(indexedDbBackend())

/** `window.showOpenFilePicker`, which the standard DOM typings do not have. */
interface PickerWindow {
  showOpenFilePicker?: (options: {
    multiple: boolean
    types: readonly { description: string; accept: Record<string, readonly string[]> }[]
  }) => Promise<readonly LocalHandle[]>
}

/** Whether the browser can hand out file handles, and so whether a choice can be remembered. */
export function canPickHandle(): boolean {
  return typeof window !== 'undefined' && typeof (window as unknown as PickerWindow).showOpenFilePicker === 'function'
}

/**
 * Ask the reader for one video file and get a handle on it. Call it straight from a click: the picker needs
 * the user gesture, so nothing may be awaited before it.
 * @returns the handle, or `null` when the reader closed the picker or it is not there.
 */
export async function pickHandle(): Promise<LocalHandle | null> {
  const show = (window as unknown as PickerWindow).showOpenFilePicker
  if (typeof show !== 'function') return null
  try {
    const [handle] = await show.call(window, {
      multiple: false,
      types: [{ description: 'Video', accept: { 'video/*': ['.mp4', '.m4v', '.mkv', '.webm', '.mov'] } }],
    })
    return handle ?? null
  } catch {
    // Closing the picker rejects with an AbortError, and a blocked picker with a SecurityError: both mean no file.
    return null
  }
}

/** Why a handle could not give its file back. */
export type ReopenProblem = 'denied' | 'missing'

/** What {@link reopen} found. */
export type Reopened = { readonly ok: true; readonly file: File } | { readonly ok: false; readonly problem: ReopenProblem }

/**
 * Ask a stored handle for its file. Call it straight from a click: asking permission needs the user gesture.
 * @param handle - the stored handle.
 * @returns the file, or why not: the reader said no to the permission, or the file is not there any more.
 */
export async function reopen(handle: LocalHandle): Promise<Reopened> {
  try {
    if (handle.requestPermission !== undefined) {
      const answer = await handle.requestPermission({ mode: 'read' })
      if (answer !== 'granted') return { ok: false, problem: 'denied' }
    }
    return { ok: true, file: await handle.getFile() }
  } catch (error) {
    return { ok: false, problem: (error as { name?: unknown } | null)?.name === 'NotFoundError' ? 'missing' : 'denied' }
  }
}

/** Read a handle's file without asking anything; `null` when it cannot be read. */
export async function fileOf(handle: LocalHandle): Promise<File | null> {
  try {
    return await handle.getFile()
  } catch {
    return null
  }
}
