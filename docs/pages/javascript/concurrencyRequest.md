---
sidebar: true
title: 多并发请求控制
date: 2022-12-11
tags: js
---

# 多并发请求控制

> Promise 处理异步任务能避免他们阻塞程序执行。当一次并发大量异步任务会导致内存消耗过大、程序
> 阻塞等问题。本文带大家实现异步任务控制器，限制并发异步任务数量，来解决高并发问题。

```ts
type TaskFunction<T> = () => Promise<T>;

type TaskResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: any };

/**
 * @template T
 * @param {Array<TaskFunction<T>>} taskFunctions - 任务函数数组，每个函数必须返回 Promise<T>。
 * @param {number} limit - 最大并发数。
 * @returns {Promise<Array<TaskResult<T>>>} - 返回一个按原始顺序排列的结果数组。
 */
const concurrentRun = async <T>(
  taskFunctions: Array<TaskFunction<T>>,
  limit: number
): Promise<Array<TaskResult<T>>> => {
  const effectiveLimit = Math.max(1, Math.min(limit, taskFunctions.length));

  const results: Array<TaskResult<T>> = new Array(taskFunctions.length);

  type IndexedTask = {
    task: TaskFunction<T>;
    index: number; // 原始索引，用于保证结果顺序
  };
  const taskQueue: IndexedTask[] = taskFunctions.map((task, index) => ({
    task,
    index,
  }));

  // 不断地从队列中取出任务执行，直到队列为空
  const worker = async () => {
    while (taskQueue.length > 0) {
      // 竞争性地从队列头部取出一个任务
      const nextTask = taskQueue.shift();

      if (nextTask) {
        const { task, index } = nextTask;
        try {
          // 执行任务
          const value = await task();
          // 记录成功结果
          results[index] = { status: "fulfilled", value: value };
        } catch (error) {
          // 记录失败原因
          results[index] = { status: "rejected", reason: error };
        }
      }
    }
  };

  // 创建 effectiveLimit 个 worker 并同时运行
  const workers: Promise<void>[] = [];
  for (let i = 0; i < effectiveLimit; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  return results;
};
export default concurrentRun;
```
