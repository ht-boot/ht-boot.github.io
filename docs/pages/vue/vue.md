---
sidebar: true
title: vue
description: 对 vue 框架学习过程的一个记录，包括 vue2/3 源码解析、api 实现原理、实践等记录。
tags: js
---

# vue

:::tip tips
对 vue 框架学习过程的一个记录，包括 vue2/3 源码解析、api 实现原理、实践等记录。
:::

## 1. 生命周期

### 1. 生命周期总览

一个 Vue 组件从创建到销毁，大致分成 4 个大阶段：

1. 创建阶段（beforeCreate → created → setup）
2. 挂载阶段（beforeMount → mounted）
3. 更新阶段（beforeUpdate → updated）
4. 卸载阶段（beforeUnmount → unmounted）

### 2. 每个阶段干什么事儿

- **beforeCreate**

  - 组件实例刚创建
  - data、props、methods 都还没初始化
  - 一般不用

* **created**

  - data、props、methods 可用
  - DOM 未生成
  - 适合做：请求数据、初始化状态

* **setup**

- **时机**：在 created 之前调用（Vue 3 新增的核心）。
- **参数**：
  - `props`：响应式的、只读
  - `context`：包含 `attrs`、`slots`、`emit`（不是响应式对象）
- **能做什么**：
  - 定义响应式状态（`ref` / `reactive`）
  - 定义计算属性（`computed`）
  - 定义方法
  - 使用 Composition API 的生命周期钩子（`onMounted` 等）
- **注意**：

  - 在 `setup` 内不能用 `this`（因为组件实例还没建立）

- **beforeMount**

  - 模板已编译成虚拟 DOM
  - 还没挂到真实 DOM
  - 一般很少用

- **mounted**

  - 真实 DOM 已插入
  - 可以安全操作 DOM 或第三方库
  - 常用于：获取元素宽高、初始化图表、绑定事件

- **beforeUpdate**

  - 数据修改，虚拟 DOM 即将重新渲染
  - 此时 DOM 还是旧的
  - 可以在更新前读取旧 DOM 状态

- **updated**

  - 数据修改后，DOM 已更新
  - 可操作最新 DOM
  - ⚠️ 注意避免在这里修改状态，否则可能死循环

- **beforeUnmount**

  - 组件将要卸载
  - 清理副作用（定时器、事件监听、订阅）

- **unmounted**

  - 组件完全卸载
  - DOM 被移除，实例销毁

### 3. vue2/vue3 生命周期对比

| 阶段   | 选项式 API      | 组合式 API (`setup`) | 说明                                |
| ------ | --------------- | -------------------- | ----------------------------------- |
| 创建前 | `beforeCreate`  | ❌ 不存在            | 组件实例初始化，还没 props、data    |
| 创建后 | `created`       | ❌ 不存在            | data、methods 已可用，还没 DOM      |
| setup  | ❌              | `setup()`            | 在 created 之前调用，返回响应式数据 |
| 挂载前 | `beforeMount`   | `onBeforeMount`      | 模板已编译，但还没插入 DOM          |
| 挂载后 | `mounted`       | `onMounted`          | DOM 已插入，可操作 DOM              |
| 更新前 | `beforeUpdate`  | `onBeforeUpdate`     | 数据变化、虚拟 DOM 即将重新渲染     |
| 更新后 | `updated`       | `onUpdated`          | DOM 更新完成，可以拿到最新的 DOM    |
| 卸载前 | `beforeUnmount` | `onBeforeUnmount`    | 实例将销毁，可清理定时器、事件      |
| 卸载后 | `unmounted`     | `onUnmounted`        | 实例销毁，DOM 移除，事件解绑        |

## 2. h()/render()

### 1. 什么是 h 函数？

- `h` 其实就是 **hyperscript** 的缩写（超脚本）。
- 用来**创建虚拟 DOM（VNode）** 的工具函数。
- Vue 内部渲染用的就是它。

使用示例:

```js [index.vue]
import { h } from "vue";

const vnode = h("div", { id: "app" }, "Hello Vue");
console.log(vnode);
```

输出结果是一个 VNode 对象：

```js
{
  type: "div",
  props: { id: "app" },
  children: "Hello Vue"
}
```

### 2. 什么是 render 函数？

- Vue 组件默认是用模板 `<template>` 渲染的,但有时需要更灵活的方式，可以自己写一个 **渲染函数 render**，返回 VNode。
- 渲染函数的返回值就是要渲染的虚拟 DOM 树。

使用示例:

```js [index.vue]
import { h } from "vue";

export default {
  render() {
    return h("div", { class: "box" }, [
      h("h1", null, "标题"),
      h("p", null, "这里是内容"),
    ]);
  },
};
```

就等价于:

```html [index.vue]
<template>
  <div class="box">
    <h1>标题</h1>
    <p>这里是内容</p>
  </div>
</template>
```

### 3. `h` 与 `render` 的关系

- `h`：创建 VNode 的工具函数。
- `render`：一个函数，返回由 `h` 创建的 VNode 树。

可以理解为：

```js
<template> 模板
      ↓  编译器（compile）
render() 函数
      ↓  调用
    h() 函数
      ↓  返回
   VNode 虚拟DOM
      ↓  渲染器（patch）
  真正的 DOM 节点
```

### 4. 什么时候要用 render 而不是模板？

场景主要有三类：

- **动态组件树生成**：根据数据动态生成 VNode 结构（比如可拖拽表单设计器）。
- **跨平台渲染**：如 SSR、自定义渲染器，模板不好用时直接用 render。
- **高阶组件 / JSX**：render 更灵活，可以写复杂逻辑。

