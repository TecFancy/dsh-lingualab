/**
 * Public API of the resume feature: where you stopped and which steps you ticked, per
 * episode, cached in this browser and shared through the host so another device sees them.
 */
export {
  clearProgress,
  fractionOf,
  readAllProgress,
  readProgress,
  writeProgress,
  type Progress,
} from './model/progress.ts'
export { readSteps, writeSteps, type StepRecord } from './model/steps.ts'
export { startProgressSync, syncNow } from './model/sync.ts'
