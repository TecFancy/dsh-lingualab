import { afterEach, describe, expect, it, vi } from 'vitest'
import { playTake, primeTakeAudio, silentWav, setTakeAudioFactory, type AudioLike } from './take-player.ts'
import type { Take } from './take.ts'

const take: Take = { url: 'blob:take', mime: 'audio/webm', ms: 2000 }

interface FakeAudio extends AudioLike {
  /** The attributes removed, and the `src` it had at each `play()`. */
  removed: string[]
  played: string[]
  paused: number
  loads: number
}

/** An audio element the test drives by hand; `play` decides what the browser does with each play. */
function fakeAudio(play: (audio: FakeAudio) => Promise<void> | undefined = () => Promise.resolve()): FakeAudio {
  const audio: FakeAudio = {
    src: '',
    onended: null,
    onerror: null,
    removed: [],
    played: [],
    paused: 0,
    loads: 0,
    play() {
      audio.played.push(audio.src)
      return play(audio)
    },
    pause() {
      audio.paused += 1
    },
    removeAttribute(name) {
      audio.removed.push(name)
      if (name === 'src') audio.src = ''
    },
    load() {
      audio.loads += 1
    },
  }
  return audio
}

/** Make the player use one fake element, and count how often it was asked to make one. */
function install(audio: FakeAudio): { made: () => number } {
  let made = 0
  setTakeAudioFactory(() => {
    made += 1
    return audio
  })
  return { made: () => made }
}

afterEach(() => {
  setTakeAudioFactory()
})

