/**
 * What the open-state entity may read from subtitle-choice.
 *
 * FSD's cross-import convention: one entity reads another only through a file named after the
 * reader, so the dependency is declared in one place and Steiger can check it.
 */
export { isAutomatic, sanitizeChoice } from '../model/subtitle-choice.ts'
