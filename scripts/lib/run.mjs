/**
 * One way to run external commands for the release scripts.
 *
 * Two kinds of call exist and the difference is the point of this file. A `read`
 * only looks (git status, gh pr list) and always runs, including under `--dry-run`,
 * because a dry run that guesses at the state is not a check of anything. A
 * `mutate` changes something (push, open a PR, merge, restart a service) and under
 * `--dry-run` it is printed instead of run.
 *
 * Commands are spawned with an argument array, never a shell string. That is what
 * makes them behave the same from Git Bash and PowerShell on Windows, and it keeps
 * a path or a title with spaces or quotes in it from being re-parsed by a shell.
 * `git`, `gh`, `node` and `ssh` are real executables on every platform, so no shell
 * is needed to find them.
 */
import { spawnSync } from 'node:child_process'

/** A command as a person would type it, quoted only for display. */
export function formatCommand(command, args) {
  const show = (part) => (/^[\w@%+=:,./\\<>-]+$/.test(part) ? part : `"${part.replace(/"/g, '\\"')}"`)
  return [command, ...args].map(show).join(' ')
}

/** A runner bound to a working directory and a dry-run flag. */
export function createRunner({ cwd, dryRun, log = console.log }) {
  /** Run to completion and never throw: callers decide what a status means. */
  function read(command, args, options = {}) {
    const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options })
    const spawnFailure = result.error === undefined ? '' : String(result.error.message)
    const stdout = String(result.stdout ?? '')
    return {
      status: result.status ?? 1,
      stdout: stdout.trim(),
      // Untrimmed at the front: `git status --porcelain` starts a line with a space.
      raw: stdout.trimEnd(),
      stderr: `${String(result.stderr ?? '').trim()}${spawnFailure}`.trim(),
    }
  }

  /** Run and return trimmed stdout; throws with the command and its stderr on failure. */
  function out(command, args) {
    const result = read(command, args)
    if (result.status !== 0) {
      throw new Error(`${formatCommand(command, args)} 失败（${result.status}）：${result.stderr || result.stdout}`)
    }
    return result.stdout
  }

  /**
   * Run a command that changes something. Output streams to the terminal unless
   * `capture` is set. Under dry-run it is printed and reported as a success.
   */
  function mutate(command, args, { capture = false } = {}) {
    if (dryRun) {
      log(`  [dry-run] ${formatCommand(command, args)}`)
      return { status: 0, stdout: '', stderr: '', skipped: true }
    }
    log(`  $ ${formatCommand(command, args)}`)
    if (capture) return { ...read(command, args), skipped: false }
    const result = spawnSync(command, args, { cwd, stdio: 'inherit' })
    return { status: result.status ?? 1, stdout: '', stderr: result.error?.message ?? '', skipped: false }
  }

  return { dryRun, read, out, mutate, log }
}
