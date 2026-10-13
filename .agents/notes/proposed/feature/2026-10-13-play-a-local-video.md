# Agent Note: play the picture from a file on the reader's own machine

Status: proposed

## Problem

On a remote dsh the picture is the one thing that needs the link: the subtitles, notes and progress are a
few kilobytes, a hidden picture plays the audio file (55 MB for an episode), but a shown picture streams the
prepared video at about 5.5 Mbps over a link that measured about 8.5 Mbps. The smooth version proposed the
same day brings that down to about 1.9 Mbps, at the cost of encoding on the server and a smaller picture.

A reader often has the same video on the machine in front of them: it is where the episode was imported
from. Played from there, the picture needs no link at all, seeks at disk speed, and keeps its full quality.
The question raised on 2026-10-13 was whether the page can play such a file without putting it in the
library.

On a local dsh this changes nothing: the server is the same machine and already reads the file from disk.
The gain is on a remote dsh.

## Proposal

**「用本地文件播放」 on the video stage: the reader picks the episode's video from their own disk, and the
page plays it in place of the served one, for this segment, without uploading it.**

- **Nothing leaves the browser.** The file is opened with a file picker (or dropped on the stage) and
  played from an object URL (`URL.createObjectURL`). It is not uploaded, not imported and not written
  anywhere; the host never learns about it. Dropping a video on the stage means "play this", while
  dropping on the home page still means "import", as now.
- **It joins the one timeline.** The local file becomes the media element's source through `playSource`,
  ahead of the served video, under the same session, so the position, loop, speed, subtitles, kept
  sentences, review and the five steps all carry on as with a served video. Hiding the picture still plays
  the audio file; with a local file that costs nothing, but it keeps one rule.
- **It has to be the same video.** The local file's length is compared with the served video's (the
  status route already reports it). Within a second it is taken as the same file, and the length check the
  served video already has against the audio still applies. A different length shows the existing
  "subtitles may be out of step" notice with the difference, and plays anyway, because a different cut of
  the same episode is still worth watching.
- **It has to be a file the browser plays.** There is no `ffmpeg` in the browser, so an `mp4` (H.264 with
  AAC) is the format that works everywhere. A file the browser cannot decode falls back to the served
  source through the existing "cannot decode" path, with a message that says to use an `mp4`. A source
  `mkv` may play its picture in Chromium but often not its sound (DTS, AC-3); see the open questions.
- **It lasts for the page session, or longer where the browser allows.** An object URL dies with the page.
  Where the File System Access API is available (Chromium on HTTPS, which the live site is), the file
  handle is kept per segment in IndexedDB, and opening the segment again asks once for permission to read
  it instead of asking for the file. Elsewhere the reader picks it again. Nothing about it goes to the
  host, so it is per device, like the settings.
- **It is visible.** The stage labels a local picture (「本地文件」) with a way to stop using it, so a reader
  is never unsure which file is playing.

## Alternatives considered

- **Upload the file into the library.** That is the existing import. It costs the upload once and the
  stream every time after, which is the problem being solved.
- **Play the local picture muted next to the served audio.** Would handle a source with DTS sound, but it
  is two media elements kept in step, which the video note rejected: every seek, rate change and loop
  done twice, and drift between them.
- **Download the served video into the browser's storage (OPFS) once, then play it from there.** Needs no
  local copy, but a 941 MB download at 1 MB/s is about 15 minutes, browsers cap and may evict that much
  storage, and the cache validators from v0.9.3 already let the HTTP cache keep what it can. It stays an
  option if readers without a local copy ask for it.
- **Fold this into the smooth version note.** The two answer the same complaint but share no code: the
  smooth version is a host job that changes a file, this is a client-only source. They are kept apart so
  each can be built or dropped on its own, and they combine: a reader with the file plays it locally, a
  reader without it gets the smooth version.

## Open questions

- **A source whose sound the browser cannot play.** Chromium may play an `mkv`'s H.264 picture with no
  sound when the track is DTS or AC-3, and there is no standard way to ask an element whether it found
  audio. Telling the reader beforehand (use an `mp4`), detecting it after a second of playing (the
  non-standard `webkitAudioDecodedByteCount`), or reading the container's track list in the page are the
  choices, from cheapest to most work.
- **Matching without the served video.** A segment whose video was never prepared has no served length to
  compare with. Comparing with the audio file's length instead would allow a local picture for any
  segment that has a video file, prepared or not.

Related: [a smooth version of a video for slow links](2026-10-13-smooth-video.md),
[play video episodes in the page](../../implemented/feature/2026-10-12-video-episodes.md).
