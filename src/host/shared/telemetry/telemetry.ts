/**
 * Anonymous usage statistics: one ping, at most once a day, after a request the host admitted.
 *
 * The question this answers is how many machines actually run the plugin and which version they run,
 * and it answers it without an account, a server of our own, or a third-party SDK. What leaves the
 * machine is the contract in the repo's telemetry note: the package name and version, a random id,
 * the Node major, the platform, the architecture, and two numbers about the library (how many
 * episode folders, and whether `ffmpeg` was found). No file name, folder path, episode title, note,
 * subtitle, user name, email, token, session id, host name or address is ever part of it.
 *
 * Two rules shape the module more than anything else:
 *
 *   · it is lazy. There is no timer and no call at load: the ping is due only when a request has
 *     already been let through, because that is the only moment the plugin is known to be in use.
 *     A process that is started and never used sends nothing.
 *   · it is silent. The ping has five seconds to finish, is never retried, is never logged, and is
 *     never awaited: a request that was admitted answers as fast whether the endpoint answers or
 *     not. Everything that can go wrong ends in a `catch` here, so no caller needs one.
 *
 * The network and the clock are injectable, and the counters are readers rather than values, so the
 * tests need neither a socket nor a real library and can move a day forward in one step.
 */
import { randomUUID } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** The endpoint every version of the contract reports to. */
export const TELEMETRY_ENDPOINT = 'https://t.hi-ruofei.com/v1/ping'

/** The payload version this module speaks. */
export const TELEMETRY_VERSION = 1

/** The shortest gap between two pings in one process: a day. */
export const PING_INTERVAL_MS = 24 * 60 * 60 * 1000

/** How long one ping may take before it is given up on. */
export const PING_TIMEOUT_MS = 5_000

/** The bucketed episode count; the buckets are the contract's, not a display choice. */
export type EpisodeBucket = '0' | '1-5' | '6-20' | '21+'

/**
 * This package's fixed metric set: flat values, one key per fact, never a temporary object.
 */
export interface TelemetryMetrics {
  /** The library root's episode folders, bucketed: `0`, `1-5`, `6-20` or `21+`. */
  readonly episodes: EpisodeBucket
  /** Whether the host can find `ffmpeg`. */
  readonly ffmpeg: boolean
}

/** The v1 body, exactly: the keys and the shapes the other half of the contract also sends. */
export interface TelemetryPayload {
  readonly v: number
  readonly pkg: string
  readonly version: string
  readonly id: string
  readonly node: string
  readonly os: string
  readonly arch: string
  readonly metrics: TelemetryMetrics
}

/** This package's name and version, as its own `package.json` declares them. */
export interface PackageManifest {
  readonly pkg: string
  readonly version: string
}

/** The `fetch` this module calls; tests replace it, so no test opens a socket. */
export type TelemetryFetch = (url: string, init: RequestInit) => Promise<unknown>

/**
 * Whether this process is a test runner.
 *
 * The guard below exists because of a real incident: `routes.test.ts` mounts the real plugin
 * through `apply`, so the default sender posted a live ping on every admitted request, and
 * `npm test` plus CI wrote rows into the production database for two days. An explicit
 * `telemetry: false` in that test is the fix; this is the belt under it, so the next test that
 * forgets cannot reach the endpoint either.
 */
function underTestRunner(): boolean {
  return (process.env.VITEST ?? '').length > 0 || process.env.NODE_ENV === 'test'
}

/**
 * The sender used when a caller injects none.
 *
 * A test keeps its injected `fetch`; only the default one is refused, and it is refused rather
 * than silently swapped for a stub so a test that expected a ping sees the absence.
 */
const defaultFetch: TelemetryFetch = (url, init) => {
  if (underTestRunner()) return Promise.reject(new Error('telemetry is disabled under a test runner'))
  return globalThis.fetch(url, init)
}

/** The machine facts the payload carries, read once per ping. */
export interface HostFacts {
  /** `process.versions.node`, full. */
  readonly nodeVersion: string
  readonly platform: string
  readonly arch: string
}

