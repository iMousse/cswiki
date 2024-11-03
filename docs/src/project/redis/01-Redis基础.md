# Redis入门

[[toc]]

## Redis实战课

从基础入门，到企业应用实战，再到底层原理、源码分析，一套课程拿捏Redis.

<br/>

**面向群体**

* 完全不懂Redis的新手
* 对Redis有基本了解，想进一步增加Redis企业实战经验的同学
* 有一定的Redis使用经验，需要深入学习Redis底层原理的同学

<br/>

**学习要求**

- 有使用Spring、SpringBoot、SpringMVC、Mybatis的经验

<br/>

**学习目标**

- 知道NoSQL与SQL的差别
- 熟悉Redis的常用5种数据结构
- 熟悉Redis的常用命令
- 熟练使用Jedis和SpringDataRedis

<br/>

**环境准备**

分为两个环境，Mac本地环境和Windows环境

- Mac本地环境
  - MySQL5.7
  - Redis
  - Nginx
  - Homebrew
- Windows环境
  - MySQL5.7
  - Redis
  - Nginx

<br/>

**简单介绍**

Redis是一种键值型的NoSql数据库，这里有两个关键字：

- 键值型
- NoSQL

其中**键值型**，是指Redis中存储的数据都是以key.value对的形式存储，而value的形式多种多样，可以是字符串.数值.甚至json：

![image-20240313160818005](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313160818005.png)

而NoSql则是相对于传统关系型数据库而言，有很大差异的一种数据库。

对于存储的数据，没有类似Mysql那么严格的约束，比如唯一性，是否可以为null等等，所以我们把这种松散结构的数据库，称之为NoSQL数据库。



## 初识Redis

### 认识NoSQL

**NoSql**可以翻译做Not Only Sql（不仅仅是SQL），或者是No Sql（非Sql的）数据库。是相对于传统关系型数据库而言，有很大差异的一种特殊的数据库，因此也称之为**非关系型数据库**。

<br/>

#### 结构化与非结构化

传统关系型数据库是结构化数据，每一张表都有严格的约束信息：字段名.字段数据类型.字段约束等等信息，插入的数据必须遵守这些约束。

而NoSQL则对数据库格式没有严格约束，往往形式松散，自由。

![image-20240313161134063](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313161134063.png)

<br/>

#### 关联和非关联

传统数据库的表与表之间往往存在关联，例如外键：

![image-20240313162716992](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313162716992.png)

而非关系型数据库不存在关联关系，要维护关系要么靠代码中的业务逻辑，要么靠数据之间的耦合：

```json
{
  id: 1,
  name: "张三",
  orders: [
    {
       id: 1,
       item: {
           id: 10, title: "荣耀6", price: 4999
       }
    },
    {
       id: 2,
       item: {
           id: 20, title: "小米11", price: 3999
       }
    }
  ]
}
```

此处要维护“张三”的订单与商品“荣耀”和“小米11”的关系，不得不冗余的将这两个商品保存在张三的订单文档中，不够优雅。还是建议用业务来维护关联关系。

<br/>

#### SQL与非SQL

传统关系型数据库会基于Sql语句做查询，语法有统一标准；

而不同的非关系数据库查询语法差异极大，五花八门各种各样。

![image-20240313162754596](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313162754596.png)

<br/>

#### 事务与BASE

传统关系型数据库能满足事务ACID的原则。

而非关系型数据库往往不支持事务，或者不能严格保证ACID的特性，只能实现基本的一致性。

<br/>

#### 总结

除了上述四点以外，在存储方式.扩展性.查询性能上关系型与非关系型也都有着显著差异，总结如下：

![image-20240313162935897](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313162935897.png)

:::warning 💡思考：存储方式和扩展性解读

- 存储方式
    - 关系型数据库基于磁盘进行存储，会有大量的磁盘IO，对性能有一定影响
    - 非关系型数据库，他们的操作更多的是依赖于内存来操作，内存的读写速度会非常快，性能自然会好一些

* 扩展性
    * 关系型数据库集群模式一般是主从，主从数据一致，起到数据备份的作用，称为垂直扩展。
    * 非关系型数据库可以将数据拆分，存储在不同机器上，可以保存海量数据，解决内存大小有限的问题。称为水平扩展。
    * 关系型数据库因为表之间存在关联关系，如果做水平扩展会给数据查询带来很多麻烦

:::



