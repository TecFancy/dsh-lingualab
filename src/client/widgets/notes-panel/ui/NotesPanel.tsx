/**
 * The notes layer: the seven-phrase ceiling, made visible and slightly annoying.
 *
 * The ceiling is the point of the study method, so the counter is always on screen
 * and the eighth phrase cannot go in silently — the panel asks which one it replaces.
 * That question is the whole reason this is a layer rather than a card: choosing
 * between seven recorded sentences needs the list in front of you, not a corner of a
 * sidebar.
 *
 * Tags are the method's own vocabulary (`review`, `hard`), and the timestamp on each
 * row seeks back, because "which line was that" is the question the file exists to
 * answer later.
 */
import { useState } from 'react'
import { MAX_PHRASES, type NotesState } from '../../../features/notes/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { CloseIcon } from '../../../shared/ui/icons.tsx'
import type { NotePhrase } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'
import { NotesComposer, type ComposerQuote } from './NotesComposer.tsx'

/** Tags the study method uses; a phrase may carry both. */
const TAGS: readonly string[] = ['review', 'hard']

export interface NotesPanelProps {
  readonly t: Translate
  readonly notes: NotesState
  /** Closes the layer; the page returns focus to its container. */
  readonly onClose: () => void
  /** The sentence a new phrase would carry, or `null` when nothing is playing. */
  readonly quote: ComposerQuote | null
  /**
   * The phrase waiting to go in while the list is full.
   *
   * Non-null turns the list into a chooser: every row offers 「替换这条」 instead of the
   * edit and delete pair, and the composer's save button gives way to that choice.
   */
  readonly pending: NotePhrase | null
  readonly onCancelPending: () => void
  readonly onChoose: (index: number) => void
  readonly onSubmit: (note: string) => void
}

/** The right-hand notes layer. */
export function NotesPanel({
  t,
  notes,
  onClose,
  quote,
  pending,
  onCancelPending,
  onChoose,
  onSubmit,
}: NotesPanelProps) {
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [confirming, setConfirming] = useState<number | null>(null)
  const store = useMediaPlayer.getState

  /** Replaying a phrase is one gesture: seek there and loop that sentence. */
  const replay = (at: number): void => {
    store().seek(at)
    store().setLoopMode('sentence')
  }

  return (
    <aside className="dsh-lingualab-notes">
      <div className="dsh-lingualab-notes-head">
        <span>
          {t('notes')}{' '}
          <span className="dsh-lingualab-counter">
            {notes.phrases.length} / {MAX_PHRASES}
          </span>
        </span>
        <span className="dsh-lingualab-spacer" />
        <button type="button" className="dsh-lingualab-icon-btn" onClick={onClose} title={t('close')}>
          <CloseIcon />
        </button>
      </div>

      {pending !== null ? (
        <div className="dsh-lingualab-warn">
          {t('replaceHint')} · {pending.text}
        </div>
      ) : null}

      <div className="dsh-lingualab-notes-body">
        {notes.phrases.length === 0 ? <div className="dsh-lingualab-empty">{t('notesEmpty')}</div> : null}

        {notes.phrases.map((phrase, index) => (
          <div className="dsh-lingualab-note" key={`${phrase.at}-${index}`}>
            <input
              type="checkbox"
              checked={phrase.done}
              onChange={(event) => notes.update(index, { done: event.target.checked })}
              title={phrase.done ? t('stepUndone') : t('stepDone')}
            />
            <div className="dsh-lingualab-note-main">
              <button type="button" className="dsh-lingualab-note-at" onClick={() => replay(phrase.at)}>
                {formatClock(phrase.at)}
              </button>{' '}
              <span className="dsh-lingualab-note-text">{phrase.text}</span>
              {phrase.zh.length > 0 ? <div className="dsh-lingualab-note-zh">{phrase.zh}</div> : null}
              {editing === index ? (
                <input
                  className="dsh-lingualab-input"
                  value={draft}
                  autoFocus
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      notes.update(index, { note: draft.trim() })
                      setEditing(null)
                    }
                    if (event.key === 'Escape') setEditing(null)
                    event.stopPropagation()
                  }}
                />
              ) : phrase.note.length > 0 ? (
                <div className="dsh-lingualab-note-note">{phrase.note}</div>
              ) : null}
              <div className="dsh-lingualab-chips">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`dsh-lingualab-tag${phrase.tags.includes(tag) ? ' is-on' : ''}`}
                    onClick={() =>
                      notes.update(index, {
                        tags: phrase.tags.includes(tag)
                          ? phrase.tags.filter((item) => item !== tag)
                          : [...phrase.tags, tag],
                      })
                    }
                  >
                    #{tag === 'review' ? t('review') : t('hard')}
                  </button>
                ))}
              </div>
            </div>
            <div className="dsh-lingualab-row-actions" style={{ opacity: 1 }}>
              {pending !== null ? (
                <button type="button" className="dsh-lingualab-btn" onClick={() => onChoose(index)}>
                  {t('notesReplace')}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="dsh-lingualab-icon-btn"
                    title={t('notesEdit')}
                    onClick={() => {
                      setEditing(index)
                      setDraft(phrase.note)
                    }}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="dsh-lingualab-icon-btn"
                    title={t('notesDelete')}
                    onClick={() => {
                      if (confirming === index) {
                        notes.remove(index)
                        setConfirming(null)
                        return
                      }
                      setConfirming(index)
                    }}
                  >
                    {confirming === index ? t('notesDeleteConfirm') : '✕'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {pending !== null ? (
        <div className="dsh-lingualab-composer">
          <div className="dsh-lingualab-composer-actions">
            <button type="button" className="dsh-lingualab-btn" onClick={onCancelPending}>
              {t('cancel')}
            </button>
          </div>
        </div>
      ) : (
        <NotesComposer t={t} quote={quote} full={notes.full} onSubmit={onSubmit} />
      )}

      <div className="dsh-lingualab-hint" style={{ padding: '0 12px 10px' }}>
        {notes.status === 'saving' ? t('saving') : null}
        {notes.status === 'saved' ? t('saved') : null}
        {notes.status === 'error' ? <span className="dsh-lingualab-error">{t('saveFailed')}</span> : null}
      </div>
    </aside>
  )
}
