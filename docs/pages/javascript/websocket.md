---
sidebar: true
outline: deep
title: WebSocket
date: 2024-03-11
---

# WebSocket

## WebSocket 是什么

WebSocket 是一种网络通信协议，它实现了浏览器与服务器全双工通信，允许数据在客户端和服务器之间实时、双向传输。

> 它允许客户端和服务器之间建立一个持久连接，
> 双方都可以在任何时间主动发送消息，不再受传统 HTTP “请求 → 响应” 模式的限制。

换句话讲就是：

- HTTP：客户端必须发请求，服务器才能回。
- WebSocket：双方随时能互发消息。

## 为什么需要 WebSocket？

### HTTP 的局限

HTTP 是无状态、短连接的：

- 每次通信都要重新建立 TCP 连接；
- 客户端只能发起请求，服务器不能主动推送；
- 实时性差，效率低。

### 传统“伪实时”方案：

| 技术                      | 原理                           | 缺点                           |
| ------------------------- | ------------------------------ | ------------------------------ |
| 轮询（Polling）           | 客户端定期请求服务器           | 延迟高，浪费带宽               |
| 长轮询（Long Polling）    | 客户端请求挂起直到有新数据返回 | 服务器压力大                   |
| SSE（Server-Sent Events） | 服务器持续推送事件流           | 只能单向推送，不能客户端发消息 |

### WebSocket 的优势

- 建立一次连接即可长期使用；
- 实时性高，低延迟；
- 双向通信，客户端和服务器都能主动发消息；
- 服务器压力小，节省带宽；

## HTTP 与 WebSocket 的区别

| 特性       | HTTP                 | WebSocket            |
| ---------- | -------------------- | -------------------- |
| 通信模式   | 请求-响应            | 全双工（实时）       |
| 连接类型   | 短连接               | 长连接               |
| 协议端口   | 80 / 443             | 80 / 443（复用）     |
| 消息格式   | 文本（有头）         | 二进制或文本（轻量） |
| 开销       | 大（每次带完整头部） | 小（数据帧）         |
| 实时性     | 一般                 | 很强                 |
| 服务端推送 | 不支持               | 支持                 |

## WebSocket 的使用

### 创建 WebSocket 对象

前端（浏览器）

```js
const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
  console.log("连接成功");
  ws.send("Hello Server");
};

ws.onmessage = (event) => {
  console.log("收到消息：", event.data);
};

ws.onclose = () => console.log("连接关闭");
ws.onerror = (err) => console.error("错误:", err);
```

后端（Node.js）

```js
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });

wss.on("connection", (ws) => {
  console.log("客户端已连接");
  ws.send("欢迎来到 WebSocket");

  ws.on("message", (message) => {
    console.log("收到消息：", message.toString());
    ws.send(`你发送了：${message}`);
  });
});
```

## 封装一个 WebSocket hooks

