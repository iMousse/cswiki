[[toc]]

<br/>

::: tip 🔖 数据结构总结

 SDS 产生的原因

- C 语言中的字符串获取长度需要运算，时间复杂度为 O(n)
- 字符中不能包含特殊字符，非二进制安全，需要通过结束标识读取数据。
- 一旦声明不可修改

<br/>

SDS 的特性

- 获取字符串长度的时间复杂度为 O(1)
- 二进制安全，可以存放特殊标识。**因为是按照长度读取数据，而不是按照结束标识读取数据。**
- 支持动态扩容，减少分配内存次数

<br/>

Intset 可以看做是特殊的整数数组，具备一些特点

- Redis 会确保 Intset 中的元素唯一、有序
- 具备类型升级机制，可以节省内存空间
- 底层采用二分查找方式来查询

<br/>

Dict 的特性

- 类似 Java 的 HashTable，底层是数组加链表来解决哈希冲突
- Dict 包含两个哈希表，ht[0] 平常用，ht[1] 用来 rehash

<br/>

Dict 的伸缩

- 判断第一个哈希表 （dict.ht[0]） 的负载因子（LoadFactor = used / size）是否大于等于 1 并且没有后台进程，或负载因子大于 5，则扩容；若负载因子小于 0.1 则缩容。
- 如果扩容，则新 size 为第一个大于等于 used + 1 的 2^n^；如果缩容，则新 size 为小于等于 used 的 2^n^(最小为4)。并按照新的 size 申请内存空间，创建 dictht，并赋值给 dict.ht[1]
  - 举例：如果原先 size 为 4，used 为 5，则新 size 扩容为 8；如果原先 size 为 10，used 为 1，则新 size 缩容为 4；
- 设置 dict.rehashidx = 0，标记开始 rehash。将 dict.ht[0] 中的每一个 dictEntry 都 rehash 到 dict.ht[1]。
- 将 dict.ht[1] 赋值给 dict.ht[0]，给 dict.ht[1] 初始化为空哈希表，并将 rehashidx 赋值为 -1，代表 rehash 结束。
  - rehash 是一个渐进式的 rehash。因为如果 Dict 包含数据量过多的 entry，要在一次 rehash 完成则极有可能造成主线程阻塞；所以 Dict 的 rehash 是分多次、渐进式完成。
  - rehash 过程中的新增操作直接写入 ht[1]，查询、修改和删除则会在 ht[0] 和 ht[1] 依次查找并执行。保证 ht[0] 只减不增，随着 rehash 最终结束。

<br/>

ZipList 的特点

- 压缩列表的可以看做一种连续内存空间的"双向链表"
- 列表的节点之间不是通过指针连接，而是记录上一节点和本节点长度来寻址，内存占用较低
- 如果列表数据过多，导致链表过长，可能影响查询性能
- 增或删较大数据时有可能发生连续更新问题，ListPack 解决了连续更新问题

<br/>

QuickList 的特点

- 节点为 ZipList 的双端链表
- 节点采用 ZipList，解决了传统链表的内存占用问题
- 控制了 ZipList 大小，解决连续内存空间申请效率问题
- 中间节点可以压缩，进一步节省了内存

<br/>

SkipList 的特点

- 跳跃表是一个双向链表，每个节点都包含 score 和 ele 值
- 节点按照 score 值排序，score 值一样则按照 ele 字典排序
- 每个节点都可以包含多层指针，层数是 1 到 32 之间的随机数
- 不同层指针到下一个节点的跨度不同，层级越高，跨度越大
- 增删改查效率与红黑树基本一致，实现却更简单

<br/>

**String**：Redis 中最常见的数据存储类型

- 基本编码为 OBJ_ENCODING_RAW，基于 SDS 实现，存储上限为 512 MB
- 如果存储 SDS 长度小于 44 字节则可以采用 OBJ_ENCODING_EMBSTR 编码，此时 object head 和 SDS 是一段连续的空间，效率更高。
- 如果存储的字符串是整数值，并且在 LONG_MAX 范围内，则会采用 OBJ_ENCODING_INT 编码，将字符串转换为 Long 类型后直接将数据保存在 RedisObject 的 ptr 指针位置，刚好为 8 字节。

<br/>

**List**：Redis 的 List 结构类似一个双端链表，可以从首尾操作列表

- 在 3.2 版本之前，Redis 采用 ZipList 和 LinkedList 来实现 List
- 在 3.2 版本之后，Redis 统一采用 QuickList 来实现 List

<br/>

**Set**：Redis 中的集合，不一定确保元素有序，可以满足元素唯一、查询效率要求极高。

- 为了查询效率和唯一性，Set 采用了 OBJ_ENCODING_HT 编码。Dict 的 Key 保存元素，Value 为 null
- 当存储所有的数据都是整数，并且元素不超过 512，采用 OBJ_ENCODING_INSET 编码节省内存

