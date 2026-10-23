// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { flashOf, headsetAction, keyAction, type KeyAction, type KeyContext, type KeyPress } from './keymap.ts'

/** A practice view with nothing open and the playhead on the third of ten sentences. */
const PRACTICE: KeyContext = {
  view: 'practice',
  settingsOpen: false,
  timingOpen: false,
  reviewing: false,
  reviewFinished: false,
  finishOpen: false,
  layerOpen: false,
  stepsOpen: false,
  sideFloating: false,
  hasVideo: true,
  selection: null,
  activeIndex: 2,
  cueCount: 10,
}

const press = (key: string, extra: Partial<KeyPress> = {}): KeyPress => ({
  key,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  typing: false,
  ownsKey: false,
  ...extra,
})

const act = (key: string, context: Partial<KeyContext> = {}, extra: Partial<KeyPress> = {}): KeyAction | null =>
  keyAction(press(key, extra), { ...PRACTICE, ...context })

describe('keyAction: keys that are not the panel', () => {
  it('leaves a keystroke in a text field alone, Escape included', () => {
    expect(act('s', {}, { typing: true })).toBeNull()
    expect(act(' ', {}, { typing: true })).toBeNull()
    expect(act('Escape', {}, { typing: true })).toBeNull()
  })

  it('leaves a chord to the browser and the host', () => {
    for (const chord of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
      expect(act('s', {}, chord)).toBeNull()
      expect(act('c', {}, chord)).toBeNull()
      expect(act('Escape', {}, chord)).toBeNull()
    }
  })

  it('does not count Shift as a chord, because the bracket keys can need it', () => {
    // The press has no shift field at all: it never reaches the decision.
    expect(act('[')).toEqual({ type: 'speed', delta: -1 })
  })

  it('leaves Space and Enter to a button that has the focus', () => {
    expect(act(' ', {}, { ownsKey: true })).toBeNull()
    expect(act('Enter', {}, { ownsKey: true })).toBeNull()
  })

  it('answers null for a key it has no meaning for', () => {
    for (const key of ['x', 'q', 'F5', 'Tab', 'Shift', 'Backspace', '0', '4', '9', 'Home']) {
      expect(act(key)).toBeNull()
    }
  })
})

