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
    expect(playSource(audio, null, null, false)).toEqual({ url: audio, picture: false })
    expect(playSource(audio, status('prepare'), null, false)).toEqual({ url: audio, picture: false })
    expect(playSource(audio, status('preparing'), null, false)).toEqual({ url: audio, picture: false })
    expect(playSource(audio, status('no-ffmpeg'), null, false)).toEqual({ url: audio, picture: false })
  })

  it('plays the video, with its picture, once it plays', () => {
    expect(playSource(audio, status('playable', video), null, false)).toEqual({ url: video, picture: true })
  })

  it('goes back to the audio when the browser could not decode the video', () => {
    expect(playSource(audio, status('playable', video), video, false)).toEqual({ url: audio, picture: false })
  })

  it('plays nothing for a video-only segment that is not prepared', () => {
    expect(playSource('', status('prepare'), null, false)).toEqual({ url: null, picture: false })
    expect(playSource(null, null, null, false)).toEqual({ url: null, picture: false })
  })

  it('plays the audio file while the picture is hidden, so the video is not downloaded', () => {
    expect(playSource(audio, status('playable', video), null, true)).toEqual({ url: audio, picture: false })
  })

  it('keeps playing the video while the picture is hidden when it is the only sound there is', () => {
    expect(playSource('', status('playable', video), null, true)).toEqual({ url: video, picture: true })
    expect(playSource(null, status('playable', video), null, true)).toEqual({ url: video, picture: true })
  })

  it('has nothing to change when the picture is hidden and the video does not play', () => {
    expect(playSource(audio, null, null, true)).toEqual({ url: audio, picture: false })
    expect(playSource(audio, status('prepare'), null, true)).toEqual({ url: audio, picture: false })
    expect(playSource('', status('prepare'), null, true)).toEqual({ url: null, picture: false })
  })

  it('plays the sound taken from a video only when the segment has no audio file of its own', () => {
    const sound = '/m/E1/.lingualab/a.m4a'
    expect(playSource('', status('sound-ready', sound), null, false)).toEqual({ url: sound, picture: false })
    expect(playSource(audio, status('sound-ready', sound), null, false)).toEqual({ url: audio, picture: false })
  })
})

describe('playSource with a file from the reader own disk', () => {
  const audio = '/m/E1/a.mp3'
  const video = '/m/E1/.lingualab/a.mp4'
  const local = 'blob:http://host/1'

  it('plays it ahead of the served video, with its picture', () => {
    expect(playSource(audio, status('playable', video), null, false, local)).toEqual({ url: local, picture: true })
  })

  it('plays it whatever state the served video is in, or none at all', () => {
    for (const state of ['prepare', 'preparing', 'no-ffmpeg', 'sound-only', 'sound-ready', 'failed', 'unplayable'] as const) {
      expect(playSource(audio, status(state), null, false, local)).toEqual({ url: local, picture: true })
    }
    expect(playSource(audio, null, null, false, local)).toEqual({ url: local, picture: true })
    expect(playSource(null, status('prepare'), null, false, local)).toEqual({ url: local, picture: true })
  })

  it('leaves the audio file playing while the picture is hidden, as for a served video', () => {
    expect(playSource(audio, status('playable', video), null, true, local)).toEqual({ url: audio, picture: false })
    expect(playSource(audio, status('prepare'), null, true, local)).toEqual({ url: audio, picture: false })
  })

  it('plays it even hidden when it is the only sound there is', () => {
    expect(playSource('', status('prepare'), null, true, local)).toEqual({ url: local, picture: true })
    expect(playSource(null, null, null, true, local)).toEqual({ url: local, picture: true })
  })

  it('is given up on like any URL the browser could not decode, and the served source plays again', () => {
    expect(playSource(audio, status('playable', video), local, false, local)).toEqual({ url: video, picture: true })
    expect(playSource(audio, status('prepare'), local, false, local)).toEqual({ url: audio, picture: false })
  })

  it('changes nothing without one', () => {
    expect(playSource(audio, status('playable', video), null, false, null)).toEqual({ url: video, picture: true })
    expect(playSource(audio, status('playable', video), null, false, '')).toEqual({ url: video, picture: true })
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
