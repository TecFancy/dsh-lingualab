/**
 * Whether the host is showing its dark theme.
 *
 * dsh switches between day and night by putting the attribute `data-ds-dark-theme` on `<body>` (and
 * taking it off again), so that attribute's presence is the whole answer. It is read through
 * `useSyncExternalStore` with a `MutationObserver` on that one attribute, so a switch in the host
 * reaches the page without a reload, and the observer goes away with the last component that uses it.
 * Where there is no document (a test, a render on the server) the answer is light.
 */
import { useSyncExternalStore } from 'react'

/** The attribute the host sets on `<body>` while it is dark. */
const DARK_ATTRIBUTE = 'data-ds-dark-theme'

/** Whether the attribute is on the body right now. */
function readHostDark(): boolean {
  return typeof document !== 'undefined' && document.body !== null && document.body.hasAttribute(DARK_ATTRIBUTE)
}

/** Tell React when the attribute changes. */
function subscribe(onChange: () => void): () => void {
  if (typeof document === 'undefined' || document.body === null || typeof MutationObserver === 'undefined') {
    return () => undefined
  }
  const observer = new MutationObserver(onChange)
  observer.observe(document.body, { attributes: true, attributeFilter: [DARK_ATTRIBUTE] })
  return () => observer.disconnect()
}

/** True while the host is dark, kept current. */
export function useHostDark(): boolean {
  return useSyncExternalStore(subscribe, readHostDark, () => false)
}
