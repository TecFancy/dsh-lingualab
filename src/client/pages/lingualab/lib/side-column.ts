/**
 * The right column's three states as data: collapsed, the subtitles, or the kept sentences.
 *
 * The column has two separate facts. Which view it shows (`Column`) is the page's for this visit, and whether it is
 * there at all is a setting, remembered in this browser, because it answers to the device (an iPad wants the width) and
 * not to the episode. Keeping them apart means collapsing never forgets which view was open, and the `N` key keeps
 * the meaning it had: switch the view. These are the moves the buttons and keys make, as pure functions, so the rules
 * can be read and tested without a page.
 */
import type { Column } from './panel.ts'

/** What the right column is: which view, and whether it is collapsed out of the row. */
export interface SideState {
  readonly column: Column
  readonly collapsed: boolean
}

/**
 * `N` and the kept chip. On an expanded column they switch the view, as they always did. On a collapsed one they open
 * it straight into the kept sentences: the press asked for those, so showing the subtitles first, or switching a view
 * nobody can see, would both be wrong.
 */
export function toggleKept(state: SideState): SideState {
  if (state.collapsed) return { column: 'kept', collapsed: false }
  return { column: state.column === 'kept' ? 'transcript' : 'kept', collapsed: false }
}

/** `\` and the top bar's toggle: collapse or expand, and the view stays what it was. */
export function toggleCollapsed(state: SideState): SideState {
  return { column: state.column, collapsed: !state.collapsed }
}

/** Show the kept sentences, expanding the column if it is collapsed (a protected sentence's card has to be seen). */
export function showKept(): SideState {
  return { column: 'kept', collapsed: false }
}

/** The kept chip reads as pressed only while the kept sentences are actually on screen. */
export function keptShown(state: SideState): boolean {
  return !state.collapsed && state.column === 'kept'
}

/**
 * The row width under which an expanded column floats over the stage instead of taking width from it.
 *
 * The column is 260px while the row is at most 820px and `clamp(300px,34%,440px)` above that. Beside the stage, any
 * row under 982px leaves the practice column under 648px (at 982, 34% is about 334px and the stage keeps 648px, whose
 * 24px side padding leaves the 600px content box where the narrow-column rules start). The stage would change layout
 * every time the column opens, so below 982px the column floats instead.
 */
export const SIDE_FLOAT_BELOW = 982

/** Whether the row is too narrow to keep the expanded column beside the stage. */
export function sideFloats(rowWidth: number): boolean {
  return rowWidth < SIDE_FLOAT_BELOW
}
