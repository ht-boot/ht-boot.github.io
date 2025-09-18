---
sidebar: true
title: Nuxt.js Layout布局
description: 在 Nuxt.js 中，layouts 是用来定义不同页面布局的机制。你可以通过自定义布局来控制页面的结构，比如顶部导航、侧边栏、底部等。Nuxt.js 默认提供了一个简单的布局，但你可以根据需求创建更多的布局。
tags: vue
date: 2025-09-18
outline: deep
---

# Nuxt.js Layout 布局

在 Nuxt.js 中，layouts 是用来定义不同页面布局的机制。你可以通过自定义布局来控制页面的结构，比如顶部导航、侧边栏、底部等。Nuxt.js 默认提供了一个简单的布局，但你可以根据需求创建更多的布局。

## 创建 Layout（默认布局/自定义布局）

Nuxt.js 默认提供了一个简单的布局，你可以通过在 `layouts` 目录下创建一个 `default.vue` `custom.vue`文件来定义它。这个布局将会被应用到所有没有指定其他布局的页面。

```vue
<!-- --------------------[layouts/default.vue]----------------- -->
<template>
  <div>
    <header>
      <nav>
        <NuxtLink to="/">Home</NuxtLink> |
        <NuxtLink to="/about">About</NuxtLink> |
        <NuxtLink :to="`/posts/${new Date().getTime()}`">Post</NuxtLink>
      </nav>
    </header>

    <main>
      <!-- 页面内容将被渲染到这里 -->
      <slot />
    </main>

    <footer>
      <p>default page</p>
    </footer>
  </div>
</template>

<!-- ----------------[layouts/custom.vue]--------------------- -->
<template>
  <div>
    <header>
      <nav>
        <NuxtLink to="/">Home</NuxtLink> |
        <NuxtLink to="/about">About</NuxtLink> |
        <NuxtLink :to="`/posts/${new Date().getTime()}`">Post</NuxtLink>
      </nav>
    </header>

    <main>
      <!-- 页面内容将被渲染到这里 -->
      <slot />
    </main>
    <footer>
      <p>custom page</p>
    </footer>
  </div>
</template>
```

## 使用 Layout

在页面文件中（pages/index.vue），你可以通过 `definePageMeta layout` 属性来指定使用哪个布局：

```vue [pages/index.vue]
<template>
  <div class="container">
    <div class="col-md-12">
      <nuxt-header />
      <h1>Home Page</h1>
    </div>
  </div>
</template>
<script setup>
definePageMeta({
  layout: "custom", // 使用自定义布局
});
</script>
```

如果不指定 layout，则默认使用 default.vue 布局。

文件 app.vue 中，通过将 `<NuxtLayout>` 添加到您的 app.vue 来启用布局

```vue [app.vue]
<!-- <NuxtPage> 是 Nuxt 自带的内置组件。它允许您显示位于 pages/ 目录中的顶层或嵌套页面。 -->
<!--  <NuxtLayout /> 组件在 app.vue 激活 default 布局。 -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```
