/**
 * Conventional commits, adapted for a Chinese-language repo.
 *
 * The useful half of the convention is kept: a known type, a colon, a non-empty
 * subject, a blank line before the body. The half that assumes English prose is
 * turned off, because it only produces noise here:
 *
 *   · subject-case        — Chinese has no letter case
 *   · subject-full-stop   — a Chinese 。 at the end of a subject is normal writing
 *   · header-max-length   — 120, not 100: Chinese packs more meaning per character
 *   · body-max-line-length — warned about (1), never fails a commit
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0],
    'subject-full-stop': [0],
    'header-max-length': [2, 'always', 120],
    'body-max-line-length': [1, 'always', 200],
  },
}
