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
 * Not declared as a hard dependency: the plugin still works when the config
 * names an absolute root, which is how it is installed in practice. Without the
 * service and without a configured root the library reports an empty listing
 * with the path it tried, which is a readable failure rather than a crash.
 */
export interface WorkspaceRegistryService {
  list(): readonly WorkspaceRef[]
}

/** The Host plugin context an `apply` receives. */
export interface HostContext {
  readonly webServer: WebServerService
  readonly workspaceRegistry?: WorkspaceRegistryService
  /** Run a setup call and keep its disposer for teardown. */
  effect(setup: () => (() => void) | void, label?: string): void
}
