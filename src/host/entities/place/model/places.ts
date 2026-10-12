/**
 * Where the picker may look.
 *
 * Browsing is by *place id*, never by a path the browser supplies: the page asks for `ws_ab12…`
 * or `lib`, and this module answers with the absolute path it resolved. The roots are an
 * allow-list: workspaces come from the host's registry, and the library root comes from this
 * plugin's config. Nothing else is addressable, and every step down from a root passes the path
 * checks in `shared/fs`.
 *
 * The id is derived from the root's own path, so it survives a restart and a browser reload; a
 * workspace that is re-registered at the same directory keeps the id it had.
 */
import { createHash } from 'node:crypto'
import { existsSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { OpenRef, PlaceEntry, PlacesPayload } from '../../../../shared/protocol.ts'
import { LIBRARY_SUBPATH } from '../../../shared/config/index.ts'
import {
  forbiddenReason,
  isInside,
  normalizeRel,
  probeReadable,
  realPathOf,
} from '../../../shared/fs/index.ts'

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
