/**
 * Loading one subtitle file over the host's media route.
 *
 * It lives in this entity rather than in `shared/` because it returns cues, and
 * FSD forbids a shared module from importing an entity. The bytes are read as an
 * `ArrayBuffer` on purpose: decoding happens in {@link decodeSubtitleText}, which
 * handles the GB18030 case that `response.text()` would turn into replacement
 * characters.
 */
import { mediaUrl } from '../../../shared/lib/api.ts'
import { decodeSubtitleText } from '../lib/decode.ts'
import { parseSubtitle } from '../lib/parse.ts'
import type { Cue } from '../model/types.ts'

/** Fetch, decode and parse one subtitle file. */
export async function fetchCues(episode: string, file: string): Promise<Cue[]> {
  const response = await fetch(mediaUrl(episode, file))
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  const buffer = await response.arrayBuffer()
  return parseSubtitle(decodeSubtitleText(buffer), file)
}
