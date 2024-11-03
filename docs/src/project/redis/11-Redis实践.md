

Redis实践
=========

[[toc]]

<br/>

**Redis键值设计**

- Key的最佳实践
  - 固定格式：[业务名]:[数据名]:[id]
  - 简短整洁：不超过44字节，不包含特殊字符
- Value的最佳实践
  - 合理的拆分数据，拒绝 BigKey
    - 网络阻塞：BigKey 执行读请求，少量的QPS就可能导致带宽使用率被占满。
    - 数据倾斜：BigKey 所在的实例内存使用率远超过其他实例，使分片内存资源无法达到均衡。
    - Redis阻塞：对元素较多的Hash，List，ZSet 做运算会耗时较久，使主线程被阻塞
    - CPU压力：BigKey 序列化和反序列化会导致 CPU 的使用率飙升，影响实例和其他应用
  - 合适的数据结构
    - 存储一个用户对象
      - 使用 Json 字符串，实现简单；但数据耦合，不够灵活
      - 使用 Hash，底层使用 Ziplist，空间占用小，可以灵活访问对象字段；但实现复杂
    - 存储大数据的Hash 
      - 存在问题：Hash 的 entry 默认数量超过 512 并且大小超过 64 字节，则会从 Ziplist 转为 Dict，内存占用会变多，修改 entry 的数量和大小会造成 BigKey
      - 如何解决：将大数据的 Hash 拆分成小的 Hash，内存占用更小；但实现会变复杂

<br/>

**批处理优化**

- 批量处理的方案
  - 原生的M操作：M操作虽然可以批处理，但是只支持部分数据。
  - Pipeline批处理：批处理时不建议一次携带太多命令，并且多个命令之间不具备原子性。
- 集群批量处理
  - 串行命令：for 循环遍历，依此执行每个命令。实现简单但耗时非常久
  - 串行 Slot：在客户端计算 key 的 slot，将相同的 slot 利用 pipeline 批处理，<mark>串行执行</mark>。耗时短但是实现比较复杂，slot 越多耗时约久
  - 并行 Slot：在客户端计算 key 的 slot，将相同的 slot 利用 pipeline 批处理，<mark>并行执行</mark>。耗时非常短，但是实现复杂。推荐使用
  - hash_tag：将所有 key 设置相同的 hash_tag，让所有的 key 保持相同。耗时非常短，实现简单，但是容易出现数据倾斜


<br/>

**服务端优化**

- 持久化建议
  - 用来做缓存的服务尽量不要开启持久化功能
  - 建议关闭 RDB 持久化，使用 AOF 持久化
  - 利用脚本定期在 slave 节点做 RDB，实现数据备份
  - 设置合理的 rewrite 阈值，避免频繁的 bgwrite
  - 禁止在 rewirte 期间做 AOF，避免因 AOF 引起服务器阻塞
- 部署建议
  - Redis 实例的物理机要预留足够的内存，来应对 fork 和 rewrite
  - 单个 Redis 实例内存不能太大，合适的内存能加快 fork 速度、减少主从同步、数据迁移压力
  - 不要和计算密集型和高硬盘负载应用部署在一起。
- 慢查询优化
  - `slowlog-log-slower-than`：慢查询阈值，单位是微秒。默认是10000，建议1000
  - `slowlog-max-len`：慢查询日志（本质是一个队列）的长度。默认是128，建议1000
- 安全配置
  - Redis 一定要设置密码
  - 利用 rename-command 禁用 config set、flushall、flushdb等命令
  - 配置 bind 限制网卡，禁止外网网卡访问
  - 开启防火墙，并且不使用 Root 账户启动 Redis
  - 尽量不使用默认的端口
- 内存配置：当 Redis 内存不足会导致 Key 频繁被删除、响应时间变长、QPS 不稳定，需要快速定位原因。
  - 数据内存：Redis 最主要部分，存储 Redis 键值信息，主要问题是 BigKey 问题、内存碎片问题
  - 进程内存：Redis 主进程本身运行占用的内存，如代码，常量池等等；大多数情况下可以忽略
  - 缓冲区内存：一般包括客户端缓冲区、AOF 缓冲区、复制缓冲区。客户端缓冲区又包括输入缓冲区和输出缓冲区。输入缓冲区最大为 1GB，超过就会自动断开；输出缓冲区内存占用波动比较大，不当使用 BigKey，可能导致内存溢出。可通过增加缓冲区大小和增加服务带宽来解决。

<br/>

**集群最佳实践**

