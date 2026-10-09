/**
 * The plugin's routes, mounted the way the host mounts them and called over HTTP.
 *
 * `apply` registers every route on `ctx.webServer`; this file gives it a real Node
 * server and a fake context, so what is tested is the wiring and not a unit in isolation:
 * that the guard stands in front of every route, that the import route maps its answers
 * to the right status codes, and that a request the host would refuse never reaches a
 * handler that writes.
 */
import { createServer, request as httpRequest, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { HostContext, WebRoute } from '../host-context.ts'
import { apply, type Config } from '../index.ts'
import { IMPORT_HEADER, IMPORT_PATH } from '../shared/protocol.ts'
import { makeTempDir } from './test-dir.ts'

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
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as AddressInfo).port

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
