---
title: computed和watch
outline: deep
date: 2022-02-16
tags: vue
sidebar: true
---

# computed 和 watch

## 1. 基本概念(computed/watch)

**computed（计算属性）**

- 特点：基于依赖 自动缓存，只有依赖的数据发生变化时才会重新计算。
- 适合场景：用于从已有数据中 派生出新数据。

**watch（侦听器）**

- 特点：用于在数据变化时 执行副作用逻辑（而不仅仅是计算值）。没有缓存，每次依赖数据变化都会触发回调。支持异步操作、副作用逻辑。可观测多个数据源。
- 适合场景：需要在数据变化时执行 异步操作、日志、DOM 操作、手动计算 等。

### 两者的区别

| 功能点                               | `computed`                 | `watch`                          |
| ------------------------------------ | -------------------------- | -------------------------------- |
| **数据派生**                         | ✅ 适合                    | ❌ 不推荐                        |
| **副作用（日志、API 调用、定时器）** | ❌ 不适合                  | ✅ 必须用                        |
| **是否有缓存**                       | ✅ 有缓存                  | ❌ 无缓存                        |
| **常见场景**                         | 表单计算、筛选、格式化日期 | 请求 API、深度监听对象、调试日志 |

### watch 的高级用法

#### watch 深度监听

默认监听是浅层的，如果要监听对象内部属性，需要开启 deep：

```js
const obj = ref({ count: 0 });

watch(
  obj,
  (newVal, oldVal) => {
    console.log("变化了", newVal);
  },
  { deep: true } // 开启深度监听
);
```

#### watch 立即执行

默认情况下，watch 不会立即执行，只有在监听的数据发生变化时才会执行。如果要立即执行，可以设置 immediate 为 true：

```js
watch(
  obj,
  (newVal, oldVal) => {
    console.log("变化了", newVal);
  },
  {
    deep: true, // 开启深度监听
    immediate: true, // 立即执行
  }
);
```

#### watch 执行时机

默认情况下，watch 的回调函数会在组件更新之前执行。如果需要在组件更新之后执行，可以设置 flush 为 'post'：

```js
watch(
  obj,
  (newVal, oldVal) => {
    console.log("变化了", newVal);
  },
  {
    deep: true, // 开启深度监听
    immediate: true, // 立即执行
    flush: "pre", // 在 组件更新之前 执行（把变更合并进即将发生的渲染）
    // flush: "pre", //  post 在 DOM 已更新之后 执行（适合读/测量 DOM）。
    // flush: "sync", //  sync 立即同步执行（马上运行，不排队；谨慎使用，易产生循环/性能问题）。
  }
);
```

#### watch 清除副作用

在 watch 中，如果需要清除副作用，可以使用 onCleanup 函数：

```js
const keyword = ref("");
let timer = null;

watch(keyword, (newVal, oldVal, onCleanup) => {
  console.log("关键词变了:", newVal);

  // 模拟副作用：开启一个定时器
  timer = setInterval(() => {
    console.log("正在搜索：", newVal);
  }, 1000);

  // 清除副作用
  onCleanup(() => {
    clearInterval(timer);
    console.log("定时器清除了");
  });
});
```

:::tip 🔔 关键点

1. onCleanup 只在下一次触发 watch 回调时执行。

- 第一次运行时不会清理。

- 当依赖值再次改变时，先执行上一次的清理逻辑，再执行新的回调。

2. 避免重复副作用

- 不清理的话，每次数据变更都会产生新的定时器 / 监听器，最终可能内存泄漏。
  :::

#### watch 监听多个数据源

watch 可以监听多个数据源，只需要将它们放在一个数组中即可：

```js
const firstName = ref("Tom");
const lastName = ref("Hanks");

watch([firstName, lastName], ([newF, newL], [oldF, oldL]) => {
  console.log(`新值: ${newF} ${newL}`);
  console.log(`旧值: ${oldF} ${oldL}`);
});
```

:::tip 📢 注意

