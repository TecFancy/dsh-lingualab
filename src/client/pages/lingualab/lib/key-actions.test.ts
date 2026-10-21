// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { useSettings } from '../../../features/settings/index.ts'
import { performKey, type KeyEffects } from './key-actions.ts'
import type { KeyAction } from './keymap.ts'

const cues = [
  { start: 10, end: 12, text: 'One' },
  { start: 20, end: 22, text: 'Two' },
  { start: 30, end: 32, text: 'Three' },
]

/** Effects that write down what was asked of them. */
function effects(): { fx: KeyEffects; log: string[] } {
  const log: string[] = []
  const fx: KeyEffects = {
    closeSettings: () => log.push('closeSettings'),
    closeTiming: () => log.push('closeTiming'),
    endReview: () => log.push('endReview'),
    dismissFinish: () => log.push('dismissFinish'),
    closeLayer: () => log.push('closeLayer'),
    closeSteps: () => log.push('closeSteps'),
    answerReview: (outcome) => log.push(`answerReview:${outcome}`),
    reviewBack: () => log.push('reviewBack'),
    gradeStage: (grade) => log.push(`gradeStage:${grade}`),
    select: (index) => log.push(`select:${String(index)}`),
    hasCue: (index) => cues[index] !== undefined,
    keep: (index) => log.push(`keep:${String(index)}`),
    toggleColumn: () => log.push('toggleColumn'),
    toggleSide: () => log.push('toggleSide'),
    cycleZh: () => log.push('cycleZh'),
    retime: () => log.push('retime'),
  }
  return { fx, log }
}

/** Do one action and say what it asked of the page. */
function run(action: KeyAction): string[] {
  const { fx, log } = effects()
  performKey(action, fx)
  return log
}

/** The one element the take plays on; a browser makes it, the tests have none. */
class FakeAudio {
  src = ''
  play(): Promise<void> {
    return Promise.resolve()
  }
  pause(): void {}
}

