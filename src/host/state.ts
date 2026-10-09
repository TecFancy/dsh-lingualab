/**
 * What the plugin remembers between requests, and where it remembers it.
 *
 * A folder episode is a folder under the library root: the scan rediscovers it on
 * every request, so nothing about it needs to be stored. A **file episode** is the
 * opposite — the reader picked one audio file out of a workspace, and every later
 * request that says `file.9f2c…` has to be able to turn that id back into a path.
 * That mapping, plus the notes written against it, is this module's whole reason to
 * exist.
 *
 * It is persisted as one JSON string in this plugin's own profile entry (the
 * `openState` config field), next to `libraryRoot`. The settings service owns the
 * write; a private file on disk would be a second home for plugin state, and the
 * first time somebody edited the profile by hand the two would disagree.
 *
 * Everything here is total: a state string that fails to parse, or that was written
 * by a future version, reads as "nothing remembered" rather than taking the panel
 * down. The panel can always be used; it just opens on the library default.
 */
import { createHash } from 'node:crypto'
import type { NotePhrase, NotesSummary, OpenRef } from '../shared/protocol.ts'

/** Prefix that marks an episode id as one audio file rather than one folder. */
export const FILE_EPISODE_PREFIX = 'file.'

/** How many file episodes are kept before the oldest are forgotten. */
export const MAX_FILE_EPISODES = 200

/** How many recently opened file episodes are protected from that forgetting. */
export const MAX_RECENT = 20

/** Everything remembered about one audio file the reader opened. */
export interface FileEpisodeRecord {
  /** `file.<sha1 of the canonical path, 16 hex>`. */
  readonly id: string
  /** Canonical absolute path of the audio file. */
  readonly path: string
  /** Display title: the file name without its extension. */
  readonly title: string
  /** The place it was picked from, and its path relative to that place. */
  readonly place: string
  readonly rel: string
  /** Audio file name, and the subtitle file names paired at open time. */
  readonly audio: string
  readonly subtitleEn: string | null
  readonly subtitleZh: string | null
  /** Milliseconds since the epoch, used only to order eviction. */
  readonly openedAt: number
}

/** The plugin's own memory, as one value. */
export interface OpenState {
  readonly version: 1
  /** The episode that is open, folder or file. */
  readonly current: OpenRef | null
  /** File episode ids, most recent first. */
  readonly recent: readonly string[]
  /** The file episode index. */
  readonly files: readonly FileEpisodeRecord[]
  /** Notes written against file episodes, keyed by id. */
  readonly notes: Readonly<Record<string, readonly NotePhrase[]>>
}

/** The state of a plugin that has never opened anything. */
export const EMPTY_STATE: OpenState = { version: 1, current: null, recent: [], files: [], notes: {} }

/** Whether an id names a file episode rather than a folder. */
export function isFileEpisodeId(id: string): boolean {
  return id.startsWith(FILE_EPISODE_PREFIX) && id.length > FILE_EPISODE_PREFIX.length
}

/**
 * The id of one audio file: its canonical path, hashed.
 *
 * The path is the identity on purpose. Renaming the file makes a different episode,
 * because the subtitles and the notes beside it were found by name; the id would
 * otherwise point at a file whose episode no longer exists.
 * @param path - canonical absolute path of the audio file.
 * @returns the episode id.
 */
export function fileEpisodeIdFor(path: string): string {
  return `${FILE_EPISODE_PREFIX}${createHash('sha1').update(path).digest('hex').slice(0, 16)}`
}

/** The reference the picker and the library listing name one file episode by. */
export function fileRef(record: FileEpisodeRecord): OpenRef {
  return { id: record.id, title: record.title, kind: 'file', source: record.path }
}