监听多个响应式数据，回调参数是 数组形式的新值和旧值。

任意一个改变，回调都会执行。
:::

### watchEffect

vue3 提供了 watchEffect 函数，那么 watch 和 watchEffect 有什么区别呢？
:::info 👉

**watch**  
需要指定监听的数据。  
回调里可以拿到 新值 / 旧值。  
默认 不会立即执行，要等依赖变了才跑.

**watchEffect**  
不需要指定监听的数据, 它会自动收集回调里用到的依赖。  
回调会 立即执行一次，之后依赖变化时再执行。  
拿不到旧值（因为它不关心“前后差异”，只关心“依赖变了就跑”）。
:::

| 特性             | `watch`                                  | `watchEffect`                        |
| ---------------- | ---------------------------------------- | ------------------------------------ |
| **依赖指定**     | 要手动指定                               | 自动收集（回调里用到啥就盯啥）       |
| **是否立即执行** | 默认不立即（可加 `{ immediate: true }`） | 会立即执行一次                       |
| **能否拿旧值**   | ✅ 可以 `(newVal, oldVal)`               | ❌ 不支持                            |
| **常见用途**     | 精准监听某个状态，拿新旧值做逻辑         | 响应式副作用（日志、调试、DOM 操作） |

## 源码解析

### watch 源码

代码参考：[https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiWatch.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiWatch.ts)

在该函数中，接受三个参数，分别是：`source` 侦听的数据源，`cb` 回调函数，`options` 侦听选项。
`watch` 函数最终都调用了 `doWatch` 函数。

**source** : 可以是一个 `ref` 类型的数据，或者是一个具有返回值的 `getter` 函数，也可以是一个响应式的 `obj` 对象。当侦听的是多个源时，`source` 可以是一个数组。

**cb** : 回调函数，当侦听的数据发生变化时，会执行该回调函数。

**options** : 侦听选项，可以设置 `immediate`、`deep`、`flush`、`onTrack`、`onTrigger` 等属性。

源码入口

```ts
export function watch(source, cb, options?) {
  return doWatch(source, cb, options);
}
```

核心逻辑 doWatch (简化版)

```js
function doWatch(source, cb, options = {}) {
  // 1. 把 source (ref/reactive/函数/数组)规范成 getter
  let getter = createGetterFromSource(source, options);

  // 2. 如果 deep，则把 getter 包成 traverse(getter())
  if (cb && options.deep) {
    const base = getter;
    getter = () => traverse(base());
  }

  // 3. 保存 oldValue, cleanup
  let oldValue = INITIAL;
  let cleanup;
  function onCleanup(fn) {
    cleanup = fn;
  }

  // 4. job：依赖变化后要做的事
  const job = () => {
    const newValue = effect.run(); // 重新运行 getter，收集依赖
    if (options.deep || hasChanged(newValue, oldValue)) {
      if (cleanup) cleanup(); // 执行上一次的清理
      cb(newValue, oldValue === INITIAL ? undefined : oldValue, onCleanup);
      oldValue = newValue;
    }
  };

  // 5. 根据 flush 创建 scheduler（sync / pre(default) / post）
  const scheduler = chooseScheduler(options.flush, job);

  // 6. 创建 effect
  const effect = new ReactiveEffect(getter, scheduler);

  // 7. 启动：immediate ? job() : oldValue = effect.run()
  if (options.immediate) job();
  else oldValue = effect.run();

  // 8. 返回 stop
  return () => effect.stop();
}
```

### 总结

`watch` 的核心就是把用户传入的各种 `source（ref/reactive/函数/数组`）统一包装成一个 `getter` 函数，把这个 `getter` 放到一个 `ReactiveEffect` 里运行以收集依赖，并且在依赖变化时调用 `effect.scheduler()`，scheduler 决定何时把 job 排入队列（sync/pre/post）,然后执行 job 拿到 `newValue`，与 `oldValue` 比较后决定是否调用用户的回调（同时处理 `cleanup、immediate、flush、deep` 等选项）。
