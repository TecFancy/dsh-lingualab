#!/usr/bin/env node
/**
 * Market-screenshot gate: the repository-root `screenshots.json`.
 *
 * The plugin market (dsh-market) draws a card thumbnail strip from a curated
 * list, and it reads that list from `screenshots.json` beside the plugin's
 * `package.json`. It does not read the README for the card: README images are
 * only a fallback inside the install dialog, and that dialog never opens for an
 * already-installed plugin. So this file is the only thing that puts
 * screenshots on the card.
 *
 * That makes it exactly the kind of list that rots silently. Rename a
 * `docs/assets/` image and `links:check` catches the README reference while this
 * file keeps pointing at a 404. The upstream registry documents the cost: 41 of
 * 773 published screenshots had gone 404 before it started probing.
 *
 * The rules below mirror the upstream contract, so a declaration that passes
 * here is one the registry accepts:
 *
 *   1. Shape — an array of 1-8 non-empty strings, or `{"screenshots": [...]}`.
 *   2. Location — a relative path that stays inside the repository (no leading
 *      `/`, no `..` segment), or an absolute https URL on GitHub hosting.
 *   3. Format — a raster image (PNG/JPEG/WebP). The market refuses SVG: an SVG
 *      is a document, not an image, and it is dropped before an `<img>` exists.
 *   4. Existence — every relative path resolves to a file on disk.
 *   5. Uniqueness — no image is declared twice.
 *
 * Usage:
 *   node scripts/check-screenshots.mjs              # check this checkout
 *   node scripts/check-screenshots.mjs --root <dir> # check a tree under the temp directory
 *   node scripts/check-screenshots.mjs --self-test  # prove this gate still bites
 */
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, extname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const FILE = 'screenshots.json'
const MAX_SHOTS = 8
/** Image hosts the registry accepts for an absolute URL. */
const GITHUB_HOSTS = new Set([
  'raw.githubusercontent.com',
  'user-images.githubusercontent.com',
  'camo.githubusercontent.com',
  'github.com',
])
/** Extensions the market renders. SVG is deliberately absent. */
const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp'])

/**
 * Parse the arguments. Every one is consumed and anything left over is an error, so a
 * misspelled `--rooot <dir>` cannot be dropped and leave the run checking this checkout.
 */
