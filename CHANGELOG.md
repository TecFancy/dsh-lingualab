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

### Added

- The practice page is redesigned, drafted in Figma. The left side is a stage: the current sentence in large bold
  type, centred, the previous and next sentences faded above and below, the Chinese under the English. Under it is a
  rounded player card with the scrubber on top, speed, loop and shadow on the left, previous, play and next in the
  middle, and the Chinese display, the star and More on the right. The right side is the subtitle column, with the
  current sentence tinted in the brand colour and marked by a bar on its left edge, and an auto-follow switch in
  its header.
- The progress bar now spans the episode. Every sentence start is a hairline on it, hovering shows the time and
  the English of the sentence under the pointer, and a click or drag lands on the sentence that contains the
  point. A drag seeks once, on release, so the audio does not stutter through every sentence the pointer crossed.
- A sentence change has a motion: the new sentence fades in and lifts slightly, and the subtitle column scrolls
  smoothly to the current sentence and keeps it in a middle band rather than at the edge. All of it is off under
  the system's reduced-motion setting.
- Clicking an English word opens a small popover to copy it or add it to that sentence's note (written as
  `[word]`, and the sentence is kept if it was not). Playback is not interrupted.
- Shadowing mode (the Shadow button): each sentence stops after it plays and its English is blurred, so you say it
  first and then press `R` (or click Reveal) to read it. The next sentence, or pressing play again, covers it
  again.
- Finishing an episode shows a summary card: sentences heard, sentences kept, how many are still being practised,
  with Next episode, Listen again and All episodes. `Esc` or Not now dismisses it and stays put.
- The key hints are key caps, and the cap for a key the page just handled lights up. `R` reveals the English
  while shadowing.
- On the home page, Pick up where you left off is a large brand-tinted card, the episodes are a three-column card
  grid (subtitle badge and progress bar), and a dashed drop strip sits at the bottom. Notes and the five steps are
  drawers that slide in from the right: note cards carry the tick, the note and the tags, the five steps have an
  overall progress bar, the next step is highlighted, and ticking one has a small animation.

- Listening positions and the five-step ticks follow you to another device. They used to live only in one
  browser's `localStorage`, so a second device, a private window or a cleared cache started from nothing, while the
  notes (which are files in the library) already did not. The host now keeps them in a hidden
  `.lingualab-progress.json` at the library root, next to the `notes.md` files, through the new
  `GET`/`POST /lingualab/progress` route; each browser keeps a cache of it and syncs on opening, a few seconds after
  a change, when the tab comes back and when it is hidden. A `POST` merges rather than replaces, and the newest stop
  per episode wins, so an older device cannot overwrite a newer one. The file is written through a temporary file
  and a rename, a corrupt one reads as empty, and the library scan ignores it. Bookmarks and ticks already in a
  browser are kept and uploaded on the first sync.

### Changed

- Floating panels (the drawers, the finish card, the popovers) no longer use the theme's `bg-overlay`. That token
  is the host's scrim colour, a light gray in dark mode, and a panel painted with it looked washed out. They use
  `bg-layer-1` now.
- The kept-sentences drawer is redesigned to match the design file: pill tabs, a card per sentence with a replay
  chip, edit and delete icons, words picked from the stage shown as chips in a memo box, and an empty state with
  an icon. The five-steps drawer shares its header.
- Loading states are skeletons now, not a line of text. The home page shows placeholders shaped like the resume card
  and the episode grid, the practice page shows placeholders for the sentence and for the transcript column, and
  the start button shows a spinner while an episode opens. The placeholders fade in after a short delay, so a fast
  load never flashes one. The transcript column no longer claims "no subtitles" while they are still loading.

### Fixed

- Deleting a kept sentence did nothing. The two-click confirmation was cancelled by the page taking focus back on
  every mouse-down, so the second click never found the armed button. Delete now removes the row at once and a
  toast offers an undo for six seconds.
- The page container no longer draws an inset ring when it has focus. After clicking the page's blank space or
  pressing a shortcut, that ring looked like a black border.
- A tick left focus on its checkbox, which switched off `Esc` and the other shortcuts; a checkbox no longer counts
  as typing.
- The total length was cleared to 00:00 when the subtitles finished loading after the audio's metadata, which
  left the progress bar unusable; it is kept now.

## [0.3.1] - 2026-10-10

### Changed

- 「Browse existing files」 is redesigned. The card is larger and floats over a blurred mask. The
  path is a row of clickable segments with an up button, and the workspace picker is styled like
  the other controls. The list is grouped into folders, audio and other files, each with a count.
  The footer carries the one big action, 「Use as media folder」, and says which folder it applies to.
- The filter box takes focus when the layer opens and after every folder change. Arrow keys move
  a highlight, Enter opens it, Backspace on an empty filter goes up one level, Esc closes.
- Subtitle badges carry a tone: green for both tracks, amber for none, neutral for one track. The
  size of each audio file is shown next to its subtitle files. Non-audio files are dimmed.
- An empty folder or a filter with no match now says so and what to do next.

## [0.3.0] - 2026-10-10

### Added

- A home page. The panel opens on the episode to pick up where you left off, the rest of the
  library as rows that open on a click, and a drop target; opening an episode switches to the
  practice view and its back button returns here. The page remembers where you stopped in each
  episode, in this browser, and 「Continue practising」 seeks there.
