# 练习页布局

改练习页的布局、右栏、调时间模式、画面或卡片怎么让位时读这份。

- **页面有两个视图**：首页（接着上次大卡片、剧集卡片网格、虚线拖放区）与练习。练习视图是顶栏 48，
  下面左右分栏：左边是舞台（当前句、前后句、播放卡片、按键标签），右边是字幕栏（唯一滚动区，
  宽度 `clamp(300px,34%,440px)`），栏头的分段控件或 `N` 把它换成「收藏」，宽度和滚动都一样。改布局时不要把整页变成滚动容器：舞台必须钉住，否则「听这一句」
  又要跟着列表滚走。**右栏有三种状态**：收起、字幕、收藏。收起是设置里的 `sideCollapsed`（按浏览器记住），视图是页面这一次的状态，
  两件事分开放（`pages/lingualab/lib/side-column.ts` 的纯函数与 `useSideColumn`），所以 `N` 仍然只是切换视图，只在收起时直接展开到收藏；
  顶栏「收藏」旁边的开关与 `\` 收起或展开，不动视图。收起时右栏整个不画（没有窄条），`.dsh-lingualab-body` 带 `is-side-collapsed`，
  画面的份额改成整个宽度（`--ll-pic-share:1`、`--ll-pic-w:100%`），720px、405px、高度上限与 `is-picture-squeezed` 照旧；展开时字幕列表重新挂载，
  `SubtitlePanel` 的 layout effect 让它直接落在正在播的那一句。顶栏是 `ll-top` 宽度容器，不到 720px 宽时返回与收藏两个按钮只留图标（和计数）；
  顶栏的按钮 `flex:none`，只有标题让位；触屏上它们靠透明的 `::after` 得到 44px 点按区域，样子不变。这几条样式在 `shared/lib/styles-side.ts`，
  接在 `STYLES` 末尾（`styles.ts` 已到体量上限）。下一步（窄栏时右栏浮在舞台上、窄栏默认收起；在舞台上拖动定位句子；给右栏的展开收起加动画并重排顶栏那一排按钮）是三篇 proposed note。播放卡片只放每分钟都用的控件，低频的收进「更多」。设计稿在 Figma，链接在 README
  与 AGENTS.md，稿里是写死的色值和 Inter，落地只用宿主 token。
- **布局看练习栏自己的大小，不看窗口**，决定与取舍见 `.agents/notes/implemented/architecture/2026-10-14-layout-answers-to-the-practice-column.md`。
  `.dsh-lingualab-practice` 是 `container:ll-practice/size`，响应式规则写成 `@container ll-practice (...)`，都在 `styles.ts` 末尾那一段
  （要压过前面同优先级的规则，所以放最后）。两个坑：**尺寸查询量的是内容盒**，栏宽要减 48、栏高要减 20 才是写进阈值的数；
  侧栏和字幕栏让窗口宽度几乎说明不了栏有多大，别再写视口断点（样式表测试只放行浏览层的 640）。卡片以上的内容在
  `.dsh-lingualab-practice-main` 里，它是唯一的滚动容器，卡片留在下面；句子是 `flex:1 0 auto`，别改回会缩的。触屏的规则看
  `(hover:none) and (pointer:coarse)`，不看宽度。想看改动的效果，把真组件渲染成静态标记、配真样式表、在浏览器里按 iPad 的各个尺寸读高度。
  **调整时间是一种模式**：页面在调时间面板在场（`usePresence(timing.session !== null, TIMING_EXIT_MS)` 的 `mounted`，比会话多留退出那一会儿）时给练习栏加
  `is-timing`（用类名，不用 `:has()`）。布局跟在场走，按键与舞台上的按钮跟会话走；`mounted` 与 `shown` 由页面算出来传给 `TimingStrip`，
  面板自己不再带计时器，所以栏离开调时间模式与面板卸载是同一次提交。面板从第一帧起就占满高度，只有卡片淡入淡出，**不要**改回长出一个网格行：
  那会让画面先跳到最大再缩小，关闭时布局动两次。这时播放卡片折成进度条加
  「变速 | 上一句、播放、下一句」一行，其余按钮、按键提示和菜单用类名隐藏（不卸载）；在播放的画面是 `ll-video` 尺寸容器，拿走剩余高度；
  剩下不到 120px 时画面的舞台整个收起，句子舞台改成 `flex:1 1 auto` 把句子居中（尺寸容器缩不了自己，所以由页面里
  `usePictureRoom`（开关是面板在场，不是会话）量出来、给练习栏加 `is-picture-squeezed`，128px 才回来；量的是滚动容器高度减去不随画面变的部分，绝不读画面自己的盒子，不然自己追自己；
  别再加回画面上的 `@container ll-video (max-height)` 规则）；调时间面板在栏宽不到 648px 或栏高不到 780px 时是一行一个边缘的紧凑布局。文字长的按钮同时画长短两个文字
  （`dsh-lingualab-label-long` / `-short`），样式表挑一个，全文留作 `aria-label` 与 `title`。新增一个调时间时要隐藏的东西，加进
  `styles.ts` 末尾 `.is-timing` 那一段，别写成对面板的 `:has()`。
  **画面在收起面板时也会让位**：播放中的画面舞台（`:not(.is-timing) .videostage.is-shown.has-screen`）的 `flex-basis` 是画面本来的高度
  （份额、720px、高度上限三者最小，用 `--ll-pic-share` 与 `--ll-pic-h`，这两个变量舞台和画面都要有），`flex-shrink:1`，是 `ll-video` 尺寸容器；
  舞台写了 `box-sizing:content-box`，别删，宿主若有全局 border-box 重置，基准值会少 20px。`usePictureRoom` 的开关是「画面在显示状态下播放」，
  不再是面板在场；不到 120px 收起舞台的规则不带 `is-timing`，但句子舞台的 `flex:1 1 auto` 只在调时间时给，收起面板时句子不许缩到文字以下。
  不到 160px 的画面不画角落的胶囊（`ll-video (max-height:159px)`，只管画面上画什么）。**量布局要按真实 Safari 的可见高度**：iPad 的状态栏加工具栏
  占 74px（紧凑标签）到 110px（单独标签栏），所以 iPad mini 横屏是 1133 乘 670 与 634，Air 11 寸是 1180 乘 746 与 710，Pro 11 寸是 1194 乘 760 与 724，
  Pro 13 寸是 1366 乘 950 与 914，不是整机分辨率；滚动条按 iPad 的悬浮式量（桌面 Chrome 的 15px 滚动条会多换一行）。
  **代替画面的卡片也会让位，而且是分步的**：卡片是一段文字加按钮，高度随它是哪张、带不带流畅版与本地文件而变，样式表算不出来，所以由页面试出来。
  `useCardFit(practiceMain, card !== null && !videoPlays)` 每次从完整的卡片开始，依次给滚动容器 `.dsh-lingualab-practice-main` 加
  `is-card-compact`（收紧）、`is-card-lean`（去掉图标、说明、备注、流畅版与本地文件，正文最多两行）、`is-card-line`（一行）、`is-card-hidden`（整个舞台不画），
  看 `scrollHeight` 是否还大于 `clientHeight`，第一个不再滚动的就是答案；都不行就留 `line`，因为藏起卡片也解决不了，准备视频的入口得留着。选择与类名的逻辑是
  `card-fit.ts` 里的纯函数，测试也在那里。类名由钩子直接设在这个元素上，React 从不写它的 class，所以没有状态也不重渲染；`VideoStage` 画着卡片时给舞台加
  `has-card`，钩子靠它找卡片，调时间期间舞台是 `display:none`，钩子就不量。每次都从头试，所以答案只看空间与卡片，不看上一步，不需要滞回。每一步各画什么在
  `styles.ts` 里 `.is-card-*` 那一段，新增卡片内容时想好它在哪一步消失；按钮的 44px 是 `min-height`，任何一步都不许设按钮的 `min-height`。
