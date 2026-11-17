# LinguaLab usage

English | [简体中文](usage.zh.md)

This document walks through the panel as a user meets it: the home, adding material, episodes and segments, video, practice, notes and review, and settings. Read it to learn how the panel behaves; the decisions behind that behaviour are in `.agents/notes/`.

## Home opens episodes; practice plays them

The page opens on a **home**: the episode to pick up where you left off, the rest of the library as rows that open on a click, and a drop target. Opening an episode switches to the **practice** view; its back button returns to the home.

## Drop files to add material

Drag an audio file and its subtitles onto the page, or press 「Choose files」. Subtitles pair up by name:

- A file that starts with the audio file name belongs to it: `s01e01.mp3` owns `s01e01.en.srt` and `s01e01.zh.srt`.
- A lone subtitle beside a lone audio file is a pair whatever they are called.
- Several episodes can be dropped at once. The host files each one in its own folder under the media folder, **never overwrites a file that is already there**, and says what it skipped.

With nothing in the library, the home is only the drop target; nobody has to learn what a media folder is first.

## The library stores one folder per episode and accepts common media formats

The library root holds one folder per episode. A folder carries an audio file, up to two subtitle files, and an optional `notes.md`; that is also the layout an import produces:

```text
notes/learning/english/media/
  S01E01/
    audio.mp3
    S01E01.en.srt
    S01E01.zh.srt
    notes.md
```

The scan accepts `.mp3`, `.m4a`, `.wav`, `.ogg`, `.opus` and `.flac` audio, `.mkv`, `.mp4`, `.webm` and `.mov` video, and `.srt`, `.vtt` and `.lrc` subtitles. It treats a single subtitle file that carries CJK text as both tracks, because a bilingual subtitle is one file with two languages in it.

A folder with neither audio nor video is listed but not playable. An optional `manifest.json` at the root may set the play order, rename episodes and name the episode to open first.

## Two or more audio files form segments in one episode

A folder with **two or more audio files** is still one episode, made of segments: one scene per audio file, in natural order (`02` before `10`).

Each segment pairs its own subtitles by name, and the longest audio name wins (`04_Dunphy家-Luke射击.srt` does not belong to a sibling named `04_Dunphy家`). A subtitle whose name carries `双语` or `bilingual` (`01_Dunphy家的早晨_双语.srt`) is one file with both languages: its Chinese lines are the Chinese track, and the English track is the English-marked file, else the single unmarked one, else the same file.

The page plays one segment at a time, lists them under a button in the top bar, and offers the next one when a segment ends. It keeps one `notes.md` per episode with a `## <segment>` heading per segment.

## Video shares the segment's practice timeline

**Video is another source for the same segment.** A video pairs with its audio file by the subtitle rule (`MDJT S01E01.mkv` goes with `MDJT S01E01.mp3`, the longest audio name wins). A video no audio file owns is a segment of its own whose sound is taken from the video, and a folder of one stem is still one episode of one segment.

Cards on the home and rows in the segment list carry a small video mark, 「视频 · 未准备」 while the video has still to be prepared. A video a browser can play as it is (an `mp4` or `webm` with H.264, VP9 or AV1 and AAC, Opus or MP3) plays directly.

Anything else is **prepared once, when the user asks** (「准备视频」):

- `ffmpeg` copies the picture untouched and converts the sound to stereo AAC (the first English track, else the first) into an `mp4` with its index first, which takes about as long as reading the file.
- A picture no browser decodes (HEVC, MPEG-4 Part 2, a 10-bit H.264) is not re-encoded by that; only its sound is extracted to an `m4a`, so a segment with no audio file of its own can still be studied by ear. The smooth version below is what turns such a picture into a video that plays.
- The prepared file lives in the hidden `<episode>/.lingualab/` folder, written as a `.part` and renamed into place. The source is never modified and deleting the folder only means preparing again.
- It is one host job at a time, with progress and a 「取消」. It needs `ffmpeg` and `ffprobe` on `PATH` or in the optional `ffmpegPath` config field (a folder holding both, or the path of either). It is a volatile field, so the settings service can write it while the plugin runs and the Plugins page can set it with no restart.
- Without them an `mp4` or `webm` still plays directly and anything else shows a card with the install command.

Once a segment has a playable video it is the player's source, and its sound is the sound of the session. With the picture hidden, a segment that has an audio file of its own plays that instead, so the video is not downloaded. The subtitles, loop, kept sentences, timing edits and review all keep working on that one timeline.

