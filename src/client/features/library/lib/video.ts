/**
 * What the library listing says about video, for the marks on the home and in the segment list.
 *
 * The scan does not probe a video, so its state is what the files say: a prepared copy is in the cache
 * (or this very file was already found to play as it is), or it is not (see `VideoRef`). These helpers
 * only turn that into the one word a card or a row shows.
 */
import type { EpisodeEntry, EpisodeSegment } from '../../../shared/protocol.ts'

/** The mark an episode's card carries: nothing, the video, or the video that still has to be prepared. */
export type VideoMark = 'none' | 'ready' | 'unprepared'

/**
 * The mark for an episode: the video of the folder, or of any of its segments.
 *
 * One segment still to be prepared is enough to say so, because that is the one thing the reader
 * might want to know before opening the episode.
 */
export function videoMarkOf(entry: Pick<EpisodeEntry, 'video' | 'segments'>): VideoMark {
  const videos = entry.segments.length > 0 ? entry.segments.map((segment) => segment.video) : [entry.video]
  const present = videos.filter((video) => video !== null)
  if (present.length === 0) return 'none'
  return present.some((video) => video.state === 'unprepared') ? 'unprepared' : 'ready'
}

/** Whether a segment has a video, for its row in the list. */
export function hasVideo(segment: Pick<EpisodeSegment, 'video'>): boolean {
  return segment.video !== null
}

/** Whether a segment is only a video: its sound is taken from the video. */
export function isVideoOnly(segment: Pick<EpisodeSegment, 'audio' | 'video'>): boolean {
  return segment.audio === null && segment.video !== null
}

/** Whether an episode has anything to play: an audio file or a video. */
export function hasMedia(entry: Pick<EpisodeEntry, 'audio' | 'video'>): boolean {
  return entry.audio !== null || entry.video !== null
}