<br/>

**ZSet**：Redis 中的 ZSet，可以满足键值存储、键必须唯一、可排序

- 键值存储、键必须唯一可以采用 OBJ_ENCODING_HT 编码；可以排序，并且可以同时存储 score 和 element 采用 OBJ_ENCODING_SKIPLIST 实现。
- 当元素不多时，ZSet 采用 OBJ_ENCODING_ZIPLIST 节省内存；但由于 ZipList 没有排序功能，所以需要 ZSet 编码实现
  - score 和 element 是紧挨着的 entry ，element 在前，score 在后
  - 按照 score 生序排列；score 越小越接近对首，score 越大越接近队尾

<br/>

**Hash**：Redis 中的 Hash 都是键值存储，并且键唯一，可以通过键获取值。

- Hash 结构默认采用 ZipList 编码，用以节省内存。 ZipList 中相邻的两个 Entry 分别保存 Field 和 Value
- 当数据量较大时，Hash 结构会转为 OBJ_ENCODING_HT。因为 ZipList 底层是连续的内存空间，这种结构节约内存，但不适合做修改，容易引发内存拷贝。

:::

数据结构
--------

### SDS

我们都知道 Redis 中保存的 Key 是字符串，Value 往往是字符串或者字符串的集合。可见字符串是 Redis 中最常用的一种数据结构。

<br/>

不过 Redis 没有直接使用 C 语言中的字符串，因为 C 语言字符串存在很多问题：

- 获取字符串长度的需要通过运算，时间复杂度 O(n)

  ```c
  // c语言，声明字符串
  char* s = "hello"
  // 本质是字符数组，并且带上结束标识 {'h', 'e', 'l', 'l', 'o', '\0'}
  ```

- 非二进制安全：通过结束标识读取数据，所以在字符中不能包含特殊字符。
- 不可修改

<br/>

Redis 构建了一种新的字符串结构，称为简单动态字符串（**S**imple **D**ynamic **S**tring），简称SDS。

例如，我们执行命令：

```sh
127.0.0.1:6379> set name 慕斯
OK
```

那么 Redis 将在底层创建两个 SDS，其中一个是包含 “name” 的 SDS，另一个是包含 “慕斯” 的 SDS。

<br/>

Redis 是 C 语言实现的，其中 SDS 是一个结构体，源码如下：

![image-20240315143634713](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315143634713.png)

<br/>

例如，一个包含字符串 `name` 的 SDS 结构如下：

![image-20240315161319498](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315161319498.png)

<br/>

SDS 之所以叫做动态字符串，是因为它具备动态扩容的能力，例如一个内容为 `hi` 的 SDS：

<img src="https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315161347086.png" alt="image-20240315161347086" style="zoom:50%;" />

<br/>

假如我们要给 SDS 追加一段字符串 `,Amy`，这里首先会申请新内存空间：

- 如果新字符串小于 1M，则新空间为扩展后字符串长度的两倍 +1；
- 如果新字符串大于 1M，则新空间为扩展后字符串长度 +1M+1。称为**内存预分配**。
  - 注意：+1 是要带上的结束标识。

![image-20240315161435077](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315161435077.png)

<br/>

:::tip 📌 SDS 数据的优点

- 获取字符串长度的时间复杂度为 O(1)
- 支持动态扩容，减少分配内存次数
- 二进制安全，可以存放特殊标识。**因为是按照长度读取数据，而不是按照结束标识读取数据。**

:::

<br/>

### IntSet

IntSet 是 Redis 中 Set 集合的一种实现方式，基于整数数组来实现，并且具备长度可变、有序等特征。

**结构如下**

![image-20240315144039690](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315144039690.png)

<br/>

其中的 encoding 包含三种模式，表示存储的整数大小不同：

![image-20240315144054030](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315144054030.png)

<br/>

为了方便查找，Redis 会将 intset 中所有的整数**按照升序**依次保存在 contents 数组中，结构如图：

![image-20240315161449022](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315161449022.png)

现在，数组中每个数字都在 `int16_t` 的范围内，因此采用的编码方式是 `INTSET_ENC_INT16`，每部分占用的字节大小为：

- encoding：4字节
- length：4字节
- contents：2字节 * 3  = 6字节

> 💡思考：为什么 contents 都采用相同的字节存储数据。**方便根据角标查询数据。**

<br/>

#### IntSet升级

现在，假设有一个 intset，元素为 [5，10，20]，采用的编码是 INTSET_ENC_INT16，则每个整数占 2 字节：

![image-20240315161504954](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315161504954.png)

我们向该其中添加一个数字：50,000，这个数字超出了 int16_t 的范围，intset 会自动<font color=red>升级</font>编码方式到合适的大小。

