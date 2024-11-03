[[toc]]



## 商户查询缓存

### 什么是缓存?

就像自行车,越野车的避震器

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/避震器.gif)

举个例子:越野车,山地自行车,都拥有"避震器",**防止**车体加速后因惯性,在酷似"U"字母的地形上飞跃,硬着陆导致的**损害**,像个弹簧一样;

同样,实际开发中,系统也需要"避震器",防止过高的数据访问猛冲系统,导致其操作线程无法及时处理信息而瘫痪;

这在实际开发中对企业讲,对产品口碑,用户评价都是致命的;所以企业非常重视缓存技术;

<br/>

**缓存(**Cache),就是数据交换的**缓冲区**,俗称的缓存就是**缓冲区内的数据**,一般从数据库中获取,存储于本地代码。

<br/>

**例如**

```java
//例1:本地用于高并发
static final ConcurrentHashMap<K,V> map = new ConcurrentHashMap<>(); 

//例2:用于redis等缓存
static final Cache<K,V> USER_CACHE = CacheBuilder.newBuilder().build(); 

//例3:本地缓存
static final Map<K,V> map =  new HashMap(); 
```

由于其被 **static** 修饰,所以随着类的加载而被加载到 **内存之中**，作为本地缓存，由于其又被 **final** 修饰,所以其引用( `例3:map` )和对象( `例3:new HashMap()` )之间的关系是固定的，不能改变，因此不用担心赋值(=)导致缓存失效;

<br/>

####  为什么要使用缓存

一句话:因为**速度快,好用**

缓存数据存储于代码中,而代码运行在内存中,内存的读写性能远高于磁盘,缓存可以大大降低**用户访问并发量带来的**服务器读写压力。实际开发过程中,企业的数据量,少则几十万,多则几千万,这么大数据量,如果没有缓存来作为"避震器",系统是几乎撑不住的,所以企业会大量运用到缓存技术;

但是缓存也会增加代码复杂度和运营的成本:

![image-20240313235859147](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313235859147.png)

<br/>

#### 如何使用缓存

实际开发中,会构筑多级缓存来使系统运行速度进一步提升,例如:本地缓存与 Redis 中的缓存并发使用

- **浏览器缓存**：主要是存在于浏览器端的缓存
- **应用层缓存**：可以分为 Tomcat 本地缓存，比如之前提到的 map，或者是使用 Redis 作为缓存
- **数据库缓存**：在数据库中有一片空间是 buffer pool，增改查数据都会先加载到 MySQL 的缓存中
- **CPU缓存**：当代计算机最大的问题是 CPU 性能提升了，但内存读写速度没有跟上，所以为了适应当下的情况，增加了CPU的L1，L2，L3级的缓

![image-20240313235700466](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313235700466.png)

<br/>

### 添加商户缓存

在我们查询商户信息时，我们是直接操作从数据库中去进行查询的，大致逻辑是这样，直接查询数据库那肯定慢咯，所以我们需要增加缓存

```java
@GetMapping("/{id}")
public Result queryShopById(@PathVariable("id") Long id) {
    //这里是直接查询数据库
    return shopService.queryById(id);
}
```

<br/>

**缓存模型和思路**

标准的操作方式就是查询数据库之前先查询缓存，如果缓存数据存在，则直接从缓存中返回，如果缓存数据不存在，再查询数据库，然后将数据存入 Redis。

![image-20240314000019817](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314000019817.png)

<br/>

**代码如下**

代码思路：如果缓存有，则直接返回，如果缓存不存在，则查询数据库，然后存入 Redis。

```java
package com.hmdp.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.hmdp.dto.Result;
import com.hmdp.entity.Shop;
import com.hmdp.mapper.ShopMapper;
import com.hmdp.service.IShopService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import static com.hmdp.utils.RedisConstants.CACHE_SHOP_KEY;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author 虎哥
 * @since 2021-12-22
 */
@Service
public class ShopServiceImpl extends ServiceImpl<ShopMapper, Shop> implements IShopService {

    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Override
    public Result queryById(Long id) {
        // 从 Redis 中查询缓存，存在则直接返回
        String key = CACHE_SHOP_KEY + id;
        String shopJson = redisTemplate.opsForValue().get(key);
        if (StrUtil.isNotBlank(shopJson)) {
            Shop shop = JSONUtil.toBean(shopJson, Shop.class);
            return Result.ok(shop);
        }
        
        // 不存在则查询数据库并写入 Redis
        Shop shop = getById(id);
        if (shop == null) {
            return Result.fail("店铺不存在");
        }
        redisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(shop));

        return Result.ok(shop);
    }
    
}
```

<br/>

### 缓存更新策略

缓存更新是 Redis 为了节约内存而设计出来的一个东西，主要是因为内存数据宝贵，当我们向 Redis 插入太多数据，此时就可能会导致缓存中的数据过多，所以 Redis 会对部分数据进行更新，或者把他叫为淘汰更合适。

