module.exports = {
    port: "8080",
    dest: "docs/.vuepress/.dist",
    base: "/",
    // 是否开启默认预加载js
    shouldPrefetch: (file, type) => {
        return false;
    },
    // webpack 配置 https://vuepress.vuejs.org/zh/config/#chainwebpack
    chainWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            const dateTime = new Date().getTime();

            // 清除js版本号
            config.output.filename('assets/js/cg-[name].js?v=' + dateTime).end();
            config.output.chunkFilename('assets/js/cg-[name].js?v=' + dateTime).end();

            // 清除css版本号
            config.plugin('mini-css-extract-plugin').use(require('mini-css-extract-plugin'), [{
                filename: 'assets/css/[name].css?v=' + dateTime,
                chunkFilename: 'assets/css/[name].css?v=' + dateTime
            }]).end();

        }
    },
    markdown: {
        lineNumbers: true,
        externalLinks: {
            target: '_blank', rel: 'noopener noreferrer'
        }
    },
    locales: {
        "/": {
            lang: "zh-CN",
            title: "爪哇干货分享",
            description: "包含: Java 基础，面试小册，Spring源码解析，中间件原理"
        }
    },
    head: [
        // ico
        ["link", {rel: "icon", href: `/favicon.ico`}],
        // meta
        ["meta", {name: "robots", content: "all"}],
        ["meta", {name: "author", content: "janker"}],
        ["meta", {"http-equiv": "Cache-Control", content: "no-cache, no-store, must-revalidate"}],
        ["meta", {"http-equiv": "Pragma", content: "no-cache"}],
        ["meta", {"http-equiv": "Expires", content: "0"}],
        ["meta", {
            name: "keywords",
            content: "爪哇干货分享,  中间件, Spring, Java基础, 面试小册"
        }],
        ["meta", {name: "apple-mobile-web-app-capable", content: "yes"}],
        ['script',
            {
                charset: 'utf-8',
                async: 'async',
                // src: 'https://code.jquery.com/jquery-3.5.1.min.js',
                src: '/js/jquery.min.js',
            }],
        ['script',
            {
                charset: 'utf-8',
                async: 'async',
                // src: 'https://code.jquery.com/jquery-3.5.1.min.js',
                src: '/js/global.js',
            }],
        ['script',
            {
                charset: 'utf-8',
                async: 'async',
                src: '/js/fingerprint2.min.js',
            }],
        ['script',
            {
                charset: 'utf-8',
                async: 'async',
                src: 'https://s9.cnzz.com/z_stat.php?id=1278232949&web_id=1278232949',
            }],
        // 添加百度统计
        ["script", {},
            `
              var _hmt = _hmt || [];
              (function() {
                var hm = document.createElement("script");
                hm.src = "https://hm.baidu.com/hm.js?e68b39347be2339192f80082c317901e";
                var s = document.getElementsByTagName("script")[0];
                s.parentNode.insertBefore(hm, s);
              })();
            `
        ]
    ],
    plugins: [
        [
            {globalUIComponents: ['LockArticle', 'PayArticle']}
        ],
        // ['@vssue/vuepress-plugin-vssue', {
        //     platform: 'github-v3', //v3的platform是github，v4的是github-v4
        //     // 其他的 Vssue 配置
        //     owner: 'janker', //github账户名
        //     repo: 'ShareJava', //github一个项目的名称
        //     clientId: 'xxxx',//注册的Client ID
        //     clientSecret: 'xxxxx',//注册的Client Secret
        //     autoCreateIssue: true // 自动创建评论，默认是false，最好开启，这样首次进入页面的时候就不用去点击创建评论的按钮了。
        // }
        // ],
        ['@vuepress/back-to-top', true], //replaced with inject page-sidebar
        ['@vuepress/medium-zoom', {
            selector: 'img:not(.nozoom)',
            // See: https://github.com/francoischalifour/medium-zoom#options
            options: {
                margin: 16
            }
        }],
        // https://v1.vuepress.vuejs.org/zh/plugin/official/plugin-pwa.html#%E9%80%89%E9%A1%B9
        // ['@vuepress/pwa', {
        //     serviceWorker: true,
        //     updatePopup: {
        //         '/': {
        //             message: "发现新内容可用",
        //             buttonText: "刷新"
        //         },
        //     }
        // }],
        // see: https://vuepress.github.io/zh/plugins/copyright/#%E5%AE%89%E8%A3%85
        ['copyright', {
            noCopy: false, // 允许复制内容
            minLength: 30, // 如果长度超过 100 个字符
            authorName: "janker",
        }],
        // see: https://github.com/ekoeryanto/vuepress-plugin-sitemap
        ['sitemap', {
            hostname: 'https://www.share-java.com',
            exclude: ["/404.html"]
        }],
        // see: https://github.com/IOriens/vuepress-plugin-baidu-autopush
        ['vuepress-plugin-baidu-autopush', {}],
        ['vuepress-plugin-comment', // 评论
            {
                choosen: 'gitalk',
                options: {
                    clientID: 'c899568d01c4f7b3093f',
                    clientSecret: 'fc199b8ea734d74fb7b20ef9ef5dc63f9996c372',
                    repo: 'blog-comments', // GitHub 仓库
                    owner: 'janker0718', // GitHub仓库所有者
                    admin: ['janker0718'], // 对仓库有写权限的人
                    // distractionFreeMode: true,
                    pagerDirection: 'last', // 'first'正序 | 'last'倒序
                    id: '<%- (frontmatter.permalink || frontmatter.to.path).slice(-16) %>', //  页面的唯一标识,长度不能超过50
                    title: '「评论」<%- frontmatter.title %>', // GitHub issue 的标题
                    labels: ['Gitalk', 'Comment'], // GitHub issue 的标签
                    body:
                        '页面：<%- window.location.origin + (frontmatter.to.path || window.location.pathname) %>', // GitHub issue 的内容
                },
            },
        ],
        // see: https://github.com/znicholasbrown/vuepress-plugin-code-copy
        ['vuepress-plugin-code-copy', {
            align: 'bottom',
            color: '#3eaf7c',
            successText: '@janker: 代码已经复制到剪贴板'
        }],
        ['vuepress-plugin-export'],
        // see: https://github.com/tolking/vuepress-plugin-img-lazy
        ['img-lazy', {}],
        ["vuepress-plugin-tags", {
            type: 'default', // 标签预定义样式
            color: '#42b983',  // 标签字体颜色
            border: '1px solid #e2faef', // 标签边框颜色
            backgroundColor: '#f0faf5', // 标签背景颜色
            selector: '.page .content__default h1' // ^v1.0.1 你要将此标签渲染挂载到哪个元素后面？默认是第一个 H1 标签后面；
        }],
        // https://github.com/lorisleiva/vuepress-plugin-seo
        ["seo", {
            siteTitle: (_, $site) => $site.title,
            title: $page => $page.title,
            description: $page => $page.frontmatter.description,
            author: (_, $site) => $site.themeConfig.author,
            tags: $page => $page.frontmatter.tags,
            // twitterCard: _ => 'summary_large_image',
            type: $page => 'article',
            url: (_, $site, path) => ($site.themeConfig.domain || '') + path,
            image: ($page, $site) => $page.frontmatter.image && (($site.themeConfig.domain && !$page.frontmatter.image.startsWith('http') || '') + $page.frontmatter.image),
            publishedAt: $page => $page.frontmatter.date && new Date($page.frontmatter.date),
            modifiedAt: $page => $page.lastUpdated,
        }],
    ],
    themeConfig: {
        docsRepo: "janker0718/ShareJava",
        // 编辑文档的所在目录
        docsDir: 'docs',
        // 文档放在一个特定的分支下：
        docsBranch: 'master',
        //logo: "/logo.png",
        editLinks: true,
        sidebarDepth: 0,
        //smoothScroll: true,
        locales: {
            "/": {
                label: "简体中文",
                selectText: "Languages",
                editLinkText: "在 GitHub 上编辑此页",
                lastUpdated: "上次更新",
                nav: [
                    {
                        text: '导读', link: '/md/other/guide-to-reading.md'
                    },
                    {
                        text: 'Java',
                        link: "/md/java/interview/book.md",
                        items: [
                            {
                                text: '面经手册',
                                link: '/md/java/interview/book.md'
                            }
                        ]
                    },
                    {
                        text: '方法|规范',
                        link: '/md/dev-spec/pattern/1_overview.md',
                        items: [
                            {
                                text: '设计模式',
                                link: '/md/dev-spec/pattern/1_overview.md'
                            },
                            {
                                text: '阿里开发规范',
                                link: '/md/dev-spec/code-style/alibaba_code_guide.md'
                            }
                        ]
                    },
                    {
                        text: '日更博文',
                        link: '/md/tech/2023/01/2023010801.md',
                        items: [
                            {
                                text: '分库分表真的有必要吗？',
                                link: '/md/tech/2023/01/2023010801.md'
                            }
                        ]
                    },
                    {
                        text: '关于',
                        link: '/md/about/me/about-me.md'
                    },
                    {
                        text: 'Github',
                        link: 'https://github.com/janker0718/ShareJava'
                    }
                ],
                sidebar: {
                    "/md/other/": genBarOther(),
                    "/md/tech/": genTechOther(),
                    "/md/java/interview/":getJavaInterview(),
                    "/md/about/":getBarAbout(),
                    "/md/dev-spec/":getDevSpec(),
                }
            }
        }
    }
};
// other
function genBarOther() {
    return [
        {
            title: "阅读指南",
            collapsable: false,
            sidebarDepth: 0,
            children: [
                "guide-to-reading.md"
            ]
        }
    ]
}

