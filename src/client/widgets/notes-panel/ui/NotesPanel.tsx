/**
 * The notes list: the seven-phrase ceiling, made visible and slightly annoying.
 *
 * The ceiling is the point of the study method, so the counter is always on
 * screen and the eighth phrase cannot be added silently — the panel asks which
 * one it replaces. Tags are the method's own vocabulary (`review`, `hard`), and
 * the timestamp on each row seeks back, because "which line was that" is the
 * question the file exists to answer later.
 */
import { useState } from 'react'
import { MAX_PHRASES, type NotesState } from '../../../features/notes/index.ts'
import { formatClock, formatCount } from '../../../shared/lib/format.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'

export interface NotesPanelProps {
  readonly t: Translate
  readonly notes: NotesState
  /** Build a phrase from whatever is playing now, or `null` when nothing is. */
  readonly phraseFromCurrentCue: () => NotePhrase | null
}

/** Tags the study method uses; a phrase may carry both. */
const TAGS: readonly string[] = ['review', 'hard']

/** The right-hand notes card. */
export function NotesPanel({ t, notes, phraseFromCurrentCue }: NotesPanelProps) {
  const [replacing, setReplacing] = useState(false)
  const store = useMediaPlayer.getState

  const onAdd = (): void => {
    const phrase = phraseFromCurrentCue()
    if (phrase === null) return
    if (!notes.add(phrase)) setReplacing(true)
  }

  const onReplace = (index: number): void => {
    const phrase = phraseFromCurrentCue()
    if (phrase !== null) notes.replaceAt(index, phrase)
    setReplacing(false)
  }

  return (
    <div className="dsh-lingualab-card">
      <h2>
        {t('notes')}{' '}
        <span className="dsh-lingualab-counter">{formatCount(notes.phrases.length, MAX_PHRASES)}</span>
      </h2>
      <div className="dsh-lingualab-hint">{t('notesHint')}</div>

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
            <span className="dsh-lingualab-note-at" onClick={() => store().seek(phrase.at)}>
              {formatClock(phrase.at)}
            </span>{' '}
            <span className="dsh-lingualab-note-text">
              {replacing ? (
                <button type="button" className="dsh-lingualab-btn" onClick={() => onReplace(index)}>
                  {phrase.text}
                </button>
              ) : (
                phrase.text
              )}
            </span>
            {phrase.zh.length > 0 ? <div className="dsh-lingualab-note-zh">{phrase.zh}</div> : null}
            {phrase.note.length > 0 ? <div className="dsh-lingualab-note-note">{phrase.note}</div> : null}
            <div className="dsh-lingualab-chips">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`dsh-lingualab-chip${phrase.tags.includes(tag) ? ' is-on' : ''}`}
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
          <div className="dsh-lingualab-note-actions">
            <button
              type="button"
              className="dsh-lingualab-icon-btn"
              title={t('seekHere')}
              onClick={() => store().seek(phrase.at)}
            >
              ▶
            </button>
            <button
              type="button"
              className="dsh-lingualab-icon-btn"
              title={t('remove')}
              onClick={() => notes.remove(index)}
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <div className="dsh-lingualab-actions">
        <button type="button" className="dsh-lingualab-btn" onClick={onAdd} disabled={replacing}>
          ＋ {t('addPhrase')}
        </button>
        {replacing ? (
          <>
            <span className="dsh-lingualab-warn">{t('replaceHint')}</span>
            <button type="button" className="dsh-lingualab-btn" onClick={() => setReplacing(false)}>
              {t('cancel')}
            </button>
          </>
        ) : null}
        <span className="dsh-lingualab-spacer" />
        <span className="dsh-lingualab-counter">
          {notes.status === 'saving' ? t('saving') : null}
          {notes.status === 'saved' ? t('saved') : null}
          {notes.status === 'error' ? <span className="dsh-lingualab-warn">{t('saveFailed')}</span> : null}
        </span>
      </div>
      {notes.full && !replacing ? <div className="dsh-lingualab-hint">{t('notesFull')}</div> : null}
    </div>
  )
}
