## What changed and why

<!-- One short paragraph: what this PR does and which problem it solves. Then the notable points as bullets. -->

-

## How it was verified

Only list commands you actually ran, with the result next to them. Leave out commands you skipped; if you ran none, write "no commands run".

- `npm run verify` — result:
- `node scripts/verify.mjs --fast` — result:
- `npm run typecheck` / `npm run test` / `npm run build` / `npm run lint` — result, when you only touched one area:

Close the section with one `Verification: <command> <result>` line, for example `Verification: npm run verify 19 items pass`. CI runs `npm run verify` in the `verify` workflow on pull requests into `development` or `main`.

## Risk and rollback

<!-- What this touches (host code, client code, the committed lib/, locale, docs), what breaks if it is wrong, and how to undo it. -->

-

## Related issues

<!-- Optional. No issue number required; link anything that adds context. -->

-
