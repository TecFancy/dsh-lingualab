/**
 * The subtitle files a reader picked by hand, and how a pick overrides the name rule.
 *
 * The rule in `pairing.ts` still answers for every episode nobody has looked at; a choice only
 * replaces its answer for the slots it names. Each slot is `auto` (the rule's answer), `none`, or one
 * file. A picked file that is no longer in the folder plays as `auto`, and the choice is kept, so a
 * file that comes back (a sync that had not finished) is used again.
 *
 * A folder episode keeps its choices in a hidden {@link SUBTITLE_CHOICE_FILE} in the folder, one per
 * segment (or one for a folder without segments), so they travel with the folder as `notes.md`
 * does. A file episode keeps its choice in its record in the plugin state (see `state.ts`). The file is
 * written through a temporary sibling and a rename, and removed when nothing in it is chosen any more:
 * a folder nobody chose anything for carries nothing of the plugin's.
 *
 * Everything that reads is total: a missing, corrupt or hand-edited file reads as "nothing chosen".
 */
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import {
  SUBTITLE_CHOICE_FILE,
  SUBTITLE_EXTENSIONS,
  type SubtitleChoice,
  type SubtitleChoiceState,
  type SubtitlePick,
  type SubtitleSlot,
} from '../shared/protocol.ts'
import { compareIds } from './library.ts'

/** Both slots left to the name rule: what an episode nobody chose for plays with. */
export const AUTO_CHOICE: SubtitleChoice = { en: { kind: 'auto' }, zh: { kind: 'auto' } }

/** The longest file name a pick may carry, the same ceiling a segment id has. */
const MAX_FILE_LENGTH = 300

/** Whether a name is a plain subtitle file name: no separators, no escapes, a subtitle extension. */
export function isSubtitleName(name: string): boolean {
  if (name.length === 0 || name.length > MAX_FILE_LENGTH) return false
  if (name.includes('/') || name.includes('\\') || name.includes('\0') || name === '.' || name === '..') return false
  return (SUBTITLE_EXTENSIONS as readonly string[]).includes(extname(name).slice(1).toLowerCase())
}

/** Read one slot, or `null` when it is not one. */
function sanitizePick(input: unknown): SubtitlePick | null {
  if (typeof input !== 'object' || input === null) return null
  const pick = input as Record<string, unknown>
  if (pick.kind === 'auto') return { kind: 'auto' }
  if (pick.kind === 'none') return { kind: 'none' }
  if (pick.kind === 'file' && typeof pick.file === 'string' && isSubtitleName(pick.file)) return { kind: 'file', file: pick.file }
  return null
}

/**
 * Read one choice from a request body or from the file.
 * @param input - the raw value, trusted for nothing.
 * @returns the choice, or `null` when either slot is not one.
 */
export function sanitizeChoice(input: unknown): SubtitleChoice | null {
  if (typeof input !== 'object' || input === null) return null
  const record = input as Record<string, unknown>
  const en = sanitizePick(record.en)
  const zh = sanitizePick(record.zh)
  return en === null || zh === null ? null : { en, zh }
}

/** Whether a choice leaves both slots to the name rule, which is the same as no choice at all. */
export function isAutomatic(choice: SubtitleChoice): boolean {
  return choice.en.kind === 'auto' && choice.zh.kind === 'auto'
}

/** The subtitle files among one directory's names, in natural order: what a choice may pick from. */
export function subtitleFilesOf(names: readonly string[]): string[] {
  return names.filter(isSubtitleName).sort(compareIds)
}

/** What a choice resolves to against the files that are there now. */
export interface ResolvedChoice {
  readonly en: string | null
  readonly zh: string | null
  /** The choice in force with its missing slots, or `undefined` when both slots are automatic. */
  readonly state: SubtitleChoiceState | undefined
}

/**
 * Lay a choice over what the name rule picked.
 * @param auto - the rule's answer for each slot.
 * @param choice - the stored choice, `undefined` when there is none.
 * @param names - the visible file names of the directory the files are in.
 * @returns the file of each slot, and the choice with the slots whose file is gone.
 */
