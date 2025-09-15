---
title: 基于 Proxy 的 Vue3 v-model 双向绑定封装
outline: deep
author: ht
date: 2023-05-16
tags: vue
---

# 背景

在开发中，我们经常会遇到子组件修改父组件内容，但又因为单向数据流，使得写法过于麻烦。今天就记录一个快捷优雅的方式。 因为我们使用的功能是多次切重复的，所有我们封装一个 hooks。

:::tip 🔔
它可以同时处理 原始值（string/number/boolean 等）和 对象/数组 类型，支持通过属性修改对象的方式实现 v-model 的双向绑定。
:::

#### 实现 hooks

```ts [useVModel.ts]
import { computed } from "vue";

// WeakMap 用来缓存对象和它对应的 Proxy
// 这样可以避免每次都 new Proxy，节省性能 & 保证同一个对象引用一致
const cacheMap = new WeakMap();

/**
 * 通用的 useVModel 封装
 *
 * 功能：
 * - 支持原始值 (string / number / boolean / null / undefined)
 * - 支持对象 (自动加 Proxy，允许直接修改属性)
 * - 兼容 Vue 的 v-model 语法（自动触发 `emit('update:xxx')`）
 *
 * @param props    子组件接收的 props
 * @param propName 需要双向绑定的 prop 名字（例如 "modelValue"）
 * @param emit     Vue 的 emit 函数，用于触发事件
 * @returns        一个 computed ref，可以直接用在模板里（支持 .value / v-model）
 */
export function useVModel<
  Props extends Record<string, any>,
  K extends keyof Props & string
>(
  props: Props,
  propName: K,
  emit: (event: `update:${K}`, value: Props[K]) => void
) {
  return computed<Props[K]>({
    // Getter：获取 props[propName] 的值
    get() {
      const value = props[propName];

      /**
       * 情况 1：对象类型（非 null）
       * -----------------------------------
       * 我们用 Proxy 包装它，拦截 set 操作，
       * 在属性修改时自动触发 emit('update:xxx')。
       * 这样就能实现 `user.name = "xxx"` 这种深层修改。
       */
      if (value !== null && typeof value === "object") {
        // 如果缓存里有，直接返回已有的 Proxy
        if (cacheMap.has(value)) {
          return cacheMap.get(value);
        }

        // 创建 Proxy，拦截 set
        const proxy = new Proxy(value, {
          get(target, key) {
            return Reflect.get(target, key);
          },
          set(target, key, newVal) {
            // emit 一个新的对象副本
            // 这样 Vue 能检测到引用变化，从而触发视图更新
            const updated = Array.isArray(target)
              ? Object.assign([], target, { [key]: newVal })
              : { ...(target as any), [key]: newVal };

            emit(`update:${propName}`, updated);
            return true;
          },
        });

        // 缓存这个 Proxy，避免重复创建
        cacheMap.set(value, proxy);
        return proxy as Props[K];
      }

      /**
       * 情况 2：原始值 (string, number, boolean, null, undefined)
       * -----------------------------------
       * 直接返回，不需要 Proxy。
       */
      return value;
    },

    // Setter：当外部直接给 computed 赋值时调用
    // 例如：vModelRef.value = newVal
    set(newValue) {
      emit(`update:${propName}`, newValue);
    },
  });
}
```

#### 使用

```vue [index.vue]
<!-- ------------------------父组件------------------------ -->
<template>
  <component_form v-model:userInfo="formData" />
</template>
<script setup lang="ts">
import { ref } from "vue";
import component_form from "./components/component_form.vue";

const formData = ref({
  name: "ming",
  sex: "男",
  age: 18,
  phone: "13888888888",
  email: "123@qq.com",
});
</script>
<!-- -----------------------------子组件---------------------------- -->
<template>
  <div>
    <el-form :model="formData_userInfo" label-width="120px">
      <el-form-item label="Activity name">
        <el-input v-model="formData_userInfo.name" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup name="component_form">
import { useVModel } from "../hooks/useVModel";
interface IUserInfo {
  name: string;
  sex: string;
  age: number;
  phone: string;
  email: string;
}

import { PropType } from "vue";
const props = defineProps({
  // 表单数据
  userInfo: {
    type: Object as PropType<IUserInfo>,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:userInfo"]);

const formData_userInfo = useVModel(props, "userInfo", emit);
</script>
```
