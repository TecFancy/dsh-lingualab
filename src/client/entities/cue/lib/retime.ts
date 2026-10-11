/**
 * The rules for moving one cue's edges, and the request that writes the move back.
 *
 * The page lets the reader nudge the start and the end of the sentence on stage while it loops,
 * and saves the result into the subtitle file. Everything here is a pure function of the cue
 * list, so the limits can be tested without a player:
 *
 *   · **An edge pushes its neighbour.** Many files cut sentences back to back, so the start of
 *     one is the end of the one before. When speech begins before the cue does, the start has to
 *     go earlier than the previous end; the previous cue's end then moves with it, and the same
 *     for an end pushed past the next cue's start (see {@link pushedNeighbours}). The two never
 *     overlap after a push, and the push stops where the neighbour would get shorter than the
 *     minimum. A file whose cues already overlap keeps the overlap until an edge is pushed into
 *     it, because refusing to touch such a cue would leave exactly the badly timed files without
 *     a fix.
 *   · **A cue is at least {@link MIN_CUE_MS} long.** Shorter, the loop is a click.
 *   · **LRC has starts only.** A line ends where the next begins, so only the start moves, and
 *     it stays clear of both neighbours' starts; the previous line's end follows by itself.
 *
 * Times here are whole milliseconds, the unit the file writes and the host matches on.
 */
import { MIN_CUE_MS, type TimingEdit } from '../../../shared/protocol.ts'
import type { Cue, CueOrigin } from '../model/types.ts'

/** Which edge of the cue the keys move. */
export type RetimeEdge = 'start' | 'end'

/** A cue's range while it is being edited, in milliseconds. */
export interface RetimeRange {
  readonly start: number
  readonly end: number
}

/** Where the edges of one cue may go. */
export interface RetimeLimits {
  readonly minStart: number
  readonly maxStart: number
  readonly minEnd: number
  readonly maxEnd: number
  /** False for LRC, whose end is the next line's start and is shown read-only. */
  readonly endEditable: boolean
}

/** One subtitle file as the page read it: its name, and the hash the host checks. */
export interface SubtitleTrack {
  readonly file: string
  readonly hash: string
}

/** Whether a file name is LRC, whose lines carry a start only. */
export function isLrc(file: string): boolean {
  return file.toLowerCase().endsWith('.lrc')
}

/** A cue's range as the file writes it: its origin when known, its seconds otherwise. */
export function originalRange(cue: Cue): RetimeRange {
  return cue.origin === undefined
    ? { start: Math.round(cue.start * 1000), end: Math.round(cue.end * 1000) }
    : { start: cue.origin.start, end: cue.origin.end }
}

/** The range the editor opens with: the file's start, and the end the page plays (for LRC, the next start). */
export function initialRange(cue: Cue): RetimeRange {
  return { start: originalRange(cue).start, end: Math.round(cue.end * 1000) }
}

/**
 * The limits for one cue.
 * @param cues - the cue list on screen, sorted by start.
 * @param index - the cue being edited.
 * @param lrc - whether its file is LRC.
 * @param durationMs - the audio's length, or `null` when not known yet.
 */
export function retimeLimits(cues: readonly Cue[], index: number, lrc: boolean, durationMs: number | null): RetimeLimits {
  const cue = cues[index]
  const previous = cues[index - 1]
  const next = cues[index + 1]
  const ceiling = durationMs !== null && durationMs > 0 ? durationMs : Number.POSITIVE_INFINITY
  if (cue === undefined) return { minStart: 0, maxStart: 0, minEnd: 0, maxEnd: 0, endEditable: false }
  const own = originalRange(cue)
  if (lrc) {
    const minStart = previous === undefined ? 0 : originalRange(previous).start + MIN_CUE_MS
    const maxStart = (next === undefined ? ceiling : originalRange(next).start) - MIN_CUE_MS
    // A neighbour already closer than the minimum leaves the cue where it is rather than nowhere.
    return {
      minStart: Math.min(minStart, own.start),
      maxStart: Math.max(maxStart, own.start),
      minEnd: 0,
      maxEnd: Number.POSITIVE_INFINITY,
      endEditable: false,
    }
  }
  // An edge may push into a neighbour as far as leaves the neighbour its minimum length.
  return {
    minStart: previous === undefined ? 0 : Math.min(originalRange(previous).start + MIN_CUE_MS, own.start),
    maxStart: Number.POSITIVE_INFINITY,
    minEnd: 0,
    maxEnd: next === undefined ? Math.max(ceiling, own.end) : Math.max(originalRange(next).end - MIN_CUE_MS, own.end),
    endEditable: true,
  }
}

/** A neighbour whose shared edge an edit pushed, with its range before and after. */
export interface PushedNeighbour {
  readonly index: number
  readonly side: 'previous' | 'next'
  readonly before: RetimeRange
  readonly after: RetimeRange
}

