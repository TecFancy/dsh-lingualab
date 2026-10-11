/**
 * One episode made of segments: the scan, the open, the picker row and the notes file.
 *
 * Every test builds its folder from the shape the real study material has (see
 * `test-scenes.ts`): ten scenes, each an audio file, an English `.srt` and a `_双语.srt`.
 * What is held down here is that the three readers of a folder (the library scan, the open
 * and the picker) agree about which subtitle belongs to which scene, and that a folder with
 * one audio file keeps behaving exactly as it did before segments existed.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { browsePlace } from './browse.ts'
import { scanLibrary } from './library.ts'
import { readNotes, writeNotes } from './notes.ts'
import { openEpisode } from './open.ts'
import { listPlaces } from './places.ts'
import { SCENE_STEMS, writeScenes } from './test-scenes.ts'
import { EMPTY_STATE } from './state.ts'
import { makeTempDir } from './test-dir.ts'

let library = ''
let outside = ''

beforeEach(() => {
  library = makeTempDir('lingualab-segments-')
  outside = makeTempDir('lingualab-segments-ws-')
})

afterEach(() => {
  rmSync(library, { recursive: true, force: true })
  rmSync(outside, { recursive: true, force: true })
})

/** The deps one open needs. */
const deps = () => ({ libraryRoot: library, places: listPlaces([{ path: outside }], library), state: EMPTY_STATE })