### 认识Redis

Redis诞生于2009年全称是**Re**mote  **Di**ctionary **S**erver 远程词典服务器，是一个基于内存的键值型NoSQL数据库。

**特征**：

- 键值（key-value）型，value支持多种不同数据结构，功能丰富
- 单线程，每个命令具备原子性
- 低延迟，速度快（基于内存.IO多路复用.良好的编码）
- 支持数据持久化
- 支持主从集群.分片集群
- 支持多语言客户端

**作者**：Antirez

Redis的官方网站地址：https://redis.io/

<br/>

### 安装Redis

参考课前资料《Redis安装说明》



## Redis常见命令

### 数据结构

Redis是一个key-value的数据库，key一般是String类型，不过value的类型多种多样：

![image-20240313163826733](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313163826733.png)

**提示：命令不要死记，学会查询就好啦**

<br/>

Redis为了方便我们学习，将操作不同数据类型的命令也做了分组。

- 官网：https://redis.io/commands 

<br/>

可以查看到不同的命令：

![image-20240313164058598](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313164058598.png)

当然我们也可以通过Help命令来帮助我们去查看命令

```sh
127.0.0.1:6379> help
redis-cli 7.0.7
To get help about Redis commands type:
      "help @<group>" to get a list of commands in <group>
      "help <command>" for help on <command>
      "help <tab>" to get a list of possible help topics
      "quit" to exit

To set redis-cli preferences:
      ":set hints" enable online hints
      ":set nohints" disable online hints
Set your preferences in ~/.redisclirc
# 查看通用命令
127.0.0.1:6379> help @generic  
```

<br/>

### 通用命令

通用指令是部分数据类型的，都可以使用的指令，常见的有：

- `KEYS`：查看符合模板的所有key
- `DEL`：删除一个指定的key
- `EXISTS`：判断key是否存在
- `EXPIRE`：给一个key设置有效期，有效期到期时该key会被自动删除
- `TTL`：查看一个KEY的剩余有效期

通过 `help [command]`  可以查看一个命令的具体用法，例如：

```sh
127.0.0.1:6379> help keys

  KEYS pattern
  summary: Find all keys matching the given pattern
  since: 1.0.0
  group: generic
```

<br/>

**代码如下**

* KEYS

```sh
127.0.0.1:6379> keys *
1) "name"
2) "age"
127.0.0.1:6379>

# 查询以a开头的key
127.0.0.1:6379> keys a*
1) "age"
```

💡**提示**：在生产环境下，不推荐使用keys 命令，因为这个命令在key过多的情况下，效率不高

<br/>

* DEL

```sh
127.0.0.1:6379> help del

  DEL key [key ...]
  summary: Delete a key
  since: 1.0.0
  group: generic

# 删除单个
127.0.0.1:6379> del name 
# 成功删除1个
(integer) 1 

127.0.0.1:6379> keys *
1) "age"

# 批量添加数据
127.0.0.1:6379> MSET k1 v1 k2 v2 k3 v3 
OK

127.0.0.1:6379> keys *
1) "k3"
2) "k2"
3) "k1"
4) "age"

127.0.0.1:6379> del k1 k2 k3 k4
(integer) 3  
# 此处返回的是成功删除的key，由于redis中只有k1,k2,k3 所以只成功删除3个，最终返回
127.0.0.1:6379>

127.0.0.1:6379> keys * 
# 再查询全部的key
1) "age"	
# 只剩下一个了
127.0.0.1:6379>
```

<br/>

* EXISTS

```sh
127.0.0.1:6379> help EXISTS

  EXISTS key [key ...]
  summary: Determine if a key exists
  since: 1.0.0
  group: generic

127.0.0.1:6379> exists age
(integer) 1

127.0.0.1:6379> exists name
(integer) 0
```

<br/>

* EXPIRE

```sh
127.0.0.1:6379> expire age 10
(integer) 1

127.0.0.1:6379> ttl age
(integer) 8

127.0.0.1:6379> ttl age
(integer) 6

127.0.0.1:6379> ttl age
(integer) -2

127.0.0.1:6379> ttl age
(integer) -2  
# 当这个key过期了，那么此时查询出来就是-2 

127.0.0.1:6379> keys *
(empty list or set)

127.0.0.1:6379> set age 10 
# 如果没有设置过期时间
OK

127.0.0.1:6379> ttl age
(integer) -1  
# ttl的返回值就是-1
```

