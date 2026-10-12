/**
 * Public API of the open-state entity: what the plugin remembers between requests: the open episode and the records of the
 * file episodes.
 */
export {
  EMPTY_STATE,
  fileEpisodeIdFor,
  type FileEpisodeRecord,
  findFileEpisode,
  isFileEpisodeId,
  type OpenState,
  parseState,
  serializeState,
  withCurrent,
  withNotes,
  withOpenedFile,
} from './model/state.ts'