- Files come in by dropping. `POST /lingualab/import` receives one audio or subtitle file into an
  episode folder under the media folder. The page groups a drop by name, so an audio file and the
  subtitles that start with its name go together, sends them one at a time, retries a "busy"
  answer, and skips a group's subtitles when its audio was refused. A subtitle dropped on its own
  joins the episode folder it names. An empty library shows a drop target instead of a path field.
  The host never overwrites a file that exists, accepts only the extensions the scan reads, caps
  one file at 2 GB (also against a body that lies about its length), cleans names, refuses a media
  folder that is a system folder or a folder that resolves outside the library, writes to a hidden
  temporary file that is placed with an exclusive create, sweeps stale `.part` files left by a
  crash, removes an episode folder it made and could not fill, and takes at most two uploads at
  once (a third gets `429` and `retryable`).
- A star on the transport row and on every subtitle line keeps a sentence, and the same star (or
  `S`) takes it back. Kept lines show a filled star at rest. A sentence that carries a note, a tag
  or a tick is never un-kept by a star; the drawer opens instead.
- The notes drawer has three views, 「Practising」, 「Learned」 and all. Ticking a sentence moves it to
  「Learned」 without deleting it.
- `src/shared/stem.ts`: the file-name pairing rule, used by the host's scan and the page's drop
  grouping alike. There were two hand-written copies.

### Changed

- Every route, reads included, now goes through the host's own request trust (`connection.admit`:
  a loopback `Host`, a matching `Origin`, the signed session cookie) and answers `401` or `403`
  otherwise, or `403` when the deployment has no connection service. Before this the routes were
  open to any page that rebound its hostname to 127.0.0.1 and to any local process. The custom
  request header on `/lingualab/import` is kept as a second check, not as the access control.
- The practice transport row holds six controls instead of thirteen. The A and B marks, the repeat
  count and the list of keys moved behind a 「More」 menu.
- Shortcuts ignore any chord with Ctrl, Cmd or Alt, so Ctrl+S no longer un-keeps a sentence and
  Ctrl+C copies again. Escape closes a layer on the home page too.
- A file dropped anywhere on the page, or while an import is running, is claimed and ignored
  instead of being opened by the browser in place of the page.
- The episode picker is now only 「Browse existing files」, for material outside the media folder.
  Choosing among the episodes you already have is the home page, which also lists the episode
  currently open when it lives outside the media folder.
- The media folder is set from a quiet line at the bottom of the home page, and no longer appears
  inline on an empty library.
- The stylesheet reads only theme tokens the host declares. The four values it used to take from
  tokens that do not exist (a tertiary label, a third layer, a mask, a hover fill) are derived from
  declared ones, so light and dark both follow the theme.
- `MAX_PHRASES` is 500, a sanity ceiling for a runaway client, not a rule of the method.

### Removed

- The seven-phrase ceiling and the chooser that asked which phrase to replace. The decision it
  forced came mid-sentence, with the audio still playing; the 「Learned」 view gives the same short
  working set without asking.
- The note composer dialog. Notes are edited in the drawer.

### Fixed

- A bilingual subtitle paired with a separate English one showed each sentence in three lines, with the English twice. Only the Chinese lines of the second track are folded in now.
- The speed button stopped working once it reached 2x. It now wraps back to 0.5x; the [ and ] keys still stop at the ends.
- Chinese "always" and "dimmed" looked identical. Always now shows the Chinese at the English size and colour, dimmed keeps it small and faint.
- A kept sentence stopped matching after a reload on folder episodes. `notes.md` stores whole
  seconds, so one kept at 12.48 s read back as 12; the star showed empty, the wrong row showed a
  filled one, and pressing it again wrote a duplicate nothing could remove. Matching is now by whole
  second and text, for the transport star, the list and the toggle alike.
- The system-folder guard never matched anything on Windows (it compared against `/etc` and the
  like) and could be bypassed with an 8.3 short name such as `C:\PROGRA~1`. It now canonicalises
  with the native `realpath`, knows the Windows system folders, and runs on the import root too.
- Two uploads of the same name at once shared one temporary file and one of them threw. Temporary
  names are random now.
- Five host tests that failed on Windows (POSIX path literals, 8.3 temp paths) and now pass; the
  platform rules are tested for both flavours on every platform.

## [0.2.0] - 2026-10-09

### Changed

- The page no longer takes a row in the left rail. It is reached from a card on the 「应用」 page —
  `dsh-apps-panel` carries an entry whose `panel` names this plugin's `main` key — so the page has
  one entry point instead of two, and the rail stops growing a row per plugin. In a profile without
  that launcher the page is registered and there is no way in.
- The page was redesigned around one thing to look at: a fixed stage holding the sentence being worked
  on, the subtitle list as the only scroller, and a top bar that opens layers for picking an episode,
  keeping notes and setting the media folder. The folder form and the notes list no longer sit
  permanently beside the practice.
- Picking material is browsing now, not typing. `GET /lingualab/places`, `GET /lingualab/browse` and
  `POST /lingualab/open` let the picker walk a workspace or the library itself, open a single audio
  file together with the subtitles beside it, and set the library root by clicking 「用作媒体库」.
  File episodes are served from `GET /lingualab/file-media/<id>/<file>` and keep their notes in the
  plugin's profile, because the plugin does not write into the material folder.

### Fixed

- Audio files sitting directly in the library root used to be invisible: the scan only looked at
  subfolders, so the file you had just copied in appeared in no list. They now show up in the picker
  and can be opened on their own.

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
