[[toc]]

<br/>

当内存使用达到上限时，就无法存储更多数据了。为了解决这个问题，Redis 提供了一些策略实现内存回收：

- 内存过期策略：通过 Expire 命令给 Redis 的 Key 设置 TTL
  - 惰性删除：每次查找 Key 时判断是否过期，如果过期则删除
  - 定期删除：定期抽样部分 Key，判断是否过期，如果过期则删除。
    - SLOW 模式执行频率默认为10，每次不超过 25ms （**高吞吐**）
    - FAST 模式执行频率不固定，但两次间隔不低于 2ms，每次耗时不超过 1ms（**低延迟**）
  - Redis的过期删除策略：惰性删除 + 定期删除两种策略进行配合使用。
- 内存淘汰策略：主动挑选部分 Key 删除以释放更多内存的流程
  - 淘汰策略
    - noeviction： 不淘汰任何key，但是内存满时不允许写入新数据，**默认就是这种策略**。
    - volatile-ttl： 对设置了TTL的key，比较key的剩余TTL值，TTL越小越先被淘汰
    - allkeys-random：对全体key ，随机进行淘汰。也就是直接从db->dict中随机挑选
    - volatile-random：对设置了TTL的key ，随机进行淘汰。也就是从db->expires中随机挑选
    - allkeys-lru： 对全体key，基于LRU算法进行淘汰
    - volatile-lru： 对设置了TTL的key，基于LRU算法进行淘汰
    - allkeys-lfu： 对全体key，基于LFU算法进行淘汰
    - volatile-lfu： 对设置了TTL的key，基于LFI算法进行淘汰
  - 容易混淆
    - LRU：最近使用。根据每个 Key 的最后访问时间来淘汰
    - LFU：使用频率。根据每个 Key 的访问频率来淘汰
  - 使用建议
    - 如果业务有冷热数据区分，根据访问时间来淘汰，建议使用 allkeys-lru，把最近访问的数据留在缓存中。
    - 如果业务没有冷热数据区分，访问频率差别不大，建议选择 allkeys-random，随机选择淘汰
    - 如果有短时高频访问的数据，则可以使用 allkeys-lfu 或 allkeys-lfu
    - 如果业务中有指定的需求，则可以使用 volaitle-lru 。置顶数据设置不过期，不会被删除，淘汰设置过期时间的数据 

<br/>

## Redis内存策略

### 内存回收

Redis之所以性能强，最主要的原因就是基于内存存储。然而单节点的Redis其内存大小不宜过大，会影响持久化或主从同步性能。

我们可以通过修改配置文件来设置Redis的最大内存：

```sh
# 格式：
# maxmemory <bytes>
# 例如：
maxmemory 1gb
```

当内存使用达到上限时，就无法存储更多数据了。为了解决这个问题，Redis 提供了一些策略实现内存回收：

- 内存过期策略
- 内存淘汰策略

<br/>



### 过期策略

在学习Redis缓存的时候我们说过，可以通过 Expire 命令给 Redis 的 Key 设置 TTL（存活时间）：

```sh
127.0.0.1:6379> set name jack
OK
127.0.0.1:6379> expire name 5 # 设置ttl为5s
(integer) 1
127.0.0.1:6379> get name # 立即访问
"jack"
127.0.0.1:6379> get name # 5秒后访问
(nil)
```

可以发现，当key的TTL到期以后，再次访问name返回的是nil，说明这个key已经不存在了，对应的内存也得到释放。从而起到内存回收的目的。

<br/>

> 思考：Redis 如何知道一个 Key 是否过期呢？

#### DB结构

Redis 本身是一个典型的 key-value 内存存储数据库，因此所有的 key、value 都保存在之前学习过的Dict 结构中。不过在其 database 结构体中，有两个 Dict：一个用来记录 key-value；另一个用来记录 key-TTL。

![image-20240315171629763](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315171629763.png)

![image-20240315171644150](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315171644150.png)



Redis 是如何知道一个 Key 是否过期呢？

- 利用两个 Dict 分别记录 key-value 对及 key-ttl 对

<br/>

> 思考：是不是 TTL 到期就立即删除了呢？

#### 惰性删除

惰性删除：顾明思议并不是在 TTL 到期后就立刻删除，而是在访问一个 Key 的时候，检查该 Key 的存活时间，如果已经过期才执行删除。

![image-20240315171748162](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315171748162.png)

<br/>

#### 周期删除

周期删除：顾明思议是通过一个定时任务，周期性的抽样部分过期的 Key，然后执行删除。执行周期有两种：

- Redis 服务初始化函数 initServer() 中设置定时任务，按照 server.hz 的频率来执行过期 Key 清理，模式为 SLOW
- Redis 的每个事件循环前会调用 beforeSleep() 函数，执行过期 Key 清理，模式为 FAST

