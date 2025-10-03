---
title: CSS 样式集合
description: CSS 样式集合。
sidebar: true
---

# CSS 样式集合

### 1. 浏览器滚动条样式修改

```css
::-webkit-scrollbar {
  width: 4px; /* 垂直滚动条的宽度 */
  height: 8px; /* 水平滚动条的高度 */
}

::-webkit-scrollbar-track {
  /* 滚动条的轨道 */
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: #007bff; /* 滚动条的颜色 */
  border-radius: 5px; /* 滚动条的圆角 */
}

::-webkit-scrollbar-thumb:hover {
  background-color: #0056b3; /* 滚动条悬停时的颜色 */
}
```

### 2. 文本溢出

单行文本溢出显示省略号

```css
.ellipsis {
  width: 200px; /* 容器宽度 */
  white-space: nowrap; /* 禁止换行 */
  overflow: hidden; /* 隐藏溢出文本 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
}
```

多行文本溢出（省略号）

```css
.multi-line-text {
  display: -webkit-box; /* 使用弹性盒子模型 */
  -webkit-box-orient: vertical; /* 垂直排列 */
  -webkit-line-clamp: 3; /* 限制为 3 行 */
  overflow: hidden; /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
}
```
