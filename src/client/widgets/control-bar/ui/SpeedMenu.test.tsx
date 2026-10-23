// @vitest-environment node
/**
 * What the speed picker draws, and what a chip does when pressed.
 *
 * The picker takes its state from props and has no hooks, so a test can call it directly and reach the chips' press
 * handlers, as the timing strip's test does with its button group.
 */
import { Children, type ReactElement, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SPEED_INDEX, SPEED_PRESETS, useMediaPlayer } from '../../../features/media-player/index.ts'
import { SpeedMenu, type SpeedMenuProps } from './SpeedMenu.tsx'

const t = (key: string): string => key

interface ChipProps {
  readonly children: string
  readonly className: string
  readonly 'aria-pressed': boolean
  readonly onClick: () => void
}

type Chip = ReactElement<ChipProps>
type Row = ReactElement<{ readonly children: ReactNode }>

/** The chips of each row, in the order the picker draws them. */
function rows(props: Partial<SpeedMenuProps> = {}): Chip[][] {
  const menu = SpeedMenu({ t, speedIndex: DEFAULT_SPEED_INDEX, onClose: () => undefined, ...props })
  if (menu === null) throw new Error('the picker did not render')
  return (Children.toArray(menu.props.children) as Row[]).map((row) => Children.toArray(row.props.children) as Chip[])
}

afterEach(() => {
  useMediaPlayer.getState().setSpeedIndex(DEFAULT_SPEED_INDEX)
})

describe('the speed picker', () => {
  it('is a named group, and its chips are not the row buttons that timing mode hides', () => {
    const menu = SpeedMenu({ t, speedIndex: DEFAULT_SPEED_INDEX, onClose: () => undefined })
    expect(menu?.props.role).toBe('group')
    expect(menu?.props['aria-label']).toBe('speed')
    const chip = rows().flat()[0]
    expect(chip?.props.className).toContain('dsh-lingualab-speed-chip')
    expect(chip?.props.className).not.toContain('dsh-lingualab-bar-btn')
  })

  it('draws five slow presets, 1x alone, and four fast ones, in that order', () => {
    const drawn = rows()
    expect(drawn.map((row) => row.length)).toEqual([5, 1, 4])
    expect(drawn.flat().map((chip) => chip.props.children)).toEqual(SPEED_PRESETS.map((speed) => `${String(speed)}×`))
  })

  it('marks the preset in force, and no other', () => {
    const pressed = rows({ speedIndex: 6 }).flat().map((chip) => chip.props['aria-pressed'])
    expect(pressed).toEqual(SPEED_PRESETS.map((_, index) => index === 6))
  })

  it('sets the preset of the chip pressed and closes the picker', () => {
    const onClose = vi.fn()
    rows({ onClose }).flat()[2]?.props.onClick()
    expect(useMediaPlayer.getState().speedIndex).toBe(2)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('draws nothing while it is closed', () => {
    expect(SpeedMenu({ t, speedIndex: DEFAULT_SPEED_INDEX, onClose: () => undefined, open: false })).toBeNull()
  })
})
