/**
 * Public API of the config segment: the plugin's settings as the routes read them: the workspaces, the settings service, and
 * where the library root resolves.
 */
export {
  configPayload,
  describeConfig,
  LIBRARY_SUBPATH,
  resolveRoot,
  settingsOf,
  validateRoot,
  workspacesOf,
} from './config.ts'
