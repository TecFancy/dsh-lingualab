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
