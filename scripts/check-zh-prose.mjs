#!/usr/bin/env node
/**
 * Chinese prose gate — the mechanical half of `docs/i18n/prose-rules.md`.
 *
 * It checks what a machine can check: punctuation width, quoting style,
 * mixed-script spacing, digit width, second person, proper-noun casing, and the
 * 「不要译作」 column of the terminology table. It cannot read, so a green run
 * means the mechanics hold, not that the prose is good — that stays with review.
 *
 * Usage: node scripts/check-zh-prose.mjs
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const rootAt = argv.indexOf('--root')
const root = rootAt === -1 ? DEFAULT_ROOT : argv[rootAt + 1]
const SKIP_DIRS = new Set(['.git', 'node_modules', '.claude'])
/** The terminology table is exempt: its 「不要译作」 column is a list of forbidden strings. */
const SKIP_FILES = new Set(['docs/i18n/terminology.md'])
const CJK = '\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff'

const violations = []

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.agents') {
      if (entry.isDirectory()) continue
    }
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(full)
      continue
    }
    if (!entry.name.endsWith('.md')) continue
    const rel = relative(root, full)
    if (SKIP_FILES.has(rel)) continue
    check(full, rel)
  }
}

/**
 * Replace code spans, link targets and URLs with same-length filler so columns stay
 * meaningful. The filler is a private-use character on purpose: a Latin filler (`X`)
 * would itself create CJK/Latin adjacency and report violations that are not there.
 */
const FILLER = '\uE000'
function mask(line) {
  return line
    .replace(/`[^`]*`/g, (m) => FILLER.repeat(m.length))
    .replace(/\]\([^)]*\)/g, (m) => FILLER.repeat(m.length))
    .replace(/https?:\/\/\S+/g, (m) => FILLER.repeat(m.length))
    .replace(/<[^>]+>/g, (m) => FILLER.repeat(m.length))
}

const RULES = [
  {
    id: '标点',
    // A half-width mark may not follow Chinese — unless it belongs to a Latin token
    // (`.agents`, `README.md`), which is that token's own punctuation.
    find: (line) => new RegExp(`[${CJK}]\\s*[,.;:?!()](?![A-Za-z0-9])`, 'u').exec(line),
    hint: '中文后面用全角标点：，。：；？！（）',
  },
  {
    id: '标点',
    // Straight quotes are fine around an English fragment; they are not fine around Chinese.
    find: (line) => {
      const quoted = new RegExp(`"([^"]*[${CJK}][^"]*)"`, 'u').exec(line)
      if (quoted !== null) return quoted
      // Only a quote flush against Chinese is the defect; an English fragment keeps
      // its own straight quotes (`"Know the risks!"`).
      return new RegExp(`[${CJK}]"|"[${CJK}]`, 'u').exec(line)
    },
    hint: '中文里用「」引，直引号只属于代码或英文片段',
  },
  {
    id: '标点',
    find: (line) => new RegExp(`[${CJK}]\\s+[，。：；？！、）」]`, 'u').exec(line),
    hint: '全角标点前面不要空格',
  },
  {
    id: '空格',
    find: (line) => new RegExp(`[${CJK}][A-Za-z0-9]`, 'u').exec(line),
    hint: '中文与拉丁字母/数字之间要有一个半角空格',
  },
  {
    id: '空格',
    find: (line) => new RegExp(`[A-Za-z0-9][${CJK}]`, 'u').exec(line),
    hint: '拉丁字母/数字与中文之间要有一个半角空格',
  },
  {
    id: '空格',
    find: (line) => new RegExp(`[${CJK}]\\s{2,}[A-Za-z0-9]`, 'u').exec(line),
    hint: '中英之间只要一个空格',
  },
  { id: '数字', find: (line) => /[０-９]/u.exec(line), hint: '用半角数字：123，不是 １２３' },
  { id: '语声', find: (line) => /您/u.exec(line), hint: '第二人称用「你」' },
  { id: '术语', find: (line) => /\b(github|Github)\b(?![\w-])/u.exec(line), hint: '专有名词保持官方大小写：GitHub' },
  { id: '术语', find: (line) => /\b(typescript|Typescript)\b(?![\w-])/u.exec(line), hint: '专有名词保持官方大小写：TypeScript' },
  { id: '术语', find: (line) => /\b(deepseek|Deepseek)\b(?![\w-])/u.exec(line), hint: '专有名词保持官方大小写：DeepSeek' },
]

/** Forbidden renderings, read out of the terminology table's 「不要译作」 column (cell 4). */
function forbiddenTerms() {
  const file = join(root, 'docs/i18n/terminology.md')
  const terms = []
  // A tree under test may not carry the table; an absent table forbids nothing.
  if (!existsSync(file)) return terms
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line.startsWith('|')) continue
    const cells = line.split('|').map((cell) => cell.trim())
    // | 术语 | 用法 | 不要译作 | 备注 |  → cells[3] is the forbidden column
    if (cells.length < 6 || cells[3] === '不要译作' || /^-+$/.test(cells[3])) continue
    for (const term of cells[3].split(/[／、,]/).map((part) => part.trim())) {
      // A parenthesised caveat such as 「口语可」 is not a forbidden string.
      if (term.length >= 2 && !/[（(].*[）)]/u.test(term) && !/^[\s—]*$/u.test(term)) terms.push(term)
    }
  }
  return terms
}

const FORBIDDEN = forbiddenTerms()

function check(full, rel) {
  const lines = readFileSync(full, 'utf8').split('\n')
  let fenced = false
  let inFrontmatter = false

  lines.forEach((raw, index) => {
    if (/^---\s*$/.test(raw) && index < 5) inFrontmatter = !inFrontmatter
    if (/^\s*(```|~~~)/.test(raw)) {
      fenced = !fenced
      return
    }
    if (fenced || inFrontmatter) return
    if (!new RegExp(`[${CJK}]`, 'u').test(raw)) return

    const line = mask(raw)
    for (const rule of RULES) {
      const hit = rule.find(line)
      if (hit === null) continue
      violations.push({
        rel,
        line: index + 1,
        id: rule.id,
        hint: rule.hint,
        snippet: raw.trim().slice(Math.max(0, hit.index - 12), hit.index + 24),
      })
    }
    for (const term of FORBIDDEN) {
      // Matched literally. The table is what keeps this honest: an entry that is a
      // substring of a legitimate word (a single character, say) does not belong in
      // the forbidden column in the first place.
      if (!line.includes(term)) continue
      violations.push({ rel, line: index + 1, id: '术语', hint: `「${term}」在术语表的「不要译作」列里`, snippet: raw.trim().slice(0, 40) })
    }
  })
}

