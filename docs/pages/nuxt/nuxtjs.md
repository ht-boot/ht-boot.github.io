---
sidebar: true
title: Nuxt.js
description: 基于 Vue.js 的框架，在简化开发现代网页应用，特别是服务端渲染（SSR） 和静态站点生成（SSG）的开发过程。它让 Vue.js 的应用开发变得更简单、更高效，特别是对SEO友好，提升了加载速度。
tags: vue
outline: deep
---

# Nuxt.js

## 介绍

`Nuxt.js` 是一个基于` Vue.js` 的框架，在简化开发现代网页应用，特别是服务端渲染（SSR） 和静态站点生成（SSG）的开发过程。它让 Vue.js 的应用开发变得更简单、更高效，特别是对 SEO 友好，提升了加载速度。

## Nuxt.js 的主要特点

1. **服务端渲染（SSR）**：Nuxt.js 支持服务端渲染，这意味着页面在服务器端生成 HTML，然后发送给客户端，从而提高首屏加载速度和 SEO。
2. **静态站点生成（SSG）**：Nuxt.js 还支持静态站点生成，可以生成静态 HTML 文件，适用于内容不经常更新的网站。
3. **自动代码分割**：Nuxt.js 会自动分割代码，按需加载，从而减少首次加载时间。

### Nuxt 的常用目录结构

1. pages/：存放页面组件，Nuxt 会自动根据这些文件生成路由（app/router.options.ts 会覆盖 Nuxt 原路由）。
2. layouts/：定义页面的布局，所有页面都会使用的默认布局，可以为特定页面选择不同的布局。
3. public/：存放静态资源，如图片、字体等（Nuxt2 被称为 static/目录）。
4. middleware/：存放中间件，用于路由权限问题。
5. components/：存放可复用的组件， Nuxt 会自动扫描这些目录中的文件进行注册，可直接使用。
6. plugins/：存放需要在 Vue 实例中引入的插件。
7. server/：存放服务器相关的配置文件，Nuxt 会自动扫描这些目录中的文件，以注册 API 和服务端处理器，并支持热模块替换（HMR）。
8. /server/middleware/：服务端中间件，Nuxt 会自动读取 ~/server/middleware 目录中的文件，为您的项目创建服务端中间件。服务端中间件会在每个请求到达其他服务端路由之前运行，用于添加或检查请求头、记录请求，或扩展事件请求对象。

   ......

更多目录结构详情请参考 [Nuxt.js 官方文档](https://nuxt.com.cn/docs/4.x/guide/directory-structure/app/assets)。

### 创建 Nuxt 应用

#### 安装 Nuxt.js

使用 `create-nuxt-app` 脚手架工具可以快速创建一个 Nuxt 应用。

```bash
npx create-nuxt-app my-nuxt-app
cd my-nuxt-app
npm run dev
```

#### 创建页面

```vue [index.vue]
<template>
  <div>
    <h1>Hello Nuxt!</h1>
  </div>
</template>
```

打开浏览器，访问 localhost:3000，你将看到渲染的页面。

:::tip Nuxt VS Vue

- Vue.js 是一个前端 JavaScript 框架，用于构建用户界面，它提供了基本的构建块（如组件、路由、状态管理等）。
- Nuxt.js 是基于 Vue.js 的框架，提供了更多的功能，尤其是与 SSR 和 SSG 相关的特性。它封装了 Vue.js 的一些复杂性，简化了 SSR、路由、状态管理等常见任务。

:::
