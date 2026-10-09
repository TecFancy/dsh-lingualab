/**
 * The import route's contract: it puts media in the library and does nothing else.
 *
 * The cases that matter are the ones where a careless implementation does damage — an
 * existing file replaced, a name that climbs out of the folder, an extension that is
 * not media, a symlinked episode folder that leads the write somewhere else, a body
 * that outgrows its ceiling — so each of those is pinned here, next to the happy path.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import type { IncomingMessage } from 'node:http'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MAX_IMPORT_BYTES } from '../shared/protocol.ts'
import { cleanName, importFile, importKind } from './import.ts'

let root = ''
let outside = ''

beforeEach(() => {
  root = join(mkdtempSync(join(tmpdir(), 'lingualab-import-')), 'media')
  outside = mkdtempSync(join(tmpdir(), 'lingualab-elsewhere-'))
})

afterEach(() => {
  rmSync(join(root, '..'), { recursive: true, force: true })
  rmSync(outside, { recursive: true, force: true })
})

/** A request body the way the route sees it: a readable stream standing in for `req`. */
function body(content: string | Buffer): IncomingMessage {
  return Readable.from([typeof content === 'string' ? Buffer.from(content) : content]) as unknown as IncomingMessage
}

describe('cleanName', () => {
  it('removes separators and control characters', () => {
    expect(cleanName('a/b\\c.mp3')).toBe('a_b_c.mp3')
    expect(cleanName('x\u0001y.srt')).toBe('x_y.srt')
  })

  it('refuses names that are only dots or nothing', () => {
    expect(cleanName('..')).toBeNull()
    expect(cleanName('   ')).toBeNull()
    expect(cleanName('...')).toBeNull()
  })

  it('strips leading dots, so a hidden name cannot be made', () => {
    expect(cleanName('.hidden.mp3')).toBe('hidden.mp3')
  })

  it('never yields a name that contains a separator or climbs a level', () => {
    for (const hostile of ['../../etc/passwd.mp3', '..\\..\\x.mp3', 'a/../b.mp3', '/abs/x.mp3']) {
      const cleaned = cleanName(hostile)
      expect(cleaned).not.toBeNull()
      expect(cleaned ?? '').not.toMatch(/[\\/]/)
      expect(cleaned ?? '').not.toBe('..')
      expect((cleaned ?? '').startsWith('.')).toBe(false)
    }
  })

  it('defuses the names Windows reserves', () => {
    expect(cleanName('CON.mp3')).toBe('_CON.mp3')
    expect(cleanName('lpt1')).toBe('_lpt1')
  })

  it('shortens a long name but keeps its extension', () => {
    const cleaned = cleanName(`${'a'.repeat(300)}.mp3`) ?? ''
    expect(cleaned.length).toBeLessThanOrEqual(120)
    expect(cleaned.endsWith('.mp3')).toBe(true)
  })
})

describe('importKind', () => {
  it('accepts exactly the media the scan accepts', () => {
    expect(importKind('a.MP3')).toBe('audio')
    expect(importKind('a.flac')).toBe('audio')
    expect(importKind('a.srt')).toBe('subtitle')
    expect(importKind('a.vtt')).toBe('subtitle')
    expect(importKind('a.exe')).toBeNull()
    expect(importKind('a.html')).toBeNull()
    expect(importKind('noextension')).toBeNull()
  })
})

