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

## [0.11.6] - 2026-10-14

### Fixed

- The practice view fits at the heights a real iPad in Safari has, where Safari's status bar and toolbar take 74 to 110 px
  that the earlier measurements did not count. With the timing panel closed and a picture playing, a two-line sentence with its
  Chinese line needed up to 74 px more than the column had (an iPad mini at 1133 by 634, 49 px at 1133 by 670, 25 px at
  1180 by 710, 17 px at 1194 by 724), so the part above the player card scrolled. The picture now gives way, as it already did
  while timing: its stage is sized as the picture always was and may shrink when the room is less, down to 120 px, under which
  the picture is not drawn and the sentence takes the room (it comes back at 128 px). The corner pills are not drawn on a
  picture under 160 px. Where the page fitted it is unchanged (the 1440 by 900 desktop picture is still 443 by 249 with the
  sidebar open); the sizes that did not fit lose some picture instead of getting a scroller. The play card stays on screen at
  every size measured.
- Dragging a finger across several English words on the stage now picks the phrase, as dragging a mouse does. The drag
  used mouse events only, and iOS sends none while a finger moves, so on an iPad only a single tap worked, and a drag
  scrolled the column or started a native text selection. The drag now follows pointer events and finds the word under
  the finger from its coordinates (a touch pointer stays captured by the first word, so no other word is ever entered).
  The sentence takes the touch for itself (`touch-action`, text selection and the long-press callout are off on it, and
  `touch-action` is set on the block because it does not apply to inline words); the rest of the stage still scrolls.
  A cancelled touch picks nothing, a second finger is ignored, and pressing outside the popover closes it by pointer
  as well. A tap and `Shift`-click still work, and the mouse behaves as before.

## [0.11.5] - 2026-10-14

### Fixed

- The picture no longer jumps when the timing panel opens and closes. The panel used to grow a grid row from nothing, so
  in the first frame the player card had already folded but the panel was still 0 px tall, and the picture appeared very
  large, shrank over a quarter of a second and, beside a two-line sentence, was squeezed away at the end; closing put the
  usual layout back at once while the panel was still leaving. The layout now steps once in each direction: the panel
  takes its full height in the same commit that puts the column in timing mode, only the card fades and lifts, and on the
  way out the card fades while the layout stays put, then the column leaves timing mode in the commit that unmounts the
  panel. Both follow one presence in the page, so they cannot part by a frame. The keys are the page's again as soon as
  the panel starts to leave, and it is inert while it does.

## [0.11.4] - 2026-10-14

### Fixed

- With the timing panel open, a picture that does not fit (under 120 px of room, for example beside a two-line sentence at
  1024 by 700) no longer leaves an empty box of about 80 px above the sentence. Its stage now takes no space at all, and the
  sentence stage takes the room and centres the sentence in it. The page measures the room (what the scroller has left after
  the sentence, the timing strip and the stage's padding, never the picture's own box, so it cannot flip back and forth) and
  brings the picture back at 128 px, 8 px above where it left. A picture that fits looks exactly as it did.

## [0.11.3] - 2026-10-14

### Changed

- Adjusting a sentence's timing is now a mode of the practice view (the page sets `is-timing` on the practice column
  while the timing panel has a sentence). The player card folds to the scrubber and one row, speed then previous, play
  and next (about 124 px instead of 264), and the other buttons, the key hints and any open menu wait until the panel
  closes. The sentence is as tall as its text, with no lines either side of it.
- In a column 648 px wide or less, or 780 px tall or less (the room the iPad has in both orientations next to the
  host's sidebar), the timing panel is one compact layout instead of the stacked cards: each edge is one row (its label
  with how far it moved under it, the value, the two 50 ms steps and a short 「Playhead」 button that wraps onto a second
  line of its row only where the row is too narrow), the foot is one row (Reset, Cancel, and a short 「Save」 that takes
  what is left), and the mini timeline and the key hints are gone. The full texts stay as the buttons' names and tooltips.
  A wide, tall column keeps the two cards with the mini timeline. The panel is about 205 px tall instead of 379.
