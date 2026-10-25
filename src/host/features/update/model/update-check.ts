/**
 * Whether a newer release exists, asked of the checkout's own remote.
 *
 * "Newest" here means the newest `vX.Y.Z` tag, not the newest commit: a development build may be
 * many commits ahead of the last release, and saying it is "up to date" because no commit is newer
 * would be wrong the other way round. `git ls-remote` reads the tags without fetching, so the
 * working tree, the refs and the checked-out code stay exactly as they were.
 *
 * The run is bounded twice: the Git call has a timeout, and a finished answer is reused for a
 * quarter of an hour. A failed run is remembered for a minute only, so a dropped network recovers
 * quickly without every page view waiting on the remote.
 */
import type { PluginVersionInfo, UpdatePayload, UpdateState } from '../../../../shared/protocol.ts'
import { runGit } from './git.ts'

/** How long one release answer is reused before another check. */
const CACHE_MS = 15 * 60 * 1000

/** How long a failed answer is reused; shorter, because the remote may simply have been away. */
const FAILED_CACHE_MS = 60 * 1000

/**
 * How long `git ls-remote` may take before the answer is "unknown".
 *
 * Generous on purpose: over SSH the handshake alone was measured at five seconds on this machine,
 * and a read-only status must not fail because the remote was slow rather than absent.
 */
const GIT_TIMEOUT_MS = 12000

/** Run Git in the plugin's checkout; `null` when it cannot answer. */
export type GitRun = (args: readonly string[], cwd: string) => string | null

/** Newest release tag: its version without the `v`, and the commit it points at. */
export interface ReleaseTag {
  readonly version: string
  readonly commit: string | null
}

export interface UpdateChecker {
  /** `refresh` skips the cache; asks made while one run is in flight share it. */
  check(options?: { readonly refresh?: boolean }): Promise<UpdatePayload>
}

/** A checker bound to one checkout and the version this host loaded. */
export function createUpdateChecker(
  root: string,
  current: PluginVersionInfo,
  git: GitRun = (args, cwd) => runGit(args, cwd, GIT_TIMEOUT_MS),
): UpdateChecker {
  let cached: { readonly at: number; readonly payload: UpdatePayload } | null = null
  let pending: Promise<UpdatePayload> | null = null

  return {
    async check(options = {}) {
      const refresh = options.refresh === true
      if (!refresh && cached !== null && Date.now() - cached.at < ttlOf(cached.payload)) return cached.payload
      if (pending === null) {
        pending = Promise.resolve(readUpdate(root, current, git))
          .then((payload) => {
            cached = { at: Date.now(), payload }
            return payload
          })
          .finally(() => {
            pending = null
          })
      }
      return pending
    },
  }
}

function ttlOf(payload: UpdatePayload): number {
  return payload.state === 'unknown' ? FAILED_CACHE_MS : CACHE_MS
}

/** One check, without the cache: ask the remote for tags and compare with what is running. */
export function readUpdate(root: string, current: PluginVersionInfo, git: GitRun): UpdatePayload {
  if (current.version.length === 0) return unanswered(current, '读不到这个插件的版本')
  const output = git(['ls-remote', '--tags', 'origin', 'v*'], root)
  if (output === null) return unanswered(current, 'git ls-remote 没跑成：这台机器上执行不了，或者超时了')
  const latest = newestRelease(parseReleaseTags(output))
  if (latest === null) return unanswered(current, '远端没有读到 vX.Y.Z 标签')
  const order = compareVersions(current.version, latest.version)
  return { state: stateOf(order, current, latest), current, latest, reason: null }
}

function unanswered(current: PluginVersionInfo, reason: string): UpdatePayload {
  return { state: 'unknown', current, latest: null, reason }
}

function stateOf(order: number, current: PluginVersionInfo, latest: ReleaseTag): UpdateState {
  if (order < 0) return 'available'
  if (order > 0) return 'ahead'
  // Same version: the tag's commit decides whether this is that release or a build after it.
  if (current.commit === null || latest.commit === null) return 'latest'
  return latest.commit.startsWith(current.commit) ? 'latest' : 'same-version'
}

/**
 * The release tags in `git ls-remote --tags` output.
 *
 * An annotated tag shows twice: the tag object and its peeled `^{}` line. The peeled one names the
 * commit, so it wins; the tag object id would never match a checked-out commit.
 */
export function parseReleaseTags(output: string): readonly ReleaseTag[] {
  const rows = new Map<string, { commit: string | null; peeled: string | null }>()
  for (const line of output.split('\n')) {
    const [sha, ref] = line.trim().split(/\s+/)
    if (sha === undefined || ref === undefined || !ref.startsWith('refs/tags/')) continue
    const name = ref.slice('refs/tags/'.length)
    const tag = name.endsWith('^{}') ? name.slice(0, -3) : name
    if (!/^v\d+\.\d+\.\d+$/.test(tag)) continue
    const row = rows.get(tag) ?? { commit: null, peeled: null }
    if (name.endsWith('^{}')) row.peeled = sha
    else row.commit = sha
    rows.set(tag, row)
  }
  return [...rows.entries()].map(([name, row]) => ({ version: name.slice(1), commit: row.peeled ?? row.commit }))
}

/** The highest release tag by numeric version, not by string order. */
export function newestRelease(tags: readonly ReleaseTag[]): ReleaseTag | null {
  let best: ReleaseTag | null = null
  for (const tag of tags) {
    if (best === null || compareVersions(tag.version, best.version) > 0) best = tag
  }
  return best
}

/** Numeric compare of two `X.Y.Z` versions: negative, zero or positive like a sort. */
export function compareVersions(a: string, b: string): number {
  const left = partsOf(a)
  const right = partsOf(b)
  const major = left[0] - right[0]
  if (major !== 0) return major > 0 ? 1 : -1
  const minor = left[1] - right[1]
  if (minor !== 0) return minor > 0 ? 1 : -1
  const patch = left[2] - right[2]
  if (patch !== 0) return patch > 0 ? 1 : -1
  return 0
}

function partsOf(version: string): readonly [number, number, number] {
  const parts = version.split('.')
  const read = (index: number): number => {
    const value = Number.parseInt(parts[index] ?? '', 10)
    return Number.isNaN(value) ? -1 : value
  }
  return [read(0), read(1), read(2)]
}
