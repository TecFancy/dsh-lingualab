/**
 * How much of the card in the video's place the column has room for, measured.
 *
 * With no picture to play, the video's slot holds a card (prepare it, wait for it, install ffmpeg, only the sound can be had).
 * The card is the one part of the column above the player card that has no size the stylesheet can work out, and on a short
 * column (an iPad in landscape with the sidebar open) the card, the sentence and the player card did not fit, so the part
 * above the player card scrolled. The picture gives way by flex, and drops out under 120px by a measurement; the card gives
 * way in steps (see `card-fit.ts` for the choice, and the stylesheet's `is-card-*` rules for what each step draws).
 *
 * This hook finds the step by trying them. It puts each step's class on the scroller, from the whole card to nothing, and asks
 * whether the scroller then has anything to scroll; the first step that leaves nothing wins. The trial is synchronous and
 * runs before the first paint, so only the answer is ever drawn, and it starts from the whole card every time, so the answer
 * is a function of the room and the card and not of the step before (no hysteresis is needed). The class is set on the
 * scroller itself and React never writes that element's class, so there is no state and no render: the page only has to say
 * when a card may be on the stage.
 *
 * What is watched is what changes the answer: the scroller, each part inside it (the sentence's lines wrap and change height
 * with the sentence) and the card's stage, with the scroller's own childList to rebuild the set (the lines are replaced on
 * every cue, and the card changes as the job goes on). While the timing panel is open the card is not drawn at all, and then
 * nothing is measured: the card is back at its whole size and is tried again when the panel closes.
 */
import { useLayoutEffect } from 'react'
import { fitCard, showCardTier } from './card-fit.ts'

/** The stage that holds a card in full, as the video widget draws it. */
const CARD_STAGE = '.dsh-lingualab-videostage.has-card'
/** The sentence stage. */
const SENTENCE_STAGE = '.dsh-lingualab-stage'

/**
 * Keep the card at the whole size the column can hold.
 *
 * @param main The column's scroller (`.dsh-lingualab-practice-main`), or `null` while it is not on the page.
 * @param active Whether a card may be on the stage. Off, nothing is watched and the card is drawn whole.
 */
export function useCardFit(main: HTMLElement | null, active: boolean): void {
  useLayoutEffect(() => {
    if (!active || main === null || typeof ResizeObserver === 'undefined') return
    const column: HTMLElement = main
    const watched = new Set<Element>()
    const resize = new ResizeObserver(() => sync())
    const mutation = new MutationObserver(() => sync())

    function sync(): void {
      showCardTier(column, 'full')
      const stage = column.querySelector(CARD_STAGE)
      // No card, or the timing panel has it out of the layout: the whole card is what is left for the next time.
      if (stage !== null && getComputedStyle(stage).display !== 'none') fitCard(column)

      const targets = new Set<Element>([column])
      for (const child of column.children) {
        if (child.matches(SENTENCE_STAGE)) for (const line of child.children) targets.add(line)
        else targets.add(child)
      }
      for (const target of watched) {
        if (targets.has(target)) continue
        resize.unobserve(target)
        watched.delete(target)
      }
      for (const target of targets) {
        if (watched.has(target)) continue
        resize.observe(target)
        watched.add(target)
      }
    }

    mutation.observe(column, { childList: true, subtree: true })
    sync()
    return () => {
      resize.disconnect()
      mutation.disconnect()
      showCardTier(column, 'full')
    }
  }, [main, active])
}
