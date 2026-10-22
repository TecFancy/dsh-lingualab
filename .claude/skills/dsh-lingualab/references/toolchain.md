# 依赖与工具链

升级依赖、`npm ci` 失败、装依赖很慢时读这份。

- **TypeScript 钉在 5.9.3（`~5.9.3`）**：steiger 依赖的 `@feature-sliced/filesystem` 要 `typescript ^5.8.3`，
  根上钉 6.x 会让 lock 里出现两份，干净的 CI runner 上 `npm ci` 报 `Missing: typescript@5.9.3 from lock file`。
  升级前先确认它放宽了范围。
- **`zod-validation-error` 直接钉在 4.x**：`eslint-plugin-react-hooks@7` 要
  `zod-validation-error/v4` 这个子路径，而 steiger 依赖的 3.x 会被 npm 提到顶层导致 ESLint
  起不来。根上放一份 4.x，steiger 自己那份嵌在它下面。
- **装依赖要指 registry 与缓存目录**：本机默认 registry 慢，用
  `--registry=https://registry.npmmirror.com --cache <可写目录>`。
