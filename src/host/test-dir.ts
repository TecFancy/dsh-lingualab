/**
 * A temporary directory the way the code under test will spell it.
 *
 * `os.tmpdir()` can hand back a path in 8.3 short form on Windows (`C:\Users\EXAMP~1\...`),
 * while the host canonicalises every path it works with to the long form
 * (`C:\Users\Example\...`). A test that builds an expected path from the first and
 * compares it with what the host returns fails on the spelling, not on the behaviour.
 * Creating the directory through its canonical name once, here, makes every expectation
 * built from it agree with what the host reports.
 *
 * Lives beside the tests it serves and is not part of the bundle: nothing in `src/index.ts`
 * imports it.
 */
import { mkdtempSync, realpathSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * Make a fresh temporary directory under the canonical temp root.
 * @param prefix - the directory name prefix.
 * @returns the directory's absolute path, in the form the host will report it.
 */
export function makeTempDir(prefix: string): string {
  return mkdtempSync(join(realpathSync.native(tmpdir()), prefix))
}
