# Agent Note: the cross-half contract reaches the client through two bridges

Status: implemented

## Problem

Both halves speak the same vocabulary: route paths, payload shapes, and the notes
markdown format. The host serves those shapes and the panel renders them, so the
definitions have to live outside either half. But the client half is checked as an FSD
tree, and an FSD layer that imports from outside its root is a layering violation the
linter is right to flag.

## Decision

The contract lives in `src/shared/`, and two single-purpose modules —
`src/client/shared/protocol.ts` and `src/client/shared/notes-format.ts` — re-export it
for the client tree. Everything in the client imports the bridges; only the bridges
import the kernel. Each bridge says in its own header why it exists.

## Alternatives considered

- **Let client files import the kernel directly.** Steiger tolerates it, because the
  target resolves outside the analysed root. It also means the boundary has as many
  doors as there are imports.
- **Move the contract into the client tree and have the host import from there.** The
  host would then depend on a folder that FSD governs, which inverts the relationship
  and makes a host-only change look like a layering decision.
- **Duplicate the types in both halves.** Guarantees drift, and the drift is invisible
  until a payload field is renamed on one side.

## Consequences

A new shared shape gets one home and, at most, one new bridge. The bridges are the only
files a reader has to check when asking "what does the client see of the host".
