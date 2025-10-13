---
title: vue3 源码解析
outline: deep
date: 2025-02-16
tags: vue
sidebar: true
---

# vue3 源码解析

Vue3 采用 Monorepo 架构，将核心功能拆分为多个独立模块，提升代码可维护性和复用性。

核心模块：

- reactivity：响应式系统核心（基于 Proxy），可独立使用。
- runtime-core：跨平台运行时核心（虚拟 DOM、组件渲染）
- runtime-dom：浏览器环境运行时（DOM 操作、事件处理）
- compiler-core：平台无关的模板编译器
- compiler-dom：浏览器环境模板编译器
- vue：入口模块，整合编译器与运行时

这种设计支持 Tree-shaking，可按需引入模块，减少打包体积。例如仅使用响应式系统时，可单独导入@vue/reactivity。

## 响应式系统：Proxy

原理： 通过 Proxy 对象拦截对目标对象的操作，实现对数据的响应式处理。getter 实现依赖收集并读取操作，setter 实现数据修改并触发依赖更新。

vue3 核心：reactivity 模块，提供 reactive(让数据变成响应式)、 effect(接收一个副作用函数,将其包装为 ReactiveEffect 实例) API。主要实现这两部分代码。

代码实现：

<details open>
<summary style="color: #1989fa; cursor: pointer" >点击代码展开</summary>

```js
/**
 * 创建一个响应式对象
 * @param {Object} target - 需要转换为响应式的目标对象
 * @returns {Object} 返回一个响应式代理对象
 */
export const reactive = (tagret) => {
  // 调用createReactiveObject函数来创建响应式对象
  return createReactiveObject(tagret);
};

/**
 * 检查一个值是否为对象
 * @param {any} val - 需要检查的值
 * @returns {boolean} 如果值是对象且不为null，则返回true，否则返回false
 */
const isObj = (val) => val !== null && typeof val === "object";

const ReactiveFlags = {
  // 定义响应式对象的标志
  IS_REACTIVE: "__v_isReactive",
};

// 缓存代理后的对象，防止重复代理
const reactiveMap = new WeakMap();

const MutableReactiveHandler = {
  get(tagret, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true; // 如果对象已经被代理了，进入getter 时，返回true

    // console.log(activeEffect, key, "activeEffect");
    track(tagret, key); // 获取属性值时，收集依赖

    return Reflect.get(tagret, key, receiver); // 获取属性值
  },
  set(tagret, key, value, receiver) {
    const oldValue = tagret[key]; // 获取旧值
    const result = Reflect.set(tagret, key, value, receiver); // 修改属性值

    // 如果旧值和新值不相等，则触发依赖
    if (oldValue !== value) {
      trigger(tagret, key, value, oldValue);
    }
    return result;
  },
};

/**
 * 创建一个响应式对象
 * @param {Object} target - 需要转换成响应式的目标对象
 * @returns {Proxy} 返回一个Proxy代理对象，该对象会响应数据变化
 */
const createReactiveObject = (target) => {
  if (!isObj(target)) return target;

  if (target[ReactiveFlags.IS_REACTIVE]) return target; // 如果目标对象已经是响应式对象，则直接返回

  if (reactiveMap.has(target)) return reactiveMap.get(target); // 如果已经代理过，则直接返回缓存的代理对象

  const proxy = new Proxy(target, MutableReactiveHandler);

  reactiveMap.set(target, proxy); // 将代理后的对象缓存到reactiveMap中

  return proxy; // 返回创建的Proxy代理对象
};

/**
 * @description 创建一个副作用函数
 * @param {Function} fn - 需要被包装的响应式函数
 * @callback {Function} scheduler - 可选的调度函数，用于控制副作用函数的执行时机
 */
export const effect = (fn, options) => {
  // 创建一个响应式效果, 只要数据变化了，就会重新执行函数回调 scheduler
  const _effect = new ReactiveEffect(fn, () => {
    // scheduler
    _effect.run();
  });

  _effect.run(); // 执行响应式函数

  return _effect;
};

const targetMap = new WeakMap(); // 存储依赖关系
/**
 * 依赖收集 收集对象上的属性与effect关联起来
 * @param {Object} target - 目标对象
 * @param {string} key - 目标对象的属性键
 */
const track = (target, key) => {
  if (!activeEffect) return; // 如果没有激活的响应式效果，则直接返回，无需跟踪

  let depsMap = targetMap.get(target); // 获取当前对象的依赖映射

  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map())); // 如果没有依赖映射，则创建一个新的Map并存储到targetMap中
  }

  let dep = depsMap.get(key); // 获取当前属性的依赖集合

  if (!dep) {
    depsMap.set(key, (dep = new Set())); // 如果没有依赖集合，则创建一个新的Set并存储到depsMap中
  }

  dep.add(activeEffect); // 将当前激活的响应式效果添加到依赖集合中
};

/**
 * 触发目标对象的指定属性的相关依赖
 * @param {Object} target - 目标对象
 * @param {String|Symbol} key - 目标对象的属性键
 */
const trigger = (target, key, newValue, oldValue) => {
  // 获取当前对象的依赖映射
  const depsMap = targetMap.get(target);

  if (!depsMap) return; // 如果没有依赖映射，则直接返回

  const dep = depsMap.get(key); // 获取当前属性的依赖集合

  if (dep) {
    for (const effect of dep) {
      // 遍历依赖集合，执行每个响应式效果
      effect.scheduler();
    }
  }
};

var activeEffect = undefined; // 全局响应式效果
/**
 * ReactiveEffect 类是一个响应式效果的实现，用于封装和执行响应式函数
 */
class ReactiveEffect {
  /**
   * 构造函数，初始化响应式效果
   * @param {Function} fn - 需要被包装的响应式函数
   */
  active = true; // 标识当前响应式效果是否处于激活状态
  // deps = []; // 存储当前响应式效果所依赖的属性
  // _traskId = 0; // 当前响应式效果的调度任务ID
  constructor(fn, scheduler) {
    this.fn = fn; // 保存传入的函数
    this.scheduler = scheduler; // 保存传入的调度函数
  }

  /**
   * 执行被包装的函数
   */
  run() {
    if (!this.active) return this.fn(); // 如果当前响应式效果处于非激活状态，直接执行函数
    let lastEffect = activeEffect; // 保存上一次的响应式效果
    try {
      activeEffect = this; // 将当前响应式效果设置为全局响应式效果
      return this.fn(); // 执行函数
    } finally {
      activeEffect = lastEffect;
    }
  }
  /**
   * 停止响应式效果的方法
   * 当调用此方法时，将清理当前effect并标记为非活动状态
   */
  stop() {
    // 停止响应式效果
    if (this.active) {
      // cleanupEffect(this); // 清理当前effect
      this.active = false;
    }
  }
}
```

