/** Public API of the library feature: loading an episode, one of its segments, and their cues. */
export { findSegment, nextSegment, segmentLabel, segmentNumber } from './lib/segments.ts'
export { useLibrary, type LibraryState, type SubtitleTracks } from './model/useLibrary.ts'
