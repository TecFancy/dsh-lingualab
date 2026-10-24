/**
 * Git, run quiet and bounded.
 *
 * The plugin is installed as a `link:` to a checkout on this machine, so the checkout already holds
 * the credentials and the remote the release check needs. Nothing here writes: `rev-parse`,
 * `status` and `ls-remote` only read. A machine without Git, or a copy that is not a checkout, gets
 * `null` and the caller answers "unknown" instead of failing the page.
 */
import { execFileSync } from 'node:child_process'

/** Run Git in `cwd` and return its stdout; `null` when it cannot run or times out. */
export function runGit(args: readonly string[], cwd: string, timeoutMs: number): string | null {
  try {
    return execFileSync('git', ['-C', cwd, ...args], {
      encoding: 'utf8',
      timeout: timeoutMs,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    return null
  }
}