A picture on the stage has three states (shown, large and hidden), kept in this browser with the other settings: `V` and a button in the play card cycle them. In the large state `R` shows the English of the current sentence on the picture until the next sentence starts.

The five steps use the picture once: starting the blind-watch timer switches to large (with a 「撤销」 notice) and pausing it or marking the step done puts the previous state back.

Videos only play inside the library: a video picked from elsewhere in the workspace plays only when it needs no preparing, the same boundary subtitle timing draws.

## The smooth version reduces bandwidth

**The smooth version** (「准备流畅版」) is for a link that cannot carry the picture as it came. It is started by hand for one episode or segment, from the corner of the playing picture or from the card of a video that has to be prepared or whose picture a browser cannot decode. The estimated size and time sit next to it: about 1.9 Mbps, and about 1.5 times real time on the server; both are estimates.

`ffmpeg` re-encodes the picture as H.264 (`veryfast`, CRF 23, capped at 1.8 Mbps), 8-bit 4:2:0, at most 720 lines (a smaller picture keeps its size), with a keyframe every 2 seconds. The sound becomes stereo AAC at 128 kb/s. The result is `<episode>/.lingualab/<stem>.smooth.mp4` with its index first.

It goes through the same one-at-a-time job, with the same progress and 「取消」, at a lower priority and with one thread fewer than the machine has cores. The picture keeps playing meanwhile, and a failed or cancelled job changes nothing.

Once the file is in place the full-size prepared `<stem>.mp4` is deleted; a source that plays directly is never touched. The page plays the smooth file, else the prepared one, else the source.

「改回原画质」 on the playing smooth picture deletes the file and prepares the video as it was before (a minute of remuxing; for a picture a browser cannot decode, back to the sound-only state).

## Play a local file without uploading it

A segment with a video can also play it **from a file on the user's own machine**: use 「用本地文件播放」 on the picture or any video card, or drop the file on the stage. It plays in place of the served video, under the same session, without being uploaded, which spares a slow link.

Its length is compared with the served video's (the audio file's when that was never probed), and a difference of more than a second shows the same length warning. An `mp4` (H.264 with AAC) plays everywhere, an `mkv` often plays with no sound, and a file the browser cannot decode drops back to the served source.

Where the browser can hand out file handles (Chromium) the choice is remembered per segment on this device, and one click continues with it; elsewhere the file is picked again each visit. Nothing about it goes to the host.

## Browse for the media folder or enter an absolute path

Where the files live is one quiet line at the bottom of the home, with 「Change」. The folder is set without typing a path: the primary way in is 「Browse existing files」. Walk to the folder, click 「Use as media folder」, and the host resolves the path itself.

A typed absolute path survives as the fallback for a mount point no workspace contains. Saving writes `libraryRoot` into the plugin's profile entry through the settings service, so there is one home for the value and no restart is needed.

## Loose audio files can be episodes on their own

An episode is not required to be a folder. Audio sitting loose in the library root, or anywhere under a browsable place, opens on its own: 「Browse existing files」 lists it, pairing subtitles by file name, and the host remembers the file so its bytes can be served and its notes have somewhere to go.

## Practice works sentence by sentence and remembers progress

Practice is built around the sentence, not the file. The transport row holds only what is used every minute: previous and next sentence, play, speed, loop this sentence, the Chinese display and the star. The A-B region, its repeat count, the lead-in (start each sentence a little early) and the list of keys sit behind 「More」.

Click a subtitle line to jump there and play it. Speed has ten steps and never changes pitch: the speed button opens a picker of all ten, and `=` goes back to 1× and, pressed again, to the speed before. Subtitles put English above Chinese whatever the source order, and the Chinese side has four display modes so the native language never becomes the thing being read.

The page remembers where you stopped in each episode and which of the five steps you ticked, and the home offers the place as 「Pick up where you left off」. That memory is kept on the host, in a hidden `.lingualab-progress.json` at the library root beside the `notes.md` files, and each browser holds a cache of it. A second device, a private window or a cleared cache picks up where the first one left off. When two devices disagree the newest stop wins. If the library folder is itself synced (a cloud drive, a git checkout), the progress travels with it.

## The practice view combines the stage, subtitles and repetition