- **内存淘汰**：Redis 自动进行，当 Redis 内存达到咱们设定的 max-memery 的时候，会自动触发淘汰机制，淘汰掉一些不重要的数据(可以自己设置策略方式)
- **超时剔除**：当我们给 Redis 设置了过期时间 TTL 之后，Redis 会将超时的数据进行删除，方便咱们继续使用缓存
- **主动更新**：我们可以手动调用方法把缓存删掉，通常用于解决缓存和数据库不一致问题

![image-20240314000112098](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314000112098.png)

:::tip 💡 提示：业务场景

- 低一致性需求：使用内存淘汰机制。例如店铺类型的查询缓存
- 高一致性需求：主动更新，并以超时剔除作为兜底方案。例如店铺详情查询的缓存

:::

<br/>

**数据库缓存不一致解决方案**

由于我们的**缓存的数据源来自于数据库**,而数据库的**数据是会发生变化的**,因此,如果当数据库中**数据发生变化,而缓存却没有同步**,此时就会有**一致性问题存在**,其后果是:

用户使用缓存中的过时数据,就会产生类似多线程数据安全问题,从而影响业务,产品口碑等;怎么解决呢？有如下几种方案

- Cache Aside Pattern 人工编码方式：缓存调用者在更新完数据库后再去更新缓存，也称之为双写方案
- Read/Write Through Pattern : 由系统本身完成，数据库与缓存的问题交由系统本身去处理
- Write Behind Caching Pattern ：调用者只操作缓存，其他线程去异步处理数据库，实现最终一致


![image-20240314000214431](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314000214431.png)

<br/>

**数据库和缓存不一致采用什么方案**

综合考虑使用方案一，但是方案一调用者如何处理呢？这里有几个问题

操作缓存和数据库时有三个问题需要考虑：

* 删除缓存还是更新缓存？
    * 更新缓存：每次更新数据库都更新缓存，无效写操作较多
    * 删除缓存：更新数据库时让缓存失效，查询时再更新缓存

如果采用第一个方案，那么假设我们每次操作数据库后，都操作缓存，但是中间如果没有人查询，那么这个更新动作实际上只有最后一次生效，中间的更新动作意义并不大，我们可以把缓存删除，等待再次查询时，将缓存中的数据加载出来

<br/>

* 如何保证缓存与数据库的操作的同时成功或失败？
    * 单体系统，将缓存与数据库操作放在一个事务
    * 分布式系统，利用TCC等分布式事务方案

<br/>

* 先操作缓存还是先操作数据库？
    * 先删除缓存，再操作数据库
    * 先操作数据库，再删除缓存

<br/>

先删除缓存还是先修改数据库：都有可能导致脏数据。

- 先删除缓存在操作数据库：线程一删除缓存，在没有更新数据库之前线程二将数据库中的数据写入缓存。
- 先操作数据库在删除缓存：线程一未命中缓存，这时线程二在更新数据库并进行缓存删除，线程一将没修改之前的数据写入缓存。

![image-20231216180536502](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231216180536502.png)

<br/>

- **为什么要删除两次缓存**：降低出现脏数据的风险。
- **为什么要延迟双删**：主从模式同步数据会有延迟，但是延迟的时间不好控制，都会有出现脏数据的风险。

![image-20231216175940975](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231216175940975.png)

<br/>

:::warning 💡 总结：缓存更新策略最佳实践方案

- 低一致性需求：使用 Redis 自带的内存淘汰机制
- 高一致性需求：主动更新，并以超时剔除作为兜底方案
  - 读操作：缓存命中则直接返回缓存未命中则查询数据库，并写入缓存，设定超时时间
  - 写操作：先写数据库，然后再删除缓存要确保数据库与缓存操作的原子性

:::

<br/>

案例：给查询商铺的缓存添加超时剔除和主动更新的策略

修改 `ShopController` 中的业务逻辑，满足下面的需求：

- 根据id查询店铺时，如果缓存未命中，则查询数据库，将数据库结果写入缓存，并设置超时时间
- 根据id修改店铺时，先修改数据库，再删除缓存

<br/>

**代码实现**

