/** Public API of the notes feature: the phrases kept from one episode. */
export { MAX_PHRASES, useNotes, type NotesState, type SaveStatus } from './model/useNotes.ts'
export { groupBySegment, type NoteGroup, type NoteRow } from './lib/group.ts'
export { addWordToNote, noteHasWord, removeWordFromNote, splitNote } from './lib/words.ts'
