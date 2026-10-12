/**
 * The import route's contract: it puts media in the library and does nothing else.
 *
 * The cases that matter are the ones where a careless implementation does damage — an
 * existing file replaced, a name that climbs out of the folder, an extension that is
 * not media, a symlinked episode folder that leads the write somewhere else, a body
 * that outgrows its ceiling — so each of those is pinned here, next to the happy path.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from 'node:fs'
import { join, parse } from 'node:path'
import { PassThrough, Readable } from 'node:stream'
import type { IncomingMessage } from 'node:http'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MAX_IMPORT_BYTES } from '../../../../shared/protocol.ts'
import { scanLibrary } from '../../../entities/episode/index.ts'
import { makeTempDir } from '../../../shared/testing/index.ts'
import { MAX_CONCURRENT_IMPORTS, cleanName, importFile, importKind } from './import.ts'

let root = ''
let outside = ''

beforeEach(() => {
  root = join(makeTempDir('lingualab-import-'), 'media')
  outside = makeTempDir('lingualab-elsewhere-')
})

afterEach(() => {
  rmSync(join(root, '..'), { recursive: true, force: true })
  rmSync(outside, { recursive: true, force: true })
})

/** A request body the way the route sees it: a readable stream standing in for `req`. */
function body(content: string | Buffer): IncomingMessage {
  return Readable.from([typeof content === 'string' ? Buffer.from(content) : content]) as unknown as IncomingMessage
}

/**
 * A request body the test finishes by hand.
 *
 * Holds an import open for as long as the test wants, so a slot stays taken, or a
 * temporary file stays on disk, while the test looks at the world around it.
 */
