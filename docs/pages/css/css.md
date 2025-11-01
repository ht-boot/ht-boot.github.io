---
title: CSS 样式集合
description: CSS 样式集合。
sidebar: true
date: 2021-07-06
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

### 3. CSS 裁剪

clip-path 允许您使用各种几何图形或 SVG 路径，将原本方形的 HTML 元素裁剪成任意形状，从而实现复杂的、非矩形的布局和视觉效果。

常见几何图形函数
| 函数 | 作用 | 示例 | 形状 |
|------|------|------|------|
| `circle()` | 裁剪为圆形。 | `clip-path: circle(50% at 50% 50%);` | 圆形 (Circle) |
| `ellipse()` | 裁剪为椭圆。 | `clip-path: ellipse(60% 40% at 50% 50%);` | 椭圆 (Oval) |
| `polygon()` | 裁剪为多边形。需要定义一系列点的坐标。 | `clip-path: polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%);` | 任意多边形 (e.g., Star, Arrow) |
| `inset()` | 裁剪为内嵌的矩形。 | `clip-path: inset(10% 20% 30% 40%);` | 内嵌矩形 (Rounded Corners) |
