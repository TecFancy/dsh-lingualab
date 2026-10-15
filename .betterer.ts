import { BettererFileTest } from "@betterer/betterer";
import { ESLint } from "eslint";

/**
 * Betterer 体量回归门
 *
 * 锁住当前文件与函数的体量，只防新增。已有的超标点记在 `.betterer.results`，
 * 新代码必须符合阈值；超标点只能变少，新写出来的超标点一律失败。
 *
 * 阈值（与 fsd-react 一致，三个规则的数字就是它们的名字）：
 * - complexity ≤ 15                  函数圈复杂度上限
 * - max-lines ≤ 250                  单文件行数上限（不数空行与注释）
 * - max-lines-per-function ≤ 80      单函数行数上限（不数空行与注释）
 *
 * 范围：`src/` 的两个半边（host 与 client）。测试（`*.test.ts(x)`）与 `testing/`
 * 里的测试辅助不管，`lib/` 是构建产物，`scripts/` 不是产品代码。
 *
 * 与 fsd-react 唯一的不同：这里没有直接用 `@betterer/eslint` 的 `eslint()`，
 * 而是照它的写法自己包了一层 ESLint，只改了 `max-lines` 的落点。`eslint()` 把
 * `max-lines` 记在「第 251 行到文件末尾」那一段上，并用那一段的文本做哈希，
 * 于是超过 250 行的文件里，任何改变行数的编辑（往 `locale.ts` 加一条文案，
 * 往样式里加一条规则）都会被当成「旧问题修好了、新问题出现了」而判为变差。
 * 这里把它记在文件开头、哈希固定，一个文件只要还超标就是同一个问题。
 * 函数那两条规则本来就记在函数名上，不受影响。
 *
 * 认「同一个问题」不看消息里的行数，所以已超标的函数或文件变大一点，Betterer
 * 认为没变；但改过 baseline 里的文件，`betterer:ci` 会因为 `.betterer.results`
 * 过期而失败，要你跑 `npm run betterer` 再提交，变大就以 `(91)` 变 `(92)` 的
 * 形式出现在那份文件的 diff 里。
 *
 * Usage:
 *   npm run betterer        更新 baseline（写回 .betterer.results）
 *   npm run betterer:ci     CI 模式，发现回退即 exit 1，不写回
 *
 * 想"自然降低"超标？把对应文件或函数拆小后跑 `npm run betterer`，
 * baseline 会自动收紧，再也回不到旧水位。
 */
const RULES = {
  complexity: ["error", 15],
  "max-lines": ["error", { max: 250, skipBlankLines: true, skipComments: true }],
  "max-lines-per-function": ["error", { max: 80, skipBlankLines: true, skipComments: true }],
} as const;

/** 整个文件超标这一条的哈希。固定不变，所以文件怎么改，只要还超标就是同一个问题。 */
const FILE_ISSUE_HASH = "max-lines";

function size() {
  return new BettererFileTest(async (filePaths, fileTestResult, resolver) => {
    if (!filePaths.length) return;
    const runner = new ESLint({ cwd: resolver.baseDirectory, overrideConfig: { rules: RULES } });
    const lintResults = await runner.lintFiles([...filePaths]);
    for (const { messages, source, filePath } of lintResults) {
      // ESLint 只在有问题的文件上带回 `source`。
      if (!source) continue;
      const file = fileTestResult.addFile(filePath, source);
      for (const { ruleId, message, line, column, endLine, endColumn } of messages) {
        const text = `eslint(${ruleId ?? ""}): ${message}`;
        if (ruleId === "max-lines") {
          file.addIssue(0, 0, 0, text, FILE_ISSUE_HASH);
        } else {
          file.addIssue(line - 1, column - 1, endLine ? endLine - 1 : 0, endColumn ? endColumn - 1 : 0, text);
        }
      }
    }
  }).cache();
}

export default {
  "no-size-regression": () =>
    size()
      .include("src/**/*.{ts,tsx}")
      .exclude(/\.test\.tsx?$/)
      .exclude(/src[\\/](?:.*[\\/])?testing[\\/]/),
};
