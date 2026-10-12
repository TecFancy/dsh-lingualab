/**
 * Public API of the subtitle-choice feature: the routes `src/index.ts` mounts, and what the host tests
 * beside it read.
 */
export { subtitleChoiceRoute } from './api/subtitle-choice.route.ts'
export { readSubtitleChoice, saveSubtitleChoice } from './model/subtitle-choice-rules.ts'
