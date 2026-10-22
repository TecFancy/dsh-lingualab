# 文档与 note

写 note、改 README 或技能、定了一条新规矩不知道写在哪时读这份。

## 每份文档管什么

- **为什么这么做**：`.agents/notes/`。
- **现在是什么样**：README 和源码注释。没有 `docs/INDEX.md`，README 里的链接就是索引。
- **怎么干活**：技能 `dsh-lingualab`。
- **每次会话都要知道的事**：`AGENTS.md`。

## 新规矩写在哪

- 默认写进技能，其次写成一篇 note。
- `AGENTS.md` 只放每次会话都要知道的事。它每次都会被加载，写得越长，占的上下文越多，要紧的几条也越容易被忽略。
- 技能的 SKILL.md 也一样，只放每次加载都用得上的内容。只在某类改动里才用得上的细节，写进 `references/` 里对应的那份
  （没有合适的就新建一份），再在 SKILL.md「按需再读」的表里加一行。

## note 的写法

- 每篇 note 有三个文件：`.md`、`.zh.md`、`.i18n.yaml`。中文那份要真的翻译，不是英文的副本。
- 改了任何一份，就跑 `npm run bilingual:check -- --write` 重新记录哈希。
- 目录、命名和必须有的几节见 `.agents/notes/README.zh.md`。
