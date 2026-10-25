# Agent Note: the home says which build it is

Status: implemented

## Problem

The panel is installed as a `link:` to a checkout on this machine, so there is no registry version to
read anywhere, and the manifest on disk is not the answer either: after a pull but before a restart it
already says the next version while the running process still serves the old code. Opened on an iPad
over a tunnel, the page gave no way to tell which build was on screen without a shell and `git log`.

Nothing in the panel could say whether a newer release existed, either. The repository publishes
`vX.Y.Z` tags and GitHub Releases, but it is private and is not on npm, so neither a registry lookup
nor an unauthenticated browser request can answer that.

## Decision

The host half reads its own version once, when it loads: the manifest's `version`, the short commit
from `git rev-parse`, and whether `git status --porcelain` reports changes. That snapshot answers
`/lingualab/update` and rides along in `/lingualab/config`, so the home gets it with the request it
already makes. Reading it at load, rather than per request, is what makes the number name the code
that is running.

The release check runs `git ls-remote --tags origin 'v*'` against the checkout's own remote and
compares the newest `vX.Y.Z` tag with the running version. It is read only: no fetch, no pull, no
install, and no change to the working tree or the refs. A finished answer is cached for a quarter of
an hour, a failed one for a minute, and `?refresh=1` skips the cache for a retry.

"Newest" means the newest release tag, not the newest commit. A development build can be ahead of the
last release, and that is reported as such instead of as "up to date". A check that cannot answer says
so; it never falls back to "latest".

There is no upgrade button. The host cannot restart itself, a pull would swap the client bundle under
a host that keeps running the old half, and the checkout in use is the development one.

The line is the last thing on the home, under a hairline and under the folder line, not the first.
Which build is running and whether a newer tag exists are facts about the page, and the page exists
to continue an episode: in the first row that line was read before the continue card and made a
report the point of the visit. At the bottom it is still on every home state, still readable without
a shell, and no longer in the way. The hairline is left out on an empty library, where the page is
one welcome card and a line under it would only look like an orphaned footnote.

Only "a newer release is available" is emphasised, in the brand colour and semibold, because that is
the one state worth acting on. A check that could not answer keeps the sentence as quiet as its
neighbours and colours the retry instead: the words say what happened, and the one thing worth doing
is the part that stands out.

## Alternatives considered

**GitHub Releases API or `gh`.** It would give release notes too, but a private repository needs a
token for the running process, and that is a credential to manage for a label on a page.

**Ask the browser.** A private repository answers only authenticated requests, and putting the token
in the page is worse than not showing the state at all.

**Compare local tags only.** Cheap and offline, but it answers "newer than the last fetch", which is
not the question.

**`git fetch` and compare `origin/main`.** It answers a different question, what has landed, and it
writes to `.git` for what is a read-only status.

**Bake the version into the client bundle.** The build is checked byte for byte against `lib/`, and a
release bumps the manifest without rebuilding, so an embedded version would either go stale or break
that check.

## Consequences

The line is on the home only, in every home state, in the footer under the folder line. It costs one
extra Git process at load and one on each page view, cached for a quarter of an hour.

A machine without Git, a copy that is not a checkout, or a remote that is away each make the check say
it cannot tell. The page keeps showing the version it does know.

The upgrade path stays where it was: `npm run ship` releases, and restarting `dsh-web` applies the host
half. The page can now say when that is worth doing.
