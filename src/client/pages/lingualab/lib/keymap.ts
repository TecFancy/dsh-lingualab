/**
 * What a key on the panel means, as data.
 *
 * The page used to decide this inside its key handler, between the lines that stop the event and the lines that
 * change state: some thirty cases over a dozen flags (which view, whether a review runs, whether the timing strip or a
 * layer or the settings drawer is open), where adding a key meant reading all of them to find where it belonged. The
 * decision is a function of the key and of those flags only, so it lives here as one: {@link keyAction} answers with
 * an action (or `null`, "not ours"), and the page's handler stays what it should be, the place that stops the event
 * and calls the handler an action names.
 *
 * Two things stay out of it on purpose. The questions that need the DOM (is the target a text field, does a focused
 * button take Space for itself) are asked by the page and handed in as booleans, so this file runs without a browser.
 * And the strip's own keys are not decided here: while the timing strip is open every key belongs to it, which is the
 * action `timing-key`, and the strip's handler says whether it used the key.
 *
 * A headset's previous and next buttons mean what the arrow keys mean, minus what is only about focus; they ask
 * {@link headsetAction}, which runs the same decision with those flags off, so the two cannot drift apart.
 */
import { gradeForKey } from '../../../shared/lib/grades.ts'
import type { GivenGrade } from '../../../shared/notes-format.ts'
import type { View } from './panel.ts'

/** A keystroke, reduced to what the decision reads. */
export interface KeyPress {
  readonly key: string
  readonly ctrlKey: boolean
  readonly metaKey: boolean
  readonly altKey: boolean
  /** The target is a field the reader types into (a text input, a select, a text area, an editable element). */
  readonly typing: boolean
  /** The target is a focused button or link that takes Space and Enter for itself, which the browser presses. */
  readonly ownsKey: boolean
}

/** What the page is showing and doing while a key arrives. */
export interface KeyContext {
  readonly view: View
  /** The settings drawer is open: it owns the keyboard, as a layer does. */
  readonly settingsOpen: boolean
  /** The timing strip is open: it owns the keyboard, and the arrows move an edge instead of the sentence. */
  readonly timingOpen: boolean
  /** The strip is saving a move to the neighbour: every key is swallowed, Escape included. */
  readonly timingBusy: boolean
  /** A review is running or has just ended (its card is up). */
  readonly reviewing: boolean
  /** The review's summary card is up, a dialog the keys leave alone. */
  readonly reviewFinished: boolean
  /** The end-of-episode card is up, a dialog with its next action focused. */
  readonly finishOpen: boolean
  /** One of the layers (the picker, the folder, the segment list) is over the page. */
  readonly layerOpen: boolean
  /** The five-steps drawer is open. */
  readonly stepsOpen: boolean
  /** The right column is open as a drawer over a narrow stage. */
  readonly sideFloating: boolean
  /** What is open has a video file, so there is a picture for `V` to cycle. */
  readonly hasVideo: boolean
  /** The row picked with the arrow keys, or `null` when the playing sentence is the one. */
  readonly selection: number | null
  /** The sentence the player is on. */
  readonly activeIndex: number
  /** How many sentences there are. */
  readonly cueCount: number
}

/** What a key does. The page owns the doing; this only names it. */
export type KeyAction =
  /**
   * Escape with nothing else decided yet: the 「更多」 menu is the topmost thing there is, and one press closes one
   * thing, so the page asks the menu first. When it was open the key is spent; when it was not, `otherwise` is what
   * Escape means (or `null`, when it means nothing).
   */
  | { readonly type: 'close-menu'; readonly otherwise: KeyAction | null }
  | { readonly type: 'close-settings' }
  | { readonly type: 'close-timing' }
  | { readonly type: 'end-review' }
  | { readonly type: 'dismiss-finish' }
  | { readonly type: 'close-layer' }
  | { readonly type: 'close-steps' }
  /** Escape while the right column floats over the stage: put it away without switching its view. */
  | { readonly type: 'close-side' }
  | { readonly type: 'clear-ab' }
  /** The timing strip is open: the key is its to use, and its handler says whether it did. */
  | { readonly type: 'timing-key' }
  /** A grade for the review item on stage. */
  | { readonly type: 'review-grade'; readonly grade: GivenGrade }
  /** A grade for the kept sentence on stage. */
  | { readonly type: 'stage-grade'; readonly grade: GivenGrade }
  | { readonly type: 'review-skip' }
  | { readonly type: 'review-back' }
  | { readonly type: 'toggle-play' }
  /** The sentence before (-1) or after (+1) the one playing. */
  | { readonly type: 'step'; readonly delta: -1 | 1 }
  /** Move the picked row to `index`. */
  | { readonly type: 'select'; readonly index: number }
  /** Play the sentence at `index` (it may name none, and then nothing happens). */
  | { readonly type: 'play-index'; readonly index: number }
  | { readonly type: 'toggle-loop'; readonly index: number }
  /** Keep or un-keep a sentence: the picked row, or the one on stage when `index` is `null`. */
  | { readonly type: 'keep'; readonly index: number | null }
  | { readonly type: 'toggle-column' }
  /** `\`: collapse or expand the right column. */
  | { readonly type: 'toggle-side' }
  | { readonly type: 'cycle-zh' }
  | { readonly type: 'reveal' }
  | { readonly type: 'compare-take' }
  | { readonly type: 'cycle-picture' }
  /** `A`: set the loop's start where the playhead is, or clear both marks when the start is already set. */
  | { readonly type: 'mark-a' }
  | { readonly type: 'mark-b' }
  | { readonly type: 'retime' }
  /** The speed one step down (-1) or up (+1). */
  | { readonly type: 'speed'; readonly delta: -1 | 1 }

