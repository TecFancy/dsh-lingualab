/**
 * The timing panel's keys, as data.
 *
 * The panel owns the keyboard while it is open and swallows every key, so the mapping from a key
 * to what it does lives in one table here rather than in the hook's switch. The hook reads the
 * action and calls the matching callback; a key it does not know is a no-op the panel still
 * consumes, because a stray letter must not move the sentence being edited.
 */
import type { RetimeEdge } from '../../../entities/cue/index.ts'

/** One nudge, and one with Shift held. */
export const STEP_MS = 50
export const BIG_STEP_MS = 250

/** What a key asks of the open panel. */
export type TimingKeyAction =
  | { readonly kind: 'switch' }
  | { readonly kind: 'nudge'; readonly delta: number }
  | { readonly kind: 'toPlayhead'; readonly edge: RetimeEdge }
  | { readonly kind: 'toggle' }
  | { readonly kind: 'save' }
  | { readonly kind: 'close' }
  | { readonly kind: 'step'; readonly direction: -1 | 1 }
  | { readonly kind: 'none' }

/** The keys whose meaning does not depend on Shift. */
const FIXED: Readonly<Record<string, TimingKeyAction>> = {
  Tab: { kind: 'switch' },
  i: { kind: 'toPlayhead', edge: 'start' },
  I: { kind: 'toPlayhead', edge: 'start' },
  o: { kind: 'toPlayhead', edge: 'end' },
  O: { kind: 'toPlayhead', edge: 'end' },
  ' ': { kind: 'toggle' },
  Enter: { kind: 'save' },
  Escape: { kind: 'close' },
}

/**
 * What a key does while the panel is open.
 * @param key - the event's `key`.
 * @param shiftKey - whether Shift was held, which makes a nudge a big one.
 */
export function timingKeyAction(key: string, shiftKey: boolean): TimingKeyAction {
  if (key === 'ArrowLeft') return { kind: 'nudge', delta: shiftKey ? -BIG_STEP_MS : -STEP_MS }
  if (key === 'ArrowRight') return { kind: 'nudge', delta: shiftKey ? BIG_STEP_MS : STEP_MS }
  if (key === 'ArrowUp') return { kind: 'step', direction: -1 }
  if (key === 'ArrowDown') return { kind: 'step', direction: 1 }
  return FIXED[key] ?? { kind: 'none' }
}
