import { defineConfig } from "vitepress";

// 导入主题的配置
import { blogTheme } from "./blog-theme";

// 如果使用 GitHub/Gitee Pages 等公共平台部署
// 通常需要修改 base 路径，通常为“/仓库名/”
// 如果项目名已经为 name.github.io 域名，则不需要修改！
// const base = process.env.GITHUB_ACTIONS === 'true'
//   ? '/vitepress-blog-sugar-template/'
//   : '/'

// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  // 继承博客主题(@sugarat/theme)
  extends: blogTheme,
  base: "/",
  lang: "zh-cn",
  title: "taQ",
  // titleTemplate: "my blog",
  description: "taQ,基于 vitepress 实现",
  lastUpdated: true,
  // 详见：https://vitepress.dev/zh/reference/site-config#head
  head: [
    // 配置网站的图标（显示在浏览器的 tab 上）
    // ['link', { rel: 'icon', href: `${base}favicon.ico` }], // 修改了 base 这里也需要同步修改
    ["link", { rel: "icon", href: "/favicon.ico" }],
    [
      "meta",
      {
        name: "keywords",
        content: "HTML, CSS, JavaScript, vue, vitepress, vuepress, 博客, blog",
      },
    ],
  ],
  themeConfig: {
    // 展示 2,3 级标题在目录中
    outline: {
      level: [2, 3],
      label: "目录",
    },
    // 默认文案修改
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "相关文章",
    lastUpdatedText: "上次更新于",
    // 设置logo
    logo: "/avatar.jpg",
    nav: [
      { text: "首页", link: "/" },
      { text: "关于作者", link: "/pages/aboutme" },
      // 二级导航
      {
        text: "知识库",
        items: [
          { text: "博客创建", link: `/pages/notice/quickStart` },
          { text: "工具推荐", link: `/pages/notice/tool` },
        ],
      },
      {
        text: "前端",
        items: [
          { text: "typescript", link: `/pages/knowledge_base/typescript` },
          { text: "javascript", link: `/pages/javascript/javascript` },
          { text: "react", link: `/pages/react/react` }
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "",
      },
    ],
  },
});
