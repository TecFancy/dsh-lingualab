/**
 * The browse layer: reach into a directory and open one audio file, subtitles and all.
 *
 * The library is the home page now, so this layer no longer lists episodes. It exists
 * for the thing the home page cannot do: material that is not in the media folder,
 * opened without copying it anywhere or typing an absolute path.
 *
 * The rows say whether a file has subtitles and which, so picking is a reading
 * decision rather than a guess.
 */
import { formatBytes } from '../../../shared/lib/format.ts'
import { AudioIcon, ChevronIcon, CloseIcon, FolderIcon, SubtitleIcon } from '../../../shared/ui/icons.tsx'
import type { BrowseEntry, SubtitleHint } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'
import { usePicker } from '../model/usePicker.ts'

export interface EpisodePickerProps {
  readonly t: Translate
  readonly onClose: () => void
  readonly opening: boolean
  readonly openError: string | null
  readonly onOpenEpisode: (id: string) => void
  readonly onOpenFile: (place: string, rel: string) => void
  /** Make the browsed directory the library root. */
  readonly onUseFolder: (place: string, rel: string) => void
  readonly savingFolder: boolean
}

/** What the browse list says about one audio file's subtitle pairing. */
function hintBadge(t: Translate, hint: SubtitleHint | null): string {
  if (hint === null || hint.state === 'none') return t('subtitleBadgeNone')
  if (hint.state === 'both') return t('subtitleBadgeBoth')
  if (hint.state === 'en') return t('subtitleBadgeEn')
  if (hint.state === 'zh') return t('subtitleBadgeZh')
  return t('subtitleBadgeUnknown')
}

/** The browse layer. */
export function EpisodePicker({
  t,
  onClose,
  opening,
  openError,
  onOpenEpisode,
  onOpenFile,
  onUseFolder,
  savingFolder,
}: EpisodePickerProps) {
  const picker = usePicker(true)

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
          <span className="dsh-lingualab-modal-title">{t('pickerBrowseTitle')}</span>
          <span className="dsh-lingualab-spacer" />
          {opening ? <span className="dsh-lingualab-counter">{t('pickerLoading')}…</span> : null}
          <button type="button" className="dsh-lingualab-icon-btn" onClick={onClose} title={t('close')}>
            <CloseIcon />
          </button>
        </div>

        {openError !== null ? <div className="dsh-lingualab-error">{openError}</div> : null}

        <div className="dsh-lingualab-modal-body">
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
        </div>
      </div>
    </div>
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
