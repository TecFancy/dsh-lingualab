/**
 * Public API of the fs segment: the checks a path passes before anything reads it or writes to it.
 */
export { forbiddenReason, isInside, normalizeRel, parentOfRel, probeReadable, realPathOf } from './paths.ts'
