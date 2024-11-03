# 黑马点评

[[toc]]



功能介绍
--------

亲爱的小伙伴们大家好，马上咱们就开始实战篇的内容了，相信通过本章的学习，小伙伴们就能理解各种redis的使用啦，接下来咱们来一起看看实战篇我们要学习一些什么样的内容。

完整代码参考：[hm-dianping](https://gitee.com/iMousse/cswiki-project/tree/main/base/redis-hmdp/hm-dianping)

![image-20240313205833162](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313205833162.png)

:::tip 📌 今日课程介绍

* 短信登录
  * 这一块我们会使用 Redis 共享 Session来实现


* 商户查询
  * 理解缓存击穿，缓存穿透，缓存雪崩等问题，让小伙伴的对于这些概念的理解不仅仅是停留在概念上，更是能在代码中看到对应的内容


* 优惠卷秒杀
  * 通过本章节，我们可以学会 Redis 的计数器功能， 结合 Lua 完成高性能的 Redis 操作，同时学会 Redis 分布式锁的原理，包括 Redis 的三种消息队列


* 好友关注
  * 基于Set集合的关注、取消关注，共同关注等等功能，这一块知识咱们之前就讲过，这次我们在项目中来使用一下

* 达人探店
  * 基于 List 来完成点赞列表的操作，同时基于 SortedSet 来完成点赞的排行榜功能

* 附近的商户
  * 我们利用 Redis 的 GEOHash 来完成对于地理坐标的操作

* 用户签到
  * 使用 Redis 的 BitMap 数据统计功能
* UV统计
  * 主要是使用 Redis 来完成统计功能

:::



## 导入项目

### 导入SQL

导入提供的SQL文件：[hm.sql (gitee.com)](https://gitee.com/iMousse/cswiki-project/blob/main/demo/redis/hm-dianping/src/main/resources/db/hmdp.sql)

**其中的表有**：

- tb_user：用户表
- tb_user_info：用户详情表
- tb_shop：商户信息表
- tb_shop_type：商户类型表
- tb_blog：用户日记表（达人探店日记）
- tb_follow：用户关注表
- tb_voucher：优惠券表
- tb_voucher_order：优惠券的订单表

注意：MySQL的版本采用5.7以及以上版本

<br/>

### 有关当前模型

手机或者app端发起请求，请求我们的nginx服务器，nginx基于七层模型走的是HTTP协议，可以实现基于Lua直接绕开tomcat访问redis，也可以作为静态资源服务器，轻松扛下上万并发， 负载均衡到下游tomcat服务器，打散流量，我们都知道一台4核8G的tomcat，在优化和处理简单业务的加持下，大不了就处理1000左右的并发， 经过nginx的负载均衡分流后，利用集群支撑起整个项目，同时nginx在部署了前端项目后，更是可以做到动静分离，进一步降低tomcat服务的压力，这些功能都得靠nginx起作用，所以nginx是整个项目中重要的一环。

在Tomcat支撑起并发流量后，我们如果让Tomcat直接去访问Mysql，根据经验Mysql企业级服务器只要上点并发，一般是16或32 核心cpu，32 或64G内存，像企业级mysql加上固态硬盘能够支撑的并发，大概就是4000起~7000左右，上万并发， 瞬间就会让Mysql服务器的cpu，硬盘全部打满，容易崩溃，所以我们在高并发场景下，会选择使用mysql集群，同时为了进一步降低Mysql的压力，同时增加访问的性能，我们也会加入Redis，同时使用Redis集群使得Redis对外提供更好的服务。

![image-20240313210807605](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313210807605.png)

<br/>

### 导入后端项目

在资料中提供了一个项目源码：

[redis/hm-dianping (gitee.com)](https://gitee.com/iMousse/cswiki-project/tree/main/demo/redis/hm-dianping)

<br/>

启动项目后，如果可以看到数据则证明运行没有问题。

浏览器访问：http://localhost:8081/shop-type/list 

<br/>

![image-20240313212033177](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313212033177.png)

<br/>

**展示数据**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "美食",
            "icon": "/types/ms.png",
            "sort": 1
        },
        {
            "id": 2,
            "name": "KTV",
            "icon": "/types/KTV.png",
            "sort": 2
        },
        {
            "id": 3,
            "name": "丽人·美发",
            "icon": "/types/lrmf.png",
            "sort": 3
        },
        {
            "id": 10,
            "name": "美睫·美甲",
            "icon": "/types/mjmj.png",
            "sort": 4
        },
        {
            "id": 5,
            "name": "按摩·足疗",
            "icon": "/types/amzl.png",
            "sort": 5
        },
        {
            "id": 6,
            "name": "美容SPA",
            "icon": "/types/spa.png",
            "sort": 6
        },
        {
            "id": 7,
            "name": "亲子游乐",
            "icon": "/types/qzyl.png",
            "sort": 7
        },
        {
            "id": 8,
            "name": "酒吧",
            "icon": "/types/jiuba.png",
            "sort": 8
        },
        {
            "id": 9,
            "name": "轰趴馆",
            "icon": "/types/hpg.png",
            "sort": 9
        },
        {
            "id": 4,
            "name": "健身运动",
            "icon": "/types/jsyd.png",
            "sort": 10
        }
    ]
}
```

<br/>

### 导入前端项目

#### Windows导入

获取资料nginx文件夹：[redis/nginx-1.18.0.zip (gitee.com)](https://gitee.com/iMousse/cswiki-project/blob/main/demo/redis/nginx-1.18.0.zip)

将其复制到任意目录，要确保该目录不包含中文、特殊字符和空格，例如：

![image-20240313213205381](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313213205381.png)

<br/>

**运行项目**：http://127.0.0.1:8080

![image-20240313214950681](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313214950681.png)

<br/>

#### Mac系统导入

项目启动

```sh
#启动nginx  端口8080
[mousse@MacBookAir ~]$ sudo nginx

