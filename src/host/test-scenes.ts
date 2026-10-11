/**
 * A folder episode cut into scenes, in the shape the real study material arrives in.
 *
 * Shared by the tests that need one: pairing, the library scan, opening, notes. The names
 * are copied from a real `S01E01` (ten scenes, each an `.mp3`, an English `.srt` and a
 * `_双语.srt` that carries a Chinese line above the English one); the contents are made up.
 * Two of the scenes (`04` and `06`) have a hyphen in the title, which is what makes the
 * longest-stem rule matter.
 *
 * Lives beside the tests it serves and is not part of the bundle: nothing in `src/index.ts`
 * imports it.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/** The scene stems, in the order a person would number them. */
export const SCENE_STEMS = [
  '01_Dunphy家的早晨',
  '02_足球场',
  '03_机场',
  '04_Dunphy家-Luke射击',
  '05_车里-Manny的初恋',
  '06_Dunphy家-Dylan来了',
  '07_商场',
  '08_Claire撞见Haley',
  '09_家庭晚宴',
  '10_尾声',
] as const

/** English only, as the plain `.srt` of a scene is. */
export const ENGLISH_SRT = '1\n00:00:01,000 --> 00:00:03,000\nKids, breakfast!\n'

/** The bilingual file: an ASS style tag and the Chinese line, then the English one. */
export const BILINGUAL_SRT =
  '1\n00:00:01,000 --> 00:00:03,000\n{\\fs16\\an2\\b0}孩子们 吃早饭了\nKids, breakfast!\n'

/** The files of a folder that are not media, and which the scan has to look past. */
export const EXTRA_FILES = ['S01E01_player.html', 'S01E01_场景划分字幕.md', 'notes.md'] as const

/**
 * Write the whole folder: three files per scene, plus the files that are not media.
 * @param folder - the episode folder; created when it does not exist.
 * @param stems - the scenes to write, in any order.
 */
export function writeScenes(folder: string, stems: readonly string[] = SCENE_STEMS): void {
  mkdirSync(folder, { recursive: true })
  for (const stem of stems) {
    writeFileSync(join(folder, `${stem}.mp3`), `audio:${stem}`)
    writeFileSync(join(folder, `${stem}.srt`), ENGLISH_SRT)
    writeFileSync(join(folder, `${stem}_双语.srt`), BILINGUAL_SRT)
  }
  for (const name of EXTRA_FILES) writeFileSync(join(folder, name), name === 'notes.md' ? '# S01E01 笔记\n' : 'x')
}

/** Every file name `writeScenes` writes, for tests that classify names without a disk. */
export function sceneNames(stems: readonly string[] = SCENE_STEMS): string[] {
  return [...stems.flatMap((stem) => [`${stem}.mp3`, `${stem}.srt`, `${stem}_双语.srt`]), ...EXTRA_FILES]
}
