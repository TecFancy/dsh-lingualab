/**
 * Loading one subtitle file over the host's media route.
 *
 * It lives in this entity rather than in `shared/` because it returns cues, and
 * FSD forbids a shared module from importing an entity. The bytes are read as an
 * `ArrayBuffer` on purpose: decoding happens in {@link decodeSubtitleText}, which
 * handles the GB18030 case that `response.text()` would turn into replacement
 * characters.
 *
 * The caller passes the URL rather than resolving `<episode>/<file>` itself: a file
 * episode is served from a different route, and which of the two applies is the
 * episode's business, not this module's.
 */
import { decodeSubtitleText } from '../lib/decode.ts'
import { parseSubtitle } from '../lib/parse.ts'
import type { Cue } from '../model/types.ts'

/**
 * Fetch, decode and parse one subtitle file.
 * @param url - where the bytes are, already encoded.
 * @param name - the file name, which decides the parser; `.lrc` is read as text lines.
 */
export async function fetchCues(url: string, name: string): Promise<Cue[]> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  const buffer = await response.arrayBuffer()
  return parseSubtitle(decodeSubtitleText(buffer), name)
}
