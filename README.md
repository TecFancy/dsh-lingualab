# dsh-lingualab

English | [简体中文](README.zh.md)

The LinguaLab panel: **one row in the left rail's 「更多」 menu, opening a whole page in
the centre column**, leaving the current Session untouched. The page turns media that already
sits in the workspace into intensive-listening practice: one episode at a time, sentence by
sentence, with the notes written back to disk where the agent can read them.

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

The scan accepts `.mp3`, `.m4a`, `.wav`, `.ogg`, `.opus` and `.flac` audio, `.mkv`, `.mp4`, `.webm`
and `.mov` video, `.srt`, `.vtt` and `.lrc` subtitles, and treats a single subtitle file that carries CJK text as both
tracks, because a bilingual subtitle is one file with two languages in it. A folder with
neither audio nor video is listed but not playable, and an optional `manifest.json` at the root may set the
play order, rename episodes and name the episode to open first.

A folder with **two or more audio files** is still one episode, made of segments: one scene per audio
file, in natural order (`02` before `10`). Each segment pairs its own subtitles by name, and the
longest audio name wins (`04_Dunphy家-Luke射击.srt` does not belong to a sibling named `04_Dunphy家`).
A subtitle whose name carries `双语` or `bilingual` (`01_Dunphy家的早晨_双语.srt`) is one file with
both languages: its Chinese lines are the Chinese track, and the English track is the English-marked
file, else the single unmarked one, else the same file. The page plays one segment at a time, lists
them under a button in the top bar, offers the next one when a segment ends, and keeps one `notes.md`
per episode with a `## <segment>` heading per segment.

**Video is another source for the same segment.** A video pairs with its audio file by the subtitle rule
(`MDJT S01E01.mkv` goes with `MDJT S01E01.mp3`, the longest audio name wins), a video no audio file owns is a segment
of its own whose sound is taken from the video, and a folder of one stem is still one episode of one segment. Cards on
the home and rows in the segment list carry a small video mark, 「视频 · 未准备」 while the video has still to be
prepared. A video a browser can play as it is (an `mp4` or `webm` with H.264, VP9 or AV1 and AAC, Opus or MP3) plays
directly. Anything else is **prepared once, when the user asks** (「准备视频」): `ffmpeg` copies the picture untouched and
converts the sound to stereo AAC (the first English track, else the first) into an `mp4` with its index first, which
takes about as long as reading the file. A picture no browser decodes (HEVC, MPEG-4 Part 2, a 10-bit H.264) is not
re-encoded by that; only its sound is extracted to an `m4a`, so a segment with no audio file of its own can still be
studied by ear (the smooth version below is what turns such a picture into a video that plays). The prepared file lives in the hidden `<episode>/.lingualab/` folder, written as a `.part` and renamed into place;
the source is never modified and deleting the folder only means preparing again. It is one host job at a time, with
progress and a 「取消」, and it needs `ffmpeg` and `ffprobe` on `PATH` or in the optional `ffmpegPath` config field (a
folder holding both, or the path of either; a volatile field, so the Plugins page can set it with no restart). Without
them an `mp4` or `webm` still plays directly and anything else shows a card with the install command. Once a segment has
a playable video it is the player's source, and its sound is the sound of the session (with the picture hidden, a segment
that has an audio file of its own plays that instead, so the video is not downloaded); the subtitles, loop, kept
sentences, timing edits and review all keep working on that one timeline. A picture on the stage has three states
(shown, large and hidden), kept in this browser with the other settings: `V` and a button in the play card cycle them,
and in the large state `R` shows the English of the current sentence on the picture until the next sentence starts. The
five steps use it once: starting the blind-watch timer switches to large (with a 「撤销」 notice) and pausing it or
marking the step done puts the previous state back. Videos only play inside the library: a video picked from elsewhere
in the workspace plays only when it needs no preparing, the same boundary subtitle timing draws.

