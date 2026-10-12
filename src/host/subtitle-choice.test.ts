/**
 * Choosing subtitles by hand: the store, how a choice lays over the name rule, what the scan reports,
 * and the route logic for both kinds of episode.
 *
 * The properties under test are that a choice only replaces the slots it names, that a picked file
 * which is gone plays as automatic without losing the choice, that the folder file disappears once
 * nothing in it is chosen, and that a file episode's pick (even one with another stem) is served.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SUBTITLE_CHOICE_FILE, type SubtitleChoice } from '../shared/protocol.ts'
import { scanEpisode } from './library.ts'
import { resolveFileMedia } from './file-media.ts'
import { openEpisode } from './open.ts'
import { listPlaces } from './places.ts'
import { EMPTY_STATE, parseState, serializeState } from './state.ts'
import { AUTO_CHOICE, applyChoice, readFolderChoices, sanitizeChoice, writeFolderChoice } from './subtitle-choice.ts'
import { readSubtitleChoice, saveSubtitleChoice } from './subtitle-choice-route.ts'
import { makeTempDir } from './test-dir.ts'

const ENGLISH = '1\n00:00:01,000 --> 00:00:02,000\nHello\n'
const BILINGUAL = '1\n00:00:01,000 --> 00:00:02,000\nHello\n你好\n'

const pick = (file: string) => ({ kind: 'file', file }) as const
const AUTO = { kind: 'auto' } as const
const NONE = { kind: 'none' } as const

let root = ''

beforeEach(() => {
  root = makeTempDir('lingualab-choice-')
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

/** Write one file under the root, making its folder. */
function file(rel: string, body = 'x'): void {
  const path = join(root, rel)
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, body)
}

describe('applyChoice', () => {
  const auto = { en: 'a.en.srt', zh: 'a.zh.srt' }
  const names = ['a.mp3', 'a.en.srt', 'a.zh.srt', 'other.srt']

  it('is the name rule when nothing is chosen', () => {
    expect(applyChoice(auto, undefined, names)).toEqual({ ...auto, state: undefined })
    expect(applyChoice(auto, AUTO_CHOICE, names)).toEqual({ ...auto, state: undefined })
  })

  it('replaces only the slots it names', () => {
    const choice: SubtitleChoice = { en: AUTO, zh: pick('other.srt') }
    expect(applyChoice(auto, choice, names)).toEqual({ en: 'a.en.srt', zh: 'other.srt', state: { choice, missing: [] } })
    expect(applyChoice(auto, { en: NONE, zh: AUTO }, names).en).toBeNull()
  })

  it('plays a picked file that is gone as automatic, and says which slot', () => {
    const choice: SubtitleChoice = { en: pick('gone.srt'), zh: NONE }
    expect(applyChoice(auto, choice, names)).toEqual({ en: 'a.en.srt', zh: null, state: { choice, missing: ['en'] } })
  })
})

describe('sanitizeChoice', () => {
  it('refuses a path, a non-subtitle file and an unknown kind', () => {
    expect(sanitizeChoice({ en: pick('../x.srt'), zh: AUTO })).toBeNull()
    expect(sanitizeChoice({ en: pick('a.mp3'), zh: AUTO })).toBeNull()
    expect(sanitizeChoice({ en: { kind: 'maybe' }, zh: AUTO })).toBeNull()
    expect(sanitizeChoice({ en: pick('a.srt'), zh: NONE })).toEqual({ en: pick('a.srt'), zh: NONE })
  })
})

describe('the folder file', () => {
  it('keeps one choice per segment and removes itself once nothing is chosen', () => {
    const folder = join(root, 'E1')
    mkdirSync(folder)
    writeFolderChoice(folder, '02_b', { en: pick('b.srt'), zh: NONE })
    writeFolderChoice(folder, '01_a', { en: AUTO, zh: pick('a.srt') })
    expect(Object.keys(readFolderChoices(folder).segments)).toEqual(['01_a', '02_b'])

    writeFolderChoice(folder, '02_b', AUTO_CHOICE)
    expect(readFolderChoices(folder).segments).toEqual({ '01_a': { en: AUTO, zh: pick('a.srt') } })
    writeFolderChoice(folder, '01_a', AUTO_CHOICE)
    expect(existsSync(join(folder, SUBTITLE_CHOICE_FILE))).toBe(false)
  })

  it('reads a corrupt or hand-broken file as nothing chosen', () => {
    file(`E1/${SUBTITLE_CHOICE_FILE}`, '{nope')
    expect(readFolderChoices(join(root, 'E1'))).toEqual({ folder: undefined, segments: {} })
    file(`E1/${SUBTITLE_CHOICE_FILE}`, JSON.stringify({ version: 1, segments: { a: { en: pick('/etc/x.srt'), zh: AUTO } } }))
    expect(readFolderChoices(join(root, 'E1')).segments).toEqual({})
  })
})

