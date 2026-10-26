/**
 * dsh-lingualab — client half, entry point.
 *
 * Two registrations, both about the same page:
 *
 *   · `main` (keyed/root), the centre-column body under the key `lingualab`,
 *     leaving the current Session untouched. The frame dispatches `main` with
 *     `entryKey = activePanelId ?? 'conversation'`.
 *   · `sidebar.panellist.actions` (list/root), one row of the left rail's
 *     「更多」 menu. The sidebar owns that menu button; this row is what a click on
 *     it lists, and selecting the row calls `ctx.layout.selectPanel('lingualab')`.
 *
 * Why the menu and not a rail row: the rail holds one row per panel, and this page
 * is opened now and then rather than all day, so it should not cost the rail a row.
 * Why not the 「应用」 launcher card it had before: that page lists self-hosted web
 * apps, while this is a page inside the shell, so the card sat in a grid whose other
 * cards open in another tab. The row now belongs to this plugin, so the page no
 * longer needs `dsh-apps-panel` installed to be reachable at all.
 *
 * `PANEL_ID` is the string the rest of the shell agrees on: the `main` key.
 * `MENU_ROW_ID` names only this list entry, which nothing else addresses.
 *
 * This file is the wiring only. The page lives in `pages/lingualab/`, the pieces
 * it is built from in `widgets/` and `features/`, the subtitle model in
 * `entities/`, and the copy in `locale.ts`. The host seam it calls is typed in
 * `context.ts`. `lib/client.js` is what the shell fetches, built from here.
 */
import type { PluginContext } from './context.ts'
import { en, zh } from './locale.ts'
import { LinguaLabPage } from './pages/lingualab/index.ts'
import { LauncherRow } from './widgets/launcher-row/index.ts'

const NS = 'dsh-lingualab'
const PANEL_ID = 'lingualab'
const MENU_ROW_ID = 'lingualab-launcher'

/** Client packages whose services this plugin uses; the loader orders them first. */
export const inject: readonly string[] = ['slots', 'locale', 'layout']

export function apply(ctx: PluginContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'lingualab: dictionaries')

  // The page itself, under the key the launcher row opens; `back` closes the
  // panel by hand.
  ctx.slots.inject('main', () =>
    ctx.slots.register(
      {
        name: 'main',
        key: PANEL_ID,
        locale: NS,
        inject: () => ({ back: () => ctx.layout.selectPanel(null) }),
      },
      LinguaLabPage,
    ),
  )

  // The way in. `order` is negative on purpose: the other rows of that menu are
  // plugin housekeeping, and the row that opens a page should not sit under them.
  ctx.slots.inject('sidebar.panellist.actions', () =>
    ctx.slots.register(
      {
        name: 'sidebar.panellist.actions',
        id: MENU_ROW_ID,
        order: -10,
        locale: NS,
        inject: () => ({ open: () => ctx.layout.selectPanel(PANEL_ID) }),
      },
      LauncherRow,
    ),
  )
}