```ts [useWebSocket.ts]
/**
 * useWebSocket.ts
 * Vue3 + TypeScript 封装 WebSocket Hook
 *
 * ✅ 支持功能：
 *  - 自动重连（含断网后恢复）
 *  - 心跳检测（保持连接活性）
 *  - 消息发送 / 接收
 *  - 状态管理（连接状态、错误、重连次数）
 *  - 自动清理
 *
 * 🧠 面试可讲点：
 *  - 区分浏览器离线事件与 onclose
 *  - 避免重复连接、冲突重连
 *  - 断网后自动检测恢复并重连
 */

import { ref, onUnmounted } from "vue";

interface WebSocketOptions {
  reconnectInterval?: number; // 重连间隔时间（默认 3000ms）
  maxReconnectAttempts?: number; // 最大重连次数（默认 10 次）
  heartbeatInterval?: number; // 心跳间隔（默认 10000ms）
  debug?: boolean; // 是否开启日志输出
}

export function useWebSocket(url: string, options: WebSocketOptions = {}) {
  // ===============================
  // 1️⃣ 初始化配置
  // ===============================
  const {
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
    heartbeatInterval = 10000,
    debug = false,
  } = options;

  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const error = ref<Error | null>(null);
  const reconnectCount = ref(0);

  // 内部状态
  let manuallyClosed = false; // 是否为手动关闭
  let heartbeatTimer: number | null = null; // 心跳定时器
  let reconnectTimer: number | null = null; // 重连定时器

  // ===============================
  // 2️⃣ 日志函数
  // ===============================
  const log = (...args: any[]) => {
    if (debug) console.log("[WebSocket]", ...args);
  };

  // ===============================
  // 3️⃣ 建立连接
  // ===============================
  const connect = () => {
    manuallyClosed = false; // 重置手动关闭状态
    // 避免重复连接或手动关闭后继续连
    if (ws.value || manuallyClosed) return;

    log("🔗 尝试连接中...");
    const socket = new WebSocket(url);
    ws.value = socket;

    // 连接成功
    socket.onopen = () => {
      log("✅ 已连接");
      isConnected.value = true;
      error.value = null;
      reconnectCount.value = 0;
      startHeartbeat();
    };

    // 收到消息
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        log("📩 收到消息:", data);
      } catch {
        log("📩 收到原始消息:", event.data);
      }
    };

    // 连接出错
    socket.onerror = (err) => {
      error.value = new Error("WebSocket error");
      log("❌ 连接错误:", err);
    };

    // 连接关闭
    socket.onclose = (e) => {
      log(`🔌 连接关闭 (code=${e.code}, reason=${e.reason})`);
      isConnected.value = false;
      stopHeartbeat();
      ws.value = null;

      // 若非手动关闭则自动重连
      if (!manuallyClosed) tryReconnect();
    };
  };

  // ===============================
  // 4️⃣ 自动重连逻辑
  // ===============================
  const tryReconnect = () => {
    if (reconnectCount.value >= maxReconnectAttempts) {
      log("⚠️ 达到最大重连次数，停止重连");
      return;
    }

    reconnectCount.value++;
    log(`♻️ 尝试第 ${reconnectCount.value} 次重连...`);

    reconnectTimer = window.setTimeout(() => {
      connect();
    }, reconnectInterval);
  };

  // ===============================
  // 5️⃣ 心跳机制
  // ===============================
  const startHeartbeat = () => {
    stopHeartbeat(); // 避免重复启动
    heartbeatTimer = window.setInterval(() => {
      if (isConnected.value && ws.value?.readyState === WebSocket.OPEN) {
        ws.value.send(JSON.stringify({ type: "ping", time: Date.now() }));
        log("💓 发送心跳");
      }
    }, heartbeatInterval);
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  // ===============================
  // 6️⃣ 断网检测（核心增强）
  // ===============================
  const handleOffline = () => {
    log("📴 网络断开");
    isConnected.value = false;

    // 如果当前有连接，先关闭它
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
  };

  const handleOnline = () => {
    log("📶 网络恢复，尝试重连...");
    if (!manuallyClosed && !isConnected.value) {
      tryReconnect();
    }
  };

  // 监听浏览器网络状态
  window.addEventListener("offline", handleOffline);
  window.addEventListener("online", handleOnline);

  // ===============================
  // 7️⃣ 发送消息
  // ===============================
  const send = (data: any) => {
    if (isConnected.value && ws.value?.readyState === WebSocket.OPEN) {
      const msg = typeof data === "string" ? data : JSON.stringify(data);
      ws.value.send(msg);
      log("📤 已发送:", msg);
    } else {
      log("⚠️ 无法发送，连接未打开");
    }
  };

  // ===============================
  // 8️⃣ 主动关闭连接
  // ===============================
  const close = (code = 1000, reason = "manual close") => {
    manuallyClosed = true;
    stopHeartbeat();

    if (ws.value) {
      // code 必须合法
      if (code !== 1000 && (code < 3000 || code > 4999)) {
        console.warn("⚠️ close code 不合法，已使用 1000 替代");
        code = 1000;
      }
      ws.value.close(code, reason);
      ws.value = null;
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    log("🔒 连接已手动关闭");
  };

  // ===============================
  // 9️⃣ 生命周期清理
  // ===============================
  onUnmounted(() => {
    close();
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("online", handleOnline);
  });

  // ===============================
  // 🔟 启动连接
  // ===============================
  connect();

  return {
    ws,
    isConnected,
    error,
    reconnectCount,
    send,
    close,
    connect, // 供外部调用，用于手动重连
  };
}
```
