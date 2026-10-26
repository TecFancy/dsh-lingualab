# 体量门

`npm run betterer:ci` 报错、拆大函数之后、`.betterer.results` 冲突时读这份。

## 它检查什么

- 2026-10-15 起有体量门 `npm run betterer:ci`。Betterer 用 ESLint 统计 `src/` 里服务端和前端超标的地方：
  - `complexity` 15、`max-lines` 250、`max-lines-per-function` 80，后两项不算空行与注释。
  - 测试文件和 `testing/` 不管。阈值与 fsd-react 一致。
- 现状记在 `.betterer.results`。规则只有一条：**超标的地方只能变少、变小，不能变多、变大。**
- `.betterer.ts` 没有直接用 `@betterer/eslint` 的 `eslint()`，而是仿照它的写法包了一层，把问题记成
  「数量与超出的幅度成比例、与位置无关」的一组。原因与取舍见
  `.agents/notes/implemented/process/2026-10-15-size-gate-and-page-split.md`。

## 问题怎么记

- 文件每超出 250 行一档记一个问题（不足 10 行按 10 行算），函数每超出 80 行一档记一个，复杂度每超出 15 一点记一个。
- 问题都记在文件开头。每个问题的身份由规则、函数名（匿名函数用它那一行的文本）、同名函数里的第几个、第几档组成，不含行号。
  所以 `.betterer.results` 里既没有行号，也没有文件哈希。

## 什么时候失败

- **变大**：已超标的函数或文件超出当前这一档，就多出一个问题，`betterer:ci` 报告「变差了」。
  一档的 10 行是余量，在档内多写几行不会失败；复杂度则每多一点就失败。
- **新超标**：新写一个超过 80 行或复杂度超过 15 的函数、一个超过 250 行的文件，都会失败并指出位置。
  在 baseline 里已有的文件中新增函数也一样。
- **改名**：改了函数名，或改了匿名函数那一行的文本，身份就变了，会被读成「修好一个、又出现一个」而失败。
  这时要么改回去，要么顺手拆小。`npm run betterer` 遇到变差不会写入（退出码 7），只有在评审里说明之后才用 `--update`。

## 什么时候不影响

改文案、改样式、在文件上方加几行，只要没有跨档，`.betterer.results` 就不变，`betterer:ci` 照常通过，不需要为此重跑 `npm run betterer`。

## 拆小之后

- 把超标的函数或文件缩小一档以上，`betterer:ci` 报告「变好了」，并因为结果文件过期而失败（退出码 7）。
- 这时跑 `npm run betterer`，baseline 里对应的问题会消失，把改过的 `.betterer.results` 一起提交，之后就不能再变回去。
- 它只在完整检查里跑，约 20 秒，提交前钩子不跑。拆了大函数的提交，要自己记得跑一遍 `npm run betterer`。

## 合并冲突

`.betterer.results` 冲突时不要手改，跑 `npx betterer merge`，再跑一遍 `npm run betterer` 确认。

## 新代码怎么写

- 新逻辑放进切片自己 `lib/` 里带测试的 hook 或纯函数。
- 一个组件快要超过 80 行就拆成几个小组件，不要把它记进 baseline。
- 页面（`LinguaLabPage`）要组合很多 feature，目前仍在 baseline 里。这只是现状，不代表允许它变大：它不能比现在更大。
