/**
 * The panel's keyboard: the handler on the page container, the headset's buttons, and the key cap that lights.
 *
 * Keyboard handling lives on the container rather than on `window`. The earlier standalone app bound its shortcuts
 * globally and therefore owned the space bar, the arrow keys and the bracket keys wherever it was open; inside a panel
 * that shares a page with a conversation, that is a hostile neighbour. The container is focusable, so the keys work
 * while the panel has focus and stop at its edge. A key the panel handles is stopped there, because the conversation
 * lives in the same document and a space bar that scrolls or submits behind the panel is a stolen keystroke.
 *
 * What a key means is `keymap.ts`'s, as data. This hook is the other half: it reads the event for the two questions
 * only the DOM can answer, asks the keymap, stops the event, lights the key cap and does what the action names, by
 * calling the handlers the page already has. A headset's previous and next buttons ask the keymap too, so they cannot
 * drift from the arrow keys.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import type { Cue, SubtitleZhMode } from '../../../entities/cue/index.ts'
import { speedResetIndex, useMediaPlayer } from '../../../features/media-player/index.ts'
import { stepBack } from '../../../features/review/index.ts'
import { keepsKeyForTarget } from '../../../shared/lib/focus.ts'
import type { GivenGrade } from '../../../shared/notes-format.ts'
import { nextZhMode, type ControlBarHandle } from '../../../widgets/control-bar/index.ts'
import type { TimingEditor } from '../../../widgets/timing-editor/index.ts'
import { performKey } from './key-actions.ts'
import { flashOf, headsetAction, keyAction, type KeyAction, type KeyPress } from './keymap.ts'
import type { Layer, View } from './panel.ts'
import type { SideColumn } from './useSideColumn.ts'
import type { ReviewRun } from './useReviewRun.ts'

/** How long a key cap stays lit after the page handles its key. */
const FLASH_MS = 260

/** Whether a keystroke belongs to a field the reader is typing in. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  // A checkbox or a button-like input takes no typing, and a tick that leaves focus on it
  // must not switch the page's keys (Escape included) off for the rest of the visit.
  if (target instanceof HTMLInputElement) return !['checkbox', 'radio', 'button', 'submit', 'range', 'file'].includes(target.type)
  return tag === 'select' || tag === 'textarea' || target.isContentEditable
}

/** A keystroke as the keymap reads it: the key and modifiers, and the two questions only the DOM can answer. */
function pressOf(event: ReactKeyboardEvent<HTMLDivElement>): KeyPress {
  return {
    key: event.key,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    altKey: event.altKey,
    typing: isTypingTarget(event.target),
    ownsKey: keepsKeyForTarget(event.target, event.key),
  }
}

/** Stop a handled key here: its default would act behind the panel. */
function stopKey(event: ReactKeyboardEvent<HTMLDivElement>): void {
  event.preventDefault()
  event.stopPropagation()
}

/** What the keys read from and do to the rest of the page. */
export interface KeyboardOptions {
  readonly view: View
  readonly layer: Layer
  readonly setLayer: (layer: Layer) => void
  readonly settingsOpen: boolean
  readonly setSettingsOpen: (open: boolean) => void
  readonly stepsOpen: boolean
  readonly setStepsOpen: (open: boolean) => void
  /** The right column: `N` switches its view (or opens it into the kept sentences), `\` collapses it. */
  readonly side: Pick<SideColumn, 'toggleKept' | 'toggleCollapsed' | 'floating' | 'collapse'>
  readonly zhMode: SubtitleZhMode
  readonly setZhMode: (mode: SubtitleZhMode) => void
  /** The row picked with the arrow keys, or `null` when the playing sentence is the one. */
  readonly selection: number | null
  readonly setSelection: (selection: number | null) => void
  readonly cues: readonly Cue[]
  /** What is open has a video file, so `V` has a picture to cycle. */
  readonly hasVideoFile: boolean
  /** The end-of-episode card is up, and how to dismiss it. */
  readonly finishOpen: boolean
  readonly dismissFinish: () => void
  readonly review: ReviewRun
  readonly timing: TimingEditor
  /** Open the timing strip for the sentence on stage. */
  readonly openTiming: () => void
  /** Keep or un-keep a sentence: the one on stage when no index is given. */
  readonly keep: (index?: number) => void
  /** Grade the kept sentence on stage. */
  readonly gradeStage: (grade: GivenGrade) => void
  /** The transport, whose 「更多」 menu is the topmost thing Escape closes. */
  readonly controlBar: RefObject<ControlBarHandle>
}

