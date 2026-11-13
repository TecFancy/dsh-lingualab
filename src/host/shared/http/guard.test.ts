/**
 * The access check in front of every route.
 *
 * What these pin is the part that is easy to get wrong in the quiet direction: a guard
 * that lets a request through when something is missing. So the cases are the missing
 * ones (no connection service, a service that throws, a malformed answer) and each must
 * end in a refusal that never reaches the handler.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { describe, expect, it } from 'vitest'
import type { HostContext, WebRoute } from '../../../host-context.ts'
import { admitRequest, guarded } from './guard.ts'

/** A response that records what the guard wrote. */
function fakeResponse(): { res: ServerResponse; status: () => number | null; body: () => string } {
  let status: number | null = null
  let body = ''
  const res = {
    writeHead(code: number) {
      status = code
      return res
    },
    end(text?: string) {
      body = text ?? ''
    },
  } as unknown as ServerResponse
  return { res, status: () => status, body: () => body }
}

/** A request carrying only the headers the guard reads. */
const request = (headers: Record<string, string> = {}): IncomingMessage => ({ headers }) as unknown as IncomingMessage

/** A context whose `get('connection')` answers with `value`. */
const contextWith = (value: unknown): HostContext =>
  ({ webServer: { register: () => () => undefined }, effect: () => undefined, get: (name: string) => (name === 'connection' ? value : undefined) }) as unknown as HostContext

describe('admitRequest', () => {
  it('lets a request through when the connection service admits it', () => {
    const answer = fakeResponse()
    const ctx = contextWith({ admit: () => ({ peer: {} }) })
    expect(admitRequest(ctx, request(), answer.res)).toBe(true)
    expect(answer.status()).toBeNull()
  })

  it('passes the request to the service, so it can read Host, Origin and the cookie', () => {
    let seen: unknown = null
    const ctx = contextWith({
      admit: (req: unknown) => {
        seen = req
        return { peer: {} }
      },
    })
    const req = request({ host: '127.0.0.1:3080', cookie: 'x=1' })
    admitRequest(ctx, req, fakeResponse().res)
    expect(seen).toBe(req)
  })

  it('answers 401 for a missing session and 403 for an untrusted request', () => {
    for (const rejection of [401, 403] as const) {
      const answer = fakeResponse()
      const ctx = contextWith({ admit: () => ({ rejection }) })
      expect(admitRequest(ctx, request(), answer.res)).toBe(false)
      expect(answer.status()).toBe(rejection)
    }
  })

  it('refuses, rather than allows, when there is no connection service at all', () => {
    const answer = fakeResponse()
    expect(admitRequest(contextWith(undefined), request(), answer.res)).toBe(false)
    expect(answer.status()).toBe(403)
  })

  it('refuses when the service is not the shape it should be', () => {
    for (const odd of [null, 'yes', 42, {}, { admit: 'nope' }]) {
      const answer = fakeResponse()
      expect(admitRequest(contextWith(odd), request(), answer.res)).toBe(false)
      expect(answer.status()).toBe(403)
    }
  })

  it('refuses when asking the service throws', () => {
    const answer = fakeResponse()
    const ctx = contextWith({
      admit: () => {
        throw new Error('boom')
      },
    })
    expect(admitRequest(ctx, request(), answer.res)).toBe(false)
    expect(answer.status()).toBe(403)
  })

  it('refuses when reading the service throws', () => {
    const answer = fakeResponse()
    const ctx = {
      get: () => {
        throw new Error('topology')
      },
    } as unknown as HostContext
    expect(admitRequest(ctx, request(), answer.res)).toBe(false)
    expect(answer.status()).toBe(403)
  })
})

describe('guarded', () => {
  const route = (handler: WebRoute['handler']): WebRoute => ({ kind: 'exact', path: '/x', handler })

  it('runs the handler only for an admitted request', async () => {
    let ran = 0
    const wrapped = guarded(contextWith({ admit: () => ({ peer: {} }) }), route(() => void (ran += 1)))
    await wrapped.handler(request(), fakeResponse().res)
    expect(ran).toBe(1)
  })

  it('never runs the handler for a refused one', async () => {
    let ran = 0
    const wrapped = guarded(contextWith({ admit: () => ({ rejection: 401 }) }), route(() => void (ran += 1)))
    const answer = fakeResponse()
    await wrapped.handler(request(), answer.res)
    expect(ran).toBe(0)
    expect(answer.status()).toBe(401)
  })

  it('keeps the route identity, so naming and registration are unchanged', () => {
    const wrapped = guarded(contextWith(undefined), { kind: 'prefix', path: '/lingualab/media', handler: () => undefined })
    expect(wrapped.kind).toBe('prefix')
    expect(wrapped.path).toBe('/lingualab/media')
  })

  it('reports an admitted request once, before the handler runs', async () => {
    const order: string[] = []
    const wrapped = guarded(
      contextWith({ admit: () => ({ peer: {} }) }),
      route(() => void order.push('handler')),
      () => order.push('admitted'),
    )
    await wrapped.handler(request(), fakeResponse().res)
    expect(order).toEqual(['admitted', 'handler'])
  })

  it('reports nothing for a refused request', async () => {
    let reported = 0
    const wrapped = guarded(contextWith({ admit: () => ({ rejection: 401 }) }), route(() => undefined), () => void (reported += 1))
    await wrapped.handler(request(), fakeResponse().res)
    expect(reported).toBe(0)
  })

  it('still runs the handler when the report hook throws', async () => {
    let ran = 0
    const wrapped = guarded(
      contextWith({ admit: () => ({ peer: {} }) }),
      route(() => void (ran += 1)),
      () => {
        throw new Error('boom')
      },
    )
    await wrapped.handler(request(), fakeResponse().res)
    expect(ran).toBe(1)
  })
})
