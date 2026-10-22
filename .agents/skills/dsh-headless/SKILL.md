---
name: dsh-headless
description: 把一件简单任务交给本机的 dsh，一次跑完、拿回结果，默认走 commandcode provider。主人说「让 dsh 去做 / 调一下 dsh / 用 dsh 跑一下」时加载。
---

# 把任务交给本机的 dsh

dsh 的 `headless` profile 收一条任务，跑完就退出：答案写到 stdout，诊断写到 stderr。这份技能记的是怎么调、
默认用哪个模型、换一台设备要准备什么。

## 一条命令

```sh
dsh headless --patch "<本仓库根目录>/.agents/skills/dsh-headless/commandcode.yml" "任务描述"
```

- 它在哪个目录启动，就在哪个目录干活。先切到任务所在的目录再调，`--patch` 因此写绝对路径。
- `--json` 改成逐行输出运行事件，想看它调了哪些工具时用。第一行事件带着 `sessionId`。
- `--session-id <id>` 接着一次已有的会话往下做。
- 它是一个完整的 agent，会调工具、改文件、跑命令。只要回答的任务，在任务里写明「不要修改任何文件」。
- 每次调用都花主人的 API 额度。

## 为什么要带 patch

同目录的 `commandcode.yml` 是叠在 headless profile 上的一层，做两件事：

1. **默认模型改成 commandcode**：`commandcode` provider 的 `deepseek/deepseek-v4.1-flash`。不带 patch 时，
   headless 用出厂默认的 `deepseek-official` / `deepseek-flash`，也就是 dsh 界面上标着「1017」的那个
   （这个标记只画在官方与账号两种 provider 的 `deepseek-flash` 上）。想临时改用官方 key，去掉 `--patch` 就行。
2. **重新打开凭据服务 `credentials`**：`dsh-headless` bundle 故意关掉了它，一次性任务只认启动环境与 `.env`。
   commandcode 的 key 是在 web 的 Models 页面存的，落在 `$DSH_HOME/.credentials.yaml`，凭据服务关着就报
   `MISSING_CREDENTIAL`。打开之后 headless 与 web 共用这一份 key，不用再抄进 `.env`。

dsh 没有 `--model`、`--provider` 这样的参数，换模型只能靠 patch，或者改 profile 自己的 `cordis.patch.yml`。

## 换一台设备

1. 装好 dsh，`dsh headless --help` 能打出帮助。
2. 给 headless profile 装 commandcode 插件：

   ```sh
   dsh plugin --profile headless add @mars-sea/dsh-commandcode-provider
   ```

   装完确认 `$DSH_HOME/profiles/headless/package.json` 的 `dsh.profile.bundles` 里有它。
3. 在 web 的 Models 页面存好 commandcode 的 key，或者在启动环境里设 `COMMANDCODE_API_KEY`。
4. 在仓库根目录跑一次冒烟测试，应当只回「在线」：

   ```sh
   dsh headless --patch .agents/skills/dsh-headless/commandcode.yml "只回复两个字：在线。不要调用任何工具。"
   ```

   报 `MISSING_CREDENTIAL` 就是第 3 步没做好，或者 patch 没叠上。

## 它做不了什么

headless 只有 `dsh-base`、`dsh-headless` 两个 bundle 和后装的插件。web profile 里的 MCP 服务（Atlassian、Figma、
codebase-memory、apex）、subagent-claude-code、agent team 和各个界面插件，headless 都没有。`dsh --profile web "任务"`
也不行，它只会起网页服务，不会跑一条就退出。

要在 headless 里用某个 MCP 服务，把 web profile 的 `cordis.patch.yml` 里对应的 `insert` 条目抄进另一个 patch 文件，
调用时一起叠加（`--patch` 可以写多次）。
