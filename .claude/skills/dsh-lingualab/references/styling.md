# 样式与主题

改样式、颜色、主题，或者碰到 React Compiler 的 lint 时读这份。

- **浮起来的面板用 `--ll-surface`（即 `bg-layer-1`），不用 `bg-overlay`**：后者是宿主的遮罩色，
  深色下是偏亮的灰（实测 `#61666b`），抽屉、卡片涂上它会发白。验深色一定要真截图，别凭 token 名猜。
- **样式只读宿主声明过的 token**：`bg-base`、`bg-layer-1/2`、`bg-overlay`、`border-l1/l2`、
  `brand-primary`、`label-primary/secondary` 和四个 state。用 `cordis_inspect_query` 的 `Theme.listTokens`
  核对。`label-tertiary`、`bg-layer-3`、`bg-mask-1`、`interactive-bg-hover` 不存在，会静默落到只对
  一种主题调好的回退值；需要这些深浅时用 `color-mix`（见 `styles.ts` 顶部的 `--ll-*`）。
- **React Compiler 的 lint 不让在渲染里读 ref**：把 ref 传给子元素或在 render 里调 `.current` 都会被
  `react-hooks/refs` 拦。文件选择按钮用 `<label>` 包隐藏的 `<input>`（`FilePicker`），不要写成
  `ref.click()` 再传下去。
- **主题是覆盖宿主 token，不是第二套颜色**：`features/settings/lib/themes.ts` 里每套主题有浅、深两份调色板，键就是页面读的那十一个
  `--dsw-alias-*`。`resolveThemeVars(theme, appearance, hostDark)` 是纯函数：默认主题加「跟随 dsh」返回 `null`（什么也不设，和以前一模一样），
  否则返回要写到 `.dsh-lingualab-page` 根元素 inline style 上的变量和 `colorScheme`，`--ll-*` 派生值在同一个元素上跟着重算。
  宿主的明暗看 `<body>` 上有没有 `data-ds-dark-theme` 属性，`useHostDark` 用 MutationObserver 盯它。样式继续只读那十一个 token，
  不要写死色值；加一套主题就是改 `THEMES` 表，再补 locale 里的名字与描述。设置存在 `localStorage` 的 `dsh-lingualab:settings`，
  只在这台设备上，不进 host，也不进进度文件。舞台字号靠根元素的 `data-ll-stage-size` 与 `--ll-stage-scale`。「中文显示」也在这份设置里，控制栏按钮和 `C` 键都写 `setZhMode`，页面不再自己存一份。设置抽屉（`widgets/settings-panel`）
  照着五步法抽屉做，和它互相关闭，抽屉里的按键不冒泡给页面快捷键。
