---
title: Nginx
description: Nginx 文件配置与Nginx 常用命令集合。
tags: 其他
sidebar: true
outline: deep
---

# Nginx

nginx 是一款 HTTP Web 服务器。常用于：

1. 静态资源服务器（图片、CSS、JS、HTML 等）
2. 反向代理服务器（转发请求到后端服务，比如 Node.js、Java、Python）
3. 负载均衡（分发流量到多个后端服务）
4. SSL 证书管理：统一处理 HTTPS。

具有轻量、并发能力强、配置灵活的特点。

## 常用命令

```bash
# 启动
nginx

# 停止 Nginx (立刻终止进程)
nginx -s stop

# 停止 Nginx (等请求完成后再关闭)
nginx -s quit

# 重新加载配置文件（常用，修改配置后执行）
nginx -s reload

# 检查配置文件语法是否正确
nginx -t

# 查看进程
ps -ef | grep nginx

```

macOS 上使用 Homebrew 服务启动（推荐，后台守护进程，随系统自动启动）：

```bash
# 启动服务
brew services start nginx
# 停止服务
brew services stop nginx
# 重启服务
brew services restart nginx
# 查看服务状态
brew services list
```

## 配置文件

Nginx 的配置文件位于 `/usr/local/etc/nginx/nginx.conf`。
Apple Silicon (M1/M2/M3) 上路径为 `/opt/homebrew/etc/nginx/nginx.conf`。

配置文件结构：

```nginx
# 全局块
user  nobody;                 # 指定 Nginx 运行用户（默认 nobody）
worker_processes  auto;       # 工作进程数，auto 表示自动匹配 CPU 核心数

error_log  /usr/local/var/log/nginx/error.log warn;
pid        /usr/local/var/run/nginx.pid;

events {
    worker_connections  1024; # 每个 worker 最大连接数
}

http {
    include       mime.types;               # 文件类型映射
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /usr/local/var/log/nginx/access.log  main;

    sendfile        on;       # 高效文件传输
    keepalive_timeout  65;    # HTTP 长连接超时时间

    # 一个虚拟主机 server
    server {
        listen       8080;    # 默认端口（Homebrew 安装是 8080，不是 80）
        server_name  localhost;

        location / {
            root   /usr/local/var/www;   # 静态文件目录
            index  index.html index.htm; # 默认首页文件
        }

        # 错误页
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/local/var/www;
        }
    }
}

```

### 配置文件分块理解

1. **全局块（global）**

   - worker 数量、运行用户、错误日志、PID 文件等。

2. **events 块**

   - 网络连接相关，比如最大连接数。

3. **http 块**

   - 主要配置：日志格式、文件类型、连接超时、gzip、缓存等。

   - 内部包含多个 server。

4. **server 块（虚拟主机）**

   - 对应一个域名或一个站点，监听端口，绑定域名。

   - 内部包含多个 location。

5. **location 块**

   - 路由规则，定义不同 URL 的处理方式，比如静态文件、反向代理。

### 常修改配置

1. 修改端口（默认 8080）

```nginx
listen 80;
```

2. 反向代理

```nginx
location /api {
    proxy_pass http://127.0.0.1:3000;
}
```

3. 静态文件目录

```nginx
location / {
    root /Users/你的用户名/project/dist;
    index index.html index.htm;
}
```
