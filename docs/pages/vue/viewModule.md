---
title: vue 响应式原理
outline: deep
date: 2022-02-16
tags: vue
sidebar: true
---

# vue 响应式原理

## vue2 响应式原理

vue2 源码分析（简化版）

### 1. Vue 实例初始化

```js
// 创建 Vue 实例
class Vue {
  constructor(vm) {
    this.$data = vm.data; // 保存用户传入的数据
    Observer(vm.data); // 对 data 进行数据劫持
    Compile(vm.el, this); // 编译模板，处理 {{}} 和 v-model
  }
}
```

### 2.数据劫持 (Observer)

```js
// 监听 data 中的所有属性，实现响应式
function Observer(data_instance) {
  // 如果不是对象，直接退出（递归边界条件）
  if (!data_instance || typeof data_instance !== "object") return;

  // 为每个对象生成一个依赖管理器
  const depend = new Dependency();

  // 遍历对象的所有 key
  Object.keys(data_instance).forEach((key) => {
    let value = data_instance[key];

    // 递归劫持子属性（保证深层对象也能响应式）
    Observer(value);

    // 使用 defineProperty 劫持 getter / setter
    Object.defineProperty(data_instance, key, {
      enumerable: true, // 属性可枚举
      configurable: true, // 属性可修改/删除

      // 访问属性时
      get() {
        console.log(`用户访问了 ${key}: ${value}`);
        // 如果有正在计算的 Watcher，就收集依赖
        Dependency.target && depend.depend(Dependency.target);
        return value;
      },

      // 修改属性时
      set(newValue) {
        console.log(`用户修改了 ${key} 值`);
        value = newValue;

        // 对新值进行劫持，保证对象嵌套也能生效
        Observer(newValue);

        // 通知依赖更新
        depend.notify();
      },
    });
  });
}
```

### 3. 编译模板 (Compile)

```js
// 解析 HTML 模板，处理 {{}} 插值表达式 和 v-model
function Compile(element, vm) {
  // 获取根 DOM 节点
  vm.$el = document.querySelector(element);

  // 创建文档碎片（避免频繁操作 DOM）
  let fragment = document.createDocumentFragment();
  let child;
  while ((child = vm.$el.firstChild)) {
    fragment.append(child); // 把 DOM 节点移动到 fragment 中
  }

  // 递归编译 fragment 内部的节点
  fragment_compile(fragment);

  // 编译完成后，把 fragment 放回页面
  vm.$el.appendChild(fragment);

  // 内部递归编译函数
  function fragment_compile(node) {
    const pattren = /\{\{(\s*(\S+)\s*)\}\}/; // 匹配 {{ key }}

    // ------------------------
    // 1. 文本节点：{{ xxx }}
    if (node.nodeType === 3) {
      const temp = node.nodeValue;
      const regex = pattren.exec(temp);

      if (regex) {
        // 获取数据结果
        const result = regex[2]
          .split(".")
          .reduce((acc, cur) => acc[cur], vm.$data);

        // 初始化替换文本
        node.nodeValue = temp.replace(pattren, result);

        // 建立 Watcher，保证数据变化时能更新文本
        new Watcher(vm, regex[2], (newValue) => {
          node.nodeValue = temp.replace(pattren, newValue);
        });
      }
      return;
    }

    // ------------------------
    // 2. input 元素：处理 v-model
    if (node.nodeType === 1 && node.nodeName.toLowerCase() === "input") {
      const attrArr = Array.from(node.attributes);
      attrArr.forEach((item) => {
        if (item.nodeName === "v-model") {
          // 获取初始值
          const value = item.nodeValue
            .split(".")
            .reduce((acc, cur) => acc[cur], vm.$data);

          node.value = value;

          // 建立 Watcher，保证数据变化时更新输入框
          new Watcher(vm, item.nodeValue, (newValue) => {
            node.value = newValue;
          });

          // 监听 input 事件，实现数据双向绑定
          node.addEventListener("input", (e) => {
            const keys = item.nodeValue.split(".");
            const lastKey = keys.pop(); // 最后一个 key
            const obj = keys.reduce((acc, cur) => acc[cur], vm.$data);

            obj[lastKey] = e.target.value; // 触发 setter
          });
        }
      });
    }

    // ------------------------
    // 3. 递归编译子节点
    node.childNodes.forEach((child) => fragment_compile(child));
  }
}
```

### 4.依赖收集 (Dependency)

```js
// Dependency：依赖管理器（发布者）
class Dependency {
  constructor() {
    this.subscribers = []; // 存放所有 Watcher
  }

  // 收集依赖
  depend(sub) {
    if (sub && !this.subscribers.includes(sub)) {
      this.subscribers.push(sub);
    }
  }

  // 通知所有订阅者更新
  notify() {
    this.subscribers.forEach((sub) => sub.update());
  }
}
```

### 5. 订阅者 (Watcher)

```js
/**
 * Watcher：订阅者
 * @param vm       Vue 实例
 * @param key      要监听的数据路径（支持 a.b.c）
 * @param callback 数据变化时执行的回调
 */
class Watcher {
  constructor(vm, key, callback) {
    this.vm = vm;
    this.key = key;
    this.callback = callback;

    // 临时记录自己到 Dependency.target
    Dependency.target = this;

    // 主动访问一次数据，触发 getter，从而把自己收集进去
    vm.$data[this.key];

    // 收集完成，清空临时变量
    Dependency.target = null;
  }

  // 数据更新时被调用
  update() {
    const value = vm.$data[this.key];
    this.callback(value);
  }
}
```

### 总结

通过以上步骤，得出，Vue 的响应式原理主要分为三个部分：

