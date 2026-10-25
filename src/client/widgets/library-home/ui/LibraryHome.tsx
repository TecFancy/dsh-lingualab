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
import { Fragment, useEffect, useRef, useState } from 'react'
import { findSegment, hasMedia, segmentLabel, segmentNumber, videoMarkOf } from '../../../features/library/index.ts'
import {
  episodeProgress,
  finishedSegments,
  isFinished,
  type EpisodeProgress,
  type PositionTable,
  type Progress,
} from '../../../features/resume/index.ts'
import type { ImportState } from '../../../features/import-media/index.ts'
import { formatBytes, formatClock } from '../../../shared/lib/format.ts'
import { segmentProgress } from '../../../shared/progress.ts'
import { AudioIcon, FolderIcon, UploadIcon, VideoIcon } from '../../../shared/ui/icons.tsx'
import { HomeSkeleton } from '../../../shared/ui/Skeleton.tsx'
import type { EpisodeEntry, LibraryPayload, ReviewEpisode, ReviewPayload } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'
import type { UpdateStatus } from '../../../features/update/index.ts'
import { fitSources, SOURCE_GAP } from '../lib/review-sources.ts'
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

/** One item of an episode's say line: what it says, and whether it is a warning. */
interface SayPart {
  readonly text: string
  readonly warn: boolean
}

/**
 * What an episode is, one item at a time: subtitles, video, kept phrases, hard ones, size.
 *
 * The stage and the rows say the same things in the same order, so the parts are built once
 * and joined by whatever draws them. An item with nothing to say is left out, never printed
 * as a zero. The caller joins them with ` · `.
 */
function episodeSay(t: Translate, entry: EpisodeEntry): readonly SayPart[] {
  const parts: SayPart[] = []
  parts.push({ text: subtitleWord(t, entry), warn: subtitleTone(entry) === 'warn' })
  const video = videoMarkOf(entry)
  if (video === 'ready') parts.push({ text: t('videoMark'), warn: false })
  else if (video === 'unprepared') parts.push({ text: t('videoMarkUnprepared'), warn: true })
  if (entry.notes.count > 0) {
    parts.push({
      text:
        entry.notes.review > 0
          ? t('homeKeptReview', { count: entry.notes.count, review: entry.notes.review })
          : t('homeKept', { count: entry.notes.count }),
      warn: false,
    })
  }
  if (entry.notes.hard > 0) parts.push({ text: t('homeHard', { count: entry.notes.hard }), warn: false })
  const size = formatBytes(sizeOf(entry))
  if (size !== '') parts.push({ text: size, warn: false })
  return parts
}

/** The say line as one sentence, its warning items in the warning colour. */
function SayLine({ parts }: { readonly parts: readonly SayPart[] }) {
  return (
    <p className="dsh-lingualab-say">
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index === 0 ? null : ' · '}
          {part.warn ? <em className="is-warn">{part.text}</em> : part.text}
        </Fragment>
      ))}
    </p>
  )
}

/** One cell of the segment strip: how far into it listening got, and whether it was heard out. */
interface CellSpec {
  readonly at: number
  readonly duration: number
  readonly finished: boolean
}

/** What the position table says about each segment of an episode, in segment order. */
function segmentCells(
  progress: PositionTable,
  entry: EpisodeEntry,
  summary: EpisodeProgress,
): readonly CellSpec[] {
  if (entry.segments.length === 0) {
    const item = summary.entry
    return [{ at: item?.at ?? 0, duration: item?.duration ?? 0, finished: isFinished(item) }]
  }
  const ids = entry.segments.map((segment) => segment.id)
  const done = finishedSegments(progress, entry)
  return entry.segments.map((segment) => {
    const item = segmentProgress(progress, entry.id, segment.id, ids)
    return { at: item?.at ?? 0, duration: item?.duration ?? 0, finished: done.has(segment.id) }
  })
}

