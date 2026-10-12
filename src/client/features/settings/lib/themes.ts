/**
 * The colour themes, as palettes over the host's own tokens.
 *
 * Every colour on the page is read from eleven host tokens with a fallback
 * (`var(--dsw-alias-brand-primary,#0f1115)` and so on; see `styles.ts`). A theme is therefore not
 * a second colour system: it is a value for each of those eleven, set as inline custom properties
 * on the page's root element. Custom properties inherit, so they override the host's values for
 * everything inside the page and for nothing outside it, and the derived `--ll-*` values on the same
 * element resolve against them. The theme 「默认」 in 「跟随 dsh」 mode sets nothing at all, which is
 * exactly the page as it was before themes existed.
 *
 * Each theme has a light and a dark palette. Which one is in effect is the reader's 「明暗」 choice:
 * 「跟随 dsh」 takes whatever the host is showing (see `useHostDark`), the other two force one.
 *
 * The palettes are curated rather than computed: a free colour picker would need contrast checks to
 * stay readable, and eleven hand-tuned values per mode are cheaper than that and easier to review.
 */

/** The themes on offer, in the order the settings drawer lists them. */
export const THEME_IDS = ['dsh', 'ink', 'pine', 'paper', 'dusk', 'contrast'] as const

/** One of {@link THEME_IDS}. */
export type ThemeId = (typeof THEME_IDS)[number]

/** How the theme's light and dark palettes are chosen. */
export const APPEARANCES = ['auto', 'light', 'dark'] as const

/** `auto` follows the host's day and night; the others pin one. */
export type Appearance = (typeof APPEARANCES)[number]

/** Which of a theme's two palettes is showing. */
export type Scheme = 'light' | 'dark'

/** The theme everyone starts with, and the one that sets nothing. */
export const DEFAULT_THEME: ThemeId = 'dsh'

/** The eleven colours of a theme, under short names; {@link TOKEN_OF} says which host token each one is. */
export interface Palette {
  /** `bg-base`: the page. */
  readonly bg: string
  /** `bg-layer-1`: cards, drawers and the right column. */
  readonly l1: string
  /** `bg-layer-2`: inputs. */
  readonly l2: string
  /** `label-primary`: text. */
  readonly label: string
  /** `label-secondary`: quiet text. */
  readonly sec: string
  /** `border-l1`: hairlines. */
  readonly b1: string
  /** `border-l2`: outlines. */
  readonly b2: string
  /** `brand-primary`: the accent. */
  readonly brand: string
  /** `state-success-primary`. */
  readonly success: string
  /** `state-warn-primary`. */
  readonly warn: string
  /** `state-error-primary`. */
  readonly error: string
}

/** One theme: its id and both of its palettes. Names and descriptions are in the locale. */
export interface ThemeDefinition {
  readonly id: ThemeId
  readonly light: Palette
  readonly dark: Palette
}

/** The host token each palette entry overrides. */
export const TOKEN_OF: Readonly<Record<keyof Palette, string>> = {
  bg: '--dsw-alias-bg-base',
  l1: '--dsw-alias-bg-layer-1',
  l2: '--dsw-alias-bg-layer-2',
  label: '--dsw-alias-label-primary',
  sec: '--dsw-alias-label-secondary',
  b1: '--dsw-alias-border-l1',
  b2: '--dsw-alias-border-l2',
  brand: '--dsw-alias-brand-primary',
  success: '--dsw-alias-state-success-primary',
  warn: '--dsw-alias-state-warn-primary',
  error: '--dsw-alias-state-error-primary',
}

/** The default theme, which is also what an id this table does not know falls back to. */
const DSH_THEME: ThemeDefinition = {
  id: 'dsh',
  light: {
    bg: '#ffffff', l1: '#ffffff', l2: '#ffffff', label: '#0f1115', sec: '#61666b',
    b1: 'rgba(0,0,0,0.04)', b2: 'rgba(0,0,0,0.1)', brand: '#0f1115',
    success: '#22c55e', warn: '#f59e0b', error: '#ec1313',
  },
  dark: {
    bg: '#151517', l1: '#232324', l2: '#2c2c2e', label: '#f9fafb', sec: '#cfd3d6',
    b1: 'rgba(255,255,255,0.06)', b2: 'rgba(255,255,255,0.12)', brand: '#f9fafb',
    success: '#22c55e', warn: '#f59e0b', error: '#f25a5a',
  },
}

