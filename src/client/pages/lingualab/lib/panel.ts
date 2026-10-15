/**
 * The words the page and the code split out of it share for what is on screen.
 *
 * They were three local types of the page; the hooks that open an episode and the keymap now speak them too, so they
 * live in one place instead of being spelled again where they are read.
 */

/** Which view the page shows. */
export type View = 'home' | 'practice'

/** Which layer is over the page. Only one at a time; the steps popover is not a layer. */
export type Layer = 'none' | 'browse' | 'folder' | 'segments'

/** What the right column shows: the subtitles, or the sentences kept from them. */
export type Column = 'transcript' | 'kept'
