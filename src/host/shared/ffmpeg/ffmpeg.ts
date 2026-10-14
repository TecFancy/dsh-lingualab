/**
 * Finding `ffmpeg` and `ffprobe`, and starting them.
 *
 * Both belong to the host machine, not to this plugin, and both are optional: without them a video
 * that plays as it is still plays, and one that needs preparing says so, with the command that
 * installs them. They are looked for in the optional `ffmpegPath` config field (a folder holding both,
 * or the path of either binary), and otherwise on `PATH`.
 *
 * A process is started with an argument list and no shell, on paths the host resolved itself:
 * nothing from the browser is ever part of a command line. The search and the spawn are both
 * injectable so the job logic and its tests need no real binary.
 */
import { spawn } from 'node:child_process'
import { statSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import type { Readable } from 'node:stream'

/** The two binaries, as absolute paths. */
export interface Binaries {
  readonly ffmpeg: string
  readonly ffprobe: string
}

/** What the search needs to know about the machine; injectable for tests. */
export interface FindEnv {
  readonly platform: NodeJS.Platform
  /** The `PATH` variable's value. */
  readonly path: string
  readonly isFile: (path: string) => boolean
  readonly isDirectory: (path: string) => boolean
}

/** The real machine. */
export function realEnv(): FindEnv {
  const kind = (path: string): 'file' | 'directory' | null => {
    try {
      const stats = statSync(path)
      return stats.isDirectory() ? 'directory' : stats.isFile() ? 'file' : null
    } catch {
      return null
    }
  }
  return {
    platform: process.platform,
    path: process.env.PATH ?? process.env.Path ?? '',
    isFile: (path) => kind(path) === 'file',
    isDirectory: (path) => kind(path) === 'directory',
  }
}

/** The binary's file name on a platform: Windows adds `.exe`, which is also the only form it can start without a shell. */
function binaryName(name: 'ffmpeg' | 'ffprobe', platform: NodeJS.Platform): string {
  return platform === 'win32' ? `${name}.exe` : name
}

/** The pair in one folder, when both are there. */
function inFolder(folder: string, env: FindEnv): Binaries | null {
  const ffmpeg = join(folder, binaryName('ffmpeg', env.platform))
  const ffprobe = join(folder, binaryName('ffprobe', env.platform))
  return env.isFile(ffmpeg) && env.isFile(ffprobe) ? { ffmpeg, ffprobe } : null
}

/**
 * Find the two binaries.
 *
 * A configured value is the only place looked in: a path that is wrong is reported as not found,
 * rather than quietly falling back to whatever `PATH` holds, because the reader asked for that one.
 * @param configured - the \`ffmpegPath\` config value; empty means "look on PATH".
 * @param env - the machine, for tests.
 * @returns the binaries, or \`null\` when they are not there.
 */
export function findBinaries(configured: string, env: FindEnv = realEnv()): Binaries | null {
  const wanted = configured.trim()
  if (wanted.length > 0) {
    if (env.isDirectory(wanted)) return inFolder(wanted, env) ?? inFolder(join(wanted, 'bin'), env)
    if (!env.isFile(wanted)) return null
    const name = basename(wanted).toLowerCase()
    if (!name.startsWith('ffmpeg') && !name.startsWith('ffprobe')) return null
    return inFolder(dirname(wanted), env)
  }
  for (const folder of env.path.split(env.platform === 'win32' ? ';' : ':')) {
    if (folder.trim().length === 0) continue
    const found = inFolder(folder.replace(/^"|"$/g, ''), env)
    if (found !== null) return found
  }
  return null
}

/** The command that installs `ffmpeg` on this kind of machine, for the card that says it is missing. */
export function installCommandFor(platform: NodeJS.Platform): string {
  if (platform === 'win32') return 'winget install Gyan.FFmpeg'
  if (platform === 'darwin') return 'brew install ffmpeg'
  return 'sudo apt install ffmpeg'
}

/** The part of a child process this plugin uses; a fake in tests. */
export interface Child {
  /** The process id, when it started; a test's fake has none. */
  readonly pid?: number | undefined
  readonly stdout: Readable | null
  readonly stderr: Readable | null
  kill: () => void
  on: ((event: 'close', listener: (code: number | null) => void) => unknown) &
    ((event: 'error', listener: (error: Error) => void) => unknown)
}

/** Start a process with an argument list. */
export type Spawn = (command: string, args: readonly string[]) => Child

/** The real thing: no shell, no console window, stdin closed. */
export const realSpawn: Spawn = (command, args) =>
  spawn(command, [...args], { shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })

/** How long a probe may take before it is given up on. */
const PROBE_TIMEOUT_MS = 30_000

/**
 * Run a process to its end and collect what it printed.
 * @returns stdout on success; \`null\` when the process failed, could not start or ran too long.
 */
export function runToEnd(spawnFn: Spawn, command: string, args: readonly string[]): Promise<string | null> {
  return new Promise((resolve) => {
    let child: Child
    try {
      child = spawnFn(command, args)
    } catch {
      resolve(null)
      return
    }
    let out = ''
    let settled = false
    const finish = (value: string | null): void => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(value)
    }
    const timer = setTimeout(() => {
      child.kill()
      finish(null)
    }, PROBE_TIMEOUT_MS)
    child.stdout?.on('data', (chunk: Buffer | string) => {
      out += String(chunk)
    })
    // Drained so a chatty process cannot stall on a full pipe; the text itself is of no use.
    child.stderr?.on('data', () => undefined)
    child.on('error', () => finish(null))
    child.on('close', (code) => finish(code === 0 ? out : null))
  })
}
