/**
 * Videos in the library scan: which stem they belong to, when one is a segment of its own, what
 * the listing says about its state, the cache that the media route serves, and the import's new extensions.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { scanLibrary, mediaStemsOf, pairSubtitles, pickVideoFile } from './host/entities/episode/index.ts'
import { EMPTY_STATE } from './host/entities/open-state/index.ts'
import { listPlaces } from './host/entities/place/index.ts'
import { forgetDirect, videoRefOf } from './host/entities/video-cache/index.ts'
import { importKind } from './host/features/import/index.ts'
import { openEpisode } from './host/features/open/index.ts'
import { resolveMediaPath, contentTypeOf } from './host/shared/http/index.ts'
import { makeTempDir } from './host/shared/testing/index.ts'

let root = ''

beforeEach(() => {
  root = makeTempDir('lingualab-videoscan-')
  forgetDirect()
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

/** Write files into an episode folder. */
function folder(id: string, names: readonly string[]): string {
  const directory = join(root, id)
  mkdirSync(directory, { recursive: true })
  for (const name of names) writeFileSync(join(directory, name), name)
  return directory
}

describe('media stems', () => {
  it('counts an audio stem, and a video no audio stem owns, once each', () => {
    const names = ['MDJT S01E01.mp3', 'MDJT S01E01.mkv', 'MDJT S01E01.en.srt', 'extra.mp4']
    expect(mediaStemsOf(names).sort()).toEqual(['MDJT S01E01', 'extra'])
  })

  it('gives a video to the longest audio stem that accepts it', () => {
    const names = ['04_Dunphy家.mp3', '04_Dunphy家-Luke射击.mp3', '04_Dunphy家-Luke射击.mkv', '04_Dunphy家_hd.mkv']
    expect(mediaStemsOf(names).sort()).toEqual(['04_Dunphy家', '04_Dunphy家-Luke射击'])
    expect(pickVideoFile(names, '04_Dunphy家-Luke射击')).toBe('04_Dunphy家-Luke射击.mkv')
    expect(pickVideoFile(names, '04_Dunphy家')).toBe('04_Dunphy家_hd.mkv')
  })

  it('prefers mp4, then webm, then mkv, then mov, within one stem', () => {
    expect(pickVideoFile(['a.mov', 'a.mkv', 'a.webm', 'a.mp4'], 'a')).toBe('a.mp4')
    expect(pickVideoFile(['a.mov', 'a.mkv'], 'a')).toBe('a.mkv')
    expect(pickVideoFile(['a.mp3'], 'a')).toBeNull()
  })

  it('lets a video-only scene own its subtitles by the longest stem, like an audio scene', () => {
    const names = ['01.mkv', '01-b.mkv', '01-b.srt', '01.srt']
    expect(pairSubtitles(names, { stem: '01-b' }).en).toBe('01-b.srt')
    expect(pairSubtitles(names, { stem: '01' }).en).toBe('01.srt')
  })
})

describe('the library scan', () => {
  it('keeps a folder of one stem as one episode of one segment, with the video on the entry', () => {
    folder('S01E01', ['MDJT S01E01.mp3', 'MDJT S01E01.mkv', 'MDJT S01E01.en.srt', 'MDJT S01E01.zh.srt'])
    const entry = scanLibrary(root).episodes[0]
    expect(entry?.segments).toEqual([])
    expect(entry?.audio).toBe('MDJT S01E01.mp3')
    expect(entry?.video).toMatchObject({ file: 'MDJT S01E01.mkv', state: 'unprepared' })
    expect(entry?.video?.bytes).toBeGreaterThan(0)
    expect(entry?.subtitleEn).toBe('MDJT S01E01.en.srt')
  })

  it('opens an episode that is only a video, with no audio url', () => {
    folder('S01E01', ['only.mkv', 'only.srt'])
    const entry = scanLibrary(root).episodes[0]
    expect(entry).toMatchObject({ audio: null, video: { file: 'only.mkv' }, subtitleEn: 'only.srt' })
    const opened = openEpisode({ episodeId: 'S01E01' }, { libraryRoot: root, places: listPlaces([], root), state: EMPTY_STATE })
    expect(opened.payload.ok).toBe(true)
    expect(opened.payload.media?.audioUrl).toBe('')
    expect(opened.payload.media?.subtitleEnUrl).toBe('/lingualab/media/S01E01/only.srt')
  })

  it('makes a folder with no audio and no video unplayable, as before', () => {
    folder('S01E01', ['notes.md'])
    const opened = openEpisode({ episodeId: 'S01E01' }, { libraryRoot: root, places: listPlaces([], root), state: EMPTY_STATE })
    expect(opened.payload.ok).toBe(false)
  })

  it('makes a video no audio file owns a segment of its own, beside the audio segments', () => {
    folder('S01E01', ['01_a.mp3', '01_a.mp4', '02_b.mp3', '03_c.mkv', '03_c.srt'])
    const segments = scanLibrary(root).episodes[0]?.segments ?? []
    expect(segments.map((segment) => [segment.id, segment.audio, segment.video?.file ?? null])).toEqual([
      ['01_a', '01_a.mp3', '01_a.mp4'],
      ['02_b', '02_b.mp3', null],
      ['03_c', null, '03_c.mkv'],
    ])
    expect(segments[2]?.subtitleEn).toBe('03_c.srt')
    expect(segments[2]?.title).toBe('c')
  })

  it('makes a folder of two videos an episode of two segments', () => {
    folder('S01E01', ['a.mkv', 'b.mp4'])
    expect(scanLibrary(root).episodes[0]?.segments.map((segment) => segment.id)).toEqual(['a', 'b'])
  })

  it('does not list the hidden cache folder or its files', () => {
    const directory = folder('S01E01', ['a.mp3', 'a.mkv'])
    mkdirSync(join(directory, '.lingualab'))
    writeFileSync(join(directory, '.lingualab', 'a.mp4'), 'prepared')
    const entry = scanLibrary(root).episodes[0]
    expect(entry?.audio).toBe('a.mp3')
    expect(entry?.segments).toEqual([])
  })

  it('has no video on a loose audio file', () => {
    writeFileSync(join(root, 'loose.mp3'), 'x')
    writeFileSync(join(root, 'loose.mkv'), 'x')
    expect(scanLibrary(root).files[0]?.video).toBeNull()
  })
})

