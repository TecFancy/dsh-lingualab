/**
 * Public API of the cue entity: what the panels are allowed to import.
 *
 * FSD's slice rule in one line — the parsers, the line ordering and the types
 * are reachable from here, and nothing outside this folder reaches past it.
 */
export type { Cue, CueLine, SubtitleZhMode } from './model/types.ts'
export {
  DEFAULT_SUBTITLE_ZH_MODE,
  SUBTITLE_ZH_MODES,
  isSubtitleZhMode,
} from './model/types.ts'
export { decodeSubtitleText, stripStyleTags } from './lib/decode.ts'
export { parseLRC, parseSRT, parseSubtitle, parseVTT } from './lib/parse.ts'
export { findActiveCue, hasCjk, orderCueLines, visibleCueLines } from './lib/lines.ts'