1. 通过 `object.defineProperty` 对数据进行逐一劫持
2. 依赖收集，通过 Dependency.target 暂存当前正在计算的 Watcher。 getter 执行时，检查 Dep.target 并把它加入属性对应的 depend, 在 settrt 中数据变化时通知依赖更新，
3. 在模板编译时，建立 Watcher，监听数据变化并更新视图。

## vue3 响应式原理

代码分析

```js
const reactive = (obj) => {
  return new Proxy(obj, {
    get(target, key, receiver) {
      console.log("读取属性", target, key);
      // 收集依赖
      track(target, key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      console.log("修改属性", key, value);
      const result = Reflect.set(target, key, value, receiver);
      // 通知依赖更新
      trigger(target, key);
      return result;
    },
  });
};

// WeakMap 保存每个对象对应的依赖
const targetMap = new WeakMap();
// 收集依赖
/**
 * 用于追踪依赖关系的函数
 * @param {Object} target - 目标对象
 * @param {String|Symbol} key - 目标对象的属性键
 */
function track(target, key) {
  if (!activeEffect) return; // 没有正在执行的 effect，则不收集

  let depsMap = targetMap.get(target);

  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(activeEffect); // 收集依赖
}
// 通知依赖更新
/**
 * 触发目标对象上指定属性的依赖函数
 * @param {Object} target - 目标对象
 * @param {String|Symbol} key - 目标对象的属性键
 */
function trigger(target, key) {
  // 从targetMap中获取目标对象的依赖映射表
  const depsMap = targetMap.get(target);

  // 如果目标对象没有依赖映射表，则直接返回
  if (!depsMap) return;

  // 从依赖映射表中获取指定属性的依赖集合
  const dep = depsMap.get(key);

  // 如果存在依赖集合，则遍历并执行其中的每个依赖函数
  if (dep) {
    dep.forEach((effect) => effect()); // 执行依赖函数
  }
}

let activeEffect;
// effect 函数，用于包裹需要自动更新的函数
function effect(fn) {
  activeEffect = fn;
  fn(); // 执行一次，触发 getter 收集依赖
  activeEffect = null;
}

// 使用
const state = reactive({ count: 0 });
effect(() => {
  console.log("count is", state.count);
});
// state.count++; // 自动触发 effect，打印更新
```

### 1. Proxy 代理数据

```js
const reactive = (obj) => {
  return new Proxy(obj, {
    get(target, key, receiver) {
      console.log("读取属性", target, key);
      track(target, key); // 收集依赖
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      console.log("修改属性", key, value);
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key); // 触发依赖更新
      return result;
    },
  });
};
```

:::info Proxy 代理数据
访问属性时 → get 被拦截 → track 收集依赖。

修改属性时 → set 被拦截 → trigger 通知依赖执行。
:::

### 2. 依赖收集

#### 1. 依赖存储结构

WeakMap: target → Map(key → Set(effect))

```js
// WeakMap 保存每个对象对应的依赖
const targetMap = new WeakMap();
```

**层级关系：**

- targetMap：不同对象的依赖集合（WeakMap 确保垃圾回收）。

- depsMap：某个对象对应的属性依赖（Map）。

- dep：某个属性对应的所有 effect（Set）。

#### 2. track 收集依赖

```js
// 收集依赖
/**
 * 用于追踪依赖关系的函数
 * @param {Object} target - 目标对象
 * @param {String|Symbol} key - 目标对象的属性键
 */
function track(target, key) {
  if (!activeEffect) return; // 没有正在执行的 effect，则不收集

  let depsMap = targetMap.get(target);

  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(activeEffect); // 收集依赖
}
```

只有在 effect 正在执行时（activeEffect 不为 null），才会收集依赖。  
每个属性都能收集多个 effect（比如一个属性在多个地方被用到）。

### 3. trigger（触发依赖）

```js
function trigger(target, key) {
  // 从targetMap中获取目标对象的依赖映射表
  const depsMap = targetMap.get(target);

  // console.log(depsMap, targetMap, key, "trigger");

  // 如果目标对象没有依赖映射表，则直接返回
  if (!depsMap) return;

  // 从依赖映射表中获取指定属性的依赖集合
  const dep = depsMap.get(key);

  // 如果存在依赖集合，则遍历并执行其中的每个依赖函数
  if (dep) {
    dep.forEach((effect) => effect()); // 执行依赖函数
  }
}
```

当某个属性更新时，找到对应的 Set(effect)，然后执行里面所有 effect。

### 4. effect（副作用函数）

```js
function effect(fn) {
  activeEffect = fn;
  fn(); // 首次执行 -> 触发 getter -> track 收集依赖
  activeEffect = null;
}
```

:::info effect
进入 effect 时设置 activeEffect,指模板渲染 (组件渲染函数)、用户定义的 watch / watchEffect / computed。  
执行 fn → 访问响应式数据 → get → track 收集依赖。  
最后清空 activeEffect。
:::

### 5. 使用

```js
const state = reactive({ count: 0 });

effect(() => {
  console.log("count is", state.count);
});

state.count++; // 修改时 -> trigger -> 执行 effect
```

:::info 执行流程：

effect 执行时访问 state.count → get → track 收集依赖。

state.count++ → set → trigger → 执行 effect。

打印最新的 count。
:::

:::tip 注意 ⚠️
这就是最小版 Vue3 响应式的核心原理！,还缺少 `scheduler`、嵌套 effect 栈等功能。
:::

### 总结

一句话： 数据通过 Proxy 拦截对象属性的 读取 (get) 和 修改 (set)，实现依赖收集 (track) 与派发更新 (trigger)。数据变动时，触发 effect 重新执行。
