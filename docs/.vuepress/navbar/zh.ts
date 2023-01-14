import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  {
    text:"首页",
    icon: "home",
    "link": "/",
  },
  { text: "导读", icon: "discover", link: "/md/other/guide-to-reading.md" },
  {
    text: "Java",
    icon: "java",
    children: [
      {
        text: "面试",
        icon: "creative",
        children: [{ text: "面试小册", icon: "read", link: "/md/java/interview/book.md" }],
      }
    ],
  },
  {
    text: "方法|规范",
    icon: "creative",
    children: [
      {
        text: "设计模式",
        icon: "creative",
        children: [{ text: "概述", icon: "info", link: "/md/dev-spec/pattern/1_overview.md" }],
      },
      {
        text: "阿里开发规范",
        icon: "config",
        children: [{ text: "手册", icon: "exercise", link: "/md/dev-spec/code-style/alibaba_code_guide.md" }],
      },
    ],
  },
  {
    text: '日更博文',
    icon: 'article',
    children: [
      {
        text: '分库分表真的有必要吗？',
        link: '/md/tech/2023/01/2023010801.md'
      }
    ]
  },
  {
    text: '关于',
    icon: 'info',
    link: '/md/about/me/about-me.md'
  },
]);
