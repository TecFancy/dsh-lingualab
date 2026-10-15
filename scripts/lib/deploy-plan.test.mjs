import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SERVICE, compareVersions, readDeployConfig, remoteCommands, shQuote, sshArgs, versionOf,
} from './deploy-plan.mjs'

const env = (changes = {}) => ({
  LINGUALAB_DEPLOY_HOST: 'my-server',
  LINGUALAB_DEPLOY_PATH: '/srv/dsh/repos/dsh-lingualab',
  ...changes,
})

describe('readDeployConfig', () => {
  it('reads host and path, and defaults the service', () => {
    expect(readDeployConfig(env()).config).toEqual({
      host: 'my-server',
      path: '/srv/dsh/repos/dsh-lingualab',
      service: DEFAULT_SERVICE,
    })
  })

  it('takes the service from the environment and trims stray whitespace', () => {
    const { config } = readDeployConfig(env({ LINGUALAB_DEPLOY_SERVICE: ' other.service ', LINGUALAB_DEPLOY_HOST: ' h ' }))
    expect(config).toMatchObject({ service: 'other.service', host: 'h' })
  })

  it('lists every missing variable at once', () => {
    const { problems } = readDeployConfig({})
    expect(problems).toEqual(['没有设 LINGUALAB_DEPLOY_HOST', '没有设 LINGUALAB_DEPLOY_PATH'])
  })

  it('refuses a host that ssh would read as an option or that carries shell characters', () => {
    expect(readDeployConfig(env({ LINGUALAB_DEPLOY_HOST: '-oProxyCommand=x' })).problems).toHaveLength(1)
    expect(readDeployConfig(env({ LINGUALAB_DEPLOY_HOST: 'h; rm -rf /' })).problems).toHaveLength(1)
  })

  it('reads //data/x as /data/x, the spelling that keeps Git Bash from rewriting the path', () => {
    expect(readDeployConfig(env({ LINGUALAB_DEPLOY_PATH: '//data/repo' })).config.path).toBe('/data/repo')
  })

  it('names the Git Bash rewrite when the path came out as a Windows path', () => {
    const { problems } = readDeployConfig(env({ LINGUALAB_DEPLOY_PATH: 'C:/Program Files/Git/data/repo' }))
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('Windows 路径')
    expect(readDeployConfig(env({ LINGUALAB_DEPLOY_PATH: String.raw`D:\x` })).problems[0]).toContain('Windows 路径')
  })

  it('refuses a relative path and a service name with spaces or separators', () => {
    expect(readDeployConfig(env({ LINGUALAB_DEPLOY_PATH: 'repos/x' })).problems[0]).toContain('绝对路径')
    expect(readDeployConfig(env({ LINGUALAB_DEPLOY_SERVICE: 'a b' })).problems[0]).toContain('服务名')
    expect(readDeployConfig(env({ LINGUALAB_DEPLOY_SERVICE: 'a;b' })).problems[0]).toContain('服务名')
  })
})

describe('shQuote', () => {
  it('wraps in single quotes and closes and reopens around an embedded one', () => {
    expect(shQuote('/a b/c')).toBe("'/a b/c'")
    expect(shQuote("it's")).toBe(`'it'\\''s'`)
  })
})

describe('sshArgs and remoteCommands', () => {
  it('builds an argument array with BatchMode, so no local shell parses the command', () => {
    expect(sshArgs('my-server', 'uptime')).toEqual(['-o', 'BatchMode=yes', 'my-server', 'uptime'])
  })

  it('builds the four remote commands from the configured path and service', () => {
    const commands = remoteCommands({ path: '/srv/lingualab', service: 'dsh-web.service' })
    expect(commands.pull).toBe("cd '/srv/lingualab' && git pull --ff-only")
    expect(commands.manifest).toBe("cd '/srv/lingualab' && cat package.json")
    expect(commands.restart).toBe("sudo -n systemctl restart 'dsh-web.service'")
    expect(commands.active).toBe("systemctl is-active 'dsh-web.service'")
    expect(commands.logs).toContain("journalctl -u 'dsh-web.service'")
  })

  it('keeps a path with a quote in it as one word', () => {
    expect(remoteCommands({ path: "/srv/it's", service: 's' }).pull).toContain(`'/srv/it'\\''s'`)
  })
})

describe('versionOf', () => {
  it('reads the version, and null for anything unreadable', () => {
    expect(versionOf('{"name":"x","version":"0.14.3"}')).toBe('0.14.3')
    expect(versionOf('not json')).toBeNull()
    expect(versionOf('{"name":"x"}')).toBeNull()
    expect(versionOf('')).toBeNull()
  })
})

describe('compareVersions', () => {
  it('is ok when the server matches origin/main', () => {
    expect(compareVersions('0.14.4', '0.14.4')).toMatchObject({ ok: true })
  })

  it('names both versions on a mismatch', () => {
    const verdict = compareVersions('0.14.3', '0.14.4')
    expect(verdict.ok).toBe(false)
    expect(verdict.message).toContain('0.14.3')
    expect(verdict.message).toContain('0.14.4')
  })

  it('is not ok when either side cannot be read', () => {
    expect(compareVersions(null, '0.14.4').ok).toBe(false)
    expect(compareVersions('0.14.4', null).ok).toBe(false)
  })
})