/** Normalise one incoming phrase, dropping anything that cannot be played back. */
export function sanitizePhrase(input: unknown): NotePhrase | null {
  if (typeof input !== 'object' || input === null) return null
  const record = input as Record<string, unknown>
  const at =
    typeof record.at === 'number' && Number.isFinite(record.at) && record.at >= 0 ? record.at : null
  const text = typeof record.text === 'string' ? record.text.trim() : ''
  if (at === null || text.length === 0) return null
  const tags = Array.isArray(record.tags)
    ? record.tags
        .filter((tag): tag is string => typeof tag === 'string')
        .map((tag) => tag.replace(/^#+/, '').trim())
        .filter((tag) => tag.length > 0)
    : []
  return {
    at,
    text,
    zh: typeof record.zh === 'string' ? record.zh.trim() : '',
    note: typeof record.note === 'string' ? record.note.trim() : '',
    tags,
    done: record.done === true,
  }
}

/**
 * Normalise a list of incoming phrases.
 *
 * Shared with the notes module, and that sharing is the point: a phrase written
 * against a file episode and one written into `notes.md` go through the same rule,
 * so the two stores cannot drift into accepting different things.
 * @param input - the raw list from a request body or from persisted state.
 * @returns the phrases that survived.
 */
export function sanitizePhrases(input: readonly unknown[]): NotePhrase[] {
  const phrases: NotePhrase[] = []
  for (const item of input) {
    const phrase = sanitizePhrase(item)
    if (phrase !== null) phrases.push(phrase)
  }
  return phrases
}

/** The counts the library listing shows for a file episode's notes. */
export function summarizePhrases(phrases: readonly NotePhrase[]): NotesSummary {
  return {
    exists: phrases.length > 0,
    count: phrases.length,
    review: phrases.filter((phrase) => phrase.tags.includes('review')).length,
    hard: phrases.filter((phrase) => phrase.tags.includes('hard')).length,
  }
}

/** Whether a value is a string, for the tolerant readers below. */
function isText(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

/** Read one persisted record, or `null` when it is not one. */
function readRecord(value: unknown): FileEpisodeRecord | null {
  if (typeof value !== 'object' || value === null) return null
  const record = value as Record<string, unknown>
  if (!isText(record.id) || !isFileEpisodeId(record.id)) return null
  if (!isText(record.path) || !isText(record.audio)) return null
  return {
    id: record.id,
    path: record.path,
    title: typeof record.title === 'string' && record.title.length > 0 ? record.title : record.audio,
    place: typeof record.place === 'string' ? record.place : '',
    rel: typeof record.rel === 'string' ? record.rel : '',
    audio: record.audio,
    subtitleEn: typeof record.subtitleEn === 'string' ? record.subtitleEn : null,
    subtitleZh: typeof record.subtitleZh === 'string' ? record.subtitleZh : null,
    openedAt: typeof record.openedAt === 'number' && Number.isFinite(record.openedAt) ? record.openedAt : 0,
  }
}

/** Read one persisted reference, or `null` when it is not one. */
function readRef(value: unknown): OpenRef | null {
  if (typeof value !== 'object' || value === null) return null
  const ref = value as Record<string, unknown>
  if (!isText(ref.id)) return null
  if (ref.kind !== 'folder' && ref.kind !== 'file') return null
  return {
    id: ref.id,
    title: typeof ref.title === 'string' && ref.title.length > 0 ? ref.title : ref.id,
    kind: ref.kind,
    source: typeof ref.source === 'string' ? ref.source : '',
  }
}

/**
 * Read the persisted string back into a state.
 * @param raw - the config field's value; empty when nothing has been opened.
 * @returns the state, or {@link EMPTY_STATE} when the string is not one.
 */
export function parseState(raw: string): OpenState {
  if (raw.trim().length === 0) return EMPTY_STATE
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return EMPTY_STATE
  }
  if (typeof parsed !== 'object' || parsed === null) return EMPTY_STATE
  const record = parsed as Record<string, unknown>
  if (record.version !== 1) return EMPTY_STATE

  const files: FileEpisodeRecord[] = []
  if (Array.isArray(record.files)) {
    for (const item of record.files) {
      const entry = readRecord(item)
      if (entry !== null) files.push(entry)
    }
  }

  const notes: Record<string, readonly NotePhrase[]> = {}
  if (typeof record.notes === 'object' && record.notes !== null) {
    for (const [id, value] of Object.entries(record.notes as Record<string, unknown>)) {
      if (!isFileEpisodeId(id) || !Array.isArray(value)) continue
      notes[id] = sanitizePhrases(value)
    }
  }

  const recent = Array.isArray(record.recent)
    ? record.recent.filter((id): id is string => typeof id === 'string' && isFileEpisodeId(id)).slice(0, MAX_RECENT)
    : []

  return { version: 1, current: readRef(record.current), recent, files, notes }
}

/**
 * Write the state back out.
 *
 * Field order is fixed by construction rather than inherited from the object, so
 * two runs that remember the same thing produce the same string and a profile diff
 * stays readable.
 * @param state - the state to persist.
 * @returns the JSON string.
 */
export function serializeState(state: OpenState): string {
  return JSON.stringify({
    version: 1,
    current: state.current,
    recent: state.recent,
    files: state.files,
    notes: state.notes,
  })
}

/** One file episode by id, or `null` when it is not in the index. */
export function findFileEpisode(state: OpenState, id: string): FileEpisodeRecord | null {
  return state.files.find((record) => record.id === id) ?? null
}

/** The notes written against one file episode. */
export function notesFor(state: OpenState, id: string): readonly NotePhrase[] {
  return state.notes[id] ?? []
}

/** The notes of one file episode, replaced wholesale. */
export function withNotes(state: OpenState, id: string, phrases: readonly NotePhrase[]): OpenState {
  const notes = { ...state.notes }
  if (phrases.length === 0) delete notes[id]
  else notes[id] = phrases
  return { ...state, notes }
}

/**
 * Keep the index inside its ceiling.
 *
 * The order is the point: entries that are neither recent nor annotated are the
 * ones nobody would miss, and they go first. Only when that is not enough does the
 * oldest entry with something worth keeping go, which is what the ceiling means —
 * notes outlive the index entry they came from only until the index is full.
 */
function capIndex(state: OpenState): OpenState {
  if (state.files.length <= MAX_FILE_EPISODES) return state

  const recent = new Set(state.recent)
  const oldestFirst = [...state.files].sort((left, right) => left.openedAt - right.openedAt)
  const dropped = new Set<string>()
  let overflow = state.files.length - MAX_FILE_EPISODES

  for (const record of oldestFirst) {
    if (overflow <= 0) break
    if (recent.has(record.id) || notesFor(state, record.id).length > 0) continue
    dropped.add(record.id)
    overflow -= 1
  }
  for (const record of oldestFirst) {
    if (overflow <= 0) break
    if (dropped.has(record.id)) continue
    dropped.add(record.id)
    overflow -= 1
  }

  const notes: Record<string, readonly NotePhrase[]> = {}
  for (const [id, phrases] of Object.entries(state.notes)) {
    if (!dropped.has(id)) notes[id] = phrases
  }
  return { ...state, files: state.files.filter((record) => !dropped.has(record.id)), notes }
}

/**
 * Remember one opened file episode: refresh its record, make it current, and mark
 * it recent.
 * @param state - the state before the open.
 * @param record - what was opened.
 * @returns the state after it.
 */
export function withOpenedFile(state: OpenState, record: FileEpisodeRecord): OpenState {
  const files = [record, ...state.files.filter((entry) => entry.id !== record.id)]
  const recent = [record.id, ...state.recent.filter((id) => id !== record.id)].slice(0, MAX_RECENT)
  return capIndex({ ...state, files, recent, current: fileRef(record) })
}

/**
 * Remember which episode is open, without touching the index.
 *
 * Used for folder episodes, which are rediscovered by the scan and therefore need
 * no record — only the note that this, and not the library default, is what the
 * reader had open.
 * @param state - the state before.
 * @param ref - the episode now open, or `null` to forget.
 * @returns the state after.
 */
export function withCurrent(state: OpenState, ref: OpenRef | null): OpenState {
  return { ...state, current: ref }
}
