---
sidebar: true
outline: deep
title: 主题切换动画添加
date: 2024-04-11
tags: js
---

# 主题切换动画添加

前些天看到 element-plus 官网的主题切换居然有了动画效果，感觉挺有意思的，于是网上搜了一下，发现实现起来其实很简单，下面记录一下实现过程。

这里要先介绍一个 API，[View Transition API](https://developer.mozilla.org/zh-CN/docs/Web/API/View_Transition_API)（如果想要详细了解的话可以点击去官网查看） 是一个用于在视图之间添加过渡效果的 API，它允许我们在视图切换时添加动画效果。

### 代码实现

#### 主题 css 配置

```css [style.css]
:root {
  --color-text: #333;
  --color-background: #ffffff;
}

:root[data-theme="dark"] {
  --color-text: #ffffff;
  --color-background: #1a1a1a;
}

:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#app {
  width: 100%;
  height: 100vh;
  text-align: center;
  color: var(--color-text);
  background-color: var(--color-background);
}
```

#### 创建主题切换功能的页面

```html [index.vue]
<script setup>
const changeTheme = (themeName) => {
  document.documentElement.setAttribute("data-theme", themeName);
};

const handleChange = (e, themeName) => {
  changeTheme(themeName);
};

</script>
<template>
  <div class="theme">
    <div class="theme__content">
      <div class="theme__content__title">主题切换</div>
      <div class="theme__content__btn">
        <p @click="handleThemeChange($event, 'light')">浅色主题</p>
        <p @click="handleThemeChange($event, 'dark')">暗色主题</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 20px;
}

.theme__content__title {
  font-size: 24px;
  font-weight: 600;
}

.theme__content__btn {
  display: flex;
  gap: 20px;
}

.theme__content__btn p {
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}
```

这里我们通过 `changeTheme` 方法，然后就可以实现主题切换了。  
但是这里是没有动画效果的，所以接下来我们使用 `View Transition API` 来添加动画效果。

#### 添加动画效果

```js [index.vue]
// 背景切换动画 startViewTransition
const handleThemeChange = (e, themeName) => {
  /**
   * 首先获取点击位置的坐标 (clientX, clientY)
   * 然后计算从点击点到页面最远角落的距离作为半径，使用 Math.hypot 函数计算直角三角形的斜边长度
   * 这个半径确保圆形能够覆盖整个视口
   */
  const { clientX, clientY } = e;
  const radius = Math.hypot(
    Math.max(clientX, window.innerWidth - clientX),
    Math.max(clientY, window.innerHeight - clientY)
  );
  // 调用 startViewTransition 方法，传入一个回调函数，回调函数中调用 changeTheme 方法切换主题
  const transition = document.startViewTransition(() => {
    handleChange(themeName);
  });
  transition.ready.then(() => {
    /**
     * @clipPath 使用 clip-path 的 circle() 函数创建一个圆形裁剪区域,动画从一个小圆点（0%）开始，逐渐扩大到计算出的半径,圆心位置固定在点击点 (${clientX}px ${clientY}px)
     * @duration 动画持续时间为 500 毫秒
     * @pseudoElement 使用 ::view-transition-new(root), 这是 View Transition API 的专用伪元素, 伪元素选择器来选择新视图的根元素
     */
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0% at ${clientX}px ${clientY}px)`,
          `circle(${radius}px at ${clientX}px ${clientY}px)`,
        ],
      },
      {
        duration: 500,
        pseudoElement: "::view-transition-new(root)",
      }
    );
  });
};
```

这样我们点击按钮切换主题，就可以看到一个半径从 0 过渡到 100%圆一个动画效果了。
::: info 注意 ⚠️
这里需要禁用默认的淡入淡出动画，否则会影响我们自定义的动画效果。

```css [style.css]
::view-transition-new(root),
::view-transition-old(root) {
  /* 关闭默认动画，否则影响自定义动画的执行 */
  animation: none;
}
```

:::

接下来实现圆形收起的效果,一个半径从 100% 过渡到 0 的一个动画，这里我们只需要将 `clipPath` 的两个值调换一下顺序即可。如下；

```js [index.vue]
document.documentElement.animate(
  {
    clipPath: [
      `circle(${radius}px at ${clientX}px ${clientY}px)`,
      `circle(0% at ${clientX}px ${clientY}px)`,
    ],
  },
  {
    duration: 500,
    pseudoElement: "::view-transition-new(root)",
  }
);
```

#### 主题切换动画整合

```js [index.vue]
const handleThemeChange = (e, themeName) => {
  const { clientX, clientY } = e;
  const radius = Math.hypot(
    Math.max(clientX, window.innerWidth - clientX),
    Math.max(clientY, window.innerHeight - clientY)
  );

  const transition = document.startViewTransition(() => {
    changeTheme(themeName);
  });

  const clipPath = [
    `circle(0% at ${clientX}px ${clientY}px)`,
    `circle(${radius}px at ${clientX}px ${clientY}px)`,
  ];
  transition.ready.then(() => {
    // 圆形扩散计算
    document.documentElement.animate(
      {
        clipPath: themeName !== "dark" ? clipPath : [...clipPath].reverse(),
      },
      {
        duration: 500,
        // 伪元素选择器来选择新视图的根元素，非dark修改视图层，防止暗色主题切换浅色主题时的闪烁问题
        pseudoElement:
          themeName !== "dark"
            ? "::view-transition-new(root)"
            : "::view-transition-old(root)",
      }
    );
  });
};
```

:::info 注意 ⚠️ 因为层级原因， 需要调整过渡到暗色模式时 ::view-transition-old(root) 的层级，防止暗色主题切换浅色主题时屏幕闪烁问题

```css [style.css]
/* 因为 view-transition-new(root) > view-transition-old(root)层级原因，
所以过渡到暗色模式时 ::view-transition-old(root) 的层级设置大一点， 不然会导致屏幕闪烁问题 */
:root[data-theme="dark"]::view-transition-old(root) {
  z-index: 100;
}
```

:::

:::tip 查看一下效果
![gif](https://free.picui.cn/free/2025/09/14/68c6d223eb62c.gif)
:::

### 完整代码

```html [index.vue]
<script setup>
  const changeTheme = (themeName) => {
    document.documentElement.setAttribute("data-theme", themeName);
  };
  // 背景切换动画 startViewTransition
  const handleThemeChange = (e, themeName) => {
    const { clientX, clientY } = e;
    const radius = Math.hypot(
      Math.max(clientX, window.innerWidth - clientX),
      Math.max(clientY, window.innerHeight - clientY)
    );

    const transition = document.startViewTransition(() => {
      changeTheme(themeName);
    });

    const clipPath = [
      `circle(0% at ${clientX}px ${clientY}px)`,
      `circle(${radius}px at ${clientX}px ${clientY}px)`,
    ];
    transition.ready.then(() => {
      // 圆形扩散计算
      document.documentElement.animate(
        {
          clipPath: themeName !== "dark" ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 500,
          // 伪元素选择器来选择新视图的根元素，非dark修改视图层，防止暗色主题切换浅色主题时的闪烁问题
          pseudoElement:
            themeName !== "dark"
              ? "::view-transition-new(root)"
              : "::view-transition-old(root)",
        }
      );
    });
  };
