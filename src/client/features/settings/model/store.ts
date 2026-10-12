/**
 * The page's settings: the colour theme, whether it follows the host's day and night, and the size
 * of the sentence on stage.
 *
 * They are preferences of the reader about how the page looks, so they live in this browser and
 * nowhere else: `localStorage` under one JSON key, the same place the lead-in is remembered.
 * Nothing goes to the host, which means no route, no profile write and no merge rule, at the cost
 * of a second device starting from the defaults (the drawer says so).
 *
 * Storage can be missing or throw (a private window, blocked site data), and what is stored can be
 * anything a past version or a hand edit left there. So every read and write is guarded, and a
 * value that is not one of the choices falls back to its default on its own, field by field: one
 * bad field does not throw away the others.
 */
import { create } from 'zustand'
import { APPEARANCES, DEFAULT_THEME, THEME_IDS, type Appearance, type ThemeId } from '../lib/themes.ts'

/** How big the English and Chinese lines on stage are: small, medium (the page's own size) and large. */
export const STAGE_SIZES = ['s', 'm', 'l'] as const

/** One of {@link STAGE_SIZES}. */
export type StageSize = (typeof STAGE_SIZES)[number]

/** Where the settings are remembered, per browser. */
export const SETTINGS_KEY = 'dsh-lingualab:settings'

/** The reader's choices. */
export interface Settings {
  readonly theme: ThemeId
  readonly appearance: Appearance
  readonly stageSize: StageSize
}

/** What a browser that has chosen nothing gets: the host's own look, at the page's own size. */
export const DEFAULT_SETTINGS: Settings = { theme: DEFAULT_THEME, appearance: 'auto', stageSize: 'm' }

/** The choice among `choices` that equals `value`, or `fallback` when none does. */
function pick<T extends string>(choices: readonly T[], value: unknown, fallback: T): T {
  return choices.find((choice) => choice === value) ?? fallback
}

/** Read stored text back into settings: anything unreadable, or not one of the choices, is the default. */
export function parseSettings(raw: string | null): Settings {
  let data: unknown = null
  try {
    data = raw === null ? null : JSON.parse(raw)
  } catch {
    // Not JSON: nothing stored is worth keeping, and every field takes its default.
  }
  const record: Readonly<Record<string, unknown>> =
    typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
  return {
    theme: pick(THEME_IDS, record.theme, DEFAULT_SETTINGS.theme),
    appearance: pick(APPEARANCES, record.appearance, DEFAULT_SETTINGS.appearance),
    stageSize: pick(STAGE_SIZES, record.stageSize, DEFAULT_SETTINGS.stageSize),
  }
}

/** The settings this browser stored, or the defaults when there are none (or storage is not there). */
export function readSettings(): Settings {
  try {
    return parseSettings(globalThis.localStorage.getItem(SETTINGS_KEY))
  } catch {
    return DEFAULT_SETTINGS
  }
}

/** Remember the settings; a browser without storage keeps them for this visit only. */
function writeSettings(settings: Settings): void {
  try {
    globalThis.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ theme: settings.theme, appearance: settings.appearance, stageSize: settings.stageSize }),
    )
  } catch {
    // Not remembered, still applied.
  }
}

export interface SettingsState extends Settings {
  setTheme: (theme: ThemeId) => void
  setAppearance: (appearance: Appearance) => void
  setStageSize: (size: StageSize) => void
}

export const useSettings = create<SettingsState>((set, get) => {
  /** Apply a change and remember the result. */
  const change = (patch: Partial<Settings>): void => {
    set(patch)
    writeSettings(get())
  }
  return {
    ...readSettings(),
    setTheme: (theme) => change({ theme: pick(THEME_IDS, theme, get().theme) }),
    setAppearance: (appearance) => change({ appearance: pick(APPEARANCES, appearance, get().appearance) }),
    setStageSize: (size) => change({ stageSize: pick(STAGE_SIZES, size, get().stageSize) }),
  }
})
