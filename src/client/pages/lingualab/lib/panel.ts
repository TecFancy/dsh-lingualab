/**
 * The words the page and the code split out of it share for what is on screen.
 *
 * They were local types of the page; the hooks that open an episode, the keymap and the panes now speak them too, so
 * they live in one place instead of being spelled again where they are read.
 */
import type { NotePhrase } from '../../../shared/protocol.ts'

/** Which view the page shows. */
export type View = 'home' | 'practice'

/** Which layer is over the page. Only one at a time; the steps popover is not a layer. */
export type Layer = 'none' | 'browse' | 'folder' | 'segments'

/** What the right column shows: the subtitles, or the sentences kept from them. */
export type Column = 'transcript' | 'kept'

/** The kept phrase for the sentence on stage, with its place in the stored list. */
export interface StagePhrase {
  readonly index: number
  /** `undefined` only if the stored list changed under the index. */
  readonly phrase: NotePhrase | undefined
}
