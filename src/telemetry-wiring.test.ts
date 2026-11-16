/**
 * The usage ping's install id, through the wiring the host actually mounts.
 *
 * The unit tests in `host/shared/telemetry/` prove the state machine; this file proves the adapter
 * under it, because the incident that started all of this was in the adapter and not in the state
 * machine: `saveInstallId` fired `settings.update` and swallowed the rejection, so a settings
 * service that was not ready yet lost the id silently. A test that injects its own `saveInstallId`
 * cannot see that, however many cases it covers.
 *
 * So this mounts the real plugin through `apply`, with a `settings` service that can be absent,
 * refuse, or accept, and asserts on the config box the plugin reads back — the same box the next
 * process would read from the profile. The clock is faked so the save backoff can pass without
 * waiting for it; the network is never reached, because the default sender refuses under a test
 * runner.
 */
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HostContext, WebRoute } from './host-context.ts'
import { makeTempDir } from './host/shared/testing/index.ts'
import { SAVE_RETRY_MS } from './host/shared/telemetry/index.ts'
import { apply, type Config } from './index.ts'

/** Directories a test made, removed afterwards. */
const made: string[] = []

afterEach(() => {
  vi.useRealTimers()
  for (const dir of made.splice(0)) rmSync(dir, { recursive: true, force: true })
})

/** A temporary library root, remembered for cleanup. */
function tempRoot(): string {
  const root = join(makeTempDir('lingualab-wiring-'), 'media')
  made.push(join(root, '..'))
  mkdirSync(root, { recursive: true })
  return root
}

/** Let every microtask the fire-and-forget ping queued run before asserting on its effects. */
async function flush(): Promise<void> {
  for (let turn = 0; turn < 8; turn += 1) await Promise.resolve()
}

/** The profile entry the plugin reads and writes, shared across mounts to stand in for the profile. */
interface ProfileBox {
  installId: string
}

interface Mounted {
  /** Call one admitted request, the way the guard does after it lets one through. */
  admit: () => void
  /** The `installId` the profile would hold. */
  storedId: () => string
  /** Every write the settings service was asked for. */
  writes: { ns: string; patch: Record<string, unknown> }[]
  /** Whether the settings service is mounted at all. */
  setSettingsMounted: (mounted: boolean) => void
  /** Whether the next write is refused. */
  failNextWrite: (fail: boolean) => void
}

/**
 * Mount the plugin the way the host does, with a settings service that can be absent, refuse, or
 * accept. `box` is the profile entry: passing the same one to two mounts is a restart.
 */
function mount(box: ProfileBox = { installId: '' }): Mounted {
  const root = tempRoot()
  const routes: WebRoute[] = []
  const writes: { ns: string; patch: Record<string, unknown> }[] = []
  let settingsMounted = true
  let failNext = false

  const settings = {
    update: async (ns: string, patch: Record<string, unknown>): Promise<void> => {
      if (failNext) {
        failNext = false
        throw new Error('settings.update is broken')
      }
      writes.push({ ns, patch })
      if (typeof patch.installId === 'string') box.installId = patch.installId
    },
  }

  const ctx = {
    webServer: { register: (route: WebRoute) => (routes.push(route), () => undefined) },
    effect: (setup: () => unknown) => void setup(),
    get: (name: string) => {
      if (name === 'settings') return settingsMounted ? settings : undefined
      if (name === 'connection') return { admit: () => ({ peer: {} }) }
      return undefined
    },
  } as unknown as HostContext

  const config = {
    libraryRoot: { get: () => root },
    openState: { get: () => '' },
    ffmpegPath: { get: () => '' },
    installId: { get: () => box.installId },
    // On: this file is about the ping. The default sender refuses under a test runner, so no
    // request leaves the process.
    telemetry: true,
  } as unknown as Config
  apply(ctx, config)

  // The guard wraps every route; calling one admitted request is what starts the ping.
  const route = routes.find((candidate) => candidate.path === '/lingualab/config')
  if (route === undefined) throw new Error('the config route was not mounted')

  return {
    admit: () => {
      // The handler is what the guard calls after admitting; a GET needs no body.
      const request = { method: 'GET', headers: {} } as never
      const response = {
        writeHead: () => response,
        end: () => undefined,
        setHeader: () => undefined,
      } as never
      void Promise.resolve(route.handler(request, response))
    },
    storedId: () => box.installId,
    writes,
    setSettingsMounted: (mounted) => void (settingsMounted = mounted),
    failNextWrite: (fail) => void (failNext = fail),
  }
}

describe('the install id through the real wiring', () => {
  it('writes the id into the profile entry under the plugin namespace', async () => {
    const mounted = mount()
    mounted.admit()
    await flush()

    expect(mounted.writes).toHaveLength(1)
    expect(mounted.writes[0]?.ns).toBe('lingualab')
    expect(typeof mounted.writes[0]?.patch.installId).toBe('string')
    expect(mounted.storedId()).toBe(mounted.writes[0]?.patch.installId)
  })

  it('retries through the adapter after the settings service refused the first write', async () => {
    // The incident: the service was broken when the first ping went out. The adapter must hand the
    // rejection back rather than swallow it, and a later admitted request must try again.
    vi.useFakeTimers()
    const mounted = mount()
    mounted.failNextWrite(true)
    mounted.admit()
    await flush()
    expect(mounted.writes).toHaveLength(0)
    expect(mounted.storedId()).toBe('')

    vi.advanceTimersByTime(SAVE_RETRY_MS)
    mounted.admit()
    await flush()
    expect(mounted.writes).toHaveLength(1)
    expect(mounted.storedId()).not.toBe('')
  })

  it('retries through the adapter once the settings service is mounted', async () => {
    // The other half of the incident: the service was not there at all yet, which the adapter
    // reports as a rejection rather than as a silent no-op.
    vi.useFakeTimers()
    const mounted = mount()
    mounted.setSettingsMounted(false)
    mounted.admit()
    await flush()
    expect(mounted.writes).toHaveLength(0)

    mounted.setSettingsMounted(true)
    vi.advanceTimersByTime(SAVE_RETRY_MS)
    mounted.admit()
    await flush()
    expect(mounted.writes).toHaveLength(1)
    expect(mounted.storedId()).not.toBe('')
  })

  it('reuses the id the profile already holds instead of writing a new one', async () => {
    // A restart is a second mount over the same profile box: it must read the id back, not make one.
    const box: ProfileBox = { installId: '' }
    const first = mount(box)
    first.admit()
    await flush()
    const id = first.storedId()
    expect(id).not.toBe('')

    const second = mount(box)
    second.admit()
    await flush()
    expect(second.storedId()).toBe(id)
    // A stored id is never rewritten.
    expect(second.writes).toHaveLength(0)
  })
})
