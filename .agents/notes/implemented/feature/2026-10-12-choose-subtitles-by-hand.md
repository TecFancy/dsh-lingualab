# Agent Note: choose an episode's subtitles by hand

Status: implemented

## Problem

Which subtitle files an episode plays with is decided by the host, from the file names and, when the
names say nothing, from the first few kilobytes of the files (`src/host/pairing.ts`). The page never
asks. Two things follow from that.

- **A wrong pick has no way out on the page.** When the rule guesses wrong, the only fix is renaming
  files on disk. On 2026-10-12 the S01E01 folder showed the cost: `MDJT S01E01-EN.srt` next to an
  unmarked bilingual `MDJT S01E01.srt` opened with the English track only, while the picker said
  "EN + ZH". That case is a bug in one branch of the rule and is fixed on its own, but the next
  naming the rule does not foresee will fail the same way.
- **Every new naming habit becomes a rule.** Subtitle sites name files `.chs`, `.eng`, `.chs&eng`,
  `.简体`, `-EN`, and the rule can only follow by adding marks or heuristics. The rule already refuses
  near-miss marks on purpose, because a long list makes pairing unpredictable, so the content check
  carries the rest, and it cannot tell two English files apart.

The question raised on 2026-10-12 was whether the reader should pick the subtitles by hand instead.
The evaluation below was accepted the same day, and all three parts were built that day too.

## Decision

**A hand-picked choice overrides the automatic pairing; it does not replace it.** The rule still
answers for every episode nobody has looked at: the home cards and their "EN + ZH" badges, the picker,
and the import grouping (which subtitle belongs to which audio file in a dropped batch) all need an
answer before anything is opened. The rule is frozen at what it is now, the marks and the content
check: a naming it does not handle is solved by picking by hand, not by another mark.

- **Two slots, three states each.** The English slot and the Chinese slot each hold *automatic* (the
  default, which is today's behaviour), *a file*, or *none*. Picking one bilingual file for both slots
  is the bilingual case; the page already reads it once and splits it line by line.
- **The candidates are the folder's subtitle files.** For a folder episode, every subtitle file at the
  top of the folder is offered, not only those the stem rule gives to the segment, so a file with a
  stray name can still be picked. A file episode offers the subtitle files of its own directory; a
  picked name is stored in the episode's record, and the media route already serves the names in the
  record, so the guard only widens to files the reader chose.
- **The choice is per segment.** Scenes in one folder are cut separately and each has its own files.
  A folder without segments has one choice for the folder.
- **It is stored on the host, beside what it chooses.** A folder episode keeps its choices in a hidden
  `.lingualab-subtitles.json` in the episode folder, keyed by segment, written through a temporary
  file and a rename. It travels with the folder, as `notes.md` does. A file episode keeps its choice in
  its record in the plugin state. The scan reads the folder file, so the home badges show what will
  actually play.
- **A missing file falls back, and says so.** If a picked file is no longer there, that slot plays as
  *automatic* and the page says 「选的字幕文件不在了，先按文件名配对」. The choice is kept, so a file
  that comes back (a sync that had not finished) is used again.
- **The page asks for the choice in one place.** A 「字幕」 button next to 「中文显示」 in the control
  bar opens a small popover with the two slots. Each file in the lists carries what the content check
  says about it (with or without Chinese), and *automatic* shows the file it currently resolves to.
  Saving answers with the episode as the host now describes it, and the page reads the subtitles again;
  the subtitle key already includes the file names, so the change is picked up without a special case.
- **Nothing downstream changes.** The merge, the four 「中文显示」 modes, timing edits (written into the
  files that were picked) and notes (keyed by time) all work on `subtitleEn` and `subtitleZh` and do not
  care how those were decided.

Two smaller changes go with this and were tracked here so they were not lost:

- **Fix the S01E01 branch first.** One English-marked file and one unmarked file should pair as English
  and Chinese, as the picker's hint already says. This is a bug fix with a test of its own and does not
  wait for the rest.
- **Keep 「中文显示」 in the settings.** The mode is page state today and starts at 「变淡」 on every
  load, so "English only" has to be chosen again each time. It moves into the settings feature with the
  theme and the stage size.

## Alternatives considered

- **Pick by hand only, and drop the automatic pairing.** It would delete the most code, but every new
  episode would open with no subtitles until someone chose them, the home badges could not say
  anything, and the import grouping needs the stem rule anyway. The rule is cheap where it works, which
  is most folders.
- **Keep the choice in the browser.** One `localStorage` entry per episode is the smallest change, but a
  second browser or a cleared cache would play different subtitles, and the host's badges could not see
  it. The choice is about files in the library, so it lives with them.
- **Keep the choice in the progress file.** The file is already on the host, but it sits at the library
  root and its merge rule (newest `updatedAt` per key wins, applied by the browser to its cache too) is
  built for positions that change every few seconds. A choice is rare and belongs to one folder; a file
  in that folder moves with it.
- **Keep it in the video cache folder `.lingualab/`.** That folder is a cache: deleting it to free space
  must be safe, and a choice the reader made is not a cache.
- **Offer to rename the files to names the rule understands.** It fixes the folder for good, but it
  renames the reader's media, which the plugin has never done (the import does not even overwrite), and
  the names other players expect may differ.
- **Keep extending the marks.** Each mark is small, but the list grows with every source of subtitles,
  and the rule stays a guess for files whose names say nothing. A choice ends the guessing for the
  folders where it fails.

## Settled details

The evaluation left two questions open; both were settled when the plan was accepted.

- **The control lives in the control bar.** It belongs to the episode on screen, and everything in the
  「设置」 drawer is a browser preference that applies to every episode.
- **No "apply to all segments" yet.** Each segment is chosen on its own. Scene folders are usually named
  consistently, so the rule rarely fails for one scene and not the rest; the action is added when a
  folder needs it.

One more was settled while building it.

- **Cues are handed out only for the files they were read from.** After a save the page opens the same
  episode again and puts the position back. The first build put it back onto the previous cue list,
  which was still on screen while the new files were read, and the new list then started the player
  from 0. The library now keys the cues it has read by the files they came from and hands out nothing
  until the key matches, so the position waits for the new subtitles.

Related: [one episode, many segments](../../implemented/feature/2026-10-11-one-episode-many-segments.md),
[edit a sentence's timing](../../implemented/feature/2026-10-11-edit-subtitle-timing.md),
[settings and themes](../../implemented/feature/2026-10-12-settings-and-themes.md).
