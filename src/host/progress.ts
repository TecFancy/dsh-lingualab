/**
 * The host's copy of the reader's progress: where each episode was left, and which of the
 * five steps are ticked.
 *
 * Notes already live on the host, in the library folder, so they follow the reader anywhere
 * the folder goes. Positions and ticks used to live only in one browser's `localStorage`,
 * which meant a second device, a private window or a cleared cache started from nothing.
 * This is the shared copy, and it sits where the notes sit: one hidden JSON file at the
 * library root. Two consequences are the point of putting it there:
 *
 *   · every browser that opens this plugin sees the same progress, because they all ask the
 *     same host;
 *   · a library folder that is itself synced (a cloud drive, a git checkout, rsync) carries
 *     the progress to another machine together with the audio and `notes.md`.
 *
 * The file name starts with a dot, so the library scan and the picker both skip it.
 *
 * Writes go through a temporary file and a rename, so a crash mid-write leaves the old file
 * rather than half of a new one. The merge rule (newest `updatedAt` per key wins) lives in
 * `src/shared/progress.ts` because the browser applies the same rule to its cache.
 */
import { existsSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { EMPTY_PROGRESS, mergeProgress, sameProgress, sanitizeProgress } from '../shared/progress.ts'
import { PROGRESS_FILE, type ProgressTable } from '../shared/protocol.ts'

/** Where the library's progress file is. */
export function progressPath(root: string): string {
  return join(root, PROGRESS_FILE)
}

/** The result of reading the file: the table, or the reason there is none to be had. */
export interface ProgressRead {
  readonly ok: boolean
  readonly reason: string | null
  readonly table: ProgressTable
}

/** Whether the library root is a folder this plugin can keep a file in. */
function rootUsable(root: string): boolean {
  if (root.trim().length === 0) return false
  try {
    return existsSync(root) && statSync(root).isDirectory()
  } catch {
    return false
  }
}

/**
 * Read the library's progress. A missing file is an empty table; an unreadable or corrupt
 * one is too, because a bookmark file must never take the page down. Only a missing library
 * is reported as a problem.
 */
export function readProgressFile(root: string, now = Date.now()): ProgressRead {
  if (!rootUsable(root)) return { ok: false, reason: '媒体目录还没配置或不存在，进度只能先存在浏览器里', table: EMPTY_PROGRESS }
  const path = progressPath(root)
  if (!existsSync(path)) return { ok: true, reason: null, table: EMPTY_PROGRESS }
  try {
    return { ok: true, reason: null, table: sanitizeProgress(JSON.parse(readFileSync(path, 'utf8')), now) }
  } catch {
    return { ok: true, reason: null, table: EMPTY_PROGRESS }
  }
}

/** Write the table out with a fixed field order, so a diff of the file stays readable. */
export function serializeProgress(table: ProgressTable): string {
  return `${JSON.stringify({ version: 1, progress: table.progress, steps: table.steps }, null, 1)}\n`
}

/** Replace the file through a temporary sibling, leaving the old one if anything fails. */
function writeAtomically(path: string, text: string): void {
  const temporary = `${path}.${String(process.pid)}.tmp`
  try {
    writeFileSync(temporary, text, 'utf8')
    renameSync(temporary, path)
  } catch (error) {
    rmSync(temporary, { force: true })
    throw error
  }
}

/**
 * Fold one browser's entries into the library's file.
 *
 * The incoming body is cleaned by the same rules as stored data, so a hand-written request
 * cannot put anything on disk that a later read would refuse. The file is only rewritten
 * when something in the body was actually newer.
 * @param root - the library root.
 * @param body - the parsed request body, trusted for nothing.
 * @returns the merged table and whether it could be kept on disk.
 */
export function writeProgressFile(root: string, body: unknown, now = Date.now()): ProgressRead {
  const current = readProgressFile(root, now)
  if (!current.ok) return current
  const merged = mergeProgress(current.table, sanitizeProgress(body, now))
  if (sameProgress(merged, current.table)) return { ok: true, reason: null, table: current.table }
  try {
    writeAtomically(progressPath(root), serializeProgress(merged))
  } catch (error) {
    // Answer with the merge anyway: the browser still caches it, and the reason says why
    // the host could not.
    return { ok: false, reason: `进度没写进媒体目录：${String(error)}`, table: merged }
  }
  return { ok: true, reason: null, table: merged }
}