beforeEach(() => {
  vi.stubGlobal('Audio', FakeAudio)
  useMediaPlayer.getState().reset(cues)
  useMediaPlayer.setState({ activeIndex: 0 })
  useSettings.setState({ picture: 'shown', pictureRestore: null })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('performKey: what the page is asked to do', () => {
  it('forwards each of the page\'s own actions to its handler', () => {
    expect(run({ type: 'close-settings' })).toEqual(['closeSettings'])
    expect(run({ type: 'close-timing' })).toEqual(['closeTiming'])
    expect(run({ type: 'end-review' })).toEqual(['endReview'])
    expect(run({ type: 'dismiss-finish' })).toEqual(['dismissFinish'])
    expect(run({ type: 'close-layer' })).toEqual(['closeLayer'])
    expect(run({ type: 'close-steps' })).toEqual(['closeSteps'])
    expect(run({ type: 'review-back' })).toEqual(['reviewBack'])
    expect(run({ type: 'toggle-column' })).toEqual(['toggleColumn'])
    expect(run({ type: 'toggle-side' })).toEqual(['toggleSide'])
    expect(run({ type: 'cycle-zh' })).toEqual(['cycleZh'])
    expect(run({ type: 'retime' })).toEqual(['retime'])
  })

  it('answers the review with the grade, or a skip', () => {
    expect(run({ type: 'review-grade', grade: 'fuzzy' })).toEqual(['answerReview:fuzzy'])
    expect(run({ type: 'review-skip' })).toEqual(['answerReview:skipped'])
  })

  it('grades the sentence on stage', () => {
    expect(run({ type: 'stage-grade', grade: 'notyet' })).toEqual(['gradeStage:notyet'])
  })

  it('picks a row', () => {
    expect(run({ type: 'select', index: 2 })).toEqual(['select:2'])
  })

  it('keeps the picked row, or the sentence on stage when none is picked', () => {
    expect(run({ type: 'keep', index: 1 })).toEqual(['keep:1'])
    expect(run({ type: 'keep', index: null })).toEqual(['keep:undefined'])
  })

  it('does nothing for the actions the key handler answers itself', () => {
    expect(run({ type: 'close-menu', otherwise: null })).toEqual([])
    expect(run({ type: 'timing-key' })).toEqual([])
  })
})

describe('performKey: what the player is asked to do', () => {
  it('plays and pauses', () => {
    run({ type: 'toggle-play' })
    expect(useMediaPlayer.getState().isPlaying).toBe(true)
    run({ type: 'toggle-play' })
    expect(useMediaPlayer.getState().isPlaying).toBe(false)
  })

  it('steps a sentence and drops the picked row', () => {
    useMediaPlayer.getState().seekCue(0)
    useMediaPlayer.getState().clearGuard()
    expect(run({ type: 'step', delta: 1 })).toEqual(['select:null'])
    expect(useMediaPlayer.getState().seekRequest).toBe(20)
  })

  it('plays the sentence at an index, and drops the picked row', () => {
    expect(run({ type: 'play-index', index: 2 })).toEqual(['select:null'])
    expect(useMediaPlayer.getState().isPlaying).toBe(true)
    expect(useMediaPlayer.getState().seekRequest).toBe(30)
  })

  it('plays nothing at an index with no sentence, and keeps the picked row', () => {
    expect(run({ type: 'play-index', index: 9 })).toEqual([])
    expect(useMediaPlayer.getState().isPlaying).toBe(false)
  })

  it('loops a sentence, then ends the loop', () => {
    run({ type: 'toggle-loop', index: 1 })
    expect(useMediaPlayer.getState().loopMode).toBe('sentence')
    expect(useMediaPlayer.getState().activeIndex).toBe(1)
    run({ type: 'toggle-loop', index: 1 })
    expect(useMediaPlayer.getState().loopMode).toBe('none')
  })

  it('reveals the sentence on stage', () => {
    useMediaPlayer.setState({ activeIndex: 1 })
    run({ type: 'reveal' })
    expect(useMediaPlayer.getState().revealed).toBe(1)
  })

  it('sets A where the playhead is, B after it, and clears both on the next A', () => {
    useMediaPlayer.setState({ currentTime: 12 })
    run({ type: 'mark-a' })
    expect(useMediaPlayer.getState().pointA).toBe(12)
    useMediaPlayer.setState({ currentTime: 18 })
    run({ type: 'mark-b' })
    expect(useMediaPlayer.getState().pointB).toBe(18)
    run({ type: 'mark-a' })
    expect(useMediaPlayer.getState().pointA).toBeNull()
    expect(useMediaPlayer.getState().pointB).toBeNull()
    expect(useMediaPlayer.getState().loopMode).toBe('none')
  })

  it('clears the A-B marks', () => {
    useMediaPlayer.setState({ currentTime: 12 })
    run({ type: 'mark-a' })
    run({ type: 'clear-ab' })
    expect(useMediaPlayer.getState().pointA).toBeNull()
  })

  it('moves the speed one step', () => {
    const before = useMediaPlayer.getState().speedIndex
    run({ type: 'speed', delta: 1 })
    expect(useMediaPlayer.getState().speedIndex).toBe(before + 1)
    run({ type: 'speed', delta: -1 })
    expect(useMediaPlayer.getState().speedIndex).toBe(before)
  })

  it('has nothing to compare without a take, and does not fail', () => {
    run({ type: 'compare-take' })
    expect(useMediaPlayer.getState().compare).toBeNull()
  })
})

describe('performKey: the picture', () => {
  it('cycles shown, large, hidden', () => {
    run({ type: 'cycle-picture' })
    expect(useSettings.getState().picture).toBe('large')
    run({ type: 'cycle-picture' })
    expect(useSettings.getState().picture).toBe('hidden')
    run({ type: 'cycle-picture' })
    expect(useSettings.getState().picture).toBe('shown')
  })
})
