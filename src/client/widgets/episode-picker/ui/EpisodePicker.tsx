/**
 * The picker: one layer, two ways in.
 *
 * 「媒体库」 is for the thing you do most — switch to another episode of a library that
 * is already set up — so it opens first and lists what the scan knows: episode folders,
 * and audio files sitting loose in the root. 「浏览」 is for the thing that used to be
 * impossible: reach into a directory and open a single audio file, subtitles and all,
 * without copying it anywhere or typing an absolute path.
 *
 * The rows say what the previous `<select>` could not: whether an episode has audio,
 * whether subtitles were found, and which files those are. Picking therefore becomes a
 * reading decision rather than a guess.
 */
import { useState } from 'react'
import { formatBytes } from '../../../shared/lib/format.ts'
import { AudioIcon, ChevronIcon, CloseIcon, FolderIcon, SubtitleIcon } from '../../../shared/ui/icons.tsx'
import type { BrowseEntry, EpisodeEntry, LibraryPayload, SubtitleHint } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'
import { usePicker } from '../model/usePicker.ts'

export interface EpisodePickerProps {
  readonly t: Translate
  readonly onClose: () => void
  /** The library listing the page already has, so the layer needs no second request. */
  readonly library: LibraryPayload | null
  /** The episode open now, marked in the list. */
  readonly currentId: string | null
  readonly opening: boolean
  readonly openError: string | null
  readonly onOpenEpisode: (id: string) => void
  readonly onOpenFile: (place: string, rel: string) => void
  /** Make the browsed directory the library root. */
  readonly onUseFolder: (place: string, rel: string) => void
  readonly savingFolder: boolean
}

/** The badge one library row shows about its subtitles. */
function subtitleBadge(t: Translate, entry: EpisodeEntry): string {
  if (entry.audio === null) return t('pickerNoAudio')
  if (entry.subtitleEn !== null && entry.subtitleZh !== null) return t('subtitleBadgeBoth')
  if (entry.subtitleEn !== null) return t('subtitleBadgeEn')
  if (entry.subtitleZh !== null) return t('subtitleBadgeZh')
  return t('subtitleBadgeNone')
}

/** What the browse list says about one audio file's subtitle pairing. */
function hintBadge(t: Translate, hint: SubtitleHint | null): string {
  if (hint === null || hint.state === 'none') return t('subtitleBadgeNone')
  if (hint.state === 'both') return t('subtitleBadgeBoth')
  if (hint.state === 'en') return t('subtitleBadgeEn')
  if (hint.state === 'zh') return t('subtitleBadgeZh')
  return t('subtitleBadgeUnknown')
}

/** The one line under a library row: the files behind it. */
function episodeSub(entry: EpisodeEntry): string {
  const parts: string[] = []
  if (entry.audio !== null) parts.push(entry.audio)
  if (entry.subtitleEn !== null) parts.push(entry.subtitleEn)
  if (entry.subtitleZh !== null && entry.subtitleZh !== entry.subtitleEn) parts.push(entry.subtitleZh)
  return parts.join(' · ')
}

