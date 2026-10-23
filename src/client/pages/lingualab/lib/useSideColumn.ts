/**
 * The right column for the page: which view it shows, whether it is collapsed, and the moves that change them.
 *
 * The view is state of this visit. The collapse is the `sideCollapsed` setting when this device has a choice, and
 * otherwise the row's width; a move that changes it while there is no choice stays with this visit, except the top bar's
 * toggle, which stores one. The rules are `side-column.ts`'s; this hook only reads the facts and writes back the ones a
 * move changed.
 */
import { useCallback, useMemo, useRef, useState } from 'react'
import { useSettings } from '../../../features/settings/index.ts'
import type { Column } from './panel.ts'
import * as rules from './side-column.ts'
import { useSideFloating } from './useSideFloating.ts'

/** What the body of the practice row needs: its state, its width measurement, and the scrim's way out. */
export interface SideRow {
  /** The column is collapsed out of the row. */
  readonly collapsed: boolean
  /** The row is narrow and the column is open: it floats over the stage instead of taking width from it. */
  readonly floating: boolean
  /** The row is narrow, so the column is a drawer even during its way out, when `floating` is already false. */
  readonly narrow: boolean
  /** Attach to `.dsh-lingualab-body`, which is measured here. */
  readonly attachBody: (body: HTMLDivElement | null) => void
  /** Put the column away, keeping its view: Escape and a press on the drawer's scrim. */
  readonly onCollapse: () => void
}

/** What the page, the top bar and the keys use of the right column. */
export interface SideColumn {
  readonly column: Column
  readonly collapsed: boolean
  /** The row is narrow and the column is open, so it is a drawer over the stage. */
  readonly floating: boolean
  /** The row's props for `.dsh-lingualab-body`. */
  readonly row: SideRow
  /** The kept chip is pressed: the kept sentences are on screen. */
  readonly keptShown: boolean
  /** The column's own switch (the segmented control in its head). */
  readonly setColumn: (column: Column) => void
  /** `N` and the kept chip. */
  readonly toggleKept: () => void
  /** `\` and the top bar's toggle. */
  readonly toggleCollapsed: () => void
  /** Open the kept sentences, expanding the column. */
  readonly showKept: () => void
  /** Put the column away, keeping the view: Escape while it floats. */
  readonly collapse: () => void
}

/** Read and move the right column. */
export function useSideColumn(): SideColumn {
  const [column, setColumn] = useState<Column>('transcript')
  // The collapse this visit chose while the device has no stored choice, or `null` when it has not chosen.
  const [visit, setVisit] = useState<boolean | null>(null)
  // Beside the state, because a move reads the collapse when it is made, before React renders what it just set.
  const visitNow = useRef<boolean | null>(null)
  const stored = useSettings((state) => state.sideCollapsed)
  const setStored = useSettings((state) => state.setSideCollapsed)
  const { attachBody, narrow } = useSideFloating()
  const collapsed = rules.collapseFor(visit, stored, narrow)

  const apply = useCallback(
    (next: rules.SideState, always = false): void => {
      setColumn(next.column)
      const storedNow = useSettings.getState().sideCollapsed
      const current = rules.collapseFor(visitNow.current, storedNow, narrow)
      const target = rules.collapseTarget(current, next.collapsed, storedNow, always)
      if (target === 'none') return
      if (target === 'visit') {
        visitNow.current = next.collapsed
        setVisit(next.collapsed)
        return
      }
      setStored(next.collapsed)
      visitNow.current = null
      setVisit(null)
    },
    [narrow, setStored],
  )
  const collapse = useCallback((): void => apply({ column, collapsed: true }), [apply, column])
  return useMemo((): SideColumn => {
    // A move reads the collapse when it is made, not as it was rendered, so two presses in one frame do not undo each other.
    const now = (): rules.SideState => ({
      column,
      collapsed: rules.collapseFor(visitNow.current, useSettings.getState().sideCollapsed, narrow),
    })
    const floating = narrow && !collapsed
    return {
      column,
      collapsed,
      floating,
      row: { collapsed, floating, narrow, attachBody, onCollapse: collapse },
      keptShown: rules.keptShown({ column, collapsed }),
      setColumn,
      toggleKept: () => apply(rules.toggleKept(now())),
      toggleCollapsed: () => apply(rules.toggleCollapsed(now()), true),
      showKept: () => apply(rules.showKept()),
      collapse,
    }
  }, [apply, attachBody, collapse, collapsed, column, narrow])
}
