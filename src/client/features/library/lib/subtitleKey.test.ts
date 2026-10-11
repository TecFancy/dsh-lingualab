import { describe, expect, it } from 'vitest'
import type { EpisodeEntry, EpisodeMedia } from '../../../shared/protocol.ts'
import { subtitleKey } from './subtitleKey.ts'

const entry = (patch: Partial<EpisodeEntry> = {}): EpisodeEntry => ({
  id: 'file.02',
  title: '02_足球场',
  audio: '02.mp3',
  audioBytes: 1024,
  subtitleEn: '02.en.srt',
  subtitleZh: null,
  notes: { exists: false, count: 0, review: 0, hard: 0 },
  kind: 'file',
  source: '/media/02.mp3',
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
})
