/**
 * Requests to the host half, and the one place the panel learns about files.
 *
 * Every call returns a payload rather than throwing on a bad answer: a missing
 * library is a normal state on a machine where nothing has been copied in yet,
 * and the page has to render that state instead of an error boundary.
 */
import {
  LIBRARY_PATH,
  MEDIA_PATH,
  NOTES_PATH,
  type LibraryPayload,
  type NotePhrase,
  type NotesPayload,
} from '../protocol.ts'

/** Fetch the library listing. Network failures come back as an unreadable root. */
export async function fetchLibrary(): Promise<LibraryPayload> {
  try {
    const response = await fetch(LIBRARY_PATH, { headers: { accept: 'application/json' } })
    return (await response.json()) as LibraryPayload
  } catch (error) {
    return { ok: false, root: '', reason: String(error), current: null, episodes: [] }
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
  return `${MEDIA_PATH}/${encodeURIComponent(episode)}/${encodeURIComponent(file)}`
}
