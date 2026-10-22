# Agent Notes

[English](README.md) | 简体中文

一篇 **Agent Note** 记录这个仓库做过的一个决定：为什么这样定，放弃了哪些做法。
代码和 README 说明「现在是什么样」，笔记说明「为什么是这样」，以及「换一种做法要付出什么代价」。

## 目录与命名

`{lifecycle}/{class}/yyyy-mm-dd-topic-title.md`，两条轴都写在路径里。

**lifecycle** 是笔记的状态，状态变了，所在的文件夹也跟着变：

- `proposed/`：已经决定，还没有实现。
- `implemented/`：已经上线。
- `rejected/`：考虑过，没有采纳。
- `archived/`：保留，但不再维护。

**class** 只能从固定的六类里选，和宿主自己的 notes 树用的是同一套。出现六类以外的文件夹，
检查直接判为失败，不需要人来判断。

| Class | 管什么 |
|---|---|
| `feature` | 面向用户的新能力，或者对它的改动。 |
| `bug-fix` | 修缺陷，或者补上复盘暴露的缺口。 |
| `simplification` | 删代码、删行为、缩小范围，不加新能力。 |
| `architecture` | 已发布源码的结构决定，例如服务端与前端怎么分工。 |
| `process` | 代码之外的工具、规定与流程，不涉及运行时行为。 |
| `testing` | 测试基础设施与策略。 |

每篇笔记的开头是固定的：`# Agent Note: <标题>`、空行、`Status: implemented`。正文以
`## Problem` 开头，结束前必须有 `## Alternatives considered` 一节。`.zh.md` 沿用同样的一组标题，
`.i18n.yaml` 记录中英两份的配对哈希。

## 代价

每篇笔记有三个文件，这是配对检查带来的成本，也是笔记只记「决定」、不记「改动」的原因：
只是把 diff 复述一遍的笔记没有人读，只会增加维护成本。

`npm run notes:check` 检查目录结构与文件格式，`npm run notes:links` 检查笔记之间的链接，
`npm run bilingual:check` 检查配对哈希。
