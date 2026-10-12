/**
 * Where an episode's notes live, which now depends on what kind of episode it is.
 *
 * A folder episode writes `notes.md` where the agent's grep will find it. A file
 * episode has no folder of its own inside the library, so its phrases are held in
 * the plugin state — and the rules that give the study method its discipline, the
 * ceiling above all, have to hold in both stores or they hold in neither.
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MAX_PHRASES } from '../../../../shared/notes-format.ts'
import { makeTempDir } from '../../../shared/testing/index.ts'
import { EMPTY_STATE, parseState, serializeState, withNotes } from '../../open-state/@x/note.ts'
import { notesVersion, writeNotes, readNotes } from './notes.ts'

let root = ''

beforeEach(() => {
  root = makeTempDir('lingualab-notes-')
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

/** One folder episode with audio, so the disk store has somewhere to write. */
function episode(id = 'S01E01'): void {
  mkdirSync(join(root, id), { recursive: true })
  writeFileSync(join(root, id, 'audio.mp3'), 'x')
}

const FILE_ID = 'file.0123456789abcdef'

describe('file episode notes', () => {
  it('starts empty and stays in memory, writing nothing to the library', () => {
    episode()
    expect(readNotes(root, FILE_ID)).toEqual({
      ok: true,
      episode: FILE_ID,
      reason: null,
      phrases: [],
      version: null,
      stale: false,
    })

    const phrases = [{ at: 12, text: 'Hello there', zh: '你好', note: '开场', tags: ['review'], done: false }]
    const result = writeNotes(root, FILE_ID, phrases)
    expect(result.payload.ok).toBe(true)
    expect(result.state).not.toBe(EMPTY_STATE)
    expect(readNotes(root, FILE_ID, result.state).phrases).toEqual(phrases)
    expect(existsSync(join(root, FILE_ID))).toBe(false)
  })

  it('keeps more than seven phrases, the old ceiling is gone', () => {
    const many = Array.from({ length: 30 }, (_, index) => ({ at: index, text: `phrase ${index}` }))
    const result = writeNotes(root, FILE_ID, many)

    expect(result.payload.ok).toBe(true)
    expect(result.payload.phrases).toHaveLength(30)
  })

  it('still refuses a runaway list and changes nothing when it does', () => {
    const runaway = Array.from({ length: MAX_PHRASES + 1 }, (_, index) => ({ at: index, text: `phrase ${index}` }))
    const before = withNotes(EMPTY_STATE, FILE_ID, [
      { at: 1, text: 'kept', zh: '', note: '', tags: [], done: false },
    ])
    const result = writeNotes(root, FILE_ID, runaway, before)

    expect(result.payload.ok).toBe(false)
    expect(result.payload.reason).toContain(`最多 ${String(MAX_PHRASES)} 条`)
    expect(result.state).toBe(before)
  })

  it('survives the round trip through the profile field', () => {
    const written = writeNotes(root, FILE_ID, [{ at: 3, text: 'Hi', zh: '', note: '', tags: ['hard'], done: true }])
    const again = parseState(serializeState(written.state))
    expect(readNotes(root, FILE_ID, again).phrases).toEqual([
      { at: 3, text: 'Hi', zh: '', note: '', tags: ['hard'], done: true },
    ])
  })

  it('replaces the whole list, and clearing it removes the entry', () => {
    const first = writeNotes(root, FILE_ID, [{ at: 1, text: 'one' }]).state
    const second = writeNotes(root, FILE_ID, [{ at: 2, text: 'two' }], first).state
    expect(readNotes(root, FILE_ID, second).phrases.map((phrase) => phrase.text)).toEqual(['two'])
    const cleared = writeNotes(root, FILE_ID, [], second).state
    expect(cleared.notes[FILE_ID]).toBeUndefined()
  })

  it('refuses an unsafe episode id in either store', () => {
    expect(readNotes(root, '../etc').ok).toBe(false)
    expect(writeNotes(root, 'a/b', [{ at: 1, text: 'x' }]).payload.ok).toBe(false)
    expect(readNotes(root, 'file.a/b').ok).toBe(false)
  })
})

