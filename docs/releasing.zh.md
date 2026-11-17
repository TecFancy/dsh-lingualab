# 发版

[English](releasing.md) | 简体中文

这份文档说明如何发版 LinguaLab，以及 `ship` 和 CI 各自负责什么。准备把改动合进 `main` 时读它。

## 开往 `main` 的 PR 就是发版

改动先合进 `development`。往 `main` 开 PR 就是一次发版，在 `development` 上运行下面的命令：

```sh
npm run ship -- patch|minor|major   # check, bump, verify, push, open the PR, wait for green, merge, sync back
```

## `ship` 按顺序完成四步

1. 提升版本号，并把中英两份更新日志中尚未发版的条目移到带日期的标题下（`scripts/release.mjs`）。
2. 运行完整的 `npm run verify`，再推送 `development`。
3. 打开往 `main` 的 PR 并等待检查。全部通过后，用一个合并提交合入。
4. 把 `development` 快进到合并后的 `main`。

运行 `ship` 就等于决定发版。

## 续跑参数和 CI 决定何时合并

不能一直轮询 CI 的调用方（例如 agent）可以先用 `npm run ship -- patch --no-wait`，命令打开 PR 后就停止。之后运行 `npm run ship -- --continue`，它只读取一次检查结果，全部通过才合并。

CI 的 `version-bump` job 会让没有提升版本号的 PR 检查失败。`--dry-run` 只打印所有会改动内容的命令，不实际执行。

## 合并后由 `release` 工作流创建标签

标签不用手动创建。合并进入 `main` 后，`release` 工作流会创建标签和 GitHub Release。Release 正文取自中英两份更新日志里这一版的内容，先中文，后英文。

合并落地后，`release` 工作流会创建 tag、GitHub Release（正文取自双语 changelog，中文在前），并把 `dsh-lingualab-<version>.tgz` 挂到 Release 上。同一个版本随后从同一个 tar 包发布到 npm，所以注册表、Release 和 tag 始终指向同一份产物。

## 发布到 npm

包的第一个版本必须由维护者手工发布，因为 npm 只允许给已经存在的包登记 Trusted Publisher。之后 `release` 工作流通过 OIDC 发布：仓库里没有 `NPM_TOKEN`，信任关系登记在 npmjs.com 上，绑定本仓库和 `release.yml` 这个文件名。改文件名会让发布失效。
