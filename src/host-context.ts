/**
 * dsh-lingualab — the slice of the Host plugin context this half uses.
 *
 * Written here rather than imported from the harness packages: the services are
 * declared by packages that are not published on npm, and this repository's rule
 * is that a half describes the seam it calls instead of depending on the whole
 * harness. The seam is small on purpose — a web carrier, an effect helper, and
 * the two optional services we degrade without.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'

/** Route match kind: `exact` wins over any `prefix`, longest prefix wins after that. */
export type WebRouteKind = 'exact' | 'prefix'

/** One named HTTP route. Duplicate `(kind, path)` pairs are a composition error. */
export interface WebRoute {
  readonly kind: WebRouteKind
  readonly path: string
  readonly handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
}

/** The browser HTTP carrier. */
export interface WebServerService {
  /** Register the route; returns the disposer that removes it. */
  register(route: WebRoute): () => void
}

/** One workspace the host knows about, as far as this plugin cares. */
export interface WorkspaceRef {
  readonly id: string
  readonly path: string
}

/**
 * Workspace registry, used only to guess a default library root.
 *
 * Not declared as an injection, and that distinction is load-bearing: reading it
 * through the context property throws when the service is absent, while
 * `ctx.get(name)` answers `undefined`. The host half therefore reaches it through
 * `ctx.get`, and a deployment without it simply reports "no folder chosen yet".
 */
export interface WorkspaceRegistryService {
  list(): readonly WorkspaceRef[]
}

/**
 * Settings service, as far as this plugin uses it.
 *
 * `update` merges fields into this plugin's own profile entry — the same place the
 * Plugins page writes, and the same place the config is read from at load. Using it
 * keeps one home for `libraryRoot`; a private state file would be a second home, and
 * the two would disagree the first time either was edited by hand.
 */
export interface SettingsService {
  update(namespace: string, patch: object, expectedRevision?: number): Promise<void>
}

/** The Host plugin context an `apply` receives. */
export interface HostContext {
  readonly webServer: WebServerService
  /**
   * Do not read the registry as a property; see {@link WorkspaceRegistryService}.
   * Kept in the type so a caller passing the real context still type-checks.
   */
  readonly workspaceRegistry?: never
  /**
   * Read an optional service. Used for `settings`, which is not declared as an
   * injection: a deployment without it still serves the library, it just cannot save
   * a new root from the page.
   */
  get?(name: string): unknown
  /** Run a setup call and keep its disposer for teardown. */
  effect(setup: () => (() => void) | void, label?: string): void
}