<br/>

以当前案例来说流程如下：

* 升级编码为 <font color=red>INTSET_ENC_INT32</font>, 每个整数占 4字节，并按照新的编码方式及元素个数扩容数组

* **倒序**依次将数组中的元素拷贝到扩容后的正确位置

![image-20240315161517606](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315161517606.png)

* 将待添加的元素放入数组末尾

![image-20240315161529373](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315161529373.png)

* 最后，将 inset 的 encoding 属性改为INTSET_ENC_INT32，将 length 属性改为 4

![image-20240315161540277](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315161540277.png)<br/>

> 💡 思考：为什么要倒序一次将数组中的元素拷贝到正确位置。
>
> 因为正序扩容会将后面的数据覆盖，而倒序则不会覆盖数据。

<br/>

#### Insert新增流程

![image-20240315144530223](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315144530223.png)

<br/>

#### Insert升级流程

![image-20240315144538221](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315144538221.png)

<br/>

:::warning 💡总结：Intset 可以看做是特殊的整数数组，具备一些特点

* Redis 会确保 Intset 中的元素唯一、有序
* 具备类型升级机制，可以节省内存空间
* 底层采用二分查找方式来查询

:::

<br/>

### Dict

我们知道Redis是一个键值型（Key-Value Pair）的数据库，我们可以根据键实现快速的增删改查。而键与值的映射关系正是通过Dict来实现的。

Dict由三部分组成，分别是：哈希表（DictHashTable）、哈希节点（DictEntry）、字典（Dict）

**DictHashTable**、**DictEntry**  

![image-20240315144804052](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315144804052.png)

注意：union 结构是一个泛型，4个数据只能满足一个。

<br/>

当我们向 Dict 添加键值对时，Redis 首先根据 key 计算出 hash 值（h），然后利用 h & sizemask 来计算元素应该存储到数组中的哪个索引位置。我们存储 k1 = v1 ，假设 k1 的哈希值 h = 1，则 1 & 3 = 1，因此k1 = v1要存储到数组角标1位置。

> 注意：2^n -1 可以使用与运算 & 代替取模 % 运算，效率更高

<br/>

k1 和 k2 哈希冲突的情况，直接往队首添加更方便，不需要遍历链表

![image-20240315161711074](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315161711074.png)

<br/>

**Dict**

![image-20240315145257633](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315145257633.png)

<br/>

**结构展示**

![image-20240315161727721](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315161727721.png)

<br/>

#### Dict的扩容

Dict 中的 HashTable 就是数组结合单向链表的实现，当集合中元素较多时，必然导致哈希冲突增多，链表过长，则查询效率会大大降低。

Dict 在每次新增键值对时都会检查**负载因子**（LoadFactor = used / size） ，满足以下两种情况时会触发**哈希表扩容**：

- 哈希表的 LoadFactor >= 1，并且服务器没有执行 `BGSAVE` 或者 `BGREWRITEAOF` 等后台进程；
- 哈希表的 LoadFactor > 5 ；

![image-20240315145359792](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315145359792.png)

 <br/>

#### Dict的收缩

Dict除了扩容以外，每次删除元素时，也会对负载因子做检查，当LoadFactor < 0.1 时，会做哈希表收缩：

![image-20240315145411909](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315145411909.png)

<br/>



#### Dict的rehash

不管是扩容还是收缩，必定会创建新的哈希表，导致哈希表的 size 和 sizemask 变化，而 key 的查询与sizemask 有关。因此必须对哈希表中的每一个 key 重新计算索引，插入新的哈希表，这个过程称为rehash。过程是这样的：

1. 计算新 hash表的 realeSize，值取决于当前要做的是扩容还是收缩：
   - 如果是扩容，则新 size 为第一个大于等于 dict.ht[0].used + 1 的 2^n^

   * 如果是收缩，则新 size 为第一个大于等于 dict.ht[0].used 的 2^n^ （不得小于4）

2. 按照新的 realeSize 申请内存空间，创建 dictht，并赋值给 dict.ht[1]

3. 设置 dict.rehashidx = 0，标示开始 rehash

4. 将 dict.ht[0] 中的每一个dictEntry 都 rehash 到 dict.ht[1]

5. 将 dict.ht[1] 赋值给 dict.ht[0]，给 dict.ht[1] 初始化为空哈希表，释放原来的 dict.ht[0] 的内存

6. 将 rehashidx 赋值为 -1，代表 rehash 结束

<br/>

**流程示意图**

需要扩容的数据 k5，v5

![image-20240322161254317](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240322161254317.png)

<br/>

重新计算 hash 表的 realeSize，扩容为 8，按照新的 realeSize 申请内存空间，创建 dictht，并赋值给 dict.ht[1]

![image-20240322162042571](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240322162042571.png)

<br/>