describe('the scan with a choice', () => {
  it('lays a folder choice over the pairing and reports a missing file', () => {
    file('E1/lesson.mp3')
    file('E1/lesson.en.srt', ENGLISH)
    file('E1/lesson.zh.srt', BILINGUAL)
    file('E1/stray name.srt', BILINGUAL)
    writeFolderChoice(join(root, 'E1'), null, { en: AUTO, zh: pick('stray name.srt') })
    const entry = scanEpisode(root, 'E1', 'E1')
    expect([entry.subtitleEn, entry.subtitleZh]).toEqual(['lesson.en.srt', 'stray name.srt'])
    expect(entry.subtitleChoice?.missing).toEqual([])

    rmSync(join(root, 'E1', 'stray name.srt'))
    const fallen = scanEpisode(root, 'E1', 'E1')
    expect([fallen.subtitleEn, fallen.subtitleZh]).toEqual(['lesson.en.srt', 'lesson.zh.srt'])
    expect(fallen.subtitleChoice?.missing).toEqual(['zh'])
  })

  it('chooses per segment, and the entry mirrors the first', () => {
    file('E1/01_a.mp3')
    file('E1/01_a.srt', ENGLISH)
    file('E1/02_b.mp3')
    file('E1/02_b.srt', ENGLISH)
    writeFolderChoice(join(root, 'E1'), '02_b', { en: AUTO, zh: pick('01_a.srt') })
    const entry = scanEpisode(root, 'E1', 'E1')
    expect(entry.segments.map((segment) => segment.subtitleZh)).toEqual([null, '01_a.srt'])
    expect(entry.segments[0]?.subtitleChoice).toBeUndefined()
    expect(entry.subtitleChoice).toBeUndefined()
  })
})

describe('the route logic, for a folder episode', () => {
  it('offers every subtitle in the folder with its content check, and saves a choice', () => {
    file('E1/01_a.mp3')
    file('E1/01_a.srt', ENGLISH)
    file('E1/02_b.mp3')
    file('E1/02_b-EN.srt', ENGLISH)
    file('E1/whatever.srt', BILINGUAL)

    const read = readSubtitleChoice(root, EMPTY_STATE, 'E1', '02_b')
    expect(read.payload.ok).toBe(true)
    expect(read.payload.candidates).toEqual([
      { file: '01_a.srt', cjk: false },
      { file: '02_b-EN.srt', cjk: false },
      { file: 'whatever.srt', cjk: true },
    ])
    expect(read.payload.auto).toEqual({ en: '02_b-EN.srt', zh: null })

    const saved = saveSubtitleChoice(root, EMPTY_STATE, { episode: 'E1', segment: '02_b', choice: { en: AUTO, zh: pick('whatever.srt') } })
    expect(saved.status).toBe(200)
    expect(saved.payload.resolved).toEqual({ en: '02_b-EN.srt', zh: 'whatever.srt' })
    expect(saved.state).toBe(EMPTY_STATE)
    expect(JSON.parse(readFileSync(join(root, 'E1', SUBTITLE_CHOICE_FILE), 'utf8'))).toMatchObject({ version: 1, segments: { '02_b': { zh: pick('whatever.srt') } } })
  })

  it('refuses a file that is not there, a missing segment and a segment that does not exist', () => {
    file('E1/01_a.mp3')
    file('E1/02_b.mp3')
    file('E1/01_a.srt', ENGLISH)
    const choice = { en: pick('nope.srt'), zh: AUTO }
    expect(saveSubtitleChoice(root, EMPTY_STATE, { episode: 'E1', segment: '01_a', choice }).status).toBe(400)
    expect(readSubtitleChoice(root, EMPTY_STATE, 'E1', undefined).status).toBe(400)
    expect(readSubtitleChoice(root, EMPTY_STATE, 'E1', '03_c').status).toBe(404)
    expect(readSubtitleChoice(root, EMPTY_STATE, '..', undefined).status).toBe(400)
    expect(existsSync(join(root, 'E1', SUBTITLE_CHOICE_FILE))).toBe(false)
  })
})

describe('the route logic, for a file episode', () => {
  it('keeps the choice in the record, across opens and a restart, and serves a pick of another stem', () => {
    file('loose/lesson.mp3')
    file('loose/lesson.srt', ENGLISH)
    file('loose/from the site.chs.srt', BILINGUAL)
    const deps = (state = EMPTY_STATE) => ({ libraryRoot: join(root, 'lib'), places: listPlaces([{ path: root }], join(root, 'lib')), state })
    const place = deps().places[0]
    if (place === undefined) throw new Error('no place')
    const opened = openEpisode({ place: place.id, rel: 'loose/lesson.mp3' }, deps())
    const id = opened.payload.episode?.id ?? ''

    expect(saveSubtitleChoice(root, EMPTY_STATE, { episode: id, choice: AUTO_CHOICE }).status).toBe(404)
    const saved = saveSubtitleChoice(root, opened.state, { episode: id, choice: { en: AUTO, zh: pick('from the site.chs.srt') } })
    expect(saved.payload.resolved).toEqual({ en: 'lesson.srt', zh: 'from the site.chs.srt' })
    expect(resolveFileMedia(saved.state, `/${id}/${encodeURIComponent('from the site.chs.srt')}`)).toBe(join(root, 'loose', 'from the site.chs.srt'))

    const restarted = parseState(serializeState(saved.state))
    const reopened = openEpisode({ episodeId: id }, deps(restarted))
    expect(reopened.payload.episode?.subtitleZh).toBe('from the site.chs.srt')
    expect(reopened.payload.media?.subtitleZhUrl).toContain(encodeURIComponent('from the site.chs.srt'))
    expect(reopened.state.files[0]?.subtitles).toEqual({ en: AUTO, zh: pick('from the site.chs.srt') })

    const cleared = saveSubtitleChoice(root, reopened.state, { episode: id, choice: AUTO_CHOICE })
    expect(cleared.state.files[0]?.subtitles).toBeUndefined()
    expect(cleared.payload.resolved.zh).toBeNull()
  })
})
