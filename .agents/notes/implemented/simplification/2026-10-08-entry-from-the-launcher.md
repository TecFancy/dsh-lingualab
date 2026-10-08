# Agent Note: the entry moved to the launcher, and the rail row went with it

Status: implemented

## Problem

The page had a row in the left rail at order 40, under the plugin, schedule, launcher and skills
rows. That row was one of five, and every plugin that ships a page adds one more: the rail pays for
each page in width, whether or not the page is somewhere you navigate to on its own.

「应用」 already is that place — a launcher that lists the things you open. 语言实验室 is one of
them, and it was the only entry there that also had a door of its own.

## Decision

Drop the `sidebar.panellist` registration and keep `main` under the key `lingualab`. The entry is
a card on the 「应用」 page: `dsh-apps-panel`'s registry carries an entry whose `panel` field names
this key, and clicking the card calls `ctx.layout.selectPanel('lingualab')` — the same call a rail
row makes.

`retainMainPanels` keeps the panel selectable because it retains every key a `main` entry claims,
so dropping the row does not make the selection fall back to the conversation.

## Alternatives considered

- **Keep both entry points.** Two doors to one room. The rail keeps paying for a row whose only job
  is a link to a page the launcher already lists.
- **A config flag that chooses between them.** The client half would have to read the plugin's
  config before it can register a row, which means an extra round trip and a row that appears late.
  It buys a case nobody has: this plugin is installed where the launcher is.
- **Let the launcher ask this plugin for a card.** That is a cross-plugin extension point with one
  caller, and it moves the entry into code when the point of the launcher's registry is that the
  owner edits the list without touching a bundle.

## Consequences

- The rail icon (`src/client/icons/rail.tsx`) and the `panel` locale key are unused and deleted.
- The plugin now needs `dsh-apps-panel` to be reachable at all. In a profile without it the page is
  registered and there is no way in; the README's Status section says so.
- `lingualab` is a contract between two packages that never import each other. This side owns the
  string, and the launcher side writes its half down in `scripts/check-host.mjs`.
