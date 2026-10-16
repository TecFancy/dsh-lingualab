#!/usr/bin/env node
/**
 * Bilingual-pair gate.
 *
 * A pair is any `X.md` with a sibling `X.zh.md` — the READMEs and every Agent
 * Note. For each pair this checks the frame a machine can check:
 *
 *   1. parallel structure — the same number of sections, in the same order, at
 *      the same heading levels;
 *   2. fenced code blocks byte for byte, so a block is never "translated";
 *   3. the Chinese side links its own language — a relative link to a paired
 *      document names the `.zh.md` file, and the switcher under the H1 is the
 *      only cross-language link;
 *   4. the per-section hash record in `X.i18n.yaml`, so editing one side alone
 *      is visible instead of silent.
 *
 * What it cannot see (inline code, emphasis, wording inside lists and tables,
 * meaning, terminology, tone) belongs to review. The prose rules in `AGENTS.md`
 * ("写东西的规矩") own the Chinese side and `npm run zh:prose` owns their
 * mechanical half.
 *
 * Usage:
 *   node scripts/check-bilingual.mjs                    # compare against the records
 *   node scripts/check-bilingual.mjs --write            # re-record every pair
 *   node scripts/check-bilingual.mjs --root <dir>       # check a tree under the temp directory (used by --self-test)
 *   node scripts/check-bilingual.mjs --self-test        # prove this gate still bites
 */
import { existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { bodyHash, currentHashes, fences, readRecord, sections } from './lib/pairing.mjs'

const DEFAULT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKIP_DIRS = new Set(['.git', 'node_modules', '.claude'])

/**
 * Parse the arguments. Every one is consumed and anything left over is an error, so a
 * misspelled `--rooot <dir>` cannot be dropped and leave the run checking this checkout.
 */
function parseArgs(argv) {
  const fail = (message) => {
    console.error(`[check-bilingual] ${message}`)
    process.exit(2)
  }
  const args = { selfTest: false, write: false, root: undefined }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--self-test') args.selfTest = true
    else if (arg === '--write') args.write = true
    else if (arg === '--root' || arg.startsWith('--root=')) {
      if (args.root !== undefined) fail('--root given more than once')
      const value = arg === '--root' ? argv[i + 1] : arg.slice('--root='.length)
      // A transposed flag would otherwise be taken as the value.
      if (!value || value.startsWith('--')) fail('--root needs a directory value')
      args.root = value
      if (arg === '--root') i += 1
    } else fail(`unknown argument: ${arg}`)
  }
  return args
}

/**
 * The tree to check. An override may only point inside the system temp directory: with
 * `--write` this script rewrites every record it finds, so a root aimed at another
 * checkout would rewrite that checkout's records, and without it a green verdict would be
 * about a tree the caller did not mean. The guard is the one in `check-notes.mjs`, and
 * `lib/guard-cases.mjs` holds the cases every copy answers to.
 */
function resolveRoot(override) {
  if (override === undefined) return DEFAULT_ROOT
  const fail = (message) => {
    console.error(`[check-bilingual] ${message}`)
    process.exit(2)
  }
  let tmp
  try {
    tmp = realpathSync(tmpdir())
  } catch {
    // An environment fault, not a verdict on the tree.
    fail(`cannot resolve the temp directory: ${tmpdir()}`)
  }
  let real
  try {
    real = realpathSync(resolve(override))
  } catch {
    fail(`--root does not exist: ${resolve(override)}`)
  }
  // `relative` rather than a string prefix: it compares case-insensitively on Windows,
  // `..` is tested with its separator so a child named `..x` is not an escape, and an
  // absolute result is another drive.
  const rel = relative(tmp, real)
  if (rel !== '' && (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel))) {
    fail(`refusing --root outside the temp directory: ${real}`)
  }
  console.error(`[check-bilingual] root override: ${real}`)
  return real
}

const args = parseArgs(process.argv.slice(2))
const root = resolveRoot(args.root)
const write = args.write

/**
 * A path relative to the root, always with `/`. The record header is committed, so a
 * Windows separator would turn every `--write` there into a diff on every record.
 */
const repoPath = (file) => relative(root, file).split(sep).join('/')

/* ── self-test: fixtures in a temp tree, then this same script against it ────── */

