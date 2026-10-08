/**
 * Reading and writing one episode's notes.
 *
 * The file is the hand-off between the panel and the agent: the panel writes it
 * while listening, and the agent reads it later to run the next-day review and
 * the weekly quiz. Both therefore go through {@link parseNotes} and
 * {@link serializeNotes} rather than treating the markdown as opaque text.
 *
 * Writes are whole-file and last-writer-wins. That is deliberate for V1: one
 * person, one browser, and a file small enough to rewrite in a single call. A
 * merge strategy would be guessing at a conflict that does not exist yet.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { MAX_PHRASES, parseNotes, serializeNotes } from '../shared/notes-format.ts'
import { NOTES_FILE, type NotePhrase, type NotesPayload } from '../shared/protocol.ts'

/** Episode ids name a folder, so they may not contain separators or escapes. */
export function isSafeEpisodeId(id: string): boolean {
  return id.length > 0 && !id.includes('/') && !id.includes('\\') && id !== '.' && id !== '..'
}

/** The preamble a fresh notes file opens with. */
function defaultPreamble(episode: string): string {
  return [
    `# ${episode} 笔记`,
    '',
    `> 每集最多 ${MAX_PHRASES} 条。写满了先删一条再记，或者替换掉最不想要的那条。`,
    '> 想不起的加 `#review`，周日还记不住的加 `#hard`。',
  ].join('\n')
}

/** Where an episode's notes live. */
export function notesPath(root: string, episode: string): string {
  return join(root, episode, NOTES_FILE)
}

/** Read the notes for one episode; a missing file is an empty list, not an error. */
export function readNotes(root: string, episode: string): NotesPayload {
  if (!isSafeEpisodeId(episode)) {
    return { ok: false, episode, reason: '剧集 id 不合法', phrases: [] }
  }
  const path = notesPath(root, episode)
  if (!existsSync(path)) {
    return { ok: true, episode, reason: null, phrases: [] }
  }
  try {
    const { phrases } = parseNotes(readFileSync(path, 'utf8'))
    return { ok: true, episode, reason: null, phrases }
  } catch (error) {
    return { ok: false, episode, reason: `读不了笔记：${String(error)}`, phrases: [] }
  }
}

/** Normalise one incoming phrase, dropping anything that cannot be played back. */
function sanitizePhrase(input: unknown): NotePhrase | null {
  if (typeof input !== 'object' || input === null) return null
  const record = input as Record<string, unknown>
  const at = typeof record.at === 'number' && Number.isFinite(record.at) && record.at >= 0 ? record.at : null
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
 * Replace an episode's notes.
 *
 * The ceiling is enforced here as well as in the panel: the panel is a client
 * and clients get bypassed, so the rule that gives the method its discipline is
 * a property of the file, not of one UI. Refusing is explicit — the caller gets
 * `ok: false` and the reason, never a silently truncated list.
 */
export function writeNotes(root: string, episode: string, input: readonly unknown[]): NotesPayload {
  if (!isSafeEpisodeId(episode)) {
    return { ok: false, episode, reason: '剧集 id 不合法', phrases: [] }
  }
  const phrases: NotePhrase[] = []
  for (const item of input) {
    const phrase = sanitizePhrase(item)
    if (phrase !== null) phrases.push(phrase)
  }
  if (phrases.length > MAX_PHRASES) {
    return {
      ok: false,
      episode,
      reason: `一集最多 ${MAX_PHRASES} 条，收到 ${phrases.length} 条`,
      phrases: [],
    }
  }

  const path = notesPath(root, episode)
  try {
    const preamble = existsSync(path)
      ? parseNotes(readFileSync(path, 'utf8')).preamble
      : defaultPreamble(episode)
    writeFileSync(path, serializeNotes(preamble.length > 0 ? preamble : defaultPreamble(episode), phrases), 'utf8')
  } catch (error) {
    return { ok: false, episode, reason: `写不了笔记：${String(error)}`, phrases: [] }
  }
  return { ok: true, episode, reason: null, phrases }
}