设置 dict.rehashidx = 0，标示开始 rehash，将 dict.ht[0] 中的每一个 dictEntry 都 rehash 到 dict.ht[1]

![image-20240322162151796](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240322162151796.png)

<br/>

将 dict.ht[1] 赋值给 dict.ht[0]，给 dict.ht[1] 初始化为空哈希表，释放原来的 dict.ht[0] 的内存，将 rehashidx 赋值为 -1，代表 rehash 结束

![image-20240322162456812](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240322162456812.png)

<br/>

**特别注意**

Dict 的 rehash 并不是一次性完成的。试想一下，如果 Dict 中包含数百万的 entry，要在一次 rehash 完成，极有可能导致主线程阻塞。因此 Dict 的 rehash 是分多次、渐进式的完成，因此称为 <font color=red>渐进式rehash</font>。流程如下：

1.计算新 hash 表的 realeSize，值取决于当前要做的是扩容还是收缩：

- 如果是扩容，则新 size 为第一个大于等于 dict.ht[0].used + 1 的2^n^

* 如果是收缩，则新 size 为第一个大于等于 dict.ht[0].used 的 2^n^（不得小于4）

2.按照新的 realeSize 申请内存空间，创建 dictht，并赋值给 dict.ht[1]

3.设置 dict.rehashidx = 0，标示开始 rehash

~~4.将 dict.ht[0] 中的每一个dictEntry 都 rehash 到 dict.ht[1]~~

<font color=red>4.每次执行新增、查询、修改、删除操作时，都检查一下 dict.rehashidx 是否大于 -1，如果是则将 dict.ht[0].table[rehashidx] 的 entry 链表 rehash 到 dict.ht[1]，并且将 rehashidx++。直至 dict.ht[0] 的所有数据都 rehash到 dict.ht[1] </font>

5.将 dict.ht[1] 赋值给 dict.ht[0]，给 dict.ht[1] 初始化为空哈希表，释放原来的 dict.ht[0] 的内存

6.将 rehashidx 赋值为 -1，代表 rehash 结束 

7.在 rehash 过程中，新增操作，则直接写入 ht[1]，查询、修改和删除则会在 dict.ht[0] 和 dict.ht[1] 依次查找并执行。这样可以确保 ht[0] 的数据只减不增，随着 rehash 最终为空 

<br/>

:::warning 💡 总结：Dict的结构

- 类似 Java 的 HashTable，底层是数组加链表来解决哈希冲突
- Dict 包含两个哈希表，ht[0] 平常用，ht[1] 用来rehash

**Dict 的伸缩**

- 判断第一个哈希表 （dict.ht[0]） 的负载因子（LoadFactor = used / size）是否大于等于 1 并且没有后台进程，或负载因子大于 5，则扩容；若负载因子小于 0.1 则缩容。

- 如果扩容，则新 size 为第一个大于等于 used + 1 的 2^n^；如果缩容，则新 size 为小于等于 used 的 2^n^(最小为4)。并按照新的 size 申请内存空间，创建 dictht，并赋值给 dict.ht[1]

  - 举例：如果原先 size 为 4，used 为 5，则新 size 扩容为 8；如果原先 size 为 10，used 为 1，则新 size 缩容为 4；

- 设置 dict.rehashidx = 0，标记开始 rehash。将 dict.ht[0] 中的每一个 dictEntry 都 rehash 到 dict.ht[1]。

- 将 dict.ht[1] 赋值给 dict.ht[0]，给 dict.ht[1] 初始化为空哈希表，并将 rehashidx 赋值为 -1，代表 rehash 结束。

  - rehash 是一个渐进式的 rehash。因为如果 Dict 包含数据量过多的 entry，要在一次 rehash 完成则极有可能造成主线程阻塞；所以 Dict 的 rehash 是分多次、渐进式完成。
  - rehash 过程中的新增操作直接写入 ht[1]，查询、修改和删除则会在 ht[0] 和 ht[1] 依次查找并执行。保证 ht[0] 只减不增，随着 rehash 最终结束。

  

:::

<br/>

### ZipList

ZipList 是一种特殊的“双端链表” ，由一系列特殊编码的**连续内存块**组成。可以在任意一端进行压入/弹出操作, 并且该操作的时间复杂度为 O(1)。

![image-20240315161810757](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315161810757.png)

<br/>

![image-20240315145653044](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315145653044.png)

**用途**

![image-169355136195436](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-169355136195436.png)

<br/>

#### ZipListEntry

ZipList 中的 Entry 并不像普通链表那样记录前后节点的指针，<mark>因为记录两个指针要占用16个字节，浪费内存</mark>。而是采用了下面的结构：

![image-20240315145719866](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315145719866.png)

