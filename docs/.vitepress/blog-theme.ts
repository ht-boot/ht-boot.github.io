// 主题独有配置
import { getThemeConfig } from "@sugarat/theme/node";

// 开启RSS支持（RSS配置）
// import type { Theme } from '@sugarat/theme'

// const baseUrl = 'https://sugarat.top'
// const RSS: Theme.RSSOptions = {
//   title: '粥里有勺糖',
//   baseUrl,
//   copyright: 'Copyright (c) 2018-present, 粥里有勺糖',
//   description: '你的指尖,拥有改变世界的力量（大前端相关技术分享）',
//   language: 'zh-cn',
//   image: 'https://img.cdn.sugarat.top/mdImg/MTY3NDk5NTE2NzAzMA==674995167030',
//   favicon: 'https://sugarat.top/favicon.ico',
// }

// 所有配置项，详见文档: https://theme.sugarat.top/
const blogTheme = getThemeConfig({
  works: {
    title: "个人项目/线上作品",
    description: "记录开发的点点滴滴",
    topTitle: "举些🌰",
    list: [
      {
        title: "音乐桌面应用",
        description:
          "桌面应用,基于 electron、vite、react、typescript、antd实现的一个简易音乐平台，支持播放、暂停、上一曲、下一曲、音量调节、歌词展示、播放进度条、播放列表等功能。其余功能会在后续慢慢完善",
        time: {
          start: "2025/08",
        },
        status: {
          text: "demo",
        },
        cover: [
          "https://free.picui.cn/free/2025/09/14/68c6984321f7a.jpg",
          "https://free.picui.cn/free/2025/09/14/68c6992261fa3.jpg",
        ],
        tags: ["electron", "react", "typescript"],
        links: [
          {
            title: "electron、vite、react音乐桌面应用",
            url: "https://github.com/ht-boot/electron-app",
          },
        ],
      },
      {
        title: "个人博客",
        description: "基于 vitepress 实现的博客",
        time: {
          start: "2025/08",
        },
        status: {
          text: "blog",
        },
        cover: [
          "https://free.picui.cn/free/2025/09/04/68b9a75e169c0.jpg",
          "https://free.picui.cn/free/2025/09/04/68b9a75d18349.jpg",
        ],
        tags: ["Vitepress", "Vue"],
        links: [
          {
            title: "基于 vitepress 实现的博客",
            url: "https://github.com/ht-boot/ht-boot.github.io/",
          },
          {
            title: "主题 @sugarat/theme",
            url: "https://github.com/ATQQ/sugar-blog/tree/master/packages",
          },
        ],
      },
      {
        title: "案例demo",
        description: "项目遇到的一些有趣的案例",
        time: {
          start: "2023/05",
        },
        status: {
          text: "demo",
        },
        cover: [
          "https://free.picui.cn/free/2025/09/04/68b9ab4ccf7e6.jpg",
          "https://free.picui.cn/free/2025/09/04/68b9ab4d009f1.jpg",
        ],
        tags: ["Vitepress", "Vue"],
        links: [
          {
            title: "冒泡交融css动画",
            url: "https://github.com/ht-boot/demo/tree/main/animation",
          },
          {
            title: "svg描边动画",
            url: "https://github.com/ht-boot/demo/tree/main/animation",
          },
        ],
      },
    ],
  },
  // 开启RSS支持
  // RSS,
  // 搜索
  // 默认开启pagefind离线的全文搜索支持（如使用其它的可以设置为false）
  // search: false,

  // 默认开启 markdown 图表支持（会增加一定的构建耗时）
  // mermaid: false

  // 页脚
  footer: {
    // message 字段支持配置为HTML内容，配置多条可以配置为数组
    // message: "©2023 taQ | vitepress",
    copyright: "MIT License @vitepress",
  },

  // 主题色修改
  themeColor: "el-blue",

  // 文章默认作者
  author: "taQ",

  // 友链
  friend: [
    {
      nickname: "粥里有勺糖",
      des: "你的指尖用于改变世界的力量",
      avatar:
        "https://img.cdn.sugarat.top/mdImg/MTY3NDk5NTE2NzAzMA==674995167030",
      url: "https://sugarat.top",
    },
    {
      nickname: "Vitepress",
      des: "Vite & Vue Powered Static Site Generator",
      avatar: "https://vitepress.dev/vitepress-logo-large.webp",
      url: "https://vitepress.dev/",
    },
  ],
});

export { blogTheme };
