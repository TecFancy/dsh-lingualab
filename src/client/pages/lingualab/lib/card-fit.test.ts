// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { CARD_TIERS, cardTierClass, chooseCardTier, fitCard, showCardTier, type CardTier, type FitColumn } from './card-fit.ts'

/** A scroller that is as tall as its content is in each step, and keeps the classes it was given. */
function column(content: Readonly<Record<CardTier, number>>, client: number): FitColumn & { readonly classes: Set<string> } {
  const classes = new Set<string>()
  const tier = (): CardTier => CARD_TIERS.find((step) => classes.has(`is-card-${step}`)) ?? 'full'
  return {
    classes,
    classList: {
      toggle(token, force) {
        if (force) classes.add(token)
        else classes.delete(token)
        return force
      },
    },
    get scrollHeight() {
      return Math.max(client, content[tier()])
    },
    clientHeight: client,
  }
}

describe('cardTierClass', () => {
  it('has no class for the whole card, which is the stylesheet own look, and one class for each step down', () => {
    expect(cardTierClass('full')).toBeNull()
    expect(CARD_TIERS.slice(1).map(cardTierClass)).toEqual(['is-card-compact', 'is-card-lean', 'is-card-line', 'is-card-hidden'])
  })
})

describe('chooseCardTier', () => {
  it('keeps the whole card when it fits, and asks nothing more', () => {
    const asked: CardTier[] = []
    expect(
      chooseCardTier((tier) => {
        asked.push(tier)
        return true
      }),
    ).toBe('full')
    expect(asked).toEqual(['full'])
  })

  it('takes the first step that fits, going down in order', () => {
    const asked: CardTier[] = []
    expect(
      chooseCardTier((tier) => {
        asked.push(tier)
        return tier === 'lean' || tier === 'line' || tier === 'hidden'
      }),
    ).toBe('lean')
    expect(asked).toEqual(['full', 'compact', 'lean'])
  })

  it('hides the card only when not even one line of it fits', () => {
    expect(chooseCardTier((tier) => tier === 'hidden')).toBe('hidden')
    expect(chooseCardTier((tier) => tier === 'line' || tier === 'hidden')).toBe('line')
  })

  it('keeps one line of the card when nothing fits, since hiding it would not help', () => {
    expect(chooseCardTier(() => false)).toBe('line')
  })
})

describe('showCardTier', () => {
  it('puts the class of one step on the scroller and takes the others off', () => {
    const scroller = column({ full: 0, compact: 0, lean: 0, line: 0, hidden: 0 }, 100)
    showCardTier(scroller, 'lean')
    expect([...scroller.classes]).toEqual(['is-card-lean'])
    showCardTier(scroller, 'line')
    expect([...scroller.classes]).toEqual(['is-card-line'])
    showCardTier(scroller, 'full')
    expect([...scroller.classes]).toEqual([])
  })
})

describe('fitCard', () => {
  const heights = { full: 480, compact: 430, lean: 340, line: 250, hidden: 200 }

  it('leaves the whole card, with no class, where the column holds it', () => {
    const scroller = column(heights, 500)
    expect(fitCard(scroller)).toBe('full')
    expect([...scroller.classes]).toEqual([])
  })

  it('leaves the first step that leaves nothing to scroll on the scroller, and only that one', () => {
    const scroller = column(heights, 350)
    expect(fitCard(scroller)).toBe('lean')
    expect([...scroller.classes]).toEqual(['is-card-lean'])
  })

  it('does not depend on the step the scroller was in before', () => {
    const scroller = column(heights, 350)
    showCardTier(scroller, 'hidden')
    expect(fitCard(scroller)).toBe('lean')
    showCardTier(scroller, 'full')
    expect(fitCard(scroller)).toBe('lean')
  })

  it('counts a content exactly as tall as the scroller as fitting, and one pixel more as scrolling', () => {
    expect(fitCard(column(heights, 340))).toBe('lean')
    expect(fitCard(column(heights, 339))).toBe('line')
  })

  it('hides the card when one line of it is still too tall but nothing is, and keeps one line when even that is not enough', () => {
    expect(fitCard(column({ ...heights, line: 260 }, 255))).toBe('hidden')
    const scroller = column({ ...heights, line: 300, hidden: 600 }, 255)
    expect(fitCard(scroller)).toBe('line')
    expect([...scroller.classes]).toEqual(['is-card-line'])
  })
})
