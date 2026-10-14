/**
 * Binding the store to the one media element that plays.
 *
 * The element is the only thing that actually plays, so it owns the browser events and the store owns
 * the intent; this hook is the wire between them. Every write to the element is derived from store
 * state, which is what makes the panel renderable from the store alone: the page never reads
 * `currentTime` during render.
 *
 * It is a `<video>` element whichever the source is. A `<video>` plays an audio file as well as a
 * video (it simply has nothing to draw), and using one element for both is what lets a segment's sound
 * come from its video, with the same loop, seek and speed, on one timeline: the sources are swapped under
 * the element, never played in two elements that would have to be kept in step.
 *
 * The element is not always there: it lives inside the practice view, so the effects below have to run
 * again when it appears. It is kept in a ref, which the effects read and write to the element, and in state,
 * which is what makes them run again and what the page can depend on. Swapping the source inside one session (the
 * audio file for the video that was just prepared, or the audio again when the video cannot be decoded)
 * keeps the position; a source of another session starts from the top, as it always did.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { currentSpeed, useMediaPlayer } from '../model/store.ts'
import { swapStart, type Loaded } from './swap.ts'
import { useTakes } from './useTakes.ts'

/** `MediaError.code` values that mean the file cannot be decoded, as opposed to a network hiccup. */
const MEDIA_ERR_DECODE = 3
const MEDIA_ERR_SRC_NOT_SUPPORTED = 4

/** What the page gets: the callback to put on the element, and the element once it is there. */
export interface MediaBinding {
  /** The `ref` for the `<video>` element. */
  readonly attach: (element: HTMLVideoElement | null) => void
  readonly element: HTMLVideoElement | null
}

/**
 * Create the element binding and keep it in step with the store.
 *
 * @param src Media URL to play, or `null` while loading or when there is nothing to play.
 * @param session What the source belongs to (the episode and segment). A new `src` under the same session
 *   is a swap and keeps the position.
 * @param onUndecodable Called with the URL that failed when the browser says it cannot decode it.
 * @returns The binding to attach.
 */
export function useMediaBinding(
  src: string | null,
  session: string | null,
  onUndecodable?: (failed: string) => void,
): MediaBinding {
  const node = useRef<HTMLVideoElement | null>(null)
  const [element, setElement] = useState<HTMLVideoElement | null>(null)
  const attach = useCallback((next: HTMLVideoElement | null) => {
    node.current = next
    setElement(next)
  }, [])
  const isPlaying = useMediaPlayer((state) => state.isPlaying)
  const speed = useMediaPlayer(currentSpeed)
  const seekRequest = useMediaPlayer((state) => state.seekRequest)
  const seekToken = useMediaPlayer((state) => state.seekToken)
  const shadowWait = useMediaPlayer((state) => state.shadowWait)
  // Recording the speaking pauses and playing the takes back; the take has its own element, not this one.
  useTakes()
  /** The last seek request this element has been given, so a source change cannot re-apply one. */
  const appliedSeek = useRef(0)
  const loaded = useRef<Loaded<HTMLVideoElement> | null>(null)
  const undecodable = useRef(onUndecodable)
  useEffect(() => {
    undecodable.current = onUndecodable
  }, [onUndecodable])

  // Source changes: load the new file. `load()` resets the position, and marking the current seek
  // request as already applied stops a request from the previous episode from moving the new one.
  useEffect(() => {
    appliedSeek.current = useMediaPlayer.getState().seekToken
    // A new source has no known length until its own metadata arrives.
    useMediaPlayer.getState().setDuration(0)
    const element = node.current
    if (element === null) return
    const keep = swapStart(loaded.current, { element, src, session }, element)
    loaded.current = { element, src, session, start: keep }
    if (src === null) {
      element.removeAttribute('src')
      element.load()
      return
    }
    element.src = src
    element.load()
    if (keep <= 0) return
    const restore = (): void => {
      element.currentTime = keep
    }
    element.addEventListener('loadedmetadata', restore, { once: true })
    return () => element.removeEventListener('loadedmetadata', restore)
  }, [src, session, element])


  // Playback intent.
  useEffect(() => {
    const element = node.current
    if (element === null) return
    if (!isPlaying) {
      element.pause()
      return
    }
    // `play()` rejects when the browser blocks autoplay or the source is gone.
    // The store is told either way, so the button never lies about the state.
    void element.play().catch(() => useMediaPlayer.getState().setPlaying(false))
  }, [isPlaying, src, element])

  // Speed, without changing pitch.
  useEffect(() => {
    const element = node.current
    if (element === null) return
    element.playbackRate = speed
    element.preservesPitch = true
  }, [speed, src, element])

  // Programmatic seeks: once per request, never replaying an older one.
  useEffect(() => {
    const element = node.current
    if (element === null || seekRequest === null || seekToken === appliedSeek.current) return
    appliedSeek.current = seekToken
    element.currentTime = seekRequest
  }, [seekToken, seekRequest, element])

  // A shadowing pause runs out on a timeout. The store holds when it ends, so a pause that outlived the
  // element (or the timeout a background tab delayed) is carried on as soon as the effect runs again.
  useEffect(() => {
    if (shadowWait === null) return
    const timer = setTimeout(() => useMediaPlayer.getState().endShadowWait(), Math.max(0, shadowWait.until - Date.now()))
    return () => clearTimeout(timer)
  }, [shadowWait])

  // Browser events into the store.
  useEffect(() => {
    const element = node.current
    if (element === null) return
    const store = useMediaPlayer.getState

    const onTime = (): void => store().onTime(element.currentTime)
    const onMeta = (): void => store().setDuration(element.duration)
    const onEnded = (): void => store().markFinished()
    const onError = (): void => {
      store().setPlaying(false)
      const code = element.error?.code
      if (code === MEDIA_ERR_DECODE || code === MEDIA_ERR_SRC_NOT_SUPPORTED) {
        const failed = element.getAttribute('src')
        if (failed !== null) undecodable.current?.(failed)
      }
    }
    // The seek gate's release signal: the element itself says the position moved.
    const onSeeked = (): void => store().clearGuard()

    element.addEventListener('timeupdate', onTime)
    element.addEventListener('loadedmetadata', onMeta)
    element.addEventListener('durationchange', onMeta)
    element.addEventListener('seeked', onSeeked)
    element.addEventListener('ended', onEnded)
    element.addEventListener('error', onError)
    return () => {
      element.removeEventListener('timeupdate', onTime)
      element.removeEventListener('loadedmetadata', onMeta)
      element.removeEventListener('durationchange', onMeta)
      element.removeEventListener('seeked', onSeeked)
      element.removeEventListener('ended', onEnded)
      element.removeEventListener('error', onError)
    }
  }, [element])

  return { attach, element }
}
