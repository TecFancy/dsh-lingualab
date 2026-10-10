/**
 * The picker's boundary: which roots exist, which paths inside them are legal, and
 * where a browsing request stops being one.
 *
 * The escape cases are the point of this file. A traversal that only rejects the
 * literal string `..` passes every happy-path test and still hands out `/etc`.
 */
import { existsSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { basename, join, parse, resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  forbiddenReason,
  forbiddenReasonFor,
  isInside,
  listPlaces,
  normalizeRel,
  parentOfRel,
  placeIdFor,
  placesPayload,
  probeReadable,
  resolveInPlace,
} from './places.ts'
import { LIBRARY_SUBPATH } from './config.ts'
import { makeTempDir } from './test-dir.ts'

let root = ''
let outside = ''

beforeEach(() => {
  root = makeTempDir('lingualab-places-')
  outside = makeTempDir('lingualab-outside-')
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
  rmSync(outside, { recursive: true, force: true })
})

describe('placeIdFor', () => {
  it('is the same id for the same path, and a different one for another path', () => {
    const first = placeIdFor('/workspace/alpha')
    expect(first).toBe(placeIdFor('/workspace/alpha'))
    expect(first).not.toBe(placeIdFor('/workspace/beta'))
  })

  it('is twelve hex characters of the path hash, so it is pinned rather than merely stable', () => {
    expect(placeIdFor('/workspace/alpha')).toBe('ws_e2f58a471c1c')
  })
})

const ON_WINDOWS = process.platform === 'win32'
const DRIVE = parse(resolve('/')).root

/**
 * The rules themselves, run for BOTH flavours on whatever machine this is.
 *
 * They used to be tested only through `forbiddenReason(path)`, which reads the real
 * platform, so the Windows branch ran only on Windows and the POSIX one only elsewhere;
 * CI is Linux, so the branch this file's last fix was about never ran in CI at all. The
 * pure function takes the flavour as an argument and needs no filesystem.
 */
describe('forbiddenReasonFor', () => {
  describe('posix', () => {
    it('refuses the filesystem root', () => {
      expect(forbiddenReasonFor('/', 'posix')).toBeTruthy()
    })

    it('refuses the system roots and everything under them', () => {
      for (const path of ['/etc', '/proc', '/sys', '/dev', '/run', '/boot', '/root']) {
        expect(forbiddenReasonFor(path, 'posix')).toBeTruthy()
        expect(forbiddenReasonFor(`${path}/nested/deeper`, 'posix')).toBeTruthy()
      }
    })

    it('compares whole segments, so a sibling that starts with the same letters is allowed', () => {
      expect(forbiddenReasonFor('/etcetera', 'posix')).toBeNull()
      expect(forbiddenReasonFor('/rootfs/media', 'posix')).toBeNull()
    })

    it('allows an ordinary directory', () => {
      expect(forbiddenReasonFor('/srv/media', 'posix')).toBeNull()
    })
  })

  describe('win32', () => {
    it('refuses a drive root, however it is written', () => {
      expect(forbiddenReasonFor('C:\\', 'win32')).toBeTruthy()
      expect(forbiddenReasonFor('d:\\', 'win32')).toBeTruthy()
    })

    it('refuses the system folders and everything under them, in any letter case', () => {
      for (const name of ['Windows', 'Program Files', 'Program Files (x86)', 'ProgramData']) {
        expect(forbiddenReasonFor(`C:\\${name}`, 'win32')).toBeTruthy()
        expect(forbiddenReasonFor(`C:\\${name.toUpperCase()}\\nested`, 'win32')).toBeTruthy()
        expect(forbiddenReasonFor(`D:\\${name.toLowerCase()}\\a\\b`, 'win32')).toBeTruthy()
      }
    })

    it('refuses a leftover 8.3 short name, which is how `C:\\PROGRA~1` spells Program Files', () => {
      expect(forbiddenReasonFor('C:\\PROGRA~1', 'win32')).toBeTruthy()
      expect(forbiddenReasonFor('C:\\PROGRA~2\\sub', 'win32')).toBeTruthy()
      expect(forbiddenReasonFor('C:\\WINDOW~1', 'win32')).toBeTruthy()
    })

    it('refuses the system folders reached through a UNC administrative share', () => {
      expect(forbiddenReasonFor('\\\\host\\C$\\Windows\\System32', 'win32')).toBeTruthy()
    })

    it('allows ordinary folders, including near misses', () => {
      for (const path of ['D:\\media', 'C:\\Users\\me\\Music', 'C:\\Windows2', 'C:\\Program Files Backup', 'E:\\data\\windows-media']) {
        expect(forbiddenReasonFor(path, 'win32')).toBeNull()
      }
    })

    it('does not apply the POSIX literals, which is what made the old check a no-op here', () => {
      expect(forbiddenReasonFor('C:\\etc', 'win32')).toBeNull()
    })
  })
})

describe('forbiddenReason (this platform, through the real filesystem)', () => {
  it('refuses the filesystem root', () => {
    expect(forbiddenReason(DRIVE)).toBeTruthy()
    expect(forbiddenReason('/')).toBeTruthy()
  })

  it.skipIf(!ON_WINDOWS)('refuses the 8.3 short name of Program Files once it is expanded', () => {
    const short = `${DRIVE}PROGRA~1`
    // Only meaningful where the alias exists on this machine.
    if (!existsSync(short)) return
    expect(forbiddenReason(short)).toBeTruthy()
  })

  it('allows an ordinary directory', () => {
    expect(forbiddenReason(root)).toBeNull()
  })
})

describe('normalizeRel', () => {
  it('keeps a plain relative path and drops the empty segments', () => {
    expect(normalizeRel('')).toBe('')
    expect(normalizeRel('a/b')).toBe('a/b')
    expect(normalizeRel('a//b')).toBe('a/b')
    expect(normalizeRel('./a/./b')).toBe('a/b')
  })

  it('refuses absolute paths, traversal, backslashes and NUL', () => {
    expect(normalizeRel('/etc/passwd')).toBeNull()
    expect(normalizeRel('..')).toBeNull()
    expect(normalizeRel('a/../b')).toBeNull()
    expect(normalizeRel('a\\b')).toBeNull()
    expect(normalizeRel('a\0b')).toBeNull()
  })
})

describe('parentOfRel', () => {
  it('walks one level up, and stops at the place root', () => {
    expect(parentOfRel('')).toBeNull()
    expect(parentOfRel('a')).toBe('')
    expect(parentOfRel('a/b')).toBe('a')
  })
})

describe('isInside', () => {
  it('compares whole segments, not prefixes', () => {
    expect(isInside('/data/lib', '/data/lib')).toBe(true)
    expect(isInside('/data/lib', '/data/lib/a.mp3')).toBe(true)
    expect(isInside('/data/lib', '/data/lib2/a.mp3')).toBe(false)
    expect(isInside('/data/lib', '/data')).toBe(false)
  })

  it('answers by real path, so a symlink out is not inside', () => {
    symlinkSync(outside, join(root, 'escape'))
    expect(isInside(root, join(root, 'escape'))).toBe(false)
    expect(isInside(root, join(root, 'plain'))).toBe(true)
  })
})

describe('probeReadable', () => {
  it('answers a missing directory with a reason instead of throwing', () => {
    const probe = probeReadable(join(root, 'nope'))
    expect(probe.readable).toBe(false)
    expect(probe.reason).toBe('这个目录不存在')
  })

  it('answers a file with a reason', () => {
    writeFileSync(join(root, 'file.txt'), 'x')
    expect(probeReadable(join(root, 'file.txt')).reason).toBe('这是一个文件，不是目录')
  })

  it('reports a forbidden root as such', () => {
    const forbidden = ON_WINDOWS ? join(DRIVE, 'Windows') : '/etc'
    expect(probeReadable(forbidden).reason).toContain('不允许浏览')
  })

  it('accepts a directory it can list', () => {
    expect(probeReadable(root)).toEqual({ readable: true, reason: null })
  })
})

describe('listPlaces', () => {
  it('lists workspaces first and the library last, with the convention reported', () => {
    mkdirSync(join(root, LIBRARY_SUBPATH), { recursive: true })
    const library = join(outside, 'media')
    const places = listPlaces([{ path: root, title: '个人' }, { path: outside }], library)

    expect(places.map((place) => place.kind)).toEqual(['workspace', 'workspace', 'library'])
    expect(places[0]?.id).toBe(placeIdFor(root))
    expect(places[0]?.label).toBe('个人')
    expect(places[0]?.suggested).toBe(true)
    expect(places[0]?.conventionRel).toBe(LIBRARY_SUBPATH)
    expect(places[1]?.label).toBe(basename(outside))
    expect(places[1]?.suggested).toBe(false)
    expect(places[2]?.id).toBe('lib')
    expect(places[2]?.reason).toBe('这个目录不存在')
    expect(places[2]?.conventionRel).toBeNull()
  })

  it('keeps one row per workspace when two share a directory', () => {
    const places = listPlaces([{ path: root }, { path: root }], '')
    expect(places.filter((place) => place.kind === 'workspace')).toHaveLength(1)
  })

  it('reports the payload as not ok when nothing can be browsed', () => {
    const payload = placesPayload([], '', null)
    expect(payload.ok).toBe(false)
    expect(payload.places).toHaveLength(1)
    expect(payload.current).toBeNull()
  })
})

describe('resolveInPlace', () => {
  it('resolves an existing path inside the place', () => {
    mkdirSync(join(root, 'episodes'))
    writeFileSync(join(root, 'episodes', 'a.mp3'), 'x')
    const [place] = listPlaces([{ path: root }], '')
    if (place === undefined) throw new Error('no place')
    const resolved = resolveInPlace(place, 'episodes/a.mp3')
    expect(resolved.ok).toBe(true)
    if (resolved.ok) expect(resolved.abs).toBe(join(root, 'episodes', 'a.mp3'))
  })

  it('refuses traversal, an absolute path and a missing target', () => {
    const [place] = listPlaces([{ path: root }], '')
    if (place === undefined) throw new Error('no place')
    expect(resolveInPlace(place, '../etc')).toMatchObject({ ok: false, reason: '相对路径不合法' })
    expect(resolveInPlace(place, '/etc')).toMatchObject({ ok: false, reason: '相对路径不合法' })
    expect(resolveInPlace(place, 'nope.mp3')).toMatchObject({ ok: false, reason: '这个路径不存在' })
  })

  it('refuses a symlink that leaves the place', () => {
    writeFileSync(join(outside, 'secret.mp3'), 'x')
    symlinkSync(outside, join(root, 'link'))
    const [place] = listPlaces([{ path: root }], '')
    if (place === undefined) throw new Error('no place')
    expect(resolveInPlace(place, 'link/secret.mp3')).toMatchObject({
      ok: false,
      reason: '这个路径跑到允许的目录外面了',
    })
  })

  it('refuses a place whose own root is forbidden', () => {
    const place = {
      id: 'ws_x',
      kind: 'workspace' as const,
      label: 'etc',
      path: '/etc',
      readable: true,
      reason: null,
      suggested: false,
      conventionRel: null,
    }
    expect(resolveInPlace(place, 'hosts')).toMatchObject({ ok: false })
  })
})
