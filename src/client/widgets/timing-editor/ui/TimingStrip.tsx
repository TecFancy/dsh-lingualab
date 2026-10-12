/**
 * The panel under the stage where one sentence's start and end are moved.
 *
 * It is a card with four parts. A header says what the loop is doing (the sentence repeats while the
 * panel is open, and the ear is the instrument: there is no waveform, see the note on editing a
 * sentence's timing) and closes the panel. A mini timeline shows the sentence before, the range
 * being edited, the sentence after and the playhead, so a moved edge is seen against its neighbours
 * as well as heard. Two edge cards, start and end, each hold the value, a nudge either way and a
 * "set to the playhead" button; the one with focus is the one the arrow keys move, and clicking a
 * card gives it focus. A footer lists the keys and has undo, cancel and save.
 *
 * An edge pushed into a neighbour moves the neighbour's shared edge too, and a bar under the cards
 * says where it goes, because that sentence is not on screen; the timeline draws the neighbour
 * where the push puts it.
 *
 * The panel opens and closes with a motion (a grid row growing from nothing, the card fading and
 * lifting in), so it stays mounted for the way out, drawn from the last session it held. While it
 * leaves it is inert: its buttons are not reachable and its keys are the page's again.
 */
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import type { RetimeEdge } from '../../../entities/cue/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { formatClock, formatClockMs } from '../../../shared/lib/format.ts'
import { usePresence } from '../../../shared/lib/usePresence.ts'
import { BackIcon, ChevronIcon, CheckIcon, CloseIcon, UpIcon } from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'
import { blockOf, percentAt, timelineWindow } from '../lib/timeline.ts'
import { BIG_STEP_MS, STEP_MS, type TimingEditor, type TimingSession } from '../model/useTimingEditor.ts'

/** How long the way out takes; the stylesheet's grid row and the card fade run for about this long. */
const EXIT_MS = 240

export interface TimingStripProps {
  readonly t: Translate
  readonly editor: TimingEditor
  /** Why a save is not possible here, already translated, or `null`. */
  readonly blocked: string | null
}

/** What the panel draws from: the session, and the reason a save is blocked while it was open. */
interface Held {
  readonly session: TimingSession
  readonly blocked: string | null
}

/** `+0.10` or `−0.45`, a signed number of seconds with a true minus sign. */
function formatDelta(ms: number): string {
  return `${ms < 0 ? '−' : '+'}${(Math.abs(ms) / 1000).toFixed(2)}`
}

interface EdgeCardProps {
  readonly t: Translate
  readonly editor: TimingEditor
  readonly session: TimingSession
  readonly which: RetimeEdge
}

/** One edge: its label and how far it moved, its value, the nudges and the playhead button. */
function EdgeCard({ t, editor, session, which }: EdgeCardProps) {
  const value = which === 'start' ? session.range.start : session.range.end
  const delta = value - (which === 'start' ? session.base.start : session.base.end)
  const editable = which === 'start' || session.limits.endEditable
  const focused = session.focus === which && editable
  const label = which === 'start' ? t('timingStart') : session.lrc ? t('timingEndLrc') : t('timingEnd')
  // The card is the target of a click that gives it focus; a button inside it must not also do that,
  // because the focus change is made from the render the click happened in and would undo the nudge.
  const inside = (action: () => void) => (event: MouseEvent) => {
    event.stopPropagation()
    action()
  }
  return (
    <div
      className={`dsh-lingualab-timing-edge${focused ? ' is-focus' : ''}${editable ? '' : ' is-readonly'}`}
      onClick={editable ? () => editor.setFocus(which) : undefined}
    >
      <div className="dsh-lingualab-timing-edge-head">
        <span className="dsh-lingualab-timing-label">{label}</span>
        {delta === 0 ? null : (
          <span className="dsh-lingualab-timing-delta">{t('timingDelta', { delta: formatDelta(delta) })}</span>
        )}
        <span className="dsh-lingualab-spacer" />
        {editable ? (
          <span className="dsh-lingualab-timing-keys" aria-hidden>
            {t('timingNudgeKeys')}
          </span>
        ) : null}
      </div>
      <div className="dsh-lingualab-timing-edge-body">
        <button
          type="button"
          className="dsh-lingualab-timing-value"
          onClick={editable ? () => editor.setFocus(which) : undefined}
          disabled={!editable}
          aria-pressed={focused}
        >
          {formatClockMs(value)}
        </button>
        {editable ? (
          <>
            <span className="dsh-lingualab-spacer" />
            <span className="dsh-lingualab-timing-step">
              <button
                type="button"
                onClick={inside(() => editor.nudge(which, -STEP_MS))}
                title={t('timingEarlier')}
                aria-label={t('timingEarlier')}
              >
                {`−${String(STEP_MS)}`}
              </button>
              <button
                type="button"
                onClick={inside(() => editor.nudge(which, STEP_MS))}
                title={t('timingLater')}
                aria-label={t('timingLater')}
              >
                {`+${String(STEP_MS)}`}
              </button>
            </span>
          </>
        ) : null}
      </div>
      {editable ? (
        <button type="button" className="dsh-lingualab-timing-ghost" onClick={inside(() => editor.toPlayhead(which))}>
          <UpIcon size={12} /> {t('timingAtPlayhead')} <kbd>{which === 'start' ? 'I' : 'O'}</kbd>
        </button>
      ) : null}
    </div>
  )
}

