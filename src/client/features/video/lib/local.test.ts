import { afterEach, describe, expect, it, vi } from 'vitest'
import { isVideoFile, localMismatch, probeLength, referenceSeconds, type ProbeElement } from './local.ts'

describe('isVideoFile', () => {
  it('takes a media type that says video', () => {
    expect(isVideoFile({ name: 'a', type: 'video/mp4' })).toBe(true)
    expect(isVideoFile({ name: 'a.bin', type: 'video/x-matroska' })).toBe(true)
  })

  it('takes a video extension when the browser gave no type, as it often does for mkv', () => {
    for (const name of ['a.mkv', 'A.MKV', 'a.mp4', 'a.m4v', 'a.webm', 'a.mov', 'a.b.mkv']) {
      expect(isVideoFile({ name, type: '' })).toBe(true)
    }
  })

  it('refuses everything else', () => {
    expect(isVideoFile({ name: 'a.srt', type: '' })).toBe(false)
    expect(isVideoFile({ name: 'a.mp3', type: 'audio/mpeg' })).toBe(false)
    expect(isVideoFile({ name: 'mkv', type: '' })).toBe(false)
    expect(isVideoFile({ name: 'a.mkv.txt', type: 'text/plain' })).toBe(false)
  })
})

describe('referenceSeconds', () => {
  it('prefers the length the host probed for the served video', () => {
    expect(referenceSeconds(1379.2, 1380)).toBe(1379.2)
  })

  it('falls back to the audio file, which the subtitles were timed against', () => {
    expect(referenceSeconds(null, 1380)).toBe(1380)
    expect(referenceSeconds(0, 1380)).toBe(1380)
    expect(referenceSeconds(Number.NaN, 1380)).toBe(1380)
  })

  it('is unknown when nothing says', () => {
    expect(referenceSeconds(null, null)).toBeNull()
    expect(referenceSeconds(null, 0)).toBeNull()
    expect(referenceSeconds(null, Number.POSITIVE_INFINITY)).toBeNull()
  })
})

describe('localMismatch', () => {
  it('takes a file within a second of the reference for the same file', () => {
    expect(localMismatch(1379.5, 1379)).toBeNull()
    expect(localMismatch(1378, 1379)).toBeNull()
    expect(localMismatch(1380, 1379)).toBeNull()
  })

  it('says how much longer the file is, positive, when it differs by more than a second', () => {
    expect(localMismatch(1384.04, 1379)).toBe(5)
    expect(localMismatch(1380.5, 1379)).toBe(1.5)
  })

  it('says how much shorter, negative', () => {
    expect(localMismatch(1370, 1379.2)).toBe(-9.2)
  })

  it('has nothing to say while either length is unknown', () => {
    expect(localMismatch(null, 1379)).toBeNull()
    expect(localMismatch(1379, null)).toBeNull()
    expect(localMismatch(Number.NaN, 1379)).toBeNull()
    expect(localMismatch(0, 1379)).toBeNull()
  })
})

/** A media element that can be told what happened to it. */
class FakeElement implements ProbeElement {
  preload = ''
  muted = false
  src = ''
  duration = Number.NaN
  loads = 0
  private readonly listeners = new Map<string, Set<() => void>>()
  addEventListener(type: string, listener: () => void): void {
    const set = this.listeners.get(type) ?? new Set<() => void>()
    set.add(listener)
    this.listeners.set(type, set)
  }
  removeEventListener(type: string, listener: () => void): void {
    this.listeners.get(type)?.delete(listener)
  }
  removeAttribute(name: string): void {
    if (name === 'src') this.src = ''
  }
  load(): void {
    this.loads += 1
  }
  emit(type: string): void {
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener()
  }
  count(type: string): number {
    return this.listeners.get(type)?.size ?? 0
  }
}

describe('probeLength', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('asks a throwaway element for the length of a URL and lets the file go', async () => {
    const element = new FakeElement()
    const pending = probeLength('blob:x', () => element)
    expect(element.src).toBe('blob:x')
    expect(element.preload).toBe('metadata')
    element.duration = 1379.24
    element.emit('loadedmetadata')
    await expect(pending).resolves.toBe(1379.24)
    expect(element.src).toBe('')
    expect(element.loads).toBe(1)
    expect(element.count('loadedmetadata')).toBe(0)
    expect(element.count('error')).toBe(0)
  })

  it('says unknown for a length the browser does not give (a stream, or nothing)', async () => {
    const element = new FakeElement()
    const pending = probeLength('blob:x', () => element)
    element.duration = Number.POSITIVE_INFINITY
    element.emit('loadedmetadata')
    await expect(pending).resolves.toBeNull()
  })

  it('says unknown when the browser cannot decode the file', async () => {
    const element = new FakeElement()
    const pending = probeLength('blob:x', () => element)
    element.emit('error')
    await expect(pending).resolves.toBeNull()
  })

  it('stops waiting after a while', async () => {
    vi.useFakeTimers()
    const element = new FakeElement()
    const pending = probeLength('blob:x', () => element)
    await vi.advanceTimersByTimeAsync(15_000)
    await expect(pending).resolves.toBeNull()
    expect(element.src).toBe('')
  })
})
