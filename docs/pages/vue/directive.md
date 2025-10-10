---
sidebar: true
title: directive 指令
date: 2021-04-14
tags: vue
---

# 自定义指令

除了 Vue 内置的一系列指令 (比如 v-model 或 v-show) 之外，Vue 还允许你注册自定义的指令 (Custom Directives)。

一个指令的定义对象可以提供如下几个钩子函数（均为可选）：

```js
const myDirective = {
  // 在绑定元素的 attribute 前
  // 或事件监听器应用前调用
  created(el, binding, vnode) {
    // 下面会介绍各个参数的细节
  },
  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都挂载完成后调用
  mounted(el, binding, vnode) {},
  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都更新后调用
  updated(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode) {},
  // 绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode) {},
};
```

## 钩子函数参数

指令钩子函数会被传入以下参数：

- `el`：指令所绑定的元素，可以用来直接操作 DOM。
- `binding`：一个对象，包含以下属性：
  - `value`：指令的绑定值，例如：`v-my-directive="1 + 1"` 中，绑定值为 `2`。
  - `oldValue`：指令绑定的前一个值，仅在 `beforeUpdate` 和 `updated` 钩子中可用。无论值是否改变都可用。
  - `arg`：传给指令的参数，例如 `v-my-directive:foo` 中，参数为 `"foo"`。
  - `modifiers`：一个包含修饰符的对象。例如：`v-my-directive.foo.bar` 中，修饰符对象为 `{ foo: true, bar: true }`。
  - `instance`：使用该指令的组件实例。
  - `dir`：指令的定义对象。
- `vnode`：Vue 编译生成的虚拟节点。
- `prevVnode`：上一个虚拟节点，仅在 `beforeUpdate` 和 `updated` 钩子中可用。

### 示例

```vue
<template>
  <div>
    <el-input v-focus="[1, 2, 3]" v-model="modelValue"></el-input>
  </div>
</template>
```

```js
export const focus = {
  mounted(el: HTMLInputElement) {
    // 如果是 el-input，获取内部 input
    const inputEl = el.querySelector("input") || el;
    inputEl.focus();
  },
};
```

### 全局注册

```js
import { createApp } from "vue";
import App from "./App.vue";
import { focus } from "./directives";

const app = createApp(App);

app.directive("focus", focus);

app.mount("#app");
```
