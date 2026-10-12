/**
 * Moving a cue's start and end inside a subtitle file, and nothing else.
 *
 * The page loops one sentence at a time, so a cue whose edges are a beat off clips a word on
 * every pass. The reader fixes it on the page, and the fix is written into the file itself, so
 * other players and the agent read the corrected timing too and there is no second source of
 * timing to reconcile.
 *
 * **Only the timecode changes.** The file is never parsed and written out again: the parser
 * drops numbering, style tags and blocks it cannot read, and sorts the cues, so a round trip
 * would rewrite far more than one sentence. Instead the cue's timecode is found in the text and
 * the two times are replaced in place, in the format the line already used (`,` or `.` before
 * the milliseconds, the width of the hours, two or three fraction digits in LRC).
 *
 * **Encodings survive because the timecode is ASCII.** UTF-8, GBK and GB18030 all write ASCII
 * as the same single bytes, and none of their multi-byte sequences can spell a timecode, so the
 * file is read as Latin-1 (one character per byte, and back again without loss) and the
 * surrounding bytes are never decoded at all. Node has no GBK encoder, so this is also the only
 * way a GBK file could come back as GBK. UTF-16 files, which start with a byte-order mark, are
 * decoded and encoded again through Node's own UTF-16 support.
 *
 * **A neighbour can move with it.** When the reader pulls a start earlier than the previous cue's
 * end (or an end later than the next cue's start), the page sends that neighbour's new edge too,
 * so one request may carry several cues of one file. They are all looked for in the text as it
 * was read and replaced in one pass, so moving one never changes how another is found.
 *
 * **A stale page is refused.** The request carries a hash of the bytes the page parsed and the
 * cue's range as it read it. When either no longer matches, nothing is written and the answer
 * says so, so an edit made elsewhere in the meantime is never overwritten blind. Every edit of a
 * request is checked before any file is written, so a sentence whose Chinese lives in a second
 * file never ends up moved in one file and not in the other.
 *
 * Before the first write to a file its original is copied beside it as `<name>.bak`, once; that
 * copy is never overwritten, so the file as it arrived can always be had back.
 */
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { MIN_CUE_MS, type TimingEdit, type TimingWritePayload } from '../shared/protocol.ts'
import { isSafeEpisodeId } from './episode-id.ts'
import { resolveFileMedia } from './file-media.ts'
import { isInside } from './places.ts'
import { isFileEpisodeId, type OpenState } from './state.ts'

/** The most edits one request may carry: a cue and both neighbours, in an English file and a Chinese one. */
const MAX_EDITS = 6

/** Subtitle formats this module can edit, by extension. */
const EDITABLE = new Set(['srt', 'vtt', 'lrc'])

/** SRT and VTT timecode pairs. The same shape the page's parser accepts, so both find the same cues. */
const RANGE_LINE = /(\d{1,2}):(\d{2}):(\d{2})([.,])(\d{3})(\s*-->\s*)(\d{1,2}):(\d{2}):(\d{2})([.,])(\d{3})/g

/** The first LRC time tag on a line, as the page's parser reads it: one per line, anywhere in it. */
const LRC_TAG = /\[(\d+):(\d{2})([.:])(\d{2,3})\]/

/** The outcome of editing one file's text. */
export type EditOutcome =
  | { readonly ok: true; readonly bytes: Buffer }
  | { readonly ok: false; readonly code: 'stale' | 'refused'; readonly reason: string }

/** The hex SHA-256 of some bytes; the page computes the same over what it fetched. */
export function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex')
}

/** Write `ms` in the shape of an SRT/VTT time whose hours were `hourWidth` digits wide. */
function formatRangeTime(ms: number, hourWidth: number, separator: string): string {
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  const seconds = Math.floor((ms % 60_000) / 1000)
  const millis = ms % 1000
  return `${String(hours).padStart(hourWidth, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${separator}${String(millis).padStart(3, '0')}`
}

