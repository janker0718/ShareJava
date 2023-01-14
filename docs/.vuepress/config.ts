import {defineUserConfig, viteBundler} from "vuepress";
import theme from "./theme.js";
import { searchProPlugin } from "vuepress-plugin-search-pro";
import { autoCatalogPlugin } from "vuepress-plugin-auto-catalog";

export default defineUserConfig({
  base: "/",
  dest: "docs/.vuepress/.dist",
  locales: {
    "/": {
      lang: "zh-CN",
      title: "爪哇干货分享",
      description: "包含: Java 基础，面试小册，Spring源码解析，中间件原理",
    },
  },

  theme,

  shouldPrefetch: false,

  bundler: viteBundler({
    viteOptions: {
      build: {
        chunkSizeWarningLimit: 3000
      }
    },
    vuePluginOptions: {},
  }),

  plugins: [
    searchProPlugin({
      "/": {
        // 覆盖 placeholder
        placeholder: "开始搜索",
      },
      indexContent: true,
      customFields: [
        {
          getter: (page) => page.frontmatter.category,
          formatter: {
            "/": "Category: $content",
            "/zh/": "分类：$content",
          },
        },
        {
          getter: (page) => page.frontmatter.tag,
          formatter: {
            "/": "Tag: $content",
            "/zh/": "标签：$content",
          },
        }
      ],
    }),
    autoCatalogPlugin({
      locales:{
        "zh-CN": {
          title:"目录"
        }
      },
      level: 2,
    }),
  ]
});
