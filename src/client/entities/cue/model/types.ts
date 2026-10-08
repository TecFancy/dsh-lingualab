/**
 * Subtitle data model.
 *
 * Ported from the repealed `TecFancy/repeater` web app, where these shapes had
 * already survived a year of real subtitle files. The only change is that the
 * cue type now lives beside its parsers instead of in a separate FSD entity.
 */

/** One subtitle cue: a time range and its text, which may be bilingual. */
export interface Cue {
  /** Seconds from the start of the episode. */
  readonly start: number
  /** Seconds; the panel loops between `start` and `end`. */
  readonly end: number
  /** The cue text. Bilingual cues carry both languages in one string, one per line. */
  readonly text: string
}

/** One rendered line of a cue, after the languages have been separated. */
export interface CueLine {
  readonly text: string
  /** True for the Chinese line of a bilingual cue, which the panel dims. */
  readonly secondary: boolean
}

/**
 * How much Chinese to show.
 *
 * `dim` is the default because the study method is intensive listening: the
 * Chinese line stays available as a reference but is never the thing being read.
 */
export type SubtitleZhMode = 'always' | 'dim' | 'active-only' | 'hidden'

/** Every mode, in the order a settings control should offer them. */
export const SUBTITLE_ZH_MODES: readonly SubtitleZhMode[] = ['always', 'dim', 'active-only', 'hidden']

/** The mode the panel opens with. */
export const DEFAULT_SUBTITLE_ZH_MODE: SubtitleZhMode = 'dim'

/** Narrow an unknown value — a stored setting, a query param — to a mode. */
export function isSubtitleZhMode(value: unknown): value is SubtitleZhMode {
  return typeof value === 'string' && (SUBTITLE_ZH_MODES as readonly string[]).includes(value)
}
