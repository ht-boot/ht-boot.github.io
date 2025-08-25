---
sidebar: true
title: 大文件上传
date: 2024-04-11
tags:
  - js
---

# 大文件上传

### 契机

项目原本存在文件上传，但是有人偷懒，单纯做了一个文件上传的功能，但是此功能上传过大文件时，频频出现超时，导致上传失败，用户体验极差，因此需要优化文件上传功能，在与领导之间的多次周璇，最终这个活还是落在了我的头上。那么今天就从头到尾盘梳理一下技术细节。

### 实现思路

- **大文件分片上传**，将文件分成多个小文件，避免上传超时。
- **秒传**，通过文件指纹，判断文件是否已经上传过，如果上传过，则直接返回成功，无需再次上传。
- **断点续传**，通过文件指纹，判断文件是否已经上传过，如果上传过，则从上次上传的位置继续上传。
- **文件合并**，将多个小文件合并成一个大文件。
- **并发控制**，防止同时上传过多文件，导致服务器压力过大。
- **手动中断**：支持用户手动中断上传。

### 代码实现

这里使用 `vite + vue3 + ts + express` 做演示。

#### 1. 文件选择

通过 `<input type="file">` 获取用户选择的文件。

```sh [index.vue]
<script setup lang="ts">
import { ref } from 'vue'

const isUploading = ref(false); // 是否正在上传

const handleUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target || !target.files) return;// 未选文件则退出
  const file = target.files[0]; // 获取用户选择的单个文件
}

/**
 * 中断上传（用户触发）
 */
const handleAbortUpload = () => {
  if (!isUploading.value) return;
}
</script>
<script>
<template>
  <div class="upload-container">
    <h2>大文件上传演示</h2>
    <input @change="handleUpload" type="file" class="file-input" />
    <!-- 上传中才显示中断按钮 -->
    <button @click="handleAbortUpload" v-if="isUploading" class="abort-btn">
      中断上传
    </button>
  </div>
</template>

<style scoped>
</style>
```

#### 2. 文件分片

用 API `File.slice()` 按固定大小进行切割文件，得到多个 Blob 分片对象。

```ts [./utils/fileSlice.ts]
/**
 * 文件分片工具
 * @param {File} file - 用户选择的文件
 * @returns {Blob[]} 分片数组
 */

// 分片大小：1MB
const CHUNK_SIZE = 1024 * 1024;
const createFileChunks = (file: {
  size: number;
  slice: (arg0: number, arg1: number) => any;
}) => {
  let current = 0; // 当前切割位置
  let fileChunks = [];
  while (current < file.size) {
    // 从当前位置切割到(当前位置+分片大小)，可能最后一片不足1MB
    const blob = file.slice(current, current + CHUNK_SIZE);
    fileChunks.push(blob);
    current += CHUNK_SIZE;
  }
  return fileChunks;
};

export { createFileChunks, CHUNK_SIZE };
```

#### 3.计算文件哈希：生成唯一标识

这里使用的 spark-md5 库计算文件哈希，

安装依赖 `npm i spark-md5`

```sh
npm i spark-md5 --save
```

代码实现

```ts [./utils/createHash.ts]
import sparkMD5 from "spark-md5";

/**
 * 将 File 转成 ArrayBuffer，并计算其哈希值
 * @param {Blob[]} chunks - 分片数组
 * @returns {Promise<string>} 文件哈希值
 */
const createHash = (chunks: Blob[], CHUNK_SIZE: number): Promise<string> => {
  return new Promise((resolve) => {
    const spark = new sparkMD5.ArrayBuffer(); // 初始化MD5计算器
    const fileReader = new FileReader(); // 用于读取Blob内容
    const targets: BlobPart[] | undefined = []; // 存放抽样的片段

    // 抽样策略：首尾分片全量，中间分片取3个2字节片段（共6字节）
    chunks.forEach((chunk, index) => {
      if (index === 0 || index === chunks.length - 1) {
        // 首尾分片：全量加入抽样
        targets.push(chunk);
      } else {
        // 中间分片：取前2字节、中间2字节、后2字节，
        // 会有一定概率导致修改文件重新计算的哈希值与旧哈希值一样，如果重新计算的哈希值不一样，就会导致所有的片段重新上传
        targets.push(chunk.slice(0, 2));
        targets.push(chunk.slice(CHUNK_SIZE / 2, CHUNK_SIZE / 2 + 2));
        targets.push(chunk.slice(CHUNK_SIZE - 2, CHUNK_SIZE));
      }
    });

    // 读取抽样片段并计算哈希
    fileReader.readAsArrayBuffer(new Blob(targets));
    fileReader.onload = (e) => {
      const result = e.target?.result;
      if (!result || typeof result === "string") return;
      spark.append(result); // 累加数据
      resolve(spark.end()); // 生成最终哈希值
    };
  });
};

export default createHash;
```

