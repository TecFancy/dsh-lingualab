# 样式与主题

改样式、颜色、主题，或者碰到 React Compiler 的 lint 时读这份。

## 颜色 token

- **浮起的面板用 `--ll-surface`（即 `bg-layer-1`），不用 `bg-overlay`**：后者是宿主的遮罩色，
  深色主题下是偏亮的灰（实测 `#61666b`），抽屉、卡片用它会发白。检查深色主题一定要真的截图，不要凭 token 名猜。
- **样式只用宿主声明过的 token**：`bg-base`、`bg-layer-1/2`、`bg-overlay`、`border-l1/l2`、
  `brand-primary`、`label-primary/secondary` 和四个 state。用 `cordis_inspect_query` 的 `Theme.listTokens` 核对。
- `label-tertiary`、`bg-layer-3`、`bg-mask-1`、`interactive-bg-hover` 并不存在，用了会悄悄落到只为一种主题调过的回退值。
  需要这些深浅时用 `color-mix`（见 `styles.ts` 顶部的 `--ll-*`）。

## 主题

主题是覆盖宿主 token，不是另一套颜色。

- `features/settings/lib/themes.ts` 里每套主题有浅、深两份调色板，键就是页面读取的那十一个 `--dsw-alias-*`。
- `resolveThemeVars(theme, appearance, hostDark)` 是纯函数：
  - 默认主题加「跟随 dsh」时返回 `null`，什么也不设，和以前完全一样。
  - 其他情况返回要写到 `.dsh-lingualab-page` 根元素 inline style 上的变量和 `colorScheme`，派生的 `--ll-*` 值在同一个元素上随之重算。
- 宿主的明暗看 `<body>` 上有没有 `data-ds-dark-theme` 属性，`useHostDark` 用 MutationObserver 监听它。
- 样式仍然只读这十一个 token，不要写死色值。加一套主题就是改 `THEMES` 表，再在 locale 里补上名字和描述。

## 设置

- 设置存在 `localStorage` 的 `dsh-lingualab:settings`，只在这台设备上，不发给服务端，也不写进进度文件。
- 舞台字号靠根元素的 `data-ll-stage-size` 与 `--ll-stage-scale`。
- 「中文显示」也在这份设置里，控制栏按钮和 `C` 键都调用 `setZhMode`，页面不再自己另存一份。
- 设置抽屉（`widgets/settings-panel`）仿照五步法抽屉实现，两者打开一个就关掉另一个；抽屉里的按键不冒泡到页面的快捷键。

## React Compiler 的 lint

React Compiler 的 lint 不允许在渲染时读 ref：把 ref 传给子元素，或在 render 里读 `.current`，都会被 `react-hooks/refs` 拦下。
文件选择按钮用 `<label>` 包住隐藏的 `<input>`（`FilePicker`），不要写成 `ref.click()` 再往下传。
