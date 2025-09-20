---
sidebar: true
title: Nuxt.js Router 使用
description: 在 Nuxt.js 中，Router 是用于管理应用路由的工具。它实际上是基于 Vue Router 实现的，但 Nuxt.js 为其提供了更高层的抽象，使得你可以更轻松地构建动态路由和页面。
tags: vue
date: 2025-09-18
outline: deep
---

# Nuxt.js Router 使用

在 `Nuxt.js` 中，`Router` 是用于管理应用路由的工具。它实际上是基于 `Vue Router` 实现的，但 `Nuxt.js` 为其提供了更高层的抽象，使得你可以更轻松地构建动态路由和页面。

## 基本路由配置

在 `Nuxt.js` 中，路由是自动生成的，主要依赖于 `pages` 文件夹中的文件结构。每个 `.vue` 文件都会自动成为一个路由。例如：

- `pages/index.vue` -> `/`
- `pages/about.vue` -> `/about`
- `pages/posts/[id].vue` ->` /posts/:id` （动态路由）

## 动态路由

在 `Nuxt.js` 中，你可以使用动态路由来创建可复用的组件。动态路由是通过在文件名中使用方括号 `[]` 来定义的。例如，`pages/posts/[id].vue` 会生成一个动态路由，其中 `id` 是一个动态参数。

```vue [pages/posts/[id].vue]
<script setup lang="ts">
const route = useRoute();
console.log(route.params.id);
</script>

<template>
  <div>
    <h1>Post {{ route.params.id }}</h1>
  </div>
</template>
```

```vue [layouts/default.vue]
<template>
  <div>
    <header>
      <nav>
        <NuxtLink to="/">Home</NuxtLink> |
        <NuxtLink to="/about">About</NuxtLink> |
        <NuxtLink to="/posts/1">Post</NuxtLink>
      </nav>
    </header>

    <main>
      <!-- 页面内容将被渲染到这里 -->
      <slot />
    </main>

    <footer>
      <p>Footer content</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// definePageMeta({
//     layout: 'default'
// })
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
```

## 自定义路由

### 路由配置

使用路由选项, 可以选择使用一个函数来覆盖或扩展路由。

```ts [app/router.options.ts]
import type { RouterConfig } from "@nuxt/schema";

export default {
  routes: (_routes) => [
    {
      name: "home",
      path: "/",
      component: () => import("~/pages/index.vue"),
    },
    {
      name: "about",
      path: "/about",
      component: () => import("~/pages/about.vue"),
    },
  ],
} satisfies RouterConfig;
```

:::info ⚠️ 注意
Nuxt 不会使用你提供的组件的 definePageMeta 中定义的元数据来增强你从 routes 函数返回的任何新路由
:::

### 路由权限(中间件 middleware)

Nuxt 提供了一个可自定义的 路由中间件 框架，您可以在整个应用程序中使用它，非常适合提取要在导航到特定路由之前运行的代码。