```java {49,54-68}
package com.hmdp.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.hmdp.dto.Result;
import com.hmdp.entity.Shop;
import com.hmdp.mapper.ShopMapper;
import com.hmdp.service.IShopService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

import static com.hmdp.utils.RedisConstants.CACHE_SHOP_KEY;
import static com.hmdp.utils.RedisConstants.CACHE_SHOP_TTL;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author 虎哥
 * @since 2021-12-22
 */
@Service
public class ShopServiceImpl extends ServiceImpl<ShopMapper, Shop> implements IShopService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public Result queryById(Long id) {
        // 从 Redis 中查询缓存，存在则直接返回
        String key = CACHE_SHOP_KEY + id;
        String shopJson = redisTemplate.opsForValue().get(key);
        if (StrUtil.isNotBlank(shopJson)) {
            Shop shop = JSONUtil.toBean(shopJson, Shop.class);
            return Result.ok(shop);
        }

        // 不存在则查询数据库并写入 Redis
        Shop shop = getById(id);
        if (shop == null) {
            return Result.fail("店铺不存在");
        }
        redisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(shop),CACHE_SHOP_TTL, TimeUnit.MINUTES);

        return Result.ok(shop);
    }

    @Override
    @Transactional
    public Result update(Shop shop) {
        Long id = shop.getId();
        if (id == null) {
            return Result.fail("店铺id不能为空");
        }

        // 更新数据库
        updateById(shop);

        // 删除缓存
        redisTemplate.delete(CACHE_SHOP_KEY + id);
        return Result.ok();
    }

}
```

<br/>

### 缓存穿透

**缓存穿透**是指客户端请求的数据在缓存中和数据库中都不存在，这样缓存永远不会生效，这些请求都会打到数据库。

常见的解决方案有两种：

* 缓存空对象
    * 优点：实现简单，维护方便
    * 缺点：额外的内存消耗，并且可能造成短期的不一致
* 布隆过滤
    * 优点：内存占用较少，没有多余key
    * 缺点：实现复杂，并且存在误判可能

![image-20240314001232313](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314001232313.png)

<br/>

**缓存空对象**：当我们客户端访问不存在的数据时，先请求redis，但是此时redis中没有数据，此时会访问到数据库，但是数据库中也没有数据，这个数据穿透了缓存，直击数据库，我们都知道数据库能够承载的并发不如redis这么高，如果大量的请求同时过来访问这种不存在的数据，这些请求就都会访问到数据库，简单的解决方案就是哪怕这个数据在数据库中也不存在，我们也把这个数据存入到redis中去，这样，下次用户过来访问这个不存在的数据，那么在redis中也能找到这个数据就不会进入到缓存了

<br/>

**布隆过滤器**：

Bitmap（位图）：相当于是一个bit位为单位的数组，数组中每个单元只能存储二进制数0或1

布隆过滤器作用：用于检索一个元素是否在一个集合中。

![image-20231216132841456](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231216132841456.png)

实现误判的情况

![image-20231216133246158](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231216133246158.png)

误判率：数组越小误判率就越大，数组越大误判率就越小，但是同时带来了更多的内存消耗。

<br/>

**解决商品查询的缓存穿透**

:::tip 🔖  核心思路如下

在原来的逻辑中，我们如果发现这个数据在 MySQL 中不存在，直接就返回404了，这样是会存在缓存穿透问题的

现在的逻辑中：如果这个数据不存在，我们不会返回404 ，还是会把这个数据写入到Redis中，并且将value设置为空，当再次发起查询时，我们如果发现命中之后，判断这个value是否是null，如果是null，则是之前写入的数据，证明是缓存穿透数据，如果不是，则直接返回数据。

:::

![image-20240314001411043](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314001411043.png)

<br/>

**代码实现**

```java {11-16,21}
@Override
public Result queryById(Long id) {
    // 从 Redis 中查询缓存，存在则直接返回
    String key = CACHE_SHOP_KEY + id;
    String shopJson = redisTemplate.opsForValue().get(key);
    if (StrUtil.isNotBlank(shopJson)) {
        Shop shop = JSONUtil.toBean(shopJson, Shop.class);
        return Result.ok(shop);
    }

    // shopJson 为 "" 则返回报错，店铺不存在。
    // shopJson == null 则添加 "" 空数据
    if (shopJson != null) {
        // 返回一个错误信息
        return Result.fail("店铺信息不存在！");
    }

    // 不存在则查询数据库并写入 Redis
    Shop shop = getById(id);
    if (shop == null) {
        redisTemplate.opsForValue().set(key, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
        return Result.fail("店铺不存在");
    }
    redisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(shop),CACHE_SHOP_TTL, TimeUnit.MINUTES);

    return Result.ok(shop);
}
```

:::warning 💡总结：缓存穿透产生的原因是什么？

* 用户请求的数据在缓存中和数据库中都不存在，不断发起这样的请求，给数据库带来巨大压力

<br/>

**缓存穿透的解决方案有哪些**？

* 缓存null值
* 布隆过滤
* 增强id的复杂度，避免被猜测id规律
* 做好数据的基础格式校验
* 加强用户权限校验
* 做好热点参数的限流

:::

<br/>

### 缓存雪崩

**缓存雪崩**是指在同一时段大量的缓存 key 同时失效或者 Redis 服务宕机，导致大量请求到达数据库，带来巨大压力。

