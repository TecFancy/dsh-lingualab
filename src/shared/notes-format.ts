/**
 * The notes markdown format, and the only place it is parsed or written.
 *
 * The file has to satisfy two readers at once: the panel, which seeks back to a
 * phrase by its timestamp, and a person (or the agent) skimming the file in an
 * editor. So the phrase line is a markdown checklist item whose fields are
 * separated by `|`, which keeps it parseable without turning it into JSON on
 * disk:
 *
 * ```markdown
 * # S01E02 笔记
 *
 * - [ ] 00:03:41 | I'm not gonna lie... | 说实话…… | Haley 常用开头 | #review
 * - [x] 00:12:07 | That's the whole point. | 重点就在这儿。 | Mitchell 怼人 |
 * ```
 *
 * Everything above the first phrase line is the preamble and is preserved
 * verbatim, so commentary written by hand or by the agent survives a save from
 * the panel. Everything else that is not a phrase line is dropped on save; the
 * file this module writes is canonical.
 *
 * A subtitle line may itself contain a `|`, so the separator is escaped on the way
 * out and unescaped on the way in. Splitting on a bare `|` would silently shift
 * every field of that one line — the English text would become the Chinese gloss,
 * and the next save would write the corruption back.
 */
import type { NotePhrase, NotesSummary } from './protocol.ts'

/**
 * The per-episode ceiling from the study method.
 *
 * Seven is a decision-forcing device, not a storage limit: when the list is full
 * the panel asks which phrase to drop rather than accepting an eighth. The cap
 * lives here so the panel and any writer agree on the number.
 */
export const MAX_PHRASES = 7

/** Tags the study method uses; anything else is allowed but not offered. */
export const KNOWN_TAGS = ['review', 'hard'] as const

/** `00:03:41` for `221`, `03:41` when the episode is shorter than an hour. */
export function formatTimestamp(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const secs = safe % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(secs).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Parse `mm:ss` or `h:mm:ss` back into seconds, or `null` when it is neither. */
export function parseTimestamp(text: string): number | null {
  const parts = text.trim().split(':')
  if (parts.length < 2 || parts.length > 3) return null
  const numbers = parts.map((part) => (/^\d+$/.test(part) ? Number(part) : Number.NaN))
  if (numbers.some((value) => Number.isNaN(value))) return null
  const [first = 0, second = 0, third] = numbers
  return third === undefined ? first * 60 + second : first * 3600 + second * 60 + third
}

const PHRASE_PATTERN = /^\s*-\s*\[( |x|X)\]\s*(.*)$/

/** Split on unescaped `|`, so `a\\|b` stays one field. */
function splitFields(body: string): string[] {
  return body.split(/(?<!\\)\|/).map((field) => field.replace(/\\\|/g, '|').trim())
}

/** Escape the separator so a field can contain one. */
function joinField(field: string): string {
  return field.replace(/\|/g, '\\|')
}

/** Split the tags field (`#review #hard`) into bare tag names. */
function parseTags(field: string): string[] {
  return field
    .split(/\s+/)
    .map((token) => token.replace(/^#+/, '').trim())
    .filter((token) => token.length > 0)
}

/** Read one checklist line, or `null` when the line is not a phrase. */
function parsePhraseLine(line: string): NotePhrase | null {
  const match = PHRASE_PATTERN.exec(line)
  if (match === null) return null
  const done = (match[1] ?? ' ').toLowerCase() === 'x'
  const body = match[2] ?? ''
  const fields = splitFields(body)

  // The timestamp leads: a phrase without one cannot be seeked back to, and the
  // panel reads these files it did not write, so a malformed line is skipped
  // rather than guessed at.
  const stamp = fields[0] === undefined ? null : parseTimestamp(fields[0])
  if (stamp === null) return null
  const text = (fields[1] ?? '').trim()
  if (text.length === 0) return null

  return {
    at: stamp,
    text,
    zh: (fields[2] ?? '').trim(),
    note: (fields[3] ?? '').trim(),
    tags: parseTags(fields[4] ?? ''),
    done,
  }
}

/** Split a notes file into its preserved preamble and its phrases. */
export function parseNotes(markdown: string): { preamble: string; phrases: NotePhrase[] } {
  const lines = markdown.split(/\r?\n/)
  const phrases: NotePhrase[] = []
  let firstPhraseAt = -1

  for (let index = 0; index < lines.length; index += 1) {
    const phrase = parsePhraseLine(lines[index] ?? '')
    if (phrase === null) continue
    if (firstPhraseAt === -1) firstPhraseAt = index
    phrases.push(phrase)
  }

  const preamble = firstPhraseAt === -1 ? markdown : lines.slice(0, firstPhraseAt).join('\n')
  return { preamble: preamble.replace(/\s+$/, ''), phrases }
}

/** The canonical file body. `preamble` is kept as-is, then one line per phrase. */
export function serializeNotes(preamble: string, phrases: readonly NotePhrase[]): string {
  const head = preamble.trim().length > 0 ? `${preamble.replace(/\s+$/, '')}\n\n` : ''
  const body = phrases
    .map((phrase) => {
      const tags = phrase.tags.map((tag) => `#${tag.replace(/^#+/, '')}`).join(' ')
      const fields = [formatTimestamp(phrase.at), phrase.text, phrase.zh, phrase.note].map(joinField)
      // The note field is trimmed of trailing pipes: an empty trailing field
      // would make the line end in `|` and read like a truncated table row.
      while (fields.length > 3 && (fields[fields.length - 1] ?? '').trim().length === 0) fields.pop()
      const tail = tags.length > 0 ? ` | ${tags}` : ''
      return `- [${phrase.done ? 'x' : ' '}] ${fields.join(' | ')}${tail}`
    })
    .join('\n')
  return `${head}${body}${body.length > 0 ? '\n' : ''}`
}

/** Counts the library listing shows without shipping the whole file. */
export function summarizeNotes(markdown: string | null): NotesSummary {
  if (markdown === null) return { exists: false, count: 0, review: 0, hard: 0 }
  const { phrases } = parseNotes(markdown)
  return {
    exists: true,
    count: phrases.length,
    review: phrases.filter((phrase) => phrase.tags.includes('review')).length,
    hard: phrases.filter((phrase) => phrase.tags.includes('hard')).length,
  }
}

/** Whether another phrase fits, and what to do when it does not. */
export function phraseCapacity(phrases: readonly NotePhrase[]): {
  readonly full: boolean
  readonly remaining: number
} {
  const remaining = Math.max(0, MAX_PHRASES - phrases.length)
  return { full: remaining === 0, remaining }
}
