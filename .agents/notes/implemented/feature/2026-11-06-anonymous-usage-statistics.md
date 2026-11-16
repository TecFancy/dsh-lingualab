# Agent Note: the usage ping is anonymous and one config key turns it off

Status: implemented

## Problem

Nothing in the plugin could say whether it was installed and used anywhere, or which version ran
there. Everything the panel knows about itself is read on the machine that runs it: the home footer
names the build, the update check compares release tags, and the library scan counts episodes. None
of that reaches the person maintaining the plugin, so "how many machines, which versions" had no
answer at all. The tempting fixes — an account, a hosted dashboard, a third-party analytics SDK —
are exactly the dependencies this repository has avoided everywhere else.

The question was narrowed on purpose to two numbers: how many installations actually run the plugin,
and which version each one runs. Anything more interesting (which episodes, which features, how
long) would need content or behaviour from the user's machine, and content is what must not leave
it.

## Decision

The host half sends one `POST` to `https://t.hi-ruofei.com/v1/ping`, at most once per 24 hours in
one process, and only after `guarded()` has admitted a request: a process that starts and is never
used sends nothing. The body is the contract's v1 payload: the payload version, the package name
from `package.json`, the version read at load, a random installation id, the Node major, `os`,
`arch`, and the two metrics this package reports — the library root's episode folders in four
buckets, and whether `ffmpeg` can be found. `locale` is not sent, because this plugin has no host
locale service to read it from, and the contract says to omit it rather than guess.

The request is a one-way fact, so it is fired and forgotten. It has a five second abort, is never
retried or logged, and every failure ends in the module's own `catch`; the request that started it
was already admitted and is answered whatever happens to the ping. The guard receives the hook as
an argument instead of importing the network itself, which keeps `admitRequest` a pure decision and
the reporting outside it.

The id is a UUID v4 from `crypto.randomUUID()`, hidden and volatile in the config. It is generated
on the first admitted request and written back through the settings service into this plugin's own
profile entry, like `openState` and `libraryRoot`; there is no state file of ours. The write is
awaited and retried on every ping until it lands, because a write that is fired and forgotten is
indistinguishable from one that failed: the id would then be new on every restart, and the count
would be installations rather than machines. A write that never lands still does not cost the ping.

The switch is a plain, visible `telemetry` boolean, default `true`. Turning it off means no id, no
listing and no request: the module checks it before it does anything else. Nothing else in the
plugin reads it, and nothing in the panel changes when it is off.

## Alternatives considered

**A machine fingerprint.** Hashing a host name, a MAC address or a machine id would identify a
machine without storing anything, and that is the problem: it would be stable, derived from
hardware, and impossible for the user to reset. A random id in the config can be deleted by hand,
names nothing, and links no two installations.

**A third-party SDK.** An analytics or crash SDK would answer far more, and cost a dependency, an
outbound host we do not control, its retention policy, and its idea of what an event is. The whole
report is one small request; the SDK would be the larger part of the feature.

**A login gate in front of the panel.** Counting through accounts would make the statistics exact
and make the panel need an account. This is a study tool that opens a folder on the machine; a
login would be a paywall in everything but name, and the contract rules it out.

**Sending nothing, or sending everything behind an opt-in.** Off-by-default telemetry answers the
question with the sample of people who read the README. Content-carrying telemetry answers it
exactly and breaks the one rule that matters. The middle line is a tiny fixed body, on by default,
visible and switchable, with both READMEs saying what is sent, what is never sent, and the exact key
that stops it.

**A timer.** A once-a-day timer would report from an installation nobody uses. The ping is lazy:
the trigger is an admitted request, which is the only honest evidence that the plugin was used.

## Consequences

Maintaining the plugin now has a number instead of a guess, at the cost of one outbound request a
day from an installation that is in use, to a host that is not this machine's. A network that
blocks the endpoint never sees a retry and never sees the plugin complain; the panel behaves as if
the feature did not exist.

The endpoint does not exist yet. Until it does, every ping fails silently, which the contract
expects; a ping that succeeds later is no different from this side.

The payload has no version negotiation beyond `v`, so a future change to the key set is a `v2` and
the receiving side must accept both. The tests pin the exact key set for that reason.
