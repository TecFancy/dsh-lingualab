# 依赖与工具链

升级依赖、`npm ci` 失败、装依赖很慢时读这份。

- **TypeScript 固定在 5.9.3（`~5.9.3`）**：steiger 依赖的 `@feature-sliced/filesystem` 要求 `typescript ^5.8.3`。
  根目录装 6.x 会让 lock 文件里出现两份 TypeScript，干净的 CI runner 上 `npm ci` 会报
  `Missing: typescript@5.9.3 from lock file`。升级前先确认它放宽了版本范围。
- **`zod-validation-error` 直接固定在 4.x**：`eslint-plugin-react-hooks@7` 要用 `zod-validation-error/v4` 这个子路径，
  而 steiger 依赖的 3.x 会被 npm 提升到顶层，导致 ESLint 启动不了。所以根目录放一份 4.x，steiger 自己的那份嵌套在它下面。
- **装依赖要指定 registry 和缓存目录**：本机默认的 registry 很慢，用
  `--registry=https://registry.npmmirror.com --cache <可写目录>`。
