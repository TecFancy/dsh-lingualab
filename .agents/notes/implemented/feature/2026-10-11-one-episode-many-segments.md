# Agent Note: one episode, many segments

Status: implemented

## Problem

The study material arrives as one folder per TV episode, cut into scenes. `S01E01` holds ten
of them, and every scene is three files that share a name:

```text
01_Dunphy家的早晨.mp3
01_Dunphy家的早晨.srt         English only
01_Dunphy家的早晨_双语.srt    Chinese line above English, with {\fs16\an2\b0} style tags
02_足球场.mp3
02_足球场.srt
02_足球场_双语.srt
...
10_尾声.mp3
```

The scan treats a folder as one audio file. `pickAudioFile` takes the first audio name in
directory order, and pairing without a stem offers every subtitle in the folder, so the first
file with CJK and the first without win whichever scene that is. In use this means:

- Only the first scene is reachable as the episode. The other nine open only through
  「浏览已有的文件」, one by one, as file episodes titled by their raw names, with their notes in the
  plugin profile instead of the folder's `notes.md`.
- The finish card says 「这一集听完了」 after one scene of ten, and offers no way on.
- `双语` is not a language mark, so each scene has two unmarked subtitles, the pairing is
  ambiguous by name, and the picker marks all ten rows 「字幕待确认」 with nothing to confirm.

## Decision

**A folder with two or more audio files is one episode made of segments.** A segment is one
audio stem. Segments are ordered by the same natural order the scan already uses
(`compareIds`), so `02` comes before `10`. A folder with one audio file, and every file
episode, has no segments and behaves exactly as today.

**Each segment pairs its own subtitles by stem, and the longest stem wins.** A subtitle
belongs to the segment whose stem is the longest one that `sameStem` accepts for it, so
`04_Dunphy家-Luke射击.srt` cannot be claimed by a sibling named `04_Dunphy家`. The import
already used this rule for a drop. It now lives in one function, `owningStem`, which the import
grouping, the scan, the picker and the open all call, so they cannot disagree about whose a
subtitle is.

**`双语` and `bilingual` are a third kind of mark: both languages in one file.** With such a
file present, it is the Chinese source (the page already keeps only its CJK lines), the
English track is an English-marked file if there is one, else the single unmarked file, else
the bilingual file itself. This is decided by name, so the picker can say 「中英字幕」 without
reading anything, and 「字幕待确认」 no longer appears for this layout.

**The protocol grows by one list and one optional field.**

```ts
export interface EpisodeSegment {
  /** The audio stem, unique within the episode: `01_Dunphy家的早晨`. */
  readonly id: string
  /** 1-based position in natural order. */
  readonly index: number
  /** Display title: the stem without a leading number and separator, `Dunphy家的早晨`. */
  readonly title: string
  readonly audio: string
  readonly audioBytes: number | null
  readonly subtitleEn: string | null
  readonly subtitleZh: string | null
}

// EpisodeEntry: segments in order; empty unless the folder holds two or more audio files.
// The entry's own audio and subtitle fields mirror the first segment.
readonly segments: readonly EpisodeSegment[]

// OpenRequest: with episodeId, which segment to open. Omitted means the first one.
readonly segment?: string

// OpenPayload: the segment that was opened, null for an episode without segments.
readonly segment: string | null
```

Media URLs do not change: `/lingualab/media/<episode>/<file>` already serves any file in the
folder.

Which segment to continue is not the host's call. The host knows no more than the progress
file, and the page already holds the user's positions, so the page resolves 「继续」 (the
newest segment, below) and names the segment explicitly; the host treats an omitted one as the
first. A segment id the episode does not have is refused with a reason and never replaced by the
first one, because the position and the notes would then land on the wrong audio.

**Practice shows the episode and the segment, and moves through segments.** The top bar reads
the episode title with `01 · Dunphy家的早晨` under it (the number is the one written in the
file name, else the position), and a segment button opens a list of all
segments with a mark on the finished ones. At the end of a segment that is not the last, the
finish card says the segment is done and its first action, focused, is 「下一段：足球场」. Only
the last segment says 「这一集听完了」. The home card reads 「S01E01 · 3 / 10 段」, and
「继续练习」 opens the segment listened to most recently, or, once that one was heard to the end,
the next segment not yet finished (the card then names it as 「下一段」 instead of a stopping time).

**Notes stay in one `notes.md` per episode, grouped under a heading per segment.** The phrase
line keeps its format; a `## <segment id>` heading above a run of lines says which segment they
belong to:

```markdown
# S01E01 笔记

## 01_Dunphy家的早晨

- [ ] 00:01 | Kids, breakfast! | 孩子们 吃早饭了 | | #review

## 02_足球场

- [ ] 00:09 | He tripped him, Jay. | 他绊倒他了 杰 | |
```

The preamble ends at the first segment heading or the first phrase line, whichever comes
first. A heading counts only when a phrase line follows it directly, so an `## 备注` written
into the preamble as commentary stays there. The host gives the writer the folder's segment
order, so the file reads in play order whatever order the phrases arrive in, and the limit of
500 phrases still counts the whole file. `NotePhrase` gains an optional `segment`, and two kept sentences are the same only when
their segments match too. The drawer groups cards by segment, and replaying a card from another
segment opens that segment first, then seeks.

**Positions are kept per segment; the five steps stay per episode.** A segment's position is
stored under the key `<episode id>::<segment id>`. The newest of an episode's segment entries
is where 「继续」 goes, and a segment counts as finished when its stored position is within one
second of its duration. The steps describe watching a whole episode (22 minutes is an episode,
not a scene), so they keep the episode id as their key. `MAX_PROGRESS_ENTRIES` rises from 100
to 1000, since one episode can now hold ten entries, and the longest key accepted rises from 300
to 520 characters, since a segment key holds two file names.

**Out of scope:** playing segments back to back as one track, per-segment steps, renaming or
reordering segments in the page, and any change to import or to file episodes.

## Alternatives considered

- **List every audio file in a folder as its own episode, grouped by folder on the home.** About
  half the work, and the scan stays flat. It loses the two things the material is cut for: kept
  sentences would scatter over ten places instead of one review list, and the end of a scene
  would have no next scene to offer.
- **Concatenate the segments into one virtual track.** One timeline would make the existing
  episode model fit unchanged, but the scenes are separate files with separate subtitle clocks,
  so every seek, note timestamp and cue index would need an offset table, and a missing middle
  file would shift everything after it.
- **Store the segment as a column in each phrase line.** Simple to parse, but it changes a line
  format that users edit by hand and that older files do not have. A heading is what a person
  would write anyway, and a file without headings still reads.
- **Ask the user to confirm which subtitle is which.** The layout is regular enough to decide by
  name, and a confirmation step for ten identical cases is a chore, not a choice.

## Consequences

- A folder that used to open its first audio file now opens as segments. Existing notes in it
  have no headings; they were recorded against the first segment and are read as belonging to
  it, and the next save writes them under its heading.
- An existing position stored under the bare episode id is read as the first segment's position
  until that segment writes its own entry.
- The host's subtitle classification gains the `both` mark, which also changes how the picker
  labels any other `_双语` file outside multi-segment folders, for the better.
- `keptSentenceKey` and `sameKeptSentence` take the segment into account, so two scenes that
  both start with 「Kids?」 at 00:02 no longer share a star.
- The five-step durations stay as they are; making them follow the media length is a separate
  change.
