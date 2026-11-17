# Repository layout

English | [简体中文](repository-layout.zh.md)

This document maps the main source and configuration paths to their responsibilities. Read it before adding code or looking for the part of the plugin that owns a capability.

| Path | What lives there |
|---|---|
| `src/index.ts` | The host entry: the config, and mounting the routes |
| `src/host-context.ts` | The slice of the host plugin context we call |
| `src/host/shared/` | Config, request trust and media serving, path rules, the ffmpeg finder, the anonymous usage ping, test helpers |
| `src/host/entities/` | Episode (the library scan), open state, places, the notes file, subtitle choice, video cache |
| `src/host/features/` | One slice per capability, its route in `api/<name>.route.ts` beside its rules |
| `src/shared/` | The wire contract and the notes markdown format |
| `src/client/entities/cue/` | Subtitle parsing, decoding and bilingual line ordering |
| `src/client/` | The page, its widgets, and the slot-free features (library, import, notes, media player, resume, settings) |
| `lib/` | tsdown output, committed: what the shell fetches |
| `locale/` | The Plugins page display name and summary |
| `cordis.patch.yml` | Bundle patch (loader row `lingualab`) |
