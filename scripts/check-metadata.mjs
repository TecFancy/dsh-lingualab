#!/usr/bin/env node
/**
 * Publish-metadata gate: the `package.json` fields a directory reads, not the host.
 *
 * `check-host` owns the runtime contract — the package name, the Loader row, the
 * routes, the module table. Everything it checks is something the host reads at
 * load time, and a mistake there is a plugin that does not start.
 *
 * The fields below are the opposite: nothing in this repository reads them, the
 * host never sees them, and getting them wrong breaks nothing locally. They are
 * read by the world outside — npm search, the registry indexes, the storefronts
 * that filter on `keywords` — and a package missing them installs fine and is
 * invisible to all of those at once. That is why they get their own gate instead
 * of riding along in `check-host`: a failure here means "nobody will find this",
 * not "this will not run", and the two should not be reported as one thing.
 *
 * What is checked:
 *
 *   1. `keywords` exists and is a non-empty array of non-empty strings.
 *   2. It carries `dsh-plugin` and `deepseek-harness` — the two tokens the
 *      ecosystem's directories actually filter on. `dsh-plugin` is the GitHub
 *      topic every crawler scans; `deepseek-harness` is what the storefronts that
 *      require both topics look for.
 *   3. No keyword is duplicated, and none is a near-miss of the two above
 *      (`dshplugin`, `dsh_plugin`, `deepseek_harness`): a typo there is invisible
 *      to every filter while looking correct in the diff.
 *   4. `description` is a non-empty single line, because the indexes truncate at
 *      the first newline and a multi-line description loses its tail silently.
 *
 * Usage:
 *   node scripts/check-metadata.mjs              # check this checkout
 *   node scripts/check-metadata.mjs --root <dir> # check a tree under the temp directory
 *   node scripts/check-metadata.mjs --self-test  # prove this gate still bites
 */
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const FILE = 'package.json'
/** The two tokens the ecosystem's directories filter on. */
const REQUIRED = ['dsh-plugin', 'deepseek-harness']
/** Spellings that look right in a diff and match nothing. */
const NEAR_MISSES = new Set(['dshplugin', 'dsh_plugin', 'dsh-plugins', 'deepseek_harness', 'deepseekharness'])

/**
 * Parse the arguments. Every one is consumed and anything left over is an error, so a
 * misspelled `--rooot <dir>` cannot be dropped and leave the run checking this checkout.
 */
function parseArgs(argv) {
  const fail = (message) => {
    console.error(`[check-metadata] ${message}`)
    process.exit(2)
  }
  const args = { selfTest: false, root: undefined }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--self-test') {
      args.selfTest = true
    } else if (arg === '--root' || arg.startsWith('--root=')) {
      if (args.root !== undefined) fail('--root given more than once')
      const value = arg === '--root' ? argv[i + 1] : arg.slice('--root='.length)
      if (!value || value.startsWith('--')) fail('--root needs a directory value')
      args.root = value
      if (arg === '--root') i += 1
    } else {
      fail(`unknown argument: ${arg}`)
    }
  }
  return args
}

const ARGS = parseArgs(process.argv.slice(2))

/** Every problem in one tree, as human-readable strings. Empty means the manifest is usable. */
function problemsIn(root) {
  const problems = []
  const note = (message) => problems.push(`${FILE}: ${message}`)

  const path = join(root, FILE)
  if (!existsSync(path)) return [`${FILE} is missing`]

  let manifest
  try {
    manifest = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    return [`${FILE} is not valid JSON: ${error.message}`]
  }

  const keywords = manifest.keywords
  if (!Array.isArray(keywords) || keywords.length === 0) {
    note('has no `keywords` array: npm search and every plugin directory filter on it, so the package is unfindable')
  } else {
    const seen = new Set()
    for (const [index, raw] of keywords.entries()) {
      const where = `keywords[${index}]`
      if (typeof raw !== 'string' || raw.trim() === '') {
        note(`${where} must be a non-empty string`)
        continue
      }
      const keyword = raw.trim()
      if (seen.has(keyword)) note(`${where} repeats ${keyword}`)
      seen.add(keyword)
      if (NEAR_MISSES.has(keyword.toLowerCase())) {
        note(`${where} is ${keyword}, which no directory filters on; the token is ${keyword.includes('deepseek') ? 'deepseek-harness' : 'dsh-plugin'}`)
      }
    }
    for (const required of REQUIRED) {
      if (!seen.has(required)) note(`keywords is missing ${required}, so the directories that filter on it cannot find this package`)
    }
  }

  const description = manifest.description
  if (typeof description !== 'string' || description.trim() === '') {
    note('has no `description`: the indexes show it as the plugin summary')
  } else if (description.includes('\n')) {
    note('`description` spans several lines; the indexes truncate at the first newline')
  }

  return problems
}