/** Write `ms` as an LRC tag body, keeping the minute width, the separator and the fraction digits. */
function formatLrcTime(ms: number, minuteWidth: number, separator: string, fractionDigits: number): string {
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.floor((ms % 60_000) / 1000)
  const fraction = fractionDigits === 2 ? Math.floor((ms % 1000) / 10) : ms % 1000
  return `${String(minutes).padStart(minuteWidth, '0')}:${String(seconds).padStart(2, '0')}${separator}${String(fraction).padStart(fractionDigits, '0')}`
}

/** Milliseconds of `h:mm:ss.mmm`, from the captured parts. */
function rangeMs(hours: string, minutes: string, seconds: string, millis: string): number {
  return Number(hours) * 3_600_000 + Number(minutes) * 60_000 + Number(seconds) * 1000 + Number(millis)
}

/** Milliseconds of an LRC tag; two fraction digits are centiseconds. */
function lrcMs(minutes: string, seconds: string, fraction: string): number {
  const part = fraction.length === 2 ? Number(fraction) * 10 : Number(fraction)
  return Number(minutes) * 60_000 + Number(seconds) * 1000 + part
}

/** The key of a range, the same for two cues with exactly the same times. */
function rangeKey(start: number, end: number): string {
  return `${String(start)}-${String(end)}`
}

/** Which cue of a text an edit moves, and where to. */
type CueMove = Pick<TimingEdit, 'from' | 'to'>

/**
 * Replace some cues' times in a subtitle text, in one pass over it.
 *
 * Every cue is looked for as the text was read, so an edit that moves one cue onto another's old
 * range never changes which cue the other edit finds.
 * @param text - the whole file as one string (Latin-1 or decoded UTF-16).
 * @param format - `srt`, `vtt` or `lrc`.
 * @param edits - which cues, and where each goes.
 * @returns the new text, or why a cue could not be found.
 */
export function retimeText(
  text: string,
  format: string,
  edits: readonly CueMove[],
): { readonly ok: true; readonly text: string } | { readonly ok: false; readonly reason: string } {
  const seen = new Map<string, number>()
  const found = new Set<CueMove>()
  /** Count one more cue at this range, and return the edit meant for it, if any. */
  const claim = (start: number, end: number): CueMove | undefined => {
    const key = rangeKey(start, end)
    const occurrence = seen.get(key) ?? 0
    seen.set(key, occurrence + 1)
    const edit = edits.find((each) => each.from.start === start && each.from.end === end && each.from.occurrence === occurrence)
    if (edit !== undefined) found.add(edit)
    return edit
  }
  let next: string
  if (format === 'lrc') {
    next = text
      .split('\n')
      .map((line) => {
        const match = LRC_TAG.exec(line)
        if (match === null) return line
        const [tag, minutes = '', seconds = '', separator = '', fraction = ''] = match
        const at = lrcMs(minutes, seconds, fraction)
        const edit = claim(at, at)
        if (edit === undefined) return line
        const replaced = `[${formatLrcTime(edit.to.start, minutes.length, separator, fraction.length)}]`
        return `${line.slice(0, match.index)}${replaced}${line.slice(match.index + tag.length)}`
      })
      .join('\n')
  } else {
    next = text.replace(
      RANGE_LINE,
      (whole, h1: string, m1: string, s1: string, sep1: string, ms1: string, arrow: string, h2: string, m2: string, s2: string, sep2: string, ms2: string) => {
        const edit = claim(rangeMs(h1, m1, s1, ms1), rangeMs(h2, m2, s2, ms2))
        if (edit === undefined) return whole
        return `${formatRangeTime(edit.to.start, h1.length, sep1)}${arrow}${formatRangeTime(edit.to.end, h2.length, sep2)}`
      },
    )
  }
  return found.size === edits.length ? { ok: true, text: next } : { ok: false, reason: '文件里找不到这一句的时间' }
}

/**
 * Apply one file's edits to its bytes, keeping every byte that is not a timecode.
 * @param bytes - the file as it is on disk.
 * @param format - `srt`, `vtt` or `lrc`.
 * @param edits - the edits of this one file, each of whose `expect` is checked against `bytes`.
 */
