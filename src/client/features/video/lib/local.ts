/**
 * Playing the picture from a file on the reader's own machine: the small decisions, kept pure.
 *
 * The file never leaves the browser (see `useLocalVideo`), so what the page can ask of it is little: is it
 * a video at all, how long is it, and is it the same video as the one the subtitles were timed against.
 * The last one has two references. The served video's length is the better one, because the host probed it;
 * a segment whose video was never prepared has none, and then the segment's audio file stands in, since the
 * subtitles were timed against it in the first place.
 */

/** A difference in length at or under this is the ordinary noise of two containers: the same file. */
export const SAME_WITHIN_SECONDS = 1

/** How long a throwaway element may take to report a length before the answer is "unknown". */
const PROBE_TIMEOUT_MS = 15_000

/** Extensions that count as video when the browser gives the file no (or a vague) media type. */
const VIDEO_EXTENSIONS = ['mp4', 'm4v', 'mkv', 'webm', 'mov']

/** The few things of a file this module reads, so tests need no `File`. */
export interface FileLike {
  readonly name: string
  readonly type: string
}

/**
 * Whether a dropped or picked file looks like a video.
 * @param file - the file; Matroska has no media type in some browsers, so the extension counts as well.
 */
export function isVideoFile(file: FileLike): boolean {
  if (file.type.startsWith('video/')) return true
  const dot = file.name.lastIndexOf('.')
  return dot >= 0 && VIDEO_EXTENSIONS.includes(file.name.slice(dot + 1).toLowerCase())
}

/** A length worth comparing: a positive, finite number of seconds. */
function usable(seconds: number | null | undefined): seconds is number {
  return typeof seconds === 'number' && Number.isFinite(seconds) && seconds > 0
}

/**
 * The length the local file is compared with.
 * @param servedSeconds - the served video's probed length, or `null` when it was not probed.
 * @param audioSeconds - the segment's audio file length, or `null` when there is none or it is not known yet.
 * @returns the served video's length when known, else the audio file's, else `null`.
 */
export function referenceSeconds(servedSeconds: number | null, audioSeconds: number | null): number | null {
  if (usable(servedSeconds)) return servedSeconds
  return usable(audioSeconds) ? audioSeconds : null
}

/**
 * How much longer the local file is than the reference, when the two differ by more than a second.
 * @param localSeconds - the local file's length, or `null` while it is not known.
 * @param reference - what it is compared with (see {@link referenceSeconds}), or `null` when nothing is known.
 * @returns the difference in seconds rounded to a tenth (negative when the local file is shorter), or `null`
 *   when it is the same file or when there is nothing to compare.
 */
export function localMismatch(localSeconds: number | null, reference: number | null): number | null {
  if (!usable(localSeconds) || !usable(reference)) return null
  const difference = localSeconds - reference
  return Math.abs(difference) > SAME_WITHIN_SECONDS ? Math.round(difference * 10) / 10 : null
}

/** The few things of a media element {@link probeLength} reads. */
export interface ProbeElement {
  preload: string
  muted: boolean
  src: string
  readonly duration: number
  addEventListener(type: 'loadedmetadata' | 'error', listener: () => void): void
  removeEventListener(type: 'loadedmetadata' | 'error', listener: () => void): void
  removeAttribute(name: string): void
  load(): void
}

/**
 * Ask a media URL how long it is, with an element of its own that is thrown away afterwards, so the page's one
 * media element is never made to load a file twice.
 * @param url - the URL (an object URL, or the audio file's).
 * @param make - makes the element; a `<video>` in a browser.
 * @returns the length in seconds, or `null` when the browser cannot say (it cannot decode the file, the length
 *   is unknown, or it took too long).
 */
export function probeLength(
  url: string,
  make: () => ProbeElement = () => document.createElement('video'),
): Promise<number | null> {
  return new Promise((resolve) => {
    const element = make()
    let timer: ReturnType<typeof setTimeout> | null = null
    function finish(seconds: number | null): void {
      if (timer !== null) clearTimeout(timer)
      element.removeEventListener('loadedmetadata', onMeta)
      element.removeEventListener('error', onError)
      // Dropping the source lets the browser let go of the file.
      element.removeAttribute('src')
      element.load()
      resolve(seconds)
    }
    function onMeta(): void {
      finish(usable(element.duration) ? element.duration : null)
    }
    function onError(): void {
      finish(null)
    }
    element.addEventListener('loadedmetadata', onMeta)
    element.addEventListener('error', onError)
    timer = setTimeout(() => finish(null), PROBE_TIMEOUT_MS)
    element.preload = 'metadata'
    element.muted = true
    element.src = url
  })
}
