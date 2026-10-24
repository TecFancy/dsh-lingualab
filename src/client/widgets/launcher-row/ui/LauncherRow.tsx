/**
 * The page's only way in: one row inside the host's 「更多」 menu.
 *
 * The row lives in somebody else's menu, so it is drawn with the host's own menu
 * primitive rather than this page's chips: a menu is a list of rows of one height
 * with one hover, and a hand-drawn button would be the one row in it that sits
 * crooked. The icon is the plugin's own mark, because the label is the only other
 * thing the row has room for.
 */
import { MenuItemButton } from '@deepseek-ai/dsh-client-ui-primitives'
import type { Translate } from '../../../context.ts'
import { HeadphonesIcon } from '../../../shared/ui/HeadphonesIcon.tsx'

/** What the sidebar hands the row: the menu's dismissal, plus the open action this plugin injects. */
export interface LauncherRowProps {
  /** Translate one dictionary key of this plugin's namespace. */
  readonly t: Translate
  /** Open the page in the centre column. */
  readonly open: () => void
  /** Close the menu. The sidebar owns it and passes this to every row. */
  readonly onDismiss?: () => void
}

/** The 「语言实验室」 row of the sidebar's 「更多」 menu. */
export function LauncherRow({ t, open, onDismiss }: LauncherRowProps) {
  return (
    <MenuItemButton
      icon={<HeadphonesIcon />}
      onSelect={() => {
        onDismiss?.()
        open()
      }}
    >
      {t('appTitle')}
    </MenuItemButton>
  )
}
