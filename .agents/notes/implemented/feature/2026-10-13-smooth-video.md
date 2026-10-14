# Agent Note: a smooth version of a video for slow links

Status: implemented

## Problem

A prepared video keeps the picture exactly as it came. For the one episode on the live server that is a
720p H.264 track at about 5.3 Mbps, so the prepared `mp4` is 941 MB for 23 minutes and plays at about
5.5 Mbps. The server's link measured about 8.5 Mbps (1 MB/s) on 2026-10-13, with a round trip of about
20 ms, so bandwidth is the limit, not latency:

- playing leaves about 1.5 times headroom, so a peak in the picture or any other request at the same
  time stalls it, and a reader on a link slower than 5.5 Mbps cannot play it through at all;
- a seek to a part that is not buffered took 4 to 8 seconds before the picture played again;
- the index at the front of the file is 1.4 MB, so even learning the length takes more than a second.

v0.9.3 removed the cases where the picture is not needed (a hidden picture now plays the audio file) and
lets the browser reuse what it has downloaded. Watching the picture still needs the 5.5 Mbps.

The video note set re-encoding aside because re-encoding a 23-minute picture would take longer than
watching it. That was measured on the development machine. On the server, on 2026-10-13, `libx264` at
`veryfast` with a 1.8 Mbps cap encoded one minute of this episode at 1.53 times real time (37 frames per
second), and the result averaged 1777 kb/s. A whole episode would take about 15 minutes and weigh about
330 MB with its sound. That is cheap enough to offer, though not cheap enough to do for every video.

## Decision

**A second way of preparing a video, 「准备流畅版」, which re-encodes the picture for streaming.** It is
started by hand for one episode or segment, and once it is ready it replaces the full-size prepared file.

- **What it writes.** H.264 (`libx264`, `veryfast`, CRF 23, capped at 1.8 Mbps with a 3.6 Mbit buffer),
  8-bit 4:2:0, no taller than 720 lines (a smaller picture keeps its size), a keyframe every 2 seconds
  whatever the frame rate, and the sound as stereo AAC at 128 kb/s, with the index at the front
  (`+faststart`). A keyframe every 2 seconds means a seek fetches at most about half a megabyte it does
  not play; the source's keyframes are about 4 seconds apart on average.
- **Started by hand.** A video the page can show gets a 「准备流畅版」 action in the corner of the
  picture, with the estimated size and time next to it. It runs in the existing one-at-a-time job
  queue, with the same progress and 「取消」 as preparing, and a failed or cancelled job leaves the
  current file playing. Preparing an ordinary video stays as it is: one minute of remuxing, no
  re-encoding.
- **It replaces, it does not add.** The result is written as `<episode>/.lingualab/<stem>.smooth.mp4`
  (through a `.part`, as now). Once it is in place the full-size `<stem>.mp4` in the cache is deleted, so
  an episode costs 330 MB of disk instead of 941 MB, not both. A source that plays directly is the
  reader's own file and is never touched; the smooth file is simply preferred to it. The order the status
  route picks from is smooth, then prepared, then direct, and it says which (`via: 'smooth'`), so the page
  can label it.
- **It does not slow the host down.** The `ffmpeg` process is started at a lower priority
  (`os.setPriority`, 10, which works on Linux and Windows alike) and with one thread fewer than the
  machine has cores, so the dsh pages stay responsive while it runs. Encoding takes a little longer on a
  busy machine, which a job that runs once per episode can afford.
- **The player needs nothing new.** A finished job changes the URL the status route returns, and the page
  already swaps sources under the same session, keeping the position. The cache validators from v0.9.3
  tell the browser the bytes are new.

## Alternatives considered

- **Re-encode every video when it is prepared, or behind a config switch.** Saves a click, but every
  video then waits 15 minutes instead of one, and a reader on a fast link gives up picture quality for
  nothing. Preparing on demand, per episode, matches how the video note already handles preparing.
- **Keep both files and add a quality switch.** Lets a reader on a fast link keep the full picture, but
  costs about 1.3 GB per episode and adds a control and a setting. The smooth file at 720p is good
  enough for watching a scene to follow the dialogue, which is what the five steps use the picture for.
- **Adaptive streaming (HLS or DASH with several renditions).** Picks the quality per link
  automatically, but it needs a segmenter, a manifest route and a player library the shell's module table
  does not have, and several renditions cost more encoding and disk than one. Too much machinery for a
  plugin with one reader at a time.
- **A lower resolution, such as 540p at 1 Mbps.** Smaller still, but the measured 720p at 1.8 Mbps
  already leaves about 4.5 times headroom on this link, and text in the picture (signs, phones) stays
  readable at 720p.
- **VP9 or AV1.** About a third smaller at the same quality, but several times slower to encode on a CPU,
  which turns 15 minutes into an hour or more.
- **Put the media behind a CDN.** Raises the link itself and helps every file, but it is a deployment
  choice outside this plugin. It remains worth doing if more readers use the server.
- **A route of its own for going back to the original quality.** The prepare route already takes a mode
  and answers with the status, and going back is "prepare it as it was", so it is one more mode, not a
  fourth route with its own naming record and guard.
- **Leave the full-size prepared file in place next to the smooth one.** Makes going back instant, but it
  is the 941 MB the smooth version exists to avoid, and going back costs only a minute of remuxing.

## Settled details

