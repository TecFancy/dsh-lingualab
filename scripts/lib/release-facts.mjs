/**
 * The impure half of the release check: ask git, gh and the working tree what is true.
 *
 * Every function here only reads. The release state lives in the repository and on
 * GitHub (the branch, the open pull request, the tags), so it is derived from there
 * each time instead of being kept in a state file that could disagree with them.
 * What comes back is the plain `facts` object that `release-plan.mjs` judges.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { unreleasedBody } from './release-plan.mjs'

/** The repository facts both modes need: where we are and how we relate to origin. */
export function gatherBase(run, root) {
  const fetched = run.read('git', ['fetch', 'origin', '--quiet']).status === 0
  const count = (range) => Number.parseInt(run.read('git', ['rev-list', '--count', range]).stdout, 10) || 0
  const ghOk = run.read('gh', ['auth', 'status']).status === 0
  return {
    fetched,
    ghOk,
    branch: run.read('git', ['branch', '--show-current']).stdout,
    dirty: run.read('git', ['status', '--porcelain']).raw,
    behind: count('HEAD..origin/development'),
    ahead: count('origin/development..HEAD'),
    version: JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version,
  }
}

/** The open pull request from development into main, or `null`. */
export function findOpenReleasePr(run) {
  const listed = run.read('gh', [
    'pr', 'list', '--base', 'main', '--head', 'development', '--state', 'open',
    '--json', 'number,title,url',
  ])
  if (listed.status !== 0) return null
  try {
    return JSON.parse(listed.stdout)[0] ?? null
  } catch {
    return null
  }
}

/** Whether the tag exists locally or on origin. */
export function tagExists(run, version) {
  const name = `refs/tags/v${version}`
  if (run.read('git', ['tag', '-l', `v${version}`]).stdout !== '') return true
  return run.read('git', ['ls-remote', '--tags', 'origin', name]).stdout !== ''
}

/** The facts `checkShipReadiness` judges. */
export function gatherShipFacts(run, root, target) {
  const base = gatherBase(run, root)
  const read = (file) => unreleasedBody(readFileSync(join(root, file), 'utf8'))
  const main = run.read('git', ['show', 'origin/main:package.json'])
  return {
    ...base,
    target,
    unreleased: { en: read('CHANGELOG.md'), zh: read('CHANGELOG.zh.md') },
    tagExists: tagExists(run, target),
    openPr: base.ghOk ? findOpenReleasePr(run) : null,
    toShip: Number.parseInt(run.read('git', ['rev-list', '--count', 'origin/main..HEAD']).stdout, 10) || 0,
    mainVersion: main.status === 0 ? JSON.parse(main.stdout).version : '（读不到）',
    mainInDevelopment: run.read('git', ['merge-base', '--is-ancestor', 'origin/main', 'HEAD']).status === 0,
  }
}

/** The facts `checkContinueReadiness` judges. */
export function gatherContinueFacts(run, root) {
  const base = gatherBase(run, root)
  return { ...base, openPr: base.ghOk ? findOpenReleasePr(run) : null }
}

/** The checks of one pull request, read once: `gh pr checks` exits non-zero while pending. */
export function readChecks(run, number) {
  const result = run.read('gh', ['pr', 'checks', String(number), '--json', 'name,bucket,state'])
  try {
    return JSON.parse(result.stdout)
  } catch {
    return []
  }
}
