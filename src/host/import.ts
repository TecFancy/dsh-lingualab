/**
 * Receiving the files a reader drops on the page.
 *
 * This is the one place the plugin writes into the media folder, and it is narrow on
 * purpose. The rule it bends is "the material folder is read-only": a panel that can
 * only open what is already on disk cannot be the first thing a new reader does, and
 * copying files into a folder by hand is the step that made the page unusable on day
 * one. What survives of the rule is everything that made it worth having.
 *
 *   · **Nothing is overwritten.** A name that exists is reported as `exists` and the
 *     existing file is left exactly as it was. Replacing someone's audio because a
 *     drag landed twice is the failure this whole module is arranged to make impossible.
 *   · **Only media goes in.** The extension must be one the scan would accept (audio, video or
 *     subtitles), so the route cannot be used to put an arbitrary file on somebody's disk.
 *   · **Names are cleaned, never trusted.** The folder and the file name come from the
 *     browser. Separators, `..`, control characters and the names Windows reserves are
 *     removed or refused, and the final path is checked to be inside the root after the
 *     folder exists, so a symlinked folder cannot lead the write out of the library.
 *   · **A write is whole or absent.** The body goes to a dot-prefixed temporary file in
 *     the same folder, which the scan ignores, and is moved into place only when every
 *     byte has arrived. An interrupted upload leaves no half-file that looks like audio,
 *     and a .part left by a crash is swept the next time that folder is written to.
 *   · **Bounded.** A file is capped at 2 GB, at most {@link MAX_CONCURRENT_IMPORTS} run at once,
 *     and a request that is already known to be refused is cut off rather than read to the end.
 */
import {
  constants,
  copyFileSync,
  createWriteStream,
  existsSync,
  linkSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  statSync,
  unlinkSync,
} from 'node:fs'
import { randomBytes } from 'node:crypto'
import type { IncomingMessage } from 'node:http'
import { extname, join } from 'node:path'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import {
  AUDIO_EXTENSIONS,
  MAX_IMPORT_BYTES,
  SUBTITLE_EXTENSIONS,
  VIDEO_EXTENSIONS,
  type ImportPayload,
} from '../shared/protocol.ts'
import { stemOf } from '../shared/stem.ts'
import { forbiddenReason, isInside } from './places.ts'

/** The longest folder or file name accepted, which is well under every filesystem's own limit. */
const MAX_NAME_LENGTH = 120

/** Names Windows will not create, whatever their extension. */
const RESERVED = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i

/** Characters no mainstream filesystem accepts in a name, plus the control range. */
// eslint-disable-next-line no-control-regex
const FORBIDDEN = /[<>:"/\\|?*\u0000-\u001f]/g

/**
 * Make one path segment safe to create, or say there is nothing safe to make.
 * @param raw - the name as the browser sent it.
 * @returns the cleaned name, or `null` when nothing usable is left.
 */
export function cleanName(raw: string): string | null {
  let name = raw.replace(FORBIDDEN, '_').trim()
  // A name made only of dots is a path component, not a name.
  name = name.replace(/^\.+/, '').replace(/[. ]+$/, '')
  if (name.length === 0) return null
  if (name.length > MAX_NAME_LENGTH) {
    const extension = extname(name)
    name = `${name.slice(0, MAX_NAME_LENGTH - extension.length)}${extension}`
  }
  const stem = name.includes('.') ? name.slice(0, name.indexOf('.')) : name
  if (RESERVED.test(stem)) name = `_${name}`
  return name
}

/** What kind of file an extension is, or `null` for one this route will not take. */
export function importKind(fileName: string): 'audio' | 'video' | 'subtitle' | null {
  const extension = extname(fileName).slice(1).toLowerCase()
  if ((AUDIO_EXTENSIONS as readonly string[]).includes(extension)) return 'audio'
  if ((VIDEO_EXTENSIONS as readonly string[]).includes(extension)) return 'video'
  if ((SUBTITLE_EXTENSIONS as readonly string[]).includes(extension)) return 'subtitle'
  return null
}

/** One refusal, shaped like every other answer from this route. */
function refuse(reason: string, root: string | null = null, retryable = false): ImportPayload {
  return { ok: false, code: 'refused', reason, episode: null, file: null, bytes: 0, root, retryable }
}

/**
 * How many imports may be writing at once.
 *
 * Every request holds a file handle and up to 2 GB of disk. Two covers the page's own
 * use (it sends one file at a time, and a second window is plausible) and stops a loop of
 * requests from filling a disk before anyone notices. A refused request is answered
 * immediately and the page waits and retries it.
 */
export const MAX_CONCURRENT_IMPORTS = 2

/** Uploads in flight right now, across every request this process is serving. */
let inFlight = 0

/** A leftover `.part` file older than this is from a request that is gone. */
const STALE_PART_MS = 60 * 60 * 1000

/** What an import asks of the host. */
export interface ImportRequest {
  /** The library root. Empty when the plugin has nowhere to put anything. */
  readonly root: string
  /** The folder to put the file in; empty means "named after the file". */
  readonly episode: string
  readonly file: string
  /** The declared body length, when the client sent one. */
  readonly declaredBytes: number | null
  /** The ceiling for one file. Injectable so the streaming limit can be tested with small bodies. */
  readonly maxBytes?: number
}

/**
 * Stop reading the request, so the client sees the answer and not a reset.
 *
 * For a refusal known before any byte is wanted. Reading the rest to throw it away would
 * make a refusal cost as much as an upload (up to 2 GB), which is the wrong way round, so
 * a body that has not started is not read at all. The answer is written by the caller;
 * `req.destroy()` here would cut the connection before it could be sent.
 */
function ignoreBody(req: IncomingMessage): void {
  req.on('error', () => undefined)
  req.resume()
}

/** A transform that fails the pipeline the moment the body outgrows its ceiling. */
function limiter(limit: number, counted: { bytes: number }): Transform {
  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      counted.bytes += chunk.byteLength
      if (counted.bytes > limit) {
        callback(new Error('文件太大'))
        return
      }
      callback(null, chunk)
    },
  })
}

