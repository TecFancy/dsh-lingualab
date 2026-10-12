/**
 * The library scan.
 *
 * One episode is one folder under the library root, holding an audio file, up to
 * two subtitle files and an optional `notes.md`. A folder that holds two or more audio
 * files is still one episode, made of segments: one scene per audio file, each with the
 * subtitles that carry its name. Nothing else is required and
 * nothing is generated here: the scan is read-only. Material arrives by hand or through
 * the import route (src/host/import.ts, which never replaces a file), and a plugin that rewrites a user's
 * media folder is a plugin you stop trusting.
 *
 * An optional `manifest.json` at the root may set the play order and rename
 * episodes:
 *
 * ```json
 * { "episodes": ["S01E02", "S01E01"], "titles": { "S01E02": "The Bicycle Thief" }, "current": "S01E02" }
 * ```
 *
 * Without it, folders sort naturally by name and the first episode that has no
 * notes yet is the one offered first — which is the "learn the next thing"
 * default the study method asks for.
 *
 * Audio files lying loose in the root are the other half of the listing. They are
 * **not** episodes: `manifest.json` orders and renames episodes, and a loose file
 * has no folder to be named by, so it is reported separately as `files` with an id
 * derived from its path. The picker shows both lists; the panel can play either.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import {
  AUDIO_EXTENSIONS,
  NOTES_FILE,
  type EpisodeEntry,
  type EpisodeSegment,
  type LibraryPayload,
  type OpenRef,
} from '../shared/protocol.ts'
import { summarizeNotes } from '../shared/notes-format.ts'
import { splitSegmentStem } from '../shared/stem.ts'
import { mediaStemsOf, pairSubtitles, pickAudioFile, pickVideoFile, stemOf } from './pairing.ts'
import { realPathOf } from './places.ts'
import { videoRefOf } from './video-cache.ts'
import {
  EMPTY_STATE,
  fileEpisodeIdFor,
  findFileEpisode,
  notesFor,
  summarizePhrases,
  type OpenState,
} from './state.ts'

/** Optional root file that overrides order, titles and the opening episode. */
const MANIFEST_FILE = 'manifest.json'

interface Manifest {
  readonly episodes?: readonly string[]
  readonly titles?: Readonly<Record<string, string>>
  readonly current?: string
}

/** Natural order: `S01E2` sorts before `S01E10`, which a plain string sort gets wrong. */
export function compareIds(left: string, right: string): number {
  const split = (value: string): Array<string | number> =>
    value
      .split(/(\d+)/)
      .filter((part) => part.length > 0)
      .map((part) => (/^\d+$/.test(part) ? Number(part) : part.toLowerCase()))
  const a = split(left)
  const b = split(right)
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const one = a[index]
    const two = b[index]
    if (one === undefined) return -1
    if (two === undefined) return 1
    if (one === two) continue
    if (typeof one === 'number' && typeof two === 'number') return one - two
    return String(one).localeCompare(String(two))
  }
  return 0
}

/** Read `manifest.json`, tolerating absence and malformed content alike. */
function readManifest(root: string): Manifest {
  const path = join(root, MANIFEST_FILE)
  if (!existsSync(path)) return {}
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'))
    return typeof parsed === 'object' && parsed !== null ? (parsed as Manifest) : {}
  } catch {
    // A broken manifest must not take the library down with it: the scan falls
    // back to folder order, which is always available.
    return {}
  }
}

/**
 * The title a folder episode is shown under.
 *
 * Exported because the picker offers to open a folder episode from its directory
 * listing, and the row there should carry the same name the library shows.
 * @param root - the library root.
 * @param id - the folder name.
 * @returns the manifest title when there is one, the folder name otherwise.
 */
export function episodeTitle(root: string, id: string): string {
  return readManifest(root).titles?.[id] ?? id
}

/** The size of one file, or `null` when it cannot be measured. */
function sizeOf(path: string): number | null {
  try {
    return statSync(path).size
  } catch {
    // Left null: an episode whose audio cannot be measured is still an episode.
    return null
  }
}

/**
 * The segments of one episode folder: one per stem, in natural order.
 *
 * A stem is an audio file's, or a video's when no audio file owns that video (see
 * {@link mediaStemsOf}); a video beside an audio file of the same stem is that segment's video, not
 * a segment of its own. A folder with a single stem has no segments, and is one episode of one
 * file as it always was; `lesson.mp3` next to `lesson.wav` is one stem, and the extension
 * preference of {@link pickAudioFile} picks between them. Each segment pairs its own subtitles by name,
 * and the longest stem owns a subtitle (see `classifySubtitles`), so the scan, the
 * picker and the open all agree about which file belongs to which scene.
 *
 * Exported because the notes writer needs the same order for the headings of `notes.md`.
 * @param folder - the absolute path of the episode folder.
 * @param names - the visible file names in it.
 * @returns the segments, or an empty list unless there are two or more.
 */
