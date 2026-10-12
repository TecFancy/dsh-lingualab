/**
 * Which subtitles sit beside one audio file, and which of them is which language.
 *
 * Two callers ask this and they ask different questions. The picker shows a row
 * per audio file and wants to say "EN + ZH" without reading anything, so it uses
 * {@link subtitleHint}, which decides by name alone. Opening an episode needs the
 * actual files, so it uses {@link pairSubtitles}, which falls back to reading a
 * few bytes of one file when the names do not say.
 *
 * The shared rule, which is what keeps the library scan and the picker from
 * drifting apart: **the file name decides when it says something, and the content
 * decides only when it does not.**
 *
 * A bilingual subtitle is one file with two languages in it, and the study method
 * produces them (a `.srt` with the English line above the Chinese one). Such a file
 * is offered as *both* tracks, and the panel splits it line by line. When its name says
 * so (`_双语`, `.bilingual`) that is decided by name, like `en` and `zh`.
 *
 * A subtitle belongs to the audio stem that owns it, and the longest stem wins (see
 * {@link owningStem}): in a folder of scenes, `04_Dunphy家-Luke射击.srt` is not offered
 * to a sibling named `04_Dunphy家`.
 */
import { readFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import {
  AUDIO_EXTENSIONS,
  SUBTITLE_EXTENSIONS,
  VIDEO_EXTENSIONS,
  type SubtitleHint,
} from '../../../../shared/protocol.ts'
import { owningStem, sameStem, stemOf, videoStemFor } from '../../../../shared/stem.ts'
import { compareIds } from '../../../shared/lib/compare.ts'

/**
 * Language marks this module recognises, and only these.
 *
 * `eng` and `chs` are the spellings everyone reaches for and the two this module
 * deliberately does not know: once a list of near-misses is allowed, the pairing
 * rule stops being predictable. A file whose mark is not here is *unmarked*, which
 * is a state the content check can still resolve.
 */
const ENGLISH_MARKS = new Set(['en', 'en-us', 'en-gb'])
const CHINESE_MARKS = new Set(['zh', 'zh-cn', 'zh-hans', 'zh-hant', 'cn'])
/** Marks that say one file holds both languages. Compared after lower-casing, so `Bilingual` counts. */
const BILINGUAL_MARKS = new Set(['双语', 'bilingual'])

/** Extensions this module accepts as subtitles. */
const SUBTITLE_SET = new Set<string>(SUBTITLE_EXTENSIONS)

/** How much of a file is read when the content has to break a tie. */
const SNIFF_BYTES = 4096

export { sameStem, stemOf }

/** Whether the first bytes of a file carry CJK text, used only to break ties. */
export function fileHasCjk(path: string): boolean {
  try {
    const head = readFileSync(path, 'utf8').slice(0, SNIFF_BYTES)
    return /[\u4e00-\u9fff]/.test(head)
  } catch {
    return false
  }
}

/** Which of the four kinds a subtitle file's name puts it in. */
type Mark = 'en' | 'zh' | 'both' | 'none'

/**
 * Read the language mark out of one file name.
 *
 * When an audio stem is known, only the part after it is searched: `lesson.en.srt`
 * marks on `en`, and a directory holding `en.mp3` and `lesson.srt` cannot make the
 * second file look English by accident. Without a stem the whole name is searched,
 * which is what a folder episode needs — there the folder is the stem, and its
 * subtitles may be named after the episode rather than after the folder.
 * @param fileName - the subtitle file name.
 * @param stem - the audio file's stem, when one is known.
 * @returns the mark, or `none` when the name says nothing.
 */
function markOf(fileName: string, stem: string | undefined): Mark {
  const base = stemOf(fileName)
  const tail = stem !== undefined && base.startsWith(stem) ? base.slice(stem.length) : base
  const tokens = tail.split(/[._\-\s]+/).filter((token) => token.length > 0)
  for (const token of tokens) {
    const mark = token.toLowerCase()
    if (ENGLISH_MARKS.has(mark)) return 'en'
    if (CHINESE_MARKS.has(mark)) return 'zh'
    if (BILINGUAL_MARKS.has(mark)) return 'both'
  }
  return 'none'
}

/** The subtitle files of one directory, split by what their names say. */
export interface Classification {
  /** Every subtitle file, in natural order. */
  readonly files: readonly string[]
  readonly en: readonly string[]
  readonly zh: readonly string[]
  /** Files whose names say they hold both languages in one. */
  readonly both: readonly string[]
  readonly unmarked: readonly string[]
  /** True when the names alone cannot pick one file per language. */
  readonly ambiguous: boolean
}

/** The stems of the audio files among some names; one per distinct stem, in the order seen. */
export function audioStemsOf(names: readonly string[]): string[] {
  const stems = new Set<string>()
  for (const name of names) {
    if ((AUDIO_EXTENSIONS as readonly string[]).includes(extname(name).slice(1).toLowerCase())) stems.add(stemOf(name))
  }
  return [...stems]
}

/** Whether a file name is a video the scan accepts. */
export function isVideoName(name: string): boolean {
  return (VIDEO_EXTENSIONS as readonly string[]).includes(extname(name).slice(1).toLowerCase())
}

/** The video files among some names, in the order given. */
export function videoNamesOf(names: readonly string[]): string[] {
  return names.filter(isVideoName)
}

/**
 * Every stem that makes a segment: the audio stems, plus the stem of each video no audio stem owns.
 *
 * A video pairs with an audio file by the subtitle rule (see {@link videoStemFor}); one that pairs
 * with none is a segment of its own, so a folder of only videos is still a folder of segments.
 * The subtitle ownership below asks this list too, so a video-only scene owns its subtitles the same
 * way an audio scene does.
 * @param names - the visible file names of one folder.
 * @returns the distinct stems, in the order first seen.
 */
export function mediaStemsOf(names: readonly string[]): string[] {
  const audio = audioStemsOf(names)
  const stems = new Set<string>(audio)
  for (const name of videoNamesOf(names)) stems.add(videoStemFor(name, audio))
  return [...stems]
}

/**
 * The video of one stem: the one file of that stem's videos whose extension is preferred.
 * @param names - the visible file names of one folder.
 * @param stem - the segment stem, as {@link mediaStemsOf} lists it.
 * @returns the file name, or `null` when the stem has no video.
 */
export function pickVideoFile(names: readonly string[], stem: string): string | null {
  const audio = audioStemsOf(names)
  const own = videoNamesOf(names).filter((name) => videoStemFor(name, audio) === stem)
  for (const extension of VIDEO_EXTENSIONS) {
    const hit = own.find((name) => extname(name).slice(1).toLowerCase() === extension)
    if (hit !== undefined) return hit
  }
  return null
}

/**
 * Split a directory's names into the four groups, in natural order.
 *
 * A stem narrows the set as well as the reading: subtitles belong to one audio
 * file by name, and `other.en.srt` sitting in the same directory is not this
 * episode's English track. Without a stem — a folder episode — every subtitle in
 * the folder is a candidate, because there the folder is the episode.
 *
 * With a stem, ownership is by the longest stem: when the directory also holds a
 * longer audio stem that accepts the same name, the subtitle is that file's and not
 * this one's. This is the one place the rule is applied, so the scan, the picker and
 * opening an episode cannot disagree about whose a subtitle is.
 * @param names - the file names of one directory.
 * @param stem - the audio stem, when the caller has one.
 * @returns the classification.
 */
export function classifySubtitles(names: readonly string[], stem?: string): Classification {
  // The candidates for ownership: this stem and every audio stem beside it.
  const rivals = stem === undefined ? [] : [stem, ...mediaStemsOf(names)]
  const files = names
    .filter((name) => SUBTITLE_SET.has(extname(name).slice(1).toLowerCase()))
    .filter((name) => stem === undefined || owningStem(name, rivals) === stem)
    .sort(compareIds)
  const en: string[] = []
  const zh: string[] = []
  const both: string[] = []
  const unmarked: string[] = []
  for (const file of files) {
    const mark = markOf(file, stem)
    if (mark === 'en') en.push(file)
    else if (mark === 'zh') zh.push(file)
    else if (mark === 'both') both.push(file)
    else unmarked.push(file)
  }
  return {
    files,
    en,
    zh,
    both,
    unmarked,
    ambiguous: en.length > 1 || zh.length > 1 || both.length > 1 || unmarked.length > 1,
  }
}

/** The two tracks one episode ended up with. Either may be missing. */
export interface SubtitlePair {
  readonly en: string | null
  readonly zh: string | null
  /** True when the names could not decide and the pick is a best effort. */
  readonly ambiguous: boolean
}

/**
 * How two unmarked files are told apart when their names say nothing.
 *
 * This is the fallback for the spelling the mark list refuses (`chs` next to
 * `eng`, or a plain `S01E01.srt` next to a translated one): the file with CJK in it
 * is the Chinese track. Returns `null` unless the two files disagree, because two
 * Chinese files or two English ones are not a pair.
 */
function splitByContent(directory: string, files: readonly string[]): { en: string; zh: string } | null {
  let en: string | null = null
  let zh: string | null = null
  for (const file of files) {
    if (fileHasCjk(join(directory, file))) {
      zh ??= file
    } else {
      en ??= file
    }
  }
  return en !== null && zh !== null ? { en, zh } : null
}

/**
 * Pick the English and Chinese tracks from one directory's names.
 *
 * The decision mirrors the scan's original rules, with the mark list above in place
 * of the old name heuristic: names decide first; a single file that carries CJK is
 * offered as both tracks; and when nothing is marked, the content of at most a few
 * files decides which is which. A file whose name marks it bilingual is the Chinese
 * source (the page keeps only its Chinese lines), and the English track is an
 * English-marked file if there is one, else the single unmarked file, else that
 * bilingual file again. `ambiguous` reports that this was a best effort:
 * the picker shows that state, while the page opens what it is given.
 * @param names - file names of one directory.
 * @param options - the audio stem, and the directory when content may be read.
 * @returns the pair, plus whether it was guessed.
 */
export function pairSubtitles(
  names: readonly string[],
  options: { readonly stem?: string; readonly directory?: string } = {},
): SubtitlePair {
  const { stem, directory } = options
  const { files, en, zh, both, unmarked, ambiguous } = classifySubtitles(names, stem)
  if (files.length === 0) return { en: null, zh: null, ambiguous: false }

  const bilingualFile = both[0]
  if (bilingualFile !== undefined) {
    const lone = unmarked.length === 1 ? unmarked[0] : undefined
    return { en: en[0] ?? lone ?? bilingualFile, zh: bilingualFile, ambiguous }
  }

  const only = unmarked[0]
  if (en.length === 0 && zh.length === 0 && unmarked.length === 1 && only !== undefined) {
    // One subtitle, no mark, no second file to compare with. Reading it is the only
    // way to know whether it is a bilingual file — the shape the study method
    // produces most often — or an English track that wants a translation.
    const bilingual = directory !== undefined && fileHasCjk(join(directory, only))
    return { en: only, zh: bilingual ? only : null, ambiguous }
  }

  if (en.length > 0 && zh.length === 0 && unmarked.length > 0) {
    // The name settled the English track, so an unmarked file can only be the other one:
    // `MDJT S01E01-EN.srt` beside a bilingual `MDJT S01E01.srt`. The first that carries CJK
    // is it; without one, or without a directory to read, the first, which is what the
    // picker's hint already says by name.
    const withCjk = directory === undefined ? undefined : unmarked.find((file) => fileHasCjk(join(directory, file)))
    return { en: en[0] ?? null, zh: withCjk ?? unmarked[0] ?? null, ambiguous }
  }

  if (en.length > 0 || unmarked.length > 0) {
    const byContent =
      directory !== undefined && unmarked.length >= 2 ? splitByContent(directory, unmarked) : null
    return {
      en: en[0] ?? byContent?.en ?? unmarked[0] ?? null,
      zh: zh[0] ?? byContent?.zh ?? unmarked[1] ?? null,
      ambiguous,
    }
  }

  // Every subtitle reads as Chinese by name. The first is the primary track, and it
  // doubles as the English one only when it actually carries both languages.
  const first = zh[0] ?? files[0] ?? null
  const bilingual = first !== null && directory !== undefined && fileHasCjk(join(directory, first))
  return { en: first, zh: bilingual ? first : (zh[1] ?? null), ambiguous }
}

/**
 * What the picker shows for one audio row, decided by name alone.
 *
 * Nothing here opens a file: the row is drawn while the reader scrolls, and reading
 * a few bytes per audio file would turn a directory listing into a directory scan.
 * `unknown` is therefore an honest state — one unmarked subtitle exists and only
 * opening the episode will say what it holds.
 * @param names - file names of the directory holding the audio.
 * @param stem - the audio file's stem.
 * @returns the hint, with at most four file names.
 */
export function subtitleHint(names: readonly string[], stem?: string): SubtitleHint {
  const { files, en, zh, both, unmarked, ambiguous } = classifySubtitles(names, stem)
  const shown = files.slice(0, 4)
  if (files.length === 0) return { state: 'none', files: [] }
  if (ambiguous) return { state: 'unknown', files: shown }
  // A file that says it holds both languages settles the row without reading it. The files
  // are listed the way the pair is chosen: the English track first, then the bilingual one.
  const bilingual = both[0]
  if (bilingual !== undefined && both.length === 1) {
    const english = en[0] ?? (unmarked.length === 1 ? unmarked[0] : undefined)
    return { state: 'both', files: english === undefined ? [bilingual] : [english, bilingual] }
  }
  if (en.length === 1 && zh.length === 1) return { state: 'both', files: [en[0] ?? '', zh[0] ?? ''] }
  if (en.length === 1 && unmarked.length === 1) return { state: 'both', files: [en[0] ?? '', unmarked[0] ?? ''] }
  if (zh.length === 1 && unmarked.length === 1) return { state: 'both', files: [unmarked[0] ?? '', zh[0] ?? ''] }
  if (en.length === 1) return { state: 'en', files: shown }
  if (zh.length === 1) return { state: 'zh', files: shown }
  return { state: 'unknown', files: shown }
}

/**
 * The audio file of one directory: the first extension in preference order wins.
 *
 * Shared with the scan so a folder's audio and a file episode's audio are chosen by
 * the same rule — a folder holding both `lesson.mp3` and `lesson.wav` must not play
 * one file in the library listing and another when the picker opens it.
 * @param names - the file names of one directory.
 * @returns the file name, or `null` when there is no audio.
 */
export function pickAudioFile(names: readonly string[]): string | null {
  for (const extension of AUDIO_EXTENSIONS) {
    const hit = names.find((name) => extname(name).slice(1).toLowerCase() === extension)
    if (hit !== undefined) return hit
  }
  return null
}
