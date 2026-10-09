/**
 * dsh-lingualab — client half, entry point.
 *
 * One registration: `main` (keyed/root), the centre-column body under the key
 * `lingualab`, leaving the current Session untouched. The frame dispatches `main`
 * with `entryKey = activePanelId ?? 'conversation'`.
 *
 * The way in is a card on the 「应用」 page. `dsh-apps-panel` keeps that launcher,
 * and its registry carries an entry whose `panel` field names this key; clicking
 * the card calls `ctx.layout.selectPanel('lingualab')`, which is the same call a
 * rail row would make. So this plugin no longer registers a
 * `sidebar.panellist` row: one page, one entry, and the rail stops growing a row
 * per plugin.
 *
 * That entry lives in another package, so the two have to agree on the string
 * `lingualab`. Changing `PANEL_ID` here is a breaking change for any launcher
 * entry that names it, and `dsh-apps-panel`'s `scripts/check-host.mjs` is where
 * the other side of that agreement is written down.
 *
 * This file is the wiring only. The page lives in `pages/lingualab/`, the pieces
 * it is built from in `widgets/` and `features/`, the subtitle model in
 * `entities/`, and the copy in `locale.ts`. The host seam it calls is typed in
 * `context.ts`. `lib/client.js` is what the shell fetches, built from here.
 */
import type { PluginContext } from './context.ts'
import { en, zh } from './locale.ts'
import { LingualabPage } from './pages/lingualab/index.ts'

const NS = 'dsh-lingualab'
const PANEL_ID = 'lingualab'

/** Client packages whose services this plugin uses; the loader orders them first. */
export const inject: readonly string[] = ['slots', 'locale', 'layout']

export function apply(ctx: PluginContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'lingualab: dictionaries')

  // The page itself, under the key the launcher card names; `back` closes the
  // panel by hand.
  ctx.slots.inject('main', () =>
    ctx.slots.register(
      {
        name: 'main',
        key: PANEL_ID,
        locale: NS,
        inject: () => ({ back: () => ctx.layout.selectPanel(null) }),
      },
      LingualabPage,
    ),
  )
}
