/**
 * One quiet line saying which build this is, and whether a newer release exists.
 *
 * It sits at the top of the home so the answer is there before anything is loaded, on every home
 * state. The release half is read only: a newer tag is reported, never installed. What is running
 * and what is available are kept apart, because a development build can be newer than the last tag.
 */
import type { Translate } from '../../../context.ts'
import type { UpdateStatus } from '../../../features/update/index.ts'

export interface VersionLineProps {
  readonly t: Translate
  /** The running build, or `''` when the host did not say. */
  readonly label: string
  readonly status: UpdateStatus
  readonly onRetry: () => void
}

export function VersionLine({ t, label, status, onRetry }: VersionLineProps) {
  return (
    <div className="dsh-lingualab-versionline">
      {label.length > 0 ? <span className="dsh-lingualab-build">{label}</span> : null}
      <span className="dsh-lingualab-spacer" />
      <span className={`dsh-lingualab-update is-${status.kind}`}>{statusText(t, status)}</span>
      {status.kind === 'unknown' ? (
        <button type="button" className="dsh-lingualab-link" onClick={onRetry}>
          {t('retry')}
        </button>
      ) : null}
    </div>
  )
}

function statusText(t: Translate, status: UpdateStatus): string {
  switch (status.kind) {
    case 'checking':
      return t('updateChecking')
    case 'latest':
      return t('updateLatest')
    case 'same-version':
      return t('updateSameVersion')
    case 'available':
      return t('updateAvailable', { version: status.version })
    case 'ahead':
      return t('updateAhead', { version: status.version })
    default:
      return t('updateUnknown')
  }
}
