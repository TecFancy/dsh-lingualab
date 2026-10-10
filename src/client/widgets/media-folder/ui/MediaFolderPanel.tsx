/**
 * The media folder setting, in its own layer and never on the page you practise on.
 *
 * It is reached from the one quiet line at the bottom of the home page, because it is a
 * setting you touch twice a month. It used to ask for an absolute path with a candidate
 * list beside it; now the primary way in is 「浏览」, where you walk to the folder and
 * click 「用作媒体库」. The typed path survives as the fallback for a mount point that no
 * workspace contains.
 *
 * It no longer appears inline on an empty library: an empty library is answered by the
 * drop zone, which does not need the reader to know what a media folder is.
 */
import type { Translate } from '../../../context.ts'
import type { LibraryConfigState } from '../../../features/library-config/index.ts'
import { CloseIcon } from '../../../shared/ui/icons.tsx'

export interface MediaFolderPanelProps {
  readonly t: Translate
  readonly config: LibraryConfigState
  /** Called after a save lands, so the library can be re-read. */
  readonly onSaved: () => void
  /** Dismisses the layer without saving. */
  readonly onClose: () => void
}

/** How the source of the current path is described. */
function sourceKey(source: 'config' | 'workspace' | 'none'): string {
  if (source === 'config') return 'mediaFolderSourceConfig'
  return source === 'workspace' ? 'mediaFolderSourceWorkspace' : 'mediaFolderSourceNone'
}

/** The folder form: what is in effect, how to walk to a new one, and the typed fallback. */
export function MediaFolderPanel({ t, config, onSaved, onClose }: MediaFolderPanelProps) {
  const current = config.payload

  const onSave = (value?: string): void => {
    void (async () => {
      if (await config.save(value)) onSaved()
    })()
  }

  const body = (
    <>
      <div className="dsh-lingualab-hint">{t('mediaFolderHint')}</div>

      <div className="dsh-lingualab-actions" style={{ marginTop: 8 }}>
        <span className="dsh-lingualab-hint">{t('mediaFolderCurrent')}</span>
        <code className="dsh-lingualab-path">{current?.root ?? t('mediaFolderSourceNone')}</code>
        <span className="dsh-lingualab-counter">{t(sourceKey(current?.source ?? 'none'))}</span>
      </div>

      {config.error !== null ? <div className="dsh-lingualab-error">{config.error}</div> : null}

      <div className="dsh-lingualab-hint">{t('mediaFolderBrowseHint')}</div>

      <div className="dsh-lingualab-actions" style={{ marginTop: 8 }}>
        <input
          className="dsh-lingualab-input"
          style={{ flex: 1, minWidth: 200 }}
          value={config.draft}
          placeholder={t('mediaFolderPlaceholder')}
          onChange={(event) => config.setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onSave()
            event.stopPropagation()
          }}
        />
        <button
          type="button"
          className="dsh-lingualab-btn is-primary"
          onClick={() => onSave()}
          disabled={config.saving}
        >
          {config.saving ? t('mediaFolderSaving') : t('mediaFolderSave')}
        </button>
      </div>

      {current !== null && current.candidates.length > 0
        ? current.candidates.map((candidate) => (
            <button
              key={candidate.path}
              type="button"
              className="dsh-lingualab-pick"
              onClick={() => config.setDraft(candidate.path)}
            >
              <span className="dsh-lingualab-pick-main">
                <span className="dsh-lingualab-pick-name dsh-lingualab-path">{candidate.path}</span>
                <span className="dsh-lingualab-pick-sub">
                  {candidate.label} ·{' '}
                  {!candidate.exists
                    ? t('mediaFolderMissing')
                    : candidate.episodes === 0
                      ? t('mediaFolderEmpty')
                      : `${String(candidate.episodes ?? 0)} ${t('mediaFolderCount')}`}
                </span>
              </span>
            </button>
          ))
        : null}

      {current !== null && !current.writable ? (
        <div className="dsh-lingualab-warn">{t('mediaFolderReadOnly')}</div>
      ) : null}
    </>
  )

  return (
    <div className="dsh-lingualab-mask" onClick={onClose}>
      <div className="dsh-lingualab-modal" onClick={(event) => event.stopPropagation()}>
        <div className="dsh-lingualab-modal-head">
          <span className="dsh-lingualab-modal-title">{t('mediaFolder')}</span>
          <span className="dsh-lingualab-spacer" />
          <button type="button" className="dsh-lingualab-icon-btn" onClick={onClose} title={t('close')}>
            <CloseIcon />
          </button>
        </div>
        <div className="dsh-lingualab-modal-body">{body}</div>
      </div>
    </div>
  )
}
