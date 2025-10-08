---
title: Node.js
description: Node.js 是一个基于 Chrome V8 引擎 的 JavaScript 运行环境，让 JavaScript 不只在浏览器里跑，还可以在服务器上运行。
sidebar: true
outline: deep
date: 2021-03-12
---

# Node.js

Node.js 是一个开源和跨平台的 JavaScript 运行时环境。它可以搭建后端服务器，文件与系统操作，构建前端工具，
命令行应用等。
:::tip 简单来说
它让 JavaScript 不只在浏览器里跑，还可以在服务器上运行。
:::

## Node.js 异步与事件循环

Node.js 最大的特点就是 **单线程 + 异步非阻塞 I/O**（输入/输出），事件循环机制，它让 `Node.js` 在处理高并发请求时，性能十分出色。

### 单线程 + 异步非阻塞 I/O

#### 1. 单线程

Node.js 只有一个主线程来执行 JavaScript 代码。这个线程就是 `事件循环的执行线程`。Node.js 在执行代码时，会从上到下依次执行同步代码，遇到异步代码时，会将其放到事件循环中，然后继续执行后续的同步代码。

例子：

```js
console.log("1");
setTimeout(() => {
  console.log("2");
}, 1000);
console.log("3");
```

输出结果：

```
1
3
2
```

说明: 所有代码都是顺序执行的，`setTimeout` 是一个异步代码，所以会放到事件循环中，等待 1 秒后执行。

#### 2. 异步非阻塞

非阻塞指的是：当 Node 执行 I/O 操作时，它不会等待完成，而是继续执行后面的代码。

例子：

```js
const fs = require("fs");

console.log("开始读取文件");

fs.readFile("test.txt", "utf8", (err, data) => {
  console.log("文件读取完成:", data);
});

console.log("继续执行其他操作");
```

输出结果：

```
开始读取文件
继续执行其他操作
文件读取完成: 这里是 test.txt 的内容

```

说明: `fs.readFile` 是一个异步操作，所以不会阻塞后面的代码执行。

#### 3. 事件循环 (Event Loop)

**事件循环** 是 Node.js 管理异步任务的机制。

- 主线程（执行栈）一次只能执行一个任务
- 当遇到异步操作（I/O、定时器、网络请求）时，Node 会把任务交给 底层线程池或操作系统
- 当异步操作完成时，会把回调放入 任务队列
- 事件循环不断检查队列，把可执行的回调推回主线程执行

nodejs 任务队列
| 队列类型 | 任务类型 | 优先级 |
| ----------------- | --------------------------------------------- | ---------------- |
| 微任务队列 (Microtask) | Promise.then, async/await, process.nextTick > Promise | 高 → 当前执行栈清空后立即执行 |
| 宏任务队列 (Macrotask) | setTimeout, setInterval, setImmediate, I/O 回调 | 低 → 按轮询顺序执行 |

## node 常用 API

| 模块 / 全局对象                | 功能                    | 常用方法 / 属性                                                                                | 示例                                                                                                                        |
| ------------------------------ | ----------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **fs**（文件系统）             | 文件读写、目录操作      | `readFile` / `readFileSync`<br>`writeFile` / `writeFileSync`<br>`mkdir` / `rmdir`<br>`readdir` | `js const fs = require('fs'); fs.readFile('test.txt','utf8',(e,d)=>console.log(d)); `                                       |
| **path**（路径处理）           | 文件路径拼接、解析      | `join()` / `resolve()`<br>`basename()`<br>`dirname()`<br>`extname()`                           | `js const path = require('path'); console.log(path.join(__dirname,'test.txt')); `                                           |
| **os**（系统信息）             | 获取操作系统信息        | `platform()`<br>`cpus()`<br>`freemem()`                                                        | `js const os = require('os'); console.log(os.cpus().length); `                                                              |
| **http / https**               | 创建服务器 / 发起请求   | `http.createServer()`<br>`https.get()`                                                         | `js const http = require('http'); http.createServer((req,res)=>res.end('ok')).listen(3000); `                               |
| **events**                     | 发布/订阅事件           | `EventEmitter`<br>`on()`<br>`emit()`                                                           | `js const {EventEmitter}=require('events'); const e=new EventEmitter(); e.on('msg',d=>console.log(d)); e.emit('msg','hi');` |
| **stream**                     | 处理大数据流            | `Readable` / `Writable` / `Duplex` / `Transform`                                               | `js const fs=require('fs'); fs.createReadStream('file.txt').on('data',chunk=>console.log(chunk.toString()));`               |
| **child_process**              | 创建子进程              | `exec()` / `spawn()` / `fork()`                                                                | `js const {exec}=require('child_process'); exec('ls',(e,s)=>console.log(s));`                                               |
| **crypto**                     | 加密 / 哈希             | `createHash()` / `randomBytes()` / `createCipheriv()`                                          | `js const crypto=require('crypto'); console.log(crypto.createHash('md5').update('123').digest('hex'));`                     |
| **util**                       | 工具函数                | `promisify()` / `inherits()` / `types`                                                         | `js const {promisify}=require('util');`                                                                                     |
| **timers**                     | 定时器                  | `setTimeout()` / `setInterval()` / `setImmediate()`                                            | `js setTimeout(()=>console.log('timeout'),1000);`                                                                           |
| **url**                        | URL 解析                | `URL` / `URLSearchParams`                                                                      | `js const u = new URL('https://example.com?a=1'); console.log(u.searchParams.get('a'));`                                    |
| **querystring**                | 查询字符串解析          | `parse()` / `stringify()`                                                                      | `js const qs = require('querystring'); console.log(qs.parse('a=1&b=2'));`                                                   |
| **global**                     | 全局对象                | `setTimeout` / `clearTimeout` / `Buffer` / `process`                                           | -                                                                                                                           |
| **process**                    | 进程信息                | `argv` / `env` / `exit()` / `on('exit')`                                                       | `js console.log(process.argv); console.log(process.env.NODE_ENV);`                                                          |
| **Buffer**                     | 二进制数据处理          | `Buffer.from()` / `Buffer.alloc()`                                                             | `js const buf = Buffer.from('hello'); console.log(buf.toString());`                                                         |
| \***\*dirname / **filename\*\* | 当前文件目录 / 文件路径 | -                                                                                              | `js console.log(__dirname); console.log(__filename);`                                                                       |

## 更多

此页面记录易忘点。。。
