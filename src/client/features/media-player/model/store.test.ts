import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SPEED_INDEX, SPEED_PRESETS, useMediaPlayer } from './store.ts'

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

describe("a row's loop button", () => {
  it('loops its sentence, stops on a second press, and keeps playing', () => {
    const store = useMediaPlayer.getState()
    store.toggleSentenceLoop(1)
    expect(useMediaPlayer.getState()).toMatchObject({ loopMode: 'sentence', activeIndex: 1, isPlaying: true })
    useMediaPlayer.getState().toggleSentenceLoop(1)
    expect(useMediaPlayer.getState()).toMatchObject({ loopMode: 'none', activeIndex: 1, isPlaying: true })
  })

  it('moves the loop when another sentence is looping, and ends an A-B loop', () => {
    useMediaPlayer.getState().loopSentence(0)
    useMediaPlayer.getState().toggleSentenceLoop(1)
    expect(useMediaPlayer.getState()).toMatchObject({ loopMode: 'sentence', activeIndex: 1 })
    useMediaPlayer.getState().setLoopMode('ab')
    useMediaPlayer.getState().toggleSentenceLoop(1)
    expect(useMediaPlayer.getState().loopMode).toBe('sentence')
  })
})

describe('the speed button', () => {
  it('sets any preset by index, and clamps an index outside the list', () => {
    useMediaPlayer.getState().setSpeedIndex(1)
    expect(useMediaPlayer.getState().speedIndex).toBe(1)
    useMediaPlayer.getState().setSpeedIndex(SPEED_PRESETS.length + 1)
    expect(useMediaPlayer.getState().speedIndex).toBe(SPEED_PRESETS.length - 1)
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

describe('the shadowing program', () => {
  /** Shadowing on with these settings, sentence one cued and playing. */
  const start = (settings: Parameters<ReturnType<typeof useMediaPlayer.getState>['setShadow']>[0]): void => {
    const store = useMediaPlayer.getState()
    // The speed outlives an episode, and a pause is measured at it.
    store.setSpeedIndex(DEFAULT_SPEED_INDEX)
    store.setShadow({ plays: 1, pause: 'off', advance: false, ...settings })
    store.setPauseAfterSentence(true)
    store.seekCue(0)
    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().setPlaying(true)
  }
  /** The sentence that is playing reaches its end. */
  const end = (): void => {
    const state = useMediaPlayer.getState()
    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().onTime((cues[state.activeIndex]?.end ?? 0) + 0.1)
  }

  afterEach(() => {
    useMediaPlayer.getState().setShadow({ plays: 1, pause: 'off', advance: false })
    useMediaPlayer.getState().setPauseAfterSentence(false)
  })

  it('replays a sentence covered the first time and uncovered the second, then stops', () => {
    start({ plays: 2 })
    expect(useMediaPlayer.getState().revealed).toBe(-1)
    end()
    expect(useMediaPlayer.getState()).toMatchObject({ isPlaying: true, revealed: 0, shadowPlayed: 1, seekRequest: 10 })
    end()
    expect(useMediaPlayer.getState()).toMatchObject({ isPlaying: false, revealed: 0, shadowPlayed: 0, shadowWait: null })
  })

  it('waits out a speaking pause as long as the sentence plus a second, covered, then carries on', () => {
    start({ plays: 2, pause: 'same' })
    end()
    const waiting = useMediaPlayer.getState()
    expect(waiting).toMatchObject({ isPlaying: false, revealed: -1, shadowPlayed: 1 })
    expect(waiting.shadowWait).toMatchObject({ index: 0, phase: 'speak', ms: 3000 })
    useMediaPlayer.getState().endShadowWait()
    expect(useMediaPlayer.getState()).toMatchObject({ isPlaying: true, revealed: 0, shadowPlayed: 1, shadowWait: null })
  })

  it('goes on to the next sentence by itself, covered, after showing a single play for one more pause', () => {
    start({ pause: 'same', advance: true })
    end()
    useMediaPlayer.getState().endShadowWait()
    expect(useMediaPlayer.getState()).toMatchObject({ revealed: 0, isPlaying: false })
    expect(useMediaPlayer.getState().shadowWait?.phase).toBe('look')
    useMediaPlayer.getState().endShadowWait()
    expect(useMediaPlayer.getState()).toMatchObject({ activeIndex: 1, isPlaying: true, shadowPlayed: 0, shadowWait: null })
  })

  it('ends a pause cleanly on play or pause, a step, a seek or a loop, so no stray timeout carries it on', () => {
    for (const interrupt of [
      () => useMediaPlayer.getState().toggle(),
      () => useMediaPlayer.getState().stepCue(1),
      () => useMediaPlayer.getState().seek(15),
      () => useMediaPlayer.getState().loopSentence(0),
      () => useMediaPlayer.getState().setPlaying(false),
    ]) {
      useMediaPlayer.getState().reset(cues)
      start({ plays: 2, pause: 'long' })
      end()
      expect(useMediaPlayer.getState().shadowWait).not.toBeNull()
      interrupt()
      expect(useMediaPlayer.getState()).toMatchObject({ shadowWait: null, shadowPlayed: 0 })
      // A timeout that fires anyway finds nothing to carry on.
      const before = useMediaPlayer.getState().seekToken
      useMediaPlayer.getState().endShadowWait()
      expect(useMediaPlayer.getState().seekToken).toBe(before)
    }
  })

  it('reads as running through a pause, and a press there stops at the sentence start instead of playing', () => {
    start({ pause: 'same' })
    end()
    useMediaPlayer.getState().toggle()
    expect(useMediaPlayer.getState()).toMatchObject({ isPlaying: false, seekRequest: 10 })
    useMediaPlayer.getState().toggle()
    expect(useMediaPlayer.getState()).toMatchObject({ isPlaying: true, revealed: -1 })
  })

  it('stops on the last sentence instead of going on', () => {
    start({ advance: true })
    useMediaPlayer.getState().stepCue(1)
    end()
    expect(useMediaPlayer.getState()).toMatchObject({ activeIndex: 1, isPlaying: false, revealed: 1 })
  })

  it('keeps only the settings it offers', () => {
    useMediaPlayer.getState().setShadow({ plays: 9 as 1, pause: 'forever' as 'off' })
    expect(useMediaPlayer.getState().shadow).toEqual({ plays: 1, pause: 'off', advance: false, record: false })
  })
})

describe('recording and comparing', () => {
  const take = (name: string): { url: string; mime: string; ms: number } => ({ url: `blob:${name}`, mime: 'audio/webm', ms: 2000 })
  /** Shadowing on with a speaking pause and recording, the microphone open, sentence one playing. */
  const start = (settings: Parameters<ReturnType<typeof useMediaPlayer.getState>['setShadow']>[0] = {}): void => {
    const store = useMediaPlayer.getState()
    store.setSpeedIndex(DEFAULT_SPEED_INDEX)
    store.setShadow({ plays: 1, pause: 'same', advance: false, record: true, ...settings })
    store.setPauseAfterSentence(true)
    store.seekCue(0)
    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().captureStarted()
    useMediaPlayer.getState().setPlaying(true)
  }
  /** The sentence that is playing reaches its end. */
  const end = (): void => {
    const state = useMediaPlayer.getState()
    useMediaPlayer.getState().clearGuard()
    useMediaPlayer.getState().onTime((cues[state.activeIndex]?.end ?? 0) + 0.1)
  }
  /** The recorded pause ends, the sentence plays again and reaches its end: the take is next. */
  const toTake = (): void => {
    end()
    useMediaPlayer.getState().endShadowWait()
    end()
  }

  afterEach(() => {
    vi.restoreAllMocks()
    // Every recording started by a test has finished by the time the next one begins.
    useMediaPlayer.setState({ capturing: 0, micNotice: null })
    useMediaPlayer.getState().setShadow({ plays: 1, pause: 'off', advance: false })
    useMediaPlayer.getState().setPauseAfterSentence(false)
  })

  it('plays the sentence once more when a recorded pause ends, then the take, then does what the pause would have', () => {
    start()
    end()
    expect(useMediaPlayer.getState().shadowWait).toMatchObject({ phase: 'speak' })
    useMediaPlayer.getState().endShadowWait()
    expect(useMediaPlayer.getState()).toMatchObject({
      isPlaying: true,
      revealed: 0,
      shadowWait: null,
      shadowPlayed: 1,
      compare: { index: 0, stage: 'original', then: 'program' },
    })
    end()
    // The source waits at the sentence's start while the take plays.
    expect(useMediaPlayer.getState()).toMatchObject({ isPlaying: false, seekRequest: 10, compare: { stage: 'take' }, shadowPlayed: 1 })
    useMediaPlayer.getState().endCompare()
    expect(useMediaPlayer.getState()).toMatchObject({ isPlaying: false, compare: null, shadowPlayed: 0, revealed: 0 })
  })

  it('carries on with the next play, or the look, after the comparison', () => {
    start({ plays: 2 })
    toTake()
    useMediaPlayer.getState().endCompare()
    expect(useMediaPlayer.getState()).toMatchObject({ isPlaying: true, shadowPlayed: 1, compare: null, shadowWait: null })

    useMediaPlayer.getState().reset(cues)
    start({ advance: true })
    toTake()
    useMediaPlayer.getState().endCompare()
    expect(useMediaPlayer.getState().shadowWait).toMatchObject({ phase: 'look', index: 0 })
    useMediaPlayer.getState().endShadowWait()
    expect(useMediaPlayer.getState()).toMatchObject({ activeIndex: 1, isPlaying: true })
  })

  it('goes straight on when no recording is open at the end of the pause, so a failed microphone changes nothing', () => {
    start()
    useMediaPlayer.setState({ capturing: 0 })
    end()
    useMediaPlayer.getState().endShadowWait()
    expect(useMediaPlayer.getState()).toMatchObject({ compare: null, isPlaying: false, revealed: 0 })
  })

  it('does not compare while recording is off, even with a recording still finishing', () => {
    start({ record: false })
    end()
    useMediaPlayer.getState().endShadowWait()
    expect(useMediaPlayer.getState().compare).toBeNull()
  })

  it('ends the comparison cleanly on any move, in either half, so nothing plays on later', () => {
    for (const half of ['original', 'take'] as const) {
      for (const interrupt of [
        () => useMediaPlayer.getState().toggle(),
        () => useMediaPlayer.getState().stepCue(1),
        () => useMediaPlayer.getState().seek(15),
        () => useMediaPlayer.getState().loopSentence(0),
        () => useMediaPlayer.getState().setPlaying(false),
        () => useMediaPlayer.getState().setPauseAfterSentence(false),
      ]) {
        useMediaPlayer.getState().reset(cues)
        start()
        if (half === 'original') {
          end()
          useMediaPlayer.getState().endShadowWait()
        } else {
          toTake()
        }
        expect(useMediaPlayer.getState().compare).toMatchObject({ stage: half })
        interrupt()
        expect(useMediaPlayer.getState()).toMatchObject({ compare: null, shadowWait: null, shadowPlayed: 0 })
        // A take that ends anyway finds nothing to carry on.
        const before = useMediaPlayer.getState().seekToken
        useMediaPlayer.getState().endCompare()
        expect(useMediaPlayer.getState().seekToken).toBe(before)
      }
    }
  })

  it('reads as running through a comparison, and a press stops the sentence where it is', () => {
    start()
    end()
    useMediaPlayer.getState().endShadowWait()
    useMediaPlayer.getState().toggle()
    expect(useMediaPlayer.getState()).toMatchObject({ isPlaying: false, compare: null })
  })

  it('treats the end of the audio during a comparison of the last sentence as the sentence ending, not the episode', () => {
    start()
    useMediaPlayer.getState().stepCue(1)
    useMediaPlayer.getState().clearGuard()
    end()
    useMediaPlayer.getState().endShadowWait()
    expect(useMediaPlayer.getState().compare).toMatchObject({ index: 1, stage: 'original' })
    const counted = useMediaPlayer.getState().finishCount
    useMediaPlayer.getState().markFinished()
    expect(useMediaPlayer.getState()).toMatchObject({ finished: false, finishCount: counted, compare: { index: 1, stage: 'take' } })
  })

  it('does not let a loop take the end of the sentence being compared', () => {
    const { takesEpoch } = useMediaPlayer.getState()
    useMediaPlayer.getState().captureFinished(0, take('a'), takesEpoch)
    useMediaPlayer.getState().seekCue(0)
    useMediaPlayer.getState().loopSentence(0)
    useMediaPlayer.getState().compareTake()
    end()
    expect(useMediaPlayer.getState()).toMatchObject({ isPlaying: false, playsDone: 0, compare: { stage: 'take' } })
  })

  describe('the 对比 key', () => {
    it('does nothing for a sentence with no take', () => {
      useMediaPlayer.getState().seekCue(0)
      const before = useMediaPlayer.getState().seekToken
      useMediaPlayer.getState().compareTake()
      expect(useMediaPlayer.getState()).toMatchObject({ compare: null, isPlaying: false, seekToken: before })
    })

    it('plays the sentence on stage, then the take, then stops where it started', () => {
      useMediaPlayer.getState().seekCue(0)
      useMediaPlayer.getState().captureFinished(0, take('a'), useMediaPlayer.getState().takesEpoch)
      useMediaPlayer.getState().compareTake()
      expect(useMediaPlayer.getState()).toMatchObject({
        isPlaying: true,
        revealed: 0,
        seekRequest: 10,
        compare: { index: 0, stage: 'original', then: 'stop' },
      })
      end()
      expect(useMediaPlayer.getState()).toMatchObject({ isPlaying: false, compare: { stage: 'take' } })
      useMediaPlayer.getState().endCompare()
      expect(useMediaPlayer.getState()).toMatchObject({ isPlaying: false, compare: null, seekRequest: 10, revealed: 0 })
    })

    it('ends a running program, including the pause that is being recorded', () => {
      useMediaPlayer.getState().captureFinished(0, take('a'), useMediaPlayer.getState().takesEpoch)
      start()
      end()
      expect(useMediaPlayer.getState().shadowWait).not.toBeNull()
      useMediaPlayer.getState().compareTake()
      expect(useMediaPlayer.getState()).toMatchObject({ shadowWait: null, shadowPlayed: 0, compare: { then: 'stop' } })
    })

    it('leaves the timing strip alone', () => {
      useMediaPlayer.getState().seekCue(0)
      useMediaPlayer.getState().captureFinished(0, take('a'), useMediaPlayer.getState().takesEpoch)
      useMediaPlayer.getState().setEditWindow({ index: 0, start: 10, end: 12 })
      useMediaPlayer.getState().compareTake()
      expect(useMediaPlayer.getState().compare).toBeNull()
    })
  })

  describe('the takes', () => {
    it('keeps the last take of each sentence and revokes the one it replaces', () => {
      const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
      const { takesEpoch } = useMediaPlayer.getState()
      useMediaPlayer.getState().captureStarted()
      useMediaPlayer.getState().captureFinished(0, take('a'), takesEpoch)
      useMediaPlayer.getState().captureStarted()
      useMediaPlayer.getState().captureFinished(0, take('b'), takesEpoch)
      useMediaPlayer.getState().captureStarted()
      useMediaPlayer.getState().captureFinished(1, take('c'), takesEpoch)
      expect(useMediaPlayer.getState().takes).toEqual({ 0: take('b'), 1: take('c') })
      expect(revoke.mock.calls).toEqual([['blob:a']])
      expect(useMediaPlayer.getState().capturing).toBe(0)
    })

    it('keeps the earlier take when the recording was too short to be one', () => {
      const { takesEpoch } = useMediaPlayer.getState()
      useMediaPlayer.getState().captureFinished(0, take('a'), takesEpoch)
      useMediaPlayer.getState().captureStarted()
      useMediaPlayer.getState().captureFinished(0, null, takesEpoch)
      expect(useMediaPlayer.getState().takes).toEqual({ 0: take('a') })
    })

    it('drops every take, and revokes them, when the cue list changes or the episode closes', () => {
      const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
      const { takesEpoch } = useMediaPlayer.getState()
      useMediaPlayer.getState().captureFinished(0, take('a'), takesEpoch)
      useMediaPlayer.getState().captureFinished(1, take('b'), takesEpoch)
      useMediaPlayer.getState().reset(cues)
      expect(useMediaPlayer.getState().takes).toEqual({})
      expect(revoke.mock.calls.map(([url]) => url).sort()).toEqual(['blob:a', 'blob:b'])

      useMediaPlayer.getState().captureFinished(0, take('c'), useMediaPlayer.getState().takesEpoch)
      useMediaPlayer.getState().dropTakes()
      expect(useMediaPlayer.getState().takes).toEqual({})
      expect(revoke).toHaveBeenLastCalledWith('blob:c')
    })

    it('discards a recording that finishes after the episode it was made for closed', () => {
      const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
      const epoch = useMediaPlayer.getState().takesEpoch
      useMediaPlayer.getState().captureStarted()
      useMediaPlayer.getState().dropTakes()
      useMediaPlayer.getState().captureFinished(0, take('late'), epoch)
      expect(useMediaPlayer.getState().takes).toEqual({})
      expect(revoke).toHaveBeenCalledWith('blob:late')
      expect(useMediaPlayer.getState().capturing).toBe(0)
    })
  })

  describe('the microphone switch', () => {
    it('puts the speaking pause on when it is turned on without one, and keeps the choice', () => {
      useMediaPlayer.getState().setShadow({ plays: 1, pause: 'off', advance: false })
      useMediaPlayer.getState().setRecord(true)
      expect(useMediaPlayer.getState().shadow).toMatchObject({ pause: 'same', record: true })
      useMediaPlayer.getState().setShadow({ pause: 'off' })
      expect(useMediaPlayer.getState().shadow).toMatchObject({ pause: 'off', record: false })
    })

    it('switches itself off and says why when the microphone cannot be used', () => {
      useMediaPlayer.getState().setShadow({ pause: 'same', record: true })
      useMediaPlayer.getState().micFailed('denied')
      expect(useMediaPlayer.getState()).toMatchObject({ micNotice: 'denied', shadow: { record: false, pause: 'same' } })
      useMediaPlayer.getState().clearMicNotice()
      expect(useMediaPlayer.getState().micNotice).toBeNull()
      // A failure that arrives after the reader turned recording off is not worth saying.
      useMediaPlayer.getState().micFailed('unavailable')
      expect(useMediaPlayer.getState().micNotice).toBeNull()
    })

    it('turns off with a message in a browser that cannot record, and the program is untouched', async () => {
      useMediaPlayer.getState().setRecord(true)
      await vi.waitFor(() => expect(useMediaPlayer.getState().micNotice).toBe('unsupported'))
      expect(useMediaPlayer.getState().shadow.record).toBe(false)
    })
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