[mousse@MacBookAir ~]$ sudo nginx -s stop

[mousse@MacBookAir ~]$ sudo nginx -s reload

[mousse@MacBookAir ~]$ brew info nginx

[mousse@MacBookAir ~]$ brew services info nginx

[mousse@MacBookAir ~]$ vim /opt/homebrew/etc/nginx/nginx.conf

[mousse@MacBookAir ~]$ brew services stop nginx 
Stopping `nginx`... (might take a while)
==> Successfully stopped `nginx` (label: homebrew.mxcl.nginx)
[mousse@MacBookAir ~]$ brew services start nginx
==> Successfully started `nginx` (label: homebrew.mxcl.nginx)
[mousse@MacBookAir ~]$ brew services restart nginx
Stopping `nginx`... (might take a while)
==> Successfully stopped `nginx` (label: homebrew.mxcl.nginx)
==> Successfully started `nginx` (label: homebrew.mxcl.nginx)
[mousse@MacBookAir ~]$ brew services reload nginx 
Stopping `nginx`... (might take a while)
==> Successfully stopped `nginx` (label: homebrew.mxcl.nginx)
==> Successfully started `nginx` (label: homebrew.mxcl.nginx)
```

nignx.conf

```nginx
worker_processes  1;

error_log  logs/error.log  info;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/json;

    sendfile        on;

    server {
        listen       8080;
        server_name  localhost;
        # 指定前端项目所在的位置
        location / {
            root   html/hmdp;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

        location /imgs {
             alias /opt/homebrew/var/www/hmdp/imgs/;
             autoindex on;
        }

        location /api {  
            default_type  application/json;
            #internal;  
            keepalive_timeout   30s;  
            keepalive_requests  1000;  
            #支持keep-alive  
            proxy_http_version 1.1;  
            rewrite /api(/.*) $1 break;  
            proxy_pass_request_headers on;
            #more_clear_input_headers Accept-Encoding;  
            proxy_next_upstream error timeout;  
            proxy_pass http://127.0.0.1:8081;
        }
    }

}
```

