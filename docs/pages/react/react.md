---
sidebar: true
title: react
outline: deep
description: react 学习记录。
tags: react
---

# React

react 学习记录。

## React Hooks

### useState

```js [index.tsx]
const [state, setState] = useState(initialState);
```

- `initialState` 是 state 的初始值，可以是任意类型。
- `state` 是当前 state 的值。
- `setState` 是更新 state 的函数，接受新的 state 作为参数，并返回更新后的 state。

代码实例

```js [index.tsx]
import React, { useState } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
};

export default Counter;
```

### useEffect

`useEffect` 是 React 中的一个重要 Hook，用于在函数组件中处理副作用操作。副作用是指那些与 React 渲染无关但又必须执行的操作，比如数据获取、订阅、手动修改 DOM 等。

基本语法

```js [index.tsx]
useEffect(() => {
  // 执行副作用操作
  return () => {
    // 清理副作用操作
  };
}, [dependencies]);
```

- `useEffect` 接受两个参数：一个是副作用函数，另一个是依赖数组(dependencies)。
- 副作用函数会在组件渲染后执行，可以执行任何副作用操作，比如数据获取、订阅等。
- 清理函数会在组件卸载或依赖项发生变化时执行，可以执行清理操作，比如取消订阅、手动修改 DOM 等。

使用场景

1. 依赖项为空数组的 useEffect

```js [index.tsx]
useEffect(() => {
  // 只在组件挂载时执行一次
  console.log("组件已挂载");

  return () => {
    // 组件卸载时执行
    console.log("组件将卸载");
  };
}, []); // 依赖项为空数组，表示只在组件挂载和卸载时执行（只在首次渲染时执行）
```

2. 依赖项为非空数组的 useEffect

```js [index.tsx]
useEffect(() => {
  // 在组件挂载和 count 发生变化时执行
  console.log("count 发生变化");

  return () => {
    // 在 count 发生变化时执行
    console.log("count 发生变化");
  };
}, [count]); // 依赖项为 count，表示只在 count 发生变化时执行
```

3. 不存在依赖项的 useEffect

```js [index.tsx]
useEffect(() => {
  // 在组件挂载和卸载时执行
  console.log("组件已挂载或卸载");

  return () => {
    // 在组件卸载时执行
    console.log("组件将卸载");
  };
}); // 首次渲染时执行， 且有数据变化时也会执行
```

### useEffect 清除副作用代码实例

```js [index.tsx]
import React, { useState, useEffect } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("start an interval timer");
    const timer = setInterval(() => {
      setCount((count) => count + 1);
    }, 1000);
    return () => {
      // 返回一个清除函数清除副作用，在组件卸载前和下一个effect执行前执行
      console.log("destroy effect");
      clearInterval(timer);
    };
  }, []);

  return (
    <div>
      <p>count now is {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

### useRef

`useRef` 是 React 中的一个 Hook，用于在函数组件中创建一个可变的 ref 对象。ref 对象可以用来访问 DOM 元素或保存任意可变值。

代码实例

```js [index.tsx]
import React, { useRef } from "react";

export default function FocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    inputEl.current.focus();
  };

  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```

### useReducer

`useReducer` 是 React 提供的一个用于状态管理的 Hook，它比 useState 更适合处理复杂的 state 逻辑。当你遇到以下情况时，可以考虑使用 useReducer：

- state 逻辑较复杂，包含多个子值。
- 下一个 state 依赖于之前的 state。
- 需要在组件外部管理状态逻辑

基本语法

```js [index.tsx]
const [state, dispatch] = useReducer(reducer, initialState, init);
```

- `reducer` 是一个函数，接受当前状态和动作(action)作为参数，返回新的状态。
- `initialState` 是 state 的初始值，可以是任意类型。
- `init` 是一个可选的函数，用于计算初始状态，接受初始值作为参数，返回初始状态。
- `state` 是当前 state 的值。
- `dispatch` 是一个函数，用于分发动作(action)，接受动作(action)作为参数，并返回新的 state。

> useReducer 的工作模式类似于 Redux，通过 dispatch 一个 action 来触发 state 的更新，而不是直接修改 state。这种模式使得状态的变化更加可预 测和可追踪。

代码实例

```js [index.tsx]
import { useReducer } from "react";

type ActionType = "increment" | "decrement" | "reset";

