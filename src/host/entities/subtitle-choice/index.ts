/**
 * Public API of the subtitle-choice entity: the subtitle files chosen by hand, and how a choice is laid over the pairing.
 */
export {
  applyChoice,
  AUTO_CHOICE,
  choiceFor,
  isAutomatic,
  readFolderChoices,
  sanitizeChoice,
  subtitleFilesOf,
  writeFolderChoice,
} from './model/subtitle-choice.ts'