**解决方案**

* 给不同的Key的TTL添加随机值
* 利用Redis集群提高服务的可用性
* 给缓存业务添加降级限流策略
* 给业务添加多级缓存
  * 【多个层面建立缓存，浏览器添加缓存，反向代理服务器Nginx加缓存，redis加缓存，jvm加缓存，数据库加缓存】SpringCloud 中用到


![image-20240314001438687](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314001438687.png)

<br/>

### 缓存击穿

**缓存击穿问题**也叫热点Key问题，就是一个被高并发访问并且**缓存重建业务较复杂**的key突然失效了，无数的请求访问会在瞬间给数据库带来巨大的冲击。

常见的解决方案有两种：

* 互斥锁
* 逻辑过期

<br/>

:::warning 🔖  逻辑分析

假设线程1在查询缓存之后，本来应该去查询数据库，然后把这个数据重新加载到缓存的，此时只要线程1走完这个逻辑，其他线程就都能从缓存中加载这些数据了，但是假设在线程1没有走完的时候，后续的线程2，线程3，线程4同时过来访问当前这个方法， 那么这些线程都不能从缓存中查询到数据，那么他们就会同一时刻来访问查询缓存，都没查到，接着同一时间去访问数据库，同时的去执行数据库代码，对数据库访问压力过大。

:::

![image-20240314001507078](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314001507078.png)

<br/>

解决方案一：互斥锁

因为锁能实现互斥性。假设线程过来，只能一个人一个人的来访问数据库，从而避免对于数据库访问压力过大，但这也会影响查询的性能，因为此时会让查询的性能从并行变成了串行，我们可以采用 tryLock 方法 + double check 来解决这样的问题。

假设现在线程1过来访问，他查询缓存没有命中，但是此时他获得到了锁的资源，那么线程1就会一个人去执行逻辑，假设现在线程2过来，线程2在执行过程中，并没有获得到锁，那么线程2就可以进行到休眠，直到线程1把锁释放后，线程2获得到锁，然后再来执行逻辑，此时就能够从缓存中拿到数据了。

![image-20240314001854653](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314001854653.png)

<br/>

解决方案二：逻辑过期

方案分析：我们之所以会出现这个缓存击穿问题，主要原因是在于我们对 Key 设置了过期时间，假设我们不设置过期时间，其实就不会有缓存击穿的问题，但是不设置过期时间，这样数据不就一直占用我们内存了吗，我们可以采用逻辑过期方案。

我们把过期时间设置在 redis 的 value 中，注意：这个过期时间并不会直接作用于 redis，而是我们后续通过逻辑去处理。假设线程1去查询缓存，然后从 value 中判断出来当前的数据已经过期了，此时线程1去获得互斥锁，那么其他线程会进行阻塞，获得了锁的线程他会开启一个 线程去进行 以前的重构数据的逻辑，直到新开的线程完成这个逻辑后，才释放锁， 而线程1直接进行返回，假设现在线程3过来访问，由于线程线程2持有着锁，所以线程3无法获得锁，线程3也直接返回数据，只有等到新开的线程2把重建数据构建完后，其他线程才能走返回正确的数据。

这种方案巧妙在于，异步的构建缓存，缺点在于在构建完缓存之前，返回的都是脏数据。

<br/>

**解决方案对比**

![image-16935513619542](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-16935513619542.png)

**互斥锁方案**：由于保证了互斥性，所以数据一致，且实现简单，因为仅仅只需要加一把锁而已，也没其他的事情需要操心，所以没有额外的内存消耗，缺点在于有锁就有死锁问题的发生，且只能串行执行性能肯定受到影响

**逻辑过期方案：** 线程读取过程中不需要等待，性能好，有一个额外的线程持有锁去进行重构数据，但是在重构数据完成前，其他的线程只能返回之前的数据，且实现起来麻烦

<br/>

#### 互斥锁

核心思路：相较于原来从缓存中查询不到数据后直接查询数据库而言，现在的方案是 进行查询之后，如果从缓存没有查询到数据，则进行互斥锁的获取，获取互斥锁后，判断是否获得到了锁，如果没有获得到，则休眠，过一会再进行尝试，直到获取到锁为止，才能进行查询

如果获取到了锁的线程，再去进行查询，查询后将数据写入redis，再释放锁，返回数据，利用互斥锁就能保证只有一个线程去执行操作数据库的逻辑，防止缓存击穿

<br/>

**需求：修改根据id查询商铺的业务，基于互斥锁方式来解决缓存击穿问题**

![image-20240314002011916](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314002011916.png)

<br/>

**操作锁的代码：**

