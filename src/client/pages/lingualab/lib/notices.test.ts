// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { VideoNoticeData } from '../../../widgets/video-stage/index.ts'
import {
  chooseNotice,
  micNoticeOf,
  mismatchNoticeOf,
  mismatchOf,
  noticeActionOf,
  raisedNoticeOf,
  type ChosenNotice,
} from './notices.ts'

/** A translator that shows what it was asked, so a test can see which message and which numbers. */
const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`

const notice = (kind: VideoNoticeData['kind'], text: string = kind): VideoNoticeData => ({ kind, text, action: 'ok' })

describe('mismatchOf', () => {
  it('has no warning while no picture plays', () => {
    expect(mismatchOf(false, null, null, 12)).toBeNull()
    expect(mismatchOf(false, 'blob:x', 5, 12)).toBeNull()
  })

  it('takes the served video\'s own warning when the reader has no file of their own', () => {
    expect(mismatchOf(true, null, null, 12)).toBe(12)
    expect(mismatchOf(true, null, 99, 12)).toBe(12)
  })

  it('holds the reader\'s own file against the video first', () => {
    expect(mismatchOf(true, 'blob:x', 5, 12)).toBe(5)
    expect(mismatchOf(true, 'blob:x', -3, 12)).toBe(-3)
  })

  it('falls back to the served video\'s warning when the reader\'s file matches', () => {
    expect(mismatchOf(true, 'blob:x', null, 12)).toBe(12)
  })

  it('has no warning when nothing differs', () => {
    expect(mismatchOf(true, null, null, null)).toBeNull()
    expect(mismatchOf(true, null, null, undefined)).toBeNull()
    expect(mismatchOf(true, 'blob:x', null, null)).toBeNull()
  })
})

describe('mismatchNoticeOf', () => {
  it('says a longer video is longer, with the seconds', () => {
    expect(mismatchNoticeOf(8, 'E1::a', new Set(), t)).toEqual({ kind: 'mismatch', text: 'noticeMismatch:8', action: 'cardGotIt' })
  })

  it('says a shorter one is shorter, with the seconds unsigned', () => {
    expect(mismatchNoticeOf(-8, 'E1::a', new Set(), t)).toEqual({
      kind: 'mismatch',
      text: 'noticeMismatchShorter:8',
      action: 'cardGotIt',
    })
  })

  it('is gone once dismissed for the segment, and only for that segment', () => {
    const dismissed = new Set(['E1::a'])
    expect(mismatchNoticeOf(8, 'E1::a', dismissed, t)).toBeNull()
    expect(mismatchNoticeOf(8, 'E1::b', dismissed, t)).not.toBeNull()
  })

  it('is absent without a warning or without a segment', () => {
    expect(mismatchNoticeOf(null, 'E1::a', new Set(), t)).toBeNull()
    expect(mismatchNoticeOf(8, null, new Set(), t)).toBeNull()
  })
})

describe('raisedNoticeOf', () => {
  it('keeps a notice the page raised', () => {
    const ready = notice('ready')
    expect(raisedNoticeOf(ready, null, false)).toBe(ready)
    const warn = notice('warn')
    expect(raisedNoticeOf(warn, null, true)).toBe(warn)
  })

  it('has nothing without one', () => {
    expect(raisedNoticeOf(null, 'shown', false)).toBeNull()
  })

  it('drops the blind-watch notice once the reader changed the picture by hand, when there is nothing left to undo', () => {
    expect(raisedNoticeOf(notice('blind'), null, false)).toBeNull()
    const blind = notice('blind')
    expect(raisedNoticeOf(blind, 'shown', false)).toBe(blind)
  })

  it('drops 「视频准备好了」 while the reader\'s own file plays instead of the served video', () => {
    expect(raisedNoticeOf(notice('ready'), null, true)).toBeNull()
  })
})

describe('micNoticeOf', () => {
  it('says what each microphone problem is', () => {
    expect(micNoticeOf('denied', t)).toEqual({ kind: 'warn', text: 'micDenied', action: 'cardGotIt' })
    expect(micNoticeOf('unsupported', t)?.text).toBe('micUnsupported')
    expect(micNoticeOf('unavailable', t)?.text).toBe('micUnavailable')
    expect(micNoticeOf('blocked', t)?.text).toBe('micBlocked')
  })

  it('has nothing to say without a problem', () => {
    expect(micNoticeOf(null, t)).toBeNull()
  })
})

describe('chooseNotice', () => {
  const mic = notice('warn', 'mic')
  const raised = notice('ready', 'raised')
  const mismatch = notice('mismatch', 'mismatch')

  it('puts the microphone first, because the reader has just acted on it', () => {
    expect(chooseNotice(mic, raised, mismatch)).toEqual({ notice: mic, source: 'mic' })
  })

  it('then what the page raised', () => {
    expect(chooseNotice(null, raised, mismatch)).toEqual({ notice: raised, source: 'raised' })
  })

  it('then the length warning', () => {
    expect(chooseNotice(null, null, mismatch)).toEqual({ notice: mismatch, source: 'mismatch' })
  })

  it('shows nothing when there is nothing', () => {
    expect(chooseNotice(null, null, null)).toBeNull()
  })
})

describe('noticeActionOf', () => {
  const chosen = (kind: VideoNoticeData['kind'], source: ChosenNotice['source']): ChosenNotice => ({
    notice: notice(kind),
    source,
  })

  it('tells the store a microphone problem has been said', () => {
    expect(noticeActionOf(chosen('warn', 'mic'), 'E1::a')).toBe('clear-mic')
  })

  it('puts the picture back for the blind-watch notice', () => {
    expect(noticeActionOf(chosen('blind', 'raised'), null)).toBe('restore-picture')
  })

  it('dismisses the length warning for its segment', () => {
    expect(noticeActionOf(chosen('mismatch', 'mismatch'), 'E1::a')).toBe('dismiss-mismatch')
  })

  it('just drops any other notice', () => {
    expect(noticeActionOf(chosen('ready', 'raised'), 'E1::a')).toBe('clear')
    expect(noticeActionOf(chosen('warn', 'raised'), 'E1::a')).toBe('clear')
    expect(noticeActionOf(chosen('mismatch', 'mismatch'), null)).toBe('clear')
  })
})
