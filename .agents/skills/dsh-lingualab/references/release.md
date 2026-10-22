# 发版与部署

发版、开往 `main` 的 PR、部署到服务器时读这份。

```sh
npm run ship -- patch|minor|major [--no-wait] [--dry-run]   # 在 development 上：检查、抬版本、verify、推送、开 PR、等全绿、合并、同步回来
npm run ship -- --continue [--dry-run]                      # 接着走 --no-wait 留下的 PR：读一次检查，全绿就合并并同步
npm run deploy [-- --dry-run]                               # 服务器拉取、重启、确认 active
npm run release:notes [版本号]                               # 打印这一版的正文（GitHub Release 与 PR 正文用的就是它）
```

**运行 `ship -- patch|minor|major` 就是发版的决定**，之后只剩 `npm run deploy`。`ship` 必须在检出了 `development` 的那份
工作副本里跑（现在是主检出 `D:\source\personal\dsh-lingualab`，git 不允许同一个分支在两个 worktree 里检出）；
它落后于 origin 时先拉一下（检查本来就会拒绝落后的状态）。

**`ship` 做什么**（`scripts/ship.mjs`，规则在 `scripts/lib/release-plan.mjs`，带单测）：

1. 检查：在 `development`、工作区干净、fetch 后不落后于 origin/development、`gh auth status` 通过、
   两侧 CHANGELOG 的 Unreleased 都非空、目标版本的标签（本地和 origin）还没有、没有已开着的发版 PR、
   `package.json` 与 origin/main 同版本。所有问题一次列完，不是撞一个报一个。
2. 抬版本：调现成的 `scripts/release.mjs`（不重复它的逻辑），再跑完整的 `node scripts/verify.mjs`，推送 `development`。
3. 开 PR：`gh pr create --base main --head development`，标题 `chore(release): vX.Y.Z`，正文是 `release-notes.mjs` 的输出。
4. 等检查：`gh pr checks --watch --fail-fast`。
5. 合并：重新核对一遍现场，再 `gh pr merge --merge --subject "chore(release): vX.Y.Z (#n)"`。
6. 同步回来：fetch、`git merge --ff-only origin/main`、推送 `development`。

**`--no-wait` 与 `--continue`** 是两步的形式，给不该轮询 CI 的调用方（agent）用：`ship -- patch --no-wait` 开完 PR 就停；
CI 跑完之后 `ship -- --continue` 找到开着的 development 到 main 的 PR，**只读一次**检查，不轮询。还在跑退出码 3
（等一等再来）；有失败退出码 1 并点名；全绿才合并、同步回来（上面的第 5、6 步，`--continue` 自己的输出里编为第 2、3 步）。状态一律从 git 和 gh 现查，没有状态文件。

**`--dry-run`**：检查是真跑的（它们只读），会改东西的命令（`release.mjs`、verify、push、`pr create`、`pr merge`、ssh）
只打印不执行。检查没过时 dry-run 只报告、继续演示计划，所以在功能分支上也能看全流程。

**为什么没有发布分支，也没有往 development 的 PR**：仓库是私有库、免费计划，`development` 没有分支保护，而推到
`development` 本来就会在 CI 里跑完整 verify，发布分支加 PR 只是多一轮同样的检查。往 `main` 的 PR 保留，它的
`version-bump` job 把关版本号有没有抬。合并用合并提交，不用 squash（squash 只是为 release-please 服务过）。

**标签不再本地打**：PR 合进 `main` 后，`.github/workflows/release.yml`（push 到 main，或手动触发）读
`package.json` 的版本，标签 `vX.Y.Z` 已存在就跳过，否则用 `release-notes.mjs` 生成正文，`gh release create --target $GITHUB_SHA`
一次建出标签与 GitHub Release。这一版的更新日志节找不到就让这次运行失败。人只做一个决定：运行 `ship`。
`release.mjs` 因此不再有 `--tag`。

**部署**（`scripts/deploy.mjs`）：目标从环境变量读，缺了会报并给出设置办法。仓库里不写任何一台真实服务器：
服务器会换，换的时候只改本机的环境变量，不改仓库。脚本对服务器的要求只有两条：上面有这个仓库的一份检出，
宿主 dsh-web 作为 systemd 服务运行。

| 变量 | 含义 | 示例（占位，不是真实值） |
|---|---|---|
| `LINGUALAB_DEPLOY_HOST` | ssh 主机（`~/.ssh/config` 别名） | `my-server` |
| `LINGUALAB_DEPLOY_PATH` | 远端仓库的绝对路径 | `/srv/dsh/repos/dsh-lingualab` |
| `LINGUALAB_DEPLOY_SERVICE` | 可选，systemd 服务 | `dsh-web.service`（缺省） |

**Git Bash 的坑**：它会把环境变量里以 `/` 开头的路径改写成 `C:/Program Files/Git/...`，部署路径就错了（脚本认得出来并报错）。
先 `export MSYS2_ENV_CONV_EXCL=LINGUALAB_DEPLOY_PATH`，或者把路径写成 `//srv/...`，或者在 PowerShell 里设。

流程全走 `ssh -o BatchMode=yes`，参数用数组传，不拼本地 shell 字符串，Git Bash 与 PowerShell 都能跑：
`git pull --ff-only`；打印服务器上 `package.json` 的版本并与 origin/main 的对比（不一致只警告）；
`sudo -n systemctl restart`；等几秒后 `systemctl is-active` 必须是 `active`，否则退出码 1 并给出看日志的命令。
**部署只证明服务起来了，页面在浏览器里对不对仍然要自己看一眼**（宿主半边的改动尤其如此）。

**不变的规矩**：

- 版本号的唯一来源是 `package.json`。更新日志是中英一对文件（`CHANGELOG.md` 与 `CHANGELOG.zh.md`），
  `check-changelog` 对两侧都要求「最新的发行版标题跟版本号一致」且那一节非空；`release` 一次把
  两侧的 Unreleased 都挪成新版本节，漏掉一侧下次跑检查就会报出来。
- Release 正文两侧都带，先中文后英文，由 `release-notes.mjs` 合成。
- PR 到 `main` 时 CI 的 `version-bump` job 会比对 base 分支的版本，没抬高就合不进去。
- **不发 npm**，全仓没有 publish 步骤。
- 决策的来龙去脉在 `.agents/notes/implemented/process/2026-10-15-one-command-release.md`。
