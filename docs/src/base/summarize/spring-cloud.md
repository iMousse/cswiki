# 微服务篇
[返回首页](index.md)

**SpringCloud**

- Spring Cloud 5大组件有哪些？
- 服务注册和发现是什么意思？Spring Cloud 如何实现服务注册发现？
- 我看你之前也用过nacos、你能说下nacos与eureka的区别？
- 你们项目负载均衡如何实现的 ? 
- Ribbon负载均衡策略有哪些 ? 
- 如果想自定义负载均衡策略如何实现 ? 
- 什么是服务雪崩，怎么解决这个问题？
- 你们的微服务是怎么监控的？
- 你们项目中有没有做过限流 ? 怎么做的 ?

<br/>


**业务相关**

- 限流常见的算法有哪些呢？
- 什么是CAP理论？
- 为什么分布式系统中无法同时保证一致性和可用性？
- 什么是BASE理论？
- 你们采用哪种分布式事务解决方案？
- 分布式服务的接口幂等性如何设计？
- xxl-job路由策略有哪些？
- xxl-job任务执行失败怎么解决？
- 如果有大数据量的任务同时都需要执行，怎么解决？

[微服务入门到精通](../struct/cloud/index.md)



SpringCloud
-----------

### 常见组件

> 提问：Spring Cloud 组件有哪些

![image-20231220094730443](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220094730443.png)

早期我们一般认为的Spring Cloud五大组件是 

- 注册中心 `Eureka`
- 负载均衡 `Ribbon`
- 服务调用 `Feign`
- 服务保护 `Hystrix`
- 服务网关 `Zuul`

随着SpringCloudAlibba在国内兴起 , 我们项目中使用了一些阿里巴巴的组件 

- 注册中心 `Nacos`
- 服务保护 `Sentinel`
- 服务网关 `Gateway`

<br/>

### 服务注册

> 面试官：服务注册和发现是什么意思？Spring Cloud如何实现服务注册发现？

- 微服务中必须要使用的组件，考察我们使用微服务的程度
- 注册中心的核心作用是：服务注册和发现
- 常见的注册中心：eureka、nocas、zookeeper

![image-20231220095517800](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220095517800.png)

<br/>

回答要点

- 我们当时项目采用的eureka作为注册中心，这个也是spring cloud体系中的一个核心组件
- **服务注册**：服务提供者需要把自己的信息注册到eureka，由eureka来保存这些信息，比如服务名称、ip、端口等等
- **服务发现**：消费者向eureka拉取服务列表信息，如果服务提供者有集群，则消费者会利用负载均衡算法，选择一个发起调用
- **服务监控**：服务提供者会每隔30秒向eureka发送心跳，报告健康状态，如果eureka服务90秒没接收到心跳，从eureka中剔除

<br/>

> 面试官：我看你之前也用过nacos、你能说下nacos与eureka的区别？

![image-20231220095931455](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220095931455.png)

<br/>

Nacos与Eureka的共同点（注册中心）

- 都支持服务注册和服务拉去
- 都支持服务提供者心跳方式做健康检测

Nacos与Eureka的区别（注册中心）

- Nacos支持服务端主动检测提供者状态：临时实例采用心跳模式，非临时实例采用主动检测模式
- 临时实例心跳不正常会被剔除，非临时实例则不会被剔除
- Nacos支持服务列表变更的消息推送模式，服务列表更新更及时
- Nacos集群默认采用AP方式，当集群中存在非临时实例时，采用CP模式；Eureka采用AP方式
- Nacos还支持配置中心，Eureka只有注册中心，这也是选择使用Nacos的一个重要原因。

<br/>

### 负载均衡

> 面试官：你们项目中负载均衡如何实现的？

- 负载均衡Ribbon，发起远程调用feign就会使用Ribbon
- Ribbon负载均衡策略有哪些？
- 如果想自定义负载均衡策略如何实现？

<br/>

**负载均衡流程**

![image-20231220102615068](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220102615068.png)

<br/>

**负载均衡策略**