describe('folder episode notes still go to the file', () => {
  it('writes notes.md and leaves the state alone', () => {
    episode()
    const result = writeNotes(root, 'S01E01', [{ at: 5, text: 'Hello', zh: '你好' }])
    expect(result.payload.ok).toBe(true)
    expect(result.state).toBe(EMPTY_STATE)
    expect(readFileSync(join(root, 'S01E01', 'notes.md'), 'utf8')).toContain('Hello')
    expect(readNotes(root, 'S01E01').phrases).toHaveLength(1)
  })
})

describe('saving notes.md safely', () => {
  const notes = (): string => join(root, 'S01E01', 'notes.md')

  it('reads a version, and a missing file has the version of an empty one', () => {
    episode()
    expect(readNotes(root, 'S01E01').version).toBe(notesVersion(''))
    writeNotes(root, 'S01E01', [{ at: 5, text: 'Hello' }])
    expect(readNotes(root, 'S01E01').version).toBe(notesVersion(readFileSync(notes())))
  })

  it('answers a save with the version it wrote, so the same page can save again', () => {
    episode()
    const first = writeNotes(root, 'S01E01', [{ at: 5, text: 'Hello' }], EMPTY_STATE, readNotes(root, 'S01E01').version)
    expect(first.payload.ok).toBe(true)
    expect(first.payload.version).toBe(notesVersion(readFileSync(notes())))
    const second = writeNotes(root, 'S01E01', [{ at: 6, text: 'Again' }], EMPTY_STATE, first.payload.version)
    expect(second.payload.ok).toBe(true)
    expect(readFileSync(notes(), 'utf8')).toContain('Again')
  })

  it('refuses a save against a file that changed since it was read, and leaves the file alone', () => {
    episode()
    writeNotes(root, 'S01E01', [{ at: 5, text: 'Hello' }])
    const seen = readNotes(root, 'S01E01').version
    const edited = `${readFileSync(notes(), 'utf8')}- [ ] 00:09 | Added by hand. | |\n`
    writeFileSync(notes(), edited)

    const result = writeNotes(root, 'S01E01', [{ at: 5, text: 'Hello' }], EMPTY_STATE, seen)
    expect(result.payload).toMatchObject({ ok: false, stale: true, version: null })
    expect(readFileSync(notes(), 'utf8')).toBe(edited)
  })

  it('refuses a save from a page that never read the file', () => {
    episode()
    writeNotes(root, 'S01E01', [{ at: 5, text: 'Hello' }])
    const before = readFileSync(notes(), 'utf8')
    const result = writeNotes(root, 'S01E01', [], EMPTY_STATE, null)
    expect(result.payload).toMatchObject({ ok: false, stale: false })
    expect(readFileSync(notes(), 'utf8')).toBe(before)
  })

  it('writes through a temporary file and leaves nothing beside notes.md', () => {
    episode()
    writeNotes(root, 'S01E01', [{ at: 5, text: 'Hello' }])
    writeNotes(root, 'S01E01', [{ at: 6, text: 'Again' }])
    expect(readdirSync(join(root, 'S01E01')).sort()).toEqual(['audio.mp3', 'notes.md'])
  })

  it('keeps the old file whole when the new one cannot be written', () => {
    episode()
    writeNotes(root, 'S01E01', [{ at: 5, text: 'Hello' }])
    const before = readFileSync(notes(), 'utf8')
    // A directory where the temporary file would go makes the write fail before any rename.
    mkdirSync(`${notes()}.${String(process.pid)}.tmp`)

    const result = writeNotes(root, 'S01E01', [{ at: 6, text: 'Again' }])
    expect(result.payload.ok).toBe(false)
    expect(readFileSync(notes(), 'utf8')).toBe(before)
  })
})
