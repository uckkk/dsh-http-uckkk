# dsh-http · HTTP 请求工具

发起 HTTP 请求，返回状态码、响应头、响应体（截断）与耗时。纯 Node（fetch）实现。

## 提供的工具

| 工具 | 作用 |
|---|---|
| `http_request` | 发请求 → 状态/响应头/响应体/耗时 |

## 安装

```bash
dsh plugin add dsh-http
```
安装后在 profile 的 `package.json` 的 `dsh.profile.bundles` 中加入 `"dsh-http"`。

## 用法示例

```
请求这个接口看看返回什么
→ 调用 http_request(url="https://api.example.com/ping")
```

## 安装

```bash
dsh plugin add github:uckkk/dsh-http
```

> 安装即在本机运行第三方代码，请自行审阅源码。

## 安装

```bash
dsh plugin add github:uckkk/dsh-http
```

## 使用

安装后在会话中调用该插件注册的工具即可。
