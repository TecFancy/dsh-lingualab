# Agent Note: edit a sentence's timing

Status: implemented

## Problem

Subtitles found in the wild are often cut a little off: a sentence starts a beat before the
voice, or runs into the first word of the next one. On a page built around looping one
sentence that is not cosmetic. The loop clips half a word or replays a fragment of the next
line every pass, shadowing stops in the wrong place, and the reader can do nothing about it
short of opening the file in another tool, guessing the milliseconds and reloading.

The trouble is per sentence, not per file: the reader sees one sentence that is wrong, while
its neighbours are fine. A whole-file offset would not fix it.

## Decision

**The sentence on stage can have its start and end adjusted, and the change is written back to
the subtitle file.** Other players and the agent then read the corrected file too, and the page
has no second source of timing to reconcile with the file.

**The editor is a strip under the stage, opened from the time range.** The stage already shows
the sentence's range (`00:18 – 00:22`); clicking it, `T`, or 「调整这一句的时间」 in 「更多」 opens
a strip with the start and the end to the millisecond (`00:18.250`), each with nudge buttons.
While the strip is open the sentence loops, so every change is heard on the next pass, and the
strip owns the keyboard:

| Key | Does |
|---|---|
| `Tab` | Switch between start and end |
| `←` `→` | Nudge the focused edge by 50 ms |
| `Shift` + `←` `→` | Nudge it by 250 ms |
| `I` / `O` | Set the start / the end to the playhead, as an editor's in and out |
| `Space` | Play or pause |
| `Enter` | Save |
| `Esc` | Close without saving |

Without a waveform (see
[2026-10-08-v1-without-waveform](../../implemented/simplification/2026-10-08-v1-without-waveform.md)),
the ear is the instrument: the loop and `I` / `O` while listening are what make placing an
edge practical. An edge cannot cross its neighbours: the start stays at or after the previous
sentence's end, the end at or before the next one's start, and the end stays at least 0.2 s
after the start. A file whose cues already overlap keeps the overlap it has.

**A save edits the timecode line and nothing else.** The host finds the cue's timecode line in
the file's bytes and replaces only the times. Numbering, text, style tags, blank lines, line
endings and the encoding are untouched. That is also how GBK and GB18030 files survive: the
timecode is ASCII, which those encodings share with UTF-8 byte for byte, so the bytes around it
never have to be decoded and encoded again (Node has no GBK encoder). UTF-16 files, with a BOM,
are rewritten through Node's own UTF-16 support. A new time is written in the line's own
format: `,` or `.` before the milliseconds, and the width of the hours it already had.

**A cue is addressed by what the file says, and a stale page is refused.** The request names
the file, the cue's original start and end in milliseconds, and which of the cues with that
exact range it is (almost always the first). It also carries a hash of the bytes the page
parsed. When the file has changed since, the host answers `409` with a reason and the page
reloads the subtitles rather than writing over an edit it never saw. The write goes to a temp
file and is renamed into place, as the progress file is, because replacing the file is the
point. Before the first write to a file, the host copies the original to `<name>.bak` beside
it, once, and never overwrites that copy.

**A sentence with its Chinese in another file moves both.** The page folds the Chinese track
into the English one by start time, within 0.6 s. Moving only the English start could break that
match and lose the Chinese line, so when the Chinese came from a separate file, the cue it was
matched with gets the same change in that file, in the same request. A bilingual file that holds
both languages is one file and one edit.

**LRC has starts only.** A line ends when the next begins, so only the start is editable, and
the end shows as the next line's start, read-only.

**Only files inside the library can be edited.** A file episode's subtitles live wherever the
reader keeps them, outside the folder this plugin writes in. The strip opens for them too, but
says why it cannot save. Folders and loose files at the library root are both inside.

**A kept sentence follows its sentence.** Kept sentences are matched by whole second and text.
When a start moves across a second, the page rewrites that phrase's `at` in the notes after the
subtitle save succeeds, so the star stays on.

**The host grows one write route.**

```ts
// POST /lingualab/subtitle-timing
export interface TimingEdit {
  /** The subtitle file's name inside the episode folder. */
  readonly file: string
  /** The cue as the file has it now, in milliseconds. */
  readonly from: { readonly start: number; readonly end: number; readonly occurrence: number }
  /** The new range, in milliseconds. For LRC only `start` is used. */
  readonly to: { readonly start: number; readonly end: number }
  /** SHA-256 of the bytes the page parsed, hex. */
  readonly expect: string
}

export interface TimingWriteRequest {
  readonly episode: string
  /** One edit, or two when the Chinese lives in its own file. */
  readonly edits: readonly TimingEdit[]
}
```

Both edits are checked before either file is written, so one sentence never ends up moved in one
file and not the other.

**Out of scope:** a whole-file offset and a two-point linear correction (the reader's trouble is
per sentence); a waveform; splitting or merging sentences; editing the text; and undo beyond the
`.bak` copy and saving the old times again.

## Alternatives considered

- **Keep corrections beside the file, in a hidden JSON at the library root, applied at load.**
  Format-agnostic and reversible, and the material directory would keep only its three writes.
  But the correction would be invisible to every other player and to the agent, and the page
  would have two sources of timing that drift apart when the file is replaced.
- **Parse, edit and serialize the whole file.** Simpler code, but the parser drops what it does
  not need (numbering, style tags, unparseable blocks) and sorts cues, so a save would rewrite
  the reader's file well beyond the one sentence, and a GBK file would come back as UTF-8.
- **Address cues by their index in the parsed list.** The parser sorts and drops blocks, so an
  index in the page is not an index in the file.
- **A whole-file offset first.** The most common fix in subtitle tools, but not the trouble
  described here, and it is easy to add later on top of the same route.

## Consequences

- The material directory gains a fourth write: subtitle files inside the library, and their
  `.bak` copies. `AGENTS.md` and the skill's convention 4 list it.
- `T` joins the key list in 「更多」, which also gains an entry that opens the strip; the strip's
  own keys (`I`, `O`, `Tab` and the arrows) are spelled out on the strip, where they apply.
- The cue type has to carry where each cue came from (file, original range, occurrence, and the
  matched Chinese cue's), which the parser and the merge record without changing what they
  return to everything else.
- A new route means `dsh-plugin.naming.json` and the README route table change (`check-host.mjs`
  compares the record with `protocol.ts` and needs nothing new),
  and the host half needs a restart.
- This lands before the review of kept sentences
  ([2026-10-11-review-kept-sentences](../../proposed/feature/2026-10-11-review-kept-sentences.md)), since a review that
  loops each sentence depends on its edges being right.
- The page computes the hash with a SHA-256 of its own rather than `crypto.subtle`, which only
  exists in a secure context; dsh web opened over plain HTTP from another machine would otherwise
  have an editor that can never save.
- Each edge is clamped by its neighbours as the file has them, and the transport moving to another
  sentence (or looping one) ends the edit, so the strip never edits edges nothing is playing.
