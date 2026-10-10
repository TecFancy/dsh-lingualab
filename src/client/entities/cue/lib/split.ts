/**
 * One cue as two strings: the English line and the Chinese line.
 *
 * The page needs this in several places (the stage, the notes a star writes, the
 * transcript's kept marks), and each of them has to agree about which half is which,
 * so the split lives with the rest of the cue rules instead of in a component.
 */
import type { Cue } from '../model/types.ts'
import { orderCueLines } from './lines.ts'

/** The English and Chinese halves of one cue, split the way the notes file wants them. */
export function splitCue(cue: Pick<Cue, 'text'>): { readonly english: string; readonly chinese: string } {
  const lines = orderCueLines(cue.text)
  return {
    english: lines.find((line) => !line.secondary)?.text ?? cue.text,
    chinese: lines.find((line) => line.secondary)?.text ?? '',
  }
}
