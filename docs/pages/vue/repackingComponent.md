---
title: 组件的二次封装
outline: deep
date: 2023-04-24
tags: vue
sidebar: true
---

# 组件的二次封装

组件的封装要求 完整支持 v-model, 属性、事件、插槽的透传，类型推导、样式扩展。

代码示例：

```vue [src/components/MyInput.vue]
<template>
  <div class="my-select">
    <!-- v-bind="{ ...$attrs, ...props }" 表示：
         - 把父组件传来的所有属性（v-model、placeholder 等）透传进去
         - 把自定义 props（如果有扩展属性）也一并传入
      ⚠️ 注意：v-bind 的合并顺序会影响优先级，
         这里 props 在后面可以覆盖 $attrs 同名属性 -->
    <ElSelect ref="innerRef" v-bind="{ ...$attrs, ...props }">
      <!-- 动态透传插槽
        - 通过 v-for 遍历所有传入的插槽 ($slots)
        - 自动生成 #default、#prefix、#suffix 等插槽
        - scopedData 是作用域插槽参数对象 -->
      <template v-for="(_, name) in $slots" #[name]="scopedData">
        <slot :name="(name as keyof __VLS_Slots)" v-bind="scopedData" />
      </template>
    </ElSelect>
  </div>
</template>

<script setup lang="ts">
import { ElSelect } from "element-plus";
import { useSlots } from "vue";

const props = defineProps<{
  modelValue?: string | number | (string | number)[];
}>();

/**
 * 显式定义插槽类型（用于 IDE 智能提示）
 * 这样父组件在写 <template #prefix> / #suffix / #default 时
 * 都会自动出现代码提示。
 */
defineSlots<{
  default?: () => any;
  prefix?: () => any;
  suffix?: () => any;
}>();

/**
 * 暴露内部 ElSelect 的实例方法给父组件
 * 这样父组件可以通过 ref 访问：
 *    const selectRef = ref<InstanceType<typeof MySelect>>()
 *    selectRef.value?.focus()
 */

defineExpose({} as InstanceType<typeof ElSelect>);
</script>

<style scoped>
.my-select {
  display: inline-block;
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}
</style>
```

| 分类         | 要点                                                | 说明                                     |
| ------------ | --------------------------------------------------- | ---------------------------------------- |
| 属性透传     | `v-bind="{ ...$attrs, ...props }"`                  | 支持父组件直接传递 Element Plus 原生属性 |
| 插槽透传     | 动态 `v-for="(_, name) in $slots"`                  | 自动转发所有具名插槽                     |
| 插槽类型提示 | `defineSlots<>()`                                   | 提供智能提示和类型约束                   |
| 实例暴露     | `defineExpose({} as InstanceType<typeof ElSelect>)` | 让父组件拿到 Element Plus 的方法         |