describe('playTake', () => {
  it('plays the take on the shared element and says so when it ends, releasing its source', () => {
    const audio = fakeAudio()
    install(audio)
    const ended = vi.fn()
    playTake(take, { ended, failed: vi.fn() })
    expect(audio.played).toEqual(['blob:take'])
    audio.onended?.(new Event('ended'))
    expect(ended).toHaveBeenCalledTimes(1)
    expect(audio.removed).toEqual(['src'])
    expect(audio.paused).toBe(1)
    expect(audio.loads).toBe(1)
  })

  it('uses the same element for every take, made once, and keeps it when a take is released', () => {
    const audio = fakeAudio()
    const { made } = install(audio)
    const first = vi.fn()
    playTake(take, { ended: first, failed: vi.fn() })
    audio.onended?.(new Event('ended'))
    const second = vi.fn()
    playTake({ ...take, url: 'blob:second' }, { ended: second, failed: vi.fn() })
    expect(audio.played).toEqual(['blob:take', 'blob:second'])
    audio.onended?.(new Event('ended'))
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
    expect(made()).toBe(1)
  })

  it('keeps the element when a take is cancelled, so it stays unlocked', () => {
    const audio = fakeAudio()
    const { made } = install(audio)
    playTake(take, { ended: vi.fn(), failed: vi.fn() })()
    playTake(take, { ended: vi.fn(), failed: vi.fn() })
    expect(made()).toBe(1)
    expect(audio.played).toHaveLength(2)
  })

  it('says it failed when the browser refuses to play it, or cannot decode it', async () => {
    install(fakeAudio(() => Promise.reject(new Error('blocked'))))
    const refused = vi.fn()
    playTake(take, { ended: vi.fn(), failed: refused })
    await vi.waitFor(() => expect(refused).toHaveBeenCalledTimes(1))

    const broken = fakeAudio()
    install(broken)
    const decode = vi.fn()
    playTake(take, { ended: vi.fn(), failed: decode })
    broken.onerror?.(new Event('error'))
    expect(decode).toHaveBeenCalledTimes(1)
  })

  it('stops and stays quiet when cancelled, so a comparison the reader left plays nothing on', () => {
    const audio = fakeAudio()
    install(audio)
    const hooks = { ended: vi.fn(), failed: vi.fn() }
    const cancel = playTake(take, hooks)
    cancel()
    expect(audio.paused).toBe(1)
    expect(audio.onended).toBeNull()
    expect(audio.onerror).toBeNull()
    expect(audio.removed).toEqual(['src'])
    cancel()
    expect(audio.paused).toBe(1)
    expect(hooks.ended).not.toHaveBeenCalled()
    expect(hooks.failed).not.toHaveBeenCalled()
  })

  it('lets go of a take that never reports its end, a few seconds after its own length', () => {
    vi.useFakeTimers()
    try {
      install(fakeAudio())
      const ended = vi.fn()
      playTake(take, { ended, failed: vi.fn() })
      vi.advanceTimersByTime(4999)
      expect(ended).not.toHaveBeenCalled()
      vi.advanceTimersByTime(2)
      expect(ended).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('reports once, whichever of the end and the timeout comes first', () => {
    vi.useFakeTimers()
    try {
      const audio = fakeAudio()
      install(audio)
      const ended = vi.fn()
      playTake(take, { ended, failed: vi.fn() })
      audio.onended?.(new Event('ended'))
      vi.advanceTimersByTime(10_000)
      expect(ended).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('primeTakeAudio', () => {
  it('plays a silent clip on the element and pauses it again, once it has been accepted', async () => {
    const audio = fakeAudio()
    const { made } = install(audio)
    primeTakeAudio()
    expect(made()).toBe(1)
    expect(audio.played).toHaveLength(1)
    expect(audio.played[0]).toMatch(/^data:audio\/wav;base64,/)
    await vi.waitFor(() => expect(audio.paused).toBe(1))
  })

  it('does nothing once it is done, however many gestures follow', async () => {
    const audio = fakeAudio()
    const { made } = install(audio)
    primeTakeAudio()
    await vi.waitFor(() => expect(audio.paused).toBe(1))
    primeTakeAudio()
    primeTakeAudio()
    expect(audio.played).toHaveLength(1)
    expect(made()).toBe(1)
  })

  it('leaves the element unprimed when the browser refuses, so the next gesture tries again', async () => {
    let allow = false
    const audio = fakeAudio(() => (allow ? Promise.resolve() : Promise.reject(new Error('needs a gesture'))))
    install(audio)
    primeTakeAudio()
    // Wait for the rejection to have been handled.
    await Promise.resolve()
    await Promise.resolve()
    expect(audio.paused).toBe(0)
    allow = true
    primeTakeAudio()
    await vi.waitFor(() => expect(audio.paused).toBe(1))
    expect(audio.played).toHaveLength(2)
    primeTakeAudio()
    expect(audio.played).toHaveLength(2)
  })

  it('shares its element with the takes, so what it unlocks is what plays them', async () => {
    const audio = fakeAudio()
    const { made } = install(audio)
    primeTakeAudio()
    await vi.waitFor(() => expect(audio.paused).toBe(1))
    playTake(take, { ended: vi.fn(), failed: vi.fn() })
    expect(made()).toBe(1)
    expect(audio.played.at(-1)).toBe('blob:take')
  })

  it('does not pause a take that started while the clip was still being accepted', async () => {
    let accept: () => void = () => undefined
    const audio = fakeAudio(() => new Promise<void>((resolve) => (accept = resolve)))
    install(audio)
    primeTakeAudio()
    playTake(take, { ended: vi.fn(), failed: vi.fn() })
    accept()
    await Promise.resolve()
    await Promise.resolve()
    expect(audio.paused).toBe(0)
  })
})

describe('silentWav', () => {
  it('is a well-formed WAV of silence', () => {
    const uri = silentWav()
    const bytes = Uint8Array.from(atob(uri.slice('data:audio/wav;base64,'.length)), (char) => char.charCodeAt(0))
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe('RIFF')
    expect(String.fromCharCode(...bytes.slice(8, 12))).toBe('WAVE')
    expect(bytes.length).toBe(844)
    expect(new Set(bytes.slice(44))).toEqual(new Set([128]))
  })
})
