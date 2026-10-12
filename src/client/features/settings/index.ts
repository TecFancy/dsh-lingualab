/**
 * Public API of the settings feature: the reader's choices about how the page looks (colour theme,
 * light or dark, the size of the sentence on stage), remembered in this browser, and the pure
 * resolution of a theme into the custom properties the page root carries.
 */
export {
  APPEARANCES,
  DEFAULT_THEME,
  THEMES,
  THEME_IDS,
  paletteOf,
  resolveScheme,
  resolveThemeVars,
  type Appearance,
  type Palette,
  type ResolvedTheme,
  type Scheme,
  type ThemeDefinition,
  type ThemeId,
} from './lib/themes.ts'
export {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  STAGE_SIZES,
  parseSettings,
  readSettings,
  useSettings,
  type Settings,
  type SettingsState,
  type StageSize,
} from './model/store.ts'
export { useHostDark } from './model/useHostDark.ts'
