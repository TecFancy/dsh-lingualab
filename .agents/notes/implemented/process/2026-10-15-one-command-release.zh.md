# Agent Note: 发版收成一条命令，合并时自动建标签

Status: implemented

## Problem

一次发版要手动走十二步左右，每一步都没错，也每一步都乏味：

1. 开发布分支；
2. `npm run release`；
3. 完整 verify；
4. 推送；
5. 开往 `development` 的 PR，等 CI，合并；
6. 开从 `development` 到 `main` 的 PR，等 CI，用合并提交合并；
7. 确认 `origin/main` 上的版本；
8. 手动打标签并推送标签；
9. 删掉发布分支；
10. 最后 ssh 到服务器上拉取并重启。

凡是会被忘掉的步骤，至少都被忘掉过一次（标签打在了错误的提交上，部署在拉取之前就重启了，发布分支留着没删），
而清单里唯一真正需要做的决定，「这一版发出去」，被埋在了中间。

其中两步已经没有必要了：

- 这个仓库是免费计划下的私有库，`development` 没有分支保护，而推到 `development` 本来就会在 CI 里执行完整 verify；
  发布分支和往 `development` 的 PR 只是把同样的检查再执行一遍。
- 标签是合并之后单独的一个人工操作，内容只有「给合并后的那个提交打标签」，而手动去查那个提交，正是最容易出错的一类步骤。

dsh-auth-gate 用 `scripts/release.mjs` 解决同一个问题：一条命令把整个流程走完。它的结构合适，但它是为 release-please
和 npm 设计的，这两样这里都不需要。

## Decision

**从 dsh-auth-gate 借三个想法，不照搬它的实现。**

- *一条串起全程的命令。*
  - `npm run ship -- patch|minor|major` 依次做这些事：检查当前环境，调用现有的 `scripts/release.mjs`
    （升版本的逻辑只保留一份），执行完整 verify，推送 `development`，开往 `main` 的 PR（正文是发行说明），等待它的检查，
    全部通过就合并并同步回来。执行这条命令本身就是发版的决定。
  - `--no-wait` 开完 PR 就停下，之后用 `npm run ship -- --continue` 收尾：它只读一次检查结果，从不轮询，全部通过才合并。
    这种分两步的形式是给不应轮询 CI 的调用方用的，agent 就是典型。
  - 状态每次都从 git 和 gh 实时查询（分支、开着的 PR、标签），不存进可能与它们不一致的文件。
  - `--dry-run` 会真的执行检查，并把每条会改动东西的命令打印出来，所以不用真发版也能看清整个流程。
- *合并时自动建标签。* `.github/workflows/release.yml` 现在在 push 到 `main` 时运行：
  - 如果 `package.json` 里的版本还没有标签，就用更新日志那一对文件生成正文，调用 `gh release create --target $GITHUB_SHA`，
    在合并后的那个提交上同时建出标签和 Release。
  - 已经有标签的版本跳过；没有更新日志小节的版本让这次运行失败。
  - 没有人手动打标签，标签也不会指向错误的提交。
  - 合并是 `ship` 做的最后一件事，所以执行 `ship` 是唯一的人工决定，之后不需要再确认一次。
- *同步回来。* 合并之后，把 `development` 快进到 `main` 并推送，这样只存在于 `main` 上的合并提交不会越积越多，造成两个分支偏离。

**部署是单独的命令，`npm run deploy`。** 它就是原来那行 ssh，再补上原来缺的两道检查：服务器上的版本与 `origin/main`
的版本是否一致，以及重启之后服务的状态必须是 `active`。主机、路径和服务名从环境变量读取，每次 ssh 调用都用参数数组，所以在 Git Bash
和 PowerShell 里执行的结果一样。页面在浏览器里是否正常，仍然由人看一眼确认。

**去掉只是重复检查的步骤。** 不再开发布分支，也不再开往 `development` 的 PR：推到 `development` 时有 CI 验证，
往 `main` 的 PR 保留 `version-bump` job，那才是真正要紧的检查。

## Alternatives considered

- **采用 release-please。** dsh-auth-gate 用的就是它。在这里，它会把作者手写的中英文更新日志换成根据提交标题生成的英文条目，
  而发行正文是读者了解一个版本的主要入口，应该是作者写的、中文在前的那一对文件。`check-changelog` 与中英对照的检查就是为了保护它。
  为了省一条命令放弃这些，不划算。
- **发布到 npm。** 这个插件从本地路径安装，从不经过注册表，所以发布 job 没有事可做，`wait-publish` 也没有对应的步骤。
- **Squash 合并。** dsh-auth-gate 用 squash，是因为 release-please 需要每个 PR 恰好有一个符合约定的提交，才能算出升版幅度和更新日志。
  没有 release-please，这个理由就不存在了；而用合并提交，`development` 上的每个提交都能从 `main` 追溯到（这也是同步回来只需快进的原因）。
- **让合并成为单独的、显式的一步。** 这是第一版设计：`ship` 停在检查全部通过，由第二条命令 `--continue` 去合并。后来放弃了，
  因为目标是减少步骤，而带着版本级别执行 `ship` 的那一刻，决定就已经做出了，再问一次只是重复。分两步的形式保留了下来，
  就是 `--no-wait` 加 `--continue`，给不应等待 CI 的调用方用。
- **标签继续手动打，或者由脚本在本地打。** 在本地打标签，要先查到合并后的提交，再从正确的机器上推送。让工作流在 `$GITHUB_SHA`
  上建标签，就彻底不需要这一步查找了。
- **给做到一半的发版存一个状态文件。** 它能让 `--continue` 省掉几次查询，但只要有人手动合并或关掉 PR，它马上就不准了。
  PR 本身就是状态。

## Consequences

一次发版就是 `npm run ship -- patch`，然后 `npm run deploy`。不应轮询 CI 的 agent 执行 `ship -- patch --no-wait`，
等检查完成后再执行 `ship -- --continue`。
这次改动合并之后，第一次 push 到 `main` 会针对一个已经有标签的版本运行新工作流，并直接跳过。

有两点是有意接受的：

- 如果 `ship` 在版本提交之后失败，那个提交会留在本地的 `development` 上；脚本会打印怎么丢掉它或者怎么手动收尾，
  但不会自己撤销任何东西。
- `release` 工作流现在每次 push 到 `main` 都会运行，不是发版的 push 也要花一点时间执行一个最后直接跳过的短任务。