/** Which cell carries the current position: the segment the big number names. */
function currentCell(entry: EpisodeEntry, summary: EpisodeProgress): number | null {
  if (summary.entry === null || entry.segments.length === 0) return null
  const id = summary.next === summary.segment ? summary.segment : summary.next
  const index = entry.segments.findIndex((segment) => segment.id === id)
  return index < 0 ? null : index
}

/**
 * One cell per segment, drawn to the size the stage or a row gives it.
 *
 * A finished cell is filled; the current one is taller and filled as far as listening got,
 * and when its length is unknown it keeps the height of the others and gets a ring instead,
 * so an unknown length does not read as a layout mistake. A single file has one cell.
 */
function SegmentCells({
  cells,
  current,
  variant,
}: {
  readonly cells: readonly CellSpec[]
  readonly current: number | null
  readonly variant: 'stage' | 'row' | 'file'
}) {
  return (
    <div className={`dsh-lingualab-cells is-${variant}`} aria-hidden="true">
      {cells.map((cell, index) => {
        const now = index === current
        const fill = cell.duration > 0 ? Math.min(1, Math.max(0, cell.at / cell.duration)) : null
        const classes = ['dsh-lingualab-seg']
        if (cell.finished) classes.push('is-done')
        if (now) classes.push('is-now')
        if (now && fill === null) classes.push('is-hollow')
        return (
          <span key={index} className={classes.join(' ')}>
            {fill !== null && (now || variant === 'file') ? <i style={{ width: `${String(fill * 100)}%` }} /> : null}
          </span>
        )
      })}
    </div>
  )
}

/** The stage's right column: the number of the segment to continue, or the clock for a whole file. */
function StageWhere({
  t,
  entry,
  summary,
}: {
  readonly t: Translate
  readonly entry: EpisodeEntry
  readonly summary: EpisodeProgress
}) {
  const item = summary.entry
  if (item === null) {
    return (
      <div className="dsh-lingualab-where">
        <div className="dsh-lingualab-where-num is-word">{t('homeNotStarted')}</div>
      </div>
    )
  }
  if (entry.segments.length === 0) {
    return (
      <div className="dsh-lingualab-where">
        <div className="dsh-lingualab-where-num">{formatClock(item.at)}</div>
        {item.duration > 0 ? <div className="dsh-lingualab-where-sub">{t('homeWholeFile')}</div> : null}
      </div>
    )
  }
  // Continuing an episode whose last segment was heard out names the next segment, not the
  // one that was just finished, because that is the place the button opens.
  const next = summary.next !== summary.segment
  const segment = findSegment(entry.segments, next ? summary.next : summary.segment)
  return (
    <div className="dsh-lingualab-where">
      <div className="dsh-lingualab-where-num">{segment === null ? '' : segmentNumber(segment)}</div>
      <div className="dsh-lingualab-where-sub">{next ? t('homeNextSegment') : formatClock(item.at)}</div>
    </div>
  )
}

/**
 * The stage: the one episode to continue, as the biggest thing on the page.
 *
 * Not a card. It says where listening stopped (a segment number, a clock, or 「还没开始」),
 * draws one cell per segment, and offers the page's only filled button.
 */
function Stage({
  t,
  entry,
  summary,
  progress,
  opening,
  onOpen,
}: {
  readonly t: Translate
  readonly entry: EpisodeEntry
  readonly summary: EpisodeProgress
  readonly progress: PositionTable
  readonly opening: boolean
  readonly onOpen: (id: string) => void
}) {
  const say = episodeSay(t, entry)
  return (
    <section className="dsh-lingualab-resume">
      <p className="dsh-lingualab-kicker">{summary.entry === null ? t('homeStart') : t('homeContinue')}</p>
      <div className="dsh-lingualab-resume-head">
        <h1 className="dsh-lingualab-resume-title">{entry.title}</h1>
        <StageWhere t={t} entry={entry} summary={summary} />
      </div>
      <SegmentCells
        cells={segmentCells(progress, entry, summary)}
        current={currentCell(entry, summary)}
        variant={entry.segments.length === 0 ? 'file' : 'stage'}
      />
      {entry.segments.length === 0 ? null : (
        <p className="dsh-lingualab-meter">
          {summary.entry === null
            ? t('homeSegmentTotal', { total: summary.total })
            : t('homeSegmentCount', { done: summary.finished, total: summary.total })}
        </p>
      )}
      {say.length === 0 ? null : <SayLine parts={say} />}
      <div className="dsh-lingualab-stage-act">
        <button
          type="button"
          className="dsh-lingualab-btn is-primary"
          onClick={() => onOpen(entry.id)}
          disabled={opening}
        >
          {opening ? <span className="dsh-lingualab-spinner" aria-hidden /> : <span className="dsh-lingualab-tri" aria-hidden />}
          {summary.entry === null ? t('startPractice') : t('resumePractice')}
        </button>
      </div>
    </section>
  )
}

