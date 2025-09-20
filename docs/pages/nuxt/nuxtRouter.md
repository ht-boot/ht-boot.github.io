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

#### 1. 覆盖默认路由

彻底抛弃 pages/ 自动路由，可以自己在 app/router.options.ts 里定义：

```ts [app/router.options.ts]
import type { RouterConfig } from "@nuxt/schema";

// 自定义路由表
export default {
  routes: () => [
    {
      path: "/",
      component: () => import("~/pages/index.vue"),
      meta: { layout: "custom" }, // 路由元信息
    },
    {
      path: "/about",
      component: () => import("~/pages/about/index.vue"),
    },
    {
      path: "/login",
      component: () => import("~/pages/login.vue"),
    },
    {
      path: "/posts/:postId",
      component: () => import("~/pages/posts/[id].vue"),
    },
  ],
} satisfies RouterConfig;
```

:::info ⚠️ 注意
Nuxt 不会使用你组件内 definePageMeta 中定义的元数据来增强你从 routes 函数返回的任何新路由。
但是你可以直接在 routes 函数中定义 meta 字段。例如：

```ts
import type { RouterConfig } from "@nuxt/schema";

// 自定义路由表
export default {
  routes: () => [
    {
      path: "/",
      component: () => import("~/pages/index.vue"),
      meta: { layout: "custom" }, // 使用custom布局
    },

    {
      path: "/login",
      component: () => import("~/pages/login.vue"),
      meta: { layout: "default" }, // 使用default布局
    },
  ],
} satisfies RouterConfig;
```

:::

#### 2. 保留 Nuxt 自动路由 + 动态追加

如果想继续用 pages/ 的自动路由，但又要支持 动态添加路由（比如后台返回菜单配置），可以用 Vue Router API：
:::

#### 2. 保留 Nuxt 自动路由 + 动态追加

如果想继续用 pages/ 的自动路由，但又要支持 动态添加路由（比如后台返回菜单配置），可以用 Vue Router API：

在插件里创建路由 plugins/router.client.ts

```ts [plugins/router.client.ts]
export default defineNuxtPlugin((nuxtApp) => {
  const router = nuxtApp.$router;

  // 模拟后台返回的动态路由
  const dynamicRoutes = [
    {
      path: "/profile",
      name: "profile",
      component: () => import("~/pages/profile.vue"),
      meta: { role: "user" },
    },
    {
      path: "/reports",
      name: "reports",
      component: () => import("~/pages/reports.vue"),
      meta: { role: "admin" },
    },
  ];

  dynamicRoutes.forEach((route) => {
    if (!router.hasRoute(route.name!)) {
      router.addRoute(route);
    }
  });
});
```

### 路由权限(中间件 middleware)

Nuxt3 提供了 `middleware` 路由中间件系统，相当于 Vue Router 的守卫。

#### 1. 全局中间件（所有路由都会触发）

创建文件：middleware/auth.global.ts

```ts [middleware/auth.global.ts]
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useState("user"); // 假设用户信息存在这里

  if (!user.value && to.path !== "/login") {
    return navigateTo("/login");
  }
});
```

#### 2. 局部中间件（单个页面指定）

创建文件：middleware/auth.ts

```ts [middleware/auth.ts]
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useState("user");

  if (!user.value) {
    return navigateTo("/login");
  }
});
```

然后在页面里声明 `definePageMeta` => `middleware: auth`

```vue [pages/index.vue]
<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
</script>
```

这样只有这个页面会触发 auth 中间件。

#### 3. 动态中间件

创建文件：middleware/role.ts

```ts [middleware/role.ts]
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth();

  // 从 meta 里读取当前页面需要的权限
  const requiredRole = to.meta.role as string | undefined;

  if (!requiredRole) {
    return; // 无权限要求
  }

  if (!user.value) {
    return navigateTo("/login");
  }

  if (requiredRole === "admin" && user.value.role !== "admin") {
    return navigateTo("/"); // 没有权限，跳首页
  }
});
```

在页面里动态声明权限 => `definePageMeta` => `meta: { role: "admin" }`

```vue [pages/admin.vue]
<script setup lang="ts">
definePageMeta({
  middleware: "role", // 使用动态中间件
  role: "admin", // 要求管理员角色
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-bold">后台管理页面</h1>
  </div>
</template>
```
