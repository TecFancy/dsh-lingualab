/** Public API of the media-player feature: the store and the audio binding. */
export {
  DEFAULT_SPEED_INDEX,
  SPEED_PRESETS,
  currentSpeed,
  useMediaPlayer,
  type EditWindow,
  type MediaPlayerState,
} from './model/store.ts'
export { useAudioBinding, type AudioRef } from './lib/useAudioBinding.ts'
export { loopWindow, planLoop, stepCueIndex, type LoopDecision, type LoopMode } from './lib/loop.ts'
