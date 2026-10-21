/**
 * The right column for the page: which view it shows, whether it is collapsed, and the moves that change them.
 *
 * The view is state of this visit; the collapse is the `sideCollapsed` setting, so it survives a reload on this device
 * and nowhere else. The rules are `side-column.ts`'s; this hook only reads the two facts and writes back the ones a
 * move changed, so a press that does not touch the collapse never rewrites the stored settings.
 */
import { useCallback, useMemo, useState } from 'react'
import { useSettings } from '../../../features/settings/index.ts'
import type { Column } from './panel.ts'
import * as rules from './side-column.ts'

/** What the page, the top bar and the keys use of the right column. */
export interface SideColumn {
  readonly column: Column
  readonly collapsed: boolean
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
}

/** Read and move the right column. */
export function useSideColumn(): SideColumn {
  const [column, setColumn] = useState<Column>('transcript')
  const collapsed = useSettings((state) => state.sideCollapsed)
  const setCollapsed = useSettings((state) => state.setSideCollapsed)
  const apply = useCallback(
    (next: rules.SideState): void => {
      setColumn(next.column)
      if (next.collapsed !== useSettings.getState().sideCollapsed) setCollapsed(next.collapsed)
    },
    [setCollapsed],
  )
  return useMemo((): SideColumn => {
    // A move reads the collapse when it is made, not as it was rendered, so two presses in one frame do not undo each other.
    const now = (): rules.SideState => ({ column, collapsed: useSettings.getState().sideCollapsed })
    return {
      column,
      collapsed,
      keptShown: rules.keptShown({ column, collapsed }),
      setColumn,
      toggleKept: () => apply(rules.toggleKept(now())),
      toggleCollapsed: () => apply(rules.toggleCollapsed(now())),
      showKept: () => apply(rules.showKept()),
    }
  }, [apply, collapsed, column])
}
