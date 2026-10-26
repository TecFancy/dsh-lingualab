import { describe, expect, it, vi, type Mock } from 'vitest'
import {
  openSession,
  sessionMetadata,
  type MediaSessionEnv,
  type MediaSessionLike,
  type SessionHandlers,
  type SessionPlaybackState,
  type SessionText,
} from './media-session.ts'

/** A session that remembers the handler of each action, and throws for the actions it was told to refuse. */
class FakeSession implements MediaSessionLike {
  metadata: unknown = null
  playbackState: SessionPlaybackState = 'none'
  readonly handlers = new Map<string, (() => void) | null>()
  /** Every `setActionHandler` call, in order. */
  readonly calls: [string, boolean][] = []
  constructor(private readonly refuse: readonly string[] = []) {}
  setActionHandler(action: string, handler: (() => void) | null): void {
    this.calls.push([action, handler !== null])
    if (this.refuse.includes(action)) throw new TypeError(`The provided value '${action}' is not a valid enum value`)
    this.handlers.set(action, handler)
  }
}

function handlers(): Record<keyof SessionHandlers, Mock<() => void>> {
  return { play: vi.fn<() => void>(), pause: vi.fn<() => void>(), previous: vi.fn<() => void>(), next: vi.fn<() => void>() }
}

const envOf = (session: FakeSession): MediaSessionEnv => ({
  session,
  makeMetadata: (metadata) => ({ made: metadata }),
})

describe('openSession', () => {
  it('registers the repeater keys and runs the caller handlers', () => {
    const session = new FakeSession()
    const mine = handlers()
    openSession(mine, envOf(session))

    session.handlers.get('play')?.()
    session.handlers.get('pause')?.()
    session.handlers.get('previoustrack')?.()
    session.handlers.get('nexttrack')?.()
    expect(mine.play).toHaveBeenCalledTimes(1)
    expect(mine.pause).toHaveBeenCalledTimes(1)
    expect(mine.previous).toHaveBeenCalledTimes(1)
    expect(mine.next).toHaveBeenCalledTimes(1)
  })

  it('maps stop to pause', () => {
    const session = new FakeSession()
    const mine = handlers()
    openSession(mine, envOf(session))

    session.handlers.get('stop')?.()
    expect(mine.pause).toHaveBeenCalledTimes(1)
    expect(mine.play).not.toHaveBeenCalled()
  })

  it('sets the seek handlers to null and never registers seekto', () => {
    const session = new FakeSession()
    openSession(handlers(), envOf(session))

    expect(session.handlers.get('seekbackward')).toBeNull()
    expect(session.handlers.get('seekforward')).toBeNull()
    expect(session.calls.some(([action]) => action === 'seekto')).toBe(false)
    expect(session.calls).toContainEqual(['seekbackward', false])
    expect(session.calls).toContainEqual(['seekforward', false])
  })

  it('names what is playing, and clears it with null', () => {
    const session = new FakeSession()
    const control = openSession(handlers(), envOf(session))

    control.setMetadata({ title: 'Sentence 2 of 8', artist: 'S01E01', album: 'LinguaLab' })
    expect(session.metadata).toEqual({ made: { title: 'Sentence 2 of 8', artist: 'S01E01', album: 'LinguaLab' } })
    control.setMetadata(null)
    expect(session.metadata).toBeNull()
  })

  it('reports the playback state, and says nothing when it has not changed', () => {
    const states: SessionPlaybackState[] = []
    const session = new FakeSession()
    Object.defineProperty(session, 'playbackState', {
      get: () => states.at(-1) ?? 'none',
      set: (value: SessionPlaybackState) => {
        states.push(value)
      },
    })
    const control = openSession(handlers(), envOf(session))

    control.setPlaying(true)
    control.setPlaying(true)
    control.setPlaying(false)
    control.setPlaying(false)
    control.setPlaying(true)
    expect(states).toEqual(['playing', 'paused', 'playing'])
  })

  it('clears the handlers, the metadata and the state on release, and can be released twice', () => {
    const session = new FakeSession()
    const control = openSession(handlers(), envOf(session))
    control.setMetadata({ title: 'a', artist: 'b', album: 'c' })
    control.setPlaying(true)

    control.release()
    for (const action of ['play', 'pause', 'stop', 'previoustrack', 'nexttrack', 'seekbackward', 'seekforward']) {
      expect(session.handlers.get(action)).toBeNull()
    }
    expect(session.metadata).toBeNull()
    expect(session.playbackState).toBe('none')
    expect(() => control.release()).not.toThrow()
    expect(session.playbackState).toBe('none')
  })

  it('swallows an action the browser refuses and still registers the others', () => {
    const session = new FakeSession(['stop', 'seekbackward'])
    const mine = handlers()
    expect(() => openSession(mine, envOf(session))).not.toThrow()

    session.handlers.get('nexttrack')?.()
    expect(mine.next).toHaveBeenCalledTimes(1)
    expect(session.handlers.has('stop')).toBe(false)
    expect(session.handlers.get('seekforward')).toBeNull()
  })

  it('swallows a session that throws on everything, release included', () => {
    const session = new FakeSession(['play', 'pause', 'stop', 'previoustrack', 'nexttrack', 'seekbackward', 'seekforward'])
    Object.defineProperty(session, 'metadata', {
      get: () => null,
      set: () => {
        throw new Error('no')
      },
    })
    Object.defineProperty(session, 'playbackState', {
      get: () => 'none',
      set: () => {
        throw new Error('no')
      },
    })
    const control = openSession(handlers(), envOf(session))
    expect(() => {
      control.setMetadata({ title: 'a', artist: 'b', album: 'c' })
      control.setPlaying(true)
      control.release()
    }).not.toThrow()
  })

  it('does nothing in a browser with no Media Session', () => {
    const control = openSession(handlers(), {})
    expect(() => {
      control.setMetadata({ title: 'a', artist: 'b', album: 'c' })
      control.setPlaying(true)
      control.release()
    }).not.toThrow()
  })

  it('skips the metadata where the browser has no MediaMetadata', () => {
    const session = new FakeSession()
    const control = openSession(handlers(), { session })
    control.setMetadata({ title: 'a', artist: 'b', album: 'c' })
    expect(session.metadata).toBeNull()
  })
})

