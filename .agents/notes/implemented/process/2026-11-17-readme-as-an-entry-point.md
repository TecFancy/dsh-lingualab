# Agent Note: keep the README an entry point and move the long-form docs into `docs/`

Status: implemented

## Problem

`README.md` had grown to 313 lines and `README.zh.md` to 276. It was doing four jobs at
once: introducing the plugin, teaching the practice flow, documenting the host contract,
and recording the release process. The first two belong to someone who has just arrived;
the last two are reference material read once, by someone who already decided to work on
the repository.

Mixing them costs both readers. A newcomer scrolls past a seventeen-row route table and a
telemetry payload table to find out what the panel does, and the route table is harder to
find later because it sits in the middle of a narrative. The file also grew by accretion:
every feature added a paragraph to "What it does", because there was nowhere else to put
it.

The repository already had the shape for the fix. `scripts/check-docs.mjs` was written to
gate a `docs/` tree: every document there must be reachable from a README, no `INDEX.md`
may exist, and each document opens with exactly one H1. It had been passing on an empty
directory.

## Decision

**The README introduces and links; `docs/` explains.**

- `README.md` keeps the introduction, a compressed "What it does", the status, a table of
  the documents, the Figma reference, and a six-line summary of the usage ping. It is
  under 100 lines.
- Five documents carry the long form, each a bilingual pair: `docs/usage.md` (the home,
  adding material, episodes and segments, video, practice, notes and review, settings),
  `docs/telemetry.md`, `docs/releasing.md`, `docs/host-routes.md` and
  `docs/repository-layout.md`.
- The README's document table is the index. There is still no `INDEX.md`, and
  `docs:check` still fails an orphan document, so a new document that nobody links is a
  gate failure rather than a file nobody reads.
- The Chinese side was rewritten rather than translated again. The previous pass had
  removed the worst of the translationese, but a few renderings survived it: `chip` had
  become 「芯片」, `raise the version` had become 「抬高版本号」, and several paragraphs
  still stacked three facts into one sentence.

## Alternatives considered

**Keep one README and tighten the prose.** Rejected: the length is not a wording problem.
The route table and the telemetry payload table are reference material, and no amount of
editing makes them belong in an introduction.

**Split into `docs/` with an `INDEX.md`.** Rejected: the existing gate forbids an
`INDEX.md` on purpose, because a hand-maintained index drifts from the tree. The README
table plus the link check gives the same navigation with one less file to keep in step.

**Move the reference material into the repository skill.** Rejected: the skill is for an
agent that is already working in the repository, and it is loaded into a context budget.
The README and `docs/` are for a person arriving, and they cost nothing until opened.
