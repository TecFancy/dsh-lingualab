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
export { fetchCues } from './api/fetch-cues.ts'
export { decodeSubtitleText, stripStyleTags } from './lib/decode.ts'
export { mergeBilingual } from './lib/merge.ts'
export { parseLRC, parseSRT, parseSubtitle, parseVTT } from './lib/parse.ts'
export { findActiveCue, hasCjk, orderCueLines, visibleCueLines } from './lib/lines.ts'
export { splitCue } from './lib/split.ts'
export { tokenizeEnglish, type EnglishToken } from './lib/tokenize.ts'
