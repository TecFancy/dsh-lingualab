/**
 * The settings drawer: how the page looks, and the one playback habit that is a preference.
 *
 * It is the five-steps drawer's sibling and borrows its whole manner: it slides in from the right
 * over a scrim the page draws, slides out as it came (which is why it outlives `open` for a moment),
 * is inert while it leaves, and gives the keyboard back to the page when it closes. Opening it does
 * not pause the audio. Two things differ. It is for both views of the page, so the page renders it
 * outside the practice view; and keys pressed inside it stay inside it, because it holds radio groups
 * that read the arrow keys, a `<select>`, and a page whose shortcuts must not fire behind them.
 * Escape closes it from in here and, when focus is still on the page, from the page.
 *
 * Everything in it applies at once and is remembered in this browser (see the settings feature), so
 * there is no save button. The theme cards are painted in each theme's own colours for the mode in
 * effect, so a card shows what the page would look like and not just a name. The lead-in is the
 * media player's own setting, the same one the 「更多」 menu holds; it is here because it is a habit
 * and not a gesture.
 */
import { useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { LEAD_IN_CHOICES, useMediaPlayer } from '../../../features/media-player/index.ts'
import {
  APPEARANCES,
  STAGE_SIZES,
  THEME_IDS,
  paletteOf,
  resolveScheme,
  useHostDark,
  useSettings,
  type Appearance,
  type Palette,
  type StageSize,
  type ThemeId,
} from '../../../features/settings/index.ts'
import { usePresence } from '../../../shared/lib/usePresence.ts'
import { CheckIcon, CloseIcon } from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'
import { RadioGroup } from './RadioGroup.tsx'

/**
 * How long the drawer takes to leave; the stylesheet's slide-out runs for the same time. The page
 * keeps the scrim behind it for as long.
 */
export const SETTINGS_EXIT_MS = 200

/** The dictionary key of each choice's label. */
const APPEARANCE_KEYS: Readonly<Record<Appearance, string>> = {
  auto: 'settingsAppearanceAuto',
  light: 'settingsAppearanceLight',
  dark: 'settingsAppearanceDark',
}

const STAGE_SIZE_KEYS: Readonly<Record<StageSize, string>> = {
  s: 'settingsStageSmall',
  m: 'settingsStageMedium',
  l: 'settingsStageLarge',
}

const THEME_NAME_KEYS: Readonly<Record<ThemeId, string>> = {
  dsh: 'themeDshName',
  ink: 'themeInkName',
  pine: 'themePineName',
  paper: 'themePaperName',
  dusk: 'themeDuskName',
  contrast: 'themeContrastName',
}

const THEME_DESC_KEYS: Readonly<Record<ThemeId, string>> = {
  dsh: 'themeDshDesc',
  ink: 'themeInkDesc',
  pine: 'themePineDesc',
  paper: 'themePaperDesc',
  dusk: 'themeDuskDesc',
  contrast: 'themeContrastDesc',
}

/** A theme in miniature, painted in its own colours: a page with a line of text, a quiet line and a progress bar. */
function Preview({ palette }: { readonly palette: Palette }) {
  return (
    <span
      className="dsh-lingualab-theme-preview"
      aria-hidden
      style={{ background: palette.bg, borderColor: palette.b2 }}
    >
      <span className="dsh-lingualab-theme-line">
        <span className="dsh-lingualab-theme-dot" style={{ background: palette.brand }} />
        <span className="dsh-lingualab-theme-bar is-long" style={{ background: palette.label }} />
      </span>
      <span className="dsh-lingualab-theme-bar is-short" style={{ background: palette.sec }} />
      <span className="dsh-lingualab-theme-track" style={{ background: palette.b2 }}>
        <span style={{ background: palette.brand }} />
      </span>
    </span>
  )
}

export interface SettingsPanelProps {
  readonly t: Translate
  /** The drawer's open state, owned by the page so Escape and the other drawer can close it. */
  readonly open: boolean
  readonly onClose: () => void
}

/** The drawer, mounted from the moment it opens until it has finished leaving. */
export function SettingsPanel({ t, open, onClose }: SettingsPanelProps) {
  const { mounted } = usePresence(open, SETTINGS_EXIT_MS)
  const drawer = useRef<HTMLElement>(null)
  const theme = useSettings((state) => state.theme)
  const appearance = useSettings((state) => state.appearance)
  const stageSize = useSettings((state) => state.stageSize)
  const setTheme = useSettings((state) => state.setTheme)
  const setAppearance = useSettings((state) => state.setAppearance)
  const setStageSize = useSettings((state) => state.setStageSize)
  const leadIn = useMediaPlayer((state) => state.leadIn)
  const hostDark = useHostDark()
  /** The cards show the palette that is in effect, so a card is what choosing it would give. */
  const scheme = resolveScheme(appearance, hostDark)

  // The keyboard comes in with the drawer, onto the drawer itself: Escape works at once and Tab
  // goes into its controls from the top.
  useEffect(() => {
    if (open) drawer.current?.focus({ preventScroll: true })
  }, [open])

  // Closing with a control of the drawer focused would drop focus to the document, and the page's
  // shortcuts with it; it goes back to the page, which is where the keys are read.
  useEffect(() => {
    if (open) return
    const element = drawer.current
    if (element === null || !element.contains(document.activeElement)) return
    element.closest<HTMLElement>('.dsh-lingualab-page')?.focus({ preventScroll: true })
  }, [open])

  if (!mounted) return null

  // `inert` is an attribute React 18 does not know, so it goes in as one: while the drawer leaves,
  // its controls are out of the tab order and the hit test.
  const inertProps: Record<string, string> = open ? {} : { inert: '' }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
    // Nothing typed in here is the page's: not the space bar on a button, not an arrow in a group.
    event.stopPropagation()
  }

  return (
    <aside
      ref={drawer}
      className={`dsh-lingualab-popover is-settings${open ? '' : ' is-leaving'}`}
      role="dialog"
      aria-label={t('settingsTitle')}
      aria-hidden={!open}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      {...inertProps}
    >
      <div className="dsh-lingualab-drawer-head">
        <span className="dsh-lingualab-drawer-titles">
          <span className="dsh-lingualab-drawer-title">{t('settingsTitle')}</span>
          <span className="dsh-lingualab-drawer-sub">{t('settingsSub')}</span>
        </span>
        <button
          type="button"
          className="dsh-lingualab-icon-btn"
          onClick={onClose}
          title={t('close')}
          aria-label={t('close')}
        >
          <CloseIcon size={16} />
        </button>
      </div>

      <div className="dsh-lingualab-settings-body">
        <h3 className="dsh-lingualab-settings-label">{t('settingsAppearance')}</h3>
        <div className="dsh-lingualab-setting-row">
          <span className="dsh-lingualab-setting-name">{t('settingsScheme')}</span>
          <RadioGroup
            label={t('settingsScheme')}
            className="dsh-lingualab-segmented"
            options={APPEARANCES}
            value={appearance}
            onChange={setAppearance}
            render={(option) => t(APPEARANCE_KEYS[option])}
          />
        </div>
        <div className="dsh-lingualab-setting-block">
          <span className="dsh-lingualab-setting-name">{t('settingsTheme')}</span>
          <RadioGroup
            label={t('settingsTheme')}
            className="dsh-lingualab-theme-grid"
            optionClassName="dsh-lingualab-theme"
            options={THEME_IDS}
            value={theme}
            onChange={setTheme}
            render={(option, checked) => (
              <>
                <Preview palette={paletteOf(option, scheme)} />
                <span className="dsh-lingualab-theme-name">
                  {t(THEME_NAME_KEYS[option])}
                  {checked ? <CheckIcon size={14} /> : null}
                </span>
                <span className="dsh-lingualab-theme-desc">{t(THEME_DESC_KEYS[option])}</span>
              </>
            )}
          />
        </div>

        <h3 className="dsh-lingualab-settings-label">{t('settingsSubtitles')}</h3>
        <div className="dsh-lingualab-setting-row">
          <span className="dsh-lingualab-setting-name">{t('settingsStageSize')}</span>
          <RadioGroup
            label={t('settingsStageSize')}
            className="dsh-lingualab-segmented"
            options={STAGE_SIZES}
            value={stageSize}
            onChange={setStageSize}
            render={(option) => t(STAGE_SIZE_KEYS[option])}
          />
        </div>

        <h3 className="dsh-lingualab-settings-label">{t('settingsPlayback')}</h3>
        <label className="dsh-lingualab-setting-row">
          <span className="dsh-lingualab-setting-text">
            <span className="dsh-lingualab-setting-name">{t('leadIn')}</span>
            <span className="dsh-lingualab-setting-hint">{t('settingsLeadInHint')}</span>
          </span>
          <select
            className="dsh-lingualab-select"
            value={String(leadIn)}
            onChange={(event) => useMediaPlayer.getState().setLeadIn(Number(event.target.value))}
          >
            {LEAD_IN_CHOICES.map((seconds) => (
              <option key={seconds} value={seconds}>
                {seconds === 0 ? t('leadInOff') : `${String(seconds)} s`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <footer className="dsh-lingualab-drawer-foot">{t('settingsFootnote')}</footer>
    </aside>
  )
}