/**
 * The neighbours a range pushes: the previous cue when the start went earlier than both its own
 * old start and the previous end, the next cue when the end went later than both its own old end
 * and the next start. Their other edge stays. LRC pushes nothing, a line's end being the next
 * line's start already.
 * @param cues - the cue list on screen, sorted by start.
 * @param index - the cue being edited.
 * @param range - its range as it stands, within {@link retimeLimits}.
 * @param lrc - whether its file is LRC.
 */
export function pushedNeighbours(cues: readonly Cue[], index: number, range: RetimeRange, lrc: boolean): PushedNeighbour[] {
  const cue = cues[index]
  if (cue === undefined || lrc) return []
  const own = originalRange(cue)
  const pushed: PushedNeighbour[] = []
  const previous = cues[index - 1]
  if (previous !== undefined) {
    const before = originalRange(previous)
    if (range.start < before.end && range.start < own.start) {
      pushed.push({ index: index - 1, side: 'previous', before, after: { start: before.start, end: range.start } })
    }
  }
  const next = cues[index + 1]
  if (next !== undefined) {
    const before = originalRange(next)
    if (range.end > before.start && range.end > own.end) {
      pushed.push({ index: index + 1, side: 'next', before, after: { start: range.end, end: before.end } })
    }
  }
  return pushed
}

/** Keep `value` within `[low, high]`; when the two cross, `high` wins. */
function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high)
}

/**
 * Move one edge to a new value, within the limits and the minimum length.
 * @returns the new range; the other edge never moves.
 */
export function moveEdge(range: RetimeRange, edge: RetimeEdge, value: number, limits: RetimeLimits): RetimeRange {
  const target = Math.round(value)
  if (edge === 'start') {
    const high = limits.endEditable ? Math.min(limits.maxStart, range.end - MIN_CUE_MS) : limits.maxStart
    return { start: clamp(target, limits.minStart, high), end: range.end }
  }
  if (!limits.endEditable) return range
  return { start: range.start, end: clamp(target, Math.max(limits.minEnd, range.start + MIN_CUE_MS), limits.maxEnd) }
}

/**
 * The request that writes a cue's new range into its file, and into the Chinese file too when the
 * cue's Chinese came from one.
 *
 * The Chinese cue is moved by the same amount rather than to the same range: the two tracks are
 * cut independently, so the Chinese often starts a little apart, and keeping that offset is what
 * keeps the two folded together on the next load.
 *
 * A pushed neighbour ({@link pushedNeighbours}) is written too. Its Chinese moves only as far as
 * clears the sentence's own Chinese, and not at all when the two English cues share one Chinese cue.
 * @param cues - the cue list on screen, sorted by start.
 * @param index - the cue being edited.
 * @param range - its new range.
 * @returns the edits, or `null` when a cue to write does not know where it came from.
 */
export function timingEdits(
  cues: readonly Cue[],
  index: number,
  range: RetimeRange,
  english: SubtitleTrack | null,
  chinese: SubtitleTrack | null,
): TimingEdit[] | null {
  const cue = cues[index]
  if (cue?.origin === undefined || english === null) return null
  const origin = cue.origin
  const pushed = pushedNeighbours(cues, index, range, isLrc(english.file))
  if (pushed.some((neighbour) => cues[neighbour.index]?.origin === undefined)) return null
  const to = (file: string, from: CueOrigin, start: number, end: number): TimingEdit => {
    const lrc = isLrc(file)
    const safeStart = Math.max(0, start)
    return {
      file,
      from,
      to: { start: safeStart, end: lrc ? safeStart : Math.max(end, safeStart + MIN_CUE_MS) },
      expect: english.file === file ? english.hash : (chinese?.hash ?? ''),
    }
  }
  const englishEnd = isLrc(english.file) ? range.start : range.end
  const edits = [to(english.file, origin, range.start, englishEnd)]
  for (const neighbour of pushed) {
    const from = cues[neighbour.index]?.origin
    if (from !== undefined) edits.push(to(english.file, from, neighbour.after.start, neighbour.after.end))
  }
  if (cue.zhOrigin === undefined || chinese === null || chinese.file === english.file) return edits

  const zhOrigin = cue.zhOrigin
  const shiftStart = range.start - origin.start
  // An LRC end is the start, so the Chinese end follows the start when the English file is LRC.
  const shiftEnd = isLrc(english.file) ? shiftStart : range.end - origin.end
  const zh = to(chinese.file, zhOrigin, zhOrigin.start + shiftStart, zhOrigin.end + shiftEnd)
  edits.push(zh)
  for (const neighbour of pushed) {
    const from = cues[neighbour.index]?.zhOrigin
    const shared =
      from === undefined || (from.start === zhOrigin.start && from.end === zhOrigin.end && from.occurrence === zhOrigin.occurrence)
    if (shared) continue
    if (neighbour.side === 'previous' && from.end > zh.to.start) edits.push(to(chinese.file, from, from.start, zh.to.start))
    if (neighbour.side === 'next' && from.start < zh.to.end) edits.push(to(chinese.file, from, zh.to.end, from.end))
  }
  return edits
}
