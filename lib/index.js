// dsh-http — HTTP 请求工具（DeepSeek Harness）。
// 发起 HTTP 请求，返回状态码、响应头、响应体（截断）与耗时。纯 Node（fetch）。
import { defineTool } from "@deepseek-ai/dsh-tools";

const name = "HTTP 请求";
const inject = ["tools"];

async function apply(ctx, _config) {
  ctx.tools.register(defineTool({
    name: "http_request",
    description:
      "发起 HTTP 请求，返回状态码、响应头、响应体（默认截断 4000 字符）与耗时（毫秒）。`url` 必填；`method` 默认 GET；`headers` 传对象；`body` 传请求体（字符串或对象，对象会 JSON 序列化）；`timeout` 默认 15000ms；`followRedirects` 默认 true。用于调试接口/验证服务。",
    parameters: {
      url: { type: "string", required: true, description: "请求 URL。" },
      method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"], description: "方法，默认 GET。" },
      headers: { type: "json", description: "请求头对象，如 {Authorization: \"Bearer ...\"}。" },
      body: { type: "json", description: "请求体（对象自动 JSON 序列化）。" },
      timeout: { type: "integer", description: "超时毫秒，默认 15000。" },
      followRedirects: { type: "boolean", description: "跟随重定向，默认 true。" },
    },
    output: {
      schema: {
        type: "object", additionalProperties: false,
        properties: {
          status: { type: "integer", required: true },
          statusText: { type: "string", required: true },
          headers: { type: "json", required: true },
          body: { type: "string", required: true },
          elapsedMs: { type: "integer", required: true },
          truncated: { type: "boolean", required: true },
        },
      },
      render: (_args, value) => [{
        type: "text",
        text: `HTTP ${value.status} ${value.statusText}（${value.elapsedMs}ms）\n${value.body.slice(0, 2000)}${value.truncated ? "\n…（截断）" : ""}`,
      }],
    },
    execute: async (args) => {
      const url = args.url;
      const method = args.method || "GET";
      const timeout = args.timeout || 15000;
      const headers = { "user-agent": "dsh-http", ...(args.headers || {}) };
      let bodyStr;
      if (args.body !== undefined) {
        if (typeof args.body === "string") bodyStr = args.body;
        else { bodyStr = JSON.stringify(args.body); if (!headers["content-type"]) headers["content-type"] = "application/json"; }
      }
      const start = Date.now();
      let res;
      try {
        res = await fetch(url, {
          method,
          headers,
          body: bodyStr,
          redirect: args.followRedirects === false ? "manual" : "follow",
          signal: AbortSignal.timeout(timeout),
        });
      } catch (e) {
        throw new Error(`请求失败：${e.name === "TimeoutError" ? "超时" : e.message}`);
      }
      const elapsedMs = Date.now() - start;
      const text = await res.text();
      const truncated = text.length > 4000;
      const resHeaders = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });
      return {
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        body: truncated ? text.slice(0, 4000) : text,
        elapsedMs,
        truncated,
      };
    },
  }));
}

export { apply, inject, name };
