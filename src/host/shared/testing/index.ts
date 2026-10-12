/**
 * Public API of the testing segment: temporary folders, a listening server, a scripted ffmpeg and the scene folders the host
 * tests share. Tests import it; the routes never do.
 */
export { makeTempDir } from './test-dir.ts'
export { audioProbe, fakeSpawn, type FakeSpawn, MKV_H264_DTS, MKV_HEVC, MP4_DIRECT } from './test-ffmpeg.ts'
export { listenForFetch } from './test-listen.ts'
export { SCENE_STEMS, sceneNames, writeScenes } from './test-scenes.ts'
