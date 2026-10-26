/**
 * The page you land on: the bench where the next bit of practice is waiting.
 *
 * The page before this one listed what was in the library and left the method out of it: the five steps
 * could only be seen from inside an episode, the place a single file stopped at showed as a bare clock
 * over an empty bar, and four controls offered to add files. This page is laid out as a bench:
 *
 *   1. **The stage**, on the left and biggest: the episode to continue, when it was last heard, where in
 *      it listening stopped, its five steps, and one button that names the step it goes to.
 *   2. **The right column**: the weekly pass over kept sentences, and the one card for adding an
 *      episode (a drop anywhere on the page does the same). With no stage the two sit side by side.
 *   3. **The library**, below, once there is more than the one episode on the stage: every episode as a
 *      row, filtered by where it stands in the method.
 *   4. **The foot**: where the files live and which build this is, on one quiet line.
 *
 * An empty library is the welcome card and nothing else, because adding files is the only thing to do.
 */
import { useState } from 'react'
import { hasMedia } from '../../../features/library/index.ts'
import { episodeProgress, type PositionTable, type StepsTable } from '../../../features/resume/index.ts'
import type { ImportState } from '../../../features/import-media/index.ts'
import type { UpdateStatus } from '../../../features/update/index.ts'
import { HomeSkeleton } from '../../../shared/ui/Skeleton.tsx'
import type { EpisodeEntry, LibraryPayload, ReviewPayload } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'
import { DropZone, FilePicker } from './DropZone.tsx'
import { EpisodeTable } from './EpisodeTable.tsx'
import { ImportReport } from './ImportReport.tsx'
import { PageFooter } from './PageFooter.tsx'
import { AddCard, ReviewCard } from './SideCards.tsx'
import { Stage } from './Stage.tsx'

export interface LibraryHomeProps {
  readonly t: Translate
  readonly library: LibraryPayload | null
  readonly loading: boolean
  readonly importer: ImportState
  /** Bookmarks, keyed by episode id, and by `segmentKey` for each segment of an episode that has them. */
  readonly progress: PositionTable
  /** Every episode's five-step ticks. */
  readonly steps: StepsTable
  /** The episode open now, which the stage offers first. */
  readonly currentId: string | null
  /**
   * That episode's entry. Needed in addition to its id because an episode opened through
   * 「Browse existing files」 from outside the media folder is not in the library listing,
   * and without the entry the one episode the reader last had open could not be found
   * from the home at all.
   */
  readonly current: EpisodeEntry | null
  readonly opening: boolean
  readonly openError: string | null
  readonly onOpen: (id: string) => void
  readonly onFiles: (files: readonly File[]) => void
  /** Open the layer that browses to a folder or a single file. */
  readonly onBrowse: () => void
  /** Open the media folder settings. */
  readonly onFolder: () => void
  /** What is left to review across the library, or `null` before it has been read. */
  readonly review: ReviewPayload | null
  /** Start a review over all of it. */
  readonly onReview: () => void
  /** The running build, ready to print; `''` when the host did not say. */
  readonly version: string
  /** Whether a newer release exists, and what the line says about it. */
  readonly update: UpdateStatus
  /** Ask the host again, after a check that could not answer. */
  readonly onUpdateRetry: () => void
}

/**
 * Every episode worth listing: the library's, folders first, plus the one open now when
 * it lives somewhere the scan does not look.
 */
function allEpisodes(library: LibraryPayload | null, current: EpisodeEntry | null): readonly EpisodeEntry[] {
  const listed = library === null ? [] : [...library.episodes, ...library.files]
  if (current === null || listed.some((entry) => entry.id === current.id)) return listed
  return [current, ...listed]
}

