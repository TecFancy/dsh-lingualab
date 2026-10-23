// @vitest-environment node
/**
 * The key handler's side of the keymap, rendered to a string: the render hands back the handler, and calling it with a
 * stand-in key event checks the two things the keymap does not decide: that a key the panel handles is stopped (and one
 * it does not is let through), and that the action reaches the handler or the player store it names. What each key
 * means is `keymap.test.ts`'s.
 */
import type { KeyboardEvent as ReactKeyboardEvent, ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Cue } from '../../../entities/cue/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { startReview, type ReviewItem } from '../../../features/review/index.ts'
import { useSettings } from '../../../features/settings/index.ts'
import type { TimingEditor } from '../../../widgets/timing-editor/index.ts'
import { useKeyboard, type Keyboard, type KeyboardOptions } from './useKeyboard.ts'
import type { ReviewRun } from './useReviewRun.ts'

const renderToStaticMarkup = render as (element: ReactElement) => string

const cues: Cue[] = [
  { start: 10, end: 12, text: 'One' },
  { start: 20, end: 22, text: 'Two' },
  { start: 30, end: 32, text: 'Three' },
]

/** What the key handler only asks of its target: what kind of element it is. */
class FakeElement {
  readonly isContentEditable = false
  constructor(readonly tagName: string) {}
}

class FakeInput extends FakeElement {
  readonly type = 'text'
  constructor() {
    super('INPUT')
  }
}

interface Handlers {
  readonly log: string[]
  readonly review: ReviewRun
  readonly timing: { close: ReturnType<typeof vi.fn>; handleKey: ReturnType<typeof vi.fn> }
  readonly closeMenu: ReturnType<typeof vi.fn>
}

function setup(over: Partial<KeyboardOptions> = {}, handlers: { menuOpen?: boolean; timingUsesKey?: boolean } = {}) {
  const log: string[] = []
  const review: ReviewRun = {
    review: null,
    reviewItem: null,
    reviewIndex: -1,
    reviewOn: false,
    reviewDone: false,
    runReview: vi.fn((session) => log.push(`runReview:${String(session.at)}`)),
    reviewEpisode: vi.fn(),
    reviewLibrary: vi.fn(),
    endReview: vi.fn(() => log.push('endReview')),
    answerReview: vi.fn((outcome) => log.push(`answer:${outcome}`)),
  }
  const timing = { session: null, close: vi.fn(() => log.push('timing:close')), handleKey: vi.fn(() => handlers.timingUsesKey ?? true) }
  const closeMenu = vi.fn(() => handlers.menuOpen ?? false)
  const options: KeyboardOptions = {
    view: 'practice',
    layer: 'none',
    setLayer: (layer) => log.push(`layer:${layer}`),
    settingsOpen: false,
    setSettingsOpen: (open) => log.push(`settings:${String(open)}`),
    stepsOpen: false,
    setStepsOpen: (open) => log.push(`steps:${String(open)}`),
    side: {
      toggleKept: () => log.push('side:kept'),
      toggleCollapsed: () => log.push('side:collapse'),
      floating: false,
      collapse: () => log.push('side:close'),
    },
    zhMode: 'dim',
    setZhMode: (mode) => log.push(`zh:${mode}`),
    selection: null,
    setSelection: (selection) => log.push(`selection:${String(selection)}`),
    cues,
    hasVideoFile: false,
    finishOpen: false,
    dismissFinish: () => log.push('dismissFinish'),
    review,
    timing: timing as unknown as TimingEditor,
    openTiming: () => log.push('openTiming'),
    keep: (index) => log.push(`keep:${String(index)}`),
    gradeStage: (grade) => log.push(`grade:${grade}`),
    controlBar: { current: { closeMenu } },
    ...over,
  }
  let keyboard: Keyboard | undefined
  function Probe() {
    keyboard = useKeyboard(options)
    return <span>probe</span>
  }
  renderToStaticMarkup(<Probe />)
  if (keyboard === undefined) throw new Error('the hook did not render')
  return { keyboard, log, review, timing, closeMenu } satisfies Handlers & { keyboard: Keyboard }
}

/** Press a key on the panel; says whether the panel stopped it. */
function press(
  keyboard: Keyboard,
  key: string,
  extra: { ctrlKey?: boolean; target?: unknown } = {},
): boolean {
  const event = {
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    target: null,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...extra,
  }
  keyboard.onKeyDown(event as unknown as ReactKeyboardEvent<HTMLDivElement>)
  expect(event.preventDefault.mock.calls.length).toBe(event.stopPropagation.mock.calls.length)
  return event.preventDefault.mock.calls.length > 0
}

