import { describe, expect, it, vi } from 'vitest'
import { playTake, type AudioLike } from './take-player.ts'
import type { Take } from './take.ts'

const take: Take = { url: 'blob:take', mime: 'audio/webm', ms: 2000 }

/** An audio element the test drives by hand. */
function fakeAudio(play: () => Promise<void> | undefined = () => Promise.resolve()): AudioLike & { removed: string[]; paused: number } {
  const audio = {
    onended: null as AudioLike['onended'],
    onerror: null as AudioLike['onerror'],
    removed: [] as string[],
    paused: 0,
    play,
    pause(): void {
      audio.paused += 1
    },
    removeAttribute(name: string): void {
      audio.removed.push(name)
    },
    load(): void {
      // Nothing to reload.
    },
  }
  return audio
}

describe('playTake', () => {
  it('plays the take from its own element and says so when it ends, releasing the element', () => {
    const audio = fakeAudio()
    const made: string[] = []
    const ended = vi.fn()
    playTake(take, { ended, failed: vi.fn() }, (url) => {
      made.push(url)
      return audio
    })
    expect(made).toEqual(['blob:take'])
    audio.onended?.(new Event('ended'))
    expect(ended).toHaveBeenCalledTimes(1)
    expect(audio.removed).toEqual(['src'])
    expect(audio.paused).toBe(1)
  })

  it('says it failed when the browser refuses to play it, or cannot decode it', async () => {
    const refused = vi.fn()
    playTake(take, { ended: vi.fn(), failed: refused }, () => fakeAudio(() => Promise.reject(new Error('blocked'))))
    await vi.waitFor(() => expect(refused).toHaveBeenCalledTimes(1))

    const broken = fakeAudio()
    const decode = vi.fn()
    playTake(take, { ended: vi.fn(), failed: decode }, () => broken)
    broken.onerror?.(new Event('error'))
    expect(decode).toHaveBeenCalledTimes(1)
  })

  it('stops and stays quiet when cancelled, so a comparison the reader left plays nothing on', () => {
    const audio = fakeAudio()
    const hooks = { ended: vi.fn(), failed: vi.fn() }
    const cancel = playTake(take, hooks, () => audio)
    cancel()
    expect(audio.paused).toBe(1)
    expect(audio.onended).toBeNull()
    cancel()
    expect(audio.paused).toBe(1)
    expect(hooks.ended).not.toHaveBeenCalled()
    expect(hooks.failed).not.toHaveBeenCalled()
  })

  it('lets go of a take that never reports its end, a few seconds after its own length', () => {
    vi.useFakeTimers()
    try {
      const ended = vi.fn()
      playTake(take, { ended, failed: vi.fn() }, () => fakeAudio())
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
      const ended = vi.fn()
      playTake(take, { ended, failed: vi.fn() }, () => audio)
      audio.onended?.(new Event('ended'))
      vi.advanceTimersByTime(10_000)
      expect(ended).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })
})
