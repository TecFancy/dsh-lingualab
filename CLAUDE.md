# CLAUDE.md

这份文件只是 Claude Code 的入口，仓库的约定不写在这里，以 `AGENTS.md` 为准（下面一行把它整篇导入）。

@AGENTS.md

- 操作细节与踩坑：`.agents/skills/dsh-lingualab/SKILL.md`。`.claude/skills/` 是 `npm run skills:sync` 生成的镜像，不要手改。
- 决策理由：`.agents/notes/`，写法见 `.agents/notes/README.md`。
- 完整闸门：`npm run verify`。

新约定写进 `AGENTS.md` 或技能，新决策写成一篇 note，不要加在这里。
