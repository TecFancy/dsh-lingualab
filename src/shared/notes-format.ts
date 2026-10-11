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
 * An episode cut into segments (one scene per audio file) keeps one `notes.md` and groups
 * its phrases under a `## <segment id>` heading each:
 *
 * ```markdown
 * # S01E01 笔记
 *
 * ## 01_Dunphy家的早晨
 *
 * - [ ] 00:01 | Kids, breakfast! | 孩子们 吃早饭了 | | #review
 *
 * ## 02_足球场
 *
 * - [ ] 00:09 | He tripped him, Jay. | 他绊倒他了 杰 | |
 * ```
 *
 * The phrase line itself is unchanged, and a file without headings still reads: its phrases
 * have no segment. The preamble then ends at the first segment heading or the first phrase
 * line, whichever comes first.
 *
 * A subtitle line may itself contain a `|`, so the separator is escaped on the way
 * out and unescaped on the way in. Splitting on a bare `|` would silently shift
 * every field of that one line — the English text would become the Chinese gloss,
 * and the next save would write the corruption back.
 */
import type { NotePhrase, NotesSummary } from './protocol.ts'

/**
 * A sanity ceiling on one episode's notes, not a rule of the study method.
 *
 * Earlier versions capped a list at seven so that keeping a phrase forced a choice,
 * and asked which one to replace when it was full. In use that choice came at the
 * worst moment: mid-sentence, with the audio still running, to save a phrase you had
 * already decided to keep. The cap is gone; what the method wanted from it is now
 * done by grading (see {@link Grade}), which lets a phrase leave the working set
 * without being deleted.
 *
 * This number only exists so a runaway client cannot write an unbounded file. An
 * episode that reaches it has a different problem from a long notes list.
 */
export const MAX_PHRASES = 500

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

/** A segment heading: exactly two hashes, then the segment id. `###` and deeper are not ours. */
const SEGMENT_HEADING = /^##(?!#)\s+(.+?)\s*$/

/** One thing a notes line turned out to be, with its place in the file. */
type Token =
  | { readonly kind: 'phrase'; readonly line: number; readonly phrase: NotePhrase }
  | { readonly kind: 'heading'; readonly line: number; readonly id: string }

/**
 * Split a notes file into its preserved preamble and its phrases.
 *
 * A `## <id>` heading names the segment of the phrase lines under it, until the next heading.
 * Only a heading with a phrase line directly under it counts: an `## 备注` that someone wrote
 * into the preamble as commentary, with prose below it, stays in the preamble instead of
 * turning into a segment.
 */
export function parseNotes(markdown: string): { preamble: string; phrases: NotePhrase[] } {
  const lines = markdown.split(/\r?\n/)
  const tokens: Token[] = []
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? ''
    const phrase = parsePhraseLine(line)
    if (phrase !== null) {
      tokens.push({ kind: 'phrase', line: index, phrase })
      continue
    }
    const heading = SEGMENT_HEADING.exec(line)
    if (heading?.[1] !== undefined) tokens.push({ kind: 'heading', line: index, id: heading[1] })
  }

  const phrases: NotePhrase[] = []
  let segment: string | undefined
  let boundary = -1
  for (let at = 0; at < tokens.length; at += 1) {
    const token = tokens[at]
    if (token === undefined) continue
    if (token.kind === 'heading') {
      if (tokens[at + 1]?.kind !== 'phrase') continue
      segment = token.id
      if (boundary === -1) boundary = token.line
      continue
    }
    if (boundary === -1) boundary = token.line
    phrases.push(segment === undefined ? token.phrase : { ...token.phrase, segment })
  }

  const preamble = boundary === -1 ? markdown : lines.slice(0, boundary).join('\n')
  return { preamble: preamble.replace(/\s+$/, ''), phrases }
}

/**
 * Give the phrases that carry no segment one, leaving the others alone.
 *
 * A notes file written before the episode had segments has no headings, and what it holds
 * was recorded against the first audio file, which is the first segment. Reading and writing
 * both apply this, so those phrases move under the first heading on the next save instead of
 * being left outside every group.
 * @param phrases - the phrases as parsed or as received.
 * @param segment - the segment to give them, or `undefined` for an episode without segments.
 * @returns the same array when nothing changes, so a caller's identity checks still hold.
 */
