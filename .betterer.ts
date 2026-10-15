import { BettererFileTest } from "@betterer/betterer";
import { ESLint } from "eslint";
import { relative, sep } from "node:path";

/**
 * Betterer 体量回归门
 *
 * 一道真正的棘轮：已有的超标点只能变少、变小，新写出来的超标点和已超标点的变大一律失败。
 * 现状记在 `.betterer.results`。
 *
 * 阈值（与 fsd-react 一致，三个规则的数字就是它们的名字）：
 * - complexity ≤ 15                  函数圈复杂度上限
 * - max-lines ≤ 250                  单文件行数上限（不数空行与注释）
 * - max-lines-per-function ≤ 80      单函数行数上限（不数空行与注释）
 *
 * 范围：`src/` 的两个半边（host 与 client）。测试（`*.test.ts(x)`）与 `testing/`
 * 里的测试辅助不管，`lib/` 是构建产物，`scripts/` 不是产品代码。
 *
 * 与 fsd-react 的不同：这里没有直接用 `@betterer/eslint` 的 `eslint()`，而是照它的写法
 * 自己包了一层 ESLint，改了问题怎么记。`eslint()` 靠「位置加那一处源码的哈希」认同一个问题，
 * 有两个后果：已超标的函数写长一点它认为没变（挡不住变大），而 `max-lines` 记在
 * 「第 251 行到文件末尾」上，超标文件里任何改变长度的编辑都被当成「旧问题修好、新问题出现」
 * 而失败（往 `locale.ts` 加一条文案也挂）。这里换成按大小成比例的、与位置无关的问题：
 *
 * - 文件超过 250 行：每超出（不足 10 行按 10 行算）一档，记一个问题，`ceil((行数 - 250) / 10)` 个；
 * - 函数超过 80 行：同样每档 10 行一个，`ceil((行数 - 80) / 10)` 个；
 * - 复杂度超过 15：每超出 1 点一个，`复杂度 - 15` 个。
 *
 * 每个问题都记在文件开头（行列都是 0），身份是「规则、函数的身份（名字，匿名函数用它那一行的文本）、
 * 同名的第几个、第几档」，不含行号，所以代码在上面挪动不改变它。结果是：
 * - 变大跨过一档，多出一个问题，失败；档内的 10 行是松动，不失败。
 * - 变小跨过一档，少一个问题，「变好了」，跑 `npm run betterer` 收紧。
 * - 新超标的文件或函数是新问题，失败。
 * - 档内的编辑、行号的移动、改一条文案都不改变 `.betterer.results`，所以 `betterer:ci` 不会因此过期。
 *   文件的哈希也不进结果（登记时给的是一个只随路径变的固定文本），否则任何改动都会让它过期。
 *
 * Usage:
 *   npm run betterer        更新 baseline（写回 .betterer.results）
 *   npm run betterer:ci     CI 模式，发现回退或 baseline 该更新即 exit 1，不写回
 *
 * 想"自然降低"超标？把对应文件或函数拆小后跑 `npm run betterer`，
 * baseline 会自动收紧，再也回不到旧水位。
 */
const RULES = {
  complexity: ["error", 15],
  "max-lines": ["error", { max: 250, skipBlankLines: true, skipComments: true }],
  "max-lines-per-function": ["error", { max: 80, skipBlankLines: true, skipComments: true }],
} as const;

/** 一档多少行。 */
const BUCKET = 10;
const FILE_LIMIT = 250;
const FUNCTION_LIMIT = 80;
const COMPLEXITY_LIMIT = 15;

/** 消息里括号里的行数，或 `complexity of` 后面的数。 */
function numberIn(message: string): number {
  const found = /\((\d+)\)/.exec(message) ?? /complexity of (\d+)/.exec(message);
  return found ? Number(found[1]) : 0;
}

/** 函数的身份：消息里的 "Function 'name'" 一类的前缀；匿名函数再加上它那一行的文本。 */
function identityOf(message: string, line: number, source: string): string {
  const prefix = /^(.*?) has (?:too many lines|a complexity)/.exec(message)?.[1] ?? message;
  if (prefix.includes("'")) return prefix;
  // 结果文件把内容放在模板字面量里，所以反引号、反斜杠与美元符号换成下划线。
  const text = (source.split("\n")[line - 1]?.trim() ?? "").replace(/[`\\$]/g, "_");
  return `${prefix} ${text}`;
}

function size() {
  return new BettererFileTest(async (filePaths, fileTestResult, resolver) => {
    if (!filePaths.length) return;
    const runner = new ESLint({ cwd: resolver.baseDirectory, overrideConfig: { rules: RULES } });
    const lintResults = await runner.lintFiles([...filePaths]);
    for (const { messages, source, filePath } of lintResults) {
      // ESLint 只在有问题的文件上带回 `source`。
      if (!source) continue;
      // 登记时给的「文件文本」只随路径变，所以文件怎么改，结果里它的哈希都不动。用相对仓库根、以 `/` 分隔的路径，
      // 绝对路径会让每个检出目录（各个 worktree、CI）算出不同的哈希，`betterer:ci` 在别处就过不了。
      const file = fileTestResult.addFile(filePath, relative(resolver.baseDirectory, filePath).split(sep).join("/"));
      const seen = new Map<string, number>();
      for (const { ruleId, message, line } of messages) {
        const amount = numberIn(message);
        let identity = "file";
        let steps: number;
        let describe: (step: number) => string;
        if (ruleId === "max-lines") {
          steps = Math.ceil((amount - FILE_LIMIT) / BUCKET);
          describe = (step) => `file is over ${FILE_LIMIT} lines (more than ${FILE_LIMIT + (step - 1) * BUCKET})`;
        } else if (ruleId === "max-lines-per-function") {
          identity = identityOf(message, line, source);
          steps = Math.ceil((amount - FUNCTION_LIMIT) / BUCKET);
          describe = (step) => `${identity} is over ${FUNCTION_LIMIT} lines (more than ${FUNCTION_LIMIT + (step - 1) * BUCKET})`;
        } else {
          identity = identityOf(message, line, source);
          steps = amount - COMPLEXITY_LIMIT;
          describe = (step) => `${identity} is over complexity ${COMPLEXITY_LIMIT} (reaches ${COMPLEXITY_LIMIT + step})`;
        }
        // 同一个文件里同一个身份可能出现不止一次（两个叫 handler 的函数），按出现顺序编号。
        const base = `${ruleId ?? ""}:${identity}`;
        const occurrence = seen.get(base) ?? 0;
        seen.set(base, occurrence + 1);
        for (let step = 1; step <= steps; step += 1) {
          file.addIssue(0, 0, 0, `eslint(${ruleId ?? ""}): ${describe(step)}`, `${base}@${occurrence}#${step}`);
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