**💡提示**：内存非常宝贵，对于一些数据，我们应当给他一些过期时间，当过期时间到了之后，他就会自动被删除~

<br/>

### String命令

String类型，也就是字符串类型，是Redis中最简单的存储类型。

其value是字符串，不过根据字符串的格式不同，又可以分为3类：

* string：普通字符串
* int：整数类型，可以做自增、自减操作
* float：浮点类型，可以做自增、自减操作

![image-20240313165101876](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313165101876.png)

<br/>

String的常见命令有：

* `SET`：添加或者修改已经存在的一个String类型的键值对
* `GET`：根据key获取String类型的value
* `MSET`：批量添加多个String类型的键值对
* `MGET`：根据多个key获取多个String类型的value
* `INCR`：让一个整型的key自增1
* `INCRBY`：让一个整型的key自增并指定步长，例如：incrby num 2 让num值自增2
* `INCRBYFLOAT`：让一个浮点类型的数字自增并指定步长
* `SETNX`：添加一个String类型的键值对，前提是这个key不存在，否则不执行
* `SETEX`：添加一个String类型的键值对，并且指定有效期

**💡提示**：以上命令除了 `INCRBYFLOAT` 都是常用命令

<br/>

* `SET` 和 `GET`： 如果 key 不存在则是新增，如果存在则是修改

```sh
127.0.0.1:6379> set name Rose  
# 原来不存在
OK

127.0.0.1:6379> get name 
"Rose"

127.0.0.1:6379> set name Jack 
# 原来存在，就是修改
OK

127.0.0.1:6379> get name
"Jack"
```

<br/>

* MSET和MGET

```sh
127.0.0.1:6379> MSET k1 v1 k2 v2 k3 v3
OK

127.0.0.1:6379> MGET name age k1 k2 k3
1) "Jack" # 之前存在的name
2) "10"   # 之前存在的age
3) "v1"
4) "v2"
5) "v3"
```

<br/>

- INCR和INCRBY和DECY

```sh
127.0.0.1:6379> get age 
"10"

# 增加1
127.0.0.1:6379> incr age 
(integer) 11
    
# 获得age
127.0.0.1:6379> get age 
"11"

# 一次增加2
127.0.0.1:6379> incrby age 2 
(integer) 13 
# 返回目前的age的值
    
127.0.0.1:6379> incrby age 2
(integer) 15
    
# 也可以增加负数，相当于减
127.0.0.1:6379> incrby age -1 
(integer) 14
    
# 一次减少2个
127.0.0.1:6379> incrby age -2 
(integer) 12

# 相当于 incr 负数，减少正常用法
127.0.0.1:6379> DECR age 
(integer) 11
    
127.0.0.1:6379> get age 
"11"
```

<br/>

- SETNX

```sh
127.0.0.1:6379> help setnx

  SETNX key value
  summary: Set the value of a key, only if the key does not exist
  since: 1.0.0
  group: string

# 设置名称
127.0.0.1:6379> set name Jack  
OK

# 如果key不存在，则添加成功
127.0.0.1:6379> setnx name lisi 
(integer) 0
# 由于name已经存在，所以lisi的操作失败

127.0.0.1:6379> get name 
"Jack"

# name2 不存在，所以操作成功
127.0.0.1:6379> setnx name2 lisi 
(integer) 1
127.0.0.1:6379> get name2 
"lisi"
```

<br/>

* SETEX

```sh
127.0.0.1:6379> setex name 10 jack
OK

127.0.0.1:6379> ttl name
(integer) 8

127.0.0.1:6379> ttl name
(integer) 7

127.0.0.1:6379> ttl name
(integer) 5
```

<br/>

### Key的层级结构

Redis没有类似MySQL中的Table的概念，我们该如何区分不同类型的key呢？

例如，需要存储用户.商品信息到redis，有一个用户id是1，有一个商品id恰好也是1，此时如果使用id作为key，那就会冲突了，该怎么办？

我们可以通过给key添加前缀加以区分，不过这个前缀不是随便加的，有一定的规范：

Redis的key允许有多个单词形成层级结构，多个单词之间用':'隔开，格式如下：

![image-20240313165204351](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313165204351.png)

这个格式并非固定，也可以根据自己的需求来删除或添加词条。

例如我们的项目名称叫 heima，有user和product两种不同类型的数据，我们可以这样定义key：

