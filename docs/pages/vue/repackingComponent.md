---
title: 组件的二次封装(新)
outline: deep
date: 2025-09-24
tags: vue
sidebar: true
---

# 组件的二次封装

基于已有的组件，进行进一步的封装或包装，以便满足特定需求或增强其功能，通常是在不修改原始组件的情况下，通过组合、继承、或增强功能来实现。

记录一个包装组件的巧妙方法。以 `ElInput` 组件为例，我们希望将 `ElInput` 组件进行二次封装，并暴露出 `ElInput` 组件的实例，以便在父组件中调用 `ElInput` 组件的方法。

```vue
<template>
  <component :is="h(ElInput, { ...$attrs }, $slots)" />
</template>
<script setup>
import { h } from "vue";
import { ElInput } from "element-plus";
</script>
```

通过`h(ElInput, {...})` 动态创建了 `ElInput` 组件，并且将所有父组件传递的属性和插槽内容转发给 `ElInput`。

```vue
<template>
  <component :is="h(ElInput, { ...$attrs, ref: funcRef }, $slots)" />
</template>

<script setup lang="ts">
import { h, getCurrentInstance } from "vue";
import { ElInput } from "element-plus";

const vm = getCurrentInstance();

// 获取到当前组件实例,并将其暴露给父组件
const funcRef = (exposed: Record<string, any> | null) => {
  if (!vm) return;
  vm.exposed = exposed;
};
</script>
```

通过`getCurrentInstance`获取当前组件实例，`funcRef` 被作为 `ref` 传递给 `ElInput` 组件，允许父组件访问到 MyInput 中暴露的方法, 这样就可以在父组件中通过`ref`获取到`ElInput`组件的实例，从而调用其方法。`$slots` 用于传递插槽内容，`$slots`将父组件的插槽内容传递到子组件的插槽位置。

父组件调用

```vue
<template>
  <MyInput ref="inputRef" />
  <el-button @click="handleClick">获取焦点</el-button>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import MyInput from "./MyInput.vue";

const input = useTemplateRef("inputRef");

const handleClick = () => {
  if (input.value) {
    input.value.focus();
  }
};
</script>
```

父组件通过`useTemplateRef`获取到`MyInput`组件的实例，然后调用其`focus`方法。  
但是，我们的环境是 ts 环境，还没有实现 ts 独有的类型推断，所以需要去手动声明一下类型。

```vue
<script lang="ts" setup>
import type { ComponentInstance } from "vue";
import ElInput from "element-plus";
// 推导ElInput的实例类型
defineExpose({} as ComponentInstance<typeof ElInput>);
</script>
```

通过`defineExpose`将`ElInput`的实例类型暴露给父组件，这样父组件在使用`useTemplateRef`时就可以正确地推断出类型。
:::tip 注意 ⚠️
这里的类型推导只能在 vscode 中生效，而 webstorm 中没办法。原因是 vscode 是基于 real language tools 实现的。
:::

完整代码

```vue
<template>
  <component :is="h(ElInput, { ...$attrs, ref: funcRef }, $slots)" />
</template>

<script setup lang="ts">
import { h, getCurrentInstance, type ComponentInstance } from "vue";
import { ElInput } from "element-plus";

const vm = getCurrentInstance();

// 自定义props，也是可以通过ts类型推断的
const props = defineProps({
  abs: {
    type: String,
    default: "",
  },
});

const demo = () => console.log("我是子组件的方式");

// 获取到当前组件实例,并将其暴露给父组件
const funcRef = (exposed: Record<string, any> | null) => {
  if (!vm) return;
  vm.exposed = {
    ...exposed,
    demo,
  };
};

// 推导ElInput的实例类型
defineExpose({} as ComponentInstance<typeof ElInput> & { demo: () => void });
</script>
```
