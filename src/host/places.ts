/**
 * Where the picker may look, and how a path inside one of those places is checked.
 *
 * Browsing is by *place id*, never by a path the browser supplies: the page asks
 * for `ws_ab12…` or `lib`, and this module answers with the absolute path it
 * resolved. A route that took a path would be a general file browser on somebody's
 * server, which is a different feature with a different threat model — so the two
 * rules that keep it from becoming one live here:
 *
 * 1. **The roots are an allow-list.** Workspaces come from the host's registry, and
 *    the library root comes from this plugin's config. Nothing else is addressable,
 *    and the roots a host would never mean to expose — `/`, `/etc`, `/proc` and the
 *    rest — are refused even when one of those lists names them by accident.
 * 2. **Every step down is checked against the root it started from**, after
 *    `realpath`, because a symlink inside a workspace can point anywhere and the
 *    lexical answer ("it starts with the root, so it is inside") would be a lie the
 *    filesystem tells only later.
 *
 * The id is derived from the root's own path, so it survives a restart and a
 * browser reload; a workspace that is re-registered at the same directory keeps the
 * id it had.
 */
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, realpathSync, statSync } from 'node:fs'
import { basename, isAbsolute, join, resolve, sep } from 'node:path'
import type { OpenRef, PlaceEntry, PlacesPayload } from '../shared/protocol.ts'
import { LIBRARY_SUBPATH } from './config.ts'

/**
 * Directories a place may never be, nor sit inside.
 *
 * The library root and the workspace roots are configuration, and configuration
 * gets written by hand: a typo that pointed the panel at `/` would list the whole
 * machine to a browser. These are the roots where nothing of the reader's media
 * lives and everything of the operating system's does.
 */
const FORBIDDEN_ROOTS = ['/etc', '/proc', '/sys', '/dev', '/run', '/boot', '/root'] as const

/** The one place that is not a workspace: the library root currently in effect. */
export const LIBRARY_PLACE_ID = 'lib'

/** The row title the library place is shown under. */
export const LIBRARY_PLACE_LABEL = '媒体库'

/** One workspace as this module needs it: a directory, and the name it goes by. */
export interface PlaceRoot {
  readonly path: string
  /** Display title the host gave the workspace; absent in thinner deployments. */
  readonly title?: string
}

/**
 * The stable id of a workspace place: `ws_` plus twelve hex characters of the
 * path's SHA-1.
 *
 * A hash rather than the path itself because the id travels in a URL and in the
 * page's state, and a path there would be both an eyesore and a second way to
 * address a directory the plugin has decided not to address by path at all.
 * @param path - the workspace's absolute directory.
 * @returns the place id.
 */
export function placeIdFor(path: string): string {
  return `ws_${createHash('sha1').update(path).digest('hex').slice(0, 12)}`
}

/**
 * The real path when the filesystem can answer, the resolved one when it cannot.
 *
 * Containment is decided between real paths — a symlink makes the lexical answer
 * wrong — but the checks also run for paths that do not exist yet, and there
 * `realpath` throws. Falling back to `resolve` keeps one code path for both, and
 * every caller that needs existence asks for it separately.
 * @param path - the path to canonicalise.
 * @returns the canonical path.
 */
export function realPathOf(path: string): string {
  try {
    return realpathSync(path)
  } catch {
    return resolve(path)
  }
}

/**
 * Why a directory may not be browsed, or `null` when it may.
 *
 * The check is on the canonical path, and covers descendants as well as the roots
 * themselves: `/etc/ssl` is refused for the same reason `/etc` is. A sibling that
 * merely starts with the same characters (`/etcetera`) is not a descendant, so the
 * comparison is made on path segments rather than on a bare prefix.
 * @param path - the directory to check.
 * @returns the reason it is refused, or `null`.
 */
export function forbiddenReason(path: string): string | null {
  const real = realPathOf(path)
  if (real === sep || real.length === 0) return '不允许浏览根目录'
  for (const forbidden of FORBIDDEN_ROOTS) {
    if (real === forbidden || real.startsWith(`${forbidden}${sep}`)) {
      return `${forbidden} 下面不允许浏览`
    }
  }
  return null
}

/**
 * Whether `target` is `root` itself or sits under it, by real path.
 *
 * The prefix comparison carries the separator on purpose: without it `/data/lib2`
 * would read as being inside `/data/lib`. This is the check the browser's input
 * passes through before any read happens.
 * @param root - the directory that must contain the target.
 * @param target - the path to test.
 * @returns true when the target is the root or inside it.
 */
export function isInside(root: string, target: string): boolean {
  const base = realPathOf(root)
  const other = realPathOf(target)
  if (other === base) return true
  return other.startsWith(base.endsWith(sep) ? base : `${base}${sep}`)
}

/**
 * Validate and normalise a relative path.
 *
 * The rules are deliberately narrow, because this string is the only piece of a
 * browse request that comes from the browser: no NUL, no backslash (a Windows
 * separator that some shells normalise late), not absolute, and no `..` segment
 * anywhere. Empty segments and `.` are dropped, so `a//b` and `a/./b` both read
 * as `a/b` and the answer can be sent back verbatim.
 * @param rel - the raw relative path.
 * @returns the normalised path, or `null` when it is not acceptable.
 */
export function normalizeRel(rel: string): string | null {
  if (rel.includes('\0')) return null
  if (rel.includes('\\')) return null
  if (isAbsolute(rel)) return null
  const segments = rel.split('/').filter((segment) => segment.length > 0 && segment !== '.')
  if (segments.some((segment) => segment === '..')) return null
  return segments.join('/')
}

