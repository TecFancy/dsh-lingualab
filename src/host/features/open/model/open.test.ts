/**
 * Opening an episode: the two shapes, the ids that come out of them, and every way
 * the material can turn out to be missing.
 *
 * An id is a promise the page keeps for the rest of the session, so the properties
 * under test are that it is derived from the *canonical* path (two spellings of the
 * same file give one id) and that it survives the request that created it. The
 * refusals are the other half: the picker is a browsing UI, so "there is no audio in
 * this folder" has to arrive as an answer with a sentence in it.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { realpathSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { resolveFileMedia } from '../../../entities/episode/index.ts'
import { EMPTY_STATE, fileEpisodeIdFor, type OpenState } from '../../../entities/open-state/index.ts'
import { listPlaces } from '../../../entities/place/index.ts'
import { makeTempDir } from '../../../shared/testing/index.ts'
import { openEpisode } from './open.ts'

let root = ''
let library = ''

beforeEach(() => {
  root = makeTempDir('lingualab-open-')
  library = makeTempDir('lingualab-open-lib-')
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
  rmSync(library, { recursive: true, force: true })
})

/** Write a file under the browsable root. */
function file(rel: string, body = 'audio-bytes'): void {
  const path = join(root, rel)
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, body)
}

/** The deps one open needs, with the places resolved the way the route resolves them. */
function deps(state: OpenState = EMPTY_STATE) {
  return { libraryRoot: library, places: listPlaces([{ path: root }], library), state }
}

describe('openEpisode by place and path', () => {
  it('opens one audio file, with the subtitles beside it', () => {
    file('lesson.mp3', 'audio-bytes')
    file('lesson.en.srt', '1\n00:00:01,000 --> 00:00:02,000\nHi')
    file('lesson.zh.srt', '1\n00:00:01,000 --> 00:00:02,000\n你好')
    const place = deps().places[0]
    if (place === undefined) throw new Error('no place')

    const result = openEpisode({ place: place.id, rel: 'lesson.mp3' }, deps())
    expect(result.payload.ok).toBe(true)
    const episode = result.payload.episode
    expect(episode?.kind).toBe('file')
    expect(episode?.title).toBe('lesson')
    expect(episode?.audioBytes).toBe(11)
    expect(result.payload.warnings).toEqual([])
    expect(result.payload.media).toEqual({
      audioUrl: `/lingualab/file-media/${String(episode?.id)}/lesson.mp3`,
      subtitleEnUrl: `/lingualab/file-media/${String(episode?.id)}/lesson.en.srt`,
      subtitleZhUrl: `/lingualab/file-media/${String(episode?.id)}/lesson.zh.srt`,
    })
    expect(result.state.current).toMatchObject({ id: episode?.id, kind: 'file' })
    expect(result.state.files).toHaveLength(1)
    expect(result.state.recent).toEqual([episode?.id])
  })

  it('derives the id from the canonical path, so two spellings are one episode', () => {
    file('season-1/lesson.mp3')
    const place = deps().places[0]
    if (place === undefined) throw new Error('no place')

    const direct = openEpisode({ place: place.id, rel: 'season-1/lesson.mp3' }, deps())
    const dotted = openEpisode({ place: place.id, rel: './season-1/./lesson.mp3' }, deps())
    const byFolder = openEpisode({ place: place.id, rel: 'season-1' }, deps())
    const expected = fileEpisodeIdFor(realpathSync(join(root, 'season-1', 'lesson.mp3')))

    expect(direct.payload.episode?.id).toBe(expected)
    expect(dotted.payload.episode?.id).toBe(expected)
    expect(byFolder.payload.episode?.id).toBe(expected)
  })

  it('opens a folder as its audio file, and refuses one with no audio', () => {
    file('with-audio/lesson.mp3')
    mkdirSync(join(root, 'without-audio'), { recursive: true })
    const place = deps().places[0]
    if (place === undefined) throw new Error('no place')

    const opened = openEpisode({ place: place.id, rel: 'with-audio' }, deps())
    expect(opened.payload.ok).toBe(true)
    expect(opened.payload.episode?.audio).toBe('lesson.mp3')
    expect(opened.state.files[0]?.rel).toBe('with-audio/lesson.mp3')

    const before = deps()
    const refused = openEpisode({ place: place.id, rel: 'without-audio' }, before)
    expect(refused.payload).toMatchObject({ ok: false, reason: '没有音频的文件夹' })
    // A refusal changes nothing, which is what lets the route skip the state write.
    expect(refused.state).toBe(before.state)
  })

  it('reports a file with no subtitles as a warning rather than a failure', () => {
    file('bare.mp3')
    const place = deps().places[0]
    if (place === undefined) throw new Error('no place')

    const result = openEpisode({ place: place.id, rel: 'bare.mp3' }, deps())
    expect(result.payload.ok).toBe(true)
    expect(result.payload.warnings).toEqual(['no-subtitle'])
    expect(result.payload.media?.subtitleEnUrl).toBeNull()
    expect(result.payload.episode?.subtitleZh).toBeNull()
  })

  it('refuses a file that is not audio, a missing path, an escaping path and an unknown place', () => {
    file('notes.md', 'notes')
    const place = deps().places[0]
    if (place === undefined) throw new Error('no place')

    expect(openEpisode({ place: place.id, rel: 'notes.md' }, deps()).payload.reason).toBe('这不是音频文件')
    expect(openEpisode({ place: place.id, rel: 'missing.mp3' }, deps()).payload.reason).toBe('这个路径不存在')
    expect(openEpisode({ place: place.id, rel: '../secret.mp3' }, deps()).payload.reason).toBe('相对路径不合法')
    expect(openEpisode({ place: 'ws_nope', rel: 'a.mp3' }, deps()).payload.reason).toBe('找不到这个位置')
  })
})

