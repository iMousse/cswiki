import type {DefaultTheme} from "vitepress";

export const sidebar: DefaultTheme.Config["sidebar"] = {
    "/src/study":
        [
            {
                text: "学习方法",
                link: "",
                items: [
                    {text: "高效搜索", link: "/src/study/method/01-高效搜索"},
                    {text: "养成好习惯", link: "/src/study/method/02-养成好习惯"},
                    {text: "结构思维", link: "/src/study/method/03-结构思维"},
                    {text: "提升专注力", link: "/src/study/method/04-提升专注力"},
                ]
            }
        ],
    "/src/base/java":
        [
            {text: "Java基础", base: "/src/base/java/", link: "01-Java基础"},
            {text: "Java集合", base: "/src/base/java/", link: "02-Java集合"},
        ],
    "/src/base/jvm":
        [
            {
                text: "JVM",
                base: "/src/base/jvm/",
                collapsed: false,
                items: [
                    {
                        text: "虚拟机基础",
                        items: [
                            {text: "JVM入门", link: "jvm-base"},
                            {text: "字节码与类的加载", link: "jvm-base-bytecode"},
                            {text: "运行时数据区", link: "jvm-base-runtime"},
                            {text: "垃圾回收", link: "jvm-base-gc"},
                        ]
                    },
                    {
                        text: "虚拟机实战",
                        items: [
                            {text: "内存调优", link: "jvm-tuning-memory"},
                            {text: "GC调优", link: "jvm-tuning-gc"},
                            {text: "性能调优", link: "jvm-tuning-function"},
                        ],
                    },
                    {
                        text: "虚拟机高级",
                        items: [
                            {text: "GraalVM", link: "jvm-senior-graal-vm"},
                            {text: "新一代GC", link: "jvm-senior-new-gc"},
                            {text: "Java工具", link: "jvm-senior-java-agent"},
                        ]
                    },
                    {
                        text: "虚拟机原理",
                        link: "jvm-theory",
                        items: []
                    },
                    {
                        text: "虚拟机总结",
                        link: "jvm-summarize",
                    },
                ]
            },


        ],
    "/src/base/juc":
        [
            {
                text: "并发编程",
                base: "/src/base/juc/",
                collapsed: false,
                items: [
                    {text: "并发编程基础", link: "juc-base"},
                    {
                        text: "并发编程理论",
                        base: "/src/base/juc/juc-share-",
                        items: [
                            {text: "共享模型之管程", link: "monitor"},
                            {text: "共享模型之内存", link: "memory"},
                            {text: "共享模型之无锁", link: "nolock"},
                            {text: "共享模型之不可变", link: "final"},
                            {text: "共享模型之无同步方案", link: "nosync"},
                        ]
                    },
                    {
                        text: "并发编程工具",
                        base: "/src/base/juc/juc-tool-",
                        items: [
                            {text: "线程池", link: "pool"},
                            {text: "Locks", link: "locks"},
                            {text: "Tools", link: "tools"},
                            {text: "Atomic", link: "atomic"},
                            {text: "Collections", link: "collections"},
                        ]
                    },
                    {
                        text: "并发编程应用",
                        base: "/src/base/juc/juc-apply-",
                        items: [
                            {text: "同步和异步", link: "sync-async"},
                            {text: "限制", link: "limit"},
                            {text: "互斥", link: "exclusive"},
                            {text: "缓存", link: "cache"},
                            {text: "分治", link: "fork"},
                            {text: "统筹", link: "plan"},
                        ]
                    },
                    {
                        text: "并发编程模式",
                        base: "/src/base/juc/juc-model",
                        items: [
                            {text: "同步模式之保护者暂停", link: "protect"},
                            {text: "同步模式之顺序控制", link: "order"},
                            {text: "同步模式之Balking", link: "balking"},
                            {text: "异步模式之生产者消费者", link: "product"},
                            {text: "异步模式之工作线程", link: "work-queue"},
                            {text: "终止模式之两阶段终止", link: "termination"},
                            {text: "共享模式之享元", link: "flyweight"},
                        ]
                    },
                    {
                        text: "* 并发编程原理",
                        base: "/src/base/juc/juc-theory-",
                        items: [
                            {text: "synchronized原理", link: "synchronized"},
                            {text: "volatile原理", link: "volatile"},
                            {text: "ReentrantLock原理", link: "reentrant-lock"},
                            {text: "读写锁原理", link: "reentrant-read-write-lock"},
                            {text: "Semaphore原理", link: "semaphore"},
                            {text: "ConcurrentMap原理", link: "concurrent-map"},
                            {text: "LinkedBlockingQueue原理", link: "linked-blocking-queue"},
                        ]
                    },
                    {
                        text: "并发编程场景",
                        base: "/src/base/juc/juc-practice",
                        items: [
                            {text: "批量数据导入", link: "batch"},
                        ]
                    },
                ]
            }
        ],
    "/src/base/netty":
        [
            {
                text: "网络编程",
                collapsed: false,
                base: "/src/base/netty/",
                items: [
                    {text: "Java NIO", link: "non-blocking-io"},
                    {
                        text: "Netty", items: [
                            {text: "Netty 基础", link: "netty-base"},
                            {text: "Netty 高级", link: "netty-senior"},
                            {text: "*Netty 源码", link: "netty-code"},
                        ]
                    },
                    {
                        text: "Nginx"
                    },

                ]
            }
        ],
    "/src/base/mysql":
        [
            {
                text: "数据库",
                base: "/src/base/mysql/",
                items: [
                    {text: "MySQL基础", link: "01-MySQL基础"},
                    {
                        text: "MySQL进阶",
                        base: "/src/base/mysql/02-",
                        link: "MySQL进阶",
                        items: [
                            {text: "数据库架构", link: "MySQL进阶-数据库架构"},
                            {text: "索引", link: "MySQL进阶-索引"},
                            {text: "SQL优化", link: "MySQL进阶-SQL优化"},
                            {text: "锁", link: "MySQL进阶-锁"},
                            {text: "InnoDB引擎", link: "MySQL进阶-InnoDB引擎"},
                        ]
                    },
                    {
                        text: "MySQL运维",
                        base: "/src/base/mysql/03-MySQL运维-",
                        items: [
                            {text: "管理工具", link: "管理工具"},
                            {text: "日志文件", link: "日志文件"},
                            {text: "主从复制", link: "主从复制"},
                            {text: "分库分表", link: "分库分表"},
                            {text: "读写分离", link: "读写分离"},
                        ]
                    },
                    {
                        text: "MySQL实践",
                        base: "/src/base/mysql/04-MySQL实践-",
                        items: [
                            {text: "SQL记录", link: "SQL记录"},
                            {text: "SQL练习", link: "SQL练习"},
                        ]
                    },
                ]
            }
        ],
    "/src/base/gof":
        [
            {
                text: "设计模式",
                collapsed: false,
                base: "/src/base/gof/",
                items: [
                    {text: "设计模式入门", link: "01-设计模式入门"},
                    {text: "UML类图", link: "02-UML类图"},
                    {text: "六大原则", link: "03-六大原则"},
                    {text: "创建者模式", link: "04-创建者模式"},
                    {text: "结构者模式", link: "05-结构者模式"},
                    {text: "行为者模式", link: "06-行为者模式"},
                    {text: "设计模式实践", link: "07-设计模式实践"},
                ]
            }
        ],
    "/src/base/spring":
        [
            {
                text: "Spring原理篇",
                collapsed: false,
                base: "/src/base/spring/",
                items: [
                    {text: "Spring-Bean", link: "01-Spring-Bean"},
                    {text: "Spring-AOP", link: "02-Spring-AOP"},
                    {text: "Spring-Boot", link: "03-Spring-Boot"},
                    {text: "Spring-MVC", link: "04-Spring-MVC"},
                    {text: "Spring-Other", link: "05-Spring-Other"},
                ]
            },
            {
                text: "Spring集成篇",
                collapsed: false,
            }
        ],
    "/src/base/cloud":
        [
            {
                text: "Cloud 实用篇",
                base: "/src/base/cloud/",
                collapsed: false,
                items: [
                    {text: "微服务治理", link: "01实用篇-微服务治理"},
                    {text: "容器管理", link: "02实用篇-容器管理"},
                    {text: "异步通信", link: "03实用篇-异步通信"},
                    {text: "文档数据库", link: "04实用篇-文档数据库"},
                    {text: "分布式缓存", link: "06实用篇-分布式缓存"},
                ]
            },
            {
                text: "Cloud 高级篇",
                base: "/src/base/cloud/",
                collapsed: false,
                items: [
                    {text: "分布式搜索", link: "05实用篇-分布式搜索"},
                    {text: "分布式事务", link: "08高级篇-分布式事务"},
                    {text: "微服务保护", link: "07高级篇-微服务保护"},
                    {text: "可靠消息服务", link: "09高级篇-可靠消息服务"},
                    {text: "多级缓存技术", link: "10高级篇-多级缓存技术"},
                    {text: "微服务面试题", link: "11面试篇-微服务面试题"},
                ]
            },
            {
                text: "Cloud 操作篇",
                base: "/src/base/cloud¡/00操作篇-",
                collapsed: false,
                items: [
                    {text: "安装Nacos", link: "安装Nacos"},
                    {text: "安装Seata", link: "安装Seata"},
                    {text: "安装Docker", link: "安装Docker"},
                    {text: "安装Redis", link: "安装Redis"},
                    {text: "安装MQ", link: "安装MQ"},
                    {text: "安装ELK", link: "安装ELK"},
                    {text: "多级缓存案例", link: "多级缓存案例"},
                ]
            }
        ],
    "/src/project/redis":
        [
            {
                text: "黑马点评",
                collapsed: false,
                base: "/src/project/redis/",
                items: [
                    {text: "Redis基础", link: "01-Redis基础"},
                    {
                        text: "Redis实战",
                        base: "/src/project/redis/",
                        items: [
                            {text: "黑马点评", link: "02-Redis实战-黑马点评"},
                            {text: "短信登录", link: "03-Redis实战-短信登录"},
                            {text: "商户查询", link: "04-Redis实战-商户查询"},
                            {text: "* 优惠券秒杀", link: "05-Redis实战-优惠券秒杀"},
                            {text: "达人探店", link: "06-Redis实战-达人探店"},
                            {text: "好友关注", link: "07-Redis实战-好友关注"},
                            {text: "附近商户", link: "08-Redis实战-附近商户"},
                            {text: "用户签到", link: "09-Redis实战-用户签到"},
                            {text: "UV统计", link: "10-Redis实战-UV统计"},
                        ]
                    },
                    {text: "* Redis实践", link: "11-Redis实践"},
                    {
                        text: "* Redis原理",
                        base: "/src/project/redis/",
                        items: [
                            {text: "数据结构", link: "12-Redis原理-数据结构"},
                            {text: "网络模型", link: "13-Redis原理-网络模型"},
                            {text: "内存策略", link: "14-Redis原理-内存策略"},
                        ]
                    },

                ]
            }
        ],
    "/src/project/topnews":
        [
            {
                text: "黑马点评",
                collapsed: false,
                base: "/src/project/topnews/",
                items: [
                    {
                        text: "Day01-初识项目",
                        link: "01-初识项目",
                        items: [
                            {text: "虚拟机导入", link: "00-虚拟机导入"},
                            {text: "自定义部署", link: "00-自定义部署"},
                            {text: "自定义服务", link: "00-自定义服务"},
                        ]
                    },
                    {text: "Day02-文章查看", link: "02-文章查看"},
                    {text: "Day03-文章发布", link: "03-文章发布"},
                    {text: "Day04-文章审核", link: "04-文章审核"},
                    {text: "Day05-延迟发布", link: "05-延迟发布"},
                    {text: "Day06-文章上架", link: "06-文章上架"},
                    {text: "Day07-文章搜索", link: "07-文章搜索"},
                    {text: "Day08-平台管理", link: "08-平台管理"},
                    {text: "Day09-用户行为", link: "09-用户行为"},
                    {text: "Day10-定时计算", link: "10-定时计算"},
                    {text: "Day11-实时计算", link: "11-实时计算"},
                    {text: "Day12-多级缓存", link: "12-多级缓存"},
                    {text: "Day13-持续集成", link: "13-持续集成"},
                    {text: "Day14-项目实战", link: "14-项目实战"},
                ]
            }
        ],
    "/src/project/college":
        [
            {
                text: "天机学堂",
                collapsed: false,
                base: "/src/project/college/",
                items: [
                    {
                        text: "01-初识项目", link: "01-初识项目",
                        items: [
                            {text: "虚拟机导入", link: "00-虚拟机导入"},
                            {text: "自定义部署", link: "00-自定义部署"},
                            {text: "内网穿透", link: "00-内网穿透"},
                        ]
                    },
                    {text: "02-我的课表", link: "02-我的课表"},
                    {text: "03-学习计划", link: "03-学习计划"},
                    {text: "04-学习记录", link: "04-学习记录"},
                    {text: "05-问答系统", link: "05-问答系统"},
                    {text: "06-点赞系统", link: "06-点赞系统"},
                    {text: "07-积分系统", link: "07-积分系统"},
                    {text: "08-排行榜功能", link: "08-排行榜功能"},
                    {text: "09-优惠券管理", link: "09-优惠券管理"},
                    {text: "10-领取优惠券", link: "10-领取优惠券"},
                    {text: "11-优惠券优化", link: "11-优惠券优化"},
                    {text: "12-优惠券使用", link: "12-优惠券使用"},
                    {text: "13-项目部署", link: "13-项目部署"},
                    {text: "14-项目实战", link: "13-项目实战"},
                ]
            }
        ],
    "/src/project/express":
        [
            {
                text: "神领物流",
                collapsed: false,
                base: "/src/project/express/",
                items: [
                    {
                        text: "01-初识项目", link: "01-初识项目",
                        items: [
                            {text: "基础服务", link: "00-基础服务"},
                            {text: "基础工具", link: "00-基础工具"},
                            {text: "常见问题", link: "00-常见问题"},
                        ]
                    },
                    {text: "02-支付服务", link: "02-支付服务"},
                    {text: "03-运费服务", link: "03-运费服务"},
                    {text: "04-路线服务", link: "04-路线服务"},
                    {text: "05-调度服务", link: "05-调度服务"},
                    {text: "06-运输任务", link: "06-运输任务"},
                    {text: "07-作业范围", link: "07-作业范围"},
                    {text: "08-派件调度", link: "08-派件调度"},
                    {text: "09-物流服务", link: "09-物流服务"},
                    {text: "10-持续集成", link: "10-持续集成"},
                    {text: "11-项目运维", link: "11-项目运维"},
                    {text: "12-项目实战", link: "12-项目实战"}
                ]
            }
        ],
    "/src/base/summarize":
        [
            {
                text: "基础知识",
                collapsed: false,
                base: "/src/base/summarize/",
                items: [
                    {text: "Java基础", link: "java-base"},
                    {text: "Java集合", link: "java-collection"},
                    {text: "Java虚拟机", link: "java-virtual"},
                    {text: "并发编程篇", link: "java-concurrent"},
                    {text: "网络编程篇", link: "java-netty"},
                ]
            },
            {
                text: "服务框架",
                collapsed: false,
                base: "/src/base/summarize/",
                items: [
                    {text: "数据库篇", link: "mysql"},
                    {text: "缓存篇", link: "redis"},
                    {text: "框架篇", link: "spring"},
                    {text: "微服务篇", link: "spring-cloud"},
                    {text: "中间件篇", link: "message-queue"},
                ]
            },
            {
                text: "场景技术",
                collapsed: false,
                base: "/src/base/summarize/",
                items: [
                    {text: "设计模式篇", link: "gof"},
                    {text: "场景技术篇", link: "project-practice"},
                    {text: "知识点汇总", link: "index"},
                    {text: "面试准备篇", link: "interview"},
                ]
            },
        ],
}