- 集群完整性问题：Redis 集群的默认配置为发现任意一个插槽不可用则整个集群停止服务。
- 命令兼容性问题：当我们使用批处理命令时必须将 Key 落在相同的插槽上才能同时操作。客户端需要对这样的数据进行重新处理。
- 服务事务问题：Lua 和事务都是要保证原子性问题，如果 Key 不在一个节点则无法保证 Lua 的执行和事务的特性。
- 集群带宽问题：集群之间会不断的 Ping 来确定集群其它节点的状态。而随着节点的增多，集群的状态信息和插槽信息会越来越大，10个节点相关数据久可能达到 1KB，这样会导致大量的带宽被无用的 Ping 信息所占用。避免大集群，节点数量不要太多，并且避免在单个物理机中运行多个 Redis，配置合适的集群节点超时时间。
- 数据倾斜问题：会造成数据倾斜问题，需要提前规划 Key 的分布。

  





Redis键值设计
-------------

### 优雅的Key结构

Redis的Key虽然可以自定义，但最好遵循下面的几个最佳实践约定：

- 遵循基本格式：[业务名称]:[数据名]:[id]
- 长度不超过44字节
- 不包含特殊字符

<br/>

例如：我们的登录业务，保存用户信息，其key可以设计成如下格式：

![image-20240315103909688](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315103909688.png)

这样设计的好处：

- 可读性强
- 避免key冲突
- 方便管理
- 更节省内存

```sh
[mousse@MacBookAir ~]$ redis-cli
127.0.0.1:6379> set num 123
OK
127.0.0.1:6379> type num
string
127.0.0.1:6379> set name java
OK
127.0.0.1:6379> object encoding name
"embstr"
127.0.0.1:6379> type name
string
127.0.0.1:6379> set name aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
OK
127.0.0.1:6379> type name
string
127.0.0.1:6379> object encoding name 
"embstr"
127.0.0.1:6379> set name aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
OK
127.0.0.1:6379> object encoding name 
"raw"
127.0.0.1:6379> 
```

:::tip 🔖更节省内存的原因

key是 String 类型，底层编码包含 int、embstr 和 raw 三种。embstr 在小于44字节使用，采用连续内存空间，内存占用更小。当字节数大于 44 字节时，会转为 raw 模式存储，在 raw 模式下，内存空间不是连续的，而是采用一个指针指向了另外一段内存空间，在这段空间里存储 SDS 内容，这样空间不连续，访问的时候性能也就会受到影响，还有可能产生内存碎片

:::

<br/>

### 拒绝BigKey

BigKey 通常以 Key 的大小和 Key 中成员的数量来综合判定，例如：

- Key 本身的数据量过大：一个 String 类型的 Key，它的值为 5MB
- Key 中成员的 Key 数过多：一个 ZSET 类型的 Key，它的成员数量为10,000个
- Key 中成员的 Value 过大：一个 Hash 类型的 Key，它的成员数量虽然只有 1,000 个但这些成员的 Value（值）总大小为100 MB

<br/>

那么如何判断元素的大小呢？Redis 也给我们提供了命令

```sh
# 可以采用memoryusage指令查看指定key及其value占用大小
127.0.0.1:6379> memory usage name
(integer) 120
127.0.0.1:6379> set name aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
OK
127.0.0.1:6379> memory usage name
(integer) 104
127.0.0.1:6379> set name jack
OK
127.0.0.1:6379> memory usage name
(integer) 72
# 但是一般不推荐使用memory指令，因此这个指令对cpu的使用率是比较高的
127.0.0.1:6379> strlen name
(integer) 4
# 实际开发中一般来说我们只需要衡量值或者值的个数就行了
127.0.0.1:6379> LPUSH l2 m1 m2
(integer) 2
127.0.0.1:6379> LLEN l2
(integer) 2
```

<br/>

推荐值

- 单个 Key 的 Value 小于 10KB
- 对于集合类型的 Key，建议元素数量小于 1,000

<br/>

#### BigKey的危害

- 网络阻塞
  - BigKey 执行读请求时，少量的QPS就可能导致带宽使用率被占满，导致 Redis实例，乃至所在物理机变慢
- 数据倾斜
  - BigKey 所在的Redis实例内存使用率远超其他实例，无法使数据分片的内存资源达到均衡
- Redis 阻塞
  - 元素较多的 Hash、List、Zset 等做运算会耗时较久，使主线程被阻塞
- CPU压力
  - BigKey 的数据序列化和反序列化会导致 CPU 的使用率飙升，影响 Redis 实例和本机其它应用

<br/>

#### 如何发现BigKey

**命令行**

```sh
redis-cli --bigkeys
```

利用redis-cli提供的 --bigkeys 参数，可以遍历分析所有key，并返回Key的整体统计信息与每个数据的Top1的big key

