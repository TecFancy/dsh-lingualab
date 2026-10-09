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
 * Where the files live is one quiet line at the bottom, with a way to change it.
 * It is a setting touched twice a month, and a page that leads with it reads as a
 * settings page.
 */
import { fractionOf, type Progress } from '../../../features/resume/index.ts'
import type { ImportState } from '../../../features/import-media/index.ts'
import { formatBytes, formatClock } from '../../../shared/lib/format.ts'
import { AudioIcon, ChevronIcon, FolderIcon, PlayIcon, UploadIcon } from '../../../shared/ui/icons.tsx'
import type { EpisodeEntry, LibraryPayload } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'
import { DropZone, FilePicker } from './DropZone.tsx'

export interface LibraryHomeProps {
  readonly t: Translate
  readonly library: LibraryPayload | null
  readonly loading: boolean
  readonly importer: ImportState
  /** Bookmarks, keyed by episode id. */
  readonly progress: Readonly<Record<string, Progress>>
  /** The episode the reader had open last, for the "continue" card. */
  readonly currentId: string | null
  readonly opening: boolean
  readonly openError: string | null
  readonly onOpen: (id: string) => void
  readonly onFiles: (files: readonly File[]) => void
  /** Open the layer that browses to a folder or a single file. */
  readonly onBrowse: () => void
  /** Open the media folder settings. */
  readonly onFolder: () => void
}

/** Every episode the library knows, folders first, the way the scan lists them. */
function allEpisodes(library: LibraryPayload | null): readonly EpisodeEntry[] {
  return library === null ? [] : [...library.episodes, ...library.files]
}

/** What an episode's subtitles amount to, in one short word. */
function subtitleWord(t: Translate, entry: EpisodeEntry): string {
  if (entry.audio === null) return t('pickerNoAudio')
  if (entry.subtitleEn !== null && entry.subtitleZh !== null) return t('subtitleBadgeBoth')
  if (entry.subtitleEn !== null) return t('subtitleBadgeEn')
  if (entry.subtitleZh !== null) return t('subtitleBadgeZh')
  return t('subtitleBadgeNone')
}

/** The home page of the panel. */
export function LibraryHome({
  t,
  library,
  loading,
  importer,
  progress,
  currentId,
  opening,
  openError,
  onOpen,
  onFiles,
  onBrowse,
  onFolder,
}: LibraryHomeProps) {
  const episodes = allEpisodes(library)
  const playable = episodes.filter((entry) => entry.audio !== null)
  const resume =
    playable.find((entry) => entry.id === currentId) ??
    // Nothing remembered as "current" still has a most-recent bookmark worth offering.
    [...playable].sort((a, b) => (progress[b.id]?.updatedAt ?? 0) - (progress[a.id]?.updatedAt ?? 0)).find(
      (entry) => progress[entry.id] !== undefined,
    ) ??
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

            {loading && playable.length === 0 ? (
              <div className="dsh-lingualab-empty">{t('stageLoading')}…</div>
            ) : null}

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
              <ResumeCard t={t} entry={resume} progress={progress[resume.id] ?? null} opening={opening} onOpen={onOpen} />
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
                <div className="dsh-lingualab-episodes">
                  {rest.map((entry) => (
                    <EpisodeRow
                      key={entry.id}
                      t={t}
                      entry={entry}
                      progress={progress[entry.id] ?? null}
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

            <FolderLine t={t} library={library} onChange={onFolder} />
          </div>
      </DropZone>
    </div>
  )
}

/** The big "continue where you stopped" card. */
function ResumeCard({
  t,
  entry,
  progress,
  opening,
  onOpen,
}: {
  readonly t: Translate
  readonly entry: EpisodeEntry
  readonly progress: Progress | null
  readonly opening: boolean
  readonly onOpen: (id: string) => void
}) {
  const fraction = fractionOf(progress)
  return (
    <section className="dsh-lingualab-resume">
      <div className="dsh-lingualab-resume-label">{progress === null ? t('homeStart') : t('homeContinue')}</div>
      <h1 className="dsh-lingualab-resume-title">{entry.title}</h1>
      <div className="dsh-lingualab-resume-meta">
        <span>{subtitleWord(t, entry)}</span>
        <span>{formatBytes(entry.audioBytes)}</span>
        {entry.notes.count > 0 ? (
          <span>
            {t('notesKept')} {entry.notes.count}
          </span>
        ) : null}
        {progress !== null ? <span>{t('stoppedAt', { time: formatClock(progress.at) })}</span> : null}
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
          <PlayIcon size={16} /> {progress === null ? t('startPractice') : t('resumePractice')}
        </button>
      </div>
    </section>
  )
}

/** One row of the episode list. */
function EpisodeRow({
  t,
  entry,
  progress,
  disabled,
  onOpen,
}: {
  readonly t: Translate
  readonly entry: EpisodeEntry
  readonly progress: Progress | null
  readonly disabled: boolean
  readonly onOpen: (id: string) => void
}) {
  const fraction = fractionOf(progress)
  return (
    <button type="button" className="dsh-lingualab-episode-row" onClick={() => onOpen(entry.id)} disabled={disabled}>
      {entry.kind === 'folder' ? <FolderIcon /> : <AudioIcon />}
      <span className="dsh-lingualab-pick-main">
        <span className="dsh-lingualab-pick-name">{entry.title}</span>
        <span className="dsh-lingualab-pick-sub">
          {subtitleWord(t, entry)}
          {entry.audioBytes === null ? '' : ` · ${formatBytes(entry.audioBytes)}`}
          {entry.notes.count > 0 ? ` · ${t('notesKept')} ${String(entry.notes.count)}` : ''}
        </span>
      </span>
      {fraction > 0 ? (
        <span className="dsh-lingualab-bar is-small" aria-hidden>
          <span className="dsh-lingualab-bar-fill" style={{ width: `${String(fraction * 100)}%` }} />
        </span>
      ) : null}
      <ChevronIcon />
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
  const existed = importer.outcomes.filter((item) => item.status === 'exists').length
  const refused = importer.outcomes.filter((item) => item.status === 'refused')

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
      {existed > 0 ? <div className="dsh-lingualab-hint">{t('importExisted', { count: existed })}</div> : null}
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
      <span>{t('filesLiveIn')}</span>
      <code className="dsh-lingualab-path" title={library?.root ?? ''}>
        {library?.root !== undefined && library.root.length > 0 ? library.root : t('mediaFolderSourceNone')}
      </code>
      <button type="button" className="dsh-lingualab-link" onClick={onChange}>
        {t('change')}
      </button>
    </div>
  )
}
