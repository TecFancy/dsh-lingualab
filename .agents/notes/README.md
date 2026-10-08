# Agent Notes

English | [简体中文](README.zh.md)

An **Agent Note** records a decision this repository made: the *why*, and what it
gave up. Code and the READMEs carry what is; a note carries why it is that way, and
what the alternative cost.

## Layout and naming

`{lifecycle}/{class}/yyyy-mm-dd-topic-title.md` — two axes, both in the path.

The **lifecycle** is the note's status, and the folder changes when the status does:
`proposed/` for decided-but-not-built, `implemented/` for shipped, `rejected/` for
considered-and-declined, `archived/` for kept-but-no-longer-maintained.

The **class** comes from a closed set, the same six classes the harness uses for its
own note tree. An unknown folder is a gate failure, not a judgement call.

| Class | What it covers |
|---|---|
| `feature` | A new user-facing capability, or a change to one. |
| `bug-fix` | Corrects a defect, or closes a gap a postmortem surfaced. |
| `simplification` | Removes code, behaviour or surface area without adding a capability. |
| `architecture` | A structural decision about the shipped source: how the halves relate. |
| `process` | Tooling, policy or workflow around the code, not runtime behaviour. |
| `testing` | Test infrastructure and strategy. |

Every note carries the same header (`# Agent Note: <title>`, a blank line,
`Status: implemented`), opens its body with `## Problem`, and answers
`## Alternatives considered` before it ends. The `.zh.md` mirror repeats the heading
sequence, and the `.i18n.yaml` sidecar records the pairing hashes.

## What this costs

Every note is three files. That is the price of the pairing gate, and it is why notes
are written for decisions rather than for changes: a note that restates the diff is
maintenance with no reader.

`npm run notes:check` owns the tree and the file format, `npm run notes:links` owns
the links between notes, and `npm run bilingual:check` owns the pairing hashes.