/** What this module needs from the host half, every value a reader so it is current when used. */
export interface TelemetryOptions {
  /** Whether the `telemetry` config field is on; read for every admitted request. */
  readonly enabled: () => boolean
  /** The `installId` config field, or `''` when none has been generated yet. */
  readonly installId: () => string
  /**
   * Persist an id, resolving once it is durable and rejecting when it is not.
   *
   * The promise is awaited before the id is reported, so a rejection is a fact this module can act
   * on rather than a write that may or may not have landed. It is never a reason to drop the ping.
   */
  readonly saveInstallId: (id: string) => Promise<void>
  /** The library root at ping time; the episode count comes from one listing of it. */
  readonly libraryRoot: () => string
  /** Whether `ffmpeg` can be found at ping time. */
  readonly ffmpeg: () => boolean
  /** The package name and version read at load. */
  readonly manifest: PackageManifest
  /** The network; `globalThis.fetch` when not given. */
  readonly fetch?: TelemetryFetch
  /** The clock in milliseconds; tests move time instead of waiting for it. */
  readonly now?: () => number
}

/** The one thing a caller needs: tell it a request went through. */
export interface Telemetry {
  /**
   * Note that a request was admitted.
   *
   * Returns immediately: when a ping is due it is started and not awaited. Never throws, and never
   * waits for the network, so the route that calls it is unaffected either way.
   */
  noteAdmitted(): void
}

/** The bucket a folder count falls in; a root that cannot be read counts as none. */
export function episodeBucket(folders: number | null): EpisodeBucket {
  if (folders === null || folders <= 0) return '0'
  if (folders <= 5) return '1-5'
  if (folders <= 20) return '6-20'
  return '21+'
}

/**
 * Count the episode folders under the library root with one listing.
 *
 * The full library scan is deliberately not run: the ping needs a number, and a workspace can hold
 * tens of thousands of files. A hidden folder is the plugin's own cache, not an episode, so it is
 * not counted.
 * @param root - the resolved library root; empty when none is set.
 * @returns the folder count, or `null` when the root cannot be read.
 */
export function countEpisodeFolders(root: string): number | null {
  const path = root.trim()
  if (path.length === 0) return 0
  try {
    return readdirSync(path, { withFileTypes: true }).filter(
      (entry) => entry.isDirectory() && !entry.name.startsWith('.'),
    ).length
  } catch {
    return null
  }
}

/** The operating system, mapped to the contract's closed set. */
function hostOs(platform: string): string {
  return platform === 'linux' || platform === 'darwin' || platform === 'win32' ? platform : 'other'
}

/** The architecture, mapped to the contract's closed set. */
function hostArch(arch: string): string {
  return arch === 'x64' || arch === 'arm64' ? arch : 'other'
}

/** The machine as it will be reported. */
export function hostFacts(): HostFacts {
  return { nodeVersion: process.versions.node, platform: process.platform, arch: process.arch }
}

/**
 * Build the v1 body.
 *
 * The object is assembled key by key rather than spread, so the key set is exactly the contract's:
 * a metrics object handed in with something extra cannot leak it into the request.
 * @param input - the manifest, the id, the metrics, and optionally the machine (tests).
 * @returns the body, ready to serialize.
 */
export function buildPayload(input: {
  readonly manifest: PackageManifest
  readonly id: string
  readonly metrics: TelemetryMetrics
  readonly host?: HostFacts
}): TelemetryPayload {
  const host = input.host ?? hostFacts()
  return {
    v: TELEMETRY_VERSION,
    pkg: input.manifest.pkg,
    version: input.manifest.version,
    id: input.id,
    node: `v${host.nodeVersion.split('.')[0] ?? ''}`,
    os: hostOs(host.platform),
    arch: hostArch(host.arch),
    metrics: { episodes: input.metrics.episodes, ffmpeg: input.metrics.ffmpeg },
  }
}

