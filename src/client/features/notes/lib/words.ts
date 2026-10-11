/**
 * Words kept inside a sentence's note.
 *
 * A word picked from the stage is stored in the note of the sentence it came from,
 * as `[word]`, so it stays in the one file the agent already reads and needs no new
 * field in the notes format. The brackets are what make a word findable again: the
 * popover asks whether `[word]` is already there, and a note the reader typed by hand
 * is never mistaken for one.
 *
 * A "word" may be several: a phrase picked across words on the stage is kept as one marker,
 * `[her skirt]`, which the brackets already allow.
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
 * The note with the word taken out again, whatever its case; unchanged when it is not there.
 *
 * Only the `[...]` marker goes, and the one space that joined it to the rest, so the text the
 * reader typed around it reads as it did before the word was added.
 */
export function removeWordFromNote(note: string, word: string): string {
  const target = marked(word).toLowerCase()
  const at = note.toLowerCase().indexOf(target)
  if (word.trim().length === 0 || at < 0) return note
  const before = note.slice(0, at).replace(/ $/, '')
  const after = note.slice(at + target.length).replace(/^ /, '')
  return before.length > 0 && after.length > 0 ? `${before} ${after}` : `${before}${after}`
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