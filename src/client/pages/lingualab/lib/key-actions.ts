/**
 * What each key action does.
 *
 * `keymap.ts` decides which action a key is; this is the other half, one entry per action. The entries are small
 * because what an action changes is mostly the page's own state, which the page hands in as {@link KeyEffects}; the
 * rest is the player and the picture setting, which are stores and are reached directly. A table rather than a switch
 * so that adding an action is adding an entry (the type says which are missing), and so that no function in it grows
 * with the number of keys.
 */
import { primeTakeAudio, togglePlayback, useMediaPlayer } from '../../../features/media-player/index.ts'
import type { ReviewOutcome } from '../../../features/review/index.ts'
import { useSettings } from '../../../features/settings/index.ts'
import type { GivenGrade } from '../../../shared/notes-format.ts'
import type { KeyAction } from './keymap.ts'

/** What the page lets a key do to it. */
export interface KeyEffects {
  readonly closeSettings: () => void
  readonly closeTiming: () => void
  readonly endReview: () => void
  readonly dismissFinish: () => void
  readonly closeLayer: () => void
  readonly closeSteps: () => void
  /** Answer the review item on stage. */
  readonly answerReview: (outcome: ReviewOutcome) => void
  /** Go back one item in the review (nothing when none runs). */
  readonly reviewBack: () => void
  /** Grade the kept sentence on stage. */
  readonly gradeStage: (grade: GivenGrade) => void
  /** Pick a row of the subtitle list, or `null` to drop the pick. */
  readonly select: (index: number | null) => void
  /** Whether there is a sentence at this index. */
  readonly hasCue: (index: number) => boolean
  /** Keep or un-keep a sentence: the one on stage when no index is given. */
  readonly keep: (index?: number) => void
  readonly toggleColumn: () => void
  readonly cycleZh: () => void
  readonly retime: () => void
}

type Handler<T extends KeyAction['type']> = (action: Extract<KeyAction, { type: T }>, effects: KeyEffects) => void

/** The player's state, read when the key is pressed. */
const store = useMediaPlayer.getState

const HANDLERS: { readonly [T in KeyAction['type']]: Handler<T> } = {
  // Both are answered by the key handler, which has the event.
  'close-menu': () => undefined,
  'timing-key': () => undefined,
  'close-settings': (_action, fx) => fx.closeSettings(),
  'close-timing': (_action, fx) => fx.closeTiming(),
  'end-review': (_action, fx) => fx.endReview(),
  'dismiss-finish': (_action, fx) => fx.dismissFinish(),
  'close-layer': (_action, fx) => fx.closeLayer(),
  'close-steps': (_action, fx) => fx.closeSteps(),
  'clear-ab': () => store().clearAB(),
  'review-grade': (action, fx) => fx.answerReview(action.grade),
  'stage-grade': (action, fx) => fx.gradeStage(action.grade),
  'review-skip': (_action, fx) => fx.answerReview('skipped'),
  'review-back': (_action, fx) => fx.reviewBack(),
  'toggle-play': () => togglePlayback(),
  'step': (action, fx) => {
    fx.select(null)
    store().stepCue(action.delta)
  },
  'select': (action, fx) => fx.select(action.index),
  'play-index': (action, fx) => {
    if (!fx.hasCue(action.index)) return
    fx.select(null)
    store().seekCue(action.index)
    store().setPlaying(true)
  },
  'toggle-loop': (action) => {
    if (store().loopMode === 'sentence') store().setLoopMode('none')
    else store().loopSentence(action.index)
  },
  'keep': (action, fx) => fx.keep(action.index ?? undefined),
  'toggle-column': (_action, fx) => fx.toggleColumn(),
  'cycle-zh': (_action, fx) => fx.cycleZh(),
  'reveal': () => store().reveal(store().activeIndex),
  'compare-take': () => {
    // Plays the sentence and then the reader's take of it; a sentence with no take has nothing to play, and the key is
    // spent on it anyway.
    primeTakeAudio()
    store().compareTake()
  },
  'cycle-picture': () => useSettings.getState().cyclePicture(),
  'mark-a': () => {
    if (store().pointA === null) store().setPoint('a')
    else store().clearAB()
  },
  'mark-b': () => store().setPoint('b'),
  'retime': (_action, fx) => fx.retime(),
  'speed': (action) => store().cycleSpeed(action.delta),
}

/** Do what a key (or a headset button) decided. */
export function performKey(action: KeyAction, effects: KeyEffects): void {
  // The table is keyed by the action's type, so the entry takes exactly this action; TypeScript cannot follow that
  // correlation through a lookup, which is the one cast here.
  const handle = HANDLERS[action.type] as (action: KeyAction, effects: KeyEffects) => void
  handle(action, effects)
}
