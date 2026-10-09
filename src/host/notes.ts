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
 *
 * There are two stores behind one route, and the id decides which one answers. A
 * folder episode writes `notes.md` inside its folder, where the agent's grep finds
 * it. A file episode has no folder of its own inside the library — the audio is
 * wherever the reader keeps it — so its phrases live in the plugin state instead.
 * The ceiling and the phrase shape are the same in both, because
 * {@link sanitizePhrases} and the ceiling check are the same in both.
 */
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative } from 'node:path'
import { MAX_PHRASES, parseNotes, serializeNotes } from '../shared/notes-format.ts'
import { NOTES_FILE, type NotePhrase, type NotesPayload } from '../shared/protocol.ts'
import {
  EMPTY_STATE,
  isFileEpisodeId,
  notesFor,
  sanitizePhrases,
  withNotes,
  type OpenState,
} from './state.ts'

/** Episode ids name a folder, so they may not contain separators or escapes. */
export function isSafeEpisodeId(id: string): boolean {
  return id.length > 0 && !id.includes('/') && !id.includes('\\') && id !== '.' && id !== '..'
}

/** The preamble a fresh notes file opens with. */
function defaultPreamble(episode: string): string {
  return [
    `# ${episode} 笔记`,
    '',
    '> 记得住了就打勾，勾掉的句子不再算「还在练」。',
    '> 想不起的加 `#review`，周日还记不住的加 `#hard`。',
  ].join('\n')
}

/** Where an episode's notes live. */
export function notesPath(root: string, episode: string): string {
  return join(root, episode, NOTES_FILE)
}

/**
 * Whether the resolved notes path is still inside the library.
 *
 * The id check above rejects `..`, and this catches what it cannot: an episode
 * folder that is a symlink pointing outside the root. The comparison has to be
 * between *real* paths — a lexical `relative` answers "inside" for a symlink,
 * because it never touches the filesystem. The containing directory is resolved
 * rather than the file, so a notes file that does not exist yet can still be
 * checked before it is written.
 */
function staysInside(root: string, target: string): boolean {
  try {
    const within = relative(realpathSync(root), join(realpathSync(dirname(target)), basename(target)))
    return within.length > 0 && !within.startsWith('..') && !isAbsolute(within)
  } catch {
    return false
  }
}

/** Read the notes for one episode; a missing file is an empty list, not an error. */
export function readNotes(root: string, episode: string, state: OpenState = EMPTY_STATE): NotesPayload {
  if (!isSafeEpisodeId(episode)) {
    return { ok: false, episode, reason: '剧集 id 不合法', phrases: [] }
  }
  if (isFileEpisodeId(episode)) {
    return { ok: true, episode, reason: null, phrases: [...notesFor(state, episode)] }
  }
  const path = notesPath(root, episode)
  if (!staysInside(root, path)) {
    return { ok: false, episode, reason: '笔记路径跑到素材目录外面了', phrases: [] }
  }
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

/** The payload of a write, plus the state it produced. */
export interface NotesWriteResult {
  readonly payload: NotesPayload
  /** Identity-equal to the input state unless a file episode's notes changed. */
  readonly state: OpenState
}

/**
 * Replace an episode's notes.
 *
 * The sanity ceiling is enforced here, not only in the panel: the panel is a client
 * and clients get bypassed, and a notes file is read back by the agent in full. Refusing
 * is explicit — the caller gets `ok: false` and the reason, never a silently
 * truncated list.
 *
 * The state comes back with the payload so the caller can persist it; a folder
 * episode returns the state it was given, untouched.
 */
export function writeNotes(
  root: string,
  episode: string,
  input: readonly unknown[],
  state: OpenState = EMPTY_STATE,
): NotesWriteResult {
  if (!isSafeEpisodeId(episode)) {
    return { payload: { ok: false, episode, reason: '剧集 id 不合法', phrases: [] }, state }
  }
  const phrases: NotePhrase[] = sanitizePhrases(input)
  if (phrases.length > MAX_PHRASES) {
    return {
      payload: {
        ok: false,
        episode,
        reason: `一集的笔记最多 ${MAX_PHRASES} 条，收到 ${phrases.length} 条`,
        phrases: [],
      },
      state,
    }
  }

  if (isFileEpisodeId(episode)) {
    return { payload: { ok: true, episode, reason: null, phrases }, state: withNotes(state, episode, phrases) }
  }

  const path = notesPath(root, episode)
  if (!staysInside(root, path)) {
    return { payload: { ok: false, episode, reason: '笔记路径跑到素材目录外面了', phrases: [] }, state }
  }
  try {
    const preamble = existsSync(path)
      ? parseNotes(readFileSync(path, 'utf8')).preamble
      : defaultPreamble(episode)
    writeFileSync(path, serializeNotes(preamble.length > 0 ? preamble : defaultPreamble(episode), phrases), 'utf8')
  } catch (error) {
    return { payload: { ok: false, episode, reason: `写不了笔记：${String(error)}`, phrases: [] }, state }
  }
  return { payload: { ok: true, episode, reason: null, phrases }, state }
}
