# Agent Note: the first version ships without a waveform, video or shadowing scores

Status: implemented

## Problem

The repealed standalone app had a waveform, ten speed steps, A-B regions, a PWA shell
and an offline cache. Its own backlog records the next features as video support and
pronunciation scoring. Rebuilding that list inside the panel would repeat the failure
that stopped the earlier app from being used at all: a complete tool that never became
a habit.

## Decision

The first version plays audio, loops a sentence, steps the speed, shows bilingual
subtitles and writes notes. There is no waveform, no embedded video and no shadowing
score. The study material is watched in an external player for the blind-watch step,
and speaking practice stays in the conversation with the agent.

## Alternatives considered

- **Port the waveform.** It is the most visible thing in the old app, and it costs a
  three-hundred-kilobyte dependency that has to be lazily loaded or bundled into every
  page load. Deferred until the sentence list proves insufficient for finding a
  passage.
- **Embed the video.** The files are on the NAS and are large; embedding means range
  requests over a home uplink and a second timeline to keep in step with the subtitles.
- **Score shadowing with the local recogniser.** The recogniser is already installed
  and costs nothing per call, but it turns a listening habit into a scoring loop before
  the habit exists.

## Consequences

Everything deferred has a home in the layer it will belong to: the waveform as a
widget beside the subtitle panel, video as another media source behind the same store,
scoring as a feature that reads the local recogniser. None of them need the store or
the wire contract to change shape first.
