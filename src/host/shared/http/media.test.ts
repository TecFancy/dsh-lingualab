/**
 * What the media route tells a browser about the file it sends.
 *
 * A real server and a real file, because the headers are the product here: the validators that let Chrome keep a
 * `206`, the `304` that makes asking again cheap, and the `If-Range` that stops a slice of a new file from being
 * stitched onto the bytes of an old one.
 */
import { createServer, type Server } from 'node:http'
import { mkdirSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { listenForFetch, makeTempDir } from '../testing/index.ts'
import { serveFile } from './media.ts'

const BODY = 'audio-bytes'
/** A fixed modification time with milliseconds, so the `ETag` and the whole-second dates are both exercised. */
const MTIME = new Date('2026-01-02T03:04:05.678Z')

let root = ''
let server: Server | null = null
let base = ''

beforeEach(async () => {
  root = makeTempDir('lingualab-media-')
  mkdirSync(join(root, 'E1'))
  const file = join(root, 'E1', 'a.mp3')
  writeFileSync(file, BODY)
  utimesSync(file, MTIME, MTIME)
  server = createServer((req, res) => serveFile(req, res, join(root, (req.url ?? '').split('?')[0] ?? '')))
  base = `http://127.0.0.1:${String(await listenForFetch(server))}/E1/a.mp3`
})

afterEach(async () => {
  const closing = server
  server = null
  if (closing !== null) await new Promise<void>((resolve) => closing.close(() => resolve()))
  rmSync(root, { recursive: true, force: true })
})

/** The `ETag` the current file is sent with, read off a plain request. */
async function etagNow(): Promise<string> {
  const etag = (await fetch(base)).headers.get('etag')
  if (etag === null) throw new Error('no ETag')
  return etag
}

describe('validators', () => {
  it('sends a strong ETag and Last-Modified with a whole file, still asking again each time', async () => {
    const res = await fetch(base)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe(BODY)
    expect(res.headers.get('etag')).toMatch(/^"[0-9a-f]+-[0-9a-f]+"$/)
    expect(res.headers.get('last-modified')).toBe(MTIME.toUTCString())
    expect(res.headers.get('cache-control')).toBe('no-cache')
    expect(res.headers.get('accept-ranges')).toBe('bytes')
  })

  it('sends the same validators with a slice, which is what lets a browser keep a 206', async () => {
    const whole = await fetch(base)
    const res = await fetch(base, { headers: { range: 'bytes=0-4' } })
    expect(res.status).toBe(206)
    expect(await res.text()).toBe('audio')
    expect(res.headers.get('etag')).toBe(whole.headers.get('etag'))
    expect(res.headers.get('last-modified')).toBe(MTIME.toUTCString())
    expect(res.headers.get('cache-control')).toBe('no-cache')
  })

  it('sends them with HEAD too', async () => {
    const res = await fetch(base, { method: 'HEAD' })
    expect(res.status).toBe(200)
    expect(res.headers.get('etag')).toMatch(/^"/)
    expect(res.headers.get('last-modified')).toBe(MTIME.toUTCString())
    expect(res.headers.get('content-length')).toBe(String(BODY.length))
  })

  it('changes the ETag when the file is replaced by one of another size or time', async () => {
    const before = await etagNow()
    const file = join(root, 'E1', 'a.mp3')
    writeFileSync(file, `${BODY}-longer`)
    utimesSync(file, MTIME, MTIME)
    const sizeChanged = await etagNow()
    expect(sizeChanged).not.toBe(before)
    utimesSync(file, new Date(MTIME.getTime() + 5000), new Date(MTIME.getTime() + 5000))
    expect(await etagNow()).not.toBe(sizeChanged)
  })

  it('still answers 404 for a file that is not there', async () => {
    const res = await fetch(base.replace('a.mp3', 'gone.mp3'))
    expect(res.status).toBe(404)
    expect(res.headers.get('etag')).toBeNull()
  })
})

describe('If-None-Match', () => {
  it('answers 304 with no body and the validators when the ETag matches', async () => {
    const etag = await etagNow()
    const res = await fetch(base, { headers: { 'if-none-match': etag } })
    expect(res.status).toBe(304)
    expect(await res.text()).toBe('')
    expect(res.headers.get('etag')).toBe(etag)
    expect(res.headers.get('last-modified')).toBe(MTIME.toUTCString())
    expect(res.headers.get('cache-control')).toBe('no-cache')
    expect(res.headers.get('accept-ranges')).toBe('bytes')
  })

  it('reads a list, a weak entry and `*`', async () => {
    const etag = await etagNow()
    for (const header of [`"nope", ${etag}`, `W/${etag}`, '*']) {
      expect((await fetch(base, { headers: { 'if-none-match': header } })).status).toBe(304)
    }
  })

  it('sends the file again when the ETag no longer matches', async () => {
    const res = await fetch(base, { headers: { 'if-none-match': '"stale"' } })
    expect(res.status).toBe(200)
    expect(await res.text()).toBe(BODY)
  })

  it('is answered 304 before a Range is looked at', async () => {
    const etag = await etagNow()
    const res = await fetch(base, { headers: { 'if-none-match': etag, range: 'bytes=0-4' } })
    expect(res.status).toBe(304)
  })
})

describe('If-Modified-Since', () => {
  it('answers 304 for the file\'s own time and for a later one', async () => {
    for (const date of [MTIME, new Date(MTIME.getTime() + 60_000)]) {
      const res = await fetch(base, { headers: { 'if-modified-since': date.toUTCString() } })
      expect(res.status).toBe(304)
      expect(res.headers.get('etag')).toMatch(/^"/)
    }
  })

  it('sends the file when it is newer than the date', async () => {
    const res = await fetch(base, { headers: { 'if-modified-since': new Date(MTIME.getTime() - 5000).toUTCString() } })
    expect(res.status).toBe(200)
    expect(await res.text()).toBe(BODY)
  })

  it('ignores a date it cannot read', async () => {
    expect((await fetch(base, { headers: { 'if-modified-since': 'yesterday-ish' } })).status).toBe(200)
  })

  it('is not consulted when If-None-Match is there: a stale ETag wins over a fresh date', async () => {
    const res = await fetch(base, {
      headers: { 'if-none-match': '"stale"', 'if-modified-since': MTIME.toUTCString() },
    })
    expect(res.status).toBe(200)
  })
})

describe('If-Range', () => {
  it('serves the slice when the ETag still matches', async () => {
    const etag = await etagNow()
    const res = await fetch(base, { headers: { range: 'bytes=0-4', 'if-range': etag } })
    expect(res.status).toBe(206)
    expect(await res.text()).toBe('audio')
    expect(res.headers.get('content-range')).toBe(`bytes 0-4/${String(BODY.length)}`)
  })

  it('serves the slice when the date is the file\'s modification time', async () => {
    const res = await fetch(base, { headers: { range: 'bytes=0-4', 'if-range': MTIME.toUTCString() } })
    expect(res.status).toBe(206)
  })

  it('sends the whole file with 200 when the ETag does not match', async () => {
    const res = await fetch(base, { headers: { range: 'bytes=0-4', 'if-range': '"stale"' } })
    expect(res.status).toBe(200)
    expect(await res.text()).toBe(BODY)
    expect(res.headers.get('content-range')).toBeNull()
    expect(res.headers.get('etag')).toMatch(/^"/)
  })

  it('never takes a weak ETag as a match', async () => {
    const etag = await etagNow()
    const res = await fetch(base, { headers: { range: 'bytes=0-4', 'if-range': `W/${etag}` } })
    expect(res.status).toBe(200)
  })

  it('sends the whole file when the date is not the file\'s', async () => {
    const res = await fetch(base, {
      headers: { range: 'bytes=0-4', 'if-range': new Date(MTIME.getTime() - 5000).toUTCString() },
    })
    expect(res.status).toBe(200)
    expect(await res.text()).toBe(BODY)
  })

  it('only matters with a Range', async () => {
    const res = await fetch(base, { headers: { 'if-range': '"stale"' } })
    expect(res.status).toBe(200)
  })

  it('answers 416 for a range it cannot satisfy only when the range is honoured', async () => {
    const etag = await etagNow()
    const honoured = await fetch(base, { headers: { range: 'bytes=999-1200', 'if-range': etag } })
    expect(honoured.status).toBe(416)
    expect(honoured.headers.get('content-range')).toBe(`bytes */${String(BODY.length)}`)

    const dropped = await fetch(base, { headers: { range: 'bytes=999-1200', 'if-range': '"stale"' } })
    expect(dropped.status).toBe(200)
    expect(await dropped.text()).toBe(BODY)
  })
})