- On a touch screen the player card's buttons are 44 px tall, previous and next included, instead of 32 and 40 px. The
  card gets 12 px taller for each row of buttons it wraps into.

### Fixed

- With the timing panel open the picture is back instead of stepping aside: it takes what is left of the column as the
  biggest box of the video's shape that fits (at most 720 px wide), and is not drawn only when that is under 120 px tall
  (the video keeps playing, as for an audio file). A card or a chip standing in for a picture, and the pills on the
  picture, are not drawn while timing; a large picture keeps its place and its floor of 160 px. At 1024 by 700 with the
  host sidebar open the sentence, the panel and the card now fit without scrolling.
- The 「Auto-follow」 switch in the transcript's head no longer sticks out of the 260 px transcript. It says 「Follow」
  there (the full word stays as its name), and the head's padding, gaps and segmented control are a little tighter.

## [0.11.2] - 2026-10-14

### Fixed

- The practice view no longer breaks on an iPad. It used to ask the window's width, but the host's sidebar and the
  transcript take a different share of it in every state, so in landscape the practice column is only 440 to 630 px wide
  while the window is 1024 or 1180 px. The column is now a size container and the rules about what is in it ask the
  column (`@container`); the transcript's narrower width asks the row it sits in; only the browse layer still asks the
  window.
- A column too short for the picture, the sentence and the timing panel at once no longer paints the sentence over the
  picture and the timing panel, and no longer pushes the player card off the screen. The part above the card scrolls
  and the card stays put. Before that is needed, a column under about 720 px tall drops the lines either side of the
  sentence, caps the picture at 30% of the column's height (it was 42% of the window's) and the timing panel loses its
  mini timeline, and while the timing panel is open the picture steps aside (it keeps playing, and a large picture keeps
  its place).
- In a column under about 650 px wide the picture and the cards use the whole width instead of 64% of it, the smooth
  version's pill wraps instead of cutting its text, the player card's buttons sit in centred rows, and the timing panel's
  start and end cards stack with the playhead button beside the value.
- On a touch screen the keyboard hints are gone (the key row under the player, the keys in the timing panel, the caps on
  buttons and in the 「更多」 menu), and the timing panel's step buttons, 「设为播放位置」, 「取消」 and
  「保存到字幕文件」 are 44 px tall. The small pills on the picture keep their size and get a 44 px touch area.

## [0.11.1] - 2026-10-14

### Fixed

- The smooth-version control on the corner of the picture no longer cuts its text short with no way to read the rest. The
  estimate is shorter (`~312 MB · ~16 min`, 「约 312 MB · 约 16 分钟」) so it fits at the default picture size, the estimate,
  the progress and the 「流畅版」 label each carry a `title` with their full text, and the estimate's title keeps the word
  "estimate" (`About 312 MB and about 16 min (estimate)`), as does the line on the cards.

## [0.11.0] - 2026-10-14

### Added

- A smooth version of a video for slow links (「准备流畅版」). Started by hand for one episode or segment, from the corner of
  the playing picture or from a card, with the estimated size and time next to it, it re-encodes the picture as H.264 at
  720 lines at most and about 1.9 Mbps (a keyframe every 2 seconds, stereo AAC at 128 kb/s, the index first) into
  `<episode>/.lingualab/<stem>.smooth.mp4`. It runs in the same one-at-a-time job as preparing, with the same progress and
  「取消」, at a lower priority and with one thread fewer than the machine has cores, and the picture keeps playing while it
  runs. When it is in place the full-size prepared `mp4` is deleted, a source that plays directly is never touched, and the
  page plays the smooth file, else the prepared one, else the source (the status says `via: 'smooth'`).
- The smooth version is also offered for a picture a browser cannot decode (HEVC, MPEG-4 Part 2, 10-bit H.264), on the
  sound-only card and on the card of a segment with its own audio file. The same re-encode turns it into a video that plays.
- 「改回原画质」 on the playing smooth picture deletes the smooth file and prepares the video as it was before, through the
  same job queue (a one-minute remux). For a picture that could only ever be sound, going back just returns to the
  sound-only state. It is the `original` mode of the prepare route, and `smooth` is the other new one.