/** The picker layer. */
export function EpisodePicker({
  t,
  onClose,
  library,
  currentId,
  opening,
  openError,
  onOpenEpisode,
  onOpenFile,
  onUseFolder,
  savingFolder,
}: EpisodePickerProps) {
  const picker = usePicker(true)
  const [tab, setTab] = useState<'library' | 'browse'>('library')

  // The layer stays open until the host confirms: a pick that fails must leave the
  // list on screen with the reason, not vanish and say nothing.
  const pickFile = (rel: string): void => {
    if (picker.place === null) return
    onOpenFile(picker.place.id, rel)
  }

  return (
    <div className="dsh-lingualab-mask" onClick={onClose}>
      <div className="dsh-lingualab-modal" onClick={(event) => event.stopPropagation()}>
        <div className="dsh-lingualab-modal-head">
          <span className="dsh-lingualab-modal-title">{t('pickerTitle')}</span>
          <span className="dsh-lingualab-spacer" />
          {opening ? <span className="dsh-lingualab-counter">{t('pickerLoading')}…</span> : null}
          <button type="button" className="dsh-lingualab-icon-btn" onClick={onClose} title={t('close')}>
            <CloseIcon />
          </button>
        </div>

        <div className="dsh-lingualab-tabs">
          <button
            type="button"
            className={`dsh-lingualab-tab${tab === 'library' ? ' is-on' : ''}`}
            onClick={() => setTab('library')}
          >
            {t('pickerLibrary')}
          </button>
          <button
            type="button"
            className={`dsh-lingualab-tab${tab === 'browse' ? ' is-on' : ''}`}
            onClick={() => setTab('browse')}
          >
            {t('pickerBrowse')}
          </button>
        </div>

        {openError !== null ? <div className="dsh-lingualab-error">{openError}</div> : null}

        <div className="dsh-lingualab-modal-body">
          {tab === 'library' ? (
            <LibraryTab
              t={t}
              library={library}
              currentId={currentId}
              onPick={(id) => onOpenEpisode(id)}
            />
          ) : (
            <BrowseTab
              t={t}
              picker={picker}
              onPickFile={pickFile}
              onPickEpisode={(id) => onOpenEpisode(id)}
              onUseFolder={() => {
                if (picker.place !== null) onUseFolder(picker.place.id, picker.rel)
              }}
              savingFolder={savingFolder}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/** The library tab: what the scan knows, folders first. */
function LibraryTab({
  t,
  library,
  currentId,
  onPick,
}: {
  readonly t: Translate
  readonly library: LibraryPayload | null
  readonly currentId: string | null
  readonly onPick: (id: string) => void
}) {
  const [filter, setFilter] = useState('')
  const needle = filter.trim().toLowerCase()
  const match = (entry: EpisodeEntry): boolean =>
    needle.length === 0 ||
    entry.title.toLowerCase().includes(needle) ||
    (entry.audio ?? '').toLowerCase().includes(needle)

  const folders = (library?.episodes ?? []).filter(match)
  const files = (library?.files ?? []).filter(match)
  const empty = library === null || (folders.length === 0 && files.length === 0)

  return (
    <>
      <input
        className="dsh-lingualab-input"
        value={filter}
        placeholder={t('pickerSearch')}
        onChange={(event) => setFilter(event.target.value)}
        onKeyDown={(event) => event.stopPropagation()}
      />
      {library?.ok === false ? (
        <div className="dsh-lingualab-warn">{library.reason ?? t('pickerNoLibrary')}</div>
      ) : null}
      {empty ? (
        <div className="dsh-lingualab-empty">
          {library === null || library.ok === false ? t('pickerNoLibraryHint') : t('pickerEmptyFolder')}
        </div>
      ) : null}
      {folders.length > 0 ? <div className="dsh-lingualab-group">{t('pickerEpisodes')}</div> : null}
      {folders.map((entry) => (
        <button
          key={entry.id}
          type="button"
          className={`dsh-lingualab-pick${entry.id === currentId ? ' is-current' : ''}`}
          onClick={() => onPick(entry.id)}
          disabled={entry.audio === null}
        >
          <FolderIcon />
          <span className="dsh-lingualab-pick-main">
            <span className="dsh-lingualab-pick-name">{entry.title}</span>
            <span className="dsh-lingualab-pick-sub">{episodeSub(entry)}</span>
          </span>
          <span className="dsh-lingualab-badge">{subtitleBadge(t, entry)}</span>
        </button>
      ))}
      {files.length > 0 ? <div className="dsh-lingualab-group">{t('pickerFiles')}</div> : null}
      {files.map((entry) => (
        <button
          key={entry.id}
          type="button"
          className={`dsh-lingualab-pick${entry.id === currentId ? ' is-current' : ''}`}
          onClick={() => onPick(entry.id)}
        >
          <AudioIcon />
          <span className="dsh-lingualab-pick-main">
            <span className="dsh-lingualab-pick-name">{entry.title}</span>
            <span className="dsh-lingualab-pick-sub">{episodeSub(entry)}</span>
          </span>
          <span className="dsh-lingualab-badge">{formatBytes(entry.audioBytes)}</span>
        </button>
      ))}
    </>
  )
}

/** The browse tab: places, then directories, then the one audio file you came for. */
function BrowseTab({
  t,
  picker,
  onPickFile,
  onPickEpisode,
  onUseFolder,
  savingFolder,
}: {
  readonly t: Translate
  readonly picker: ReturnType<typeof usePicker>
  readonly onPickFile: (rel: string) => void
  readonly onPickEpisode: (id: string) => void
  readonly onUseFolder: () => void
  readonly savingFolder: boolean
}) {
  const {
    place,
    places,
    rel,
    entries,
    folderEpisode,
    loading,
    error,
    query,
    setQuery,
  } = picker
  const segments = rel.split('/').filter((part) => part.length > 0)

  if (places.length === 0) {
    return <div className="dsh-lingualab-empty">{t('noWorkspaces')}</div>
  }

  return (
    <>
      <div className="dsh-lingualab-actions">
        <select
          className="dsh-lingualab-bar-btn"
          value={place?.id ?? ''}
          onChange={(event) => picker.enter(event.target.value, '')}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {places.map((entry) => (
            <option key={entry.id} value={entry.id} disabled={!entry.readable}>
              {entry.label}
              {entry.suggested ? ` · ${t('pickerConvention')}` : ''}
              {entry.readable ? '' : ` · ${entry.reason ?? t('dirUnreadable')}`}
            </option>
          ))}
        </select>
        {rel !== '' ? (
          <button type="button" className="dsh-lingualab-btn" onClick={picker.up}>
            {t('pickerParent')}
          </button>
        ) : null}
        <span className="dsh-lingualab-spacer" />
        <button
          type="button"
          className="dsh-lingualab-btn"
          onClick={onUseFolder}
          disabled={place === null || savingFolder || !place.readable}
        >
          {t('mediaFolderUse')}
        </button>
      </div>

      <div className="dsh-lingualab-hint" title={place?.path ?? ''}>
        {place?.label ?? ''}
        {segments.map((segment, index) => (
          <span key={`${segment}-${index}`}>
            {' / '}
            <button
              type="button"
              className="dsh-lingualab-note-at"
              onClick={() => picker.enter(place?.id ?? '', segments.slice(0, index + 1).join('/'))}
            >
              {segment}
            </button>
          </span>
        ))}
      </div>

      <input
        className="dsh-lingualab-input"
        value={query}
        placeholder={t('pickerSearch')}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => event.stopPropagation()}
      />

      {error !== null ? <div className="dsh-lingualab-error">{error}</div> : null}
      {loading ? <div className="dsh-lingualab-empty">{t('pickerLoading')}…</div> : null}
      {!loading && error === null && entries.length === 0 ? (
        <div className="dsh-lingualab-empty">{t('pickerEmptyFolder')}</div>
      ) : null}
      {picker.truncated ? <div className="dsh-lingualab-hint">{t('pickerTruncated')}</div> : null}

      {folderEpisode !== null ? (
        <button type="button" className="dsh-lingualab-pick" onClick={() => onPickEpisode(folderEpisode.id)}>
          <FolderIcon />
          <span className="dsh-lingualab-pick-main">
            <span className="dsh-lingualab-pick-name">{folderEpisode.title}</span>
            <span className="dsh-lingualab-pick-sub">{t('pickerOpenFolder')}</span>
          </span>
          <span className="dsh-lingualab-badge">{t('pickerEpisodes')}</span>
        </button>
      ) : null}

      {entries.map((entry) => (
        <BrowseRow
          key={entry.rel}
          t={t}
          entry={entry}
          onPickFile={onPickFile}
          onEnter={(next) => picker.enter(place?.id ?? '', next)}
        />
      ))}
    </>
  )
}

/** One row of a directory listing. */
function BrowseRow({
  t,
  entry,
  onEnter,
  onPickFile,
}: {
  readonly t: Translate
  readonly entry: BrowseEntry
  readonly onEnter: (rel: string) => void
  readonly onPickFile: (rel: string) => void
}) {
  if (entry.type === 'dir') {
    return (
      <button type="button" className="dsh-lingualab-pick" onClick={() => onEnter(entry.rel)}>
        <FolderIcon />
        <span className="dsh-lingualab-pick-main">
          <span className="dsh-lingualab-pick-name">{entry.name}</span>
        </span>
        <ChevronIcon />
      </button>
    )
  }

  if (entry.type === 'audio') {
    return (
      <button type="button" className="dsh-lingualab-pick" onClick={() => onPickFile(entry.rel)}>
        <AudioIcon />
        <span className="dsh-lingualab-pick-main">
          <span className="dsh-lingualab-pick-name">{entry.name}</span>
          <span className="dsh-lingualab-pick-sub">
            {entry.subtitle !== null && entry.subtitle.files.length > 0
              ? entry.subtitle.files.join(' · ')
              : formatBytes(entry.bytes)}
          </span>
        </span>
        <span className="dsh-lingualab-badge">{hintBadge(t, entry.subtitle)}</span>
      </button>
    )
  }

  return (
    <div className="dsh-lingualab-pick" style={{ cursor: 'default' }}>
      <SubtitleIcon />
      <span className="dsh-lingualab-pick-main">
        <span className="dsh-lingualab-pick-name">{entry.name}</span>
      </span>
      <span className="dsh-lingualab-badge">{entry.ext}</span>
    </div>
  )
}