**The smooth version** (「准备流畅版」) is for a link that cannot carry the picture as it came. It is started by hand for one
episode or segment, from the corner of the playing picture or from the card of a video that has to be prepared or whose
picture a browser cannot decode, with the estimated size and time next to it (about 1.9 Mbps, and about 1.5 times real time
on the server; an estimate). `ffmpeg` re-encodes the picture as H.264 (`veryfast`, CRF 23, capped at 1.8 Mbps), 8-bit 4:2:0,
at most 720 lines (a smaller picture keeps its size), a keyframe every 2 seconds, and the sound as stereo AAC at 128 kb/s,
into `<episode>/.lingualab/<stem>.smooth.mp4` with its index first. It goes through the same one-at-a-time job, with the same
progress and 「取消」, at a lower priority and with one thread fewer than the machine has cores; the picture keeps playing
meanwhile, and a failed or cancelled job changes nothing. Once the file is in place the full-size prepared `<stem>.mp4` is
deleted, a source that plays directly is never touched, and the page plays the smooth file, else the prepared one, else the
source. 「改回原画质」 on the playing smooth picture deletes the file and prepares the video as it was before (a minute of
remuxing; for a picture a browser cannot decode, back to the sound-only state).

A segment with a video can also play it **from a file on the user's own machine** (「用本地文件播放」, on the picture and on
every video card, or drop the file on the stage): it plays in place of the served video, under the same session, without
being uploaded, which spares a slow link. Its length is compared with the served video's (the audio file's when that was
never probed), and a difference of more than a second shows the same length warning. An `mp4` (H.264 with AAC) plays
everywhere, an `mkv` often plays with no sound, and a file the browser cannot decode drops back to the served source. Where
the browser can hand out file handles (Chromium) the choice is remembered per segment on this device, and one click
continues with it; elsewhere the file is picked again each visit. Nothing about it goes to the host.

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
and the star. The A-B region, its repeat count, the lead-in (start each sentence a little early) and the list of keys sit behind 「More」. Click a
subtitle line to jump there and play it. Speed has ten steps and never changes pitch: the speed
button opens a picker of all ten, and `=` goes back to 1× and, pressed again, to the speed before. Subtitles
put English above Chinese whatever the source order, and the Chinese side has four display modes
so the native language never becomes the thing being read. The page remembers where you stopped
in each episode and which of the five steps you ticked, and the home offers the place as
「Pick up where you left off」. That memory is kept on the host, in a hidden
`.lingualab-progress.json` at the library root beside the `notes.md` files, and each browser holds a
cache of it, so a second device, a private window or a cleared cache picks up where the first one
left off. When two devices disagree the newest stop wins. If the library folder is itself synced
(a cloud drive, a git checkout), the progress travels with it.

