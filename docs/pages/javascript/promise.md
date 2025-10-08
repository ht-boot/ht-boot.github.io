---
sidebar: true
title: Promise
date: 2021-10-15
tags: js
outline: deep
---

# Promise

在 JavaScript 中，Promise 是一种用于处理异步操作的对象。它代表了一个在未来某个时间点可能完成或失败的操作，并且可以通过回调函数来处理操作的结果。

Promise 对象有三种状态：

| 状态                    | 描述                           | 变更条件              |
| ----------------------- | ------------------------------ | --------------------- |
| **Pending（等待中）**   | 初始状态，既不是成功也不是失败 | 创建时默认状态        |
| **Fulfilled（已完成）** | 异步操作成功完成               | 调用 `resolve(value)` |
| **Rejected（已拒绝）**  | 异步操作失败                   | 调用 `reject(reason)` |

:::info ⚠️ 注意
一旦状态从 Pending 变为 Fulfilled 或 Rejected，就 不可逆。
:::

## 创建 Promise

Promise 对象可以通过 `new Promise()` 构造函数来创建。构造函数接受一个函数，该函数有两个参数：`resolve` 和 `reject`。

```js
const promise = new Promise((resolve, reject) => {
  // 异步操作
  if (/* 异步操作成功 */) {
    resolve(value); // 将 Promise 状态改为 Fulfilled
  } else {
    reject(reason); // 将 Promise 状态改为 Rejected
  }
});
```

## 使用 Promise

Promise 对象提供了一些方法来处理异步操作的结果：

```js
promise
  .then((value) => {
    // 处理成功的结果
  })
  .catch((reason) => {
    // 处理失败的原因
  })
  .finally(() => {
    // 无论失败与否都执行
  });
```

## 链式调用

Promise 对象支持链式调用，即可以在一个 Promise 对象上连续调用多个 `.then()` 方法。每个 `.then()` 方法都会返回一个新的 Promise 对象，因此可以继续链式调用。

```js
promise
  .then((value) => {
    // 处理成功的结果
    return value + 1;
  })
  .then((newValue) => {
    // 处理上一步的结果
    console.log(newValue); // 输出 2
  });
```

## Promise 常用静态方法

### 1. Promise.all(iterable)

等待所有 Promise 完成，返回结果数组，如果有一个失败，整体失败。

```js
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, "foo");
});

Promise.all([promise1, promise2, promise3]).then((values) => {
  console.log(values);
});
// expected output: Array [3, 42, "foo"]
```

### 2. Promise.race(iterable)

等待所有 Promise 完成，返回第一个完成的结果，无论成功失败。

```js
Promise.race([
  new Promise((res) => setTimeout(() => res(1), 1000)),
  new Promise((res) => setTimeout(() => res(2), 500)),
]).then((result) => console.log(result)); // 2
```

### 3.Promise.resolve(value)

创建一个 立即成功的 Promise，状态为 Fulfilled。

```js
Promise.resolve(42).then((value) => {
  console.log(value); // 42
});
```

如果传入的是 Promise，会直接返回这个 Promise, 如果传入的是 thenable 对象（有 then 方法的对象），会执行其 then 方法。

### 4. Promise.reject(reason)

创建一个 立即失败的 Promise，状态为 Rejected。

```js
Promise.reject(new Error("Whoops!")).catch((error) => {
  console.log(error); // Error: Whoops!
});
```

### 5. Promise.allSettled(iterable)

等待所有 Promise 完成，返回结果为数组，无论成功失败。

```js
Promise.allSettled([Promise.resolve(1), Promise.reject("失败")]).then(
  (results) => {
    console.log(results);
    // [
    //   { status: "fulfilled", value: 1 },
    //   { status: "rejected", reason: "失败" }
    // ]
  }
);
```

### 6. Promise.any(iterable)

返回 第一个成功的 Promise，如果全部失败，则 reject（返回 AggregateError）。

```js
Promise.any([
  Promise.reject("失败1"),
  Promise.reject("失败2"),
  Promise.resolve("成功"),
]).then((value) => {
  console.log(value); // "成功"
});
```
