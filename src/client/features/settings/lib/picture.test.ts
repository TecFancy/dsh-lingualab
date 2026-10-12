import { describe, expect, it } from 'vitest'
import { PICTURES, choose, endBlind, nextPicture, startBlind, type PictureState } from './picture.ts'

describe('nextPicture', () => {
  it('cycles shown, large, hidden, and round again', () => {
    expect(nextPicture('shown')).toBe('large')
    expect(nextPicture('large')).toBe('hidden')
    expect(nextPicture('hidden')).toBe('shown')
    expect(PICTURES).toEqual(['shown', 'large', 'hidden'])
  })
})

describe('the blind-watch switch', () => {
  const shown: PictureState = { picture: 'shown', restore: null }

  it('switches to large once when the timer starts, and remembers what it was', () => {
    expect(startBlind(shown)).toEqual({ state: { picture: 'large', restore: 'shown' }, switched: true })
    expect(startBlind({ picture: 'hidden', restore: null }).state).toEqual({ picture: 'large', restore: 'hidden' })
  })

  it('does not switch, or remember anything, when the picture is large already', () => {
    expect(startBlind({ picture: 'large', restore: null })).toEqual({
      state: { picture: 'large', restore: null },
      switched: false,
    })
  })

  it('puts the previous state back when the timer is paused or the step is marked done', () => {
    const { state } = startBlind({ picture: 'hidden', restore: null })
    expect(endBlind(state)).toEqual({ picture: 'hidden', restore: null })
  })

  it('puts nothing back when the steps did not move the picture', () => {
    expect(endBlind({ picture: 'large', restore: null })).toEqual({ picture: 'large', restore: null })
    expect(endBlind(shown)).toEqual(shown)
  })

  it('lets the reader own choice win: nothing is put back over it', () => {
    const { state } = startBlind(shown)
    const chosen = choose('hidden')
    expect(chosen).toEqual({ picture: 'hidden', restore: null })
    expect(endBlind(chosen)).toEqual(chosen)
    // Undoing from the notice is also a choice, and it is the state from before.
    expect(choose(state.restore ?? 'large')).toEqual(shown)
  })

  it('switches again the next time the timer starts, after it was put back', () => {
    const first = startBlind(shown)
    const back = endBlind(first.state)
    expect(back).toEqual(shown)
    expect(startBlind(back).switched).toBe(true)
  })
})
