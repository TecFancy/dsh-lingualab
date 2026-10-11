/**
 * The strip under the stage where one sentence's start and end are moved.
 *
 * Two edge fields, each with a nudge on either side and a "set to the playhead" button, the save
 * and cancel buttons, and one line saying which keys do what. The field with focus is the one the
 * arrow keys move; clicking a field gives it focus. An edge pushed into a neighbour moves the
 * neighbour's shared edge too, and a line under the keys says where it goes, because that sentence
 * is not on screen. There is no waveform: the sentence loops while
 * the strip is open, and the ear is the instrument (see the note on editing a sentence's timing).
 */
import { formatClockMs } from '../../../shared/lib/format.ts'
import { CheckIcon, CloseIcon } from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'
import { STEP_MS, type TimingEditor } from '../model/useTimingEditor.ts'

export interface TimingStripProps {
  readonly t: Translate
  readonly editor: TimingEditor
  /** Why a save is not possible here, already translated, or `null`. */
  readonly blocked: string | null
}

/** The strip; renders nothing while no sentence is being edited. */
export function TimingStrip({ t, editor, blocked }: TimingStripProps) {
  const session = editor.session
  if (session === null) return null
  const changed = session.range.start !== session.base.start || session.range.end !== session.base.end

  const edge = (which: 'start' | 'end') => {
    const value = which === 'start' ? session.range.start : session.range.end
    const editable = which === 'start' || session.limits.endEditable
    const label = which === 'start' ? t('timingStart') : session.lrc ? t('timingEndLrc') : t('timingEnd')
    const moved = value !== (which === 'start' ? session.base.start : session.base.end)
    return (
      <div className={`dsh-lingualab-timing-edge${session.focus === which && editable ? ' is-focus' : ''}`}>
        <span className="dsh-lingualab-timing-label">{label}</span>
        {editable ? (
          <button
            type="button"
            className="dsh-lingualab-timing-nudge"
            onClick={() => editor.nudge(which, -STEP_MS)}
            title={t('timingEarlier')}
            aria-label={t('timingEarlier')}
          >
            −
          </button>
        ) : null}
        <button
          type="button"
          className={`dsh-lingualab-timing-value${moved ? ' is-moved' : ''}`}
          onClick={() => editor.setFocus(which)}
          disabled={!editable}
          aria-pressed={session.focus === which && editable}
        >
          {formatClockMs(value)}
        </button>
        {editable ? (
          <>
            <button
              type="button"
              className="dsh-lingualab-timing-nudge"
              onClick={() => editor.nudge(which, STEP_MS)}
              title={t('timingLater')}
              aria-label={t('timingLater')}
            >
              +
            </button>
            <button
              type="button"
              className="dsh-lingualab-pop-btn"
              onClick={() => editor.toPlayhead(which)}
              title={t('timingAtPlayhead')}
            >
              {t('timingAtPlayhead')} <kbd>{which === 'start' ? 'I' : 'O'}</kbd>
            </button>
          </>
        ) : null}
      </div>
    )
  }

  return (
    <div className="dsh-lingualab-timing" role="group" aria-label={t('timingTitle')}>
      <div className="dsh-lingualab-timing-row">
        <span className="dsh-lingualab-timing-title">{t('timingTitle')}</span>
        {edge('start')}
        {edge('end')}
        <span className="dsh-lingualab-spacer" />
        <button type="button" className="dsh-lingualab-btn" onClick={editor.close} title="Esc">
          <CloseIcon size={13} /> {t('timingCancel')}
        </button>
        <button
          type="button"
          className="dsh-lingualab-btn is-primary"
          onClick={editor.save}
          disabled={blocked !== null || editor.saving || !changed}
          title="Enter"
        >
          <CheckIcon size={13} /> {editor.saving ? `${t('saving')}…` : t('timingSave')}
        </button>
      </div>
      <div className="dsh-lingualab-timing-hint">{session.lrc ? t('timingHintLrc') : t('timingHint')}</div>
      {session.pushed.map((neighbour) => (
        <div className="dsh-lingualab-timing-hint is-pushed" key={neighbour.side}>
          {neighbour.side === 'previous'
            ? t('timingPushedPrevious', { time: formatClockMs(neighbour.after.end) })
            : t('timingPushedNext', { time: formatClockMs(neighbour.after.start) })}
        </div>
      ))}
      {blocked !== null ? <div className="dsh-lingualab-timing-hint is-warn">{blocked}</div> : null}
      {editor.error !== null ? (
        <div className="dsh-lingualab-error">
          {editor.error}{' '}
          {editor.stale ? (
            <button type="button" className="dsh-lingualab-btn" onClick={editor.reloadStale}>
              {t('timingReload')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
