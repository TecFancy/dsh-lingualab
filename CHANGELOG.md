# Changelog

All notable changes to this plugin are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the version numbers
are [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Two rules make this file useful rather than decorative, and `npm run verify`
enforces both:

1. There is always an `## [Unreleased]` section at the top. Work in progress is
   recorded there as it lands on `development`.
2. The first released heading equals the `version` field in `package.json`. That
   is what "opening a pull request into `main` updates the version" means in
   practice: `npm run release -- minor` moves the unreleased entries under a dated
   heading and bumps the manifest in the same commit.

This repository is not published to npm. A version number here marks a state of
the plugin that was installed and used, not an artifact on a registry.

## [Unreleased]

### Changed

- The page no longer takes a row in the left rail. It is reached from a card on the 「应用」 page —
  `dsh-apps-panel` carries an entry whose `panel` names this plugin's `main` key — so the page has
  one entry point instead of two, and the rail stops growing a row per plugin. In a profile without
  that launcher the page is registered and there is no way in.

## [0.1.5] - 2026-10-08

### Added

- The page can now choose the media folder. A 「Media folder」 card shows the folder
  in effect, offers the ones each workspace would use by convention, and accepts a
  typed path; saving it writes `libraryRoot` into this plugin's profile entry
  through the settings service, so the value lives in one place and the Plugins
  page sees the same thing. New route: `GET|POST /lingualab/config`.

### Fixed

- Reading the workspace registry through the context property threw whenever the
  service was absent, and every route answered an empty `400` as a result — which is
  why opening the panel with no `libraryRoot` configured showed nothing at all. It is
  read through `ctx.get` now, which answers `undefined` instead of throwing.
- A volatile config field is a box, not a value: it is read through `get()`. Read as
  a plain string, every route threw and the page stayed empty even after the folder
  card was added.

## [0.1.4] - 2026-10-08

### Added

- The changelog is now a bilingual pair (`CHANGELOG.md` / `CHANGELOG.zh.md`), and a
  GitHub Release carries both sides: Chinese first, then a rule, then English. The
  release body was already generated from the changelog, so the Chinese reader was
  the one it left out.
- `npm run release` now refreshes the pairing record in the same commit. Moving
  entries into a dated section changes the section hashes, so without this step the
  release commit fails its own pre-commit gate — which is how the step was found.

## [0.1.3] - 2026-10-08

### Added

- Pushing a `v*` tag now publishes a GitHub Release whose body is that version's
  section from this file (`scripts/release-notes.mjs`, run by
  `.github/workflows/release.yml`). The tag stays a human decision; everything
  after it is mechanical. The workflow also refuses a tag whose name does not match
  `package.json`, so the wrong commit cannot be released under a version.

## [0.1.2] - 2026-10-08

### Fixed

- The empty cue and phrase lists are module-level constants. Returning a fresh
  `[]` while an episode was loading put the page's player-reset effect into an
  infinite render loop. Type checking, linting and the unit tests were all green
  on that build; opening the panel in a real test instance was what caught it.

### Changed

- TypeScript is pinned to `~5.9.3` rather than `~6.0.2`. The Steiger plugin's
  `@feature-sliced/filesystem` depends on `typescript@^5.8.3`, so a root pin on the
  6.x line left two copies in the tree and `npm ci` on a clean runner re-resolved a
  version the lock did not carry. One line, one version, and the checks all pass on
  both 5.9 and 6.0.
- The repository skill records two traps found while verifying: replacing a `file:`
  tarball without changing its version does not refresh the installed copy, and a
  client change has to be looked at in a browser because no static check renders
  the component tree.

## [0.1.1] - 2026-10-08

### Fixed

- The seek gate now waits for the audio element's `seeked` event instead of
  guessing from the reported position. A sentence loop could count a pass that
  never played — or, on a cue shorter than one `timeupdate`, wrap forever — because
  a stale position near the loop start was read as "the seek arrived".
- A loop that has used up its repeat count stops *and rewinds to the start of the
  window*. Previously it stopped just past the end, so pressing play again
  re-triggered the same stop on the next tick and the button looked broken.
- Switching episodes no longer plays the new audio with the previous episode's
  cues: the cue list is tagged with its episode and is empty until the new
  subtitles arrive.
- A pending notes write is flushed when the episode changes instead of being
  dropped with the debounce timer, and a mutation that arrives after the switch is
  discarded rather than written under the new episode's id.
- The media route answers an unsatisfiable `Range` with `416` instead of a silent
  whole-file `200`, ends the response when a read fails mid-stream (an unhandled
  stream error takes the host process with it), and drops the connection when a
  request body exceeds its limit.
- One unreadable episode folder no longer fails the whole library listing.
- A subtitle line containing `|` survives a save and reload: the notes separator
  is escaped on the way out and unescaped on the way in.
- The notes path is compared by real path, so an episode folder that is a symlink
  out of the library is refused rather than written through.
- Handled keyboard shortcuts stop propagating, so the space bar cannot reach the
  conversation behind the panel.

## [0.1.0] - 2026-10-08

### Added

- The 「语言实验室」 rail entry and its centre-column page, registered through
  `sidebar.panellist` and `main` under the key `lingualab`.
- Episode library rooted at a configurable folder: an audio file, up to two
  subtitle files and an optional `notes.md` per episode, with natural ordering,
  an optional `manifest.json`, and a summary of what has been noted.
- Subtitle handling ported from the repealed repeater app: SRT, VTT and LRC
  parsing, BOM and GB18030 decoding, ASS/SSA style-tag stripping, English above
  Chinese, and four Chinese display modes.
- Player controls: play and pause, sentence stepping, click-to-seek, sentence
  looping, A-B looping with a repeat count, and ten pitch-preserving speed steps.
- Notes panel with the seven-phrase ceiling from the study method: the counter is
  always visible, and the eighth phrase has to replace one.
- Five-step tracker with a stopwatch per step, stored per episode in
  `localStorage`.
- Host routes `GET /lingualab/library`, `GET|HEAD /lingualab/media/<episode>/<file>`
  (with `Range`) and `GET|POST /lingualab/notes`.
- Repository engineering: `scripts/verify.mjs` with fourteen checks, the FSD
  layer rules, the `.agents/notes` tree with its own gates, and CI on
  `development` and on pull requests into `main`.
