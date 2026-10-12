# Agent Note: keep the files, and make notes saves safe

Status: implemented

## Problem

Everything the page keeps lives in plain files inside the media library: one `notes.md` per
episode for the kept sentences (their note, words and grade), `.lingualab-progress.json` at the
library root for where each episode or segment was left and the five-step ticks, and the subtitle
files themselves, which the timing strip writes back. The question raised on 2026-10-12 was whether
a single SQLite database should replace them, since a database is the usual answer once an app
holds records, queries them and writes them often.

The evaluation found that SQLite is not worth its cost here, but it also found two real weaknesses
in how `notes.md` is written. Both verdicts were accepted the same day: the files stay, and the two
fixes under Decision were built the same day. This note keeps the SQLite evaluation so the
question does not have to be reopened from scratch.

## Assessment

What SQLite would give:

- **Queries across the library.** The review queue for the whole library is built today by reading
  every episode's `notes.md` and parsing it (`src/host/review.ts`). A table of kept sentences would
  answer "everything still being practised" with one query, and would make per-sentence history
  (every grade with its date, the basis of spaced repetition) cheap to add.
- **Atomic, concurrent writes.** `notes.md` is rewritten in place with `writeFileSync`
  (`src/host/notes.ts`), so a crash in the middle of a write can leave it truncated, and two tabs
  saving the same episode overwrite each other. SQLite's transactions and WAL mode handle both.
- **A schema that can grow.** New fields (a review date, a source segment, a tag) are columns, not a
  change to a pipe-separated line format that has to stay readable by older code.

What it would cost:

- **The agent loses its input.** `notes.md` is not only storage. It is the file the agent reads in the
  conversation for the two steps of the method that happen there (the next-day and weekly reviews),
  and the file a person opens to skim or edit what they kept. A database would need an export, or a
  tool for the agent, to give either reader back what they have now, and that export would be a second
  copy of the same data to keep in sync.
- **The files stop being portable.** Today an episode folder is self-contained: copy it to another
  machine and the notes travel with the audio. A library-wide database separates them, and a database
  per episode folder gives up most of the query benefit.
- **A runtime dependency in the host half.** `lib/index.js` is a single committed bundle with no native
  modules. `better-sqlite3` is native and would have to be built for whatever Node the harness runs on;
  the built-in `node:sqlite` avoids that but ties the plugin to a recent Node version, and its API was
  still marked experimental for a long stretch.
- **The data is small.** One episode keeps tens of sentences; a season is a few hundred. Parsing every
  `notes.md` takes milliseconds. None of the current features is slow because of the files.

## Decision

**The markdown and JSON files stay the source of truth; SQLite is declined.** The two weaknesses the
assessment found are real, and both are to be fixed in the files:

- **A notes write is atomic.** `notes.md` is written the way the progress file already is
  (`src/host/progress.ts`): to a temporary file next to it, then renamed over the old one, so a crash
  leaves either the old file or the new one, never half of one.
- **A stale notes save is refused.** The page keeps a hash of the `notes.md` bytes it read and sends it
  with every save, as the timing strip already does for subtitle files (`src/host/timing.ts`). When the
  file changed in between (another tab, a hand edit, the agent), the host refuses with a stale answer
  instead of overwriting it, and the page reloads the notes and says why. A successful save answers with
  the new hash, so saves in a row from one tab keep working.

Each fix comes with tests in `src/host/notes.test.ts` and `src/host/routes.test.ts`: a write that fails
halfway leaves the old file intact, and a save with an old hash leaves the newer file untouched.

## Alternatives considered

- **SQLite as the only store.** The full benefit of queries and transactions, at the cost of the agent's
  input, hand editing and per-folder portability, plus a native or version-bound dependency. Declined
  while the agent reads `notes.md` directly.
- **SQLite with `notes.md` exported on every write.** Keeps both readers, but makes two copies of the
  data, and a person editing `notes.md` by hand would then be editing the copy that loses.
- **SQLite as an index derived from the files.** Rebuilt from the `notes.md` files on start or on change,
  never written to directly, safe to delete. It keeps the agent's input and the folders' portability, so
  it is the shape to reach for if library-wide queries ever do get slow. Not needed today.
- **One JSON file per episode instead of markdown.** Easier to parse and extend than the pipe format, but
  harder for a person and the agent to read, which is the reason the format is markdown in the first
  place.
- **Keep the files and change nothing.** Leaves the truncation and two-tab overwrite risks in place.

## When to revisit

- Spaced repetition with a history of every review is added, and the history no longer fits in a line.
- The library grows to the point where reading every `notes.md` for the library-wide review is
  noticeably slow (measure before assuming it is).
- The agent gets a tool to query the page's data, so it no longer needs to read `notes.md`.
- More than one device writes the same episode often enough that merging by file becomes a problem.

Related: [episode media stays in the workspace](../../implemented/architecture/2026-10-08-media-stays-in-the-workspace.md),
[reviewing kept sentences](../../implemented/feature/2026-10-11-review-kept-sentences.md),
[edit a sentence's timing](../../implemented/feature/2026-10-11-edit-subtitle-timing.md).
