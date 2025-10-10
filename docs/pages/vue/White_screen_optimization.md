---
sidebar: true
title: 白屏优化
description: 白屏优化
date: 2022-07-05
outline: deep
---

# 白屏优化

白屏常见原因：

- 打包后 JS 文件很大 → 加载慢
- 接口返回慢 → 页面卡在空状态
- 渲染报错 → 页面直接空白
- 资源缓存或路径错误 → 资源加载失败

白屏优化思路：
| 层级 | 目标 | 核心技术 |
| ------- | -------- | ------------------------------ |
| 1️⃣ 感知层 | 给用户反馈 | 骨架屏 / Loading 动画 |
| 2️⃣ 构建层 | 降低首屏资源体积 | 代码分包 / 懒加载 / Tree-shaking |
| 3️⃣ 网络层 | 提前加载关键资源 | CDN / 缓存 / Preload / Prefetch |
| 4️⃣ 渲染层 | 提升首屏渲染速度 | SSR / Prerender / Hydration 优化 |
| 5️⃣ 稳定层 | 防止白屏错误 | 错误监控 / 降级展示 |

### 1. 骨架屏

在内容加载前展示页面结构，让用户“感觉更快”。

### 2. SSR（服务端渲染）或预渲染（Prerender）

SSR 框架：

> Vue → Nuxt 3  
> React → Next.js

用户访问时服务器生成 HTML，浏览器直接显示内容，再“激活”前端逻辑

预渲染：

> Vue → prerender-spa-plugin  
> React → react-snapshot / react-snap

构建时生成 HTML，用户访问时直接显示内容

### 3. 减少首屏加载体积

#### 3.1 拆分代码

- 代码分包：按页面拆分代码，路由组件懒加载

```js
const Home = () => import("@/views/Home.vue");
```

- Tree-shaking：去除无用代码
  确保使用 ES Modules.  
  在构建工具中开启 minify 和 treeshake

#### 3.2 压缩与缓存

- 压缩：Gzip 或 Brotli 压缩（Vite/webpack 自带插件）
- 缓存：使用 contenthash 命名文件，浏览器缓存文件

1. 缓存：使用 contenthash 命名文件
   vite 示例：

```js [vite.config.js]
// vite.config.js
export default {
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        entryFileNames: "assets/js/[name].[hash].js",
        chunkFileNames: "assets/js/[name].[hash].js",
        assetFileNames: "assets/[name].[hash][extname]",
      },
    },
  },
};
```

> Vite 默认已经开启 hash 文件名，不配置也行。

2. 服务端设置 HTTP 缓存头
   浏览器能否缓存、缓存多久，是由 HTTP 响应头 决定的。
   静态资源（带 hash 的文件）

```http
Cache-Control: public, max-age=31536000, immutable
```

:::tip 含义
max-age=31536000：缓存一年（单位秒）  
immutable：告诉浏览器文件永远不会变，不用重新请求  
文件名变了 → 内容变了 → 浏览器自然请求新文件。
:::

HTML 文件

```http
<!-- 不缓存，必须重新验证 -->
Cache-Control: no-cache, must-revalidate
```

nginx 配置示例：

```nginx
# HTML 短缓存
location ~* \.html$ {
  add_header Cache-Control "no-cache, must-revalidate";
}

# JS / CSS / 图片 长期缓存
location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff2?)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

#### 3.3 使用 CDN

将静态资源放 CDN（如 jsDelivr、阿里云 OSS）
利用 dns-prefetch + preconnect：

```html
<link rel="dns-prefetch" href="//cdn.example.com" />
<link rel="preconnect" href="//cdn.example.com" />
```

### 4. 接口请求优化

- 首屏接口并行请求（Promise.all）
- 减少接口层重定向、跨域等额外耗时

### 5. 防止白屏错误

- 降级展示：加载失败时，展示静态内容或简单提示

```js
window.addEventListener("error", (e) => {
  console.error("Script Error:", e.message);
  showErrorPage();
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Promise Error:", e.reason);
  showErrorPage();
});
```

- 降级 UI

```vue
<ErrorPage v-if="error" />
```

### 6. 其他

#### 6.1 defer / async：异步加载文件

```html
<script src="main.js" defer></script>
<script src="main.js" async></script>
```

| 属性            | 加载方式 | 执行时机                 | 执行顺序       | 是否阻塞 HTML |
| --------------- | -------- | ------------------------ | -------------- | ------------- |
| _(默认)_ 无属性 | 同步加载 | 立即执行（阻塞解析）     | 按顺序执行     | 🚫 阻塞       |
| `defer`         | 异步下载 | **HTML 解析完成后** 执行 | 按脚本顺序执行 | ✅ 不阻塞     |
| `async`         | 异步下载 | **下载完成后立即执行**   | 执行顺序不确定 | ✅ 不阻塞     |

#### 6.2 defer 优化白屏

vue 示例：

```vue
<template>
  <div class="container_defer">
    <!-- 模拟大文件渲染 -->
    <template v-for="j in 20000">
      <span class="item-sub" v-if="defer(j)"></span>
    </template>
  </div>
</template>
<script setup lang="ts">
import { useDefer } from "../hooks/useDefer";

const defer = useDefer(20000);
</script>

<style scoped>
.container_defer {
  text-align: left;
}

.item-sub {
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: red;
  margin: 5px 0 0 5px;
}
</style>
```

hook 示例：

```ts [hooks/useDefer.ts]
import { ref, onUnmounted } from "vue";
/**
 * 使用 requestAnimationFrame 实现的延迟渲染函数
 * @param stopTag 停止计数的帧数阈值
 * @returns 返回一个 defer 函数，用于判断是否已经达到指定的帧数
 */
export function useDefer(stopTag: number) {
  const frameCount = ref(0);
  let timer: number | null = null;

  // 更新帧数的函数
  const update = () => {
    frameCount.value++;
    timer = requestAnimationFrame(update);
    // 如果当前帧数超过停止标签，则取消动画帧
    if (stopTag < frameCount.value) {
      if (timer) cancelAnimationFrame(timer);
    }
  };

  // 启动计数
  update();

  // 组件卸载时停止动画帧，防止内存泄漏
  onUnmounted(() => {
    if (timer) cancelAnimationFrame(timer);
  });

  /**
   * 判断是否已经达到第 n 帧（即延迟了 n 帧）
   * @param n 延迟的帧数
   * @returns 如果当前帧数大于等于 n，返回 true，否则返回 false
   */
  const defer = (n: number) => frameCount.value >= n;

  return defer;
}
```

这样组件就会逐帧渲染，避免白屏问题。
