/**
 * Serving one media file out of the library.
 *
 * Two things here are not optional for a listening panel.
 *
 * **Range requests.** Without them the browser downloads a whole episode before
 * the scrubber works, so "jump back three seconds and replay" — the single most
 * frequent action in the whole study method — would wait on a 20 MB file every
 * time. The handler answers `206 Partial Content` with the requested slice.
 *
 * **Containment.** The path comes from the URL, so it is untrusted input: the
 * request is decoded, joined to the library root, and then compared with
 * `path.relative`. A prefix comparison would be wrong the moment the filesystem
 * normalises differently than the base string, and an allow-list of extensions
 * means a request can only ever name a file this plugin is willing to serve.
 */
import { createReadStream, existsSync, statSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { extname, isAbsolute, join, relative } from 'node:path'

/** Extensions the media route will serve, with the type each is sent as. */
const CONTENT_TYPES: Readonly<Record<string, string>> = {
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  mp4: 'audio/mp4',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  opus: 'audio/ogg',
  flac: 'audio/flac',
  srt: 'text/plain; charset=utf-8',
  vtt: 'text/vtt; charset=utf-8',
  lrc: 'text/plain; charset=utf-8',
}

/** Resolve a request path to a file inside the library, or `null` to refuse it. */
export function resolveMediaPath(root: string, requestPath: string): string | null {
  let decoded: string
  try {
    decoded = decodeURIComponent(requestPath)
  } catch {
    return null
  }
  if (decoded.includes('\0')) return null

  const segments = decoded.split('/').filter((segment) => segment.length > 0 && segment !== '.')
  if (segments.length !== 2) return null
  const [episode, file] = segments
  if (episode === undefined || file === undefined || episode === '..' || file === '..') return null

  const extension = extname(file).slice(1).toLowerCase()
  if (!(extension in CONTENT_TYPES)) return null

  const target = join(root, episode, file)
  const within = relative(root, target)
  if (within.length === 0 || within.startsWith('..') || isAbsolute(within)) return null
  return target
}

/** Parse a single-range `Range` header against a known file size. */
function parseRange(header: string | undefined, size: number): { start: number; end: number } | null {
  if (header === undefined) return null
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (match === null) return null
  const [, rawStart = '', rawEnd = ''] = match
  if (rawStart === '' && rawEnd === '') return null

  if (rawStart === '') {
    // `bytes=-500` means the last 500 bytes.
    const length = Number(rawEnd)
    if (!Number.isFinite(length) || length <= 0) return null
    const start = Math.max(0, size - length)
    return { start, end: size - 1 }
  }

  const start = Number(rawStart)
  const end = rawEnd === '' ? size - 1 : Math.min(Number(rawEnd), size - 1)
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) return null
  return { start, end }
}

/** Send one file, honouring `Range`. Returns nothing; the response owns the socket. */
export function serveMedia(
  req: IncomingMessage,
  res: ServerResponse,
  root: string,
  requestPath: string,
): void {
  const target = resolveMediaPath(root, requestPath)
  if (target === null) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('没有这个文件\n')
    return
  }
  if (!existsSync(target)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('没有这个文件\n')
    return
  }

  const size = statSync(target).size
  const type = CONTENT_TYPES[extname(target).slice(1).toLowerCase()] ?? 'application/octet-stream'
  const range = parseRange(req.headers.range, size)

  // A `Range` header the file cannot satisfy is a `416`, not a silent whole-file
  // response: players treat the second as "this server ignores ranges" and stop
  // asking, which costs the scrubber its responsiveness.
  if (req.headers.range !== undefined && range === null) {
    res.writeHead(416, { 'content-range': `bytes */${size}`, 'accept-ranges': 'bytes' })
    res.end()
    return
  }

  if (range === null) {
    res.writeHead(200, {
      'content-type': type,
      'content-length': String(size),
      'accept-ranges': 'bytes',
      'cache-control': 'no-cache',
    })
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    pipeFile(target, res)
    return
  }

  res.writeHead(206, {
    'content-type': type,
    'content-length': String(range.end - range.start + 1),
    'content-range': `bytes ${range.start}-${range.end}/${size}`,
    'accept-ranges': 'bytes',
    'cache-control': 'no-cache',
  })
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  pipeFile(target, res, range.start, range.end)
}

/**
 * Stream a file into the response, and end the response if the read fails.
 *
 * A `ReadStream` with no `error` listener is an unhandled exception, and an
 * unhandled exception in the host process takes the whole GUI with it. A file that
 * disappears mid-read is a realistic case: the library folder is edited by hand.
 */
function pipeFile(path: string, res: ServerResponse, start?: number, end?: number): void {
  const stream = start === undefined ? createReadStream(path) : createReadStream(path, { start, end })
  stream.on('error', () => {
    res.destroy()
  })
  res.on('close', () => {
    stream.destroy()
  })
  stream.pipe(res)
}

/** JSON helper shared by every route: one shape, one place to change it. */
export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': String(Buffer.byteLength(text)),
    'cache-control': 'no-store',
  })
  res.end(text)
}

/** Read a JSON request body with a ceiling, so a bad client cannot exhaust memory. */
export async function readJsonBody(req: IncomingMessage, limitBytes = 256 * 1024): Promise<unknown> {
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
    total += buffer.byteLength
    if (total > limitBytes) {
      // Stop reading and drop the connection: leaving the rest of an oversized body
      // in the socket would let it be parsed as the next request on a keep-alive
      // connection.
      req.destroy()
      throw new Error('请求体太大')
    }
    chunks.push(buffer)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  return text.trim().length === 0 ? null : JSON.parse(text)
}
