/**
 * What a folder episode's id may look like.
 *
 * The notes, the timing edits and the subtitle choice all join an id onto the library root, so
 * they all ask the same question before they touch the disk. It sits in a module of its own
 * because it belongs to none of them.
 */

/** Episode ids name a folder, so they may not contain separators or escapes. */
export function isSafeEpisodeId(id: string): boolean {
  return id.length > 0 && !id.includes('/') && !id.includes('\\') && id !== '.' && id !== '..'
}
