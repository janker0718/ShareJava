import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    {
      icon: "note",
      text: "每日博文",
      prefix: "md/tech/",
      link: "md/tech/",
      children: "structure",
      collapsible: true,
    },{
      text: "Java相关",
      icon: "java",
      prefix: "md/java/",
      children: "structure",
      collapsible: true,
    },{
      text: "开发规范",
      icon: "launch",
      prefix: "md/dev-spec/",
      children: "structure",
      collapsible: true,
    },{
      text: "源码分析",
      icon: "vssue",
      prefix: "md/framework/",
      children: "structure",
      collapsible: true,
    },{
      text: "关于",
      icon: "info",
      prefix: "md/about/",
      children: "structure",
      collapsible: true,
    }
  ],
});
