/**
 * Where prepared video and sound live, and what the scan may say about a video without probing it.
 *
 * The cache is `<episode>/.lingualab/<stem>.mp4` (the picture kept, the sound converted) or
 * `<stem>.m4a` (only the sound). It is the fifth thing this plugin writes into the media folder,
 * and the narrowest: the plugin's own hidden folder, files nobody else reads, and deleting the
 * folder only means preparing again. The source video is never modified.
 *
 * A cached file counts only while it is at least as new as its source: replacing a video by a
 * better rip must not leave the old prepared copy playing in its place.
 *
 * The scan stays synchronous and does not run `ffprobe`, so what it can say about a video is what the
 * files say: a prepared copy exists, or this very file was already found to play as it is (the
 * status route remembers that, per path, size and modification time).
 */
import { statSync } from 'node:fs'
import { join } from 'node:path'
import { VIDEO_CACHE_DIR, type VideoRef } from '../../../../shared/protocol.ts'

/** The two kinds of file the cache holds. */
export type CacheKind = 'video' | 'sound'

/** The extension each kind is written with. */
const EXTENSIONS: Readonly<Record<CacheKind, string>> = { video: 'mp4', sound: 'm4a' }

/** The cache folder of one episode folder. */
export function cacheDirOf(folder: string): string {
  return join(folder, VIDEO_CACHE_DIR)
}

/** The cached file's name for a stem. */
export function cacheFileName(stem: string, kind: CacheKind): string {
  return `${stem}.${EXTENSIONS[kind]}`
}

/** The absolute path of a stem's cached file of one kind (which may not exist). */
export function cachePathFor(folder: string, stem: string, kind: CacheKind): string {
  return join(cacheDirOf(folder), cacheFileName(stem, kind))
}

/** A cached file that can be played. */
export interface CachedFile {
  readonly kind: CacheKind
  readonly path: string
  readonly bytes: number
}

/** The size and modification time of a file, or `null` when it is not a readable file. */
function statOf(path: string): { readonly size: number; readonly mtimeMs: number } | null {
  try {
    const stats = statSync(path)
    return stats.isFile() ? { size: stats.size, mtimeMs: stats.mtimeMs } : null
  } catch {
    return null
  }
}

/**
 * The prepared copy of a source video, when there is one that is still good.
 *
 * The picture is preferred over the sound alone. An empty file, or one older than its source, does not count.
 * @param folder - the episode folder.
 * @param stem - the segment stem.
 * @param sourcePath - the source video, whose modification time the cache is held against.
 * @returns the cached file, or `null`.
 */
export function findCached(folder: string, stem: string, sourcePath: string): CachedFile | null {
  const source = statOf(sourcePath)
  for (const kind of ['video', 'sound'] as const) {
    const path = cachePathFor(folder, stem, kind)
    const stats = statOf(path)
    if (stats === null || stats.size === 0) continue
    if (source !== null && stats.mtimeMs < source.mtimeMs) continue
    return { kind, path, bytes: stats.size }
  }
  return null
}

/** Files that were probed and found to play as they are, so the scan can say `ready` without ffprobe. */
const directlyPlayable = new Map<string, true>()

/** The key one source file is remembered under: its path and the two numbers that change when it does. */
function directKey(path: string): string | null {
  const stats = statOf(path)
  return stats === null ? null : `${path}|${String(stats.size)}|${String(stats.mtimeMs)}`
}

/** Remember that a source file plays as it is. */
export function rememberDirect(path: string): void {
  const key = directKey(path)
  if (key !== null) directlyPlayable.set(key, true)
}

/** Whether this file, as it is now, was found to play as it is. */
export function isKnownDirect(path: string): boolean {
  const key = directKey(path)
  return key !== null && directlyPlayable.has(key)
}

/** Forget everything remembered; for tests. */
export function forgetDirect(): void {
  directlyPlayable.clear()
}

/**
 * What the scan says about the video of one segment.
 * @param folder - the episode folder.
 * @param file - the source video's file name.
 * @param stem - the segment stem the video belongs to, which names its cached files (not always the video's own stem).
 * @returns the reference with its state.
 */
export function videoRefOf(folder: string, file: string, stem: string): VideoRef {
  const path = join(folder, file)
  const stats = statOf(path)
  const cached = findCached(folder, stem, path)
  let state: VideoRef['state'] = 'unprepared'
  if (cached !== null) state = cached.kind === 'video' ? 'ready' : 'sound'
  else if (isKnownDirect(path)) state = 'ready'
  return { file, bytes: stats === null ? null : stats.size, state }
}
