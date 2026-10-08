# Agent Note: the client half is FSD, and has no app layer

Status: implemented

## Problem

The panel is small enough to be written as one long component, and the host half is
flat by comparison. The neighbouring `fsd-react` repository is a full application
scaffold: a router, a component library, a design-token pipeline and a build that
emits a web app. A plugin bundle is none of those things — it is one classic script
that registers itself with the host's module table — so copying that scaffold would
have imported a build we cannot use and dependencies the host already provides.

At the same time, the material this page is for keeps growing. Video and dictation
were already on the table before the first line was written.

## Decision

The client half is organised in FSD layers — `shared`, `entities`, `features`,
`widgets`, `pages` — and has no `app` layer. Registration, providers and routing stay
with the host, so `index.tsx` sits at the root of the analysed tree and wires one slot
registration. Steiger enforces the layer rules over `src/client`; the page composes
features, and features never reach into each other.

## Alternatives considered

- **One long component.** The cheapest first version, and the one that makes video and
  dictation edits to the same file. Rejected for the reason the panel exists at all:
  it is expected to grow past listening.
- **Fork `fsd-react` and add a plugin build target.** Keeps the architecture and the
  full gate chain, at the cost of two builds, a router and a component library the
  bundle cannot use. Rejected; the reusable part of that repository is its rules, and
  rules transfer without the scaffold.
- **Copy the repealed repeater app's layout.** It is FSD too, but its slices import
  through `entities/subtitle`, which is a type-only entity, and its stores are
  singletons wired through widgets. Taking the shape without the wiring would have
  been a halfway house.

## Consequences

A new capability means a new slice with its own public API, which is more ceremony
than adding a file to one component. In exchange, the layer graph is enforced by a
check rather than by memory, and every import that crosses a slice goes through a
barrel that a reviewer can read in one line.