- `RoundRobinRule`：简单轮询服务列表来选择服务器
- `WeightedResponseTimeRule`：按照权重来选择服务器，响应时间越长，权重越小
- `RandomRule`：随机选择一个可用的服务器
- `BestAvailableRule`：忽略那些短路的服务器，并选择并发数较低的服务器
- `RetryRule`：重试机制的选择逻辑
- `AvailabilityFilteringRule`：可用性敏感策略，先过滤非健康的，再选择连接数较小的实例
- `ZoneAvoidanceRule`：以区域可用的服务器为基础进行服务器的选择。使用Zone对服务器进行分类，这个Zone可以理解为一个机房、一个机架等。而后再对Zone内的多个服务做轮询。

<br/>

如何自定义负载均衡策略？

- 可以自己创建类实现IRule接口 , 然后再通过配置类或者配置文件配置即可 ，通过定义IRule实现可以修改负载均衡规则，有两种方式：

  ![image-20231220102907803](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220102907803.png)

  

<br/>

:::warning 💡思考：你们项目负载均衡如何实现的 ? 

在服务调用过程中的负载均衡一般使用SpringCloud的Ribbon 组件实现  , Feign的底层已经自动集成了Ribbon  , 使用起来非常简单

当发起远程调用时，ribbon先从注册中心拉取服务地址列表，然后按照一定的路由策略选择一个发起远程调用，一般的调用策略是轮询

<br/>

💡**思考：Ribbon负载均衡策略有哪些 ?** 

- RoundRobinRule：简单轮询服务列表来选择服务器

- WeightedResponseTimeRule：按照权重来选择服务器，响应时间越长，权重越小

- RandomRule：随机选择一个可用的服务器

- ZoneAvoidanceRule：区域敏感策略，以区域可用的服务器为基础进行服务器的选择。使用Zone对服务器进行分类，这个Zone可以理解为一个机房、一个机架等。而后再对Zone内的多个服务做轮询(默认)

<br/>

💡**思考：如果想自定义负载均衡策略如何实现 ?** 

提供了两种方式：

1. 创建类实现IRule接口，可以指定负载均衡策略，这个是全局的，对所有的远程调用都起作用

2. 在客户端的配置文件中，可以配置某一个服务调用的负载均衡策略，只是对配置的这个服务生效远程调用

:::

<br/>

### 服务雪崩

> 面试官：什么是服务雪崩，怎么解决这个问题？

- 什么是服务雪崩？
- 熔断降级（解决）？ Hystix 服务熔断降级
- 限流 （预防）

<br/>

**服务雪崩**

![image-20231220103604441](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220103604441.png)

<br/>

**服务降级**

服务降级是服务自我保护的一种方式，或者保护下游服务的一种方式，用于确保服务不会受请求突增影响变得不可用，确保服务不会崩溃。

![image-20231220103718711](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220103718711.png)

<br/>

**服务熔断**

Hystrix 熔断机制，用于监控微服务调用情况， 默认是关闭的，如果需要开启需要在引导类上添加注解：@EnableCircuitBreaker如果检测到 10 秒内请求的失败率超过 50%，就触发熔断机制。之后每隔 5 秒重新尝试请求微服务，如果微服务不能响应，继续走熔断机制。如果微服务可达，则关闭熔断机制，恢复正常请求。

![image-20231220103918096](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220103918096.png)

<br/>

:::warning 💡思考：什么是服务雪崩，怎么解决这个问题？

- 服务雪崩：指一个服务失败，导致整条链路的服务都失败的情形，一般我们在项目解决的话就是两种方案，第一个是服务降级，第二个是服务熔断，如果流量太大的话，可以考虑限流。

- 服务降级：服务自我保护的一种方式，或者保护下游服务的一种方式，用于确保服务不会受请求突增影响变得不可用，确保服务不会崩溃，一般在实际开发中与feign接口整合，编写降级逻辑。

- 服务熔断：默认关闭，需要手动打开，如果检测到 10 秒内请求的失败率超过 50%，就触发熔断机制。之后每隔 5 秒重新尝试请求微服务，如果微服务不能响应，继续走熔断机制。如果微服务可达，则关闭熔断机制，恢复正常请求。

:::

<br/>

### 服务监控

> 面试官：你们的微服务是怎么监控的？

![image-20231220111629065](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220111629065.png)

<br/>

**Skywalking**

