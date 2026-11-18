# Agent Note: 市场卡片读仓库根目录的 `screenshots.json`，并由一道检查守着

Status: implemented

[English](2026-11-18-market-card-screenshots.md) | 简体中文

## Problem

插件市场（dsh-market）的卡片缩略图来自一份精选清单，读的是插件 `package.json` 旁边的
`screenshots.json`。卡片不读 README：README 里的图只作为安装确认弹窗的兜底，而插件装好之后
那个弹窗再也打不开。所以一个在 `docs/assets/` 里有四张截图、却没有 `screenshots.json` 的仓库，
卡片上是空的。

这个文件在本仓库里没有第二个读者。`docs/assets/` 里的图改名时，`links:check` 会拦住 README
的引用，而 `screenshots.json` 会继续指向 404。上游注册表记着这个代价：773 张已发布截图里
有 41 张就是这样变成 404 的，之后才加了探测。

## Decision

在仓库根放 `screenshots.json`，按卡片应当展示的顺序列出 `docs/assets/` 里的四张图：练习页、
首页、深色主题下的收藏、iPad 竖屏布局。

新增 `npm run screenshots:check`（`scripts/check-screenshots.mjs`），放进 `verify` 的轻档，
挨着 `links:check`。

这道检查逐条对齐上游契约，所以本地通过就等于注册表会接受：1 到 8 条、相对路径不出仓库
（不以 `/` 开头、不含 `..` 段）或 GitHub 托管上的 https 绝对地址、只收位图（PNG/JPEG/WebP，
市场在生成 `<img>` 之前就把 SVG 丢掉）、每张文件必须存在、不许重复。

## Alternatives considered

**只依赖 README 自动抽取。** 否掉：抽取结果只进安装弹窗，已安装的插件永远打不开它，卡片还是空的。

**往注册表自己的 `data/screenshots.json` 加 key。** 否掉：上游 `contributing.md` 明确要求作者
不要再往那个文件加新 key，它是给旧条目的回退、有删除日期；而且写死在那边的绝对地址只会静默失效。

**把图放进 npm 包。** 否掉：注册表读的是仓库 HEAD，不是发出去的包，改 `files` 不生效。

**只加 JSON，不写检查。** 否掉：那 41 张 404 就是这么来的。这个文件在仓库里没有第二个引用者，
没有任何检查会替它发现失效。

## Why

截图放在自己的仓库里，改图推自己的仓库即可，下一次 nightly 构建自动生效，不用给注册表提 PR、
不用等维护者。相对路径在仓库内改名会立刻暴露，而这道检查把它变成一次失败的检查，而不是别人页面上的 404。
