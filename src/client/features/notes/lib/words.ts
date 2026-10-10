/**
 * Words kept inside a sentence's note.
 *
 * A word picked from the stage is stored in the note of the sentence it came from,
 * as `[word]`, so it stays in the one file the agent already reads and needs no new
 * field in the notes format. The brackets are what make a word findable again: the
 * popover asks whether `[word]` is already there, and a note the reader typed by hand
 * is never mistaken for one.
 */

/** The marker a word carries inside a note. */
function marked(word: string): string {
  return `[${word.trim()}]`
}

/** Whether the note already holds this word, ignoring case. */
export function noteHasWord(note: string, word: string): boolean {
  return note.toLowerCase().includes(marked(word).toLowerCase())
}

/** The note with the word added at the end; unchanged when it is already there. */
export function addWordToNote(note: string, word: string): string {
  const clean = word.trim()
  if (clean.length === 0 || noteHasWord(note, clean)) return note
  return note.length === 0 ? marked(clean) : `${note} ${marked(clean)}`
}

/**
 * A note pulled apart for display: the [word] markers as a list, and what is left as text.
 * The stored note is never changed by this, only shown differently.
 */
export function splitNote(note: string): { readonly words: readonly string[]; readonly text: string } {
  const words: string[] = []
  const text = note
    .replace(/\[([^\]]+)\]/g, (_match, word: string) => {
      words.push(word.trim())
      return ' '
    })
    .replace(/\s+/g, ' ')
    .trim()
  return { words, text }
}