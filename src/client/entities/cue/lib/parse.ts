/**
 * SRT, VTT and LRC parsing.
 *
 * Ported from `TecFancy/repeater` (`features/subtitle-parser/lib/`), with two
 * changes: VTT has its own entry point instead of falling through the SRT
 * pattern, and everything is expressed as module functions over the local cue
 * type rather than imports through an FSD alias.
 */
import type { Cue, CueOrigin } from '../model/types.ts'
import { stripStyleTags } from './decode.ts'

const TIME_RANGE = /(\d{1,2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[.,]\d{3})/
const LRC_TIME = /\[(\d{1,}):(\d{2})[.:](\d{2,3})\](.*)/

/**
 * `00:01:02,500` and `00:01:02.500` both mean 62 500 milliseconds.
 *
 * Whole milliseconds rather than float seconds, because the host finds the cue again by this
 * number and `62.5 * 1000` style arithmetic is not always the integer the file wrote.
 */
function timecodeToMs(value: string): number {
  const [clock = '', millis = '0'] = value.split(/[.,]/)
  const parts = clock.split(':').map(Number)
  const seconds = parts.reduce((total, part) => total * 60 + part, 0)
  return seconds * 1000 + Number(millis)
}

/**
 * Number the cues that share one exact range, in the order the file has them.
 *
 * Every timecode the file holds is counted, including a block whose text turns out empty and is
 * dropped, because the host counts the file's timecodes and the two must agree on "the second
 * cue at 00:01:02,500".
 */
function occurrenceCounter(): (start: number, end: number) => CueOrigin {
  const seen = new Map<string, number>()
  return (start, end) => {
    const key = `${String(start)}-${String(end)}`
    const occurrence = seen.get(key) ?? 0
    seen.set(key, occurrence + 1)
    return { start, end, occurrence }
  }
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
  const originOf = occurrenceCounter()

  for (const block of blocks) {
    const timeMatch = TIME_RANGE.exec(block)
    if (timeMatch === null) continue
    // Counted before the block can be dropped for having no text: see `occurrenceCounter`.
    const origin = originOf(timecodeToMs(timeMatch[1] ?? ''), timecodeToMs(timeMatch[2] ?? ''))
    const lines = block.split('\n').filter((line) => line.trim().length > 0)
    if (lines.length < 2) continue

    const body = lines
      .filter((line) => TIME_RANGE.exec(line) === null && !/^\d+$/.test(line.trim()))
      .join('\n')
      .trim()
    const cleaned = stripStyleTags(body)
    if (cleaned.length > 0) cues.push({ start: origin.start / 1000, end: origin.end / 1000, text: cleaned, origin })
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
 * milliseconds are accepted, disambiguated by digit count (so `.050` is fifty
 * milliseconds, not half a second). Minutes may run past 99 so long-form audio
 * is not silently dropped.
 */
export function parseLRC(text: string): Cue[] {
  const cues: Cue[] = []
  const originOf = occurrenceCounter()
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    const match = LRC_TIME.exec(line)
    if (match === null) continue
    const fraction = match[3] ?? '0'
    const ms =
      Number(match[1]) * 60_000 + Number(match[2]) * 1000 + Number(fraction) * (fraction.length === 2 ? 10 : 1)
    const origin = originOf(ms, ms)
    const body = stripStyleTags((match[4] ?? '').trim())
    if (body.length > 0) cues.push({ start: ms / 1000, end: ms / 1000 + 3, text: body, origin })
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
