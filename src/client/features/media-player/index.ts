/** Public API of the media-player feature: the store and the media binding. */
export {
  DEFAULT_SPEED_INDEX,
  LEAD_IN_CHOICES,
  SPEED_PRESETS,
  currentSpeed,
  useMediaPlayer,
  type Compare,
  type EditWindow,
  type MediaPlayerState,
  type ShadowWait,
} from './model/store.ts'
export { useMediaBinding, type MediaBinding } from './lib/useMediaBinding.ts'
export { loopWindow, planLoop, stepCueIndex, type LoopDecision, type LoopMode } from './lib/loop.ts'
export { SHADOW_PAUSES, SHADOW_PLAYS, type ShadowPause, type ShadowPlays, type ShadowSettings } from './lib/shadow.ts'
export { canRecord } from './lib/recorder.ts'
export { type MicNotice, type Take } from './lib/take.ts'
