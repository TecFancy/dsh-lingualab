# Agent Note: episode media stays in the workspace, and never enters git

Status: implemented

## Problem

The material lives on a home NAS, the host runs on a cloud machine, and the two are
joined by a Tailscale link rather than a LAN. Streaming every episode from the NAS
would make playback depend on the home uplink for as long as the study session lasts,
and the media library is far larger than anything that belongs in a git repository:
one season of audio is a couple of gigabytes, and the video is tens of gigabytes.

At the same time the panel has to be able to play an episode without a download step
in front of it, because the whole point of moving this into the harness is that
opening the page is the only step.

## Decision

Episodes are copied into the workspace one at a time, by hand, into
`notes/learning/english/media/<episode>/`. The panel serves them from disk over the
host's own routes. The audio directory carries its own `.gitignore`, so the material
is present for the plugin and absent from the repository: the markdown, the
subtitles and the manifest are tracked, the audio is not.

## Alternatives considered

- **Stream from the NAS through the host.** No local copy, but every seek becomes a
  request over the home uplink, and a study session is mostly seeks. Rejected.
- **Copy the whole library up front.** Removes the per-episode step, at the cost of
  several gigabytes on a disk with under thirty free, for episodes that will not be
  studied for months.
- **Put the audio in git.** A repository that grows by twenty megabytes per episode
  and by tens of gigabytes if the video were added. Rejected outright.

## Consequences

The library listing can be empty, and that is a normal state rather than an error, so
the page renders a path and a hint instead of failing. The video files stay on the
NAS and are watched in an external player, which is why the first version embeds no
video.
