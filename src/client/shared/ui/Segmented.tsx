/**
 * A row of mutually exclusive buttons, one of them on: the right column's 「字幕 / 收藏」 and the
 * kept sentences' filter both use it.
 */
export interface SegmentedOption<T extends string> {
  readonly id: T
  readonly label: string
  /** A number shown after the label, such as how many sentences the option holds. */
  readonly count?: number
}

export interface SegmentedProps<T extends string> {
  readonly options: readonly SegmentedOption<T>[]
  readonly value: T
  readonly onChange: (value: T) => void
  /** What the group is, for a screen reader. */
  readonly label: string
  /** `small` for a filter under a heading, the default for a heading itself. */
  readonly size?: 'small'
}

/** The control. */
export function Segmented<T extends string>({ options, value, onChange, label, size }: SegmentedProps<T>) {
  return (
    <span className={`dsh-lingualab-segmented${size === 'small' ? ' is-small' : ''}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={option.id === value ? 'is-on' : ''}
          aria-pressed={option.id === value}
          onClick={() => onChange(option.id)}
        >
          {option.label}
          {option.count === undefined ? null : <span className="dsh-lingualab-segmented-count">{option.count}</span>}
        </button>
      ))}
    </span>
  )
}
