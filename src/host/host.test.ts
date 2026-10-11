import { createServer } from 'node:http'
import { mkdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MAX_PHRASES } from '../shared/notes-format.ts'
import { compareIds, scanLibrary } from './library.ts'
import { resolveMediaPath, serveMedia } from './media.ts'
import { readNotes, writeNotes } from './notes.ts'
import {
  EMPTY_STATE,
  fileEpisodeIdFor,
  withCurrent,
  withNotes,
  withOpenedFile,
  type FileEpisodeRecord,
  type OpenState,
} from './state.ts'
import { makeTempDir } from './test-dir.ts'
import { listenForFetch } from './test-listen.ts'

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
  root = makeTempDir('lingualab-test-')
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

describe('scanLibrary loose files', () => {
  /** A loose audio file in the library root, with optional subtitles beside it. */
  function loose(name = 'podcast.mp3', options: { en?: string; zh?: string } = {}): string {
    writeFileSync(join(root, name), 'audio-bytes')
    if (options.en !== undefined) writeFileSync(join(root, options.en), '1\n00:00:01,000 --> 00:00:02,000\nHi')
    if (options.zh !== undefined) writeFileSync(join(root, options.zh), '1\n00:00:01,000 --> 00:00:02,000\n你好')
    return fileEpisodeIdFor(realpathSync(join(root, name)))
  }

  it('lists them separately from the episodes, with their subtitles paired', () => {
    episode('S01E01', { audio: 'a.mp3' })
    const id = loose('podcast.mp3', { en: 'podcast.en.srt', zh: 'podcast.zh.srt' })

    const payload = scanLibrary(root)
    expect(payload.ok).toBe(true)
    // The manifest orders episodes; a loose file has no place in that order.
    expect(payload.episodes.map((entry) => entry.id)).toEqual(['S01E01'])
    expect(payload.files).toHaveLength(1)

    const file = payload.files[0]
    expect(file?.id).toBe(id)
    expect(file?.kind).toBe('file')
    expect(file?.title).toBe('podcast')
    expect(file?.audio).toBe('podcast.mp3')
    expect(file?.audioBytes).toBe(11)
    expect(file?.subtitleEn).toBe('podcast.en.srt')
    expect(file?.subtitleZh).toBe('podcast.zh.srt')
    expect(file?.source).toBe(join(root, 'podcast.mp3'))
  })

  it('ignores folders-as-files, hidden files and other extensions', () => {
    mkdirSync(join(root, 'not-a-file.mp3'), { recursive: true })
    writeFileSync(join(root, '.hidden.mp3'), 'x')
    writeFileSync(join(root, 'notes.md'), 'x')
    expect(scanLibrary(root).files).toEqual([])
  })

  it('lists a symlinked audio file, and drops a link that points nowhere', () => {
    const elsewhere = makeTempDir('lingualab-elsewhere-')
    try {
      writeFileSync(join(elsewhere, 'linked.mp3'), 'x')
      symlinkSync(join(elsewhere, 'linked.mp3'), join(root, 'linked.mp3'))
      symlinkSync(join(elsewhere, 'gone.mp3'), join(root, 'gone.mp3'))
      expect(scanLibrary(root).files.map((entry) => entry.title)).toEqual(['linked'])
    } finally {
      rmSync(elsewhere, { recursive: true, force: true })
    }
  })

  it('summarises the notes held in the state for one of them', () => {
    const id = loose('podcast.mp3')
    const state = withNotes(EMPTY_STATE, id, [
      { at: 1, text: 'one', zh: '', note: '', tags: ['review'], done: false },
      { at: 2, text: 'two', zh: '', note: '', tags: [], done: true },
    ])
    expect(scanLibrary(root, state).files[0]?.notes).toEqual({ exists: true, count: 2, review: 1, hard: 0 })
  })

  it('does not write anything: the same state in gives the same listing out', () => {
    loose('podcast.mp3')
    const before = EMPTY_STATE
    scanLibrary(root, before)
    expect(before.files).toEqual([])
    expect(before.notes).toEqual({})
  })
})

