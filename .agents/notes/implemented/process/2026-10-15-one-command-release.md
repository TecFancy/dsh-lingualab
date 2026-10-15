# Agent Note: release with one command, and let the merge create the tag

Status: implemented

## Problem

A release took about twelve manual steps, each of them correct and none of them
interesting: cut a release branch, `npm run release`, the full verify, push, a pull request
into `development`, wait for CI, merge, a pull request from `development` into `main`, wait
for CI, merge with a merge commit, check the version on `origin/main`, tag by hand and push
the tag, delete the release branch, then ssh to the server to pull and restart. Every step
that can be forgotten was forgotten at least once (a tag on the wrong commit, a deploy that
restarted before the pull, a release branch left behind), and the one real decision in the
list, "this version goes out", was buried in the middle of it.

Two of the steps had stopped earning their keep. The repository is private on a free plan, so
`development` has no branch protection, and a push to `development` already runs the full
verify in CI; the release branch and the pull request into `development` ran the same
checks a second time. And the tag was a separate human action after the merge whose only
content was "tag the merged commit", which is exactly the kind of step that goes wrong when
the commit is looked up by hand.

dsh-auth-gate solves the same problem with `scripts/release.mjs`, one command that walks
the chain. Its shape fits, but it is built for release-please and npm, and neither belongs
here.

## Decision

**Borrow three ideas from dsh-auth-gate, not its machinery.**

- *One orchestrating command.* `npm run ship -- patch|minor|major` checks the ground, runs
  the existing `scripts/release.mjs` (the bump logic stays in one place), runs the full
  verify, pushes `development`, opens the pull request into `main` with the release notes as
  its body, waits for its checks and, when they are green, merges and syncs back. Running it is
  the release decision. `--no-wait` stops after opening the pull request, and
  `npm run ship -- --continue` finishes later: it reads the checks once, never polls, and merges
  only if they are all green. That two-step form exists for callers that must not sit and poll
  CI, an agent being the case in point. The state is derived from git and gh each time (branch, open pull request,
  tags), never kept in a file that could disagree with them. `--dry-run` runs the checks and
  prints every command that would change something, so the flow can be inspected without
  releasing.
- *The merge creates the tag.* `.github/workflows/release.yml` now runs on a push to `main`:
  if the version in `package.json` has no tag yet, it builds the body from the changelog pair
  and calls `gh release create --target $GITHUB_SHA`, which creates the tag and the release
  together on the merged commit. A version that already has a tag is skipped, and a version
  with no changelog section fails the run. Nobody tags by hand, and a tag cannot point at the
  wrong commit. The merge is the last thing `ship` does, so running `ship` is the single human
  decision and nothing after it needs a second confirmation.
- *Sync back.* After the merge, `development` is fast-forwarded onto `main` and pushed, so
  the merge commit that exists only on `main` does not accumulate as drift.

**Deploy is its own command, `npm run deploy`.** It is the old ssh line plus the two checks
it lacked: the version on the server is compared with `origin/main`'s, and the service must
report `active` after the restart. The host, the path and the service come from environment
variables, and every ssh call is an argument array, so it runs the same from Git Bash and
PowerShell. Whether the page works in a browser stays a manual look.

**Cut the steps that only repeated a check.** No release branch and no pull request into
`development`: the push to `development` is verified by CI, and the pull request into
`main` keeps the `version-bump` job, which is the guard that matters.

## Alternatives considered

- **Adopt release-please.** It is what dsh-auth-gate uses. Here it would replace the
  hand-written bilingual changelog with generated English entries from commit subjects, and
  the release body, the reader's main way into a version, is the Chinese-first pair written
  by the author. The `check-changelog` and bilingual gates exist to protect that. Giving it
  up to save one command is a bad trade.
- **Publish to npm.** The plugin is installed from a local path, never from a registry, so
  there is nothing for a publish job to do, and `wait-publish` has no equivalent.
- **Squash merges.** dsh-auth-gate squashes because release-please needs one conventional
  commit per pull request to compute the bump and the changelog. Without release-please
  that reason is gone, and a merge commit keeps the individual commits of `development`
  reachable from `main` (which is also why the sync-back is a fast-forward).
- **Make the merge a separate, explicit step.** This was the first design: `ship` stopped at
  green checks and a second command, `--continue`, merged. It was dropped because the goal is
  fewer steps and the decision is already made by running `ship` with a level; a second prompt
  only repeats it. The two-step form survives as `--no-wait` plus `--continue`, for the
  caller that must not wait on CI.
- **Keep the tag step manual, or tag from the script.** A tag made locally needs the merged
  commit to be looked up and pushed from the right machine. Letting the workflow create it at
  `$GITHUB_SHA` removes the lookup entirely.
- **A state file for a half-finished release.** It would let `--continue` skip the lookups, and
  it would also be wrong the moment someone merged or closed the pull request by hand. The
  pull request itself is the state.

## Consequences

A release is `npm run ship -- patch`, then `npm run deploy`. An agent that may not poll CI runs
`ship -- patch --no-wait`, and `ship -- --continue` when the checks have finished. The first push to `main` after this lands runs the new workflow
for a version whose tag already exists, and skips.

Two things are accepted. A failed `ship` after the version commit leaves that commit on the
local `development`; the script prints how to drop it or finish by hand, but it does not undo
anything on its own. And the `release` workflow now runs on every push to `main`, so a push
that is not a release still costs a short job that ends in a skip.
