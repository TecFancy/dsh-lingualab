/**
 * How much of the card that stands in for a picture is drawn: the choice, apart from the DOM it is read from.
 *
 * A card is a page of text and buttons whose height depends on which card it is and what it carries (a file line, a
 * smooth-version offer, the reader's own file), so unlike the picture it has no size that a stylesheet can compute from the
 * column. The page asks the layout instead: it tries the card in each step, from the whole card to nothing, and keeps the
 * first one that leaves the column's scroller with nothing to scroll. Every step is tried from the top each time, so the
 * answer depends on the room and on the card and never on the step the card happens to be in (no band is needed to stop a
 * card that stepped down from flickering back and forth).
 */

/** The steps, from the most the card shows to nothing. */
export const CARD_TIERS = ['full', 'compact', 'lean', 'line', 'hidden'] as const

export type CardTier = (typeof CARD_TIERS)[number]

/** The class the column's scroller carries for a step, or `null` for the whole card, which is the stylesheet's own look. */
export function cardTierClass(tier: CardTier): string | null {
  return tier === 'full' ? null : `is-card-${tier}`
}

/**
 * The first step at which nothing needs to scroll.
 *
 * @param fits Whether the column fits with the card in that step (the caller puts the step on the page to find out).
 * @returns The first step that fits. When none does, the sentence or the timing panel is what is too tall and hiding the card
 *   would not help, so the card keeps its smallest drawn step (the way to prepare the video stays on screen).
 */
export function chooseCardTier(fits: (tier: CardTier) => boolean): CardTier {
  for (const tier of CARD_TIERS) if (fits(tier)) return tier
  return 'line'
}

/** What the trial needs of the column's scroller: where the step's class goes, and how tall it is against its content. */
export interface FitColumn {
  readonly classList: { toggle(token: string, force: boolean): unknown }
  readonly scrollHeight: number
  readonly clientHeight: number
}

/** Puts one step's class on the scroller and takes the others off. */
export function showCardTier(column: Pick<FitColumn, 'classList'>, tier: CardTier): void {
  for (const other of CARD_TIERS) {
    const name = cardTierClass(other)
    if (name !== null) column.classList.toggle(name, other === tier)
  }
}

/**
 * Find the step the column has room for, and leave it on the scroller.
 *
 * @returns The step. Whether the scroller has something to scroll is read in whole pixels, so a fraction of a pixel is not a scroll.
 */
export function fitCard(column: FitColumn): CardTier {
  const tier = chooseCardTier((step) => {
    showCardTier(column, step)
    return column.scrollHeight <= column.clientHeight
  })
  showCardTier(column, tier)
  return tier
}