### Fixed

- 「重试」 on a failed sound-only preparation asked for the picture, which the host refuses for such a file; it now asks for
  the sound again.

## [0.10.1] - 2026-10-14

### Fixed

- A source that cannot be opened no longer sends the player back to 00:00. Dropping a local file the browser cannot
  play, or a prepared video it cannot decode, used to go back to the other source from the start; it now carries on
  from where the reader was.

## [0.10.0] - 2026-10-13

### Added

- 「用本地文件播放」: a segment that has a video file can play it from a file on the reader's own machine, in place of the
  served video, without uploading it. Pick it from the picture or from any video card (prepare, preparing, no ffmpeg,
  sound only, failed, unplayable), or drop it on the stage; it is played from an object URL under the same session, so the
  position, loop, subtitles and kept sentences carry on, and a label on the stage says 「本地文件」 with a way to stop using
  it. Its length is compared with the served video's, or the audio file's when that was never probed, and the existing
  length warning shows when they differ by more than a second. A file the browser cannot decode drops back to the served
  source with a notice that says to use an `mp4`. Where the browser has the File System Access API the choice is remembered
  per segment on this device, and one click continues with it; elsewhere the file is picked again each visit. The host is
  not involved.

## [0.9.3] - 2026-10-13

### Changed

- Hiding the picture now plays the segment's own audio file instead of downloading the video. The video of a 23 minute
  episode is about 940 MB against 55 MB of mp3, which a slow link cannot keep up with; a segment that has only a video
  keeps playing it, since that is its only sound. Showing the picture again swaps back to the video at the same position.
- Media responses carry an `ETag` and `Last-Modified`, answer `304` to a matching `If-None-Match` or
  `If-Modified-Since`, and drop a `Range` whose `If-Range` no longer matches. Chrome only keeps a partial response that
  has a validator, so until now nothing it had downloaded was ever reused; a file prepared again under the same name is
  still picked up, because the browser keeps asking.
- The player buffers ahead before you press play, so the sentence you are reading is already on its way.

## [0.9.2] - 2026-10-13

### Changed

- The browser bundle is minified. dsh puts every plugin's bundle into the script it loads at start, so `lib/client.js`
  going from 554 KB to 288 KB (133 KB to 71 KB gzipped) makes every dsh page lighter, not only this one. The loader
  wrapper around it is left as it was.

## [0.9.1] - 2026-10-13

### Fixed

- The stage no longer says an episode has no subtitles while its opening plays. When the first sentence starts later
  than 00:00 the stage now says when it starts and that → jumps to it; 「这一集没有字幕」 is kept for an episode that
  really has none.

## [0.9.0] - 2026-10-12

### Added

- Subtitles can be chosen by hand. A 「字幕」 button next to 「中文显示」 opens a popover with an English and a Chinese
  slot, each left to the file names (the default), set to none, or set to any subtitle file in the folder, which is
  marked with whether it has Chinese in it. A folder episode keeps its choice per segment in a hidden
  `.lingualab-subtitles.json` in the folder, removed again when everything is back to the file names; an audio file
  opened from a workspace keeps it in the plugin state. A picked file that disappears plays by name until it is back,
  and the button says so. Saving reads the subtitles again and keeps the position.

### Changed

- 「中文显示」 is remembered. It is kept with the other settings in this browser, so "English only" stays chosen after a
  reload instead of starting at 「变淡」 every time.
- The host half is organised in FSD layers like the client: `src/host/` is `shared`, `entities` and `features`, each
  route sits in its feature beside the rules it calls, and `npm run lint:fsd` runs Steiger on both halves. Nothing the
  reader sees changes; the import cycles the flat folder had are gone, and new ones fail the check.

### Fixed

- The loop button on a subtitle row now shows and toggles the same loop as 「循环本句」 in the control bar. It used to
  stay unlit while that sentence looped, and a second press started the loop again instead of stopping it.
