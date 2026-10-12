/**
 * What the note entity may read from episode.
 *
 * FSD's cross-import convention: one entity reads another only through a file named after the
 * reader, so the dependency is declared in one place and Steiger can check it.
 */
export { isSafeEpisodeId } from '../model/episode-id.ts'
export { scanSegments } from '../model/library.ts'
