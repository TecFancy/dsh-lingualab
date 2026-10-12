# Agent Note: play video episodes in the page

Status: implemented

## Problem

The first version left video out on purpose
([the first version ships without a waveform, video or shadowing scores](../simplification/2026-10-08-v1-without-waveform.md)):
the video lived on the NAS, it was large, and embedding it meant range requests over a home uplink.
The blind-watch step of the method was done in an external player.

On 2026-10-12 an episode's video was copied into the workspace next to its audio and subtitles
(`S01E01/MDJT S01E01.mkv`, 1.1 GB, 23 minutes), the same way audio is copied in
([episode media stays in the workspace](../architecture/2026-10-08-media-stays-in-the-workspace.md)).
Once the file is local the NAS argument no longer holds, and the question was whether the page can
play it.

It cannot as it stands, and not only because the scan ignores video. Probing the file shows what a
typical downloaded episode looks like:

| Track | Codec | In a browser |
|---|---|---|
| Video | H.264 High, 1280×720 | Plays |
| Audio | DTS 5.1 | **No browser decodes DTS** |
| Subtitles | SubRip, Chinese and English, embedded | `<video>` does not show them |

Chromium also plays the Matroska container only in part. Handing this file to a `<video>` element
would at best show a picture with no sound. The video has to be converted once before the page can
play it, and that is the part of this feature that needs a decision.

## Decision

**A video is another source for the same segment, and it is converted once, into a hidden cache,
when the reader asks.**

- **Recognised files.** `mkv`, `mp4`, `webm` and `mov` join the scan as video. A video pairs with its
  segment by stem, by the same rule subtitles use (`src/shared/stem.ts`), so `MDJT S01E01.mkv` belongs
  to the segment of `MDJT S01E01.mp3`, and the folder is still one episode of one segment. A video
  with no audio file beside it is a segment on its own. The library card and the segment list show a
  small video mark.
- **Probe before converting.** The host runs `ffprobe` on the file. A video that a browser can play as
  it is (an `mp4` or `webm` holding H.264, VP9 or AV1 with AAC, Opus or MP3) is played directly, with
  nothing written. Anything else needs preparing.
- **Preparing is remuxing, not re-encoding.** `ffmpeg` copies the video track as it is and converts
  only the audio, to stereo AAC (the first English track, else the first track), into an `mp4` with
  its index at the front (`+faststart`) so that seeking works over range requests from the start.
  For this file that takes about a minute, not the length of the episode. A video whose own codec a
  browser cannot decode (HEVC, MPEG-4 Part 2, VC-1) is not re-encoded: re-encoding a 23-minute
  picture on this machine would take longer than watching it, and is out of scope. Preparing such a
  video extracts only its sound, so a segment with no audio file of its own can still be studied by
  ear.
- **The prepared file lives in a hidden cache:** `<episode>/.lingualab/<stem>.mp4`, or
  `<stem>.m4a` when only the sound could be kept. The scan already
  skips names starting with a dot, so the cache never appears as a file of its own. It is written as a
  `.part` and renamed into place, it belongs to the plugin, and deleting the folder only means
  preparing again. The source video is never modified. This is a fifth write into the media library,
  next to `notes.md`, the progress file, imports and subtitle timing, and the skill's list of writes
  gains it when this is built.
- **The reader starts it.** Opening a segment whose video is not prepared shows a 「准备视频」 action
  on the stage, with the estimated size. Preparing is one host job at a time, reports progress (from
  `ffmpeg -progress` against the probed duration), can be cancelled, and leaves the audio playable
  meanwhile. A `.part` left by a crash or a restart is cleared the next time.
- **One timeline.** Once a segment has a playable video, the player uses it, and its sound is the
  sound of the session. Subtitles, the loop, kept sentences and timing edits keep working unchanged,
  because they all address seconds on that timeline. If the video's duration differs from the audio
  file's by more than a second, the page says the subtitles may be out of step; it still plays.
- **The picture on the stage.** The video sits at the top of the stage with the current sentence
  under it; the stage subtitles stay ours, so the reveal modes, the word bubbles and the stage size
  all still apply. `V` (and a button in the play card) cycles the picture between three states:
  **shown**, **large** (the picture takes the stage and the sentence text is hidden, for the
  blind-watch step), and **hidden** (the stage looks as it does today, the sound still comes from the
  video). The choice is kept per device, like the other settings.
