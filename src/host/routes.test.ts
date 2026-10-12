/**
 * The plugin's routes, mounted the way the host mounts them and called over HTTP.
 *
 * `apply` registers every route on `ctx.webServer`; this file gives it a real Node
 * server and a fake context, so what is tested is the wiring and not a unit in isolation:
 * that the guard stands in front of every route, that the import route maps its answers
 * to the right status codes, and that a request the host would refuse never reaches a
 * handler that writes.
 */
import { createHash } from 'node:crypto'
import { createServer, request as httpRequest, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { HostContext, WebRoute } from '../host-context.ts'
import { apply, type Config } from '../index.ts'
import { IMPORT_HEADER, IMPORT_PATH } from '../shared/protocol.ts'
import { writeScenes } from './test-scenes.ts'
import { makeTempDir } from './test-dir.ts'
import { listenForFetch } from './test-listen.ts'

/** What the fake connection service answers for the next request. */
type Verdict = 'allow' | 401 | 403

interface Harness {
  readonly base: string
  readonly root: string
  setVerdict: (verdict: Verdict) => void
  /** The headers the connection service last looked at. */
  lastHeaders: () => IncomingMessage['headers'] | null
  close: () => Promise<void>
}

/** Mount the plugin on a real server. `connection` is omitted when `withConnection` is false. */
async function start(withConnection = true): Promise<Harness> {
  const root = join(makeTempDir('lingualab-routes-'), 'media')
  const routes: WebRoute[] = []
  let verdict: Verdict = 'allow'
  let seen: IncomingMessage['headers'] | null = null

  const ctx = {
    webServer: { register: (route: WebRoute) => (routes.push(route), () => undefined) },
    effect: (setup: () => unknown) => void setup(),
    get: (name: string) =>
      name === 'connection' && withConnection
        ? {
            admit: (request: { headers: IncomingMessage['headers'] }) => {
              seen = request.headers
              return verdict === 'allow' ? { peer: {} } : { rejection: verdict }
            },
          }
        : undefined,
  } as unknown as HostContext

  const config = {
    libraryRoot: { get: () => root },
    openState: { get: () => '' },
  } as unknown as Config
  apply(ctx, config)

  const find = (path: string): WebRoute | undefined =>
    routes.find((route) => route.path === path || (route.kind === 'prefix' && path.startsWith(route.path)))

  const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const path = (req.url ?? '').split('?')[0] ?? ''
    const route = find(path)
    if (route === undefined) {
      res.writeHead(404).end()
      return
    }
    void Promise.resolve(route.handler(req, res))
  })
  const port = await listenForFetch(server)

  return {
    base: `http://127.0.0.1:${String(port)}`,
    root,
    setVerdict: (next) => void (verdict = next),
    lastHeaders: () => seen,
    close: async () => {
      server.closeAllConnections()
      await new Promise<void>((resolve) => server.close(() => resolve()))
      rmSync(join(root, '..'), { recursive: true, force: true })
    },
  }
}

let harness: Harness

beforeEach(async () => {
  harness = await start()
})

afterEach(async () => {
  await harness.close()
})

const importUrl = (episode = 'E1', file = 'a.mp3'): string =>
  `${harness.base}${IMPORT_PATH}?episode=${encodeURIComponent(episode)}&file=${encodeURIComponent(file)}`

const post = (url: string, body: string, headers: Record<string, string> = { [IMPORT_HEADER]: '1' }): Promise<Response> =>
  fetch(url, { method: 'POST', headers, body })

