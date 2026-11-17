# Anonymous usage statistics

English | [简体中文](telemetry.zh.md)

This document explains what the usage ping sends, when it runs, and how to turn it off or resume it. Read it before changing telemetry behavior or deciding whether to leave the ping enabled.

## A ping waits for an admitted request and runs at most once a day

The host half sends at most one ping a day per running process, and only after the host has admitted a request. That is the first moment the plugin is known to be in use. Nothing is sent at start, and nothing is sent when the ping is off.

The ping answers one question: how many machines actually run the panel, and which version they run. It needs no account, no server of ours and no third-party SDK.

## The data is pseudonymous, not legally anonymous

The accurate description is **pseudonymous data with no IP, linked by a random install id**, not legally anonymous data. The same id is linkable over time, so it is only used to estimate install counts and version spread, never for billing, security decisions or precise public numbers.

## The request contains only these fields

The whole body is below, and nothing else rides along:

| Key | Value |
|---|---|
| `v` | the payload version, `1` |
| `pkg` | `dsh-lingualab` |
| `version` | the version in this package's `package.json`, read when the host loads |
| `id` | a random UUID v4, made once and kept in the plugin's `installId` config field |
| `node` | the Node major version only, `v22` |
| `os` | `linux`, `darwin` or `win32`; `other` for anything else |
| `arch` | `x64` or `arm64`; `other` for anything else |
| `metrics.episodes` | how many episode folders the library root holds, in one of four buckets: `0`, `1-5`, `6-20`, `21+` |
| `metrics.ffmpeg` | whether the host could find `ffmpeg` |

What is **never** sent: a file name, a folder path, an episode title, a note, a subtitle, a user name, an email, a token, a session id, a host name or an IP address.

The body is a `POST` to `https://t.hi-ruofei.com/v1/ping` on `t.hi-ruofei.com`, with a five second limit, no retry, no log and no wait. A ping that fails is silent, and the request it rode on has already been answered.

## Telemetry is on by default

The ping is **on by default**. To stop it, set the `telemetry` field to `false` in this plugin's profile entry, either on the Plugins page or in `cordis.patch.yml`. No id is generated, the library is not listed and no request is made.

`installId` is the field the plugin writes itself to keep the same random id across restarts. It is hidden because it is not a value to choose.

## Invalid install ids stop reporting and are never overwritten

If `installId` ever holds something that is not a UUID v4, such as a hand edit or a half-written value, the plugin sends nothing and replaces nothing. There are three reasons:

1. A string that does not meet the contract does not belong in the counts.
2. A truncated value has less entropy and so a higher chance of colliding with another installation.
3. Replacing it could split one installation into two, because nothing can tell whether it once stood for an id that was already reported.

An uppercase UUID is the same id, so the plugin accepts it and reports it in lowercase.

To resume reporting, edit the field in the profile's `cordis.patch.yml` to a UUID v4, or clear it so the plugin generates a new id. Clearing starts a new installation identity. Let the new configuration take effect; restart when you edited the file by hand. The next admitted request then reports, without waiting out the day.
