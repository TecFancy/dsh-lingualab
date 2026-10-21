# Agent Note: the seven-phrase ceiling is enforced on both sides of the wire

Status: implemented

## Problem

The study method this panel was built for allows at most seven recorded phrases per
episode, and it allows them on purpose: the ceiling forces a choice about what is
worth keeping. A panel that accepted an eighth phrase would quietly remove the
mechanism the method depends on.

## Decision

The limit lives in the shared notes format as `MAX_PHRASES`, is checked by the host
before it writes a file, and is asked about by the panel before it loses an edit. The
panel counts what is left, and when the list is full it asks which phrase to replace
rather than appending. The host refuses an over-long list with a reason, so a client
that skips the question cannot write one anyway.

## Alternatives considered

- **Enforce it only in the panel.** The shortest path, and a rule that a script, a
  second client or a hand edit can break.
- **Enforce it only in the host.** Correct, but the user would meet a rejected save
  instead of a question, which is exactly the scolding tone the method avoids.
- **Warn instead of enforcing.** Turns a decision-forcing device into advice, and
  advice loses to convenience every time.

## Consequences

The limit appears in three places — the format module, the host writer, the panel — and
the tests cover the two that can refuse. Changing the number is a one-line edit in the
format module; the other two read it from there.
