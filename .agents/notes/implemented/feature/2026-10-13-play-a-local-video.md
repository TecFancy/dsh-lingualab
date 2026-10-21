# Agent Note: play the picture from a file on the user's own machine

Status: implemented

## Problem

On a remote dsh the picture is the one thing that needs the link: the subtitles, notes and progress are a
few kilobytes, a hidden picture plays the audio file (55 MB for an episode), but a shown picture streams the
prepared video at about 5.5 Mbps over a link that measured about 8.5 Mbps. The smooth version proposed the
same day brings that down to about 1.9 Mbps, at the cost of encoding on the server and a smaller picture.

A user often has the same video on the machine in front of them: it is where the episode was imported
from. Played from there, the picture needs no link at all, seeks at disk speed, and keeps its full quality.
The question raised on 2026-10-13 was whether the page can play such a file without putting it in the
library.

On a local dsh this changes nothing: the server is the same machine and already reads the file from disk.
The gain is on a remote dsh.

## Decision

**「用本地文件播放」 on the video stage: the user picks the episode's video from their own disk, and the
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
  status route already reports it), or with the audio file's when that was never probed. Within a second it
  is taken as the same file, and the length check the served video already has against the audio still applies. A different length shows the existing
  "subtitles may be out of step" notice with the difference, and plays anyway, because a different cut of
  the same episode is still worth watching.
- **It has to be a file the browser plays.** There is no `ffmpeg` in the browser, so an `mp4` (H.264 with
  AAC) is the format that works everywhere. A file the browser cannot decode falls back to the served
  source through the existing "cannot decode" path, with a message that says to use an `mp4`. A source
  `mkv` may play its picture in Chromium but often not its sound (DTS, AC-3); the page only says so
  beforehand (see the settled details).
- **It lasts for the page session, or longer where the browser allows.** An object URL dies with the page.
  Where the File System Access API is available (Chromium on HTTPS, which the live site is), the file
  handle is kept per segment in IndexedDB, and opening the segment again asks once for permission to read
  it instead of asking for the file. Elsewhere the user picks it again. Nothing about it goes to the
  host, so it is per device, like the settings.
- **It is visible.** The stage labels a local picture (「本地文件」) with a way to stop using it, so a user
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
  option if users without a local copy ask for it.
- **Fold this into the smooth version note.** The two answer the same complaint but share no code: the
  smooth version is a host job that changes a file, this is a client-only source. They are kept apart so
  each can be built or dropped on its own, and they combine: a user with the file plays it locally, a
  user without it gets the smooth version.

## Settled details

Two questions were open when this was proposed. They were settled on 2026-10-13, before the build:

- **A format the browser cannot play is a hint, not a check.** The picker says that an `mp4` (H.264 with AAC) plays
  everywhere and that an `mkv` often plays with no sound, and does nothing more about sound. Detecting a missing audio
  track (the non-standard `webkitAudioDecodedByteCount`) or reading the container's track list would be code for a case
  the user fixes in a minute by choosing an `mp4`. A file the browser cannot decode at all does fall back to the served
  source, with a notice that says to use an `mp4`, and the file is forgotten, since it will not decode next time either.
- **The reference length falls back to the audio file.** The served video's probed length is compared first. When the
  host never probed it (the video was never prepared), the segment's audio file stands in, since the subtitles were timed
  against it, so any segment that has a video file can use a local picture, prepared or not. With neither length known
  the file plays without a notice.

Decisions made while building:

- **The local file comes ahead of every state the served video can be in**, including a running job and a failed one,
  and a segment with a video file always offers it: as a small action on the corner of the picture, and as the last row of
  every card. With the picture hidden the rule is the served video's own: the audio file plays, and a segment with no
  audio file plays the local one, being the only sound.
- **The length is read by a throwaway element**, never by the page's one media element, so that element loads the file
  once. A container the browser cannot read the length of (some `mkv`) gives no notice rather than a wrong one.
- **Two warnings, one rule.** A local file within a second of the reference is the same file, and then the served
  video's own length warning against the audio still applies. A file that differs shows the existing warning with the
  difference from the reference (positive when the local file is longer) instead.
- **Only where the browser has `showOpenFilePicker` is a choice remembered.** The handle is kept per segment in
  IndexedDB, on this device only. Opening the segment again offers 「继续用本地文件」 with the file's name, because
  asking permission to read it needs a click; 「忘记」 removes it, 「停用」 keeps it (stopping is not a verdict on the
  file), and a handle whose file is gone is dropped after saying so. Elsewhere the page uses a plain file input and the user picks the file again in
  each page session. Every IndexedDB call is allowed to fail, and then nothing is remembered.
- **The object URL lives as long as the file is in use.** It is revoked when the file is replaced or stopped, when the
  segment changes (the remembered handle offers the file back) and when the page goes.
- **「视频准备好了」 waits while a local file plays.** It is about the served video, which is not what plays then.
- **A video dropped on the practice stage is the choice; nothing else it could mean happens.** Only a video file is
  taken, anything else dropped there is ignored (and not opened by the browser), and the drop never reaches the import,
  which stays on the home page.

Related: [a smooth version of a video for slow links](../../implemented/feature/2026-10-13-smooth-video.md),
[play video episodes in the page](../../implemented/feature/2026-10-12-video-episodes.md).
