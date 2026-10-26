# Agent Note: the entry moved into the left rail's More menu

Status: implemented

## Problem

The entry was a card on the 「应用」 page. That page is a launcher for self-hosted web apps: a card
there opens a URL in another tab, and every card in the grid does that. LinguaLab is a page inside
the shell, so it was the one tile in the grid that behaved differently, and the grid cannot show
that difference.

Carrying the entry in another package also handed reachability to someone else: in a profile
without `dsh-apps-panel` the page was registered and had no way in at all.

The rail still should not grow a row per page, because a rail row costs width whether or not that
page is somewhere you go on purpose.

## Decision

The entry is one row of `sidebar.panellist.actions`, the list the left rail's 「更多」 menu renders.
This plugin registers that row itself: the label comes from its own dictionary, the row is drawn
with the host's menu primitive, and selecting it calls `ctx.layout.selectPanel('lingualab')`.

The row takes `order: -10`. The other rows of that menu are plugin housekeeping, and the one row
that opens a page belongs above them.

The card is dropped from `dsh-apps-panel`'s shipped defaults in the same change, so the page keeps
one entry rather than gaining a second one.

## Alternatives considered

- **Keep the card and add the row.** Two doors to one page; the reason for moving is that one page
  should have one entry, and the card is the one that sits in the wrong room.
- **Put the page back on the rail as a `sidebar.panellist` row.** One click instead of two, at the
  cost of a fifth rail row for a page opened now and then. That is the choice the previous note
  turned down, and this decision does not reopen it.
- **Let `dsh-apps-panel` keep the card and ask this plugin for it.** The previous note already
  rejected the cross-plugin extension point; moving the entry inwards removes the agreement instead
  of complicating it.

## Consequences

- The row needs a host that declares `sidebar.panellist.actions`, which is 0.2.1-rc.3 and later. On
  an older host the registration lands nowhere and the page has no entry; the plugin declares no
  `engines` field, so nothing warns about it.
- Reaching the page still takes two clicks, the same as the card did, but the clicks no longer pass
  through the launcher page, so its card grid and its embed probes no longer run on the way in.
- The string `lingualab` is no longer an agreement between two packages: it is only this plugin's
  `main` key, and `dsh-apps-panel` no longer carries a default entry that names it.
