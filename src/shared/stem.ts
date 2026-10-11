/**
 * Which files belong together, by name: the one rule, in one place.
 *
 * The host pairs subtitles with an audio file by name when it scans a library, and the
 * page pairs a dropped batch the same way before it sends anything. They used to be two
 * hand-written copies with a comment promising they agreed. The cost of a disagreement is
 * a subtitle that imports under one episode and is then not found under it, so the rule
 * lives here and both halves import it; a test on this file is a test on both.
 *
 * Pure string work with no `node:` imports, so the browser bundle can use it.
 */

/** The file name without its last extension: `lesson.en.srt` becomes `lesson.en`. */
export function stemOf(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  // No dot, or only a leading one (`.hidden`): there is no extension to take off.
  return dot <= 0 ? fileName : fileName.slice(0, dot)
}

/**
 * Whether a file name belongs to the same stem as an audio file or an episode folder.
 *
 * `lesson.mp3` owns `lesson.srt`, `lesson.en.srt` and `lesson_zh.srt`; it does not own
 * `lesson2.srt`. The separator is required so a numbered sequel is a different lesson
 * rather than a second subtitle track.
 * @param fileName - the candidate file name, extension included.
 * @param stem - the stem to test it against.
 * @returns true when the file belongs to the stem.
 */
export function sameStem(fileName: string, stem: string): boolean {
  const base = stemOf(fileName)
  if (base === stem) return true
  const next = base.slice(stem.length, stem.length + 1)
  return base.startsWith(stem) && (next === '.' || next === '_' || next === '-')
}

/**
 * The stem that owns a file, when several stems are candidates: the longest one that
 * {@link sameStem} accepts.
 *
 * `04_Dunphy家.mp3` and `04_Dunphy家-Luke射击.mp3` can sit in one folder, and
 * `04_Dunphy家-Luke射击.srt` starts with both of them followed by a separator. Without a
 * tie-break the shorter one would claim it, so the rule is "longest wins". The import
 * grouping, the library scan, the picker and opening an episode all ask this one
 * function, which is what keeps a subtitle from belonging to one audio file in the
 * listing and to another once it is opened.
 * @param fileName - the candidate file name, extension included.
 * @param stems - the audio stems in the same folder.
 * @returns the owning stem, or `null` when none of them accepts the file.
 */
export function owningStem(fileName: string, stems: readonly string[]): string | null {
  let best: string | null = null
  for (const stem of stems) {
    if (sameStem(fileName, stem) && (best === null || stem.length > best.length)) best = stem
  }
  return best
}

/** A segment stem taken apart: its leading number, and the title that follows it. */
export interface SegmentStem {
  /** The leading digits as written (`01`), or `null` when the stem does not start with a number. */
  readonly number: string | null
  /** The stem without that number and the separator after it, or the whole stem when nothing is left. */
  readonly title: string
}

/**
 * Split a segment's stem into its number and its title.
 *
 * Scene files are named `01_Dunphy家的早晨`, and the page wants the number and the name
 * apart: the name is the title, the number is what the reader sees in the file list.
 * `01_`, `01-`, `01.` and `01 ` all count as a separator. A stem with nothing after the
 * separator, or with no number at all, is its own title.
 * @param stem - the audio stem.
 * @returns the number and the title.
 */
export function splitSegmentStem(stem: string): SegmentStem {
  const match = /^(\d+)[\s._-]+(.+)$/.exec(stem)
  const title = match?.[2]?.trim() ?? ''
  if (match === null || title.length === 0) return { number: null, title: stem }
  return { number: match[1] ?? null, title }
}
