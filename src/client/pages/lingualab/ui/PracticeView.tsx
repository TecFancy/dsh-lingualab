/**
 * The practice view: the top bar, the two panes under it, and the scrim behind the five-steps drawer.
 *
 * It lays out three parts that each take their own props; what goes into them is the page's to build, because the
 * state they show is the page's. The scrim lives here rather than in the page because it belongs to the practice view
 * (the settings drawer's scrim, which is open in either view, stays with the page).
 *
 * A collapsed right column keeps its place in the row through a slot for the length of its way out: the slot's width and
 * opacity carry the row between the two states, and the stage gives way in the same transition. The list stays mounted
 * with its full width while the slot shrinks, so its rows do not rewrap on the way out, and it cannot be pressed once it
 * starts to leave. Expanding mounts the column again, so the subtitle list lands on the playing sentence as it appears.
 *
 * On a narrow row the column is a drawer over the stage instead: the body carries `is-side-narrow` for as long as the
 * row is narrow, which keeps the drawer's containing block while it leaves, the drawer is absolutely placed from the
 * right, and a scrim between it and the stage takes a press to put it away. The stage keeps the whole row, so its
 * layout is the collapsed one while the drawer is open.
 */
import type { SideRow } from '../lib/useSideColumn.ts'
import { PracticeSidePane, type PracticeSidePaneProps } from './PracticeSidePane.tsx'
import { PracticeSideSlot } from './PracticeSideSlot.tsx'
import { PracticeStagePane, type PracticeStagePaneProps } from './PracticeStagePane.tsx'
import { PracticeTopBar, type PracticeTopBarProps } from './PracticeTopBar.tsx'

export interface PracticeViewProps {
  readonly topBar: PracticeTopBarProps
  readonly stage: PracticeStagePaneProps
  readonly side: PracticeSidePaneProps
  /** The right column's row: collapsed out of it, or a drawer over a narrow one. */
  readonly row: SideRow
  /** The scrim behind the steps drawer: on the page while the drawer is, and for its way out. */
  readonly scrim: {
    readonly mounted: boolean
    /** The drawer is open; false while the scrim fades out. */
    readonly open: boolean
    readonly onClose: () => void
  }
}

export function PracticeView({ topBar, stage, side, row, scrim }: PracticeViewProps) {
  const { collapsed, narrow, attachBody, onCollapse } = row
  const bodyClass = `dsh-lingualab-body${collapsed ? ' is-side-collapsed' : ''}${narrow ? ' is-side-narrow' : ''}`
  return (
    <>
      <PracticeTopBar {...topBar} />
      <div className={bodyClass} ref={attachBody}>
        <PracticeStagePane {...stage} />
        <PracticeSideSlot open={!collapsed} floating={narrow} scrimLabel={side.t('closeSide')} onScrim={onCollapse}>
          <PracticeSidePane {...side} />
        </PracticeSideSlot>
      </div>
      {scrim.mounted ? (
        <div className={`dsh-lingualab-scrim${scrim.open ? '' : ' is-leaving'}`} onClick={scrim.onClose} />
      ) : null}
    </>
  )
}