export function retimeBytes(bytes: Buffer, format: string, edits: readonly TimingEdit[]): EditOutcome {
  const file = edits[0]?.file ?? ''
  const hash = sha256Hex(bytes)
  if (edits.some((edit) => edit.expect !== hash)) {
    return { ok: false, code: 'stale', reason: `「${file}」在页面读过之后改过了，重新加载字幕再调` }
  }
  const utf16 =
    bytes.length >= 2 && ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff))
  if (!utf16) {
    const result = retimeText(bytes.toString('latin1'), format, edits)
    return result.ok
      ? { ok: true, bytes: Buffer.from(result.text, 'latin1') }
      : { ok: false, code: 'stale', reason: `「${file}」${result.reason}` }
  }
  const bigEndian = bytes[0] === 0xfe
  const body = Buffer.from(bytes.subarray(2))
  if (bigEndian) body.swap16()
  const result = retimeText(body.toString('utf16le'), format, edits)
  if (!result.ok) return { ok: false, code: 'stale', reason: `「${file}」${result.reason}` }
  const encoded = Buffer.from(result.text, 'utf16le')
  if (bigEndian) encoded.swap16()
  return { ok: true, bytes: Buffer.concat([bytes.subarray(0, 2), encoded]) }
}

/** Why an edit's numbers cannot be used, or `null` when they can. */
function rangeProblem(edit: TimingEdit, format: string): string | null {
  const whole = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0
  const { from, to } = edit
  if (!whole(from.start) || !whole(from.end) || !whole(from.occurrence) || !whole(to.start) || !whole(to.end)) {
    return '时间要是非负的整数毫秒'
  }
  if (format !== 'lrc' && to.end - to.start < MIN_CUE_MS) return `结尾至少要比开头晚 ${String(MIN_CUE_MS)} 毫秒`
  // The widest time an SRT line can hold with two hour digits.
  if (to.end >= 100 * 3_600_000 || to.start >= 100 * 3_600_000) return '时间超出了字幕能写的范围'
  return null
}

/** Narrow the request body to edits, or say what is wrong with it. */
function readEdits(body: unknown): { readonly episode: string; readonly edits: TimingEdit[] } | string {
  if (typeof body !== 'object' || body === null) return '请求体不是对象'
  const { episode, edits } = body as { episode?: unknown; edits?: unknown }
  if (typeof episode !== 'string' || episode.length === 0) return '缺 episode'
  if (!Array.isArray(edits) || edits.length === 0 || edits.length > MAX_EDITS) return `edits 要有 1 到 ${String(MAX_EDITS)} 项`
  const parsed: TimingEdit[] = []
  for (const item of edits as unknown[]) {
    if (typeof item !== 'object' || item === null) return 'edits 里有一项不是对象'
    const { file, from, to, expect } = item as Record<string, unknown>
    if (typeof file !== 'string' || typeof expect !== 'string' || typeof from !== 'object' || from === null || typeof to !== 'object' || to === null) {
      return 'edits 里有一项缺 file、from、to 或 expect'
    }
    parsed.push({ file, from: from as TimingEdit['from'], to: to as TimingEdit['to'], expect: expect.toLowerCase() })
  }
  const cues = parsed.map((edit) => [edit.file, rangeKey(edit.from.start, edit.from.end), String(edit.from.occurrence)].join('\0'))
  if (new Set(cues).size !== cues.length) return '同一句只能改一次'
  return { episode, edits: parsed }
}

/**
 * Where one subtitle file of one episode is, when it may be written.
 *
 * A folder episode's files are under the library root by construction. A file episode is one
 * the reader picked; it may be written only when it sits inside the library too (a loose file at
 * the root), never in a workspace somewhere else on the disk.
 */
