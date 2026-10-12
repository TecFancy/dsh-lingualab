/**
 * The picture's three states, and the rules that move it between them.
 *
 * A segment with a playable video can show its picture three ways: **shown** (above the sentence), **large**
 * (the picture takes the stage and the sentence text is hidden: the blind-watch step) and **hidden** (the
 * stage as it is without a video, the sound still coming from the video). The reader cycles them with `V`
 * or the button in the play card, and the choice is kept per device like the other settings.
 *
 * The five steps touch it in one place only. Starting the blind-watch step's timer switches the picture to
 * large, once, and remembers what it was; pausing that timer or marking the step done puts it back; and
 * the reader's own change (a `V`, the button, the 「撤销」 of the notice) always wins, so nothing the
 * steps remembered is applied over a choice made since. Opening the page or the drawer never switches it.
 * These are pure functions over {@link PictureState} so every one of those sentences is a test.
 */

/** The three states, in the order `V` cycles through them. */
export const PICTURES = ['shown', 'large', 'hidden'] as const

/** One of {@link PICTURES}. */
export type Picture = (typeof PICTURES)[number]

/** What the page default is: the picture above the sentence. */
export const DEFAULT_PICTURE: Picture = 'shown'

/** The picture and, while a blind watch has switched it, what to put back. */
export interface PictureState {
  readonly picture: Picture
  /** The state before the blind watch switched to large, or `null` when nothing is waiting to be put back. */
  readonly restore: Picture | null
}

/** The state `V` moves to: shown, large, hidden, and round again. */
export function nextPicture(picture: Picture): Picture {
  return PICTURES[(PICTURES.indexOf(picture) + 1) % PICTURES.length] ?? DEFAULT_PICTURE
}

/** The reader chose a state: it is the state, and nothing from the steps is waiting to be put back. */
export function choose(picture: Picture): PictureState {
  return { picture, restore: null }
}

/**
 * The blind-watch timer started.
 * @returns the new state, and whether the picture was switched (the notice with 「撤销」 is shown only then).
 *   Already large means nothing to switch and nothing to restore.
 */
export function startBlind(state: PictureState): { readonly state: PictureState; readonly switched: boolean } {
  if (state.picture === 'large') return { state, switched: false }
  return { state: { picture: 'large', restore: state.picture }, switched: true }
}

/**
 * The blind-watch timer stopped, or its step was marked done: the picture goes back to what it was, if the
 * steps are what moved it and the reader has not chosen anything since.
 */
export function endBlind(state: PictureState): PictureState {
  return state.restore === null ? state : { picture: state.restore, restore: null }
}