describe('keyAction: the keys of the practice view', () => {
  it('plays and pauses on the space bar', () => {
    expect(act(' ')).toEqual({ type: 'toggle-play' })
  })

  it('steps a sentence on the horizontal arrows', () => {
    expect(act('ArrowLeft')).toEqual({ type: 'step', delta: -1 })
    expect(act('ArrowRight')).toEqual({ type: 'step', delta: 1 })
  })

  it('moves the picked row on the vertical arrows, from the playing sentence when none is picked', () => {
    expect(act('ArrowUp')).toEqual({ type: 'select', index: 1 })
    expect(act('ArrowDown')).toEqual({ type: 'select', index: 3 })
    expect(act('ArrowUp', { selection: 6 })).toEqual({ type: 'select', index: 5 })
    expect(act('ArrowDown', { selection: 6 })).toEqual({ type: 'select', index: 7 })
  })

  it('stops the picked row at either end of the list', () => {
    expect(act('ArrowUp', { selection: 0 })).toEqual({ type: 'select', index: 0 })
    expect(act('ArrowDown', { selection: 9 })).toEqual({ type: 'select', index: 9 })
    expect(act('ArrowDown', { activeIndex: 9 })).toEqual({ type: 'select', index: 9 })
  })

  it('keeps the picked row at 0 when there are no sentences', () => {
    expect(act('ArrowDown', { cueCount: 0, activeIndex: 0 })).toEqual({ type: 'select', index: 0 })
    expect(act('ArrowUp', { cueCount: 0, activeIndex: 0 })).toEqual({ type: 'select', index: 0 })
  })

  it('plays the picked row on Enter, or the playing sentence', () => {
    expect(act('Enter')).toEqual({ type: 'play-index', index: 2 })
    expect(act('Enter', { selection: 7 })).toEqual({ type: 'play-index', index: 7 })
  })

  it('loops the picked row or the playing sentence on L, in either case', () => {
    expect(act('l')).toEqual({ type: 'toggle-loop', index: 2 })
    expect(act('L', { selection: 4 })).toEqual({ type: 'toggle-loop', index: 4 })
  })

  it('keeps a sentence on S: the picked row, or the one on stage when none is picked', () => {
    expect(act('s')).toEqual({ type: 'keep', index: null })
    expect(act('S', { selection: 0 })).toEqual({ type: 'keep', index: 0 })
  })

  it('switches the right column on N', () => {
    expect(act('n')).toEqual({ type: 'toggle-column' })
    expect(act('N')).toEqual({ type: 'toggle-column' })
  })

  it('collapses or expands the right column on a backslash, and leaves the brackets to the speed', () => {
    expect(act('\\')).toEqual({ type: 'toggle-side' })
    expect(act('[')).toEqual({ type: 'speed', delta: -1 })
    expect(act(']')).toEqual({ type: 'speed', delta: 1 })
  })

  it('leaves the backslash alone in a chord, a field, a layer, the timing strip and on the home', () => {
    expect(act('\\', {}, { ctrlKey: true })).toBeNull()
    expect(act('\\', {}, { typing: true })).toBeNull()
    expect(act('\\', { layerOpen: true })).toBeNull()
    expect(act('\\', { settingsOpen: true })).toBeNull()
    expect(act('\\', { timingOpen: true })).toEqual({ type: 'timing-key' })
    expect(act('\\', { view: 'home' })).toBeNull()
  })

  it('cycles the Chinese display on C', () => {
    expect(act('c')).toEqual({ type: 'cycle-zh' })
    expect(act('C')).toEqual({ type: 'cycle-zh' })
  })

  it('reveals the sentence on R', () => {
    expect(act('r')).toEqual({ type: 'reveal' })
    expect(act('R')).toEqual({ type: 'reveal' })
  })

  it('compares with the reader\'s own take on D', () => {
    expect(act('d')).toEqual({ type: 'compare-take' })
    expect(act('D')).toEqual({ type: 'compare-take' })
  })

  it('cycles the picture on V only when there is a video file', () => {
    expect(act('v')).toEqual({ type: 'cycle-picture' })
    expect(act('V')).toEqual({ type: 'cycle-picture' })
    expect(act('v', { hasVideo: false })).toBeNull()
    expect(act('V', { hasVideo: false })).toBeNull()
  })

  it('sets the A-B marks on A and B', () => {
    expect(act('a')).toEqual({ type: 'mark-a' })
    expect(act('A')).toEqual({ type: 'mark-a' })
    expect(act('b')).toEqual({ type: 'mark-b' })
    expect(act('B')).toEqual({ type: 'mark-b' })
  })

  it('opens the timing strip on T', () => {
    expect(act('t')).toEqual({ type: 'retime' })
    expect(act('T')).toEqual({ type: 'retime' })
  })

  it('changes the speed on the bracket keys', () => {
    expect(act('[')).toEqual({ type: 'speed', delta: -1 })
    expect(act(']')).toEqual({ type: 'speed', delta: 1 })
  })

  it('reads the same key whatever the sentence it is on', () => {
    expect(act(' ', { cueCount: 0, activeIndex: 0 })).toEqual({ type: 'toggle-play' })
  })
})

describe('keyAction: grades', () => {
  it('grades the kept sentence on stage, outside a review', () => {
    expect(act('1')).toEqual({ type: 'stage-grade', grade: 'got' })
    expect(act('2')).toEqual({ type: 'stage-grade', grade: 'fuzzy' })
    expect(act('3')).toEqual({ type: 'stage-grade', grade: 'notyet' })
  })

  it('grades the review item while a review runs', () => {
    expect(act('1', { reviewing: true })).toEqual({ type: 'review-grade', grade: 'got' })
    expect(act('2', { reviewing: true })).toEqual({ type: 'review-grade', grade: 'fuzzy' })
    expect(act('3', { reviewing: true })).toEqual({ type: 'review-grade', grade: 'notyet' })
  })

  it('has no grade past the third key', () => {
    expect(act('4')).toBeNull()
    expect(act('0')).toBeNull()
  })
})

describe('keyAction: a review running', () => {
  const reviewing = { reviewing: true }

  it('turns the horizontal arrows into the queue: left goes back, right skips', () => {
    expect(act('ArrowLeft', reviewing)).toEqual({ type: 'review-back' })
    expect(act('ArrowRight', reviewing)).toEqual({ type: 'review-skip' })
  })

  it('leaves every other key to the practice view', () => {
    expect(act(' ', reviewing)).toEqual({ type: 'toggle-play' })
    expect(act('r', reviewing)).toEqual({ type: 'reveal' })
    expect(act('ArrowDown', reviewing)).toEqual({ type: 'select', index: 3 })
  })

  it('leaves the keys alone once the review summary is up, whatever they are', () => {
    const done = { reviewing: true, reviewFinished: true }
    for (const key of [' ', 'ArrowLeft', 'ArrowRight', 'Enter', 's', '1', 'r']) {
      expect(act(key, done)).toBeNull()
    }
  })
})

