/**
 * What the note entity may read from open-state.
 *
 * FSD's cross-import convention: one entity reads another only through a file named after the
 * reader, so the dependency is declared in one place and Steiger can check it.
 */
export {
  EMPTY_STATE,
  isFileEpisodeId,
  notesFor,
  type OpenState,
  parseState,
  sanitizePhrases,
  serializeState,
  withNotes,
} from '../model/state.ts'