* previous_entry_length：前一节点的长度，占 1 个或 5 个字节。 
    * 如果前一节点的长度小于 254 字节，则采用 1 个字节来保存这个长度值
    * 如果前一节点的长度大于 254 字节，则采用 5 个字节来保存这个长度值，第一个字节为 0xfe，后四个字节才是真实长度数据
* encoding：编码属性，记录 conten t的数据类型（字符串还是整数）以及长度，占用1个、2个或5个字节
* contents：负责保存节点的数据，可以是字符串或整数

<br/>

:::warning 注意：ZipList 中所有存储长度的数值均采用小端字节序，即低位字节在前，高位字节在后。

- 例如：数值0x1234，采用小端字节序后实际存储值为：0x3412

:::

<br/>

#### Encoding编码

ZipListEntry 中的 encoding 编码分为字符串和整数两种：

字符串：如果 encoding 是以“00”、“01”或者“10”开头，则证明 content  是字符串

![image-20240315145925835](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315145925835.png)

<br/>

例如，我们要保存字符串：“ab”和 “bc”

![image-20240325093439335](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240325093439335.png)

![image-20240315145808955](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315145808955.png)

ZipListEntry 中的 encoding 编码分为字符串和整数两种：

* 整数：如果 encoding 是以“11”开始，则证明 content 是整数，且 encoding 固定只占用1个字节

![image-20240315150009641](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315150009641.png)

<br/>

例如，一个 ZipList 中包含两个整数值：“2”和“5”

![image-20240315145955973](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315145955973.png)

![image-20240315150021007](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315150021007.png)

<br/>

#### 连锁更新问题

ZipList 的每个 Entry 都包含 previous_entry_length 来记录上一个节点的大小，长度是 1 个或 5 个字节：

- 如果前一节点的长度小于 254 字节，则采用 1 个字节来保存这个长度值
- 如果前一节点的长度大于等于 254 字节，则采用 5 个字节来保存这个长度值，第一个字节为 0xfe，后四个字节才是真实长度数据

现在，假设我们有N个连续的、长度为 250~253 字节之间的 entry，因此 entry 的 previous_entry_length 属性用 1 个字节即可表示。

<br/>

**如图所示**

![image-20240325095912433](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240325095912433.png)

在队首新增一个 254 bytes 数据

![image-20240315150051486](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315150051486.png)

ZipList 这种特殊情况下产生的连续多次空间扩展操作称之为连锁更新（Cascade Update）。新增、删除都可能导致连锁更新的发生。

<br/>

:::warning 💡 总结：ZipList特性

* 压缩列表的可以看做一种连续内存空间的"双向链表"
* 列表的节点之间不是通过指针连接，而是记录上一节点和本节点长度来寻址，内存占用较低
* 如果列表数据过多，导致链表过长，可能影响查询性能
* 增或删较大数据时有可能发生连续更新问题，ListPack 解决了连续更新问题

:::

<br/>

### QuickList

问题1：ZipList 虽然节省内存，但申请内存必须是连续空间，如果内存占用较多，申请内存效率很低。怎么办？

​	答：为了缓解这个问题，我们必须限制 ZipList 的长度和 entry 大小。

问题2：但是我们要存储大量数据，超出了 ZipList 最佳的上限该怎么办？

​	答：我们可以创建多个 ZipList 来分片存储数据。

问题3：数据拆分后比较分散，不方便管理和查找，这多个 ZipList 如何建立联系？

​	答：Redis 在 3.2 版本引入了新的数据结构 QuickList，它是一个双端链表，只不过链表中的每个节点都是一个 ZipList。

![image-20240315150119317](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315150119317.png)

<br/>

为了避免QuickList中的每个 ZipList 中 entry 过多，Redis 提供了一个配置项：`list-max-ziplist-size` 来限制。

如果值为正，则代表 ZipList 的允许的 entry 个数的最大值。如果值为负，则代表 ZipList 的最大内存大小，分 5 种情况：

* -1：每个ZipList的内存占用不能超过4kb
* -2：每个ZipList的内存占用不能超过8kb
* -3：每个ZipList的内存占用不能超过16kb
* -4：每个ZipList的内存占用不能超过32kb
* -5：每个ZipList的内存占用不能超过64kb

<br/>

其默认值为 -2

```sh
127.0.0.1:6379> config get list-max-ziplist-size
1) "list-max-ziplist-size"
2) "-2"
```

<br/>

除了控制 ZipList 的大小，QuickList 还可以对节点的 ZipList 做压缩。通过配置项  `list-compress-depth `来控制。因为链表一般都是从首尾访问较多，所以首尾是不压缩的。这个参数是控制首尾不压缩的节点个数：

- 0：特殊值，代表不压缩
- 1：标示 QuickList 的首尾各有 1 个节点不压缩，中间节点压缩
- 2：标示 QuickList 的首尾各有 2 个节点不压缩，中间节点压缩以此类推