- An English-marked subtitle next to one unmarked file now pairs as English and Chinese. `MDJT S01E01-EN.srt` beside a
  bilingual `MDJT S01E01.srt` used to open with the English track only, while the episode list said "EN + ZH". The
  unmarked file is now the Chinese track; when there are several, the first with Chinese characters in it.

## [0.8.1] - 2026-10-12

### Fixed

- Saving kept sentences can no longer lose a `notes.md`. The file is written to a temporary sibling and renamed into place,
  so a crash leaves the old notes or the new ones and never half a file. A save also carries the version of the file the
  page read: if the file changed in between (another tab, a hand edit, the agent), the host answers `409` and writes
  nothing, and the page reads the notes again and says so in the kept-sentences drawer. Requests for notes now go out one at
  a time, so a page never conflicts with its own previous save.
- The large picture no longer has black bars above and below it. Its frame is now the biggest box of the video's own shape
  that fits the stage (still at most 1100px wide, centred), using the real width and height the video reports once its
  metadata is in and 16:9 until then, so the "Large" badge, the "R" peek button and the peeked caption sit on the picture
  and follow it when the window gets narrower or shorter. The shown and hidden states are unchanged.
- After clicking a button with the mouse, the space bar plays and pauses again. A press on a button used to leave the focus
  on it, and a button that goes away when pressed (the large picture's "R" peek button, the "R" reveal button on the stage)
  dropped the focus to the document, outside the panel, so the space bar did nothing until the next click on the page. A
  mouse press on a button now keeps the focus on the panel, for every button of the page except the dialogs and the settings
  drawer, which read the keyboard themselves. Tabbing to a button and pressing Space or Enter still presses that button
  and no longer plays or pauses as well.

## [0.8.0] - 2026-10-12

### Added

- Video episodes. `.mkv`, `.mp4`, `.webm` and `.mov` files in an episode folder are another source for the same
  segment: a video pairs with its audio file by the subtitle rule (`MDJT S01E01.mkv` goes with `MDJT S01E01.mp3`), a
  video no audio file owns is a segment of its own (its sound is taken from the video), and a folder of one stem stays
  one episode of one segment. Import takes video with the same rules as audio (never overwrites, 2 GB, a `.part` first).
  The home's cards and the segment list carry a small video mark, 「视频 · 未准备」 while it still has to be prepared.
- The video plays in the page. A video a browser can play as it is (an `mp4` or `webm` with H.264, VP9 or AV1 and
  AAC, Opus or MP3) plays directly. Anything else is prepared once, when the reader asks (「准备视频」): `ffmpeg` copies the
  picture untouched and converts the sound to stereo AAC (the first English track, else the first) into an `mp4` with its
  index first, which takes about as long as reading the file. A picture no browser decodes (HEVC, MPEG-4 Part 2, a 10-bit
  H.264) is not re-encoded: only its sound is extracted to an `m4a`, so a segment with no audio file of its own can still
  be studied by ear. The prepared file lives in the hidden `<episode>/.lingualab/` folder, written as a `.part` and
  renamed into place; the source video is never touched, and deleting the folder only means preparing again.
- One media element plays the audio file or the video, so subtitles, the loop, kept sentences, timing edits and review keep
  working on one timeline. When a job finishes the player swaps to the video at the same position and says so (「视频准备好了，
  从 MM:SS 接着放」). If the video is more than a second longer or shorter than the audio, the page says the subtitles may be
  out of step.
- A picture on the stage with three states, kept per device with the other settings: shown (above the sentence), large (the
  picture takes the stage and the sentence text is hidden) and hidden (the stage as it was, the sound still from the video).
  `V` and a 「画面」 button in the play card cycle them. In the large state `R` shows the English of the current sentence as
  a caption on the picture, and it folds away when the next sentence starts.
- Starting the blind-watch step's timer in the five steps switches the picture to large once, with a notice that has
  「撤销」; pausing that timer or marking the step done puts the previous state back. Opening the page or the drawer never
  switches it, and a choice made by hand always wins.
- Preparing is one host job at a time with progress (from `ffmpeg -progress` against the probed length), a 「取消」 button
  that removes the partial file, and a `.part` left by a crash or restart cleared the next time. Without `ffmpeg` and
  `ffprobe` (on `PATH`, or in the new optional `ffmpegPath` config field: a folder holding both, or either binary) a video that
  plays directly still plays, and one that needs preparing shows a card with the install command.
- A video that cannot be played says so once: the first time a segment is opened in a page session the stage shows a card
  with the reason, and after that a small 「视频放不了 · 详情」 label that opens it again.
- Routes: `GET /lingualab/video`, `POST /lingualab/video-prepare` and `POST /lingualab/video-cancel`. The media route also
  serves the prepared files from `<episode>/.lingualab/` (`mp4` and `m4a` only) and a source `mp4` or `webm`, with `Range`.

### Changed

- The page's one media element is a `<video>` that also plays audio files (it replaces the hidden `<audio>`), and the
  media binding keeps the position when the source changes inside one segment.
- The writes the plugin makes into the media folder are now five: `notes.md`, the progress file, imports, subtitle timing
  and the video cache.

## [0.7.0] - 2026-10-12

### Added

- The time chip on the open kept-sentence card plays and pauses the sentence on stage: it shows a pause icon and fills
  while the sentence plays, and a play icon while it is paused. The chip on any other card still brings its sentence to
  the stage and plays it.
- A kept sentence's note can run over several lines. The note is a text box that grows with what is typed (three to
  eight lines) with a 「Note」 label and a footer: `Ctrl+Enter` (or `Cmd+Enter`) saves, `Enter` adds a line, `Esc`
  cancels, and clicking elsewhere still saves instead of losing the draft. Where there is no note the card offers a
  dashed 「Write a note」 button, and a collapsed card that has one shows a small note icon. In `notes.md` a line break
  in a note is written as `<br>` (`<br/>` and `<br />` are read too), so a phrase still takes one line; notes written
  before read as they always did.