function resolveSubtitle(
  root: string,
  state: OpenState,
  episode: string,
  file: string,
): { readonly ok: true; readonly path: string } | { readonly ok: false; readonly status: number; readonly reason: string } {
  const refuse = (status: number, reason: string) => ({ ok: false, status, reason }) as const
  if (file.length === 0 || file.includes('/') || file.includes('\\') || file.includes('\0') || file === '..') {
    return refuse(400, '文件名不对')
  }
  if (!EDITABLE.has(extname(file).slice(1).toLowerCase())) return refuse(400, '只能改 SRT、VTT 和 LRC 字幕')
  let target: string | null
  if (isFileEpisodeId(episode)) {
    target = resolveFileMedia(state, `/${encodeURIComponent(episode)}/${encodeURIComponent(file)}`)
  } else {
    target = isSafeEpisodeId(episode) ? join(root, episode, file) : null
  }
  try {
    if (target === null || !statSync(target).isFile()) return refuse(404, '找不到这个字幕文件')
  } catch {
    return refuse(404, '找不到这个字幕文件')
  }
  if (root.trim().length === 0 || !isInside(root, target)) {
    return refuse(403, '这个字幕不在媒体库里，页面不改媒体库以外的文件')
  }
  return { ok: true, path: target }
}

/** Replace a file through a temporary sibling, so a failed write leaves the old one whole. */
function writeAtomically(path: string, bytes: Buffer): void {
  const temporary = `${path}.${String(process.pid)}.tmp`
  try {
    writeFileSync(temporary, bytes)
    renameSync(temporary, path)
  } catch (error) {
    rmSync(temporary, { force: true })
    throw error
  }
}

/** One answer of the route, with the status it is sent with. */
export interface TimingResult {
  readonly status: number
  readonly payload: TimingWritePayload
}

/** A refusal or a stale answer, with nothing written. */
function answer(status: number, code: TimingWritePayload['code'], reason: string): TimingResult {
  return { status, payload: { ok: false, code, reason, files: [] } }
}

/**
 * Carry out one `POST /lingualab/subtitle-timing`.
 * @param root - the library root.
 * @param state - the plugin state, which maps file episode ids to paths.
 * @param body - the parsed request body, trusted for nothing.
 */
export function writeTiming(root: string, state: OpenState, body: unknown): TimingResult {
  const request = readEdits(body)
  if (typeof request === 'string') return answer(400, 'refused', request)

  // The edits of each file together, files in the order they first appear.
  const byFile = new Map<string, TimingEdit[]>()
  for (const edit of request.edits) byFile.set(edit.file, [...(byFile.get(edit.file) ?? []), edit])

  const planned: { readonly path: string; readonly bytes: Buffer; readonly file: string }[] = []
  for (const [file, edits] of byFile) {
    const format = extname(file).slice(1).toLowerCase()
    for (const edit of edits) {
      const problem = rangeProblem(edit, format)
      if (problem !== null) return answer(400, 'refused', problem)
    }
    const resolved = resolveSubtitle(root, state, request.episode, file)
    if (!resolved.ok) return answer(resolved.status, 'refused', resolved.reason)
    const path = resolved.path
    let bytes: Buffer
    try {
      bytes = readFileSync(path)
    } catch (error) {
      return answer(500, 'refused', `读不了「${file}」：${String(error)}`)
    }
    const outcome = retimeBytes(bytes, format, edits)
    if (!outcome.ok) return answer(outcome.code === 'stale' ? 409 : 400, outcome.code, outcome.reason)
    planned.push({ path, bytes: outcome.bytes, file })
  }

  for (const write of planned) {
    try {
      const backup = `${write.path}.bak`
      // Once: the copy is of the file as it arrived, so a later save never replaces it.
      if (!existsSync(backup)) copyFileSync(write.path, backup)
      writeAtomically(write.path, write.bytes)
    } catch (error) {
      return answer(500, 'refused', `「${write.file}」没写进去：${String(error)}`)
    }
  }
  return { status: 200, payload: { ok: true, code: 'saved', reason: null, files: planned.map((write) => write.file) } }
}