</details>

1. reactive 函数：接受一个对象，并通过 createReactiveObject 函数将其转换为响应式代理对象。通过 WeakMap 缓存代理对象，防止重复创建。

2. createReactiveObject 函数：该函数通过 Proxy 包装目标对象，并使用 MutableReactiveHandler 作为 Proxy 的处理器，拦截对象的 get 和 set 操作，分别实现依赖收集和更新触发。

3. effect 函数：用于创建副作用函数（ReactiveEffect）。每当响应式对象的值发生变化时，副作用函数会重新执行。

4. track 和 trigger 函数：实现了依赖收集和触发机制。track 用于将副作用函数与对象的属性进行关联，trigger 用于在属性变化时触发相关的副作用函数。

代码演示：

<details>
<summary style="color: #1989fa; cursor: pointer">点击代码展开</summary>

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
<script type="module">
  import { reactive, effect } from "./reactivity.js";

  const app = document.getElementById("app");
  const state = reactive({
    name: "张三",
    age: 18,
    flag: true,
  });

  const state2 = reactive(state);

  const options = {};

  effect(() => {
    app.innerHTML = state.flag ? state.name : state.age;
  }, options);

  setTimeout(() => {
    state.flag = false;
  }, 2000);
</script>
```

</details>

## Ref 实现

Ref 是 Vue 3 中用于创建响应式引用的 API。它可以将一个值包装成响应式对象，从而在值发生变化时触发视图更新。

<details>
<summary style="color: #1989fa; cursor: pointer">点击代码展开</summary>

```js
import { reactive, isObj, activeEffect } from "./reactivity.js";
export const ref = (value) => {
  return new RefImpl(value);
};

const toReactive = (value) => {
  return isObj(value) ? reactive(value) : value;
};

class RefImpl {
  __v_isRef = true; // 标识当前对象是一个ref对象
  deps = new Set(); // 存储当前ref对象的依赖
  constructor(value) {
    this._value = toReactive(value);
  }

  get value() {
    trackRefValue(this); // 添加依赖
    return this._value;
  }

  set value(newValue) {
    console.log(newValue, "newValue", this._value);

    if (this._value !== newValue) {
      this._value = newValue; // 将新值转换为响应式对象
    }
    triggerRefValue(this); // 触发依赖
  }
}

const trackRefValue = (ref) => {
  // 收集依赖
  if (activeEffect && ref.deps.size === 0) {
    ref.deps.add(activeEffect); // 将当前响应式函数添加到ref对象的依赖中
  }
};

