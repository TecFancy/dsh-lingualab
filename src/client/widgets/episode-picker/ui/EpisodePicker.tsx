/**
 * The browse layer: reach into a directory and open one audio file, subtitles and all.
 *
 * The library is the home page now, so this layer no longer lists episodes. It exists
 * for the thing the home page cannot do: material that is not in the media folder,
 * opened without copying it anywhere or typing an absolute path.
 *
 * The rows say whether a file has subtitles and which, so picking is a reading
 * decision rather than a guess. The layer is keyboard-first: the filter box owns focus
 * on open, arrows move a highlight, Enter opens it, Backspace on an empty filter goes up.
 */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { formatBytes } from '../../../shared/lib/format.ts'
import {
  AudioIcon,
  ChevronIcon,
  CloseIcon,
  FolderIcon,
  SubtitleIcon,
  UpIcon,
} from '../../../shared/ui/icons.tsx'
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

/** Badge tone: a complete pair reads as good news, a bare file as a warning, the rest as neutral. */
function hintTone(hint: SubtitleHint | null): 'ok' | 'warn' | 'plain' {
  if (hint === null || hint.state === 'none') return 'warn'
  if (hint.state === 'both') return 'ok'
  return 'plain'
}

/** One thing the highlight can rest on: the keyboard walks this list, top to bottom. */
type NavItem =
  | { readonly kind: 'episode'; readonly id: string }
  | { readonly kind: 'dir'; readonly rel: string }
  | { readonly kind: 'audio'; readonly rel: string }

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
  const { place, rel, entries, folderEpisode, query } = picker
  // The highlight belongs to one listing: a different directory or filter is a different
  // key, which reads as "back to the top" without an effect to reset it.
  const listingKey = `${place?.id ?? ''}\u0000${rel}\u0000${query}`
  const [moved, setMoved] = useState({ key: '', index: 0 })
  const cursor = moved.key === listingKey ? moved.index : 0
  const setCursor = (next: number | ((current: number) => number)): void => {
    setMoved({ key: listingKey, index: typeof next === 'function' ? next(cursor) : next })
  }
  const filterRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  // Only a key press should scroll the highlight into view; a mouse that is already
  // over a row must not make the list jump under it.
  const keyMoved = useRef(false)

  const folders = useMemo(() => entries.filter((entry) => entry.type === 'dir'), [entries])
  const audio = useMemo(() => entries.filter((entry) => entry.type === 'audio'), [entries])
  const others = useMemo(
    () => entries.filter((entry) => entry.type !== 'dir' && entry.type !== 'audio'),
    [entries],
  )

  const nav = useMemo<readonly NavItem[]>(
    () => [
      ...(folderEpisode !== null ? [{ kind: 'episode', id: folderEpisode.id } as const] : []),
      ...folders.map((entry) => ({ kind: 'dir', rel: entry.rel }) as const),
      ...audio.map((entry) => ({ kind: 'audio', rel: entry.rel }) as const),
    ],
    [folderEpisode, folders, audio],
  )

  // A new listing starts the highlight at the top, and the filter keeps the keyboard:
  // typing a few letters then Enter is the whole interaction.
  useEffect(() => {
    filterRef.current?.focus()
  }, [place?.id, rel])
  useEffect(() => {
    if (!keyMoved.current) return
    keyMoved.current = false
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  // The layer stays open until the host confirms: a pick that fails must leave the
  // list on screen with the reason, not vanish and say nothing.
  const pickFile = (fileRel: string): void => {
    if (place === null) return
    onOpenFile(place.id, fileRel)
  }

  const activate = (item: NavItem | undefined): void => {
    if (item === undefined) return
    if (item.kind === 'episode') onOpenEpisode(item.id)
    else if (item.kind === 'dir') picker.enter(place?.id ?? '', item.rel)
    else pickFile(item.rel)
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    const target = event.target
    // The place picker is a native select: arrows and Enter are its own.
    if (target instanceof HTMLSelectElement) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
      return
    }
    const onButton = target instanceof HTMLButtonElement
    const emptyFilter = target instanceof HTMLInputElement && target.value.length === 0
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        onClose()
        return
      case 'ArrowDown':
      case 'ArrowUp': {
        if (nav.length === 0) return
        event.preventDefault()
        event.stopPropagation()
        keyMoved.current = true
        const step = event.key === 'ArrowDown' ? 1 : -1
        setCursor((current) => (current + step + nav.length) % nav.length)
        return
      }
      case 'Enter':
        // A focused button already clicks itself on Enter; doing it twice would open twice.
        if (onButton) return
        event.preventDefault()
        event.stopPropagation()
        activate(nav[Math.min(cursor, nav.length - 1)])
        return
      case 'Backspace':
        if (!emptyFilter || rel === '') return
        event.preventDefault()
        event.stopPropagation()
        picker.up()
        return
      default:
        // Anything else typed on the layer is a filter, wherever the focus happens to be.
        event.stopPropagation()
    }
  }

  const folderName = rel === '' ? (place?.label ?? '') : (rel.split('/').filter(Boolean).pop() ?? '')
  const segments = rel.split('/').filter((part) => part.length > 0)

  return (
    <div className="dsh-lingualab-mask" onClick={onClose}>
      <div
        className="dsh-lingualab-modal is-browse"
        role="dialog"
        aria-label={t('pickerBrowseTitle')}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="dsh-lingualab-modal-head">
          <span className="dsh-lingualab-modal-title">{t('pickerBrowseTitle')}</span>
          <span className="dsh-lingualab-spacer" />
          {opening || picker.loading ? (
            <span className="dsh-lingualab-counter">{t('pickerLoading')}…</span>
          ) : null}
          <button type="button" className="dsh-lingualab-icon-btn" onClick={onClose} title={t('close')}>
            <CloseIcon />
          </button>
        </div>

        {picker.places.length === 0 ? (
          <div className="dsh-lingualab-modal-body">
            <div className="dsh-lingualab-empty">{t('noWorkspaces')}</div>
          </div>
        ) : (
          <>
            <div className="dsh-lingualab-browse-bar">
              <div className="dsh-lingualab-pathrow">
                <select
                  className="dsh-lingualab-select"
                  aria-label={t('pickerPlace')}
                  value={place?.id ?? ''}
                  onChange={(event) => picker.enter(event.target.value, '')}
                >
                  {picker.places.map((entry) => (
                    <option key={entry.id} value={entry.id} disabled={!entry.readable}>
                      {entry.label}
                      {entry.suggested ? ` · ${t('pickerConvention')}` : ''}
                      {entry.readable ? '' : ` · ${entry.reason ?? t('dirUnreadable')}`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="dsh-lingualab-icon-btn is-small"
                  onClick={picker.up}
                  disabled={rel === ''}
                  title={t('pickerParent')}
                  aria-label={t('pickerParent')}
                >
                  <UpIcon />
                </button>
                <nav className="dsh-lingualab-crumbs" title={place?.path ?? ''}>
                  {segments.length === 0 ? (
                    <span className="dsh-lingualab-crumbs-root">{place?.path ?? ''}</span>
                  ) : (
                    <button
                      type="button"
                      className="dsh-lingualab-crumb"
                      onClick={() => picker.enter(place?.id ?? '', '')}
                      title={place?.path ?? ''}
                    >
                      {place?.label ?? ''}
                    </button>
                  )}
                  {segments.map((segment, index) => {
                    const here = index === segments.length - 1
                    return (
                      <span key={`${segment}-${index}`} className="dsh-lingualab-crumb-item">
                        <ChevronIcon size={12} />
                        <button
                          type="button"
                          className={`dsh-lingualab-crumb${here ? ' is-here' : ''}`}
                          disabled={here}
                          onClick={() => picker.enter(place?.id ?? '', segments.slice(0, index + 1).join('/'))}
                        >
                          {segment}
                        </button>
                      </span>
                    )
                  })}
                </nav>
              </div>
              <input
                ref={filterRef}
                className="dsh-lingualab-input"
                value={query}
                placeholder={t('pickerSearch')}
                onChange={(event) => picker.setQuery(event.target.value)}
              />
            </div>

            {openError !== null ? <div className="dsh-lingualab-error is-pad">{openError}</div> : null}
            {picker.error !== null ? <div className="dsh-lingualab-error is-pad">{picker.error}</div> : null}

            <div
              ref={listRef}
              className={`dsh-lingualab-modal-body${picker.loading && entries.length > 0 ? ' is-loading' : ''}`}
            >
              {!picker.loading && picker.error === null && nav.length === 0 && others.length === 0 ? (
                <div className="dsh-lingualab-empty is-center">
                  <strong>{query.trim().length > 0 ? t('pickerNoMatch', { query: query.trim() }) : t('pickerEmptyFolder')}</strong>
                  {query.trim().length === 0 ? <span>{t('pickerEmptyHint')}</span> : null}
                </div>
              ) : null}

              {folderEpisode !== null ? (
                <button
                  type="button"
                  className={`dsh-lingualab-pick is-episode${cursor === 0 ? ' is-active' : ''}`}
                  data-active={cursor === 0}
                  onMouseMove={() => setCursor(0)}
                  onClick={() => onOpenEpisode(folderEpisode.id)}
                >
                  <FolderIcon />
                  <span className="dsh-lingualab-pick-main">
                    <span className="dsh-lingualab-pick-name">{folderEpisode.title}</span>
                    <span className="dsh-lingualab-pick-sub">{t('pickerOpenFolder')}</span>
                  </span>
                  <span className="dsh-lingualab-badge is-ok">{t('pickerEpisodes')}</span>
                </button>
              ) : null}

              {folders.length > 0 ? (
                <div className="dsh-lingualab-group">{t('pickerGroupFolders', { count: folders.length })}</div>
              ) : null}
              {folders.map((entry, index) => {
                const at = (folderEpisode !== null ? 1 : 0) + index
                return (
                  <BrowseRow
                    key={entry.rel}
                    t={t}
                    entry={entry}
                    active={cursor === at}
                    onHover={() => setCursor(at)}
                    onEnter={(next) => picker.enter(place?.id ?? '', next)}
                    onPickFile={pickFile}
                  />
                )
              })}

              {audio.length > 0 ? (
                <div className="dsh-lingualab-group">{t('pickerGroupAudio', { count: audio.length })}</div>
              ) : null}
              {audio.map((entry, index) => {
                const at = (folderEpisode !== null ? 1 : 0) + folders.length + index
                return (
                  <BrowseRow
                    key={entry.rel}
                    t={t}
                    entry={entry}
                    active={cursor === at}
                    onHover={() => setCursor(at)}
                    onEnter={(next) => picker.enter(place?.id ?? '', next)}
                    onPickFile={pickFile}
                  />
                )
              })}

              {others.length > 0 ? (
                <div className="dsh-lingualab-group">{t('pickerGroupOther', { count: others.length })}</div>
              ) : null}
              {others.map((entry) => (
                <BrowseRow
                  key={entry.rel}
                  t={t}
                  entry={entry}
                  active={false}
                  onHover={() => undefined}
                  onEnter={() => undefined}
                  onPickFile={() => undefined}
                />
              ))}

              {picker.truncated ? <div className="dsh-lingualab-hint is-pad">{t('pickerTruncated')}</div> : null}
            </div>

            <div className="dsh-lingualab-modal-foot">
              <span className="dsh-lingualab-keys">{t('pickerKeys')}</span>
              <span className="dsh-lingualab-spacer" />
              <span className="dsh-lingualab-foot-hint" title={t('pickerFooterHint', { name: folderName })}>
                {t('pickerFooterHint', { name: folderName })}
              </span>
              <button
                type="button"
                className="dsh-lingualab-btn"
                onClick={() => {
                  if (place !== null) onUseFolder(place.id, rel)
                }}
                disabled={place === null || savingFolder || !place.readable}
              >
                {t('mediaFolderUse')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** One row of a directory listing. */
function BrowseRow({
  t,
  entry,
  active,
  onHover,
  onEnter,
  onPickFile,
}: {
  readonly t: Translate
  readonly entry: BrowseEntry
  readonly active: boolean
  readonly onHover: () => void
  readonly onEnter: (rel: string) => void
  readonly onPickFile: (rel: string) => void
}) {
  if (entry.type === 'dir') {
    return (
      <button
        type="button"
        className={`dsh-lingualab-pick${active ? ' is-active' : ''}`}
        data-active={active}
        onMouseMove={onHover}
        onClick={() => onEnter(entry.rel)}
      >
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
      <button
        type="button"
        className={`dsh-lingualab-pick${active ? ' is-active' : ''}`}
        data-active={active}
        onMouseMove={onHover}
        onClick={() => onPickFile(entry.rel)}
      >
        <AudioIcon />
        <span className="dsh-lingualab-pick-main">
          <span className="dsh-lingualab-pick-name">{entry.name}</span>
          <span className="dsh-lingualab-pick-sub">
            {entry.subtitle !== null && entry.subtitle.files.length > 0
              ? `${formatBytes(entry.bytes)} · ${entry.subtitle.files.join(' · ')}`
              : formatBytes(entry.bytes)}
          </span>
        </span>
        <span className={`dsh-lingualab-badge is-${hintTone(entry.subtitle)}`}>{hintBadge(t, entry.subtitle)}</span>
      </button>
    )
  }

  return (
    <div className="dsh-lingualab-pick is-inert" aria-disabled>
      <SubtitleIcon />
      <span className="dsh-lingualab-pick-main">
        <span className="dsh-lingualab-pick-name">{entry.name}</span>
      </span>
      <span className="dsh-lingualab-badge">{entry.ext}</span>
    </div>
  )
}
