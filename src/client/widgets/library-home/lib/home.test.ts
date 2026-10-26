// @vitest-environment node
/**
 * The home's words and its filter: what an episode is said to be, how long ago it was heard, what the
 * stage's button and hint say, and which episodes each filter option shows.
 */
import { describe, expect, it } from 'vitest'
import { episodeProgress, STEPS, type PositionTable } from '../../../features/resume/index.ts'
import { agoOf } from '../../../shared/lib/format.ts'
import { segmentKey } from '../../../shared/progress.ts'
import type { EpisodeEntry, EpisodeSegment } from '../../../shared/protocol.ts'
import { filterCounts, filterEpisodes } from './filter.ts'
import { keptSay, materialSay } from './say.ts'
import { resumeHint, stageAction, stageKicker } from './stage.ts'

/** A translator that shows the key and its parameters, so a test can say which string was asked for. */
const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined
    ? key
    : `${key}[${Object.entries(params)
        .map(([name, value]) => `${name}=${String(value)}`)
        .join(';')}]`

const segment = (id: string, index: number): EpisodeSegment => ({
  id,
  index,
  title: id,
  audio: `${id}.mp3`,
  audioBytes: null,
  subtitleEn: null,
  subtitleZh: null,
  video: null,
})

const entry = (id: string, patch: Partial<EpisodeEntry> = {}): EpisodeEntry => ({
  id,
  title: id,
  audio: `${id}.mp3`,
  audioBytes: 1024 * 1024 * 53,
  subtitleEn: `${id}.en.srt`,
  subtitleZh: `${id}.zh.srt`,
  video: null,
  segments: [],
  notes: { exists: false, count: 0, review: 0, hard: 0 },
  kind: 'folder',
  source: '/media',
  ...patch,
})

const HOUR = 3_600_000
const NOW = 1_800_000_000_000

describe('what an episode is said to be', () => {
  it('names the subtitles and the segments, and never the size', () => {
    const cut = entry('E1', { segments: [segment('01_a', 1), segment('02_b', 2)] })
    expect(materialSay(t, cut).map((part) => part.text)).toEqual(['subtitleBadgeBoth', 'homeSegmentTotal[total=2]'])
  })

  it('warns about an episode without subtitles', () => {
    expect(materialSay(t, entry('E1', { subtitleEn: null, subtitleZh: null }))).toEqual([
      { text: 'subtitleBadgeNone', warn: true },
    ])
  })

  it('says what was kept only when something was', () => {
    expect(keptSay(t, entry('E1'))).toEqual([])
    const kept = entry('E1', { notes: { exists: true, count: 6, review: 2, hard: 1 } })
    expect(keptSay(t, kept).map((part) => part.text)).toEqual(['homeKeptReview[count=6;review=2]', 'homeHard[count=1]'])
  })
})

describe('agoOf', () => {
  const MINUTE = 60_000

  it('is now under a minute, and for a time in the future', () => {
    expect(agoOf(NOW - 59_000, NOW)).toEqual({ unit: 'now', count: 0 })
    expect(agoOf(NOW + MINUTE, NOW)).toEqual({ unit: 'now', count: 0 })
  })

  it('counts whole minutes, then hours, then days, rounding down', () => {
    expect(agoOf(NOW - 59 * MINUTE, NOW)).toEqual({ unit: 'minutes', count: 59 })
    expect(agoOf(NOW - 119 * MINUTE, NOW)).toEqual({ unit: 'hours', count: 1 })
    expect(agoOf(NOW - 24 * 60 * MINUTE, NOW)).toEqual({ unit: 'days', count: 1 })
    expect(agoOf(NOW - 71 * 60 * MINUTE, NOW)).toEqual({ unit: 'days', count: 2 })
  })
})

describe('the stage', () => {
  const file = entry('E1')
  const heard: PositionTable = { E1: { at: 664, duration: 1361, updatedAt: NOW - 2 * HOUR } }

  it('says when the episode was last heard, or that it starts here', () => {
    expect(stageKicker(t, episodeProgress(heard, file), NOW)).toBe('homeContinue · homeAgoHours[count=2]')
    expect(stageKicker(t, episodeProgress({}, file), NOW)).toBe('homeStart')
  })

  it('names the step to continue when it is done on this page, and falls back otherwise', () => {
    const summary = episodeProgress(heard, file)
    expect(stageAction(t, summary, STEPS[2] ?? null)).toBe('homeContinueStep[step=stepShadow]')
    expect(stageAction(t, summary, STEPS[3] ?? null)).toBe('resumePractice')
    expect(stageAction(t, summary, null)).toBe('resumePractice')
    expect(stageAction(t, episodeProgress({}, file), STEPS[0] ?? null)).toBe('startPractice')
  })

  it('says where a whole file resumes, and nothing before it was heard', () => {
    expect(resumeHint(t, file, episodeProgress(heard, file))).toBe('homeResumeTime[time=11:04]')
    expect(resumeHint(t, file, episodeProgress({}, file))).toBeNull()
  })

  it('names the segment and the clock, or the start of the next segment once one was heard out', () => {
    const cut = entry('E2', { segments: [segment('01_a', 1), segment('02_b', 2)] })
    const midway: PositionTable = { [segmentKey('E2', '02_b')]: { at: 252, duration: 600, updatedAt: NOW } }
    expect(resumeHint(t, cut, episodeProgress(midway, cut))).toBe('homeResumeSegment[segment=02;time=04:12]')
    const out: PositionTable = { [segmentKey('E2', '01_a')]: { at: 600, duration: 600, updatedAt: NOW } }
    expect(resumeHint(t, cut, episodeProgress(out, cut))).toBe('homeResumeSegmentStart[segment=02]')
  })
})

describe('the filter', () => {
  const entries = [entry('A'), entry('B'), entry('C'), entry('D')]
  const progress: PositionTable = { B: { at: 10, duration: 100, updatedAt: NOW } }
  const all = Object.fromEntries(STEPS.map((step) => [step.id, { done: true, seconds: 0 }]))
  const steps = { C: { blind: { done: false, seconds: 30 } }, D: all }

  it('counts each status', () => {
    expect(filterCounts(entries, progress, steps)).toEqual({ all: 4, active: 2, new: 1, done: 1 })
  })

  it('shows the episodes of one status, in order, and all of them for all', () => {
    expect(filterEpisodes(entries, 'active', progress, steps).map((item) => item.id)).toEqual(['B', 'C'])
    expect(filterEpisodes(entries, 'new', progress, steps).map((item) => item.id)).toEqual(['A'])
    expect(filterEpisodes(entries, 'all', progress, steps)).toBe(entries)
  })
})
