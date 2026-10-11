import type { EpisodeEntry, EpisodeMedia, EpisodeSegment } from '../../../shared/protocol.ts'

/**
 * What decides whether an episode's subtitles need parsing again.
 *
 * Opening the episode that is already on screen hands back a fresh entry and a fresh media
 * object with the same values. Parsing again would give the same sentences in a new array,
 * and the page treats a new array as a new episode: it resets the player, which puts the
 * position on the first sentence while the audio, left alone, stays where it was. So the
 * question "is this the same subtitle source" is answered by value, here, and not by the
 * identity of the objects the host returned.
 *
 * The segment is part of the answer. Two segments of one episode share its id and differ in
 * their files, and switching from one to the other has to parse again, while opening the
 * segment that is already on screen must not.
 */
export function subtitleKey(episode: EpisodeEntry, media: EpisodeMedia, segment: EpisodeSegment | null = null): string {
  return JSON.stringify([
    episode.id,
    segment === null ? null : segment.id,
    media.subtitleEnUrl,
    media.subtitleZhUrl,
    segment === null ? episode.subtitleEn : segment.subtitleEn,
    segment === null ? episode.subtitleZh : segment.subtitleZh,
  ])
}