#### 4. 文件校验

通过文件哈希值，判断文件是否已经上传过，如果上传过，则直接返回成功，无需再次上传。

```ts [index.vue]
const fileHash = ref(""); // 文件哈希值
const fileName = ref(""); // 原始文件名（用于取后缀）
// 定义服务器返回的数据类型
interface VerifyResponse {
  data: {
    shouldUpload: boolean;
    existChunks: string[];
  };
}
/**
 * 向服务器校验文件状态
 * @returns {Promise<Object>} 校验结果（shouldUpload: 是否需要上传, existChunks: 已上传分片列表）
 */
const verify = async (): Promise<VerifyResponse> => {
  const res = await fetch("http://localhost:3000/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      fileHash: fileHash.value,
      fileName: fileName.value,
    }),
  });
  return res.json();
};

const handleUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target || !target.files) return; // 未选文件则退出
  const file = target.files[0]; // 获取用户选择的单个文件
  fileName.value = file.name;
  const chunks = createFileChunks(file);
  // console.log(chunks, 'chunks');
  fileName.value = file.name;
  fileHash.value = await createHash(chunks, CHUNK_SIZE); // 计算文件哈希

  // 发起校验
  const verifyRes = await verify();

  if (!verifyRes.data.shouldUpload) {
    // 服务器已存在完整文件 → 秒传成功
    alert("秒传成功！文件已存在");
    return;
  }

  // 需上传：进入分片上传环节
  await uploadChunks(chunks, verifyRes.data.existChunks);
};
```

#### 5. 分片上传

过滤已上传的分片，并发上传待上传的分片。

```ts [index.vue]
// 前端：请求合并分片的函数
const mergeRequest = async () => {
  await fetch("http://localhost:3000/merge", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      fileHash: fileHash.value,
      fileName: fileName.value,
      size: CHUNK_SIZE, // 分片大小（用于计算写入位置）
    }),
  });

  // 合并完成后的清理
  isUploading.value = false;
  alert("文件上传完成！");
};

/**
 * 上传分片
 * @param {Blob[]} chunks - 所有分片数组
 * @param {string[]} existChunks - 已上传的分片标识列表
 */
const uploadChunks = async (chunks: Blob[], existChunks: string[]) => {
  isUploading.value = true;
  abortControllers.value = []; // 清空历史中断控制器

  // 1. 生成所有分片的基础信息（文件哈希、分片标识、分片数据）
  const chunkInfoList = chunks.map((chunk, index) => ({
    fileHash: fileHash.value,
    chunkHash: `${fileHash.value}-${index}`, // 分片标识：文件哈希-序号（确保唯一）
    chunk: chunk,
  }));

  // 2. 过滤已上传的分片 → 只保留待上传的
  const formDatas = chunkInfoList
    .filter((item) => !existChunks.includes(item.chunkHash))
    .map((item) => {
      const formData = new FormData();
      formData.append("filehash", item.fileHash);
      formData.append("chunkhash", item.chunkHash);
      formData.append("chunk", item.chunk); // 分片二进制数据
      return formData;
    });

  if (formDatas.length === 0) {
    // 所有分片已上传 → 直接请求合并
    mergeRequest();
    return;
  }

  // 3. 并发上传分片
  await uploadWithConcurrencyControl(formDatas);
};

/**
 * 带并发控制的分片上传
 * @param {FormData[]} formDatas - 待上传的FormData列表
 */
const uploadWithConcurrencyControl = async (formDatas: FormData[]) => {
  const MAX_CONCURRENT = 6; // 最大并发数（可根据需求调整）
  let currentIndex = 0; // 当前待上传的分片索引
  const taskPool: Promise<void | Response>[] = []; // 存储当前正在执行的请求（请求池）
  while (currentIndex < formDatas.length) {
    // 为每个请求创建独立的中断控制器（AbortController）
    const controller = new AbortController();
    const { signal } = controller;
    abortControllers.value.push(controller); // 存入控制器列表

    // 发起分片上传请求
    const task = fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formDatas[currentIndex],
      signal: signal, // 绑定中断信号
    })
      .then((res) => {
        // 请求完成后，从请求池和控制器列表中移除
        taskPool.splice(taskPool.indexOf(task), 1);
        abortControllers.value = abortControllers.value.filter(
          (c) => c !== controller
        );
        return res;
      })
      .catch((err) => {
        // 捕获错误：区分「用户中断」和「其他错误」
        if (err.name !== "AbortError") {
          console.error("分片上传失败：", err);
          // 可在这里加「错误重试」逻辑（如重试3次）
        }
        // 无论何种错误，都清理状态
        taskPool.splice(taskPool.indexOf(task), 1);
        abortControllers.value = abortControllers.value.filter(
          (c) => c !== controller
        );
      });

    taskPool.push(task);

    // 当请求池满了，等待最快完成的一个请求再继续（释放并发名额）
    if (taskPool.length === MAX_CONCURRENT) {
      await Promise.race(taskPool);
    }

    currentIndex++;
  }

  // 等待所有剩余请求完成
  await Promise.all(taskPool);
  // 所有分片上传完成 → 请求合并
  mergeRequest();
};
```