describe('openEpisode by id', () => {
  it('reopens a remembered file episode, and marks it recent again', () => {
    file('lesson.mp3')
    const place = deps().places[0]
    if (place === undefined) throw new Error('no place')

    const first = openEpisode({ place: place.id, rel: 'lesson.mp3' }, deps())
    const id = first.payload.episode?.id ?? ''
    const again = openEpisode({ episodeId: id }, { ...deps(first.state) })

    expect(again.payload.ok).toBe(true)
    expect(again.payload.episode?.id).toBe(id)
    expect(again.state.files).toHaveLength(1)
    expect(again.state.recent).toEqual([id])
  })

  it('finds a loose library file by id even with no record of it, and writes the record', () => {
    // The main path from the panel: the library page lists the loose files in the
    // root, the reader clicks one, and the only thing the page has is the id. The
    // scan is read-only, so no record exists yet — this is where one is created.
    writeFileSync(join(library, 'podcast.mp3'), 'audio-bytes')
    writeFileSync(join(library, 'podcast.en.srt'), '1\n00:00:01,000 --> 00:00:02,000\nHi')
    const id = fileEpisodeIdFor(realpathSync(join(library, 'podcast.mp3')))

    const before = deps()
    expect(before.state.files).toEqual([])
    const result = openEpisode({ episodeId: id }, before)

    expect(result.payload.ok).toBe(true)
    expect(result.payload.episode?.id).toBe(id)
    expect(result.payload.episode?.title).toBe('podcast')
    expect(result.payload.episode?.kind).toBe('file')
    expect(result.payload.media).toEqual({
      audioUrl: `/lingualab/file-media/${id}/podcast.mp3`,
      subtitleEnUrl: `/lingualab/file-media/${id}/podcast.en.srt`,
      subtitleZhUrl: null,
    })
    // The open records it, so the next request resolves it from the index.
    expect(result.state.files).toHaveLength(1)
    expect(result.state.files[0]?.id).toBe(id)
    expect(result.state.files[0]?.rel).toBe('podcast.mp3')
    expect(result.state.current).toMatchObject({ id, kind: 'file', title: 'podcast' })
  })

  it('refuses an id it never knew, and one whose file is gone', () => {
    file('lesson.mp3')
    const place = deps().places[0]
    if (place === undefined) throw new Error('no place')

    const opened = openEpisode({ place: place.id, rel: 'lesson.mp3' }, deps())
    const id = opened.payload.episode?.id ?? ''

    // Neither remembered nor in the library root: the refusal has to say so rather
    // than sending the reader back to the picker for something that is not there.
    const unknown = openEpisode({ episodeId: 'file.deadbeefdeadbeef' }, deps())
    expect(unknown.payload.ok).toBe(false)
    expect(unknown.payload.reason).toBe('找不到这一集')
    expect(unknown.payload.episode).toBeNull()

    rmSync(join(root, 'lesson.mp3'))
    expect(openEpisode({ episodeId: id }, deps(opened.state)).payload.reason).toBe('这一集的音频文件已经不在了')
  })

  it('opens a folder episode by id, with the library media route', () => {
    mkdirSync(join(library, 'S01E01'), { recursive: true })
    writeFileSync(join(library, 'S01E01', 'audio.mp3'), 'x')
    writeFileSync(join(library, 'S01E01', 'S01E01.en.srt'), '1\n00:00:01,000 --> 00:00:02,000\nHi')

    const result = openEpisode({ episodeId: 'S01E01' }, deps())
    expect(result.payload.ok).toBe(true)
    expect(result.payload.episode?.kind).toBe('folder')
    expect(result.payload.media).toEqual({
      audioUrl: '/lingualab/media/S01E01/audio.mp3',
      subtitleEnUrl: '/lingualab/media/S01E01/S01E01.en.srt',
      subtitleZhUrl: null,
    })
    expect(result.state.current).toEqual({
      id: 'S01E01',
      title: 'S01E01',
      kind: 'folder',
      source: join(library, 'S01E01'),
    })
    expect(result.state.files).toEqual([])
  })

  it('refuses a folder episode with no audio, and an unknown one', () => {
    mkdirSync(join(library, 'empty'), { recursive: true })
    expect(openEpisode({ episodeId: 'empty' }, deps()).payload.reason).toBe('这一集没有音频文件')
    expect(openEpisode({ episodeId: 'nope' }, deps()).payload.reason).toBe('找不到这一集')
  })

  it('refuses a request that names neither shape, or both', () => {
    const place = deps().places[0]
    if (place === undefined) throw new Error('no place')
    expect(openEpisode({}, deps()).payload.reason).toContain('必须给一个')
    // `episodeId` wins when both arrive; the route is what refuses the ambiguous
    // body, and openEpisode stays total for its own callers.
    expect(openEpisode({ episodeId: 'nope', place: place.id, rel: 'a.mp3' }, deps()).payload.reason).toBe('找不到这一集')
  })
})