命令：`redis-cli -a 密码 --bigkeys`

```sh {18-20}
[mousse@MacBookAir ~]$ redis-cli --bigkeys

# Scanning the entire keyspace to find biggest keys as well as
# average sizes per key type.  You can use -i 0.1 to sleep 0.1 sec
# per 100 SCAN commands (not usually needed).

[00.00%] Biggest string found so far '"heima:user:1"' with 36 bytes
[00.00%] Biggest string found so far '"heima:user:2"' with 42 bytes
[00.00%] Biggest hash   found so far '"heima:user:3"' with 1 fields
[00.00%] Biggest list   found so far '"l2"' with 2 items
[00.00%] Biggest string found so far '"user:100"' with 57 bytes

-------- summary -------

Sampled 8 keys in the keyspace!
Total key length in bytes is 61 (avg len 7.62)

Biggest   list found '"l2"' has 2 items
Biggest   hash found '"heima:user:3"' has 1 fields
Biggest string found '"user:100"' has 57 bytes

1 lists with 2 items (12.50% of keys, avg size 2.00)
1 hashs with 1 fields (12.50% of keys, avg size 1.00)
6 strings with 173 bytes (75.00% of keys, avg size 28.83)
0 streams with 0 entries (00.00% of keys, avg size 0.00)
0 sets with 0 members (00.00% of keys, avg size 0.00)
0 zsets with 0 members (00.00% of keys, avg size 0.00)
```

<br/>

**Scan 扫描**

自己编程，利用 Scan 扫描 Redis 中的所有 Key，利用 strlen、hlen 等命令判断 Key 的长度（此处不建议使用MEMORY USAGE）

```sh
127.0.0.1:6379> scan 0 count 2
1) "2"
2) 1) "heima:user:1"
   2) "heima:user:2"
   3) "heima:user:3"
127.0.0.1:6379> scan 3 count 2
1) "7"
2) 1) "num"
   2) "user:100"
   3) "name"
```

scan 命令调用完后每次会返回 2 个元素，第一个是下一次迭代的光标，第一次光标会设置为 0，当最后一次 scan 返回的光标等于 0 时，表示整个 scan 遍历结束了，第二个返回的是 List，一个匹配的 Key 的数组

<br/>

```java
import com.heima.jedis.util.JedisConnectionFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.ScanResult;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JedisTest {
    private Jedis jedis;

    @BeforeEach
    void setUp() {
        // 1.建立连接
        // jedis = new Jedis("192.168.150.101", 6379);
        jedis = JedisConnectionFactory.getJedis();
        // 2.设置密码
        jedis.auth("123321");
        // 3.选择库
        jedis.select(0);
    }

    final static int STR_MAX_LEN = 10 * 1024;
    final static int HASH_MAX_LEN = 500;

    @Test
    void testScan() {
        int maxLen = 0;
        long len = 0;

        String cursor = "0";
        do {
            // 扫描并获取一部分key
            ScanResult<String> result = jedis.scan(cursor);
            // 记录cursor
            cursor = result.getCursor();
            List<String> list = result.getResult();
            if (list == null || list.isEmpty()) {
                break;
            }
            // 遍历
            for (String key : list) {
                // 判断key的类型
                String type = jedis.type(key);
                switch (type) {
                    case "string":
                        len = jedis.strlen(key);
                        maxLen = STR_MAX_LEN;
                        break;
                    case "hash":
                        len = jedis.hlen(key);
                        maxLen = HASH_MAX_LEN;
                        break;
                    case "list":
                        len = jedis.llen(key);
                        maxLen = HASH_MAX_LEN;
                        break;
                    case "set":
                        len = jedis.scard(key);
                        maxLen = HASH_MAX_LEN;
                        break;
                    case "zset":
                        len = jedis.zcard(key);
                        maxLen = HASH_MAX_LEN;
                        break;
                    default:
                        break;
                }
                if (len >= maxLen) {
                    System.out.printf("Found big key : %s, type: %s, length or size: %d %n", key, type, len);
                }
            }
        } while (!cursor.equals("0"));
    }
    
    @AfterEach
    void tearDown() {
        if (jedis != null) {
            jedis.close();
        }
    }

}
```

<br/>

**第三方工具**

- 利用第三方工具，如 Redis-Rdb-Tools 分析RDB快照文件，全面分析内存使用情况
- https://github.com/sripathikrishnan/redis-rdb-tools

<br/>

**网络监控**

- 自定义工具，监控进出Redis的网络数据，超出预警值时主动告警
- 一般阿里云搭建的云服务器就有相关监控页面

![image-20220521140415785](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220521140415785.png)

