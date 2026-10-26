/**
 * The foot of the home: where the files live, and which build this is, on one line under a hairline.
 *
 * It is the last thing on the page and the lightest: the folder line is a setting touched twice a
 * month and the build line is a fact about the page, so neither belongs above the episode to
 * continue. The two share a row, folder on the left and build on the right, and wrap on a narrow
 * screen. The folder line is hidden while the first listing is still on its way, since all it
 * could say then is that no folder is set yet; the build line shows from the first moment, because
 * it rides along with the config the page has already read.
 *
 * An empty library is one welcome card, so the hairline and its space are left out there: a line
 * across the page under nothing reads as an orphaned footnote rather than as a closing edge.
 */
import type { Translate } from '../../../context.ts'
import type { UpdateStatus } from '../../../features/update/index.ts'
import type { LibraryPayload } from '../../../shared/protocol.ts'
import { FolderIcon } from '../../../shared/ui/icons.tsx'
import { VersionLine } from './VersionLine.tsx'

export interface PageFooterProps {
  readonly t: Translate
  /** The library is empty, so there is nothing for a closing edge to close. */
  readonly empty: boolean
  /** The first listing has not arrived, so the folder line would only say "not set yet". */
  readonly hidden: boolean
  readonly library: LibraryPayload | null
  /** The running build, ready to print; `''` when the host did not say. */
  readonly version: string
  readonly update: UpdateStatus
  readonly onRetry: () => void
  /** Open the media folder settings. */
  readonly onChange: () => void
}

/** The bottom of the home page. */
export function PageFooter({ t, empty, hidden, library, version, update, onRetry, onChange }: PageFooterProps) {
  return (
    <footer className={`dsh-lingualab-pagefoot${empty ? ' is-empty' : ''}`}>
      {hidden ? null : <FolderLine t={t} library={library} onChange={onChange} />}
      <VersionLine t={t} label={version} status={update} onRetry={onRetry} />
    </footer>
  )
}

/** One quiet line about where the files live. */
function FolderLine({
  t,
  library,
  onChange,
}: {
  readonly t: Translate
  readonly library: LibraryPayload | null
  readonly onChange: () => void
}) {
  return (
    <div className="dsh-lingualab-folderline">
      <FolderIcon size={14} />
      <span className="dsh-lingualab-visually-hidden">{t('filesLiveIn')}</span>
      <code className="dsh-lingualab-path" title={library?.root ?? ''}>
        {library?.root !== undefined && library.root.length > 0 ? library.root : t('mediaFolderSourceNone')}
      </code>
      <button type="button" className="dsh-lingualab-link" onClick={onChange}>
        {t('change')}
      </button>
    </div>
  )
}
