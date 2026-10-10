/** Public API of the import-media feature: dropped files into the library. */
export { folderForSubtitle, useImport, type FileOutcome, type ImportState } from './model/useImport.ts'
export { kindOf, planDrop, stemOf, type DropGroup, type DropPlan } from './lib/group.ts'
