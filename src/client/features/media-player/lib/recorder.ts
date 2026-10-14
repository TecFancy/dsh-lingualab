/**
 * Recording the reader's voice for one speaking pause.
 *
 * Everything that touches the browser's recording API is here, behind a small environment object, so the
 * decisions around it (which format, what counts as a take, what a failure is) are tested with a fake
 * `MediaRecorder` and `getUserMedia`. Nothing in this file knows about sentences or the store.
 *
 * Two rules shape it. The microphone stream's tracks are stopped as soon as a recording ends, whatever way it
 * ends, because iOS lowers the playback volume for as long as a microphone is open. And a recording that was
 * asked for and then cancelled before the browser handed over the microphone (the permission prompt was still
 * open) is discarded the moment it arrives, never started.
 */
import type { MicNotice } from './take.ts'

/** Why a recording could not start. A take that could not be played is {@link MicNotice}'s `blocked`. */
export type MicFailure = Exclude<MicNotice, 'blocked'>

/** The few parts of a media stream this file needs. */
export interface StreamLike {
  getTracks(): readonly { stop(): void }[]
}

/** The few parts of a `MediaRecorder` this file needs. */
export interface RecorderLike {
  readonly state: string
  readonly mimeType?: string
  ondataavailable: ((event: { readonly data: Blob }) => void) | null
  onstop: (() => void) | null
  onerror: (() => void) | null
  start(): void
  stop(): void
}

/** A `MediaRecorder` constructor. */
export interface RecorderClass {
  new (stream: StreamLike, options?: { readonly mimeType?: string }): RecorderLike
  isTypeSupported?(type: string): boolean
}

/** The browser pieces recording needs. Either missing means this browser cannot record. */
export interface RecorderEnv {
  readonly getUserMedia?: (constraints: { readonly audio: true }) => Promise<StreamLike>
  readonly Recorder?: RecorderClass
  /** The clock, in milliseconds. */
  readonly now?: () => number
}

/** What a finished recording is, before it becomes a {@link Take}. */
export interface RecordedTake {
  readonly blob: Blob
  readonly mime: string
  readonly ms: number
}

/** A recording in progress. */
export interface Capture {
  /**
   * End the recording and release the microphone. Resolves with the take, or `null` when there is nothing worth
   * keeping (too short, or the browser gave no data). Never rejects, and may be called again.
   */
  readonly stop: () => Promise<RecordedTake | null>
}

export type CaptureStart = { readonly ok: true; readonly capture: Capture } | { readonly ok: false; readonly reason: MicFailure }

/** Formats tried in order. Chrome records WebM, Safari records MP4; the first the browser supports is used. */
export const MIME_CANDIDATES: readonly string[] = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']

/** A take shorter than this is a stray press, not a try at the sentence, and does not replace the one before it. */
export const MIN_TAKE_MS = 400

/** How long to wait for the recorder to say it has stopped before giving up on its data. */
const STOP_TIMEOUT_MS = 2000

/** The recording pieces the current page has. */
export function browserEnv(): RecorderEnv {
  const devices = typeof navigator === 'undefined' ? undefined : (navigator.mediaDevices as MediaDevices | undefined)
  return {
    getUserMedia: devices === undefined ? undefined : (constraints) => devices.getUserMedia(constraints),
    Recorder: typeof MediaRecorder === 'undefined' ? undefined : (MediaRecorder as unknown as RecorderClass),
  }
}

/** Whether this browser can record at all: it has a microphone API (secure pages only) and a recorder. */
export function canRecord(env: RecorderEnv = browserEnv()): boolean {
  return env.getUserMedia !== undefined && env.Recorder !== undefined
}

/** The first of {@link MIME_CANDIDATES} the recorder supports, or `''` to let the browser choose. */
export function pickMimeType(recorder: Pick<RecorderClass, 'isTypeSupported'>): string {
  const supported = recorder.isTypeSupported
  if (supported === undefined) return ''
  return MIME_CANDIDATES.find((type) => supported.call(recorder, type)) ?? ''
}

