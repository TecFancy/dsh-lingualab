/**
 * The composer: the sentence being kept, and one line of commentary.
 *
 * It deliberately asks for one thing. The English is read-only — it came from the
 * subtitle, and editing it would break the link back to the timestamp — and the only
 * input is the note in the reader's own words, which is what the file is for. Enter
 * saves, Escape cancels, and the playing audio is never paused to type.
 */
import { useState } from 'react'
import type { Translate } from '../../../context.ts'

/** The sentence a new phrase would carry. */
export interface ComposerQuote {
  readonly text: string
  readonly zh: string
  readonly at: number
}

export interface NotesComposerProps {
  readonly t: Translate
  /** `null` when nothing is playing, which disables the composer. */
  readonly quote: ComposerQuote | null
  /** True when the list is full: saving will ask which phrase it replaces. */
  readonly full: boolean
  readonly onSubmit: (note: string) => void
  /** Absent inside the notes layer, where the list around it is the way out. */
  readonly onCancel?: () => void
}

/** The quote plus its one input. */
export function NotesComposer({ t, quote, full, onSubmit, onCancel }: NotesComposerProps) {
  const [note, setNote] = useState('')

  const submit = (): void => {
    if (quote === null) return
    onSubmit(note.trim())
    setNote('')
  }

  return (
    <div className="dsh-lingualab-composer">
      <div className="dsh-lingualab-hint">{full ? t('notesFull') : t('notesHint')}</div>
      <div className="dsh-lingualab-composer-quote">{quote === null ? t('notesEmpty') : quote.text}</div>
      <input
        className="dsh-lingualab-input"
        value={note}
        placeholder={t('notesEditorPlaceholder')}
        disabled={quote === null}
        onChange={(event) => setNote(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            submit()
          }
          if (event.key === 'Escape') {
            event.preventDefault()
            onCancel?.()
          }
          // The page listens on the container for the listening shortcuts; typing a
          // note must not trigger them.
          event.stopPropagation()
        }}
      />
      <div className="dsh-lingualab-composer-actions">
        <button
          type="button"
          className="dsh-lingualab-btn is-primary"
          onClick={submit}
          disabled={quote === null}
        >
          {full ? t('notesReplace') : t('save')}
        </button>
        {onCancel === undefined ? null : (
          <button type="button" className="dsh-lingualab-btn" onClick={onCancel}>
            {t('cancel')}
          </button>
        )}
      </div>
    </div>
  )
}
