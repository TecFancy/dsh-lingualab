/**
 * Listing one directory under one place, for the picker.
 *
 * The picker scrolls, so this has to be cheap: `readdirSync` once, no `stat` per
 * entry, and a page limit that the caller can ask for by name. The one exception is
 * a symbolic link, which has to be resolved — a link inside a workspace may point at
 * `/etc`, and a listing that returned it would be handing the picker a way out of
 * the place it is browsing. Directory entries that are links are therefore resolved
 * (and dropped when they leave the place), while ordinary files are classified by
 * their extension alone.
 *
 * The other deliberate choice is what a row *costs*: audio rows carry a subtitle
 * hint decided by name, and the byte size of the ones that made it onto the page.
 * Nothing here reads a file's content.
 */
import { readdirSync, statSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import {
  AUDIO_EXTENSIONS,
  SUBTITLE_EXTENSIONS,
  type BrowseEntry,
  type BrowsePayload,
  type PlaceEntry,
} from '../../../../shared/protocol.ts'
import { episodeTitle, subtitleHint, stemOf } from '../../../entities/episode/index.ts'
import { resolveInPlace } from '../../../entities/place/index.ts'
import { isInside, parentOfRel, realPathOf } from '../../../shared/fs/index.ts'
import { compareIds } from '../../../shared/lib/compare.ts'

/** How many rows one page holds when the caller does not say. */
export const DEFAULT_LIMIT = 80

/** The ceiling a caller cannot raise, so one request cannot ask for a whole disk. */
export const MAX_LIMIT = 200

/** Where a row's type sits in the listing: directories first, then by kind. */
const TYPE_RANK: Readonly<Record<BrowseEntry['type'], number>> = {
  dir: 0,
  audio: 1,
  subtitle: 2,
  other: 3,
}

/** What the picker asked for. */
export interface BrowseRequest {
  /** The place to list inside, already resolved by the caller. */
  readonly place: PlaceEntry
  /** The library root in effect, used only to recognise a folder episode. */
  readonly libraryRoot: string
  /** Relative path of the directory to list; empty at the place root. */
  readonly rel: string
  /** Case-insensitive substring filter on the file names of this directory. */
  readonly query?: string
  readonly limit?: number
  /** Whether rows that are neither audio, subtitle nor directory are returned. */
  readonly includeOther?: boolean
}

/** An empty payload with a reason, for the refusals. */
export function refusedBrowse(place: PlaceEntry | null, rel: string, reason: string): BrowsePayload {
  return {
    ok: false,
    reason,
    place:
      place === null
        ? null
        : { id: place.id, kind: place.kind, label: place.label, path: place.path },
    rel,
    parentRel: parentOfRel(rel),
    entries: [],
    summary: { dirs: 0, audio: 0, subtitles: 0, other: 0 },
    page: { limit: 0, returned: 0, truncated: false },
    folderEpisode: null,
  }
}

/** One row before the page is cut. */
interface Candidate {
  readonly name: string
  readonly rel: string
  readonly type: BrowseEntry['type']
  readonly ext: string
}

/** Classify one directory entry by its extension, without touching it. */
function typeOf(name: string): BrowseEntry['type'] {
  const ext = extname(name).slice(1).toLowerCase()
  if ((AUDIO_EXTENSIONS as readonly string[]).includes(ext)) return 'audio'
  if ((SUBTITLE_EXTENSIONS as readonly string[]).includes(ext)) return 'subtitle'
  return 'other'
}

/** Clamp the requested page size to something one listing can answer. */
function clampLimit(requested: number | undefined): number {
  if (requested === undefined || !Number.isFinite(requested) || requested <= 0) return DEFAULT_LIMIT
  return Math.min(Math.floor(requested), MAX_LIMIT)
}

/** Every entry worth showing, before the query and the page limit; `null` when unreadable. */
function candidatesOf(directory: string, rel: string): Candidate[] | null {
  const candidates: Candidate[] = []
  let entries
  try {
    entries = readdirSync(directory, { withFileTypes: true })
  } catch {
    return null
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const childRel = rel.length === 0 ? entry.name : `${rel}/${entry.name}`
    const path = join(directory, entry.name)

    if (entry.isSymbolicLink()) {
      // The only `stat` in a listing, and it is not optional: without it a link out
      // of the place would be returned as an ordinary row.
      if (!isInside(directory, path)) continue
      try {
        if (statSync(path).isDirectory()) {
          candidates.push({ name: entry.name, rel: childRel, type: 'dir', ext: '' })
        } else {
          const type = typeOf(entry.name)
          candidates.push({ name: entry.name, rel: childRel, type, ext: extname(entry.name).slice(1).toLowerCase() })
        }
      } catch {
        continue
      }
      continue
    }

    if (entry.isDirectory()) {
      candidates.push({ name: entry.name, rel: childRel, type: 'dir', ext: '' })
      continue
    }
    const type = typeOf(entry.name)
    candidates.push({ name: entry.name, rel: childRel, type, ext: extname(entry.name).slice(1).toLowerCase() })
  }
  return candidates
}

/**
 * List one directory under one place.
 * @param request - the place, the relative path, and the page options.
 * @returns the payload the picker renders, with a reason instead of throwing.
 */
export function browsePlace(request: BrowseRequest): BrowsePayload {
  const { place, libraryRoot, rel } = request
  if (place.path.trim().length === 0) {
    return refusedBrowse(place, '', '这个位置还没有设置目录')
  }

  const resolved = resolveInPlace(place, rel)
  if (!resolved.ok) return refusedBrowse(place, '', resolved.reason)

  try {
    if (!statSync(resolved.abs).isDirectory()) return refusedBrowse(place, resolved.rel, '这不是一个目录')
  } catch {
    return refusedBrowse(place, resolved.rel, '读不了这个目录')
  }

  const candidates = candidatesOf(resolved.abs, resolved.rel)
  if (candidates === null) return refusedBrowse(place, resolved.rel, '读不了这个目录')
  const summary = {
    dirs: candidates.filter((entry) => entry.type === 'dir').length,
    audio: candidates.filter((entry) => entry.type === 'audio').length,
    subtitles: candidates.filter((entry) => entry.type === 'subtitle').length,
    other: candidates.filter((entry) => entry.type === 'other').length,
  }

  const query = (request.query ?? '').trim().toLowerCase()
  const visible = candidates
    .filter((entry) => query.length === 0 || entry.name.toLowerCase().includes(query))
    .filter((entry) => entry.type !== 'other' || request.includeOther === true)
    .sort((left, right) => TYPE_RANK[left.type] - TYPE_RANK[right.type] || compareIds(left.name, right.name))

  const limit = clampLimit(request.limit)
  const page = visible.slice(0, limit)
  const names = candidates.map((entry) => entry.name)

  const entries: BrowseEntry[] = page.map((entry) => {
    if (entry.type !== 'audio') {
      return { name: entry.name, rel: entry.rel, type: entry.type, ext: entry.ext, subtitle: null, bytes: null }
    }
    let bytes: number | null = null
    try {
      bytes = statSync(join(resolved.abs, entry.name)).size
    } catch {
      // Left null: the row is listed either way, it just cannot show a size.
    }
    return {
      name: entry.name,
      rel: entry.rel,
      type: entry.type,
      ext: entry.ext,
      subtitle: subtitleHint(names, stemOf(entry.name)),
      bytes,
    }
  })

  return {
    ok: true,
    reason: null,
    place: { id: place.id, kind: place.kind, label: place.label, path: place.path },
    rel: resolved.rel,
    parentRel: parentOfRel(resolved.rel),
    entries,
    summary,
    page: { limit, returned: entries.length, truncated: visible.length > entries.length },
    folderEpisode: folderEpisodeOf(resolved.abs, summary.audio, libraryRoot),
  }
}

/**
 * Whether the directory being listed is itself a folder episode.
 *
 * That is exactly the case the picker cannot tell from a name: a folder that is a
 * direct child of the library root and holds audio is an episode the scan already
 * knows, so the row offers to open it as one instead of making the reader walk into
 * it and pick the file by hand.
 */
function folderEpisodeOf(directory: string, audioCount: number, libraryRoot: string): { id: string; title: string } | null {
  if (audioCount === 0) return null
  const root = libraryRoot.trim()
  if (root.length === 0) return null
  const canonicalRoot = realPathOf(root)
  const parent = realPathOf(join(directory, '..'))
  if (parent !== canonicalRoot) return null
  const id = basename(directory)
  if (id.length === 0 || id === '.' || id === '..') return null
  return { id, title: episodeTitle(canonicalRoot, id) }
}
