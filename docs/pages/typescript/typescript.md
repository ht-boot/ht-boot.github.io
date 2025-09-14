---
sidebar: true
title: TypeScript 泛型
date: 2022-12-11
tags: ts
---

# TypeScript 的参数约束（项目案例）

在项目中发现，有这么一个问题，要对工具函数的参数进行约束， 函数有两个参数 func(param1, param2), 一个对象(param1)还有一个是对象的属性(param2)， 且 param2 必须是 param1 中的属性。
起初定义类型如下：

```ts
function handle(param1: object, param2: string) {}

function({name: 'LI'}, 'name')
```

发现第二个参数（param2）随便传一个 string 类型的都可以，没有达到我们预想的效果，所以没有起到参数约束。

### 解决方案

TypeScript 提供了泛型，可以解决上述问题。

```ts
// 修改版
const user = {
  username: "admin",
  password: "123456",
};

function handle<T extends object, K extends keyof T>(obj: T, param: K) {} // 完美解决

handle(user, "username");
```