<br/>

#### 如何删除BigKey

BigKey内存占用较多，即便时删除这样的 Key 也需要耗费很长时间，导致 Redis 主线程阻塞，引发一系列问题。

- Redis 3.0 及以下版本
  - 如果是集合类型，则遍历BigKey的元素，先逐个删除子元素，最后删除BigKey

![image-20220521140621204](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220521140621204.png)

- Redis 4.0以后
  - Redis 在4.0后提供了异步删除的命令：unlink

<br/>

### 恰当的数据类型

例1：比如存储一个User对象，我们有三种存储方式：

![image-16935513619541](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-16935513619541.png)

<br/>

例2：假如有hash类型的key，其中有100万对field和value，field是自增id，这个key存在什么问题？如何优化？

<table>
	<tr style="color:red">
		<td>key</td>
        <td>field</td>
        <td>value</td>
	</tr>
	<tr>
		<td rowspan="3">someKey</td>
		<td>id:0</td>
        <td>value0</td>
	</tr>
    <tr>
		<td>.....</td>
        <td>.....</td>
	</tr>
    <tr>
        <td>id:999999</td>
        <td>value999999</td>
    </tr>
</table>
<br/>

存在的问题：

- hash的entry数量超过500时，会使用哈希表而不是 ZipList，内存占用较多

  ```sh {3}
  127.0.0.1:6379> info memory
  # Memory
  used_memory_human:62.23M
  ```

- 可以通过 hash-max-ziplist-entries 配置 entry 上限。但是如果 entry 过多就会导致 BigKey 问题

<br/>

#### 方案一

拆分为string类型

<table>
	<tr style="color:red">
		<td>key</td>
        <td>value</td>
	</tr>
	<tr>
		<td>id:0</td>
        <td>value0</td>
	</tr>
    <tr>
		<td>.....</td>
        <td>.....</td>
	</tr>
    <tr>
        <td>id:999999</td>
        <td>value999999</td>
    </tr>
</table>
<br/>

存在的问题：

- String结构底层没有太多内存优化，内存占用较多

  ```sh {3}
  127.0.0.1:6379> info memory
  # Memory
  used_memory_human:77.54M
  ```

- 想要批量获取这些数据比较麻烦

<br/>

#### 方案二

拆分为小的hash，将 id / 100 作为key， 将id % 100 作为field，这样每100个元素为一个Hash

<table>
	<tr style="color:red">
		<td>key</td>
        <td>field</td>
        <td>value</td>
	</tr>
	<tr>
        <td rowspan="3">key:0</td>
		<td>id:00</td>
        <td>value0</td>
	</tr>
    <tr>
		<td>.....</td>
        <td>.....</td>
	</tr>
    <tr>
        <td>id:99</td>
        <td>value99</td>
    </tr>
    <tr>
        <td rowspan="3">key:1</td>
		<td>id:00</td>
        <td>value100</td>
	</tr>
    <tr>
		<td>.....</td>
        <td>.....</td>
	</tr>
    <tr>
        <td>id:99</td>
        <td>value199</td>
    </tr>
    <tr>
    	<td colspan="3">....</td>
    </tr>
    <tr>
        <td rowspan="3">key:9999</td>
		<td>id:00</td>
        <td>value999900</td>
	</tr>
    <tr>
		<td>.....</td>
        <td>.....</td>
	</tr>
    <tr>
        <td>id:99</td>
        <td>value999999</td>
    </tr>
</table>

查看使用内存大小：

```sh {3}
127.0.0.1:6379> info memory
# Memory
used_memory_human:24.44M
```

实现代码如下：

```java
package com.heima.test;

import com.heima.jedis.util.JedisConnectionFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.Pipeline;
import redis.clients.jedis.ScanResult;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JedisTest {
    private Jedis jedis;

    @BeforeEach
    void setUp() {
        // 1.建立连接
        // jedis = new Jedis("192.168.150.101", 6379);
        jedis = JedisConnectionFactory.getJedis();
        // 2.设置密码
        jedis.auth("123321");
        // 3.选择库
        jedis.select(0);
    }

    @Test
    void testSetBigKey() {
        Map<String, String> map = new HashMap<>();
        for (int i = 1; i <= 650; i++) {
            map.put("hello_" + i, "world!");
        }
        jedis.hmset("m2", map);
    }

    @Test
    void testBigHash() {
        Map<String, String> map = new HashMap<>();
        for (int i = 1; i <= 100000; i++) {
            map.put("key_" + i, "value_" + i);
        }
        jedis.hmset("test:big:hash", map);
    }

    @Test
    void testBigString() {
        for (int i = 1; i <= 100000; i++) {
            jedis.set("test:str:key_" + i, "value_" + i);
        }
    }

    @Test
    void testSmallHash() {
        int hashSize = 100;
        Map<String, String> map = new HashMap<>(hashSize);
        for (int i = 1; i <= 100000; i++) {
            int k = (i - 1) / hashSize;
            int v = i % hashSize;
            map.put("key_" + v, "value_" + v);
            if (v == 0) {
                jedis.hmset("test:small:hash_" + k, map);
            }
        }
    }

    @AfterEach
    void tearDown() {
        if (jedis != null) {
            jedis.close();
        }
    }
}
```