/** Remove a file and say nothing if it is already gone. */
function quietUnlink(path: string): void {
  try {
    unlinkSync(path)
  } catch {
    // Already gone, or never created.
  }
}

/**
 * Delete stale `.part` files in an episode folder.
 *
 * A process that dies mid-upload cannot clean up after itself, and the scan hides
 * dot-files, so without this they would sit in the folder for good. Only files this
 * module names (a leading dot and a trailing `.part`) and only old ones are touched, so a
 * live upload, which is minutes old at the most, is never in the way.
 */
function sweepStale(directory: string, now = Date.now()): void {
  let names: string[]
  try {
    names = readdirSync(directory)
  } catch {
    return
  }
  for (const name of names) {
    if (!name.startsWith('.') || !name.endsWith('.part')) continue
    const path = join(directory, name)
    try {
      if (now - statSync(path).mtimeMs > STALE_PART_MS) unlinkSync(path)
    } catch {
      // Raced with its own writer finishing; nothing to do.
    }
  }
}

/** Remove an episode folder this request created and left empty. */
function removeIfEmpty(directory: string): void {
  try {
    if (readdirSync(directory).length === 0) rmdirSync(directory)
  } catch {
    // Not empty, or already gone: either way it is not ours to remove.
  }
}

/**
 * Move a finished temporary file to its final name without ever replacing a file.
 *
 * A hard link is the one call that fails when the target exists, on every filesystem that
 * supports it. Where it does not (some network shares and removable volumes), the
 * fallback is a copy with `COPYFILE_EXCL`, which is also an exclusive create: two writers
 * racing for one name cannot both succeed. A rename would not be, because on every
 * platform it replaces its target.
 * @returns `false` when the name was taken by the time the file was ready.
 * @throws when the file could not be placed for a reason other than the name being taken.
 */
function place(temp: string, final: string): boolean {
  try {
    linkSync(temp, final)
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'EEXIST' || existsSync(final)) {
      quietUnlink(temp)
      return false
    }
    // The link failed for a reason other than the name being taken. If that is "this
    // volume has no hard links" the exclusive copy below is the right answer; if it is
    // anything else the copy will fail for the same reason and say so.
    try {
      copyFileSync(temp, final, constants.COPYFILE_EXCL)
    } catch (copyError) {
      if ((copyError as NodeJS.ErrnoException).code === 'EEXIST') {
        quietUnlink(temp)
        return false
      }
      throw copyError
    }
  }
  // The file is in place. Removing the temporary name is housekeeping, and failing to
  // must not turn a saved file into a reported failure.
  quietUnlink(temp)
  return true
}

/**
 * Receive one file into the library.
 * @param request - the folder, the file name, and the library root.
 * @param body - the request, read as a stream.
 * @returns the payload to send; never throws.
 */
