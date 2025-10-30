---
sidebar: true
title: React Router
outline: deep
tags: React
---

# React Router

React Router = React 中的“页面切换器”，控制用户在不同组件（页面）之间跳转。

## 安装

```bash
npm install react-router-dom
```

React Router 有几个重要组件：

| 组件              | 说明                                             |
| ----------------- | ------------------------------------------------ |
| `<BrowserRouter>` | 包裹整个应用的路由容器（基于浏览器 History API） |
| `<Routes>`        | 路由表容器，包含多个 `<Route>`                   |
| `<Route>`         | 定义路径与组件的对应关系                         |
| `<Link>`          | 声明式导航（跳转链接）                           |
| `<Outlet>`        | 导航守卫（路由守卫）                             |
| `useNavigate()`   | 编程式导航（通过 JS 跳转）                       |
| `useParams()`     | 获取路由参数                                     |
| `useLocation()`   | 获取当前 URL 信息                                |
| `useMatch()`      | 获取当前路由信息                                 |

## 基本使用

这是一个 React Router v6+ 的完整实战示例，包含：
✅ 基本路由  
✅ 动态路由参数  
✅ 嵌套路由（Outlet）  
✅ 编程式导航（useNavigate）  
✅ 404 页面  
✅ 重定向（Navigate）

```jsx
// App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  Outlet,
  Navigate,
} from "react-router-dom";

// 首页
function Home() {
  return (
    <div>
      <h2>🏠 首页</h2>
      <p>欢迎来到 React Router 示例项目！</p>
    </div>
  );
}

// 关于页面
function About() {
  return (
    <div>
      <h2>ℹ️ 关于我们</h2>
      <p>这是一个学习 React Router 的例子。</p>
    </div>
  );
}

// 用户列表页
function Users() {
  const users = [
    { id: 1, name: "小明" },
    { id: 2, name: "小红" },
  ];

  return (
    <div>
      <h2>👥 用户列表</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link to={`/users/${user.id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>

      {/* 渲染子路由 */}
      <Outlet />
    </div>
  );
}

// 用户详情页（动态路由）
function UserDetail() {
  const { id } = useParams();
  return <h3>当前查看用户ID：{id}</h3>;
}

// 登录页
function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 模拟登录成功后跳转到首页
    navigate("/");
  };

  return (
    <div>
      <h2>🔐 登录页面</h2>
      <button onClick={handleLogin}>登录</button>
    </div>
  );
}

// 404 Not Found
function NotFound() {
  return (
    <div>
      <h2>❌ 页面未找到</h2>
      <Link to="/">返回首页</Link>
    </div>
  );
}

// 顶层导航
function Navbar() {
  return (
    <nav style={{ marginBottom: "16px" }}>
      <Link to="/">首页</Link> | <Link to="/about">关于</Link> |{" "}
      <Link to="/users">用户</Link> | <Link to="/login">登录</Link>
    </nav>
  );
}

// 主应用
export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>🌐 React Router 完整示例</h1>
        <Navbar />

        <Routes>
          {/* 基本页面 */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* 嵌套路由 */}
          <Route path="/users" element={<Users />}>
            <Route path=":id" element={<UserDetail />} />
          </Route>

          {/* 登录页 */}
          <Route path="/login" element={<Login />} />

          {/* 重定向示例：旧地址跳转 */}
          <Route path="/old-about" element={<Navigate to="/about" />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
```
