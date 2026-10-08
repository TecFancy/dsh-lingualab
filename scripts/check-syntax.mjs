#!/usr/bin/env node
/**
 * Both bundles must parse.
 *
 * `lib/client.js` is not a module: it is a classic script whose wrapper calls
 * `window.__ModuleLoader__.load`. A syntax error in it is invisible until the page
 * loads and the row never appears, and `npm run build` will happily emit it. So
 * the artifact is parsed here with the same parser the browser would use.
 *
 * Usage: node scripts/check-syntax.mjs
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARTIFACTS = ['lib/index.js', 'lib/client.js']
const problems = []

for (const artifact of ARTIFACTS) {
  const path = join(root, artifact)
  if (!existsSync(path)) {
    problems.push(`${artifact} 不存在，先跑 npm run build`)
    continue
  }
  try {
    execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' })
  } catch (error) {
    const detail = String(error.stderr ?? error.message).trim().split('\n').slice(0, 2).join(' ')
    problems.push(`${artifact} 解析失败：${detail}`)
  }
}

if (problems.length > 0) {
  console.error('❌ check-syntax：')
  for (const problem of problems) console.error(`   · ${problem}`)
  process.exit(1)
}
console.log(`✅ check-syntax — ${ARTIFACTS.join('、')} 都能解析`)
