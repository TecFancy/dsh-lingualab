/**
 * The open segment's local video: a file the reader picked from their own disk, to play in place of the served one.
 *
 * Everything stays in the browser. The file is played from an object URL, which this hook makes when the file is
 * chosen and revokes when it is replaced, when the segment changes and when the page goes. Where the browser can hand
 * out file handles, the handle is kept per segment in IndexedDB (see `handles.ts`), so coming back to the segment offers
 * one click to play it again; elsewhere the reader picks the file again, and nothing persists.
 *
 * It also works out whether the file is the video the subtitles were timed against, by comparing its length with the
 * served video's or, when that was never probed, with the segment's audio file (both asked of throwaway elements, so the
 * page's media element never loads anything twice).
 *
 * State belongs to a segment, as in {@link useVideo}: a file chosen for one segment is never handed out for another.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { VideoStatusPayload } from '../../../shared/protocol.ts'
import { canPickHandle, fileOf, localHandles, pickHandle, reopen, type LocalHandle } from '../lib/handles.ts'
import { localMismatch, probeLength, referenceSeconds } from '../lib/local.ts'

/** What the page gets. */
export interface LocalVideo {
  /** The object URL of the file in use, or `null`. */
  readonly url: string | null
  /** The file's name, or `null` when none is in use. */
  readonly name: string | null
  /** How much longer the file is than the video it replaces, in seconds, when over a second; negative when shorter. */
  readonly mismatch: number | null
  /** The name of a file kept from an earlier visit, which one click plays again, or `null`. */
  readonly remembered: string | null
  /** Whether this browser can remember a file at all. When it cannot, the reader picks it again each visit. */
  readonly canRemember: boolean
  /** Open the browser's file picker (only where {@link canRemember}); call it straight from a click. */
  readonly pick: () => void
  /** Play this file (from an `<input type="file">` or a drop). It is not remembered. */
  readonly use: (file: File) => void
  /** Play the remembered file; asks the browser for permission, so call it straight from a click. */
  readonly resume: () => void
  /** Forget the remembered file. */
  readonly forget: () => void
  /** Stop using the file in use, so the served source plays again from the same position. A remembered file is kept. */
  readonly stop: () => void
  /**
   * The browser said it cannot decode a URL. When it is the local file's, the file is dropped and forgotten, so the
   * served source plays again.
   * @returns the file's name when the URL was the local file's, else `null` (the URL is somebody else's to deal with).
   */
  readonly reject: (failedUrl: string) => string | null
}

/** What the hook needs to know about the open segment. */
export interface LocalVideoOptions {
  /** The segment (see `segmentKey`), or `null` when it has no video file. */
  readonly key: string | null
  /** What the host said about the served video; its probed length is the best reference. */
  readonly status: VideoStatusPayload | null
  /** The segment's audio file, whose length is the reference when the served video's is not known. */
  readonly audioUrl: string | null
  /** A remembered file could not be opened (not allowed, or gone). */
  readonly onUnreadable?: () => void
}

/** A file in use and the segment it was chosen for. */
interface Current {
  readonly key: string
  readonly name: string
  readonly url: string
}

/** A value and what it is about: the segment, the file or the URL. */
interface About<T> {
  readonly about: string
  readonly value: T
}

/**
 * Follow the open segment's local video.
 * @param options - the segment, the status of its served video, its audio file, and what to do when a remembered file cannot be opened.
 */
