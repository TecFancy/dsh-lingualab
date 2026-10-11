/**
 * The plugin's own memory: what survives a restart, what is deliberately forgotten,
 * and what a half-written state string does to the panel.
 *
 * The ceiling is the part with a rule in it rather than a number: when the index is
 * full, entries nobody has annotated and nobody has opened recently go first. That
 * order is the only thing standing between "the plugin remembers" and "the plugin
 * grows forever", so it is asserted from both ends — the unannotated entry is gone,
 * the annotated one is still there.
 */
import { describe, expect, it } from 'vitest'
import {
  EMPTY_STATE,
  MAX_FILE_EPISODES,
  MAX_RECENT,
  fileEpisodeIdFor,
  fileRef,
  findFileEpisode,
  isFileEpisodeId,
  notesFor,
  parseState,
  sanitizePhrases,
  serializeState,
  summarizePhrases,
  withNotes,
  withOpenedFile,
  type FileEpisodeRecord,
  type OpenState,
} from './state.ts'

/** One record, with the fields the tests do not care about filled in. */
function record(index: number, openedAt = index): FileEpisodeRecord {
  const path = `/media/clip-${String(index)}.mp3`
  return {
    id: fileEpisodeIdFor(path),
    path,
    title: `clip-${String(index)}`,
    place: 'ws_test',
    rel: `clip-${String(index)}.mp3`,
    audio: `clip-${String(index)}.mp3`,
    subtitleEn: null,
    subtitleZh: null,
    openedAt,
  }
}

describe('file episode ids', () => {
  it('recognises the prefix and refuses to call a bare one an id', () => {
    expect(isFileEpisodeId('file.0123456789abcdef')).toBe(true)
    expect(isFileEpisodeId('file.')).toBe(false)
    expect(isFileEpisodeId('S01E01')).toBe(false)
  })

  it('hashes the path, so the same file is the same episode', () => {
    expect(fileEpisodeIdFor('/media/a.mp3')).toBe(fileEpisodeIdFor('/media/a.mp3'))
    expect(fileEpisodeIdFor('/media/a.mp3')).not.toBe(fileEpisodeIdFor('/media/b.mp3'))
    expect(fileEpisodeIdFor('/media/a.mp3')).toMatch(/^file\.[0-9a-f]{16}$/)
  })
})

describe('serializeState / parseState', () => {
  it('round-trips the whole memory', () => {
    const opened = withOpenedFile(EMPTY_STATE, record(1, 100))
    const withPhrase = withNotes(opened, record(1).id, [
      { at: 3, text: 'Hi', zh: '你好', note: '', tags: ['review'], done: false },
    ])
    const parsed = parseState(serializeState(withPhrase))
    expect(parsed).toEqual(withPhrase)
    expect(parsed.current).toEqual(fileRef(record(1, 100)))
  })

  it('reads an empty, a broken and a future string as nothing remembered', () => {
    expect(parseState('')).toEqual(EMPTY_STATE)
    expect(parseState('   ')).toEqual(EMPTY_STATE)
    expect(parseState('{ not json')).toEqual(EMPTY_STATE)
    expect(parseState('null')).toEqual(EMPTY_STATE)
    expect(parseState('{"version":2,"files":[]}')).toEqual(EMPTY_STATE)
  })

  it('drops the parts of a damaged state instead of the whole thing', () => {
    const good = record(1)
    const raw = JSON.stringify({
      version: 1,
      current: { id: 'file.x', title: 'x', kind: 'nonsense', source: '' },
      recent: ['file.0123456789abcdef', 'not-an-id', 42],
      files: [good, { id: 'nope' }, null],
      notes: { [good.id]: [{ at: 1, text: 'kept' }, { at: 'x' }], broken: [] },
    })
    const parsed = parseState(raw)
    expect(parsed.current).toBeNull()
    expect(parsed.recent).toEqual(['file.0123456789abcdef'])
    expect(parsed.files).toEqual([good])
    expect(parsed.notes[good.id]).toHaveLength(1)
    expect(parsed.notes.broken).toBeUndefined()
  })
})

