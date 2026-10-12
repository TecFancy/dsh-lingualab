import { describe, expect, it } from 'vitest'
import type { VideoState, VideoStatusPayload } from '../../../shared/protocol.ts'
import { cardOf, etaSeconds, isInformational, playSource, segmentKey } from './source.ts'

/** A status in a state, with a URL where that state has one. */
function status(state: VideoState, url: string | null = null): VideoStatusPayload {
  return {
    ok: true,
    reason: null,
    state,
    file: 'a.mkv',
    bytes: 100,
    url,
    via: url === null ? null : 'prepared',
    videoCodec: null,
    audioCodec: null,
    duration: null,
    mismatch: null,
    estimateBytes: null,
    progress: null,
    installCommand: null,
  }
}

describe('playSource', () => {
  const audio = '/m/E1/a.mp3'
  const video = '/m/E1/.lingualab/a.mp4'

  it('plays the audio file until the video is known to play', () => {
    expect(playSource(audio, null, null)).toEqual({ url: audio, picture: false })
    expect(playSource(audio, status('prepare'), null)).toEqual({ url: audio, picture: false })
    expect(playSource(audio, status('preparing'), null)).toEqual({ url: audio, picture: false })
    expect(playSource(audio, status('no-ffmpeg'), null)).toEqual({ url: audio, picture: false })
  })

  it('plays the video, with its picture, once it plays', () => {
    expect(playSource(audio, status('playable', video), null)).toEqual({ url: video, picture: true })
  })

  it('goes back to the audio when the browser could not decode the video', () => {
    expect(playSource(audio, status('playable', video), video)).toEqual({ url: audio, picture: false })
  })

  it('plays nothing for a video-only segment that is not prepared', () => {
    expect(playSource('', status('prepare'), null)).toEqual({ url: null, picture: false })
    expect(playSource(null, null, null)).toEqual({ url: null, picture: false })
  })

  it('plays the sound taken from a video only when the segment has no audio file of its own', () => {
    const sound = '/m/E1/.lingualab/a.m4a'
    expect(playSource('', status('sound-ready', sound), null)).toEqual({ url: sound, picture: false })
    expect(playSource(audio, status('sound-ready', sound), null)).toEqual({ url: audio, picture: false })
  })
})

describe('cardOf', () => {
  it('has no card for a video that plays, no video, or nothing known yet', () => {
    expect(cardOf(null, null)).toBeNull()
    expect(cardOf(status('playable', '/v.mp4'), null)).toBeNull()
    expect(cardOf(status('none'), null)).toBeNull()
  })

  it('has a card for each state that needs one', () => {
    const states: readonly VideoState[] = ['prepare', 'preparing', 'no-ffmpeg', 'sound-only', 'sound-ready', 'failed', 'unplayable']
    expect(states.map((state) => cardOf(status(state), null))).toEqual(states)
  })

  it('turns a video the browser could not decode into the unplayable card', () => {
    expect(cardOf(status('playable', '/v.mp4'), '/v.mp4')).toBe('unplayable')
    expect(cardOf(status('playable', '/v.mp4'), '/other.mp4')).toBeNull()
  })
})

describe('isInformational', () => {
  it('is true only for the cards that ask nothing of the reader', () => {
    expect(isInformational('unplayable')).toBe(true)
    expect(isInformational('sound-only')).toBe(true)
    expect(isInformational('sound-ready')).toBe(true)
    expect(isInformational('prepare')).toBe(false)
    expect(isInformational('preparing')).toBe(false)
    expect(isInformational('no-ffmpeg')).toBe(false)
    expect(isInformational('failed')).toBe(false)
  })
})

describe('segmentKey', () => {
  it('names one segment of one episode', () => {
    expect(segmentKey('E1', '01')).not.toBe(segmentKey('E1', '02'))
    expect(segmentKey('E1', null)).not.toBe(segmentKey('E1', '01'))
    expect(segmentKey(null, null)).toBeNull()
  })
})

describe('etaSeconds', () => {
  it('guesses from the pace so far, and says nothing too early', () => {
    expect(etaSeconds(10, 0.5)).toBe(10)
    expect(etaSeconds(27, 0.42)).toBe(37)
    expect(etaSeconds(0.2, 0.5)).toBeNull()
    expect(etaSeconds(10, 0)).toBeNull()
    expect(etaSeconds(10, 1)).toBeNull()
  })
})
