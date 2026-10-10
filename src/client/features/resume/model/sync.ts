/**
 * Keeping this browser's cache and the host's copy of the progress in step.
 *
 * One request does both directions: the page posts everything it has, the host merges it
 * into the library's progress file (newest `updatedAt` per episode wins) and answers with
 * the merged table, which becomes the new cache. That is why a second device needs nothing
 * special: on load it asks, and what the first device left comes back.
 *
 * When it runs:
 *
 *   · once when the page opens, so the home shows the place you stopped on another device;
 *   · a few seconds after a local change, throttled rather than debounced, because the step
 *     timer changes the cache every second and a debounce would never fire while it ran;
 *   · when the tab becomes visible again, so a device left open picks up the other one's
 *     progress without a reload;
 *   · when the tab is hidden, with `keepalive`, so closing the tab does not lose the last
 *     seconds.
 *
 * Nothing here is allowed to be loud: a host that is down or has no library just leaves the
 * cache as it was, and the page keeps working from it.
 */
import { syncProgress } from '../../../shared/lib/api.ts'
import { mergeProgress, sameProgress, sanitizeProgress } from '../../../shared/progress.ts'
import { readTable, writeTable } from './store.ts'

/** How long after a local change the host is told. */
const PUSH_DELAY_MS = 4000

/** A keepalive request body may not exceed 64 KB; leave room for headers. */
const KEEPALIVE_LIMIT = 60_000

let started = 0
let pushTimer: ReturnType<typeof setTimeout> | null = null
let running = false
let again = false
const listeners = new Set<() => void>()

function notify(): void {
  for (const listener of listeners) listener()
}

/** Exchange tables with the host once, and adopt what comes back. Resolves true when the host answered. */
export async function syncNow(keepalive = false): Promise<boolean> {
  if (running) {
    again = true
    return false
  }
  running = true
  try {
    const sent = readTable()
    const payload = await syncProgress(sent, keepalive && JSON.stringify(sent).length < KEEPALIVE_LIMIT)
    if (payload === null) return false
    // The cache may have moved while the request was in flight, so merge into what is there now.
    const current = readTable()
    const merged = mergeProgress(current, sanitizeProgress(payload))
    if (!sameProgress(merged, current)) {
      writeTable(merged)
      notify()
    }
    return payload.ok
  } finally {
    running = false
    if (again) {
      again = false
      schedulePush()
    }
  }
}

/** Tell the host about a local change soon. Does nothing until the page has started syncing. */
export function schedulePush(): void {
  if (started === 0 || pushTimer !== null) return
  pushTimer = setTimeout(() => {
    pushTimer = null
    void syncNow()
  }, PUSH_DELAY_MS)
}

/**
 * Start syncing for as long as the page is mounted.
 * @param onMerged - called when a sync changed the cache, so the page can re-read it.
 * @returns the disposer.
 */
export function startProgressSync(onMerged: () => void): () => void {
  started += 1
  listeners.add(onMerged)
  void syncNow()

  const onVisibility = (): void => {
    if (document.visibilityState === 'hidden') {
      // Only worth a request if something here is newer than what the host last returned.
      if (pushTimer !== null) {
        clearTimeout(pushTimer)
        pushTimer = null
      }
      void syncNow(true)
    } else {
      void syncNow()
    }
  }
  document.addEventListener('visibilitychange', onVisibility)
  return () => {
    document.removeEventListener('visibilitychange', onVisibility)
    listeners.delete(onMerged)
    started -= 1
    if (started === 0 && pushTimer !== null) {
      clearTimeout(pushTimer)
      pushTimer = null
      void syncNow(true)
    }
  }
}
