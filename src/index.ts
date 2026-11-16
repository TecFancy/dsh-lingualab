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
 * `src/host/` is FSD's lower three layers. Each route is built in its feature's `api/`
 * segment (`host/features/<name>/api/<name>.route.ts`), beside the rules it calls; this
 * file holds the config and mounts them.
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
import { fileURLToPath } from 'node:url'
import z from '@deepseek-ai/schemastery'
import type { HostContext } from './host-context.ts'
import { parseState, serializeState, type OpenState } from './host/entities/open-state/index.ts'
import { browseRoute, placesRoute } from './host/features/browse/index.ts'
import { importRoute } from './host/features/import/index.ts'
import { configRoute } from './host/features/library-config/index.ts'
import { libraryRoute } from './host/features/library/index.ts'
import { fileMediaRoute, mediaRoute } from './host/features/media/index.ts'
import { notesRoute } from './host/features/notes/index.ts'
import { openRoute } from './host/features/open/index.ts'
import { progressRoute } from './host/features/progress/index.ts'
import { reviewRoute } from './host/features/review/index.ts'
import { subtitleChoiceRoute } from './host/features/subtitle-choice/index.ts'
import { timingRoute } from './host/features/timing/index.ts'
import { createUpdateChecker, readPluginInfo, updateRoute } from './host/features/update/index.ts'
import {
  createVideoJobs,
  videoCancelRoute,
  videoPrepareRoute,
  videoRoute,
} from './host/features/video/index.ts'
import { resolveRoot, settingsOf } from './host/shared/config/index.ts'
import { findBinaries, realSpawn } from './host/shared/ffmpeg/index.ts'
import { guarded } from './host/shared/http/index.ts'
import { createTelemetry, readPackageManifest, type Telemetry } from './host/shared/telemetry/index.ts'

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
  /**
   * The anonymous id sent with the usage ping, generated once.
   *
   * Hidden because it is not a value anyone would choose: it exists so that two pings from one
   * installation count as one machine. Volatile so the plugin can write it back through the
   * settings service; empty until the first admitted request needs it.
   */
  installId: VolatileField<string>
  /**
   * Whether to send the anonymous usage ping.
   *
   * On by default, and deliberately visible in the Plugins page: a statistics switch that cannot
   * be found is an opt-out only in name. Set it to `false` and no id is generated, the library is
   * not listed, and no request is made.
   */
  telemetry: boolean
}

// No `z<Config>` annotation: `.volatile()` widens the schema's meta type, and the
// asserted form stops compiling. The exported interface above still documents the
// fields and types `apply`.
export const Config = z.object({
  libraryRoot: z.string().default('').volatile(),
  openState: z.string().default('').volatile(),
  ffmpegPath: z.string().default('').volatile(),
  installId: z.string().default('').volatile().hidden(true),
  telemetry: z.boolean().default(true),
})

/**
 * Wire the anonymous usage ping to this plugin's config and readers.
 *
 * Kept out of `apply` so the composition stays readable. Every reader is a closure rather than a
 * value because the config box can be replaced while the process runs, and because the ping reads
 * the library root and the ffmpeg search once a day rather than once per request.
 * @param ctx - the host context, read for the settings service and the workspace list.
 * @param config - the plugin's config.
 * @param packageRoot - the folder holding `package.json`, read once here.
 * @param configured - the configured library root, or `''`.
 * @param ffmpegPath - the configured ffmpeg path, or `''`.
 * @returns the hook the request guard calls after it admits a request.
 */
function telemetryFor(
  ctx: HostContext,
  config: Config,
  packageRoot: string,
  configured: () => string,
  ffmpegPath: () => string,
): Telemetry {
  return createTelemetry({
    enabled: () => config.telemetry !== false,
    installId: () => {
      try {
        return config.installId?.get() ?? ''
      } catch {
        return ''
      }
    },
    // Written through the settings service, never to a file of our own: the profile stays the one
    // home for plugin state. The promise is handed back rather than swallowed, so the reporter can
    // tell a write that landed from one that did not and retry the latter on the next ping; a
    // settings service that is not mounted yet is exactly that case, not a reason to give up.
    saveInstallId: async (id) => {
      const settings = settingsOf(ctx)
      if (settings === null) throw new Error('no settings service')
      await settings.update(name, { installId: id })
    },
    libraryRoot: () => resolveRoot(ctx, configured()).root,
    ffmpeg: () => findBinaries(ffmpegPath()) !== null,
    manifest: readPackageManifest(packageRoot),
  })
}

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
  // The version this process is running, read once: after a pull but before a restart the manifest
  // on disk already says the newer one, and that is not the code answering these requests.
  const packageRoot = fileURLToPath(new URL('..', import.meta.url))
  const pluginInfo = readPluginInfo(packageRoot)
  const updateChecker = createUpdateChecker(packageRoot, pluginInfo)

  const jobs = createVideoJobs(realSpawn)
  // A job still running when the plugin goes away is stopped, so its process and its `.part` do not outlive it.
  ctx.effect(() => () => void jobs.cancel(), 'lingualab: stop the preparing job')

  // The usage ping: no request of its own, no timer. It is started once a day by the guard below,
  // after a request has already been admitted, and swallows every failure; see `telemetry/`.
  const telemetry = telemetryFor(ctx, config, packageRoot, configured, ffmpegPath)

  // Every route goes through the host's request trust, reads included; see `guard.ts`.
  const routes = [
    configRoute(ctx, configured, name, pluginInfo),
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
    updateRoute(updateChecker),
  ].map((route) => guarded(ctx, route, telemetry.noteAdmitted))
  for (const route of routes) {
    ctx.effect(() => ctx.webServer.register(route), `lingualab: ${route.kind} ${route.path}`)
  }
}