<br/>



## 批处理优化

### Pipeline

#### 服务器交互

单个命令的执行流程

一次命令的响应时间 = 1次往返的网络传输耗时 + 1次Redis执行命令耗时

![image-20240315111754550](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315111754550.png)

<br/>

N条命令的执行流程

N次命令的响应时间 = N次往返的网络传输耗时 + N次Redis执行命令耗时

![image-20240315112454702](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315112454702.png)

<br/>

Redis处理指令是很快的，主要花费的时候在于网络传输。于是乎很容易想到将多条指令批量的传输给 Redis

N次命令的响应时间 = 1次往返的网络传输耗时 + N次Redis执行命令耗时

![image-20240315112530503](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315112530503.png)

<br/>

#### MSet

Redis提供了很多Mxxx这样的命令，可以实现批量插入数据，例如：

- mset
- hmset

利用mset批量插入10万条数据

```java
@Test
void testMxx() {
    String[] arr = new String[2000];
    int j;
    long b = System.currentTimeMillis();
    for (int i = 1; i <= 100000; i++) {
        j = (i % 1000) << 1;
        arr[j] = "test:key_" + i;
        arr[j + 1] = "value_" + i;
        if (j == 0) {
            jedis.mset(arr);
        }
    }
    long e = System.currentTimeMillis();
    System.out.println("time: " + (e - b));
}
```

<br/>

#### Pipeline

MSET虽然可以批处理，但是却只能操作部分数据类型，因此如果有对复杂数据类型的批处理需要，建议使用Pipeline

```java
@Test
void testPipeline() {
    // 创建管道
    Pipeline pipeline = jedis.pipelined();
    long b = System.currentTimeMillis();
    for (int i = 1; i <= 100000; i++) {
        // 放入命令到管道
        pipeline.set("test:key_" + i, "value_" + i);
        if (i % 1000 == 0) {
            // 每放入1000条命令，批量执行
            pipeline.sync();
        }
    }
    long e = System.currentTimeMillis();
    System.out.println("time: " + (e - b));
}
```

<br/>

### 集群下的批处理

如 MSET 或 Pipeline 这样的批处理需要在一次请求中携带多条命令，而此时如果 Redis 是一个集群，那批处理命令的多个 Key 必须落在一个插槽中，否则就会导致执行失败。大家可以想一想这样的要求其实很难实现，因为我们在批处理时，可能一次要插入很多条数据，这些数据很有可能不会都落在相同的节点上，这就会导致报错了。

<br/>

这个时候，我们可以找到4种解决方案：

![image-20240315112636010](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315112636010.png)

- 第一种方案：串行执行，所以这种方式没有什么意义，当然，执行起来就很简单了，缺点就是耗时过久。

- 第二种方案：串行 Slot，简单来说，就是执行前，客户端先计算一下对应  Key 的 Slot，一样 Slot 的 Key 就放到一个组里边，不同的，就放到不同的组里边，然后对每个组执行 Pipeline 的批处理，他就能串行执行各个组的命令，这种做法比第一种方法耗时要少，但是缺点呢，相对来说复杂一点，所以这种方案还需要优化一下

- 第三种方案：并行 Slot，相较于第二种方案，在分组完成后串行执行，第三种方案，就变成了并行执行各个命令，所以他的耗时就非常短，但是实现呢，也更加复杂。

- 第四种：hash_tag，Redis 计算 key 的 Slot 的时候，其实是根据 Key 的有效部分来计算的，通过这种方式就能一次处理所有的key，这种方式耗时最短，实现也简单，但是如果通过操作key的有效部分，那么就会导致所有的key都落在一个节点上，产生数据倾斜的问题，所以我们推荐使用第三种方式。


<br/>

**串行化执行代码实践**

