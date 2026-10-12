/**
 * What the episode entity may read from open-state.
 *
 * FSD's cross-import convention: one entity reads another only through a file named after the
 * reader, so the dependency is declared in one place and Steiger can check it.
 */
export {
  EMPTY_STATE,
  fileEpisodeIdFor,
  type FileEpisodeRecord,
  findFileEpisode,
  notesFor,
  type OpenState,
  summarizePhrases,
} from '../model/state.ts'
