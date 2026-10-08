/**
 * The library scan.
 *
 * One episode is one folder under the library root, holding an audio file, up to
 * two subtitle files and an optional `notes.md`. Nothing else is required and
 * nothing is generated here: the scan is read-only, because the material is
 * copied in by hand, one episode at a time, and a plugin that rewrites a user's
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
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import {
  AUDIO_EXTENSIONS,
  NOTES_FILE,
  SUBTITLE_EXTENSIONS,
  type EpisodeEntry,
  type LibraryPayload,
} from '../shared/protocol.ts'
import { summarizeNotes } from '../shared/notes-format.ts'

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

/** Extensions this module recognises as subtitles. */
const SUBTITLE_SET = new Set<string>(SUBTITLE_EXTENSIONS)

/** Whether a file name reads as Chinese rather than English. */
function looksChinese(fileName: string): boolean {
  return /(^|[^a-z])(zh|chs|cht|cn|chi|中文|双语)([^a-z]|$)/i.test(fileName)
}

/** Whether the first bytes of a file carry CJK text, used only to break ties. */
function fileHasCjk(path: string): boolean {
  try {
    const head = readFileSync(path, 'utf8').slice(0, 4096)
    return /[\u4e00-\u9fff]/.test(head)
  } catch {
    return false
  }
}

/** Pick the audio file: the first extension in preference order wins. */
function pickAudio(names: readonly string[]): string | null {
  for (const extension of AUDIO_EXTENSIONS) {
    const hit = names.find((name) => extname(name).slice(1).toLowerCase() === extension)
    if (hit !== undefined) return hit
  }
  return null
}

/**
 * Decide which subtitle file is English and which is Chinese.
 *
 * The names decide when they say so. When they do not, one file is treated as
 * English and, if a second exists, as Chinese; a single file that itself carries
 * CJK text is offered as both, because a bilingual subtitle is one file with two
 * languages in it, and the panel splits it line by line.
 */
function pickSubtitles(
  folder: string,
  names: readonly string[],
): { en: string | null; zh: string | null } {
  const files = names.filter((name) => SUBTITLE_SET.has(extname(name).slice(1).toLowerCase()))
  if (files.length === 0) return { en: null, zh: null }

  const chinese = files.filter((name) => looksChinese(name))
  const rest = files.filter((name) => !looksChinese(name))

  if (rest.length > 0) {
    const en = rest[0] ?? null
    const zh = chinese[0] ?? rest[1] ?? null
    return { en, zh }
  }

  // Every file reads as Chinese by name, so the library keeps the first as the
  // primary subtitle and does not pretend an English track exists.
  const first = chinese[0] ?? files[0] ?? null
  const bilingual = first !== null && fileHasCjk(join(folder, first))
  return { en: first, zh: bilingual ? first : (chinese[1] ?? null) }
}

/** Scan one episode folder. A folder with no audio is listed but not playable. */
function scanEpisode(root: string, id: string, title: string): EpisodeEntry {
  const folder = join(root, id)
  const names = readdirSync(folder).filter((name) => !name.startsWith('.'))
  const audio = pickAudio(names)
  const { en, zh } = pickSubtitles(folder, names)

  let audioBytes: number | null = null
  if (audio !== null) {
    try {
      audioBytes = statSync(join(folder, audio)).size
    } catch {
      audioBytes = null
    }
  }

  const notesPath = join(folder, NOTES_FILE)
  const notes = existsSync(notesPath)
    ? summarizeNotes(readFileSync(notesPath, 'utf8'))
    : summarizeNotes(null)

  return { id, title, audio, audioBytes, subtitleEn: en, subtitleZh: zh, notes }
}

/** The episode the panel opens: the manifest's choice, else the first unstudied one. */
function pickCurrent(episodes: readonly EpisodeEntry[], manifest: Manifest): string | null {
  if (manifest.current !== undefined && episodes.some((entry) => entry.id === manifest.current)) {
    return manifest.current
  }
  const unstudied = episodes.find((entry) => entry.notes.count === 0)
  return unstudied?.id ?? episodes[episodes.length - 1]?.id ?? null
}

/** Read the root and describe every episode in it. Never throws. */
export function scanLibrary(root: string): LibraryPayload {
  if (root.trim().length === 0) {
    return { ok: false, root, reason: '媒体目录还没配置', current: null, episodes: [] }
  }
  if (!existsSync(root)) {
    return { ok: false, root, reason: '媒体目录不存在', current: null, episodes: [] }
  }

  let folderNames: string[]
  try {
    folderNames = readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => entry.name)
  } catch (error) {
    return { ok: false, root, reason: `读不了媒体目录：${String(error)}`, current: null, episodes: [] }
  }

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
  return { ok: true, root, reason: null, current: pickCurrent(episodes, manifest), episodes }
}
