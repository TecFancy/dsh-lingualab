/**
 * Splitting a bilingual cue into the two languages, and deciding how much of the
 * Chinese to show.
 *
 * Ported from `TecFancy/repeater` (`widgets/subtitle-panel/lib/orderCueLines.ts`
 * and `shared/lib/subtitle-zh-mode.ts`). The rule it encodes is the whole point
 * of the study method: English first, Chinese available but never in front.
 */
import type { CueLine, SubtitleZhMode } from '../model/types.ts'

/** CJK unified ideographs, including extension A. */
const CJK = /[\u3400-\u4dbf\u4e00-\u9fff]/

/** True when a line carries Chinese characters. */
export function hasCjk(text: string): boolean {
  return CJK.test(text)
}

/**
 * Split a cue's text into lines and put the English above the Chinese,
 * regardless of the order in the source file.
 *
 * The Chinese lines of a bilingual cue come back marked `secondary` so the
 * panel can dim them. A single-language cue is returned untouched and nothing is
 * marked, because dimming the only line on screen is just worse contrast.
 */
export function orderCueLines(text: string): CueLine[] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const chinese: string[] = []
  const latin: string[] = []
  for (const line of lines) (hasCjk(line) ? chinese : latin).push(line)

  if (chinese.length === 0 || latin.length === 0) {
    return lines.map((line) => ({ text: line, secondary: false }))
  }
  return [
    ...latin.map((text) => ({ text, secondary: false })),
    ...chinese.map((text) => ({ text, secondary: true })),
  ]
}

/**
 * Which lines of a cue survive the current mode.
 *
 * `activeOnly` needs to know whether this is the cue being played; every other
 * mode is a pure function of the lines themselves.
 */
export function visibleCueLines(text: string, mode: SubtitleZhMode, isActive: boolean): CueLine[] {
  const lines = orderCueLines(text)
  if (mode === 'always') return lines
  if (mode === 'hidden') {
    const latin = lines.filter((line) => !line.secondary)
    // A cue that is Chinese only keeps its text under every mode: hiding it
    // would leave an empty row that looks like a parsing failure.
    return latin.length > 0 ? latin : lines
  }
  if (mode === 'active-only' && !isActive) {
    const latin = lines.filter((line) => !line.secondary)
    return latin.length > 0 ? latin : lines
  }
  return lines
}

/**
 * Index of the cue covering `time`, or the last cue that started before it.
 *
 * Binary search rather than a scan: this runs on every `timeupdate`, and the
 * linear version it replaced was measurable on a 1000-cue episode.
 */
export function findActiveCue(cues: readonly { start: number; end: number }[], time: number): number {
  if (cues.length === 0) return -1
  let low = 0
  let high = cues.length - 1
  let best = -1
  while (low <= high) {
    const middle = (low + high) >> 1
    const cue = cues[middle]
    if (cue === undefined) break
    if (cue.start <= time) {
      best = middle
      low = middle + 1
    } else {
      high = middle - 1
    }
  }
  if (best === -1) return -1
  const candidate = cues[best]
  if (candidate !== undefined && time <= candidate.end) return best
  return best
}
