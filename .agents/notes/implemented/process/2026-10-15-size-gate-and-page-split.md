# Agent Note: split the page, then lock file and function size with a Betterer baseline

Status: implemented

## Problem

`LingualabPage.tsx` had grown to 1662 lines: one component function of about 1180 code
lines, cyclomatic complexity 130, with 29 `useCallback`, 16 `useState` and 12 `useEffect`.
Every feature since September touched it, and that is not carelessness: the page is where
features that may not import each other meet, so each new capability adds its wiring there.
The result is a file nobody can hold in their head. The key handler was 28 cases laid out
next to the state it changed, so adding a key meant reading all of it; the order of the
effects mattered and was written down nowhere but in the order of the lines; and none of it
could be tested short of mounting the whole page.

The repository as a whole has the same shape in smaller doses. Counting the same three
rules fsd-react counts, the source had about 70 places over the line (a function above 80
lines, above complexity 15, or a file above 250 lines), the page being the worst of them.
A rule that fails the build on all of them would be switched off the same day.

## Decision

**Split the page, behaviour unchanged.** The page keeps its state, the wiring between
features and the composition of two views. The rest moved out, one concern per file, and
every piece that is logic has tests:

- what a key means is a pure function (`keymap.ts`), what each action does is a table
  (`key-actions.ts`), and the handler, the headset's buttons and the key cap that lights
  are one hook (`useKeyboard.ts`); the headset asks the same keymap with the focus-only
  flags off instead of keeping a hand-copied version of the arrow keys;
- the review, the resume and the bookmark, opening, replaying a kept sentence, the notes of
  the sentence on stage, the timing strip, what plays and what is said about it are each a
  hook with their rules in a pure module beside it;
- the two views are components (`HomeView`, `PracticeView` with its top bar and two panes),
  none with state of its own.

The page went from 1662 to 599 lines. The markup of the home, of the practice view in both
columns, of every layer and drawer, of a segment with a video and of the finish card was
rendered to a string before and after, in twelve states, and is byte-identical.

**Lock the size with a Betterer baseline.** `npm run betterer:ci` runs ESLint's
`complexity` (15), `max-lines` (250) and `max-lines-per-function` (80) over `src/`, tests and
`testing/` helpers excluded, against `.betterer.results`, which records what is over the line
today. The thresholds are the ones fsd-react uses, so the same numbers mean the same thing in
both projects. It runs in the full tier of `npm run verify` (about
twenty seconds), not in the pre-commit hook.

One thing differs from fsd-react's configuration, and it is what makes the gate a ratchet.
`@betterer/eslint` identifies a problem by its place and the source text there, which has two
consequences that were measured: an oversized function made longer is "the same problem", so
it can grow without the gate noticing, and `max-lines` is recorded on "line 251 to the end of
the file", so in a file over 250 lines every edit that changes its length (one more string in
`locale.ts`, one more rule in the stylesheet) reads as "an old problem fixed, a new one
appeared" and fails. The gate wraps ESLint the same way `@betterer/eslint` does and records
the problems differently, in proportion to size and independent of position:

- a file over 250 lines gets one problem per started 10 lines over, `ceil((lines - 250) / 10)`;
- a function over 80 lines gets `ceil((lines - 80) / 10)`; a function over complexity 15 gets
  one per point over;
- every problem is recorded at the top of the file (line 0), identified by the rule, the
  function's name (an anonymous function by the text of its line), which function of that name
  it is and which bucket it is, never by a line number; the file's own hash is not recorded
  either, only a stand-in that changes with its path.

So the results file holds no positions and no hashes that an unrelated edit can move. What
that was measured to do, by editing and running `betterer:ci`:

- A function or file that grows past its current 10-line bucket gets one more problem and
  fails ("got worse"). Inside a bucket it passes: the 10 lines are the slack, and the results
  file does not change. Complexity has no slack, a point is a problem.
- A new function over 80 lines, a new function over complexity 15 and a new file over 250
  lines fail, including a new function added to a file that is already in the baseline.
- A function or file shrunk past a bucket reports "got better" and exits 7 until
  `npm run betterer` rewrites the results and the change is committed; from then on it cannot
  come back. `npm run betterer` never records a worse result (it exits 7 and leaves the file
  alone); only `--update` does, and nothing here uses it.
- An edit that crosses no bucket does not fail and does not touch `.betterer.results`: one
  more string in `locale.ts`, one more rule in the stylesheet, lines added above a complex
  function in `store.ts` all pass with exit 0. Most features touch those files, so a gate that
  asked for a baseline update on every pull request would not survive.
- Renaming a baselined function, or editing the first line of an anonymous one, changes its
  identity and reads as one problem fixed and one new, so it fails; split it in the same change.

The rule for new work goes with it: new logic goes into a tested hook or pure function in the
slice's `lib/`, and a component that would cross 80 lines is split, not added to the
baseline. The page is in the baseline because a page that composes this many features is
long; that records what is, it does not grant room.

## Alternatives considered

- **Hard ESLint errors for the three rules.** The cleanest signal, and what a new project
  would do. Here it would fail on about 70 existing places at once, the page included even
  after the split, and the choices would be to fix them all first (a rewrite of every widget,
  none of them behind a bug) or to disable the rule. A ratchet keeps the rule on while the
  old debt is paid down one split at a time.
- **ESLint warnings.** A warning that is always present is read as noise within a week.
- **`@betterer/eslint`'s `eslint()` as it is.** It is what fsd-react runs and it needs no
  code of ours. It was tried first and set aside twice over: it lets an oversized function or
  file grow, which is the thing a ratchet is for (the page could drift back to a thousand
  lines), and its `max-lines` record makes adding a locale string fail the gate.
- **One issue per started 10 lines is a compromise.** One per line would stop growth exactly
  but would make the results file as long as the oversized code is over its limits (thousands
  of entries here, mostly from `styles.ts` and `locale.ts`);
  one per whole function would be the plain gate. Ten lines keep it near 870 entries and give
  the slack that an honest fix of a long function needs.
- **Different thresholds for this repository.** The three numbers are fsd-react's on purpose:
  one set of limits across the projects that share an owner, so a split learned in one carries
  to the other.
- **A size check in the pre-commit hook.** About twenty seconds on top of a hook that already
  takes more than a minute; the full run in CI catches it before it merges, as it does for
  `lib/`.

## Consequences

The next feature that wants to touch the page has places to put its logic and tests for the
neighbours it must not break, and the key handler can be read in a screen. The gate costs one
extra step in the full run and one habit: after splitting a large function, run
`npm run betterer` and commit `.betterer.results`; after a merge conflict in it, run
`npx betterer merge`.

One limit is accepted. The 10-line bucket is slack, so a function can still gain up to nine
lines before the gate notices, and the gate holds the line at the bucket, not at the line. And
the split moved the page's effects into hooks, which changed the relative order of four of
them: the three that give the panel focus and unlock the take audio now run after the position
bookkeeping's instead of between its effects, and the key cap's cleanup runs after the video
notices' timers. None of them reads what another writes, and the order that does matter (the
player is reset before a resume is applied) is kept and written down in `useResume.ts`.