Two questions were open when this was proposed. The owner settled them on 2026-10-14, before the build:

- **The smooth version is offered on the sound-only card too.** Re-encoding makes any picture `ffmpeg` can decode
  playable, including HEVC, MPEG-4 Part 2 and 10-bit H.264, which are otherwise prepared as sound only. So 「准备流畅版」
  is on the cards of those videos, and the same job turns them into a video that plays. This widens the feature beyond slow
  links, and it is planned in the pure planner (`planSmooth`) from the same probe, so it holds for any file that has a
  picture and a sound, and is unit-tested there.
- **「改回原画质」 is an action.** A remote reader cannot delete server files by hand, so without it the smooth version
  would be a one-way door. It sits on the playing smooth picture, deletes `<stem>.smooth.mp4` and prepares the video as it
  was before, through the same job queue (the one-minute remux). For a source that could only ever be sound (its picture a
  browser cannot decode), going back is only the deletion, which returns to the sound-only state.

Decisions made while building:

- **A smooth job does not take the picture away.** It is the one job that runs while a picture plays, so while it
  runs the status keeps `playable` (or `sound-ready`) with its URL and only adds `progress` and `jobKind: 'smooth'`; the
  corner of the picture shows the percentage and 「取消」. A state with nothing to play (not prepared, sound only, an
  undecodable picture with an audio file) becomes `preparing`, and the card shows the progress as it does for any job.
  The page tells a running job by `progress`, not by the state, and says 「流畅版准备好了」 only when the file that plays
  has changed, so a cancelled or failed smooth job says nothing.
- **A failed smooth job is the smooth field's to tell.** It does not become the `failed` state, which would cover the
  picture that is playing; it is `smooth.error`, shown under the control and on the card, and the action is offered again.
- **Where it is offered.** In the corner of a picture that plays, and at the foot of the prepare card (an `mkv` is the
  common case, and a smooth file is smaller than the remux it replaces), the sound-only card, the sound-ready card and the
  unplayable card, which stands for a picture a browser cannot decode when the segment has its own audio file. Not on the
  failed, ffmpeg and progress cards. Not at all without `ffmpeg` and `ffprobe`, for a file with no sound or no picture, while a
  job for that segment runs, or once the smooth file exists. While the reader's own local file plays, or the picture is
  hidden, the corner stays quiet. Another segment's job running is the usual `busy` refusal, shown under the control.
- **The estimate is the proposal's numbers and nothing cleverer.** About 1.9 Mbps for the size (picture and sound) and 1.5
  times real time for the encode, both from the probed length, so the host computes them and the page only words them
  (「约 315 MB，约 16 分钟（估计）」, the time in whole minutes, under a minute when it is). The progress card gives the
  time left in minutes once it is two minutes or more.
- **Priority and threads.** `os.setPriority(pid, 10)` is called right after the spawn, only for the smooth job, and a
  refusal is swallowed (the job then runs at the usual priority, which only costs time). Threads are `os.availableParallelism()`
  minus one, at least one, passed as `-threads`. Both come through a small injected host description, so the job tests
  never touch a real process, and the test fake has no process id unless a test gives it one.
- **The `ffmpeg` arguments, checked against a real one.** The height cap is `scale=-2:min(720\,ih)` (the comma is escaped,
  or the filter graph reads it as the end of the filter; the `-2` keeps the width even), the pixel format is forced to
  `yuv420p`, and keyframes come from `-force_key_frames expr:gte(t,n_forced*2)`. A real ffmpeg, where one is installed,
  confirms 1080 lines become 720, 240 stay 240, and the keyframes land at 0, 2 and 4 seconds at 25 and at 60 frames per
  second. The smooth sound is 128 kb/s, the prepared sound stays 160 kb/s.
- **Replacing happens in the job, after the rename.** The full-size `<stem>.mp4` is deleted once `<stem>.smooth.mp4` is in
  place; a file the browser still has open may refuse to go (Windows), which is harmless because the smooth file is
  preferred. The sound-only `<stem>.m4a` is left alone, which is what lets going back return a sound-only source to its
  state. A smooth file older than its source does not count, like the other cache files.
- **Going back is a mode of the prepare route** (`mode: 'original'`). With no smooth file it does nothing. While any job
  runs it refuses and deletes nothing, since that job may be writing the file that would replace it. Otherwise it deletes the
  smooth file, and a source that needed the remux starts that job through the queue; one that plays directly, or whose
  picture a browser cannot decode, needs nothing more. A request for a smooth version that exists is refused.
- **One job at a time still means "busy", not a waiting queue.** The proposal said queue; the existing runner answers
  `busy` to a second job, so the smooth version does the same rather than adding a queue only it would use.
- **The sound-only card no longer says re-encoding is slower than watching.** That was the reason for sound only; the card
  now offers the smooth version beside it. The failed card's 「重试」 also asks for the sound again when it was a
  sound-only job that failed; it used to ask for the picture, which the host refuses for such a file.
- **A known edge.** A segment whose stem itself ends in `.smooth` would share a file name with the smooth file of the
  segment without that ending. It is rare enough that a longer extension for everyone was not worth it.

Related: [play the picture from a file on the reader's own machine](../../implemented/feature/2026-10-13-play-a-local-video.md),
[play video episodes in the page](../../implemented/feature/2026-10-12-video-episodes.md).
