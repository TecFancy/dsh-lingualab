/**
 * Public API of the video feature: what plays (the video of a segment, or its audio file), the open
 * segment's video status and the job that prepares it, the choice of which card the stage shows, and a video file
 * the reader picked from their own disk to play in place of the served one.
 */
export {
  cardOf,
  etaSeconds,
  isInformational,
  playSource,
  producedNewFile,
  segmentKey,
  type CardKind,
  type PlaySource,
} from './lib/source.ts'
export { forgetShownCards, useFirstTimeCard, useVideo, type FirstTimeCard, type VideoState } from './model/useVideo.ts'
export { estimateText, etaUnit, smoothControlOf, type EstimateText, type SmoothControl } from './lib/smooth.ts'
export { isVideoFile } from './lib/local.ts'
export { useLocalVideo, type LocalVideo, type LocalVideoOptions } from './model/useLocalVideo.ts'