#### 6. 中断上传

使用 AbortController 中断正在进行的请求，并清理状态，确保中断后下次上传能正常恢复。

```ts [index.vue]
const abortControllers = ref<AbortController[]>([]); // 存储所有请求的中断控制器
/**
 * 中断上传（用户触发）
 */
const handleAbortUpload = () => {
  if (!isUploading.value) return;

  // 1. 中断所有正在进行的请求
  abortControllers.value.forEach((controller) => {
    controller.abort(); // 调用中断方法，触发请求的AbortError
  });

  // 2. 清理状态
  abortControllers.value = [];
  isUploading.value = false;

  // 3. 通知用户
  alert("上传已中断，下次可继续上传");
};
```

#### 7. 完整代码

```vue [index.vue]
<script setup lang="ts">
import { ref } from "vue";
import { createFileChunks, CHUNK_SIZE } from "./utils/fileSlice";
import createHash from "./utils/createHash";

// 上传状态管理
const isUploading = ref(false); // 是否正在上传
const abortControllers = ref<AbortController[]>([]); // 存储所有请求的中断控制器
const fileHash = ref(""); // 文件哈希值
const fileName = ref(""); // 原始文件名（用于取后缀）
// 定义服务器返回的数据类型
interface VerifyResponse {
  data: {
    shouldUpload: boolean;
    existChunks: string[];
  };
}
/**
 * 向服务器校验文件状态
 * @returns {Promise<Object>} 校验结果（shouldUpload: 是否需要上传, existChunks: 已上传分片列表）
 */
const verify = async (): Promise<VerifyResponse> => {
  const res = await fetch("http://localhost:3000/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      fileHash: fileHash.value,
      fileName: fileName.value,
    }),
  });
  return res.json();
};

// 前端：请求合并分片的函数
const mergeRequest = async () => {
  await fetch("http://localhost:3000/merge", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      fileHash: fileHash.value,
      fileName: fileName.value,
      size: CHUNK_SIZE, // 分片大小（用于计算写入位置）
    }),
  });

  // 合并完成后的清理
  isUploading.value = false;
  alert("文件上传完成！");
};

const handleUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target || !target.files) return; // 未选文件则退出
  const file = target.files[0]; // 获取用户选择的单个文件
  fileName.value = file.name;
  const chunks = createFileChunks(file);
  // console.log(chunks, 'chunks');
  fileName.value = file.name;
  fileHash.value = await createHash(chunks, CHUNK_SIZE); // 计算文件哈希

  // 发起校验
  const verifyRes = await verify();

  if (!verifyRes.data.shouldUpload) {
    // 服务器已存在完整文件 → 秒传成功
    alert("秒传成功！文件已存在");
    return;
  }

  // 需上传：进入分片上传环节
  await uploadChunks(chunks, verifyRes.data.existChunks);
};
/**
 * 上传分片
 * @param {Blob[]} chunks - 所有分片数组
 * @param {string[]} existChunks - 已上传的分片标识列表
 */
const uploadChunks = async (chunks: Blob[], existChunks: string[]) => {
  isUploading.value = true;
  abortControllers.value = []; // 清空历史中断控制器

  // 1. 生成所有分片的基础信息（文件哈希、分片标识、分片数据）
  const chunkInfoList = chunks.map((chunk, index) => ({
    fileHash: fileHash.value,
    chunkHash: `${fileHash.value}-${index}`, // 分片标识：文件哈希-序号（确保唯一）
    chunk: chunk,
  }));

  // 2. 过滤已上传的分片 → 只保留待上传的
  const formDatas = chunkInfoList
    .filter((item) => !existChunks.includes(item.chunkHash))
    .map((item) => {
      const formData = new FormData();
      formData.append("filehash", item.fileHash);
      formData.append("chunkhash", item.chunkHash);
      formData.append("chunk", item.chunk); // 分片二进制数据
      return formData;
    });

  if (formDatas.length === 0) {
    // 所有分片已上传 → 直接请求合并
    mergeRequest();
    return;
  }

  // 3. 并发上传分片
  await uploadWithConcurrencyControl(formDatas);
};

/**
 * 带并发控制的分片上传
 * @param {FormData[]} formDatas - 待上传的FormData列表
 */
const uploadWithConcurrencyControl = async (formDatas: FormData[]) => {
  const MAX_CONCURRENT = 6; // 最大并发数（可根据需求调整）
  let currentIndex = 0; // 当前待上传的分片索引
  const taskPool: Promise<void | Response>[] = []; // 存储当前正在执行的请求（请求池）
  while (currentIndex < formDatas.length) {
    // 为每个请求创建独立的中断控制器（AbortController）
    const controller = new AbortController();
    const { signal } = controller;
    abortControllers.value.push(controller); // 存入控制器列表

    // 发起分片上传请求
    const task = fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formDatas[currentIndex],
      signal: signal, // 绑定中断信号
    })
      .then((res) => {
        // 请求完成后，从请求池和控制器列表中移除
        taskPool.splice(taskPool.indexOf(task), 1);
        abortControllers.value = abortControllers.value.filter(
          (c) => c !== controller
        );
        return res;
      })
      .catch((err) => {
        // 捕获错误：区分「用户中断」和「其他错误」
        if (err.name !== "AbortError") {
          console.error("分片上传失败：", err);
          // 可在这里加「错误重试」逻辑（如重试3次）
        }
        // 无论何种错误，都清理状态
        taskPool.splice(taskPool.indexOf(task), 1);
        abortControllers.value = abortControllers.value.filter(
          (c) => c !== controller
        );
      });

    taskPool.push(task);

    // 当请求池满了，等待最快完成的一个请求再继续（释放并发名额）
    if (taskPool.length === MAX_CONCURRENT) {
      await Promise.race(taskPool);
    }

    currentIndex++;
  }

  // 等待所有剩余请求完成
  await Promise.all(taskPool);
  // 所有分片上传完成 → 请求合并
  mergeRequest();
};

/**
 * 中断上传（用户触发）
 */
const handleAbortUpload = () => {
  if (!isUploading.value) return;

  // 1. 中断所有正在进行的请求
  abortControllers.value.forEach((controller) => {
    controller.abort(); // 调用中断方法，触发请求的AbortError
  });

  // 2. 清理状态
  abortControllers.value = [];
  isUploading.value = false;

  // 3. 通知用户
  alert("上传已中断，下次可继续上传");
};
</script>

<template>
  <div class="upload-container">
    <h2>大文件上传演示</h2>
    <input @change="handleUpload" type="file" class="file-input" />
    <!-- 上传中才显示中断按钮 -->
    <button @click="handleAbortUpload" v-if="isUploading" class="abort-btn">
      中断上传
    </button>
  </div>
</template>

<style scoped></style>
```

