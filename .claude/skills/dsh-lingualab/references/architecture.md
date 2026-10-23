# 分层、共用代码与面板入口

新建或挪动文件、在服务端和前端之间加共用的类型、改面板 id 时读这份。

## 分层

- 服务端和前端都按 FSD 分层，`npm run lint:fsd` 对两边各跑一遍 Steiger，违反了会被拦下。
- 前端是 `shared → entities → features → widgets → pages`，没有 `app` 层。
- 服务端只有下面三层 `shared → entities → features`。`src/index.ts` 不属于任何一层，它收集各个 feature 导出的路由。
- 跨切片导入一律走那个切片的 `index.ts`。feature 之间不能互相导入，前端需要把几个 feature 组合起来，就在页面里组合。
- 服务端的实体之间要互相读，只能经过被读那一方的 `@x/<读者>.ts`。
- 服务端的 `shared` 里，除了 `lib`，每一段都有自己的 `index.ts`。

## 两部分共用的代码

- 共用的代码只有一份，放在 `src/shared/`，前端通过 `src/client/shared/` 里同名的转发文件导入：
  - `protocol.ts`：路由路径和请求、响应的形状。
  - `notes-format.ts`：笔记格式。
  - `progress.ts`：听到哪里的合并规则，服务端存的和浏览器缓存的按同一条规则合并。
  - `stem.ts`：文件名配对。字幕归 `owningStem` 给出的最长词干；文件名里的 `双语` 或 `bilingual` 表示一个文件里有两种语言。
- 新加的共用类型也放进 `src/shared/`，不要在两边各写一份。

## 面板入口

- 页面由「应用」页的卡片打开，那张卡片在 `dsh-apps-panel` 的注册表里写的是 `panel: lingualab`。
  除了 `layout.selectPanel`，这是唯一的入口。
- 改 `PANEL_ID` 就要同步改 `dsh-apps-panel` 的注册表，否则卡片点了没反应。
