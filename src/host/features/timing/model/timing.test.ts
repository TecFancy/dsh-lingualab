/**
 * Moving one cue inside a subtitle file.
 *
 * What these pin down is the promise the route makes to the reader's file: the two times of one
 * cue change, in the line's own format, and every other byte stays as it was, whatever the
 * encoding. And the refusals: a page that read an older file, a cue that is not where the page
 * said, a file outside the library, and a request whose second file would fail.
 */
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { TimingEdit } from '../../../../shared/protocol.ts'
import { EMPTY_STATE, fileEpisodeIdFor, withOpenedFile } from '../../../entities/open-state/index.ts'
import { makeTempDir } from '../../../shared/testing/index.ts'
import { retimeText, sha256Hex, writeTiming } from './timing.ts'

let root = ''

beforeEach(() => {
  root = makeTempDir('lingualab-timing-')
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

const SRT = [
  '1',
  '00:00:01,000 --> 00:00:02,500',
  '{\\an8}Hello there.',
  '',
  '2',
  '00:00:03,000 --> 00:00:04,000',
  'Second line.',
  '',
].join('\r\n')

/** Put one file into one episode folder and return its bytes. */
function put(episode: string, file: string, content: string | Buffer): Buffer {
  mkdirSync(join(root, episode), { recursive: true })
  const bytes = typeof content === 'string' ? Buffer.from(content, 'utf8') : content
  writeFileSync(join(root, episode, file), bytes)
  return bytes
}

/** One edit of `file`, read from `bytes`. */
function edit(file: string, bytes: Buffer, from: [number, number, number?], to: [number, number]): TimingEdit {
  return {
    file,
    from: { start: from[0], end: from[1], occurrence: from[2] ?? 0 },
    to: { start: to[0], end: to[1] },
    expect: sha256Hex(bytes),
  }
}

describe('retimeText', () => {
  it('changes one SRT timecode and keeps the separator and the hour width', () => {
    const result = retimeText('0:00:01.000 --> 00:00:02,500\ntext', 'srt', [
      { from: { start: 1000, end: 2500, occurrence: 0 }, to: { start: 1250, end: 2750 } },
    ])
    expect(result).toEqual({ ok: true, text: '0:00:01.250 --> 00:00:02,750\ntext' })
  })

  it('moves a cue and its neighbour in one pass, finding each as the text was read', () => {
    // The first cue moves onto the second's old range; the second must still be found.
    const text = '00:00:01,000 --> 00:00:02,000\na\n\n00:00:02,000 --> 00:00:03,000\nb'
    const result = retimeText(text, 'srt', [
      { from: { start: 2000, end: 3000, occurrence: 0 }, to: { start: 2500, end: 3000 } },
      { from: { start: 1000, end: 2000, occurrence: 0 }, to: { start: 2000, end: 3000 } },
    ])
    expect(result).toEqual({ ok: true, text: '00:00:02,000 --> 00:00:03,000\na\n\n00:00:02,500 --> 00:00:03,000\nb' })
  })

  it('fails as a whole when one of several cues is missing', () => {
    const result = retimeText(SRT, 'srt', [
      { from: { start: 1000, end: 2500, occurrence: 0 }, to: { start: 1000, end: 2400 } },
      { from: { start: 9000, end: 9500, occurrence: 0 }, to: { start: 9000, end: 9600 } },
    ])
    expect(result.ok).toBe(false)
  })

  it('addresses the second of two cues with the same range', () => {
    const text = '00:00:01,000 --> 00:00:02,000\na\n\n00:00:01,000 --> 00:00:02,000\nb'
    const result = retimeText(text, 'srt', [{ from: { start: 1000, end: 2000, occurrence: 1 }, to: { start: 1100, end: 2000 } }])
    expect(result).toEqual({ ok: true, text: '00:00:01,000 --> 00:00:02,000\na\n\n00:00:01,100 --> 00:00:02,000\nb' })
  })

  it('moves an LRC start, in centiseconds when the tag had two digits', () => {
    const text = '[ti:x]\n[00:01.50]one\n[00:03.00]two'
    const result = retimeText(text, 'lrc', [{ from: { start: 1500, end: 1500, occurrence: 0 }, to: { start: 1730, end: 1730 } }])
    expect(result).toEqual({ ok: true, text: '[ti:x]\n[00:01.73]one\n[00:03.00]two' })
  })

  it('reads a three-digit LRC fraction as milliseconds', () => {
    const result = retimeText('[01:02.050]x', 'lrc', [{ from: { start: 62_050, end: 62_050, occurrence: 0 }, to: { start: 62_100, end: 62_100 } }])
    expect(result).toEqual({ ok: true, text: '[01:02.100]x' })
  })

  it('says so when the cue is not in the text', () => {
    const result = retimeText(SRT, 'srt', [{ from: { start: 9000, end: 9500, occurrence: 0 }, to: { start: 9000, end: 9600 } }])
    expect(result.ok).toBe(false)
  })
})

describe('writeTiming', () => {
  it('rewrites only the timecode, keeps the original once as .bak, and leaves CRLF and tags alone', () => {
    const bytes = put('S01E01', 'a.en.srt', SRT)
    const first = writeTiming(root, EMPTY_STATE, { episode: 'S01E01', edits: [edit('a.en.srt', bytes, [1000, 2500], [1200, 2600])] })
    expect(first).toEqual({ status: 200, payload: { ok: true, code: 'saved', reason: null, files: ['a.en.srt'] } })
    const after = readFileSync(join(root, 'S01E01', 'a.en.srt'), 'utf8')
    expect(after).toBe(SRT.replace('00:00:01,000 --> 00:00:02,500', '00:00:01,200 --> 00:00:02,600'))
    expect(readFileSync(join(root, 'S01E01', 'a.en.srt.bak'), 'utf8')).toBe(SRT)

    // A second save edits the new file and leaves the backup as the file first was.
    const now = readFileSync(join(root, 'S01E01', 'a.en.srt'))
    writeTiming(root, EMPTY_STATE, { episode: 'S01E01', edits: [edit('a.en.srt', now, [1200, 2600], [1300, 2600])] })
    expect(readFileSync(join(root, 'S01E01', 'a.en.srt.bak'), 'utf8')).toBe(SRT)
  })

  it('keeps GB18030 bytes around the timecode exactly as they were', () => {
    // 「你好」 in GB18030, which is not valid UTF-8.
    const chinese = Buffer.from([0xc4, 0xe3, 0xba, 0xc3])
    const bytes = Buffer.concat([Buffer.from('1\n00:00:01,000 --> 00:00:02,000\n'), chinese, Buffer.from('\n')])
    put('S01E01', 'a.zh.srt', bytes)
    const result = writeTiming(root, EMPTY_STATE, { episode: 'S01E01', edits: [edit('a.zh.srt', bytes, [1000, 2000], [900, 2000])] })
    expect(result.payload.ok).toBe(true)
    expect(readFileSync(join(root, 'S01E01', 'a.zh.srt'))).toEqual(
      Buffer.concat([Buffer.from('1\n00:00:00,900 --> 00:00:02,000\n'), chinese, Buffer.from('\n')]),
    )
  })

  it('writes a UTF-16 file back as UTF-16 with its byte-order mark', () => {
    const text = '1\n00:00:01,000 --> 00:00:02,000\n你好\n'
    const bytes = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, 'utf16le')])
    put('S01E01', 'a.srt', bytes)
    writeTiming(root, EMPTY_STATE, { episode: 'S01E01', edits: [edit('a.srt', bytes, [1000, 2000], [1000, 2400])] })
    const after = readFileSync(join(root, 'S01E01', 'a.srt'))
    expect([after[0], after[1]]).toEqual([0xff, 0xfe])
    expect(after.subarray(2).toString('utf16le')).toBe(text.replace('00:00:02,000', '00:00:02,400'))
  })

  it('refuses a page that read an older file, and writes nothing', () => {
    const bytes = put('S01E01', 'a.en.srt', SRT)
    writeFileSync(join(root, 'S01E01', 'a.en.srt'), `${SRT}\r\n`)
    const result = writeTiming(root, EMPTY_STATE, { episode: 'S01E01', edits: [edit('a.en.srt', bytes, [1000, 2500], [1200, 2500])] })
    expect(result.status).toBe(409)
    expect(result.payload.code).toBe('stale')
    expect(existsSync(join(root, 'S01E01', 'a.en.srt.bak'))).toBe(false)
  })

  it('checks both files before writing either', () => {
    const english = put('S01E01', 'a.en.srt', SRT)
    const chinese = put('S01E01', 'a.zh.srt', '1\n00:00:01,100 --> 00:00:02,400\n你好\n')
    const result = writeTiming(root, EMPTY_STATE, {
      episode: 'S01E01',
      edits: [
        edit('a.en.srt', english, [1000, 2500], [1200, 2500]),
        // The Chinese cue is not at this range, so the request fails as a whole.
        edit('a.zh.srt', chinese, [1000, 2500], [1200, 2500]),
      ],
    })
    expect(result.status).toBe(409)
    expect(readFileSync(join(root, 'S01E01', 'a.en.srt'), 'utf8')).toBe(SRT)
  })

  it('refuses ranges that are too short, files that are not subtitles, and escapes', () => {
    const bytes = put('S01E01', 'a.en.srt', SRT)
    const short = writeTiming(root, EMPTY_STATE, { episode: 'S01E01', edits: [edit('a.en.srt', bytes, [1000, 2500], [1000, 1100])] })
    expect(short.payload.code).toBe('refused')
    const audio = writeTiming(root, EMPTY_STATE, { episode: 'S01E01', edits: [edit('a.mp3', bytes, [1000, 2500], [1000, 2400])] })
    expect(audio.payload.code).toBe('refused')
    const escape = writeTiming(root, EMPTY_STATE, { episode: '..', edits: [edit('a.en.srt', bytes, [1000, 2500], [1000, 2400])] })
    expect(escape.status).toBe(404)
    const twice = writeTiming(root, EMPTY_STATE, {
      episode: 'S01E01',
      edits: [edit('a.en.srt', bytes, [1000, 2500], [1000, 2400]), edit('a.en.srt', bytes, [1000, 2500], [1000, 2300])],
    })
    expect(twice.payload.reason).toBe('同一句只能改一次')
  })

  it('moves a start earlier and the previous end with it, in one write', () => {
    const bytes = put('S01E01', 'a.en.srt', SRT)
    const result = writeTiming(root, EMPTY_STATE, {
      episode: 'S01E01',
      edits: [edit('a.en.srt', bytes, [3000, 4000], [2200, 4000]), edit('a.en.srt', bytes, [1000, 2500], [1000, 2200])],
    })
    expect(result.payload).toEqual({ ok: true, code: 'saved', reason: null, files: ['a.en.srt'] })
    expect(readFileSync(join(root, 'S01E01', 'a.en.srt'), 'utf8')).toBe(
      SRT.replace('00:00:01,000 --> 00:00:02,500', '00:00:01,000 --> 00:00:02,200').replace(
        '00:00:03,000 --> 00:00:04,000',
        '00:00:02,200 --> 00:00:04,000',
      ),
    )
  })

  it('edits a loose file at the library root, and refuses a picked file outside it', () => {
    const outside = makeTempDir('lingualab-outside-')
    try {
      for (const [folder, expected] of [
        [root, 200],
        [outside, 403],
      ] as const) {
        writeFileSync(join(folder, 'talk.mp3'), 'x')
        writeFileSync(join(folder, 'talk.srt'), SRT)
        const path = realpathSync(join(folder, 'talk.mp3'))
        const id = fileEpisodeIdFor(path)
        const state = withOpenedFile(EMPTY_STATE, {
          id,
          path,
          title: 'talk',
          place: 'lib',
          rel: 'talk.mp3',
          audio: 'talk.mp3',
          subtitleEn: 'talk.srt',
          subtitleZh: null,
          openedAt: 1,
        })
        const result = writeTiming(root, state, { episode: id, edits: [edit('talk.srt', Buffer.from(SRT), [1000, 2500], [1100, 2500])] })
        expect(result.status).toBe(expected)
      }
    } finally {
      rmSync(outside, { recursive: true, force: true })
    }
  })
})