/** Read what `getUserMedia` threw: a refusal lasts until the reader changes it, anything else may pass. */
export function failureOf(error: unknown): MicFailure {
  const name = typeof error === 'object' && error !== null && 'name' in error ? String(error.name) : ''
  return name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError' ? 'denied' : 'unavailable'
}

function release(stream: StreamLike): void {
  for (const track of stream.getTracks()) {
    try {
      track.stop()
    } catch {
      // A track that will not stop is as stopped as it is going to get.
    }
  }
}

/**
 * Ask for the microphone and start recording.
 *
 * @returns The recording, or why there is none.
 */
export async function beginCapture(env: RecorderEnv = browserEnv()): Promise<CaptureStart> {
  const { getUserMedia, Recorder } = env
  if (getUserMedia === undefined || Recorder === undefined) return { ok: false, reason: 'unsupported' }
  const now = env.now ?? Date.now
  let stream: StreamLike
  try {
    stream = await getUserMedia({ audio: true })
  } catch (error) {
    return { ok: false, reason: failureOf(error) }
  }
  const chosen = pickMimeType(Recorder)
  const chunks: Blob[] = []
  let recorder: RecorderLike
  let startedAt: number
  try {
    recorder = chosen === '' ? new Recorder(stream) : new Recorder(stream, { mimeType: chosen })
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    recorder.start()
    startedAt = now()
  } catch {
    release(stream)
    return { ok: false, reason: 'unavailable' }
  }

  let finished: Promise<RecordedTake | null> | null = null
  const stop = (): Promise<RecordedTake | null> => {
    finished ??= new Promise<RecordedTake | null>((resolve) => {
      const length = now() - startedAt
      let settled = false
      const settle = (): void => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        release(stream)
        const mime = recorder.mimeType === undefined || recorder.mimeType === '' ? chosen : recorder.mimeType
        resolve(chunks.length === 0 || length < MIN_TAKE_MS ? null : { blob: new Blob(chunks, { type: mime }), mime, ms: length })
      }
      recorder.onstop = settle
      recorder.onerror = settle
      const timer = setTimeout(settle, STOP_TIMEOUT_MS)
      try {
        if (recorder.state === 'inactive') settle()
        else recorder.stop()
      } catch {
        settle()
      }
    })
    return finished
  }
  return { ok: true, capture: { stop } }
}

/**
 * Ask for the microphone once and give it straight back, so the permission prompt comes when the reader turns
 * recording on rather than in the middle of their first speaking pause.
 */
export async function probeMic(env: RecorderEnv = browserEnv()): Promise<{ readonly ok: true } | { readonly ok: false; readonly reason: MicFailure }> {
  if (env.getUserMedia === undefined || env.Recorder === undefined) return { ok: false, reason: 'unsupported' }
  try {
    release(await env.getUserMedia({ audio: true }))
    return { ok: true }
  } catch (error) {
    return { ok: false, reason: failureOf(error) }
  }
}

/** What a recording tells whoever started it. */
export interface RecordingHooks {
  /** The microphone is open and recording. Not called for one that was cancelled first. */
  readonly started: () => void
  /** The microphone could not be used. Not called for one that was cancelled first. */
  readonly failed: (reason: MicFailure) => void
  /** The recording ended, after `started`: its take, or `null` when it was not worth keeping. */
  readonly finished: (take: RecordedTake | null) => void
}

/**
 * Record one speaking pause.
 *
 * @returns Cancel, which ends the recording and releases the microphone: a recording already running finishes
 *   into `finished`, and one still waiting for the permission prompt is discarded the moment it is granted.
 */
export function recordPause(hooks: RecordingHooks, env: RecorderEnv = browserEnv()): () => void {
  let cancelled = false
  let capture: Capture | null = null
  void beginCapture(env).then((start) => {
    if (!start.ok) {
      if (!cancelled) hooks.failed(start.reason)
      return
    }
    if (cancelled) {
      void start.capture.stop()
      return
    }
    capture = start.capture
    hooks.started()
  })
  return () => {
    if (cancelled) return
    cancelled = true
    if (capture !== null) void capture.stop().then(hooks.finished)
  }
}