describe('resolveFileMedia', () => {
  it('serves the recorded files and a same-stem subtitle added later', () => {
    file('lesson.mp3')
    file('lesson.en.srt')
    const place = deps().places[0]
    if (place === undefined) throw new Error('no place')
    const opened = openEpisode({ place: place.id, rel: 'lesson.mp3' }, deps())
    const id = opened.payload.episode?.id ?? ''

    expect(resolveFileMedia(opened.state, `/${id}/lesson.mp3`)).toBe(join(root, 'lesson.mp3'))
    expect(resolveFileMedia(opened.state, `/${id}/lesson.en.srt`)).toBe(join(root, 'lesson.en.srt'))

    file('lesson.zh.srt', '1\n00:00:01,000 --> 00:00:02,000\n你好')
    expect(resolveFileMedia(opened.state, `/${id}/lesson.zh.srt`)).toBe(join(root, 'lesson.zh.srt'))
  })

  it('refuses another file, another stem, another id and a nested path', () => {
    file('lesson.mp3')
    file('diary.txt', 'private')
    file('other.en.srt')
    const place = deps().places[0]
    if (place === undefined) throw new Error('no place')
    const opened = openEpisode({ place: place.id, rel: 'lesson.mp3' }, deps())
    const id = opened.payload.episode?.id ?? ''

    expect(resolveFileMedia(opened.state, `/${id}/diary.txt`)).toBeNull()
    expect(resolveFileMedia(opened.state, `/${id}/other.en.srt`)).toBeNull()
    expect(resolveFileMedia(opened.state, '/file.deadbeefdeadbeef/lesson.mp3')).toBeNull()
    expect(resolveFileMedia(opened.state, `/${id}/nested/lesson.mp3`)).toBeNull()
    expect(resolveFileMedia(opened.state, `/${id}/%2e%2e/lesson.mp3`)).toBeNull()
  })
})