async function selfTest() {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-pairing-'))
  const cases = []
  const fixture = (name, en, zh, rec) => {
    const box = join(dir, name)
    mkdirSync(box, { recursive: true })
    writeFileSync(join(box, 'X.md'), en)
    writeFileSync(join(box, 'X.zh.md'), zh)
    writeFileSync(join(box, 'X.i18n.yaml'), rec)
    return box
  }

  const cleanEn = '# Title\n\nEnglish body.\n'
  const cleanZh = '# 标题\n\n中文正文。\n'
  // The record covers every section, including the one before the first heading.
  const cleanRecord = [
    '"/":',
    `  en: ${bodyHash([])}`,
    `  zh: ${bodyHash([])}`,
    '"/title":',
    `  en: ${bodyHash(['', 'English body.', ''])}`,
    `  zh: ${bodyHash(['', '中文正文。', ''])}`,
  ].join('\n')
  fixture('clean', cleanEn, cleanZh, cleanRecord)
  cases.push(['a pair in step', 'clean', 0])

  fixture('drifted', cleanEn, '# 标题\n\n中文正文改过了。\n', cleanRecord)
  cases.push(['a section edited on one side only', 'drifted', 1])

  fixture('fence', '# Title\n\n```bash\nls\n```\n', '# 标题\n\n```bash\ndir\n```\n', cleanRecord)
  cases.push(['a translated code block', 'fence', 1])

  let failed = 0
  for (const [label, box, expected] of cases) {
    let code = 0
    try {
      execFileSync(process.execPath, [fileURLToPath(import.meta.url), '--root', join(dir, box)], { stdio: 'pipe' })
    } catch (error) {
      code = error.status ?? 1
    }
    const ok = code === expected
    if (!ok) failed += 1
    console.log(`  ${ok ? '✅' : '❌'} self-test: ${label} → exit ${code}, expected ${expected}`)
  }

  // A rewrite names a nested pair with `/`, whatever the platform's separator is.
  const nested = fixture(join('write', 'docs'), cleanEn, cleanZh, '')
  execFileSync(process.execPath, [fileURLToPath(import.meta.url), '--root', join(dir, 'write'), '--write'], { stdio: 'pipe' })
  const header = readFileSync(join(nested, 'X.i18n.yaml'), 'utf8').split('\n')[0]
  const posix = header.includes('docs/X.md ↔ docs/X.zh.md')
  if (!posix) failed += 1
  console.log(`  ${posix ? '✅' : '❌'} self-test: --write records a nested pair with / → ${header}`)
  const failures = []
  const spawnRoot = (argv, env) =>
    spawnSync(process.execPath, [fileURLToPath(import.meta.url), ...argv], { env: { ...process.env, ...env }, encoding: 'utf8' })
  const { runGuardCases } = await import('./lib/guard-cases.mjs')
  await runGuardCases({ spawnRoot, failures })
  for (const failure of failures) console.log(`  ❌ self-test: ${failure}`)
  failed += failures.length
  if (failures.length === 0) console.log('  ✅ self-test: the shared --root guard cases')

  console.log(failed === 0 ? '  ✅ check-bilingual self-test' : `  ❌ check-bilingual self-test: ${failed} case(s) wrong`)
  process.exit(failed === 0 ? 0 : 1)
}

/* ── the gate ───────────────────────────────────────────────────────────────── */

/** A relative markdown link to a paired document must name the `.zh.md` file. */
function linkLocaleProblems(zhFile, zhText) {
  const problems = []
  const dir = dirname(zhFile)
  // The switcher under the H1 is the one allowed cross-language link.
  const body = zhText.split('\n').slice(5).join('\n')
  for (const match of body.matchAll(/\]\(([^)#\s]+\.md)(#[^)]*)?\)/g)) {
    const target = match[1]
    if (/^[a-z]+:/i.test(target) || target.endsWith('.zh.md')) continue
    const absolute = resolve(root, dir, target)
    const counterpart = absolute.replace(/\.md$/, '.zh.md')
    if (existsSync(counterpart)) {
      problems.push(`${repoPath(zhFile)}: links ${target}, but the pair lives at ${repoPath(counterpart)}`)
    }
  }
  return problems
}

/** Discover every `X.md` with a sibling `X.zh.md`. */
function pairs() {
  const found = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue
        walk(join(dir, entry.name))
        continue
      }
      if (!entry.name.endsWith('.md') || entry.name.endsWith('.zh.md')) continue
      const full = join(dir, entry.name)
      const zh = full.replace(/\.md$/, '.zh.md')
      if (existsSync(zh)) found.push({ en: full, zh })
    }
  }
  walk(root)
  return found.sort((a, b) => a.en.localeCompare(b.en))
}