export function applyChoice(
  auto: { readonly en: string | null; readonly zh: string | null },
  choice: SubtitleChoice | undefined,
  names: readonly string[],
): ResolvedChoice {
  if (choice === undefined || isAutomatic(choice)) return { en: auto.en, zh: auto.zh, state: undefined }
  const missing: SubtitleSlot[] = []
  const slot = (which: SubtitleSlot): string | null => {
    const pick = choice[which]
    if (pick.kind === 'none') return null
    if (pick.kind === 'file') {
      if (names.includes(pick.file)) return pick.file
      missing.push(which)
    }
    return auto[which]
  }
  const en = slot('en')
  const zh = slot('zh')
  return { en, zh, state: { choice, missing } }
}

/** The choices of one episode folder: one for a folder without segments, one per segment otherwise. */
export interface FolderChoices {
  readonly folder: SubtitleChoice | undefined
  readonly segments: Readonly<Record<string, SubtitleChoice>>
}

const NO_CHOICES: FolderChoices = { folder: undefined, segments: {} }

/** Where one folder's choices are kept. */
export function choicesPath(folder: string): string {
  return join(folder, SUBTITLE_CHOICE_FILE)
}

/** Read one folder's choices. A missing or unreadable file, or an entry that is not a choice, is nothing chosen. */
export function readFolderChoices(folder: string): FolderChoices {
  const path = choicesPath(folder)
  if (!existsSync(path)) return NO_CHOICES
  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return NO_CHOICES
  }
  if (typeof parsed !== 'object' || parsed === null) return NO_CHOICES
  const record = parsed as Record<string, unknown>
  if (record.version !== 1) return NO_CHOICES
  const own = sanitizeChoice(record.folder)
  const segments: Record<string, SubtitleChoice> = {}
  if (typeof record.segments === 'object' && record.segments !== null) {
    for (const [id, value] of Object.entries(record.segments as Record<string, unknown>)) {
      const choice = sanitizeChoice(value)
      if (choice !== null && !isAutomatic(choice)) segments[id] = choice
    }
  }
  return { folder: own === null || isAutomatic(own) ? undefined : own, segments }
}

/** The choice of one segment, or of the folder when `segment` is `null`. */
export function choiceFor(choices: FolderChoices, segment: string | null): SubtitleChoice | undefined {
  return segment === null ? choices.folder : choices.segments[segment]
}

/** The file's text, with a fixed field order and the segments in natural order, so a diff stays readable. */
function serializeChoices(choices: FolderChoices): string {
  const segments: Record<string, SubtitleChoice> = {}
  for (const id of Object.keys(choices.segments).sort(compareIds)) {
    const choice = choices.segments[id]
    if (choice !== undefined) segments[id] = choice
  }
  return `${JSON.stringify({ version: 1, ...(choices.folder === undefined ? {} : { folder: choices.folder }), segments }, null, 1)}\n`
}

/**
 * Store the choice of one segment (or of the folder), replacing what was there.
 *
 * An automatic choice removes the entry, and a file left with no entries is removed. Throws when the
 * file cannot be written; the caller turns that into an answer.
 * @param folder - the absolute path of the episode folder.
 * @param segment - the segment id, or `null` for a folder without segments.
 * @param choice - the new choice.
 */
export function writeFolderChoice(folder: string, segment: string | null, choice: SubtitleChoice): void {
  const before = readFolderChoices(folder)
  const keep = isAutomatic(choice) ? undefined : choice
  const segments = { ...before.segments }
  if (segment !== null) {
    if (keep === undefined) delete segments[segment]
    else segments[segment] = keep
  }
  const next: FolderChoices = { folder: segment === null ? keep : before.folder, segments }
  const path = choicesPath(folder)
  if (next.folder === undefined && Object.keys(next.segments).length === 0) {
    rmSync(path, { force: true })
    return
  }
  const temporary = `${path}.${String(process.pid)}.tmp`
  try {
    writeFileSync(temporary, serializeChoices(next), 'utf8')
    renameSync(temporary, path)
  } catch (error) {
    rmSync(temporary, { force: true })
    throw error
  }
}
