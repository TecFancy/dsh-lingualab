/**
 * Public API of the video feature: what plays (the video of a segment, or its audio file), the open
 * segment's video status and the job that prepares it, and the choice of which card the stage shows.
 */
export {
  cardOf,
  etaSeconds,
  isInformational,
  playSource,
  segmentKey,
  type CardKind,
  type PlaySource,
} from './lib/source.ts'
export { forgetShownCards, useFirstTimeCard, useVideo, type FirstTimeCard, type VideoState } from './model/useVideo.ts'
