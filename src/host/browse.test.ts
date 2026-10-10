/**
 * The directory listing: order, page limits, and what a row is allowed to carry.
 *
 * The interesting failures are the quiet ones. A listing that returns a symlink out
 * of the place hands a browser a way out; a listing that `stat`s every file turns
 * scrolling into a disk scan; a listing that cuts the page before counting makes an
 * empty result look like an empty directory. Each has a test here.
 */
import { mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { browsePlace } from './browse.ts'
import { listPlaces } from './places.ts'
import type { PlaceEntry } from '../shared/protocol.ts'
import { makeTempDir } from './test-dir.ts'

let root = ''
let library = ''
let outside = ''

beforeEach(() => {
  root = makeTempDir('lingualab-browse-')
  library = makeTempDir('lingualab-library-')
  outside = makeTempDir('lingualab-outside-')
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
  rmSync(library, { recursive: true, force: true })
  rmSync(outside, { recursive: true, force: true })
})

/** The workspace place for the temporary root. */
function place(): PlaceEntry {
  const found = listPlaces([{ path: root }], library)[0]
  if (found === undefined) throw new Error('no place')
  return found
}

/** The library place. */
function libPlace(): PlaceEntry {
  const places = listPlaces([{ path: root }], library)
  const found = places.find((entry) => entry.id === 'lib')
  if (found === undefined) throw new Error('no library place')
  return found
}

/** A file of a given size, so bytes can be asserted. */
function file(rel: string, body = 'x'): void {
  const path = join(root, rel)
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, body)
}

describe('browsePlace ordering and counts', () => {
  it('lists directories first, then audio, then subtitles, each in natural order', () => {
    file('S01E10.mp3')
    file('S01E2.mp3')
    file('zz.srt')
    file('notes.md')
    mkdirSync(join(root, 'b'))
    mkdirSync(join(root, 'a'))

    const payload = browsePlace({ place: place(), libraryRoot: library, rel: '' })
    expect(payload.ok).toBe(true)
    expect(payload.entries.map((entry) => entry.name)).toEqual([
      'a',
      'b',
      'S01E2.mp3',
      'S01E10.mp3',
      'zz.srt',
    ])
    expect(payload.summary).toEqual({ dirs: 2, audio: 2, subtitles: 1, other: 1 })
    expect(payload.page).toEqual({ limit: 80, returned: 5, truncated: false })
    expect(payload.parentRel).toBeNull()
    expect(payload.rel).toBe('')
  })

  it('hides everything else unless it is asked for', () => {
    file('lesson.mp3')
    file('notes.md', 'notes')
    file('.hidden.mp3')

    const without = browsePlace({ place: place(), libraryRoot: library, rel: '' })
    expect(without.entries.map((entry) => entry.name)).toEqual(['lesson.mp3'])
    // Counted before the filter, so an empty page can say what it skipped.
    expect(without.summary.other).toBe(1)

    const with_ = browsePlace({ place: place(), libraryRoot: library, rel: '', includeOther: true })
    expect(with_.entries.map((entry) => entry.type)).toEqual(['audio', 'other'])
    expect(with_.entries.map((entry) => entry.ext)).toEqual(['mp3', 'md'])
    expect(with_.entries[1]?.subtitle).toBeNull()
  })

  it('filters by name, case-insensitively, without changing the counts', () => {
    file('S01E01.mp3')
    file('S01E02.mp3')
    file('other.wav')

    const payload = browsePlace({ place: place(), libraryRoot: library, rel: '', query: 's01e0' })
    expect(payload.entries.map((entry) => entry.name)).toEqual(['S01E01.mp3', 'S01E02.mp3'])
    expect(payload.summary.audio).toBe(3)
  })

  it('describes an audio row with its size and its subtitle hint', () => {
    file('lesson.mp3', 'audio-bytes')
    file('lesson.en.srt')
    file('lesson.zh.srt')

    const payload = browsePlace({ place: place(), libraryRoot: library, rel: '' })
    const row = payload.entries.find((entry) => entry.type === 'audio')
    expect(row?.bytes).toBe(11)
    expect(row?.subtitle).toEqual({ state: 'both', files: ['lesson.en.srt', 'lesson.zh.srt'] })
  })
})

describe('browsePlace pages', () => {
  it('keeps the default page at eighty rows and says it truncated', () => {
    for (let index = 0; index < 100; index += 1) file(`clip-${String(index).padStart(3, '0')}.mp3`)
    const payload = browsePlace({ place: place(), libraryRoot: library, rel: '' })
    expect(payload.page.limit).toBe(80)
    expect(payload.page.returned).toBe(80)
    expect(payload.page.truncated).toBe(true)
    expect(payload.entries[0]?.name).toBe('clip-000.mp3')
  })

  it('honours a smaller limit and clamps anything above the ceiling', () => {
    for (let index = 0; index < 12; index += 1) file(`clip-${String(index).padStart(2, '0')}.mp3`)
    const small = browsePlace({ place: place(), libraryRoot: library, rel: '', limit: 5 })
    expect(small.page).toEqual({ limit: 5, returned: 5, truncated: true })

    const huge = browsePlace({ place: place(), libraryRoot: library, rel: '', limit: 999 })
    expect(huge.page.limit).toBe(200)
    expect(huge.page.returned).toBe(12)
    expect(huge.page.truncated).toBe(false)

    const nonsense = browsePlace({ place: place(), libraryRoot: library, rel: '', limit: 0 })
    expect(nonsense.page.limit).toBe(80)
  })
})

