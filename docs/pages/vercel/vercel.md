---
title: Vercel 云托管平台
description: 前端为主的云托管平台,静态网站托管、SSR（服务端渲染）和 SSG（静态生成）应用、Serverless API 部署（比如边缘函数、无服务器函数）。
sidebar: true
date: 2025-09-24
tags: js
outline: deep
---

# Vercel 云托管平台

## 为什么使用 Vercel

今天在个人博客中添加了一个[百度统计](https://tongji.baidu.com/)，用来统计博客的访问量，在 vitepress 部署 github pages 后，出现了跨域问题，因为是轻量后端，于是使用了`vercel`进行 api 部署，解决跨域问题。在此记录一下。

## 什么是 Vercel

Vercel 是一个 **前端为主的云托管平台**， 主要用于静态网站托管、SSR（服务端渲染）和 SSG（静态生成）应用、Serverless API 部署（比如边缘函数、无服务器函数）。

简单说：你把代码推到 GitHub / GitLab / Bitbucket，`Vercel` 会帮你自动构建、自动部署，并且提供一个可立即访问的域名。

在[Vercel](https://vercel.com/)官网注册账号，然后创建项目，选择`github`，选择项目，然后点击`deploy`。

## 1. 使用 vercel

前提注册好账号。

### 1.1 安装 vercel

```bash
npm i -g vercel
```

### 1.2 新建一个项目目录

以部署 Serverless API 为例，创建一个项目目录。

创建 vercel-api-demo 进入 vercel-api-demo

```bash
mkdir vercel-api-demo && cd vercel-api-demo
```

初始化项目

```bash
npm init -y
```

### 1.3 创建一个 API 文件

在项目根目录新建 api/hello.ts（Vercel 会自动识别 api/ 下的文件为 Serverless Function）：

```ts
// api/hello.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ message: "Hello from Vercel API!" });
}
```

:::tip
注意：如果你写的是 hello.js，就不需要 import type { VercelRequest, VercelResponse } from "@vercel/node";
:::

### 1.4 安装依赖

```bash
npm install -D typescript @vercel/node

# 初始化 tsconfig.json
npx tsc --init

```

### 1.5 部署到 vercel

安装 vercel

```bash
npm i -g vercel
```

在项目根目录执行以下命令：

```bash
vercel
```

```bash
vercel
│
├─> ? Set up and deploy “~/Desktop/demo”? (Y/n)
│       └─ Y 或 回车 → 确认当前目录
│
├─> ? Which scope do you want to deploy to?
│       └─ 选个人账号 或 Team
│
├─> ? Link to existing project? (y/N)
│       └─ N → 新建项目
│       └─ y → 选择已有的 Vercel 项目
│
├─> ? What’s your project’s name? (demo)
│       └─ 回车 → 用默认文件夹名
│
├─> ? In which directory is your code located? ./
│       └─ 回车 → 当前目录
│
├─> ? Do you want to deploy to the demo project?
│       └─ 输入 N（默认，直接回车） → 使用这些设置，马上开始部署
│       └─ 输入 y → 会重新问你：项目名、框架预设、构建命令、输出目录等，让你修改。
│
├─> ? Do you want to change additional project settings? (y/N)
│       └─ N → 开始部署 ✅
│       └─ y → 进入更多配置（通常不需要）
│
└─> 🚀 部署完成
        🔍  Inspect: https://vercel.com/tnqs-projects-c4e9f247/api/GQgPx1nvFMRa42YVcADrs9xexXqe [3s]
        ✅  Production: https://api-ftaecykn1-tnqs-projects-c4e9f247.vercel.app [3s]
```

### 1.6 直接部署到生产

```bash
vercel --prod
```

部署完成后访问： https://demo-bd0slozww-tnqs-projects-c4e9f247.vercel.app/api/hello 即可看见接口调用成功。

## vercel 常用命令

```bash
# 初始化 第一次会进入交互模式（问你项目名、框架等）
vercel
# 部署到生产环境
vercel --prod
# 启动本地开发环境（默认端口 3000）
vercel dev
# 查看你的所有项目和部署列表
vercel ls
# 删除某个项目
vercel remove <project-name>
# 添加环境变量
vercel env add <NAME>
# 例如 vercel env add API_KEY
# 删除环境变量
vercel env rm <NAME>
# 查看环境变量
vercel env ls
# 回滚部署
vercel rollback
```

添加环境变量 `vercel env add <NAME>` 后如何使用

例如： vercel env add API_KEY 添加了 API_KEY 后，在代码中这样使用：

```ts
const API_KEY = process.env.API_KEY; // 无需添加.env 文件, 可直接获取环境变量
```
