/**
 * The top bar's last group: two icon buttons, the right column's toggle and the settings.
 *
 * They are tools for the page rather than part of what is being practised, so they sit at the far right behind the
 * bar's thin line, both as bare icons. The column used to have a second button for the kept sentences; the column's own
 * tabs already say 「收藏 2」, so that button only repeated them, and `N` still switches to them. While the column is
 * collapsed those tabs are out of sight, so the toggle carries the kept count as a small badge instead.
 */
import type { ReactNode } from 'react'
import type { Translate } from '../../../context.ts'
import { SideColumnIcon } from '../../../shared/ui/SideColumnIcon.tsx'
import type { SideColumn } from '../lib/useSideColumn.ts'

export interface PracticeToolButtonsProps {
  readonly t: Translate
  readonly side: Pick<SideColumn, 'collapsed' | 'toggleCollapsed'>
  /** How many sentences are kept, which the toggle shows while the column is collapsed. */
  readonly keptCount: number
  /** The settings button, which the page builds because its drawer is the page's state. */
  readonly settings: ReactNode
}

export function PracticeToolButtons({ t, side, keptCount, settings }: PracticeToolButtonsProps) {
  const sideLabel = t('keySide')
  const badge = side.collapsed && keptCount > 0
  return (
    <div className="dsh-lingualab-top-group" role="group" aria-label={t('topGroupTools')}>
      <button
        type="button"
        className="dsh-lingualab-icon-btn dsh-lingualab-side-toggle"
        onClick={side.toggleCollapsed}
        title={`${sideLabel} (\\)`}
        aria-label={badge ? `${sideLabel} · ${t('columnKept')} ${keptCount}` : sideLabel}
        aria-expanded={!side.collapsed}
      >
        <SideColumnIcon size={16} open={!side.collapsed} />
        {badge ? <span className="dsh-lingualab-icon-badge" aria-hidden="true">{keptCount}</span> : null}
      </button>
      {settings}
    </div>
  )
}
