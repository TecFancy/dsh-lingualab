# dsh-lingualab

English | [简体中文](README.zh.md)

The 「语言实验室」 panel: **a card on the 「应用」 page → a whole page in the centre column**,
leaving the current Session untouched. The page turns media that already sits in the
workspace into intensive-listening practice: one episode at a time, sentence by sentence,
with the notes written back to disk where the agent can read them.

## What it does

The page opens on a **home**: the episode to pick up where you left off, the rest of the
library as rows that open on a click, and a drop target. Opening an episode switches to the
**practice** view; its back button returns to the home.

**Adding material is dropping it.** Drag an audio file and its subtitles onto the page, or press
「Add files」. Subtitles pair up by name: a file that starts with the audio file name belongs to
it (`s01e01.mp3` owns `s01e01.en.srt` and `s01e01.zh.srt`), and a lone subtitle beside a lone
audio file is a pair whatever they are called. Several episodes can be dropped at once. The host
files each one in its own folder under the media folder, **never overwrites a file that is
already there**, and says what it skipped. With nothing in the library, the home is only the
drop target; nobody has to learn what a media folder is first.

The library root holds one folder per episode. A folder carries an audio file, up to two
subtitle files, and an optional `notes.md`; that is also the layout an import produces:

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

Where the files live is one quiet line at the bottom of the home, with 「Change」. The folder is
set without typing a path: the layer's primary way in is 「Browse existing files」 — walk to the
folder, click 「Use as media folder」, and the host resolves the path itself. A typed absolute path
survives as the fallback for a mount point no workspace contains. Saving writes `libraryRoot`
into the plugin's profile entry through the settings service, so there is one home for the value
and no restart is needed.

An episode is not required to be a folder. Audio sitting loose in the library root, or anywhere
under a browsable place, opens on its own: 「Browse existing files」 lists it, pairing subtitles by
file name, and the host remembers the file so its bytes can be served and its notes have
somewhere to go.

Practice is built around the sentence, not the file. The transport row holds only what is used
every minute: previous and next sentence, play, speed, loop this sentence, the Chinese display
and the star. The A-B region, its repeat count and the list of keys sit behind 「More」. Click a
subtitle line to jump there and play it; speed has ten steps and never changes pitch. Subtitles
put English above Chinese whatever the source order, and the Chinese side has four display modes
so the native language never becomes the thing being read. The page remembers where you stopped
in each episode, in this browser, and the home offers it as 「Pick up where you left off」.

**Keeping a sentence is a star** on the transport row and on each subtitle line, or `S`. The same
star takes it back. The kept sentences sit in a drawer with three views, 「Practising」, 「Learned」
and all: tick a sentence once it sticks and it leaves the first view without being deleted, so
the working set stays short by choice rather than by a ceiling. A folder episode's notes are
markdown with a checklist line per phrase, so they stay readable in an editor and greppable by
the agent that runs the next-day review; a file episode's notes live in the plugin's profile,
because the plugin does not write anywhere in the material folder except to add the files you
hand it.

## Status

Both halves are written: the library scan, the import route, the media routes with `Range`
support, the browsable picker and the notes read/write path on the host side, and the page itself
— the home, the practice view, the notes drawer and the layers for browsing and for the media
folder — on the client side.

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

Every route, reads included, is answered only for a request the host admits (a loopback `Host`, a matching `Origin`, the signed session cookie): 401 or 403 otherwise, and 403 when the deployment has no connection service.

| Route | Kind | What it answers |
|---|---|---|
| `GET /lingualab/library` | exact | Every episode folder and loose audio file, the open episode, and how much has been noted |
| `GET`, `HEAD /lingualab/media/<episode>/<file>` | prefix | Audio and subtitle bytes of a folder episode, `206` for a range request |
| `GET`, `HEAD /lingualab/file-media/<id>/<file>` | prefix | The same for a file episode, from the paths recorded when it was picked |
| `GET`, `POST /lingualab/notes` | exact | One episode's phrases, read or replaced wholesale |
| `GET`, `POST /lingualab/config` | exact | Where the library is, and how to change it — by path, or by place and relative folder |
| `GET /lingualab/places` | exact | The roots the picker may browse: every workspace, plus the library itself |
| `GET /lingualab/browse` | exact | One directory under one place: directories, audio, subtitles, and each audio file's subtitle pairing |
| `POST /lingualab/open` | exact | Make one episode current: a scanned folder, or a single audio file with the subtitles beside it |
| `POST /lingualab/import` | exact | Receive one dropped audio or subtitle file into an episode folder, never overwriting; needs the `x-lingualab-import: 1` header and an admitted session |

## Repository layout

```text
src/index.ts                 host half: the routes and the config
src/host-context.ts          the slice of the host plugin context we call
src/host/                    library scan, places and path rules, browsing, opening,
                             media serving, notes read/write, remembered state
src/shared/                  the wire contract and the notes markdown format
src/client/entities/cue/     subtitle parsing, decoding and bilingual line ordering
src/client/                  the page, its widgets, and the slot-free features (library,
                             import, notes, media player, resume)
lib/                         tsdown output, committed: what the shell fetches
locale/                      the Plugins page display name and summary
cordis.patch.yml             bundle patch (loader row `lingualab`)
```
