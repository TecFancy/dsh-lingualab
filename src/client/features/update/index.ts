/** Public API of the update feature: the running version, and whether a newer release exists. */
export { type UpdateStatus, versionLabel } from './lib/update-state.ts'
export { useUpdate, type UpdateState } from './model/useUpdate.ts'
