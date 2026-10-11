/**
 * The right column's 「收藏」 view: the sentences you kept, each with one grade.
 *
 * It takes the subtitle list's place rather than sliding over the page, so the stage and the
 * transport stay in reach while you go through what you kept: clicking a card puts its sentence
 * on stage and loops it, as clicking a subtitle line plays one, and `Space` pauses it as anywhere
 * else. Only the card of the sentence on stage is open. Its note, its words and its grade show
 * there, which keeps the rest of the column a list of sentences rather than a wall of controls.
 *
 * A sentence has one state, set by grading it (see `Grade`): 「新收藏」 until it is graded, then
 * 「记住了」, 「模糊」 or 「没记住」. The three filters read off that state, so a sentence graded
 * 「记住了」 leaves 「还在练」 without being deleted, which is what the old seven-phrase ceiling was
 * after: a short working set, chosen while listening rather than by ticking boxes afterwards.
 *
 * An episode cut into segments keeps all its kept sentences in one list, grouped under a heading
 * per segment in play order. Replaying a card from another segment is the page's to do (it has to
 * open that segment first), so a card only says which phrase to replay.
 */
import { Fragment, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { findSegment, segmentLabel } from '../../../features/library/index.ts'
import { groupBySegment, removeWordFromNote, splitNote, type NotesState } from '../../../features/notes/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import { GRADE_LABELS, gradeKey } from '../../../shared/lib/grades.ts'
import { GIVEN_GRADES, gradeOf, inPlayOrder, withGrade } from '../../../shared/notes-format.ts'
import { CheckIcon, CloseIcon, EditIcon, PlayIcon, StarIcon, TrashIcon, UndoIcon } from '../../../shared/ui/icons.tsx'
import { Segmented } from '../../../shared/ui/Segmented.tsx'
import type { Translate } from '../../../context.ts'
import type { EpisodeSegment, NotePhrase } from '../../../shared/protocol.ts'

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
  /** The episode's segments in order; empty for an episode without any. */
  readonly segments: readonly EpisodeSegment[]
  /** The column's 「字幕 / 收藏」 switch, which the page owns. */
  readonly switcher: ReactNode
  /** The stored index of the kept sentence on stage, whose card is open, or `null`. */
  readonly currentIndex: number | null
  /** Put one phrase on stage and loop it, opening its segment first when needed. */
  readonly onReplay: (phrase: NotePhrase) => void
  /** Start a review of this episode's sentences still being practised. */
  readonly onReview: () => void
  /** Whether a review is running, so its button reads as already started. */
  readonly reviewing: boolean
}

/** A group's heading: the segment's number and title, or the bare id for a segment that is gone. */
function segmentName(segments: readonly EpisodeSegment[], id: string): string {
  const segment = findSegment(segments, id)
  return segment === null ? id : segmentLabel(segment)
}