/** The row a key that acts on "the" sentence acts on: the picked one, else the playing one. */
function current(context: KeyContext): number {
  return context.selection ?? context.activeIndex
}

/** What one key decides, given the page's state. */
type Decide = (context: KeyContext) => KeyAction | null

/** The table entries for a letter key, which counts in either case. */
function letters(keys: string, decide: Decide): ReadonlyArray<readonly [string, Decide]> {
  return [...keys].flatMap((key): ReadonlyArray<readonly [string, Decide]> => [
    [key.toLowerCase(), decide],
    [key.toUpperCase(), decide],
  ])
}

/** The keys that act on the sentence or the player, whichever case they come in. */
const PRACTICE_KEYS: ReadonlyMap<string, Decide> = new Map<string, Decide>([
  [' ', () => ({ type: 'toggle-play' })],
  ['ArrowLeft', () => ({ type: 'step', delta: -1 })],
  ['ArrowRight', () => ({ type: 'step', delta: 1 })],
  ['ArrowUp', (context) => ({ type: 'select', index: Math.max(0, current(context) - 1) })],
  [
    'ArrowDown',
    (context) => ({ type: 'select', index: Math.min(Math.max(0, context.cueCount - 1), current(context) + 1) }),
  ],
  ['Enter', (context) => ({ type: 'play-index', index: current(context) })],
  ...letters('l', (context) => ({ type: 'toggle-loop', index: current(context) })),
  ...letters('s', (context) => ({ type: 'keep', index: context.selection })),
  ...letters('n', () => ({ type: 'toggle-column' })),
  // No other key of the page, and beside the brackets (the speed) on a US layout. Where it needs AltGr it is a chord and
  // not ours, and the top bar's button is the way.
  ['\\', () => ({ type: 'toggle-side' })],
  ...letters('c', () => ({ type: 'cycle-zh' })),
  ...letters('r', () => ({ type: 'reveal' })),
  ...letters('d', () => ({ type: 'compare-take' })),
  // Only a segment with a video has a picture to cycle; without one the key is not the page's, never the host's.
  ...letters('v', (context) => (context.hasVideo ? { type: 'cycle-picture' } : null)),
  ...letters('a', () => ({ type: 'mark-a' })),
  ...letters('b', () => ({ type: 'mark-b' })),
  ...letters('t', () => ({ type: 'retime' })),
  ['[', () => ({ type: 'speed', delta: -1 })],
  [']', () => ({ type: 'speed', delta: 1 })],
])

/**
 * What Escape closes, topmost first. One press closes one thing; the five-steps drawer, the floating right column and
 * the A-B marks are the practice view's own, so on the home Escape means nothing once the layers are gone.
 */
function escapeAction(context: KeyContext): KeyAction | null {
  if (context.settingsOpen) return { type: 'close-settings' }
  if (context.timingBusy) return { type: 'timing-key' }
  if (context.timingOpen) return { type: 'close-timing' }
  if (context.reviewing) return { type: 'end-review' }
  if (context.finishOpen) return { type: 'dismiss-finish' }
  if (context.layerOpen) return { type: 'close-layer' }
  if (context.view === 'practice') {
    if (context.stepsOpen) return { type: 'close-steps' }
    if (context.sideFloating) return { type: 'close-side' }
    return { type: 'clear-ab' }
  }
  return null
}

