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

/**
 * The shortest gap between two attempts to store the install id.
 *
 * The write is retried by admitted requests rather than by the next ping, because a process that
 * restarts before that ping would lose the id. This is the floor under that retry: a settings
 * service that is permanently broken costs one attempt per interval, not one per request.
 *
 * It doubles as the in-flight lease. A write that never settles must not own the slot for the rest
 * of the process, or a service that recovers after hanging would never be asked again; abandoning
 * the attempt is harmless because a late success stores the same id this process already reports.
 */
export const SAVE_RETRY_MS = 30_000

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
   * The promise is awaited in the background so a rejection is a fact this module can act on rather
   * than a write that may or may not have landed; the ping itself never waits for it, and a
   * rejection is never a reason to drop the ping.
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

/** A UUID v4, in either case: the shape is what matters, not the spelling. */
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * The canonical form of a stored id, or `null` when the value is not a UUID v4.
 *
 * A stored value is trusted only when it has the shape the contract names, and it is reported in the
 * one spelling this module writes. Case is normalised rather than rejected: an uppercase UUID is the
 * same id, and refusing it would silently stop reporting for a value a human could have typed.
 *
 * A value that is not a UUID v4 at all is neither reported nor replaced. Reporting it would put a
 * string into the counts that does not meet the contract, and a truncated one has too little entropy
 * to be safe from collisions; replacing it would silently split one installation into two, because
 * nothing here can tell whether it once stood for an id that was already reported.
 * @param value - the raw config value.
 * @returns the lowercase UUID v4, or `null` when the value is not one.
 */
export function canonicalInstallId(value: string): string | null {
  return UUID_V4.test(value) ? value.toLowerCase() : null
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
  /** When the current lease started, or `null` when no attempt is holding one. */
  let savingSince: number | null = null
  /** Identifies the attempt that owns {@link savingSince}, so a stale one cannot clear a newer lease. */
  let savingAttempt = 0
  /** When the last write was tried, so a permanently broken service is not hammered. */
  let lastSaveAttemptAt: number | null = null

  /**
   * Offer the id to the settings service, and remember whether it landed.
   *
   * This is deliberately not awaited by the ping: the id is worth reporting whether or not it can be
   * stored, and a settings service that never answers must not hold the request that started the
   * ping. What it does own is the retry — a write that failed is retried by the next admitted
   * request, not by the next ping a day later, because a process that restarts inside that day
   * would otherwise still lose the id.
   */
  const rememberId = (id: string): void => {
    if (persisted) return
    const now = clock()
    // At most one new attempt per interval, and the lease and the backoff are the same window, so
    // an attempt that hangs stops holding the lease exactly when the next one becomes due. The
    // abandoned attempt is not cancelled — it cannot be — and may still settle later; that is
    // harmless, because every attempt writes the same id this process already reports.
    if (savingSince !== null && now - savingSince < SAVE_RETRY_MS) return
    if (lastSaveAttemptAt !== null && now - lastSaveAttemptAt < SAVE_RETRY_MS) return
    savingSince = now
    lastSaveAttemptAt = now
    const attempt = ++savingAttempt
    void (async () => {
      try {
        await options.saveInstallId(id)
        persisted = true
      } catch {
        // Silence is the contract; the next admitted request retries the write.
      } finally {
        // Only the attempt that still owns the flag clears it: a later one may have taken over.
        if (savingAttempt === attempt) savingSince = null
      }
    })()
  }

  /**
   * The id, generated once and kept.
   *
   * A stored id wins and is never rewritten. Otherwise one is generated here and offered to the
   * settings service; until that write lands, every admitted request offers it again.
   *
   * A stored value that is not a UUID v4 is neither used nor replaced, and it does not consume the
   * ping window: the caller only stamps the window once it has an id to report, so fixing the value
   * resumes reporting on the next admitted request rather than a day later.
   * @returns the id to report, or `null` when the stored value is unusable.
   */
  const ensureId = (): string | null => {
    if (currentId !== null) {
      if (!persisted) rememberId(currentId)
      return currentId
    }
    let stored: string
    try {
      stored = options.installId().trim()
    } catch {
      stored = ''
    }
    if (stored.length > 0) {
      const canonical = canonicalInstallId(stored)
      if (canonical === null) return null
      currentId = canonical
      persisted = true
      return canonical
    }
    currentId = randomUUID()
    rememberId(currentId)
    return currentId
  }

  /** One ping, swallowed in every direction: no retry, no log, no rethrow. */
  const ping = async (id: string): Promise<void> => {
    try {
      const manifest = options.manifest
      if (manifest.pkg.length === 0 || manifest.version.length === 0) return
      await postPayload(fetchFn, buildPayload({ manifest, id, metrics: metricsNow(options) }))
    } catch {
      // Silence is the contract; the request this rode on has already been answered.
    }
  }

  return {
    noteAdmitted(): void {
      try {
        if (!options.enabled()) return
        // The id is settled on every admitted request, not only when a ping is due: a write that
        // failed has to be retried long before the next ping, or a restart in between loses it.
        const id = ensureId()
        // No usable id means no ping, and no window consumed either: the next request after the
        // value is fixed reports immediately instead of waiting out a day it never used.
        if (id === null) return
        const now = clock()
        // Stamped before the ping starts, so two requests admitted in the same tick cannot both send.
        if (lastPingAt !== null && now - lastPingAt < PING_INTERVAL_MS) return
        lastPingAt = now
        void ping(id)
      } catch {
        // A broken reader or clock must not reach the route.
      }
    },
  }
}
