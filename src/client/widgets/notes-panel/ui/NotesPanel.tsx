/**
 * The notes drawer: the sentences you kept, and what you did with them.
 *
 * Keeping a sentence is one tap on the star, so this panel is where the thinking
 * happens afterwards, not where it is blocked. Each row can be replayed (one click
 * seeks there and loops it), given a note of your own, tagged with the method's two
 * words, and ticked off once it sticks. Ticked phrases drop out of the default
 * 「还在练」 view rather than being deleted, which is what the old seven-phrase ceiling
 * was trying to achieve by force: a short working set. A filter does the same thing
 * without asking for a decision in the middle of a sentence.
 */
import { useState } from 'react'
import type { NotesState } from '../../../features/notes/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { CloseIcon, EditIcon } from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'

/** Tags the study method uses; a phrase may carry both. */
const TAGS: readonly string[] = ['review', 'hard']

type View = 'active' | 'done' | 'all'

export interface NotesPanelProps {
  readonly t: Translate
  readonly notes: NotesState
  /** Closes the drawer; the page returns focus to its container. */
  readonly onClose: () => void
}

/** The right-hand notes drawer. */
export function NotesPanel({ t, notes, onClose }: NotesPanelProps) {
  const [view, setView] = useState<View>('active')
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [confirming, setConfirming] = useState<number | null>(null)
  const store = useMediaPlayer.getState

  /** Replaying a phrase is one gesture: seek there and loop that sentence. */
  const replay = (at: number): void => {
    store().seek(at)
    store().setLoopMode('sentence')
  }

  const activeCount = notes.phrases.filter((phrase) => !phrase.done).length
  const doneCount = notes.phrases.length - activeCount
  // Indexes are kept alongside the phrases: edits address the stored list, not the view.
  const rows = notes.phrases
    .map((phrase, index) => ({ phrase, index }))
    .filter(({ phrase }) => (view === 'all' ? true : view === 'done' ? phrase.done : !phrase.done))

  return (
    <aside className="dsh-lingualab-notes">
      <div className="dsh-lingualab-notes-head">
        <span>
          {t('notes')} <span className="dsh-lingualab-counter">{notes.phrases.length}</span>
        </span>
        <span className="dsh-lingualab-spacer" />
        <button type="button" className="dsh-lingualab-icon-btn" onClick={onClose} title={t('close')}>
          <CloseIcon />
        </button>
      </div>

      <div className="dsh-lingualab-tabs">
        {(
          [
            ['active', t('viewActive'), activeCount],
            ['done', t('viewDone'), doneCount],
            ['all', t('viewAll'), notes.phrases.length],
          ] as const
        ).map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            className={`dsh-lingualab-tab${view === id ? ' is-on' : ''}`}
            onClick={() => setView(id)}
          >
            {label} <span className="dsh-lingualab-counter">{count}</span>
          </button>
        ))}
      </div>

      <div className="dsh-lingualab-notes-body">
        {notes.phrases.length === 0 ? <div className="dsh-lingualab-empty">{t('notesEmpty')}</div> : null}
        {notes.phrases.length > 0 && rows.length === 0 ? (
          <div className="dsh-lingualab-empty">{view === 'active' ? t('notesAllDone') : t('notesNoneHere')}</div>
        ) : null}

        {rows.map(({ phrase, index }) => (
          <div className={`dsh-lingualab-note${phrase.done ? ' is-done' : ''}`} key={`${phrase.at}-${index}`}>
            <input
              type="checkbox"
              checked={phrase.done}
              onChange={(event) => notes.update(index, { done: event.target.checked })}
              title={phrase.done ? t('stepUndone') : t('notesMarkDone')}
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
                  placeholder={t('notesEditorPlaceholder')}
                  onChange={(event) => setDraft(event.target.value)}
                  onBlur={() => {
                    notes.update(index, { note: draft.trim() })
                    setEditing(null)
                  }}
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
            <div className="dsh-lingualab-row-actions" style={{ opacity: 1, visibility: 'visible' }}>
              <button
                type="button"
                className="dsh-lingualab-icon-btn"
                title={t('notesEdit')}
                onClick={() => {
                  setEditing(index)
                  setDraft(phrase.note)
                }}
              >
                <EditIcon />
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
                onBlur={() => setConfirming(null)}
              >
                {confirming === index ? t('notesDeleteConfirm') : <CloseIcon size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="dsh-lingualab-hint" style={{ padding: '6px 12px 10px' }}>
        {notes.status === 'saving' ? t('saving') : null}
        {notes.status === 'saved' ? t('saved') : null}
        {notes.status === 'error' ? <span className="dsh-lingualab-error">{t('saveFailed')}</span> : null}
        {notes.status === 'idle' ? t('notesFootnote') : null}
      </div>
    </aside>
  )
}