/** The episode for the stage: the one open now, else the one heard most recently, else none. */
function stagedEpisode(
  playable: readonly EpisodeEntry[],
  currentId: string | null,
  progress: PositionTable,
): EpisodeEntry | null {
  const lastHeard = (entry: EpisodeEntry): number => episodeProgress(progress, entry).entry?.updatedAt ?? 0
  return (
    playable.find((entry) => entry.id === currentId) ??
    [...playable].sort((a, b) => lastHeard(b) - lastHeard(a)).find((entry) => lastHeard(entry) > 0) ??
    null
  )
}

/** The home page of the panel. */
export function LibraryHome(props: LibraryHomeProps) {
  const { t, library, loading, importer, progress, current, currentId, opening, openError, onOpen } = props
  // The clock the stage's 「2 小时前」 is read against, taken once: the home is short-lived, and a
  // label that ticks while it is read would only distract.
  const [now] = useState(() => Date.now())
  const playable = allEpisodes(library, current).filter(hasMedia)
  const staged = stagedEpisode(playable, currentId, progress)
  const empty = !loading && playable.length === 0

  return (
    <div className="dsh-lingualab-home">
      <DropZone t={t} onFiles={props.onFiles} disabled={importer.busy}>
        <div className="dsh-lingualab-home-inner">
          {importer.busy || importer.outcomes.length > 0 || importer.unmatched.length > 0 ? (
            <ImportReport t={t} importer={importer} onOpen={onOpen} />
          ) : null}
          {openError !== null ? <div className="dsh-lingualab-error">{openError}</div> : null}
          {loading && playable.length === 0 ? <HomeSkeleton label={t('libraryLoading')} /> : null}
          {empty ? <Welcome {...props} /> : null}
          {!empty && !(loading && playable.length === 0) ? (
            <Bench {...props} staged={staged} now={now} />
          ) : null}
          {playable.length > 1 ? (
            <EpisodeTable t={t} entries={playable} staged={staged?.id ?? null} progress={progress}
              steps={props.steps} opening={opening} onOpen={onOpen} />
          ) : null}
          <PageFooter t={t} empty={empty} hidden={loading && playable.length === 0} library={library}
            version={props.version} update={props.update} onRetry={props.onUpdateRetry} onChange={props.onFolder} />
        </div>
      </DropZone>
    </div>
  )
}

/** The stage and the right column, side by side; the column's cards lie side by side with no stage. */
function Bench({ staged, now, ...props }: LibraryHomeProps & { readonly staged: EpisodeEntry | null; readonly now: number }) {
  const { t, review, opening } = props
  return (
    <div className={`dsh-lingualab-bench${staged === null ? ' is-solo' : ''}`}>
      {staged === null ? null : (
        <Stage t={t} entry={staged} summary={episodeProgress(props.progress, staged)} progress={props.progress}
          records={props.steps[staged.id] ?? {}} now={now} opening={opening} onOpen={props.onOpen} />
      )}
      <aside className="dsh-lingualab-bench-side">
        {!props.loading && review !== null && review.total > 0 ? (
          <ReviewCard t={t} review={review} opening={opening} onReview={props.onReview} />
        ) : null}
        <AddCard t={t} busy={props.importer.busy} onFiles={props.onFiles} onBrowse={props.onBrowse} />
      </aside>
    </div>
  )
}

/** An empty library: the one thing to do is add files. */
function Welcome({ t, importer, onFiles, onBrowse }: LibraryHomeProps) {
  return (
    <div className="dsh-lingualab-welcome">
      <span className="dsh-lingualab-plus is-lg" aria-hidden />
      <h1>{t('welcomeTitle')}</h1>
      <p className="dsh-lingualab-welcome-body">{t('welcomeBody')}</p>
      <div className="dsh-lingualab-welcome-act">
        <FilePicker className="dsh-lingualab-btn is-primary" onFiles={onFiles} disabled={importer.busy}>
          {t('chooseFiles')}
        </FilePicker>
        <button type="button" className="dsh-lingualab-btn" onClick={onBrowse}>
          {t('browseExisting')}
        </button>
      </div>
      <p className="dsh-lingualab-welcome-naming">{t('welcomeNaming')}</p>
    </div>
  )
}
