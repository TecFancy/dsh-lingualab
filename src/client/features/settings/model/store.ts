/**
 * The page's settings: the colour theme, whether it follows the host's day and night, the size of the
 * sentence on stage, how the Chinese lines are shown and how the video's picture is.
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
import { DEFAULT_SUBTITLE_ZH_MODE, SUBTITLE_ZH_MODES, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import {
  DEFAULT_PICTURE,
  PICTURES,
  choose,
  endBlind,
  nextPicture,
  startBlind,
  type Picture,
  type PictureState,
} from '../lib/picture.ts'
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
  /** 「中文显示」: how the Chinese lines are shown, on stage and in the subtitle list. */
  readonly zhMode: SubtitleZhMode
  /** How the video's picture is shown; it only matters for a segment that has a playable video. */
  readonly picture: Picture
}

/** What a browser that has chosen nothing gets: the host's own look, at the page's own size, the picture above the sentence. */
export const DEFAULT_SETTINGS: Settings = {
  theme: DEFAULT_THEME,
  appearance: 'auto',
  stageSize: 'm',
  zhMode: DEFAULT_SUBTITLE_ZH_MODE,
  picture: DEFAULT_PICTURE,
}

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
    zhMode: pick(SUBTITLE_ZH_MODES, record.zhMode, DEFAULT_SETTINGS.zhMode),
    picture: pick(PICTURES, record.picture, DEFAULT_SETTINGS.picture),
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
      JSON.stringify({
        theme: settings.theme,
        appearance: settings.appearance,
        stageSize: settings.stageSize,
        zhMode: settings.zhMode,
        picture: settings.picture,
      }),
    )
  } catch {
    // Not remembered, still applied.
  }
}

export interface SettingsState extends Settings {
  /**
   * What the five steps will put back when the blind-watch timer stops, or `null`. Not a setting: it lives
   * for this visit only and is not remembered (see `lib/picture.ts`).
   */
  readonly pictureRestore: Picture | null
  setTheme: (theme: ThemeId) => void
  setAppearance: (appearance: Appearance) => void
  setStageSize: (size: StageSize) => void
  /** 「中文显示」 and its shortcut. */
  setZhMode: (mode: SubtitleZhMode) => void
  /** The reader chose a picture state (the button, the notice's 「撤销」): it is kept, and wins over the steps. */
  setPicture: (picture: Picture) => void
  /** `V`: the next state. */
  cyclePicture: () => void
  /** The blind-watch timer started. Returns whether the picture was switched, which is when the notice is shown. */
  blindStarted: () => boolean
  /** The blind-watch timer stopped, or its step was marked done. */
  blindEnded: () => void
}

export const useSettings = create<SettingsState>((set, get) => {
  /** Apply a change and remember the result. */
  const change = (patch: Partial<Settings>): void => {
    set(patch)
    writeSettings(get())
  }
  /** The picture state as the pure rules see it. */
  const pictureOf = (): PictureState => ({ picture: get().picture, restore: get().pictureRestore })
  /** Apply a picture state: the picture is remembered, the restore is not. */
  const applyPicture = (state: PictureState): void => {
    set({ picture: state.picture, pictureRestore: state.restore })
    writeSettings(get())
  }
  return {
    ...readSettings(),
    pictureRestore: null,
    setTheme: (theme) => change({ theme: pick(THEME_IDS, theme, get().theme) }),
    setAppearance: (appearance) => change({ appearance: pick(APPEARANCES, appearance, get().appearance) }),
    setStageSize: (size) => change({ stageSize: pick(STAGE_SIZES, size, get().stageSize) }),
    setZhMode: (mode) => change({ zhMode: pick(SUBTITLE_ZH_MODES, mode, get().zhMode) }),
    setPicture: (picture) => applyPicture(choose(pick(PICTURES, picture, get().picture))),
    cyclePicture: () => applyPicture(choose(nextPicture(get().picture))),
    blindStarted: () => {
      const started = startBlind(pictureOf())
      if (started.switched) applyPicture(started.state)
      return started.switched
    },
    blindEnded: () => {
      const before = pictureOf()
      const after = endBlind(before)
      if (after !== before) applyPicture(after)
    },
  }
})