- The timing panel has a mini timeline of the sentence before, the range being edited, the sentence after and the
  playhead, with a neighbour drawn where an edge pushed it. A header says whether the loop is playing, each edge is a
  card with its value, how far it moved, a joined −50 / +50 stepper and 「Set to the playhead」, and the footer lists the
  keys and has 「Reset」, 「Cancel」 and 「Save」. It opens and closes with a motion (a grid row growing from nothing, the
  card fading and lifting in), and is inert while it leaves.
- The five-steps drawer shows one bar of five segments that fill as each step's clock runs, and the steps as a
  vertical stepper. The one step being worked on is open, with its clock against the suggested time, a one-line tip,
  start, resume or pause, and 「Mark done」; the two steps done in the conversation say so with a tag. The drawer
  slides out and its scrim fades out, instead of vanishing.
- A settings drawer, opened from the sliders icon at the right end of the top bar on the home and in the practice
  view (the five-steps drawer and this one close each other). It holds six colour themes (「默认」, 「墨蓝」, 「松绿」,
  「纸张」, 「暮紫」 and 「高对比」), each with a light and a dark palette and shown as a card painted in its own
  colours; whether light or dark follows dsh or is pinned; the size of the sentence on stage (small, medium, large);
  and the lead-in, the same setting as in 「More」. A theme sets dsh's own colour tokens on the page's root element, so
  nothing outside the page changes, and the default theme following dsh sets nothing at all. The choices are kept in
  this browser and apply at once.

### Changed

- The page follows dsh's monochrome look: the fallbacks for the theme tokens are dsh's light theme values, a kept
  sentence's grade is a neutral gray pill with a small colored dot (green, amber, red) instead of a colored chip, the
  three grade buttons are neutral outlined buttons with the same dots in three equal columns, and the one that is on
  fills with the brand color. The time range on the stage reads as pressed with a ring while the timing panel is open.
- A note is edited by clicking its text (the pencil button is gone), and its word chips are neutral.
- The steps in the drawer are buttons rather than hidden checkboxes, and a running clock stops when its step is ticked.

### Fixed

- The warning color was read from `state-warning-primary`, a token the host does not declare, so it was always the
  fallback; it is `state-warn-primary`.
