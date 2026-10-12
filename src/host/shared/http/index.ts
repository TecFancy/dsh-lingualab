/**
 * Public API of the http segment: the host's request trust, and the content types, Range handling and small answers every
 * route shares.
 */
export { guarded } from './guard.ts'
export {
  contentTypeOf,
  methodAllowed,
  readJsonBody,
  refuseText,
  resolveMediaPath,
  sendJson,
  serveFile,
  serveMedia,
} from './media.ts'
