import { describe, expect, it } from 'vitest'
import { fileOf, handleStore, reopen, type HandleBackend, type LocalHandle } from './handles.ts'

/** A handle that hands back a file, and asks for permission the way Chromium's does. */
function handle(name: string, patch: Partial<LocalHandle> = {}): LocalHandle {
  return { name, getFile: () => Promise.resolve({ name } as File), ...patch }
}

/** A backend in memory. */
function memory(): HandleBackend & { readonly data: Map<string, unknown> } {
  const data = new Map<string, unknown>()
  return {
    data,
    get: (key) => Promise.resolve(data.get(key)),
    set: (key, value) => {
      data.set(key, value)
      return Promise.resolve()
    },
    remove: (key) => {
      data.delete(key)
      return Promise.resolve()
    },
  }
}

/** A backend that fails at everything, as one does with site data blocked. */
const broken: HandleBackend = {
  get: () => Promise.reject(new Error('blocked')),
  set: () => Promise.reject(new Error('blocked')),
  remove: () => Promise.reject(new Error('blocked')),
}

describe('handleStore', () => {
  it('keeps a handle per segment, and forgets it', async () => {
    const store = handleStore(memory())
    const first = handle('a.mp4')
    expect(await store.get('s1')).toBeNull()
    expect(await store.put('s1', first)).toBe(true)
    expect(await store.put('s2', handle('b.mp4'))).toBe(true)
    expect(await store.get('s1')).toBe(first)
    expect((await store.get('s2'))?.name).toBe('b.mp4')
    await store.remove('s1')
    expect(await store.get('s1')).toBeNull()
    expect((await store.get('s2'))?.name).toBe('b.mp4')
  })

  it('does not trust what comes back: something that is not a handle is nothing', async () => {
    const backend = memory()
    const store = handleStore(backend)
    backend.data.set('s1', 'a string')
    backend.data.set('s2', { name: 'a.mp4' })
    backend.data.set('s3', null)
    expect(await store.get('s1')).toBeNull()
    expect(await store.get('s2')).toBeNull()
    expect(await store.get('s3')).toBeNull()
  })

  it('works without storage, remembering nothing', async () => {
    const store = handleStore(null)
    expect(await store.put('s1', handle('a.mp4'))).toBe(false)
    expect(await store.get('s1')).toBeNull()
    await expect(store.remove('s1')).resolves.toBeUndefined()
  })

  it('never throws when storage does', async () => {
    const store = handleStore(broken)
    expect(await store.put('s1', handle('a.mp4'))).toBe(false)
    expect(await store.get('s1')).toBeNull()
    await expect(store.remove('s1')).resolves.toBeUndefined()
  })
})

describe('reopen', () => {
  it('asks for permission to read, then gives the file', async () => {
    const asked: unknown[] = []
    const result = await reopen(
      handle('a.mp4', {
        requestPermission: (descriptor) => {
          asked.push(descriptor)
          return Promise.resolve('granted')
        },
      }),
    )
    expect(asked).toEqual([{ mode: 'read' }])
    expect(result).toMatchObject({ ok: true, file: { name: 'a.mp4' } })
  })

  it('does not read a file the reader said no to', async () => {
    let read = false
    const result = await reopen(
      handle('a.mp4', {
        requestPermission: () => Promise.resolve('denied'),
        getFile: () => {
          read = true
          return Promise.resolve({} as File)
        },
      }),
    )
    expect(result).toEqual({ ok: false, problem: 'denied' })
    expect(read).toBe(false)
  })

  it('treats a prompt that was dismissed as a no', async () => {
    const result = await reopen(handle('a.mp4', { requestPermission: () => Promise.resolve('prompt') }))
    expect(result).toEqual({ ok: false, problem: 'denied' })
  })

  it('reads straight away from a handle with no permission to ask for', async () => {
    expect(await reopen(handle('a.mp4'))).toMatchObject({ ok: true })
  })

  it('tells a file that is gone from a refusal', async () => {
    const gone = Object.assign(new Error('gone'), { name: 'NotFoundError' })
    const result = await reopen(
      handle('a.mp4', { requestPermission: () => Promise.resolve('granted'), getFile: () => Promise.reject(gone) }),
    )
    expect(result).toEqual({ ok: false, problem: 'missing' })
    const refused = await reopen(handle('a.mp4', { requestPermission: () => Promise.reject(new Error('no')) }))
    expect(refused).toEqual({ ok: false, problem: 'denied' })
  })
})

describe('fileOf', () => {
  it('reads a file without asking anything, and says null when it cannot', async () => {
    expect((await fileOf(handle('a.mp4')))?.name).toBe('a.mp4')
    expect(await fileOf(handle('a.mp4', { getFile: () => Promise.reject(new Error('gone')) }))).toBeNull()
  })
})