The practice view is a stage and a subtitle column. The stage holds the current sentence in large
type with its neighbours faded around it; the column on the right lists every sentence, follows
playback unless you switch 「Auto-follow」 off, and marks the kept ones. A few details earn their
place by being used every session. The progress bar spans the episode with a hairline at every
sentence start, shows the time and the sentence under the pointer on hover, and seeks once, on
release, when dragged; moving the finger away from the bar while dragging scrubs at half and then a quarter speed. Clicking an English word copies it or adds it to that sentence's note
without stopping the audio; dragging across words, or `Shift`-clicking a second one, does the same
for the phrase between them, and a second click on 「已记下」 takes it out again. **Shadowing** stops after each sentence with the English blurred
and uncovers it at the stop; `R` uncovers it any time. In 「更多」 it becomes a repeater's program: each sentence played
one to three times, a speaking pause after every play (as long as the sentence, or one and a half times it, plus a
second), and the next sentence by itself. With a pause set, the English stays covered until your first try is over,
and the chip shows 「该你说」 with a fill for the time left; with auto-advance on as well, the page runs without a
hand on it. Turning on the microphone switch (「录下我说的」) there records each speaking pause: when it ends, the
sentence plays once more and then your own take, and the 「对比」 button or `D` plays that pair again later. A take is
kept in memory for the open episode only, and the last one of each sentence: never saved, never sent anywhere, never
scored. Recording needs an HTTPS page (localhost counts) and a microphone the browser may use; if it cannot, the switch turns
itself off with a message and the program carries on without it. While the practice view is open, a headset, AirPods or
the lock screen work as the repeater's physical keys through the browser's Media Session: play and pause do what the play
button does (during a speaking pause that ends the program at the sentence's start), previous and next step one sentence
(in a review they go back in the queue and skip an item), and the lock screen names the sentence and the episode. There is
no skip-by-seconds button on purpose, so the track buttons stay sentence steps; it is always on, and these are not
keyboard shortcuts, so the host's keys are untouched. Reaching the end shows a summary with the next episode,
and the key caps under the player light up for the key the page just handled. Motion is off under
the system's reduced-motion setting.

**Keeping a sentence is a star** on the transport row and on each subtitle line, or `S`. The same
star takes it back. The kept sentences are the right column's other view, 「收藏」, next to the
subtitles (`N` switches): clicking a card puts its sentence on stage and loops it, and the card of
the sentence on stage opens with its note, its words and its grade; the note can run over several
lines (`Ctrl+Enter` saves), and the card's time chip plays and pauses that sentence. Each kept sentence has one
state, set with `1` 「记住了」, `2` 「模糊」 or `3` 「没记住」; one graded 「记住了」 leaves the
「还在练」 view without being deleted, so the working set stays short by choice rather than by a
ceiling. **Review** goes through the sentences still being practised one at a time, the English
hidden until `R`, each looping until it is graded; it starts from the column for one episode, or
from a card on the home for the whole library. A folder episode's notes are
markdown with a checklist line per phrase (a note's line breaks are written as `<br>`, so a phrase
stays on one line), so they stay readable in an editor and greppable by
the agent that runs the next-day review; a file episode's notes live in the plugin's profile,
because the plugin does not write anywhere in the material folder except to add the files you
hand it.

**The right column collapses.** The panel icon beside 「收藏」 in the top bar, or `\`, takes the column out of
the row so the stage has the whole width (on an iPad the stage is otherwise 440 to 630px wide), and the picture grows
with it. `N` or the 「收藏」 chip on a collapsed column opens it straight into the kept sentences; opening it on the
subtitles lands on the sentence playing. Whether it is collapsed is kept in this browser, with the settings below.
On a narrow row (an iPad in portrait, or in landscape with the host's sidebar open) the column opens as a drawer over
the stage instead, and a press beside it or `Esc` puts it away. Until you press the toggle once, the column starts
collapsed on a narrow row and expanded on a wide one.

**Settings** are the sliders icon at the right end of the top bar, on the home and in the practice
view. They open a drawer that changes only this page and never dsh itself: a theme (「默认」, 「墨蓝」,
「松绿」, 「纸张」, 「暮紫」 or 「高对比」, each with a light and a dark palette), whether light or dark
follows dsh or is pinned, the size of the sentence on stage, and the lead-in. A theme sets the
host's own colour tokens on the page's root element, so nothing outside the page changes. The
choices are kept in this browser, and another device starts from the defaults.

## Status

Both halves are written: the library scan, the import route, the media routes with `Range`
support, the browsable picker, the notes read/write path and the review list on the host side, and
on the client side the page itself: the home, the practice view, the kept-sentences column and review,
and the layers for browsing and for the media folder.

The page has **no rail row of its own**, and no card on the 「应用」 page either. It is registered as a
`main` panel under the key `lingualab`, and the entry is the first row of the left rail's 「更多」 menu:
this plugin registers that row into `sidebar.panellist.actions` itself, and selecting it calls
`layout.selectPanel('lingualab')`. The rail still does not grow a row per plugin, and the entry now
belongs to the plugin, so it no longer depends on `dsh-apps-panel` being installed.

It is developed on `development` and released by pulling into `main`; nothing here is
published to npm.

## Anonymous usage statistics

The host half sends at most one anonymous ping a day per running process, and only after the
host has admitted a request: that is the first moment the plugin is known to be in use.
Nothing is sent at start, and nothing is sent when the ping is off. It answers one question,
how many machines actually run the panel and which version they run, without an account, a
server of ours or a third-party SDK.

The whole body is below, and nothing else rides along:

| Key | Value |
|---|---|
| `v` | the payload version, `1` |
| `pkg` | `dsh-lingualab` |
| `version` | the version in this package's `package.json`, read when the host loads |
| `id` | a random UUID v4, made once and kept in the plugin's `installId` config field |
| `node` | the Node major version only, `v22` |
| `os` | `linux`, `darwin` or `win32`; `other` for anything else |
| `arch` | `x64` or `arm64`; `other` for anything else |
| `metrics.episodes` | how many episode folders the library root holds, in one of four buckets: `0`, `1-5`, `6-20`, `21+` |
| `metrics.ffmpeg` | whether the host could find `ffmpeg` |

What is **never** sent: a file name, a folder path, an episode title, a note, a subtitle, a user
name, an email, a token, a session id, a host name or an IP address. The body is a `POST` to
`https://t.hi-ruofei.com/v1/ping` on `t.hi-ruofei.com`, with a five second limit, no retry, no log
and no wait: a ping that fails is silent, and the request it rode on has already been answered.

The ping is **on by default**. To stop it, set the `telemetry` field to `false` in this plugin's
profile entry (the Plugins page, or `cordis.patch.yml`): no id is generated, the library is not
listed and no request is made. `installId` is the field the plugin writes itself to keep the same
random id across restarts; it is hidden because it is not a value to choose.

## Design

The layout, colours and interaction of the home, the practice view and the notes and steps
drawers are drafted in Figma: [LinguaLab redesign](https://www.figma.com/design/kdmcHGX1TcLPj84v7rg1xY).
The frames are `Practice / Light` and `Practice / Dark`, `Home / Light` and `Home / Dark`,
`Notes / Light` and `Five steps / Light`. The file is the reference for proportions and hierarchy,
not for values: it hardcodes hex colours and the Inter font, while the page itself reads the host's
`--dsw-alias-*` tokens and font so it follows the theme. A theme chosen in the settings overrides those same tokens on the page's
root element and nowhere else.

## Releasing

Work lands on `development`. A pull request into `main` is a release, and one command
runs it from `development`:

```sh
npm run ship -- patch|minor|major   # check, bump, verify, push, open the PR, wait for green, merge, sync back
npm run deploy                      # pull on the server, restart the service, confirm it is active
```

`ship` bumps the version and moves both sides of the changelog under a dated heading
(`scripts/release.mjs`), runs the full `npm run verify`, pushes `development` and opens
the pull request into `main`, waits for its checks and, when they are green, merges it with
a merge commit and fast-forwards `development` onto the merged `main`. Running `ship` is the
release decision. A caller that must not sit and poll CI (an agent) uses
`npm run ship -- patch --no-wait`, which stops after opening the pull request, and later
`npm run ship -- --continue`, which reads the checks once and merges only if they are all green.
The `version-bump` job in CI fails a pull request that does not raise the version.
`--dry-run` prints every command that would change something instead of running it.

The tag is not made by hand: when the merge lands on `main`, the `release` workflow creates
the tag and a GitHub Release whose body is that version's sections from the changelog pair,
Chinese first and English after. Nothing is published to npm: the plugin is installed from
a local path or a tarball, so a version number here marks a state that was installed and
used, not an artifact on a registry. `deploy` reads its target from `LINGUALAB_DEPLOY_HOST`
and `LINGUALAB_DEPLOY_PATH`; see the repository skill for the details.

## Host routes

Every route, reads included, is answered only for a request the host admits (a loopback `Host`, a matching `Origin`, the signed session cookie): 401 or 403 otherwise, and 403 when the deployment has no connection service.

| Route | Kind | What it answers |
|---|---|---|
| `GET /lingualab/library` | exact | Every episode folder and loose audio file, the open episode, and how much has been noted |
| `GET`, `HEAD /lingualab/media/<episode>/<file>` | prefix | Audio, subtitle and `mp4` or `webm` video bytes of a folder episode, and the prepared, smooth and sound-only files under `<episode>/.lingualab/<file>` (`mp4` and `m4a` only), `206` for a range request |
| `GET`, `HEAD /lingualab/file-media/<id>/<file>` | prefix | The same for a file episode, from the paths recorded when it was picked |
| `GET`, `POST /lingualab/notes` | exact | One episode's phrases, read or replaced wholesale |
| `GET /lingualab/review` | exact | Every kept sentence not graded 「记住了」 across the library, episode by episode in library order and in play order inside each; read only |
| `GET`, `POST /lingualab/config` | exact | Where the library is, and how to change it — by path, or by place and relative folder |
| `GET /lingualab/update` | exact | Which build is running (its version and short commit, read when the host loaded), and the newest `vX.Y.Z` release tag the checkout's own remote declares; read only — nothing is fetched, pulled or installed, and `?refresh=1` skips the cached answer |
| `GET /lingualab/places` | exact | The roots the picker may browse: every workspace, plus the library itself |
| `GET /lingualab/browse` | exact | One directory under one place: directories, audio, subtitles, and each audio file's subtitle pairing |
| `POST /lingualab/open` | exact | Make one episode current: a scanned folder (with an optional `segment` to open one of its segments, the first when omitted), or a single audio file with the subtitles beside it |
| `POST /lingualab/import` | exact | Receive one dropped audio, video or subtitle file into an episode folder, never overwriting; needs the `x-lingualab-import: 1` header and an admitted session |
| `POST /lingualab/subtitle-timing` | exact | Move one sentence's start and end in its subtitle file inside the library, with the shared edge of a neighbour it pushed: only those timecode lines change, `409` when the file is not the one the page read, a `.bak` of the original before the first write |
| `GET /lingualab/video` | exact | What the host knows about one segment's video (`episode`, `segment` in the query): `playable` (with the URL), `prepare`, `preparing` (with progress), `sound-only`, `sound-ready`, `unplayable`, `no-ffmpeg` (with the install command), `failed` or `none`; the length difference from the audio when it is over a second |
| `POST /lingualab/video-prepare` | exact | Start the one preparing job for a segment, `{ episode, segment?, mode: 'video' \| 'sound' \| 'smooth' \| 'original' }`, never a path (`smooth` re-encodes the picture for streaming, `original` deletes that file and prepares the video as it was); answers with the status after the start, or the reason (`busy`, no ffmpeg) |
| `POST /lingualab/video-cancel` | exact | Stop the running preparing job and remove its `.part`; answers whether there was one |
| `GET`, `POST /lingualab/progress` | exact | Listening positions and step ticks kept in `.lingualab-progress.json` at the library root; a `POST` merges the browser's entries (newest per episode wins) and answers with the merged table |

## Repository layout

| Path | What lives there |
|---|---|
| `src/index.ts` | The host entry: the config, and mounting the routes |
| `src/host-context.ts` | The slice of the host plugin context we call |
| `src/host/shared/` | Config, request trust and media serving, path rules, the ffmpeg finder, the anonymous usage ping, test helpers |
| `src/host/entities/` | Episode (the library scan), open state, places, the notes file, subtitle choice, video cache |
| `src/host/features/` | One slice per capability, its route in `api/<name>.route.ts` beside its rules |
| `src/shared/` | The wire contract and the notes markdown format |
| `src/client/entities/cue/` | Subtitle parsing, decoding and bilingual line ordering |
| `src/client/` | The page, its widgets, and the slot-free features (library, import, notes, media player, resume, settings) |
| `lib/` | tsdown output, committed: what the shell fetches |
| `locale/` | The Plugins page display name and summary |
| `cordis.patch.yml` | Bundle patch (loader row `lingualab`) |