/**
 * Which episodes the kept sentences come from.
 *
 * The list gets two rows; past that the last item becomes 「等 N 集」, so the bar cannot grow
 * with the library. Which items land on the first row depends on their titles, so the widths
 * are measured after the first paint and `fitSources` decides; before that everything is drawn
 * and no summary is shown. Remounted when the episodes change, so the measurement starts over.
 */
function ReviewSources({ t, episodes }: { readonly t: Translate; readonly episodes: readonly ReviewEpisode[] }) {
  const listRef = useRef<HTMLUListElement | null>(null)
  const [shown, setShown] = useState<number | null>(null)
  useEffect(() => {
    const list = listRef.current
    if (list === null) return
    const widths = [...list.children].map((item) => item.getBoundingClientRect().width)
    const fit = fitSources(widths, list.clientWidth, SOURCE_GAP)
    if (fit.shown < widths.length) setShown(fit.shown)
  }, [])
  const visible = shown === null ? episodes : episodes.slice(0, Math.max(0, shown - 1))
  const rest = shown === null ? 0 : episodes.length - shown + 1
  return (
    <ul className="dsh-lingualab-reviewcard-from" ref={listRef}>
      {visible.map((item) => (
        <li key={item.episode}>
          {item.title} <b>{t('reviewFromCount', { count: item.phrases.length })}</b>
        </li>
      ))}
      {rest > 0 ? <li>{t('reviewFromMore', { count: rest })}</li> : null}
    </ul>
  )
}

/** The weekly pass: how many kept sentences are still being practised, and where they come from. */
function ReviewBar({
  t,
  review,
  opening,
  onReview,
}: {
  readonly t: Translate
  readonly review: ReviewPayload
  readonly opening: boolean
  readonly onReview: () => void
}) {
  return (
    <section className="dsh-lingualab-reviewcard">
      <div className="dsh-lingualab-reviewcard-top">
        <div className="dsh-lingualab-reviewcard-main">
          <p className="dsh-lingualab-kicker">{t('reviewHomeTitle')}</p>
          <div className="dsh-lingualab-reviewcard-line">
            <span className="dsh-lingualab-reviewcard-num">{review.total}</span>
            <span className="dsh-lingualab-reviewcard-sub">
              {t('reviewHomeSub', { count: review.total, episodes: review.episodes.length })}
            </span>
          </div>
        </div>
        <button type="button" className="dsh-lingualab-btn" onClick={onReview} disabled={opening}>
          {t('reviewHomeStart')}
        </button>
      </div>
      <ReviewSources
        key={review.episodes.map((item) => item.episode).join('|')}
        t={t}
        episodes={review.episodes}
      />
    </section>
  )
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
              <Stage
                t={t}
                entry={resume}
                summary={episodeProgress(progress, resume)}
                progress={progress}
                opening={opening}
                onOpen={onOpen}
              />
            ) : null}

            {review !== null && review.total > 0 ? (
              <ReviewBar t={t} review={review} opening={opening} onReview={onReview} />
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
      <div className="dsh-lingualab-report-top">
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
        <div className="dsh-lingualab-filebar" aria-hidden>
          <i
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
