/**
 * Turning a handful of dropped files into episodes.
 *
 * A reader drags what they have: an audio file and its subtitles, or a whole season's
 * worth of both, and now a video beside them. The page has to decide which files belong together
 * without asking, because the question "which subtitle goes with which audio" is the one thing the
 * drop was supposed to spare them.
 *
 * The rule is the host's pairing rule, kept in step with `src/host/pairing.ts`: a
 * subtitle belongs to the audio file whose stem it starts with, followed by a separator
 * (`lesson.mp3` owns `lesson.srt`, `lesson.en.srt`, `lesson_zh.srt`; it does not own
 * `lesson2.srt`). The longest matching stem wins, so `lesson-2.mp3` takes `lesson-2.srt`
 * even though `lesson.mp3` is also a prefix of it. A video pairs the same way (`lesson.mkv` goes with
 * `lesson.mp3`), and one that no audio file owns is an episode of its own, named after it, which its
 * subtitles can join by the same rule.
 *
 * A subtitle that matches no audio file is not dropped silently: when exactly one episode was dropped
 * it joins that episode (a lone `.srt` beside a lone `.mp3` is
 * obviously a pair even when the names disagree), and otherwise it is reported as
 * unmatched so the page can say so.
 */

import { AUDIO_EXTENSIONS, SUBTITLE_EXTENSIONS, VIDEO_EXTENSIONS } from '../../../shared/protocol.ts'
import { owningStem, stemOf, videoStemFor } from '../../../shared/stem.ts'

export { stemOf }

/** What a dropped file is, by name alone. The host re-checks every file it receives. */
export function kindOf(name: string): 'audio' | 'video' | 'subtitle' | 'other' {
  if (name.lastIndexOf('.') < 0) return 'other'
  const extension = name.slice(name.lastIndexOf('.') + 1).toLowerCase()
  if ((AUDIO_EXTENSIONS as readonly string[]).includes(extension)) return 'audio'
  if ((VIDEO_EXTENSIONS as readonly string[]).includes(extension)) return 'video'
  if ((SUBTITLE_EXTENSIONS as readonly string[]).includes(extension)) return 'subtitle'
  return 'other'
}

/** One episode's worth of dropped files. */
export interface DropGroup<T> {
  /** The folder name the episode will have: the audio file's stem, or the video's when there is no audio. */
  readonly episode: string
  /** The audio file; `null` for an episode that is only a video. */
  readonly audio: T | null
  /** The videos that go with it, in the order dropped. */
  readonly videos: readonly T[]
  readonly subtitles: readonly T[]
}

/** The result of grouping a drop. */
export interface DropPlan<T> {
  readonly groups: readonly DropGroup<T>[]
  /** Subtitles that could not be paired with any episode. */
  readonly unmatched: readonly T[]
  /** Files that are neither audio, video nor subtitles. */
  readonly ignored: readonly T[]
}

/** A group while it is being built. */
interface Building<T> {
  readonly episode: string
  readonly audio: T | null
  readonly videos: T[]
  readonly subtitles: T[]
}

/**
 * Pair a drop's videos and subtitles with its audio files.
 * @param files - the dropped items.
 * @param nameOf - how to read an item's file name, so the logic needs no `File`.
 */
export function planDrop<T>(files: readonly T[], nameOf: (file: T) => string): DropPlan<T> {
  const audio = files.filter((file) => kindOf(nameOf(file)) === 'audio')
  const videos = files.filter((file) => kindOf(nameOf(file)) === 'video')
  const subtitles = files.filter((file) => kindOf(nameOf(file)) === 'subtitle')
  const ignored = files.filter((file) => kindOf(nameOf(file)) === 'other')

  const groups: Building<T>[] = audio.map((file) => ({ episode: stemOf(nameOf(file)), audio: file, videos: [], subtitles: [] }))
  /** The group each stem belongs to: the first audio file of that stem, else the video-only group made for it. */
  const byStem = new Map<string, Building<T>>()
  for (const group of groups) if (!byStem.has(group.episode)) byStem.set(group.episode, group)

  const audioStems = groups.map((group) => group.episode)
  for (const video of videos) {
    const stem = videoStemFor(nameOf(video), audioStems)
    let group = byStem.get(stem)
    if (group === undefined) {
      group = { episode: stem, audio: null, videos: [], subtitles: [] }
      groups.push(group)
      byStem.set(stem, group)
    }
    group.videos.push(video)
  }

  const stems = [...byStem.keys()]
  const unmatched: T[] = []
  for (const subtitle of subtitles) {
    // The longest stem that accepts the name owns it: the shared rule, not a copy of it.
    const owner = owningStem(nameOf(subtitle), stems)
    let best: Building<T> | null = owner === null ? null : (byStem.get(owner) ?? null)
    // One episode and one stray subtitle are a pair whatever they are called.
    if (best === null && groups.length === 1) best = groups[0] ?? null
    if (best === null) unmatched.push(subtitle)
    else best.subtitles.push(subtitle)
  }

  return { groups, unmatched, ignored }
}
