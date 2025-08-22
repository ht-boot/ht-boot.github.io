---
sidebar: true
title: 多并发请求控制
date: 2022-12-11
tags:
  - js
---

# 多并发请求控制

> Promise 处理异步任务能避免他们阻塞程序执行。当一次并发大量异步任务会导致内存消耗过大、程序
> 阻塞等问题。本文带大家实现异步任务控制器，限制并发异步任务数量，来解决高并发问题。

```js
function concurrencyRequest(urlArr, max) {
  return new Promise((resolve, reject) => {
    if (urlArr.length === 0) {
      resolve([]);
      return;
    }

    let result = []; // 所有请求返回结果集合
    let index = 0; // 当前url下标

    async function next() {
      let i = index;
      const url = urlArr[index];
      index += 1;
      try {
        const res = await fetch(url);
        result[i] = res;
      } catch (error) {
        result[i] = error;
      } finally {
        if (index === urlArr.length) {
          resolve(result);
          return;
        }
        next();
      }
    }

    // max和urlArr.length取最小进行调用;
    const times = Math.min(max, urlArr.length);
    for (let i = 0; i < times; i++) {
      next();
    }
  });
}

const arr = [];

for (let i = 0; i < 20; i++) {
  arr.push(`http://127.0.0.1:8888/id?id=${i}`);
}

concurrencyRequest(arr, 6).then((data) => console.log(data));
```
