# Agent Notes

[English](README.md) | 简体中文

一条 **Agent Note** 记录这个仓库做过的某个决定：为什么这么定，以及放弃了什么。
代码和 README 说的是「现在是什么」，笔记说的是「为什么是这样」和「另一条路要付什么代价」。

## 目录与命名

`{lifecycle}/{class}/yyyy-mm-dd-topic-title.md`，两条轴都写在路径里。

**lifecycle** 是笔记的状态，状态变了文件夹就跟着变：`proposed/` 是定了还没做，
`implemented/` 是已经上线，`rejected/` 是考虑过并否掉，`archived/` 是留着但不再维护。

**class** 取自一个封闭集合，跟宿主自己的 notes 树是同一套六类。出现不认识的文件夹是检查
失败，不是判断题。

| Class | 管什么 |
|---|---|
| `feature` | 面向用户的新能力，或者对它的改动。 |
| `bug-fix` | 修缺陷，或者补上复盘暴露的缺口。 |
| `simplification` | 删代码、删行为、删面积，但不加新能力。 |
| `architecture` | 关于已发布源码的结构决定：两个半边怎么分工。 |
| `process` | 代码周围的工具、政策与流程，不是运行时行为。 |
| `testing` | 测试基础设施与策略。 |

每篇笔记的头部固定（`# Agent Note: <标题>`、空行、`Status: implemented`），正文以
`## Problem` 开头，结束前必须回答 `## Alternatives considered`。`.zh.md` 镜像沿用同一串标题，
`.i18n.yaml` 记录配对哈希。

## 代价

每篇笔记是三个文件。这是配对检查的价钱，也是笔记只写给「决定」而不写给「改动」的原因：
把 diff 复述一遍的笔记没有读者，只有维护成本。

`npm run notes:check` 管树的形状与文件格式，`npm run notes:links` 管笔记之间的链接，
`npm run bilingual:check` 管配对哈希。
