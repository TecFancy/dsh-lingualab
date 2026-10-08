/**
 * The media folder card.
 *
 * It exists because the config alone cannot be set from the page: with no
 * `libraryRoot`, the plugin opens on an empty library, and the only way out used to
 * be editing the profile's patch file by hand. So the card shows what is in effect,
 * offers the folders that look like a library on this machine, and accepts a typed
 * path.
 *
 * The reason a path was refused is rendered next to the input rather than in an
 * alert: the reader is typing, and the answer belongs where they are looking.
 */
import type { Translate } from '../../../context.ts'
import type { LibraryConfigState } from '../../../features/library-config/index.ts'

export interface MediaFolderPanelProps {
  readonly t: Translate
  readonly config: LibraryConfigState
  /** Called after a save lands, so the library can be re-read. */
  readonly onSaved: () => void
}

/** How the source of the current path is described. */
function sourceKey(source: 'config' | 'workspace' | 'none'): string {
  if (source === 'config') return 'mediaFolderSourceConfig'
  return source === 'workspace' ? 'mediaFolderSourceWorkspace' : 'mediaFolderSourceNone'
}

/** The folder card. */
export function MediaFolderPanel({ t, config, onSaved }: MediaFolderPanelProps) {
  const current = config.payload

  const onSave = (value?: string): void => {
    void (async () => {
      if (await config.save(value)) onSaved()
    })()
  }

  return (
    <div className="dsh-lingualab-card">
      <h2>{t('mediaFolder')}</h2>
      <div className="dsh-lingualab-hint">{t('mediaFolderHint')}</div>

      <div className="dsh-lingualab-folder-row">
        <span className="dsh-lingualab-hint">{t('mediaFolderCurrent')}</span>
        <code className="dsh-lingualab-path">{current?.root ?? t('mediaFolderSourceNone')}</code>
        <span className="dsh-lingualab-counter">{t(sourceKey(current?.source ?? 'none'))}</span>
      </div>

      {config.error !== null ? <div className="dsh-lingualab-warn">{config.error}</div> : null}

      <div className="dsh-lingualab-actions">
        <input
          className="dsh-lingualab-input"
          value={config.draft}
          placeholder={t('mediaFolderPlaceholder')}
          onChange={(event) => config.setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onSave()
          }}
        />
        <button type="button" className="dsh-lingualab-btn" onClick={() => onSave()} disabled={config.saving}>
          {config.saving ? t('mediaFolderSaving') : t('mediaFolderSave')}
        </button>
      </div>

      {config.payload !== null && config.payload.candidates.length > 0 ? (
        <div className="dsh-lingualab-candidates">
          {config.payload.candidates.map((candidate) => (
            <div className="dsh-lingualab-candidate" key={candidate.path}>
              <div className="dsh-lingualab-candidate-main">
                <div className="dsh-lingualab-path">{candidate.path}</div>
                <div className="dsh-lingualab-hint">
                  {candidate.label} ·{' '}
                  {!candidate.exists
                    ? t('mediaFolderMissing')
                    : candidate.episodes === 0
                      ? t('mediaFolderEmpty')
                      : `${String(candidate.episodes ?? 0)} ${t('mediaFolderCount')}`}
                </div>
              </div>
              <button
                type="button"
                className="dsh-lingualab-btn"
                onClick={() => onSave(candidate.path)}
                disabled={config.saving || !candidate.exists}
              >
                {t('mediaFolderUse')}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {config.payload !== null && !config.payload.writable ? (
        <div className="dsh-lingualab-warn">{t('mediaFolderReadOnly')}</div>
      ) : null}
    </div>
  )
}
