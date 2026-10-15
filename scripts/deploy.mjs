#!/usr/bin/env node
/**
 * Deploy the current `main` to the server: pull, restart, confirm it came back.
 *
 *   npm run deploy [-- --dry-run]
 *
 * It does what the manual line did (`git pull --ff-only` in the server's checkout,
 * then restart the service) and adds the two checks that line lacked: the version
 * now on the server is compared with origin/main's, and the service must report
 * `active` after the restart, or the script exits 1.
 *
 * The target comes from LINGUALAB_DEPLOY_HOST, LINGUALAB_DEPLOY_PATH and
 * (optionally) LINGUALAB_DEPLOY_SERVICE; see `scripts/lib/deploy-plan.mjs`. Every
 * ssh call is an argument array, so it works the same from Git Bash and PowerShell.
 * `--dry-run` prints the ssh commands and runs none of them.
 *
 * Whether the page actually works in a browser stays a manual check: this proves
 * the service is up, not that the change does what it should.
 */
import { dirname, join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { ENV_HELP, compareVersions, readDeployConfig, remoteCommands, sshArgs, versionOf } from './lib/deploy-plan.mjs'
import { createRunner, formatCommand } from './lib/run.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run')
const unknown = argv.filter((argument) => argument !== '--dry-run')
if (unknown.length > 0) {
  console.error(`❌ 不认识的参数：${unknown.join(' ')}\n用法：npm run deploy [-- --dry-run]`)
  process.exit(2)
}

const loaded = readDeployConfig(process.env)
if (loaded.config === undefined) {
  console.error(`❌ 部署目标没配好：\n${loaded.problems.map((problem) => `   ${problem}`).join('\n')}\n\n${ENV_HELP}`)
  process.exit(2)
}
const { host, path, service } = loaded.config
const commands = remoteCommands(loaded.config)
const run = createRunner({ cwd: root, dryRun })
const say = run.log

/** A remote command that changes nothing; printed instead of run under --dry-run. */
function remoteRead(script) {
  if (dryRun) {
    say(`  [dry-run] ${formatCommand('ssh', sshArgs(host, script))}`)
    return null
  }
  return run.read('ssh', sshArgs(host, script))
}

/** A remote command that changes the server; stops the deploy when it fails. */
function remoteMutate(script, what) {
  const result = run.mutate('ssh', sshArgs(host, script))
  if (result.status !== 0) {
    console.error(`❌ ${what} 失败（${result.status}）${result.stderr}`)
    process.exit(1)
  }
}

/** Poll `is-active`: right after a restart a service may still say `activating`. */
async function waitUntilActive() {
  let state = ''
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await sleep(attempt === 0 ? 3000 : 2000)
    state = remoteRead(commands.active)?.stdout ?? ''
    if (state === 'active') return state
  }
  return state
}

say(`部署到 ${host}:${path}，服务 ${service}${dryRun ? '（--dry-run）' : ''}\n`)

say('1/4 拉取（只允许快进）')
remoteMutate(commands.pull, 'git pull --ff-only')

say('\n2/4 对一下版本')
run.read('git', ['fetch', 'origin', 'main', '--quiet'])
const expected = versionOf(run.read('git', ['show', 'origin/main:package.json']).stdout)
const manifest = remoteRead(commands.manifest)
if (manifest !== null) {
  const verdict = compareVersions(versionOf(manifest.stdout), expected)
  say(`  ${verdict.ok ? '✅' : '⚠️ '} ${verdict.message}`)
}

say('\n3/4 重启服务')
remoteMutate(commands.restart, 'systemctl restart')

say('\n4/4 确认起来了')
if (dryRun) {
  remoteRead(commands.active)
  say('\n（--dry-run）没有改动任何东西')
} else {
  const state = await waitUntilActive()
  if (state !== 'active') {
    console.error(`❌ ${service} 重启后是「${state || '读不到状态'}」，不是 active。看日志：`)
    console.error(`   ${formatCommand('ssh', sshArgs(host, commands.logs))}`)
    process.exit(1)
  }
  say(`✅ ${service} 是 active。页面是否正常要自己在浏览器里看一眼。`)
}
