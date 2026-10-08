# dsh-lingualab

English | [简体中文](README.zh.md)

The 「语言实验室」 panel: **a card on the 「应用」 page → a whole page in the centre column**,
leaving the current Session untouched. The page turns media that already sits in the
workspace into intensive-listening practice: one episode at a time, sentence by sentence,
with the notes written back to disk where the agent can read them.

## What it does

The library root holds one folder per episode. A folder carries an audio file, up to two
subtitle files, and an optional `notes.md`:

```text
notes/learning/english/media/
  S01E01/
    audio.mp3
    S01E01.en.srt
    S01E01.zh.srt
    notes.md
```

The scan accepts `.mp3`, `.m4a`, `.wav`, `.ogg`, `.opus` and `.flac` audio, `.srt`, `.vtt`
and `.lrc` subtitles, and treats a single subtitle file that carries CJK text as both
tracks, because a bilingual subtitle is one file with two languages in it. A folder with no
audio is listed but not playable, and an optional `manifest.json` at the root may set the
play order, rename episodes and name the episode to open first.

The folder is configurable from the page: the 「Media folder」 card shows what is in
effect, offers the folder each workspace would use by convention, and accepts a typed
path. Saving it writes `libraryRoot` into the plugin's profile entry through the
settings service, so there is one home for the value and no restart is needed.

Practice is built around the sentence, not the file: click a subtitle line to jump there,
loop the current sentence, drag out an A-B region, change speed in ten steps without
changing pitch. Subtitles put English above Chinese whatever the source order, and the
Chinese side has four display modes so the native language never becomes the thing being
read.

Notes follow the study method this panel was built for: **at most seven phrases per
episode**. When the list is full the eighth phrase has to replace one, which is the point —
the ceiling is a decision-forcing device, not a storage limit. The file is markdown with a
checklist line per phrase, so it stays readable in an editor and greppable by the agent
that runs the next-day review.

## Status

Both halves are written: the library scan, the media route with `Range` support and the notes
read/write path on the host side, and the page itself — episode list, player, sentence-level
subtitles, the seven-phrase notes panel — on the client side.

The page has **no rail row of its own**. It is registered as a `main` panel under the key
`lingualab`, and the entry is a card on the 「应用」 page, which `dsh-apps-panel` draws from its
registry (`panel: lingualab`). That is a deliberate trade: the rail stops growing a row per
plugin, and in exchange this plugin needs a launcher to be reachable. In a profile without
`dsh-apps-panel`, the page is registered and unreachable.

It is developed on `development` and released by pulling into `main`; nothing here is
published to npm.

## Releasing

Work lands on `development`. A pull request into `main` is a release, and the
version bump travels with it:

```sh
npm run release -- patch|minor|major   # bump, move Unreleased into a dated section, commit
```

`npm run verify` keeps both sides of the changelog and the manifest in step, and the
`version-bump` job in CI fails a pull request into `main` that does not raise the
version. After the merge, tag the commit that carries the release:

```sh
git checkout main && git pull
git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z
```

Pushing the tag publishes a GitHub Release whose body is that version's sections
from the changelog pair, Chinese first and English after; the tag is the one manual
step, and everything after it is mechanical. Nothing is published to npm — the plugin is installed from a local path
or a tarball, so a version number here marks a state that was installed and used,
not an artifact on a registry.

## Host routes

| Route | Kind | What it answers |
|---|---|---|
| `GET /lingualab/library` | exact | Every episode folder, its files, and how much has been noted |
| `GET`, `HEAD /lingualab/media/<episode>/<file>` | prefix | Audio and subtitle bytes, `206` for a range request |
| `GET`, `POST /lingualab/notes` | exact | One episode's phrases, read or replaced wholesale |

## Repository layout

```text
src/index.ts                 host half: the three routes and the config
src/host-context.ts          the slice of the host plugin context we call
src/host/                    library scan, media serving, notes read/write
src/shared/                  the wire contract and the notes markdown format
src/client/entities/cue/     subtitle parsing, decoding and bilingual line ordering
src/client/                  the page, its widgets, and the two slot-free features
lib/                         tsdown output, committed: what the shell fetches
locale/                      the Plugins page display name and summary
cordis.patch.yml             bundle patch (loader row `lingualab`)
```
