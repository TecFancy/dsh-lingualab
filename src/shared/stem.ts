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
