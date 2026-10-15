# Agent Note: 发版收成一条命令，让合并去建标签

Status: implemented

## Problem

一次发版要手动走十二步左右，每一步都对，每一步都乏味：开发布分支、`npm run release`、完整 verify、推送、
开往 `development` 的 PR、等 CI、合并、开从 `development` 到 `main` 的 PR、等 CI、用合并提交合并、
确认 `origin/main` 上的版本、手打标签并推送标签、删掉发布分支，最后 ssh 上服务器拉取并重启。
凡是会被忘掉的步骤，至少被忘掉过一次（标签打在了错的提交上，部署在拉取之前就重启了，发布分支留在原地没删），
而清单里唯一真正的决定，「这一版发出去」，被埋在了中间。

其中两步已经不值得做了。这个仓库是私有库、免费计划，`development` 没有分支保护，而推到 `development`
本来就会在 CI 里跑完整 verify；发布分支和往 `development` 的 PR 只是把同样的检查再跑一遍。至于标签，
那是合并之后的一个单独的人工动作，内容只有「给合并后的那个提交打标签」，而这正是手工去查那个提交时最容易出错的一类步骤。

dsh-auth-gate 用 `scripts/release.mjs` 解决同一个问题：一条命令把整条链走完。它的形状合适，但它是为 release-please
和 npm 造的，这两样这里都不需要。

## Decision

**从 dsh-auth-gate 借三个想法，不借它的机器。**

- *一条串起全程的命令。* `npm run ship -- patch|minor|major` 先检查现场，再调现成的 `scripts/release.mjs`
  （抬版本的逻辑只留一份），跑完整 verify，推送 `development`，开往 `main` 的 PR（正文是发行说明），等它的检查，全绿就合并并同步回来。运行它就是发版的决定。
  `--no-wait` 开完 PR 就停，之后 `npm run ship -- --continue` 收尾：它只读一次检查，从不轮询，全绿才合并。
  这种两步的形式给不该轮询 CI 的调用方用，agent 就是典型。状态每次都从 git 和 gh 现查（分支、开着的 PR、标签），
  不存进可能与它们对不上的文件。`--dry-run` 真的跑检查，并把每条会改动东西的命令打印出来，所以不用真发版也能看全流程。
- *合并去建标签。* `.github/workflows/release.yml` 现在在 push 到 `main` 时运行：`package.json` 里的版本还没有标签，
  就用更新日志那一对文件生成正文，调 `gh release create --target $GITHUB_SHA`，在合并后的那个提交上把标签和 Release
  一起建出来。已经有标签的版本跳过，没有更新日志节的版本让这次运行失败。没有人手打标签，标签也不会指到错的提交。
  合并是 `ship` 做的最后一件事，所以运行 `ship` 就是唯一的人工决定，之后不需要再确认一次。
- *同步回来。* 合并之后，把 `development` 快进到 `main` 并推送，只存在于 `main` 上的合并提交不会越积越多变成偏差。

**部署是它自己的命令，`npm run deploy`。** 它是原来那行 ssh，加上它缺的两道检查：服务器上的版本与 `origin/main`
的对比，以及重启之后服务必须是 `active`。主机、路径和服务名从环境变量读，每次 ssh 调用都是参数数组，所以 Git Bash
和 PowerShell 里跑出来一样。页面在浏览器里对不对，仍然是人看一眼。

**砍掉只是重复检查的步骤。** 没有发布分支，也没有往 `development` 的 PR：推到 `development` 有 CI 验证，
往 `main` 的 PR 保留 `version-bump` job，那才是要紧的把关。

## Alternatives considered

- **上 release-please。** dsh-auth-gate 用的就是它。在这里它会把作者手写的中英更新日志换成按提交标题生成的英文条目，
  而发行正文，读者进入一个版本的主要入口，是作者写的、中文在前的那一对。`check-changelog` 与中英对照的检查就是为了守住它。
  为了省一条命令放弃它，不划算。
- **发布到 npm。** 这个插件从本地路径安装，从不走注册表，所以发布 job 没有事可做，`wait-publish` 也没有对应物。
- **Squash 合并。** dsh-auth-gate 用 squash，是因为 release-please 需要每个 PR 恰好一个符合约定的提交，才能算出升版和更新日志。
  没有 release-please，这个理由就不在了，而合并提交让 `development` 上的每个提交都能从 `main` 到达（这也是同步回来可以只做快进的原因）。
- **让合并成为单独的、显式的一步。** 这是第一版设计：`ship` 停在检查全绿，由第二条命令 `--continue` 去合并。后来放弃了，
  因为目标是步骤更少，而决定在带着版本级别运行 `ship` 的那一刻就已经做出，再问一次只是重复。两步的形式留了下来，
  就是 `--no-wait` 加 `--continue`，给不该等 CI 的调用方。
- **标签继续手打，或者由脚本在本地打。** 本地打标签要先查到合并后的提交，再从对的机器上推送。让工作流在 `$GITHUB_SHA`
  上建，这一步查找就彻底没有了。
- **给做到一半的发版存一个状态文件。** 它能让 `--continue` 省掉几次查询，但有人手动合并或关掉 PR 的那一刻它就错了。
  PR 本身就是状态。

## Consequences

一次发版就是 `npm run ship -- patch`，然后 `npm run deploy`。不该轮询 CI 的 agent 跑 `ship -- patch --no-wait`，
等检查跑完再跑 `ship -- --continue`。
这次改动落地之后，第一次 push 到 `main` 会针对一个标签已经存在的版本运行新工作流，并且跳过。

有两点是接受下来的。版本提交之后 `ship` 失败，那个提交会留在本地的 `development` 上；脚本会打印怎么丢掉它或者手动收尾，
但不会自己撤销任何东西。另外 `release` 工作流现在每次 push 到 `main` 都会跑，不是发版的 push 也要付一个以跳过收尾的短任务。
