# Agent Note: a smooth version of a video for slow links

Status: proposed

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

## Proposal

**A second way of preparing a video, 「准备流畅版」, which re-encodes the picture for streaming.** It is
started by hand for one episode or segment, and once it is ready it replaces the full-size prepared file.

- **What it writes.** H.264 (`libx264`, `veryfast`, CRF 23, capped at 1.8 Mbps with a 3.6 Mbit buffer),
  8-bit 4:2:0, no taller than 720 lines (a smaller picture keeps its size), a keyframe every 2 seconds
  whatever the frame rate, and the sound as stereo AAC at 128 kb/s, with the index at the front
  (`+faststart`). A keyframe every 2 seconds means a seek fetches at most about half a megabyte it does
  not play; the source's keyframes are about 4 seconds apart on average.
- **Started by hand.** A playable video gets a 「准备流畅版」 action where the stage shows the video's
  state, with the estimated size and time. It runs in the existing one-at-a-time job queue, with the same
  progress and 「取消」 as preparing, and a failed or cancelled job leaves the current file playing.
  Preparing an ordinary video stays as it is: one minute of remuxing, no re-encoding.
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

## Open questions

- **Pictures that cannot be played today.** Re-encoding makes any picture `ffmpeg` can decode playable,
  including HEVC, MPEG-4 Part 2 and 10-bit H.264, which are now prepared as sound only. Offering
  「准备流畅版」 on the sound-only card would turn those into videos. This widens the feature beyond slow
  links and is left to decide when it is built.
- **Going back to the full picture.** Once the full-size file is deleted, getting it back means preparing
  it again, which is a minute of remuxing. Whether the page offers that as an action, or the reader deletes
  the smooth file by hand, is left to decide when it is built.

Related: [play the picture from a file on the reader's own machine](../../implemented/feature/2026-10-13-play-a-local-video.md),
[play video episodes in the page](../../implemented/feature/2026-10-12-video-episodes.md).
