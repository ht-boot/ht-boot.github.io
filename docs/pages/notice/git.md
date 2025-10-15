---
sidebar: true
title: git
tags: 其他
---

# git

### git commit 规范

| 类型         | 说明                                       | 示例                                |
| ------------ | ------------------------------------------ | ----------------------------------- |
| **feat**     | 新功能（feature）                          | `feat: 新增功能`                    |
| **fix**      | 修复 bug                                   | `fix: 修复登录时 token 校验错误`    |
| **docs**     | 文档更新（README, 注释等）                 | `docs: 更新部署说明`                |
| **style**    | 代码格式（不影响逻辑）                     | `style: 调整缩进与空格`             |
| **refactor** | 重构（不影响功能）                         | `refactor: 优化路由加载逻辑`        |
| **perf**     | 性能优化                                   | `perf: 减少组件重新渲染次数`        |
| **test**     | 添加或修改测试代码                         | `test: 新增登录模块单元测试`        |
| **build**    | 构建相关修改（vite、webpack、npm scripts） | `build: 调整 vite 打包配置`         |
| **ci**       | CI 配置（GitHub Actions、Jenkins 等）      | `ci: 更新 GitHub Actions node 版本` |
| **chore**    | 其他杂项（非 src 或 test 目录）            | `chore: 更新依赖包`                 |
| **revert**   | 回滚提交                                   | `revert: 回滚上次错误提交`          |