describe('sessionMetadata', () => {
  const text = (over: Partial<SessionText> = {}): SessionText => ({
    index: 11,
    total: 80,
    episode: 'S01E02 Pilot',
    segment: null,
    album: 'LinguaLab',
    sentence: (n, total) => `Sentence ${String(n)} of ${String(total)}`,
    ...over,
  })

  it('titles the sentence by its 1-based place, and names the episode and the plugin', () => {
    expect(sessionMetadata(text())).toEqual({ title: 'Sentence 12 of 80', artist: 'S01E02 Pilot', album: 'LinguaLab' })
  })

  it('adds the open segment to the artist', () => {
    expect(sessionMetadata(text({ segment: '03 · The party' })).artist).toBe('S01E02 Pilot · 03 · The party')
  })

  it('follows the active sentence', () => {
    expect(sessionMetadata(text({ index: 0 })).title).toBe('Sentence 1 of 80')
    expect(sessionMetadata(text({ index: 79 })).title).toBe('Sentence 80 of 80')
  })

  it('puts the episode in the title when no sentence is active', () => {
    for (const index of [-1, 80, 200]) {
      expect(sessionMetadata(text({ index }))).toEqual({ title: 'S01E02 Pilot', artist: '', album: 'LinguaLab' })
    }
    expect(sessionMetadata(text({ index: 3, total: 0, segment: 'Part 2' }))).toEqual({
      title: 'S01E02 Pilot',
      artist: 'Part 2',
      album: 'LinguaLab',
    })
  })

  it('falls back to the plugin name for an episode with no name, and leaves out the empty artist part', () => {
    expect(sessionMetadata(text({ index: -1, episode: '' })).title).toBe('LinguaLab')
    expect(sessionMetadata(text({ episode: '', segment: 'Part 2' })).artist).toBe('Part 2')
  })
})
