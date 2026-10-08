/**
 * dsh-lingualab — client half, entry point.
 *
 * One left-rail entry that opens a whole page in the centre column, leaving the
 * current Session untouched:
 *
 *   · `sidebar.panellist` (list/root)  — the rail row; its `id` is the panel key
 *   · `main`              (keyed/root) — the centre-column body under that key
 *
 * Both registrations use the same string (`lingualab`): the sidebar resolves the
 * row's `label`, orders rows by `order`, calls `ctx.layout.selectPanel(id)` on
 * click, and the frame dispatches `main` with
 * `entryKey = activePanelId ?? 'conversation'`.
 *
 * `order: 40` places the row after 插件 (0), 自动化任务 (10) and 应用 (20). The
 * number is a hint, not a contract: a fresh id in a list slot adds a cell, and
 * `main` only replaces an occupant that already owns the key.
 *
 * This file is the wiring only. The page lives in `pages/lingualab/`, the pieces
 * it is built from in `widgets/` and `features/`, the subtitle model in
 * `entities/`, and the copy in `locale.ts`. The host seam it calls is typed in
 * `context.ts`. `lib/client.js` is what the shell fetches, built from here.
 */
import type { PluginContext } from './context.ts'
import { LingualabIcon } from './icons/rail.tsx'
import { en, zh } from './locale.ts'
import { LingualabPage } from './pages/lingualab/index.ts'

const NS = 'dsh-lingualab'
const PANEL_ID = 'lingualab'

/** Client packages whose services this plugin uses; the loader orders them first. */
export const inject: readonly string[] = ['slots', 'locale', 'layout']

export function apply(ctx: PluginContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'lingualab: dictionaries')
  const t = ctx.locale.bind(NS)

  // Left rail row, after 插件 (0), 自动化任务 (10) and 应用 (20).
  ctx.slots.inject('sidebar.panellist', () =>
    ctx.slots.register(
      {
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 40,
        locale: NS,
        label: () => t('panel'),
      },
      LingualabIcon,
    ),
  )

  // Centre column body under that key; `back` closes the panel by hand.
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