核心思路就是利用 Redis 的 setnx 方法来表示获取锁，该方法含义是 Redis 中如果没有这个 Key，则插入成功，返回 1，在 StringRedisTemplate 中返回 True，  如果有这个 Key 则插入失败，则返回 0，在 StringRedisTemplate 返回 False，我们可以通过 True，或者是 False，来表示是否有线程成功插入 Key，成功插入的 Key 的线程我们认为他就是获得到锁的线程。

```java
private boolean tryLock(String key) {
    Boolean flag = stringRedisTemplate.opsForValue().setIfAbsent(key, "1", 10, TimeUnit.SECONDS);
    return BooleanUtil.isTrue(flag);
}

private void unlock(String key) {
    stringRedisTemplate.delete(key);
}
```

<br/>

**操作代码：**

```java
private Shop queryWithMuteX(Long id) {
    // 通过店铺ID获取店铺信息
    String shop_key = CACHE_SHOP_KEY + id;
    String shopJson = stringRedisTemplate.opsForValue().get(shop_key);

    // 如果店铺信息不为空则返回店铺信息
    if (StrUtil.isNotBlank(shopJson)) {
        return JSONUtil.toBean(shopJson, Shop.class);
    }

    // 判断是否是空值，如果是空值则返回店铺信息为空，防止缓存穿透
    if (shopJson != null) {
        return null;
    }

    // 声明锁和店铺
    String lock_key = LOCK_SHOP_KEY + id;
    Shop shop = null;

    try {
        // 判断获取锁是否成功
        boolean flag = tryLock(lock_key);

        // 不成功则重新休眠在获取
        if (!flag) {
            Thread.sleep(50);
            queryWithMuteX(id);
        }

        // DoubleCheck 获取锁成功后在此检测redis缓存是否存在，不存在则根据id查询数据库
        String shopLockJson = stringRedisTemplate.opsForValue().get(shop_key);

        if (shopLockJson != null) {
            return JSONUtil.toBean(shopLockJson, Shop.class);
        }

        shop = getById(id);
        if (shop == null) {
            stringRedisTemplate.opsForValue().set(shop_key, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
            return null;
        }

        // 如果店铺存在则设置缓存并设置过期时间
        stringRedisTemplate.opsForValue().set(shop_key, JSONUtil.toJsonStr(shop), CACHE_SHOP_TTL, TimeUnit.MINUTES);
    } catch (Exception e) {
        throw new RuntimeException(e);
    } finally {
        // 释放互斥锁
        unlock(lock_key);
    }


    return shop;
}
```

<br/>

####  逻辑过期

**需求：修改根据id查询商铺的业务，基于逻辑过期方式来解决缓存击穿问题**

思路分析：当用户开始查询redis时，判断是否命中，如果没有命中则直接返回空数据，不查询数据库，而一旦命中后，将value取出，判断value中的过期时间是否满足，如果没有过期，则直接返回redis中的数据，如果过期，则在开启独立线程后直接返回之前的数据，独立线程去重构数据，重构完成后释放互斥锁。

![image-20240314002043283](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314002043283.png)

如果封装数据：因为现在redis中存储的数据的value需要带上过期时间，此时要么你去修改原来的实体类，要么你新建一个实体类，我们采用第二个方案，这个方案，对原来代码没有侵入性。

**步骤一**

```java
package com.hmdp.utils;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RedisData {
    private LocalDateTime expireTime;
    private Object data;
}
```

<br/>

**步骤二**：在 ShopServiceImpl 新增此方法，利用单元测试进行缓存预热

```java
public void saveShop2Redis(Long id, Long expireSeconds) {
    Shop shop = getById(id);
    RedisData redisData = new RedisData();
    redisData.setData(shop);
    redisData.setExpireTime(LocalDateTime.now().plusSeconds(expireSeconds));
    stringRedisTemplate.opsForValue().set(CACHE_SHOP_KEY + id, JSONUtil.toJsonStr(redisData));
}
```

**在测试类中**

```java
@Autowired
private ShopServiceImpl shopService;

@Test
public void testSaveShop() {
    shopService.saveShop2Redis(1L, 10L);
}
```

<br/>

**步骤三**

正式代码：**ShopServiceImpl**