// 2023 Tech
function genTechOther() {
    return [
        {
            title: "日更博文",
            collapsable: false,
            sidebarDepth: 0,
            children: [
                "2023/01/2023010801.md"
            ]
        }
    ]
}

// java interview
function getJavaInterview() {
    return [
        {
            title: "面试",
            collapsable: false,
            sidebarDepth: 0,
            children: [
                "book.md",
                "resume.md"
            ]
        }
    ]
}

function getBarAbout(){
    return [
        {
            title: "关于",
            collapsable: false,
            sidebarDepth: 0,
            children: [
                "me/about-me.md",
                "me/changelog.md",
                "me/plan.md",
                "me/about-arch.md"
            ]
        },
        {
            title: "关于 - 本文档的构建",
            collapsable: false,
            sidebarDepth: 0,
            children: [
                "blog/build-blog.md"
            ]
        },
        {
            title: "关于 - 读书与持续学习",
            collapsable: false,
            sidebarDepth: 0,
            children: [
                'book/programming-ebook.md'
            ]
        }
    ]
}

function getDevSpec(){
    return [
        {
            title: "设计模式",
            collapsable: false,
            sidebarDepth: 0,
            children: [
                "pattern/1_overview.md",
                "pattern/2_singleton.md",
                "pattern/3_factory.md",
                "pattern/4_abstract_factory.md",
                "pattern/5_factory_method.md",
                "pattern/6_builder.md",
                "pattern/7_prototype.md",
                "pattern/8_adapter.md",
                "pattern/9_bridge.md",
                "pattern/10_filter.md",
                "pattern/11_composite.md",
                "pattern/12_decorator.md",
                "pattern/13_facade.md",
                "pattern/14_flyweight.md",
                "pattern/15_proxy.md",
                "pattern/16_chain_of_responsibility.md",
                "pattern/17_command.md",
                "pattern/18_interpreter.md",
                "pattern/19_Iterator.md",
                "pattern/20_mediator.md",
                "pattern/21.memento.md",
                "pattern/22_observer.md",
                "pattern/23_state.md",
                "pattern/24_null_object.md",
                "pattern/25_strategy.md",
                "pattern/26_template.md",
                "pattern/27_visitor.md",
                "pattern/28_mvc.md",
                "pattern/29_business_delegate.md",
                "pattern/30_composite_entity.md",
                "pattern/31_data_access_object.md",
                "pattern/32_front_controller.md",
                "pattern/33_intercepting_filter.md",
                "pattern/34_service_iocator.md",
                "pattern/35_transfer_object.md",
            ]
        },
        {
            title: "阿里开发规范",
            collapsable: false,
            sidebarDepth: 0,
            children: [
                "code-style/alibaba_code_guide.md"
            ]
        }
    ]
}



