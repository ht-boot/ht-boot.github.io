---
sidebar: true
title: 闭包
date: 2022-08-11
tags: js
outline: deep
---

# 闭包

## 什么是闭包？

闭包就是函数和它的作用域（定义时的作用域）形成的组合，即使函数在作用域外被调用，它依然能访问到作用域中的变量。

换句话说，函数会“记住”它出生时的环境。

一个简单的例子：

```js
function createCounter() {
  let count = 0; // 局部变量

  return function () {
    count++; // 访问外部函数的变量
    return count;
  };
}

const counter = createCounter();

console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

`createCounter` 执行完后，按理说 `count` 应该销毁，但因为返回的函数用到了它，JS 引擎会把 `count` 留在内存里。这就是闭包。

## 闭包的应用

1. **数据私有化**：避免全局变量污染，例如上面的 count 只能通过 counter() 操作。
2. **函数工厂**：创建多个函数，可以根据传入参数生成定制化函数。

```js
function makeAdder(x) {
  return function (y) {
    return x + y;
  };
}

const add5 = makeAdder(5);
const add10 = makeAdder(10);
console.log(add5(10)); // 15
console.log(add10(10)); // 20
```

## 闭包的本质

1. **作用域链**: 函数在定义时生成的作用域链，即使函数在作用域外被调用，它依然能访问到作用域中的变量。
2. **内存不会释放**: 只要闭包存在，它引用的变量就不会被 GC 回收。

   - 优点：保留状态

   - 缺点：容易导致 内存泄漏