```java
public class JedisClusterTest {

    private JedisCluster jedisCluster;

    @BeforeEach
    void setUp() {
        // 配置连接池
        JedisPoolConfig poolConfig = new JedisPoolConfig();
        poolConfig.setMaxTotal(8);
        poolConfig.setMaxIdle(8);
        poolConfig.setMinIdle(0);
        poolConfig.setMaxWaitMillis(1000);
        HashSet<HostAndPort> nodes = new HashSet<>();
        nodes.add(new HostAndPort("192.168.150.101", 7001));
        nodes.add(new HostAndPort("192.168.150.101", 7002));
        nodes.add(new HostAndPort("192.168.150.101", 7003));
        nodes.add(new HostAndPort("192.168.150.101", 8001));
        nodes.add(new HostAndPort("192.168.150.101", 8002));
        nodes.add(new HostAndPort("192.168.150.101", 8003));
        jedisCluster = new JedisCluster(nodes, poolConfig);
    }

    @Test
    void testMSet() {
        jedisCluster.mset("name", "Jack", "age", "21", "sex", "male");

    }

    @Test
    void testMSet2() {
        Map<String, String> map = new HashMap<>(3);
        map.put("name", "Jack");
        map.put("age", "21");
        map.put("sex", "Male");
        //对Map数据进行分组。根据相同的slot放在一个分组
        //key就是slot，value就是一个组
        Map<Integer, List<Map.Entry<String, String>>> result = map.entrySet()
                .stream()
                .collect(Collectors.groupingBy(
                        entry -> ClusterSlotHashUtil.calculateSlot(entry.getKey()))
                );
        //串行的去执行mset的逻辑
        for (List<Map.Entry<String, String>> list : result.values()) {
            String[] arr = new String[list.size() * 2];
            int j = 0;
            for (int i = 0; i < list.size(); i++) {
                j = i<<2;
                Map.Entry<String, String> e = list.get(0);
                arr[j] = e.getKey();
                arr[j + 1] = e.getValue();
            }
            jedisCluster.mset(arr);
        }
    }

    @AfterEach
    void tearDown() {
        if (jedisCluster != null) {
            jedisCluster.close();
        }
    }
}
```

<br/>

**Spring代码**

Spring集群环境下批处理代码

```java
   @Test
    void testMSetInCluster() {
        Map<String, String> map = new HashMap<>(3);
        map.put("name", "Rose");
        map.put("age", "21");
        map.put("sex", "Female");
        stringRedisTemplate.opsForValue().multiSet(map);


        List<String> strings = stringRedisTemplate.opsForValue().multiGet(Arrays.asList("name", "age", "sex"));
        strings.forEach(System.out::println);

    }
```

<br/>

**原理分析**

在 `RedisAdvancedClusterAsyncCommandsImpl`  类中，首先根据 Slot Hash 算出来一个 partitioned 的 map，map 中的 Key 就是 Slot，而他的 Value 就是对应的对应相同 Slot 的 Key 对应的数据

通过 `RedisFuture<String> mset = super.mset(op);`进行异步的消息发送

```Java
@Override
public RedisFuture<String> mset(Map<K, V> map) {

    Map<Integer, List<K>> partitioned = SlotHash.partition(codec, map.keySet());

    if (partitioned.size() < 2) {
        return super.mset(map);
    }

    Map<Integer, RedisFuture<String>> executions = new HashMap<>();

    for (Map.Entry<Integer, List<K>> entry : partitioned.entrySet()) {

        Map<K, V> op = new HashMap<>();
        entry.getValue().forEach(k -> op.put(k, map.get(k)));

        RedisFuture<String> mset = super.mset(op);
        executions.put(entry.getKey(), mset);
    }

    return MultiNodeExecution.firstOfAsync(executions);
}
```



## 服务端优化

### 持久化配置

Redis的持久化虽然可以保证数据安全，但也会带来很多额外的开销，因此**持久化请遵循下列建议**

* 用来做缓存的 Redis 实例尽量不要开启持久化功能
* 建议关闭 RDB 持久化功能，使用 AOF 持久化
* 利用脚本定期在 Slave 节点做 RDB，实现数据备份
* 设置合理的 rewrite 阈值，避免频繁的 bgrewrite
* 配置 `no-appendfsync-on-rewrite = yes` ，禁止在 rewrite 期间做 AOF ，避免因 AOF 引起的阻塞

<br/>

**部署有关建议**

* Redis 实例的物理机要预留足够内存，应对 fork 和 rewrite
* 单个 Redis 实例内存上限不要太大，例如 4G 或 8G。可以加快 fork 的速度、减少主从同步、数据迁移压力
* 不要与 CPU 密集型应用部署在一起
* 不要与高硬盘负载应用一起部署。例如：数据库、消息队列

<br/>

**AOF流程图**

<img src="https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-169355136195430.png" style="zoom:50%;" />

<br/>

### 慢查询优化

