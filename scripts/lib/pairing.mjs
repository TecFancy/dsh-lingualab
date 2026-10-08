/**
 * Shared pairing primitives for the bilingual gate and the change briefing.
 *
 * A pair is `<stem>.md` (English) plus `<stem>.zh.md` (Chinese) and a record in
 * `<stem>.i18n.yaml`. Both tools must agree on what a "section" is and how its
 * body is hashed, so the logic lives here once.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'

/** GitHub-style heading slug; keeps letters and digits, collapses the rest. */
export const slug = (text) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

/** Split a markdown file into ordered sections, ignoring headings inside fences. */
export function sections(text) {
  const out = []
  const stack = []
  let fenced = false
  let current = { path: '/', body: [] }
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced
    const heading = fenced ? null : /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading === null) {
      current.body.push(line)
      continue
    }
    out.push(current)
    const level = heading[1].length
    stack.length = level - 1
    stack[level - 1] = slug(heading[2])
    current = { path: '/' + stack.filter(Boolean).join('/'), body: [] }
  }
  out.push(current)
  return out
}

/** Fenced code blocks, verbatim and in order. */
export function fences(text) {
  const blocks = []
  let open = null
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      if (open === null) open = [line]
      else {
        open.push(line)
        blocks.push(open.join('\n'))
        open = null
      }
      continue
    }
    if (open !== null) open.push(line)
  }
  return blocks
}

/** Hash a section body with fenced code blocks removed: code is language-neutral. */
export function bodyHash(lines) {
  const kept = []
  let fenced = false
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced
      continue
    }
    if (!fenced) kept.push(line)
  }
  return createHash('sha256').update(kept.join('\n').replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 16)
}

/** Read `<stem>.i18n.yaml` into a Map of section path to `{ en, zh }` hashes. */
export function readRecord(file) {
  if (!existsSync(file)) return new Map()
  const record = new Map()
  let key = null
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const head = /^"(.+)":\s*$/.exec(line)
    if (head !== null) {
      key = head[1]
      record.set(key, {})
      continue
    }
    const entry = /^\s+(en|zh):\s*(\S+)\s*$/.exec(line)
    if (entry !== null && key !== null) record.get(key)[entry[1]] = entry[2]
  }
  return record
}

/** Compute the current `{ en, zh }` hash for every section of a pair. */
export function currentHashes(enText, zhText) {
  const en = sections(enText)
  const zh = sections(zhText)
  const fresh = new Map()
  for (let index = 0; index < Math.min(en.length, zh.length); index += 1) {
    fresh.set(en[index].path, { en: bodyHash(en[index].body), zh: bodyHash(zh[index].body) })
  }
  return fresh
}
