/**
 * The pure half of `npm run deploy`: configuration from the environment and the
 * remote commands, built as data.
 *
 * Nothing here is a secret and nothing here talks to a machine. The host, the
 * repository path on it and the service name come from environment variables so the
 * script carries no deployment's address; the commands are built from them with
 * every value validated or quoted, because they end up in a string that a remote
 * shell parses.
 */

export const DEFAULT_SERVICE = 'dsh-web.service'

export const ENV_HELP = [
  '部署目标从环境变量读：',
  '  LINGUALAB_DEPLOY_HOST      ssh 主机名（~/.ssh/config 里的别名也行）',
  '  LINGUALAB_DEPLOY_PATH      远端仓库的绝对路径',
  `  LINGUALAB_DEPLOY_SERVICE   可选，要重启的 systemd 服务，缺省 ${DEFAULT_SERVICE}`,
  '',
  '例（Git Bash，要先让它别改写路径，见下面的说明）：',
  '  export MSYS2_ENV_CONV_EXCL=LINGUALAB_DEPLOY_PATH',
  '  export LINGUALAB_DEPLOY_HOST=tencent-cloud',
  '  export LINGUALAB_DEPLOY_PATH=/workspace/lingualab',
  '例（PowerShell）：',
  '  $env:LINGUALAB_DEPLOY_HOST = "tencent-cloud"',
  '  $env:LINGUALAB_DEPLOY_PATH = "/workspace/lingualab"',
  '',
  'Git Bash 会把环境变量里的 /data/... 改写成 C:/Program Files/Git/data/...。',
  '用上面的 MSYS2_ENV_CONV_EXCL，或者把路径写成 //data/...（开头两个斜杠），或者换 PowerShell。',
].join('\n')

/** Quote one value for a POSIX shell: single quotes, with embedded ones closed and reopened. */
export function shQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`
}

/**
 * Read the deploy target. Returns `{ config }`, or `{ problems }` listing every
 * missing or malformed variable at once, so one run fixes the whole setup.
 */
export function readDeployConfig(env) {
  const host = (env.LINGUALAB_DEPLOY_HOST ?? '').trim()
  // `//data/x` is how Git Bash users keep MSYS from rewriting the path; POSIX reads it as `/data/x`.
  const path = (env.LINGUALAB_DEPLOY_PATH ?? '').trim().replace(/^\/{2,}/, '/')
  const service = (env.LINGUALAB_DEPLOY_SERVICE ?? '').trim() || DEFAULT_SERVICE
  const problems = []
  if (host === '') problems.push('没有设 LINGUALAB_DEPLOY_HOST')
  // A leading dash would be read by ssh as an option, which is a command-injection door.
  else if (!/^[A-Za-z0-9_@.:[\]-]+$/.test(host) || host.startsWith('-')) {
    problems.push(`LINGUALAB_DEPLOY_HOST 不像主机名：${host}`)
  }
  if (path === '') problems.push('没有设 LINGUALAB_DEPLOY_PATH')
  else if (/^[A-Za-z]:[\\/]/.test(path)) {
    problems.push(`LINGUALAB_DEPLOY_PATH 是 Windows 路径：${path}（Git Bash 改写了它，说明见下）`)
  } else if (!path.startsWith('/')) problems.push(`LINGUALAB_DEPLOY_PATH 要写绝对路径：${path}`)
  if (!/^[A-Za-z0-9_@.:-]+$/.test(service)) problems.push(`LINGUALAB_DEPLOY_SERVICE 不像服务名：${service}`)
  return problems.length > 0 ? { problems } : { config: { host, path, service } }
}

/** The ssh argument array: no local shell is involved, so Git Bash and PowerShell behave alike. */
export function sshArgs(host, remoteCommand) {
  return ['-o', 'BatchMode=yes', host, remoteCommand]
}

/** The remote commands, by name. */
export function remoteCommands({ path, service }) {
  return {
    pull: `cd ${shQuote(path)} && git pull --ff-only`,
    manifest: `cd ${shQuote(path)} && cat package.json`,
    restart: `sudo -n systemctl restart ${shQuote(service)}`,
    active: `systemctl is-active ${shQuote(service)}`,
    logs: `sudo -n journalctl -u ${shQuote(service)} -n 30 --no-pager`,
  }
}

/** The `version` field of a package.json's text, or `null` when it cannot be read. */
export function versionOf(manifestText) {
  try {
    const version = JSON.parse(manifestText).version
    return typeof version === 'string' ? version : null
  } catch {
    return null
  }
}

/** Compare the version on the server with the one on origin/main. */
export function compareVersions(deployed, expected) {
  if (deployed === null) return { ok: false, message: '读不到服务器上 package.json 的版本' }
  if (expected === null) return { ok: false, message: `服务器是 ${deployed}，但读不到 origin/main 的版本，没法比` }
  if (deployed !== expected) {
    return { ok: false, message: `服务器是 ${deployed}，origin/main 是 ${expected}：服务器没拉到最新，或者 main 还没发版` }
  }
  return { ok: true, message: `服务器与 origin/main 都是 ${deployed}` }
}
