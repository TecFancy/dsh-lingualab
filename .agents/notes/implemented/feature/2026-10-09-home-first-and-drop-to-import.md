# Agent Note: a home page to choose from, and files that come in by dropping

Status: implemented

## Problem

Opened for the first time, the page was a player with nothing in it. The empty state spoke
in the plugin's own vocabulary: a "media folder", an absolute path in a text box, and a
list of thirteen candidate paths, every one of them marked as not existing. A reader who
had come to listen had to learn what a media folder was, create it by hand, and copy files
into it before the page could do anything at all. Once there was material the picture did
not improve: choosing an episode meant clicking a small title in the top bar, opening a
layer, deciding between two tabs, and then browsing directories.

Practice had its own friction. The transport row held thirteen controls, so the two that
matter every minute (play, loop this sentence) sat among the ones used once per session (A
and B marks, repeat count). Keeping a sentence opened a composer, and the eighth sentence of
an episode opened a chooser that asked which of seven to throw away, in the middle of a
sentence that was still playing.

## Decision

**The page opens on a home, and practice is a second view.** The home shows the episode to
continue as the largest thing on the page, the rest of the library as rows that open on a
click, and where to add more. Opening an episode switches to the practice view, whose back
button returns to the home. The old layer for choosing an episode is gone; what remains of
the picker is "browse existing files", for material that lives outside the media folder.

**Files come in by dropping.** `POST /lingualab/import` receives one file as the raw
request body, with the episode folder and file name in the query. The page groups a drop by
the same pairing rule the host uses (a subtitle belongs to the audio file whose name it
starts with, longest match wins, a lone subtitle beside a lone audio file is a pair
whatever they are called) and sends the audio first, then its subtitles, one request each.
An empty library therefore shows a drop target and a button, and no mention of a folder.

**This is the one place the plugin writes into the media folder, and it is narrow.** It
never overwrites: a name that exists is reported as `exists` and left untouched. It accepts
only the extensions the scan already reads. Names are cleaned on the host, and the final
folder is checked to lie inside the root after it exists, so a symlinked folder cannot lead
the write elsewhere. The body goes to a hidden temporary file in the same folder and is
linked into place only when complete, so an interrupted upload leaves nothing that looks like
audio. A custom request header is required, which a cross-site form cannot set. A single
file is capped at 2 GB, checked by the page and again by the host.

**Practice keeps six controls on the row.** Previous, play, next, speed, loop this sentence
and the Chinese display stay; the A and B marks and the repeat count move into a 「更多」
menu together with the full list of keys.

**Keeping a sentence is a switch, not a form.** A star on the transport row and on every
subtitle row keeps the sentence, and the same star, or `S`, takes it back. Notes live in a
drawer with three views, 「还在练」, 「已记住」 and all. A note is ticked off when it sticks and
then leaves the first view without being deleted.

**The seven-phrase ceiling is removed.** The notes file keeps its format. The host still
refuses a list over 500 phrases, only so a runaway client cannot write an unbounded file.

**The page remembers where you stopped**, per episode, in this browser's `localStorage`,
written every five seconds while an episode plays and on the way out. The home uses it for
the continue card.

## Alternatives considered

- **Keep the folder-first empty state and make the instructions clearer.** It would still
  have asked a new reader to create a directory and copy files before anything worked. The
  instructions were never the problem; needing them was.
- **Ship a generated sample episode.** It makes the first minute work and teaches nothing
  about the real flow, and it needs a speech engine or bundled audio. Dropping a real file is
  the same number of steps and exercises the path the reader will use from then on.
- **Keep the ceiling and make the replace chooser less intrusive.** The rule asked for a
  decision at the worst moment however it was dressed. A filter on the notes list gives the
  short working set the ceiling was meant to produce without asking anything mid-sentence.
- **Let an import replace an existing file when the sizes differ.** A heuristic that guesses
  wrongly deletes someone's audio. Reporting `exists` and leaving the file alone has no
  failure mode worth the saved click.
- **Upload with multipart form data.** It buffers a whole episode in memory on one side or
  the other. A raw body streams straight to disk with a fixed ceiling.
- **Store the bookmark on the host.** It would follow the reader across browsers, at the
  cost of a write route and a place in the profile for something that is cheap to lose.

## Consequences

- The rule "the material folder is read-only" no longer holds without exception. What holds
  instead is narrower and checked: the plugin writes new files it was handed, never replaces
  one, and never writes outside the library root. Everything in the scan, browse and open
  paths is still read-only.
- An episode's folder is named after its audio file, so two drops of unrelated files with the
  same name share a folder and the second reports `exists`. Renaming is left to the reader.
- Notes files of episodes that had seven or fewer phrases are unchanged. Nothing is migrated.
- The bookmark is per browser. A second browser starts every episode from the top, and the
  home shows no progress there.
- A list of five hundred kept sentences is possible. The drawer's views make it navigable,
  and it is the reader's list to prune.
