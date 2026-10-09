/**
 * The file-name pairing rule, re-exported for the client tree.
 *
 * Same bridge as `protocol.ts`: the host pairs subtitles by name when it scans, and the
 * page pairs a dropped batch by name before sending, so the one rule lives in
 * `src/shared/` and is re-exported here for the FSD tree to import.
 */
export * from '../../shared/stem.ts'
