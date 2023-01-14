# 关于文档 - 文档的搭建

作者：janker
<br/>博客：[https://www.share-java.com](https://www.share-java.com)

::: tip To 我
知其然，知其所以然，忙时做业绩，闲时修内功。  @janker
:::

> 目前市面上可以用来搭建博客的方式有很多种，按平台来说，CSDN、简书、博客园、知乎、掘金等，按自己搭建来说Hexo、Docsify、Halo、wordpress等等，每一种断断续续我都用过，但是最后还是选择了github Page + vuepress。  @janker

[[toc]]

## 前言

### 很多选择

目前市面上可以用来搭建博客的方式有很多种，按平台来说，CSDN、简书、博客园、知乎、掘金等，按自己搭建来说Hexo、Docisify、Halo、wordpress等等

### 尝试过那些
- fork 别人的开源系统，做二次开发
- Hexo、Docsify、Halo 利用这些工具自己搭建
- IT 分发平台：博客园等

#### fork 别人的开源系统，做二次开发
基于 github 上开源的 Dblog 源代码，之前搭建的博客网站就是基于这个的，整体功能有：
- markdown 富文本支持
- 评论功能
- seo 优化配置
- 主流 oss 平台配置支持（七牛云、阿里云等）
总体给我的感觉就是，太死板，如果要增加一个功能，太费劲，可玩性不高。

#### Hexo、Docsify、Halo 利用这些工具自己搭建
- Hexo 之前用过，也是基于markdown生成html，也有很多主题可选择，网站好玩的主题都太过非主流了，不喜欢。
- Docsify 很多开源项目都使用这个构建，简单好用，如果单纯写开源使用手册，推荐用这个。
- Halo 使用Java语言开发的开源博客系统，该有的都有，就是比较重。

#### IT 分发平台：博客园等
这些分发平台，作为宣传和吸粉的渠道还是不错的，毕竟流量还是比较大的，但是分发平台的广告什么的比较烦，不喜欢。
### 最终选择vuepress


#### 文档工具vuepresNuxt
VuePress 能做的事情，Nuxt 理论上确实能够胜任，但 Nuxt 是为构建应用程序而生的，而 VuePress 则专注在以内容为中心的静态网站上，同时提供了一些为技术文档定制的开箱即用的特性。

#### Docsify / Docute
这两个项目同样都是基于 Vue，然而它们都是完全的运行时驱动，因此对 SEO 不够友好。如果你并不关注 SEO，同时也不想安装大量依赖，它们仍然是非常好的选择！

#### Hexo
Hexo 一直驱动着 Vue 的文档 —— 事实上，在把我们的主站从 Hexo 迁移到 VuePress 之前，我们可能还有很长的路要走。Hexo 最大的问题在于他的主题系统太过于静态以及过度地依赖纯字符串，而我们十分希望能够好好地利用 Vue 来处理我们的布局和交互，同时，Hexo 的 Markdown 渲染的配置也不是最灵活的。

#### GitBook
我们的子项目文档一直都在使用 GitBook。GitBook 最大的问题在于当文件很多时，每次编辑后的重新加载时间长得令人无法忍受。它的默认主题导航结构也比较有限制性，并且，主题系统也不是 Vue 驱动的。GitBook 背后的团队如今也更专注于将其打造为一个商业产品而不是开源工具。s介绍


## 文档工具 vuepress 介绍
VuePress 由两部分组成：第一部分是一个[极简静态网站生成器](https://github.com/vuejs/vuepress/tree/master/packages/%40vuepress/core)，它包含由 Vue 驱动的主题系统和插件 API，另一个部分是为书写技术文档而优化的默认主题，它的诞生初衷是为了支持 Vue 及其子项目的文档需求。

每一个由 VuePress 生成的页面都带有预渲染好的 HTML，也因此具有非常好的加载性能和搜索引擎优化（SEO）。同时，一旦页面被加载，Vue 将接管这些静态内容，并将其转换成一个完整的单页应用（SPA），其他的页面则会只在用户浏览到的时候才按需加载。

### 它是如何工作的？
事实上，一个 VuePress 网站是一个由 [Vue](http://vuejs.org/) 、[Vue Router](https://github.com/vuejs/vue-router)和 [webpack](http://webpack.js.org/) 驱动的单页应用。如果你以前使用过 Vue 的话，当你在开发一个自定义主题的时候，你会感受到非常熟悉的开发体验，你甚至可以使用 Vue DevTools 去调试你的自定义主题。

在构建时，我们会为应用创建一个服务端渲染（SSR）的版本，然后通过虚拟访问每一条路径来渲染对应的HTML。这种做法的灵感来源于 [Nuxt](https://nuxtjs.org/) 的 `nuxt generate` 命令，以及其他的一些项目，比如 [Gatsby](https://www.gatsbyjs.org/)。



## 文档基础构建

## 文档搭建插件与配置

## 文档构建模板

## vuepress 其他推荐资源

