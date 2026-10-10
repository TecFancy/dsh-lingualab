/**
 * The progress merge rules, re-exported for the client tree.
 *
 * Same bridge as `protocol.ts`: the host merges what it stores and the page merges what it
 * caches, by one rule, so the rule lives in `src/shared/` and is re-exported here for the
 * FSD tree to import.
 */
export * from '../../shared/progress.ts'
