import type { EpisodeSegment } from '../../../shared/protocol.ts'
import { splitSegmentStem } from '../../../shared/stem.ts'

/**
 * The number a segment is shown under: the one in its file name, else its place in the list.
 *
 * Scene files are numbered by whoever cut them (`01_`, `02_`), and the reader sees those
 * numbers in the file manager. Showing the same ones keeps the page and the folder talking
 * about the same scene; a stem with no number falls back to the position, two digits wide.
 */
export function segmentNumber(segment: EpisodeSegment): string {
  return splitSegmentStem(segment.id).number ?? String(segment.index).padStart(2, '0')
}

/** `01 · Dunphy家的早晨`: the number and the title, as the top bar and the lists show a segment. */
export function segmentLabel(segment: EpisodeSegment): string {
  return `${segmentNumber(segment)} · ${segment.title}`
}

/** The segment with this id, or `null`. */
export function findSegment(segments: readonly EpisodeSegment[], id: string | null): EpisodeSegment | null {
  if (id === null) return null
  return segments.find((segment) => segment.id === id) ?? null
}

/**
 * The segment to play after this one, or `null` when this is the last (or is not there).
 *
 * The finish card asks this: for a segment that has a next one it offers 「下一段」, and only
 * the last segment says the whole episode is done.
 */
export function nextSegment(segments: readonly EpisodeSegment[], id: string | null): EpisodeSegment | null {
  const at = segments.findIndex((segment) => segment.id === id)
  return at < 0 ? null : (segments[at + 1] ?? null)
}
