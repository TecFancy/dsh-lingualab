/**
 * Turning a handful of dropped files into episodes.
 *
 * A reader drags what they have: an audio file and its subtitles, or a whole season's
 * worth of both. The page has to decide which files belong together without asking,
 * because the question "which subtitle goes with which audio" is the one thing the
 * drop was supposed to spare them.
 *
 * The rule is the host's pairing rule, kept in step with `src/host/pairing.ts`: a
 * subtitle belongs to the audio file whose stem it starts with, followed by a separator
 * (`lesson.mp3` owns `lesson.srt`, `lesson.en.srt`, `lesson_zh.srt`; it does not own
 * `lesson2.srt`). The longest matching stem wins, so `lesson-2.mp3` takes `lesson-2.srt`
 * even though `lesson.mp3` is also a prefix of it.
 *
 * A subtitle that matches no audio file is not dropped silently: when exactly one audio
 * file was dropped it joins that episode (a lone `.srt` beside a lone `.mp3` is
 * obviously a pair even when the names disagree), and otherwise it is reported as
 * unmatched so the page can say so.
 */

/** Extensions mirrored from the host's contract; the host re-checks every file. */
const AUDIO = ['mp3', 'm4a', 'wav', 'ogg', 'opus', 'flac']
const SUBTITLE = ['srt', 'vtt', 'lrc']

/** What a dropped file is, by name alone. */
export function kindOf(name: string): 'audio' | 'subtitle' | 'other' {
  const extension = name.slice(name.lastIndexOf('.') + 1).toLowerCase()
  if (name.lastIndexOf('.') < 0) return 'other'
  if (AUDIO.includes(extension)) return 'audio'
  if (SUBTITLE.includes(extension)) return 'subtitle'
  return 'other'
}

/** The file name without its last extension. */
export function stemOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot <= 0 ? name : name.slice(0, dot)
}

/** One episode's worth of dropped files. */
export interface DropGroup<T> {
  /** The folder name the episode will have: the audio file's stem. */
  readonly episode: string
  readonly audio: T
  readonly subtitles: readonly T[]
}

/** The result of grouping a drop. */
export interface DropPlan<T> {
  readonly groups: readonly DropGroup<T>[]
  /** Subtitles that could not be paired with any audio file. */
  readonly unmatched: readonly T[]
  /** Files that are neither audio nor subtitles. */
  readonly ignored: readonly T[]
}

/** Whether a subtitle's name belongs to an audio stem, with the required separator. */
function owns(subtitleName: string, audioStem: string): boolean {
  const base = stemOf(subtitleName)
  if (base === audioStem) return true
  const next = base.slice(audioStem.length, audioStem.length + 1)
  return base.startsWith(audioStem) && (next === '.' || next === '_' || next === '-')
}

/**
 * Pair a drop's subtitles with its audio files.
 * @param files - the dropped items.
 * @param nameOf - how to read an item's file name, so the logic needs no `File`.
 */
export function planDrop<T>(files: readonly T[], nameOf: (file: T) => string): DropPlan<T> {
  const audio = files.filter((file) => kindOf(nameOf(file)) === 'audio')
  const subtitles = files.filter((file) => kindOf(nameOf(file)) === 'subtitle')
  const ignored = files.filter((file) => kindOf(nameOf(file)) === 'other')

  const owned = new Map<T, T[]>(audio.map((file) => [file, []]))
  const unmatched: T[] = []

  for (const subtitle of subtitles) {
    const name = nameOf(subtitle)
    let best: T | null = null
    let bestLength = -1
    for (const candidate of audio) {
      const stem = stemOf(nameOf(candidate))
      if (owns(name, stem) && stem.length > bestLength) {
        best = candidate
        bestLength = stem.length
      }
    }
    // One audio file and one stray subtitle are a pair whatever they are called.
    if (best === null && audio.length === 1) best = audio[0] ?? null
    if (best === null) unmatched.push(subtitle)
    else owned.get(best)?.push(subtitle)
  }

  const groups = audio.map((file) => ({
    episode: stemOf(nameOf(file)),
    audio: file,
    subtitles: owned.get(file) ?? [],
  }))
  return { groups, unmatched, ignored }
}
