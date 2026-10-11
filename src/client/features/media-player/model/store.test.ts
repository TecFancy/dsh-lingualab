import { beforeEach, describe, expect, it } from 'vitest'
import { SPEED_PRESETS, useMediaPlayer } from './store.ts'

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

describe('the speed button', () => {
  it('wraps from the fastest preset back to the slowest instead of sticking', () => {
    const last = SPEED_PRESETS.length - 1
    useMediaPlayer.getState().setSpeedIndex(last)
    useMediaPlayer.getState().nextSpeedWrapping()
    expect(useMediaPlayer.getState().speedIndex).toBe(0)
    useMediaPlayer.getState().nextSpeedWrapping()
    expect(useMediaPlayer.getState().speedIndex).toBe(1)
  })

  it('keeps the keyboard step clamped at both ends', () => {
    useMediaPlayer.getState().setSpeedIndex(SPEED_PRESETS.length - 1)
    useMediaPlayer.getState().cycleSpeed(1)
    expect(useMediaPlayer.getState().speedIndex).toBe(SPEED_PRESETS.length - 1)
  })
})

describe('shadow mode', () => {
  it('pauses at the end of the sentence and rewinds to its start', () => {
    const store = useMediaPlayer.getState()
    store.setPauseAfterSentence(true)
    store.seek(10)
    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().setPlaying(true)
    useMediaPlayer.getState().onTime(11)
    expect(useMediaPlayer.getState().isPlaying).toBe(true)

    useMediaPlayer.getState().onTime(12.1)
    const after = useMediaPlayer.getState()
    expect(after.isPlaying).toBe(false)
    expect(after.seekRequest).toBe(10)
  })

  it('does not stop for a sentence the reader seeked past', () => {
    const store = useMediaPlayer.getState()
    store.setPauseAfterSentence(true)
    store.seek(16)
    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().setPlaying(true)
    useMediaPlayer.getState().onTime(16.2)
    expect(useMediaPlayer.getState().isPlaying).toBe(true)
  })

  it('leaves an active loop in charge of the end', () => {
    const store = useMediaPlayer.getState()
    store.setPauseAfterSentence(true)
    store.loopSentence(0)
    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().onTime(12.1)
    expect(useMediaPlayer.getState().isPlaying).toBe(true)
  })
})

describe('the end of the audio', () => {
  it('is remembered until something plays or moves again', () => {
    useMediaPlayer.getState().markFinished()
    expect(useMediaPlayer.getState().finished).toBe(true)
    expect(useMediaPlayer.getState().isPlaying).toBe(false)
    useMediaPlayer.getState().seek(10)
    expect(useMediaPlayer.getState().finished).toBe(false)
  })
})

describe('shadow reveal', () => {
  it('uncovers the sentence that just ended, and only that one', () => {
    const store = useMediaPlayer.getState()
    store.setPauseAfterSentence(true)
    store.seek(10)
    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().setPlaying(true)
    useMediaPlayer.getState().onTime(12.1)
    expect(useMediaPlayer.getState().revealed).toBe(0)
    useMediaPlayer.getState().stepCue(1)
    expect(useMediaPlayer.getState().activeIndex).toBe(1)
    expect(useMediaPlayer.getState().revealed).toBe(0)
  })
})

describe('the audio length', () => {
  it('survives the subtitles loading after the metadata', () => {
    useMediaPlayer.getState().setDuration(40)
    useMediaPlayer.getState().reset(cues)
    expect(useMediaPlayer.getState().duration).toBe(40)
  })
})

describe('retiming a sentence', () => {
  it('keeps the edited sentence active and wraps at the draft end', () => {
    const store = useMediaPlayer.getState()
    store.setEditWindow({ index: 1, start: 20.5, end: 21.5 })
    store.setPlaying(true)
    // The start moved past the playhead: the sentence is still the one being edited.
    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().onTime(20.2)
    expect(useMediaPlayer.getState().activeIndex).toBe(1)

    useMediaPlayer.getState().onTime(21.5)
    expect(useMediaPlayer.getState().seekRequest).toBe(20.5)
    expect(useMediaPlayer.getState().activeIndex).toBe(1)
  })

  it('lets go of the sentence when the window is cleared, and on a new episode', () => {
    useMediaPlayer.getState().setEditWindow({ index: 0, start: 10, end: 12 })
    useMediaPlayer.getState().setEditWindow(null)
    expect(useMediaPlayer.getState().editWindow).toBeNull()
    useMediaPlayer.getState().setEditWindow({ index: 0, start: 10, end: 12 })
    useMediaPlayer.getState().reset(cues)
    expect(useMediaPlayer.getState().editWindow).toBeNull()
  })
})
