/**
 * The version this host half is running as, read once when it loads.
 *
 * The manifest on disk is not the answer on its own: after a pull but before a restart the checkout
 * says one version and the process still runs the other. Reading it here, at load, gives the page a
 * label that matches the code answering its requests, and the commit hash tells apart two builds
 * that share a version number.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { PluginVersionInfo } from '../../../../shared/protocol.ts'
import { runGit } from './git.ts'

/** How long one Git call may take; a slow disk must not hold up the host's load. */
const GIT_TIMEOUT_MS = 2000

/** What the reader needs; the tests supply their own instead of touching the disk and Git. */
export interface PluginInfoDeps {
  readonly readFile?: (path: string) => string
  /** Run Git in `cwd`; `null` when it cannot answer. */
  readonly git?: (args: readonly string[], cwd: string) => string | null
}

/** Read the running plugin's version, short commit and dirty flag. Never throws. */
export function readPluginInfo(root: string, deps: PluginInfoDeps = {}): PluginVersionInfo {
  const read = deps.readFile ?? ((path: string) => readFileSync(path, 'utf8'))
  const git = deps.git ?? ((args: readonly string[], cwd: string) => runGit(args, cwd, GIT_TIMEOUT_MS))
  return {
    version: manifestVersion(read, join(root, 'package.json')),
    commit: trimmed(git(['rev-parse', '--short=7', 'HEAD'], root)),
    dirty: trimmed(git(['status', '--porcelain'], root)) !== null,
  }
}

/** The manifest's `version`, or `''` when the file is missing or is not a manifest. */
function manifestVersion(read: (path: string) => string, path: string): string {
  try {
    const manifest = JSON.parse(read(path)) as { version?: unknown }
    return typeof manifest.version === 'string' ? manifest.version : ''
  } catch {
    return ''
  }
}

function trimmed(value: string | null): string | null {
  const text = value?.trim() ?? ''
  return text.length === 0 ? null : text
}