export function withSegmentDefault(
  phrases: readonly NotePhrase[],
  segment: string | undefined,
): readonly NotePhrase[] {
  if (segment === undefined || phrases.every((phrase) => phrase.segment !== undefined)) return phrases
  return phrases.map((phrase) => (phrase.segment === undefined ? { ...phrase, segment } : phrase))
}

/** One phrase line, as it is written. */
function phraseLine(phrase: NotePhrase): string {
  const tags = phrase.tags.map((tag) => `#${tag.replace(/^#+/, '')}`).join(' ')
  const fields = [formatTimestamp(phrase.at), phrase.text, phrase.zh, phrase.note].map(joinField)
  // The note field is trimmed of trailing pipes: an empty trailing field
  // would make the line end in `|` and read like a truncated table row. Not when tags
  // follow it: the tags are read by position, so an empty note must stay as an empty field
  // or `| 中文 | #review` reads back with the tag as the note.
  while (tags.length === 0 && fields.length > 3 && (fields[fields.length - 1] ?? '').trim().length === 0) fields.pop()
  const tail = tags.length > 0 ? ` | ${tags}` : ''
  return `- [${phrase.done ? 'x' : ' '}] ${fields.join(' | ').trimEnd()}${tail}`
}

/**
 * The canonical file body. `preamble` is kept as-is, then the phrase lines.
 *
 * Phrases with no segment are written flat, as they always were. When the episode has
 * segments, `segmentOrder` lists their ids in play order: those phrases go under the first
 * one, and every group is written under its `## <id>` heading in that order. A segment the
 * list does not know (an audio file that was renamed since) still keeps its heading, after
 * the known ones, in the order its phrases first appear. Within a group the phrases keep the
 * order they were given in.
 * @param preamble - the text above the first phrase, kept verbatim.
 * @param phrases - every phrase of the episode.
 * @param segmentOrder - the episode's segment ids in order, or none when it has no segments.
 */
