import { beforeEach, describe, expect, it } from 'vitest'
import { useMediaPlayer } from './store.ts'

const cues = [
  { start: 10, end: 12, text: 'One' },
  { start: 20, end: 22, text: 'Two' },
]

/** The store is a module singleton, so every test starts from a loaded episode. */
beforeEach(() => {
  useMediaPlayer.getState().reset(cues)
})

describe('the seek gate', () => {
  it('drops reported positions until the seek is confirmed', () => {
    const store = useMediaPlayer.getState()
    store.seek(20)
    // A stale position from before the seek must not move anything.
    store.onTime(12)
    expect(useMediaPlayer.getState().currentTime).toBe(20)
    expect(useMediaPlayer.getState().guard).not.toBeNull()

    useMediaPlayer.getState().clearGuard()
    store.onTime(20.4)
    expect(useMediaPlayer.getState().currentTime).toBe(20.4)
  })
})

describe('a finished repeat count', () => {
  it('stops and rewinds to the start of the window', () => {
    const store = useMediaPlayer.getState()
    store.reset(cues)
    store.loopSentence(0)
    store.setRepeats(1)
    store.seek(12)

    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().onTime(12)

    const after = useMediaPlayer.getState()
    expect(after.isPlaying).toBe(false)
    expect(after.playsDone).toBe(1)
    // Rewound, so pressing play again replays the sentence instead of stopping again.
    expect(after.seekRequest).toBe(10)
  })

  it('keeps looping when the count is endless', () => {
    const store = useMediaPlayer.getState()
    store.loopSentence(0)
    store.seek(12)
    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().onTime(12)

    const after = useMediaPlayer.getState()
    expect(after.isPlaying).toBe(true)
    expect(after.seekRequest).toBe(10)
  })
})