<br/>

默认值

```sh
127.0.0.1:6379> config get list-compress-depth
1) "list-compress-depth"
2) "0"
```

<br/>

以下是QuickList的和QuickListNode的结构源码：

![image-20240315151008380](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315151008380.png)

<br/>

我们接下来用一段流程图来描述当前的这个结构

![image-20240315151018603](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315151018603.png)

<br/>

:::warning 总结：QuickList 的特点

* 是一个节点为 ZipList 的双端链表
* 节点采用 ZipList，解决了传统链表的内存占用问题
* 控制了 ZipList 大小，解决连续内存空间申请效率问题
* 中间节点可以压缩，进一步节省了内存

:::

<br/>

### SkipList

SkipList（跳表）首先是链表，但与传统链表相比有几点差异：

- 元素按照升序排列存储
- 节点可能包含多个指针，指针跨度不同。

![image-20240315151034097](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315151034097.png)

<br/>

**源码展示**

![image-20240315151119583](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315151119583.png)

<br/>

**流程一**

![image-20240315151129803](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315151129803.png)

<br/>

**流程二**

![image-20240315151137883](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315151137883.png)

<br/>

**流程三**

![image-20240315151150609](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315151150609.png)

<br/>

**流程四**

![image-20240315151206877](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315151206877.png)

<br/>

:::warning 💡总结：SkipList 的特点

* 跳跃表是一个双向链表，每个节点都包含 score 和 ele 值
* 节点按照 score 值排序，score 值一样则按照 ele 字典排序
* 每个节点都可以包含多层指针，层数是 1 到 32 之间的随机数
* 不同层指针到下一个节点的跨度不同，层级越高，跨度越大
* 增删改查效率与红黑树基本一致，实现却更简单

:::

<br/>

### RedisObject

Redis 中的任意数据类型的键和值都会被封装为一个 RedisObject，也叫做 Redis 对象，源码如下：

![image-20240315151347625](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315151347625.png)

指针在 32 位计算机中占 4 个字节，因为指针的本身的值就是内存地址，只有 4 字节才能完整的表示 32 位的内存地址。但是由于 32 位计算机内存最大空间为 2^32^ = 4 GB，有时并不满足内存的使用。所以出现了在64 位计算机，需要 8 个字节才能完整表示 64 位的内存地址。但是 2^64^，这是个很大的值，而物理内存达不到这么大，CPU要实现 64 位的寻址能力只会增加系统复杂度和地址转换成本，因此 Windows 和 Linux 都做了限制，仅仅使用虚拟地址的 48 位，2^48^ = 256 TB。但是指针的占用内存字节数还是8 （只是 Windows 和 Linux 下，低48位有效而已）.

<br/>

> 思考：什么是 RedisObject ?

从 Redis 的使用者的角度来看，⼀个 Redis 节点包含多个 database（非 cluster 模式下默认是16个，cluster 模式下只能是1个），而一个 Database 维护了从 Key Space 到 Object Space 的映射关系。这个映射关系的 Key 是 String 类型，⽽ Value 可以是多种数据类型，

比如：String、List、Hash、Set、Sorted Set 等。我们可以看到，Key 的类型固定是 String，而 Value 可能的类型是多个。

⽽从 Redis 内部实现的⾓度来看，Database 内的这个映射关系是用⼀个 Dict 来维护的。Dict 的 Key 固定用⼀种数据结构来表达就够了，这就是动态字符串 SDS。而 Value 则比较复杂，为了在同⼀个 Dict 内能够存储不同类型的 Value，这就需要⼀个通⽤的数据结构，这个通用的数据结构就是 robj，全名是 RedisObject。

<br/>

#### Redis的编码方式

Redis中会根据存储的数据类型不同，选择不同的编码方式，共包含11种不同类型：

![image-169355136195443](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-169355136195443.png)

<br/>

#### 五种数据结构

Redis中会根据存储的数据类型不同，选择不同的编码方式。每种数据类型的使用的编码方式如下：

![image-169355136195444](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-169355136195444.png)

<br/>

### 五种数据结构

#### String

String 是 Redis 中最常见的数据存储类型：

- 其基本编码方式是 RAW，基于简单动态字符串（SDS）实现，存储上限为 512MB。
- 如果存储的 SDS 长度小于 44 字节，则会采用 EMBSTR 编码，此时 object head 与 SDS 是一段连续空间。<mark>申请内存时只需要调用一次内存分配函数，效率更高。</mark>
- 如果存储的字符串是整数值，并且大小在 LONG_MAX 范围内，则会采用 INT 编码：直接将数据保存在 RedisObject 的 ptr 指针位置（刚好 8 字节），不再需要SDS了。

**底层实现⽅式**：动态字符串 SDS 或者 Long

<br/>

