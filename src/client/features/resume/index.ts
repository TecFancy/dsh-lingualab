/**
 * Public API of the resume feature: where you stopped and which steps you ticked, cached in
 * this browser and shared through the host so another device sees them. Positions are kept per
 * episode, and per segment for an episode cut into segments; steps are per episode.
 */
export {
  clearProgress,
  fractionOf,
  readAllProgress,
  readProgress,
  writeProgress,
  type Progress,
} from './model/progress.ts'
export {
  FINISHED_WITHIN_SECONDS,
  continueSegment,
  episodeProgress,
  finishedSegments,
  isFinished,
  newestSegment,
  progressKeyOf,
  type EpisodeProgress,
  type PositionTable,
  type SegmentedEpisode,
} from './lib/segments.ts'
export {
  currentStep,
  practiceStatus,
  stepClock,
  stepFill,
  STEPS,
  stepsDone,
  type PracticeStatus,
  type StepDefinition,
  type StepRecords,
} from './lib/steps.ts'
export { readAllSteps, readSteps, writeSteps, type StepRecord, type StepsTable } from './model/steps.ts'
export { startProgressSync, syncNow } from './model/sync.ts'
