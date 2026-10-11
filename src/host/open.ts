/**
 * Turning "the reader picked this" into an episode the page can play.
 *
 * Two shapes arrive here and they end in the same place. A **folder episode** is
 * named by an id the scan already knows; a **file episode** is named by a place and
 * a path, and from that moment on by the id derived from the audio file's canonical
 * path — because the page stores one id, and every later request has to be able to
 * turn it back into bytes.
 *
 * The subtitles are paired when the episode is described rather than stored once and
 * trusted: the reader adds a translation the day after picking the audio, and the
 * answer to "what subtitles does this have" should change with the directory, not
 * with the memory of the last time it was opened. What *is* stored is the mapping
 * from id to path, plus the file names as they were at open time — enough for the
 * media route to answer a range request without re-reading a directory per seek.
 *
 * A folder episode may be made of segments (one scene per audio file). The request names
 * the one to open, and the answer says which it opened; the host does not guess which to
 * continue, because the reader's position is the page's knowledge, so an omitted segment
 * is simply the first.
 *
 * Nothing here throws at the caller. A missing file, a directory with no audio and a
 * place that no longer exists are all answers, because the picker is a browsing UI
 * and every one of those is a state the reader can browse their way out of.
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import {
  AUDIO_EXTENSIONS,
  FILE_MEDIA_PATH,
  MEDIA_PATH,
  type EpisodeEntry,
  type EpisodeMedia,
  type EpisodeSegment,
  type OpenPayload,
  type OpenRef,
  type OpenRequest,
  type PlaceEntry,
} from '../shared/protocol.ts'
import { audioEntry, describeAudioFile, scanLibrary } from './library.ts'
import { contentTypeOf } from './media.ts'
import { pickAudioFile, sameStem, stemOf } from './pairing.ts'
import { findPlace, isInside, realPathOf, resolveInPlace } from './places.ts'
import {
  findFileEpisode,
  isFileEpisodeId,
  type FileEpisodeRecord,
  type OpenState,
  withCurrent,
  withOpenedFile,
} from './state.ts'

/** Everything an open needs from the request's surroundings. */
export interface OpenDeps {
  readonly libraryRoot: string
  readonly places: readonly PlaceEntry[]
  readonly state: OpenState
}

/** The payload, plus the state the open produced. */
export interface OpenResult {
  readonly payload: OpenPayload
  readonly state: OpenState
}

/** One refusal: no episode, no media, and the reason to show instead. */
function refuse(state: OpenState, reason: string): OpenResult {
  return { payload: { ok: false, reason, episode: null, media: null, segment: null, warnings: [] }, state }
}

/** Whether a file name is audio this plugin plays. */
function isAudioFile(name: string): boolean {
  return (AUDIO_EXTENSIONS as readonly string[]).includes(name.slice(name.lastIndexOf('.') + 1).toLowerCase())
}

/** The URL one file of a folder episode is served from. */
function folderUrl(episode: string, file: string): string {
  return `${MEDIA_PATH}/${encodeURIComponent(episode)}/${encodeURIComponent(file)}`
}

/** The URL one file of a file episode is served from. */
function fileUrl(id: string, file: string): string {
  return `${FILE_MEDIA_PATH}/${encodeURIComponent(id)}/${encodeURIComponent(file)}`
}

/** The files one playable thing is made of: a whole folder episode, or one of its segments. */
interface Track {
  readonly audio: string | null
  readonly subtitleEn: string | null
  readonly subtitleZh: string | null
}

/** The media URLs of a folder episode or one of its segments, from the names the scan found. */
function folderMedia(episode: string, track: Track): EpisodeMedia {
  return {
    audioUrl: track.audio === null ? '' : folderUrl(episode, track.audio),
    subtitleEnUrl: track.subtitleEn === null ? null : folderUrl(episode, track.subtitleEn),
    subtitleZhUrl: track.subtitleZh === null ? null : folderUrl(episode, track.subtitleZh),
  }
}

/** What one audio file adds up to, before anything is remembered. */
interface Described {
  readonly entry: EpisodeEntry
  readonly media: EpisodeMedia
  readonly record: FileEpisodeRecord
}

/**
 * Describe one audio file and prepare the record that will outlive the request.
 * @param options - the canonical audio path, and where it was picked from.
 * @returns the entry, its media URLs and its record, or the reason it cannot be one.
 */
