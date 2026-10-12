/**
 * What plays, and what the stage shows about the video: two small decisions, kept pure.
 *
 * **What plays.** One media element plays one source at a time. A segment with a playable video plays
 * the video, and its sound is the sound of the session; otherwise the segment's audio file as always.
 * A video-only segment that has had its sound taken out plays that. A video the browser turned out not
 * to be able to decode is given up on for the rest of the visit, and the audio file takes over.
 *
 * **What the stage shows.** Besides the picture itself, the video slot can hold a card that says what
 * is needed (prepare it, wait, install ffmpeg, only the sound can be had) or that nothing can be done.
 * The cards that only inform (nothing to do but know) are shown in full the first time a segment is
 * opened in this page session and afterwards as a small label that reopens them; the ones that ask
 * for something are shown whenever the picture is.
 */
import type { VideoStatusPayload } from '../../../shared/protocol.ts'

/** The source the media element plays, and whether it has a picture. */
export interface PlaySource {
  /** The URL to play, or `null` when there is nothing to play yet. */
  readonly url: string | null
  /** True when the source is a video with a picture to show. */
  readonly picture: boolean
}

/**
 * Choose what to play.
 * @param audioUrl - the segment's audio file URL; empty or `null` for a segment that has none.
 * @param status - what the host said about the segment's video, or `null` while unknown.
 * @param failedUrl - a URL the browser said it cannot decode, or `null`.
 */
export function playSource(audioUrl: string | null, status: VideoStatusPayload | null, failedUrl: string | null): PlaySource {
  const audio = audioUrl === null || audioUrl.length === 0 ? null : audioUrl
  if (status !== null && status.url !== null && status.url !== failedUrl) {
    if (status.state === 'playable') return { url: status.url, picture: true }
    // The sound taken from a video stands in only for a segment that has no audio file of its own.
    if (status.state === 'sound-ready' && audio === null) return { url: status.url, picture: false }
  }
  return { url: audio, picture: false }
}

/** The cards the video slot can hold. */
export type CardKind =
  /** Not prepared: 「准备视频」. */
  | 'prepare'
  /** A job is running: progress and 「取消」. */
  | 'preparing'
  /** It needs preparing and there is no ffmpeg: the install command. */
  | 'no-ffmpeg'
  /** The picture cannot be had; 「只准备声音」 for a segment with no audio of its own. */
  | 'sound-only'
  /** The sound was taken out; there is no picture. */
  | 'sound-ready'
  /** The last job failed, with the reason; 「重试」. */
  | 'failed'
  /** The video cannot be played here, and that is all there is to know. */
  | 'unplayable'

/**
 * Which card, if any, the segment's video needs.
 * @param status - what the host said, or `null` while unknown (no card).
 * @param failedUrl - the URL the browser could not decode, which makes an otherwise playable video unplayable.
 * @returns the card kind, or `null` when the picture plays or there is no video.
 */
export function cardOf(status: VideoStatusPayload | null, failedUrl: string | null): CardKind | null {
  if (status === null) return null
  if (status.state === 'playable') return status.url !== null && status.url === failedUrl ? 'unplayable' : null
  switch (status.state) {
    case 'prepare':
      return 'prepare'
    case 'preparing':
      return 'preparing'
    case 'no-ffmpeg':
      return 'no-ffmpeg'
    case 'sound-only':
      return 'sound-only'
    case 'sound-ready':
      return 'sound-ready'
    case 'failed':
      return 'failed'
    case 'unplayable':
      return 'unplayable'
    default:
      return null
  }
}

/** Whether a card only informs: shown in full once per page session, then as a small label. */
export function isInformational(kind: CardKind): boolean {
  return kind === 'unplayable' || kind === 'sound-only' || kind === 'sound-ready'
}

/**
 * The segment a status is about, as one string, for the "have I shown this card already" memory.
 * @returns the key, or `null` when there is no episode.
 */
export function segmentKey(episodeId: string | null, segmentId: string | null): string | null {
  return episodeId === null ? null : JSON.stringify([episodeId, segmentId])
}

/**
 * How long until a job is done, from how long it has run and how far it has got.
 * @param elapsedSeconds - wall time since the job was first seen running.
 * @param fraction - 0 to 1.
 * @returns whole seconds, or `null` when it is too early to say.
 */
export function etaSeconds(elapsedSeconds: number, fraction: number): number | null {
  if (!(fraction > 0.02) || !(elapsedSeconds > 0.5) || fraction >= 1) return null
  return Math.max(1, Math.round((elapsedSeconds / fraction) * (1 - fraction)))
}
