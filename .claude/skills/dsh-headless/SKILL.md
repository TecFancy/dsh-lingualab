---
name: dsh-headless
description: 把一件简单任务交给本机的 dsh，一次跑完、拿回结果，默认走 commandcode provider。提到「让 dsh 去做 / 调一下 dsh / 用 dsh 跑一下」时加载。
---

# 把任务交给本机的 dsh

dsh 的 `headless` profile 接收一条任务，执行完就退出：答案写到 stdout，诊断写到 stderr。

```sh
dsh headless --patch "<本仓库根目录>/.agents/skills/dsh-headless/commandcode.yml" "任务描述"
```

- **先切到任务所在的目录**：它在哪个目录启动，就在哪个目录工作，所以 `--patch` 要写绝对路径。
- **它是完整的 agent**：会调工具、改文件、跑命令。只需要回答问题的任务，要在任务描述里写明「不要修改任何文件」。
- **`--json`**：改为逐行输出运行事件，想看它调用了哪些工具时用。第一行事件里有 `sessionId`。
- **`--session-id <id>`**：在一个已有的会话上继续。
- **只有基础能力**：没有 web profile 里的 MCP 服务、subagent 与界面插件，需要这些的任务不要交给它。
  codebase-memory 例外，见下一节。
- **不能推送，在 worktree 里也不能提交**：默认的 workspace-write 沙箱只放行启动目录里的写入，SSH 推送也会被拦；
  worktree 的 git 目录在主仓库的 `.git/worktrees/` 下，连 `git add` 都写不了锁文件。沙箱没有加可写目录的选项，
  唯一的出路是设 `DSH_PERMISSION_MODE=danger-full-access` 关掉沙箱与审批，不值得。提交、推送、开 PR 自己做。
- 每次调用都消耗 API 额度。

## 查代码结构时加上图谱工具

任务是找符号、查调用链、看一个目录的结构时，再叠一层同目录的 `codebase-memory.yml`，它就能用
`mcp__codebase-memory-mcp__*` 的 17 个图谱工具，不必一个个翻文件：

```sh
dsh headless --patch "<本仓库根目录>/.agents/skills/dsh-headless/commandcode.yml" --patch "<本仓库根目录>/.agents/skills/dsh-headless/codebase-memory.yml" "任务描述"
```

索引和 Claude Code 共用一份，查之前不必让它重建。只是想建索引或更新索引，用技能 `codebase-index`，不必经过 dsh。

## 按需再读

- 报 `MISSING_CREDENTIAL`、换了一台设备，或者第一次在这台机器上用：读 [references/setup.md](references/setup.md)。
- 想换回官方 key、换模型、给它加 MCP 服务，或者想知道 patch 为什么这样写：读 [references/patch.md](references/patch.md)。
