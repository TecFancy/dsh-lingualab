/**
 * Steiger configuration: the FSD rules for both halves.
 *
 * Steiger's CLI takes one root, so `npm run lint:fsd` runs it twice with this
 * same configuration.
 *
 * `src/client` holds five of FSD's six layers: `shared`, `entities`, `features`,
 * `widgets` and `pages`. There is no `app` layer, and that is the point rather
 * than an omission: a plugin does not own its application shell. Registration,
 * providers and routing belong to the host, so `index.tsx` sits at the root of the
 * analysed tree and wires the host's slots to this plugin's page.
 *
 * `src/host` holds the lower three: `shared`, `entities` and `features`. The host
 * composes no UI, so there is nothing for `widgets` or `pages` to hold, and
 * `src/index.ts` sits beside the analysed tree rather than in it, collecting the
 * routes the features export.
 *
 * Two rules are relaxed, each for a reason that would not apply to a full
 * application:
 *
 *   · `fsd/insignificant-slice` — a plugin page has exactly one consumer by
 *     definition. Waiting for a second one before a widget may exist would mean
 *     no widgets at all. On the host, most slices have one consumer too: the
 *     route in a feature, or `src/index.ts` that mounts it.
 *   · `fsd/repetitive-naming` — every class name and file in this repository is
 *     prefixed with the plugin id, because a stylesheet rendered into the host
 *     document is not scoped by anything.
 *
 * The cross-half contract in `src/shared/` is reachable from the tree through the
 * two bridge modules (`shared/protocol.ts`, `shared/notes-format.ts`). Steiger
 * does not flag imports that resolve outside the analysed root, so those bridges
 * need no exception here; each one explains itself in its own header. The host
 * half imports `src/shared/` directly, for the same reason.
 */
import fsd from '@feature-sliced/steiger-plugin'

export default [
  ...fsd.configs.recommended,
  {
    rules: {
      'fsd/insignificant-slice': 'off',
      'fsd/repetitive-naming': 'off',
    },
  },
]
