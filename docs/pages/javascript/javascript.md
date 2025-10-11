---
sidebar: true
title: JavaScript
description: JavaScript 知识集合
tags: js
---

# JavaScript 知识集合

:::tip tips
对 JavaScript 学习的零碎记录。
:::

## 1. js 事件循环

事件循环是保证 JavaScript 单线程模型高效运行的机制。它确保同步代码先执行，然后再执行异步任务（微任务优先），使得代码执行流畅且不会阻塞。

### 1.1 事件循环工作原理

1. 执行栈 (Call Stack)：JavaScript 是单线程执行的，所有的同步代码都会按顺序执行，并被压入执行栈中。
2. 消息队列 (Message Queue)：当异步代码（如 setTimeout、Promise、I/O 操作等）完成时，它们的回调函数会被放入消息队列等待执行。
3. 事件循环 (Event Loop)：事件循环的职责是检查执行栈是否为空。如果栈为空，它会将消息队列中的第一个回调推入执行栈中执行。这样，异步任务的回调就会在执行栈空闲时执行。
4. 宏任务与微任务：

   - 宏任务：每次从消息队列中取出的任务，例如：setTimeout、I/O 事件、UI 渲染等。
   - 微任务：比宏任务更优先执行的任务，通常是 Promise 的回调、MutationObserver 等。

### 1.2 流程示意

- 执行栈中开始执行同步代码。
- 执行完同步代码后，事件循环检查消息队列，优先执行微任务（Promise 回调等）。
- 如果微任务队列为空，事件循环会从宏任务队列中取出第一个任务执行。
- 宏任务执行完毕后，再次检测微任务队列，执行微任务。
- 重复第 3、4 步，形成一个循环。

## 参考资料

[https://developer.mozilla.org/zh-CN/](https://developer.mozilla.org/zh-CN/)
