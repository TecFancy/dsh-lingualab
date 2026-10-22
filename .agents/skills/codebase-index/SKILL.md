---
name: codebase-index
description: 不经过任何模型，直接用 codebase-memory-mcp 的命令行给一个仓库建索引或更新索引，不花额度。提到「更新索引 / 重建索引 / 建一下 codebase-memory 索引 / 索引过期了」时加载。
---

# 不经模型给仓库建索引

建索引是本地的语法解析，不需要模型。通过 MCP 工具 `index_repository` 调用，也要花一轮对话的 token，
交给 dsh 还要多花一份它自己的额度。同目录的 `index.ps1` 直接调用二进制的 `cli` 子命令，一个 token 都不花：

```powershell
pwsh -NoProfile -File "<本仓库根目录>/.agents/skills/codebase-index/index.ps1" -Path D:\source\personal\dsh-lingualab
```

不带 `-Path` 时索引当前目录。成功时输出一行，例如 `D-source-personal-dsh-lingualab: indexed, 5341 nodes, 20203 edges`。

- **和 Claude Code 共用一份索引**：二进制按 `%LOCALAPPDATA%\RSP\codebase-memory\current.json` 找，`CBM_CACHE_DIR` 指向同一目录的
  `cache\`，都是 rsp-software-dev 插件装的。自己手敲命令时别漏了 `CBM_CACHE_DIR`，否则索引会写进另一份缓存，Claude 查不到。
- **项目名由路径决定**：worktree 和主检出各算一个项目。想让主检出的会话用上，就索引主检出的路径。
- **什么时候要跑**：第一次索引、切了分支或拉了大批改动之后。会话进行中 MCP 会自己刷新，不必手动跑。
- 只在 Windows 上能用；插件没装时脚本会报错，并提示安装命令。

要让 dsh 用图谱查代码，是另一件事，见技能 `dsh-headless`。
