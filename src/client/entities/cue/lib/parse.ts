/**
 * SRT, VTT and LRC parsing.
 *
 * Ported from `TecFancy/repeater` (`features/subtitle-parser/lib/`), with two
 * changes: VTT has its own entry point instead of falling through the SRT
 * pattern, and everything is expressed as module functions over the local cue
 * type rather than imports through an FSD alias.
 */
import type { Cue } from '../model/types.ts'
import { stripStyleTags } from './decode.ts'

const TIME_RANGE = /(\d{1,2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[.,]\d{3})/
const LRC_TIME = /\[(\d{1,}):(\d{2})[.:](\d{2,3})\](.*)/

/** `00:01:02,500` and `00:01:02.500` both mean 62.5 seconds. */
function timecodeToSeconds(value: string): number {
  const parts = value.replace(',', '.').split(':').map(Number)
  if (parts.length === 3) return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0)
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0)
  return parts[0] ?? 0
}

/**
 * Parse SubRip text.
 *
 * Blank-line separated blocks; the first line matching the time pattern is the
 * timecode and everything else in the block is text. Out-of-order input is
 * sorted, and a block without a valid timecode is dropped rather than guessed
 * at — a wrong timestamp is worse than a missing cue, because the panel would
 * loop the wrong sentence.
 */
export function parseSRT(text: string): Cue[] {
  const blocks = text.trim().replace(/\r\n/g, '\n').split(/\n\n+/)
  const cues: Cue[] = []

  for (const block of blocks) {
    const lines = block.split('\n').filter((line) => line.trim().length > 0)
    if (lines.length < 2) continue
    const timeMatch = TIME_RANGE.exec(block)
    if (timeMatch === null) continue

    const start = timecodeToSeconds(timeMatch[1] ?? '')
    const end = timecodeToSeconds(timeMatch[2] ?? '')
    const body = lines
      .filter((line) => TIME_RANGE.exec(line) === null && !/^\d+$/.test(line.trim()))
      .join('\n')
      .trim()
    const cleaned = stripStyleTags(body)
    if (cleaned.length > 0) cues.push({ start, end, text: cleaned })
  }

  return cues.sort((left, right) => left.start - right.start)
}

/**
 * Parse WebVTT text.
 *
 * VTT cues are the SRT shape with a dotted millisecond separator, so the work
 * is dropping what only VTT has: the `WEBVTT` header, `NOTE` and `STYLE` blocks,
 * and the optional cue identifier that precedes a timecode line. The identifier
 * has to go before SRT parsing sees it, because SRT would keep it as cue text.
 */
export function parseVTT(text: string): Cue[] {
  const withoutHeader = text.replace(/\r\n/g, '\n').replace(/^WEBVTT[^\n]*\n/, '')
  const blocks = withoutHeader
    .split(/\n\n+/)
    .filter((block) => !/^(NOTE|STYLE|REGION)\b/.test(block.trim()))
    .map((block) => {
      const lines = block.split('\n')
      const timecodeAt = lines.findIndex((line) => TIME_RANGE.test(line))
      return timecodeAt <= 0 ? lines.join('\n') : lines.slice(timecodeAt).join('\n')
    })
  return parseSRT(blocks.join('\n\n'))
}

/**
 * Parse LRC text.
 *
 * LRC carries start times only, so each cue's end is chained to the next cue's
 * start and the final cue gets a three-second tail. Both centiseconds and
 * milliseconds are accepted, disambiguated by digit count. Minutes may run past
 * 99 so long-form audio is not silently dropped.
 */
export function parseLRC(text: string): Cue[] {
  const cues: Cue[] = []
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    const match = LRC_TIME.exec(line)
    if (match === null) continue
    const minutes = Number(match[1])
    const seconds = Number(match[2])
    const fraction = Number(match[3])
    const start = minutes * 60 + seconds + (fraction < 100 ? fraction / 100 : fraction / 1000)
    const body = stripStyleTags((match[4] ?? '').trim())
    if (body.length > 0) cues.push({ start, end: start + 3, text: body })
  }

  return cues.map((cue, index) => {
    const next = cues[index + 1]
    // A line is on screen until the next one starts; the synthetic tail only
    // survives on the final cue. `Math.max` guards a file whose timestamps go
    // backwards, which would otherwise produce a cue that ends before it starts.
    return next === undefined ? cue : { ...cue, end: Math.max(cue.start, next.start) }
  })
}

/** Parse by file extension, defaulting to SRT for an unknown one. */
export function parseSubtitle(text: string, fileName: string): Cue[] {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (extension === 'lrc') return parseLRC(text)
  if (extension === 'vtt') return parseVTT(text)
  return parseSRT(text)
}