#### 什么是慢查询

并不是很慢的查询才是慢查询，而是：在Redis执行时耗时超过某个阈值的命令，称为慢查询。

慢查询的危害：由于Redis是单线程的，所以当客户端发出指令后，他们都会进入到redis底层的queue来执行，如果此时有一些慢查询的数据，就会导致大量请求阻塞，从而引起报错，所以我们需要解决慢查询问题。

![image-20240315112947276](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315112947276.png)

<br/>

慢查询的阈值可以通过配置指定：

- `slowlog-log-slower-than`：慢查询阈值，单位是微秒。默认是10000，建议1000

<br/>


慢查询会被放入慢查询日志中，日志的长度有上限，可以通过配置指定：

- `slowlog-max-len`：慢查询日志（本质是一个队列）的长度。默认是128，建议1000

  - 修改这两个配置可以使用：config set命令

  ```sh
  127.0.0.1:6379> config get slowlog-max-len
  1) "slowlog-max-len"
  2) "128"
  127.0.0.1:6379> config set slowlog-max-len 1000
  OK
  127.0.0.1:6379> config get slowlog-max-len
  1) "slowlog-max-len"
  2) "1000"
  ```

<br/>

#### 如何查看慢查询

知道了以上内容之后，那么咱们如何去查看慢查询日志列表呢：

* slowlog len：查询慢查询日志长度
* slowlog get [n]：读取n条慢查询日志
* slowlog reset：清空慢查询列表

![1653130858066](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/1653130858066.png )

<br/>

### 命令及安全配置

 安全可以说是服务器端一个非常重要的话题，如果安全出现了问题，那么一旦这个漏洞被一些坏人知道了之后，并且进行攻击，那么这就会给咱们的系统带来很多的损失，所以我们这节课就来解决这个问题。

Redis 会绑定在 0.0.0.0:6379，这样将会将 Redis 服务暴露到公网上，而 Redis 如果没有做身份认证，会出现严重的安全漏洞.

- 漏洞重现方式：https://cloud.tencent.com/developer/article/1039000

<br/>

为什么会出现不需要密码也能够登录呢，主要是 Redis 考虑到每次登录都比较麻烦，所以 Redis 就有一种 ssh 免秘钥登录的方式，生成一对公钥和私钥，私钥放在本地，公钥放在 Redis 端，当我们登录时服务器，再登录时候，他会去解析公钥和私钥，如果没有问题，则不需要利用 Redis 的登录也能访问，这种做法本身也很常见，但是这里有一个前提，前提就是公钥必须保存在服务器上，才行，但是 Redis 的漏洞在于在不登录的情况下，也能把秘钥送到 Linux 服务器，从而产生漏洞。

<br/>

漏洞出现的核心的原因有以下几点：

* Redis 未设置密码
* 利用了 Redis 的config set 命令动态修改 Redis 配置
* 使用了 Root 账号权限启动 Redis

所以：如何解决呢？我们可以采用如下几种方案

<br/>

为了避免这样的漏洞，这里给出一些建议：

* Redis 一定要设置密码
* 禁止线上使用下面命令：keys、flushall、flushdb、config set等命令。
  * 可以利用 rename-command 禁用
* 配置 bind：限制网卡，禁止外网网卡访问
* 开启防火墙，并且不要使用 Root 账户启动 Redis
* 尽量不使用默认的端口

<br/>

### 内存配置

当 Redis 内存不足时，可能导致 Key 频繁被删除、响应时间变长、QPS 不稳定等问题。当内存使用率达到90% 以上时就需要我们警惕，并快速定位到内存占用的原因。

![image-169355136195431](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-169355136195431.png)

- **有关碎片问题分析**：Redis底层分配并不是这个key有多大，他就会分配多大，而是有他自己的分配策略，比如8,16,20等等，假定当前key只需要10个字节，此时分配8肯定不够，那么他就会分配16个字节，多出来的6个字节就不能被使用，这就是我们常说的碎片问题
- **进程内存问题分析**：这片内存，通常我们都可以忽略不计
- **缓冲区内存问题分析**：一般包括客户端缓冲区、AOF缓冲区、复制缓冲区等。客户端缓冲区又包括输入缓冲区和输出缓冲区两种。这部分内存占用波动较大，所以这片内存也是我们需要重点分析的内存问题。

<br/>

**数据内存问题**

于是我们就需要通过一些命令，可以查看到Redis目前的内存分配状态：

* info memory：查看内存分配的情况
* memory stats：查看key的主要占用情况

接下来我们看到了这些配置，最关键的缓存区内存如何定位和解决呢？

<br/>

**内存缓存区配置**

