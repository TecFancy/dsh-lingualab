/**
 * The anonymous usage ping.
 *
 * What these pin is the contract at its edges, because every failure mode here is quiet: a ping
 * that goes out when it was turned off, one that repeats every request, one that carries a path,
 * or one that throws into the route that started it would all pass a reading of the happy path.
 * So the cases below are the ones the shared contract names, plus the readers that build the
 * numbers, and every one of them replaces the network and the clock: a test never opens a socket.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeTempDir } from '../testing/index.ts'
import {
  buildPayload,
  canonicalInstallId,
  countEpisodeFolders,
  createTelemetry,
  episodeBucket,
  PING_INTERVAL_MS,
  PING_TIMEOUT_MS,
  readPackageManifest,
  SAVE_RETRY_MS,
  TELEMETRY_ENDPOINT,
  type Telemetry,
  type TelemetryOptions,
  type TelemetryPayload,
} from './telemetry.ts'

/** An id in the shape the contract names, for the cases that start from a stored one. */
const STORED_ID = '0f4a9c1e-6d2b-4c33-9a51-1d2c3b4a5e6f'

/** Directories a test made, removed afterwards. */
const made: string[] = []

afterEach(() => {
  vi.useRealTimers()
  for (const dir of made.splice(0)) rmSync(dir, { recursive: true, force: true })
})

/** A temporary directory, remembered for cleanup. */
function tempDir(): string {
  const dir = makeTempDir('lingualab-telemetry-')
  made.push(dir)
  return dir
}

/** Let every microtask the fire-and-forget ping queued run before asserting on its effects. */
async function flush(): Promise<void> {
  for (let turn = 0; turn < 5; turn += 1) await Promise.resolve()
}

/** One reporter with a fake network, a fake clock and a record of every request it made. */
function harness(overrides: Partial<TelemetryOptions> = {}): {
  telemetry: Telemetry
  sent: TelemetryPayload[]
  requests: { url: string; init: RequestInit }[]
  saved: string[]
  advance: (ms: number) => void
} {
  const sent: TelemetryPayload[] = []
  const requests: { url: string; init: RequestInit }[] = []
  const saved: string[] = []
  let stored = ''
  let now = 1_000_000

  const telemetry = createTelemetry({
    enabled: () => true,
    installId: () => stored,
    saveInstallId: async (id) => {
      saved.push(id)
      stored = id
    },
    libraryRoot: () => '',
    ffmpeg: () => true,
    manifest: { pkg: 'dsh-lingualab', version: '0.19.1' },
    fetch: async (url, init) => {
      requests.push({ url, init })
      sent.push(JSON.parse(String(init.body)) as TelemetryPayload)
    },
    now: () => now,
    ...overrides,
  })

  return { telemetry, sent, requests, saved, advance: (ms) => void (now += ms) }
}

