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
today. The thresholds and the mechanism are the ones fsd-react uses, so the same numbers
mean the same thing in both projects. It runs in the full tier of `npm run verify` (about
twenty seconds), not in the pre-commit hook.

One thing differs from fsd-react's configuration. `@betterer/eslint` records `max-lines` on
"line 251 to the end of the file" and hashes that text, so in a file over 250 lines every
edit that changes its length (one more string in `locale.ts`, one more rule in the
stylesheet) reads as "an old problem fixed, a new one appeared" and fails the gate. The gate
wraps ESLint the same way `@betterer/eslint` does and records that one rule at the top of the
file with a fixed hash, so a file that is still over the line is the same problem however it
is edited.

What the gate was measured to do, by editing and running `betterer:ci`:

- A new function over 80 lines, a new function over complexity 15 and a new file over 250
  lines fail ("got worse"), including a new function added to a file that is already in the
  baseline.
- An already oversized function made one line longer is **not** caught: Betterer identifies a
  problem by its place and the source text there, not by the number in the message, so it is
  the same problem. It shows up as `(91)` becoming `(92)` in `.betterer.results`.
- Any edit to a file in the baseline makes `betterer:ci` fail with "results stayed the same
  but your code has changed", until `npm run betterer` rewrites the file and the change is
  committed. That is how Betterer works (the file's hash is in the results key), and it is
  also what puts the `(91)` to `(92)` in front of the reviewer.
- A function brought under the threshold reports "got better" and fails the same way, until
  `npm run betterer` tightens the baseline; from then on it cannot come back.
- `npm run betterer` never records a worse result (it exits 7 and leaves the file alone);
  only `--update` does, and nothing here uses it.

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
  code of ours. It was tried first and set aside because of the `max-lines` behaviour above:
  with it, adding a locale string needs a baseline update or a split of a dictionary that is
  data, not design.
- **A stricter ratchet that also catches growth.** Possible with a custom test that reports
  one issue per ten lines over the line, so that growing a function past the next bucket is a
  new issue and shrinking one fixes an issue. It was left out: the results file grows by a
  few hundred lines, data files like `locale.ts` and the stylesheet would need excluding, and
  the gain over a reviewer seeing `(91)` become `(92)` in the diff is small for a repository
  of this size. It can be added to `.betterer.ts` without touching anything else.
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

Two limits are accepted. The gate does not stop an oversized function from growing, only from
being joined by another one (the stricter ratchet above would). And the split moved the
page's effects into hooks, which changed the relative order of four of them: the three that
give the panel focus and unlock the take audio now run after the position bookkeeping's
instead of between its effects, and the key cap's cleanup runs after the video notices'
timers. None of them reads what another writes, and the order that does matter (the player is
reset before a resume is applied) is kept and written down in `useResume.ts`.
