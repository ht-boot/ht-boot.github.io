---
sidebar: true
title: array 方法集合
date: 2022-07-11
tags: js
outline: deep
---

# 数组方法集合

### 1. 添加/删除元素

| 方法      | 用法                                         | 说明                               |
| --------- | -------------------------------------------- | ---------------------------------- |
| `push`    | `arr.push(item)`                             | 在数组末尾添加元素，返回新长度     |
| `pop`     | `arr.pop()`                                  | 删除数组末尾元素，返回删除的元素   |
| `unshift` | `arr.unshift(item)`                          | 在数组开头添加元素，返回新长度     |
| `shift`   | `arr.shift()`                                | 删除数组开头元素，返回删除的元素   |
| `concat`  | `arr.concat(arr2)`                           | 合并数组，不修改原数组，返回新数组 |
| `splice`  | `arr.splice(start, deleteCount, item1, ...)` | 删除/替换/添加元素，返回被删除元素 |

### 2. 查找元素

| 方法          | 用法                     | 说明                          |
| ------------- | ------------------------ | ----------------------------- |
| `indexOf`     | `arr.indexOf(value)`     | 查找元素索引，找不到返回 -1   |
| `lastIndexOf` | `arr.lastIndexOf(value)` | 查找最后出现的索引            |
| `includes`    | `arr.includes(value)`    | 是否包含元素，返回 true/false |
| `find`        | `arr.find(fn)`           | 返回第一个满足条件的元素      |
| `findIndex`   | `arr.findIndex(fn)`      | 返回第一个满足条件的索引      |
| `some`        | `arr.some(fn)`           | 至少一个元素满足条件返回 true |
| `every`       | `arr.every(fn)`          | 所有元素都满足条件返回 true   |

### 3. 遍历数组

| 方法          | 用法                        | 说明                               |
| ------------- | --------------------------- | ---------------------------------- |
| `forEach`     | `arr.forEach(fn)`           | 遍历数组，不返回新数组             |
| `map`         | `arr.map(fn)`               | 遍历数组并返回新数组               |
| `filter`      | `arr.filter(fn)`            | 遍历数组并返回满足条件的元素新数组 |
| `reduce`      | `arr.reduce(fn, init)`      | 累加/聚合数组，返回最终结果        |
| `reduceRight` | `arr.reduceRight(fn, init)` | 从右到左累加                       |
| `flatMap`     | `arr.flatMap(fn)`           | map + flat(1)，返回一维数组        |

### 4. 排序/反转

| 方法      | 用法            | 说明             |
| --------- | --------------- | ---------------- |
| `sort`    | `arr.sort()`    | 默认按字符串排序 |
| `reverse` | `arr.reverse()` | 反转数组         |

### 5. 转换/拷贝

| 方法            | 用法                    | 说明                           |
| --------------- | ----------------------- | ------------------------------ |
| `slice`         | `arr.slice(start, end)` | 返回数组的浅拷贝，不修改原数组 |
| `join`          | `arr.join(sep)`         | 数组转字符串                   |
| `toString`      | `arr.toString()`        | 转字符串，等同 `join(',')`     |
| `Array.from`    | `Array.from(iterable)`  | 类数组/可迭代对象转数组        |
| `Array.isArray` | `Array.isArray(arr)`    | 判断是否数组                   |

### 6. 扁平化&组合

| 方法      | 用法               | 说明                             |
| --------- | ------------------ | -------------------------------- |
| `flat`    | `arr.flat(depth)`  | 数组扁平化，depth 指层级，默认 1 |
| `concat`  | `arr.concat(arr2)` | 合并数组                         |
| `flatMap` | `arr.flatMap(fn)`  | map + flat(1)                    |
