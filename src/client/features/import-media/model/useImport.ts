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
 */
import { useCallback, useRef, useState } from 'react'
import { importMedia } from '../../../shared/lib/api.ts'
import { planDrop, type DropPlan } from '../lib/group.ts'

/** What happened to one file. */
export interface FileOutcome {
  readonly name: string
  readonly episode: string
  readonly status: 'saved' | 'exists' | 'refused'
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
  /** Subtitles that matched no audio file, and files that were not media. */
  readonly unmatched: readonly string[]
  readonly ignored: readonly string[]
  /** The episode to open when the import finished, or `null` when nothing landed. */
  readonly lastEpisode: string | null
  /** Send these files. Resolves with the episode worth opening, or `null`. */
  readonly start: (files: readonly File[]) => Promise<string | null>
  /** Forget the last result, so the page returns to its resting state. */
  readonly dismiss: () => void
}

/** Import dropped or picked files into the library. */
export function useImport(onFinished: () => void): ImportState {
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
      const queue = plan.groups.flatMap((group) =>
        [group.audio, ...group.subtitles].map((file) => ({ file, episode: group.episode })),
      )

      setBusy(true)
      setDone(0)
      setTotal(queue.length)
      setOutcomes([])
      setUnmatched(plan.unmatched.map((file) => file.name))
      setIgnored(plan.ignored.map((file) => file.name))
      setLastEpisode(null)

      const results: FileOutcome[] = []
      let first: string | null = null
      try {
        for (const item of queue) {
          setCurrent(item.file.name)
          const answer = await importMedia(item.file, item.episode)
          results.push({
            name: item.file.name,
            episode: answer.episode ?? item.episode,
            status: answer.code,
            reason: answer.reason,
          })
          setOutcomes([...results])
          setDone(results.length)
          // The episode worth opening is the first one that actually has audio on disk,
          // whether this drop put it there or it was already there.
          if (first === null && answer.ok && answer.episode !== null) first = answer.episode
        }
      } finally {
        running.current = false
        setBusy(false)
        setCurrent(null)
      }

      setLastEpisode(first)
      if (results.some((result) => result.status === 'saved')) onFinished()
      return first
    },
    [onFinished],
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