```java
/**
 * 线程池，开启独立线程进行缓存重建
 */
private static final ExecutorService CACHE_REBUILD_EXECUTOR = Executors.newFixedThreadPool(10);

private Shop queryWithLogicExpire(Long id) {
    // 通过店铺ID获取店铺信息
    String shop_key = CACHE_SHOP_KEY + id;
    String shopJson = stringRedisTemplate.opsForValue().get(shop_key);

    // 在新增数据的时候就已经添加缓存数据，所以如果店铺信息为空则返回空数据
    if (StrUtil.isBlank(shopJson)) {
        return null;
    }

    // 获取缓存数据和过期时间
    RedisData redisData = JSONUtil.toBean(shopJson, RedisData.class);
    Shop shop = JSONUtil.toBean((String) redisData.getData(), Shop.class);
    LocalDateTime expireTime = redisData.getExpireTime();

    // 如果没有逻辑过期则返回店铺数据
    if (expireTime.isAfter(LocalDateTime.now())) {
        return shop;
    }

    // 如果逻辑过期则尝试获取锁
    String lock_key = LOCK_SHOP_KEY + id;
    boolean flag = tryLock(lock_key);
    if (flag) {
        // DoubleCheck 防止缓存重建
        if (expireTime.isAfter(LocalDateTime.now())) {
            return shop;
        }

        // 开启独立线程进行缓存重建
        CACHE_REBUILD_EXECUTOR.submit(() -> {
            try {
                this.saveShop2Redis(id, CACHE_SHOP_TTL);
            } catch (Exception e) {
                throw new RuntimeException(e);
            } finally {
                unlock(lock_key);
            }
        });
    }

    // 返回过期数据
    return shop;
}
```

<br/>

**完整代码**

```java
package com.hmdp.service.impl;

import cn.hutool.core.util.BooleanUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.hmdp.dto.Result;
import com.hmdp.entity.Shop;
import com.hmdp.mapper.ShopMapper;
import com.hmdp.service.IShopService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hmdp.utils.RedisData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static com.hmdp.utils.RedisConstants.*;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author 虎哥
 * @since 2021-12-22
 */
@Service
public class ShopServiceImpl extends ServiceImpl<ShopMapper, Shop> implements IShopService {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Override
    public Result queryById(Long id) {
        // 逻辑过期解决缓存穿透和缓存击穿
        Shop shop = this.queryWithMuteX(id);

        // 逻辑过期解决缓存穿透和缓存击穿
        //Shop shop = this.queryWithLogicExpire(id);

        if (shop == null) {
            return Result.fail("店铺不存在");
        }

        // 返回店铺信息
        return Result.ok(shop);
    }

    private Shop queryWithPassThrough(Long id) {
        // 通过店铺ID获取店铺信息
        String shop_key = CACHE_SHOP_KEY + id;
        String shopJson = stringRedisTemplate.opsForValue().get(shop_key);

        // 如果店铺信息不为空则返回店铺信息
        if (StrUtil.isNotBlank(shopJson)) {
            return JSONUtil.toBean(shopJson, Shop.class);
        }

        // 判断是否是空值，如果是空值则返回店铺信息为空，防止缓存穿透
        if (shopJson != null) {
            return null;
        }

        // 如果店铺信息为空则查询店铺信息，不存在则返回报错
        Shop shop = getById(id);
        if (shop == null) {
            stringRedisTemplate.opsForValue().set(shop_key, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
            return null;
        }

        // 如果店铺存在则设置缓存并设置过期时间
        stringRedisTemplate.opsForValue().set(shop_key, JSONUtil.toJsonStr(shop), CACHE_SHOP_TTL, TimeUnit.MINUTES);
        return shop;
    }

    @Override
    @Transactional
    public Result update(Shop shop) {
        Long id = shop.getId();
        if (id == null) {
            return Result.fail("店铺id不能为空");
        }

        // 更新数据库
        updateById(shop);

        // 删除缓存
        stringRedisTemplate.delete(CACHE_SHOP_KEY + id);
        return Result.ok();
    }

    private boolean tryLock(String key) {
        Boolean flag = stringRedisTemplate.opsForValue().setIfAbsent(key, "1", 10, TimeUnit.SECONDS);
        return BooleanUtil.isTrue(flag);
    }

    private void unlock(String key) {
        stringRedisTemplate.delete(key);
    }

    private Shop queryWithMuteX(Long id) {
        // 通过店铺ID获取店铺信息
        String shop_key = CACHE_SHOP_KEY + id;
        String shopJson = stringRedisTemplate.opsForValue().get(shop_key);

        // 如果店铺信息不为空则返回店铺信息
        if (StrUtil.isNotBlank(shopJson)) {
            return JSONUtil.toBean(shopJson, Shop.class);
        }

        // 判断是否是空值，如果是空值则返回店铺信息为空，防止缓存穿透
        if (shopJson != null) {
            return null;
        }

        // 声明锁和店铺
        String lock_key = LOCK_SHOP_KEY + id;
        Shop shop = null;

        try {
            // 判断获取锁是否成功
            boolean flag = tryLock(lock_key);

            // 不成功则重新休眠在获取
            if (!flag) {
                Thread.sleep(50);
                queryWithMuteX(id);
            }

            // DoubleCheck 获取锁成功后在此检测redis缓存是否存在，不存在则根据id查询数据库
            String shopLockJson = stringRedisTemplate.opsForValue().get(shop_key);

            if (shopLockJson != null) {
                return JSONUtil.toBean(shopLockJson, Shop.class);
            }

            shop = getById(id);
            if (shop == null) {
                stringRedisTemplate.opsForValue().set(shop_key, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
                return null;
            }

            // 如果店铺存在则设置缓存并设置过期时间
            stringRedisTemplate.opsForValue().set(shop_key, JSONUtil.toJsonStr(shop), CACHE_SHOP_TTL, TimeUnit.MINUTES);
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            // 释放互斥锁
            unlock(lock_key);
        }


        return shop;
    }

    public void saveShop2Redis(Long id, Long expireSeconds) {
        Shop shop = getById(id);
        RedisData redisData = new RedisData();
        redisData.setData(shop);
        redisData.setExpireTime(LocalDateTime.now().plusSeconds(expireSeconds));
        stringRedisTemplate.opsForValue().set(CACHE_SHOP_KEY + id, JSONUtil.toJsonStr(redisData));
    }

    /**
     * 线程池，开启独立线程进行缓存重建
     */
    private static final ExecutorService CACHE_REBUILD_EXECUTOR = Executors.newFixedThreadPool(10);

    private Shop queryWithLogicExpire(Long id) {
        // 通过店铺ID获取店铺信息
        String shop_key = CACHE_SHOP_KEY + id;
        String shopJson = stringRedisTemplate.opsForValue().get(shop_key);

        // 如果店铺信息为空则返回空数据，缓存重建时会缓存空数据
        if (StrUtil.isBlank(shopJson)) {
            return null;
        }

        // 获取缓存数据和过期时间
        RedisData redisData = JSONUtil.toBean(shopJson, RedisData.class);
        Shop shop = JSONUtil.toBean((String) redisData.getData(), Shop.class);
        LocalDateTime expireTime = redisData.getExpireTime();

        // 如果没有逻辑过期则返回店铺数据
        if (expireTime.isAfter(LocalDateTime.now())) {
            return shop;
        }

        // 如果逻辑过期则尝试获取锁
        String lock_key = LOCK_SHOP_KEY + id;
        boolean flag = tryLock(lock_key);
        if (flag) {
            // DoubleCheck 防止缓存重建
            if (expireTime.isAfter(LocalDateTime.now())) {
                return shop;
            }

            // 开启独立线程进行缓存重建
            CACHE_REBUILD_EXECUTOR.submit(() -> {
                try {
                    this.saveShop2Redis(id, CACHE_SHOP_TTL);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                } finally {
                    unlock(lock_key);
                }
            });
        }

        // 返回过期数据
        return shop;
    }
}
```

