import { describe, expect, it } from 'vitest'
import type { Cue, SubtitleTrack } from '../../../entities/cue/index.ts'
import type { TimingSession } from '../model/types.ts'
import { timingSession } from './session.ts'
import { timingWrite } from './write.ts'

const cues: Cue[] = [
  { start: 1, end: 2, text: 'One', origin: { start: 1000, end: 2000, occurrence: 0 } },
  { start: 3, end: 4.5, text: 'Two', origin: { start: 3000, end: 4500, occurrence: 0 } },
  { start: 5, end: 6, text: 'Three', origin: { start: 5000, end: 6000, occurrence: 0 } },
]

const english: SubtitleTrack = { file: 'lines.srt', hash: 'hash' }

function open(): TimingSession {
  const session = timingSession(1, { start: 2800, end: 5300 }, 'start', cues, false, 10_000)
  if (session === null) throw new Error('the session did not build')
  return session
}

describe('timingWrite', () => {
  it('writes the open range and reports the neighbour a step is going to', () => {
    const request = timingWrite(open(), cues, english, null, 2)
    expect(request?.edits.map((edit) => edit.to.start)).toContain(2800)
    expect(request?.saved).toMatchObject({
      index: 1,
      target: 2,
      after: { start: 2800, end: 5300 },
      pushed: [{ index: 2, before: { start: 5000, end: 6000 }, after: { start: 5300, end: 6000 } }],
    })
  })

  it('has no target for a plain save', () => {
    expect(timingWrite(open(), cues, english, null, null)?.saved.target).toBeNull()
  })

  it('cannot write a cue it cannot match to the subtitle file', () => {
    expect(timingWrite(open(), cues, null, null, null)).toBeNull()
  })
})