beforeEach(() => {
  vi.stubGlobal('HTMLElement', FakeElement)
  vi.stubGlobal('HTMLInputElement', FakeInput)
  useMediaPlayer.getState().reset(cues)
  // A sentence is on stage: before the first one starts the store has none (-1), and `L` has nothing to loop.
  useMediaPlayer.setState({ activeIndex: 0 })
  useSettings.setState({ picture: 'shown', pictureRestore: null })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useKeyboard: stopping the event', () => {
  it('stops a key the panel handles', () => {
    const { keyboard } = setup()
    expect(press(keyboard, 'n')).toBe(true)
  })

  it('lets a key the panel has no use for go on to the host', () => {
    const { keyboard, log } = setup()
    expect(press(keyboard, 'x')).toBe(false)
    expect(press(keyboard, 'Tab')).toBe(false)
    expect(log).toEqual([])
  })

  it('lets a chord go on to the browser', () => {
    const { keyboard, log } = setup()
    expect(press(keyboard, 's', { ctrlKey: true })).toBe(false)
    expect(log).toEqual([])
  })

  it('lets a keystroke in a text field be typed', () => {
    const { keyboard, log } = setup()
    expect(press(keyboard, 's', { target: new FakeElement('TEXTAREA') })).toBe(false)
    expect(press(keyboard, ' ', { target: new FakeInput() })).toBe(false)
    expect(log).toEqual([])
  })

  it('leaves Space and Enter to a button that has the focus', () => {
    const { keyboard, log } = setup()
    expect(press(keyboard, ' ', { target: new FakeElement('BUTTON') })).toBe(false)
    expect(press(keyboard, 'Enter', { target: new FakeElement('BUTTON') })).toBe(false)
    expect(log).toEqual([])
  })

  it('does not stop a key the picture has no use for, when there is no video', () => {
    const { keyboard } = setup({ hasVideoFile: false })
    expect(press(keyboard, 'v')).toBe(false)
  })
})

describe('useKeyboard: what a key does', () => {
  it('plays and pauses on the space bar', () => {
    const { keyboard } = setup()
    press(keyboard, ' ')
    expect(useMediaPlayer.getState().isPlaying).toBe(true)
  })

  it('steps a sentence on the arrows, and drops the picked row', () => {
    const { keyboard, log } = setup()
    useMediaPlayer.getState().seekCue(0)
    useMediaPlayer.getState().clearGuard()
    press(keyboard, 'ArrowRight')
    expect(log).toEqual(['selection:null'])
    expect(useMediaPlayer.getState().seekRequest).toBe(20)
  })

  it('moves the picked row with the vertical arrows', () => {
    const { keyboard, log } = setup({ selection: 1 })
    press(keyboard, 'ArrowDown')
    press(keyboard, 'ArrowUp')
    expect(log).toEqual(['selection:2', 'selection:0'])
  })

  it('plays the picked row on Enter', () => {
    const { keyboard, log } = setup({ selection: 2 })
    press(keyboard, 'Enter')
    expect(log).toEqual(['selection:null'])
    expect(useMediaPlayer.getState().isPlaying).toBe(true)
    expect(useMediaPlayer.getState().seekRequest).toBe(30)
  })

  it('does not play a row that is not there', () => {
    const { keyboard, log } = setup({ selection: 9 })
    // The key is still the panel's: it is stopped, and nothing happens.
    expect(press(keyboard, 'Enter')).toBe(true)
    expect(log).toEqual([])
    expect(useMediaPlayer.getState().isPlaying).toBe(false)
  })

  it('loops the sentence on L, and ends the loop on the next L', () => {
    const { keyboard } = setup()
    press(keyboard, 'l')
    expect(useMediaPlayer.getState().loopMode).toBe('sentence')
    press(keyboard, 'L')
    expect(useMediaPlayer.getState().loopMode).toBe('none')
  })

  it('keeps the sentence on stage on S, or the picked row', () => {
    const stage = setup()
    press(stage.keyboard, 's')
    const picked = setup({ selection: 2 })
    press(picked.keyboard, 'S')
    expect(stage.log).toEqual(['keep:undefined'])
    expect(picked.log).toEqual(['keep:2'])
  })

  it('switches the right column on N, and collapses or expands it on a backslash', () => {
    const { keyboard, log } = setup()
    expect(press(keyboard, 'n')).toBe(true)
    expect(press(keyboard, 'N')).toBe(true)
    expect(press(keyboard, '\\')).toBe(true)
    expect(log).toEqual(['side:kept', 'side:kept', 'side:collapse'])
  })

  it('cycles the Chinese display on C', () => {
    const { keyboard, log } = setup({ zhMode: 'dim' })
    press(keyboard, 'c')
    expect(log).toHaveLength(1)
    expect(log[0]).toMatch(/^zh:/)
    expect(log[0]).not.toBe('zh:dim')
  })

  it('cycles the picture on V when there is a video', () => {
    const { keyboard } = setup({ hasVideoFile: true })
    expect(press(keyboard, 'v')).toBe(true)
    expect(useSettings.getState().picture).toBe('large')
  })

  it('sets and clears the A-B marks', () => {
    const { keyboard } = setup()
    press(keyboard, 'a')
    expect(useMediaPlayer.getState().pointA).not.toBeNull()
    press(keyboard, 'a')
    expect(useMediaPlayer.getState().pointA).toBeNull()
  })

  it('changes the speed with the bracket keys', () => {
    const { keyboard } = setup()
    const before = useMediaPlayer.getState().speedIndex
    press(keyboard, ']')
    expect(useMediaPlayer.getState().speedIndex).toBe(before + 1)
    press(keyboard, '[')
    expect(useMediaPlayer.getState().speedIndex).toBe(before)
  })

  it('opens the timing strip on T', () => {
    const { keyboard, log } = setup()
    press(keyboard, 't')
    expect(log).toEqual(['openTiming'])
  })

  it('grades the kept sentence on stage with 1, 2 and 3', () => {
    const { keyboard, log } = setup()
    press(keyboard, '1')
    press(keyboard, '2')
    press(keyboard, '3')
    expect(log).toEqual(['grade:got', 'grade:fuzzy', 'grade:notyet'])
  })
})

