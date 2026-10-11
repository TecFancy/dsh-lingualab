/**
 * The button in the top bar that lists the segments of an episode, and the list itself.
 *
 * An episode cut into scenes has a dozen of them and the reader moves between them: back to
 * the one with the sentence they could not catch, ahead to the one they have not heard. So the
 * list shows every segment at once, marks the ones already finished, and works from the
 * keyboard the way a listbox does: the arrows move, Enter chooses, Home and End jump.
 *
 * Whether the list is open is the page's business, not this widget's. The page's keyboard
 * handler gives Escape to the topmost layer, and this list is one of those layers, so it
 * closes through the same chain as the notes drawer and the finish card instead of keeping a
 * second state that Escape would have to know about. The keys this list handles stop here, so
 * a space bar meant for the list never reaches the page and starts playback behind it.
 */
import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { segmentLabel } from '../../../features/library/index.ts'
import { CheckIcon, ChevronIcon } from '../../../shared/ui/icons.tsx'
import type { EpisodeSegment } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'

export interface SegmentPickerProps {
  readonly t: Translate
  readonly segments: readonly EpisodeSegment[]
  /** The segment on screen. */
  readonly currentId: string | null
  /** The ids of the segments already finished, which the list marks. */
  readonly finished: ReadonlySet<string>
  readonly open: boolean
  /** The button was pressed. */
  readonly onToggle: () => void
  /** A click outside the list; the page closes it. */
  readonly onClose: () => void
  readonly onSelect: (id: string) => void
}

/** The segment button and, while it is open, the list under it. */
export function SegmentPicker({ t, segments, currentId, finished, open, onToggle, onClose, onSelect }: SegmentPickerProps) {
  const holder = useRef<HTMLSpanElement>(null)
  const current = segments.find((segment) => segment.id === currentId) ?? segments[0]

  // A list that stays open after a click elsewhere is a list you have to close twice.
  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent): void => {
      if (holder.current !== null && !holder.current.contains(event.target as Node)) onClose()
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open, onClose])

  if (current === undefined) return null
  return (
    <span className="dsh-lingualab-seg-holder" ref={holder}>
      <button
        type="button"
        className={`dsh-lingualab-chip${open ? ' is-on' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={onToggle}
        title={t('segmentsTitle')}
      >
        {t('segmentsChip', { n: current.index, total: segments.length })}
        <span className={`dsh-lingualab-chevron${open ? ' is-open' : ''}`}>
          <ChevronIcon size={12} />
        </span>
      </button>
      {open ? (
        <SegmentList
          t={t}
          segments={segments}
          currentId={current.id}
          finished={finished}
          onSelect={onSelect}
        />
      ) : null}
    </span>
  )
}

interface SegmentListProps {
  readonly t: Translate
  readonly segments: readonly EpisodeSegment[]
  readonly currentId: string
  readonly finished: ReadonlySet<string>
  readonly onSelect: (id: string) => void
}

/** The list: focused when it opens, with the segment on screen as the one the arrows start from. */
function SegmentList({ t, segments, currentId, finished, onSelect }: SegmentListProps) {
  const base = useId()
  const list = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(() => Math.max(0, segments.findIndex((segment) => segment.id === currentId)))
  const optionId = (index: number): string => `${base}-${String(index)}`

  useEffect(() => {
    list.current?.focus({ preventScroll: true })
  }, [])

  // The highlighted row has to stay on screen while the arrows walk a long list.
  useEffect(() => {
    document.getElementById(`${base}-${String(active)}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, base])

  const move = (event: ReactKeyboardEvent<HTMLDivElement>, next: number): void => {
    event.preventDefault()
    event.stopPropagation()
    setActive(Math.min(Math.max(0, next), segments.length - 1))
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    switch (event.key) {
      case 'ArrowDown':
        move(event, active + 1)
        return
      case 'ArrowUp':
        move(event, active - 1)
        return
      case 'Home':
        move(event, 0)
        return
      case 'End':
        move(event, segments.length - 1)
        return
      case 'Enter':
      case ' ': {
        event.preventDefault()
        event.stopPropagation()
        const chosen = segments[active]
        if (chosen !== undefined) onSelect(chosen.id)
        return
      }
      default:
    }
  }

  return (
    <div
      ref={list}
      className="dsh-lingualab-seglist"
      role="listbox"
      tabIndex={-1}
      aria-label={t('segmentsTitle')}
      aria-activedescendant={optionId(active)}
      onKeyDown={onKeyDown}
    >
      {segments.map((segment, index) => {
        const isCurrent = segment.id === currentId
        const isDone = finished.has(segment.id)
        return (
          <div
            key={segment.id}
            id={optionId(index)}
            role="option"
            aria-selected={isCurrent}
            className={`dsh-lingualab-segopt${index === active ? ' is-active' : ''}${isCurrent ? ' is-current' : ''}`}
            onMouseEnter={() => setActive(index)}
            onClick={() => onSelect(segment.id)}
          >
            <span className="dsh-lingualab-segopt-name" title={segmentLabel(segment)}>
              {segmentLabel(segment)}
            </span>
            {isCurrent ? <span className="dsh-lingualab-segopt-now">{t('segmentCurrent')}</span> : null}
            {isDone ? (
              <span className="dsh-lingualab-segopt-done" title={t('segmentFinished')}>
                <CheckIcon size={14} />
                <span className="dsh-lingualab-visually-hidden">{t('segmentFinished')}</span>
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
