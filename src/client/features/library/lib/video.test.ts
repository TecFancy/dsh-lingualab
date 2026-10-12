import { describe, expect, it } from 'vitest'
import type { EpisodeSegment, VideoRef } from '../../../shared/protocol.ts'
import { hasMedia, hasVideo, isVideoOnly, videoMarkOf } from './video.ts'

const video = (state: VideoRef['state']): VideoRef => ({ file: 'a.mkv', bytes: 1, state })
const segment = (audio: string | null, ref: VideoRef | null): Pick<EpisodeSegment, 'audio' | 'video'> => ({ audio, video: ref })

describe('videoMarkOf', () => {
  it('has no mark for an episode without a video', () => {
    expect(videoMarkOf({ video: null, segments: [] })).toBe('none')
  })

  it('reads the own video of the folder when there are no segments', () => {
    expect(videoMarkOf({ video: video('unprepared'), segments: [] })).toBe('unprepared')
    expect(videoMarkOf({ video: video('ready'), segments: [] })).toBe('ready')
    expect(videoMarkOf({ video: video('sound'), segments: [] })).toBe('ready')
  })

  it('reads the segments when there are some, and says not prepared if any one is not', () => {
    const base = { id: 's', index: 1, title: 's', audioBytes: null, subtitleEn: null, subtitleZh: null }
    const segments: EpisodeSegment[] = [
      { ...base, audio: 'a.mp3', video: video('ready') },
      { ...base, audio: 'b.mp3', video: null },
    ]
    expect(videoMarkOf({ video: video('ready'), segments })).toBe('ready')
    const withOneToPrepare = [...segments, { ...base, audio: null, video: video('unprepared') }]
    expect(videoMarkOf({ video: video('ready'), segments: withOneToPrepare })).toBe('unprepared')
    expect(videoMarkOf({ video: null, segments: [{ ...base, audio: 'a.mp3', video: null }] })).toBe('none')
  })
})

describe('segment helpers', () => {
  it('tells a segment with a video, a video-only segment, and an episode with anything to play', () => {
    expect(hasVideo(segment('a.mp3', video('ready')))).toBe(true)
    expect(hasVideo(segment('a.mp3', null))).toBe(false)
    expect(isVideoOnly(segment(null, video('ready')))).toBe(true)
    expect(isVideoOnly(segment('a.mp3', video('ready')))).toBe(false)
    expect(hasMedia({ audio: null, video: video('ready') })).toBe(true)
    expect(hasMedia({ audio: 'a.mp3', video: null })).toBe(true)
    expect(hasMedia({ audio: null, video: null })).toBe(false)
  })
})
