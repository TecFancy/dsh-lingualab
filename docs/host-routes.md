# Host routes

English | [简体中文](host-routes.zh.md)

This document lists the HTTP routes exposed by the LinguaLab host and what each one answers. Read it when changing a route or checking the contract between the host and the page.

Every route, reads included, is answered only for a request the host admits (a loopback `Host`, a matching `Origin`, the signed session cookie): 401 or 403 otherwise, and 403 when the deployment has no connection service.

| Route | Kind | What it answers |
|---|---|---|
| `GET /lingualab/library` | exact | Every episode folder and loose audio file, the open episode, and how much has been noted |
| `GET`, `HEAD /lingualab/media/<episode>/<file>` | prefix | Audio, subtitle and `mp4` or `webm` video bytes of a folder episode, and the prepared, smooth and sound-only files under `<episode>/.lingualab/<file>` (`mp4` and `m4a` only), `206` for a range request |
| `GET`, `HEAD /lingualab/file-media/<id>/<file>` | prefix | The same for a file episode, from the paths recorded when it was picked |
| `GET`, `POST /lingualab/notes` | exact | One episode's phrases, read or replaced wholesale |
| `GET /lingualab/review` | exact | Every kept sentence not graded 「记住了」 across the library, episode by episode in library order and in play order inside each; read only |
| `GET`, `POST /lingualab/config` | exact | Where the library is, and how to change it — by path, or by place and relative folder |
| `GET /lingualab/update` | exact | Which build is running (its version and short commit, read when the host loaded), and the newest `vX.Y.Z` release tag the checkout's own remote declares; read only — nothing is fetched, pulled or installed, and `?refresh=1` skips the cached answer |
| `GET /lingualab/places` | exact | The roots the picker may browse: every workspace, plus the library itself |
| `GET /lingualab/browse` | exact | One directory under one place: directories, audio, subtitles, and each audio file's subtitle pairing |
| `POST /lingualab/open` | exact | Make one episode current: a scanned folder (with an optional `segment` to open one of its segments, the first when omitted), or a single audio file with the subtitles beside it |
| `POST /lingualab/import` | exact | Receive one dropped audio, video or subtitle file into an episode folder, never overwriting; needs the `x-lingualab-import: 1` header and an admitted session |
| `POST /lingualab/subtitle-timing` | exact | Move one sentence's start and end in its subtitle file inside the library, with the shared edge of a neighbour it pushed: only those timecode lines change, `409` when the file is not the one the page read, a `.bak` of the original before the first write |
| `GET /lingualab/video` | exact | What the host knows about one segment's video (`episode`, `segment` in the query): `playable` (with the URL), `prepare`, `preparing` (with progress), `sound-only`, `sound-ready`, `unplayable`, `no-ffmpeg` (with the install command), `failed` or `none`; the length difference from the audio when it is over a second |
| `POST /lingualab/video-prepare` | exact | Start the one preparing job for a segment, `{ episode, segment?, mode: 'video' \| 'sound' \| 'smooth' \| 'original' }`, never a path (`smooth` re-encodes the picture for streaming, `original` deletes that file and prepares the video as it was); answers with the status after the start, or the reason (`busy`, no ffmpeg) |
| `POST /lingualab/video-cancel` | exact | Stop the running preparing job and remove its `.part`; answers whether there was one |
| `GET`, `POST /lingualab/progress` | exact | Listening positions and step ticks kept in `.lingualab-progress.json` at the library root; a `POST` merges the browser's entries (newest per episode wins) and answers with the merged table |
