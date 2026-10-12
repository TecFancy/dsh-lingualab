/**
 * Which files a file episode may serve.
 *
 * A file episode lives wherever the reader keeps it, so the media route cannot fall back on the
 * library root to decide what is safe to send. This is the rule it asks instead, and the timing
 * edits ask the same one before they rewrite a subtitle file. It reads the plugin state and the
 * directory and writes nothing, so it sits below both the open and the timing routes rather than
 * inside either.
 */
import { statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { isInside } from '../../../shared/fs/index.ts'
import { contentTypeOf } from '../../../shared/http/index.ts'
import { findFileEpisode, type FileEpisodeRecord, type OpenState } from '../../open-state/@x/episode.ts'
import { sameStem, stemOf } from './pairing.ts'

/** Whether the reader picked this file by hand for one of the record's slots. */
function pickedIn(record: FileEpisodeRecord, name: string): boolean {
  const choice = record.subtitles
  if (choice === undefined) return false
  return [choice.en, choice.zh].some((pick) => pick.kind === 'file' && pick.file === name)
}

/**
 * Resolve `/file-media/<id>/<name>` into a file this episode may serve.
 *
 * The name is checked against the record first (the audio, the two subtitle files
 * it was opened with, and the files the reader picked by hand), and then against
 * the directory, for the case the record cannot know about: a translation added
 * after the episode was opened. What is never allowed, beyond what the reader
 * picked, is a name that is not the audio's own stem, which is what keeps this
 * route from serving the rest of the reader's disk through an id they happen to
 * hold.
 * @param state - the plugin state, which owns the id-to-path mapping.
 * @param requestPath - the path after `/lingualab/file-media`.
 * @returns the absolute path to send, or `null` to refuse.
 */
export function resolveFileMedia(state: OpenState, requestPath: string): string | null {
  let decoded: string
  try {
    decoded = decodeURIComponent(requestPath)
  } catch {
    return null
  }
  if (decoded.includes('\0')) return null

  const segments = decoded.split('/').filter((segment) => segment.length > 0 && segment !== '.')
  if (segments.length !== 2) return null
  const [id, name] = segments
  if (id === undefined || name === undefined || id === '..' || name === '..') return null
  if (name.includes('/') || name.includes('\\')) return null

  const record = findFileEpisode(state, id)
  if (record === null) return null
  const directory = dirname(record.path)
  if (record.audio === name || record.subtitleEn === name || record.subtitleZh === name || pickedIn(record, name)) {
    return join(directory, name)
  }

  if (!sameStem(name, stemOf(record.audio))) return null
  if (contentTypeOf(name) === null) return null
  const candidate = join(directory, name)
  try {
    if (!statSync(candidate).isFile()) return null
  } catch {
    return null
  }
  return isInside(directory, candidate) ? candidate : null
}
