import { describe, expect, it } from 'vitest'
import type { VideoStatusPayload } from '../../../shared/protocol.ts'
import { estimateText, etaUnit, smoothControlOf, wholeMinutes } from './smooth.ts'

/** A playable status with the smooth version's fields patched. */
function playable(patch: Partial<VideoStatusPayload> = {}, smooth: Partial<VideoStatusPayload['smooth']> = {}): VideoStatusPayload {
  return {
    ok: true,
    reason: null,
    state: 'playable',
    file: 'a.mp4',
    bytes: 100,
    url: '/v.mp4',
    via: 'direct',
    videoCodec: 'h264',
    audioCodec: 'aac',
    duration: 100,
    mismatch: null,
    estimateBytes: null,
    progress: null,
    jobKind: null,
    smooth: { offer: false, estimateBytes: null, estimateSeconds: null, revert: false, error: null, ...smooth },
    installCommand: null,
    ...patch,
  }
}

describe('smoothControlOf', () => {
  it('offers the smooth version where it can be made, and nothing where it cannot', () => {
    expect(smoothControlOf(playable({}, { offer: true }))).toEqual({ kind: 'offer' })
    expect(smoothControlOf(playable())).toBeNull()
    expect(smoothControlOf(null)).toBeNull()
  })

  it('offers the way back once the smooth file plays', () => {
    expect(smoothControlOf(playable({ via: 'smooth' }, { revert: true }))).toEqual({ kind: 'revert' })
  })

  it('shows the progress of a smooth job while the picture keeps playing, whatever else is on offer', () => {
    const running = playable({ jobKind: 'smooth', progress: { fraction: 0.4, seconds: 40, total: 100 } }, { offer: false, revert: true })
    expect(smoothControlOf(running)).toEqual({ kind: 'running', fraction: 0.4 })
  })

  it('says nothing for a state that has no picture to carry it', () => {
    expect(smoothControlOf(playable({ state: 'prepare' }, { offer: true }))).toBeNull()
    expect(smoothControlOf(playable({ state: 'preparing', jobKind: 'smooth', progress: { fraction: 0, seconds: 0, total: 10 } }))).toBeNull()
  })
})

describe('estimateText', () => {
  it('words the size and the time, in whole minutes', () => {
    expect(estimateText(330_000_000, 920, '315 MB')).toEqual({ key: 'smoothEstimate', titleKey: 'smoothEstimateTitle', params: { size: '315 MB', minutes: 16 } })
  })

  it('says "under a minute" for a short video, and gives the size alone when the length is unknown', () => {
    expect(estimateText(1_000_000, 30, '1 MB')).toEqual({ key: 'smoothEstimateShort', titleKey: 'smoothEstimateShortTitle', params: { size: '1 MB' } })
    expect(estimateText(1_000_000, null, '1 MB')).toEqual({ key: 'smoothEstimateSize', titleKey: 'smoothEstimateSizeTitle', params: { size: '1 MB' } })
  })

  it('has nothing to say without a size', () => {
    expect(estimateText(null, 100, '')).toBeNull()
  })
})

describe('wholeMinutes and etaUnit', () => {
  it('rounds up and never says zero', () => {
    expect(wholeMinutes(1)).toBe(1)
    expect(wholeMinutes(60)).toBe(1)
    expect(wholeMinutes(61)).toBe(2)
  })

  it('counts seconds under two minutes and minutes after', () => {
    expect(etaUnit(90)).toEqual({ unit: 'seconds', value: 90 })
    expect(etaUnit(120)).toEqual({ unit: 'minutes', value: 2 })
    expect(etaUnit(541)).toEqual({ unit: 'minutes', value: 10 })
  })
})
