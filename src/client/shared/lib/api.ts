/**
 * Requests to the host half, and the one place the panel learns about files.
 *
 * Every call returns a payload rather than throwing on a bad answer: a missing
 * library is a normal state on a machine where nothing has been copied in yet,
 * and the page has to render that state instead of an error boundary.
 */
import {
  BROWSE_PATH,
  CONFIG_PATH,
  IMPORT_HEADER,
  IMPORT_PATH,
  LIBRARY_PATH,
  MAX_IMPORT_BYTES,
  NOTES_PATH,
  OPEN_PATH,
  PLACES_PATH,
  type BrowsePayload,
  type ImportPayload,
  type LibraryConfigPayload,
  type LibraryPayload,
  type NotePhrase,
  type NotesPayload,
  type OpenPayload,
  type PlacesPayload,
} from '../protocol.ts'

/** One empty payload per failure shape, so callers never see `undefined`. */
const EMPTY_CONFIG = (root: string, reason: string): LibraryConfigPayload => ({
  ok: false,
  reason,
  root,
  configured: '',
  source: 'none',
  exists: false,
  episodes: null,
  writable: true,
  candidates: [],
})

const EMPTY_BROWSE = (reason: string): BrowsePayload => ({
  ok: false,
  reason,
  place: null,
  rel: '',
  parentRel: null,
  entries: [],
  summary: { dirs: 0, audio: 0, subtitles: 0, other: 0 },
  page: { limit: 0, returned: 0, truncated: false },
  folderEpisode: null,
})

const EMPTY_OPEN = (reason: string): OpenPayload => ({
  ok: false,
  reason,
  episode: null,
  media: null,
  warnings: [],
})

/** Fetch the library listing. Network failures come back as an unreadable root. */
export async function fetchLibrary(): Promise<LibraryPayload> {
  try {
    const response = await fetch(LIBRARY_PATH, { headers: { accept: 'application/json' } })
    return (await response.json()) as LibraryPayload
  } catch (error) {
    return {
      ok: false,
      root: '',
      reason: String(error),
      current: null,
      episodes: [],
      files: [],
      currentEpisode: null,
      currentUnavailable: null,
    }
  }
}

/** Read where the library is, and which folders could be it. */
export async function fetchConfig(): Promise<LibraryConfigPayload | null> {
  try {
    const response = await fetch(CONFIG_PATH, { headers: { accept: 'application/json' } })
    return (await response.json()) as LibraryConfigPayload
  } catch {
    return null
  }
}

/**
 * Ask the host to make a folder the library root.
 *
 * The answer is the state now in effect, or the reason it was refused — a path that
 * does not exist is a normal answer here, not an exception, because the reader is
 * typing it.
 */
export async function saveConfig(libraryRoot: string): Promise<LibraryConfigPayload> {
  return await postConfig({ libraryRoot }, libraryRoot)
}

/** The same, for a folder the picker browsed to: a place id and a relative path. */
export async function saveConfigFromPlace(place: string, rel: string): Promise<LibraryConfigPayload> {
  return await postConfig({ place, rel }, rel)
}

async function postConfig(
  body: Record<string, string>,
  fallbackRoot: string,
): Promise<LibraryConfigPayload> {
  try {
    const response = await fetch(CONFIG_PATH, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const payload = (await response.json()) as LibraryConfigPayload | { ok: false; reason: string }
    if ('root' in payload) return payload
    return EMPTY_CONFIG(fallbackRoot, payload.reason)
  } catch (error) {
    return EMPTY_CONFIG(fallbackRoot, String(error))
  }
}

/** The roots the picker may browse: every workspace, plus the library itself. */
export async function fetchPlaces(): Promise<PlacesPayload> {
  try {
    const response = await fetch(PLACES_PATH, { headers: { accept: 'application/json' } })
    return (await response.json()) as PlacesPayload
  } catch (error) {
    return { ok: false, reason: String(error), places: [], current: null }
  }
}

/** List one directory under one place. */
export async function fetchBrowse(place: string, rel: string, query = ''): Promise<BrowsePayload> {
  const params = new URLSearchParams({ place, rel })
  if (query.trim().length > 0) params.set('q', query.trim())
  try {
    const response = await fetch(`${BROWSE_PATH}?${params.toString()}`, {
      headers: { accept: 'application/json' },
    })
    return (await response.json()) as BrowsePayload
  } catch (error) {
    return EMPTY_BROWSE(String(error))
  }
}

/** Open a folder episode the library scan already knows. */
export async function openEpisodeById(episodeId: string): Promise<OpenPayload> {
  return await postOpen({ episodeId })
}

/** Open one audio file, with the subtitles beside it. */
export async function openEpisodeFile(place: string, rel: string): Promise<OpenPayload> {
  return await postOpen({ place, rel })
}

async function postOpen(body: Record<string, string>): Promise<OpenPayload> {
  try {
    const response = await fetch(OPEN_PATH, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const payload = (await response.json()) as OpenPayload
    if (typeof payload.ok !== 'boolean') return EMPTY_OPEN('主机没有回答')
    return payload
  } catch (error) {
    return EMPTY_OPEN(String(error))
  }
}

/**
 * Send one dropped file to the library.
 *
 * `fetch` is the only way to stream a `File` as a body without reading it into memory
 * first, and the custom header is what the host checks to know the request came from
 * this page. A refusal is an answer, not an exception: a wrong file type is a normal
 * thing to drop.
 * @param file - the file the reader dropped or picked.
 * @param episode - the folder to put it in; empty lets the host name it after the file.
 */
export async function importMedia(file: File, episode: string): Promise<ImportPayload> {
  const refused = (reason: string): ImportPayload => ({
    ok: false,
    code: 'refused',
    reason,
    episode: null,
    file: file.name,
    bytes: 0,
    root: null,
  })
  if (file.size > MAX_IMPORT_BYTES) return refused('文件太大，单个最多 2 GB')
  const params = new URLSearchParams({ file: file.name, episode })
  try {
    const response = await fetch(`${IMPORT_PATH}?${params.toString()}`, {
      method: 'POST',
      headers: { [IMPORT_HEADER]: '1', 'content-type': 'application/octet-stream' },
      body: file,
    })
    const payload = (await response.json()) as ImportPayload
    return typeof payload.ok === 'boolean' ? payload : refused('主机没有回答')
  } catch (error) {
    return refused(String(error))
  }
}

/** Read one episode's notes. */
export async function fetchNotes(episode: string): Promise<NotesPayload> {
  try {
    const response = await fetch(`${NOTES_PATH}?episode=${encodeURIComponent(episode)}`, {
      headers: { accept: 'application/json' },
    })
    return (await response.json()) as NotesPayload
  } catch (error) {
    return { ok: false, episode, reason: String(error), phrases: [] }
  }
}

/** Replace one episode's notes. */
export async function saveNotes(episode: string, phrases: readonly NotePhrase[]): Promise<NotesPayload> {
  try {
    const response = await fetch(NOTES_PATH, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ episode, phrases }),
    })
    return (await response.json()) as NotesPayload
  } catch (error) {
    return { ok: false, episode, reason: String(error), phrases: [] }
  }
}

/** The URL one media file is served from; `<audio>` and `fetch` share it. */
export function mediaUrl(episode: string, file: string): string {
  return `/lingualab/media/${encodeURIComponent(episode)}/${encodeURIComponent(file)}`
}
