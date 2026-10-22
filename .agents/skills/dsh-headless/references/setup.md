# 在一台设备上准备 dsh headless

1. 装好 dsh，确认 `dsh headless --help` 能输出帮助。
2. 给 headless profile 装 commandcode 插件：

   ```sh
   dsh plugin --profile headless add @mars-sea/dsh-commandcode-provider
   ```

   装完确认 `$DSH_HOME/profiles/headless/package.json` 的 `dsh.profile.bundles` 里有它。
3. 在 web 的 Models 页面存好 commandcode 的 key，或者在启动环境里设 `COMMANDCODE_API_KEY`。
4. 在仓库根目录跑一次冒烟测试，应当只回复「在线」：

   ```sh
   dsh headless --patch .agents/skills/dsh-headless/commandcode.yml "只回复两个字：在线。不要调用任何工具。"
   ```

## 报 `MISSING_CREDENTIAL`

- 第 3 步没做：key 既不在 `$DSH_HOME/.credentials.yaml`，也不在启动环境或 `.env` 里。
- 没带 `--patch`，或者路径写错了：patch 里有一条会重新打开凭据服务，没叠加它，Models 页面保存的 key 就传不到 headless。
  原因见 [patch.md](patch.md)。
