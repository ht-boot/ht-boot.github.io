---
sidebar: true
title: 无感 token 刷新
date: 2024-08-11
tags: js
outline: deep
---

# token 无感刷新

前端使用短生命周期访问 token（access token） 的情况下，用户无需手动刷新页面或重新登录，自动获取新的 token 并继续访问受保护接口。

## 实现思路

无感刷新核心逻辑：

- 前端在请求接口时携带 Access Token。如果 Access Token 过期，服务端返回 401 或特定错误码。
- 前端捕获这个错误：使用 Refresh Token 请求新的 Access Token。
- 更新本地存储（如 localStorage / sessionStorage / Vuex / Pinia）。
- 重试原来的接口请求。
- 如果 Refresh Token 也过期，则跳转登录。

代码实现：

```js
import axios from "axios";

let isRefreshing = false; // 是否正在刷新
let requestQueue = []; // 存放待重试的请求

const api = axios.create({
  baseURL: "/api",
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { config, response } = err;

    if (response && response.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem("refresh_token");

        try {
          const { data } = await axios.post("/auth/refresh", {
            refresh_token: refreshToken,
          });
          localStorage.setItem("access_token", data.access_token);

          // 重试队列中的请求
          requestQueue.forEach((cb) => cb(data.access_token));
          requestQueue = [];
        } catch (e) {
          // Refresh Token 也失效，跳转登录
          window.location.href = "/login";
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }

      // 返回一个 Promise，等 token 刷新完成后再重试
      return new Promise((resolve) => {
        requestQueue.push((token) => {
          config.headers["Authorization"] = `Bearer ${token}`;
          resolve(api(config));
        });
      });
    }

    return Promise.reject(err);
  }
);

export default api;
```

:::info 核心点

- 避免重复刷新: 当多个请求同时返回 401 时，只发一次刷新请求，用 requestQueue 存放等待重试的请求。
- 重试机制: 刷新 token 成功后，把等待队列中的请求重新发送。
  :::
