/**
 * The place files are dropped, and the control that does the same thing.
 *
 * Dragging is the fast path and a file picker is the one that always works: a reader
 * on a trackpad, on a touch screen, or with the files in a window the browser will not
 * accept a drag from needs the button. Both end in the same call, which is why they sit
 * in one file even though they are two components.
 *
 * The zone reacts to a drag over the *page*, not just over itself. A target the size of
 * a card is hard to hit when you are carrying a file across a whole window, so the
 * page-wide overlay turns "aim at the box" into "let go anywhere". The drag counter is
 * what makes that reliable: `dragenter` and `dragleave` fire for every child element
 * the pointer crosses, so a boolean would flicker off the moment the cursor moved over
 * a button.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import type { Translate } from '../../../context.ts'

/** The extensions the file picker offers; the host re-checks every file it receives. */
const ACCEPT = '.mp3,.m4a,.wav,.ogg,.opus,.flac,.srt,.vtt,.lrc'

export interface DropZoneProps {
  readonly t: Translate
  /** Called with whatever the reader dropped, in the order the browser lists it. */
  readonly onFiles: (files: readonly File[]) => void
  readonly disabled?: boolean
  readonly children: ReactNode
}

/** Whether a drag carries files, as opposed to text or a link being moved around. */
function carriesFiles(event: React.DragEvent): boolean {
  return Array.from(event.dataTransfer.types).includes('Files')
}

/** A drag-and-drop target covering the page. */
export function DropZone({ t, onFiles, disabled = false, children }: DropZoneProps) {
  const [over, setOver] = useState(false)
  const depth = useRef(0)

  const reset = useCallback(() => {
    depth.current = 0
    setOver(false)
  }, [])

  // A drag that ends outside the window (Escape, or dropped on another app) never fires
  // `dragleave` on our element, so the overlay would stay up. The window hears both.
  useEffect(() => {
    window.addEventListener('dragend', reset)
    window.addEventListener('drop', reset)
    return () => {
      window.removeEventListener('dragend', reset)
      window.removeEventListener('drop', reset)
    }
  }, [reset])

  return (
    <div
      className={`dsh-lingualab-drop${over ? ' is-over' : ''}`}
      onDragEnter={(event) => {
        if (disabled || !carriesFiles(event)) return
        event.preventDefault()
        depth.current += 1
        setOver(true)
      }}
      onDragOver={(event) => {
        if (disabled || !carriesFiles(event)) return
        // Without this the browser refuses the drop and navigates to the file instead.
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
      }}
      onDragLeave={(event) => {
        if (disabled || !carriesFiles(event)) return
        depth.current = Math.max(0, depth.current - 1)
        if (depth.current === 0) setOver(false)
      }}
      onDrop={(event) => {
        if (disabled || !carriesFiles(event)) return
        event.preventDefault()
        reset()
        if (event.dataTransfer.files.length > 0) onFiles(Array.from(event.dataTransfer.files))
      }}
    >
      {children}
      {over ? (
        <div className="dsh-lingualab-drop-veil" aria-hidden>
          <div className="dsh-lingualab-drop-veil-card">
            <strong>{t('dropRelease')}</strong>
            <span>{t('dropAccepts')}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export interface FilePickerProps {
  readonly onFiles: (files: readonly File[]) => void
  readonly disabled?: boolean
  readonly className?: string
  readonly children: ReactNode
}

/**
 * A button that opens the browser's file chooser.
 *
 * A `<label>` around a hidden input, rather than a button that calls `.click()` on a
 * ref: the label is the platform's own way to forward a press to a file input, it works
 * from the keyboard, and it needs no ref to be read at all.
 */
export function FilePicker({ onFiles, disabled = false, className = 'dsh-lingualab-btn', children }: FilePickerProps) {
  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const list = event.target.files
    if (list !== null && list.length > 0) onFiles(Array.from(list))
    // Clearing the value lets the same file be chosen again after a failed import.
    event.target.value = ''
  }
  return (
    <label className={`${className}${disabled ? ' is-disabled' : ''}`} aria-disabled={disabled}>
      {children}
      <input
        type="file"
        multiple
        accept={ACCEPT}
        disabled={disabled}
        onChange={onChange}
        className="dsh-lingualab-visually-hidden"
        data-testid="lingualab-file-input"
      />
    </label>
  )
}