The practice view is a stage and a subtitle column. The stage holds the current sentence in large type with its neighbours faded around it; the column on the right lists every sentence, follows playback unless you switch 「Auto-follow」 off, and marks the kept ones.

- The progress bar spans the episode with a hairline at every sentence start, shows the time and the sentence under the pointer on hover, and seeks once, on release, when dragged. Moving the finger away from the bar while dragging scrubs at half and then a quarter speed.
- Clicking an English word copies it or adds it to that sentence's note without stopping the audio. Dragging across words, or `Shift`-clicking a second one, does the same for the phrase between them, and a second click on 「已记下」 takes it out again.
- **Shadowing** stops after each sentence with the English blurred and uncovers it at the stop; `R` uncovers it any time.
- In 「更多」 it becomes a repeater's program: each sentence played one to three times, a speaking pause after every play (as long as the sentence, or one and a half times it, plus a second), and the next sentence by itself. With a pause set, the English stays covered until your first try is over, and the chip shows 「该你说」 with a fill for the time left. With auto-advance on as well, the page runs without a hand on it.
- Turning on the microphone switch (「录下我说的」) there records each speaking pause. When it ends, the sentence plays once more and then your own take, and the 「对比」 button or `D` plays that pair again later. A take is kept in memory for the open episode only, and the last one of each sentence: never saved, never sent anywhere, never scored. Recording needs an HTTPS page (localhost counts) and a microphone the browser may use; if it cannot, the switch turns itself off with a message and the program carries on without it.
- While the practice view is open, a headset, AirPods or the lock screen work as the repeater's physical keys through the browser's Media Session. Play and pause do what the play button does (during a speaking pause that ends the program at the sentence's start), previous and next step one sentence (in a review they go back in the queue and skip an item), and the lock screen names the sentence and the episode. There is no skip-by-seconds button on purpose, so the track buttons stay sentence steps. It is always on, and these are not keyboard shortcuts, so the host's keys are untouched.

Reaching the end shows a summary with the next episode, and the key caps under the player light up for the key the page just handled. Motion is off under the system's reduced-motion setting.

## Stars collect sentences and grades drive review

**Keeping a sentence is a star** on the transport row and on each subtitle line, or `S`. The same star takes it back. The kept sentences are the right column's other view, 「收藏」, next to the subtitles (`N` switches). Clicking a card puts its sentence on stage and loops it, and the card of the sentence on stage opens with its note, its words and its grade. The note can run over several lines (`Ctrl+Enter` saves), and the card's time chip plays and pauses that sentence.

Each kept sentence has one state, set with `1` 「记住了」, `2` 「模糊」 or `3` 「没记住」. One graded 「记住了」 leaves the 「还在练」 view without being deleted, so the working set stays short by choice rather than by a ceiling.

**Review** goes through the sentences still being practised one at a time, the English hidden until `R`, each looping until it is graded. It starts from the column for one episode, or from a card on the home for the whole library.

A folder episode's notes are markdown with a checklist line per phrase (a note's line breaks are written as `<br>`, so a phrase stays on one line), so they stay readable in an editor and greppable by the agent that runs the next-day review. A file episode's notes live in the plugin's profile, because the plugin does not write anywhere in the material folder except to add the files you hand it.

## Collapsing the right column gives the stage the full width

The panel icon beside 「收藏」 in the top bar, or `\`, takes the column out of the row so the stage has the whole width (on an iPad the stage is otherwise 440 to 630px wide), and the picture grows with it. `N` or the 「收藏」 chip on a collapsed column opens it straight into the kept sentences; opening it on the subtitles lands on the sentence playing. Whether it is collapsed is kept in this browser, with the settings below.

On a narrow row (an iPad in portrait, or in landscape with the host's sidebar open) the column opens as a drawer over the stage instead, and a press beside it or `Esc` puts it away. Until you press the toggle once, the column starts collapsed on a narrow row and expanded on a wide one.

## Settings affect only this page

**Settings** are the sliders icon at the right end of the top bar, on the home and in the practice view. They open a drawer that changes only this page and never dsh itself:

- A theme: 「默认」, 「墨蓝」, 「松绿」, 「纸张」, 「暮紫」 or 「高对比」, each with a light and a dark palette.
- Whether light or dark follows dsh or is pinned.
- The size of the sentence on stage.
- The lead-in.

A theme sets the host's own colour tokens on the page's root element, so nothing outside the page changes. The choices are kept in this browser, and another device starts from the defaults.