describe('withOpenedFile', () => {
  it('makes the file current, refreshes its record and puts it first in recents', () => {
    const first = withOpenedFile(EMPTY_STATE, record(1))
    const second = withOpenedFile(first, record(2))
    const again = withOpenedFile(second, { ...record(1), openedAt: 999 })

    expect(again.files).toHaveLength(2)
    expect(again.files[0]?.id).toBe(record(1).id)
    expect(again.recent).toEqual([record(1).id, record(2).id])
    expect(again.current?.id).toBe(record(1).id)
    expect(findFileEpisode(again, record(2).id)?.openedAt).toBe(2)
  })

  it('keeps at most twenty recent ids', () => {
    let state: OpenState = EMPTY_STATE
    for (let index = 0; index < 25; index += 1) state = withOpenedFile(state, record(index))
    expect(state.recent).toHaveLength(MAX_RECENT)
    expect(state.recent[0]).toBe(record(24).id)
  })
})

describe('the index ceiling', () => {
  it('forgets the unannotated ones first, and keeps what has notes', () => {
    let state: OpenState = EMPTY_STATE
    for (let index = 0; index < MAX_FILE_EPISODES; index += 1) {
      state = withOpenedFile(state, record(index))
    }
    // Annotate the two oldest, then push five more so the ceiling bites. They are
    // neither recent nor gone, which is exactly the case the order is for.
    const keepA = record(0).id
    const keepB = record(1).id
    state = withNotes(state, keepA, [{ at: 1, text: 'kept', zh: '', note: '', tags: [], done: false }])
    state = withNotes(state, keepB, [{ at: 1, text: 'kept', zh: '', note: '', tags: [], done: false }])
    for (let index = MAX_FILE_EPISODES; index < MAX_FILE_EPISODES + 5; index += 1) {
      state = withOpenedFile(state, record(index))
    }

    expect(state.files).toHaveLength(MAX_FILE_EPISODES)
    expect(findFileEpisode(state, keepA)).not.toBeNull()
    expect(findFileEpisode(state, keepB)).not.toBeNull()
    // The oldest unannotated records are the first things to go.
    expect(findFileEpisode(state, record(2).id)).toBeNull()
    expect(findFileEpisode(state, record(6).id)).toBeNull()
    // A dropped record takes its notes with it, and a kept one keeps them.
    expect(notesFor(state, keepA)).toHaveLength(1)
  })

  it('drops the oldest annotated record too when the ceiling cannot be met otherwise', () => {
    let state: OpenState = EMPTY_STATE
    for (let index = 0; index < MAX_FILE_EPISODES; index += 1) {
      state = withOpenedFile(state, record(index))
      state = withNotes(state, record(index).id, [
        { at: 1, text: 'kept', zh: '', note: '', tags: [], done: false },
      ])
    }
    state = withOpenedFile(state, record(MAX_FILE_EPISODES))

    expect(state.files).toHaveLength(MAX_FILE_EPISODES)
    expect(findFileEpisode(state, record(0).id)).toBeNull()
    expect(notesFor(state, record(0).id)).toEqual([])
    expect(findFileEpisode(state, record(MAX_FILE_EPISODES).id)).not.toBeNull()
  })
})

describe('notes held in the state', () => {
  it('writes, reads and clears the phrases of one file episode', () => {
    const phrases = [{ at: 4, text: 'Hello', zh: '你好', note: '', tags: ['hard'], done: false }]
    const written = withNotes(EMPTY_STATE, 'file.0123456789abcdef', phrases)
    expect(notesFor(written, 'file.0123456789abcdef')).toEqual(phrases)
    expect(summarizePhrases(notesFor(written, 'file.0123456789abcdef'))).toEqual({
      exists: true,
      count: 1,
      review: 0,
      hard: 1,
    })
    expect(notesFor(withNotes(written, 'file.0123456789abcdef', []), 'file.0123456789abcdef')).toEqual([])
  })

  it('sanitises what it reads, so a hand-edited field cannot inject a phrase', () => {
    expect(sanitizePhrases([{ at: -1, text: 'x' }, { at: 1, text: '  ' }, { at: 2, text: 'ok' }])).toEqual([
      { at: 2, text: 'ok', zh: '', note: '', tags: [], done: false },
    ])
  })

  it('keeps the segment of a phrase on one line, and drops one that is not text or is absurdly long', () => {
    const kept = sanitizePhrases([{ at: 1, text: 'a', segment: '  02_足球场 ' }, { at: 2, text: 'b', segment: 'x\n## y' }])
    expect(kept.map((phrase) => phrase.segment)).toEqual(['02_足球场', 'x ## y'])
    const dropped = sanitizePhrases([
      { at: 1, text: 'a', segment: 5 },
      { at: 2, text: 'b', segment: '' },
      { at: 3, text: 'c', segment: 's'.repeat(400) },
    ])
    expect(dropped.every((phrase) => !('segment' in phrase))).toBe(true)
  })
})
