import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findBinaries, installCommandFor, runToEnd, type FindEnv } from './ffmpeg.ts'
import { fakeSpawn } from './test-ffmpeg.ts'

/** A machine with exactly these files and folders. */
function machine(platform: NodeJS.Platform, files: readonly string[], folders: readonly string[], path = ''): FindEnv {
  return {
    platform,
    path,
    isFile: (candidate) => files.includes(candidate),
    isDirectory: (candidate) => folders.includes(candidate),
  }
}

describe('findBinaries', () => {
  const bin = join('opt', 'ff')

  it('finds both on PATH, first match first', () => {
    const one = join('one', 'bin')
    const two = join('two', 'bin')
    const env = machine(
      'linux',
      [join(two, 'ffmpeg'), join(two, 'ffprobe'), join(one, 'ffmpeg')],
      [],
      `${one}:${two}`,
    )
    expect(findBinaries('', env)).toEqual({ ffmpeg: join(two, 'ffmpeg'), ffprobe: join(two, 'ffprobe') })
  })

  it('needs the pair: ffmpeg alone is not enough', () => {
    expect(findBinaries('', machine('linux', [join('x', 'ffmpeg')], [], 'x'))).toBeNull()
  })

  it('looks for .exe on Windows, split on semicolons, and ignores quotes and blanks', () => {
    const env = machine('win32', [join('C:', 'ff', 'ffmpeg.exe'), join('C:', 'ff', 'ffprobe.exe')], [], `;"C:\\nowhere";"${join('C:', 'ff')}"`)
    expect(findBinaries('', env)?.ffmpeg).toBe(join('C:', 'ff', 'ffmpeg.exe'))
  })

  it('takes a configured folder, and its bin folder', () => {
    const files = [join(bin, 'ffmpeg'), join(bin, 'ffprobe')]
    expect(findBinaries(bin, machine('linux', files, [bin]))).toEqual({ ffmpeg: files[0], ffprobe: files[1] })
    const nested = join(bin, 'bin')
    const inBin = [join(nested, 'ffmpeg'), join(nested, 'ffprobe')]
    expect(findBinaries(bin, machine('linux', inBin, [bin]))?.ffmpeg).toBe(inBin[0])
  })

  it('takes a configured path of either binary and finds the other beside it', () => {
    const files = [join(bin, 'ffmpeg'), join(bin, 'ffprobe')]
    expect(findBinaries(files[0] ?? '', machine('linux', files, []))?.ffprobe).toBe(files[1])
    expect(findBinaries(files[1] ?? '', machine('linux', files, []))?.ffmpeg).toBe(files[0])
  })

  it('does not fall back to PATH when a configured path is wrong', () => {
    const files = [join('x', 'ffmpeg'), join('x', 'ffprobe')]
    expect(findBinaries(join('nope', 'ffmpeg'), machine('linux', files, [], 'x'))).toBeNull()
    expect(findBinaries(join('nope'), machine('linux', files, [], 'x'))).toBeNull()
  })

  it('refuses a configured file that is not one of the two binaries', () => {
    const odd = join(bin, 'curl')
    expect(findBinaries(odd, machine('linux', [odd, join(bin, 'ffmpeg'), join(bin, 'ffprobe')], []))).toBeNull()
  })
})

describe('installCommandFor', () => {
  it('names the usual installer of each platform', () => {
    expect(installCommandFor('win32')).toBe('winget install Gyan.FFmpeg')
    expect(installCommandFor('darwin')).toBe('brew install ffmpeg')
    expect(installCommandFor('linux')).toBe('sudo apt install ffmpeg')
  })
})

describe('runToEnd', () => {
  it('collects stdout of a process that succeeds', async () => {
    const fake = fakeSpawn(() => ({ ok: true }))
    expect(await runToEnd(fake.spawn, 'ffprobe', ['x'])).toBe('{"ok":true}')
  })

  it('answers null when the process fails, or cannot start', async () => {
    expect(await runToEnd(fakeSpawn(() => null).spawn, 'ffprobe', ['x'])).toBeNull()
    const refusing = fakeSpawn(() => null, { failToStart: true })
    expect(await runToEnd(refusing.spawn, 'ffmpeg', ['x'])).toBeNull()
  })
})
