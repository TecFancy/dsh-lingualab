// @vitest-environment node
/**
 * The hook's callbacks, rendered to a string: the render derives the stage phrase and the marks, and calling the
 * callbacks outside it checks what each asks of the notes. How cues and phrases are matched is `stage-notes.test.ts`'s.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { Cue } from '../../../entities/cue/index.ts'
import type { NotesState } from '../../../features/notes/index.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'
import { useStageNotes, type StageNotes } from './useStageNotes.ts'

const renderToStaticMarkup = render as (element: ReactElement) => string

const cues: Cue[] = [
  { start: 10.2, end: 12, text: 'First line' },
  { start: 12.5, end: 14, text: 'Second line\n第二句' },
]

const phrase = (at: number, text: string, over: Partial<NotePhrase> = {}): NotePhrase => ({
  at,
  text,
  zh: '',
  note: '',
  tags: [],
  done: false,
  ...over,
})

function setup(phrases: NotePhrase[], over: { activeIndex?: number; toggle?: NotesState['toggle'] } = {}) {
  const notes = {
    phrases,
    toggle: over.toggle ?? vi.fn(() => 'added' as const),
    add: vi.fn(() => true),
    update: vi.fn(),
  } as unknown as NotesState
  const onProtected = vi.fn()
  let stage: StageNotes | undefined
  function Probe() {
    stage = useStageNotes({ notes, cues, activeIndex: over.activeIndex ?? 1, segmentId: null, onProtected })
    return <span>probe</span>
  }
  renderToStaticMarkup(<Probe />)
  if (stage === undefined) throw new Error('the hook did not render')
  return { stage, notes, onProtected }
}

describe('useStageNotes', () => {
  it('finds the kept phrase of the sentence on stage and marks the kept rows', () => {
    const { stage } = setup([phrase(12, 'Second line', { note: 'n' })])
    expect(stage.stagePhrase?.index).toBe(0)
    expect([...stage.notedIndexes]).toEqual([1])
  })

  it('has no stage phrase for a sentence that is not kept', () => {
    const { stage } = setup([], { activeIndex: 0 })
    expect(stage.stagePhrase).toBeNull()
    expect(stage.notedIndexes.size).toBe(0)
  })

  describe('keep', () => {
    it('keeps the sentence on stage by default', () => {
      const { stage, notes } = setup([])
      stage.keep()
      expect(notes.toggle).toHaveBeenCalledWith({
        at: 12.5,
        text: 'Second line',
        zh: '第二句',
        note: '',
        tags: [],
        done: false,
        segment: undefined,
      })
    })

    it('keeps the row it is given', () => {
      const { stage, notes } = setup([])
      stage.keep(0)
      expect(notes.toggle).toHaveBeenCalledWith(expect.objectContaining({ at: 10.2, text: 'First line' }))
    })

    it('does nothing for a row that is not there', () => {
      const { stage, notes } = setup([])
      stage.keep(9)
      expect(notes.toggle).not.toHaveBeenCalled()
    })

    it('shows the kept sentences when the star is refused because work is behind it', () => {
      const { stage, onProtected } = setup([], { toggle: vi.fn(() => 'protected' as const) })
      stage.keep()
      expect(onProtected).toHaveBeenCalledTimes(1)
    })

    it('stays quiet when the star went through', () => {
      const { stage, onProtected } = setup([])
      stage.keep()
      expect(onProtected).not.toHaveBeenCalled()
    })
  })

  describe('toggleWord', () => {
    it('keeps the sentence with the word in its note when it is not kept', () => {
      const { stage, notes } = setup([])
      stage.toggleWord('skirt')
      expect(notes.add).toHaveBeenCalledWith(expect.objectContaining({ at: 12.5, text: 'Second line', note: '[skirt]' }))
      expect(notes.update).not.toHaveBeenCalled()
    })

    it('puts the word into the note of the sentence when it is kept', () => {
      const { stage, notes } = setup([phrase(12, 'Second line', { note: 'who said it' })])
      stage.toggleWord('skirt')
      expect(notes.update).toHaveBeenCalledWith(0, { note: 'who said it [skirt]' })
      expect(notes.add).not.toHaveBeenCalled()
    })

    it('takes the word out again when the note holds it', () => {
      const { stage, notes } = setup([phrase(12, 'Second line', { note: 'who said it [skirt]' })])
      stage.toggleWord('skirt')
      expect(notes.update).toHaveBeenCalledWith(0, { note: 'who said it' })
    })

    it('does nothing when there is no sentence on stage', () => {
      const { stage, notes } = setup([], { activeIndex: 9 })
      stage.toggleWord('skirt')
      expect(notes.add).not.toHaveBeenCalled()
    })
  })

  describe('gradeStage', () => {
    it('grades the kept sentence on stage', () => {
      const { stage, notes } = setup([phrase(12, 'Second line')])
      stage.gradeStage('got')
      expect(notes.update).toHaveBeenCalledWith(0, expect.objectContaining({ done: true }))
    })

    it('has no grade to give a sentence that is not kept', () => {
      const { stage, notes } = setup([], { activeIndex: 0 })
      stage.gradeStage('got')
      expect(notes.update).not.toHaveBeenCalled()
    })
  })
})
