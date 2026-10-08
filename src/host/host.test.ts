import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { compareIds, scanLibrary } from './library.ts'
import { resolveMediaPath, serveMedia } from './media.ts'
import { readNotes, writeNotes } from './notes.ts'

let root = ''

/** One episode folder with the files the study method expects. */
function episode(id: string, options: { audio?: string; en?: string; zh?: string; notes?: string } = {}): void {
  const folder = join(root, id)
  mkdirSync(folder, { recursive: true })
  if (options.audio !== undefined) writeFileSync(join(folder, options.audio), 'audio-bytes')
  if (options.en !== undefined) writeFileSync(join(folder, options.en), '1\n00:00:01,000 --> 00:00:02,000\nHi there')
  if (options.zh !== undefined) writeFileSync(join(folder, options.zh), '1\n00:00:01,000 --> 00:00:02,000\n你好')
  if (options.notes !== undefined) writeFileSync(join(folder, 'notes.md'), options.notes)
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'lingualab-test-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('compareIds', () => {
  it('orders by number, not by character', () => {
    expect(['S01E10', 'S01E2', 'S01E1'].sort(compareIds)).toEqual(['S01E1', 'S01E2', 'S01E10'])
  })
})

describe('scanLibrary', () => {
  it('reports a missing root instead of throwing', () => {
    const payload = scanLibrary(join(root, 'nope'))
    expect(payload.ok).toBe(false)
    expect(payload.reason).toBe('媒体目录不存在')
    expect(payload.episodes).toEqual([])
  })

  it('lists episodes in natural order with their files and notes summary', () => {
    episode('S01E10', { audio: 'audio.mp3', en: 'en.srt', zh: 'zh.srt' })
    episode('S01E2', {
      audio: 'episode.m4a',
      en: 'S01E02.en.srt',
      zh: 'S01E02.zh.srt',
      notes: '- [ ] 00:10 | Hello | 你好 | | #review\n',
    })

    const payload = scanLibrary(root)
    expect(payload.ok).toBe(true)
    expect(payload.episodes.map((entry) => entry.id)).toEqual(['S01E2', 'S01E10'])
    const first = payload.episodes[0]
    expect(first?.audio).toBe('episode.m4a')
    expect(first?.subtitleEn).toBe('S01E02.en.srt')
    expect(first?.subtitleZh).toBe('S01E02.zh.srt')
    expect(first?.notes).toEqual({ exists: true, count: 1, review: 1, hard: 0 })
    // The episode with no notes yet is the one offered first.
    expect(payload.current).toBe('S01E10')
  })

  it('treats a single CJK subtitle file as both tracks', () => {
    episode('S01E1', { audio: 'a.mp3' })
    mkdirSync(join(root, 'S01E1'), { recursive: true })
    writeFileSync(
      join(root, 'S01E1', '双语.srt'),
      '1\n00:00:01,000 --> 00:00:02,000\nHi there\n你好',
    )
    const entry = scanLibrary(root).episodes[0]
    expect(entry?.subtitleEn).toBe('双语.srt')
    expect(entry?.subtitleZh).toBe('双语.srt')
  })

  it('honours manifest order, titles and the current pointer', () => {
    episode('S01E1', { audio: 'a.mp3' })
    episode('S01E2', { audio: 'a.mp3' })
    writeFileSync(
      join(root, 'manifest.json'),
      JSON.stringify({ episodes: ['S01E2'], titles: { S01E2: 'The Bicycle Thief' }, current: 'S01E2' }),
    )

    const payload = scanLibrary(root)
    expect(payload.episodes.map((entry) => entry.id)).toEqual(['S01E2', 'S01E1'])
    expect(payload.episodes[0]?.title).toBe('The Bicycle Thief')
    expect(payload.current).toBe('S01E2')
  })

  it('survives a malformed manifest', () => {
    episode('S01E1', { audio: 'a.mp3' })
    writeFileSync(join(root, 'manifest.json'), '{ not json')
    expect(scanLibrary(root).ok).toBe(true)
  })
})

describe('resolveMediaPath', () => {
  it('accepts an episode file with a served extension', () => {
    expect(resolveMediaPath('/lib', '/S01E01/audio.mp3')).toBe('/lib/S01E01/audio.mp3')
  })

  it('refuses traversal, nesting and unknown extensions', () => {
    expect(resolveMediaPath('/lib', '/../etc/passwd')).toBeNull()
    expect(resolveMediaPath('/lib', '/S01E01/../../etc/passwd.mp3')).toBeNull()
    expect(resolveMediaPath('/lib', '/S01E01/notes.md')).toBeNull()
    expect(resolveMediaPath('/lib', '/S01E01/nested/audio.mp3')).toBeNull()
    expect(resolveMediaPath('/lib', '/%2e%2e/secret.mp3')).toBeNull()
  })
})

describe('serveMedia', () => {
  it('answers a range request with the requested slice', async () => {
    episode('S01E01', { audio: 'audio.mp3' })
    const server = createServer((req, res) => serveMedia(req, res, root, (req.url ?? '').split('?')[0] ?? ''))
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const port = (server.address() as AddressInfo).port
    try {
      const partial = await fetch(`http://127.0.0.1:${port}/S01E01/audio.mp3`, {
        headers: { range: 'bytes=0-4' },
      })
      expect(partial.status).toBe(206)
      expect(partial.headers.get('content-range')).toBe('bytes 0-4/11')
      expect(await partial.text()).toBe('audio')

      const whole = await fetch(`http://127.0.0.1:${port}/S01E01/audio.mp3`)
      expect(whole.status).toBe(200)
      expect(whole.headers.get('accept-ranges')).toBe('bytes')
      expect(await whole.text()).toBe('audio-bytes')

      const missing = await fetch(`http://127.0.0.1:${port}/S01E01/notes.md`)
      expect(missing.status).toBe(404)
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  })
})

describe('notes round-trip', () => {
  it('writes and reads back the phrases, keeping the preamble', () => {
    episode('S01E01', { audio: 'a.mp3' })
    const written = writeNotes(root, 'S01E01', [
      { at: 12, text: 'Hello there', zh: '你好', note: '开场', tags: ['review'], done: false },
    ])
    expect(written.ok).toBe(true)

    const read = readNotes(root, 'S01E01')
    expect(read.phrases).toHaveLength(1)
    expect(read.phrases[0]?.text).toBe('Hello there')
    expect(read.phrases[0]?.tags).toEqual(['review'])
  })

  it('refuses an eighth phrase and says why', () => {
    episode('S01E01', { audio: 'a.mp3' })
    const eight = Array.from({ length: 8 }, (_, index) => ({ at: index, text: `phrase ${index}` }))
    const result = writeNotes(root, 'S01E01', eight)
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('最多 7 条')
    // Nothing was written, so the file still does not exist.
    expect(readNotes(root, 'S01E01').phrases).toEqual([])
  })

  it('refuses an episode id that would escape the library', () => {
    expect(readNotes(root, '../etc').ok).toBe(false)
    expect(writeNotes(root, 'a/b', []).ok).toBe(false)
  })

  it('drops a malformed phrase rather than storing it', () => {
    episode('S01E01', { audio: 'a.mp3' })
    const result = writeNotes(root, 'S01E01', [{ at: 1, text: '  ' }, { nonsense: true }, { at: 2, text: 'kept' }])
    expect(result.phrases.map((phrase) => phrase.text)).toEqual(['kept'])
  })
})
