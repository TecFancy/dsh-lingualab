/**
 * The two slots of a subtitle choice as the popover edits them.
 *
 * A `<select>` holds one string, so each pick is written as one: `auto`, `none`, or `file:` and the
 * name. The prefix keeps a file literally named `auto.srt` apart from the automatic pick.
 */
import type { SubtitleChoice, SubtitlePick } from '../../../shared/protocol.ts'

/** The `<select>` value of one pick. */
export function pickValue(pick: SubtitlePick): string {
  return pick.kind === 'file' ? `file:${pick.file}` : pick.kind
}

/** The pick a `<select>` value stands for; anything unknown reads as automatic. */
export function pickOf(value: string): SubtitlePick {
  if (value === 'none') return { kind: 'none' }
  if (value.startsWith('file:') && value.length > 'file:'.length) return { kind: 'file', file: value.slice('file:'.length) }
  return { kind: 'auto' }
}

/** Whether two choices pick the same thing in both slots. */
export function sameChoice(left: SubtitleChoice, right: SubtitleChoice): boolean {
  return pickValue(left.en) === pickValue(right.en) && pickValue(left.zh) === pickValue(right.zh)
}

/** Whether a choice picks anything by hand, which the control bar shows as an outlined chip. */
export function isHandPicked(choice: SubtitleChoice | undefined): boolean {
  return choice !== undefined && (choice.en.kind !== 'auto' || choice.zh.kind !== 'auto')
}
