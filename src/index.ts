/**
 * dsh-lingualab — host half.
 *
 * The panel is a browser page, so the things it cannot do for itself are the
 * things this half owns: say where the library is, list what is in it, let the
 * reader browse to material that is not in the library yet, receive the files the
 * reader drops on the page, hand over the bytes of one episode, and read or write the
 * notes.
 *
 * Everything is read from disk on demand rather than cached at load time. The
 * material arrives by hand between sessions or through the import route, so a library
 * snapshot taken at boot would be stale exactly when it matters most: right after a
 * new episode lands.
 *
 * Each route is built in `host/<name>.route.ts`, beside the rules it calls; this file
 * holds the config and mounts them.
 *
 * Routes live under `/lingualab/`, clear of the module system's `/plugins` prefix
 * route, and every one of them is declared in `dsh-plugin.naming.json` — `npm run
 * verify` compares the two so a renamed route cannot silently outlive its record.
 *
 * The one thing this half *does* remember is which episode is open: a file episode
 * is identified by a hash of its path, and only the plugin can turn that id back
 * into a file. It is persisted in this plugin's own config (`openState`), through
 * the settings service, so the profile remains the single home for plugin state.
 */
import z from '@deepseek-ai/schemastery'
import type { HostContext } from './host-context.ts'
import { browseRoute, placesRoute } from './host/browse.route.ts'
import { configRoute } from './host/config.route.ts'
import { settingsOf } from './host/config.ts'
import { realSpawn } from './host/ffmpeg.ts'
import { guarded } from './host/guard.ts'
import { importRoute } from './host/import.route.ts'
import { libraryRoute } from './host/library.route.ts'
import { fileMediaRoute, mediaRoute } from './host/media.route.ts'
import { notesRoute } from './host/notes.route.ts'
import { openRoute } from './host/open.route.ts'
import { progressRoute } from './host/progress.route.ts'
import { reviewRoute } from './host/review.route.ts'
import { parseState, serializeState, type OpenState } from './host/state.ts'
import { subtitleChoiceRoute } from './host/subtitle-choice.route.ts'
import { timingRoute } from './host/timing.route.ts'
import { createVideoJobs } from './host/video-jobs.ts'
import { videoCancelRoute, videoPrepareRoute, videoRoute } from './host/video.route.ts'

/** Stable plugin name (the composition row id is `lingualab`). */
export const name = 'lingualab'

/**
 * Without a web carrier there is nowhere to serve the library from, and nowhere
 * for the shell to fetch the client bundle either.
 */
export const inject = ['webServer']

/**
 * A config field the settings service may rewrite while the plugin is running.
 *
 * A volatile field is a box, not a value: reading it goes through `get()`. The
 * service writes into the box and the plugin sees the new value on its next read,
 * which is why this half resolves the root per request instead of caching it at
 * load.
 */
export interface VolatileField<T> {
  get(): T
}

/** Where the media library lives, and what the scan should do with it. */
export interface Config {
  /**
   * Absolute path to the library root: one folder per episode.
   *
   * Left empty, the plugin falls back to `<first workspace>/notes/learning/english/media`,
   * which is where the study method puts material. The panel can set this value
   * from the page, and a value set there lands in the same place as one written
   * into the profile's patch file.
   *
   * Declared volatile so the settings service will write it while the plugin is
   * running. Without that marker the write is refused — "entry has no volatile
   * fields" — and the folder card can only report what it cannot change.
   */
  libraryRoot: VolatileField<string>
  /**
   * What the plugin remembers between requests, as JSON.
   *
   * Only file episodes need it: a folder episode is rediscovered by the scan, while
   * an audio file picked out of a workspace is known by a hash of its path, and the
   * notes written against it have nowhere else to live. Volatile for the same
   * reason as `libraryRoot` — the panel writes it, and the write has to be allowed.
   */
  openState: VolatileField<string>
  /**
   * Where `ffmpeg` and `ffprobe` are, when they are not on `PATH`: a folder holding both, or the
   * path of either binary.
   *
   * Optional. Without the two, an `mp4` or `webm` video that plays as it is still plays, and one
   * that needs preparing says so with the command that installs them. Volatile, so it can be set
   * from the Plugins page and takes effect on the next request without a restart.
   */
  ffmpegPath: VolatileField<string>
}

// No `z<Config>` annotation: `.volatile()` widens the schema's meta type, and the
// asserted form stops compiling. The exported interface above still documents the
// fields and types `apply`.
export const Config = z.object({
  libraryRoot: z.string().default('').volatile(),
  openState: z.string().default('').volatile(),
  ffmpegPath: z.string().default('').volatile(),
})

/** Mount every route. The config is read per request, so edits need no reload. */
export function apply(ctx: HostContext, config: Config): void {
  // Through the box: a volatile field holds the value, and the settings service can
  // replace it while this closure is still alive.
  const configured = (): string => {
    try {
      return config.libraryRoot.get()
    } catch {
      return ''
    }
  }

  /**
   * The state as this process last saw it.
   *
   * The config field is the durable copy, but a plugin cannot assume the box it
   * reads reflects a write made moments ago in the same process — the settings
   * service owns when that lands. So the first read parses the field and every
   * write updates this copy, which is what the next request reads. A hand edit of
   * the profile is picked up at the next restart, which is when a hand edit of a
   * profile is expected to arrive.
   */
  let live: OpenState | null = null
  const readState = (): OpenState => {
    if (live !== null) return live
    let raw = ''
    try {
      raw = config.openState.get()
    } catch {
      // Left empty: a box that cannot be read reads as nothing remembered.
    }
    live = parseState(raw)
    return live
  }
  const writeState = async (next: OpenState): Promise<void> => {
    live = next
    const settings = settingsOf(ctx)
    if (settings === null) return
    try {
      await settings.update(name, { openState: serializeState(next) })
    } catch {
      // The in-process copy is what the next request reads, so a failed write costs
      // the memory at restart, not the session in progress.
    }
  }

  // The same box rule for `ffmpegPath`; a config without the field (an older profile, a test) reads as empty.
  const ffmpegPath = (): string => {
    try {
      return config.ffmpegPath?.get() ?? ''
    } catch {
      return ''
    }
  }
  const jobs = createVideoJobs(realSpawn)
  // A job still running when the plugin goes away is stopped, so its process and its `.part` do not outlive it.
  ctx.effect(() => () => void jobs.cancel(), 'lingualab: stop the preparing job')

  // Every route goes through the host's request trust, reads included; see `guard.ts`.
  const routes = [
    configRoute(ctx, configured, name),
    placesRoute(ctx, configured, readState),
    browseRoute(ctx, configured),
    openRoute(ctx, configured, readState, writeState),
    importRoute(ctx, configured),
    libraryRoute(ctx, configured, readState),
    mediaRoute(ctx, configured),
    fileMediaRoute(readState),
    notesRoute(ctx, configured, readState, writeState),
    reviewRoute(ctx, configured, readState),
    progressRoute(ctx, configured),
    timingRoute(ctx, configured, readState),
    subtitleChoiceRoute(ctx, configured, readState, writeState),
    videoRoute(ctx, configured, ffmpegPath, jobs),
    videoPrepareRoute(ctx, configured, ffmpegPath, jobs),
    videoCancelRoute(jobs),
  ].map((route) => guarded(ctx, route))
  for (const route of routes) {
    ctx.effect(() => ctx.webServer.register(route), `lingualab: ${route.kind} ${route.path}`)
  }
}
