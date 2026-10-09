/**
 * Dropping files on the page, and what the page is told about it.
 *
 * Uploads run one file at a time, audio before its subtitles. Parallel uploads would
 * finish sooner on paper and be worse in use: two gigabyte files competing for one
 * local connection both take longer to show anything, while a sequence gives the page
 * a true "2 of 5" and lets the first episode become playable as soon as it is whole.
 *
 * Every file's outcome is kept, not just the overall one. "Saved", "already there" and
 * "refused, and why" are three different things to tell somebody who dropped twelve
 * files, and collapsing them into a single success flag would hide exactly the file
 * they are about to wonder about.
 *
 * Two rules about a group of files that belong together:
 *
 *   · **Subtitles follow their audio.** If the audio is refused, its subtitles are not
 *     sent. They would create a folder with subtitles and nothing to play, which the home
 *     hides and which cannot be opened.
 *   · **A subtitle with no audio in the drop** joins the episode folder it names, when
 *     one exists. Adding a translation the next day is a normal thing to do, and "no audio
 *     found" would be the wrong answer to it.
 */
import { useCallback, useRef, useState } from 'react'
import { importMedia } from '../../../shared/lib/api.ts'
import { sameStem } from '../../../shared/stem.ts'
import { planDrop, type DropPlan } from '../lib/group.ts'

/** What happened to one file. */
export interface FileOutcome {
  readonly name: string
  readonly episode: string
  readonly status: 'saved' | 'exists' | 'refused' | 'skipped'
  readonly reason: string | null
}

/** The visible state of an import. */
export interface ImportState {
  /** True from the first byte sent until the last file is answered. */
  readonly busy: boolean
  /** Files answered so far, and how many there are in all. */
  readonly done: number
  readonly total: number
  /** The file being sent now, so the page can name it. */
  readonly current: string | null
  readonly outcomes: readonly FileOutcome[]
  /** Subtitles that matched no audio and no existing episode: they were not imported. */
  readonly unmatched: readonly string[]
  readonly ignored: readonly string[]
  /** The episode to open when the import finished, or `null` when nothing landed. */
  readonly lastEpisode: string | null
  /** Send these files. Resolves with the episode worth opening, or `null`. */
  readonly start: (files: readonly File[]) => Promise<string | null>
  /** Forget the last result, so the page returns to its resting state. */
  readonly dismiss: () => void
}

/** How often a "the host is busy" answer is retried, and how long to wait between tries. */
const BUSY_RETRIES = 6
const BUSY_WAIT_MS = 800

/** Wait, for the retry. A function so a test can stand in for the clock. */
const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * The folder an episode's loose subtitle belongs to, if the library has one.
 *
 * Matches the subtitle's stem against existing episode folder names with the same rule the
 * host pairs by (the folder name, then a separator), longest name first.
 * @param subtitle - the subtitle file's name.
 * @param folders - the episode folder names the library lists.
 */
export function folderForSubtitle(subtitle: string, folders: readonly string[]): string | null {
  let best: string | null = null
  for (const folder of folders) {
    if (sameStem(subtitle, folder) && (best === null || folder.length > best.length)) best = folder
  }
  return best
}

/** Import dropped or picked files into the library. */
export function useImport(onFinished: () => void, existingFolders: readonly string[] = []): ImportState {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(0)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState<string | null>(null)
  const [outcomes, setOutcomes] = useState<readonly FileOutcome[]>([])
  const [unmatched, setUnmatched] = useState<readonly string[]>([])
  const [ignored, setIgnored] = useState<readonly string[]>([])
  const [lastEpisode, setLastEpisode] = useState<string | null>(null)
  // A second drop while one is running would interleave two sequences and double-count
  // `done`; the ref is the guard, because state would not update in time to refuse it.
  const running = useRef(false)

  const start = useCallback(
    async (files: readonly File[]): Promise<string | null> => {
      if (running.current || files.length === 0) return null
      running.current = true

      const plan: DropPlan<File> = planDrop(files, (file) => file.name)

      // Subtitles with no audio in this drop may still belong to an episode that exists.
      const adopted: { file: File; episode: string }[] = []
      const orphans: File[] = []
      for (const file of plan.unmatched) {
        const folder = folderForSubtitle(file.name, existingFolders)
        if (folder === null) orphans.push(file)
        else adopted.push({ file, episode: folder })
      }

      const groups = plan.groups.map((group) => ({
        episode: group.episode,
        audio: group.audio,
        subtitles: group.subtitles,
      }))
      const total = groups.reduce((sum, group) => sum + 1 + group.subtitles.length, 0) + adopted.length

      setBusy(true)
      setDone(0)
      setTotal(total)
      setOutcomes([])
      setUnmatched(orphans.map((file) => file.name))
      setIgnored(plan.ignored.map((file) => file.name))
      setLastEpisode(null)

      const results: FileOutcome[] = []
      let first: string | null = null

      /** Send one file, retrying while the host says it is busy, and record the outcome. */
      const send = async (file: File, episode: string): Promise<boolean> => {
        setCurrent(file.name)
        let answer = await importMedia(file, episode)
        for (let attempt = 0; attempt < BUSY_RETRIES && answer.retryable === true; attempt += 1) {
          await pause(BUSY_WAIT_MS)
          answer = await importMedia(file, episode)
        }
        results.push({ name: file.name, episode: answer.episode ?? episode, status: answer.code, reason: answer.reason })
        setOutcomes([...results])
        setDone(results.length)
        // The episode worth opening is the first one that has audio on disk, whether this
        // drop put it there or it was already there.
        if (first === null && answer.ok && answer.episode !== null) first = answer.episode
        return answer.ok
      }

      try {
        for (const group of groups) {
          const audioOk = await send(group.audio, group.episode)
          for (const subtitle of group.subtitles) {
            if (audioOk) {
              await send(subtitle, group.episode)
              continue
            }
            // Not attempted: the audio did not land, so these would only make an empty episode.
            results.push({
              name: subtitle.name,
              episode: group.episode,
              status: 'skipped',
              reason: `没有导入，因为 ${group.audio.name} 没有导入成功`,
            })
            setOutcomes([...results])
            setDone(results.length)
          }
        }
        for (const item of adopted) await send(item.file, item.episode)
      } finally {
        running.current = false
        setBusy(false)
        setCurrent(null)
      }

      setLastEpisode(first)
      if (results.some((result) => result.status === 'saved')) onFinished()
      return first
    },
    [onFinished, existingFolders],
  )

  const dismiss = useCallback(() => {
    setOutcomes([])
    setUnmatched([])
    setIgnored([])
    setLastEpisode(null)
    setDone(0)
    setTotal(0)
  }, [])

  return { busy, done, total, current, outcomes, unmatched, ignored, lastEpisode, start, dismiss }
}
