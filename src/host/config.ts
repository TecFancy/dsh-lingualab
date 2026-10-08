/**
 * Which folder the library lives in, and how it gets chosen.
 *
 * The plugin's config carries `libraryRoot`, and until now the only way to set it
 * was the profile's own patch file — which means the panel opened on an empty page
 * with no way forward from inside it. This module adds the missing half: validate a
 * folder the panel proposes, and offer the folders worth proposing.
 *
 * Persisting the choice is not done here. The host half hands the validated path to
 * the harness settings service, which writes it into this plugin's profile entry —
 * the same place the Plugins page edits, so there is one home for the value and no
 * second source of truth on disk.
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { isAbsolute, join } from 'node:path'
import type { LibraryCandidate, LibraryConfigPayload } from '../shared/protocol.ts'

/** The conventional place for material inside a workspace. */
export const LIBRARY_SUBPATH = 'notes/learning/english/media'

/** Why a proposed folder was refused, or `null` when it is usable. */
export function validateRoot(candidate: string): string | null {
  const path = candidate.trim()
  if (path.length === 0) return '路径是空的'
  if (!isAbsolute(path)) return '要用绝对路径'
  if (!existsSync(path)) return '这个目录不存在'
  try {
    if (!statSync(path).isDirectory()) return '这是一个文件，不是目录'
  } catch {
    return '读不了这个目录'
  }
  return null
}

/** How many episode folders a directory holds, or `null` when it cannot be read. */
function countEntries(path: string): number | null {
  try {
    return readdirSync(path, { withFileTypes: true }).filter(
      (entry) => entry.isDirectory() && !entry.name.startsWith('.'),
    ).length
  } catch {
    return null
  }
}

/** One candidate, described well enough for the panel to show why it is worth picking. */
function describe(path: string, label: string): LibraryCandidate {
  const exists = existsSync(path)
  return { path, label, exists, episodes: exists ? countEntries(path) : null }
}

/**
 * The folders worth offering: every workspace's conventional media folder, then the
 * one currently in effect if it is somewhere else.
 *
 * The counts come from a shallow listing rather than a full scan: this answer is
 * rendered next to a text box, and a workspace can hold tens of thousands of files.
 */
export function candidateRoots(
  workspaces: readonly { path: string }[],
  current: string,
): LibraryCandidate[] {
  const candidates: LibraryCandidate[] = []
  const seen = new Set<string>()

  for (const workspace of workspaces) {
    const path = join(workspace.path, LIBRARY_SUBPATH)
    if (seen.has(path)) continue
    seen.add(path)
    candidates.push(describe(path, workspace.path.split('/').pop() ?? workspace.path))
  }

  const trimmed = current.trim()
  if (trimmed.length > 0 && !seen.has(trimmed)) candidates.push(describe(trimmed, '当前设置'))

  return candidates
}

/** Everything the panel needs to render the folder card. */
export interface ConfigDescription {
  readonly root: string
  readonly configured: string
  readonly source: 'config' | 'workspace' | 'none'
  readonly exists: boolean
  readonly episodes: number | null
  readonly writable: boolean
  readonly reason: string | null
}

/** Describe the resolved root, without deciding anything about it. */
export function describeConfig(
  resolved: string,
  configured: string,
  source: ConfigDescription['source'],
  writable: boolean,
): ConfigDescription {
  const exists = resolved.trim().length > 0 && existsSync(resolved)
  return {
    root: resolved,
    configured,
    source,
    exists,
    episodes: exists ? countEntries(resolved) : null,
    writable,
    reason: resolved.trim().length === 0 ? '还没有设置媒体目录' : exists ? null : '这个目录不存在',
  }
}

/** The payload `GET /lingualab/config` answers with. */
export function configPayload(
  description: ConfigDescription,
  workspaces: readonly { path: string }[],
  root: string,
): LibraryConfigPayload {
  return {
    ok: description.reason === null,
    reason: description.reason,
    root: description.root,
    configured: description.configured,
    source: description.source,
    exists: description.exists,
    episodes: description.episodes,
    writable: description.writable,
    candidates: candidateRoots(workspaces, root),
  }
}
