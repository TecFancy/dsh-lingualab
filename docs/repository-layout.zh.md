# 仓库结构

[English](repository-layout.md) | 简体中文

这份文档说明主要源码和配置路径分别负责什么。添加代码，或者查找某项能力由插件的哪一部分实现时，可以先读这张表。

| 路径 | 放什么 |
|---|---|
| `src/index.ts` | 服务端入口：定义配置，并挂载各条路由 |
| `src/host-context.ts` | 宿主插件上下文中，插件实际调用的那一部分 |
| `src/host/shared/` | 配置、请求信任与媒体文件服务、路径规则、ffmpeg 查找、匿名使用统计和测试辅助 |
| `src/host/entities/` | 剧集（媒体库扫描）、打开状态、可浏览位置、笔记文件、手动选择的字幕、视频缓存 |
| `src/host/features/` | 每项能力一个切片，路由放在 `api/<名字>.route.ts`，与对应规则相邻 |
| `src/shared/` | 服务端和前端共用的协议，以及笔记的 Markdown 格式 |
| `src/client/entities/cue/` | 字幕解析、解码和双语行排序 |
| `src/client/` | 页面、组件，以及不注册插槽的功能（library、import、notes、media player、resume、settings） |
| `lib/` | tsdown 生成的构建产物，会提交进仓库；外壳取用的就是这些文件 |
| `locale/` | 「插件」页上的显示名和简介 |
| `cordis.patch.yml` | bundle 补丁（Loader 行 `lingualab`） |
| `screenshots.json` | 插件市场卡片用的截图，路径相对于这个文件 |
