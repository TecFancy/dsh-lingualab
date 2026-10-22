# commandcode.yml 做了什么

技能目录里的 `commandcode.yml` 是叠在 headless profile 上的一层，做两件事。

## 默认模型改成 commandcode

`agent-default-model` 改成 `commandcode` provider 的 `deepseek/deepseek-v4.1-flash`。

不带 patch 时，headless 用出厂默认的 `deepseek-official` / `deepseek-flash`，也就是 dsh 界面上标着「1017」的那个
（这个标记只画在官方与账号两种 provider 的 `deepseek-flash` 上）。想临时改用官方 key，去掉 `--patch` 就行。

dsh 没有 `--model`、`--provider` 这样的参数，换模型只能靠 patch，或者改 profile 自己的 `cordis.patch.yml`。

## 重新打开凭据服务

`dsh-headless` bundle 用 `disabled: true` 关掉了 `credentials`，一次性任务只认启动环境与 `.env`。commandcode 的 key
是在 web 的 Models 页面存的，落在 `$DSH_HOME/.credentials.yaml`，凭据服务关着就报 `MISSING_CREDENTIAL`。
patch 把它改回 `disabled: false`，headless 与 web 就共用这一份 key，不用再抄进 `.env`。

## 加 MCP 服务

headless 只有 `dsh-base`、`dsh-headless` 两个 bundle 和后装的插件。`dsh --profile web "任务"` 也不行，它只会起网页服务，
不会跑一条就退出。

要在 headless 里用某个 MCP 服务，把 web profile 的 `cordis.patch.yml` 里对应的 `insert` 条目抄进另一个 patch 文件，
调用时一起叠加（`--patch` 可以写多次）。