</script>

<template>
  <div class="theme">
    <div class="theme__content">
      <div class="theme__content__title">主题切换</div>
      <div class="theme__content__btn">
        <p @click="handleThemeChange($event, 'light')">浅色主题</p>
        <p @click="handleThemeChange($event, 'dark')">暗色主题</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .theme__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 20px;
  }

  .theme__content__title {
    font-size: 24px;
    font-weight: 600;
  }

  .theme__content__btn {
    display: flex;
    gap: 20px;
  }

  .theme__content__btn p {
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
  }
</style>
```

```css [style.css]
:root {
  --color-text: #333;
  --color-background: #ffffff;
}

:root[data-theme="dark"] {
  --color-text: #ffffff;
  --color-background: #1a1a1a;
}

:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::view-transition-new(root),
::view-transition-old(root) {
  /* 关闭默认动画，否则影响自定义动画的执行 */
  animation: none;
}
/* 因为view-transition-new(root) > view-transition-old(root)层级原因，
所以过渡到暗色模式时 ::view-transition-old(root) 的层级设置大一点， 不然会导致屏幕闪烁问题*/
:root[data-theme="dark"]::view-transition-old(root) {
  z-index: 100;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#app {
  width: 100%;
  height: 100vh;
  text-align: center;
  color: var(--color-text);
  background-color: var(--color-background);
}
```

好了，我们就完成了主题切换动画的实现，并且实现了主题切换的过渡效果。