:::warning  💡思考：为什么 SDS 的长度小于 44 字节，而不采用其他字节。

RedisObject 的头占用 16 字节，SDS 数据为 44 字节，SDS 长度和申请的总字节数各占一个字节，SDS 头类型用一个字节标识，最后一个符号位用一个字节，合起来刚好位 64，为2^8^。刚好为一个内存大小，分配时不会产生内存碎片。

:::

<br/>

String 的内部存储结构⼀般是 SDS（**S**imple Dynamic **S**tring，可以动态扩展内存），但是如果⼀个 String类型的 Value 的值是数字，那么 Redis 内部会把它转成 Long 类型来存储，从⽽减少内存的使用。

![image-20240315152525889](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315152525889.png)

 <br/>

![image-20240315152513788](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315152513788.png)

<br/>

确切地说，String 在 Redis 中是⽤⼀个 robj 来表示的。

用来表示 String 的 robj 可能编码成3种内部表⽰：

- OBJ_ENCODING_RAW
- OBJ_ENCODING_EMBSTR
- OBJ_ENCODING_INT

其中前两种编码使⽤的是 SDS 来存储，最后⼀种 OBJ_ENCODING_INT 编码直接把 String 存成了Long 型。

<br/>

::: tip 💡String 进行自增操作的原理

在对 String 进行 incr, decr 等操作的时候，如果它内部是 OBJ_ENCODING_INT 编码，那么可以直接行加减操作；如果它内部是 OBJ_ENCODING_RAW 或 OBJ_ENCODING_EMBSTR 编码，那么Redis 会先试图把 SDS 存储的字符串转成 Long 型，如果能转成功，再进行加减操作。对⼀个内部表示成 Long 型的 String 执行 append, setbit, getrange 这些命令，针对的仍然是 String 的值（即⼗进制表示的字符串），而不是针对内部表⽰的 Long 型进⾏操作。比如字符串 ”32” ，如果按照字符数组来解释，它包含两个字符，它们的 ASCII 码分别是 0x33 和 0x32 。当我们执行命令 `setbit key 7 0` 的时候，相当于把字符 0x33 变成了0x32，这样字符串的值就变成了”22”。⽽如果将字符串”32”按照内部的 64 位 Long 型来解释，那么它是 0x0000000000000020，在这个基础上执⾏ setbit 位操作，结果就完全不对了。因此，在这些命令的实现中，会把 Long 型先转成字符串再进行相应的操作。

:::

<br/>

#### List

Redis 的 List 类型可以从首、尾操作列表中的元素：

```sh
127.0.0.1:6379> LPUSH l1 e3 e2 e1 # 从 head 写入
(integer) 3
127.0.0.1:6379> RPUSH l1 e4 e5 e6 # 从 tail 写入
(integer) 6
127.0.0.1:6379> LRANGE l1 0 6	# 范围获取
1) "e1"
2) "e2"
3) "e3"
4) "e4"
5) "e5"
6) "e6"
127.0.0.1:6379> LPOP l1 1  # 从 head 取
1) "e1"
127.0.0.1:6379> RPOP l1 1  # 从 tail 取
1) "e6"
```

哪一个数据结构能满足上述特征？

* LinkedList ：普通链表，可以从双端访问，内存占用较高，内存碎片较多
* ZipList ：压缩列表，可以从双端访问，内存占用低，存储上限低
* QuickList：LinkedList + ZipList，可以从双端访问，内存占用较低，包含多个 ZipList，存储上限高

<br/>

Redis 的 List 结构类似一个双端链表，可以从首、尾操作列表中的元素：

- 在 3.2 版本之前，Redis 采用 ZipList 和 LinkedList 来实现 List，当元素数量小于 512 并且元素大小小于 64 字节时采用  ZipList 编码，超过则采用 LinkedList 编码。

- 在 3.2 版本之后，Redis 统一采用 QuickList 来实现 List

<br/>

**源码展示**

![image-20240315153403755](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315153403755.png)

<br/>

**数据结构**

![image-20240315153358601](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315153358601.png)

<br/>

#### Set

Set 是 Redis 中的单列集合，满足下列特点：

* 不保证有序性
* 保证元素唯一
* 求交集、并集、差集

```sh
127.0.0.1:6379> SADD s1 m1 m2 m3
(integer) 3
127.0.0.1:6379> SADD s2 m2 m3 m4
(integer) 3
127.0.0.1:6379> SISMEMBER S1 m1  # 判断元素是否存在
(integer) 0
127.0.0.1:6379> SINTER s1 s2     # 求交集
1) "m2"
2) "m3"
```

可以看出，Set 对查询元素的效率要求非常高，思考一下，什么样的数据结构可以满足？

- HashTable，也就是 Redis 中的 Dict，不过 Dict 是双列集合（可以存键、值对）

