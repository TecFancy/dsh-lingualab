# Releasing

English | [简体中文](releasing.zh.md)

This document explains how to release and deploy LinguaLab, and how `ship`, `deploy` and CI divide the work. Read it before merging changes into `main` or updating the plugin on a server.

## A pull request into `main` is a release

Work lands on `development`. A pull request into `main` is a release. Run this command from `development`:

```sh
npm run ship -- patch|minor|major   # check, bump, verify, push, open the PR, wait for green, merge, sync back
npm run deploy                      # pull on the server, restart the service, confirm it is active
```

## `ship` performs four release steps in order

1. Bump the version and move both sides of the changelog under a dated heading (`scripts/release.mjs`).
2. Run the full `npm run verify` and push `development`.
3. Open the pull request into `main` and wait for its checks. When they are green, merge it with a merge commit.
4. Fast-forward `development` onto the merged `main`.

Running `ship` is the release decision.

## CI and continuation options control the merge

A caller that must not sit and poll CI (an agent) uses `npm run ship -- patch --no-wait`, which stops after opening the pull request. Later, `npm run ship -- --continue` reads the checks once and merges only if they are all green.

The `version-bump` job in CI fails a pull request that does not raise the version. `--dry-run` prints every command that would change something instead of running it.

## The release workflow creates the tag after merging

The tag is not made by hand. When the merge lands on `main`, the `release` workflow creates the tag and a GitHub Release whose body is that version's sections from the changelog pair, Chinese first and English after.

Nothing is published to npm. The plugin is installed from a local path or a tarball, so a version number here marks a state that was installed and used, not an artifact on a registry.

## `deploy` reads its target from environment variables

`deploy` reads its target from `LINGUALAB_DEPLOY_HOST` and `LINGUALAB_DEPLOY_PATH`; see the repository skill for the details.