内存缓冲区常见的有三种：

* 复制缓冲区：主从复制的 `repl_backlog_buf`，如果太小可能导致频繁的全量复制，影响性能。通过 `replbacklog-size` 来设置，默认 1MB
* AOF 缓冲区：AOF 刷盘之前的缓存区域，AOF 执行 rewrite 的缓冲区。无法设置容量上限
* 客户端缓冲区：分为输入缓冲区和输出缓冲区，输入缓冲区最大 1G 且不能设置。输出缓冲区可以设置

以上复制缓冲区和AOF缓冲区不会有问题，最关键就是客户端缓冲区的问题

<br/>

**客户端缓冲区**：指的就是我们发送命令时，客户端用来缓存命令的一个缓冲区，也就是我们向 Redis 输入数据的输入端缓冲区和 Redis 向客户端返回数据的响应缓存区，输入缓冲区最大 1G 且不能设置，所以这一块我们根本不用担心，如果超过了这个空间，Redis 会直接断开，因为本来此时此刻就代表着 Redis 处理不过来了，我们需要担心的就是输出端缓冲区

![image-20240315113715626](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315113715626.png)

默认配置如下：

```sh
# Both the hard or the soft limit can be disabled by setting them to zero.
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
```

<br/>

我们在使用 Redis 过程中，处理大量的 big value，那么会导致我们的输出结果过多，如果输出缓存区过大，会导致 Redis 直接断开，而默认配置的情况下， 其实他是没有大小的，这就比较坑了，内存可能一下子被占满，会直接导致咱们的 Redis 断开，所以解决方案有两个

- 设置缓冲区大小，避免 Redis 内存溢出导致服务断开。 
- 增加服务带宽，避免我们出现大量数据从而直接超过了 Redis 的承受能力



## 集群最佳实践

集群虽然具备高可用特性，能实现自动故障恢复，但是如果使用不当，也会存在一些问题：

* 集群完整性问题
* 集群带宽问题
* 数据倾斜问题
* 客户端性能问题
* 命令的集群兼容性问题
* Lua 和事务问题

<br/>

 **问题1：在Redis的默认配置中，如果发现任意一个插槽不可用，则整个集群都会停止对外服务：** 

大家可以设想一下，如果有几个 Slot 不能使用，那么此时整个集群都不能用了，我们在开发中，其实最重要的是可用性，所以需要把如下配置修改成 no，即有 Slot 不能使用时，我们的 Redis 集群还是可以对外提供服务

```sh
# By default Redis Cluster nodes stop accepting queries if they detect there
# is at least a hash slot uncovered (no available node is serving it).
# This way if the cluster is partially down (for example a range of hash slots
# are no longer covered) all the cluster becomes, eventually, unavailable.
# It automatically returns available as soon as all the slots are covered again.
#
# However sometimes you want the subset of the cluster which is working,
# to continue to accept queries for the part of the key space that is still
# covered. In order to do so, just set the cluster-require-full-coverage
# option to no.
#
# cluster-require-full-coverage yes
```

<br/>

**问题2：集群带宽问题**

集群节点之间会不断的互相 Ping 来确定集群中其它节点的状态。每次Ping携带的信息至少包括：

* 插槽信息
* 集群状态信息

集群中节点越多，集群状态信息数据量也越大，10 个节点的相关信息可能达到 1KB，此时每次集群互通需要的带宽会非常高，这样会导致集群中大量的带宽都会被 Ping 信息所占用，这是一个非常可怕的问题，所以我们需要去解决这样的问题

**解决途径：**

* 避免大集群，集群节点数不要太多，最好少于1,000，如果业务庞大，则建立多个集群。
* 避免在单个物理机中运行太多 Redis 实例
* 配置合适的 `cluster-node-timeou`t 值

<br/>

**问题3：命令的集群兼容性问题**

有关这个问题咱们已经探讨过了，当我们使用批处理的命令时，Redis 要求我们的 Key 必须落在相同的 Slot上，然后大量的 Key 同时操作时，是无法完成的，所以客户端必须要对这样的数据进行处理，这些方案我们之前已经探讨过了，所以不再这个地方赘述了。

<br/>

**问题4：Lua 和事务的问题**

Lua 和事务都是要保证原子性问题，如果你的 Key 不在一个节点，那么是无法保证 Lua 的执行和事务的特性的，所以在集群模式是没有办法执行 Lua 和事务的

<br/>

**那我们到底是集群还是主从**

单体Redis（主从Redis）已经能达到万级别的QPS，并且也具备很强的高可用特性。如果主从能满足业务需求的情况下，所以如果不是在万不得已的情况下，尽量不搭建Redis集群