- The header of the five-steps drawer had no styles at all (its class matched no rule), so the title and the close
  button sat unstyled.
- Closing the timing panel or the steps drawer while one of their buttons had the focus left the page without its
  keyboard shortcuts; the focus goes back to the page.

## [0.6.0] - 2026-10-11

### Added

- A lead-in in the 「More」 menu (off, 0.1, 0.2, 0.3 or 0.5 s): every jump to a sentence (stepping, looping it,
  replaying a kept one, rewinding after shadowing) starts that much before its start, so a subtitle that begins
  after the voice no longer clips the first syllable. The sentence stays the active one through the run-up, so a
  loop or shadowing never acts on the sentence before it. A seek to a plain time and the timing strip get no
  lead-in. The choice is remembered per browser.

### Changed

- In the timing strip an edge now pushes its neighbour instead of stopping at it. Moving a start earlier than the
  previous sentence's end moves that end with it, and moving an end past the next sentence's start moves that start,
  so a sentence cut back to back with the one before can still start earlier when its voice does. The strip says
  where the neighbour's edge goes, the save writes both cues (and the Chinese file's cues as far as they would
  overlap), and the push stops where the neighbour would be shorter than 0.2 s. `POST /lingualab/subtitle-timing`
  accepts several cues of one file in one request.
- A phrase picked on the stage is tinted as one band, rounded at its two ends only, instead of a row of rounded
  words with square gaps between them.
- Hover, press, focus and on/off states across the page now fade quickly instead of snapping, the way a word on the
  stage already did. Buttons, sentence rows, cards, menus, tabs, grade buttons, word chips and the phrase band share one
  timing (`--ll-fast`, 0.12 s) and ease, and each element fades exactly the properties that change. A row's action
  icons now fade out as well as in, and `prefers-reduced-motion` still turns every fade off.

## [0.5.0] - 2026-10-11

### Added

- An episode folder with two or more audio files is now one episode made of segments, one scene per audio file in
  natural order, instead of an episode that only ever opened its first file. Each segment pairs its own subtitles by
  name, the longest audio name winning, and the page plays one segment at a time: the top bar shows `01 · Title`
  with a button that lists every segment and marks the finished ones, the finish card offers the next segment (only
  the last one says the episode is done), and the home card reads `S01E01 · 3 / 10 parts` with Continue opening the
  segment listened to most recently, or the next unfinished one once that was heard to the end. Kept sentences stay in one `notes.md` under a `## <segment>` heading each, the
  drawer groups them by segment, and replaying one from another segment opens that segment first.
- A subtitle named with `双语` or `bilingual` (`01_Scene_双语.srt`) is read as one file with both languages, decided
  by name. Its Chinese lines are the Chinese track, and the picker says "both tracks" for such a folder instead of
  "subtitles unchecked".
- A sentence whose start or end is a beat off can now be fixed on the page. Click its time range on the stage, press
  `T`, or pick "Adjust this sentence's start and end" in More: a strip under the stage shows both edges to the
  millisecond while the sentence loops, `←` `→` nudge the focused edge by 50 ms (250 ms with `Shift`), `Tab`
  switches edges, `I` and `O` set them to the playhead, `Enter` saves and `Esc` cancels. An edge never crosses its
  neighbours. The save is written into the subtitle file itself through the new `POST /lingualab/subtitle-timing`:
  only that cue's timecode line changes, in the format it had, and every other byte (numbering, style tags, line
  endings, a GBK encoding) stays as it was. The original is kept once as `<name>.bak`; a file that changed since the
  page read it is refused with `409`; a Chinese track in its own file moves with the English; LRC moves its start
  only; and only files inside the library can be saved. A kept sentence whose start crosses a whole second keeps its
  star.
- Review. 「复习」 in the 「收藏」 column goes through the episode's sentences not yet graded 「记住了」, in play order:
  each goes on stage with its English hidden and loops, `R` reveals it, `1` `2` `3` grade it and move on, `→` skips,
  `←` goes back and `Esc` ends the review. A strip above the stage reads 「复习 3 / 12」, and the end card counts the
  grades and offers another pass over the ones graded 「没记住」. A card on the home, 「复习收藏 · 还在练 42 句，来自 5 集」,
  starts the same review over the whole library, opening each sentence's episode and segment in turn, from the new
  read-only `GET /lingualab/review`. A review does not move the place 「继续」 resumes from.
