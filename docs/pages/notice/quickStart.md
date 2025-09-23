---
sticky: 2
description: 1分钟内完成自己的博客创建
descriptionHTML: '
<span style="color:var(--description-font-color);">1分钟内完成自己的博客创建</span>
<pre style="background-color: #292b30; padding: 15px; border-radius: 10px;" class="shiki material-theme-palenight"><code>
    <span class="line"><span style="color:#FFCB6B;">npm</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">add -D</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">vitepress@next</span></span>
    <br/>
    <span class="line"><span style="color:#FFCB6B;">npx</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">vitepress</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">init</span></span>
    <br/>
    <span class="line"><span style="color:#FFCB6B;">npm</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">i</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">@sugarat/theme</span></span>
</code>
</pre>'
tags: 其他
top: 1
sidebar: true
date: 2025-08-21
---

# 博客创建

1 分钟内完成自己的博客创建

:::warning 注意事项
使用 [pnpm](https://pnpm.io)，[yarn](https://www.npmjs.com/package/yarn)。

其它情况推荐使用 pnpm，_不推荐使用 yarn_

:::code-group

```sh [安装 PNPM]
npm install -g pnpm
```

:::

## 创建项目

### 前置准备

- [Node.js](https://nodejs.org/zh-cn) 18 及以上版本
- 通过命令行界面 (CLI) 访问 VitePress 的终端。
- 支持 [Markdown](https://en.wikipedia.org/wiki/Markdown) 语法的编辑器。
  使用 [vitepress](https://vitepress.dev/zh/) 快速创建模板项目

:::code-group

```sh [npm]
npm add -D vitepress@next
```

```sh [pnpm]
pnpm add -D vitepress@next
```

:::  
VitePress 附带一个命令行设置向导，可以帮助你构建一个基本项目。安装后，通过运行以下命令启动向导：
:::code-group

```sh [npm]
npx vitepress init
```

```sh [pnpm]
pnpm vitepress init
```

:::

接下来按照操作指引进行操作即可。

```
┌ Welcome to VitePress!
│
◇ Where should VitePress initialize the config?
│ ./docs
│
◇ Where should VitePress look for your markdown files?
│ ./docs
│
◇ Site title:
│ My Awesome Project
│
◇ Site description:
│ A VitePress Site
│
◇ Theme:
│ Default Theme
│
◇ Use TypeScript for config and theme files?
│ Yes
│
◇ Add VitePress npm scripts to package.json?
│ Yes
│
◇ Add a prefix for VitePress npm scripts?
│ Yes
│
◇ Prefix for VitePress npm scripts:
│ docs
│
└ Done! Now run pnpm run docs:dev and start writing.
```

### 启动并运行

该工具还应该将以下 npm 脚本注入到 package.json 中：

```sh [package.json]
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:serve": "vitepress serve docs"
  }
}
```

你可以通过运行以下命令来启动开发服务器：
:::code-group

```sh [npm]
npm run docs:dev
```

```sh [pnpm]
pnpm run docs:dev
```

:::

你就会得到一个这样的页面
![alt text](https://free.picui.cn/free/2025/09/04/68b9a8a0c57f1.png)

## 使用主题

由于官方的主题感觉太丑了，不好看，所以这里使用了 **@sugarat/theme**主题， 好看的呢。

### 安装主题

因为这个主题是使用了 element-plus 组件库，所以需要先安装 `element-plus` 和 `@element-plus/icons-vue`
安装 css 预处理器 sass
:::code-group

```sh [npm]
npm i @sugarat/theme
npm i element-plus @element-plus/icons-vue
npm i sass -D
```

:::

### 配置主题

在 `docs/.vitepress/theme` 目录下创建 `index.ts` `index.scss` 文件，并添加以下内容：

```sh [docs/.vitepress/theme/index.ts]
import BlogTheme from "@sugarat/theme";

// 自定义样式重载
// import './style.scss'

// 自定义主题色
// import './user-theme.css'

export default BlogTheme;
```

```sh [docs/.vitepress/theme/index.scss]
.VPHome {
  // 定义遮罩样式
  background: radial-gradient(ellipse,
      rgba(var(--bg-gradient-home), 1) 0%,
      rgba(var(--bg-gradient-home), 0) 150%);

  // 自定义首页背景图
  &::before {
    // 图片来源：https://zhuanlan.zhihu.com/p/54060187
    background-image: url(./assets/bg.webp);
    background-size: cover;
  }
}
```

在 `docs/.vitepress` 目录下创建 `/blog-theme.ts` 文件，并添加以下内容：

```ts [docs/.vitepress//blog-theme.ts]
// 主题独有配置
import { getThemeConfig } from "@sugarat/theme/node";

// 所有配置项，详见文档: https://theme.sugarat.top/
const blogTheme = getThemeConfig({
  // 页脚
  footer: {
    // message 字段支持配置为HTML内容，配置多条可以配置为数组
    // message: "下面 的内容和图标都是可以修改的噢（当然本条内容也是可以隐藏的）",
    copyright: "MIT License",
  },
  // 主题色修改
  themeColor: "el-blue",
  // 文章默认作者
  author: "xxx",
});

export { blogTheme };
```

在 `docs/.vitepress/config.mts` 中配置主题

```ts
import { defineUserConfig } from "vitepress";
import { blogTheme } from "./blog-theme";

export default defineUserConfig({
  extends: blogTheme,
  themeConfig: {
    ...
  }
});
```

重新运行项目后就可以得到一个这样的页面
![alt text](https://free.picui.cn/free/2025/09/04/68b9a75e169c0.jpg)

### 项目部署

我这里只说明 github pages 部署操作，如何部署到其他平台，请参考 [vitepress 官方文档](https://vitepress.dev/zh/guide/deploy)

1️.在项目的 .github/workflows 目录中创建一个名为 deploy.yml 的文件，其中包含这样的内容：

```sh [.github/workflows/deploy.yml]
# 构建 VitePress 站点并将其部署到 GitHub Pages 的示例工作流程
#
name: Deploy VitePress site to Pages

on:
  # 在针对 `main` 分支的推送上运行。如果你
  # 使用 `master` 分支作为默认分支，请将其更改为 `master`
  push:
    branches: [main]

  # 允许你从 Actions 选项卡手动运行此工作流程
  workflow_dispatch:

# 设置 GITHUB_TOKEN 的权限，以允许部署到 GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# 只允许同时进行一次部署，跳过正在运行和最新队列之间的运行队列
# 但是，不要取消正在进行的运行，因为我们希望允许这些生产部署完成
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  # 构建工作
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 如果未启用 lastUpdated，则不需要
      # - uses: pnpm/action-setup@v3 # 如果使用 pnpm，请取消此区域注释
      #   with:
      #     version: 9
      # - uses: oven-sh/setup-bun@v1 # 如果使用 Bun，请取消注释
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm # 或 pnpm / yarn
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Install dependencies
        run: npm ci # 或 pnpm install / yarn install / bun install
      - name: Build with VitePress
        run: npm run docs:build # 或 pnpm docs:build / yarn docs:build / bun run docs:build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  # 部署工作
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

:::warning 注意事项
默认情况下，我们假设站点将部署在域名 (/) 的根路径上。如果站点在子路径中提供服务，例如 https://mywebsite.com/blog/，则需要在 VitePress 配置中将 base 选项设置为 '/blog/'。  
**例**：如果你使用的是 Github 页面并部署到 user.github.io/repo/，请将 base 设置为 /repo/。
:::
:::code-group

2.在存储库设置中的“Pages”菜单项下，选择“Build and deployment > Source > GitHub Actions”。

3.将更改推送到 main 分支并等待 GitHub Action 工作流完成。你应该看到站点部署到 `https://<username>.github.io/[repository]/` 或 `https://<custom-domain>/`，这取决于你的设置。你的站点将在每次推送到 main 分支时自动部署。

:::

## 升级和扩展

如果主题更新了，升级主题，原项目只需执行如下指令即可
:::code-group

```sh [pnpm]
pnpm add @sugarat/theme@latest

# 更新 vitepress 版本（通常安装最新的即可，主题包每次更新不出意外都会使用最新的VitePress）
pnpm add vitepress@latest
```

:::

### 1. 网站访问次数统计器

这里推荐第三方统计服务：

#### 1. [不蒜子 Busuanzi](https://busuanzi.ibruce.info/)

示例（用 Busuanzi，最简单）：

```ts [docs/.vitepress/config.mts]
export default defineConfig({
  head: [
    [
      "script",
      {
        async: "true",
        src: "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js",
      },
    ],
  ],
});
```

然后在自定义主题里加：

```md
<span id="busuanzi_container_site_pv">
  本站总访问量 <span id="busuanzi_value_site_pv"></span> 次
</span>
```

这样就可以在页脚看到访问次数了，但是只能获取到总访问数,无法获取其他数据。于是可以使用第二个方案：

#### 2.[百度统计](https://tongji.baidu.com/)

使用方式：

1. 注册 [百度统计](https://tongji.baidu.com/)。

- 获取一段 JS 统计代码。
- 和 Busuanzi 一样，在 .vitepress/config.ts 里加 head 脚本即可。
  代码实例如下：

```ts [docs/.vitepress/config.mts]
export default defineConfig({
  head: [
    [
      "script",
      { src: "https://hm.baidu.com/hm.js?b6f28ce42f6d0830330e567be1b0ceac" },
    ],
  ],
});

// 或者
export default defineConfig({
  head: [
    [
      "script",
      {},
      `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?你的追踪ID";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();
      `,
    ],
  ],
});
```

2. 部署并验证

- 重新 vitepress build，然后把 .vitepress/dist/ 上传到 GitHub Pages。
- 打开博客页面，用浏览器开发者工具 (F12) 查看网络请求，看是否加载了 hm.js。
- 等 1-2 小时，在 百度统计后台就能看到数据（包括每天多少人访问）。

**你就可以看到：** `PV`（页面浏览量）、`UV`（访客数，每天多少不同的人）、`IP`、`访问来源`（百度、谷歌、直接输入等）、`访问页面路径`、`访问时长等数据了`。

## 更多

博主是因为想在自己框架的基础上换一个主题才这样做的，所以看起来很麻烦，各位看官的博客若是从头开始的，可以
参考 [主题文档](https://theme.sugarat.top/sop/quickStart.html)，简单明了，非常方便。