export function scanSegments(folder: string, names: readonly string[]): EpisodeSegment[] {
  const stems = mediaStemsOf(names).sort(compareIds)
  if (stems.length < 2) return []
  const segments: EpisodeSegment[] = []
  for (const stem of stems) {
    const audio = pickAudioFile(names.filter((name) => stemOf(name) === stem))
    const videoFile = pickVideoFile(names, stem)
    if (audio === null && videoFile === null) continue
    const { en, zh } = pairSubtitles(names, { directory: folder, stem })
    segments.push({
      id: stem,
      index: segments.length + 1,
      title: splitSegmentStem(stem).title,
      audio,
      audioBytes: audio === null ? null : sizeOf(join(folder, audio)),
      subtitleEn: en,
      subtitleZh: zh,
      video: videoFile === null ? null : videoRefOf(folder, videoFile, stem),
    })
  }
  return segments
}

/** Scan one episode folder. A folder with neither audio nor video is listed but not playable. */
export function scanEpisode(root: string, id: string, title: string): EpisodeEntry {
  const folder = join(root, id)
  const names = readdirSync(folder).filter((name) => !name.startsWith('.'))
  const segments = scanSegments(folder, names)
  // The entry's own fields mirror the first segment, so a reader that knows nothing about
  // segments still sees an episode it can play; without segments they come from the folder.
  const first = segments[0]
  const audio = first === undefined ? pickAudioFile(names) : first.audio
  const { en, zh } =
    first === undefined
      ? pairSubtitles(names, { directory: folder })
      : { en: first.subtitleEn, zh: first.subtitleZh }
  const audioBytes = first === undefined ? (audio === null ? null : sizeOf(join(folder, audio))) : first.audioBytes
  // A folder of one stem has its video under that stem, which is the audio file's when there is one.
  const stem = audio === null ? (mediaStemsOf(names)[0] ?? null) : stemOf(audio)
  const videoFile = first !== undefined || stem === null ? null : pickVideoFile(names, stem)
  const video = first === undefined ? (videoFile === null || stem === null ? null : videoRefOf(folder, videoFile, stem)) : first.video

  const notesPath = join(folder, NOTES_FILE)
  const notes = existsSync(notesPath)
    ? summarizeNotes(readFileSync(notesPath, 'utf8'))
    : summarizeNotes(null)

  return { id, title, audio, audioBytes, subtitleEn: en, subtitleZh: zh, video, segments, notes, kind: 'folder', source: folder }
}

/** Everything one audio file turned out to be, before it is dressed as an episode. */
export interface AudioDescription {
  /** Episode id: `file.` plus a hash of the canonical path. */
  readonly id: string
  /** Canonical absolute path of the audio file. */
  readonly path: string
  readonly audio: string
  /** Display title: the file name without its extension. */
  readonly title: string
  readonly bytes: number | null
  readonly subtitleEn: string | null
  readonly subtitleZh: string | null
}

/**
 * Describe one audio file by looking at the directory it is in.
 *
 * One home for "what is beside this file", used both by the library listing for the
 * loose files in the root and by the picker when it opens one. The subtitles are
 * paired by name and content, never cached, so adding a translation and reopening
 * the episode is enough to see it.
 * @param path - absolute path of the audio file.
 * @returns the description, or `null` when the directory cannot be read.
 */
export function describeAudioFile(path: string): AudioDescription | null {
  let names: string[]
  try {
    names = readdirSync(dirname(path)).filter((name) => !name.startsWith('.'))
  } catch {
    return null
  }
  const audio = basename(path)
  let bytes: number
  try {
    const stats = statSync(path)
    // A directory named like audio is not an episode; nor is a broken symlink.
    if (!stats.isFile()) return null
    bytes = stats.size
  } catch {
    return null
  }
  const pair = pairSubtitles(names, { directory: dirname(path), stem: stemOf(audio) })
  return {
    id: fileEpisodeIdFor(path),
    path,
    audio,
    title: stemOf(audio),
    bytes,
    subtitleEn: pair.en,
    subtitleZh: pair.zh,
  }
}

/** Dress one described audio file as an episode, with the notes held for it. */
export function audioEntry(description: AudioDescription, state: OpenState): EpisodeEntry {
  return {
    id: description.id,
    title: description.title,
    audio: description.audio,
    audioBytes: description.bytes,
    subtitleEn: description.subtitleEn,
    subtitleZh: description.subtitleZh,
    video: null,
    segments: [],
    notes: summarizePhrases(notesFor(state, description.id)),
    kind: 'file',
    source: description.path,
  }
}

