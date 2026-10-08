/**
 * dsh-lingualab — the slice of the Client plugin context this plugin uses.
 *
 * Typed here instead of imported from the harness on purpose: the platform's
 * client packages are not on npm, and this repository's rule is that a client
 * half must not depend on a Harness Client package. This file describes the seam
 * and nothing more — a wider context still satisfies it, and a mismatch fails
 * loudly at runtime when the rail row or the page never appears.
 *
 * Derived from the same seam `dsh-apps-panel` uses, minus the parts a study page
 * does not need.
 */
import type { ComponentType } from 'react'

/** Translate one dictionary key. The locale seat hands this to a registered component. */
export type Translate = (key: string, params?: Record<string, unknown>) => string

/** The locale service slice this plugin uses. */
export interface LocaleService {
  /** Register dictionaries for a namespace; returns the disposer that removes them. */
  register(namespace: string, dictionaries: Record<string, Record<string, string>>): () => void
  /** Bind the namespace to a translate function whose identity is stable per namespace. */
  bind(namespace: string): Translate
}

/** The registration fields this plugin passes. The host accepts more. */
export interface SlotRegistration {
  readonly name: string
  /** List slots address an entry by `id`; keyed slots by `key`. These two must agree. */
  readonly id?: string
  readonly key?: string
  /** Ascending position in a list slot. */
  readonly order?: number
  /** Locale namespace whose keys this entry translates. */
  readonly locale?: string
  /** Row label, read again on every projection, so a thunk follows the active locale. */
  readonly label?: string | (() => string)
  /** Extra props handed to the component, on top of the slot's standard kit. */
  readonly inject?: () => Record<string, unknown>
}

/** The slot service slice this plugin uses. */
export interface SlotsService {
  /** Contribute to a slot once its owner exists; the callback returns its own disposer. */
  inject(name: string, contribute: () => () => void): void
  /** Register one entry. The component's props are the host's business, so `P` stays free. */
  register<P>(registration: SlotRegistration, component: ComponentType<P>): () => void
}

/** The layout service slice this plugin uses. */
export interface LayoutService {
  /** Switch the centre column; `null` returns to the conversation. */
  selectPanel(id: string | null): void
}

/** The Client plugin context an `apply` receives. */
export interface PluginContext {
  readonly slots: SlotsService
  readonly locale: LocaleService
  readonly layout: LayoutService
  /** Run a setup call and keep its disposer for teardown. */
  effect(setup: () => (() => void) | void, label?: string): void
}

/** Props the `main` slot injects, on top of the standard kit. */
export interface PanelProps {
  /** Return the centre column to the conversation. */
  readonly back?: () => void
}