describe('useKeyboard: Escape', () => {
  it('closes the 「更多」 menu and nothing else when it is open', () => {
    const { keyboard, log, closeMenu } = setup({ settingsOpen: true, stepsOpen: true }, { menuOpen: true })
    expect(press(keyboard, 'Escape')).toBe(true)
    expect(closeMenu).toHaveBeenCalledTimes(1)
    expect(log).toEqual([])
  })

  it('closes one thing per press, topmost first, once the menu is not open', () => {
    const settings = setup({ settingsOpen: true, layer: 'browse', stepsOpen: true })
    press(settings.keyboard, 'Escape')
    expect(settings.log).toEqual(['settings:false'])
    const layer = setup({ layer: 'browse', stepsOpen: true })
    press(layer.keyboard, 'Escape')
    expect(layer.log).toEqual(['layer:none'])
    const steps = setup({ stepsOpen: true })
    press(steps.keyboard, 'Escape')
    expect(steps.log).toEqual(['steps:false'])
  })

  it('clears the A-B marks when nothing is open', () => {
    const { keyboard } = setup()
    useMediaPlayer.getState().setPoint('a')
    press(keyboard, 'Escape')
    expect(useMediaPlayer.getState().pointA).toBeNull()
  })

  it('puts a floating right column away, after the five-steps drawer', () => {
    const log: string[] = []
    const side = {
      toggleKept: () => log.push('side:kept'),
      toggleCollapsed: () => log.push('side:collapse'),
      floating: true,
      collapse: () => log.push('side:close'),
    }
    const floating = setup({ side })
    useMediaPlayer.getState().setPoint('a')
    press(floating.keyboard, 'Escape')
    expect(log).toEqual(['side:close'])
    expect(useMediaPlayer.getState().pointA).not.toBeNull()
    const steps = setup({ side, stepsOpen: true })
    press(steps.keyboard, 'Escape')
    expect(steps.log).toEqual(['steps:false'])
    expect(log).toEqual(['side:close'])
  })

  it('dismisses the finish card', () => {
    const { keyboard, log } = setup({ finishOpen: true })
    press(keyboard, 'Escape')
    expect(log).toEqual(['dismissFinish'])
  })

  it('is not handled on the home when nothing is open', () => {
    const { keyboard, log } = setup({ view: 'home' })
    expect(press(keyboard, 'Escape')).toBe(false)
    expect(log).toEqual([])
  })
})

describe('useKeyboard: the timing strip', () => {
  it('asks the strip for every key while it is open, and stops the key the strip used', () => {
    const open = { session: {}, close: vi.fn(), handleKey: vi.fn(() => true) }
    const { keyboard, log } = setup({ timing: open as unknown as TimingEditor })
    expect(press(keyboard, 'ArrowLeft')).toBe(true)
    expect(open.handleKey).toHaveBeenCalledTimes(1)
    // Nothing else the key could mean happened.
    expect(log).toEqual([])
  })

  it('lets a key the strip did not use go on', () => {
    const open = { session: {}, close: vi.fn(), handleKey: vi.fn(() => false) }
    const { keyboard } = setup({ timing: open as unknown as TimingEditor })
    expect(press(keyboard, 'x')).toBe(false)
    expect(open.handleKey).toHaveBeenCalledTimes(1)
  })

  it('closes the strip on Escape', () => {
    const open = { session: {}, close: vi.fn(), handleKey: vi.fn() }
    const { keyboard } = setup({ timing: open as unknown as TimingEditor })
    press(keyboard, 'Escape')
    expect(open.close).toHaveBeenCalledTimes(1)
    expect(open.handleKey).not.toHaveBeenCalled()
  })
})