例如根据一份 配置数据 生成组件树：

```ts [index.vue]
<script setup lang="ts">
import { h, ref, type VNode } from "vue"
import { ElInput, ElButton, ElSelect, ElOption, ElForm, ElFormItem } from "element-plus"

// ---- 类型定义 ----
interface BaseNode {
    type: string
    modelKey?: string
    props?: Record<string, any>
    rules?: Record<string, any>[]
}

interface InputNode extends BaseNode {
    type: "input"
    placeholder?: string
}

interface ButtonNode extends BaseNode {
    type: "button"
    text: string
    onClick?: () => void
}

interface SelectNode extends BaseNode {
    type: "select"
    options: { label: string; value: string }[]
}

interface GroupNode extends BaseNode {
    type: "group"
    title?: string
    children: SchemaNode[]
}

type SchemaNode = InputNode | ButtonNode | SelectNode | GroupNode

// ---- 响应式表单数据 ----
const formData = ref<Record<string, any>>({
    username: "",
    password: "",
    role: "",
    profile: {
        email: "",
        phone: ""
    }
})

// 接受父组件参数
const props = defineProps({
    url: {
        type: String,
        default: ""
    }
})

console.log(props.url, '------');

// ---- 表单引用 ----
const formRef = ref<any>()

// ---- 工具函数：支持深层字段 ----
const getValue = (obj: any, path: string) => path.split(".").reduce((acc, key) => acc?.[key], obj)

const setValue = (obj: any, path: string, value: any) => {
    const keys = path.split(".")
    keys.reduce((acc, key, idx) => {
        if (idx === keys.length - 1) {
            acc[key] = value
        } else {
            if (!acc[key]) acc[key] = {}
        }
        return acc[key]
    }, obj)
}

// ---- schema 配置 ----
const schema: SchemaNode[] = [
    {
        type: "input",
        placeholder: "用户名",
        modelKey: "username",
        props: { type: "text", clearable: true },
        rules: [{ required: true, message: "用户名不能为空", trigger: "blur" }]
    },
    {
        type: "input",
        placeholder: "密码",
        props: { type: "password", clearable: true },
        modelKey: "password",
        rules: [
            { required: true, message: "密码不能为空", trigger: "blur" },
            { min: 6, message: "密码至少 6 个字符", trigger: "blur" }
        ]
    },
    {
        type: "select",
        modelKey: "role",
        options: [
            { label: "管理员", value: "admin" },
            { label: "普通用户", value: "user" }
        ],
        rules: [{ required: true, message: "请选择角色", trigger: "change" }]
    },
    {
        type: "group",
        title: "联系方式",
        children: [
            {
                type: "input",
                placeholder: "请输入邮箱",
                modelKey: "profile.email",
                rules: [{ required: true, message: "邮箱不能为空", trigger: "blur" }]
            },
            {
                type: "input",
                placeholder: "请输入手机号",
                modelKey: "profile.phone",
                rules: [{ required: true, message: "手机号不能为空", trigger: "blur" }]
            }
        ]
    },
    {
        type: "button",
        text: "提交",
        onClick: async () => {
            const isValid = await formRef.value?.validate()
            if (isValid) {
                alert("表单提交成功！\n" + JSON.stringify(formData.value, null, 2))
            } else {
                alert("表单验证失败，请检查填写的内容！")
            }
        }
    }
]

// ---- 渲染函数 ----
const renderNode = (node: SchemaNode): VNode => {
    const componentMap: Record<string, (node: any) => VNode> = {
        input: (n: InputNode) =>
            h(
                ElFormItem,
                { label: n.placeholder, prop: n.modelKey, rules: n.rules },
                {
                    default: () =>
                        h(ElInput, {
                            placeholder: n.placeholder,
                            modelValue: getValue(formData.value, n.modelKey!),
                            "onUpdate:modelValue": (val: string) => setValue(formData.value, n.modelKey!, val),
                            ...n.props
                        })
                }
            ),
        select: (n: SelectNode) =>
            h(
                ElFormItem,
                { label: "角色", prop: n.modelKey, rules: n.rules },
                {
                    default: () =>
                        h(
                            ElSelect,
                            {
                                modelValue: getValue(formData.value, n.modelKey!),
                                "onUpdate:modelValue": (val: string) => setValue(formData.value, n.modelKey!, val)
                            },
                            {
                                default: () => n.options.map(opt => h(ElOption, { label: opt.label, value: opt.value }))
                            }
                        )
                }
            ),
        button: (n: ButtonNode) => h(ElButton, { type: "primary", onClick: n.onClick }, () => n.text),
        group: (n: GroupNode) =>
            h("fieldset", { class: "form-group" }, [
                n.title && h("legend", null, n.title),
                ...n.children.map(child => renderNode(child))
            ])
    }
    return componentMap[node.type]!(node as any)
}
</script>

<template>
    <ElForm ref="formRef" :model="formData" label-position="top" class="form-container">
        <template v-for="node in schema" :key="node.modelKey || node.type">
            <component :is="{ render: () => renderNode(node) }" />
        </template>
    </ElForm>
</template>

<style scoped>
.form-container {
    width: 320px;
    margin: 0 auto;
}

.form-group {
    border: 1px solid #ccc;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 12px;
}

legend {
    font-weight: bold;
    padding: 0 4px;
}
</style>
```

## 参考资料

[vue2 官方文档](https://v2.cn.vuejs.org/) ｜ [vue3 官方文档](https://cn.vuejs.org/)