- user相关的key：**heima:user:1**
- product相关的key：**heima:product:1**

<br/>

如果Value是一个Java对象，例如一个User对象，则可以将对象序列化为JSON字符串后存储：

![image-20240313165156930](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313165156930.png)

一旦我们向redis采用这样的方式存储，那么在可视化界面中，redis会以层级结构来进行存储，形成类似于这样的结构，更加方便Redis获取数据

![image-20240313203936571](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313203936571.png)

### Hash命令

Hash类型，也叫散列，其value是一个无序字典，类似于Java中的HashMap结构。

String结构是将对象序列化为JSON字符串后存储，当需要修改对象某个字段时很不方便：

![image-20240313170733393](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313170733393.png)

Hash结构可以将对象中的每个字段独立存储，可以针对单个字段做CRUD：

![image-20240313170825632](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313170825632.png)

<br/>

**Hash类型的常见命令**

- `HSET key field value`：添加或者修改hash类型key的field的值
- `HGET key field`：获取一个hash类型key的field的值
- `HMSET`：批量添加多个hash类型key的field的值
- `HMGET`：批量获取多个hash类型key的field的值
- `HGETALL`：获取一个hash类型的key中的所有的field和value
- `HKEYS`：获取一个hash类型的key中的所有的field
- `HINCRBY`:让一个hash类型key的字段值自增并指定步长
- `HSETNX`：添加一个hash类型的key的field值，前提是这个field不存在，否则不执行

**💡提示**：哈希结构也是我们以后实际开发中常用的命令哟

<br/>

* HSET和HGET

```sh
# 大key是 heima:user:3 小key是name，小value是Lucy
127.0.0.1:6379> HSET heima:user:3 name Lucy
(integer) 1

# 如果操作不存在的数据，则是新增
127.0.0.1:6379> HSET heima:user:3 age 21
(integer) 1

# 如果操作存在的数据，则是修改
127.0.0.1:6379> HSET heima:user:3 age 17 
(integer) 0

127.0.0.1:6379> HGET heima:user:3 name 
"Lucy"


127.0.0.1:6379> HGET heima:user:3 age
"17"
```

<br/>

* HMSET和HMGET

```java
127.0.0.1:6379> HMSET heima:user:4 name HanMeiMei
OK
127.0.0.1:6379> HMSET heima:user:4 name LiLei age 20 sex man
OK
127.0.0.1:6379> HMGET heima:user:4 name age sex
1) "LiLei"
2) "20"
3) "man"
```

<br/>

* HGETALL

```java
127.0.0.1:6379> HGETALL heima:user:4
1) "name"
2) "LiLei"
3) "age"
4) "20"
5) "sex"
6) "man"
```

<br/>

* HKEYS和HVALS

```java
127.0.0.1:6379> HKEYS heima:user:4
1) "name"
2) "age"
3) "sex"
127.0.0.1:6379> HVALS heima:user:4
1) "LiLei"
2) "20"
3) "man"
```

<br/>

- HINCRBY

```java
127.0.0.1:6379> HINCRBY  heima:user:4 age 2
(integer) 22
127.0.0.1:6379> HVALS heima:user:4
1) "LiLei"
2) "22"
3) "man"
127.0.0.1:6379> HINCRBY  heima:user:4 age -2
(integer) 20
```

<br/>

* HSETNX

```java
127.0.0.1:6379> HSETNX heima:user4 sex woman
(integer) 1
127.0.0.1:6379> HGETALL heima:user:3
1) "name"
2) "Lucy"
3) "age"
4) "17"
127.0.0.1:6379> HSETNX heima:user:3 sex woman
(integer) 1
127.0.0.1:6379> HGETALL heima:user:3
1) "name"
2) "Lucy"
3) "age"
4) "17"
5) "sex"
6) "woman"
```

<br/>

### List命令

Redis中的List类型与Java中的LinkedList类似，可以看做是一个双向链表结构。既可以支持正向检索和也可以支持反向检索。

特征也与LinkedList类似：

* 有序
* 元素可以重复
* 插入和删除快
* 查询速度一般

常用来存储一个有序数据，例如：朋友圈点赞列表，评论列表等。

<br/>

**List的常见命令有：**