describe('the usage ping', () => {
  it('sends nothing while the telemetry setting is off', async () => {
    const report = harness({ enabled: () => false })

    for (let request = 0; request < 3; request += 1) report.telemetry.noteAdmitted()
    report.advance(PING_INTERVAL_MS)
    report.telemetry.noteAdmitted()
    await flush()

    expect(report.sent).toHaveLength(0)
    // No request also means no id was made, and nothing was written into the config.
    expect(report.saved).toHaveLength(0)
  })

  it('sends at most one ping in 24 hours in one process', async () => {
    const report = harness()

    report.telemetry.noteAdmitted()
    report.telemetry.noteAdmitted()
    await flush()
    expect(report.sent).toHaveLength(1)

    report.advance(PING_INTERVAL_MS - 1)
    report.telemetry.noteAdmitted()
    await flush()
    expect(report.sent).toHaveLength(1)

    report.advance(1)
    report.telemetry.noteAdmitted()
    await flush()
    expect(report.sent).toHaveLength(2)
  })

  it('sends exactly the payload keys the contract names', async () => {
    const root = tempDir()
    for (let episode = 1; episode <= 7; episode += 1) mkdirSync(join(root, `S01E0${episode}`))
    const report = harness({ libraryRoot: () => root })

    report.telemetry.noteAdmitted()
    await flush()

    expect(report.requests).toHaveLength(1)
    expect(report.requests[0]?.url).toBe(TELEMETRY_ENDPOINT)
    expect(report.requests[0]?.init.method).toBe('POST')
    expect((report.requests[0]?.init.headers as Record<string, string>)['content-type']).toBe('application/json')

    const payload = report.sent[0]!
    expect(Object.keys(payload).sort()).toEqual(['arch', 'id', 'metrics', 'node', 'os', 'pkg', 'v', 'version'])
    expect(Object.keys(payload.metrics).sort()).toEqual(['episodes', 'ffmpeg'])
    expect(payload).toMatchObject({
      v: 1,
      pkg: 'dsh-lingualab',
      version: '0.19.1',
      metrics: { episodes: '6-20', ffmpeg: true },
    })
    expect(payload.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(payload.node).toMatch(/^v\d+$/)
    expect(['linux', 'darwin', 'win32', 'other']).toContain(payload.os)
    expect(['x64', 'arm64', 'other']).toContain(payload.arch)
  })

  it('stays silent when the request fails or takes too long, and never rethrows', async () => {
    const failing = harness({
      fetch: async () => {
        throw new Error('offline')
      },
    })
    expect(() => failing.telemetry.noteAdmitted()).not.toThrow()
    await flush()
    expect(failing.sent).toHaveLength(0)

    vi.useFakeTimers()
    // In a box, not a bare `let`: the assignment happens inside a callback and TypeScript keeps a
    // local narrowed to `null` there, which would make the assertions below untypeable.
    const seen: { signal: AbortSignal | null } = { signal: null }
    const hanging = harness({
      // A sender that never answers: only the module's own timeout can end it.
      fetch: (_url, init) => {
        const { signal } = init
        seen.signal = signal ?? null
        return new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(new Error('aborted')))
        })
      },
    })
    expect(() => hanging.telemetry.noteAdmitted()).not.toThrow()
    await vi.advanceTimersByTimeAsync(PING_TIMEOUT_MS)
    expect(seen.signal).not.toBeNull()
    expect(seen.signal?.aborted).toBe(true)
  })

  it('never reaches the network through the default sender under a test runner', async () => {
    // The guard this pins exists because a test once mounted the real plugin and the default
    // sender posted live pings from `npm test` and from CI. No injected `fetch` here on purpose.
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(null, { status: 204 }))
    try {
      const report = createTelemetry({
        enabled: () => true,
        installId: () => STORED_ID,
        saveInstallId: async () => undefined,
        libraryRoot: () => '',
        ffmpeg: () => false,
        manifest: { pkg: 'dsh-lingualab', version: '0.19.1' },
      })
      report.noteAdmitted()
      await flush()
      expect(spy).not.toHaveBeenCalled()
    } finally {
      spy.mockRestore()
    }
  })

  it('generates the install id once and reuses it', async () => {
    const report = harness()
    report.telemetry.noteAdmitted()
    await flush()
    report.advance(PING_INTERVAL_MS)
    report.telemetry.noteAdmitted()
    await flush()

    expect(report.sent).toHaveLength(2)
    expect(report.sent[0]?.id).toBe(report.sent[1]?.id)
    // Written once, so the next start reads the same id instead of making another.
    expect(report.saved).toEqual([report.sent[0]?.id])

    const stored = harness({ installId: () => STORED_ID })
    stored.telemetry.noteAdmitted()
    await flush()
    expect(stored.sent[0]?.id).toBe(STORED_ID)
    expect(stored.saved).toHaveLength(0)
  })

  it('skips the ping rather than report or replace a stored value that is not an id', async () => {
    // A hand-edited or half-written value is not an id. Reporting it would put a string into the
    // counts that does not meet the contract, and a truncated one has too little entropy to be safe
    // from collisions; replacing it would silently split one installation into two. So nothing is
    // sent and nothing is written, and the value is left for a human to fix.
    for (const broken of ['not-a-uuid', '6a403451', '6a403451-e825-4256-8e79-7aad7e6631b', '']) {
      const report = harness({ installId: () => broken })
      report.telemetry.noteAdmitted()
      await flush()
      if (broken === '') {
        // An empty value is not broken, it is "no id yet": one is generated and written.
        expect(report.sent).toHaveLength(1)
        expect(report.saved).toHaveLength(1)
        continue
      }
      expect(report.sent).toHaveLength(0)
      expect(report.saved).toHaveLength(0)
    }
  })

  it('reports a stored id in the one spelling this module writes, whatever case it was typed in', async () => {
    // An uppercase UUID is the same id, so refusing it would silently stop reporting for a value a
    // human could have typed. It is normalised in memory and the config is left alone.
    const upper = harness({ installId: () => STORED_ID.toUpperCase() })
    upper.telemetry.noteAdmitted()
    await flush()
    expect(upper.sent[0]?.id).toBe(STORED_ID)
    expect(upper.saved).toHaveLength(0)

    const canonical = harness({ installId: () => STORED_ID })
    canonical.telemetry.noteAdmitted()
    await flush()
    expect(canonical.sent[0]?.id).toBe(STORED_ID)
  })

  it('resumes on the next request once a broken value is fixed, without waiting out a day', async () => {
    // The broken value must not consume the ping window: a window stamped for a ping that never went
    // out would delay the first real report by a day, which is not what "fix the field" should mean.
    let stored = 'not-a-uuid'
    const report = harness({ installId: () => stored })
    report.telemetry.noteAdmitted()
    await flush()
    expect(report.sent).toHaveLength(0)

    stored = STORED_ID
    report.telemetry.noteAdmitted()
    await flush()
    expect(report.sent).toHaveLength(1)
    expect(report.sent[0]?.id).toBe(STORED_ID)
  })

  it('never overwrites the broken value it refused to report', async () => {
    // Replacing it would split one installation into two, so the value stays exactly as it was.
    const report = harness({ installId: () => 'not-a-uuid' })
    for (let request = 0; request < 3; request += 1) report.telemetry.noteAdmitted()
    await flush()
    expect(report.saved).toHaveLength(0)
    expect(report.sent).toHaveLength(0)
  })

  it('retries a failed write once the backoff has passed, not a day later', async () => {
    // The settings service is mounted after the first request in a real composition, so the first
    // write can legitimately reject. What must not happen is waiting for the next ping to retry it:
    // a process that restarts inside that day would still lose the id, which is the bug this pins.
    const attempts: string[] = []
    let stored = ''
    let failNext = true
    const report = harness({
      installId: () => stored,
      saveInstallId: async (id) => {
        attempts.push(id)
        if (failNext) {
          failNext = false
          throw new Error('settings service not mounted yet')
        }
        stored = id
      },
    })

    report.telemetry.noteAdmitted()
    await flush()
    // The ping still went out, with the id it could not save yet.
    expect(report.sent).toHaveLength(1)
    expect(attempts).toEqual([report.sent[0]?.id])

    // Only the save backoff passes here, not the 24 hour ping window: the next admitted request
    // retries the write and still sends no second ping.
    report.advance(SAVE_RETRY_MS)
    report.telemetry.noteAdmitted()
    await flush()
    expect(attempts).toEqual([report.sent[0]?.id, report.sent[0]?.id])
    expect(stored).toBe(report.sent[0]?.id)
    expect(report.sent).toHaveLength(1)

    // Once it has landed it is not written again.
    report.advance(SAVE_RETRY_MS)
    report.telemetry.noteAdmitted()
    await flush()
    expect(attempts).toHaveLength(2)
  })

  it('survives the whole incident: first write fails, a later request saves it, a restart reuses it', async () => {
    // The failure that was actually observed: the settings service was broken when the first ping
    // went out, and the id was lost because nothing retried. This walks that exact path end to end.
    let stored = ''
    let broken = true
    const first = harness({
      installId: () => stored,
      saveInstallId: async (id) => {
        if (broken) throw new Error('settings.update is broken')
        stored = id
      },
    })

    first.telemetry.noteAdmitted()
    await flush()
    const id = first.sent[0]?.id
    expect(stored).toBe('')

    // The host bug is fixed; the next admitted request saves the id the first ping already reported.
    broken = false
    first.advance(SAVE_RETRY_MS)
    first.telemetry.noteAdmitted()
    await flush()
    expect(stored).toBe(id)

    // The restart reads it back instead of making a new one.
    const second = harness({ installId: () => stored })
    second.telemetry.noteAdmitted()
    await flush()
    expect(second.sent[0]?.id).toBe(id)
  })

  it('keeps the id a restart would read back, and does not make a new one', async () => {
    // The real bug was observed across restarts, so this one crosses one: the second reporter is a
    // new instance reading the same storage, exactly as the next process would.
    let stored = ''
    const first = harness({
      installId: () => stored,
      saveInstallId: async (id) => {
        stored = id
      },
    })
    first.telemetry.noteAdmitted()
    await flush()
    const id = first.sent[0]?.id
    expect(stored).toBe(id)

    const second = harness({ installId: () => stored })
    second.telemetry.noteAdmitted()
    await flush()
    expect(second.sent[0]?.id).toBe(id)
    // A stored id is never rewritten.
    expect(second.saved).toHaveLength(0)
  })

  it('does not let a write that never settles hold the ping', async () => {
    // A settings service that hangs must not delay the request that started the ping, nor the ping
    // itself: the id is worth reporting whether or not it can be stored.
    const report = harness({
      saveInstallId: () => new Promise<void>(() => undefined),
    })
    report.telemetry.noteAdmitted()
    await flush()
    expect(report.sent).toHaveLength(1)
  })

  it('tries again after a write that hung, so a recovered service still gets the id', async () => {
    // A write that never settles must not own the in-flight slot for the rest of the process: the
    // service may recover, and the id is only safe once it has been stored.
    const attempts: string[] = []
    let stored = ''
    let hang = true
    const report = harness({
      installId: () => stored,
      saveInstallId: async (id) => {
        attempts.push(id)
        if (hang) return new Promise<void>(() => undefined)
        stored = id
      },
    })

    report.telemetry.noteAdmitted()
    await flush()
    expect(attempts).toHaveLength(1)
    expect(report.sent).toHaveLength(1)

    // Once its lease has expired, the next admitted request tries again.
    hang = false
    report.advance(SAVE_RETRY_MS)
    report.telemetry.noteAdmitted()
    await flush()
    expect(attempts).toHaveLength(2)
    expect(stored).toBe(report.sent[0]?.id)
  })

  it('backs off a write that keeps failing instead of trying on every request', async () => {
    const attempts: string[] = []
    const report = harness({
      saveInstallId: async (id) => {
        attempts.push(id)
        throw new Error('settings service is broken')
      },
    })

    report.telemetry.noteAdmitted()
    await flush()
    expect(attempts).toHaveLength(1)

    // Inside the retry floor: no second attempt, however many requests arrive.
    for (let request = 0; request < 5; request += 1) report.telemetry.noteAdmitted()
    await flush()
    expect(attempts).toHaveLength(1)

    report.advance(SAVE_RETRY_MS)
    report.telemetry.noteAdmitted()
    await flush()
    expect(attempts).toHaveLength(2)
  })

  it('never carries a path, a subtitle or an audio file name', async () => {
    const root = tempDir()
    mkdirSync(join(root, 'S01E01'))
    writeFileSync(join(root, 'S01E01', 'audio.mp3'), '')
    writeFileSync(join(root, 'S01E01', 'S01E01.en.srt'), '')
    const report = harness({ libraryRoot: () => root })

    report.telemetry.noteAdmitted()
    await flush()

    const body = String(report.requests[0]?.init.body)
    for (const forbidden of ['/', '\\', '/home', '.srt', '.mp3', 'audio']) {
      expect(body).not.toContain(forbidden)
    }
  })
})