一个分布式系统的应用程序性能监控工具 `Application Performance Managment` ，提供了完善的链路追踪能力， `Apache` 的顶级项目（前华为产品经理吴晟主导开源）。

- 服务（service）：业务资源应用系统（微服务）
- 端点（endpoint）：应用系统对外暴露的功能接口（接口）
- 实例（instance）：物理机

![image-20231220111844099](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220111844099.png)

<br/>

:::warning 💡思考：你们的微服务是怎么监控的？

我们项目中采用的 `skywalking` 进行监控的

skywalking主要可以监控接口、服务、物理实例的一些状态。特别是在压测的时候可以看到众多服务中哪些服务和接口比较慢，我们可以针对性的分析和优化。

我们还在 `skywalking` 设置了告警规则，特别是在项目上线以后，如果报错，我们分别设置了可以给相关负责人发短信和发邮件，第一时间知道项目的bug情况，第一时间修复。

:::

<br/>

### 流量控制

> 面试官：你们项目中有没有做过限流？怎么做的？

为什么需要限流？

- 并发的量大（突发接口）
- 防止用户恶意刷接口

<br/>

限流的实现方式

- tomcat：设置最大连接数
- Nginx：漏桶算法
- 网关：令牌桶算法
- 自定义拦截器

<br/>

**Tomcat实现方式**：设置最大连接数

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220112442477.png)

<br/>

**Nignx限流**：控制速率（突发流量）

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220112718133.png)

语法：`limit_req_zone key zone rate `

- `key`：定义限流对象，
- `binary_remote_addr` ：就是一种key，基于客户端ip限流
- `Zone`：定义共享存储区来存储访问信息，10m可以存储16wip地址访问信息
- `Rate`：最大访问速率，rate=10r/s  表示每秒最多请求10个请求
- `burst = 20`：相当于桶的大小
- `Nodelay`：快速处理

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220112926535.png)

控制并发连接数

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220113010591.png)

- `limit_conn perip 20`：对应的 key 是 `$binary_remote_addr`，表示限制单个IP同时最多能持有20个连接。
- `limit_conn perserver 100`：对应的 key 是` $server_name` ，表示虚拟主机(server) 同时能处理并发连接的总数。

<br/>

**网关限流**

`yml` 配置文件中，微服务路由设置添加局部过滤器 `RequestRateLimiter`

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220113227462.png)

- `key-resolver `：定义限流对象（ ip 、路径、参数），需代码实现，使用spel表达式获取
- `replenishRate` ：令牌桶每秒填充平均速率。
- `urstCapacity` ：令牌桶总容量。

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220113358958.png)

<br/>

:::warning 💡思考：你们项目中有没有做过限流 ?

我当时做的xx项目，采用就是微服务的架构，因为xx因为，应该会有突发流量，最大QPS可以达到2000，但是服务支撑不住，我们项目都通过压测最多可以支撑1200QPS。因为我们平时的QPS也就不到100，为了解决这些突发流量，所以采用了限流。

- 【版本1】我们当时采用的nginx限流操作，nginx使用的漏桶算法来实现过滤，让请求以固定的速率处理请求，可以使流量的访问更加平滑，我们控制的速率是按照ip进行限流，限制的流量是每秒20

- 【版本2】我们当时采用的是spring cloud gateway中支持局部过滤器RequestRateLimiter来做限流，使用的是令牌桶算法，可以应对突发流量，可以根据ip或路径进行限流，可以设置每秒填充平均速率，和令牌桶总容量

<br/>

💡**思考：限流常见的算法有哪些呢？**

比较常见的限流算法有漏桶算法和令牌桶算法

漏桶算法是把请求存入到桶中，以固定速率从桶中流出，可以让我们的服务做到绝对的平均，起到很好的限流效果

令牌桶算法在桶中存储的是令牌，按照一定的速率生成令牌，每个请求都要先申请令牌，申请到令牌以后才能正常请求，也可以起到很好的限流作用

它们的区别是，漏桶和令牌桶都可以处理突发流量，其中漏桶可以做到绝对的平滑，令牌桶有可能会产生突发大量请求的情况，一般nginx限流采用的漏桶，spring cloud gateway中可以支持令牌桶算法

:::

业务相关
--------

### 幂等性设计