- `LPUSH key element ... `：向列表左侧插入一个或多个元素
- `LPOP key`：移除并返回列表左侧的第一个元素，没有则返回nil
- `RPUSH key element ...` ：向列表右侧插入一个或多个元素
- `RPOP key`：移除并返回列表右侧的第一个元素
- `LRANGE key star end`：返回一段角标范围内的所有元素
- `BLPOP\BRPOP`：与LPOP和RPOP类似，只不过在没有元素时等待指定时间，而不是直接返回nil

![image-20240313171808743](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313171808743.png)

<br/>

* LPUSH和RPUSH

```java
127.0.0.1:6379> LPUSH users 1 2 3
(integer) 3
127.0.0.1:6379> RPUSH users 4 5 6
(integer) 6
```

<br/>

* LPOP和RPOP

```java
127.0.0.1:6379> LPOP users
"3"
127.0.0.1:6379> RPOP users
"6"
```

<br/>

* LRANGE

```java
127.0.0.1:6379> LRANGE users 1 2
1) "1"
2) "4"
```

<br/>

:::warning 如何利用List结构模拟一个栈?

- 入口和出口在同一边

**如何利用List结构模拟一个队列?**

- 入口和出口在不同边

**如何利用List结构模拟一个阻塞队列?**

- 入口和出口在不同边出队时采用BLPOP或BRPOP

:::

<br/>

### Set命令

Redis的Set结构与Java中的HashSet类似，可以看做是一个value为null的HashMap。因为也是一个hash表，因此具备与HashSet类似的特征：

* 无序
* 元素不可重复
* 查找快
* 支持交集.并集.差集等功能

<br/>

**Set类型的常见命令**

* `SADD key member ... `：向set中添加一个或多个元素
* `SREM key member ... `: 移除set中的指定元素
* `SCARD key`： 返回set中元素的个数
* `SISMEMBER key member`：判断一个元素是否存在于set中
* `SMEMBERS`：获取set中的所有元素
* `SINTER key1 key2 ... `：求key1与key2的交集
* `SDIFF key1 key2 ... `：求key1与key2的差集
* `SUNION key1 key2 ...`：求key1和key2的并集

<br/>

例如两个集合：s1和s2:

![image-20240313172240143](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313172240143.png)

求交集、求不同

![image-20240313172255039](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313172255039.png)

<br/>

**具体命令**

```java
127.0.0.1:6379> sadd s1 a b c
(integer) 3
127.0.0.1:6379> smembers s1
1) "c"
2) "b"
3) "a"
127.0.0.1:6379> srem s1 a
(integer) 1
    
127.0.0.1:6379> SISMEMBER s1 a
(integer) 0
    
127.0.0.1:6379> SISMEMBER s1 b
(integer) 1
    
127.0.0.1:6379> SCARD s1
(integer) 2
```

<br/>

**案例**

* 将下列数据用Redis的Set集合来存储：
* 张三的好友有：李四.王五.赵六
* 李四的好友有：王五.麻子.二狗
* 利用Set的命令实现下列功能：
* 计算张三的好友有几人
* 计算张三和李四有哪些共同好友
* 查询哪些人是张三的好友却不是李四的好友
* 查询张三和李四的好友总共有哪些人
* 判断李四是否是张三的好友
* 判断张三是否是李四的好友
* 将李四从张三的好友列表中移除

```java
127.0.0.1:6379> SADD zs lisi wangwu zhaoliu
(integer) 3
    
127.0.0.1:6379> SADD ls wangwu mazi ergou
(integer) 3
    
127.0.0.1:6379> SCARD zs
(integer) 3
    
127.0.0.1:6379> SINTER zs ls
1) "wangwu"
    
127.0.0.1:6379> SDIFF zs ls
1) "zhaoliu"
2) "lisi"
    
127.0.0.1:6379> SUNION zs ls
1) "wangwu"
2) "zhaoliu"
3) "lisi"
4) "mazi"
5) "ergou"
    
127.0.0.1:6379> SISMEMBER zs lisi
(integer) 1
    
127.0.0.1:6379> SISMEMBER ls zhangsan
(integer) 0
    
127.0.0.1:6379> SREM zs lisi
(integer) 1
    
127.0.0.1:6379> SMEMBERS zs
1) "zhaoliu"
2) "wangwu"
```

<br/>

### SortedSet类型

Redis的SortedSet是一个可排序的set集合，与Java中的TreeSet有些类似，但底层数据结构却差别很大。SortedSet中的每一个元素都带有一个score属性，可以基于score属性对元素排序，底层的实现是一个跳表（SkipList）加 hash表。

