/**
 * Reading and writing one episode's notes.
 *
 * The file is the hand-off between the panel and the agent: the panel writes it
 * while listening, and the agent reads it later to run the next-day review and
 * the weekly quiz. Both therefore go through {@link parseNotes} and
 * {@link serializeNotes} rather than treating the markdown as opaque text.
 *
 * Writes are whole-file, and two rules keep a whole-file write from losing anything:
 *
 *   · **The write is atomic.** The new text goes to a temporary sibling that is then renamed
 *     over the old file, as the progress file does, so a crash leaves the old notes or the new
 *     ones and never half of either.
 *   · **A stale save is refused.** A read answers with a hash of the bytes it parsed, and a save
 *     sends that hash back. If the file changed in between (another tab, a hand edit, the agent),
 *     the save is answered `stale` and nothing is written; the page reads the notes again. A
 *     successful save answers with the hash of what it wrote, so one tab saving twice in a row
 *     is never its own conflict.
 *
 * There are two stores behind one route, and the id decides which one answers. A
 * folder episode writes `notes.md` inside its folder, where the agent's grep finds
 * it. A file episode has no folder of its own inside the library — the audio is
 * wherever the reader keeps it — so its phrases live in the plugin state instead.
 * The ceiling and the phrase shape are the same in both, because
 * {@link sanitizePhrases} and the ceiling check are the same in both.
 *
 * A folder episode cut into segments keeps one notes.md, with a heading per segment. The
 * format module owns the headings; this module only tells it the order of the segments,
 * which is the folder's own (the scan's), so the file reads in play order however the
 * phrases arrived. The ceiling counts the whole file, not each segment.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative } from 'node:path'
import { MAX_PHRASES, parseNotes, serializeNotes, withSegmentDefault } from '../shared/notes-format.ts'
import { NOTES_FILE, type NotePhrase, type NotesPayload } from '../shared/protocol.ts'
import { scanSegments } from './library.ts'
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

/**
 * The preamble a fresh notes file opens with: what the grades are, and how a line carries them,
 * for whoever opens the file in an editor.
 */
function defaultPreamble(episode: string): string {
  return [
    `# ${episode} 笔记`,
    '',
    '> 每句收藏只有一个状态，在页面上按 1 记住了、2 模糊、3 没记住。',
    '> 文件里打勾 `[x]` 是记住了，`#review` 是模糊，`#hard` 是没记住，都没有是新收藏。',
  ].join('\n')
}

/** The version of a notes file: a hash of its bytes, with a missing file hashed as an empty one. */
export function notesVersion(bytes: Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex')
}

/** The bytes of a notes file, or none when it does not exist yet. */
function readBytes(path: string): Buffer {
  return existsSync(path) ? readFileSync(path) : Buffer.alloc(0)
}

/** Replace the file through a temporary sibling, leaving the old one if anything fails. */
function writeAtomically(path: string, text: string): void {
  const temporary = `${path}.${String(process.pid)}.tmp`
  try {
    writeFileSync(temporary, text, 'utf8')
    renameSync(temporary, path)
  } catch (error) {
    rmSync(temporary, { force: true })
    throw error
  }
}

/** A refusal: nothing was written, and the page should not take the phrases as saved. */
function refused(episode: string, reason: string, stale = false): NotesPayload {
  return { ok: false, episode, reason, phrases: [], version: null, stale }
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

/**
 * The segment ids of one episode folder in play order; empty for an episode without segments.
 *
 * Read from the folder at the moment of the call rather than remembered, so adding a scene
 * and saving once is enough for the file to follow.
 */
function segmentIdsOf(folder: string): string[] {
  try {
    const names = readdirSync(folder).filter((name) => !name.startsWith('.'))
    return scanSegments(folder, names).map((segment) => segment.id)
  } catch {
    return []
  }
}

/** Read the notes for one episode; a missing file is an empty list, not an error. */
export function readNotes(root: string, episode: string, state: OpenState = EMPTY_STATE): NotesPayload {
  if (!isSafeEpisodeId(episode)) return refused(episode, '剧集 id 不合法')
  if (isFileEpisodeId(episode)) {
    return { ok: true, episode, reason: null, phrases: [...notesFor(state, episode)], version: null, stale: false }
  }
  const path = notesPath(root, episode)
  if (!staysInside(root, path)) return refused(episode, '笔记路径跑到素材目录外面了')
  try {
    const bytes = readBytes(path)
    const { phrases } = parseNotes(bytes.toString('utf8'))
    // What was written before the episode had segments belongs to the first one.
    const first = segmentIdsOf(dirname(path))[0]
    return {
      ok: true,
      episode,
      reason: null,
      phrases: [...withSegmentDefault(phrases, first)],
      version: notesVersion(bytes),
      stale: false,
    }
  } catch (error) {
    return refused(episode, `读不了笔记：${String(error)}`)
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
 *
 * `expect` is the version the page read. A folder episode's file is only replaced while it
 * still has that version; `null` (the page never read the file) is refused too, because a page
 * that could not read the notes has no business overwriting them. Left out, nothing is
 * compared: that is for callers inside the host, never for the route.
 */
export function writeNotes(
  root: string,
  episode: string,
  input: readonly unknown[],
  state: OpenState = EMPTY_STATE,
  expect?: string | null,
): NotesWriteResult {
  if (!isSafeEpisodeId(episode)) return { payload: refused(episode, '剧集 id 不合法'), state }
  const phrases: NotePhrase[] = sanitizePhrases(input)
  if (phrases.length > MAX_PHRASES) {
    return { payload: refused(episode, `一集的笔记最多 ${MAX_PHRASES} 条，收到 ${phrases.length} 条`), state }
  }

  if (isFileEpisodeId(episode)) {
    return {
      payload: { ok: true, episode, reason: null, phrases, version: null, stale: false },
      state: withNotes(state, episode, phrases),
    }
  }

  const path = notesPath(root, episode)
  if (!staysInside(root, path)) return { payload: refused(episode, '笔记路径跑到素材目录外面了'), state }
  if (expect === null) return { payload: refused(episode, '页面没读到这一集的笔记，不覆盖它'), state }
  let written: string
  try {
    const bytes = readBytes(path)
    if (expect !== undefined && notesVersion(bytes) !== expect) {
      return { payload: refused(episode, '笔记在页面读过之后被改过了，已经重新读取，刚才那一下没有保存', true), state }
    }
    const preamble = bytes.length > 0 ? parseNotes(bytes.toString('utf8')).preamble : ''
    const order = segmentIdsOf(dirname(path))
    written = serializeNotes(preamble.length > 0 ? preamble : defaultPreamble(episode), phrases, order)
    writeAtomically(path, written)
  } catch (error) {
    return { payload: refused(episode, `写不了笔记：${String(error)}`), state }
  }
  return { payload: { ok: true, episode, reason: null, phrases, version: notesVersion(written), stale: false }, state }
}
