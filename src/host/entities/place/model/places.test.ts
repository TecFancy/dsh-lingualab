/**
 * Which places the picker lists, and how a relative path inside one resolves.
 *
 * The resolution cases that matter are the refusals: traversal, an absolute path, and a symlink
 * that leaves the place.
 */
import { mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LIBRARY_SUBPATH } from '../../../shared/config/index.ts'
import { makeTempDir } from '../../../shared/testing/index.ts'
import { listPlaces, placeIdFor, placesPayload, resolveInPlace } from './places.ts'

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
