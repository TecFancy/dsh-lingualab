/**
 * How a path is checked before anything reads it or writes to it.
 *
 * Every route that takes a path from the browser, and every write into the reader's folders, asks
 * these questions first. Two rules keep the plugin from becoming a general file browser on
 * somebody's server:
 *
 * 1. **Some roots are never addressable.** `/`, `/etc`, `/proc` and the rest, and the Windows
 *    system folders, are refused even when configuration names them by accident.
 * 2. **Containment is decided between real paths**, after `realpath`, because a symlink inside a
 *    folder can point anywhere and the lexical answer ("it starts with the root, so it is inside")
 *    would be a lie the filesystem tells only later.
 */
import { existsSync, readdirSync, realpathSync, statSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, posix, resolve, sep, win32 } from 'node:path'

/**
 * Directories a place may never be, nor sit inside.
 *
 * The library root and the workspace roots are configuration, and configuration
 * gets written by hand: a typo that pointed the panel at `/` would list the whole
 * machine to a browser. These are the roots where nothing of the reader's media
 * lives and everything of the operating system's does.
 */
const POSIX_FORBIDDEN_ROOTS = ['/etc', '/proc', '/sys', '/dev', '/run', '/boot', '/root'] as const

/**
 * The same idea on Windows, where the operating system lives under the system drive's
 * `Windows`, `Program Files` and `ProgramData` folders rather than under `/etc`.
 *
 * Without this the check was silently a no-op on Windows: `path.resolve('/etc')` there
 * is `D:\etc`, which no list of POSIX literals would ever match. The names are compared
 * case-insensitively because the filesystem is.
 */
const WINDOWS_FORBIDDEN_NAMES = ['windows', 'program files', 'program files (x86)', 'programdata'] as const

/**
 * The real path when the filesystem can answer, the resolved one when it cannot.
 *
 * Containment is decided between real paths — a symlink makes the lexical answer
 * wrong — but the checks also run for paths that do not exist yet, and there
 * `realpath` throws. Falling back to `resolve` keeps one code path for both, and
 * every caller that needs existence asks for it separately.
 * @param path - the path to canonicalise.
 * @returns the canonical path.
 */
export function realPathOf(path: string): string {
  try {
    // The native form on Windows: the JavaScript one leaves an 8.3 short name such as
    // `C:\PROGRA~1` exactly as written, which is a second spelling of `C:\Program Files`
    // that no list of folder names would ever match.
    return realpathSync.native(path)
  } catch {
    // The target does not exist (yet). Canonicalise the longest prefix that does and
    // put the rest back. Resolving the whole thing lexically would leave a short-named
    // root spelled one way for an existing path and another way for a missing one under
    // it, and `isInside` would call the same folder's children outsiders.
    const absolute = resolve(path)
    let head = absolute
    const tail: string[] = []
    for (;;) {
      const parent = dirname(head)
      if (parent === head) return absolute
      tail.unshift(basename(head))
      head = parent
      try {
        return join(realpathSync.native(head), ...tail)
      } catch {
        // Keep climbing.
      }
    }
  }
}

/** Which flavour of path rules a check applies. */
export type PathFlavour = 'posix' | 'win32'

/**
 * Why a canonical path may not be browsed or written to, or `null` when it may.
 *
 * Pure, and parameterised by flavour, so the Windows branch and the POSIX branch both run
 * in every test environment: a rule that is only exercised on the platform it was written
 * for is a rule that nobody notices has stopped working on the other. (It had: the POSIX
 * literals never matched anything on Windows.)
 * @param real - an already canonical path.
 * @param flavour - which rules to apply.
 * @returns the reason it is refused, or `null`.
 */
