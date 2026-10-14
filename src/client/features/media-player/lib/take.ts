/**
 * The takes a reader has recorded, as the player keeps them.
 *
 * A take is the reader's own voice saying one sentence, kept as an object URL so a short-lived `Audio` element can
 * play it. It lives in memory for the open episode (or segment) and nowhere else: not on disk, not on the host,
 * not scored. Whatever replaces or drops a take must revoke its URL, which is why these helpers say what went stale
 * instead of leaving each caller to remember.
 */

/** One recording of one sentence. */
export interface Take {
  /** An object URL of the recorded audio. */
  readonly url: string
  /** What the recorder produced (`audio/webm` in Chrome, `audio/mp4` in Safari). */
  readonly mime: string
  /** How long it is, in milliseconds. */
  readonly ms: number
}

/** The last take of each sentence, by the sentence's index in the cue list. */
export type Takes = Readonly<Record<number, Take>>

/** No takes. One shared value, so dropping nothing does not look like a change. */
export const NO_TAKES: Takes = Object.freeze({})

/** Why the microphone could not be used, or why a take could not be played. */
export type MicNotice = 'unsupported' | 'denied' | 'unavailable' | 'blocked'

/** Keep a sentence's newest take, and say which one it replaced. */
export function putTake(takes: Takes, index: number, take: Take): { readonly takes: Takes; readonly stale: readonly Take[] } {
  const replaced = takes[index]
  return { takes: { ...takes, [index]: take }, stale: replaced === undefined ? [] : [replaced] }
}

/** Every take that is kept, which is what closing the episode must let go of. */
export function allTakes(takes: Takes): readonly Take[] {
  return Object.values(takes)
}

/** Let go of a take's object URL. */
export function revokeTake(take: Take): void {
  try {
    URL.revokeObjectURL(take.url)
  } catch {
    // A URL that cannot be revoked is already gone.
  }
}
