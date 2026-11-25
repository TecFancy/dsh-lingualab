# Agent Note: the README hands its reference sections to `docs/`, and the screenshots show video

Status: implemented

## Problem

The README had already been cut from 313 lines to 78 by moving the usage, telemetry,
release, route and layout references into `docs/` (2026-11-17). Two sections had stayed
behind, and both are reference material rather than an introduction: "Status" (what the
host and the client each provide, how the page is registered, the branch a change ships
from) and "Design" (the Figma file, how the page takes the host's tokens, the
narrow-screen drawer and its iPad screenshot). Almost a quarter of the file still
described how the plugin is wired rather than what it does. The usage-ping summary was
also the one place where the README repeated a `docs/` table in full: five lines of
payload rules that only a reader who is deciding whether to enable the ping needs.

The screenshots had the same problem from the other side. The panel's video side — a
picture above the sentence, one-time preparation, the lower-bandwidth smooth version,
watching the picture alone for the blind-watch step — was in none of the four images, so
the README and the market card both read as an audio-only practice tool. The market card
especially: it reads `screenshots.json`, not the README.

## Decision

- Move "Status" to `docs/status.md` and "Design" to `docs/design.md`, both as bilingual
  pairs, and add a row for each to the README's document table. The iPad screenshot, the
  Figma link and the token rules move with `docs/design.md`; the registration paragraph
  moves with `docs/status.md`.
- Keep four things in the README that are not reference material: the introduction and
  the practice screenshot, Install with a one-line telemetry notice and its link,
  "What it does" with a new video screenshot, and the document table with the
  kept-sentences screenshot.
- Take two new screenshots from a generated demo video episode:
  `video-practice-light.webp` (the picture above the sentence, the subtitle column on the
  right) and `video-large-light.webp` (the picture taking the whole stage). Put both in
  `screenshots.json` after the home shot, next to each other, so the two video images read
  as one feature before the notes and iPad views close the strip; the README embeds the
  first.
- Keep the demo material generated: an illustrated sunrise frame rendered into a slow
  zoom, narration synthesized with ffmpeg's `flite` filter, subtitles written for this
  repository. No borrowed footage, and no path from the machine that took the picture.

## Alternatives considered

**Keep "Design" in the README for its iPad picture.** Rejected: the picture is evidence
for the drawer layout, not an introduction, and a narrow-screen detail is what a reader
looks up after deciding to install. The image sits in the document that explains the
layout.

**Replace the practice screenshot with a video one.** Rejected: audio practice is still
the default path, and the first image should show the simplest thing the panel does.
Video gets its own picture after the bullet that describes it.

**Screenshot the video-preparation card instead of a playing picture.** Rejected: the
card explains what to install, while a picture with subtitles beside it is what video
learning looks like. The preparation states are described in `docs/usage.md`.

**Only add the new screenshots to `screenshots.json`.** Rejected: the README is the page
a visitor lands on, and a capability it does not show is one the visitor has to take on
trust.

## Why

The README has to answer "what is this and where do I start" in one screen; the references
belong to the reader who has already decided to use or change the plugin, which is what
the document table is for. Screenshots are the only place a visitor can see the video
side, and the market card shows them without the README, so both lists need the video
pictures.
