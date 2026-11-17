# Releasing

English | [简体中文](releasing.zh.md)

This document explains how to release LinguaLab, and how `ship` and CI divide the work. Read it before merging changes into `main`.

## A pull request into `main` is a release

Work lands on `development`. A pull request into `main` is a release. Run this command from `development`:

```sh
npm run ship -- patch|minor|major   # check, bump, verify, push, open the PR, wait for green, merge, sync back
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

The tag is not made by hand. When the merge lands on `main`, the `release` workflow creates the tag, a GitHub Release whose body is that version's sections from the changelog pair (Chinese first and English after), and the `dsh-lingualab-<version>.tgz` attached to it. The same version is then published to npm from the same tarball, so the registry, the Release and the tag always carry one artifact.

## Publishing to npm

The first version of a package has to be published by a maintainer, because npm only lets you register a Trusted Publisher on a package that already exists. After that, the `release` workflow publishes over OIDC: no `NPM_TOKEN` secret exists, and the trust is registered on npmjs.com against this repository and the `release.yml` filename. Renaming that file breaks publishing.