<br/>

SortedSet具备下列特性：

- 可排序
- 元素不重复
- 查询速度快

因为SortedSet的可排序特性，经常被用来实现排行榜这样的功能。

<br/>

SortedSet的常见命令有：

- `ZADD key score member`：添加一个或多个元素到sorted set ，如果已经存在则更新其score值
- `ZREM key member`：删除sorted set中的一个指定元素
- `ZSCORE key member `: 获取sorted set中的指定元素的score值
- `ZRANK key member`：获取sorted set 中的指定元素的排名
- `ZCARD key`：获取sorted set中的元素个数
- `ZCOUNT key min max`：统计score值在给定范围内的所有元素的个数
- `ZINCRBY key increment member`：让sorted set中的指定元素自增，步长为指定的increment值
- `ZRANGE key min max`：按照score排序后，获取指定排名范围内的元素
- `ZRANGEBYSCORE key min max`：按照score排序后，获取指定score范围内的元素
- `ZDIFF.ZINTER.ZUNION`：求差集.交集.并集

注意：所有的排名默认都是升序，如果要降序则在命令的Z后面添加REV即可，例如：

- **升序**获取sorted set 中的指定元素的排名：ZRANK key member
- **降序**获取sorted set 中的指定元素的排名：ZREVRANK key memeber

<br/>

将班级的下列学生得分存入Redis的SortedSet中：

Jack 85, Lucy 89, Rose 82, Tom 95, Jerry 78, Amy 92, Miles 76 并实现下列功能

- 删除Tom同学
- 获取Amy同学的分数
- 获取Rose同学的排名
- 查询80分以下有几个学生
- 给Amy同学加2分
- 查出成绩前3名的同学
- 查出成绩80分以下的所有同学



## Java客户端-Jedis

在Redis官网中提供了各种语言的客户端，地址：https://redis.io/docs/clients/

![image-20240313172955831](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313172955831.png)

其中Java客户端也包含很多：

![image-20240313173546715](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313173546715.png)

标记为❤️的就是推荐使用的java客户端，包括：

- Jedis和Lettuce：这两个主要是提供了Redis命令对应的API，方便我们操作Redis，而SpringDataRedis又对这两种做了抽象和封装，因此我们后期会直接以SpringDataRedis来学习。
- Redisson：是在Redis基础上实现了分布式的可伸缩的java数据结构，例如Map.Queue等，而且支持跨进程的同步机制：Lock.Semaphore等待，比较适合用来实现特殊的功能需求。



<br/>

### 快速入门

**创建工程**

![image-20240313195246730](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313195246730.png)

**引入依赖**

```xml
<dependencies>
    <!--jedis-->
    <dependency>
        <groupId>redis.clients</groupId>
        <artifactId>jedis</artifactId>
        <version>3.7.0</version>
    </dependency>
    <!--单元测试-->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>5.7.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

<br/>

**单元测试**

```java
package com.heima;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import redis.clients.jedis.Jedis;

public class JedisTest {
    private Jedis jedis;

    /**
     * 建立连接
     */
    @BeforeEach
    void setUp(){
        jedis = new Jedis("127.0.0.1", 6379);
        jedis.select(0);
    }


    @Test
    void testString() {
        // 存入数据
        String result = jedis.set("name", "mousse");
        System.out.println("result = " + result);

        // 获取数据
        String name = jedis.get("name");
        System.out.println("name = " + name);
    }

    /**
     * 释放资源
     */
    @AfterEach
    void tearDown() {
        if (jedis != null) {
            jedis.close();
        }
    }
}

```

<br/>

### Jedis连接池

Jedis本身是线程不安全的，并且频繁的创建和销毁连接会有性能损耗，因此我们推荐大家使用Jedis连接池代替Jedis的直连方式

有关池化思想，并不仅仅是这里会使用，很多地方都有，比如说我们的数据库连接池，比如我们tomcat中的线程池，这些都是池化思想的体现。

<br/>

**创建连接池**

```java
package com.heima.config;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

public class JedisConnectionFactory {
    private static final JedisPool jedisPool;

    static {
        //配置连接池
        JedisPoolConfig poolConfig = new JedisPoolConfig();
        poolConfig.setMaxTotal(8);
        poolConfig.setMaxIdle(8);
        poolConfig.setMinIdle(0);
        poolConfig.setMaxWaitMillis(1000);
        //创建连接池对象
        jedisPool = new JedisPool(poolConfig,
                "192.168.150.101", 6379, 1000);
    }