describe('useKeyboard: a review', () => {
  const item: ReviewItem = {
    episode: 'E1',
    title: 'One',
    phrase: { at: 10, text: 'One', zh: '', note: '', tags: [], done: false },
  }
  const session = startReview([item, item], 'library')
  const running = (extra: Partial<ReviewRun> = {}): Partial<KeyboardOptions> => ({
    review: {
      review: session,
      reviewItem: item,
      reviewIndex: 0,
      reviewOn: true,
      reviewDone: false,
      runReview: vi.fn(),
      reviewEpisode: vi.fn(),
      reviewLibrary: vi.fn(),
      endReview: vi.fn(),
      answerReview: vi.fn(),
      ...extra,
    },
  })

  it('grades the review item, not the sentence on stage', () => {
    const options = running()
    const { keyboard, log } = setup(options)
    press(keyboard, '1')
    expect(options.review?.answerReview).toHaveBeenCalledWith('got')
    expect(log).toEqual([])
  })

  it('skips on the right arrow and goes back on the left', () => {
    const options = running()
    const { keyboard } = setup(options)
    press(keyboard, 'ArrowRight')
    expect(options.review?.answerReview).toHaveBeenCalledWith('skipped')
    press(keyboard, 'ArrowLeft')
    expect(options.review?.runReview).toHaveBeenCalledTimes(1)
  })

  it('ends the review on Escape', () => {
    const options = running()
    const { keyboard } = setup(options)
    press(keyboard, 'Escape')
    expect(options.review?.endReview).toHaveBeenCalledTimes(1)
  })

  it('leaves the keys alone once the summary card is up', () => {
    const { keyboard } = setup(running({ reviewOn: false, reviewDone: true }))
    expect(press(keyboard, 'ArrowRight')).toBe(false)
    expect(press(keyboard, '1')).toBe(false)
  })
})

describe('useKeyboard: the headset', () => {
  it('steps the sentence as the arrow keys do', () => {
    const { keyboard, log } = setup()
    useMediaPlayer.getState().seekCue(0)
    useMediaPlayer.getState().clearGuard()
    keyboard.headsetSteps.onNext()
    expect(log).toEqual(['selection:null'])
    expect(useMediaPlayer.getState().seekRequest).toBe(20)
  })

  it('skips and goes back through a review', () => {
    const item: ReviewItem = { episode: 'E1', title: 'One', phrase: { at: 10, text: 'One', zh: '', note: '', tags: [], done: false } }
    const answerReview = vi.fn()
    const runReview = vi.fn()
    const review = {
      review: startReview([item, item], 'library'),
      reviewItem: item,
      reviewIndex: 0,
      reviewOn: true,
      reviewDone: false,
      runReview,
      reviewEpisode: vi.fn(),
      reviewLibrary: vi.fn(),
      endReview: vi.fn(),
      answerReview,
    }
    const { keyboard } = setup({ review })
    keyboard.headsetSteps.onNext()
    keyboard.headsetSteps.onPrevious()
    expect(answerReview).toHaveBeenCalledWith('skipped')
    expect(runReview).toHaveBeenCalledTimes(1)
  })

  it('steps the sentence even with a layer, the settings drawer or the timing strip open', () => {
    const open = { session: {}, close: vi.fn(), handleKey: vi.fn() }
    const { keyboard, log } = setup({
      layer: 'browse',
      settingsOpen: true,
      finishOpen: true,
      timing: open as unknown as TimingEditor,
    })
    keyboard.headsetSteps.onNext()
    expect(log).toEqual(['selection:null'])
    expect(open.handleKey).not.toHaveBeenCalled()
  })

  it('leaves a finished review alone', () => {
    const { keyboard, log } = setup({
      review: {
        review: startReview(
          [{ episode: 'E1', title: 'One', phrase: { at: 10, text: 'One', zh: '', note: '', tags: [], done: false } }],
          'library',
        ),
        reviewItem: null,
        reviewIndex: -1,
        reviewOn: false,
        reviewDone: true,
        runReview: vi.fn(),
        reviewEpisode: vi.fn(),
        reviewLibrary: vi.fn(),
        endReview: vi.fn(),
        answerReview: vi.fn(),
      },
    })
    keyboard.headsetSteps.onNext()
    expect(log).toEqual([])
  })
})