describe('the library scan', () => {
  it('lists a folder of ten scenes as one episode with ten segments in natural order', () => {
    writeScenes(join(library, 'S01E01'))
    const payload = scanLibrary(library)
    expect(payload.episodes.map((entry) => entry.id)).toEqual(['S01E01'])
    const entry = payload.episodes[0]
    expect(entry?.segments.map((segment) => segment.id)).toEqual([...SCENE_STEMS])
    expect(entry?.segments.map((segment) => segment.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('puts 10 after 09 rather than after 01', () => {
    writeScenes(join(library, 'S01E01'), ['10_尾声', '02_足球场', '01_Dunphy家的早晨'])
    const ids = scanLibrary(library).episodes[0]?.segments.map((segment) => segment.id)
    expect(ids).toEqual(['01_Dunphy家的早晨', '02_足球场', '10_尾声'])
  })

  it('titles a segment by its stem without the leading number and separator', () => {
    writeScenes(join(library, 'S01E01'))
    const titles = scanLibrary(library).episodes[0]?.segments.map((segment) => segment.title)
    expect(titles?.slice(0, 5)).toEqual(['Dunphy家的早晨', '足球场', '机场', 'Dunphy家-Luke射击', '车里-Manny的初恋'])
    writeScenes(join(library, 'S02E01'), ['intro', '02 outro', '3-end'])
    const second = scanLibrary(library).episodes.find((entry) => entry.id === 'S02E01')
    expect(second?.segments.map((segment) => segment.title)).toEqual(['outro', 'end', 'intro'])
  })

  it('pairs each scene with its own subtitles, the bilingual file as the Chinese track', () => {
    writeScenes(join(library, 'S01E01'))
    const segments = scanLibrary(library).episodes[0]?.segments ?? []
    for (const segment of segments) {
      expect(segment.audio).toBe(`${segment.id}.mp3`)
      expect(segment.subtitleEn).toBe(`${segment.id}.srt`)
      expect(segment.subtitleZh).toBe(`${segment.id}_双语.srt`)
      expect(segment.audioBytes).toBe(Buffer.byteLength(`audio:${segment.id}`))
    }
  })

  it('gives a subtitle to the longest stem when one scene name is a prefix of another', () => {
    writeScenes(join(library, 'S01E01'), ['04_Dunphy家', '04_Dunphy家-Luke射击'])
    const [short, long] = scanLibrary(library).episodes[0]?.segments ?? []
    expect(short?.id).toBe('04_Dunphy家')
    expect(short?.subtitleEn).toBe('04_Dunphy家.srt')
    expect(short?.subtitleZh).toBe('04_Dunphy家_双语.srt')
    expect(long?.subtitleEn).toBe('04_Dunphy家-Luke射击.srt')
    expect(long?.subtitleZh).toBe('04_Dunphy家-Luke射击_双语.srt')
  })

  it("mirrors the first segment in the entry's own fields", () => {
    writeScenes(join(library, 'S01E01'))
    const entry = scanLibrary(library).episodes[0]
    const first = entry?.segments[0]
    expect(entry?.audio).toBe(first?.audio)
    expect(entry?.audioBytes).toBe(first?.audioBytes)
    expect(entry?.subtitleEn).toBe(first?.subtitleEn)
    expect(entry?.subtitleZh).toBe(first?.subtitleZh)
  })

  it('ignores the files that are not media', () => {
    writeScenes(join(library, 'S01E01'))
    const entry = scanLibrary(library).episodes[0]
    expect(entry?.segments).toHaveLength(10)
    expect(entry?.notes.exists).toBe(true)
  })

  it('takes one audio file per scene by the usual extension preference', () => {
    writeScenes(join(library, 'S01E01'), ['01_a', '02_b'])
    writeFileSync(join(library, 'S01E01', '01_a.wav'), 'wav')
    writeFileSync(join(library, 'S01E01', '02_b.flac'), 'flac')
    const segments = scanLibrary(library).episodes[0]?.segments ?? []
    expect(segments.map((segment) => segment.audio)).toEqual(['01_a.mp3', '02_b.mp3'])
    expect(segments).toHaveLength(2)
  })

  it('leaves a folder with one audio stem as it was: no segments', () => {
    mkdirSync(join(library, 'S01E02'), { recursive: true })
    writeFileSync(join(library, 'S01E02', 'lesson.mp3'), 'x')
    writeFileSync(join(library, 'S01E02', 'lesson.wav'), 'x')
    writeFileSync(join(library, 'S01E02', 'lesson.en.srt'), '1\n00:00:01,000 --> 00:00:02,000\nHi')
    const entry = scanLibrary(library).episodes[0]
    expect(entry?.segments).toEqual([])
    expect(entry?.audio).toBe('lesson.mp3')
    expect(entry?.subtitleEn).toBe('lesson.en.srt')
  })

  it('gives a loose file episode no segments either', () => {
    writeFileSync(join(library, 'clip.mp3'), 'x')
    expect(scanLibrary(library).files[0]?.segments).toEqual([])
  })
})

describe('opening an episode with segments', () => {
  const open = (segment?: string) => openEpisode({ episodeId: 'S01E01', ...(segment === undefined ? {} : { segment }) }, deps())

  beforeEach(() => {
    writeScenes(join(library, 'S01E01'))
  })

  it('opens the first segment when none is named, and says which it opened', () => {
    const { payload } = open()
    expect(payload.ok).toBe(true)
    expect(payload.segment).toBe('01_Dunphy家的早晨')
    expect(payload.episode?.segments).toHaveLength(10)
    expect(payload.media).toEqual({
      audioUrl: '/lingualab/media/S01E01/01_Dunphy%E5%AE%B6%E7%9A%84%E6%97%A9%E6%99%A8.mp3',
      subtitleEnUrl: '/lingualab/media/S01E01/01_Dunphy%E5%AE%B6%E7%9A%84%E6%97%A9%E6%99%A8.srt',
      subtitleZhUrl: '/lingualab/media/S01E01/01_Dunphy%E5%AE%B6%E7%9A%84%E6%97%A9%E6%99%A8_%E5%8F%8C%E8%AF%AD.srt',
    })
  })

  it('opens the segment the request names, with that segment\'s media', () => {
    const { payload } = open('04_Dunphy家-Luke射击')
    expect(payload.ok).toBe(true)
    expect(payload.segment).toBe('04_Dunphy家-Luke射击')
    expect(decodeURIComponent(payload.media?.audioUrl ?? '')).toBe('/lingualab/media/S01E01/04_Dunphy家-Luke射击.mp3')
    expect(decodeURIComponent(payload.media?.subtitleEnUrl ?? '')).toBe('/lingualab/media/S01E01/04_Dunphy家-Luke射击.srt')
    expect(decodeURIComponent(payload.media?.subtitleZhUrl ?? '')).toBe('/lingualab/media/S01E01/04_Dunphy家-Luke射击_双语.srt')
  })

  it('refuses an unknown segment with the reason, not a quiet fallback to the first', () => {
    const result = open('99_没有这一段')
    expect(result.payload.ok).toBe(false)
    expect(result.payload.reason).toContain('99_没有这一段')
    expect(result.payload.episode).toBeNull()
    expect(result.payload.segment).toBeNull()
    expect(result.state).toBe(EMPTY_STATE)
  })

  it('remembers the episode as the current one, whichever segment is open', () => {
    expect(open('02_足球场').state.current).toMatchObject({ id: 'S01E01', kind: 'folder' })
  })

  it('warns about a segment with no subtitles', () => {
    writeFileSync(join(library, 'S01E01', '11_无字幕.mp3'), 'x')
    const { payload } = open('11_无字幕')
    expect(payload.ok).toBe(true)
    expect(payload.warnings).toEqual(['no-subtitle'])
  })

  it('answers null for the segment of an episode that has none, and refuses to name one', () => {
    mkdirSync(join(library, 'S01E02'), { recursive: true })
    writeFileSync(join(library, 'S01E02', 'lesson.mp3'), 'x')
    const plain = openEpisode({ episodeId: 'S01E02' }, deps())
    expect(plain.payload.ok).toBe(true)
    expect(plain.payload.segment).toBeNull()
    const named = openEpisode({ episodeId: 'S01E02', segment: 'lesson' }, deps())
    expect(named.payload.ok).toBe(false)
    expect(named.payload.reason).toBe('这一集没有分段')
  })

  it('does not take a segment together with a file episode id or a place', () => {
    const byFile = openEpisode({ episodeId: 'file.0123456789abcdef', segment: 'a' }, deps())
    expect(byFile.payload.ok).toBe(false)
    expect(byFile.payload.reason).toContain('没有分段')
    const byPlace = openEpisode({ place: 'lib', rel: 'S01E01', segment: 'a' }, deps())
    expect(byPlace.payload.ok).toBe(false)
  })
})

describe('the picker', () => {
  it('reads 中英字幕 for every scene of a folder of scenes, never 字幕待确认', () => {
    writeScenes(outside)
    const place = listPlaces([{ path: outside }], library)[0]
    if (place === undefined) throw new Error('no place')
    const listing = browsePlace({ place, libraryRoot: library, rel: '' })
    const audio = listing.entries.filter((entry) => entry.type === 'audio')
    expect(audio).toHaveLength(10)
    for (const row of audio) expect(row.subtitle?.state, row.name).toBe('both')
  })

  it('does not hand 04_Dunphy家-Luke射击.srt to the row of a shorter sibling stem', () => {
    writeScenes(outside, ['04_Dunphy家', '04_Dunphy家-Luke射击'])
    const place = listPlaces([{ path: outside }], library)[0]
    if (place === undefined) throw new Error('no place')
    const rows = browsePlace({ place, libraryRoot: library, rel: '' }).entries.filter((entry) => entry.type === 'audio')
    const short = rows.find((row) => row.name === '04_Dunphy家.mp3')
    expect(short?.subtitle?.files.every((name) => !name.includes('Luke'))).toBe(true)
  })
})

describe('the notes file of an episode with segments', () => {
  const phrase = (segment: string | undefined, at: number, text: string) => ({
    at,
    text,
    zh: '',
    note: '',
    tags: [] as string[],
    done: false,
    ...(segment === undefined ? {} : { segment }),
  })
  const notesText = (): string => readFileSync(join(library, 'S01E01', 'notes.md'), 'utf8')

  beforeEach(() => {
    writeScenes(join(library, 'S01E01'), ['01_a', '02_b', '10_c'])
    rmSync(join(library, 'S01E01', 'notes.md'))
  })

  it('writes one heading per segment, in the folder order, whatever order the phrases came in', () => {
    const { payload } = writeNotes(library, 'S01E01', [
      phrase('10_c', 3, 'third'),
      phrase('02_b', 9, 'second'),
      phrase('01_a', 1, 'first'),
    ])
    expect(payload.ok).toBe(true)
    expect([...notesText().matchAll(/^## (.+)$/gm)].map((match) => match[1])).toEqual(['01_a', '02_b', '10_c'])
  })

  it('keeps the phrases of each segment under its heading when it reads them back', () => {
    writeNotes(library, 'S01E01', [phrase('02_b', 2, 'Kids?'), phrase('01_a', 2, 'Kids?')])
    const read = readNotes(library, 'S01E01')
    expect(read.phrases.map((item) => [item.segment, item.text])).toEqual([
      ['01_a', 'Kids?'],
      ['02_b', 'Kids?'],
    ])
  })

  it('keeps the preamble and the 500 phrase ceiling for the whole file, not per segment', () => {
    writeFileSync(join(library, 'S01E01', 'notes.md'), '# S01E01 笔记\n\n> 我的话\n')
    writeNotes(library, 'S01E01', [phrase('01_a', 1, 'one')])
    expect(notesText()).toContain('> 我的话')
    const two = Array.from({ length: 300 }, (_, index) => phrase(index % 2 === 0 ? '01_a' : '02_b', index, `p${String(index)}`))
    const tooMany = [...two, ...two.map((item) => ({ ...item, text: `${item.text}b` }))]
    expect(tooMany.length).toBeGreaterThan(500)
    expect(writeNotes(library, 'S01E01', tooMany).payload.ok).toBe(false)
  })

  it('reads an old notes file without headings as belonging to the first segment, and files it there on the next save', () => {
    writeFileSync(join(library, 'S01E01', 'notes.md'), '# S01E01 笔记\n\n- [ ] 00:05 | Old line | 旧的 | |\n')
    const read = readNotes(library, 'S01E01')
    expect(read.phrases.map((item) => item.segment)).toEqual(['01_a'])
    writeNotes(library, 'S01E01', [...read.phrases, phrase('02_b', 7, 'New line')])
    expect(notesText()).toMatch(/## 01_a\n\n- \[ \] 00:05 \| Old line/)
    expect(notesText()).toMatch(/## 02_b\n\n- \[ \] 00:07 \| New line/)
  })

  it('leaves an episode without segments writing the flat file it always wrote', () => {
    mkdirSync(join(library, 'S01E02'), { recursive: true })
    writeFileSync(join(library, 'S01E02', 'lesson.mp3'), 'x')
    writeNotes(library, 'S01E02', [phrase(undefined, 5, 'Hi')])
    const text = readFileSync(join(library, 'S01E02', 'notes.md'), 'utf8')
    expect(text).not.toContain('## ')
    expect(readNotes(library, 'S01E02').phrases[0]?.segment).toBeUndefined()
  })

  it('keeps a phrase whose segment has been renamed, after the known ones', () => {
    writeNotes(library, 'S01E01', [phrase('99_gone', 4, 'orphan'), phrase('02_b', 9, 'second')])
    expect([...notesText().matchAll(/^## (.+)$/gm)].map((match) => match[1])).toEqual(['02_b', '99_gone'])
  })
})
