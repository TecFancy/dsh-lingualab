/**
 * The practice view: the top bar, the two panes under it, and the scrim behind the five-steps drawer.
 *
 * It lays out three parts that each take their own props; what goes into them is the page's to build, because the
 * state they show is the page's. The scrim lives here rather than in the page because it belongs to the practice view
 * (the settings drawer's scrim, which is open in either view, stays with the page).
 */
import { PracticeSidePane, type PracticeSidePaneProps } from './PracticeSidePane.tsx'
import { PracticeStagePane, type PracticeStagePaneProps } from './PracticeStagePane.tsx'
import { PracticeTopBar, type PracticeTopBarProps } from './PracticeTopBar.tsx'

export interface PracticeViewProps {
  readonly topBar: PracticeTopBarProps
  readonly stage: PracticeStagePaneProps
  readonly side: PracticeSidePaneProps
  /** The scrim behind the steps drawer: on the page while the drawer is, and for its way out. */
  readonly scrim: {
    readonly mounted: boolean
    /** The drawer is open; false while the scrim fades out. */
    readonly open: boolean
    readonly onClose: () => void
  }
}

export function PracticeView({ topBar, stage, side, scrim }: PracticeViewProps) {
  return (
    <>
      <PracticeTopBar {...topBar} />
      <div className="dsh-lingualab-body">
        <PracticeStagePane {...stage} />
        <PracticeSidePane {...side} />
      </div>
      {scrim.mounted ? (
        <div className={`dsh-lingualab-scrim${scrim.open ? '' : ' is-leaving'}`} onClick={scrim.onClose} />
      ) : null}
    </>
  )
}
