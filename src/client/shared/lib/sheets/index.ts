/**
 * The parts of the page stylesheet that live in files of their own, because `styles.ts` is at its size limit.
 *
 * `styles.ts` interpolates each at its place in the sheet; the rules are the page's like any other, and
 * `styles.test.ts` reads them through `STYLES`. They share a folder so that `shared/lib` stays under the
 * module count Steiger allows.
 */
export { HOME_STYLES } from './home.ts'
export { SCRUB_STYLES } from './scrub.ts'
export { SIDE_STYLES } from './side.ts'
export { SPEED_STYLES } from './speed.ts'
