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

describe('the lead-in', () => {
  // Each test sets its own; the store is a singleton, so it is put back after.
  const withLeadIn = (seconds: number): void => {
    useMediaPlayer.setState({ leadIn: seconds })
  }

  it('starts a jump to a sentence early and keeps that sentence active through the run-up', () => {
    withLeadIn(0.3)
    useMediaPlayer.getState().seekCue(1)
    expect(useMediaPlayer.getState().seekRequest).toBeCloseTo(19.7)
    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().onTime(19.8)
    expect(useMediaPlayer.getState().activeIndex).toBe(1)
    useMediaPlayer.getState().onTime(20.1)
    expect(useMediaPlayer.getState().runUp).toBeNull()
    expect(useMediaPlayer.getState().activeIndex).toBe(1)
    withLeadIn(0)
  })

  it('does not let shadowing stop the previous sentence during the run-up', () => {
    // Back to back: the run-up of the second sentence is the tail of the first.
    useMediaPlayer.getState().reset([
      { start: 10, end: 12, text: 'One' },
      { start: 12, end: 14, text: 'Two' },
    ])
    withLeadIn(0.2)
    const store = useMediaPlayer.getState()
    store.setPauseAfterSentence(true)
    store.seekCue(1)
    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().setPlaying(true)
    useMediaPlayer.getState().onTime(11.85)
    useMediaPlayer.getState().onTime(12.05)
    expect(useMediaPlayer.getState().isPlaying).toBe(true)
    expect(useMediaPlayer.getState().activeIndex).toBe(1)
    useMediaPlayer.getState().setPauseAfterSentence(false)
    withLeadIn(0)
  })

  it('wraps a sentence loop to its lead-in, and an A-B loop to the exact mark', () => {
    withLeadIn(0.5)
    useMediaPlayer.getState().loopSentence(0)
    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().onTime(10.2)
    useMediaPlayer.getState().onTime(12)
    expect(useMediaPlayer.getState().seekRequest).toBeCloseTo(9.5)
    expect(useMediaPlayer.getState().activeIndex).toBe(0)

    useMediaPlayer.setState({ loopMode: 'ab', pointA: 15, pointB: 16, guard: null, runUp: null })
    useMediaPlayer.getState().onTime(16)
    expect(useMediaPlayer.getState().seekRequest).toBe(15)
    withLeadIn(0)
  })

  it('leaves a plain seek alone, and treats a time that is a sentence start as the sentence', () => {
    withLeadIn(0.2)
    useMediaPlayer.getState().seek(20)
    expect(useMediaPlayer.getState().seekRequest).toBe(20)
    useMediaPlayer.getState().seekCueAt(20)
    expect(useMediaPlayer.getState().seekRequest).toBeCloseTo(19.8)
    useMediaPlayer.getState().seekCueAt(21)
    expect(useMediaPlayer.getState().seekRequest).toBe(21)
    withLeadIn(0)
  })

  it('keeps only the lengths it offers', () => {
    useMediaPlayer.getState().setLeadIn(0.3)
    expect(useMediaPlayer.getState().leadIn).toBe(0.3)
    useMediaPlayer.getState().setLeadIn(7)
    expect(useMediaPlayer.getState().leadIn).toBe(0)
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