function main() {
  const problems = []
  let sectionCount = 0
  let pairCount = 0

  for (const pair of pairs()) {
    const enRel = repoPath(pair.en)
    const zhRel = repoPath(pair.zh)
    const recordFile = pair.en.replace(/\.md$/, '.i18n.yaml')
    const enText = readFileSync(pair.en, 'utf8')
    const zhText = readFileSync(pair.zh, 'utf8')
    const en = sections(enText)
    const zh = sections(zhText)
    pairCount += 1

    if (en.length !== zh.length) {
      problems.push(`${enRel} (${en.length} sections) and ${zhRel} (${zh.length}) lost their parallel structure`)
      continue
    }
    const levelMismatch = en.findIndex((section, index) => section.path.split('/').length !== zh[index].path.split('/').length)
    if (levelMismatch !== -1) {
      problems.push(`${zhRel}: heading level differs from ${enRel} at section #${levelMismatch + 1}`)
      continue
    }

    const enFences = fences(enText)
    const zhFences = fences(zhText)
    const fenceMismatch = enFences.findIndex((block, index) => block !== zhFences[index])
    if (enFences.length !== zhFences.length) {
      problems.push(`${zhRel}: ${zhFences.length} fenced block(s), ${enRel} has ${enFences.length} — code blocks are copied verbatim`)
    } else if (fenceMismatch !== -1) {
      problems.push(`${zhRel}: fenced block #${fenceMismatch + 1} differs from ${enRel} — code blocks are copied verbatim, comments included`)
    }

    problems.push(...linkLocaleProblems(pair.zh, zhText))

    const fresh = currentHashes(enText, zhText)
    sectionCount += en.length

    if (write) {
      const lines = [
        `# Bilingual-pair consistency record for ${enRel} ↔ ${zhRel}.`,
        '# Generated by `npm run bilingual:check -- --write`; never edit by hand.',
        "# Key = the English heading path; value = a hash of each side's body text",
        '# outside fenced code blocks. Editing either side alone changes its hash.',
      ]
      for (const [key, value] of fresh) lines.push(`"${key}":`, `  en: ${value.en}`, `  zh: ${value.zh}`)
      writeFileSync(recordFile, `${lines.join('\n')}\n`)
      continue
    }

    const record = readRecord(recordFile)
    const recordRel = repoPath(recordFile)
    if (record.size === 0) {
      problems.push(`${recordRel}: missing or empty; run npm run bilingual:check -- --write`)
      continue
    }
    for (const [key, value] of fresh) {
      const saved = record.get(key)
      if (saved === undefined) {
        problems.push(`${enRel}${key}: section is new on both sides (re-record)`)
        continue
      }
      if (saved.en !== value.en && saved.zh === value.zh) problems.push(`${enRel}${key}: the English side changed without the Chinese one`)
      if (saved.zh !== value.zh && saved.en === value.en) problems.push(`${zhRel}${key}: the Chinese side changed without the English one`)
    }
    for (const key of record.keys()) {
      if (!fresh.has(key)) problems.push(`${recordRel}${key}: recorded section no longer exists`)
    }
  }

  if (write) {
    console.log(`✅ bilingual records rewritten (${pairCount} pair(s), ${sectionCount} section(s))`)
    process.exit(0)
  }
  if (problems.length > 0) {
    console.log('  ❌ bilingual pairing:')
    for (const line of problems.slice(0, 12)) console.log(`     · ${line}`)
    if (problems.length > 12) console.log(`     …and ${problems.length - 12} more`)
    console.log('     fix: npm run zh:brief -- <stem> shows what moved, then re-record')
    process.exit(1)
  }
  console.log(`  ✅ bilingual pairs (${pairCount} pair(s), ${sectionCount} sections in step)`)
}

if (args.selfTest) await selfTest()
else main()
