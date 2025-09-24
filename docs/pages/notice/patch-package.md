---
sidebar: true
title: 项目补丁
description: 项目中依赖的包有时候不满足我们的需求，比如需要修复一些 bug，或者增加一些功能。有时候就对 node_modules 中的包进行修改，但是这样修改后，下次更新包的时候，修改的内容就会被覆盖掉。有什么方法可以解决这个问题呢？
tags: 其他
---

# patch-package

项目中依赖的包有时候不满足我们的需求，比如需要修复一些 bug，或者增加一些功能。有时候就对 node_modules 中的包进行修改，但是这样修改后，下次更新包的时候，修改的内容就会被覆盖掉。有什么方法可以解决这个问题呢？

有的，兄弟，有的。

`patch-package` 是一个 `npm` 包，它允许开发者创建和应用的补丁，用于修改项目中的 `node_modules`依赖，而无需直接修改那里的文件。这在依赖库的官方版本中未包含你所需要的修复或功能时非常有用。

### 1. 安装 patch-package

```bash
npm install patch-package --save-dev
```

### 2. 修改 node_modules 中的文件

按照你的需求修改 node_modules 中的文件，然后保存。

### 3. 创建补丁文件

```bash
npx patch-package <package-name>
```

`<package-name>` 是你修改的包的名称。
这一步会在项目的根目录下创建一个 patches 文件夹，并在其中生成一个补丁文件 `<package-name>+<version>.patch`。

### 5. 应用补丁

为了让补丁在每次安装依赖后自动应用，需要修改 package.json 中的 scripts 部分

```json [package.json]

"scripts": {
  "postinstall": "patch-package"
}

```

这样每次执行 `npm install` 后，`patch-package` 就会自动应用补丁。

### 注意事项

- 使用 patch-package 是一种维护自定义修改的有效方式，但应该谨慎使用，并确保补丁的持续维护。
- 如果依赖包的版本更新后，补丁文件不再适用，你可能需要重新生成补丁，或者考虑直接在依赖包的源代码库中提交你的修改。