function hanging(): { stream: IncomingMessage; push: (text: string) => void; finish: (text: string) => void } {
  const pass = new PassThrough()
  return {
    stream: pass as unknown as IncomingMessage,
    push: (text) => void pass.write(Buffer.from(text)),
    finish: (text) => (text.length > 0 ? pass.end(Buffer.from(text)) : pass.end()),
  }
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

  it('keeps exactly one writer when the same name arrives at once, up to the concurrency cap', async () => {
    // These share a process, so a temporary name derived from the pid would be shared too
    // and one request would lose its file mid-rename. Every answer must still be an answer.
    const answers = await Promise.all(
      Array.from({ length: MAX_CONCURRENT_IMPORTS }, (_, index) =>
        importFile({ root, episode: 'RACE', file: 'r.mp3', declaredBytes: null }, body(`writer-${String(index)}`)),
      ),
    )

    expect(answers.every((answer) => answer.ok)).toBe(true)
    expect(answers.filter((answer) => answer.code === 'saved')).toHaveLength(1)
    expect(answers.filter((answer) => answer.code === 'exists')).toHaveLength(MAX_CONCURRENT_IMPORTS - 1)
    // One file, and no temporary leftovers beside it.
    expect(readdirSync(join(root, 'RACE'))).toEqual(['r.mp3'])
    expect(readFileSync(join(root, 'RACE', 'r.mp3'), 'utf8')).toMatch(/^writer-\d+$/)
  })

  it('pins the cap at two, so it cannot be raised without this test saying so', () => {
    // The tests below take their counts from the constant, which means they would follow it
    // upwards. Writing the number down here is what makes raising it a visible decision.
    expect(MAX_CONCURRENT_IMPORTS).toBe(2)
  })

  it('answers "busy" beyond the cap instead of queueing a disk-filling pile of writers', async () => {
    // Bodies that never finish hold their slots, so the next request meets a full house.
    const stuck = Array.from({ length: 2 }, () => hanging())
    const holding = stuck.map((handle, index) =>
      importFile({ root, episode: `HELD${String(index)}`, file: 'a.mp3', declaredBytes: null }, handle.stream),
    )
    await new Promise((resolve) => setTimeout(resolve, 30))

    const over = await importFile({ root, episode: 'OVER', file: 'a.mp3', declaredBytes: null }, body('x'))
    expect(over).toMatchObject({ ok: false, code: 'refused' })
    expect(over.reason).toContain('稍后')
    expect(existsSync(join(root, 'OVER'))).toBe(false)

    // Releasing the held ones frees the slots again.
    for (const handle of stuck) handle.finish('done')
    await Promise.all(holding)
    const after = await importFile({ root, episode: 'AFTER', file: 'a.mp3', declaredBytes: null }, body('x'))
    expect(after.code).toBe('saved')
  })

  it('stops a chunked body that outgrows the ceiling even with no declared length', async () => {
    // The route trusts no content-length: this is the streaming limit doing its job.
    const result = await importFile(
      { root, episode: 'BIG', file: 'a.mp3', declaredBytes: null, maxBytes: 8 },
      body('0123456789abcdef'),
    )
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('太大')
    // Nothing that looks like the file, and no folder left behind for it.
    expect(existsSync(join(root, 'BIG'))).toBe(false)
  })

  it('accepts a body that is exactly at the ceiling', async () => {
    const result = await importFile({ root, episode: 'EDGE', file: 'a.mp3', declaredBytes: null, maxBytes: 8 }, body('01234567'))
    expect(result.code).toBe('saved')
  })

  it('refuses a media folder that is a system folder, and creates nothing in it', async () => {
    // A path under the system folder that does not exist and that nothing here creates: if
    // the guard ever stops working, the test fails on the answer rather than by writing
    // into a real operating-system directory to find out. (An earlier version of this test
    // used a real one, and a mutated guard did put a file in C:\Windows.)
    const system =
      process.platform === 'win32'
        ? join(parse(root).root, 'Windows', 'no-such-folder', 'lingualab-test')
        : '/etc/no-such-folder/lingualab-test'
    // Only the answer is checked; the existence check below is on a path whose parent does
    // not exist, so a leak would fail to create anything rather than succeed.
    const result = await importFile({ root: system, episode: 'E1', file: 'a.mp3', declaredBytes: null }, body('x'))
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('系统')
    expect(existsSync(system)).toBe(false)
  })

  it('sweeps a stale temporary file left by a crashed upload, and leaves a fresh one alone', async () => {
    mkdirSync(join(root, 'E1'), { recursive: true })
    const stale = join(root, 'E1', '.old.mp3.deadbeef.part')
    const fresh = join(root, 'E1', '.new.mp3.cafef00d.part')
    const bystander = join(root, 'E1', '.keep-me')
    for (const path of [stale, fresh, bystander]) writeFileSync(path, 'x')
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    utimesSync(stale, twoHoursAgo, twoHoursAgo)
    utimesSync(bystander, twoHoursAgo, twoHoursAgo)

    await importFile({ root, episode: 'E1', file: 'a.mp3', declaredBytes: null }, body('x'))

    expect(existsSync(stale)).toBe(false)
    expect(existsSync(fresh)).toBe(true)
    // Only this module's own temporary names are ever touched, however old.
    expect(existsSync(bystander)).toBe(true)
  })

  it('keeps the temporary file invisible to the library scan while an upload is running', async () => {
    const stuck = hanging()
    const running = importFile({ root, episode: 'LIVE', file: 'a.mp3', declaredBytes: null }, stuck.stream)
    stuck.push('half of an episode')
    await new Promise((resolve) => setTimeout(resolve, 60))

    // The temporary file exists on disk, and the scan reports no audio in the folder.
    expect(readdirSync(join(root, 'LIVE')).some((name) => name.endsWith('.part'))).toBe(true)
    const listing = scanLibrary(root)
    expect(listing.episodes.find((entry) => entry.id === 'LIVE')?.audio ?? null).toBeNull()

    stuck.finish('')
    await running
  })

  it('removes the episode folder it created when nothing could be put in it', async () => {
    const result = await importFile({ root, episode: 'EMPTYTRY', file: 'a.mp3', declaredBytes: 0 }, body(''))
    expect(result.ok).toBe(false)
    expect(existsSync(join(root, 'EMPTYTRY'))).toBe(false)
  })

  it('does not remove a folder that already existed, even when the upload fails', async () => {
    mkdirSync(join(root, 'KEEP'), { recursive: true })
    const result = await importFile({ root, episode: 'KEEP', file: 'a.mp3', declaredBytes: 0 }, body(''))
    expect(result.ok).toBe(false)
    expect(existsSync(join(root, 'KEEP'))).toBe(true)
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
    // Neither the file, nor its temporary half, nor the folder this request made for it.
    expect(existsSync(join(root, 'E1'))).toBe(false)
  })

  it('leaves an existing folder with its contents when a later upload into it is cut off', async () => {
    mkdirSync(join(root, 'E1'), { recursive: true })
    writeFileSync(join(root, 'E1', 'first.mp3'), 'kept')
    const broken = new Readable({
      read() {
        this.push(Buffer.from('partial'))
        this.destroy(new Error('connection reset'))
      },
    }) as unknown as IncomingMessage

    const result = await importFile({ root, episode: 'E1', file: 'second.mp3', declaredBytes: null }, broken)

    expect(result.ok).toBe(false)
    expect(readdirSync(join(root, 'E1'))).toEqual(['first.mp3'])
  })
})
