/**
 * Public API of the video feature: the routes `src/index.ts` mounts, and what the host tests
 * beside it read.
 */
export { videoCancelRoute, videoPrepareRoute, videoRoute } from './api/video.route.ts'
export { createVideoJobs } from './model/video-jobs.ts'
