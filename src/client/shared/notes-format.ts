/**
 * The notes markdown format, re-exported for the client tree.
 *
 * Same bridge as `protocol.ts`: the format is parsed and written by the host and
 * edited by the panel, so it lives in `src/shared/` and is re-exported here for
 * the FSD tree to import.
 */
export * from '../../shared/notes-format.ts'
