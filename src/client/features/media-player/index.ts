/** Public API of the media-player feature: the store and the media binding. */
export {
  DEFAULT_SPEED_INDEX,
  LEAD_IN_CHOICES,
  SPEED_PRESETS,
  currentSpeed,
  useMediaPlayer,
  type EditWindow,
  type MediaPlayerState,
} from './model/store.ts'
export { useMediaBinding, type MediaBinding } from './lib/useMediaBinding.ts'
export { loopWindow, planLoop, stepCueIndex, type LoopDecision, type LoopMode } from './lib/loop.ts'
