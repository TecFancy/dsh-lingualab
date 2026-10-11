/**
 * The editor for one kept sentence's note: a box with a label, a text field and a footer.
 *
 * The note may run over several lines (it is stored with each break as `<br>`, see the notes
 * format), so the field is a textarea that grows with what is typed, from three lines up to eight and
 * then scrolls. `Enter` adds a line; `Ctrl` or `Cmd` with `Enter` saves, and `Esc` throws the edit
 * away. Leaving the field saves too, so a click elsewhere does not lose what was typed; the two
 * buttons hold the focus on mouse-down for that reason (see `holdFocus`), otherwise the field would
 * save before 「取消」 got its click.
 *
 * Every key stops here: the page reads shortcuts on its container, and a space or an `S` typed into
 * a note must not play or keep a sentence.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import type { Translate } from '../../../context.ts'

export interface NoteEditorProps {
  readonly t: Translate
  /** The note as it stands, without its [word] markers. */
  readonly initial: string
  readonly onSave: (value: string) => void
  readonly onCancel: () => void
}

/**
 * Keep the focus where it is while a button is pressed.
 *
 * Preventing the default is not enough on its own: the page's container takes the focus back on
 * every mouse-down that is not in a field (so the shortcuts keep working), and that would blur the
 * field and save before 「取消」 got its click. So the press stops here too.
 */
function holdFocus(event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
}

/** The editor, focused with the caret at the end of the text. */
export function NoteEditor({ t, initial, onSave, onCancel }: NoteEditorProps) {
  const [draft, setDraft] = useState(initial)
  const field = useRef<HTMLTextAreaElement>(null)
  /** Whether the editor has been answered, so the blur that closing it causes does not answer it twice. */
  const settled = useRef(false)
  const id = useId()

  // The field is as tall as its text; the stylesheet holds it between three and eight lines.
  useLayoutEffect(() => {
    const element = field.current
    if (element === null) return
    element.style.height = 'auto'
    element.style.height = `${String(element.scrollHeight)}px`
  }, [draft])

  useEffect(() => {
    const element = field.current
    if (element === null) return
    element.focus({ preventScroll: true })
    element.setSelectionRange(element.value.length, element.value.length)
  }, [])

  /**
   * Answer the editor once. When the answer came from a key or one of the buttons the field still
   * has the focus, and it is about to be unmounted, which would drop the focus to the document and
   * leave the page's shortcuts dead; it goes back to the page instead. A save from leaving the field
   * leaves the focus wherever the click put it.
   */
  const settle = (answer: () => void): void => {
    if (settled.current) return
    settled.current = true
    const element = field.current
    if (element !== null && document.activeElement === element) {
      element.closest<HTMLElement>('.dsh-lingualab-page')?.focus({ preventScroll: true })
    }
    answer()
  }
  const save = (): void => settle(() => onSave(draft))
  const cancel = (): void => settle(onCancel)

  return (
    <div className="dsh-lingualab-editor">
      <label className="dsh-lingualab-editor-label" htmlFor={id}>
        {t('notesNoteLabel')}
      </label>
      <textarea
        id={id}
        ref={field}
        rows={3}
        value={draft}
        placeholder={t('notesEditorPlaceholder')}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          event.stopPropagation()
          // A key that picks or confirms an IME candidate is not the editor's.
          if (event.nativeEvent.isComposing) return
          if (event.key === 'Escape') {
            event.preventDefault()
            cancel()
          } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()
            save()
          }
        }}
      />
      <div className="dsh-lingualab-editor-foot">
        <span className="dsh-lingualab-editor-hint">{t('notesEditorHint')}</span>
        <span className="dsh-lingualab-spacer" />
        <button
          type="button"
          className="dsh-lingualab-btn is-small is-ghost"
          onMouseDown={holdFocus}
          onClick={cancel}
          title="Esc"
        >
          {t('cancel')}
        </button>
        <button type="button" className="dsh-lingualab-btn is-small is-primary" onMouseDown={holdFocus} onClick={save}>
          {t('save')}
        </button>
      </div>
    </div>
  )
}
