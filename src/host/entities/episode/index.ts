/**
 * Public API of the episode entity: the library scan, the pairing rule that turns a folder into segments, the id check every
 * folder-episode route asks first, and which files a file episode may serve.
 */
export { isSafeEpisodeId } from './model/episode-id.ts'
export { resolveFileMedia } from './model/file-media.ts'
export {
  audioEntry,
  describeAudioFile,
  episodeTitle,
  scanEpisode,
  scanLibrary,
  scanSegments,
} from './model/library.ts'
export {
  fileHasCjk,
  mediaStemsOf,
  pairSubtitles,
  pickAudioFile,
  pickVideoFile,
  stemOf,
  subtitleHint,
} from './model/pairing.ts'