describe('what the scan says about a video', () => {
  it('is unprepared, then ready once the prepared video is in the cache, then sound when only that is', () => {
    const directory = folder('S01E01', ['a.mkv'])
    expect(videoRefOf(directory, 'a.mkv', 'a').state).toBe('unprepared')
    mkdirSync(join(directory, '.lingualab'))
    writeFileSync(join(directory, '.lingualab', 'a.m4a'), 'sound')
    expect(videoRefOf(directory, 'a.mkv', 'a').state).toBe('sound')
    writeFileSync(join(directory, '.lingualab', 'a.mp4'), 'picture')
    expect(videoRefOf(directory, 'a.mkv', 'a').state).toBe('ready')
  })

  it('ignores a partial file and an empty one', () => {
    const directory = folder('S01E01', ['a.mkv'])
    mkdirSync(join(directory, '.lingualab'))
    writeFileSync(join(directory, '.lingualab', 'a.mp4.part'), 'half')
    writeFileSync(join(directory, '.lingualab', 'a.mp4'), '')
    expect(videoRefOf(directory, 'a.mkv', 'a').state).toBe('unprepared')
  })
})

describe('serving the cache', () => {
  it('resolves the prepared file inside the episode cache folder', () => {
    expect(resolveMediaPath('/lib', '/S01E01/.lingualab/a.mp4')).toBe(join('/lib', 'S01E01', '.lingualab', 'a.mp4'))
    expect(resolveMediaPath('/lib', '/S01E01/.lingualab/a%20b.m4a')).toBe(join('/lib', 'S01E01', '.lingualab', 'a b.m4a'))
  })

  it('serves nothing else three levels deep: other folders, other types, partial files, traversal', () => {
    expect(resolveMediaPath('/lib', '/S01E01/other/a.mp4')).toBeNull()
    expect(resolveMediaPath('/lib', '/S01E01/.lingualab/a.mp3')).toBeNull()
    expect(resolveMediaPath('/lib', '/S01E01/.lingualab/a.srt')).toBeNull()
    expect(resolveMediaPath('/lib', '/S01E01/.lingualab/a.mp4.part')).toBeNull()
    expect(resolveMediaPath('/lib', '/S01E01/.lingualab/../a.mp4')).toBeNull()
    expect(resolveMediaPath('/lib', '/S01E01/.lingualab/%2e%2e/a.mp4')).toBeNull()
    expect(resolveMediaPath('/lib', '/S01E01/.lingualab/x/a.mp4')).toBeNull()
    expect(resolveMediaPath('/lib', '/.lingualab/a.mp4')).toBe(join('/lib', '.lingualab', 'a.mp4'))
  })

  it('serves a source video only as mp4 or webm: an mkv or mov is prepared first', () => {
    expect(resolveMediaPath('/lib', '/S01E01/a.mp4')).not.toBeNull()
    expect(resolveMediaPath('/lib', '/S01E01/a.webm')).not.toBeNull()
    expect(resolveMediaPath('/lib', '/S01E01/a.mkv')).toBeNull()
    expect(resolveMediaPath('/lib', '/S01E01/a.mov')).toBeNull()
  })

  it('sends video as video and sound as audio', () => {
    expect(contentTypeOf('a.mp4')).toBe('video/mp4')
    expect(contentTypeOf('a.webm')).toBe('video/webm')
    expect(contentTypeOf('a.m4a')).toBe('audio/mp4')
  })
})

describe('import', () => {
  it('takes video as a kind of its own', () => {
    for (const name of ['a.mkv', 'a.MP4', 'a.webm', 'a.mov']) expect(importKind(name)).toBe('video')
    expect(importKind('a.avi')).toBeNull()
  })
})