    public static Jedis getJedis() {
        return jedisPool.getResource();
    }
}
```

:::tip 📌 代码说明

- `JedisConnectionFacotry`：工厂设计模式是实际开发中非常常用的一种设计模式，我们可以使用工厂，去降低代的耦合，比如 Spring 中的 Bean 的创建，就用到了工厂设计模式

- 静态代码块：随着类的加载而加载，确保只能执行一次，我们在加载当前工厂类的时候，就可以执行 static 的操作完成对 连接池的初始化

- 最后提供返回连接池中连接的方法.

:::

<br/>

**改造原始代码**

```java
/**
 * 建立连接
 */
@BeforeEach
void setUp() {
    jedis = new Jedis("127.0.0.1", 6379);// [!code --]
    jedis = JedisConnectionFactory.getJedis(); // [!code ++]
    jedis.select(0);
}
```

:::tip 📌代码说明

1.在我们完成了使用工厂设计模式来完成代码的编写之后，我们在获得连接时，就可以通过工厂来获得，而不用直接去new对象，降低耦合，并且使用的还是连接池对象。

2.当我们使用了连接池后，当我们关闭连接其实并不是关闭，而是将Jedis还回连接池的。

:::



## SpringDataRedis

SpringData是Spring中数据操作的模块，包含对各种数据库的集成，其中对Redis的集成模块就叫做SpringDataRedis。

官网地址：https://spring.io/projects/spring-data-redis

* 提供了对不同Redis客户端的整合（Lettuce和Jedis）
* 提供了RedisTemplate统一API来操作Redis
* 支持Redis的发布订阅模型
* 支持Redis哨兵和Redis集群
* 支持基于Lettuce的响应式编程
* 支持基于JDK.JSON.字符串.Spring对象的数据序列化及反序列化
* 支持基于Redis的JDKCollection实现

![image-20240313173950471](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313173950471.png)

SpringDataRedis中提供了RedisTemplate工具类，其中封装了各种对Redis的操作。并且将不同数据类型的操作API封装到了不同的类型中：

![image-20240313174035996](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313174035996.png)



### 快速入门

SpringBoot已经提供了对SpringDataRedis的支持，使用非常简单：

**导入pom坐标**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.5.7</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.heima</groupId>
    <artifactId>jedis-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
    </properties>

    <dependencies>
        <!--jedis-->
        <dependency>
            <groupId>redis.clients</groupId>
            <artifactId>jedis</artifactId>
            <version>3.7.0</version>
        </dependency>
        <!--redis依赖-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <!--common-pool-->
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-pool2</artifactId>
        </dependency>
        <!--Jackson依赖-->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

</project>
```

<br/>

**启动类**：RedisApplication

```java
package com.heima;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RedisApplication {
    public static void main(String[] args) {
        SpringApplication.run(RedisApplication.class,args);
    }
}
```

<br/>

**配置类**：RedisConfig

```java
package com.heima.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        // 创建RedisTemplate对象
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        // 设置连接工厂
        template.setConnectionFactory(connectionFactory);
        // 返回
        return template;
    }
}
```

<br/>

**配置文件**：application.yml

```yaml
spring:
  redis:
    host: 172.0.0.1
    port: 6379
    lettuce:
      pool:
        max-active: 8  #最大连接
        max-idle: 8   #最大空闲连接
        min-idle: 0   #最小空闲连接
        max-wait: 100ms #连接等待时间
```

<br/>

**测试代码** ：RedisDemoApplicationTests

```java
package com.heima;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;

@SpringBootTest
class RedisDemoApplicationTests {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Test
    void testString() {
        // 写入一条String数据
        redisTemplate.opsForValue().set("name", "慕斯");
        // 获取string数据
        Object name = redisTemplate.opsForValue().get("name");
        System.out.println("name = " + name);
    }
}
```

:::tip 📌 提示：`SpringDataJpa` 使用起来非常简单，记住如下几个步骤即可

* 引入 `spring-boot-starter-data-redis` 依赖
* 在 `application.yml` 配置Redis信息
* 注入 `RedisTemplate`

:::

<br/>

### 数据序列化器

RedisTemplate可以接收任意Object作为值写入Redis：