describe('keyAction: who owns the keyboard', () => {
  it('gives every key to the timing strip while it is open', () => {
    for (const key of [' ', 'ArrowLeft', 'ArrowRight', 'Tab', 'i', 'o', 'Enter', 'x', '1']) {
      expect(act(key, { timingOpen: true })).toEqual({ type: 'timing-key' })
    }
  })

  it('lets the strip have a key that nothing else wants, and a review does not get ahead of it', () => {
    expect(act('ArrowLeft', { timingOpen: true, reviewing: true })).toEqual({ type: 'timing-key' })
  })

  it('leaves everything but Escape to the settings drawer while it is open', () => {
    for (const key of [' ', 'ArrowLeft', 's', '1', 'Enter']) {
      expect(act(key, { settingsOpen: true })).toBeNull()
    }
    expect(act(' ', { settingsOpen: true, timingOpen: true })).toBeNull()
  })

  it('leaves everything but Escape to a layer while it is open', () => {
    for (const key of [' ', 'ArrowLeft', 's', '1', 'Enter']) {
      expect(act(key, { layerOpen: true })).toBeNull()
    }
  })

  it('leaves everything but Escape to the end-of-episode card while it is up', () => {
    for (const key of [' ', 'ArrowRight', 'Enter', 's', '1']) {
      expect(act(key, { finishOpen: true })).toBeNull()
    }
  })

  it('has no practice key on the home, whatever the state says', () => {
    for (const key of [' ', 'ArrowLeft', 's', 'n', '1', 'Enter', 'v']) {
      expect(act(key, { view: 'home' })).toBeNull()
    }
  })

  it('lets the timing strip claim its keys before a layer does', () => {
    // The layers are closed when the strip opens, but the decision does not rely on that.
    expect(act(' ', { timingOpen: true, layerOpen: true })).toEqual({ type: 'timing-key' })
  })
})

describe('keyAction: Escape', () => {
  const escape = (context: Partial<KeyContext> = {}): KeyAction | null => {
    const action = act('Escape', context)
    // Escape always asks the menu first; what it means after is what is tested.
    expect(action?.type).toBe('close-menu')
    return action?.type === 'close-menu' ? action.otherwise : null
  }

  it('asks the 「更多」 menu first, in either view', () => {
    expect(act('Escape')).toEqual({ type: 'close-menu', otherwise: { type: 'clear-ab' } })
    expect(act('Escape', { view: 'home' })).toEqual({ type: 'close-menu', otherwise: null })
  })

  it('clears the A-B marks in the practice view when nothing is open', () => {
    expect(escape()).toEqual({ type: 'clear-ab' })
  })

  it('closes the five-steps drawer before it clears the marks', () => {
    expect(escape({ stepsOpen: true })).toEqual({ type: 'close-steps' })
  })

  it('puts the floating right column away after the steps drawer and before the marks', () => {
    expect(escape({ sideFloating: true })).toEqual({ type: 'close-side' })
    expect(escape({ stepsOpen: true, sideFloating: true })).toEqual({ type: 'close-steps' })
  })

  it('means nothing on the home once nothing is open', () => {
    expect(escape({ view: 'home' })).toBeNull()
    // The steps drawer and the marks are the practice view's own.
    expect(escape({ view: 'home', stepsOpen: true })).toBeNull()
  })

  it('closes a layer in either view', () => {
    expect(escape({ layerOpen: true })).toEqual({ type: 'close-layer' })
    expect(escape({ view: 'home', layerOpen: true })).toEqual({ type: 'close-layer' })
  })

  it('closes the settings drawer in either view', () => {
    expect(escape({ settingsOpen: true })).toEqual({ type: 'close-settings' })
    expect(escape({ view: 'home', settingsOpen: true })).toEqual({ type: 'close-settings' })
  })

  it('closes the timing strip, ends a review and dismisses the finish card', () => {
    expect(escape({ timingOpen: true })).toEqual({ type: 'close-timing' })
    expect(escape({ reviewing: true })).toEqual({ type: 'end-review' })
    expect(escape({ reviewing: true, reviewFinished: true })).toEqual({ type: 'end-review' })
    expect(escape({ finishOpen: true })).toEqual({ type: 'dismiss-finish' })
  })

  it('closes one thing per press, topmost first', () => {
    const everything = {
      settingsOpen: true,
      timingOpen: true,
      reviewing: true,
      finishOpen: true,
      layerOpen: true,
      stepsOpen: true,
      sideFloating: true,
    }
    const ladder: Array<[Partial<KeyContext>, KeyAction['type']]> = [
      [everything, 'close-settings'],
      [{ ...everything, settingsOpen: false }, 'close-timing'],
      [{ ...everything, settingsOpen: false, timingOpen: false }, 'end-review'],
      [{ ...everything, settingsOpen: false, timingOpen: false, reviewing: false }, 'dismiss-finish'],
      [{ ...everything, settingsOpen: false, timingOpen: false, reviewing: false, finishOpen: false }, 'close-layer'],
      [
        { ...everything, settingsOpen: false, timingOpen: false, reviewing: false, finishOpen: false, layerOpen: false },
        'close-steps',
      ],
      [
        {
          ...everything,
          settingsOpen: false,
          timingOpen: false,
          reviewing: false,
          finishOpen: false,
          layerOpen: false,
          stepsOpen: false,
        },
        'close-side',
      ],
    ]
    for (const [context, expected] of ladder) expect(escape(context)?.type).toBe(expected)
  })
})

