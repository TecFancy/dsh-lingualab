/**
 * The one primitive this plugin takes from the platform's frozen module table.
 *
 * Declared here instead of imported: the harness client packages are not on npm,
 * and this repository's rule is that a client half must not depend on a Harness
 * Client package. The shell seeds `@deepseek-ai/dsh-client-ui-primitives` into the
 * module table that answers the bundle's `require` calls, so the runtime side is
 * already there; this file only describes the sliver of it the launcher row draws.
 *
 * Narrower than the real module on purpose: a prop that is missing here cannot be
 * passed by accident, and the row is the only thing this plugin renders inside
 * somebody else's menu.
 */
declare module '@deepseek-ai/dsh-client-ui-primitives' {
  import type { ComponentType, ReactNode } from 'react'

  /** One row of a menu: an icon, a label, and the click that selects it. */
  interface MenuItemButtonProps {
    readonly children?: ReactNode
    readonly icon?: ReactNode
    readonly disabled?: boolean
    readonly separatorBefore?: boolean
    readonly onSelect?: () => void
  }

  export const MenuItemButton: ComponentType<MenuItemButtonProps>
}
