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
 *
 * The bytes are hashed as well. A change to a sentence's timing is written back into this
 * file, and the host refuses it when the file is no longer the one hashed here.
 */
import { sha256Hex } from '../../../shared/lib/sha256.ts'
import { decodeSubtitleText } from '../lib/decode.ts'
import { parseSubtitle } from '../lib/parse.ts'
import type { Cue } from '../model/types.ts'

/** One subtitle file as the page read it. */
export interface LoadedSubtitle {
  readonly cues: Cue[]
  /** SHA-256 of the bytes, lower-case hex. */
  readonly hash: string
}

/**
 * Fetch, decode and parse one subtitle file.
 * @param url - where the bytes are, already encoded.
 * @param name - the file name, which decides the parser; `.lrc` is read as text lines.
 */
export async function fetchSubtitle(url: string, name: string): Promise<LoadedSubtitle> {
  // `no-store`: after a timing edit the same URL is read again, and a cached copy would hand
  // back the old timing together with a hash the host no longer agrees with.
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`${String(response.status)} ${response.statusText}`)
  const buffer = await response.arrayBuffer()
  return { cues: parseSubtitle(decodeSubtitleText(buffer), name), hash: sha256Hex(new Uint8Array(buffer)) }
}