> 面试官：分布式服务的接口幂等性如何设计？

幂等：多次调用方法或者接口不会改变业务状态，可以保证调用的结果和单次调用结果一致。

需要幂等场景

- 用户重复点击（网络波动）
- MQ消息重复
- 应用使用失败或超时重试机制

<br/>

**接口幂等**

基于RESTful API的角度对部分常见类型请求的幂等性特点进行分析

![image-20231220140440921](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220140440921.png)

```sql
-- 幂等
update t_item set money = 500 where id = 1;
--  不是幂等
update t_item set money = money + 500 where id = 1;
```

幂等的方案

- 数据库唯一索引：新增
- token + redis ：新增、修改
- 分布式锁：新增、修改

<br/>

**token + redis**：创建商品、提交订单、转账、支付等操作。

![image-20231220140922008](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220140922008.png)

<br/>

分布式锁：

![image-20231220140942345](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220140942345.png)



回答要点：分布式服务的接口幂等性如何设计？

幂等：多次调用方法或者接口不会改变业务状态，可以<mark>保证重复调用的结果和单次调用的结果一致</mark>

- 新增数据：使用数据库的唯一索引
- 新增或修改：
  - 分布式锁，性能较低
  - token + redis 实现，性能较好
    - 第一次请求，生成一个唯一 token 存入 redis，返回给前端
    - 第二次请求，业务处理，携带之前的 token，到 redis 进行验证；如果存在，则执行业务并删除token；如果不存在则直接返回，不处理业务。

<br/>

:::warning 💡思考：分布式服务的接口幂等性如何设计？

我们当时有一个xx项目的下单操作，采用的token+redis实现的，流程是这样的

第一次请求，也就是用户打开了商品详情页面，我们会发起一个请求，在后台生成一个唯一token存入redis，key就是用户的id，value就是这个token，同时把这个token返回前端

第二次请求，当用户点击了下单操作会后，会携带之前的token，后台先到redis进行验证，如果存在token，可以执行业务，同时删除token；如果不存在，则直接返回，不处理业务，就保证了同一个token只处理一次业务，就保证了幂等性

:::

<br/>

### 分布式事务

> 面试官：解释一下CAP和BASE

- 分布式事务方案的指导
- 分布式系统设计方案
- 根据业务指导使用正确的技术选择

<br/>

**CAP定理**

1998年，加州大学的计算机科学家 Eric Brewer 提出，分布式系统有三个指标：

- Consistency（一致性）
- Availability（可用性）
- Partition tolerance （分区容错性）

Eric Brewer 说，分布式系统无法同时满足这三个指标。这个结论就叫做 CAP 定理。

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220113803618.png)

<br/>

Consistency（一致性）：用户访问分布式系统中的任意节点，得到的数据必须一致

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220113909788.png)

<br/>

Availability （可用性）：用户访问集群中的任意健康节点，必须能得到响应，而不是超时或拒绝

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220113947530.png)

<br/>

Partition（分区）：因为网络故障或其它原因导致分布式系统中的部分节点与其它节点失去连接，形成独立分区。

Tolerance（容错）：在集群出现分区时，整个系统也要持续对外提供服务。

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220114100872.png)

**结论**：分布式系统节点之间肯定是需要网络连接的，分区（P）是必然存在的。

- 如果保证访问的高可用性（A）,可以持续对外提供服务，但不能保证数据的强一致性 —>  `AP`

- 如果保证访问的数据强一致性（C）,就要放弃高可用性   —> `CP`


<br/>

**BASE理论**

BASE理论是对CAP的一种解决思路，包含三个思想：

- Basically Available （基本可用）：分布式系统在出现故障时，允许损失部分可用性，即保证核心可用。
- Soft State（软状态）：在一定时间内，允许出现中间状态，比如临时的不一致状态。
- Eventually Consistent（最终一致性）：虽然无法保证强一致性，但是在软状态结束后，最终达到数据一致。

![image-20231220114232720](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220114232720.png)



<br/>

:::warning 💡思考：什么是CAP理论？

CAP主要是在分布式项目下的一个理论。包含了三项，一致性、可用性、分区容错性

- 一致性(Consistency)是指更新操作成功并返回客户端完成后，所有节点在同一时间的数据完全一致(强一致性)，不能存在中间状态。

