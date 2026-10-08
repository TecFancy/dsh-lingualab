/**
 * The cross-half wire contract, re-exported for the client tree.
 *
 * The contract itself lives in `src/shared/` because both halves speak it: the
 * host serves those shapes and the panel renders them. FSD has no place for a
 * module that belongs to two roots, so this file is the single bridge, and the
 * rule that forbids imports from outside the analysed tree is switched off for it
 * alone (see `steiger.config.js`). Everything else in the client imports the
 * contract from here.
 */
export * from '../../shared/protocol.ts'
