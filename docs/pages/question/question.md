---
title: 问题记录
description: 记录平时遇到的bug,代码不理解的地方。
sidebar: true
tags: 其他
---

# 问题记录

为什么 Proxy 需要 Reflect？

1. 访问器属性（getter）的 this 指向问题。

代码示例：

```js
const obj = {
  _name: "张三",
  get name() {
    return this._name; // 访问器中的 this
  },
};

// 不使用 Reflect 的 Proxy
const badProxy = new Proxy(obj, {
  get(target, prop) {
    return target[prop]; // 直接返回访问器的结果
  },
});

const child = {
  __proto__: badProxy,
  _name: "李四",
};

console.log(child.name); // 张三
```