<br/>

Set 是 Redis 中的集合，不一定确保元素有序，可以满足元素唯一、查询效率要求极高。

- 为了查询效率和唯一性，Set 采用 HT 编码（Dict）。Dict 中的 Key 用来存储元素，Value 统一为 null
- 当存储的所有数据都是整数，并且元素数量不超过 set-max-intset-entries 时，Set 会采用 IntSet 编码，以节省内存
    - set-max-intset-entries 的默认值是 512

<br/>

**源码展示**

![image-20240315155258069](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315155258069.png)

<br/>

**结构如下**

![image-20240325142215776](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240325142215776.png)

![image-20240325142258890](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240325142258890.png)

<br/>

#### ZSet

ZSet 也就是 SortedSet，其中每一个元素都需要指定一个 Score 值和 Member 值：

* 可以根据 Score 值排序后
* Member 必须唯一
* 可以根据 Member 查询分数

```sh
127.0.0.1:6379> ZADD z1 10 m1 20 m2 30 m3
(integer) 3
127.0.0.1:6379> ZSCORE z1 m1 # 根据member查询分数
"10"
```

<br/>

因此，Zset 底层数据结构必须满足<mark>键值存储、键必须唯一、可排序</mark>这几个需求。之前学习的哪种编码结构可以满足？

* SkipList：可以排序，并且可以同时存储 Score 和 ele值（member）
* HT（Dict）：可以键值存储，并且可以根据 Key 找 Value

<br/>

**源码展示**

![image-20240315155639854](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315155639854.png)

<br/>

**数据结构**

![image-20240315155654680](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315155654680.png)

<br/>

当元素数量不多时，HT 和 SkipList 的优势不明显，而且更耗内存。因此 Zset 还会采用 ZipList 结构来节省内存，不过需要同时满足两个条件：

* 元素数量小于 zset_max_ziplist_entries，默认值 128
* 每个元素都小于 zset_max_ziplist_value 字节，默认值 64

<br/>

![image-20240315155805345](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315155805345.png)

<img src="https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315155822660.png" alt="image-20240315155822660" style="zoom:50%;" />

<br/>

Ziplist 本身没有排序功能，而且没有键值对的概念，因此需要有 Zset 通过编码实现：

* ZipList 是连续内存，因此 Score 和 Element 是紧挨在一起的两个 Entry， Element 在前，Score 在后
* Score 越小越接近队首，Score 越大越接近队尾，按照 Score 值升序排列

![image-20240315155845189](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315155845189.png)

<br/>

#### Hash

hash结构如下

```sh
127.0.0.1:6379> HSET user:1 name Jack age 21
(integer) 2
127.0.0.1:6379> HGET user:1 name  # 根据 field 获取 value
"Jack"
```

zset集合如下

```sh
127.0.0.1:6379> ZADD z1 10 m1 20 m2 30 m3
(integer) 3
127.0.0.1:6379> ZSCORE z1 m1 # 根据member查询分数
"10"
```

<br/>

Hash 结构与 Redis 中的 Zset 非常类似：

* 都是键值存储
* 都需求根据键获取值
* 键必须唯一

区别如下：

* Zset 的键是 Member，值是 Score；Hash 的键和值都是任意值
* Zset 要根据 Score 排序；Hash 则无需排序

<br/>

因此，Hash 底层采用的编码与 Zset 也基本一致，只需要把排序有关的 SkipList 去掉即可：

- Hash 结构默认采用 ZipList 编码，用以节省内存。 ZipList 中相邻的两个 Entry 分别保存 Field 和 Value

- 当数据量较大时，Hash 结构会转为HT编码，也就是 Dict，触发条件有两个：
  - ZipList 中的元素数量超过了 hash-max-ziplist-entries（默认512）
  - ZipList 中的任意 Entry 大小超过了 hash-max-ziplist-value（默认64字节）

<br/>

![image-20240315160556831](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315160556831.png)

![image-20240315160651164](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315160651164.png)

<br/>

Redis 的 Hash 之所以这样设计，是因为当 Ziplist 变得很⼤的时候，它有如下几个缺点：

* 每次插⼊或修改引发的 realloc 操作会有更⼤的概率造成内存拷贝，从而降低性能。
* ⼀旦发生内存拷贝，内存拷贝的成本也相应增加，因为要拷贝更⼤的⼀块数据。
* 当 Ziplist 数据项过多的时候，在它上⾯查找指定的数据项就会性能变得很低，因为 Ziplist 上的查找需要进行遍历。

总之，Ziplist 本来就设计为各个数据项挨在⼀起组成连续的内存空间，这种结构并不擅长做修改操作。⼀旦数据发⽣改动，就会引发内存 realloc，可能导致内存拷贝。

<br/>

**代码实现**

![image-20240315161019325](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315161019325.png)



