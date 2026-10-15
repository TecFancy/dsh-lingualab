import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMediaPlayer } from '../model/store.ts'
import { setTakeAudioFactory, type AudioLike } from './take-player.ts'
import { isRunning, playPresses, togglePlayback } from './transport.ts'

const cues = [
  { start: 10, end: 12, text: 'One' },
  { start: 20, end: 22, text: 'Two' },
]

/** An audio element that counts the plays it was asked for. */
function fakeAudio(): { audio: AudioLike; plays: ReturnType<typeof vi.fn> } {
  const plays = vi.fn(() => Promise.resolve())
  const audio: AudioLike = {
    src: '',
    onended: null,
    onerror: null,
    play: plays,
    pause: () => undefined,
    removeAttribute: () => undefined,
    load: () => undefined,
  }
  return { audio, plays }
}

describe('isRunning', () => {
  const idle = { isPlaying: false, shadowWait: null, compare: null }

  it('is true while the media plays, a speaking pause waits, or a comparison runs', () => {
    expect(isRunning(idle)).toBe(false)
    expect(isRunning({ ...idle, isPlaying: true })).toBe(true)
    expect(isRunning({ ...idle, shadowWait: { index: 0, phase: 'speak', until: 1, ms: 1 } })).toBe(true)
    expect(isRunning({ ...idle, compare: { index: 0, stage: 'original', then: 'stop' } })).toBe(true)
  })
})

describe('playPresses', () => {
  const idle = { isPlaying: false, shadowWait: null, compare: null }

  it('presses the button when nothing runs', () => {
    expect(playPresses(idle)).toBe(true)
  })

  it('presses it during a speaking pause or a take, where the media is paused and the press means stop', () => {
    expect(playPresses({ ...idle, shadowWait: { index: 0, phase: 'speak', until: 1, ms: 1 } })).toBe(true)
    expect(playPresses({ ...idle, compare: { index: 0, stage: 'take', then: 'program' } })).toBe(true)
  })

  it('ignores play while the media really plays', () => {
    expect(playPresses({ ...idle, isPlaying: true })).toBe(false)
    expect(playPresses({ ...idle, isPlaying: true, compare: { index: 0, stage: 'original', then: 'program' } })).toBe(false)
  })
})

describe('togglePlayback', () => {
  let fake: ReturnType<typeof fakeAudio>
  beforeEach(() => {
    fake = fakeAudio()
    setTakeAudioFactory(() => fake.audio)
    useMediaPlayer.getState().reset(cues)
    // The store is a module singleton: start each test with recording off and nothing running.
    useMediaPlayer.setState((state) => ({ shadow: { ...state.shadow, record: false }, isPlaying: false, shadowWait: null, compare: null }))
  })
  afterEach(() => setTakeAudioFactory())

  it('plays and pauses like the store does', () => {
    togglePlayback()
    expect(useMediaPlayer.getState().isPlaying).toBe(true)
    togglePlayback()
    expect(useMediaPlayer.getState().isPlaying).toBe(false)
  })

  it('does not touch the take element while recording is off', () => {
    togglePlayback()
    expect(fake.plays).not.toHaveBeenCalled()
  })

  it('unlocks the take element when recording is on', () => {
    useMediaPlayer.setState((state) => ({ shadow: { ...state.shadow, record: true } }))
    togglePlayback()
    expect(fake.plays).toHaveBeenCalledTimes(1)
    expect(useMediaPlayer.getState().isPlaying).toBe(true)
  })

  it('ends a speaking pause instead of playing on', () => {
    useMediaPlayer.setState({ isPlaying: false, shadowWait: { index: 0, phase: 'speak', until: Date.now() + 5000, ms: 5000 } })
    togglePlayback()
    const after = useMediaPlayer.getState()
    expect(after.shadowWait).toBeNull()
    expect(after.isPlaying).toBe(false)
  })
})