describe('scanLibrary remembers what was open', () => {
  /** A file episode record for one audio file. */
  function recordFor(path: string, openedAt = 1): FileEpisodeRecord {
    return {
      id: fileEpisodeIdFor(realpathSync(path)),
      path: realpathSync(path),
      title: 'podcast',
      place: 'lib',
      rel: 'podcast.mp3',
      audio: 'podcast.mp3',
      subtitleEn: null,
      subtitleZh: null,
      openedAt,
    }
  }

  it('resolves a remembered folder episode, and reports one that is gone', () => {
    episode('S01E01', { audio: 'a.mp3' })
    episode('S01E02', { audio: 'a.mp3' })
    const here: OpenState = withCurrent(EMPTY_STATE, {
      id: 'S01E02',
      title: 'S01E02',
      kind: 'folder',
      source: join(root, 'S01E02'),
    })
    const present = scanLibrary(root, here)
    expect(present.currentEpisode?.id).toBe('S01E02')
    expect(present.currentUnavailable).toBeNull()

    const gone: OpenState = withCurrent(EMPTY_STATE, {
      id: 'S01E09',
      title: 'S01E09',
      kind: 'folder',
      source: join(root, 'S01E09'),
    })
    const missing = scanLibrary(root, gone)
    expect(missing.currentEpisode).toBeNull()
    expect(missing.currentUnavailable).toEqual({
      id: 'S01E09',
      title: 'S01E09',
      kind: 'folder',
      source: join(root, 'S01E09'),
    })
  })

  it('resolves a remembered loose file from the listing itself', () => {
    writeFileSync(join(root, 'podcast.mp3'), 'x')
    const record = recordFor(join(root, 'podcast.mp3'))
    const payload = scanLibrary(root, withOpenedFile(EMPTY_STATE, record))
    expect(payload.currentEpisode?.id).toBe(record.id)
    expect(payload.currentEpisode?.kind).toBe('file')
    expect(payload.currentUnavailable).toBeNull()
  })

  it('resolves a remembered file that lives outside the library, and reports a deleted one', () => {
    const outside = makeTempDir('lingualab-outside-')
    try {
      writeFileSync(join(outside, 'podcast.mp3'), 'x')
      const record = recordFor(join(outside, 'podcast.mp3'))
      const present = scanLibrary(root, withOpenedFile(EMPTY_STATE, record))
      expect(present.currentEpisode?.id).toBe(record.id)
      expect(present.files).toEqual([])

      rmSync(join(outside, 'podcast.mp3'))
      const missing = scanLibrary(root, withOpenedFile(EMPTY_STATE, record))
      expect(missing.currentEpisode).toBeNull()
      expect(missing.currentUnavailable?.id).toBe(record.id)
    } finally {
      rmSync(outside, { recursive: true, force: true })
    }
  })

  it('keeps a remembered file episode open even when the root itself is unusable', () => {
    const outside = makeTempDir('lingualab-outside-')
    try {
      writeFileSync(join(outside, 'podcast.mp3'), 'x')
      const state = withOpenedFile(EMPTY_STATE, recordFor(join(outside, 'podcast.mp3')))
      const payload = scanLibrary(join(root, 'nope'), state)
      expect(payload.ok).toBe(false)
      expect(payload.reason).toBe('媒体目录不存在')
      expect(payload.currentEpisode?.id).toBe(state.files[0]?.id)
      expect(payload.currentUnavailable).toBeNull()
    } finally {
      rmSync(outside, { recursive: true, force: true })
    }
  })

  it('resolves nothing when nothing was remembered', () => {
    episode('S01E01', { audio: 'a.mp3' })
    const payload = scanLibrary(root)
    expect(payload.currentEpisode).toBeNull()
    expect(payload.currentUnavailable).toBeNull()
  })
})

describe('resolveMediaPath', () => {
  it('accepts an episode file with a served extension', () => {
    // `join` so the expectation uses the platform's own separator, as the code does.
    expect(resolveMediaPath('/lib', '/S01E01/audio.mp3')).toBe(join('/lib', 'S01E01', 'audio.mp3'))
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
    const port = await listenForFetch(server)
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

      // An unsatisfiable range is a 416, not a whole-file 200: a player that gets
      // the latter stops asking for ranges at all.
      const bad = await fetch(`http://127.0.0.1:${port}/S01E01/audio.mp3`, {
        headers: { range: 'bytes=999-1200' },
      })
      expect(bad.status).toBe(416)
      expect(bad.headers.get('content-range')).toBe('bytes */11')
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  })
})

describe('notes round-trip', () => {
  it('writes and reads back the phrases, keeping the preamble', () => {
    episode('S01E01', { audio: 'a.mp3' })
    const { payload: written } = writeNotes(root, 'S01E01', [
      { at: 12, text: 'Hello there', zh: '你好', note: '开场', tags: ['review'], done: false },
    ])
    expect(written.ok).toBe(true)

    const read = readNotes(root, 'S01E01')
    expect(read.phrases).toHaveLength(1)
    expect(read.phrases[0]?.text).toBe('Hello there')
    expect(read.phrases[0]?.tags).toEqual(['review'])
  })

  it('accepts an eighth phrase, and refuses only a runaway list', () => {
    episode('S01E01', { audio: 'a.mp3' })
    const eight = Array.from({ length: 8 }, (_, index) => ({ at: index, text: `phrase ${index}` }))
    expect(writeNotes(root, 'S01E01', eight).payload.ok).toBe(true)

    const runaway = Array.from({ length: MAX_PHRASES + 1 }, (_, index) => ({ at: index, text: `p${index}` }))
    const { payload: result } = writeNotes(root, 'S02E01', runaway)
    expect(result.ok).toBe(false)
    expect(result.reason).toContain(`最多 ${String(MAX_PHRASES)} 条`)
    // Nothing was written for the refused one, so its notes are still empty.
    expect(readNotes(root, 'S02E01').phrases).toEqual([])
  })

  it('refuses a notes path that resolves outside the library through a symlink', () => {
    const outside = makeTempDir('lingualab-outside-')
    writeFileSync(join(outside, 'notes.md'), '- [ ] 00:01 | escaped | | |')
    symlinkSync(outside, join(root, 'S01E99'))
    const read = readNotes(root, 'S01E99')
    expect(read.ok).toBe(false)
    expect(read.reason).toContain('素材目录外面')
    expect(writeNotes(root, 'S01E99', [{ at: 1, text: 'x' }]).payload.ok).toBe(false)
    rmSync(outside, { recursive: true, force: true })
  })

  it('refuses an episode id that would escape the library', () => {
    expect(readNotes(root, '../etc').ok).toBe(false)
    expect(writeNotes(root, 'a/b', []).payload.ok).toBe(false)
  })

  it('drops a malformed phrase rather than storing it', () => {
    episode('S01E01', { audio: 'a.mp3' })
    const { payload } = writeNotes(root, 'S01E01', [{ at: 1, text: '  ' }, { nonsense: true }, { at: 2, text: 'kept' }])
    expect(payload.phrases.map((phrase) => phrase.text)).toEqual(['kept'])
  })
})
