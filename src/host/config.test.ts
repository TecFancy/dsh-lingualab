import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { candidateRoots, configPayload, describeConfig, validateRoot } from './config.ts'

let root = ''

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'lingualab-config-'))
  mkdirSync(join(root, 'S01E01'), { recursive: true })
  mkdirSync(join(root, 'S01E02'), { recursive: true })
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('validateRoot', () => {
  it('accepts an existing absolute directory', () => {
    expect(validateRoot(root)).toBeNull()
  })

  it('refuses the ways a typed path goes wrong, each with its own reason', () => {
    expect(validateRoot('   ')).toBe('路径是空的')
    expect(validateRoot('notes/media')).toBe('要用绝对路径')
    expect(validateRoot(join(root, 'nope'))).toBe('这个目录不存在')
    expect(validateRoot(join(root, 'S01E01', '..', 'S01E01'))).toBeNull()
  })

  it('refuses a file', () => {
    const file = join(root, 'notes.md')
    writeFileSync(file, 'x')
    expect(validateRoot(file)).toBe('这是一个文件，不是目录')
  })
})

describe('candidateRoots', () => {
  it('offers each workspace convention first, then the setting in effect', () => {
    const workspaces = [{ path: '/workspace/alpha' }, { path: '/workspace/beta' }]
    const candidates = candidateRoots(workspaces, root)
    expect(candidates.map((candidate) => candidate.path)).toEqual([
      '/workspace/alpha/notes/learning/english/media',
      '/workspace/beta/notes/learning/english/media',
      root,
    ])
    // The last one exists and holds two folders; the invented ones do not.
    expect(candidates[2]).toEqual({ path: root, label: '当前设置', exists: true, episodes: 2 })
    expect(candidates[0]?.exists).toBe(false)
    expect(candidates[0]?.episodes).toBeNull()
  })

  it('does not repeat the setting when a workspace already proposes it', () => {
    const convention = join(root, 'notes/learning/english/media')
    const candidates = candidateRoots([{ path: root }], convention)
    expect(candidates).toHaveLength(1)
    expect(candidates[0]?.path).toBe(convention)
    expect(candidates[0]?.label).toBe(root.split('/').pop())
  })
})

describe('describeConfig', () => {
  it('reports an unset folder as a reason rather than an error', () => {
    const described = describeConfig('', '', 'none', false)
    expect(described.reason).toBe('还没有设置媒体目录')
    expect(described.exists).toBe(false)
  })

  it('counts what is in a folder that exists', () => {
    expect(describeConfig(root, root, 'config', true).episodes).toBe(2)
  })

  it('builds the payload the panel reads', () => {
    const payload = configPayload(describeConfig(root, root, 'config', true), [], root)
    expect(payload.ok).toBe(true)
    expect(payload.source).toBe('config')
    expect(payload.candidates.map((candidate) => candidate.path)).toEqual([root])
  })
})