- 可用性(Availability) 是指系统提供的服务必须一直处于可用的状态，对于用户的每一个操作请求总是能够在有限的时间内返回结果。

- 分区容错性(Partition tolerance) 是指分布式系统在遇到任何网络分区故障时，仍然需要能够保证对外提供满足一致性和可用性的服务，除非是整个网络环境都发生了故障。

<br/>

💡**思考：为什么无法同时保证一致性和可用性？**

首先一个前提，对于分布式系统而言，分区容错性是一个最基本的要求，因此基本上我们在设计分布式系统的时候只能从一致性（C）和可用性（A）之间进行取舍。

- 如果保证了一致性（C）：对于节点N1和N2，当往N1里写数据时，N2上的操作必须被暂停，只有当N1同步数据到N2时才能对N2进行读写请求，在N2被暂停操作期间客户端提交的请求会收到失败或超时。显然，这与可用性是相悖的。

- 如果保证了可用性（A）：那就不能暂停N2的读写操作，但同时N1在写数据的话，这就违背了一致性的要求。

<br/>

💡**思考：什么是BASE理论？**

BASE是CAP理论中AP方案的延伸，核心思想是即使无法做到强一致性（`StrongConsistency`，CAP的一致性就是强一致性），但应用可以采用适合的方式达到最终一致性（`Eventual Consitency`）。它的思想包含三方面：

- `Basically Available`（基本可用）：基本可用是指分布式系统在出现不可预知的故障的时候，允许损失部分可用性，但不等于系统不可用。
- `Soft state`（软状态）：即是指允许系统中的数据存在中间状态，并认为该中间状态的存在不会影响系统的整体可用性，即允许系统在不同节点的数据副本之间进行数据同步的过程存在延时。
- `Eventually consistent`（最终一致性）：强调系统中所有的数据副本，在经过一段时间的同步后，最终能够达到一个一致的状态。其本质是需要系统保证最终数据能够达到一致，而不需要实时保证系统数据的强一致性。

:::

<br/>

> 面试官：你们采用哪种分布式事务解决方案？ 

- 简历上写的是微服务项目
- Seata框架（XA，AT，TCC）
- 通过本地消息表实现的分布式事务
- 通过消息系统实现分布式事务的最终一致性

<br/>

**Seata框架**

Seata事务管理中有三个重要的角色：

- `TC (Transaction Coordinator) `事务协调者：维护全局和分支事务的状态，协调全局事务提交或回滚。
- `TM (Transaction Manager) `事务管理器：定义全局事务的范围、开始全局事务、提交或回滚全局事务。
- `RM (Resource Manager) `资源管理器：管理分支事务处理的资源，与TC交谈以注册分支事务和报告分支事务的状态，并驱动分支事务提交或回滚。

![image-20231220115454973](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220115454973.png)

<br/>

**XA模式**

RM一阶段的工作：

1. 注册分支事务到TC
2. 执行分支业务SQL但不提交
3. 报告执行状态到TC

TC二阶段的工作：

- TC检测各分支事务执行状态
  - 如果都成功，通知所有RM提交事务
  - 如果有失败，通知所有RM回滚事务

RM二阶段的工作：

- 接收TC指令，提交或回滚事务

![image-20231220134936252](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220134936252.png)

<br/>

**AT模式**

AT模式同样是分阶段提交的事务模型，不过缺弥补了XA模型中资源锁定周期过长的缺陷。

阶段一RM的工作：

- 注册分支事务
- 记录undo-log（数据快照）
- 执行业务sql并提交
- 报告事务状态

阶段二提交时RM的工作：

- 删除undo-log即可

阶段二回滚时RM的工作：

- 根据undo-log恢复数据到更新前

![image-20231220135209746](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220135209746.png)

<br/>

**TCC模式**

1、`Try`：资源的检测和预留； 

2、`Confirm`：完成资源操作业务；要求 Try 成功 Confirm 一定要能成功。

3、`Cancel`：预留资源释放，可以理解为try的反向操作。

![image-20231220135325478](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220135325478.png)

<br/>

**MQ分布式事务**

![image-20231220135418058](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220135418058.png)

<br/>