/** The parent of a normalised relative path: `''` at the first level, `null` at the root. */
export function parentOfRel(rel: string): string | null {
  if (rel.length === 0) return null
  const cut = rel.lastIndexOf('/')
  return cut === -1 ? '' : rel.slice(0, cut)
}

/** What a directory probe found. Never throws; unreadable is an answer, not an error. */
export interface Readability {
  readonly readable: boolean
  readonly reason: string | null
}

/**
 * Whether a directory can be listed right now.
 *
 * Synchronous and total: this runs while a payload is being built, and a place that
 * cannot be read is a row with a reason rather than an exception that would take
 * the other places down with it.
 * @param path - the directory to probe.
 * @returns the verdict, with a short reason when it is not readable.
 */
export function probeReadable(path: string): Readability {
  if (path.trim().length === 0) return { readable: false, reason: '还没有设置目录' }
  const forbidden = forbiddenReason(path)
  if (forbidden !== null) return { readable: false, reason: forbidden }
  if (!existsSync(path)) return { readable: false, reason: '这个目录不存在' }
  try {
    if (!statSync(path).isDirectory()) return { readable: false, reason: '这是一个文件，不是目录' }
    readdirSync(path)
    return { readable: true, reason: null }
  } catch {
    return { readable: false, reason: '读不了这个目录' }
  }
}

/** Whether the conventional media folder already exists inside one root. */
function hasConvention(root: string): boolean {
  const path = join(root, LIBRARY_SUBPATH)
  try {
    return existsSync(path) && statSync(path).isDirectory()
  } catch {
    return false
  }
}

/** One `PlaceEntry`, with the readability probe folded in. */
function placeEntry(root: PlaceRoot, id: string, kind: PlaceEntry['kind'], label: string): PlaceEntry {
  const probe = probeReadable(root.path)
  return {
    id,
    kind,
    label,
    path: root.path,
    readable: probe.readable,
    reason: probe.reason,
    // The library place is suggested when it can actually be opened; a workspace is
    // suggested when the conventional media folder is already there, which is the
    // folder the study method puts material in.
    suggested: kind === 'library' ? probe.readable : hasConvention(root.path),
    conventionRel: kind === 'library' ? null : LIBRARY_SUBPATH,
  }
}

/**
 * Every place the picker may browse: each workspace, then the library root.
 *
 * Workspaces come first because they are what the picker is *for* — the material
 * being added lives in a workspace, and the library is where it is being collected.
 * The library place is always present, even when its root is unset or unreadable,
 * so the row can say that in as many words instead of the picker quietly having
 * fewer rows than expected.
 * @param workspaces - the workspaces the host knows, in registry order.
 * @param libraryRoot - the library root currently in effect; may be empty.
 * @returns the places, and whether anything among them can be opened at all.
 */
export function listPlaces(workspaces: readonly PlaceRoot[], libraryRoot: string): readonly PlaceEntry[] {
  const places: PlaceEntry[] = []
  for (const workspace of workspaces) {
    const path = workspace.path
    if (path.trim().length === 0) continue
    const id = placeIdFor(path)
    if (places.some((place) => place.id === id)) continue
    places.push(placeEntry({ path }, id, 'workspace', workspace.title?.trim() || basename(path)))
  }
  places.push(
    placeEntry({ path: libraryRoot.trim() }, LIBRARY_PLACE_ID, 'library', LIBRARY_PLACE_LABEL),
  )
  return places
}

/** Find one place by id, or `null` when nothing claims it. */
export function findPlace(places: readonly PlaceEntry[], id: string): PlaceEntry | null {
  return places.find((place) => place.id === id) ?? null
}

/**
 * The payload `GET /lingualab/places` answers with.
 * @param workspaces - the workspaces the host knows.
 * @param libraryRoot - the library root currently in effect.
 * @param current - what is open now, so the picker can mark that row.
 * @returns the payload; `ok` is true when at least one place can be opened.
 */
export function placesPayload(
  workspaces: readonly PlaceRoot[],
  libraryRoot: string,
  current: OpenRef | null,
): PlacesPayload {
  const places = listPlaces(workspaces, libraryRoot)
  return { ok: places.some((place) => place.readable), places, current }
}

/** A relative path that resolved to a real directory or file. */
export interface RelResolved {
  readonly ok: true
  /** Canonical absolute path, which is what ids are hashed from. */
  readonly abs: string
  readonly rel: string
}

/** A relative path that did not resolve, with the reason to show. */
export interface RelRefused {
  readonly ok: false
  readonly reason: string
}

/**
 * Resolve `place` + `rel` into an absolute path, refusing anything that leaves the
 * place.
 *
 * Order matters: the place is checked before the join, the relative path is
 * normalised before anything touches the filesystem, and the canonical result is
 * compared with the canonical root last. A symlink that points outside is caught by
 * that final comparison — it is the only check that can see it.
 * @param place - the place to resolve inside.
 * @param rel - the raw relative path from the request.
 * @returns the canonical path, or the reason it was refused.
 */
export function resolveInPlace(place: PlaceEntry, rel: string): RelResolved | RelRefused {
  const forbidden = forbiddenReason(place.path)
  if (forbidden !== null) return { ok: false, reason: forbidden }

  const normalized = normalizeRel(rel)
  if (normalized === null) return { ok: false, reason: '相对路径不合法' }

  const abs = join(place.path, normalized)
  if (!existsSync(abs)) return { ok: false, reason: '这个路径不存在' }
  if (!isInside(place.path, abs)) return { ok: false, reason: '这个路径跑到允许的目录外面了' }
  return { ok: true, abs: realPathOf(abs), rel: normalized }
}