- **ffmpeg is the host's, and optional.** The host looks for `ffmpeg` and `ffprobe` on `PATH`, or in an
  optional `ffmpegPath` config field. Without them, a video that plays directly still plays, and one
  that needs preparing says so with the command to install them. The binaries are spawned with an
  argument list, never a shell, on paths the host resolved itself.
- **Inside the library only.** Preparing writes into the library, so a video opened from elsewhere in
  the workspace is played only when it plays directly, the same boundary subtitle timing draws.
- **Import accepts video**, with the same rules as audio: no overwrite, the 2 GB limit, a `.part` first.

Embedded subtitles are not extracted in this round. The common case already has subtitle files beside
the video (this episode does), and extracting them is a separate write with its own questions
(image-based subtitles, which track wins over a file that is already there).

## Alternatives considered

- **Play the `.mkv` directly.** No write and no ffmpeg, but there is no sound for DTS, AC-3 or
  TrueHD audio, which is most downloaded material, and the container support is partial. Rejected.
- **Transcode on the fly, streaming from ffmpeg.** No cache on disk, but a piped stream has no length
  and cannot answer range requests, so every seek restarts a process, and the whole method is
  seeking. Rejected.
- **A muted picture slaved to the existing audio file.** Keeps the audio that the subtitles were
  timed against, but two media elements drift, and every seek, rate change and loop has to be done
  twice and kept in step. One element with one timeline is simpler, and the duration check catches
  the case where the two files really differ.
- **Write the prepared `mp4` next to the source.** Visible and easy to find, but it is a second media
  file with the same stem in a folder the reader owns, and the plugin would be cluttering it with a
  file the reader did not put there.
- **Convert at import, or in a background sweep.** Saves a click, but spends a minute and a gigabyte
  of disk on episodes that may not be studied for weeks. Preparing when the episode is opened matches
  the "one episode at a time" habit the media note set.
- **Keep watching in an external player.** Costs nothing, and remains the fallback when ffmpeg is
  missing, but it keeps the blind-watch step out of the page, along with its timer and its tick.

## Settled details

The design round on 2026-10-12 settled these before anything was built.

- **The picture follows the five steps, but only through the timer.** Starting the blind-watch
  step's timer switches the picture to large once, with 「撤销」 in the notice; pausing that timer or
  marking the step done puts back the state from before. Opening the page or the steps drawer never
  switches it. Starting the timer is the reader saying "I am doing step one now", and an undo is one
  click.
- **`R` peeks at the sentence in the large state.** It is the same key and the same meaning as the
  reveal in shadowing mode: the hidden English of the current sentence is shown, as a caption on the
  picture, and it folds away when the next sentence starts, so a blind watch cannot quietly turn into
  a watch with subtitles.
- **A video that cannot be played says so once.** The first time, the stage shows the full card with
  the reason. After that the stage keeps the ordinary audio layout and a small 「视频放不了 · 详情」
  label at the top, which opens the reason again. There is no "don't show again" switch, because it
  would be one more piece of state to keep for information that stays useful.
- **Sizes.** In the shown state the picture is 608×342 on a 1440-wide page and scales with the stage;
  in the large state it takes the stage above the play card. The library card and the segment list
  carry a small video mark, with 「未准备」 when the video still needs preparing.
- **Without `ffprobe` nothing can be verified.** An `mp4` or `webm` is then offered for direct play, and the page falls back
  to the audio file, with the unplayable card, if the browser says it cannot decode it; an `mkv` or `mov` says it needs
  ffmpeg. H.264 in a pixel format browsers do not decode (10-bit, 4:4:4) counts as a picture that cannot be played, because
  copying it into an `mp4` would not help.
- **Videos belong to folder episodes.** A file episode (one audio file picked from the workspace) has no video, and the
  picker does not list video files; both follow from preparing writing into the library.

The canvas is [the video episodes design](https://claude.ai/artifact/JK82Yco7ogLKqJcaVkwFKe).