/**
 * Negative cases against a throwaway tree. A gate that cannot tell "passed" from
 * "never ran" is worse than no gate, so each rule gets a case that must fail and a
 * baseline that must pass.
 */
function selfTest() {
  const tmp = mkdtempSync(join(tmpdir(), 'check-metadata-selftest-'))
  const failures = []
  const run = (args = ['--root', tmp]) =>
    spawnSync(process.execPath, [fileURLToPath(import.meta.url), ...args], { encoding: 'utf8' })
  const expect = (name, result, code, needle) => {
    if (result.status !== code) {
      failures.push(`${name}: expected exit ${code}, got ${result.status}`)
      return
    }
    const out = `${result.stdout}${result.stderr}`
    if (needle && !out.includes(needle)) failures.push(`${name}: output missing ${JSON.stringify(needle)}`)
  }
  const write = (manifest) => {
    writeFileSync(join(tmp, FILE), typeof manifest === 'string' ? manifest : JSON.stringify(manifest))
  }
  const base = {
    name: 'dsh-example',
    description: 'One line about what the plugin does.',
    keywords: ['dsh', 'dsh-plugin', 'deepseek-harness'],
  }

  try {
    // 1. Baseline: a complete manifest passes, so every case below fails for the
    //    rule under test rather than for the fixture.
    write(base)
    expect('baseline', run(), 0, 'OK')

    // 2. No keywords at all is the failure this gate exists for.
    write({ ...base, keywords: undefined })
    expect('no keywords', run(), 1, 'has no `keywords` array')

    // 3. An empty array is not a declaration.
    write({ ...base, keywords: [] })
    expect('empty keywords', run(), 1, 'has no `keywords` array')

    // 4. Each required token is checked on its own.
    write({ ...base, keywords: ['dsh', 'deepseek-harness'] })
    expect('missing dsh-plugin', run(), 1, 'missing dsh-plugin')

    write({ ...base, keywords: ['dsh', 'dsh-plugin'] })
    expect('missing deepseek-harness', run(), 1, 'missing deepseek-harness')

    // 5. A near-miss looks right in the diff and matches nothing.
    write({ ...base, keywords: ['dsh', 'dsh_plugin', 'deepseek-harness'] })
    expect('near miss', run(), 1, 'no directory filters on')

    // 6. Repeats are refused.
    write({ ...base, keywords: ['dsh-plugin', 'dsh-plugin', 'deepseek-harness'] })
    expect('duplicate', run(), 1, 'repeats')

    // 7. A non-string entry is named rather than coerced.
    write({ ...base, keywords: ['dsh-plugin', 'deepseek-harness', 42] })
    expect('non-string keyword', run(), 1, 'must be a non-empty string')

    // 8. A multi-line description loses its tail in every index.
    write({ ...base, description: 'First line.\nSecond line.' })
    expect('multi-line description', run(), 1, 'truncate at the first newline')

    // 9. No description at all.
    write({ ...base, description: undefined })
    expect('no description', run(), 1, 'has no `description`')

    // 10. Broken JSON names the file rather than throwing.
    write('{ not json')
    expect('broken json', run(), 1, 'not valid JSON')

    // 11. A missing manifest is a failure, not a silent pass.
    rmSync(join(tmp, FILE), { force: true })
    expect('missing file', run(), 1, 'is missing')

    // 12. A misspelled override is refused instead of scanning the default tree.
    expect('unknown argument', run(['--rooot', tmp]), 2, 'unknown argument')
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }

  if (failures.length > 0) {
    console.error('[check-metadata] self-test FAILED:')
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exit(1)
  }
  console.log('[check-metadata] self-test passed (11 cases + the --root guard).')
}

if (ARGS.selfTest) {
  selfTest()
} else {
  const root = ARGS.root === undefined ? join(dirname(fileURLToPath(import.meta.url)), '..') : resolve(ARGS.root)
  const problems = problemsIn(root)
  if (problems.length > 0) {
    console.error('metadata:check FAILED:')
    for (const message of problems) console.error(`  - ${message}`)
    process.exit(1)
  }
  const manifest = JSON.parse(readFileSync(join(root, FILE), 'utf8'))
  console.log(`OK: ${FILE} publish metadata verified (${manifest.keywords.length} keywords, both directory tokens present)`)
}
