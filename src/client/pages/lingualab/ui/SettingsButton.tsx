/**
 * The icon at the right end of both top bars; it opens the settings drawer.
 *
 * What pressing it also closes (the five steps, the layer over the page) is the page's to say, because those are the
 * page's states; the button only shows whether the drawer is open.
 */
import type { Translate } from '../../../context.ts'
import { SettingsIcon } from '../../../shared/ui/icons.tsx'

export interface SettingsButtonProps {
  readonly t: Translate
  /** The drawer is open, so the icon reads as pressed. */
  readonly open: boolean
  readonly onToggle: () => void
}

export function SettingsButton({ t, open, onToggle }: SettingsButtonProps) {
  return (
    <button
      type="button"
      className={`dsh-lingualab-icon-btn${open ? ' is-on' : ''}`}
      onClick={onToggle}
      title={t('settingsOpen')}
      aria-label={t('settingsOpen')}
      aria-expanded={open}
    >
      <SettingsIcon size={16} />
    </button>
  )
}