/**
 * What a key means to the practice view, once nothing has claimed it: a grade, the review's arrows, or one of the
 * keys of {@link PRACTICE_KEYS}.
 */
function practiceAction(key: string, context: KeyContext): KeyAction | null {
  // A grade goes to the review item while a review runs, and to the kept sentence on stage otherwise. The arrows move
  // through the queue instead of through the sentences.
  const grade = gradeForKey(key)
  if (grade !== null) return { type: context.reviewing ? 'review-grade' : 'stage-grade', grade }
  if (context.reviewing && key === 'ArrowRight') return { type: 'review-skip' }
  if (context.reviewing && key === 'ArrowLeft') return { type: 'review-back' }
  return PRACTICE_KEYS.get(key)?.(context) ?? null
}

/**
 * What a keystroke does, or `null` when it is not the panel's and must go on to whoever wants it.
 *
 * The order is the rule. A chord, a typed field and a focused button's own Space or Enter are never ours. Escape is
 * the one key that works in both views and under every layer. Everything else is practice-only, and is handed to
 * whoever owns the keyboard while something is open: the settings drawer and a layer take it whole, the timing strip
 * takes it through `timing-key`, and the two finish cards are dialogs with their own focused buttons.
 */
export function keyAction(press: KeyPress, context: KeyContext): KeyAction | null {
  if (press.typing) return null
  // A chord belongs to the browser or the host: Ctrl+S is "save", Ctrl+C is "copy", Ctrl+A is "select all". Reading
  // them as the plain letters meant the reflex of saving a page took the star off a sentence, with its note, and
  // Ctrl+C stopped copying. Shift stays allowed because `[` and `]` can need it on some layouts.
  if (press.ctrlKey || press.metaKey || press.altKey) return null
  // Space and Enter on a button that has the focus press that button (the browser does it): a reader who got there
  // with Tab keeps that. A mouse click never leaves the focus on a button, so after a click these keys are ours again.
  if (press.ownsKey) return null
  if (press.key === 'Escape') return { type: 'close-menu', otherwise: escapeAction(context) }
  // The settings drawer owns the keyboard while it is open, as a layer does.
  if (context.settingsOpen) return null
  if (context.view !== 'practice') return null
  // The timing strip owns the keyboard while it is open: the arrows move an edge, not the sentence.
  if (context.timingOpen) return { type: 'timing-key' }
  // A layer owns the keyboard while it is open: its own fields and buttons are the only things a keystroke should reach.
  if (context.layerOpen) return null
  // So does the finish card: it is a dialog over the stage with its next action focused, and Enter there means that
  // button, not "play the selected sentence" behind it. The card at the end of a review is the same kind of dialog.
  if (context.finishOpen || context.reviewFinished) return null
  return practiceAction(press.key, context)
}

/**
 * What a headset's previous (-1) or next (+1) button does: what the arrow key does, that is the sentence before or
 * after, or while a review runs the queue (back, or skip). A finished review is a dialog the headset leaves alone,
 * as the keys do. What is only about focus (a layer open, the settings drawer, the finish card, the timing strip's
 * claim on the arrows) does not apply to a headset, which has no focus, so the strip open still steps the sentence.
 */
export function headsetAction(
  delta: number,
  review: Pick<KeyContext, 'reviewing' | 'reviewFinished'>,
): KeyAction | null {
  const press: KeyPress = {
    key: delta > 0 ? 'ArrowRight' : 'ArrowLeft',
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    typing: false,
    ownsKey: false,
  }
  return keyAction(press, {
    ...review,
    view: 'practice',
    settingsOpen: false,
    timingOpen: false,
    timingBusy: false,
    finishOpen: false,
    layerOpen: false,
    stepsOpen: false,
    sideFloating: false,
    hasVideo: false,
    selection: null,
    activeIndex: 0,
    cueCount: 0,
  })
}

/**
 * The key cap an action lights, or `null` when it lights none. The caps are the ones in the reminder line under
 * the transport (`KeyHints`); the arrows light for the review's arrows as well.
 */
export function flashOf(action: KeyAction): string | null {
  switch (action.type) {
    case 'toggle-play':
      return 'space'
    case 'step':
    case 'review-skip':
    case 'review-back':
      return 'arrows'
    case 'toggle-loop':
      return 'l'
    case 'keep':
      return 's'
    case 'cycle-zh':
      return 'c'
    case 'reveal':
      return 'r'
    case 'compare-take':
      return 'd'
    case 'cycle-picture':
      return 'v'
    default:
      return null
  }
}
