/**
 * Public API of the video-cache entity: where a prepared video and its audio live in the `.lingualab/` cache.
 */
export {
  cacheDirOf,
  cacheFileName,
  type CacheKind,
  type CachedFile,
  cachePathFor,
  findCached,
  forgetDirect,
  rememberDirect,
  videoRefOf,
} from './model/video-cache.ts'