export function useLocalVideo({ key, status, audioUrl, onUnreadable }: LocalVideoOptions): LocalVideo {
  const [current, setCurrent] = useState<Current | null>(null)
  const [stored, setStored] = useState<About<LocalHandle> | null>(null)
  const [localLength, setLocalLength] = useState<About<number | null> | null>(null)
  const [audioLength, setAudioLength] = useState<About<number | null> | null>(null)

  // The segment as the async answers below find it, so a picker closed after the reader moved on adopts nothing.
  const latestKey = useRef(key)
  useEffect(() => {
    latestKey.current = key
  }, [key])

  // A different segment has none of this one's file: dropped in the render, so there is no frame of the old answer.
  // The effect below revokes its URL.
  if (current !== null && current.key !== key) setCurrent(null)

  // The URL lives as long as the file is in use: revoked when it is replaced or dropped, and when the page goes.
  useEffect(() => {
    if (current === null) return
    const { url } = current
    return () => URL.revokeObjectURL(url)
  }, [current])

  const adopt = useCallback((forKey: string, file: File): void => {
    if (latestKey.current !== forKey) return
    setCurrent({ key: forKey, name: file.name, url: URL.createObjectURL(file) })
  }, [])

  // What this device remembers about the segment.
  useEffect(() => {
    if (key === null) return
    let live = true
    void localHandles.get(key).then((handle) => {
      if (live) setStored(handle === null ? null : { about: key, value: handle })
    })
    return () => {
      live = false
    }
  }, [key])

  const url = current !== null && current.key === key ? current.url : null

  // How long the file is.
  useEffect(() => {
    if (url === null) return
    let live = true
    void probeLength(url).then((seconds) => {
      if (live) setLocalLength({ about: url, value: seconds })
    })
    return () => {
      live = false
    }
  }, [url])

  // How long the segment's audio file is, but only when it is needed: a served video of known length is the reference.
  const needsAudio =
    url !== null && referenceSeconds(status?.duration ?? null, null) === null && audioUrl !== null && audioUrl.length > 0
  useEffect(() => {
    if (!needsAudio || audioUrl === null) return
    let live = true
    void probeLength(audioUrl).then((seconds) => {
      if (live) setAudioLength({ about: audioUrl, value: seconds })
    })
    return () => {
      live = false
    }
  }, [needsAudio, audioUrl])

  const local = localLength !== null && localLength.about === url ? localLength.value : null
  const audio = audioLength !== null && audioLength.about === audioUrl ? audioLength.value : null
  const mismatch = url === null ? null : localMismatch(local, referenceSeconds(status?.duration ?? null, audio))

  const pick = useCallback((): void => {
    if (key === null) return
    // `pickHandle` is called before anything is awaited: the picker needs the click that got us here.
    void (async () => {
      const handle = await pickHandle()
      if (handle === null) return
      const file = await fileOf(handle)
      if (file === null) {
        onUnreadable?.()
        return
      }
      adopt(key, file)
      if (await localHandles.put(key, handle)) setStored({ about: key, value: handle })
    })()
  }, [key, adopt, onUnreadable])

  const use = useCallback(
    (file: File): void => {
      if (key !== null) adopt(key, file)
    },
    [key, adopt],
  )

  const handle = stored !== null && stored.about === key ? stored.value : null

  const forget = useCallback((): void => {
    if (key === null) return
    setStored(null)
    void localHandles.remove(key)
  }, [key])

  const resume = useCallback((): void => {
    if (key === null || handle === null) return
    // `reopen` asks for permission before anything is awaited: that needs the click that got us here.
    void reopen(handle).then((opened) => {
      if (opened.ok) {
        adopt(key, opened.file)
        return
      }
      onUnreadable?.()
      // A file that is gone is not worth offering again; one the reader said no to may be allowed next time.
      if (opened.problem === 'missing') forget()
    })
  }, [key, handle, adopt, forget, onUnreadable])

  // A remembered file stays remembered: stopping is not a verdict on the file, and 「忘掉」 is one click away.
  const stop = useCallback((): void => {
    setCurrent(null)
  }, [])

  const reject = useCallback(
    (failedUrl: string): string | null => {
      if (current === null || current.url !== failedUrl) return null
      setCurrent(null)
      // A file the browser cannot decode will not decode next time either: not worth offering again.
      forget()
      return current.name
    },
    [current, forget],
  )

  return {
    url,
    name: current !== null && current.key === key ? current.name : null,
    mismatch,
    remembered: handle === null ? null : handle.name,
    canRemember: canPickHandle(),
    pick,
    use,
    resume,
    forget,
    stop,
    reject,
  }
}
