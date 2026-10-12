/**
 * A group of buttons of which exactly one is chosen, as a real radio group.
 *
 * The settings drawer has two shapes of it, a segmented control and a grid of cards, and both are
 * "pick one of these", so both are this: `role="radiogroup"` around `role="radio"` buttons, with
 * `aria-checked` saying which is chosen. Only the chosen button is in the tab order (the others are
 * reached with the arrow keys, which move the choice and the focus together, wrapping at the ends),
 * the way the platform's own radio buttons behave. `Home` and `End` go to the first and the last.
 *
 * The group does not look like anything itself: the caller gives the group and each option a class
 * and says what an option contains.
 */
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'

export interface RadioGroupProps<T extends string> {
  /** What the group is, for a screen reader. */
  readonly label: string
  readonly value: T
  readonly options: readonly T[]
  readonly onChange: (value: T) => void
  /** The group's own class. */
  readonly className: string
  /** Each option's class, to which `is-on` is added while it is the chosen one. */
  readonly optionClassName?: string
  /** What an option shows. */
  readonly render: (option: T, checked: boolean) => ReactNode
}

/** How far an arrow key moves the choice, or `null` for a key the group does not read. */
function stepOf(key: string): 1 | -1 | null {
  if (key === 'ArrowRight' || key === 'ArrowDown') return 1
  if (key === 'ArrowLeft' || key === 'ArrowUp') return -1
  return null
}

/** The control. */
export function RadioGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  optionClassName,
  render,
}: RadioGroupProps<T>) {
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    const step = stepOf(event.key)
    const jump = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : null
    if (step === null && jump === null) return
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'))
    const focused = buttons.findIndex((button) => button === document.activeElement)
    const from = focused >= 0 ? focused : options.indexOf(value)
    const to = jump ?? (from + (step ?? 0) + options.length) % options.length
    const next = options[to]
    if (next === undefined) return
    event.preventDefault()
    onChange(next)
    buttons[to]?.focus({ preventScroll: true })
  }

  return (
    <div className={className} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((option) => {
        const checked = option === value
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className={`${optionClassName ?? ''}${checked ? ' is-on' : ''}`.trim()}
            onClick={() => onChange(option)}
          >
            {render(option, checked)}
          </button>
        )
      })}
    </div>
  )
}
