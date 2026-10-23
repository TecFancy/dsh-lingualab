/**
 * The speed picker: the ten playback presets as chips, the one in force outlined.
 *
 * The chips are in three rows, slow, normal and fast. 1x stands alone in the middle row and takes the whole width,
 * because it is the speed a reader returns to most and is the easiest one to hit. The slow and fast rows hold the
 * presets on either side, so a jump across the range is one press rather than a lap of the cycle.
 */
import type { ReactElement } from 'react'
import { useMediaPlayer, SPEED_PRESETS } from '../../../features/media-player/index.ts'
import type { Translate } from '../../../context.ts'

interface SpeedPreset {
  readonly speed: number
  readonly index: number
}

const PRESETS: readonly SpeedPreset[] = SPEED_PRESETS.map((speed, index) => ({ speed, index }))
const SLOW = PRESETS.filter(({ speed }) => speed < 1)
const NORMAL = PRESETS.filter(({ speed }) => speed === 1)
const FAST = PRESETS.filter(({ speed }) => speed > 1)

export interface SpeedMenuProps {
  readonly t: Translate
  /** Where the preset in force sits in `SPEED_PRESETS`. */
  readonly speedIndex: number
  /** Close the picker; the button that opened it takes focus back. */
  readonly onClose: () => void
  /** Whether the picker is open. Absent means open, for a caller that mounts it only then. */
  readonly open?: boolean
}

interface SpeedChipProps extends SpeedPreset {
  readonly selected: boolean
  readonly onClose: () => void
}

/** One preset, as a button: its press sets that speed and closes the picker. */
function renderChip({ speed, index, selected, onClose }: SpeedChipProps): ReactElement {
  return (
    <button
      key={index}
      type="button"
      className={`dsh-lingualab-speed-chip${selected ? ' is-on' : ''}`}
      aria-pressed={selected}
      onClick={() => {
        useMediaPlayer.getState().setSpeedIndex(index)
        onClose()
      }}
    >
      {`${String(speed)}×`}
    </button>
  )
}

/** The popover's body; it draws nothing while the button's popover is closed. */
export function SpeedMenu({ t, speedIndex, onClose, open = true }: SpeedMenuProps) {
  if (!open) return null
  const rows = [
    { name: 'is-slow', presets: SLOW },
    { name: 'is-normal', presets: NORMAL },
    { name: 'is-fast', presets: FAST },
  ]
  return (
    <div className="dsh-lingualab-menu is-speed" role="group" aria-label={t('speed')}>
      {rows.map(({ name, presets }) => (
        <div key={name} className={`dsh-lingualab-speed-row ${name}`}>
          {presets.map(({ speed, index }) => renderChip({ speed, index, selected: index === speedIndex, onClose }))}
        </div>
      ))}
    </div>
  )
}