/** What the page puts on its container and hands to the lock screen. */
export interface Keyboard {
  /** The handler for the page container's `onKeyDown`. */
  readonly onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void
  /** The lock screen's and a headset's previous and next buttons. */
  readonly headsetSteps: { readonly onPrevious: () => void; readonly onNext: () => void }
  /** The key cap to light, or `null`. */
  readonly flashed: string | null
}

/** Read the keys of the panel. */
export function useKeyboard({
  view,
  layer,
  setLayer,
  settingsOpen,
  setSettingsOpen,
  stepsOpen,
  setStepsOpen,
  side,
  zhMode,
  setZhMode,
  selection,
  setSelection,
  cues,
  hasVideoFile,
  finishOpen,
  dismissFinish,
  review: reviewRun,
  timing,
  openTiming,
  keep,
  gradeStage,
  controlBar,
}: KeyboardOptions): Keyboard {
  const { review, reviewDone, runReview, endReview, answerReview } = reviewRun
  const [flashed, setFlashed] = useState<string | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Light the key cap for a key the page just handled. */
  const flash = useCallback((id: string): void => {
    setFlashed(id)
    if (flashTimer.current !== null) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlashed(null), FLASH_MS)
  }, [])

  useEffect(
    () => () => {
      if (flashTimer.current !== null) clearTimeout(flashTimer.current)
    },
    [],
  )

  /**
   * Do what a key (or a headset button) decided. The two actions that need the key event itself, the strip's own keys
   * and the menu's Escape, are answered by the key handler.
   */
  const perform = useCallback(
    (action: KeyAction): void => {
      performKey(action, {
        closeSettings: () => setSettingsOpen(false),
        closeTiming: () => timing.close(),
        endReview,
        dismissFinish,
        closeLayer: () => setLayer('none'),
        closeSteps: () => setStepsOpen(false),
        closeSide: side.collapse,
        answerReview,
        reviewBack: () => {
          if (review !== null) runReview(stepBack(review))
        },
        gradeStage,
        select: setSelection,
        hasCue: (index) => cues[index] !== undefined,
        keep,
        toggleColumn: side.toggleKept,
        toggleSide: side.toggleCollapsed,
        cycleZh: () => setZhMode(nextZhMode(zhMode)),
        retime: openTiming,
      })
    },
    [
      answerReview,
      cues,
      dismissFinish,
      endReview,
      gradeStage,
      keep,
      openTiming,
      review,
      runReview,
      setLayer,
      setSelection,
      setSettingsOpen,
      setStepsOpen,
      setZhMode,
      side,
      timing,
      zhMode,
    ],
  )

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      let action = keyAction(pressOf(event), {
        view,
        settingsOpen,
        timingOpen: timing.session !== null || timing.moving,
        timingBusy: timing.moving,
        reviewing: review !== null,
        reviewFinished: reviewDone,
        finishOpen,
        layerOpen: layer !== 'none',
        stepsOpen,
        sideFloating: side.floating,
        hasVideo: hasVideoFile,
        selection,
        activeIndex: useMediaPlayer.getState().activeIndex,
        canResetSpeed: speedResetIndex(useMediaPlayer.getState()) !== null,
        cueCount: cues.length,
      })
      // The 「更多」 menu is the topmost thing there is, and one press closes one thing: it must not also clear the
      // A-B marks its own buttons set.
      if (action?.type === 'close-menu') {
        if (controlBar.current?.closeMenu() === true) {
          stopKey(event)
          return
        }
        action = action.otherwise
      }
      if (action === null) return
      if (action.type === 'timing-key') {
        if (timing.handleKey(event)) stopKey(event)
        return
      }
      stopKey(event)
      const lit = flashOf(action)
      if (lit !== null) flash(lit)
      perform(action)
    },
    [
      controlBar,
      cues.length,
      finishOpen,
      flash,
      hasVideoFile,
      layer,
      perform,
      review,
      reviewDone,
      selection,
      settingsOpen,
      side,
      stepsOpen,
      timing,
      view,
    ],
  )

  // A headset's previous and next buttons, and the lock screen's, do what the arrow keys do: the sentence before or after,
  // or, while a review runs, the queue (`←` goes back, `→` skips). A finished review is a dialog the keys leave alone, and
  // so does the headset. Anything else a key does (a layer open, the settings drawer) is about focus, which a headset has
  // none of, so those do not apply: the mapping is the keymap's, asked with those flags off.
  const stepFromHeadset = useCallback(
    (delta: number): void => {
      const action = headsetAction(delta, { reviewing: review !== null, reviewFinished: reviewDone })
      if (action !== null) perform(action)
    },
    [review, reviewDone, perform],
  )
  const headsetSteps = useMemo(
    () => ({ onPrevious: () => stepFromHeadset(-1), onNext: () => stepFromHeadset(1) }),
    [stepFromHeadset],
  )

  return { onKeyDown, headsetSteps, flashed }
}
