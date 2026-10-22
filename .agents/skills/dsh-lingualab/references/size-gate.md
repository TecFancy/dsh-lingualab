# 体量门

`npm run betterer:ci` 报错、拆大函数之后、`.betterer.results` 冲突时读这份。

- **体量门，`npm run betterer:ci`（2026-10-15 起）**：Betterer 用 ESLint 数 `src/` 里服务端和前端超标的点（`complexity` 15、`max-lines` 250、
  `max-lines-per-function` 80，后两个不数空行与注释；测试与 `testing/` 不管；阈值与 fsd-react 一致），现状记在 `.betterer.results`。
  这是一道棘轮：**超标的点只能变少、变小，不能变多、不能变大**。`.betterer.ts` 没有直接用 `@betterer/eslint` 的 `eslint()`，而是照它的写法包了一层，
  把问题记成「与大小成比例、与位置无关」的一组，原因与取舍见 `.agents/notes/implemented/process/2026-10-15-size-gate-and-page-split.md`：
  - **记法**：文件每超出 250 行（不足 10 行按 10 行算）一档记一个问题，函数每超出 80 行一档记一个，复杂度每超出 15 一点记一个；问题都记在文件开头，
    身份是规则、函数名（匿名函数用它那一行的文本）、同名的第几个、第几档，不含行号。所以 `.betterer.results` 里没有行号，也没有文件哈希。
  - **变大就失败**：已超标的函数或文件长过当前这一档，多出一个问题，`betterer:ci` 说「变差了」。一档里的 10 行是松动，档内多写几行不失败；
    复杂度每多一点就失败。
  - **新超标也失败**：新写一个超 80 行或复杂度超 15 的函数、一个超 250 行的文件，包括加在 baseline 里已有文件里的新函数，一样失败，并指出那一处。
  - **改文案、改样式、在上面加行都不碍事**：只要没有跨档，`.betterer.results` 就不变，`betterer:ci` 照过，不需要为此重跑 `npm run betterer`。
    改了函数名，或改了匿名函数那一行的文本，身份就变了，会读成「修好一个、出现一个」而失败。这时要么改回去，要么顺手拆小；
    `npm run betterer` 遇到变差不会写（退出码 7），只有在评审里说明之后才用 `--update`。
  - **拆小之后收紧**：把超标的函数或文件缩过一档，`betterer:ci` 说「变好了」并因为文件过期失败（退出码 7）；跑 `npm run betterer`，baseline 里对应的
    问题消失，把改过的 `.betterer.results` 一起提交，之后它就回不去了。
  - **`.betterer.results` 合并冲突不要手改**，跑 `npx betterer merge`，再跑一遍 `npm run betterer` 确认。
  - **给新工作的规矩**：新逻辑进切片自己 `lib/` 里带测试的 hook 或纯函数；一个组件眼看要过 80 行就拆成几个小组件，不是把它记进 baseline。
    页面（`LingualabPage`）因为要组合很多 feature 仍在 baseline 里，那是现状，不是许可：它回不到更大。
  - 它只在全档里跑，约 20 秒，所以提交前钩子不拦；拆了大函数的提交要自己记得跑一遍 `npm run betterer`。
