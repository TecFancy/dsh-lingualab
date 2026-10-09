/**
 * Where one track of one episode is served from.
 *
 * Two routes, because the two kinds of episode live in different places: a folder
 * episode is resolved under the library root by the media route, while a file
 * episode is served from the host's recorded index. The episode itself says which
 * one it is, so nothing else in the client has to know.
 */
import type { EpisodeEntry, EpisodeMedia } from '../protocol.ts'

/** The URL for one file of one episode. */
export function mediaUrlFor(episode: EpisodeEntry, file: string): string {
  const base = episode.kind === 'file' ? '/lingualab/file-media' : '/lingualab/media'
  return `${base}/${encodeURIComponent(episode.id)}/${encodeURIComponent(file)}`
}

/** Every track of one episode, or `null` when it has no audio to play. */
export function mediaOf(episode: EpisodeEntry): EpisodeMedia | null {
  if (episode.audio === null) return null
  return {
    audioUrl: mediaUrlFor(episode, episode.audio),
    subtitleEnUrl: episode.subtitleEn === null ? null : mediaUrlFor(episode, episode.subtitleEn),
    subtitleZhUrl: episode.subtitleZh === null ? null : mediaUrlFor(episode, episode.subtitleZh),
  }
}