/** The panel; renders nothing while no sentence is being edited and the way out is over. */
export function TimingStrip({ t, editor, blocked }: TimingStripProps) {
  const open = editor.session !== null
  const { mounted, shown } = usePresence(open, EXIT_MS)
  const playing = useMediaPlayer((player) => player.isPlaying)
  const currentTime = useMediaPlayer((player) => player.currentTime)
  const root = useRef<HTMLDivElement>(null)

  // The last session is kept so the panel can be drawn while it leaves; the session itself is gone
  // the moment the editor closes.
  const [held, setHeld] = useState<Held | null>(null)
  if (editor.session !== null && (held?.session !== editor.session || held.blocked !== blocked)) {
    setHeld({ session: editor.session, blocked })
  }

  // Closing with a button of the panel focused would drop focus to the document, and the page's
  // shortcuts with it; it goes back to the page, which is where the keys are read.
  useEffect(() => {
    if (shown) return
    const element = root.current
    if (element === null || !element.contains(document.activeElement)) return
    element.closest<HTMLElement>('.dsh-lingualab-page')?.focus({ preventScroll: true })
  }, [shown])

  const current: Held | null = editor.session === null ? held : { session: editor.session, blocked }
  if (!mounted || current === null) return null
  const { session } = current
  const changed = session.range.start !== session.base.start || session.range.end !== session.base.end
  const bounds = timelineWindow(session.range, session.previous, session.next)
  const range = blockOf(session.range, bounds)
  const previous = session.previous === null ? null : blockOf(session.previous, bounds)
  const next = session.next === null ? null : blockOf(session.next, bounds)
  const block = (place: { readonly left: number; readonly width: number }) => ({
    left: `${place.left.toFixed(2)}%`,
    width: `${place.width.toFixed(2)}%`,
  })
  // `inert` is an attribute React 18 does not know, so it goes in as one; it takes the panel out of the
  // tab order and the hit test while it opens and leaves.
  const inertProps: Record<string, string> = shown ? {} : { inert: '' }

  return (
    <div ref={root} className={`dsh-lingualab-timing-wrap${shown ? ' is-open' : ''}`} aria-hidden={!shown} {...inertProps}>
      <div className="dsh-lingualab-timing-clip">
        <section className="dsh-lingualab-timing" aria-label={t('timingTitle')}>
          <div className="dsh-lingualab-timing-row">
            <span className="dsh-lingualab-timing-title">{t('timingTitle')}</span>
            <span className={`dsh-lingualab-timing-status${playing ? '' : ' is-paused'}`} role="status">
              {playing ? t('timingLooping') : t('timingPaused')}
            </span>
            <span className="dsh-lingualab-spacer" />
            <button
              type="button"
              className="dsh-lingualab-icon-btn is-small"
              onClick={editor.close}
              title={t('timingClose')}
              aria-label={t('timingClose')}
            >
              <CloseIcon size={14} />
            </button>
          </div>

          <div className="dsh-lingualab-timing-line" aria-hidden>
            <div className="dsh-lingualab-timing-track">
              {previous === null ? null : <div className="dsh-lingualab-timing-block" style={block(previous)} />}
              {next === null ? null : <div className="dsh-lingualab-timing-block" style={block(next)} />}
              <div className="dsh-lingualab-timing-block is-current" style={block(range)} />
              <div
                className="dsh-lingualab-timing-head"
                style={{ left: `${percentAt(currentTime * 1000, bounds).toFixed(2)}%` }}
              />
            </div>
            <span className="dsh-lingualab-timing-end is-from">{formatClock(bounds.from / 1000)}</span>
            <span className="dsh-lingualab-timing-end is-to">{formatClock(bounds.to / 1000)}</span>
          </div>

          <div className="dsh-lingualab-timing-edges">
            <EdgeCard t={t} editor={editor} session={session} which="start" />
            <EdgeCard t={t} editor={editor} session={session} which="end" />
          </div>

          {session.pushed.map((neighbour) => (
            <div className="dsh-lingualab-timing-note" key={neighbour.side}>
              {neighbour.side === 'previous' ? <BackIcon size={13} /> : <ChevronIcon size={13} />}
              {neighbour.side === 'previous'
                ? t('timingPushedPrevious', { time: formatClockMs(neighbour.after.end) })
                : t('timingPushedNext', { time: formatClockMs(neighbour.after.start) })}
            </div>
          ))}
          {current.blocked !== null ? <div className="dsh-lingualab-timing-note is-warn">{current.blocked}</div> : null}
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

          <div className="dsh-lingualab-timing-foot">
            <span className="dsh-lingualab-timing-hints">
              {session.limits.endEditable ? (
                <span>
                  <kbd>Tab</kbd> {t('timingKeySwitch')}
                </span>
              ) : null}
              <span>
                <kbd>Shift</kbd> {t('timingKeyShift', { ms: BIG_STEP_MS })}
              </span>
              <span>
                <kbd>Space</kbd> {playing ? t('pause') : t('play')}
              </span>
            </span>
            <span className="dsh-lingualab-spacer" />
            <button
              type="button"
              className="dsh-lingualab-btn is-ghost"
              onClick={editor.reset}
              disabled={!changed || editor.saving}
            >
              {t('timingReset')}
            </button>
            <button type="button" className="dsh-lingualab-btn" onClick={editor.close} title="Esc">
              {t('timingCancel')}
            </button>
            <button
              type="button"
              className="dsh-lingualab-btn is-primary"
              onClick={editor.save}
              disabled={current.blocked !== null || editor.saving || !changed}
              title="Enter"
            >
              {editor.saving ? (
                `${t('saving')}…`
              ) : (
                <>
                  <CheckIcon size={13} /> {t('timingSave')} <kbd>Enter</kbd>
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