export function forbiddenReasonFor(real: string, flavour: PathFlavour): string | null {
  const path = flavour === 'win32' ? win32 : posix
  if (real.length === 0) return '不允许浏览根目录'
  // A filesystem root is `/` on POSIX and a bare drive (`C:\`) on Windows; `parse`
  // knows both, where comparing to `sep` only ever knew the first.
  if (path.parse(real).root === real) return '不允许浏览根目录'

  if (flavour === 'win32') {
    const rest = real.slice(path.parse(real).root.length)
    // Everything that matters on Windows sits directly under the drive (or the share).
    const first = rest.split(path.sep)[0]?.toLowerCase() ?? ''
    // A leftover 8.3 alias (`PROGRA~1`) means the path could not be expanded. A name that
    // looks like one is not allowed to stand in for a system folder.
    if ((WINDOWS_FORBIDDEN_NAMES as readonly string[]).includes(first) || /^[a-z0-9]{1,6}~\d+$/i.test(first)) {
      return `${first} 下面不允许浏览`
    }
    return null
  }

  for (const forbidden of POSIX_FORBIDDEN_ROOTS) {
    if (real === forbidden || real.startsWith(`${forbidden}/`)) {
      return `${forbidden} 下面不允许浏览`
    }
  }
  return null
}

/**
 * Why a directory may not be browsed, or `null` when it may.
 *
 * The check is on the canonical path, and covers descendants as well as the roots
 * themselves: `/etc/ssl` is refused for the same reason `/etc` is. A sibling that
 * merely starts with the same characters (`/etcetera`) is not a descendant, so the
 * comparison is made on path segments rather than on a bare prefix.
 * @param path - the directory to check.
 * @returns the reason it is refused, or `null`.
 */
export function forbiddenReason(path: string): string | null {
  return forbiddenReasonFor(realPathOf(path), process.platform === 'win32' ? 'win32' : 'posix')
}

/**
 * Whether `target` is `root` itself or sits under it, by real path.
 *
 * The prefix comparison carries the separator on purpose: without it `/data/lib2`
 * would read as being inside `/data/lib`. This is the check the browser's input
 * passes through before any read happens.
 * @param root - the directory that must contain the target.
 * @param target - the path to test.
 * @returns true when the target is the root or inside it.
 */
export function isInside(root: string, target: string): boolean {
  const base = realPathOf(root)
  const other = realPathOf(target)
  if (other === base) return true
  return other.startsWith(base.endsWith(sep) ? base : `${base}${sep}`)
}

/**
 * Validate and normalise a relative path.
 *
 * The rules are deliberately narrow, because this string is the only piece of a
 * browse request that comes from the browser: no NUL, no backslash (a Windows
 * separator that some shells normalise late), not absolute, and no `..` segment
 * anywhere. Empty segments and `.` are dropped, so `a//b` and `a/./b` both read
 * as `a/b` and the answer can be sent back verbatim.
 * @param rel - the raw relative path.
 * @returns the normalised path, or `null` when it is not acceptable.
 */
export function normalizeRel(rel: string): string | null {
  if (rel.includes('\0')) return null
  if (rel.includes('\\')) return null
  if (isAbsolute(rel)) return null
  const segments = rel.split('/').filter((segment) => segment.length > 0 && segment !== '.')
  if (segments.some((segment) => segment === '..')) return null
  return segments.join('/')
}

/** The parent of a normalised relative path: `''` at the first level, `null` at the root. */
export function parentOfRel(rel: string): string | null {
  if (rel.length === 0) return null
  const cut = rel.lastIndexOf('/')
  return cut === -1 ? '' : rel.slice(0, cut)
}

/** What a directory probe found. Never throws; unreadable is an answer, not an error. */
export interface Readability {
  readonly readable: boolean
  readonly reason: string | null
}

/**
 * Whether a directory can be listed right now.
 *
 * Synchronous and total: this runs while a payload is being built, and a place that
 * cannot be read is a row with a reason rather than an exception that would take
 * the other places down with it.
 * @param path - the directory to probe.
 * @returns the verdict, with a short reason when it is not readable.
 */
export function probeReadable(path: string): Readability {
  if (path.trim().length === 0) return { readable: false, reason: '还没有设置目录' }
  const forbidden = forbiddenReason(path)
  if (forbidden !== null) return { readable: false, reason: forbidden }
  if (!existsSync(path)) return { readable: false, reason: '这个目录不存在' }
  try {
    if (!statSync(path).isDirectory()) return { readable: false, reason: '这是一个文件，不是目录' }
    readdirSync(path)
    return { readable: true, reason: null }
  } catch {
    return { readable: false, reason: '读不了这个目录' }
  }
}