/**
 * Prove the gate still bites. Each case is a throwaway tree that this same
 * script is re-run against, so the assertion covers the real code path rather
 * than a copy of the rules.
 */
function selfTest() {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-zh-prose-'))
  const cases = []

  const fixture = (name, files) => {
    const box = join(dir, name)
    mkdirSync(box, { recursive: true })
    for (const [rel, body] of Object.entries(files)) {
      mkdirSync(dirname(join(box, rel)), { recursive: true })
      writeFileSync(join(box, rel), body)
    }
    return box
  }

  fixture('clean', { 'a.md': '# 标题\n\n这是一段干净的中文，标点全角，中英之间有一个空格。\n' })
  cases.push(['clean Chinese prose', 'clean', 0])

  fixture('punct', { 'a.md': '# 标题\n\n这句话里用了半角逗号,所以应该被拦下。\n' })
  cases.push(['a half-width comma after Chinese', 'punct', 1])

  fixture('term', {
    'a.md': '# 标题\n\n这道关卡会拦住提交。\n',
    'docs/i18n/terminology.md': '| 术语 | 用法 | 不要译作 | 备注 |\n|---|---|---|---|\n| gate | 门禁 | 关卡 | |\n',
  })
  cases.push(['a rendering the terminology table forbids', 'term', 1])

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
  console.log(failed === 0 ? '  ✅ check-zh-prose self-test' : `  ❌ check-zh-prose self-test: ${failed} case(s) wrong`)
  process.exit(failed === 0 ? 0 : 1)
}

if (argv.includes('--self-test')) selfTest()

walk(root)

if (violations.length > 0) {
  console.log(`  ❌ 中文写作规范：${violations.length} 处`)
  const byFile = new Map()
  for (const item of violations) {
    if (!byFile.has(item.rel)) byFile.set(item.rel, [])
    byFile.get(item.rel).push(item)
  }
  for (const [rel, items] of byFile) {
    console.log(`     ${rel}`)
    for (const item of items.slice(0, 6)) console.log(`       ${item.line}:${item.id} ${item.hint}  ← ${item.snippet}`)
    if (items.length > 6) console.log(`       …另有 ${items.length - 6} 处`)
  }
  console.log('     规范见 docs/i18n/prose-rules.md，术语表见 docs/i18n/terminology.md')
  process.exit(1)
}
console.log('  ✅ 中文写作规范（标点／空格／数字／语声／术语）')
