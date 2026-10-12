/**
 * The library's progress file: where it lives, that a second writer merges instead of
 * overwriting, and that a damaged file never takes the plugin down.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PROGRESS_FILE } from '../../../../shared/protocol.ts'
import { makeTempDir } from '../../../shared/testing/index.ts'
import { progressPath, readProgressFile, writeProgressFile } from './progress.ts'

let root = ''

beforeEach(() => {
  root = makeTempDir('lingualab-progress-')
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

const body = (at: number, updatedAt: number, id = 'E1') => ({ progress: { [id]: { at, duration: 600, updatedAt } }, steps: {} })

describe('the progress file', () => {
  it('starts empty, and says so without calling it a problem', () => {
    const read = readProgressFile(root)
    expect(read.ok).toBe(true)
    expect(read.table.progress).toEqual({})
  })

  it('is a hidden file, so the library scan never mistakes it for material', () => {
    expect(PROGRESS_FILE.startsWith('.')).toBe(true)
    expect(progressPath(root)).toBe(join(root, PROGRESS_FILE))
  })

  it('keeps what one device wrote for the next to read', () => {
    writeProgressFile(root, body(120, Date.now()))
    expect(readProgressFile(root).table.progress.E1?.at).toBe(120)
  })

  it('merges a second device\'s write instead of replacing the first', () => {
    const now = Date.now()
    writeProgressFile(root, body(100, now, 'E1'))
    const afterSecond = writeProgressFile(root, body(30, now, 'E2'))
    expect(Object.keys(afterSecond.table.progress).sort()).toEqual(['E1', 'E2'])
  })

  it('lets the newer stop win in both directions', () => {
    const now = Date.now()
    writeProgressFile(root, body(100, now))
    expect(writeProgressFile(root, body(10, now - 5000)).table.progress.E1?.at).toBe(100)
    expect(writeProgressFile(root, body(200, now + 5000)).table.progress.E1?.at).toBe(200)
  })

  it('does not rewrite the file when nothing in the body was newer', () => {
    const now = Date.now()
    writeProgressFile(root, body(100, now))
    const before = readFileSync(progressPath(root), 'utf8')
    writeProgressFile(root, body(1, now - 1))
    expect(readFileSync(progressPath(root), 'utf8')).toBe(before)
  })

  it('leaves no temporary file behind', () => {
    writeProgressFile(root, body(100, Date.now()))
    expect(readdirSync(root).filter((name) => name.endsWith('.tmp'))).toEqual([])
  })

  it('reads a corrupt file as empty rather than throwing, and a later write repairs it', () => {
    writeFileSync(progressPath(root), '{ not json')
    expect(readProgressFile(root).table.progress).toEqual({})
    writeProgressFile(root, body(100, Date.now()))
    expect(readProgressFile(root).table.progress.E1?.at).toBe(100)
  })

  it('drops junk from a hand-written body before it reaches the disk', () => {
    writeProgressFile(root, { progress: { E1: { at: 'x' }, E2: { at: 5, duration: 10, updatedAt: Date.now() } }, steps: 5 })
    expect(Object.keys(readProgressFile(root).table.progress)).toEqual(['E2'])
  })

  it('reports a missing library instead of writing into the wrong place', () => {
    const missing = join(root, 'nope')
    const result = writeProgressFile(missing, body(100, Date.now()))
    expect(result.ok).toBe(false)
    expect(existsSync(missing)).toBe(false)
    expect(readProgressFile('').ok).toBe(false)
  })

  it('works in a library that already has episode folders', () => {
    mkdirSync(join(root, 'S01E01'))
    writeProgressFile(root, body(100, Date.now()))
    expect(readdirSync(root).sort()).toEqual([PROGRESS_FILE, 'S01E01'].sort())
  })
})