<br/>

### 缓存工具封装

:::info 🔖  基于StringRedisTemplate 封装一个缓存工具类，满足下列需求：

* 方法1：将任意 Java 对象序列化为 Json 并存储在 String 类型的 key 中，并且可以设置TTL过期时间
* 方法2：将任意 Java 对象序列化为 Json 并存储在 String 类型的 key 中，并且可以设置逻辑过期时间，用于处理缓存击穿问题
* 方法3：根据指定的 key 查询缓存，并反序列化为指定类型，利用缓存空值的方式解决缓存穿透问题
* 方法4：根据指定的 key 查询缓存，并反序列化为指定类型，需要利用逻辑过期解决缓存击穿问题

:::

具体实现

```java
package com.hmdp.utils;

import cn.hutool.core.util.BooleanUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

import static com.hmdp.utils.RedisConstants.CACHE_NULL_TTL;
import static com.hmdp.utils.RedisConstants.LOCK_SHOP_KEY;

@Slf4j
@Component
public class CacheClient {

    private final StringRedisTemplate stringRedisTemplate;

    public CacheClient(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    private static final ExecutorService CACHE_REBUILD_EXECUTOR = Executors.newFixedThreadPool(10);

    /**
     * 设置 Redis 过期时间
     *
     * @param key
     * @param value
     * @param time
     * @param timeUnit
     */
    public void set(String key, Object value, Long time, TimeUnit timeUnit) {
        stringRedisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(value), time, timeUnit);
    }

    /**
     * 设置 Redis 逻辑过期时间
     */
    public void setWithLogicExpire(String key, Object value, Long time, TimeUnit timeUnit) {
        RedisData redisData = new RedisData();
        redisData.setData(value);
        redisData.setExpireTime(LocalDateTime.now().plusSeconds(timeUnit.toSeconds(time)));
        stringRedisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(redisData));
    }

    /**
     * 利用缓存空值的方式解决缓存穿透问题
     */
    public <R, ID> R queryWithPassThrough(String keyPrefix, ID id, Class<R> type, Function<ID, R> dbFallback, Long time, TimeUnit unit) {
        // 从缓存中查询数据
        String key = keyPrefix + id;
        String json = stringRedisTemplate.opsForValue().get(key);

        // 缓存中存在数据则返回
        if (StrUtil.isNotBlank(json)) {
            return JSONUtil.toBean(json, type);
        }

        // 如果为空值则返回为空
        if (json != null) {
            return null;
        }

        // 缓存中不存在则查询数据库，如果不存在则将空值写入缓存中
        R r = dbFallback.apply(id);
        if (r == null) {
            this.set(key, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
            return null;
        }

        // 数据库中存在则写入缓存中
        this.set(key, r, time, unit);
        return r;
    }

    /**
     * 利用互斥锁解决缓存击穿问题
     */
    public <R, ID> R queryWithMuteX(String keyPrefix, ID id, Class<R> type, Function<ID, R> dbFallback, Long time, TimeUnit unit) {
        // 从缓存中查询数据
        String key = keyPrefix + id;
        String json = stringRedisTemplate.opsForValue().get(key);

        // 缓存中存在数据则返回
        if (StrUtil.isNotBlank(json)) {
            return JSONUtil.toBean(json, type);
        }

        // 如果为空值则返回为空
        if (json != null) {
            return null;
        }

        // 声明锁和返回的数据
        String lock_key = LOCK_SHOP_KEY + id;
        R r = null;

        try {
            // 判断锁是否成功获取，不成功则重新休眠获取
            boolean flag = tryLock(lock_key);
            if (!flag) {
                Thread.sleep(50);
                queryWithMuteX(keyPrefix, id, type, dbFallback, time, unit);
            }

            // DoubleCheck 获取锁成功后重新判断 Redis 缓存是否存在，不存在则根据Id查询数据
            String lockJson = stringRedisTemplate.opsForValue().get(key);
            if (lockJson != null) {
                return JSONUtil.toBean(lockJson, type);
            }

            r = dbFallback.apply(id);
            if (r == null) {
                this.set(key, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
                return null;
            }

            // 设置缓存并设置过期时间
            this.set(key, JSONUtil.toJsonStr(r), time, unit);
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            unlock(lock_key);
        }

        return r;
    }


    /**
     * 利用逻辑过期解决缓存击穿问题
     */
    public <R, ID> R queryWithLogicExpire(String keyPrefix, ID id, Class<R> type, Function<ID, R> dbFallback, Long time, TimeUnit unit) {
        // 从缓存中获取数据
        String key = keyPrefix + id;
        String json = stringRedisTemplate.opsForValue().get(key);

        // 因为是逻辑过期，缓存重建时会缓存空数据，如果为空则直接返回
        if (StrUtil.isBlank(json)) {
            return null;
        }

        // 命中数据则需要将 Json 反序列化
        RedisData redisData = JSONUtil.toBean(json, RedisData.class);
        R r = JSONUtil.toBean((String) redisData.getData(), type);
        LocalDateTime expireTime = redisData.getExpireTime();

        // 如果数据没过期则直接返回数据
        if (expireTime.isAfter(LocalDateTime.now())) {
            return r;
        }

        // 如果逻辑过期则尝试获取锁
        String lock_key = LOCK_SHOP_KEY + id;
        boolean flag = tryLock(lock_key);

        // 判断是否获取锁成功
        if (flag) {
            // DoubleCheck 防止缓存重建
            if (expireTime.isAfter(LocalDateTime.now())) {
                return r;
            }

            // 开启独立线程进行缓存重建
            CACHE_REBUILD_EXECUTOR.submit(() -> {
                try {
                    R apply = dbFallback.apply(id);
                    this.setWithLogicExpire(key, apply, time, unit);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                } finally {
                    unlock(lock_key);
                }
            });
        }

        // 返回过期的数据
        return r;
    }

    private boolean tryLock(String key) {
        Boolean flag = stringRedisTemplate.opsForValue().setIfAbsent(key, "1", 10, TimeUnit.SECONDS);
        return BooleanUtil.isTrue(flag);
    }

    private void unlock(String key) {
        stringRedisTemplate.delete(key);
    }
}
```

在ShopServiceImpl 中

```java
@Resource
private CacheClient cacheClient;

@Override
public Result queryById(Long id) {
    // 解决缓存穿透
    Shop shop = cacheClient
            .queryWithPassThrough(CACHE_SHOP_KEY, id, Shop.class, this::getById, CACHE_SHOP_TTL, TimeUnit.MINUTES);

    // 互斥锁解决缓存击穿
    // Shop shop = cacheClient
    //         .queryWithMutex(CACHE_SHOP_KEY, id, Shop.class, this::getById, CACHE_SHOP_TTL, TimeUnit.MINUTES);

    // 逻辑过期解决缓存击穿
    // Shop shop = cacheClient
    //         .queryWithLogicalExpire(CACHE_SHOP_KEY, id, Shop.class, this::getById, 20L, TimeUnit.SECONDS);

    if (shop == null) {
        return Result.fail("店铺不存在！");
    }
  
    // 返回
    return Result.ok(shop);
}
```

 