export async function importFile(request: ImportRequest, body: IncomingMessage): Promise<ImportPayload> {
  const limit = request.maxBytes ?? MAX_IMPORT_BYTES
  const refusal = (reason: string, retryable = false): ImportPayload => {
    ignoreBody(body)
    return refuse(reason, request.root.length > 0 ? request.root : null, retryable)
  }

  if (request.root.trim().length === 0) return refusal('还没有媒体目录，没法放文件')

  // The same guard the browser's folder picker is held to. A media folder pointed at a
  // system folder (by a typo, or by a request to the config route) must not become a
  // place this route creates folders in.
  if (forbiddenReason(request.root) !== null) return refusal('媒体目录不能是系统文件夹')

  const file = cleanName(request.file)
  if (file === null) return refusal('文件名不能用')
  if (importKind(file) === null) return refusal('只收音频、视频和字幕（srt、vtt、lrc）')

  const folder = cleanName(request.episode.length > 0 ? request.episode : stemOf(file))
  if (folder === null) return refusal('剧集名不能用')

  if (request.declaredBytes !== null && request.declaredBytes > limit) return refusal('文件太大，单个最多 2 GB')

  if (inFlight >= MAX_CONCURRENT_IMPORTS) return refusal('正在导入别的文件，请稍后再试', true)
  inFlight += 1
  try {
    return await receive(request, body, { file, folder, limit })
  } finally {
    inFlight -= 1
  }
}

/** The validated parts of a request, so the receiving half reads no raw input. */
interface Checked {
  readonly file: string
  readonly folder: string
  readonly limit: number
}

/** Create the folder, stream the body into a temporary file, and move it into place. */
async function receive(request: ImportRequest, body: IncomingMessage, checked: Checked): Promise<ImportPayload> {
  const { file, folder, limit } = checked
  const fail = (reason: string): ImportPayload => {
    ignoreBody(body)
    return refuse(reason, request.root)
  }

  try {
    mkdirSync(request.root, { recursive: true })
  } catch (error) {
    return fail(`媒体目录建不出来：${String(error)}`)
  }

  const directory = join(request.root, folder)
  let created = false
  try {
    if (existsSync(directory)) {
      if (!statSync(directory).isDirectory()) return fail('已经有一个同名的文件，换个剧集名')
    } else {
      mkdirSync(directory)
      created = true
    }
  } catch (error) {
    return fail(`剧集文件夹建不出来：${String(error)}`)
  }
  // After the folder exists: a symlink named like an episode would otherwise take the
  // write wherever it points.
  if (!isInside(request.root, directory)) {
    if (created) removeIfEmpty(directory)
    return fail('这个剧集文件夹指到媒体目录外面了')
  }

  sweepStale(directory)

  const final = join(directory, file)
  const base = { episode: folder, file, root: request.root }
  if (existsSync(final)) {
    ignoreBody(body)
    return { ok: true, code: 'exists', reason: null, bytes: 0, ...base }
  }

  // A random suffix, not the pid: every request in this process shares the pid, so two
  // uploads of the same name raced onto one temporary file and one of them lost its
  // file mid-rename and threw. `wx` below still refuses to reuse a name that exists.
  const temp = join(directory, `.${file}.${randomBytes(6).toString('hex')}.part`)
  const counted = { bytes: 0 }
  const abandon = (reason: string): ImportPayload => {
    quietUnlink(temp)
    // A folder this request made and that holds nothing is an episode with no audio,
    // which the home hides and "open" cannot open. Leave nothing behind.
    if (created) removeIfEmpty(directory)
    return refuse(reason, request.root)
  }

  try {
    await pipeline(body, limiter(limit, counted), createWriteStream(temp, { flags: 'wx' }))
  } catch (error) {
    return abandon(`没收完：${String(error instanceof Error ? error.message : error)}`)
  }
  if (counted.bytes === 0) return abandon('收到的是空文件')

  // The contract of this module is that it never throws, so the last step is guarded too:
  // a placement that fails for a reason nobody predicted is a refusal with the reason, not
  // a rejected promise that the route would turn into an empty 400.
  try {
    if (!place(temp, final)) return { ok: true, code: 'exists', reason: null, bytes: 0, ...base }
  } catch (error) {
    return abandon(`没能放到位：${String(error instanceof Error ? error.message : error)}`)
  }
  return { ok: true, code: 'saved', reason: null, bytes: counted.bytes, ...base }
}
