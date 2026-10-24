/**
 * The page you land on: what you can practise, and the one thing to do next.
 *
 * The old page opened straight into a player with nothing in it and asked about a
 * "media folder", which is a setting, to a reader who had come to listen. This page
 * answers the question they actually have, in the order they have it:
 *
 *   1. **Is there something to continue?** The episode they stopped in, as the biggest
 *      thing on the page, with a single button that resumes it.
 *   2. **What else is there?** The rest of the library as a list of rows that open on a
 *      click. A row says what it is (title, length of audio, whether it has subtitles,
 *      how many phrases are kept) and nothing that is a decision about files.
 *   3. **How do I add more?** Drop files anywhere, or press the button. With an empty
 *      library this is the whole page, because it is the only useful thing on it.
 *
 * Between the first two sits the weekly pass the method asks for: how many kept sentences are
 * still being practised across the library, and a button that reviews them all in one go.
 *
 * Where the files live is one quiet line at the bottom, with a way to change it.
 * It is a setting touched twice a month, and a page that leads with it reads as a
 * settings page.
 *
 * Below that line, and below a hairline, sits which build this is and whether a newer
 * release exists. It is a fact about the page, not a job on it, so it goes last and
 * lightest: in the first row it competed with the one thing the reader came to press.
 */
import { findSegment, hasMedia, segmentLabel, videoMarkOf } from '../../../features/library/index.ts'
import { episodeProgress, type EpisodeProgress, type Progress } from '../../../features/resume/index.ts'
import type { ImportState } from '../../../features/import-media/index.ts'
import { formatBytes, formatClock } from '../../../shared/lib/format.ts'
import { AudioIcon, FolderIcon, PlayIcon, StarIcon, UploadIcon, VideoIcon } from '../../../shared/ui/icons.tsx'
import { HomeSkeleton } from '../../../shared/ui/Skeleton.tsx'
import type { EpisodeEntry, LibraryPayload, ReviewPayload } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'
import type { UpdateStatus } from '../../../features/update/index.ts'
import { DropZone, FilePicker } from './DropZone.tsx'
import { PageFooter } from './PageFooter.tsx'

