---
name: dsh-headless
description: 把一件简单任务交给本机的 dsh，一次跑完、拿回结果，默认走 commandcode provider。听到「让 dsh 去做 / 调一下 dsh / 用 dsh 跑一下」时加载。
---

# 把任务交给本机的 dsh

dsh 的 `headless` profile 收一条任务，跑完就退出：答案写到 stdout，诊断写到 stderr。

```sh
dsh headless --patch "<本仓库根目录>/.agents/skills/dsh-headless/commandcode.yml" "任务描述"
```

- **先切到任务所在的目录**：它在哪个目录启动，就在哪个目录干活，所以 `--patch` 写绝对路径。
- **它是完整的 agent**：会调工具、改文件、跑命令。只要回答的任务，在任务里写明「不要修改任何文件」。
- **`--json`**：改成逐行输出运行事件，想看它调了哪些工具时用。第一行事件带着 `sessionId`。
- **`--session-id <id>`**：接着一次已有的会话往下做。
- **只有基础能力**：没有 web profile 里的 MCP 服务、subagent 与界面插件，要用这些的任务别交给它。
- 每次调用都花 API 额度。

## 按需再读

- 报 `MISSING_CREDENTIAL`、换了一台设备，或者第一次在这台机器上用：读 [references/setup.md](references/setup.md)。
- 想换回官方 key、换模型、给它加 MCP 服务，或者想知道 patch 为什么那样写：读 [references/patch.md](references/patch.md)。
