/**
 * Public API of the ffmpeg segment: finding `ffmpeg` and `ffprobe`, and starting them.
 */
export {
  type Binaries,
  type Child,
  findBinaries,
  installCommandFor,
  realSpawn,
  runToEnd,
  type Spawn,
} from './ffmpeg.ts'