export interface LibraryHomeProps {
  readonly t: Translate
  readonly library: LibraryPayload | null
  readonly loading: boolean
  readonly importer: ImportState
  /** Bookmarks, keyed by episode id, and by `segmentKey` for each segment of an episode that has them. */
  readonly progress: Readonly<Record<string, Progress>>
  /** The episode open now, which the "continue" card offers first. */
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

/** What an episode's subtitles amount to, in one short word. */
function subtitleWord(t: Translate, entry: EpisodeEntry): string {
  if (!hasMedia(entry)) return t('pickerNoAudio')
  if (entry.subtitleEn !== null && entry.subtitleZh !== null) return t('subtitleBadgeBoth')
  if (entry.subtitleEn !== null) return t('subtitleBadgeEn')
  if (entry.subtitleZh !== null) return t('subtitleBadgeZh')
  return t('subtitleBadgeNone')
}

/**
 * What a card calls an episode: its title, and for one cut into segments how many of them
 * are finished, `S01E01 · 3 / 10 段`.
 */
function cardTitle(t: Translate, entry: EpisodeEntry, summary: EpisodeProgress): string {
  if (summary.total === 0) return entry.title
  return t('episodeSegments', { title: entry.title, n: summary.finished, total: summary.total })
}

/** Where listening stopped, in words: the time, and the segment when the episode has them. */
function stoppedWord(t: Translate, entry: EpisodeEntry, summary: EpisodeProgress): string | null {
  if (summary.entry === null) return null
  // The last segment heard was finished, so 「继续练习」 goes on to another one: name that one,
  // since "stopped at the end of 04" would describe a place the button does not open.
  const next = summary.next === summary.segment ? null : findSegment(entry.segments, summary.next)
  if (next !== null) return t('upNextSegment', { segment: segmentLabel(next) })
  const time = formatClock(summary.entry.at)
  const segment = findSegment(entry.segments, summary.segment)
  return segment === null ? t('stoppedAt', { time }) : t('stoppedAtSegment', { segment: segmentLabel(segment), time })
}

/** The badge tone for an episode: a full pair is good news, a bare file a warning, the rest neutral. */
function subtitleTone(entry: EpisodeEntry): 'ok' | 'warn' | 'plain' {
  if (!hasMedia(entry)) return 'plain'
  if (entry.subtitleEn !== null && entry.subtitleZh !== null) return 'ok'
  if (entry.subtitleEn === null && entry.subtitleZh === null) return 'warn'
  return 'plain'
}

/**
 * The small mark on a card for an episode that has video: 「视频」, or 「视频 · 未准备」 while a video still
 * has to be prepared. An episode with no video has none, and nothing else about the card changes.
 */
function VideoMark({ t, entry }: { readonly t: Translate; readonly entry: EpisodeEntry }) {
  const mark = videoMarkOf(entry)
  if (mark === 'none') return null
  return (
    <span className={`dsh-lingualab-videomark${mark === 'ready' ? ' is-ready' : ''}`}>
      <VideoIcon size={11} /> {mark === 'ready' ? t('videoMark') : t('videoMarkUnprepared')}
    </span>
  )
}

/** The size an episode card shows: the audio's, or the video's for an episode that is only a video. */
function sizeOf(entry: EpisodeEntry): number | null {
  return entry.audioBytes ?? entry.video?.bytes ?? null
}

/** The home page of the panel. */
export function LibraryHome({
  t,
  library,
  loading,
  importer,
  progress,
  currentId,
  current,
  opening,
  openError,
  onOpen,
  onFiles,
  onBrowse,
  onFolder,
  review,
  onReview,
  version,
  update,
  onUpdateRetry,
}: LibraryHomeProps) {
  const episodes = allEpisodes(library, current)
  const playable = episodes.filter(hasMedia)
  // When an episode was last listened to: its own bookmark, or its newest segment's.
  const lastHeard = (entry: EpisodeEntry): number => episodeProgress(progress, entry).entry?.updatedAt ?? 0
  const resume =
    playable.find((entry) => entry.id === currentId) ??
    // Nothing remembered as "current" still has a most-recent bookmark worth offering.
    [...playable].sort((a, b) => lastHeard(b) - lastHeard(a)).find((entry) => lastHeard(entry) > 0) ??
    null
  const rest = playable.filter((entry) => entry.id !== resume?.id)
  const empty = !loading && playable.length === 0

  return (
    <div className="dsh-lingualab-home">
      <DropZone t={t} onFiles={onFiles} disabled={importer.busy}>
          <div className="dsh-lingualab-home-inner">
            {importer.busy || importer.outcomes.length > 0 || importer.unmatched.length > 0 ? (
              <ImportReport t={t} importer={importer} onOpen={onOpen} />
            ) : null}

            {openError !== null ? <div className="dsh-lingualab-error">{openError}</div> : null}

            {loading && playable.length === 0 ? <HomeSkeleton label={t('libraryLoading')} /> : null}

            {empty ? (
              <div className="dsh-lingualab-welcome">
                <div className="dsh-lingualab-welcome-icon">
                  <UploadIcon size={28} />
                </div>
                <h1>{t('welcomeTitle')}</h1>
                <p>{t('welcomeBody')}</p>
                <div className="dsh-lingualab-actions" style={{ justifyContent: 'center' }}>
                  <FilePicker className="dsh-lingualab-btn is-primary" onFiles={onFiles} disabled={importer.busy}>
                    {t('chooseFiles')}
                  </FilePicker>
                  <button type="button" className="dsh-lingualab-btn" onClick={onBrowse}>
                    {t('browseExisting')}
                  </button>
                </div>
                <p className="dsh-lingualab-hint">{t('welcomeNaming')}</p>
              </div>
            ) : null}

            {resume !== null ? (
              <ResumeCard t={t} entry={resume} summary={episodeProgress(progress, resume)} opening={opening} onOpen={onOpen} />
            ) : null}

            {review !== null && review.total > 0 ? (
              <section className="dsh-lingualab-reviewcard">
                <span className="dsh-lingualab-reviewcard-icon">
                  <StarIcon size={18} filled />
                </span>
                <span className="dsh-lingualab-reviewcard-text">
                  <strong>{t('reviewHomeTitle')}</strong>
                  <span>{t('reviewHomeSub', { count: review.total, episodes: review.episodes.length })}</span>
                </span>
                <span className="dsh-lingualab-spacer" />
                <button type="button" className="dsh-lingualab-btn" onClick={onReview} disabled={opening}>
                  <PlayIcon size={13} /> {t('reviewHomeStart')}
                </button>
              </section>
            ) : null}

            {rest.length > 0 ? (
              <section className="dsh-lingualab-section">
                <div className="dsh-lingualab-section-head">
                  <h2>{resume === null ? t('homeEpisodes') : t('homeOthers')}</h2>
                  <span className="dsh-lingualab-spacer" />
                  <FilePicker onFiles={onFiles} disabled={importer.busy}>
                    <UploadIcon /> {t('addFiles')}
                  </FilePicker>
                  <button type="button" className="dsh-lingualab-btn" onClick={onBrowse}>
                    {t('browseExisting')}
                  </button>
                </div>
                <div className="dsh-lingualab-episodes is-grid">
                  {rest.map((entry) => (
                    <EpisodeRow
                      key={entry.id}
                      t={t}
                      entry={entry}
                      summary={episodeProgress(progress, entry)}
                      onOpen={onOpen}
                      disabled={opening}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {!empty && resume !== null && rest.length === 0 ? (
              <div className="dsh-lingualab-actions">
                <FilePicker onFiles={onFiles} disabled={importer.busy}>
                  <UploadIcon /> {t('addFiles')}
                </FilePicker>
                <button type="button" className="dsh-lingualab-btn" onClick={onBrowse}>
                  {t('browseExisting')}
                </button>
              </div>
            ) : null}

            {!empty && !loading ? (
              <div className="dsh-lingualab-dropstrip">
                <UploadIcon size={18} />
                <span>{t('dropStrip')}</span>
                <span className="dsh-lingualab-spacer" />
                <FilePicker onFiles={onFiles} disabled={importer.busy}>
                  {t('chooseFiles')}
                </FilePicker>
              </div>
            ) : null}

            <PageFooter t={t} empty={empty} hidden={loading && playable.length === 0} library={library}
              version={version} update={update} onRetry={onUpdateRetry} onChange={onFolder} />
          </div>
      </DropZone>
    </div>
  )
}

/**
 * The big "continue where you stopped" card.
 *
 * For an episode cut into segments the button continues the segment listened to most
 * recently; the page chooses it when it opens the episode, so this card only says where
 * that is.
 */
function ResumeCard({
  t,
  entry,
  summary,
  opening,
  onOpen,
}: {
  readonly t: Translate
  readonly entry: EpisodeEntry
  readonly summary: EpisodeProgress
  readonly opening: boolean
  readonly onOpen: (id: string) => void
}) {
  const { fraction } = summary
  const progress = summary.entry
  const stopped = stoppedWord(t, entry, summary)
  return (
    <section className="dsh-lingualab-resume">
      <div className="dsh-lingualab-resume-label">{progress === null ? t('homeStart') : t('homeContinue')}</div>
      <h1 className="dsh-lingualab-resume-title">{cardTitle(t, entry, summary)}</h1>
      <div className="dsh-lingualab-resume-meta">
        <span>{subtitleWord(t, entry)}</span>
        <span>{formatBytes(sizeOf(entry))}</span>
        <VideoMark t={t} entry={entry} />
        {entry.notes.count > 0 ? (
          <span>
            {t('notesKept')} {entry.notes.count}
          </span>
        ) : null}
        {stopped !== null ? <span>{stopped}</span> : null}
      </div>
      {progress !== null && fraction > 0 ? (
        <div className="dsh-lingualab-bar" aria-hidden>
          <div className="dsh-lingualab-bar-fill" style={{ width: `${String(fraction * 100)}%` }} />
        </div>
      ) : null}
      <div className="dsh-lingualab-actions">
        <button
          type="button"
          className="dsh-lingualab-btn is-primary is-large"
          onClick={() => onOpen(entry.id)}
          disabled={opening}
        >
          {opening ? <span className="dsh-lingualab-spinner" aria-hidden /> : <PlayIcon size={16} />}{' '}
          {progress === null ? t('startPractice') : t('resumePractice')}
        </button>
      </div>
    </section>
  )
}

/** One card of the episode grid. */
function EpisodeRow({
  t,
  entry,
  summary,
  disabled,
  onOpen,
}: {
  readonly t: Translate
  readonly entry: EpisodeEntry
  readonly summary: EpisodeProgress
  readonly disabled: boolean
  readonly onOpen: (id: string) => void
}) {
  const { fraction } = summary
  const stopped = stoppedWord(t, entry, summary)
  const title = cardTitle(t, entry, summary)
  return (
    <button type="button" className="dsh-lingualab-episode-card" onClick={() => onOpen(entry.id)} disabled={disabled}>
      <span className="dsh-lingualab-episode-head">
        <span className="dsh-lingualab-episode-icon">{entry.kind === 'folder' ? <FolderIcon /> : <AudioIcon />}</span>
        <span className="dsh-lingualab-episode-badges">
          <VideoMark t={t} entry={entry} />
          <span className={`dsh-lingualab-badge is-${subtitleTone(entry)}`}>{subtitleWord(t, entry)}</span>
        </span>
      </span>
      <span className="dsh-lingualab-episode-title" title={title}>
        {title}
      </span>
      <span className="dsh-lingualab-pick-sub">
        {formatBytes(sizeOf(entry))}
        {entry.notes.count > 0 ? ` · ${t('notesKept')} ${String(entry.notes.count)}` : ''}
        {stopped !== null ? ` · ${stopped}` : ''}
      </span>
      <span className="dsh-lingualab-bar" aria-hidden>
        <span className="dsh-lingualab-bar-fill" style={{ width: `${String(fraction * 100)}%` }} />
      </span>
    </button>
  )
}
/** The progress and result of a drop, shown where the reader is already looking. */
function ImportReport({
  t,
  importer,
  onOpen,
}: {
  readonly t: Translate
  readonly importer: ImportState
  readonly onOpen: (id: string) => void
}) {
  const saved = importer.outcomes.filter((item) => item.status === 'saved').length
  // Which folder the files that were already there are in, so "left alone" is not a
  // mystery about where; "exists" with no folder named is the case that confused.
  const existing = importer.outcomes.filter((item) => item.status === 'exists')
  const existedFolders = [...new Set(existing.map((item) => item.episode))]
  // A skipped file is a failure of its audio, shown with that reason rather than hidden.
  const refused = importer.outcomes.filter((item) => item.status === 'refused' || item.status === 'skipped')

  return (
    <div className="dsh-lingualab-report" role="status">
      <div className="dsh-lingualab-actions">
        <strong>
          {importer.busy
            ? t('importing', { done: importer.done, total: importer.total })
            : t('importDone', { saved, total: importer.total })}
        </strong>
        {importer.busy && importer.current !== null ? (
          <span className="dsh-lingualab-hint">{importer.current}</span>
        ) : null}
        <span className="dsh-lingualab-spacer" />
        {!importer.busy && importer.lastEpisode !== null ? (
          <button
            type="button"
            className="dsh-lingualab-btn is-primary"
            onClick={() => {
              if (importer.lastEpisode !== null) onOpen(importer.lastEpisode)
              importer.dismiss()
            }}
          >
            {t('openImported')}
          </button>
        ) : null}
        {!importer.busy ? (
          <button type="button" className="dsh-lingualab-btn" onClick={importer.dismiss}>
            {t('dismiss')}
          </button>
        ) : null}
      </div>
      {importer.busy ? (
        <div className="dsh-lingualab-bar" aria-hidden>
          <div
            className="dsh-lingualab-bar-fill"
            style={{ width: `${String(importer.total === 0 ? 0 : (importer.done / importer.total) * 100)}%` }}
          />
        </div>
      ) : null}
      {existing.length > 0 ? (
        <div className="dsh-lingualab-hint">
          {t('importExisted', { count: existing.length, folders: existedFolders.join('、') })}
        </div>
      ) : null}
      {refused.map((item) => (
        <div key={`${item.episode}/${item.name}`} className="dsh-lingualab-error">
          {item.name}：{item.reason ?? t('importFailed')}
        </div>
      ))}
      {importer.unmatched.length > 0 ? (
        <div className="dsh-lingualab-warn">
          {t('importUnmatched')}：{importer.unmatched.join('、')}
        </div>
      ) : null}
      {importer.ignored.length > 0 ? (
        <div className="dsh-lingualab-hint">
          {t('importIgnored')}：{importer.ignored.join('、')}
        </div>
      ) : null}
    </div>
  )
}