/** Read `package.json` once at load; a manifest that cannot be read reports nothing and the ping is skipped. */
export function readPackageManifest(root: string, read: (path: string) => string = readFileSyncText): PackageManifest {
  try {
    const manifest = JSON.parse(read(join(root, 'package.json'))) as { name?: unknown; version?: unknown }
    return {
      pkg: typeof manifest.name === 'string' ? manifest.name : '',
      version: typeof manifest.version === 'string' ? manifest.version : '',
    }
  } catch {
    return { pkg: '', version: '' }
  }
}

/** `readFileSync` as a plain reader, so the manifest read can be replaced in a test. */
function readFileSyncText(path: string): string {
  return readFileSync(path, 'utf8')
}

/** The metrics as they are at ping time; a reader that throws reads as "none". */
function metricsNow(options: TelemetryOptions): TelemetryMetrics {
  // Declared without a value: both branches assign, and an initial value here would only be the
  // one the linter (rightly) reports as never read.
  let root: string
  try {
    root = options.libraryRoot()
  } catch {
    root = ''
  }
  let ffmpeg: boolean
  try {
    ffmpeg = options.ffmpeg()
  } catch {
    ffmpeg = false
  }
  return { episodes: episodeBucket(countEpisodeFolders(root)), ffmpeg }
}

/** POST one body, giving up after {@link PING_TIMEOUT_MS}. */
async function postPayload(fetchFn: TelemetryFetch, payload: TelemetryPayload): Promise<void> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)
  try {
    await fetchFn(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * The reporter the host half hands to its routes.
 * @param options - the config readers, the manifest, and the injected network and clock.
 * @returns the hook the request guard calls after it admits a request.
 */
export function createTelemetry(options: TelemetryOptions): Telemetry {
  const clock = options.now ?? Date.now
  const fetchFn: TelemetryFetch = options.fetch ?? defaultFetch
  let lastPingAt: number | null = null
  let currentId: string | null = null
  let persisted = false

  /**
   * Offer the id to the settings service, and remember whether it landed.
   *
   * The write is awaited rather than fired and forgotten: a rejected write is the difference
   * between one installation and a new one on every restart, so it has to be observable here.
   * It is still never a reason to drop the ping — an id that cannot be saved is reported anyway,
   * and the next ping tries again.
   */
  const rememberId = async (id: string): Promise<void> => {
    try {
      await options.saveInstallId(id)
      persisted = true
    } catch {
      // Silence is the contract; the next ping retries the write.
    }
  }

  /**
   * The id, generated once and kept.
   *
   * A stored id wins and is never rewritten. Otherwise one is generated and offered to the settings
   * service; while that write has not landed, every ping retries it, so a settings service that
   * was not ready on the first request still gets the id before the process ends.
   */
  const ensureId = async (): Promise<string> => {
    if (currentId !== null) {
      if (!persisted) await rememberId(currentId)
      return currentId
    }
    let stored: string
    try {
      stored = options.installId().trim()
    } catch {
      stored = ''
    }
    if (stored.length > 0) {
      currentId = stored
      persisted = true
      return stored
    }
    currentId = randomUUID()
    await rememberId(currentId)
    return currentId
  }

  /** One ping, swallowed in every direction: no retry, no log, no rethrow. */
  const ping = async (): Promise<void> => {
    try {
      const manifest = options.manifest
      if (manifest.pkg.length === 0 || manifest.version.length === 0) return
      const id = await ensureId()
      await postPayload(fetchFn, buildPayload({ manifest, id, metrics: metricsNow(options) }))
    } catch {
      // Silence is the contract; the request this rode on has already been answered.
    }
  }

  return {
    noteAdmitted(): void {
      try {
        if (!options.enabled()) return
        const now = clock()
        // Stamped before the ping starts, so two requests admitted in the same tick cannot both send.
        if (lastPingAt !== null && now - lastPingAt < PING_INTERVAL_MS) return
        lastPingAt = now
        void ping()
      } catch {
        // A broken reader or clock must not reach the route.
      }
    },
  }
}
