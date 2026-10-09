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
 *   · **Only media goes in.** The extension must be one the scan would accept, so the
 *     route cannot be used to put an arbitrary file on somebody's disk.
 *   · **Names are cleaned, never trusted.** The folder and the file name come from the
 *     browser. Separators, `..`, control characters and the names Windows reserves are
 *     removed or refused, and the final path is checked to be inside the root after the
 *     folder exists, so a symlinked folder cannot lead the write out of the library.
 *   · **A write is whole or absent.** The body goes to a dot-prefixed temporary file in
 *     the same folder, which the scan ignores, and is moved into place only when every
 *     byte has arrived. An interrupted upload leaves no half-file that looks like audio.
 */
import {
  createWriteStream,
  existsSync,
  linkSync,
  mkdirSync,
  renameSync,
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
  type ImportPayload,
} from '../shared/protocol.ts'
import { isInside } from './places.ts'

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
export function importKind(fileName: string): 'audio' | 'subtitle' | null {
  const extension = extname(fileName).slice(1).toLowerCase()
  if ((AUDIO_EXTENSIONS as readonly string[]).includes(extension)) return 'audio'
  if ((SUBTITLE_EXTENSIONS as readonly string[]).includes(extension)) return 'subtitle'
  return null
}

/** The file name without its last extension, used as the folder when none is given. */
function stemOf(fileName: string): string {
  const extension = extname(fileName)
  return extension.length === 0 ? fileName : fileName.slice(0, -extension.length)
}

/** One refusal, shaped like every other answer from this route. */
function refuse(reason: string, root: string | null = null): ImportPayload {
  return { ok: false, code: 'refused', reason, episode: null, file: null, bytes: 0, root }
}

/** What an import asks of the host. */
export interface ImportRequest {
  /** The library root. Empty when the plugin has nowhere to put anything. */
  readonly root: string
  /** The folder to put the file in; empty means "named after the file". */
  readonly episode: string
  readonly file: string
  /** The declared body length, when the client sent one. */
  readonly declaredBytes: number | null
}

/**
 * Throw the rest of a body away without storing it.
 *
 * Used when the answer is already known to be "no": answering and then leaving the
 * browser still uploading a gigabyte makes some clients report a network error instead
 * of the sentence. Reading is capped, because discarding is not a licence to be sent
 * unbounded data.
 */
async function drain(req: IncomingMessage): Promise<void> {
  let seen = 0
  try {
    for await (const chunk of req) {
      seen += (chunk as Buffer).byteLength
      if (seen > MAX_IMPORT_BYTES) {
        req.destroy()
        return
      }
    }
  } catch {
    // The client went away; there is nobody left to tell.
  }
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

/**
 * Move a finished temporary file to its final name without ever replacing a file.
 *
 * A hard link is the one call that fails when the target exists, on every filesystem
 * that supports it; where it does not (some network and removable volumes), the
 * fallback checks and renames, which has a window nobody will hit with one reader.
 * @returns `false` when the name was taken by the time the file was ready.
 */
function place(temp: string, final: string): boolean {
  try {
    linkSync(temp, final)
    unlinkSync(temp)
    return true
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'EEXIST' || existsSync(final)) {
      try {
        unlinkSync(temp)
      } catch {
        // The temporary file is already gone; the answer does not depend on it.
      }
      return false
    }
    // No hard links on this volume. The existence check above is the best this fallback
    // can do, and a rename onto a name that appeared in the meantime would replace it,
    // so refuse if one did instead of calling `renameSync` blind.
    if (code !== 'EPERM' && code !== 'ENOTSUP' && code !== 'EXDEV' && code !== 'EOPNOTSUPP') throw error
    if (existsSync(final)) {
      unlinkSync(temp)
      return false
    }
    renameSync(temp, final)
    return true
  }
}

/**
 * Receive one file into the library.
 * @param request - the folder, the file name, and the library root.
 * @param body - the request, read as a stream.
 * @returns the payload to send; never throws.
 */
export async function importFile(request: ImportRequest, body: IncomingMessage): Promise<ImportPayload> {
  const answer = async (payload: ImportPayload): Promise<ImportPayload> => {
    await drain(body)
    return payload
  }

  if (request.root.trim().length === 0) {
    return await answer(refuse('还没有媒体目录，没法放文件'))
  }

  const file = cleanName(request.file)
  if (file === null) return await answer(refuse('文件名不能用', request.root))
  const kind = importKind(file)
  if (kind === null) return await answer(refuse('只收音频和字幕（srt、vtt、lrc）', request.root))

  const folder = cleanName(request.episode.length > 0 ? request.episode : stemOf(file))
  if (folder === null) return await answer(refuse('剧集名不能用', request.root))

  if (request.declaredBytes !== null && request.declaredBytes > MAX_IMPORT_BYTES) {
    return await answer(refuse('文件太大，单个最多 2 GB', request.root))
  }

  try {
    mkdirSync(request.root, { recursive: true })
  } catch (error) {
    return await answer(refuse(`媒体目录建不出来：${String(error)}`, request.root))
  }

  const directory = join(request.root, folder)
  try {
    if (existsSync(directory) && !statSync(directory).isDirectory()) {
      return await answer(refuse('已经有一个同名的文件，换个剧集名', request.root))
    }
    mkdirSync(directory, { recursive: true })
  } catch (error) {
    return await answer(refuse(`剧集文件夹建不出来：${String(error)}`, request.root))
  }
  // After the folder exists: a symlink named like an episode would otherwise take the
  // write wherever it points.
  if (!isInside(request.root, directory)) {
    return await answer(refuse('这个剧集文件夹指到媒体目录外面了', request.root))
  }

  const final = join(directory, file)
  const base = { episode: folder, file, root: request.root }
  if (existsSync(final)) {
    await drain(body)
    return { ok: true, code: 'exists', reason: null, bytes: 0, ...base }
  }

  // A random suffix, not the pid: every request in this process shares the pid, so two
  // uploads of the same name raced onto one temporary file and one of them lost its
  // file mid-rename and threw. `wx` below still refuses to reuse a name that exists.
  const temp = join(directory, `.${file}.${randomBytes(6).toString('hex')}.part`)
  const counted = { bytes: 0 }
  const discard = (): void => {
    try {
      unlinkSync(temp)
    } catch {
      // Already gone, or never created: nothing half-written is left either way.
    }
  }

  try {
    await pipeline(body, limiter(MAX_IMPORT_BYTES, counted), createWriteStream(temp, { flags: 'wx' }))
  } catch (error) {
    discard()
    return refuse(`没收完：${String(error instanceof Error ? error.message : error)}`, request.root)
  }

  if (counted.bytes === 0) {
    discard()
    return refuse('收到的是空文件', request.root)
  }

  // The contract of this module is that it never throws, so the last step is guarded too:
  // a rename that fails for a reason nobody predicted is a refusal with the reason, not a
  // rejected promise that the route would turn into an empty 400.
  try {
    if (!place(temp, final)) return { ok: true, code: 'exists', reason: null, bytes: 0, ...base }
  } catch (error) {
    discard()
    return refuse(`没能放到位：${String(error instanceof Error ? error.message : error)}`, request.root)
  }
  return { ok: true, code: 'saved', reason: null, bytes: counted.bytes, ...base }
}
