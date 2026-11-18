# Agent Note: the market card reads a repository-root `screenshots.json`, behind a gate

Status: implemented

## Problem

The plugin market (dsh-market) draws a card thumbnail strip from a curated list, and it
reads that list from `screenshots.json` beside the plugin's `package.json`. It does not
read the README for the card: README images are only a fallback inside the install
dialog, and that dialog never opens for an already-installed plugin. So a repository
with four screenshots in `docs/assets/` and no `screenshots.json` shows a blank card.

That file has no second reader in this repository. Rename a `docs/assets/` image and
`links:check` catches the README reference while `screenshots.json` keeps pointing at a
404. The upstream registry documents the cost: 41 of 773 published screenshots had gone
404 before it started probing.

## Decision

Put `screenshots.json` at the repository root, listing four `docs/assets/` images in the
order the card should show them: the practice view, the home, the kept sentences in the
dark theme, and the iPad portrait layout.

Add `npm run screenshots:check` (`scripts/check-screenshots.mjs`) and put it in the fast
tier of `verify`, next to `links:check`.

The gate mirrors the upstream contract, so a declaration that passes here is one the
registry accepts: 1 to 8 entries, a relative path that stays inside the repository (no
leading `/`, no `..` segment) or an absolute https URL on GitHub hosting, a raster image
(PNG/JPEG/WebP — the market drops SVG before an `<img>` exists), every file present, and
no image declared twice.

## Alternatives considered

**Rely on the README extraction.** Rejected: the extraction feeds the install dialog
only, and an installed plugin never opens it. The card stays blank.

**Add a key to the registry's own `data/screenshots.json`.** Rejected: the upstream
`contributing.md` asks authors not to add new keys there — it is a fallback for older
entries with a deletion date — and an absolute URL written over there can only rot
silently.

**Ship the images inside the npm package.** Rejected: the registry reads the repository
at HEAD, not the published package, so the `files` list changes nothing.

**Add the JSON without a gate.** Rejected: that is how the 41 dead screenshots happened.
Nothing else in the repository references this file, so nothing else would notice it
going stale.

## Why

The screenshots live in this repository, so changing one is a push here and the next
nightly build picks it up — no pull request to the registry, no waiting on a maintainer.
A relative path breaks visibly in this repository when the image is renamed, and the
gate turns that into a failed check instead of a 404 on someone else's page.
