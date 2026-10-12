/**
 * The row of key caps under the player.
 *
 * It replaces a sentence of text ("Space plays, arrows move"). Caps are scanned faster
 * than a sentence, and they can do one thing text cannot: light up when the key is
 * pressed, which is the page saying "that was heard". The cap that lights is chosen by
 * the page, from the key it just handled, so a key that was ignored (a chord, a typing
 * target) never flashes.
 */
import type { Translate } from '../../../context.ts'

/** One hint: the caps, the dictionary key for what they do, and the id the page flashes. */
interface Hint {
  readonly id: string
  readonly caps: readonly string[]
  readonly label: string
}

const HINTS: readonly Hint[] = [
  { id: 'space', caps: ['Space'], label: 'hintPlay' },
  { id: 'arrows', caps: ['←', '→'], label: 'hintSentence' },
  { id: 'l', caps: ['L'], label: 'hintLoop' },
  { id: 's', caps: ['S'], label: 'hintKeep' },
  { id: 'c', caps: ['C'], label: 'hintChinese' },
  { id: 'r', caps: ['R'], label: 'hintReveal' },
]

/** The picture key, shown only while the segment has a video, and placed before the reveal the way the design has it. */
const PICTURE_HINT: Hint = { id: 'v', caps: ['V'], label: 'hintPicture' }

export interface KeyHintsProps {
  readonly t: Translate
  /** The hint id to light up right now, or `null`. */
  readonly flash: string | null
  /** False when the page does not own the keyboard, so the caps read as inactive. */
  readonly active: boolean
  /** Whether the segment has a video, which adds the 「V 画面」 cap. */
  readonly video?: boolean
}

/** The caps row. */
export function KeyHints({ t, flash, active, video = false }: KeyHintsProps) {
  const hints = video ? [...HINTS.slice(0, 5), PICTURE_HINT, ...HINTS.slice(5)] : HINTS
  return (
    <div className={`dsh-lingualab-keyhints${active ? '' : ' is-idle'}`}>
      {hints.map((hint) => (
        <span key={hint.id} className={`dsh-lingualab-keyhint${flash === hint.id ? ' is-hit' : ''}`}>
          {hint.caps.map((cap) => (
            <kbd key={cap}>{cap}</kbd>
          ))}
          {t(hint.label)}
        </span>
      ))}
    </div>
  )
}