### 后端实现

安装依赖

```bash
npm install express cors multiparty fs-extra path --save
```

创建 `server.js` 文件，实现文件上传和秒传功能：

```javascript
const express = require("express");
const path = require("path");
const fse = require("fs-extra"); // 文件操作工具（比原生fs更易用）
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors()); // 解决跨域
app.use(bodyParser.json()); // 解析JSON请求体

// 上传根目录（所有分片和完整文件都存在这里）
const UPLOAD_DIR = path.resolve(__dirname, "uploads");
// 确保上传目录存在
fse.ensureDirSync(UPLOAD_DIR);

/**
 * 提取文件名后缀（如："test.pdf" → ".pdf"）
 * @param {string} fileName - 原始文件名
 * @returns {string} 文件后缀
 */
const extractExt = (fileName) => {
  return fileName.slice(fileName.lastIndexOf("."));
};

app.get("/", (req, res) => {
  res.send("欢迎使用文件上传服务");
});

// 校验接口：/verify
app.post("/verify", async (req, res) => {
  const { fileHash, fileName } = req.body;
  // 完整文件路径 = 上传目录 + 文件哈希 + 原文件后缀（确保文件名唯一）
  const completeFilePath = path.resolve(
    UPLOAD_DIR,
    `${fileHash}${extractExt(fileName)}`
  );

  // 1. 检查完整文件是否存在 → 秒传逻辑
  if (fse.existsSync(completeFilePath)) {
    return res.json({
      status: true,
      data: { shouldUpload: false }, // 无需上传
    });
  }

  // 2. 检查已上传的分片 → 断点续传逻辑
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash); // 分片临时目录（用文件哈希命名）
  const existChunks = fse.existsSync(chunkDir)
    ? await fse.readdir(chunkDir) // 已上传的分片列表（如：["a1b2-0", "a1b2-1"]）
    : [];

  res.json({
    status: true,
    data: {
      shouldUpload: true, // 需要上传
      existChunks: existChunks, // 已上传的分片标识，供前端过滤
    },
  });
});

// 后端：/merge 接口（合并分片）
app.post("/merge", async (req, res) => {
  const { fileHash, fileName, size: CHUNK_SIZE } = req.body;
  // 完整文件路径（上传目录 + 文件哈希 + 后缀）
  const completeFilePath = path.resolve(
    UPLOAD_DIR,
    `${fileHash}${extractExt(fileName)}`
  );
  // 分片临时目录
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash);

  // 检查分片目录是否存在（防止恶意请求）
  if (!fse.existsSync(chunkDir)) {
    return res.status(400).json({ status: false, message: "分片目录不存在" });
  }

  // 1. 读取所有分片并按序号排序
  const chunkPaths = await fse.readdir(chunkDir);
  chunkPaths.sort((a, b) => {
    // 从分片标识中提取序号（如："a1b2-0" → 0）
    return parseInt(a.split("-")[1]) - parseInt(b.split("-")[1]);
  });

  // 2. 用流拼接分片（边读边写，低内存占用）
  const mergePromises = chunkPaths.map((chunkName, index) => {
    return new Promise((resolve) => {
      const chunkPath = path.resolve(chunkDir, chunkName);
      const readStream = fse.createReadStream(chunkPath); // 分片读流
      const writeStream = fse.createWriteStream(completeFilePath, {
        start: index * CHUNK_SIZE, // 写入起始位置（精确到字节）
        end: (index + 1) * CHUNK_SIZE, // 写入结束位置
      });

      // 分片读取完成后：删除分片文件 +  resolve
      readStream.on("end", async () => {
        await fse.unlink(chunkPath); // 删除单个分片
        resolve();
      });

      // 管道流：将分片内容写入完整文件
      readStream.pipe(writeStream);
    });
  });

  // 3. 等待所有分片合并完成
  await Promise.all(mergePromises);
  // 4. 删除分片临时目录（合并完成后清理）
  await fse.remove(chunkDir);

  // 响应前端：合并成功
  res.json({ status: true, message: "文件合并成功" });
});

// 后端：/upload 接口（接收分片）
const multiparty = require("multiparty");

app.post("/upload", (req, res) => {
  const form = new multiparty.Form(); // 解析FormData的工具

  // 解析请求（fields：普通字段，files：文件字段）
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("分片解析失败：", err);
      return res.status(400).json({ status: false, message: "分片上传失败" });
    }

    // 提取字段
    const fileHash = fields["filehash"][0]; // 文件哈希
    const chunkHash = fields["chunkhash"][0]; // 分片标识
    const chunkFile = files["chunk"][0]; // 分片临时文件（multiparty生成的临时文件）

    // 分片临时目录（如：uploads/a1b2c3）
    const chunkDir = path.resolve(UPLOAD_DIR, fileHash);
    // 确保临时目录存在
    await fse.ensureDir(chunkDir);

    // 目标路径：将分片从临时位置移动到临时目录
    const targetChunkPath = path.resolve(chunkDir, chunkHash);
    await fse.move(chunkFile.path, targetChunkPath);

    // 响应前端：分片上传成功
    res.json({ status: true, message: "分片上传成功" });
  });
});

// 启动服务器
app.listen(3000, () => {
  console.log("服务器运行在 http://localhost:3000");
});
```

好了，大致思路就是这样的了，但实际开发中，还需要结合业务场景补充异常处理。

### 更多思路

当然,你觉得上面的内容没能让你明白，可以去。

- [超详细的大文件分片上传实战与优化](https://juejin.cn/post/7353106546827624463?searchId=20250825155420FBAD088BDD2D9D35A5FC)。

- [“保姆级”大文件上传教程](https://juejin.cn/post/7385098943942934582?searchId=20250825155420FBAD088BDD2D9D35A5FC)
- [实现大文件上传全流程详解](https://juejin.cn/post/7541307920959029298#heading-17)
