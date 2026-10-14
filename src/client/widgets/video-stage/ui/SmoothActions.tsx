/**
 * The smooth version's controls on the stage: in the corner of a playing picture (offer it, watch it being made,
 * go back from it), and as one more action at the foot of a card.
 *
 * The smooth version is the one job that runs while a picture plays, so while it runs the picture keeps its place
 * and the corner carries the progress with 「取消」. Everything here is a small, quiet control, like the local
 * file's: the picture (or a card) is what the stage is about. Buttons in the corner go away when they are
 * pressed, so each hands the keyboard back to the page first.
 */
import type { MouseEvent } from 'react'
import { estimateText, etaUnit, smoothControlOf } from '../../../features/video/index.ts'
import { returnFocusToPage } from '../../../shared/lib/focus.ts'
import { formatBytes } from '../../../shared/lib/format.ts'
import type { VideoPrepareMode, VideoStatusPayload } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'

/** The time left of a job, in the unit that reads well. */
export function etaLabel(t: Translate, seconds: number): string {
  const eta = etaUnit(seconds)
  return eta.unit === 'seconds' ? t('cardPreparingEta', { seconds: eta.value }) : t('cardPreparingEtaMinutes', { minutes: eta.value })
}

/** What the estimate says, or an empty string when the host does not know the length. */
function estimateLine(t: Translate, status: VideoStatusPayload): string {
  const estimate = estimateText(status.smooth.estimateBytes, status.smooth.estimateSeconds, formatBytes(status.smooth.estimateBytes))
  return estimate === null ? '' : t(estimate.key, estimate.params)
}

export interface SmoothCornerProps {
  readonly t: Translate
  readonly status: VideoStatusPayload | null
  /** Seconds a running job has left, when it can be guessed. */
  readonly eta: number | null
  readonly busy: boolean
  readonly onPrepare: (mode: VideoPrepareMode) => void
  readonly onCancel: () => void
}

/**
 * The corner of a playing picture: 「准备流畅版」 with its estimate, the progress of the job with 「取消」, or the
 * label of the smooth file with 「改回原画质」.
 * @param props - the translator, what the host said, the time left, whether a request is on its way, and what the buttons do.
 */
export function SmoothCorner({ t, status, eta, busy, onPrepare, onCancel }: SmoothCornerProps) {
  const control = smoothControlOf(status)
  if (control === null || status === null) return null
  const press = (action: () => void) => (event: MouseEvent<HTMLButtonElement>) => {
    returnFocusToPage(event.currentTarget)
    action()
  }
  // The host's reason a request was not taken (another job runs, say), or why the last smooth job failed.
  const problem = status.smooth.error !== null ? t('smoothError', { reason: status.smooth.error }) : !status.ok ? status.reason : null
  return (
    <div className="dsh-lingualab-picture-smooth">
      <div className="dsh-lingualab-smooth-pill">
        {control.kind === 'running' ? (
          <>
            <span className="dsh-lingualab-smooth-text">
              {t('smoothRunning', { percent: Math.round(control.fraction * 100) })}
              {eta === null ? '' : ` · ${etaLabel(t, eta)}`}
            </span>
            <button type="button" className="dsh-lingualab-picture-local-btn" onClick={press(onCancel)} disabled={busy}>
              {t('cardCancel')}
            </button>
          </>
        ) : null}
        {control.kind === 'revert' ? (
          <>
            <span className="dsh-lingualab-smooth-text">{t('smoothLabel')}</span>
            <button type="button" className="dsh-lingualab-picture-local-btn" title={t('smoothRevertHint')} onClick={press(() => onPrepare('original'))} disabled={busy}>
              {t('smoothRevert')}
            </button>
          </>
        ) : null}
        {control.kind === 'offer' ? (
          <>
            <button type="button" className="dsh-lingualab-picture-local-btn" title={t('smoothHint')} onClick={press(() => onPrepare('smooth'))} disabled={busy}>
              {t('smoothAction')}
            </button>
            <span className="dsh-lingualab-smooth-text">{estimateLine(t, status)}</span>
          </>
        ) : null}
      </div>
      {problem === null ? null : <div className="dsh-lingualab-smooth-problem">{problem}</div>}
    </div>
  )
}

export interface SmoothOfferProps {
  readonly t: Translate
  readonly status: VideoStatusPayload
  readonly busy: boolean
  readonly onPrepare: (mode: VideoPrepareMode) => void
}

/**
 * The smooth version as an action at the foot of a card, with what it does and what it costs.
 * @param props - the translator, what the host said, whether a request is on its way, and what pressing does.
 * @returns the action, or nothing when the smooth version cannot be made for this video.
 */
export function SmoothOffer({ t, status, busy, onPrepare }: SmoothOfferProps) {
  if (!status.smooth.offer && status.smooth.error === null) return null
  const estimate = estimateLine(t, status)
  return (
    <div className="dsh-lingualab-smoothoffer">
      {status.smooth.offer ? (
        <button type="button" className="dsh-lingualab-btn is-small" onClick={() => onPrepare('smooth')} disabled={busy}>
          {t('smoothAction')}
        </button>
      ) : null}
      {status.smooth.offer && estimate.length > 0 ? <div className="dsh-lingualab-videocard-note">{estimate}</div> : null}
      {status.smooth.offer ? <div className="dsh-lingualab-videocard-note">{t('smoothHint')}</div> : null}
      {status.smooth.error === null ? null : <div className="dsh-lingualab-error">{t('smoothError', { reason: status.smooth.error })}</div>}
    </div>
  )
}
