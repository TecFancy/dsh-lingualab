/**
 * The home view: the top bar (the way back out of the panel, the title, the settings) over the library home.
 *
 * The home is what the page shows before anything is open and after the practice view's back button; what it lists
 * and where a drop goes is the `LibraryHome` widget's, so this is only the bar and the wiring of the page's choices
 * into it.
 */
import type { ReactNode } from 'react'
import type { Translate } from '../../../context.ts'
import type { LibraryState } from '../../../features/library/index.ts'
import type { PositionTable, StepsTable } from '../../../features/resume/index.ts'
import type { ImportState } from '../../../features/import-media/index.ts'
import type { ReviewPayload } from '../../../shared/protocol.ts'
import type { UpdateStatus } from '../../../features/update/index.ts'
import { LibraryHome } from '../../../widgets/library-home/index.ts'

export interface HomeViewProps {
  readonly t: Translate
  /** Leave the panel, when the host gave a way to; the bar has no such button otherwise. */
  readonly back: (() => void) | undefined
  readonly library: LibraryState
  readonly importer: ImportState
  /** Every stored position, which the cards show. */
  readonly progress: PositionTable
  /** Every episode's five-step ticks, which the stage and the table show. */
  readonly steps: StepsTable
  /** What is left to review across the library, or `null` before it has been read. */
  readonly review: ReviewPayload | null
  /** The settings button, at the bar's right end. */
  readonly settings: ReactNode
  readonly onOpen: (id: string) => void
  readonly onFiles: (files: readonly File[]) => void
  readonly onBrowse: () => void
  readonly onFolder: () => void
  readonly onReview: () => void
  /** The running build, ready to print; `''` when the host did not say. */
  readonly version: string
  /** Whether a newer release exists. */
  readonly update: UpdateStatus
  /** Ask again, after a check that could not answer. */
  readonly onUpdateRetry: () => void
}

export function HomeView({
  t,
  back,
  library,
  importer,
  progress,
  steps,
  review,
  settings,
  onOpen,
  onFiles,
  onBrowse,
  onFolder,
  onReview,
  version,
  update,
  onUpdateRetry,
}: HomeViewProps) {
  return (
    <>
      <div className="dsh-lingualab-top">
        {back !== undefined ? (
          <button type="button" className="dsh-lingualab-chip" onClick={back}>
            {t('back')}
          </button>
        ) : null}
        <span className="dsh-lingualab-top-title">{t('appTitle')}</span>
        <span className="dsh-lingualab-spacer" />
        {settings}
      </div>
      <LibraryHome
        t={t}
        library={library.payload}
        loading={library.loading}
        importer={importer}
        progress={progress}
        steps={steps}
        currentId={library.episode?.id ?? null}
        current={library.episode}
        opening={library.opening}
        openError={library.openError}
        onOpen={onOpen}
        onFiles={onFiles}
        onBrowse={onBrowse}
        onFolder={onFolder}
        review={review}
        onReview={onReview}
        version={version}
        update={update}
        onUpdateRetry={onUpdateRetry}
      />
    </>
  )
}
