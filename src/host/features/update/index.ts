/** Public API of the update feature: the running version, and whether a newer release exists. */
export { updateRoute } from './api/update.route.ts'
export { readPluginInfo } from './model/plugin-info.ts'
export { createUpdateChecker, type UpdateChecker } from './model/update-check.ts'