- A phrase can be kept as one: drag across words on the stage, or `Shift`-click a second word, and the popover offers
  the span between them, stored as `[her skirt]`. 「已记下」 is now a toggle that takes the word or phrase out again,
  and every word on a card has a remove button.

### Changed

- The notes drawer is gone. The kept sentences are the right column's other view, 「收藏」, next to the subtitles: the
  column head switches between them (so does the top bar's 「笔记」 chip, and `N`, which no longer keeps a sentence;
  `S` does). The stage and the transport stay usable, clicking a card puts its sentence on stage and loops it, the
  card of the sentence on stage is the open one, and the cards are in play order.
- A kept sentence has one state instead of a tick and two tag toggles: 「新收藏」, 「模糊」, 「没记住」 or 「记住了」, set
  with the three buttons on its card or with `1` 「记住了」, `2` 「模糊」 and `3` 「没记住」 on the sentence on stage. The
  line format is unchanged (`[x]`, `#review`, `#hard`), so an older file reads as one state per line, with `#hard`
  winning over `#review`; a grade clears the tick and both tags before setting its own and keeps any other tag. A
  fresh `notes.md` opens with a preamble that explains the grades.
- Listening positions are kept per segment for an episode that has them, and up to 1000 are remembered (it was 100).
  A position stored before the episode had segments is read as the first segment's, and so are the notes written
  before it, until the next save files them under its heading. The five steps stay per episode.
- A kept sentence is the same one only when its segment matches too, so two scenes that both open on the same line
  at 00:02 no longer share a star. `POST /lingualab/open` takes an optional `segment` and answers with the one it
  opened, and an unknown segment is refused with a reason.
- `scripts/check-bilingual.mjs` refuses an argument it does not know and a `--root` outside the temp directory, as
  the notes gates do. A misspelled flag used to be dropped, and `--root <another checkout> --write` rewrote that
  checkout's records. Its self-test now also runs the shared `--root` guard cases.

### Fixed

- An LRC time with a three-digit fraction below 100 (`[00:12.050]`) was read as half a second rather than fifty
  milliseconds. The digit count now decides, as the parser always meant to.
- A kept sentence with tags but no note was written as `| 中文 | #review`, which read back with the tag as its note and
  no tag. The empty note field is now kept in front of the tags.
- Enter on the finish card's focused button now presses it. The page's own Enter, which plays the selected sentence,
  took the key first, so the next episode or segment the card focused could not be reached from the keyboard.
- Replaying a kept sentence loops that sentence again. The note keeps whole seconds, so a sentence starting at
  135.08 s was sought to 135, a gap before it, and the sentence before was the one that looped. The replay now finds
  the cue by its second and its English, as the star does.
- Continuing an episode that was already open from the home no longer shows the first sentence. The audio resumed at
  the saved position, but the subtitles were parsed again and handed to the page as a new list, which reset the
  player to the start: the sentence count, the scrubber and the next arrow key all ignored where the audio was. An
  episode that is opened again with the same subtitles keeps the list it has, and a reload still reads them again.
- Escape now closes the More menu in the practice view, ahead of every other Escape action and without also
  clearing the A-B marks, and focus goes back to the More button. The menu's key list also lists R, which uncovers
  the English while shadowing.
- A kept sentence playing from the notes drawer can be paused there. The drawer's scrim covers the transport, and its
  time chip only replayed, so a looping sentence stopped only once the drawer was closed. The chip of the sentence on
  stage now reads as a pause button while the audio plays, and replaying a sentence starts the audio when it was
  paused, in the same segment or another.
- `npm run bilingual:check -- --write` on Windows no longer rewrites every record. The record header named the pair
  with `` separators there, so each run turned all twelve records into a diff; the paths are written with `/` now.

## [0.4.0] - 2026-10-10

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