interface CounterAction {
  type: ActionType;
  payload?: number;
}
// 定义 reducer 函数
function counterReducer(state: { count: number }, action: CounterAction) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return { count: action.payload ?? 0 };
    default:
      return state;
  }
}

function Counter() {
  // 使用 useReducer
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>当前计数: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+1</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-1</button>
      <button onClick={() => dispatch({ type: "reset", payload: 0 })}>
        重置
      </button>
    </div>
  );
}

export default Counter;
```

### useCallback

在 React 应用中，性能优化是一个重要的话题。useCallback 和 useMemo 是 React 提供的两个关键 Hook，用于优化组件性能，避免不必要的重新渲染和计算。下面我们来详细了解这两个 Hook。

`useCallback` 用于缓存函数，避免在每次渲染时创建新的函数实例。它接收一个函数和依赖项数组作为参数，返回一个记忆化的函数。

基本语法

```js [index.tsx]
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]); // 依赖项数组
```

- `memoizedCallback` 是一个记忆化的函数，只有当依赖项数组中的值发生变化时，才会重新创建函数实例。
- 如果依赖项数组为空数组，则 `memoizedCallback` 只会在组件首次渲染时创建一次。

使用场景

1. 传递给子组件的回调函数

```js [index.tsx]
import React, { useState, useCallback } from "react";
import Button from "./components/Button";

export default function App() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);

  const handleClickButton1 = () => {
    setCount1(count1 + 1);
  };

  const handleClickButton2 = useCallback(() => {
    setCount2(count2 + 1);
  }, [count2]);

  return (
    <div>
      <div>
        <Button onClickButton={handleClickButton1}>Button1</Button>
      </div>
      <div>
        <Button onClickButton={handleClickButton2}>Button2</Button>
      </div>
      <div>
        <Button
          onClickButton={() => {
            setCount3(count3 + 1);
          }}
        >
          Button3
        </Button>
      </div>
    </div>
  );
}


import React from "react";

interface ButtonProps {
  onClickButton: () => void;
  children: React.ReactNode;
}

const Button = ({ onClickButton, children }: ButtonProps) => {
  return (
    <>
      <button onClick={onClickButton}>{children}</button>
      <span>{Math.random()}</span>
    </>
  );
};

export default React.memo(Button);
```

> 可以发现点击 button1 时，button1 和 button3 会重新渲染，而点击 button2 时，button1、button2 和 button3 都会重新渲染，而点击 button3 时，button1、button3 会重新渲染。上述发现只有经过 useCallback 优化后的 button2 点击自身才会重新渲染。

> 这是因为 React.memo 仅对 props 进行浅比较，而 handleClickButton1 和 handleClickButton3 是每次渲染时都创建的新函数，而 handleClickButton2 是通过 useCallback 缓存下来的函数，所以只有 handleClickButton2 的 props 没有变化，button2 才不会重新渲染。

:::warning 注意事项
过度使用 useCallback 可能会导致代码难以理解和维护。通常，你应该只在将回调函数传递给子组件，并且子组件使用了 React.memo 或 shouldComponentUpdate 来避免不必要的渲染时，才使用 useCallback
:::

### useMemo

`useMemo` 用于缓存计算结果，避免在每次渲染时重新计算。它接收一个函数和依赖项数组作为参数，返回一个记忆化的值。

基本语法

```js [index.tsx]
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]); // 依赖项数组
```

- `memoizedValue` 是一个记忆化的值，只有当依赖项数组中的值发生变化时，才会重新计算。
- 如果依赖项数组为空数组，则 `memoizedValue` 只会在组件首次渲染时计算一次。

这是一个复杂的计算函数：

```js [index.tsx]
const expensiveComputation = (n) => {
  for (let i = 0; i < 99999999999; i++) {
    n += i;
  }
  return n * 2;
};
const result = useMemo(() => expensiveComputation(num), [num]);
```

使用 useMemo 后，只有当 num 变化时才会重新计算，避免了不必要的计算开销。

### useMemo 与 useCallback 的区别

- `useMemo` 缓存的是计算结果（值）
- `useCallback` 缓存的是函数本身（引用）
- 两者都依赖依赖项数组来决定是否重新计算/创建

## 参考

- [React 官方文档](https://reactjs.org/docs/getting-started.html)