describe('importFile', () => {
  it('creates the media folder and the episode folder, and saves the bytes', async () => {
    expect(existsSync(root)).toBe(false)
    const result = await importFile({ root, episode: 'S01E01', file: 'audio.mp3', declaredBytes: 5 }, body('hello'))

    expect(result).toMatchObject({ ok: true, code: 'saved', episode: 'S01E01', file: 'audio.mp3', bytes: 5 })
    expect(readFileSync(join(root, 'S01E01', 'audio.mp3'), 'utf8')).toBe('hello')
  })

  it('names the folder after the file when none is given', async () => {
    const result = await importFile({ root, episode: '', file: 'The Bicycle Thief.mp3', declaredBytes: null }, body('x'))
    expect(result.episode).toBe('The Bicycle Thief')
    expect(existsSync(join(root, 'The Bicycle Thief', 'The Bicycle Thief.mp3'))).toBe(true)
  })

  it('puts an audio file and its subtitles in the same folder', async () => {
    await importFile({ root, episode: 'E1', file: 'a.mp3', declaredBytes: null }, body('audio'))
    await importFile({ root, episode: 'E1', file: 'a.srt', declaredBytes: null }, body('1\n00:00:00,000 --> 00:00:01,000\nHi\n'))
    expect(readdirSync(join(root, 'E1')).sort()).toEqual(['a.mp3', 'a.srt'])
  })

  it('never overwrites an existing file, and reports that it did not', async () => {
    mkdirSync(join(root, 'E1'), { recursive: true })
    writeFileSync(join(root, 'E1', 'a.mp3'), 'original')

    const result = await importFile({ root, episode: 'E1', file: 'a.mp3', declaredBytes: null }, body('replacement'))

    expect(result).toMatchObject({ ok: true, code: 'exists', bytes: 0 })
    expect(readFileSync(join(root, 'E1', 'a.mp3'), 'utf8')).toBe('original')
  })

  it('refuses a file that is not audio or a subtitle, and writes nothing', async () => {
    const result = await importFile({ root, episode: 'E1', file: 'run.exe', declaredBytes: null }, body('MZ'))
    expect(result).toMatchObject({ ok: false, code: 'refused' })
    expect(existsSync(join(root, 'E1'))).toBe(false)
  })

  it('refuses when there is no media folder to put anything in', async () => {
    const result = await importFile({ root: '', episode: 'E1', file: 'a.mp3', declaredBytes: null }, body('x'))
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('媒体目录')
  })

  it('cannot be led out of the library by the folder name', async () => {
    const result = await importFile({ root, episode: '../../escape', file: 'a.mp3', declaredBytes: null }, body('x'))
    // Whatever it is cleaned to, it lands inside the root or not at all.
    if (result.ok) {
      expect(readdirSync(root).length).toBeGreaterThan(0)
      expect(existsSync(join(root, '..', '..', 'escape'))).toBe(false)
    }
    expect(existsSync(join(outside, 'a.mp3'))).toBe(false)
  })

  it('refuses a folder that is a symlink pointing outside the library', async () => {
    mkdirSync(root, { recursive: true })
    try {
      symlinkSync(outside, join(root, 'E9'), 'junction')
    } catch {
      return
    }
    const result = await importFile({ root, episode: 'E9', file: 'a.mp3', declaredBytes: null }, body('x'))
    expect(result).toMatchObject({ ok: false, code: 'refused' })
    expect(existsSync(join(outside, 'a.mp3'))).toBe(false)
  })

  it('refuses an episode name that is already a regular file', async () => {
    mkdirSync(root, { recursive: true })
    writeFileSync(join(root, 'E2'), 'not a folder')
    const result = await importFile({ root, episode: 'E2', file: 'a.mp3', declaredBytes: null }, body('x'))
    expect(result.ok).toBe(false)
  })

  it('refuses a declared size over the ceiling before reading the body', async () => {
    const result = await importFile(
      { root, episode: 'E1', file: 'a.mp3', declaredBytes: MAX_IMPORT_BYTES + 1 },
      body('x'),
    )
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('太大')
    expect(existsSync(join(root, 'E1', 'a.mp3'))).toBe(false)
  })

  it('refuses an empty body rather than saving a zero-byte file', async () => {
    const result = await importFile({ root, episode: 'E1', file: 'a.mp3', declaredBytes: 0 }, body(Buffer.alloc(0)))
    expect(result.ok).toBe(false)
    expect(existsSync(join(root, 'E1', 'a.mp3'))).toBe(false)
  })

  it('keeps exactly one writer when the same name arrives many times at once', async () => {
    // These share a process, so a temporary name derived from the pid would be shared too
    // and one request would lose its file mid-rename. Every answer must still be an answer.
    const answers = await Promise.all(
      Array.from({ length: 12 }, (_, index) =>
        importFile({ root, episode: 'RACE', file: 'r.mp3', declaredBytes: null }, body(`writer-${String(index)}`)),
      ),
    )

    expect(answers.every((answer) => answer.ok)).toBe(true)
    expect(answers.filter((answer) => answer.code === 'saved')).toHaveLength(1)
    expect(answers.filter((answer) => answer.code === 'exists')).toHaveLength(11)
    // One file, and no temporary leftovers beside it.
    expect(readdirSync(join(root, 'RACE'))).toEqual(['r.mp3'])
    expect(readFileSync(join(root, 'RACE', 'r.mp3'), 'utf8')).toMatch(/^writer-\d+$/)
  })

  it('defuses a colon, so an NTFS alternate data stream cannot be named', async () => {
    const result = await importFile({ root, episode: 'E1', file: 'a.mp3:hidden.mp3', declaredBytes: null }, body('x'))
    expect(result.ok).toBe(true)
    expect(result.file).not.toContain(':')
    expect(readdirSync(join(root, 'E1'))).toEqual([result.file])
  })

  it('treats names differing only by case as the same file where the filesystem does', async () => {
    await importFile({ root, episode: 'E1', file: 'a.mp3', declaredBytes: null }, body('first'))
    const again = await importFile({ root, episode: 'E1', file: 'A.MP3', declaredBytes: null }, body('second'))

    if (process.platform === 'linux') {
      expect(again.code).toBe('saved')
    } else {
      expect(again.code).toBe('exists')
      expect(readFileSync(join(root, 'E1', 'a.mp3'), 'utf8')).toBe('first')
    }
  })

  it('leaves no half-written file when the upload is cut off', async () => {
    const broken = new Readable({
      read() {
        this.push(Buffer.from('partial'))
        this.destroy(new Error('connection reset'))
      },
    }) as unknown as IncomingMessage

    const result = await importFile({ root, episode: 'E1', file: 'a.mp3', declaredBytes: null }, broken)

    expect(result.ok).toBe(false)
    expect(existsSync(join(root, 'E1', 'a.mp3'))).toBe(false)
    expect(readdirSync(join(root, 'E1'))).toEqual([])
  })
})