describe('progress shared between devices', () => {
  const sync = async (progress: object): Promise<{ ok: boolean; progress: Record<string, { at: number }> }> => {
    const response = await fetch(`${harness.base}/lingualab/progress`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ progress, steps: {} }),
    })
    return (await response.json()) as { ok: boolean; progress: Record<string, { at: number }> }
  }

  it('hands a second device the place the first one stopped', async () => {
    mkdirSync(harness.root, { recursive: true })
    const now = Date.now()
    await sync({ E1: { at: 321, duration: 900, updatedAt: now } })

    // A fresh browser has nothing, and asks: what the first device left comes back.
    const fresh = await sync({})
    expect(fresh.ok).toBe(true)
    expect(fresh.progress.E1?.at).toBe(321)

    const read = (await (await fetch(`${harness.base}/lingualab/progress`)).json()) as { progress: Record<string, { at: number }> }
    expect(read.progress.E1?.at).toBe(321)
  })

  it('does not let an older device overwrite a newer stop', async () => {
    mkdirSync(harness.root, { recursive: true })
    const now = Date.now()
    await sync({ E1: { at: 500, duration: 900, updatedAt: now } })
    const stale = await sync({ E1: { at: 5, duration: 900, updatedAt: now - 60_000 } })
    expect(stale.progress.E1?.at).toBe(500)
  })

  it('refuses an oversized body without touching the file', async () => {
    mkdirSync(harness.root, { recursive: true })
    const huge = 'x'.repeat(600 * 1024)
    const response = await fetch(`${harness.base}/lingualab/progress`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ progress: { pad: huge } }),
    }).catch(() => null)
    expect(response === null || response.status === 400).toBe(true)
    expect(existsSync(join(harness.root, '.lingualab-progress.json'))).toBe(false)
  })

  it('says the library is missing when there is nowhere to keep it', async () => {
    const answer = await sync({ E1: { at: 9, duration: 90, updatedAt: Date.now() } })
    expect(answer.ok).toBe(false)
  })

  it('keeps the progress file out of the library listing', async () => {
    mkdirSync(join(harness.root, 'E1'), { recursive: true })
    writeFileSync(join(harness.root, 'E1', 'a.mp3'), 'x')
    await sync({ E1: { at: 9, duration: 90, updatedAt: Date.now() } })
    const library = (await (await fetch(`${harness.base}/lingualab/library`)).json()) as { episodes: { id: string }[]; files: unknown[] }
    expect(library.episodes.map((entry) => entry.id)).toEqual(['E1'])
    expect(library.files).toEqual([])
  })
})

describe('the access check, in front of every route', () => {
  // One request per route, covering reads, writes and the two prefix routes.
  const probes: readonly (readonly [string, string])[] = [
    ['GET', '/lingualab/library'],
    ['GET', '/lingualab/places'],
    ['GET', '/lingualab/browse?place=lib&rel='],
    ['GET', '/lingualab/config'],
    ['POST', '/lingualab/config'],
    ['POST', '/lingualab/open'],
    ['GET', '/lingualab/notes?episode=E1'],
    ['POST', '/lingualab/notes'],
    ['GET', '/lingualab/media/E1/a.mp3'],
    ['GET', '/lingualab/file-media/file.0123456789abcdef/a.mp3'],
    ['POST', '/lingualab/import?episode=E1&file=a.mp3'],
    ['GET', '/lingualab/progress'],
    ['POST', '/lingualab/progress'],
    ['POST', '/lingualab/subtitle-timing'],
    ['GET', '/lingualab/subtitle-choice?episode=E1'],
    ['POST', '/lingualab/subtitle-choice'],
    ['GET', '/lingualab/review'],
    ['GET', '/lingualab/video?episode=E1'],
    ['POST', '/lingualab/video-prepare'],
    ['POST', '/lingualab/video-cancel'],
  ]

  for (const verdict of [401, 403] as const) {
    it(`answers ${String(verdict)} on every route when the host refuses the request`, async () => {
      harness.setVerdict(verdict)
      for (const [method, path] of probes) {
        const response = await fetch(`${harness.base}${path}`, {
          method,
          headers: { [IMPORT_HEADER]: '1', 'content-type': 'application/json' },
          ...(method === 'POST' ? { body: '{}' } : {}),
        })
        expect(response.status, `${method} ${path}`).toBe(verdict)
      }
    })
  }

  it('writes nothing when the host refuses an import, however well formed it is', async () => {
    harness.setVerdict(401)
    const response = await post(importUrl(), 'DATA')
    expect(response.status).toBe(401)
    expect(existsSync(join(harness.root, 'E1'))).toBe(false)
  })

  it('hands the host the request headers, so Host, Origin and the cookie can be judged', async () => {
    await fetch(`${harness.base}/lingualab/library`, { headers: { cookie: 'session=abc' } })
    expect(harness.lastHeaders()?.cookie).toBe('session=abc')
    expect(harness.lastHeaders()?.host).toContain('127.0.0.1')
  })

  it('refuses everything, rather than allowing it, when the deployment has no connection service', async () => {
    await harness.close()
    harness = await start(false)
    const read = await fetch(`${harness.base}/lingualab/library`)
    const write = await post(importUrl(), 'DATA')
    expect(read.status).toBe(403)
    expect(write.status).toBe(403)
    expect(existsSync(join(harness.root, 'E1'))).toBe(false)
  })
})