/** The 「收藏」 column. */
export function NotesPanel({ t, notes, segments, switcher, currentIndex, onReplay, onReview, reviewing }: NotesPanelProps) {
  const [view, setView] = useState<View>('active')
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [removed, setRemoved] = useState<Removed | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const currentRef = useRef<HTMLDivElement | null>(null)

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    [],
  )

  // The open card follows the sentence on stage, by scrolling the column itself: an ancestor
  // scroll would move the conversation that shares the document.
  useEffect(() => {
    const list = listRef.current
    const card = currentRef.current
    if (list === null || card === null) return
    // The body is the cards' offset parent (it is positioned), so this is the card's place in it.
    const top = card.offsetTop
    if (top >= list.scrollTop && top + card.offsetHeight <= list.scrollTop + list.clientHeight) return
    list.scrollTo({ top: Math.max(0, top - 12) })
  }, [currentIndex])

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
  const order = segments.map((segment) => segment.id)
  // Indexes are kept alongside the phrases: edits address the stored list, not the view. The
  // cards read in the order the episode plays, which is not the order they were kept in.
  const rows = inPlayOrder(
    notes.phrases
      .map((phrase, index) => ({ phrase, index, at: phrase.at, segment: phrase.segment }))
      .filter(({ phrase }) => (view === 'all' ? true : view === 'done' ? phrase.done : !phrase.done)),
    order,
  )
  const groups = groupBySegment(rows, order)

  /** Words are kept in the note as [word]; editing the text must not lose them. */
  const commit = (index: number, words: readonly string[]): void => {
    const note = [draft.trim(), ...words.map((word) => `[${word}]`)].filter((part) => part.length > 0).join(' ')
    notes.update(index, { note })
    setEditing(null)
  }

  return (
    <aside className="dsh-lingualab-transcript is-kept">
      <div className="dsh-lingualab-transcript-head">
        {switcher}
        <span className="dsh-lingualab-spacer" />
        <button
          type="button"
          className="dsh-lingualab-btn is-primary is-small"
          onClick={onReview}
          disabled={activeCount === 0 || reviewing}
          title={t('reviewStartHint')}
        >
          <PlayIcon size={12} /> {t('reviewStart')}
        </button>
      </div>
      <div className="dsh-lingualab-kept-filter">
        <Segmented
          size="small"
          label={t('notes')}
          value={view}
          onChange={setView}
          options={[
            { id: 'active', label: t('viewActive'), count: activeCount },
            { id: 'done', label: t('viewDone'), count: doneCount },
            { id: 'all', label: t('viewAll'), count: notes.phrases.length },
          ]}
        />
      </div>

      <div className="dsh-lingualab-notes-body" ref={listRef}>
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

        {groups.map((group) => (
          <Fragment key={group.segment ?? ''}>
            {group.segment === undefined ? null : (
              <div className="dsh-lingualab-notes-group">{segmentName(segments, group.segment)}</div>
            )}
            {group.rows.map(({ phrase, index }) => {
              const grade = gradeOf(phrase)
              const open = index === currentIndex
              const { words, text } = splitNote(phrase.note)
              return (
                <div
                  key={`${phrase.segment ?? ''}-${phrase.at}-${index}`}
                  ref={open ? currentRef : null}
                  className={`dsh-lingualab-note${open ? ' is-open' : ''}${phrase.done ? ' is-done' : ''}`}
                  onClick={() => {
                    if (!open) onReplay(phrase)
                  }}
                >
                  <div className="dsh-lingualab-note-top">
                    <button
                      type="button"
                      className="dsh-lingualab-note-at"
                      onClick={(event) => {
                        event.stopPropagation()
                        onReplay(phrase)
                      }}
                      title={t('notesReplay')}
                    >
                      <PlayIcon size={10} /> {formatClock(phrase.at)}
                    </button>
                    <span className={`dsh-lingualab-grade is-${grade}`}>{t(GRADE_LABELS[grade])}</span>
                    <span className="dsh-lingualab-spacer" />
                    {open ? (
                      <>
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
                      </>
                    ) : null}
                  </div>

                  <div className="dsh-lingualab-note-text">{phrase.text}</div>

                  {open ? (
                    <>
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
                              {words.map((word) => (
                                <span className="dsh-lingualab-word-chip" key={word}>
                                  {word}
                                  <button
                                    type="button"
                                    className="dsh-lingualab-word-chip-x"
                                    title={t('wordRemove', { word })}
                                    aria-label={t('wordRemove', { word })}
                                    onClick={() => notes.update(index, { note: removeWordFromNote(phrase.note, word) })}
                                  >
                                    <CloseIcon size={10} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : null}
                          {text.length > 0 ? <div className="dsh-lingualab-memo-text">{text}</div> : null}
                        </div>
                      ) : null}
                      <div className="dsh-lingualab-grades" role="group" aria-label={t('keyGrade')}>
                        {GIVEN_GRADES.map((given) => (
                          <button
                            key={given}
                            type="button"
                            className={`dsh-lingualab-grade-btn is-${given}${grade === given ? ' is-on' : ''}`}
                            aria-pressed={grade === given}
                            onClick={() => notes.update(index, withGrade(phrase, given))}
                          >
                            {t(GRADE_LABELS[given])} <kbd>{gradeKey(given)}</kbd>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              )
            })}
          </Fragment>
        ))}
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
