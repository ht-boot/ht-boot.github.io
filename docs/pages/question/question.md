---
title: 问题记录
description: 记录平时遇到的bug,代码不理解的地方。
sidebar: true
tags: 其他
outline: deep
---

# 问题记录

#### 为什么 Proxy 需要 Reflect？

1. 访问器属性（getter）的 this 指向问题。

代码示例：

```js
const obj = {
  _name: "张三",
  get name() {
    return this._name; // 访问器中的 this
  },
};

// 不使用 Reflect 的 Proxy
const badProxy = new Proxy(obj, {
  get(target, prop) {
    return target[prop]; // 直接返回访问器的结果
  },
});

const child = {
  __proto__: badProxy,
  _name: "李四",
};

console.log(child.name); // 张三
```

#### 什么是 HTTPS 中间人攻击？如何防御？

1. HTTPS 中间人攻击

HTTPS 中间人攻击是 攻击者通过拦截、篡改和伪造数据，来欺骗客户端和服务器，从而获取敏感信息或进行其他恶意操作。

2. 如何防御 HTTPS 中间人攻击

- 使用证书验证：客户端在建立 HTTPS 连接时，会验证服务器的证书是否合法，包括证书的颁发机构、有效期、域名等信息。如果证书不合法，客户端会拒绝连接。
- 使用加密算法：HTTPS 使用加密算法对数据进行加密，攻击者无法解密数据，从而无法获取敏感信息。
- 使用安全协议：HTTPS 使用安全协议（如 TLS/SSL）来保证数据传输的安全，攻击者无法通过中间人攻击来获取数据。