const triggerRefValue = (ref) => {
  // 触发依赖
  if (ref.deps.size) {
    ref.deps.forEach((effect) => effect.scheduler()); // 执行所有依赖的响应式函数
  }
};
```

</details>

- 通过 RefImpl 类，ref 对象封装了一个响应式值，并通过属性访问器 getter 和 setter 方法进行依赖收集和更新。
- trackRefValue 用来收集依赖，triggerRefValue 用来触发依赖。
- toReactive 函数确保传入的对象会被转换成响应式对象（通过 reactive），而基本类型则直接使用

## computed 代码实现

computed 原理：computed 会在内部去维护一个`dirty`属性，默认为 ture,当第一次执行时，会执行传入的函数，并将结果缓存到 value 中，并将 dirty 设置为 false。当依赖的响应式数据发生变化时，dirty 会被设置为 true，此时再次访问 computed 的值时，会重新执行传入的函数，并更新 value 的值。

<details>
<summary style="color: #1989fa; cursor: pointer">点击代码展开</summary>

```js
import { ReactiveEffect, trigger, track } from "./reactivity.js";
const isFunction = (val) => typeof val === "function";

/**
 * 创建一个计算属性引用
 * @param {Function|Object} getterOrOptions - 可以是一个getter函数，或者一个包含get和set方法的对象
 * @returns {ComputedRefImpl} 返回一个计算属性引用实例
 */
export const computed = (getterOrOptions) => {
  // 声明getter和setter变量
  let getter, setter;
  // 判断传入参数是否为函数
  if (isFunction(getterOrOptions)) {
    // 如果是函数，则将其作为getter
    getter = getterOrOptions;
  } else {
    // 如果是对象，则获取其中的get和set方法
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  // 创建计算属性引用实例
  const cRef = new ComputedRefImpl(getter, setter);

  // 返回计算属性引用实例
  return cRef;
};

/**
 * ComputedRefImpl 类是一个实现计算属性的类
 * 它通过 getter 和 setter 函数来管理计算值的获取和设置
 * 内部使用 ReactiveEffect 来追踪依赖并在依赖变化时重新计算
 */
class ComputedRefImpl {
  /**
   * 构造函数，初始化计算属性实例
   * @param {Function} getter - 获取计算值的函数
   * @param {Function} setter - 设置计算值的函数（可选）
   */
  constructor(getter, setter) {
    // 存储获取计算值的函数
    this._getter = getter;
    // 存储设置计算值的函数
    this._setter = setter;
    // 存储计算后的值，初始为 undefined
    this._value = undefined;
    // 标记是否需要重新计算，初始为 true
    this._dirty = true;
    // 存储依赖的属性集合，初始为空集合
    this._deps = new Set();
    // 创建响应式效果，用于追踪依赖
    this.effect = new ReactiveEffect(getter, () => {
      // 当依赖变化时，标记为需要重新计算
      if (!this._dirty) {
        this._dirty = true;
        trigger(this, "value");
      }
    });
  }

  // value getter，用于获取计算后的值
  get value() {
    // 如果需要重新计算，则执行响应式效果并更新值
    if (this._dirty) {
      this._value = this.effect.run();
      this._dirty = false; // 标记为已计算
      track(this, "value"); // 收集依赖
    }
    // 返回计算后的值
    return this._value;
  }

  set value(newValue) {
    // 如果有设置函数，则调用设置函数
    if (this._setter) {
      this._setter(newValue);
    } else {
      console.warn("Computed value was assigned to but it has no setter.");
    }
  }
}
// <!----------------测试-------------------->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <div id="app"></div>
    <div id="dom"></div>
  </body>
</html>
<script type="module">
  import { reactive, effect } from "./reactivity.js";
  import { ref } from "./refImpl.js";
  import { computed } from "./computed.js";

  const app = document.getElementById("app");
  const dom = document.getElementById("dom");
  const state = reactive({
    name: "张三",
    age: 18,
    flag: true,
  });
  const computedFunc = computed({
    get() {
      return `${state.name}`;
    },
    set(val) {
      state.name = val;
    },
  });

  effect(() => {
    dom.innerHTML = computedFunc.value;
  });

  setTimeout(() => {
    state.name = "李四";
  }, 2000);
</script>
```

</details>

1. state 进行响应式处理: 首先对 `state` 进行响应式处理，get,set 方法分别对 state 进行依赖收集和触发更新。此时 track 收集的 effect.scheduler 是 `（） => dom.innerHTML = computedFunc.value`;
2. computedFunc 进行响应式处理: computedFunc 创建 ComputedRefImpl 示例，在 computedFunc.value 触发是，进行 `_dirty` 的一个维护 并触发 `get value ()` 进行依赖收集与技算结果返回。
3. `effect` 进行响应式处理: `effect` 中触发 `computedFunc.value`，此时会触发 `get value ()`，进行依赖收集，此时 `track` 收集的 `effect.scheduler` 是 `() => { if (!this.\_dirty) {this.\_dirty = false; trigger(this, "value"); } }`。
4. state.name 进行响应式处理: 当 `state.name` 改变时，触发 `trigger`，此时会触发 `effect.scheduler`，进行 `dom.innerHTML` 的更新。

## watch 代码实现
