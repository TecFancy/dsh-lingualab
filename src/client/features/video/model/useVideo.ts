/**
 * The open segment's video: what the host says about it, the job that prepares it, and the memory of
 * what the stage has already told the reader.
 *
 * The host decides everything about a file (is it playable, what would preparing do, is `ffmpeg` there);
 * this hook only asks, polls while a job runs (once a second, which is as often as a progress bar needs),
 * and tells the page when a job has just finished, so the page can swap the media element over to the
 * prepared video at the same position.
 *
 * State belongs to a segment: a status fetched for one segment is never handed out for another, the same
 * guard the cues have, so switching segments cannot show the previous one's card for a moment.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { cancelVideoPrepare, fetchVideoStatus, startVideoPrepare } from '../../../shared/lib/api.ts'
import type { VideoPrepareRequest, VideoStatusPayload } from '../../../shared/protocol.ts'
import { etaSeconds, segmentKey } from '../lib/source.ts'

/** How often a running job is asked about. */
const POLL_MS = 1000

/** What the page gets. */
export interface VideoState {
  /** What the host said about this segment's video, or `null` until it has said (or when there is no video). */
  readonly status: VideoStatusPayload | null
  /** A URL the browser said it cannot decode, or `null`. */
  readonly failedUrl: string | null
  /** The browser could not decode this URL: the page stops playing it. */
  readonly markUndecodable: (url: string) => void
  /** Start preparing the picture and sound, or only the sound. */
  readonly prepare: (mode: VideoPrepareRequest['mode']) => void
  /** Stop the running job. */
  readonly cancel: () => void
  /** A start or a cancel is on its way to the host. */
  readonly busy: boolean
  /** Seconds a running job has left, when it can be guessed. */
  readonly eta: number | null
}

/** A status and the segment it is about. */
interface Keyed<T> {
  readonly key: string | null
  readonly value: T
}

/**
 * Follow one segment's video.
 * @param episodeId - the open episode, or `null`.
 * @param segmentId - the open segment, or `null` for an episode without segments.
 * @param hasVideo - whether the scan found a video for this segment; without one nothing is asked.
 * @param onReady - called once when a job that was running has produced something to play.
 */
export function useVideo(
  episodeId: string | null,
  segmentId: string | null,
  hasVideo: boolean,
  onReady?: (status: VideoStatusPayload) => void,
): VideoState {
  const key = hasVideo ? segmentKey(episodeId, segmentId) : null
  const [fetched, setFetched] = useState<Keyed<VideoStatusPayload> | null>(null)
  const [failed, setFailed] = useState<Keyed<string> | null>(null)
  const [busy, setBusy] = useState(false)
  const [eta, setEta] = useState<number | null>(null)
  const ready = useRef(onReady)
  useEffect(() => {
    ready.current = onReady
  }, [onReady])
  /** When the job was first seen running, for the guess at how long is left. */
  const runningSince = useRef<number | null>(null)
  /** The state seen last, to tell "a job just finished" from "this segment was already prepared". */
  const lastState = useRef<{ key: string | null; state: string | null }>({ key: null, state: null })

  /** Take a status in, if it is still about the open segment. */
  const accept = useCallback(
    (forKey: string, payload: VideoStatusPayload): void => {
      setFetched({ key: forKey, value: payload })
      const last = lastState.current
      const wasRunning = last.key === forKey && last.state === 'preparing'
      lastState.current = { key: forKey, state: payload.state }
      if (payload.state === 'preparing') {
        runningSince.current ??= Date.now()
        const fraction = payload.progress?.fraction ?? 0
        setEta(etaSeconds((Date.now() - runningSince.current) / 1000, fraction))
        return
      }
      runningSince.current = null
      setEta(null)
      if (wasRunning && (payload.state === 'playable' || payload.state === 'sound-ready')) ready.current?.(payload)
    },
    [],
  )

  // Ask when the segment changes.
  useEffect(() => {
    if (key === null || episodeId === null) return
    let cancelled = false
    void (async () => {
      const payload = await fetchVideoStatus(episodeId, segmentId)
      if (!cancelled) accept(key, payload)
    })()
    return () => {
      cancelled = true
    }
  }, [key, episodeId, segmentId, accept])

  const status = fetched !== null && fetched.key === key ? fetched.value : null
  const running = status?.state === 'preparing'

  // Ask again, once a second, while a job runs.
  useEffect(() => {
    if (!running || key === null || episodeId === null) return
    const timer = setInterval(() => {
      void fetchVideoStatus(episodeId, segmentId).then((payload) => accept(key, payload))
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [running, key, episodeId, segmentId, accept])

  const prepare = useCallback(
    (mode: VideoPrepareRequest['mode']): void => {
      if (key === null || episodeId === null) return
      setBusy(true)
      runningSince.current = null
      void startVideoPrepare(segmentId === null ? { episode: episodeId, mode } : { episode: episodeId, segment: segmentId, mode })
        .then((payload) => accept(key, payload))
        .finally(() => setBusy(false))
    },
    [key, episodeId, segmentId, accept],
  )

  const cancel = useCallback((): void => {
    if (key === null || episodeId === null) return
    setBusy(true)
    void cancelVideoPrepare()
      .then(() => fetchVideoStatus(episodeId, segmentId))
      .then((payload) => accept(key, payload))
      .finally(() => setBusy(false))
  }, [key, episodeId, segmentId, accept])

  const markUndecodable = useCallback(
    (url: string): void => {
      if (key !== null) setFailed({ key, value: url })
    },
    [key],
  )

  return {
    status,
    failedUrl: failed !== null && failed.key === key ? failed.value : null,
    markUndecodable,
    prepare,
    cancel,
    busy,
    eta: running ? eta : null,
  }
}

/** The segments whose informational card has been shown in full during this page session. */
const shownCards = new Set<string>()

/** Forget which cards were shown; for tests. */
export function forgetShownCards(): void {
  shownCards.clear()
}

/** What {@link useFirstTimeCard} hands out. */
export interface FirstTimeCard {
  /** Whether the full card is open. */
  readonly open: boolean
  /** Open it again, from the small label. */
  readonly show: () => void
  /** Close it, leaving the small label. */
  readonly hide: () => void
}

/**
 * The card that says once, and then leaves a label.
 *
 * Open the first time `key` is seen in this page session (module memory, never stored), closed after,
 * and reopened by the label. `key` is `null` while there is nothing to say.
 * @param key - the segment (with the thing to say), or `null`.
 */
export function useFirstTimeCard(key: string | null): FirstTimeCard {
  const [card, setCard] = useState<{ key: string | null; open: boolean }>({ key: null, open: false })
  // A different segment, or a different thing to say about it: decided during render, as the stage does for
  // its popover, so there is no frame of the old answer.
  if (card.key !== key) setCard({ key, open: key !== null && !shownCards.has(key) })
  useEffect(() => {
    if (card.open && card.key !== null) shownCards.add(card.key)
  }, [card])
  const show = useCallback(() => setCard((current) => ({ ...current, open: true })), [])
  const hide = useCallback(() => setCard((current) => ({ ...current, open: false })), [])
  return { open: card.key === key && card.open, show, hide }
}