function describePicked(options: {
  readonly path: string
  readonly place: string
  readonly rel: string
  readonly openedAt: number
  readonly state: OpenState
}): Described | { readonly reason: string } {
  const description = describeAudioFile(options.path)
  if (description === null) return { reason: '读不了这个目录' }
  return {
    entry: audioEntry(description, options.state),
    media: {
      audioUrl: fileUrl(description.id, description.audio),
      subtitleEnUrl: description.subtitleEn === null ? null : fileUrl(description.id, description.subtitleEn),
      subtitleZhUrl: description.subtitleZh === null ? null : fileUrl(description.id, description.subtitleZh),
    },
    record: {
      id: description.id,
      path: description.path,
      title: description.title,
      place: options.place,
      rel: options.rel,
      audio: description.audio,
      subtitleEn: description.subtitleEn,
      subtitleZh: description.subtitleZh,
      openedAt: options.openedAt,
    },
  }
}

/** The warnings an opened episode carries: things true but not fatal. */
function warningsOf(track: Track): string[] {
  return track.subtitleEn === null && track.subtitleZh === null ? ['no-subtitle'] : []
}

/**
 * The success payload for one episode.
 * @param segment - the segment that was opened, when the episode has segments.
 */
function accept(
  entry: EpisodeEntry,
  media: EpisodeMedia,
  state: OpenState,
  segment: EpisodeSegment | null = null,
): OpenResult {
  return {
    payload: {
      ok: true,
      reason: null,
      episode: entry,
      media,
      segment: segment === null ? null : segment.id,
      warnings: warningsOf(segment ?? entry),
    },
    state,
  }
}

/**
 * Where a remembered file episode lives now.
 *
 * The record can be gone while the audio is still there — a fresh profile, a state
 * field somebody cleared, a note written by hand — so before giving up, an id that
 * matches a loose file in the library root is answered from the listing. That is
 * also how a `files` row in the panel opens: the panel only ever has the id.
 */
function locateFileEpisode(
  id: string,
  deps: OpenDeps,
): { readonly path: string; readonly place: string; readonly rel: string } | null {
  const record = findFileEpisode(deps.state, id)
  if (record !== null) return { path: record.path, place: record.place, rel: record.rel }

  const listing = scanLibrary(deps.libraryRoot, deps.state)
  const loose = listing.files.find((candidate) => candidate.id === id)
  if (loose === undefined) return null
  return { path: realPathOf(loose.source), place: 'lib', rel: loose.audio ?? basename(loose.source) }
}

/**
 * Open a folder episode the scan knows, and one of its segments when it has any.
 *
 * Naming a segment that is not there is a refusal with the reason, not a quiet fallback to
 * the first one: the page asked for a particular scene, and playing another under its name
 * would put the reader's position and notes against the wrong audio.
 */
function openFolder(id: string, segment: string | undefined, deps: OpenDeps): OpenResult {
  const listing = scanLibrary(deps.libraryRoot, deps.state)
  if (!listing.ok) return refuse(deps.state, listing.reason ?? '媒体目录读不了')
  const entry = listing.episodes.find((candidate) => candidate.id === id)
  if (entry === undefined) return refuse(deps.state, '找不到这一集')
  if (entry.audio === null) return refuse(deps.state, '这一集没有音频文件')

  let chosen: EpisodeSegment | null = null
  if (entry.segments.length > 0) {
    chosen = segment === undefined ? (entry.segments[0] ?? null) : (entry.segments.find((item) => item.id === segment) ?? null)
    if (chosen === null) return refuse(deps.state, `这一集没有叫「${segment ?? ''}」的一段`)
  } else if (segment !== undefined) {
    return refuse(deps.state, '这一集没有分段')
  }

  const ref: OpenRef = { id: entry.id, title: entry.title, kind: 'folder', source: entry.source }
  return accept(entry, folderMedia(entry.id, chosen ?? entry), withCurrent(deps.state, ref), chosen)
}

/** Open a file episode by its id, whether or not this plugin still has a record. */
function openRememberedFile(id: string, deps: OpenDeps): OpenResult {
  const located = locateFileEpisode(id, deps)
  if (located === null) return refuse(deps.state, '找不到这一集')
  if (!existsSync(located.path)) return refuse(deps.state, '这一集的音频文件已经不在了')
  const described = describePicked({ ...located, openedAt: Date.now(), state: deps.state })
  if ('reason' in described) return refuse(deps.state, described.reason)
  return accept(described.entry, described.media, withOpenedFile(deps.state, described.record))
}