describe('browsePlace walking down', () => {
  it('reports the relative path and its parent', () => {
    file('season-1/episode-1/lesson.mp3')
    const payload = browsePlace({ place: place(), libraryRoot: library, rel: 'season-1/episode-1' })
    expect(payload.rel).toBe('season-1/episode-1')
    expect(payload.parentRel).toBe('season-1')

    const first = browsePlace({ place: place(), libraryRoot: library, rel: 'season-1' })
    expect(first.parentRel).toBe('')
  })

  it('refuses a path that leaves the place, and a missing one', () => {
    const escaped = browsePlace({ place: place(), libraryRoot: library, rel: '..' })
    expect(escaped.ok).toBe(false)
    expect(escaped.reason).toBe('相对路径不合法')

    const missing = browsePlace({ place: place(), libraryRoot: library, rel: 'nope' })
    expect(missing.ok).toBe(false)
    expect(missing.reason).toBe('这个路径不存在')
  })

  it('refuses a file, and a place with no root yet', () => {
    file('lesson.mp3')
    expect(browsePlace({ place: place(), libraryRoot: library, rel: 'lesson.mp3' })).toMatchObject({
      ok: false,
      reason: '这不是一个目录',
    })
    const unset = listPlaces([{ path: root }], '').find((entry) => entry.id === 'lib')
    if (unset === undefined) throw new Error('no library place')
    expect(browsePlace({ place: unset, libraryRoot: '', rel: '' })).toMatchObject({
      ok: false,
      reason: '这个位置还没有设置目录',
    })
  })
})

describe('browsePlace and symbolic links', () => {
  it('drops a link that leaves the place', () => {
    writeFileSync(join(outside, 'secret.mp3'), 'x')
    symlinkSync(outside, join(root, 'escape'))
    symlinkSync(join(outside, 'secret.mp3'), join(root, 'secret.mp3'))

    const payload = browsePlace({ place: place(), libraryRoot: library, rel: '' })
    expect(payload.entries).toEqual([])
    expect(payload.summary.audio).toBe(0)
  })

  it('keeps a link that stays inside, classified by what it points at', () => {
    file('real/lesson.mp3')
    symlinkSync(join(root, 'real'), join(root, 'linked'))
    symlinkSync(join(root, 'real', 'lesson.mp3'), join(root, 'linked.mp3'))

    const payload = browsePlace({ place: place(), libraryRoot: library, rel: '' })
    const linked = payload.entries.find((entry) => entry.name === 'linked')
    expect(linked?.type).toBe('dir')
    const fileLink = payload.entries.find((entry) => entry.name === 'linked.mp3')
    expect(fileLink?.type).toBe('audio')
  })
})

describe('browsePlace folder episodes', () => {
  it('offers the directory as an episode when it is a direct child of the library root', () => {
    mkdirSync(join(library, 'S01E01'), { recursive: true })
    writeFileSync(join(library, 'S01E01', 'audio.mp3'), 'x')
    writeFileSync(join(library, 'manifest.json'), JSON.stringify({ titles: { S01E01: 'The Bicycle Thief' } }))

    const payload = browsePlace({ place: libPlace(), libraryRoot: library, rel: 'S01E01' })
    expect(payload.folderEpisode).toEqual({ id: 'S01E01', title: 'The Bicycle Thief' })
  })

  it('does not offer one for the root, a nested folder, or a folder without audio', () => {
    writeFileSync(join(library, 'audio.mp3'), 'x')
    mkdirSync(join(library, 'S01E01', 'inner'), { recursive: true })
    writeFileSync(join(library, 'S01E01', 'inner', 'audio.mp3'), 'x')
    mkdirSync(join(library, 'empty'), { recursive: true })

    expect(browsePlace({ place: libPlace(), libraryRoot: library, rel: '' }).folderEpisode).toBeNull()
    expect(browsePlace({ place: libPlace(), libraryRoot: library, rel: 'S01E01/inner' }).folderEpisode).toBeNull()
    expect(browsePlace({ place: libPlace(), libraryRoot: library, rel: 'empty' }).folderEpisode).toBeNull()
  })

  it('recognises the episode in a workspace too, when the library root happens to be there', () => {
    mkdirSync(join(root, 'media', 'S01E02'), { recursive: true })
    writeFileSync(join(root, 'media', 'S01E02', 'audio.mp3'), 'x')
    const payload = browsePlace({
      place: place(),
      libraryRoot: join(root, 'media'),
      rel: 'media/S01E02',
    })
    expect(payload.folderEpisode).toEqual({ id: 'S01E02', title: 'S01E02' })
  })
})
