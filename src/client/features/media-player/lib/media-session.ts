/**
 * The Media Session: a headset's buttons and the lock screen as the repeater's physical keys.
 *
 * Everything that touches `navigator.mediaSession` is here, behind a small environment object, so what is registered, what
 * is left out and what a refusal does are tested with a fake session. Nothing in this file knows about the store or the
 * sentences; the hook that wires it is `useMediaSession.ts`, and what a button does is the caller's.
 *
 * Which actions are registered is a decision, not a list of everything the API offers:
 *
 * - `play`, `pause` and `stop` (mapped to pause), `previoustrack` and `nexttrack` are the repeater's keys.
 * - `seekbackward` and `seekforward` are set to `null` and `seekto` is never registered. On iOS a seek handler makes the
 *   lock screen and AirPods offer and send skip-by-N-seconds in place of previous and next track, which would cost the
 *   sentence steps; and replaying the sentence is already what play does after shadowing has stopped at its start.
 *
 * It is not a keyboard listener, so the rule that the panel never takes the host's keys is untouched. Without handlers
 * the browser would play or pause the media element behind the store's back, which is worse than any button here.
 */

/** What the lock screen shows about what is playing. */
export interface SessionMetadata {
  readonly title: string
  readonly artist: string
  readonly album: string
}

/** The session's playback state; `none` is what it is when nothing is registered. */
export type SessionPlaybackState = 'none' | 'paused' | 'playing'

/** What a button does, as the caller defines it. */
export interface SessionHandlers {
  readonly play: () => void
  /** Also what `stop` does. */
  readonly pause: () => void
  readonly previous: () => void
  readonly next: () => void
}

/** The few parts of `navigator.mediaSession` this file needs. */
export interface MediaSessionLike {
  metadata: unknown
  playbackState: SessionPlaybackState
  setActionHandler(action: string, handler: (() => void) | null): void
}

/** The browser pieces the session needs. Without a session this browser has no hardware buttons to take. */
export interface MediaSessionEnv {
  readonly session?: MediaSessionLike
  /** Make a `MediaMetadata`. Missing where that class is. */
  readonly makeMetadata?: (metadata: SessionMetadata) => unknown
}

/** An open session: tell it what is playing, and let it go. */
export interface SessionControl {
  /** What the lock screen names, or `null` for nothing. */
  readonly setMetadata: (metadata: SessionMetadata | null) => void
  /** Whether the program is running. The same value twice in a row is not sent twice. */
  readonly setPlaying: (playing: boolean) => void
  /** Clear the handlers, the metadata and the state. Safe to call again. */
  readonly release: () => void
}

/** The seek actions: given no handler on purpose, and cleared in case anything else registered one (see the file's header). */
const SEEK_ACTIONS: readonly string[] = ['seekbackward', 'seekforward']

/** The session the current page has. */
export function browserSessionEnv(): MediaSessionEnv {
  const session = typeof navigator === 'undefined' ? undefined : (navigator.mediaSession as MediaSession | undefined)
  return {
    session: session as unknown as MediaSessionLike | undefined,
    makeMetadata:
      typeof MediaMetadata === 'undefined'
        ? undefined
        : (metadata) => new MediaMetadata({ title: metadata.title, artist: metadata.artist, album: metadata.album }),
  }
}

/** Run one call into the browser. An action it does not support throws, and one missing button is no reason to lose the rest. */
function attempt(call: () => void): void {
  try {
    call()
  } catch {
    // Unsupported action, or a browser that refuses: the buttons that did register still work.
  }
}

/**
 * Take the headset's and the lock screen's buttons.
 *
 * @param handlers What the buttons do.
 * @param env The browser's session; the page's own when left out.
 * @returns The open session. A browser with no Media Session gets one that does nothing.
 */
export function openSession(handlers: SessionHandlers, env: MediaSessionEnv = browserSessionEnv()): SessionControl {
  const { session, makeMetadata } = env
  if (session === undefined) return { setMetadata: () => undefined, setPlaying: () => undefined, release: () => undefined }

  const register = (action: string, handler: (() => void) | null): void => attempt(() => session.setActionHandler(action, handler))
  register('play', handlers.play)
  register('pause', handlers.pause)
  register('stop', handlers.pause)
  register('previoustrack', handlers.previous)
  register('nexttrack', handlers.next)
  for (const action of SEEK_ACTIONS) register(action, null)

  let last: SessionPlaybackState | null = null
  const setState = (state: SessionPlaybackState): void => {
    if (state === last) return
    last = state
    attempt(() => {
      session.playbackState = state
    })
  }

  return {
    setMetadata: (metadata) => {
      if (metadata === null) {
        attempt(() => {
          session.metadata = null
        })
        return
      }
      if (makeMetadata === undefined) return
      attempt(() => {
        session.metadata = makeMetadata(metadata)
      })
    },
    setPlaying: (playing) => setState(playing ? 'playing' : 'paused'),
    release: () => {
      for (const action of ['play', 'pause', 'stop', 'previoustrack', 'nexttrack', ...SEEK_ACTIONS]) register(action, null)
      attempt(() => {
        session.metadata = null
      })
      setState('none')
    },
  }
}

/** What {@link sessionMetadata} reads. */
export interface SessionText {
  /** The active sentence, counted from 0, or a negative number when none is. */
  readonly index: number
  /** How many sentences there are. */
  readonly total: number
  /** The episode's name. */
  readonly episode: string
  /** The open segment's name, for an episode that has segments. */
  readonly segment: string | null
  /** The plugin's display name. */
  readonly album: string
  /** The words for a sentence's place, from its 1-based position and the total ("Sentence 12 of 80"). */
  readonly sentence: (position: number, total: number) => string
}

/**
 * What the lock screen says: the sentence's place as the title, the episode (and its open segment) as the artist, the
 * plugin as the album. Before any sentence is active (no subtitles, or the playhead is ahead of the first one) the
 * episode takes the title's place, because "sentence 0 of 80" would be a lie.
 */
export function sessionMetadata(text: SessionText): SessionMetadata {
  const parts = [text.episode, text.segment ?? ''].filter((part) => part !== '')
  const where = parts.join(' · ')
  if (text.index < 0 || text.index >= text.total) {
    return { title: text.episode === '' ? text.album : text.episode, artist: text.segment ?? '', album: text.album }
  }
  return { title: text.sentence(text.index + 1, text.total), artist: where, album: text.album }
}
