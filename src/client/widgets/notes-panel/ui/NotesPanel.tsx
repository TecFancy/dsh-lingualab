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
import { useEffect, useRef, useState } from 'react'
import { splitNote, type NotesState } from '../../../features/notes/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { BookIcon, CheckIcon, CloseIcon, EditIcon, PlayIcon, StarIcon, TrashIcon, UndoIcon } from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'

/** Tags the study method uses; a phrase may carry both. */
const TAGS: readonly string[] = ['review', 'hard']

/** How long the undo stays on screen. */
const UNDO_MS = 6000

type View = 'active' | 'done' | 'all'

/** A phrase that was just deleted, kept long enough to put it back. */
interface Removed {
  readonly phrase: NotePhrase
  readonly index: number
}

export interface NotesPanelProps {
  readonly t: Translate
  readonly notes: NotesState
  /** The episode's title, shown under the drawer's heading. */
  readonly episodeTitle: string
  /** Closes the drawer; the page returns focus to its container. */
  readonly onClose: () => void
}

/** The right-hand notes drawer. */
export function NotesPanel({ t, notes, episodeTitle, onClose }: NotesPanelProps) {
  const [view, setView] = useState<View>('active')
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [removed, setRemoved] = useState<Removed | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const store = useMediaPlayer.getState

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    [],
  )

  /** Replaying a phrase is one gesture: seek there and loop that sentence. */
  const replay = (at: number): void => {
    store().seek(at)
    store().setLoopMode('sentence')
  }

  const remove = (phrase: NotePhrase, index: number): void => {
    notes.remove(index)
    setEditing(null)
    setRemoved({ phrase, index })
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = setTimeout(() => setRemoved(null), UNDO_MS)
  }

  const undo = (): void => {
    if (removed === null) return
    notes.restore(removed.phrase, removed.index)
    setRemoved(null)
    if (timer.current !== null) clearTimeout(timer.current)
  }

  const activeCount = notes.phrases.filter((phrase) => !phrase.done).length
  const doneCount = notes.phrases.length - activeCount
  // Indexes are kept alongside the phrases: edits address the stored list, not the view.
  const rows = notes.phrases
    .map((phrase, index) => ({ phrase, index }))
    .filter(({ phrase }) => (view === 'all' ? true : view === 'done' ? phrase.done : !phrase.done))

  /** Words are kept in the note as [word]; editing the text must not lose them. */
  const commit = (index: number, words: readonly string[]): void => {
    const note = [draft.trim(), ...words.map((word) => `[${word}]`)].filter((part) => part.length > 0).join(' ')
    notes.update(index, { note })
    setEditing(null)
  }

  return (
    <aside className="dsh-lingualab-notes">
      <div className="dsh-lingualab-notes-head">
        <span className="dsh-lingualab-drawer-titles">
          <span className="dsh-lingualab-drawer-title">{t('notes')}</span>
          <span className="dsh-lingualab-drawer-sub">
            {t('notesSubtitle', { episode: episodeTitle, count: notes.phrases.length })}
          </span>
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
        {notes.phrases.length === 0 ? (
          <div className="dsh-lingualab-empty is-center">
            <StarIcon size={22} />
            <span>{t('notesEmpty')}</span>
          </div>
        ) : null}
        {notes.phrases.length > 0 && rows.length === 0 ? (
          <div className="dsh-lingualab-empty is-center">
            <CheckIcon size={22} />
            <span>{view === 'active' ? t('notesAllDone') : t('notesNoneHere')}</span>
          </div>
        ) : null}

        {rows.map(({ phrase, index }) => {
          const { words, text } = splitNote(phrase.note)
          return (
            <div className={`dsh-lingualab-note${phrase.done ? ' is-done' : ''}`} key={`${phrase.at}-${index}`}>
              <div className="dsh-lingualab-note-top">
                <label className="dsh-lingualab-note-check" title={phrase.done ? t('stepUndone') : t('notesMarkDone')}>
                  <input
                    type="checkbox"
                    className="dsh-lingualab-visually-hidden"
                    checked={phrase.done}
                    onChange={(event) => notes.update(index, { done: event.target.checked })}
                  />
                  <span className={`dsh-lingualab-box${phrase.done ? ' is-on' : ''}`}>
                    {phrase.done ? <CheckIcon size={13} /> : null}
                  </span>
                </label>
                <button
                  type="button"
                  className="dsh-lingualab-note-at"
                  onClick={() => replay(phrase.at)}
                  title={t('notesReplay')}
                >
                  <PlayIcon size={10} /> {formatClock(phrase.at)}
                </button>
                <span className="dsh-lingualab-spacer" />
                <button
                  type="button"
                  className="dsh-lingualab-icon-btn is-small"
                  title={t('notesEdit')}
                  onClick={() => {
                    setEditing(index)
                    setDraft(text)
                  }}
                >
                  <EditIcon />
                </button>
                <button
                  type="button"
                  className="dsh-lingualab-icon-btn is-small is-danger"
                  title={t('notesDelete')}
                  onClick={() => remove(phrase, index)}
                >
                  <TrashIcon />
                </button>
              </div>

              <div className="dsh-lingualab-note-text">{phrase.text}</div>
              {phrase.zh.length > 0 ? <div className="dsh-lingualab-note-zh">{phrase.zh}</div> : null}

              {editing === index ? (
                <input
                  className="dsh-lingualab-input"
                  value={draft}
                  autoFocus
                  placeholder={t('notesEditorPlaceholder')}
                  onChange={(event) => setDraft(event.target.value)}
                  onBlur={() => commit(index, words)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') commit(index, words)
                    if (event.key === 'Escape') setEditing(null)
                    event.stopPropagation()
                  }}
                />
              ) : words.length > 0 || text.length > 0 ? (
                <div className="dsh-lingualab-memo">
                  {words.length > 0 ? (
                    <div className="dsh-lingualab-memo-words">
                      <BookIcon size={13} />
                      {words.map((word) => (
                        <span className="dsh-lingualab-word-chip" key={word}>
                          {word}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {text.length > 0 ? <div className="dsh-lingualab-memo-text">{text}</div> : null}
                </div>
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
          )
        })}
      </div>

      {removed !== null ? (
        <div className="dsh-lingualab-toast" role="status">
          <TrashIcon size={15} />
          <span>{t('notesDeleted', { time: formatClock(removed.phrase.at) })}</span>
          <button type="button" className="dsh-lingualab-toast-undo" onClick={undo}>
            <UndoIcon size={14} /> {t('notesUndo')}
          </button>
        </div>
      ) : null}

      <div className="dsh-lingualab-drawer-foot">
        {notes.status === 'saving' ? t('saving') : null}
        {notes.status === 'saved' ? t('saved') : null}
        {notes.status === 'error' ? <span className="dsh-lingualab-error">{t('saveFailed')}</span> : null}
        {notes.status === 'idle' ? t('notesFootnote') : null}
      </div>
    </aside>
  )
}