function parseArgs(argv) {
  const fail = (message) => {
    console.error(`[check-screenshots] ${message}`)
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

/** Every problem in one tree, as human-readable strings. Empty means the file is usable. */
function problemsIn(root) {
  const problems = []
  const note = (message) => problems.push(`${FILE}: ${message}`)

  const path = join(root, FILE)
  if (!existsSync(path)) return [`${FILE} is missing: the plugin market reads its card screenshots from this file.`]

  let doc
  try {
    doc = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    return [`${FILE} is not valid JSON: ${error.message}`]
  }

  const list = Array.isArray(doc) ? doc : Array.isArray(doc?.screenshots) ? doc.screenshots : null
  if (list === null) return [`${FILE} must be an array of paths or {"screenshots": [...]}.`]

  if (list.length === 0) note('declares no images')
  if (list.length > MAX_SHOTS) note(`declares ${list.length} images; the cap is ${MAX_SHOTS}`)

  const seen = new Set()
  for (const [index, raw] of list.entries()) {
    const where = `entry ${index + 1}`
    if (typeof raw !== 'string' || raw.trim() === '') {
      note(`${where} must be a non-empty string`)
      continue
    }
    const entry = raw.trim()
    if (seen.has(entry)) note(`${where} repeats ${entry}`)
    seen.add(entry)

    if (/^https?:\/\//i.test(entry)) {
      let parsed
      try {
        parsed = new URL(entry)
      } catch {
        note(`${where} is not a parseable URL: ${entry}`)
        continue
      }
      if (parsed.protocol !== 'https:' || !GITHUB_HOSTS.has(parsed.hostname)) {
        note(`${where} must be https on GitHub hosting, got ${entry}`)
        continue
      }
      if (!RASTER.has(extname(parsed.pathname).toLowerCase())) {
        note(`${where} must be a raster image (PNG/JPEG/WebP), got ${entry}`)
      }
      continue
    }

    if (entry.startsWith('/') || entry.split('/').includes('..')) {
      note(`${where} must stay inside the repository, got ${entry}`)
      continue
    }
    if (!RASTER.has(extname(entry).toLowerCase())) {
      note(`${where} must be a raster image (PNG/JPEG/WebP), got ${entry}`)
      continue
    }
    const target = resolve(root, entry)
    if (!existsSync(target) || !statSync(target).isFile()) {
      note(`${where} does not exist: ${entry}`)
    }
  }
  return problems
}

/**
 * Negative cases against a throwaway tree. A gate that cannot tell "passed" from
 * "never ran" is worse than no gate, so each rule gets a case that must fail and
 * a baseline that must pass.
 */
function selfTest() {
  const tmp = mkdtempSync(join(tmpdir(), 'check-screenshots-selftest-'))
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
  const write = (doc, images = ['a.png']) => {
    for (const image of images) {
      mkdirSync(dirname(join(tmp, image)), { recursive: true })
      writeFileSync(join(tmp, image), 'not really a png, but a file')
    }
    writeFileSync(join(tmp, FILE), typeof doc === 'string' ? doc : JSON.stringify(doc))
  }
  const reset = () => rmSync(join(tmp, FILE), { force: true })

  try {
    // 1. Baseline: a plain array of existing images passes, so every case below
    //    fails for the rule under test rather than for the fixture.
    write(['a.png'])
    expect('baseline', run(), 0, 'OK')

    // 2. The named-field shape is accepted too.
    write({ screenshots: ['a.png'] })
    expect('named field', run(), 0, 'OK')

    // 3. A missing file is the failure this gate exists for.
    write(['missing.png'])
    expect('missing image', run(), 1, 'does not exist')

    // 4. The market drops SVG before an <img> exists.
    write(['a.svg'], ['a.svg'])
    expect('svg', run(), 1, 'raster image')

    // 5. A path may not climb out of the repository.
    write(['../a.png'])
    expect('parent segment', run(), 1, 'stay inside the repository')

    // 6. Nor start at the filesystem root.
    write(['/a.png'])
    expect('absolute path', run(), 1, 'stay inside the repository')

    // 7. A third-party image host would be a tracking pixel in every storefront.
    write(['https://example.com/a.png'])
    expect('foreign host', run(), 1, 'GitHub hosting')

    // 8. GitHub hosting with a raster image is fine.
    write(['https://raw.githubusercontent.com/o/r/main/a.png'])
    expect('github url', run(), 0, 'OK')

    // 9. The cap is eight.
    write(Array.from({ length: 9 }, (_, i) => `a${i}.png`), Array.from({ length: 9 }, (_, i) => `a${i}.png`))
    expect('over the cap', run(), 1, 'the cap is 8')

    // 10. An empty list is not a declaration.
    write([])
    expect('empty list', run(), 1, 'declares no images')

    // 11. Repeats are refused.
    write(['a.png', 'a.png'])
    expect('duplicate', run(), 1, 'repeats')

    // 12. Broken JSON names the file rather than throwing.
    write('{ not json')
    expect('broken json', run(), 1, 'not valid JSON')

    // 13. A missing file is a failure, not a silent pass.
    reset()
    expect('missing file', run(), 1, 'is missing')

    // 14. A misspelled override is refused instead of scanning the default tree.
    expect('unknown argument', run(['--rooot', tmp]), 2, 'unknown argument')
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }

  if (failures.length > 0) {
    console.error('[check-screenshots] self-test FAILED:')
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exit(1)
  }
  console.log('[check-screenshots] self-test passed (13 cases + the --root guard).')
}

if (ARGS.selfTest) {
  selfTest()
} else {
  const root = ARGS.root === undefined ? join(dirname(fileURLToPath(import.meta.url)), '..') : resolve(ARGS.root)
  const problems = problemsIn(root)
  if (problems.length > 0) {
    console.error('screenshots:check FAILED:')
    for (const message of problems) console.error(`  - ${message}`)
    process.exit(1)
  }
  const list = JSON.parse(readFileSync(join(root, FILE), 'utf8'))
  const count = Array.isArray(list) ? list.length : list.screenshots.length
  console.log(`OK: ${FILE} verified (${count} images, all present and market-renderable)`)
}