![image-20240315171943867](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315171943867.png)

<br/>

SLOW 模式规则：

* 执行频率受 server.hz 影响，默认为 10，即每秒执行 10 次，每个执行周期 100ms

* 执行清理耗时不超过一次执行周期的 25% 默认 SLOW 模式耗时不超过 25ms

* 逐个遍历 db，逐个遍历 db 中的 bucket，抽取20个 Key 判断是否过期

* 如果没达到时间上限（25ms）并且过期key比例大于 10%，再进行一次抽样，否则结束

<br/>

FAST 模式规则（过期 Key 比例小于10%不执行 ）：

* 执行频率受 beforeSleep() 调用频率影响，但两次 FAST 模式间隔不低于 2ms

* 执行清理耗时不超过 1ms

* 逐个遍历 db，逐个遍历 db 中的 bucket，抽取 20 个 Key 判断是否过期。如果没达到时间上限（1ms）并且过期 Key 比例大于10%，再进行一次抽样，否则结束

<br/>

#### 总结

RedisKey 的 TTL 记录方式：

- 在 RedisDB 中通过一个 Dict 记录每个 Key 的 TTL 时间


过期 Key 的删除策略：

- 惰性清理：每次查找 Key 时判断是否过期，如果过期则删除

- 定期清理：定期抽样部分 Key，判断是否过期，如果过期则删除。

定期清理的两种模式：

- SLOW 模式执行频率默认为10，每次不超过 25ms （**高吞吐**）

- FAST 模式执行频率不固定，但两次间隔不低于 2ms，每次耗时不超过 1ms（**低延迟**）

<br/>

### 内存淘汰

内存淘汰：就是当 Redis 内存使用达到设置的上限时，主动挑选部分 Key 删除以释放更多内存的流程。

> 思考：Redis 在什么时候会去检查内存是否充足？

Redis 会在处理客户端命令的方法 processCommand() 中尝试做内存淘汰：

<img src="https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315172059388.png" alt="image-20240315172059388" style="zoom:50%;" />

<br/>

**淘汰策略**

Redis支持8种不同策略来选择要删除的key：

* noeviction： 不淘汰任何key，但是内存满时不允许写入新数据，**默认就是这种策略**。
* volatile-ttl： 对设置了TTL的key，比较key的剩余TTL值，TTL越小越先被淘汰
* allkeys-random：对全体key ，随机进行淘汰。也就是直接从db->dict中随机挑选
* volatile-random：对设置了TTL的key ，随机进行淘汰。也就是从db->expires中随机挑选。
* allkeys-lru： 对全体key，基于LRU算法进行淘汰
* volatile-lru： 对设置了TTL的key，基于LRU算法进行淘汰
* allkeys-lfu： 对全体key，基于LFU算法进行淘汰
* volatile-lfu： 对设置了TTL的key，基于LFI算法进行淘汰

```properties
# The default is:
#
# maxmemory-policy noeviction
```

<br/>

比较容易混淆的有两个：

  * LRU（Least Recently Used）：最少最近使用。用当前时间减去最后一次访问时间，这个值越大则淘汰优先级越高。
  * LFU（Least Frequently Used）：最少频率使用。会统计每个 Key 的访问频率，值越小淘汰优先级越高。

<br/>

> 思考：Redis 如何知道最近使用的时间和使用的频率？

Redis的数据都会被封装为 RedisObject 结构：

![image-20240315172425662](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315172425662.png)

LFU 的访问次数之所以叫做**逻辑访问次数**，是因为并不是每次key被访问都计数，而是通过运算：

* 生成  0~1 之间的随机数R
* 计算 (旧次数 * lfu_log_factor + 1)，记录为P
* 如果 R < P ，则计数器 + 1，且最大不超过255
* 访问次数会随时间衰减，距离上一次访问时间每隔 lfu_decay_time 分钟，计数器 -1

<br/>

最后用一副图来描述当前的这个流程吧

![image-20240315172440910](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315172440910.png)

<br/>

使用建议：

1. 优先使用 allkeys-lru 策略。充分利用 LRU 算法的优势，把最近最常访问的数据留在缓存中。如果业务有明显的冷热数据区分，建议使用。
2. 如果业务中数据访问频率差别不大，没有明显冷热数据区分，建议使用 allkeys-random，随机选择淘汰。
3. 如果业务中有置顶的需求，可以使用 volatile-lru 策略，同时置顶数据不设置过期时间，这些数据就一直不被删除，会淘汰其他设置过期时间的数据。
4. 如果业务中有短时高频访问的数据，可以使用 allkeys-lfu 或 volatile-lfu 策略。