/** The loose audio files directly in the library root, in name order. */
function scanLooseFiles(root: string, names: readonly string[], state: OpenState): EpisodeEntry[] {
  const files: EpisodeEntry[] = []
  for (const name of names.filter(isAudioName).sort(compareIds)) {
    const description = describeAudioFile(realPathOf(join(root, name)))
    if (description === null) continue
    files.push(audioEntry(description, state))
  }
  return files
}

/** Whether a file name is audio the scan accepts. */
function isAudioName(name: string): boolean {
  return (AUDIO_EXTENSIONS as readonly string[]).includes(extname(name).slice(1).toLowerCase())
}

/** The episode the panel opens: the manifest's choice, else the first unstudied one. */
function pickCurrent(episodes: readonly EpisodeEntry[], manifest: Manifest): string | null {
  if (manifest.current !== undefined && episodes.some((entry) => entry.id === manifest.current)) {
    return manifest.current
  }
  const unstudied = episodes.find((entry) => entry.notes.count === 0)
  return unstudied?.id ?? episodes[episodes.length - 1]?.id ?? null
}

/** What the reader had open, resolved against what is on disk now. */
function describeCurrent(
  state: OpenState,
  episodes: readonly EpisodeEntry[],
  files: readonly EpisodeEntry[],
): { readonly currentEpisode: EpisodeEntry | null; readonly currentUnavailable: OpenRef | null } {
  const remembered = state.current
  if (remembered === null) return { currentEpisode: null, currentUnavailable: null }

  if (remembered.kind === 'folder') {
    const entry = episodes.find((candidate) => candidate.id === remembered.id) ?? null
    return entry === null
      ? { currentEpisode: null, currentUnavailable: remembered }
      : { currentEpisode: entry, currentUnavailable: null }
  }

  // A file episode may be one of the loose files in the root, or a file picked
  // somewhere else entirely; the listing knows the first and the index the second.
  const loose = files.find((candidate) => candidate.id === remembered.id)
  if (loose !== undefined) return { currentEpisode: loose, currentUnavailable: null }

  const record = findFileEpisode(state, remembered.id)
  if (record === null || !existsSync(record.path)) {
    return { currentEpisode: null, currentUnavailable: remembered }
  }
  const description = describeAudioFile(record.path)
  if (description === null) return { currentEpisode: null, currentUnavailable: remembered }
  return { currentEpisode: audioEntry(description, state), currentUnavailable: null }
}

/** Read the root and describe every episode in it. Never throws. */
export function scanLibrary(root: string, state: OpenState = EMPTY_STATE): LibraryPayload {
  const bare = (ok: boolean, reason: string | null): LibraryPayload => {
    const resolved = describeCurrent(state, [], [])
    return {
      ok,
      root,
      reason,
      current: null,
      episodes: [],
      files: [],
      currentEpisode: resolved.currentEpisode,
      currentUnavailable: resolved.currentUnavailable,
    }
  }

  if (root.trim().length === 0) return bare(false, '媒体目录还没配置')
  if (!existsSync(root)) return bare(false, '媒体目录不存在')

  let entries
  try {
    entries = readdirSync(root, { withFileTypes: true })
  } catch (error) {
    return bare(false, `读不了媒体目录：${String(error)}`)
  }

  const folderNames = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
  const looseNames = entries
    // Symlinks are included and then resolved by `describeAudioFile`: linking an
    // episode in from elsewhere is how material usually arrives, and a link that
    // points nowhere is dropped by the same stat that measures it.
    .filter((entry) => (entry.isFile() || entry.isSymbolicLink()) && !entry.name.startsWith('.') && isAudioName(entry.name))
    .map((entry) => entry.name)

  const manifest = readManifest(root)
  const ordered = manifest.episodes !== undefined && manifest.episodes.length > 0
    ? [...manifest.episodes.filter((id) => folderNames.includes(id)), ...[...folderNames].filter((id) => !manifest.episodes?.includes(id)).sort(compareIds)]
    : [...folderNames].sort(compareIds)

  // A folder that cannot be read is skipped rather than fatal: the library is
  // edited by hand, and one broken episode must not hide the other hundred.
  const episodes: EpisodeEntry[] = []
  for (const id of ordered) {
    try {
      episodes.push(scanEpisode(root, id, manifest.titles?.[id] ?? id))
    } catch {
      continue
    }
  }

  const files = scanLooseFiles(root, looseNames, state)
  const resolved = describeCurrent(state, episodes, files)
  return {
    ok: true,
    root,
    reason: null,
    current: pickCurrent(episodes, manifest),
    episodes,
    files,
    currentEpisode: resolved.currentEpisode,
    currentUnavailable: resolved.currentUnavailable,
  }
}