/** Open one audio file named by a place and a relative path. */
function openPicked(request: OpenRequest, deps: OpenDeps): OpenResult {
  const place = findPlace(deps.places, request.place ?? '')
  if (place === null) return refuse(deps.state, '找不到这个位置')
  const resolved = resolveInPlace(place, request.rel ?? '')
  if (!resolved.ok) return refuse(deps.state, resolved.reason)

  let path = resolved.abs
  let rel = resolved.rel
  try {
    if (statSync(path).isDirectory()) {
      const names = readdirSync(path).filter((name) => !name.startsWith('.'))
      const audio = pickAudioFile(names)
      if (audio === null) return refuse(deps.state, '没有音频的文件夹')
      path = realPathOf(join(path, audio))
      rel = rel.length === 0 ? audio : `${rel}/${audio}`
    } else if (!isAudioFile(path)) {
      return refuse(deps.state, '这不是音频文件')
    }
  } catch {
    return refuse(deps.state, '找不到这个文件')
  }
  if (!existsSync(path)) return refuse(deps.state, '找不到这个文件')

  const described = describePicked({ path, place: place.id, rel, openedAt: Date.now(), state: deps.state })
  if ('reason' in described) return refuse(deps.state, described.reason)
  return accept(described.entry, described.media, withOpenedFile(deps.state, described.record))
}

/**
 * Resolve `/file-media/<id>/<name>` into a file this episode may serve.
 *
 * The name is checked against the record first — the audio and the two subtitle
 * files it was opened with — and then against the directory, for the case the
 * record cannot know about: a translation added after the episode was opened. What
 * is never allowed is a name that is not the audio's own stem, which is what keeps
 * this route from serving the rest of the reader's disk through an id they happen
 * to hold.
 * @param state - the plugin state, which owns the id-to-path mapping.
 * @param requestPath - the path after `/lingualab/file-media`.
 * @returns the absolute path to send, or `null` to refuse.
 */
export function resolveFileMedia(state: OpenState, requestPath: string): string | null {
  let decoded: string
  try {
    decoded = decodeURIComponent(requestPath)
  } catch {
    return null
  }
  if (decoded.includes('\0')) return null

  const segments = decoded.split('/').filter((segment) => segment.length > 0 && segment !== '.')
  if (segments.length !== 2) return null
  const [id, name] = segments
  if (id === undefined || name === undefined || id === '..' || name === '..') return null
  if (name.includes('/') || name.includes('\\')) return null

  const record = findFileEpisode(state, id)
  if (record === null) return null
  const directory = dirname(record.path)
  if (record.audio === name || record.subtitleEn === name || record.subtitleZh === name) {
    return join(directory, name)
  }

  if (!sameStem(name, stemOf(record.audio))) return null
  if (contentTypeOf(name) === null) return null
  const candidate = join(directory, name)
  try {
    if (!statSync(candidate).isFile()) return null
  } catch {
    return null
  }
  return isInside(directory, candidate) ? candidate : null
}

/**
 * Open the episode one request names.
 *
 * The request carries either an episode id or a place and a relative path, never
 * both; the caller has already checked that, and this function treats a missing
 * target as a refusal rather than a mistake.
 * @param request - the parsed request body.
 * @param deps - the library root, the browsable places, and the remembered state.
 * @returns the payload, and the state after the open.
 */
export function openEpisode(request: OpenRequest, deps: OpenDeps): OpenResult {
  const id = request.episodeId
  const segment = typeof request.segment === 'string' && request.segment.length > 0 ? request.segment : undefined
  if (typeof id === 'string' && id.length > 0) {
    if (!isFileEpisodeId(id)) return openFolder(id, segment, deps)
    if (segment !== undefined) return refuse(deps.state, '一个音频文件没有分段')
    return openRememberedFile(id, deps)
  }
  if (typeof request.place === 'string' && typeof request.rel === 'string') {
    if (segment !== undefined) return refuse(deps.state, 'segment 只能和 episodeId 一起给')
    return openPicked(request, deps)
  }
  return refuse(deps.state, 'episodeId 和 place/rel 必须给一个')
}