export function serializeNotes(
  preamble: string,
  phrases: readonly NotePhrase[],
  segmentOrder: readonly string[] = [],
): string {
  const head = preamble.trim().length > 0 ? `${preamble.replace(/\s+$/, '')}\n\n` : ''
  const groups = new Map<string | undefined, NotePhrase[]>()
  for (const phrase of withSegmentDefault(phrases, segmentOrder[0])) {
    const group = groups.get(phrase.segment)
    if (group === undefined) groups.set(phrase.segment, [phrase])
    else group.push(phrase)
  }
  // Flat phrases first, then the known segments in play order, then any stranger.
  const known = segmentOrder.filter((id, at) => groups.has(id) && segmentOrder.indexOf(id) === at)
  const strangers = [...groups.keys()].filter((id): id is string => id !== undefined && !known.includes(id))
  const sequence: Array<string | undefined> = [...(groups.has(undefined) ? [undefined] : []), ...known, ...strangers]
  const body = sequence
    .map((id) => {
      const lines = (groups.get(id) ?? []).map(phraseLine).join('\n')
      return id === undefined ? `${lines}\n` : `## ${id.replace(/[\r\n]+/g, ' ').trim()}\n\n${lines}\n`
    })
    .join('\n')
  return `${head}${body}`
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

/** Whether another phrase fits under the sanity ceiling. */
export function phraseCapacity(phrases: readonly NotePhrase[]): {
  readonly full: boolean
  readonly remaining: number
} {
  const remaining = Math.max(0, MAX_PHRASES - phrases.length)
  return { full: remaining === 0, remaining }
}

/** What identifies a kept sentence: where it is, what it says and, in a segmented episode, which scene it is in. */
export interface KeptSentence {
  readonly at: number
  readonly text: string
  /** The segment id; two sentences in different segments are never the same one. */
  readonly segment?: string | undefined
}

/**
 * Whether two phrases are the same kept sentence.
 *
 * `notes.md` stores whole seconds (`00:12`), so a sentence kept at 12.48 s reads back as
 * 12. Comparing the raw numbers therefore stopped matching the moment a page reloaded:
 * the star showed empty, the wrong row showed a filled one, and pressing it again added a
 * second copy that nothing could remove. The comparison is on the whole second the file
 * can actually hold, and on the text as well, because two short sentences can start in
 * the same second and must not be mistaken for each other. The segment counts too: two
 * scenes can both open on 「Kids?」 at 00:02, and the star on one must not light the other.
 * @param left - one phrase, or a timestamp, the sentence's text and its segment.
 * @param right - the other.
 * @returns true when they name the same sentence.
 */
export function sameKeptSentence(left: KeptSentence, right: KeptSentence): boolean {
  return keptSentenceKey(left) === keptSentenceKey(right)
}

/**
 * The key two phrases share when they are the same kept sentence.
 *
 * Exposed so a list of hundreds of cues can be checked against hundreds of phrases with a
 * set lookup instead of a nested loop, and so the loop and sameKeptSentence cannot
 * disagree: one is defined by the other.
 * @param sentence - a phrase, or a cue's start, its English text and the segment it is in.
 * @returns the key.
 */
export function keptSentenceKey(sentence: KeptSentence): string {
  return `${sentence.segment ?? ''}\u0000${String(Math.floor(sentence.at))}\u0000${sentence.text.trim()}`
}

/**
 * Whether a phrase is one the reader has marked as still worth working on.
 *
 * With the ceiling gone, "which ones am I still learning" is the filter that keeps a
 * long list usable: a phrase is active until it is ticked done.
 */
export function isActivePhrase(phrase: NotePhrase): boolean {
  return !phrase.done
}

/**
 * The one state a kept sentence is in, set by grading it.
 *
 * The file has no field for it and does not need one: the tick and the method's two tags
 * already say it, read in a fixed order. A ticked line is 「记住了」 whatever else it carries; an
 * unticked one with `#hard` is 「没记住」, also when it has `#review` too; `#review` alone is
 * 「模糊」; neither is 「新收藏」. So a file written by hand, or before grading existed, reads as
 * one state per line without being rewritten.
 */
export type Grade = 'new' | 'fuzzy' | 'notyet' | 'got'

/** The grades a reader can give, in the order the keys `1` to `3` give them. */
export const GIVEN_GRADES = ['got', 'fuzzy', 'notyet'] as const

/** A grade the reader gives; 「新收藏」 is only ever where a sentence starts. */
export type GivenGrade = (typeof GIVEN_GRADES)[number]

/** Read a phrase's grade off its tick and tags. */
export function gradeOf(phrase: Pick<NotePhrase, 'done' | 'tags'>): Grade {
  if (phrase.done) return 'got'
  if (phrase.tags.includes('hard')) return 'notyet'
  if (phrase.tags.includes('review')) return 'fuzzy'
  return 'new'
}

/**
 * The phrase with a grade given: the tick and both of the method's tags are cleared, then the
 * grade's own mark is set. Any other tag the reader wrote by hand stays where it was.
 */
export function withGrade(phrase: NotePhrase, grade: GivenGrade): NotePhrase {
  const others = phrase.tags.filter((tag) => !(KNOWN_TAGS as readonly string[]).includes(tag))
  if (grade === 'got') return { ...phrase, done: true, tags: others }
  return { ...phrase, done: false, tags: [...others, grade === 'fuzzy' ? 'review' : 'hard'] }
}

/**
 * The phrases in the order the episode plays them: segment by segment, then by time.
 *
 * A phrase with no segment belongs to the first one, as everywhere else. A segment the order does
 * not know (an audio file renamed since) goes after the known ones, in the order its phrases first
 * appear. The sort is stable, so two phrases at the same second keep the order they came in.
 * @param phrases - an episode's phrases, in any order.
 * @param segmentOrder - its segment ids in order; empty for an episode without segments.
 */
export function inPlayOrder<T extends Pick<NotePhrase, 'at' | 'segment'>>(
  phrases: readonly T[],
  segmentOrder: readonly string[],
): T[] {
  const rank = new Map<string | undefined, number>(segmentOrder.map((id, at) => [id, at]))
  const rankOf = (segment: string | undefined): number => {
    const id = segment ?? segmentOrder[0]
    const known = rank.get(id)
    if (known !== undefined) return known
    // Neither known nor seen yet: after everything seen so far.
    rank.set(id, segmentOrder.length + rank.size)
    return rank.get(id) ?? 0
  }
  return phrases
    .map((phrase, index) => ({ phrase, index, rank: rankOf(phrase.segment) }))
    .sort((left, right) => left.rank - right.rank || left.phrase.at - right.phrase.at || left.index - right.index)
    .map((item) => item.phrase)
}
