# Agent Note: the host half goes FSD too, in three layers

Status: proposed

## Problem

The client half was organised in FSD layers from its first line; the host half stayed flat. That was
cheap while the host held a scan, a notes file and a media route. Today `src/host/` holds 21 modules
and 4 test helpers beside 22 test files in one folder, and `src/index.ts` has grown to 825 lines, most
of them 16 route functions. Three things follow, and no check catches any of them.

- **There are cycles.** `library.ts` imports the pairing rule from `pairing.ts`, and `pairing.ts`
  imports `compareIds` back from `library.ts`. Choosing subtitles by hand added two more:
  `library.ts` and `subtitle-choice.ts` import each other, and `state.ts` reaches `library.ts` through
  `subtitle-choice.ts`. They work because ES modules tolerate a cycle that reads no value while it
  loads, which is a property nobody chose.
- **Capabilities reach into each other.** `timing.ts` imports `open.ts` for `resolveFileMedia` and
  `notes.ts` for `isSafeEpisodeId`, `review.ts` imports `notes.ts`, `video.ts` imports `library.ts`, and
  `subtitle-choice-route.ts` imports five neighbours. Each import was the shortest path at the time;
  together they mean a change to any file can break any other.
- **A route is far from its rules.** A capability keeps its rules in `src/host/` and its route in
  `src/index.ts`, so one change edits two files hundreds of lines apart. `subtitle-choice-route.ts` is
  the first module to pull the rules for one route out of `index.ts`, by habit rather than by rule.

## Proposal

**`src/host/` takes FSD's lower three layers, `shared`, `entities` and `features`, and Steiger checks
them with the configuration the client already uses.** It is the shape `dsh-plugin-framework` uses for
its host side. There is no `widgets`, `pages` or `app` layer: the host composes no UI, and the plugin
does not own its shell. `src/index.ts` keeps the `Config` schema and `apply()`, which collects the
routes the features export.

| Layer | Slice or segment | Comes from |
|---|---|---|
| `shared` | `http` | `media.ts` (content types, Range, JSON), `guard.ts`, and `methodAllowed` and `refuseText` from `index.ts` |
| | `fs` | the path-safety half of `places.ts`: `realPathOf`, `forbiddenReason`, `isInside`, `normalizeRel`, `parentOfRel`, `probeReadable` |
| | `ffmpeg` | `ffmpeg.ts` |
| | `config` | `config.ts` |
| | `lib` | `compareIds`, out of `library.ts` |
| | `testing` | `test-dir.ts`, `test-listen.ts`, `test-ffmpeg.ts`, `test-scenes.ts` |
| `entities` | `episode` | `library.ts` and `pairing.ts`, plus `isSafeEpisodeId` from `notes.ts` and `resolveFileMedia` from `open.ts` |
| | `open-state` | `state.ts` |
| | `subtitle-choice` | `subtitle-choice.ts` |
| | `video-cache` | `video-cache.ts` |
| | `place` | the place half of `places.ts`: `listPlaces`, `findPlace`, `resolveInPlace`, `placesPayload` |
| | `notes` | `notes.ts` |
| `features` | `browse` | `browse.ts`, with the places and browse routes |
| | `config` | the config route |
| | `import` | `import.ts` and its route |
| | `library` | the library route |
| | `media` | the media and file-media routes |
| | `notes` | the notes route |
| | `open` | `open.ts` without `resolveFileMedia`, and its route |
| | `progress` | `progress.ts` and its route |
| | `review` | `review.ts` and its route |
| | `subtitle-choice` | `subtitle-choice-rules.ts` (`subtitle-choice-route.ts` before step 2) and its route |
| | `timing` | `timing.ts` and its route |
| | `video` | `video.ts`, `video-jobs.ts`, `video-plan.ts` and the three video routes |

- **A slice is split into the client's segment names.** `api/` holds the route functions, `model/` the
  reads and writes, `lib/` the pure parts such as the video plan. Steiger needs at least one
  conventional segment in every slice, and `model/` and `lib/` are already the client's.
- **Entities that need each other go through `@x`.** There are six such imports, each through a file
  named after the slice that uses it: `episode` reads `open-state`, `subtitle-choice` and `video-cache`;
  `open-state` reads `subtitle-choice`; `notes` reads `episode` (for `scanSegments`) and `open-state`.
  They form no cycle: `subtitle-choice` and `video-cache` import no entity, and once `compareIds` is in
  `shared` the three cycles above are gone.
- **Features never import each other.** Each cross-feature import today moves one layer down:
  `resolveFileMedia` and `isSafeEpisodeId` to `entities/episode`, `readNotes` stays in `entities/notes`,
  and `contentTypeOf` sits in `shared/http`.
- **`src/shared/` stays where it is.** It is the contract both halves compile against, not the host's
  `shared` layer, and any host layer may import it, as the client does through its two bridges.
  `src/host-context.ts` stays beside `src/index.ts`. Steiger does not flag imports that resolve outside
  the analysed root, so neither needs an exception.
- **A slice's tests stay next to its code; four move up.** `routes.test.ts` drives `apply()`, and
  `host.test.ts`, `segments.test.ts` and `video-scan.test.ts` each exercise several slices at once. All
  four move to `src/`, beside `index.ts`, because they test the host as assembled.
- **`lint:fsd` runs Steiger twice.** Its CLI takes one path, so the script becomes one run over
  `src/client` and one over `src/host`, and `steiger.config.js` says it covers both.

## Order of work

Three commits, each with `npm run verify` green:

1. **Untangle in place.** While the folder is still flat, move `compareIds`, `isSafeEpisodeId` and
   `resolveFileMedia` to modules of their own, so the cycles and cross-feature imports are gone
   before anything moves.
2. **Bring the routes home.** Move each route function out of `index.ts`, next to the rules it
   calls, still flat.
3. **Move into layers.** `git mv` only, plus import paths and barrels, with no change in behaviour;
   add the second Steiger run; update the directory table in `AGENTS.md`, the skill (then
   `npm run skills:sync`) and both READMEs; rebuild `lib/`. This note moves to `implemented/` in
   the same commit.

## Alternatives considered

- **Leave it flat.** Free today. The cycles and cross-imports grow with every capability: choosing
  subtitles by hand alone added two cycles and a module that imports five neighbours.
- **Group by topic without layers.** Folders like `video/`, `library/` and `http/` shorten the listing,
  but nothing stops one folder from importing any other, so the cycles survive the move.
- **ESLint `no-restricted-paths` zones instead of Steiger.** That is how `dsh-plugin-framework` does it,
  and `eslint-plugin-import-x` is already installed. Rejected: the zones only know layer order, so
  same-layer imports, imports past a barrel and `@x` would each need patterns of their own, which
  Steiger already has and the client already runs.
- **Pass the segments into `readNotes` instead of `@x`.** It removes one import between entities, but
  every caller (the notes route and the review) would then have to scan first.
  `@x` is FSD's convention for exactly this case and keeps the dependency in one file that names its
  consumer.
- **All five client layers.** `widgets` and `pages` exist to compose UI, and the host composes none.

## Consequences

A new host capability is a feature slice with an `index.ts` and an `api/` segment, more ceremony than
one more file in a flat folder. In exchange, the import graph is checked rather than remembered, and a
capability's route and rules sit in one folder.

Implemented notes that cite `src/host/...` paths keep them: a note records the code it was written
against, and the paths are names in backticks, not links any check follows.

Related: [the client half is FSD](../../implemented/architecture/2026-10-08-fsd-client-half.md),
[choose an episode's subtitles by hand](../../implemented/feature/2026-10-12-choose-subtitles-by-hand.md).
