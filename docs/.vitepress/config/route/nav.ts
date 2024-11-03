import type {DefaultTheme} from 'vitepress';

export const nav: DefaultTheme.Config['nav'] = [
    {text: '📌 技术博客', link: '/'},
    {
        text: '📝 基础知识',
        items: [
            {
                items: [
                    {text: "☕️ Java基础", link: "/src/base/java/index"},
                    {text: "🖥 JVM入门", link: "/src/base/jvm/index"},
                    {text: "🔥 并发编程", link: "/src/base/juc/index"},
                    {text: "🌐 网络编程", link: "/src/base/netty/index"},
                ],
            },
            {
                items: [
                    {text: "🧩 数据结构", link: "/src/base/alg/index"},
                    {text: "📝 设计模式", link: "/src/base/gof/index"},
                ],
            },
            {
                items: [
                    {text: "📊 数据库", link: "/src/base/mysql/index"},
                    {text: "👨‍💻 服务器", link: "/src/base/linux/index"},
                    {text: "🌱 Spring", link: "/src/base/spring/index"},
                    {text: "☁️ 微服务", link: "/src/base/cloud/index"},
                ],
            }

        ],
        // 当前页面处于匹配路径下时, 对应导航菜单将突出显示
        activeMatch: '/src/base'
    },
    {
        text: '🛠️ 项目实战',
        items: [
            {
                items: [
                    {text: "🔖️ 黑马点评", link: "/src/project/redis/index"},
                    {text: "📰 黑马头条", link: "/src/project/topnews/index"},
                ],
            },
            {
                items: [
                    {text: "📚 天机学堂", link: "/src/project/college/index"},
                    {text: "🚚 神领物流", link: "/src/project/express/index"},
                    {text: "🛒 谷粒商城", link: "/src/project/shop/index"},
                ]
            },
            {
                items: [
                    {text: "🍜 谷粒外卖", link: "/src/project/takeout/index"},
                    {text: "🏄 谷粒健康", link: "/src/project/health/index"},
                    {text: "🧑‍🤝‍🧑 谷粒交友", link: "/src/project/social/index"},
                    {text: "🏠 谷粒租房", link: "/src/project/rent/index"},
                    {text: "📈 谷粒金融", link: "/src/project/financial/index"}
                ]
            },
        ],
        activeMatch: '/src/project'
    },
    {
        text: '💼 面试宝典', link: '/src/summarize/index', activeMatch: '/src/summarize',
    }

];