describe('headsetAction', () => {
  const idle = { reviewing: false, reviewFinished: false }

  it('steps the sentence before or after, as the arrow keys do', () => {
    expect(headsetAction(-1, idle)).toEqual({ type: 'step', delta: -1 })
    expect(headsetAction(1, idle)).toEqual({ type: 'step', delta: 1 })
  })

  it('goes back and skips through a review, as the arrow keys do', () => {
    const review = { reviewing: true, reviewFinished: false }
    expect(headsetAction(-1, review)).toEqual({ type: 'review-back' })
    expect(headsetAction(1, review)).toEqual({ type: 'review-skip' })
  })

  it('leaves a finished review alone, as the keys do', () => {
    const done = { reviewing: true, reviewFinished: true }
    expect(headsetAction(-1, done)).toBeNull()
    expect(headsetAction(1, done)).toBeNull()
  })

  it('agrees with the arrow keys wherever the two share a state', () => {
    for (const review of [idle, { reviewing: true, reviewFinished: false }, { reviewing: true, reviewFinished: true }]) {
      expect(headsetAction(-1, review)).toEqual(act('ArrowLeft', review))
      expect(headsetAction(1, review)).toEqual(act('ArrowRight', review))
    }
  })

  it('does not care about what is only about focus: the keys would be left alone, the headset steps', () => {
    // The state a key would be refused in (a layer, the settings drawer, the finish card, the timing strip's claim on
    // the arrows) is not passed to the headset at all, which is the point: it steps whatever is open.
    expect(act('ArrowRight', { layerOpen: true })).toBeNull()
    expect(act('ArrowRight', { settingsOpen: true })).toBeNull()
    expect(act('ArrowRight', { finishOpen: true })).toBeNull()
    expect(act('ArrowRight', { timingOpen: true })).toEqual({ type: 'timing-key' })
    expect(headsetAction(1, idle)).toEqual({ type: 'step', delta: 1 })
  })
})

describe('flashOf', () => {
  const lit: Array<[KeyAction, string]> = [
    [{ type: 'toggle-play' }, 'space'],
    [{ type: 'step', delta: -1 }, 'arrows'],
    [{ type: 'step', delta: 1 }, 'arrows'],
    [{ type: 'review-skip' }, 'arrows'],
    [{ type: 'review-back' }, 'arrows'],
    [{ type: 'toggle-loop', index: 0 }, 'l'],
    [{ type: 'keep', index: null }, 's'],
    [{ type: 'cycle-zh' }, 'c'],
    [{ type: 'reveal' }, 'r'],
    [{ type: 'compare-take' }, 'd'],
    [{ type: 'cycle-picture' }, 'v'],
  ]

  it('lights the cap of each key the reminder line shows', () => {
    for (const [action, cap] of lit) expect(flashOf(action)).toBe(cap)
  })

  it('lights nothing for the keys the reminder line does not show', () => {
    const quiet: KeyAction[] = [
      { type: 'close-menu', otherwise: null },
      { type: 'close-settings' },
      { type: 'close-timing' },
      { type: 'end-review' },
      { type: 'dismiss-finish' },
      { type: 'close-layer' },
      { type: 'close-steps' },
      { type: 'close-side' },
      { type: 'clear-ab' },
      { type: 'timing-key' },
      { type: 'review-grade', grade: 'got' },
      { type: 'stage-grade', grade: 'got' },
      { type: 'select', index: 0 },
      { type: 'play-index', index: 0 },
      { type: 'toggle-column' },
      { type: 'toggle-side' },
      { type: 'mark-a' },
      { type: 'mark-b' },
      { type: 'retime' },
      { type: 'speed', delta: 1 },
    ]
    for (const action of quiet) expect(flashOf(action)).toBeNull()
  })

  it('lights the cap for the key that was pressed, through the decision', () => {
    expect(flashOf(act(' ') ?? { type: 'clear-ab' })).toBe('space')
    expect(flashOf(act('ArrowRight', { reviewing: true }) ?? { type: 'clear-ab' })).toBe('arrows')
  })
})
