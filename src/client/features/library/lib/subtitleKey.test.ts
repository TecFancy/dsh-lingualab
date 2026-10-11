import { describe, expect, it } from 'vitest'
import type { EpisodeEntry, EpisodeMedia, EpisodeSegment } from '../../../shared/protocol.ts'
import { subtitleKey } from './subtitleKey.ts'

const entry = (patch: Partial<EpisodeEntry> = {}): EpisodeEntry => ({
  id: 'file.02',
  title: '02_足球场',
  audio: '02.mp3',
  audioBytes: 1024,
  subtitleEn: '02.en.srt',
  subtitleZh: null,
  segments: [],
  notes: { exists: false, count: 0, review: 0, hard: 0 },
  kind: 'file',
  source: '/media/02.mp3',
  ...patch,
})

const segment = (id: string, patch: Partial<EpisodeSegment> = {}): EpisodeSegment => ({
  id,
  index: 1,
  title: id,
  audio: id + '.mp3',
  audioBytes: 1,
  subtitleEn: id + '.srt',
  subtitleZh: null,
  ...patch,
})

const media = (patch: Partial<EpisodeMedia> = {}): EpisodeMedia => ({
  audioUrl: '/lingualab/file-media/file.02/02.mp3',
  subtitleEnUrl: '/lingualab/file-media/file.02/02.en.srt',
  subtitleZhUrl: null,
  ...patch,
})

describe('the subtitle key', () => {
  it('is the same when the open episode is opened again with equal values', () => {
    // Fresh objects each time, as the host hands them back on every open.
    expect(subtitleKey(entry(), media())).toBe(subtitleKey(entry(), media()))
  })

  it('changes with the episode, the track URLs or the track names', () => {
    const base = subtitleKey(entry(), media())
    expect(subtitleKey(entry({ id: 'file.03' }), media())).not.toBe(base)
    expect(subtitleKey(entry(), media({ subtitleZhUrl: '/lingualab/file-media/file.02/02.zh.srt' }))).not.toBe(base)
    expect(subtitleKey(entry({ subtitleEn: '02.en.vtt' }), media())).not.toBe(base)
  })

  it('changes with the segment of a folder episode, because the files differ', () => {
    const folder = entry({ id: 'S01E01', kind: 'folder', segments: [segment('01_a'), segment('02_b')] })
    const first = subtitleKey(folder, media({ subtitleEnUrl: '/m/01_a.srt' }), segment('01_a'))
    const second = subtitleKey(folder, media({ subtitleEnUrl: '/m/02_b.srt' }), segment('02_b'))
    expect(second).not.toBe(first)
  })

  it('changes with the segment even when two segments happen to share their subtitle URLs', () => {
    const folder = entry({ id: 'S01E01', kind: 'folder' })
    expect(subtitleKey(folder, media(), segment('01_a'))).not.toBe(subtitleKey(folder, media(), segment('02_b')))
  })

  it('is the same when the open segment is opened again with equal values', () => {
    const folder = entry({ id: 'S01E01', kind: 'folder' })
    expect(subtitleKey(folder, media(), segment('02_b'))).toBe(subtitleKey({ ...folder }, { ...media() }, segment('02_b')))
  })

  it('reads the track names from the segment, not from the entry that mirrors the first one', () => {
    const folder = entry({ id: 'S01E01', kind: 'folder', subtitleEn: '01_a.srt' })
    expect(subtitleKey(folder, media(), segment('02_b', { subtitleEn: '02_b.vtt' }))).not.toBe(
      subtitleKey(folder, media(), segment('02_b', { subtitleEn: '02_b.srt' })),
    )
  })
})