describe('the video routes', () => {
  const json = (path: string, body: unknown): Promise<Response> =>
    fetch(`${harness.base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

  it('says there is no video for an episode without one, and for a name that is not a folder', async () => {
    mkdirSync(join(harness.root, 'E1'), { recursive: true })
    writeFileSync(join(harness.root, 'E1', 'a.mp3'), 'x')
    for (const episode of ['E1', 'missing', '..', 'file.abcdef']) {
      const answer = (await (await fetch(`${harness.base}/lingualab/video?episode=${encodeURIComponent(episode)}`)).json()) as { state: string }
      expect(answer.state, episode).toBe('none')
    }
  })

  it('answers an mp4 as playable at its own URL when there is no ffmpeg to say otherwise', async () => {
    mkdirSync(join(harness.root, 'E1'), { recursive: true })
    writeFileSync(join(harness.root, 'E1', 'a.mp4'), 'x')
    const savedPath = process.env.PATH
    process.env.PATH = ''
    try {
      const answer = (await (await fetch(`${harness.base}/lingualab/video?episode=E1`)).json()) as { state: string; url: string }
      expect(answer).toMatchObject({ state: 'playable', url: '/lingualab/media/E1/a.mp4' })
    } finally {
      process.env.PATH = savedPath
    }
  })

  it('serves the mp4 it pointed to, with Range, and refuses the mkv beside it', async () => {
    mkdirSync(join(harness.root, 'E1'), { recursive: true })
    writeFileSync(join(harness.root, 'E1', 'a.mp4'), '0123456789')
    writeFileSync(join(harness.root, 'E1', 'a.mkv'), 'x')
    const ranged = await fetch(`${harness.base}/lingualab/media/E1/a.mp4`, { headers: { range: 'bytes=2-4' } })
    expect(ranged.status).toBe(206)
    expect(ranged.headers.get('content-type')).toBe('video/mp4')
    expect(await ranged.text()).toBe('234')
    expect((await fetch(`${harness.base}/lingualab/media/E1/a.mkv`)).status).toBe(404)
  })

  it('serves a prepared file from the cache folder and nothing else in it', async () => {
    mkdirSync(join(harness.root, 'E1', '.lingualab'), { recursive: true })
    writeFileSync(join(harness.root, 'E1', '.lingualab', 'a.mp4'), 'prepared')
    writeFileSync(join(harness.root, 'E1', '.lingualab', 'a.mp4.part'), 'half')
    expect(await (await fetch(`${harness.base}/lingualab/media/E1/.lingualab/a.mp4`)).text()).toBe('prepared')
    expect((await fetch(`${harness.base}/lingualab/media/E1/.lingualab/a.mp4.part`)).status).toBe(404)
  })

  it('refuses a prepare request that names no episode or a mode it does not know, and the wrong methods', async () => {
    expect((await json('/lingualab/video-prepare', { mode: 'video' })).status).toBe(400)
    expect((await json('/lingualab/video-prepare', { episode: 'E1', mode: 'everything' })).status).toBe(400)
    expect((await json('/lingualab/video-prepare', { episode: 'E1', mode: 'video', segment: 7 })).status).toBe(400)
    expect((await fetch(`${harness.base}/lingualab/video-prepare`)).status).toBe(405)
    expect((await fetch(`${harness.base}/lingualab/video`, { method: 'POST' })).status).toBe(405)
    expect((await fetch(`${harness.base}/lingualab/video-cancel`)).status).toBe(405)
  })

  it('says a prepare for an episode with no video did not start, and a cancel with nothing running cancelled nothing', async () => {
    mkdirSync(join(harness.root, 'E1'), { recursive: true })
    writeFileSync(join(harness.root, 'E1', 'a.mp3'), 'x')
    const prepare = (await (await json('/lingualab/video-prepare', { episode: 'E1', mode: 'video' })).json()) as { ok: boolean; state: string }
    expect(prepare).toMatchObject({ ok: false, state: 'none' })
    const cancel = (await (await json('/lingualab/video-cancel', {})).json()) as { ok: boolean; cancelled: boolean }
    expect(cancel).toMatchObject({ ok: true, cancelled: false })
  })
})

describe('POST /lingualab/import', () => {
  it('saves the file and answers 200 with where it went', async () => {
    const response = await post(importUrl('E1', 'a.mp3'), 'DATA')
    const payload = (await response.json()) as { ok: boolean; code: string; episode: string; file: string; bytes: number }

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({ ok: true, code: 'saved', episode: 'E1', file: 'a.mp3', bytes: 4 })
    expect(readFileSync(join(harness.root, 'E1', 'a.mp3'), 'utf8')).toBe('DATA')
  })

  it('answers 403 without the panel header, and writes nothing', async () => {
    const response = await post(importUrl(), 'DATA', {})
    expect(response.status).toBe(403)
    expect(existsSync(join(harness.root, 'E1'))).toBe(false)
  })

  it('answers 405 for any method but POST', async () => {
    for (const method of ['GET', 'PUT', 'DELETE']) {
      const response = await fetch(importUrl(), { method, headers: { [IMPORT_HEADER]: '1' } })
      expect(response.status, method).toBe(405)
    }
  })

  it('answers 400 with the reason for a refused file, and 200 for one that already exists', async () => {
    const refused = await post(importUrl('E1', 'run.exe'), 'MZ')
    expect(refused.status).toBe(400)
    expect(((await refused.json()) as { reason: string }).reason).toContain('音频')

    mkdirSync(join(harness.root, 'E2'), { recursive: true })
    writeFileSync(join(harness.root, 'E2', 'a.mp3'), 'original')
    const again = await post(importUrl('E2', 'a.mp3'), 'replacement')
    expect(again.status).toBe(200)
    expect(((await again.json()) as { code: string }).code).toBe('exists')
    expect(readFileSync(join(harness.root, 'E2', 'a.mp3'), 'utf8')).toBe('original')
  })

  it('refuses a declared length over the ceiling before reading the body', async () => {
    // Content-Length comes from the client and is not trusted, but a declared overshoot is
    // answered immediately; the streaming limiter covers the one that lies.
    const response = await fetch(importUrl(), {
      method: 'POST',
      headers: { [IMPORT_HEADER]: '1', 'content-length': String(3 * 1024 * 1024 * 1024) },
      body: 'x',
    }).catch(() => null)
    // Either the request is refused with the sentence, or the client library will not send
    // a body shorter than it declared; both leave nothing on disk.
    if (response !== null) expect(response.status).toBe(400)
    expect(existsSync(join(harness.root, 'E1', 'a.mp3'))).toBe(false)
  })

  it('answers 429, not 400, when the host is busy, so the page knows to try again', async () => {
    // Two uploads that send their headers and half a body and then go quiet hold both
    // slots. A raw request is used because `fetch` may not put the headers on the wire
    // until it has body to send, which would leave the slots empty and the test passing
    // or failing for the wrong reason.
    const port = Number(new URL(harness.base).port)
    const held = [0, 1].map((index) => {
      const request = httpRequest({
        host: '127.0.0.1',
        port,
        method: 'POST',
        path: `${IMPORT_PATH}?episode=HELD${String(index)}&file=a.mp3`,
        headers: { [IMPORT_HEADER]: '1', 'content-type': 'application/octet-stream', 'transfer-encoding': 'chunked' },
      })
      request.on('error', () => undefined)
      request.write('half of an episode')
      return request
    })
    await new Promise((resolve) => setTimeout(resolve, 200))

    const busy = await post(importUrl('OVER', 'a.mp3'), 'x')
    const payload = (await busy.json()) as { retryable?: boolean }
    expect(busy.status).toBe(429)
    expect(payload.retryable).toBe(true)
    expect(existsSync(join(harness.root, 'OVER'))).toBe(false)

    for (const request of held) request.destroy()
    await new Promise((resolve) => setTimeout(resolve, 100))
    // The slots come back once the stalled uploads are gone.
    const after = await post(importUrl('AFTER', 'a.mp3'), 'x')
    expect(after.status).toBe(200)
  })})

describe('opening a segment of a folder episode', () => {
  const open = async (body: object): Promise<{ status: number; payload: { ok: boolean; reason: string | null; segment: string | null; media: { audioUrl: string } | null } }> => {
    const response = await fetch(`${harness.base}/lingualab/open`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    return { status: response.status, payload: (await response.json()) as never }
  }

  it('opens the segment named in the request and echoes it', async () => {
    writeScenes(join(harness.root, 'S01E01'), ['01_a', '02_b'])
    const answer = await open({ episodeId: 'S01E01', segment: '02_b' })
    expect(answer.status).toBe(200)
    expect(answer.payload.segment).toBe('02_b')
    expect(answer.payload.media?.audioUrl).toBe('/lingualab/media/S01E01/02_b.mp3')
  })

  it('opens the first segment when none is named', async () => {
    writeScenes(join(harness.root, 'S01E01'), ['01_a', '02_b'])
    expect((await open({ episodeId: 'S01E01' })).payload.segment).toBe('01_a')
  })

  it('answers 400 with the reason for a segment that is not there, or not a string', async () => {
    writeScenes(join(harness.root, 'S01E01'), ['01_a', '02_b'])
    const missing = await open({ episodeId: 'S01E01', segment: '03_c' })
    expect(missing.status).toBe(400)
    expect(missing.payload.reason).toContain('03_c')
    const wrongType = await open({ episodeId: 'S01E01', segment: 2 })
    expect(wrongType.status).toBe(400)
  })

  it('lists the segments in the library payload', async () => {
    writeScenes(join(harness.root, 'S01E01'), ['01_a', '02_b'])
    const library = (await (await fetch(`${harness.base}/lingualab/library`)).json()) as {
      episodes: { segments: { id: string }[] }[]
    }
    expect(library.episodes[0]?.segments.map((segment) => segment.id)).toEqual(['01_a', '02_b'])
  })
})

describe('moving one sentence in its subtitle file', () => {
  const SRT = '1\n00:00:01,000 --> 00:00:02,000\nHello.\n'
  const retime = async (hash: string, to: number): Promise<{ status: number; payload: { ok: boolean; code: string } }> => {
    const response = await fetch(`${harness.base}/lingualab/subtitle-timing`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        episode: 'E1',
        edits: [{ file: 'a.srt', from: { start: 1000, end: 2000, occurrence: 0 }, to: { start: to, end: 2000 }, expect: hash }],
      }),
    })
    return { status: response.status, payload: (await response.json()) as never }
  }

  it('writes the new start, then refuses the same request as stale', async () => {
    mkdirSync(join(harness.root, 'E1'), { recursive: true })
    writeFileSync(join(harness.root, 'E1', 'a.srt'), SRT)
    const hash = createHash('sha256').update(SRT).digest('hex')
    const saved = await retime(hash, 800)
    expect(saved.status).toBe(200)
    expect(readFileSync(join(harness.root, 'E1', 'a.srt'), 'utf8')).toBe(SRT.replace('00:00:01,000', '00:00:00,800'))
    const again = await retime(hash, 700)
    expect(again).toEqual({ status: 409, payload: expect.objectContaining({ ok: false, code: 'stale' }) })
  })
})

describe('saving notes', () => {
  const save = async (body: object): Promise<{ status: number; payload: { ok: boolean; stale: boolean; version: string | null } }> => {
    const response = await fetch(`${harness.base}/lingualab/notes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    return { status: response.status, payload: (await response.json()) as never }
  }

  it('saves against the version it read, then refuses a save from a page that read an older file', async () => {
    mkdirSync(join(harness.root, 'E1'), { recursive: true })
    writeFileSync(join(harness.root, 'E1', 'a.mp3'), 'x')
    const read = (await (await fetch(`${harness.base}/lingualab/notes?episode=E1`)).json()) as { version: string }
    const phrases = [{ at: 4, text: 'Hi.', zh: '', note: '', tags: [], done: false }]

    const saved = await save({ episode: 'E1', phrases, expect: read.version })
    expect(saved.status).toBe(200)
    const written = readFileSync(join(harness.root, 'E1', 'notes.md'), 'utf8')
    expect(saved.payload.version).toBe(createHash('sha256').update(written).digest('hex'))

    const stale = await save({ episode: 'E1', phrases: [], expect: read.version })
    expect(stale).toEqual({ status: 409, payload: expect.objectContaining({ ok: false, stale: true }) })
    expect(readFileSync(join(harness.root, 'E1', 'notes.md'), 'utf8')).toBe(written)
  })

  it('refuses a save without a version for a folder episode', async () => {
    mkdirSync(join(harness.root, 'E1'), { recursive: true })
    writeFileSync(join(harness.root, 'E1', 'a.mp3'), 'x')
    const missing = await save({ episode: 'E1', phrases: [] })
    expect(missing.status).toBe(400)
    expect(existsSync(join(harness.root, 'E1', 'notes.md'))).toBe(false)
  })
})

describe('the review list', () => {
  it('answers what is left to review, and refuses a write', async () => {
    mkdirSync(join(harness.root, 'E1'), { recursive: true })
    writeFileSync(join(harness.root, 'E1', 'a.mp3'), 'x')
    writeFileSync(join(harness.root, 'E1', 'notes.md'), '# E1\n\n- [ ] 00:04 | Hi. | | | #hard\n- [x] 00:09 | Bye. | |\n')
    const response = await fetch(`${harness.base}/lingualab/review`)
    expect(response.status).toBe(200)
    const payload = (await response.json()) as { total: number; episodes: { episode: string; phrases: { text: string }[] }[] }
    expect(payload.total).toBe(1)
    expect(payload.episodes[0]?.phrases.map((item) => item.text)).toEqual(['Hi.'])
    expect((await fetch(`${harness.base}/lingualab/review`, { method: 'POST', body: '{}' })).status).toBe(405)
  })
})
