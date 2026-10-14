import { describe, expect, it, vi, type Mock } from 'vitest'
import {
  MIN_TAKE_MS,
  beginCapture,
  canRecord,
  failureOf,
  pickMimeType,
  probeMic,
  recordPause,
  type MicFailure,
  type RecordedTake,
  type RecorderClass,
  type RecorderEnv,
  type RecorderLike,
  type RecordingHooks,
  type StreamLike,
} from './recorder.ts'

/** A stream with tracks that count how often they were stopped. */
function fakeStream(): { stream: StreamLike; stops: ReturnType<typeof vi.fn> } {
  const stops = vi.fn()
  return { stream: { getTracks: () => [{ stop: stops }, { stop: stops }] }, stops }
}

interface Fake {
  readonly env: RecorderEnv
  readonly clock: { now: number }
  readonly made: FakeRecorder[]
  /** The options the recorder was built with. */
  readonly options: (unknown | undefined)[]
}

class FakeRecorder implements RecorderLike {
  state = 'inactive'
  mimeType: string
  ondataavailable: ((event: { readonly data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(mimeType: string) {
    this.mimeType = mimeType
  }
  start(): void {
    this.state = 'recording'
  }
  /** Like the browser: the last data arrives, then the stop event. */
  stop(): void {
    this.state = 'inactive'
    this.ondataavailable?.({ data: new Blob(['voice'], { type: this.mimeType }) })
    this.onstop?.()
  }
}

/** A browser with a microphone and a recorder that supports the listed types. */
function fake(supported: readonly string[] | null, grant: StreamLike | (() => Promise<StreamLike> | StreamLike)): Fake {
  const made: FakeRecorder[] = []
  const options: (unknown | undefined)[] = []
  const clock = { now: 1000 }
  class Recorder extends FakeRecorder {
    static isTypeSupported = supported === null ? undefined : (type: string): boolean => supported.includes(type)
    constructor(_stream: StreamLike, opts?: { readonly mimeType?: string }) {
      super(opts?.mimeType ?? '')
      options.push(opts)
      made.push(this)
    }
  }
  return {
    env: { getUserMedia: () => Promise.resolve(typeof grant === 'function' ? grant() : grant), Recorder: Recorder as unknown as RecorderClass, now: () => clock.now },
    clock,
    made,
    options,
  }
}

describe('pickMimeType', () => {
  it('takes WebM where the browser records it (Chrome) and MP4 where it only records that (Safari)', () => {
    expect(pickMimeType({ isTypeSupported: (type) => type === 'audio/webm;codecs=opus' || type === 'audio/webm' })).toBe(
      'audio/webm;codecs=opus',
    )
    expect(pickMimeType({ isTypeSupported: (type) => type === 'audio/mp4' })).toBe('audio/mp4')
  })

  it('lets the browser choose when it names none of them, or cannot be asked', () => {
    expect(pickMimeType({ isTypeSupported: () => false })).toBe('')
    expect(pickMimeType({})).toBe('')
  })
})

describe('failureOf', () => {
  it('calls a refusal denied and anything else unavailable', () => {
    expect(failureOf({ name: 'NotAllowedError' })).toBe('denied')
    expect(failureOf({ name: 'SecurityError' })).toBe('denied')
    expect(failureOf({ name: 'NotFoundError' })).toBe('unavailable')
    expect(failureOf(new Error('busy'))).toBe('unavailable')
    expect(failureOf(undefined)).toBe('unavailable')
  })
})

describe('canRecord', () => {
  it('needs both a microphone API and a recorder', () => {
    expect(canRecord({})).toBe(false)
    expect(canRecord({ getUserMedia: () => Promise.reject(new Error('no')) })).toBe(false)
    expect(canRecord(fake([], fakeStream().stream).env)).toBe(true)
  })
})

describe('beginCapture', () => {
  it('is unsupported without a microphone API or a recorder, which is an insecure page', async () => {
    expect(await beginCapture({})).toEqual({ ok: false, reason: 'unsupported' })
  })

  it('reports a refused permission as denied, and any other failure as unavailable', async () => {
    const refused = fake(['audio/webm'], () => {
      throw Object.assign(new Error('no'), { name: 'NotAllowedError' })
    })
    expect(await beginCapture(refused.env)).toEqual({ ok: false, reason: 'denied' })
    const busy = fake(['audio/webm'], () => {
      throw Object.assign(new Error('busy'), { name: 'NotReadableError' })
    })
    expect(await beginCapture(busy.env)).toEqual({ ok: false, reason: 'unavailable' })
  })

  it('records with the supported format, and hands back the take with its type and length', async () => {
    const browser = fake(['audio/mp4'], fakeStream().stream)
    const start = await beginCapture(browser.env)
    if (!start.ok) throw new Error('expected a recording')
    expect(browser.options).toEqual([{ mimeType: 'audio/mp4' }])
    browser.clock.now += 2500
    const take = await start.capture.stop()
    expect(take).toMatchObject({ mime: 'audio/mp4', ms: 2500 })
    expect(take?.blob.size).toBeGreaterThan(0)
  })

  it('stops every track of the stream when the recording ends, even a take that is thrown away', async () => {
    const tracks = fakeStream()
    const browser = fake(['audio/webm'], tracks.stream)
    const start = await beginCapture(browser.env)
    if (!start.ok) throw new Error('expected a recording')
    expect(tracks.stops).not.toHaveBeenCalled()
    browser.clock.now += MIN_TAKE_MS - 1
    expect(await start.capture.stop()).toBeNull()
    expect(tracks.stops).toHaveBeenCalledTimes(2)
  })

  it('releases the microphone and says unavailable when the recorder cannot start', async () => {
    const tracks = fakeStream()
    class Broken extends FakeRecorder {
      static isTypeSupported = (): boolean => true
      override start(): void {
        throw new Error('no')
      }
    }
    const result = await beginCapture({
      getUserMedia: () => Promise.resolve(tracks.stream),
      Recorder: Broken as unknown as RecorderClass,
    })
    expect(result).toEqual({ ok: false, reason: 'unavailable' })
    expect(tracks.stops).toHaveBeenCalledTimes(2)
  })

  it('stops the tracks and gives a take once, however often stop is called', async () => {
    const tracks = fakeStream()
    const browser = fake(['audio/webm'], tracks.stream)
    const start = await beginCapture(browser.env)
    if (!start.ok) throw new Error('expected a recording')
    browser.clock.now += 1500
    const first = start.capture.stop()
    const second = start.capture.stop()
    expect(await first).toBe(await second)
    expect(tracks.stops).toHaveBeenCalledTimes(2)
  })

  it('gives up on a recorder that never says it stopped, and still releases the microphone', async () => {
    vi.useFakeTimers()
    try {
      const tracks = fakeStream()
      class Silent extends FakeRecorder {
        static isTypeSupported = (): boolean => true
        override stop(): void {
          // The browser never fires `stop`.
        }
      }
      const start = await beginCapture({
        getUserMedia: () => Promise.resolve(tracks.stream),
        Recorder: Silent as unknown as RecorderClass,
        now: Date.now,
      })
      if (!start.ok) throw new Error('expected a recording')
      const pending = start.capture.stop()
      await vi.advanceTimersByTimeAsync(2500)
      expect(await pending).toBeNull()
      expect(tracks.stops).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('probeMic', () => {
  it('asks once and gives the microphone straight back', async () => {
    const tracks = fakeStream()
    const browser = fake(['audio/webm'], tracks.stream)
    expect(await probeMic(browser.env)).toEqual({ ok: true })
    expect(tracks.stops).toHaveBeenCalledTimes(2)
  })

  it('reports why not', async () => {
    expect(await probeMic({})).toEqual({ ok: false, reason: 'unsupported' })
    const refused = fake(['audio/webm'], () => {
      throw Object.assign(new Error('no'), { name: 'NotAllowedError' })
    })
    expect(await probeMic(refused.env)).toEqual({ ok: false, reason: 'denied' })
  })
})

describe('recordPause', () => {
  const hooks = (): RecordingHooks & { started: Mock<() => void>; failed: Mock<(reason: MicFailure) => void>; finished: Mock<(take: RecordedTake | null) => void> } => ({
    started: vi.fn<() => void>(),
    failed: vi.fn<(reason: MicFailure) => void>(),
    finished: vi.fn<(take: RecordedTake | null) => void>(),
  })

  it('tells the starter it is recording, then hands in the take when cancelled', async () => {
    const browser = fake(['audio/webm'], fakeStream().stream)
    const heard = hooks()
    const cancel = recordPause(heard, browser.env)
    await vi.waitFor(() => expect(heard.started).toHaveBeenCalledTimes(1))
    browser.clock.now += 3000
    cancel()
    await vi.waitFor(() => expect(heard.finished).toHaveBeenCalledTimes(1))
    expect(heard.finished.mock.calls[0]?.[0]).toMatchObject({ mime: 'audio/webm', ms: 3000 })
    cancel()
    expect(heard.finished).toHaveBeenCalledTimes(1)
  })

  it('reports a microphone that cannot be used', async () => {
    const heard = hooks()
    recordPause(heard, {})
    await vi.waitFor(() => expect(heard.failed).toHaveBeenCalledWith('unsupported'))
    expect(heard.started).not.toHaveBeenCalled()
  })

  it('discards a recording cancelled while the permission prompt was open, and releases the microphone', async () => {
    const tracks = fakeStream()
    let grant: (stream: StreamLike) => void = () => undefined
    const browser = fake(['audio/webm'], () => new Promise<StreamLike>((resolve) => (grant = resolve)) as unknown as StreamLike)
    const heard = hooks()
    const cancel = recordPause(heard, browser.env)
    cancel()
    grant(tracks.stream)
    await vi.waitFor(() => expect(tracks.stops).toHaveBeenCalledTimes(2))
    expect(heard.started).not.toHaveBeenCalled()
    expect(heard.finished).not.toHaveBeenCalled()
  })

  it('does not report a failure for a pause that was cancelled before the browser answered', async () => {
    const heard = hooks()
    const cancel = recordPause(heard, {})
    cancel()
    await Promise.resolve()
    await Promise.resolve()
    expect(heard.failed).not.toHaveBeenCalled()
  })
})
