/**
 * How a grade is named and keyed on screen, the same on a kept sentence's card and on the review
 * strip. What a grade *is* lives with the notes format (`gradeOf`, `withGrade`).
 */
import { GIVEN_GRADES, type GivenGrade, type Grade } from '../notes-format.ts'

/** The dictionary key of each grade's name. */
export const GRADE_LABELS: Readonly<Record<Grade, string>> = {
  new: 'gradeNew',
  fuzzy: 'gradeFuzzy',
  notyet: 'gradeNotYet',
  got: 'gradeGot',
}

/** The key that gives a grade: `1` 「记住了」, `2` 「模糊」, `3` 「没记住」. */
export function gradeKey(grade: GivenGrade): string {
  return String(GIVEN_GRADES.indexOf(grade) + 1)
}

/** The grade a key gives, or `null` for any other key. */
export function gradeForKey(key: string): GivenGrade | null {
  return GIVEN_GRADES[Number(key) - 1] ?? null
}
