/**
 * What the episode entity may read from video-cache.
 *
 * FSD's cross-import convention: one entity reads another only through a file named after the
 * reader, so the dependency is declared in one place and Steiger can check it.
 */
export { videoRefOf } from '../model/video-cache.ts'
