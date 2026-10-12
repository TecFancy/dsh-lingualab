/**
 * `GET` and `POST /lingualab/subtitle-choice`: reading and saving the subtitle files one episode
 * (or one of its segments) plays with.
 *
 * The page names an episode and a segment, never a path, and the host works out the folder (or, for a
 * file episode, the directory of its record) itself. A picked file has to be a subtitle file in that
 * folder when it is saved; one that disappears later is the store's business (see `subtitle-choice.ts`).
 *
 * A folder episode's choice is written into the episode folder, which makes this the fourth route that
 * writes into the media folder, after the import, the subtitle timing and the video cache. It writes
 * the narrowest thing it can: one hidden JSON file, never a subtitle. A file episode's choice is kept
 * in its record in the plugin state, so choosing for an audio file outside the library writes nothing
 * next to it.
 */
import { readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { SubtitleChoice, SubtitleChoicePayload, SubtitleChoiceRequest } from '../shared/protocol.ts'
import { scanSegments } from './library.ts'
import { isSafeEpisodeId } from './episode-id.ts'
import { fileHasCjk, pairSubtitles, stemOf } from './pairing.ts'
import { isInside } from './places.ts'
import { findFileEpisode, isFileEpisodeId, type FileEpisodeRecord, type OpenState } from './state.ts'
import {
  AUTO_CHOICE,
  applyChoice,
  choiceFor,
  isAutomatic,
  readFolderChoices,
  sanitizeChoice,
  subtitleFilesOf,
  writeFolderChoice,
} from './subtitle-choice.ts'

/** One answer of the route: the status it is sent with, the payload, and the state after it. */
export interface ChoiceResult {
  readonly status: number
  readonly payload: SubtitleChoicePayload
  readonly state: OpenState
}

/** Everything one episode's choice is read from and written to. */
interface Located {
  readonly directory: string
  /** The visible file names of that directory. */
  readonly names: readonly string[]
  /** What the name rule picks. */
  readonly auto: { readonly en: string | null; readonly zh: string | null }
  readonly choice: SubtitleChoice | undefined
  /** Store a new choice; returns the state after it, and throws when the folder cannot be written. */
  readonly save: (choice: SubtitleChoice) => OpenState
}

/** A refusal: nothing read, nothing written. Exported for the route's own request-level mistakes. */
export function refuse(state: OpenState, status: number, reason: string): ChoiceResult {
  return {
    status,
    state,
    payload: {
      ok: false,
      reason,
      choice: AUTO_CHOICE,
      auto: { en: null, zh: null },
      resolved: { en: null, zh: null },
      missing: [],
      candidates: [],
    },
  }
}

/** The two slots of a pairing, without the rule's own notes, which are not part of the answer. */
function slotsOf(pair: { readonly en: string | null; readonly zh: string | null }): Located['auto'] {
  return { en: pair.en, zh: pair.zh }
}

/** The visible names of one directory, or `null` when it cannot be read. */
function visibleNames(directory: string): string[] | null {
  try {
    return readdirSync(directory).filter((name) => !name.startsWith('.'))
  } catch {
    return null
  }
}

/** Find a folder episode, and the segment the request names when it has segments. */
function locateFolder(root: string, state: OpenState, episode: string, segment: string | undefined): Located | ChoiceResult {
  if (!isSafeEpisodeId(episode)) return refuse(state, 400, '剧集 id 不合法')
  if (root.trim().length === 0) return refuse(state, 400, '媒体目录还没配置')
  const folder = join(root, episode)
  try {
    if (!statSync(folder).isDirectory()) return refuse(state, 404, '找不到这一集')
  } catch {
    return refuse(state, 404, '找不到这一集')
  }
  if (!isInside(root, folder) || isInside(folder, root)) return refuse(state, 403, '这一集不在媒体目录里')
  const names = visibleNames(folder)
  if (names === null) return refuse(state, 500, '读不了这一集的文件夹')

  const ids = scanSegments(folder, names).map((item) => item.id)
  if (ids.length > 0 && segment === undefined) return refuse(state, 400, '这一集分了段，要说是哪一段')
  if (ids.length === 0 && segment !== undefined) return refuse(state, 400, '这一集没有分段')
  if (segment !== undefined && !ids.includes(segment)) return refuse(state, 404, `这一集没有叫「${segment}」的一段`)

  const key = segment ?? null
  return {
    directory: folder,
    names,
    auto: slotsOf(pairSubtitles(names, { directory: folder, ...(segment === undefined ? {} : { stem: segment }) })),
    choice: choiceFor(readFolderChoices(folder), key),
    save: (choice) => {
      writeFolderChoice(folder, key, choice)
      return state
    },
  }
}

/** The record after a new choice: the choice, and the names it resolves to, which the media route serves. */
function withChoice(record: FileEpisodeRecord, choice: SubtitleChoice, resolved: { en: string | null; zh: string | null }): FileEpisodeRecord {
  const next: { -readonly [K in keyof FileEpisodeRecord]: FileEpisodeRecord[K] } = { ...record, subtitleEn: resolved.en, subtitleZh: resolved.zh }
  if (isAutomatic(choice)) delete next.subtitles
  else next.subtitles = choice
  return next
}

/** Find a file episode by its record; only one that was opened has one. */
function locateFile(state: OpenState, episode: string, segment: string | undefined): Located | ChoiceResult {
  if (segment !== undefined) return refuse(state, 400, '一个音频文件没有分段')
  const record = findFileEpisode(state, episode)
  if (record === null) return refuse(state, 404, '先打开这一集，再选字幕')
  const directory = dirname(record.path)
  const names = visibleNames(directory)
  if (names === null) return refuse(state, 500, '读不了这个音频所在的目录')
  const auto = slotsOf(pairSubtitles(names, { directory, stem: stemOf(record.audio) }))
  return {
    directory,
    names,
    auto,
    choice: record.subtitles,
    save: (choice) => {
      const next = withChoice(record, choice, applyChoice(auto, choice, names))
      return { ...state, files: state.files.map((entry) => (entry.id === record.id ? next : entry)) }
    },
  }
}

/** Find what one request names, folder or file. */
function locate(root: string, state: OpenState, episode: string, segment: string | undefined): Located | ChoiceResult {
  return isFileEpisodeId(episode) ? locateFile(state, episode, segment) : locateFolder(root, state, episode, segment)
}

/** The answer for one located episode and the choice now in force. */
function describe(located: Located, choice: SubtitleChoice | undefined, state: OpenState): ChoiceResult {
  const resolved = applyChoice(located.auto, choice, located.names)
  return {
    status: 200,
    state,
    payload: {
      ok: true,
      reason: null,
      choice: choice ?? AUTO_CHOICE,
      auto: located.auto,
      resolved: { en: resolved.en, zh: resolved.zh },
      missing: resolved.state?.missing ?? [],
      candidates: subtitleFilesOf(located.names).map((file) => ({ file, cjk: fileHasCjk(join(located.directory, file)) })),
    },
  }
}

/**
 * Carry out one `GET`.
 * @param root - the library root.
 * @param state - the plugin state, which holds the file episodes' records.
 * @param episode - the episode id from the query.
 * @param segment - the segment id from the query, `undefined` when it has none.
 */
export function readSubtitleChoice(root: string, state: OpenState, episode: string, segment: string | undefined): ChoiceResult {
  const located = locate(root, state, episode, segment)
  if ('status' in located) return located
  return describe(located, located.choice, state)
}

/**
 * Carry out one `POST`.
 * @param root - the library root.
 * @param state - the plugin state before the save.
 * @param body - the parsed request body, trusted for nothing.
 * @returns the answer, with the state after the save (the same state for a folder episode).
 */
export function saveSubtitleChoice(root: string, state: OpenState, body: unknown): ChoiceResult {
  if (typeof body !== 'object' || body === null) return refuse(state, 400, '请求体不是对象')
  const request = body as Partial<SubtitleChoiceRequest>
  if (typeof request.episode !== 'string' || request.episode.length === 0) return refuse(state, 400, '缺 episode')
  if (request.segment !== undefined && typeof request.segment !== 'string') return refuse(state, 400, 'segment 必须是字符串')
  const choice = sanitizeChoice(request.choice)
  if (choice === null) return refuse(state, 400, '字幕选择的格式不对')
  const segment = request.segment === undefined || request.segment.length === 0 ? undefined : request.segment

  const located = locate(root, state, request.episode, segment)
  if ('status' in located) return located
  const offered = subtitleFilesOf(located.names)
  for (const pick of [choice.en, choice.zh]) {
    if (pick.kind === 'file' && !offered.includes(pick.file)) return refuse(state, 400, `这里没有「${pick.file}」这个字幕文件`)
  }
  let next: OpenState
  try {
    next = located.save(choice)
  } catch (error) {
    return refuse(state, 500, `字幕选择没存进去：${String(error)}`)
  }
  return describe(located, isAutomatic(choice) ? undefined : choice, next)
}
