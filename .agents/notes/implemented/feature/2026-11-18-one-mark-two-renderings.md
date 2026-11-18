# Agent Note: one mark, drawn twice — the package icon and the sidebar row

Status: implemented

## Problem

The plugin had a mark in exactly one place: `HeadphonesIcon`, a 16-unit stroke drawing used by the
row it contributes to the host's 「更多」 menu. Everywhere else it was anonymous. The Plugins page
drew the host's generic placeholder tile, and the plugin market's card fell back to the owner's
GitHub avatar — so the same plugin looked like three different things depending on where a reader
met it, and none of them said what it does.

The package icon is not decoration here. `package.json#icon` is read by the host, inlined as a data
URL, and drawn in an `<img>`; the market card reads the same field through the registry. That
rendering path is why the file cannot use `currentColor` or the page's theme tokens: neither reaches
an image. A mark written the way the rest of this repository's icons are written would render
black-on-black in dark mode, and nothing in the repository reads the file to notice.

## Decision

**One drawing, two renderings.**

- `icon.svg` at the repository root is the package icon: headphones with one subtitle line between
  the earcups, filled white on a `#3B54C4` rounded tile, on a 36-unit canvas. It is declared as
  `package.json#icon`, exported as `./icon`, and listed in `files` so it ships.
- `HeadphonesIcon` keeps the same shape as a 16-unit stroke drawing, plus the same subtitle line, so
  the menu row and the tile are recognisably the same plugin.
- `assets/icon-512.png` and `assets/icon-180.png` are raster copies for storefronts that want a PNG.
  They are not referenced by the plugin; they exist because the registry's `icon` field accepts only
  raster images, and regenerating them from the SVG is a one-command job rather than a redraw.
- `check-host` gains a sixth section: the icon is declared, exported, shipped, free of
  `currentColor` and `var(--…)`, and drawn on the 36-unit canvas. Comments are stripped before those
  two checks, because the file explains the rule in prose and a check that reads its own explanation
  as a violation would push the comment out of the file it belongs in.

The colour is a single flat `#3B54C4` rather than a gradient. A gradient was the first draft and it
survived the 36px tile, but at 14px in the menu row the light end washed out against the white
background and the mark read as a smudge; a flat fill holds its edge at both sizes.

## Alternatives considered

**Keep the stroke icon and let the host draw its placeholder.** Rejected: the placeholder is the same
tile every unmarked plugin gets, so the plugin stays anonymous on the two surfaces where a reader is
deciding whether to install it.

**Draw a second, richer illustration for the tile.** Rejected: two marks for one plugin make the pair
harder to recognise, not easier, and the row has room for one shape at 14px. The subtitle line is the
one addition that survives both sizes.

**Use `currentColor` so the tile follows the theme.** Rejected: the host renders the icon as an image,
where `currentColor` resolves to black. The mark would disappear in dark mode, and only a browser
would show it.

**Ship only the SVG.** Rejected: the registry's `icon` field accepts PNG/JPEG/WebP and refuses SVG, so
a storefront that wants a raster tile would have nothing to point at.

## Why

The mark says what the plugin does in one shape — listening, and the sentence you are listening to —
and it is the same shape in the menu, on the Plugins page and in the market. The gate is what keeps
that true: this file has no second reader in the repository, so without it a `currentColor` edit or a
dropped `files` entry would ship silently and only show up as an invisible tile in someone's browser.