只不过写入前会把Object序列化为字节形式，默认是采用JDK序列化，得到的结果是这样的：

![image-20240313203316709](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313203316709.png)

缺点：

- 可读性差
- 内存占用较大

<br/>

我们可以自定义 `RedisTemplate` 的序列化方式，代码如下：

```java {19-26}
package com.heima.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        // 创建RedisTemplate对象
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        // 设置连接工厂
        template.setConnectionFactory(connectionFactory);
        // 创建JSON序列化工具
        GenericJackson2JsonRedisSerializer jsonRedisSerializer = new GenericJackson2JsonRedisSerializer();
        // 设置Key的序列化
        template.setKeySerializer(RedisSerializer.string());
        template.setHashKeySerializer(RedisSerializer.string());
        // 设置Value的序列化
        template.setValueSerializer(jsonRedisSerializer);
        template.setHashValueSerializer(jsonRedisSerializer);

        // 返回
        return template;
    }
}
```

这里采用了JSON序列化来代替默认的JDK序列化方式。最终结果如图：



整体可读性有了很大提升，并且能将Java对象自动的序列化为JSON字符串，并且查询时能自动把JSON反序列化为Java对象。不过，其中记录了序列化时对应的class名称，目的是为了查询时实现自动反序列化。这会带来额外的内存开销。

<br/>

**StringRedisTemplate**

尽管JSON的序列化方式可以满足我们的需求，但依然存在一些问题，如图：

![image-20240313203904571](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313203904571.png)

为了在反序列化时知道对象的类型，JSON序列化器会将类的class类型写入json结果中，存入Redis，会带来额外的内存开销。

为了减少内存的消耗，我们可以采用手动序列化的方式，换句话说，就是不借助默认的序列化器，而是我们自己来控制序列化的动作，同时，我们只采用String的序列化器，这样，在存储value时，我们就不需要在内存中就不用多存储数据，从而节约我们的内存空间

![image-20240313174507863](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313174507863.png)



这种用法比较普遍，因此SpringDataRedis就提供了RedisTemplate的子类：StringRedisTemplate，它的key和value的序列化方式默认就是String方式。

![image-20240313204101801](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313204101801.png)

省去了我们自定义RedisTemplate的序列化方式的步骤，而是直接使用：

```java
package com.heima;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heima.pojo.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

@SpringBootTest
class RedisStringTests {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Test
    void testString() {
        // 写入一条String数据
        stringRedisTemplate.opsForValue().set("verify:phone:13600527634", "124143");
        // 获取string数据
        Object name = stringRedisTemplate.opsForValue().get("name");
        System.out.println("name = " + name);
    }

    private static final ObjectMapper mapper = new ObjectMapper();

    @Test
    void testSaveUser() throws JsonProcessingException {
        // 创建对象
        User user = new User("可乐", 21);
        // 手动序列化
        String json = mapper.writeValueAsString(user);
        // 写入数据
        stringRedisTemplate.opsForValue().set("user:200", json);

        // 获取数据
        String jsonUser = stringRedisTemplate.opsForValue().get("user:200");
        // 手动反序列化
        User user1 = mapper.readValue(jsonUser, User.class);
        System.out.println("user1 = " + user1);
    }

}
```

此时我们再来看一看存储的数据，小伙伴们就会发现那个class数据已经不在了，节约了我们的空间~

![image-20240313204409337](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313204409337.png)



:::warning 📌 总结：RedisTemplate的两种序列化实践方案：

* 方案一：
    * 自定义 `RedisTemplate`
    * 修改 `RedisTemplate` 的序列化器为 `GenericJackson2JsonRedisSerializer`

* 方案二：
    * 使用 `StringRedisTemplate`
    * 写入Redis时，手动把对象序列化为JSON
    * 读取Redis时，手动把读取到的JSON反序列化为对象

:::



**Hash结构操作**

在基础篇的最后，咱们对Hash结构操作一下，收一个小尾巴，这个代码咱们就不再解释啦

马上就开始新的篇章~~~进入到我们的Redis实战篇

```java
@Test
void testHash() {
    stringRedisTemplate.opsForHash().put("user:400", "name", "虎哥");
    stringRedisTemplate.opsForHash().put("user:400", "age", "21");

    Map<Object, Object> entries = stringRedisTemplate.opsForHash().entries("user:400");
    System.out.println("entries = " + entries);
}
```