回答要点：你们采用哪种分布式解决方案？

- 只要是多个服务之间的<mark>写操作</mark>，都需要进行分布式事务控制

- 项目中采用的那种方式

  - seata 的 XA 模式，CP，需要互相等待各个分支事务提交，可以保证强一致性，性能差。银行业务
  - seata 的 AT 模式，AP，底层使用 undo log 实现，性能好。互联网业务
  - seata 的 TCC 模式，AP，性能较好，不过需要人工编码实现。银行业务
  - MQ 模式实现分布式事务，在A服务写数据的时候，需要在同一个事物内发送消息到另一个事物。异步，性能最好。

  

<br/>

:::warning 💡思考：你们采用哪种分布式事务解决方案？

我们当时是xx项目，主要使用到的seata的at模式解决的分布式事务

seata的AT模型分为两个阶段：

1、阶段一RM的工作：① 注册分支事务  ② 记录undo-log（数据快照）③ 执行业务sql并提交 ④报告事务状态

2、阶段二提交时RM的工作：删除undo-log即可

3、阶段二回滚时RM的工作：根据undo-log恢复数据到更新前

at模式牺牲了一致性，保证了可用性，不过，它保证的是最终一致性

:::

<br/>



### 分布式调度

> 面试官：你们项目中用了什么分布式任务调度

首先，我们要描述当时是什么场景用了任务调度

xxl-job解决的问题

- 解决集群任务的重复执行问题
- cron表达式定义灵活
- 定时任务失败了，重试和统计
- 任务量大，分片执行

<br/>

xxl-job的使用问题

- xxl-job路由策略有哪些
- xxl-job任务执行失败怎么解决
- 如果有大数据量大任务同时需要执行，怎么解决。

<br/>

xxl-job路由策略有哪些 

1. `FIRST`（第一个）：固定选择第一个机器；
2. `LAST`（最后一个）：固定选择最后一个机器；
3. `ROUND`（轮询）
4. `RANDOM`（随机）：随机选择在线的机器；
5. `CONSISTENT_HASH`（一致性HASH）：每个任务按照Hash算法固定选择某一台机器，且所有任务均匀散列在不同机器上。
6. `LEAST_FREQUENTLY_USED`（最不经常使用）：使用频率最低的机器优先被选举；
7. `LEAST_RECENTLY_USED`（最近最久未使用）：最久未使用的机器优先被选举；
8. `FAILOVER`（故障转移）：按照顺序依次进行心跳检测，第一个心跳检测成功的机器选定为目标执行器并发起调度；
9. `BUSYOVER`（忙碌转移）：按照顺序依次进行空闲检测，第一个空闲检测成功的机器选定为目标执行器并发起调度；
10. `SHARDING_BROADCAST`(分片广播)：广播触发对应集群中所有机器执行一次任务，同时系统自动传递分片参数；可根据分片参数开发分片任务；

![image-20231220142334846](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220142334846.png)

<br/>

xxl-job任务执行失败怎么解决？

故障转移+失败重试，查看日志分析 ---> 邮件告警

![image-20231220143325546](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220143325546.png)

![image-20231220143350527](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220143350527.png)

<Br/>

如果有大数据量的任务同时都需要执行，怎么解决？

执行器集群部署时，任务路由策略选择分片广播情况下，一次任务调度将会广播触发对应集群中所有执行器执行一次任务。

![image-20231220143620820](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231220143620820.png)

回答要点：

<br/>

:::warning 💡思考：xl-job路由策略有哪些？

xxl-job提供了很多的路由策略，我们平时用的较多就是：轮询、故障转移、分片广播…

<br/>

💡**思考：xxl-job任务执行失败怎么解决？**

- 路由策略选择故障转移，优先使用健康的实例来执行任务

- 如果还有失败的，我们在创建任务时，可以设置重试次数

- 如果还有失败的，就可以查看日志或者配置邮件告警来通知相关负责人解决

<br/>

💡**思考：如果有大数据量的任务同时都需要执行，怎么解决？**

我们会让部署多个实例，共同去执行这些批量的任务，其中任务的路由策略是分片广播

在任务执行的代码中可以获取分片总数和当前分片，按照取模的方式分摊到各个实例执行就可以了

:::