/** Every theme, with the palettes it paints in light and in dark. */
export const THEMES: readonly ThemeDefinition[] = [
  DSH_THEME,
  {
    id: 'ink',
    light: {
      bg: '#f7f8fb', l1: '#ffffff', l2: '#ffffff', label: '#121826', sec: '#5a6478',
      b1: 'rgba(18,32,74,0.05)', b2: 'rgba(18,32,74,0.12)', brand: '#3651c9',
      success: '#1f9d55', warn: '#e6900a', error: '#d92d2d',
    },
    dark: {
      bg: '#12151d', l1: '#1a1f2a', l2: '#222836', label: '#eef1f8', sec: '#a7b0c2',
      b1: 'rgba(160,180,255,0.07)', b2: 'rgba(160,180,255,0.14)', brand: '#8ea2ff',
      success: '#3ccf7e', warn: '#f5a524', error: '#f26d6d',
    },
  },
  {
    id: 'pine',
    light: {
      bg: '#f6f8f6', l1: '#ffffff', l2: '#ffffff', label: '#14201b', sec: '#56655e',
      b1: 'rgba(20,60,40,0.05)', b2: 'rgba(20,60,40,0.12)', brand: '#23735a',
      success: '#3aa76d', warn: '#e39309', error: '#d0342c',
    },
    dark: {
      bg: '#111613', l1: '#18201c', l2: '#1f2924', label: '#e9f1ec', sec: '#a3b4ab',
      b1: 'rgba(160,230,200,0.06)', b2: 'rgba(160,230,200,0.13)', brand: '#6fcfa6',
      success: '#4ad48a', warn: '#f2a93b', error: '#f07167',
    },
  },
  {
    id: 'paper',
    light: {
      bg: '#f6f1e7', l1: '#fbf8f1', l2: '#fffdf8', label: '#2a241d', sec: '#6a5f52',
      b1: 'rgba(60,40,10,0.06)', b2: 'rgba(60,40,10,0.14)', brand: '#9c4f22',
      success: '#4f9a52', warn: '#d98a0b', error: '#c43b2b',
    },
    dark: {
      bg: '#1a1714', l1: '#23201b', l2: '#2b2721', label: '#eee5d6', sec: '#b8ab97',
      b1: 'rgba(255,230,190,0.06)', b2: 'rgba(255,230,190,0.13)', brand: '#e3a86f',
      success: '#7cc47f', warn: '#f0b13c', error: '#ef7a62',
    },
  },
  {
    id: 'dusk',
    light: {
      bg: '#f8f7fb', l1: '#ffffff', l2: '#ffffff', label: '#1a1726', sec: '#615c74',
      b1: 'rgba(40,20,90,0.05)', b2: 'rgba(40,20,90,0.12)', brand: '#5f4bc4',
      success: '#22a35a', warn: '#e8940c', error: '#d6334a',
    },
    dark: {
      bg: '#16141d', l1: '#1e1b28', l2: '#262232', label: '#f0eef7', sec: '#b3adc7',
      b1: 'rgba(200,180,255,0.07)', b2: 'rgba(200,180,255,0.14)', brand: '#b3a5ff',
      success: '#46cf85', warn: '#f5a83a', error: '#f27088',
    },
  },
  {
    id: 'contrast',
    light: {
      bg: '#ffffff', l1: '#ffffff', l2: '#ffffff', label: '#000000', sec: '#33373c',
      b1: 'rgba(0,0,0,0.18)', b2: 'rgba(0,0,0,0.45)', brand: '#0040d6',
      success: '#00843d', warn: '#b86e00', error: '#c4000f',
    },
    dark: {
      bg: '#000000', l1: '#0d0d0e', l2: '#161618', label: '#ffffff', sec: '#d6d9dd',
      b1: 'rgba(255,255,255,0.22)', b2: 'rgba(255,255,255,0.5)', brand: '#7fa7ff',
      success: '#3ee07f', warn: '#ffc53d', error: '#ff6b6b',
    },
  },
]

/** What the page applies for a theme: the custom properties to set, and the colour scheme they paint. */
export interface ResolvedTheme {
  /** `--dsw-alias-*` custom property to its value, for the page root's inline style. */
  readonly vars: Readonly<Record<string, string>>
  /** The scheme the palette is for, so native controls (a `<select>`, a scrollbar) match it. */
  readonly scheme: Scheme
}

/** The scheme in effect: the reader's pin, or the host's own day and night. */
export function resolveScheme(appearance: Appearance, hostDark: boolean): Scheme {
  if (appearance === 'auto') return hostDark ? 'dark' : 'light'
  return appearance
}

/** One theme's palette for a scheme; an unknown id gets the first theme's. */
export function paletteOf(theme: ThemeId, scheme: Scheme): Palette {
  const found = THEMES.find((entry) => entry.id === theme) ?? DSH_THEME
  return scheme === 'dark' ? found.dark : found.light
}

/**
 * What to set on the page root for the reader's choices.
 *
 * `null` means set nothing: the default theme with the appearance left to the host is the page
 * exactly as the host styles it, with no override for anything to disagree with.
 *
 * @param hostDark - whether the host is showing its dark theme, which only matters for `auto`.
 */
export function resolveThemeVars(theme: ThemeId, appearance: Appearance, hostDark: boolean): ResolvedTheme | null {
  if (theme === DEFAULT_THEME && appearance === 'auto') return null
  const scheme = resolveScheme(appearance, hostDark)
  const palette = paletteOf(theme, scheme)
  const vars: Record<string, string> = {}
  for (const key of Object.keys(TOKEN_OF) as (keyof Palette)[]) vars[TOKEN_OF[key]] = palette[key]
  return { vars, scheme }
}
