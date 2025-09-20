---
sidebar: true
title: Nuxt.js 异步请求
description: Nuxt.js 异步请求的方式
date: 2025-09-19
outline: deep
tags: vue
---

# Nuxt.js 异步请求

## 1. useFetch（推荐，SSR + CSR 通用）

`useFetch` 默认会在服务端先发请求（SSR）, 默认缓存:同一页面多次调用相同 URL,后面复用缓存。

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = await useFetch("/api/posts");
</script>

<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="post in data" :key="post.id">{{ post.title }}</li>
    </ul>
  </div>
</template>
```

useFetch(url, options) 参数说明：

- url：请求的 URL，必填
- options：配置项，可选:
  - baseURL：请求的基础 URL
  - method：请求方法，默认 GET
  - headers：请求头
  - params：请求参数
  - body：请求体
  - retry：请求失败时重试次数，默认 3 次
  - retryDelay：请求失败时重试间隔，默认 1000 毫秒
  - server：是否在服务端执行，默认 true
  - immediate：是否立即执行，默认 true
  - lazy: false, // 是否懒加载，默认 false（如果 true，则不会阻塞 SSR 渲染）
  - default: () => [], // 请求失败时的默认值
  - transform: (res) => res.data, // 转换响应数据
  - pick: ['title'], // 只保留返回对象中的某些字段
  - key: "posts-list", // 缓存 key，默认根据 URL 生成（用于复用缓存
  - watch: [() => query.value] // 依赖变化时重新执行

只在客户端请求（不走 SSR）：

```js
const { data } = await useFetch("/api/posts", {
  server: false,
  method: "post",
  body: { id: 1 },
});
```

延迟执行（比如点击按钮时才发）：

```js
const { data, execute } = await useFetch("/api/posts", { immediate: false });
// 调用 execute() 时才发请求
```

手动设置 key（缓存命名）：  
如果你请求的 URL 一样，但逻辑不同，可以通过 key 来控制缓存。

```js
const { data } = await useFetch("/api/posts", { key: "posts-list" });
```

配置 default 缓存时间： `staleTime` 或 `cacheTime` 可以控制缓存时效，`staleTime` 是数据过期时间，`cacheTime` 是缓存时间。

```js
const { data } = await useFetch("/api/posts", {
  key: "posts-list",
  // 数据 10 秒内复用，不会重新请求
  staleTime: 10 * 1000,
});
```

只缓存到客户端（不走 SSR）：如果你希望数据只在浏览器里缓存，不要服务端缓存

```js
const { data } = await useFetch("/api/posts", {
  key: "posts-list",
  server: false,
});
```

## 2. useAsyncData

`useAsyncData` 在 SSR 阶段 或 客户端 执行异步请求，并且会把结果缓存起来，避免重复请求。
`useFetch` 只能做 HTTP 请求, `useAsyncData` 可以做任何异步操作(例如$fetch、axios、数据库调用、文件读取……)。

```vue
<script setup lang="ts">
// key 必须唯一，Nuxt 用它来缓存数据
const { data, pending, error, refresh } = await useAsyncData("user", () =>
  $fetch("/api/user", {
    method: "get",
    params: { id: 1 },
  })
);
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <pre v-else>{{ data }}</pre>
</template>
```

useAsyncData(key, fetcher, options) 参数说明：

- key：缓存 key 必须唯一，必填
- fetcher：异步函数，必填
- options：配置项，可选:
  - server：是否在服务端执行，默认 true
  - immediate：是否立即执行，默认 true
  - lazy: false, // 是否懒加载，默认 false（如果 true，则不会阻塞 SSR 渲染）
  - default: () => [], // 请求失败时的默认值
  - transform: (res) => res.data, // 转换响应数据
  - pick: ['title'], // 只保留返回对象中的某些字段
  - watch: [() => query.value] // 依赖变化时重新执行

```js

```