describe('the readers behind the metrics', () => {
  it('accepts only a UUID v4 as a stored id, and normalises its case', () => {
    // Table-driven on purpose: the shape is a contract, and every way of missing it is a different
    // way for a bad value to reach the counts.
    const cases: [string, string | null][] = [
      [STORED_ID, STORED_ID],
      [STORED_ID.toUpperCase(), STORED_ID],
      // Wrong version digit: v1 and v7 are real UUIDs, but not the one this module writes.
      ['0f4a9c1e-6d2b-1c33-9a51-1d2c3b4a5e6f', null],
      ['0f4a9c1e-6d2b-7c33-9a51-1d2c3b4a5e6f', null],
      // Wrong variant nibble.
      ['0f4a9c1e-6d2b-4c33-1a51-1d2c3b4a5e6f', null],
      // Not hexadecimal.
      ['0f4a9c1e-6d2b-4c33-9a51-1d2c3b4a5e6g', null],
      // One character short, one too many.
      ['0f4a9c1e-6d2b-4c33-9a51-1d2c3b4a5e6', null],
      ['0f4a9c1e-6d2b-4c33-9a51-1d2c3b4a5e6ff', null],
      // Hyphens in the wrong places.
      ['0f4a9c1e6-d2b-4c33-9a51-1d2c3b4a5e6f', null],
      ['0f4a9c1e-6d2b-4c33-9a51-1d2c3b4a5e6f-', null],
      // Not an id at all.
      ['', null],
      ['not-a-uuid', null],
      ['6a403451', null],
    ]
    for (const [input, expected] of cases) {
      expect(canonicalInstallId(input), input).toBe(expected)
    }
  })

  it('buckets the episode count at the contract’s edges', () => {
    expect(episodeBucket(null)).toBe('0')
    expect(episodeBucket(0)).toBe('0')
    expect(episodeBucket(1)).toBe('1-5')
    expect(episodeBucket(5)).toBe('1-5')
    expect(episodeBucket(6)).toBe('6-20')
    expect(episodeBucket(20)).toBe('6-20')
    expect(episodeBucket(21)).toBe('21+')
  })

  it('counts folders with one listing and counts no hidden folder', () => {
    const root = tempDir()
    mkdirSync(join(root, 'S01E01'))
    mkdirSync(join(root, 'S01E02'))
    mkdirSync(join(root, '.lingualab'))
    writeFileSync(join(root, 'notes.md'), '')

    expect(countEpisodeFolders(root)).toBe(2)
    expect(countEpisodeFolders('')).toBe(0)
    expect(countEpisodeFolders(join(root, 'nope'))).toBeNull()
  })

  it('reads the package name and version, and reports nothing when it cannot', () => {
    const read = (text: string) => () => text
    expect(readPackageManifest('/x', read('{"name":"dsh-lingualab","version":"0.19.1"}'))).toEqual({
      pkg: 'dsh-lingualab',
      version: '0.19.1',
    })
    expect(readPackageManifest('/x', read('not json'))).toEqual({ pkg: '', version: '' })
    expect(readPackageManifest('/x', () => {
      throw new Error('nope')
    })).toEqual({ pkg: '', version: '' })
  })

  it('maps the machine onto the contract’s closed sets', () => {
    const base = {
      manifest: { pkg: 'dsh-lingualab', version: '0.19.1' },
      id: STORED_ID,
      metrics: { episodes: '0' as const, ffmpeg: false },
    }
    expect(
      buildPayload({ ...base, host: { nodeVersion: '22.11.0', platform: 'freebsd', arch: 'ia32' } }),
    ).toMatchObject({ node: 'v22', os: 'other', arch: 'other' })
    expect(
      buildPayload({ ...base, host: { nodeVersion: '20.1.0', platform: 'darwin', arch: 'arm64' } }),
    ).toMatchObject({ node: 'v20', os: 'darwin', arch: 'arm64' })
  })
})
