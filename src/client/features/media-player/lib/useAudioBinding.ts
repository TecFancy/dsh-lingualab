/**
 * Binding the store to one `<audio>` element.
 *
 * The element is the only thing that actually plays, so it owns the browser
 * events and the store owns the intent; this hook is the wire between them. Every
 * write to the element is derived from store state, which is what makes the panel
 * renderable from the store alone — the page never reads `audio.currentTime`
 * during render.
 */
import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { currentSpeed, useMediaPlayer } from '../model/store.ts'

/** The ref the page attaches to its `<audio>` element. */
export type AudioRef = RefObject<HTMLAudioElement>

/**
 * Create the audio element ref and keep it in step with the store.
 *
 * @param src Media URL of the current episode's audio, or `null` while loading.
 * @returns The ref to attach.
 */
export function useAudioBinding(src: string | null): AudioRef {
  const ref = useRef<HTMLAudioElement>(null)
  const isPlaying = useMediaPlayer((state) => state.isPlaying)
  const speed = useMediaPlayer(currentSpeed)
  const seekRequest = useMediaPlayer((state) => state.seekRequest)
  const seekToken = useMediaPlayer((state) => state.seekToken)

  // Source changes: load the new file and let the store know nothing is playing
  // yet. Without the pause the previous episode keeps playing under the new cues.
  useEffect(() => {
    const audio = ref.current
    if (audio === null) return
    if (src === null) {
      audio.removeAttribute('src')
      audio.load()
      return
    }
    audio.src = src
    audio.load()
  }, [src])

  // Playback intent.
  useEffect(() => {
    const audio = ref.current
    if (audio === null) return
    if (!isPlaying) {
      audio.pause()
      return
    }
    // `play()` rejects when the browser blocks autoplay or the source is gone.
    // The store is told either way, so the button never lies about the state.
    void audio.play().catch(() => useMediaPlayer.getState().setPlaying(false))
  }, [isPlaying, src])

  // Speed, without changing pitch.
  useEffect(() => {
    const audio = ref.current
    if (audio === null) return
    audio.playbackRate = speed
    audio.preservesPitch = true
  }, [speed, src])

  // Programmatic seeks, applied once per request rather than on every render.
  useEffect(() => {
    const audio = ref.current
    if (audio === null || seekRequest === null) return
    audio.currentTime = seekRequest
  }, [seekToken, seekRequest, src])

  // Browser events into the store.
  useEffect(() => {
    const audio = ref.current
    if (audio === null) return
    const store = useMediaPlayer.getState

    const onTime = (): void => store().onTime(audio.currentTime)
    const onMeta = (): void => store().setDuration(audio.duration)
    const onEnded = (): void => store().setPlaying(false)
    const onError = (): void => store().setPlaying(false)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [src])

  return ref
}
