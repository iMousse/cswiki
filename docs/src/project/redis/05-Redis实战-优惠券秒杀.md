[[toc]]

## 优惠卷秒杀

### 全局ID生成

每个店铺都可以发布优惠券：

![1653362612286](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/1653362612286.png)

当用户抢购时，就会生成订单并保存到 `tb_voucher_order` 这张表中，而订单表如果使用数据库自增 ID 就存在一些问题：

* ID 的规律性太明显
* 受单表数据量的限制

<br/>

场景分析一：如果我们的 ID 具有太明显的规则，用户或者说商业对手很容易猜测出来我们的一些敏感信息，比如商城在一天时间内，卖出了多少单，这明显不合适。

场景分析二：随着我们商城规模越来越大，MySQL 的单表的容量不宜超过 500W，数据量过大之后，我们要进行拆库拆表，但拆分表了之后，他们从逻辑上讲他们是同一张表，所以他们的 ID 是不能一样的， 于是乎我们需要保证 ID 的唯一性。

<br/>

**全局ID生成器**，是一种在分布式系统下用来生成全局唯一 ID 的工具，一般要满足下列特性：

![image-20240314092559673](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314092559673.png)

为了增加 ID 的安全性，我们可以不直接使用 Redis 自增的数值，而是拼接一些其它信息：

![image-20240314092627426](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314092627426.png)

ID的组成部分：

- 符号位：1bit，永远为0
- 时间戳：31bit，以秒为单位，可以使用69年
- 序列号：32bit，秒内的计数器，支持每秒产生2^32个不同ID

<br/>

**Redis实现全局唯一ID**

```java
package com.hmdp.utils;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Component
public class RedisIdWorker {
    /**
     * 开始时间戳
     */
    private static final long BEGIN_TIMESTAMP = 1640995200L;
    /**
     * 序列号的位数
     */
    private static final int COUNT_BITS = 32;

    private StringRedisTemplate stringRedisTemplate;

    public RedisIdWorker(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    public long nextId(String keyPrefix) {
        // 1.生成时间戳 
        LocalDateTime now = LocalDateTime.now();
        long nowSecond = now.toEpochSecond(ZoneOffset.UTC);
        long timestamp = nowSecond - BEGIN_TIMESTAMP;

        // 2.生成序列号
        String date = now.format(DateTimeFormatter.ofPattern("yyyy:MM:dd"));
        long count = stringRedisTemplate.opsForValue().increment("icr:" + keyPrefix + ":" + date);

        // 3.时间戳向左移动32位并拼接 count 返回
        return timestamp << COUNT_BITS | count;
    }
}
```

<br/>

**测试类**

```java
@Autowired
private RedisIdWorker redisIdWorker;

private ExecutorService es = Executors.newFixedThreadPool(500);

@Test
public void testDate() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(300);

    Runnable task = () -> {
        for (int i = 0; i < 100; i++) {
            long id = redisIdWorker.nextId("order");
            System.out.println("id = " + id);
        }
        latch.countDown();
    };
  
    long begin = System.currentTimeMillis();
    for (int i = 0; i < 300; i++) {
        es.submit(task);
    }
  
    latch.await();
  
    long end = System.currentTimeMillis();
    System.out.println("time = " + (end - begin));
}

@Test
public void testIdByte64() {
    long order = redisIdWorker.nextId("order");
    System.out.println("order = " + order);

    long decimal = order; // 十进制数
    String binary = ""; // 存储二进制字符串
    while (decimal != 0) {
        // 把余数放在前面
        binary = decimal % 2 + binary;
        // 把商作为新的被除数
        decimal = decimal / 2;
    }
    System.out.println("binary = " + binary);
}
```

:::tip 💡提示：关于`Countdownlatch`

`Countdownlatch`名为信号枪：主要的作用是同步协调在多线程的等待于唤醒问题

我们如果没有 CountDownLatch ，那么由于程序是异步的，当异步程序没有执行完时，主线程就已经执行完了，然后我们期望的是分线程全部走完之后，主线程再走，所以我们此时需要使用到CountDownLatch

CountDownLatch 中有两个最重要的方法

- `countDown()`
- `await()`

`await()` 是阻塞方法，我们担心分线程没有执行完时，main 线程就先执行，所以使用 `await()` 可以让 main 线程阻塞，那么什么时候 main 线程不再阻塞呢？当 CountDownLatch  内部维护的变量变为 0 时，就不再阻塞，直接放行，那么什么时候 CountDownLatch   维护的变量变为 0 呢，我们只需要调用一次 `countDown()` ，内部变量就减少1，我们让分线程和变量绑定， 执行完一个分线程就减少一个变量，当分线程全部走完，CountDownLatch 维护的变量就是 0，此时 `await()` 就不再阻塞，统计出来的时间也就是所有分线程执行完后的时间。

:::

<br/>

:::warning 总结

全局唯一ID生成策略：

- UUID
- Redis自增
- Snowflake算法
- 数据库自增:Redis自增的数据库版

Redis自增ID策略

- 每天一个Key，方便统计订单量
- ID构造是 时间戳  + 计数器

:::

<br/>

### 实现优惠券秒杀

#### 添加优惠卷

每个店铺都可以发布优惠券，分为平价券和特价券。平价券可以任意购买，而特价券需要秒杀抢购

![1653365145124](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/1653365145124.png)

表关系如下

- `tb_voucher`：优惠券的基本信息，优惠金额、使用规则等
- `tb_seckill_voucher`：优惠券的库存、开始抢购时间，结束抢购时间。特价优惠券才需要填写这些信息

<br/>

:::tip 提示

平价券由于优惠力度并不是很大，所以是可以任意领取。而代金券由于优惠力度大，所以像第二种券，就得限制数量，从表结构上也能看出，特价卷除了具有优惠卷的基本信息以外，还具有库存，抢购时间，结束时间等等字段。

:::

<br/>

在 `VoucherController` 中提供了一个接口，可以添加秒杀优惠券：

```java
@RestController
@RequestMapping("/voucher")
public class VoucherController {

    @Resource
    private IVoucherService voucherService;

    /**
     * 新增秒杀券
     * @param voucher 优惠券信息，包含秒杀信息
     * @return 优惠券id
     */
    @PostMapping("seckill")
    public Result addSeckillVoucher(@RequestBody Voucher voucher) {
        voucherService.addSeckillVoucher(voucher);
        return Result.ok(voucher.getId());
    }

    /**
     * 新增普通券
     * @param voucher 优惠券信息
     * @return 优惠券id
     */
    @PostMapping
    public Result addVoucher(@RequestBody Voucher voucher) {
        voucherService.save(voucher);
        return Result.ok(voucher.getId());
    }
}
```

<br/>

**实现类**：`VoucherServiceImpl`

```java
@Override
@Transactional
public void addSeckillVoucher(Voucher voucher) {
    // 保存优惠券
    save(voucher);
    // 保存秒杀信息
    SeckillVoucher seckillVoucher = new SeckillVoucher();
    seckillVoucher.setVoucherId(voucher.getId());
    seckillVoucher.setStock(voucher.getStock());
    seckillVoucher.setBeginTime(voucher.getBeginTime());
    seckillVoucher.setEndTime(voucher.getEndTime());
    seckillVoucherService.save(seckillVoucher);
    // 保存秒杀库存到Redis中
    stringRedisTemplate.opsForValue().set(SECKILL_STOCK_KEY + voucher.getId(), voucher.getStock().toString());
}
```

<br/>

#### 实现秒杀下单

下单核心思路：当我们点击抢购时，会触发右侧的请求，我们只需要编写对应的controller即可。

用户可以在店铺页面中抢购这些优惠券：

![image-20240314095302873](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314095302873.png)

<br/>

**秒杀下单应该思考的内容**

下单时需要判断两点：

* 秒杀是否开始或结束，如果尚未开始或已经结束则无法下单
* 库存是否充足，不足则无法下单

下单核心逻辑分析：当用户开始进行下单，我们应当去查询优惠卷信息，查询到优惠卷信息，判断是否满足秒杀条件。比如时间是否充足，如果时间充足，则进一步判断库存是否足够，如果两者都满足，则扣减库存，创建订单，然后返回订单id，如果有一个条件不满足则直接结束。

![image-20240314095344655](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314095344655.png)

<br/>

**具体实现代码**：`VoucherOrderServiceImpl`

```java
package com.hmdp.service.impl;

import com.hmdp.dto.Result;
import com.hmdp.entity.SeckillVoucher;
import com.hmdp.entity.VoucherOrder;
import com.hmdp.mapper.VoucherOrderMapper;
import com.hmdp.service.ISeckillVoucherService;
import com.hmdp.service.IVoucherOrderService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hmdp.utils.RedisIdWorker;
import com.hmdp.utils.UserHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author 虎哥
 * @since 2021-12-22
 */
@Service
public class VoucherOrderServiceImpl extends ServiceImpl<VoucherOrderMapper, VoucherOrder> implements IVoucherOrderService {

    @Autowired
    private ISeckillVoucherService seckillVoucherService;

    @Autowired
    private RedisIdWorker redisIdWorker;

    @Override
    public Result seckillVoucher(Long voucherId) {
        // 1.查询优惠券
        SeckillVoucher voucher = seckillVoucherService.getById(voucherId);
        
        // 2.判断秒杀是否开始
        if (voucher.getBeginTime().isAfter(LocalDateTime.now())) {
            // 尚未开始
            return Result.fail("秒杀尚未开始！");
        }
        
        // 3.判断秒杀是否已经结束
        if (voucher.getEndTime().isBefore(LocalDateTime.now())) {
            // 尚未开始
            return Result.fail("秒杀已经结束！");
        }
        
        // 4.判断库存是否充足
        if (voucher.getStock() < 1) {
            // 库存不足
            return Result.fail("库存不足！");
        }
        // 5.扣减库存
        boolean success = seckillVoucherService.update()
                .setSql("stock = stock -1")
                .eq("voucher_id", voucherId)
                .update();
        if (!success) {
            //扣减库存
            return Result.fail("库存不足！");
        }
        
        //6.创建订单
        VoucherOrder voucherOrder = new VoucherOrder();
        // 6.1.订单id
        long orderId = redisIdWorker.nextId("order");
        voucherOrder.setId(orderId);
        // 6.2.用户id
        Long userId = UserHolder.getUser().getId();
        voucherOrder.setUserId(userId);
        // 6.3.代金券id
        voucherOrder.setVoucherId(voucherId);
        save(voucherOrder);

        return Result.ok(orderId);

    }
}

```

<br/>

#### 库存超卖问题

有关超卖问题分析：在我们原有代码中是这么写的

```java
// 4.判断库存是否充足
if (voucher.getStock() < 1) {
    // 库存不足
    return Result.fail("库存不足！");
}

// 5.扣减库存
boolean success = seckillVoucherService.update()
        .setSql("stock = stock - 1")
        .eq("voucher_id", voucherId)
  			.update();
if (!success) {
    //扣减库存
    return Result.fail("库存不足！");
}
```

假设线程1过来查询库存，判断出来库存大于1，正准备去扣减库存，但是还没有来得及去扣减，此时线程2过来，线程2也去查询库存，发现这个数量一定也大于1，那么这两个线程都会去扣减库存，最终多个线程相当于一起去扣减库存，此时就会出现库存的超卖问题。

![image-20240314095523839](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314095523839.png)

超卖问题是典型的多线程安全问题，针对这一问题的常见解决方案就是加锁。

<br/>

而对于加锁，我们通常有两种解决方案：

![image-20240314095540521](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314095540521.png)

**悲观锁**：可以实现对于数据的串行化执行，比如 syn，和 Lock 都是悲观锁的代表，同时，悲观锁中又可以再细分为公平锁，非公平锁，可重入锁，等等

**乐观锁**：会有一个版本号，每次操作数据会对版本号+1，再提交回数据时，会去校验是否比之前的版本大1 ，如果大1 ，则进行操作成功，这套机制的核心逻辑在于，如果在操作过程中，版本号只比原来大1 ，那么就意味着操作过程中没有人对他进行过修改，他的操作就是安全的，如果不大1，则数据被修改过，当然乐观锁还有一些变种的处理方式比如 CAS。

- 乐观锁的典型代表：就是 CAS，利用 CAS 进行无锁化机制加锁，var5 是操作前读取的内存值，while 中的 var1+var2 是预估值，如果预估值 == 内存值，则代表中间没有被人修改过，此时就将新值去替换内存值。

<br/>

其中 `do while`  是为了在操作失败时，再次进行自旋操作，即把之前的逻辑再操作一次。

```java
int var5;
do {
    var5 = this.getIntVolatile(var1, var2);
} while(!this.compareAndSwapInt(var1, var2, var5, var5 + var4));

return var5;
```

<br/>

**课程中的使用方式**是没有像 CAS 一样带自旋的操作，也没有对 version 的版本号+1 ，他的操作逻辑是在操作时，对版本号进行+1 操作，然后要求version 如果是1 的情况下，才能操作，那么第一个线程在操作后，数据库中的 version 变成了2，但是他自己满足 version=1 ，所以没有问题，此时线程2执行，线程2 最后也需要加上条件 version =1 ，但是现在由于线程1已经操作过了，所以线程2，操作时就不满足 version=1 的条件了，所以线程2无法执行成功。

<br/>

乐观锁的关键是判断之前查询得到的数据是否有被修改过，常见的方式有两种： 

![image-20240314095639161](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314095639161.png)

![image-20240314095726103](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314095726103.png)

:::warning 总结：超卖这样的线程安全问题，解决方案有哪些？

- 悲观锁：添加同步锁，让线程串行执行。简单粗暴缺点但性能一般
- 乐观锁：不加锁，在更新时判断是否有其它线程在修改。性能好但成功率低

:::

<br/>

**乐观锁解决超卖问题**

**方案一**：VoucherOrderServiceImpl 在扣减库存时，改为：

```java {5}
// 扣减库存  set stock = stock -1 where id = ？ and stock = ?
boolean success = seckillVoucherService.update()
        .setSql("stock = stock - 1")
        .eq("voucher_id", voucherId)
        .eq("stock", voucher.getStock())
        .update();
```

:::info 以上逻辑的核心含义是：只要我扣减库存时的库存和之前我查询到的库存是一样的，就意味着没有人在中间修改过库存，那么此时就是安全的，但是以上这种方式通过测试发现会有很多失败的情况，失败的原因在于：在使用乐观锁过程中假设100个线程同时都拿到了100的库存，然后大家一起去进行扣减，但是100个人中只有1个人能扣减成功，其他的人在处理时，他们在扣减时，库存已经被修改过了，所以此时其他线程都会失败

:::

<br/>

**方案二**：之前的方式要修改前后都保持一致，但是这样我们分析过，成功的概率太低，所以我们的乐观锁需要变一下，改成 stock 大于0 即可

```java {5}
// 扣减库存  set stock = stock - 1 where id = ？ and stock > 0
boolean success = seckillVoucherService.update()
        .setSql("stock = stock - 1")
        .eq("voucher_id", voucherId)
        .eq("stock", 0)
        .update();
```

:::warning 💡扩展

针对 CAS 中的自旋压力过大，我们可以使用 Longaddr 这个类去解决。Java8 提供的一个对AtomicLong改进后的一个类，LongAdder。大量线程并发更新一个原子性的时候，天然的问题就是自旋，会导致并发性问题，当然这也比我们直接使用syn来的好。所以利用这么一个类，LongAdder来进行优化。如果获取某个值，则会对 cell 和 base 的值进行递增，最后返回一个完整的值

![1653370271627](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/1653370271627.png)

:::

<br/>

#### 实现一人一单

需求：修改秒杀业务，要求同一个优惠券，一个用户只能下一单

**现在的问题在于：**

优惠卷是为了引流，但是目前的情况是，一个人可以无限制的抢这个优惠卷，所以我们应当增加一层逻辑，让一个用户只能下一个单，而不是让一个用户下多个单

具体操作逻辑如下：比如时间是否充足，如果时间充足，则进一步判断库存是否足够，然后再根据优惠卷id和用户id查询是否已经下过这个订单，如果下过这个订单，则不再下单，否则进行下单

![image-20240314100610881](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314100610881.png)

<br/>

**具体实现**：`VoucherOrderServiceImpl`

```java {24-32}
@Override
public Result seckillVoucher(Long voucherId) {
    // 1.查询优惠券
    SeckillVoucher voucher = seckillVoucherService.getById(voucherId);

    // 2.判断秒杀是否开始
    if (voucher.getBeginTime().isAfter(LocalDateTime.now())) {
        // 尚未开始
        return Result.fail("秒杀尚未开始！");
    }

    // 3.判断秒杀是否已经结束
    if (voucher.getEndTime().isBefore(LocalDateTime.now())) {
        // 尚未开始
        return Result.fail("秒杀已经结束！");
    }

    // 4.判断库存是否充足
    if (voucher.getStock() < 1) {
        // 库存不足
        return Result.fail("库存不足！");
    }

    // 新增一人一单逻辑
    Long userId = UserHolder.getUser().getId();
    int count = query().eq("user_id", userId)
            .eq("voucher_id", voucherId)
            .count();

    if (count > 0) {
        return Result.fail("用户已经购买过一次！");
    }

    // 5.扣减库存  set stock = stock - 1 where id = ？ and stock > 0
    boolean success = seckillVoucherService.update()
            .setSql("stock = stock - 1")
            .eq("voucher_id", voucherId)
            .eq("stock", 0)
            .update();
    if (!success) {
        //扣减库存
        return Result.fail("库存不足！");
    }

    //6.创建订单
    VoucherOrder voucherOrder = new VoucherOrder();
    // 6.1.订单id
    long orderId = redisIdWorker.nextId("order");
    voucherOrder.setId(orderId);
    // 6.2.用户id
    voucherOrder.setUserId(userId);
    // 6.3.代金券id
    voucherOrder.setVoucherId(voucherId);
    save(voucherOrder);

    return Result.ok(orderId);
}
```

:::danger 🚨 存在问题：现在的问题还是和之前一样，并发过来，查询数据库，都不存在订单，所以我们还是需要加锁，但是乐观锁比较适合更新数据，而现在是插入数据，所以我们需要使用悲观锁操作。

:::

<br/>

```java {58-97}
package com.hmdp.service.impl;

import com.hmdp.dto.Result;
import com.hmdp.entity.SeckillVoucher;
import com.hmdp.entity.VoucherOrder;
import com.hmdp.mapper.VoucherOrderMapper;
import com.hmdp.service.ISeckillVoucherService;
import com.hmdp.service.IVoucherOrderService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hmdp.utils.RedisIdWorker;
import com.hmdp.utils.UserHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author 虎哥
 * @since 2021-12-22
 */
@Service
public class VoucherOrderServiceImpl extends ServiceImpl<VoucherOrderMapper, VoucherOrder> implements IVoucherOrderService {

    @Autowired
    private ISeckillVoucherService seckillVoucherService;

    @Autowired
    private RedisIdWorker redisIdWorker;

    @Override
    public Result seckillVoucher(Long voucherId) {
        // 1.查询优惠券
        SeckillVoucher voucher = seckillVoucherService.getById(voucherId);

        // 2.判断秒杀是否开始
        if (voucher.getBeginTime().isAfter(LocalDateTime.now())) {
            // 尚未开始
            return Result.fail("秒杀尚未开始！");
        }

        // 3.判断秒杀是否已经结束
        if (voucher.getEndTime().isBefore(LocalDateTime.now())) {
            // 尚未开始
            return Result.fail("秒杀已经结束！");
        }

        // 4.判断库存是否充足
        if (voucher.getStock() < 1) {
            // 库存不足
            return Result.fail("库存不足！");
        }

        return createVoucherOrder(voucherId);
    }

    @Transactional
    public synchronized Result createVoucherOrder(Long voucherId) {
        // 新增一人一单逻辑
        Long userId = UserHolder.getUser().getId();
        int count = query().eq("user_id", userId)
                .eq("voucher_id", voucherId)
                .count();

        if (count > 0) {
            return Result.fail("用户已经购买过一次！");
        }

        // 5.扣减库存  set stock = stock - 1 where id = ？ and stock > 0
        boolean success = seckillVoucherService.update()
                .setSql("stock = stock - 1")
                .eq("voucher_id", voucherId)
                .eq("stock", 0)
                .update();
        if (!success) {
            //扣减库存
            return Result.fail("库存不足！");
        }

        //6.创建订单
        VoucherOrder voucherOrder = new VoucherOrder();
        // 6.1.订单id
        long orderId = redisIdWorker.nextId("order");
        voucherOrder.setId(orderId);
        // 6.2.用户id
        voucherOrder.setUserId(userId);
        // 6.3.代金券id
        voucherOrder.setVoucherId(voucherId);
        save(voucherOrder);

        return Result.ok(orderId);
    }
}
```

:::warning 💡 注意：在这里提到了非常多的问题，我们需要慢慢的来思考，首先我们的初始方案是封装了一个 `createVoucherOrder` 方法，同时为了确保他线程安全，在方法上添加了一把`synchronized` 锁但是这样添加锁，锁的粒度太粗了，在使用锁过程中，控制锁粒度是一个非常重要的事情，因为如果锁的粒度太大，会导致每个线程进来都会锁住，所以我们需要去控制锁的粒度，以下这段代码需要修改为：`intern()` 这个方法是从常量池中拿到数据，如果我们直接使用 `userId.toString()`  他拿到的对象实际上是不同的对象，new出来的对象，我们使用锁必须保证锁必须是同一把，所以我们需要使用 `intern()` 方法。

:::

<br/>

```java
@Transactional
public Result createVoucherOrder(Long voucherId) {
    Long userId = UserHolder.getUser().getId();
    synchronized (userId.toString().intern()) {
        // 新增一人一单逻辑
        int count = query().eq("user_id", userId)
                .eq("voucher_id", voucherId)
                .count();
        if (count > 0) {
            return Result.fail("用户已经购买过一次！");
        }

        // 5.扣减库存  set stock = stock - 1 where id = ？ and stock > 0
        boolean success = seckillVoucherService.update()
                .setSql("stock = stock - 1")
                .eq("voucher_id", voucherId)
                .eq("stock", 0)
                .update();
        if (!success) {
            //扣减库存
            return Result.fail("库存不足！");
        }

        //6.创建订单
        VoucherOrder voucherOrder = new VoucherOrder();
        // 6.1.订单id
        long orderId = redisIdWorker.nextId("order");
        voucherOrder.setId(orderId);
        // 6.2.用户id
        voucherOrder.setUserId(userId);
        // 6.3.代金券id
        voucherOrder.setVoucherId(voucherId);
        save(voucherOrder);

        return Result.ok(orderId);
    }
}
```

但是以上代码还是存在问题，问题的原因在于当前方法被 Spring 的事务控制，如果你在方法内部加锁，可能会导致当前方法事务还没有提交，但是锁已经释放也会导致问题，所以我们选择将当前方法整体包裹起来，确保事务不会出现问题。如下：在 `seckillVoucher` 方法中，添加以下逻辑，这样就能保证事务的特性，同时也控制了锁的粒度。

```Java {58-99}
package com.hmdp.service.impl;

import com.hmdp.dto.Result;
import com.hmdp.entity.SeckillVoucher;
import com.hmdp.entity.VoucherOrder;
import com.hmdp.mapper.VoucherOrderMapper;
import com.hmdp.service.ISeckillVoucherService;
import com.hmdp.service.IVoucherOrderService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hmdp.utils.RedisIdWorker;
import com.hmdp.utils.UserHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author 虎哥
 * @since 2021-12-22
 */
@Service
public class VoucherOrderServiceImpl extends ServiceImpl<VoucherOrderMapper, VoucherOrder> implements IVoucherOrderService {

    @Autowired
    private ISeckillVoucherService seckillVoucherService;

    @Autowired
    private RedisIdWorker redisIdWorker;

    @Override
    public Result seckillVoucher(Long voucherId) {
        // 1.查询优惠券
        SeckillVoucher voucher = seckillVoucherService.getById(voucherId);

        // 2.判断秒杀是否开始
        if (voucher.getBeginTime().isAfter(LocalDateTime.now())) {
            // 尚未开始
            return Result.fail("秒杀尚未开始！");
        }

        // 3.判断秒杀是否已经结束
        if (voucher.getEndTime().isBefore(LocalDateTime.now())) {
            // 尚未开始
            return Result.fail("秒杀已经结束！");
        }

        // 4.判断库存是否充足
        if (voucher.getStock() < 1) {
            // 库存不足
            return Result.fail("库存不足！");
        }

        Long userId = UserHolder.getUser().getId();
        synchronized (userId.toString().intern()) {
            return this.createVoucherOrder(voucherId);
        }
    }

    @Transactional
    public Result createVoucherOrder(Long voucherId) {
        Long userId = UserHolder.getUser().getId();
        // 新增一人一单逻辑
        int count = query().eq("user_id", userId)
                .eq("voucher_id", voucherId)
                .count();
        if (count > 0) {
            return Result.fail("用户已经购买过一次！");
        }

        // 5.扣减库存  set stock = stock - 1 where id = ？ and stock > 0
        boolean success = seckillVoucherService.update()
                .setSql("stock = stock - 1")
                .eq("voucher_id", voucherId)
                .eq("stock", 0)
                .update();
        if (!success) {
            //扣减库存
            return Result.fail("库存不足！");
        }

        //6.创建订单
        VoucherOrder voucherOrder = new VoucherOrder();
        // 6.1.订单id
        long orderId = redisIdWorker.nextId("order");
        voucherOrder.setId(orderId);
        // 6.2.用户id
        voucherOrder.setUserId(userId);
        // 6.3.代金券id
        voucherOrder.setVoucherId(voucherId);
        save(voucherOrder);

        return Result.ok(orderId);
        
    }
}
```

但是以上做法依然有问题，因为你调用的方法，其实是 `this.` 的方式调用的，事务想要生效，还得利用代理来生效，所以这个地方，我们需要获得原始的事务对象， 来操作事务。

```java
Long userId = UserHolder.getUser().getId();
synchronized (userId.toString().intern()) {
    IVoucherOrderService proxy = (IVoucherOrderService) AopContext.currentProxy();
    return proxy.createVoucherOrder(voucherId);
}
```

<br/>

加上依赖

```xml
<dependency>
  <groupId>org.aspectj</groupId>
  <artifactId>aspectjweaver</artifactId>
</dependency>
```

<br/>

启动类加上注释

```Java {3}
@MapperScan("com.hmdp.mapper")
@SpringBootApplication
@EnableAspectJAutoProxy(exposeProxy = true)
public class HmDianPingApplication {

    public static void main(String[] args) {
        SpringApplication.run(HmDianPingApplication.class, args);
    }

}
```

<br/>

**集群环境下的并发问题**

通过加锁可以解决在单机情况下的一人一单安全问题，但是在集群模式下就不行了。

- 我们将服务启动两份，端口分别为8081和8082：

  ![1653373887844](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/1653373887844.png)

- 然后修改nginx的conf目录下的nginx.conf文件，配置反向代理和负载均衡：

  ```nginx {46-47,51-54}
  worker_processes  1;
  
  error_log  logs/error.log  info;
  
  events {
      worker_connections  1024;
  }
  
  http {
      include       mime.types;
      default_type  application/json;
  
      sendfile        on;
      
      keepalive_timeout  65;
  
      server {
          listen       8080;
          server_name  localhost;
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
              # internal;  
              keepalive_timeout   30s;  
              keepalive_requests  1000;  
              # 支持keep-alive  
              proxy_http_version 1.1;  
              rewrite /api(/.*) $1 break;  
              proxy_pass_request_headers on;
              # more_clear_input_headers Accept-Encoding;  
              proxy_next_upstream error timeout;  
              # proxy_pass http://127.0.0.1:8081;
              proxy_pass http://backend;
          }
      }
  
      upstream backend {
          server 127.0.0.1:8081 max_fails=5 fail_timeout=10s weight=1;
          server 127.0.0.1:8082 max_fails=5 fail_timeout=10s weight=1;
      }  
  }
  ```

  

<br/>

**有关锁失效原因分析**

由于现在我们部署了多个 Tomcat，每个 Tomcat 都有一个属于自己的 Jvm，那么假设在服务器A的 Tomcat 内部，有两个线程，这两个线程由于使用的是同一份代码，那么他们的锁对象是同一个，是可以实现互斥的，但是如果现在是服务器B的 Tomcat 内部，又有两个线程，但是他们的锁对象写的虽然和服务器A一样，但是锁对象却不是同一个，所以线程3和线程4可以实现互斥，但是却无法和线程1和线程2实现互斥，这就是集群环境下，syn 锁失效的原因，在这种情况下，我们就需要使用分布式锁来解决这个问题。

![image-20240314100809151](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314100809151.png)

<br/>

### 分布式锁

#### 基本原理

分布式锁：满足分布式系统或集群模式下多进程可见并且互斥的锁。

分布式锁的核心思想就是让大家都使用同一把锁，只要大家使用的是同一把锁，那么我们就能锁住线程，不让线程进行，让程序串行执行，这就是分布式锁的核心思路

![image-20240314100950454](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314100950454.png)



<br/>

那么分布式锁他应该满足一些什么样的条件呢？

- 可见性：多个线程都能看到相同的结果，注意：这个地方说的可见性并不是并发编程中指的内存可见性，只是说多个进程之间都能感知到变化的意思
- 互斥：互斥是分布式锁的最基本的条件，使得程序串行执行
- 高可用：程序不易崩溃，时时刻刻都保证较高的可用性
- 高性能：由于加锁本身就让性能降低，所有对于分布式锁本身需要他就较高的加锁性能和释放锁性能
- 安全性：安全也是程序中必不可少的一环


![image-20240314101026763](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314101026763.png)

<br/>

常见的分布式锁有三种

- MySQL：MySQL 本身就带有锁机制，但是由于 MySQL 性能本身一般，所以采用分布式锁的情况下，其实使用 MySQL 作为分布式锁比较少见
- Redis：Redis 作为分布式锁是非常常见的一种使用方式，现在企业级开发中基本都使用 Redis 或者 Zookeeper 作为分布式锁，利用 setnx 这个方法，如果插入 key 成功，则表示获得到了锁，如果有人插入成功，其他人插入失败则表示无法获得到锁，利用这套逻辑来实现分布式锁
- Zookeeper：Zookeeper也是企业级开发中较好的一个实现分布式锁的方案，由于本套视频并不讲解 Zookeeper 的原理和分布式锁的实现，所以不过多阐述


![image-20240314101043083](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314101043083.png)

<br/>

#### 核心思路

实现分布式锁时需要实现的两个基本方法：

* 获取锁：
    * 互斥：确保只能有一个线程获取锁
    * 非阻塞：尝试一次，成功返回true，失败返回false
      ![image-16935513619547](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-16935513619547.png)
* 释放锁：
    * 手动释放
    * 超时释放：获取锁时添加一个超时时间
      ![image-16935513619548](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-16935513619548.png)
    

<br/>

**实现思路**

<img src="https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314101250039.png" alt="image-20240314101250039" style="zoom:66%;" />

:::tip 核心思路：我们利用 Redis 的setNx 方法，当有多个线程进入时，我们就利用该方法，第一个线程进入时，Redis 中就有这个key 了，返回了1，如果结果是1，则表示他抢到了锁，那么他去执行业务，然后再删除锁，退出锁逻辑，没有抢到锁的哥们，等待一定时间后重试即可。

:::

<br/>

#### 实现分布式锁版本

* 加锁逻辑

**锁的基本接口**

```Java
package com.hmdp.utils;

public interface ILock {

    /**
     * 尝试获取分布式锁
     * @param timeoutSec
     * @return
     */
    boolean tryLock(long timeoutSec);

    /**
     * 释放锁
     */
    void unlock();
}
```

<br/>

**SimpleRedisLock**

```java
package com.hmdp.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.concurrent.TimeUnit;

public class SimpleRedisLock implements ILock {

    private static final String KEY_PREFIX = "lock:";

    private final String name;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    public SimpleRedisLock(String name, StringRedisTemplate stringRedisTemplate) {
        this.name = name;
        this.stringRedisTemplate = stringRedisTemplate;
    }

    //利用setnx方法进行加锁，同时增加过期时间，防止死锁，此方法可以保证加锁和增加过期时间具有原子性
    @Override
    public boolean tryLock(long timeoutSc) {
        //获取线程标识
        long threadId = Thread.currentThread().getId();

        Boolean success = stringRedisTemplate.opsForValue()
                .setIfAbsent(KEY_PREFIX + name, threadId + "", timeoutSc, TimeUnit.SECONDS);

        return Boolean.TRUE.equals(success);
    }

    //释放锁逻辑，防止删除别人的锁
    @Override
    public void unlock() {
        stringRedisTemplate.delete(KEY_PREFIX + name);
    }
}
```

<br/>

* 修改业务代码

```java {26-40}
@Override
public Result seckillVoucher(Long voucherId) {
    // 1.查询优惠券
    SeckillVoucher voucher = seckillVoucherService.getById(voucherId);

    // 2.判断秒杀是否开始
    if (voucher.getBeginTime().isAfter(LocalDateTime.now())) {
        // 尚未开始
        return Result.fail("秒杀尚未开始！");
    }

    // 3.判断秒杀是否已经结束
    if (voucher.getEndTime().isBefore(LocalDateTime.now())) {
        // 尚未开始
        return Result.fail("秒杀已经结束！");
    }

    // 4.判断库存是否充足
    if (voucher.getStock() < 1) {
        // 库存不足
        return Result.fail("库存不足！");
    }

    Long userId = UserHolder.getUser().getId();

    // 创建锁对象并设置超时时间，防止死锁
    ILock lock = new SimpleRedisLock("order:" + userId, stringRedisTemplate);
    boolean isLock = lock.tryLock(1200);
    if (!isLock) {
        return Result.fail("不允许重复下单");
    }

    try {
        // 去掉 sync 悲观锁 
        IVoucherOrderService proxy = (IVoucherOrderService) AopContext.currentProxy();
        return proxy.createVoucherOrder(voucherId);
    } finally {
        // 释放锁
        lock.unlock();
    }
}
```

<br/>

#### 分布式锁误删说明

**逻辑说明**：持有锁的线程在锁的内部出现了阻塞，导致他的锁自动释放，这时其他线程，线程2来尝试获得锁，就拿到了这把锁，然后线程2在持有锁执行过程中，线程1反应过来，继续执行，而线程1执行过程中，走到了删除锁逻辑，此时就会把本应该属于线程2的锁进行删除，这就是误删别人锁的情况说明

**解决方案**：解决方案就是在每个线程释放锁的时候，去判断一下当前这把锁是否属于自己，如果属于自己，则不进行锁的删除，假设还是上边的情况，线程1卡顿，锁自动释放，线程2进入到锁的内部执行逻辑，此时线程1反应过来，然后删除锁，但是线程1，一看当前这把锁不是属于自己，于是不进行删除锁逻辑，当线程2走到删除锁逻辑时，如果没有卡过自动释放锁的时间点，则判断当前这把锁是属于自己的，于是删除这把锁。

![image-20240314101643734](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314101643734.png)

<br/>

#### 解决分布式锁误删

需求：修改之前的分布式锁实现，满足：在获取锁时存入线程标示（可以用UUID表示）。在释放锁时先获取锁中的线程标示，判断是否与当前线程标示一致

* 如果一致则释放锁
* 如果不一致则不释放锁

核心逻辑：在存入锁时，放入自己线程的标识，在删除锁时，判断当前这把锁的标识是不是自己存入的，如果是，则进行删除，如果不是，则不进行删除。

<br/>

**流程图**

![image-169355136195412](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-169355136195412.png)

<br/>

::: tip 📌  需求：修改之前的分布式锁实现，满足

1. 在获取琐时存入线程标识（可以用UUID标识）
2. 在释放锁时获取锁中的线程标识，判断是否与当前线程标识一致
    - 如果一致则释放锁
    - 如果不一致则不释放锁

:::

<br/>

**具体代码**

```Java {15,40-47}
package com.hmdp.utils;

import cn.hutool.core.lang.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.concurrent.TimeUnit;

public class SimpleRedisLock implements ILock {

    private static final String KEY_PREFIX = "lock:";

    private final String name;

    private static final String ID_PREFIX = UUID.randomUUID().toString(true) + "-";
    
    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    public SimpleRedisLock(String name, StringRedisTemplate stringRedisTemplate) {
        this.name = name;
        this.stringRedisTemplate = stringRedisTemplate;
    }

    //利用setnx方法进行加锁，同时增加过期时间，防止死锁，此方法可以保证加锁和增加过期时间具有原子性
    @Override
    public boolean tryLock(long timeoutSc) {
        //获取线程标识
        long threadId = Thread.currentThread().getId();

        Boolean success = stringRedisTemplate.opsForValue()
                .setIfAbsent(KEY_PREFIX + name, threadId + "", timeoutSc, TimeUnit.SECONDS);

        return Boolean.TRUE.equals(success);
    }

    //释放锁逻辑，防止删除别人的锁
    @Override
    public void unlock() {
        //获取线程标识
        String threadId = ID_PREFIX + Thread.currentThread().getId();
        //获取锁中的标识
        String id = stringRedisTemplate.opsForValue().get(KEY_PREFIX + name);
        //如果标识一直则释放锁
        if (threadId.equals(id)) {
            stringRedisTemplate.delete(KEY_PREFIX + name);
        }
    }
}
```

<br/>

**有关代码实操说明：**

在我们修改完此处代码后，我们重启工程，然后启动两个线程，第一个线程持有锁后，手动释放锁，第二个线程 此时进入到锁内部，再放行第一个线程，此时第一个线程由于锁的value值并非是自己，所以不能释放锁，也就无法删除别人的锁，此时第二个线程能够正确释放锁，通过这个案例初步说明我们解决了锁误删的问题。

<br/>

#### 分布式锁的原子性问题

更为极端的误删逻辑说明：

线程1现在持有锁之后，在执行业务逻辑过程中，他正准备删除锁，而且已经走到了条件判断的过程中，比如他已经拿到了当前这把锁确实是属于他自己的，正准备删除锁，但是此时他的锁到期了，那么此时线程2进来，但是线程1他会接着往后执行，当他卡顿结束后，他直接就会执行删除锁那行代码，相当于条件判断并没有起到作用，这就是删锁时的原子性问题，之所以有这个问题，是因为线程1的拿锁，比锁，删锁，实际上并不是原子性的，我们要防止刚才的情况发生，

![image-20240314101823161](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314101823161.png)

<br/>

#### Lua解决原子性问题

Redis提供了Lua脚本功能，在一个脚本中编写多条Redis命令，确保多条命令执行时的原子性。Lua是一种编程语言。

参考网站：https://www.runoob.com/lua/lua-tutorial.html

这里重点介绍Redis提供的调用函数，我们可以使用 Lua 去操作 Redis，又能保证他的原子性，这样就可以实现拿锁比锁删锁是一个原子性动作了，作为Java程序员这一块并不作一个简单要求，并不需要大家过于精通，只需要知道他有什么作用即可。

这里重点介绍Redis提供的调用函数，语法如下：

```lua
redis.call('命令名称', 'key', '其它参数', ...)
```

例如，我们要执行set name jack，则脚本是这样：

```lua
-- 执行 set name jack
redis.call('set', 'name', 'jack')
```

例如，我们要先执行set name Rose，再执行get name，则脚本如下：

```lua
-- 先执行 set name jack
redis.call('set', 'name', 'Rose')
-- 再执行 get name
local name = redis.call('get', 'name')
-- 返回
return name
```

写好脚本以后，需要用Redis命令来调用脚本，调用脚本的常见命令如下：

```sh
127.0.0.1:6379> help @scripting

  EVAL script numkeys [key [key ...]] [arg [arg ...]]
  summary: Execute a Lua script server side
  since: 2.6.0
```

例如，我们要执行 `redis.call('set', 'name', 'jack') `这个脚本，语法如下：

![1653392218531](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/1653392218531.png)

如果脚本中的key、value不想写死，可以作为参数传递。key类型参数会放入KEYS数组，其它参数会放入ARGV数组，在脚本中可以从KEYS和ARGV数组获取这些参数：

![1653392438917](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/1653392438917.png)

<br/>

接下来我们来回顾一下我们释放锁的逻辑：

释放锁的业务流程是这样的

1. 获取锁中的线程标示
2. 判断是否与指定的标示（当前线程标示）一致
3. 如果一致则释放锁（删除）
4. 如果不一致则什么都不做

<br/>


如果用Lua脚本来表示则是这样的：最终我们操作 Redis 的拿锁比锁删锁的 Lua 脚本就会变成这样

```lua
-- 这里的 KEYS[1] 就是锁的key，这里的ARGV[1] 就是当前线程标示
-- 获取锁中的标示，判断是否与当前线程标示一致
if (redis.call('GET', KEYS[1]) == ARGV[1]) then
  -- 一致，则删除锁
  return redis.call('DEL', KEYS[1])
end
-- 不一致，则直接返回
return 0
```

<br/>

#### 调用Lua脚本改造分布式锁

lua脚本本身并不需要大家花费太多时间去研究，只需要知道如何调用，大致是什么意思即可，所以在笔记中并不会详细的去解释这些lua表达式的含义。

我们的RedisTemplate中，可以利用execute方法去执行lua脚本，参数对应关系就如下图股

<img src="https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314102827298.png" alt="image-20240314102827298" style="zoom:50%;" />

<br/>

**Java代码**

```java
private static final DefaultRedisScript<Long> UNLOCK_SCRIPT;
    static {
        UNLOCK_SCRIPT = new DefaultRedisScript<>();
        UNLOCK_SCRIPT.setLocation(new ClassPathResource("unlock.lua"));
        UNLOCK_SCRIPT.setResultType(Long.class);
    }

public void unlock() {
    // 调用lua脚本
    stringRedisTemplate.execute(
            UNLOCK_SCRIPT,
            Collections.singletonList(KEY_PREFIX + name),
            ID_PREFIX + Thread.currentThread().getId());
}
```

经过以上代码改造后，我们就能够实现拿锁和锁删锁的原子性动作了~

<br/>

**Lua脚本**：unlock.lua

```lua
-- 比较线程标示与锁中的标示是否一致
if(redis.call('get', KEYS[1]) ==  ARGV[1]) then
    -- 释放锁 del key
    return redis.call('del', KEYS[1])
end
return 0
```

:::warning 总结：基于Redis的分布式锁实现思路

- 利用 set nx ex 获取锁，并设置过期时间，保存线程标示释放锁时先判断线程标示
- 是否与自己一致，一致则删除锁

**特性**

- 利用set nx 满足互斥性
- 利用set ex 保证故障时锁依然能释放，避免死锁，提高安全性
- 利用 Redis 集群保证高可用和高并发特性

:::

笔者总结：我们一路走来，利用添加过期时间，防止死锁问题的发生，但是有了过期时间之后，可能出现误删别人锁的问题，这个问题我们开始是利用删之前通过拿锁，比锁，删锁这个逻辑来解决的，也就是删之前判断一下当前这把锁是否是属于自己的，但是现在还有原子性问题，也就是我们没法保证拿锁比锁删锁是一个原子性的动作，最后通过lua表达式来解决这个问题

但是目前还剩下一个问题锁不住，什么是锁不住呢，你想一想，如果当过期时间到了之后，我们可以给他续期一下，比如续个30s，就好像是网吧上网， 网费到了之后，然后说，来，网管，再给我来10块的，是不是后边的问题都不会发生了，那么续期问题怎么解决呢，可以依赖于我们接下来要学习 Redission 啦

<br/>

**测试逻辑：**

第一个线程进来，得到了锁，手动删除锁，模拟锁超时了，其他线程会执行 Lua 来抢锁，当第一天线程利用 Lua 删除锁时，Lua 能保证他不能删除他的锁，第二个线程删除锁时，利用 Lua 同样可以保证不会删除别人的锁，同时还能保证原子性。

<br/>

### Redission

#### 功能介绍

> 💡思考：基于 setnx 实现的分布式锁存在什么问题？

![image-20240314103132756](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314103132756.png)

- **重入问题**：重入问题是指获得锁的线程可以再次进入到相同的锁的代码块中，可重入锁的意义在于防止死锁，比如 HashTable 这样的代码中，他的方法都是使用 synchronized 修饰的，假如他在一个方法内，调用另一个方法，那么此时如果是不可重入的，不就死锁了吗？所以可重入锁他的主要意义是防止死锁，我们的 synchronized 和 Lock 锁都是可重入的。
- **不可重试**：是指目前的分布式只能尝试一次，我们认为合理的情况是：当线程在获得锁失败后，他应该能再次尝试获得锁。
- **超时释放**：我们在加锁时增加了过期时间，这样的我们可以防止死锁，但是如果卡顿的时间超长，虽然我们采用了lua表达式防止删锁的时候，误删别人的锁，但是毕竟没有锁住，有安全隐患
- **主从一致性**： 如果Redis提供了主从集群，当我们向集群写数据时，主机需要异步的将数据同步给从机，而万一在同步过去之前，主机宕机了，就会出现死锁问题。

<br/>

> 💡思考：那么什么是Redission呢？
>

Redisson是一个在 Redis 的基础上实现的Java驻内存数据网格（In-Memory Data Grid）。它不仅提供了一系列的分布式的 Java 常用对象，还提供了许多分布式服务，其中就包含了各种分布式锁的实现。

- 官网地址： https://redisson.org
- GitHub地址： https://github.com/redisson/redisson

Redission提供了分布式锁的多种多样的功能

- 文档：[Redisson Wiki (github.com)](https://github.com/redisson/redisson/wiki/目录)

![image-20240314103630949](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314103630949.png)

#### 快速入门

引入依赖：

```xml
<dependency>
	<groupId>org.redisson</groupId>
	<artifactId>redisson</artifactId>
	<version>3.13.6</version>
</dependency>
```

<br/>

配置Redisson客户端

```java
package com.hmdp.config;

import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RedissonConfig {

    @Bean
    public RedissonClient redissonClient(){
        // 配置
        Config config = new Config();
        config.useSingleServer().setAddress("redis://127.0.0.1:6379");
        // 创建RedissonClient对象
        return Redisson.create(config);
    }
}
```

<br/>

如何使用 Redission 的分布式锁

```java
@Autowired
private RedissonClient redissonClient;

@Test
void testRedisson() throws Exception{
    //获取锁(可重入)，指定锁的名称
    RLock lock = redissonClient.getLock("anyLock");
    //尝试获取锁，参数分别是：获取锁的最大等待时间(期间会重试)，锁自动释放时间，时间单位
    boolean isLock = lock.tryLock(1,10,TimeUnit.SECONDS);
    //判断获取锁成功
    if(isLock){
        try{
            System.out.println("执行业务");
        }finally{
            //释放锁
            lock.unlock();
        }

    }
}
```

<br/>

在 `VoucherOrderServiceImpl` 中注入 `RedissonClient`

```java
@Resource
private RedissonClient redissonClient;

@Override
public Result seckillVoucher(Long voucherId) {
    // 1.查询优惠券
    SeckillVoucher voucher = seckillVoucherService.getById(voucherId);
    // 2.判断秒杀是否开始
    if (voucher.getBeginTime().isAfter(LocalDateTime.now())) {
      // 尚未开始
      return Result.fail("秒杀尚未开始！");
    }
    // 3.判断秒杀是否已经结束
    if (voucher.getEndTime().isBefore(LocalDateTime.now())) {
      // 尚未开始
      return Result.fail("秒杀已经结束！");
    }
    // 4.判断库存是否充足
    if (voucher.getStock() < 1) {
      // 库存不足
      return Result.fail("库存不足！");
    }
    Long userId = UserHolder.getUser().getId();
  
    //创建锁对象 这个代码不用了，因为我们现在要使用分布式锁
    SimpleRedisLock lock = new SimpleRedisLock("order:" + userId, stringRedisTemplate);// [!code --]
    RLock lock = redissonClient.getLock("lock:order:" + userId);// [!code ++]
    //获取锁对象
    boolean isLock = lock.tryLock();

    //加锁失败
    if (!isLock) {
      return Result.fail("不允许重复下单");
    }
    try {
      //获取代理对象(事务)
      IVoucherOrderService proxy = (IVoucherOrderService) AopContext.currentProxy();
      return proxy.createVoucherOrder(voucherId);
    } finally {
      //释放锁
      lock.unlock();
    }
}
```

<br/>

#### 可重入锁原理

在Lock锁中，他是借助于底层的一个 voaltile 的一个 state 变量来记录重入的状态的，比如当前没有人持有这把锁，那么 state = 0，假如有人持有这把锁，那么 state = 1，如果持有这把锁的人再次持有这把锁，那么 state 就会 +1 ，如果是对于 synchronized 而言，他在 c语言 代码中会有一个 count，原理和 state 类似，也是重入一次就加一，释放一次就-1 ，直到减少成0 时，表示当前这把锁没有被人持有。

<br/>

在 **Redission** 中，我们的也支持支持可重入锁.

![image-20240314104022755](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314104022755.png)



在分布式锁中，他采用hash结构用来存储锁，其中大key表示表示这把锁是否存在，用小key表示当前这把锁被哪个线程持有，所以接下来我们一起分析一下当前的这个 Lua 表达式

<br/>

获取锁的Lua脚本

```lua
local key = KEYS[1]; -- 锁的key
local threadId = ARGV[1]; -- 线程唯一标识
local releaseTime = ARGV[2]; -- 锁的自动释放时间
-- 判断是否存在
if (redis.call('exists', key) == 0) then
    -- 不存在, 获取锁
    redis.call('hset', key, threadId, '1');
    -- 设置有效期
    redis.call('expire', key, releaseTime);
    return 1; -- 返回结果
end ;
-- 锁已经存在，判断threadId是否是自己
if (redis.call('hexists', key, threadId) == 1) then
    -- 不存在, 获取锁，重入次数+1
    redis.call('hincrby', key, threadId, '1');
    -- 设置有效期
    redis.call('expire', key, releaseTime);
    return 1; -- 返回结果
end ;
return 0; -- 代码走到这里,说明获取锁的不是自己，获取锁失败
```

<br/>

释放锁的 Lua 脚本

```lua
local key = KEYS[1]; -- 锁的key
local threadId = ARGV[1]; -- 线程唯一标识
local releaseTime = ARGV[2]; -- 锁的自动释放时间
-- 判断当前锁是否还是被自己持有
if (redis.call('HEXISTS', key, threadId) == 0) then
    return nil; -- 如果已经不是自己，则直接返回
end ;
-- 是自己的锁，则重入次数-1
local count = redis.call('HINCRBY', key, threadId, -1);
-- 判断是否重入次数是否已经为0 
if (count > 0) then
    -- 大于0说明不能释放锁，重置有效期然后返回
    redis.call('EXPIRE', key, releaseTime);
    return nil;
else
    -- 等于0说明可以释放锁，直接删除
    redis.call('DEL', key);
    return nil;
end ;
```

这个地方一共有3个参数

- KEYS[1] ： 锁名称
- ARGV[1]：  锁失效时间
- ARGV[2]：  id + ":" + threadId; 锁的小key

exists: 判断数据是否存在  name：是lock是否存在,如果 ==0，就表示当前这把锁不存在

`redis.call('hset', KEYS[1], ARGV[2], 1)`；

此时他就开始往redis里边去写数据 ，写成一个hash结构

```java
Lock{
    id + **":"** + threadId :  1
}
```

如果当前这把锁存在，则第一个条件不满足，再判断

```lua
redis.call('hexists', KEYS[1], ARGV[2]) == 1
```

此时需要通过大key+小key判断当前这把锁是否是属于自己的，如果是自己的，则进行

```lua
redis.call('hincrby', KEYS[1], ARGV[2], 1)
```

将当前这个锁的value进行+1 ，`redis.call('pexpire', KEYS[1], ARGV[1])`； 然后再对其设置过期时间，如果以上两个条件都不满足，则表示当前这把锁抢锁失败，最后返回pttl，即为当前这把锁的失效时间

<br/>

如果小伙帮们看了前边的源码， 你会发现他会去判断当前这个方法的返回值是否为null，如果是null，则对应则前两个if对应的条件，退出抢锁逻辑，如果返回的不是null，即走了第三个分支，在源码处会进行while(true)的自旋抢锁。

```lua
"if (redis.call('exists', KEYS[1]) == 0) then " +
	"redis.call('hset', KEYS[1], ARGV[2], 1); " +
	"redis.call('pexpire', KEYS[1], ARGV[1]); " +
	"return nil; " +
"end; " +
"if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
	"redis.call('hincrby', KEYS[1], ARGV[2], 1); " +
	"redis.call('pexpire', KEYS[1], ARGV[1]); " +
	"return nil; " +
"end; " +
"return redis.call('pttl', KEYS[1]);"
```

<br/>

#### 锁重试和WatchDog机制

**说明**：由于课程中已经说明了有关tryLock的源码解析以及其看门狗原理，所以笔者在这里给大家分析lock()方法的源码解析，希望大家在学习过程中，能够掌握更多的知识。

![image-20240314104730357](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314104730357.png)

抢锁过程中，获得当前线程，通过 tryAcquire 进行抢锁，该抢锁逻辑和之前逻辑相同

- 先判断当前这把锁是否存在，如果不存在，插入一把锁，返回null
- 判断当前这把锁是否是属于当前线程，如果是，则返回null

<br/>

所以如果返回是null，则代表着当前这哥们已经抢锁完毕，或者可重入完毕，但是如果以上两个条件都不满足，则进入到第三个条件，返回的是锁的失效时间，同学们可以自行往下翻一点点，你能发现有个 while(true) 再次进行 tryAcquire 进行抢锁

```java
long threadId = Thread.currentThread().getId();
Long ttl = tryAcquire(-1, leaseTime, unit, threadId);
// lock acquired
if (ttl == null) {
    return;
}
```

接下来会有一个条件分支，因为lock方法有重载方法，一个是带参数，一个是不带参数，如果带带参数传入的值是-1，如果传入参数，则 leaseTime 是他本身，所以如果传入了参数，此时 leaseTime != -1 则会进去抢锁，抢锁的逻辑就是之前说的那三个逻辑

```java
if (leaseTime != -1) {
    return tryLockInnerAsync(waitTime, leaseTime, unit, threadId, RedisCommands.EVAL_LONG);
}
```

如果是没有传入时间，则此时也会进行抢锁， 而且抢锁时间是默认看门狗时间 `commandExecutor.getConnectionManager().getCfg().getLockWatchdogTimeout()`，

`ttlRemainingFuture.onComplete((ttlRemaining, e)` 这句话相当于对以上抢锁进行了监听，也就是说当上边抢锁完毕后，此方法会被调用，具体调用的逻辑就是去后台开启一个线程，进行续约逻辑，也就是看门狗线程

```java
RFuture<Long> ttlRemainingFuture = tryLockInnerAsync(waitTime,
                                        commandExecutor.getConnectionManager().getCfg().getLockWatchdogTimeout(),
                                        TimeUnit.MILLISECONDS, threadId, RedisCommands.EVAL_LONG);
ttlRemainingFuture.onComplete((ttlRemaining, e) -> {
    if (e != null) {
        return;
    }

    // lock acquired
    if (ttlRemaining == null) {
        scheduleExpirationRenewal(threadId);
    }
});
return ttlRemainingFuture;
```

此逻辑就是续约逻辑，注意看 `commandExecutor.getConnectionManager().newTimeout()` 此方法

`Method(  new TimerTask() {},参数2 ，参数3  )`

指的是：通过参数2，参数3 去描述什么时候去做参数1的事情，现在的情况是：10s之后去做参数一的事情

<br/>

因为锁的失效时间是30s，当10s之后，此时这个timeTask 就触发了，他就去进行续约，把当前这把锁续约成30s，如果操作成功，那么此时就会递归调用自己，再重新设置一个timeTask()，于是再过10s后又再设置一个timerTask，完成不停的续约。

<br/>

那么大家可以想一想，假设我们的线程出现了宕机他还会续约吗？当然不会，因为没有人再去调用 `renewExpiration`  这个方法，所以等到时间之后自然就释放了。

```java
private void renewExpiration() {
    ExpirationEntry ee = EXPIRATION_RENEWAL_MAP.get(getEntryName());
    if (ee == null) {
        return;
    }
    
    Timeout task = commandExecutor.getConnectionManager().newTimeout(new TimerTask() {
        @Override
        public void run(Timeout timeout) throws Exception {
            ExpirationEntry ent = EXPIRATION_RENEWAL_MAP.get(getEntryName());
            if (ent == null) {
                return;
            }
            Long threadId = ent.getFirstThreadId();
            if (threadId == null) {
                return;
            }
            
            RFuture<Boolean> future = renewExpirationAsync(threadId);
            future.onComplete((res, e) -> {
                if (e != null) {
                    log.error("Can't update lock " + getName() + " expiration", e);
                    return;
                }
                
                if (res) {
                    // reschedule itself
                    renewExpiration();
                }
            });
        }
    }, internalLockLeaseTime / 3, TimeUnit.MILLISECONDS);
    
    ee.setTimeout(task);
}
```

:::warning 总结：Redisson分布式锁原理

- 可重入：利用hash结构记录线程id和重入次数
- 可重试：利用信号量和PubSub功能实现等待、唤醒，获取锁失败的重试机制
- 超时续约：利用 watchDog，每隔一段时间（releaseTime / 3），重置超时时间

:::

<br/>

#### 锁的MutiLock原理

为了提高 Redis 的可用性，我们会搭建集群或者主从，现在以主从为例

此时我们去写命令，写在主机上， 主机会将数据同步给从机，但是假设在主机还没有来得及把数据写入到从机去的时候，此时主机宕机，哨兵会发现主机宕机，并且选举一个slave变成master，而此时新的master中实际上并没有锁信息，此时锁信息就已经丢掉了。

![image-20240314104811029](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314104811029.png)

为了解决这个问题，Redission 提出来了 MutiLock 锁，使用这把锁咱们就不使用主从了，每个节点的地位都是一样的， 这把锁加锁的逻辑需要写入到每一个主丛节点上，只有所有的服务器都写入成功，此时才是加锁成功，假设现在某个节点挂了，那么他去获得锁的时候，只要有一个节点拿不到，都不能算是加锁成功，就保证了加锁的可靠性。

> 红锁和联锁的区别：红锁需要在（n / 2 + 1）实例上创建锁才算加锁成功，联锁要在所有锁都上锁才算成功

![image-20240314104831560](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314104831560.png)

<br/>

那么 MutiLock 加锁原理是什么呢？笔者画了一幅图来说明

当我们去设置了多个锁时，Redission 会将多个锁添加到一个集合中，然后用while循环去不停去尝试拿锁，但是会有一个总共的加锁时间，这个时间是用需要 加锁的个数 * 1500ms ，假设有3个锁，那么时间就是4500ms，假设在这4500ms内，所有的锁都加锁成功， 那么此时才算是加锁成功，如果在4500ms有线程加锁失败，则会再次去进行重试.

![image-20240314104919132](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314104919132.png)

<br/>

:::warning  总结

1. 不可重入Redis分布式锁：

    - 原理：利用setnx的互斥性；利用ex避免死锁；释放锁时判断线程标示

    - 缺陷：不可重入、无法重试、锁超时失效

2. 可重入的Redis分布式锁：

    - 原理：利用hash结构，记录线程标示和重入次数；利用watchDog延续锁时间；利用信号量控制锁重试等待

    - 缺陷：redis宕机引起锁失效问题

3. Redisson的multiLock：

    - 原理：多个独立的Redis节点，必须在所有节点都获取重入锁，才算获取锁成功

    - 缺陷：运维成本高、实现复杂

:::

<br/>

### 秒杀优化

#### 异步秒杀思路

我们来回顾一下下单流程

![image-20240314105212398](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314105212398.png)

当用户发起请求，此时会请求 Nginx，Nginx会访问到 Tomcat，而 Tomcat 中的程序，会进行串行操作，分成如下几个步骤

1. 查询优惠卷
2. 判断秒杀库存是否足够
3. 查询订单
4. 校验是否是一人一单
5. 扣减库存
6. 创建订单

在这六步操作中，又有很多操作是要去操作数据库的，而且还是一个线程串行执行， 这样就会导致我们的程序执行的很慢，所以我们需要异步程序执行，那么如何加速呢？

<br/>

在这里笔者想给大家分享一下课程内没有的思路，看看有没有小伙伴这么想，比如，我们可以不可以使用异步编排来做，或者说我开启N多线程，N多个线程，一个线程执行查询优惠卷，一个执行判断扣减库存，一个去创建订单等等，然后再统一做返回，这种做法和课程中有哪种好呢？答案是课程中的好，因为如果你采用我刚说的方式，如果访问的人很多，那么线程池中的线程可能一下子就被消耗完了，而且你使用上述方案，最大的特点在于，你觉得时效性会非常重要，但是你想想是吗？并不是，比如我只要确定他能做这件事，然后我后边慢慢做就可以了，我并不需要他一口气做完这件事，所以我们应当采用的是课程中，类似消息队列的方式来完成我们的需求，而不是使用线程池或者是异步编排的方式来完成这个需求

<br/>

**优化方案**

![image-20240314105309915](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314105309915.png)

优化方案：我们将耗时比较短的逻辑判断放入到redis中，比如是否库存足够，比如是否一人一单，这样的操作，只要这种逻辑可以完成，就意味着我们是一定可以下单完成的，我们只需要进行快速的逻辑判断，根本就不用等下单逻辑走完，我们直接给用户返回成功， 再在后台开一个线程，后台线程慢慢的去执行queue里边的消息，这样程序不就超级快了吗？而且也不用担心线程池消耗殆尽的问题，因为这里我们的程序中并没有手动使用任何线程池，当然这里边有两个难点

第一个难点是我们怎么在redis中去快速校验一人一单，还有库存判断

第二个难点是由于我们校验和tomct下单是两个线程，那么我们如何知道到底哪个单他最后是否成功，或者是下单完成，为了完成这件事我们在redis操作完之后，我们会将一些信息返回给前端，同时也会把这些信息丢到异步queue中去，后续操作中，可以通过这个id来查询我们tomcat中的下单逻辑是否完成了。

<br/>

**优化流程**

![image-20240314105449719](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314105449719.png)

我们现在来看看整体思路：当用户下单之后，判断库存是否充足只需要导redis中去根据key找对应的value是否大于0即可，如果不充足，则直接结束，如果充足，继续在redis中判断用户是否可以下单，如果set集合中没有这条数据，说明他可以下单，如果set集合中没有这条记录，则将userId和优惠卷存入到redis中，并且返回0，整个过程需要保证是原子性的，我们可以使用lua来操作

当以上判断逻辑走完之后，我们可以判断当前redis中返回的结果是否是0 ，如果是0，则表示可以下单，则将之前说的信息存入到到queue中去，然后返回，然后再来个线程异步的下单，前端可以通过返回的订单id来判断是否下单成功。

<br/>

#### 秒杀资格判断

:::tip 📌 需求：改进秒杀业务，提高并发性能
- 新增秒杀优惠券的同时，将优惠券信息保存到Redis中
- 基于Lua脚本，判断秒杀库存、一人一单，决定用户是否抢购成功
- 如果抢购成功，将优惠券id和用户id封装后存入阻塞队列
- 开启线程任务，不断从阻塞队列中获取信息，实现异步下单功能

:::

![image-20240314105524017](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314105524017.png)

<br/>

**VoucherServiceImpl**

```java {14-15}
@Override
@Transactional
public void addSeckillVoucher(Voucher voucher) {
    // 保存优惠券
    save(voucher);
    // 保存秒杀信息
    SeckillVoucher seckillVoucher = new SeckillVoucher();
    seckillVoucher.setVoucherId(voucher.getId());
    seckillVoucher.setStock(voucher.getStock());
    seckillVoucher.setBeginTime(voucher.getBeginTime());
    seckillVoucher.setEndTime(voucher.getEndTime());
    seckillVoucherService.save(seckillVoucher);
  
    // 保存秒杀库存到Redis中
    stringRedisTemplate.opsForValue().set(SECKILL_STOCK_KEY + voucher.getId(), voucher.getStock().toString());
}
```

完整 Lua 表达式：seckill.lua

```lua
-- 参数列表 优惠券ID 用户ID 订单ID
local voucherId = ARGV[1]
local userId = ARGV[2]

-- 数据KEY  库存KEY，订单KEY
local stockKey = 'seckill:stock:' .. voucherId
local orderKey = 'seckill:order:' .. voucherId

-- 判断库存是否充足，库存不足返回1
if(tonumber(redis.call('get',stockKey)) <= 0) then
    return 1
end

-- 判断用户是否下单，用户存在返回2
if (redis.call('sismember', orderKey, userId) == 1) then
    return 2
end

-- 扣库存
redis.call('incrby',stockKey,-1)

-- 下单
redis.call('sadd',orderKey,userId)

return 0
```

当以上 Lua 表达式执行完毕后，剩下的就是根据步骤3,4来执行我们接下来的任务了

<br/>

**VoucherOrderServiceImpl**

```java
@Override
public Result seckillVoucher(Long voucherId) {
    //获取用户
    Long userId = UserHolder.getUser().getId();
    long orderId = redisIdWorker.nextId("order");
    // 1.执行lua脚本
    Long result = stringRedisTemplate.execute(
            SECKILL_SCRIPT,
            Collections.emptyList(),
            voucherId.toString(), userId.toString()
    );
    int r = result.intValue();
    // 2.判断结果是否为0
    if (r != 0) {
        // 2.1.不为0 ，代表没有购买资格
        return Result.fail(r == 1 ? "库存不足" : "不能重复下单");
    }
    //TODO 保存阻塞队列
    // 3.返回订单id
    return Result.ok(orderId);
}
```

<br/>

#### 阻塞队列实现

VoucherOrderServiceImpl

修改下单动作，现在我们去下单时，是通过lua表达式去原子执行判断逻辑，如果判断我出来不为0 ，则要么是库存不足，要么是重复下单，返回错误信息，如果是0，则把下单的逻辑保存到队列中去，然后异步执行

```java
package com.hmdp.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hmdp.dto.Result;
import com.hmdp.entity.SeckillVoucher;
import com.hmdp.entity.VoucherOrder;
import com.hmdp.mapper.VoucherOrderMapper;
import com.hmdp.service.ISeckillVoucherService;
import com.hmdp.service.IVoucherOrderService;
import com.hmdp.utils.RedisIdWorker;
import com.hmdp.utils.UserHolder;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.aop.framework.AopContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author 虎哥
 * @since 2021-12-22
 */
@Service
public class VoucherOrderServiceImpl extends ServiceImpl<VoucherOrderMapper, VoucherOrder> implements IVoucherOrderService {
    private static final DefaultRedisScript<Long> SECKILL_SCRIPT;

    @Autowired
    private RedisIdWorker redisIdWorker;
    
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    
    @Autowired
    private RedissonClient redissonClient;

    static {
        SECKILL_SCRIPT = new DefaultRedisScript<>();
        SECKILL_SCRIPT.setLocation(new ClassPathResource("seckill.lua"));
        SECKILL_SCRIPT.setResultType(Long.class);
    }

    private IVoucherOrderService proxy;

    @Override
    public Result seckillVoucher(Long voucherId) {
        //获取用户
        Long userId = UserHolder.getUser().getId();
        // 1.执行lua脚本
        Long result = stringRedisTemplate.execute(
                SECKILL_SCRIPT,
                Collections.emptyList(),
                voucherId.toString(), userId.toString()
        );

        int r = result.intValue();
        // 2.判断结果是否为0
        if (r != 0) {
            // 2.1.不为0 ，代表没有购买资格
            return Result.fail(r == 1 ? "库存不足" : "不能重复下单");
        }

        //判断通过则加入阻塞队列
        VoucherOrder voucherOrder = new VoucherOrder();
        long orderId = redisIdWorker.nextId("order");
        voucherOrder.setId(orderId);
        voucherOrder.setUserId(userId);
        voucherOrder.setVoucherId(voucherId);
        orderTasks.add(voucherOrder);

        //获取代理对象
        proxy = (IVoucherOrderService) AopContext.currentProxy();

        //返回订单ID
        return Result.ok(orderId);
    }

    //创建阻塞队列
    private BlockingQueue<VoucherOrder> orderTasks = new ArrayBlockingQueue<>(1024 * 1024);

    //异步处理线程池
    private static final ExecutorService SECKILL_ORDER_EXECUTOR = Executors.newSingleThreadExecutor();

    //在类初始化之后执行，因为当这个类初始化好了以后，随时都有可能要执行
    @PostConstruct
    private void init() {
        SECKILL_ORDER_EXECUTOR.submit(new VoucherOrderHandler());
    }

    private class VoucherOrderHandler implements Runnable {

        @Override
        public void run() {
            while (true) {
                try {
                    VoucherOrder voucherOrder = orderTasks.take();
                    handleVoucherOrder(voucherOrder);
                } catch (InterruptedException e) {
                    log.error("处理订单异常", e);
                }

            }
        }

        private void handleVoucherOrder(VoucherOrder voucherOrder) {
            Long userId = voucherOrder.getUserId();
            // 创建锁对象
            RLock redisLock = redissonClient.getLock("lock:order:" + userId);
            // 尝试获取锁
            boolean isLock = redisLock.tryLock();
            // 判断
            if (!isLock) {
                // 获取锁失败，直接返回失败或者重试
                log.error("不允许重复下单！");
                return;
            }

            try {
                // 由于是spring的事务是放在threadLocal中，此时的是多线程，事务会失效，所以需要代理对象
                // 但是代理对象在子线程中是无法生效的，所以需要通过声明类成员变量或传入参数
                proxy.createVoucherOrder(voucherOrder);
            } finally {
                // 释放锁
                redisLock.unlock();
            }
        }
    }

    @Autowired
    private ISeckillVoucherService seckillVoucherService;
  
    @Transactional
    public void createVoucherOrder(VoucherOrder voucherOrder) {
        Long userId = voucherOrder.getUserId();
        Long voucherId = voucherOrder.getVoucherId();
        // 创建锁对象
        RLock redisLock = redissonClient.getLock("lock:order:" + userId);
        // 尝试获取锁
        boolean isLock = redisLock.tryLock();
        // 判断
        if (!isLock) {
            // 获取锁失败，直接返回失败或者重试
            log.error("不允许重复下单！");
            return;
        }

        try {

            // 5.1.查询订单
            int count = query().eq("user_id", userId).eq("voucher_id", voucherId).count();
            // 5.2.判断是否存在
            if (count > 0) {
                // 用户已经购买过了
                log.error("不允许重复下单！");
                return;
            }

            // 6.扣减库存
            boolean success = seckillVoucherService.update()
                    .setSql("stock = stock - 1") // set stock = stock - 1
                    .eq("voucher_id", voucherId)
                    .gt("stock", 0) // where id = ? and stock > 0
                    .update();
            if (!success) {
                // 扣减失败
                log.error("库存不足！");
                return;
            }

            // 7.创建订单
            save(voucherOrder);
        } finally {
            // 释放锁
            redisLock.unlock();
        }
    }

}
```

:::warning 总结

秒杀业务的优化思路是什么？

* 先利用Redis完成库存余量、一人一单判断，完成抢单业务
* 再将下单业务放入阻塞队列，利用独立线程异步下单

基于阻塞队列的异步秒杀存在哪些问题？

* 内存限制问题
* 数据安全问题

:::

<br/>

### 消息队列

#### 认识消息队列

什么是消息队列：字面意思就是存放消息的队列。最简单的消息队列模型包括3个角色：

* 消息队列：存储和管理消息，也被称为消息代理（Message Broker）
* 生产者：发送消息到消息队列
* 消费者：从消息队列获取消息并处理消息

Redis提供了三种不同的方式来实现消息队列：

- List结构：基于List结构模拟消息队列
- PubSub：基本的点对点消息模型
- Stream：比较完善的消息队列模型

![image-20240314105659200](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314105659200.png)

<br/>

使用队列的好处在于 **解耦：**

所谓解耦，举一个生活中的例子就是：快递员(生产者)把快递放到快递柜里边(Message Queue)去，我们(消费者)从快递柜里边去拿东西，这就是一个异步，如果耦合，那么这个快递员相当于直接把快递交给你，这事固然好，但是万一你不在家，那么快递员就会一直等你，这就浪费了快递员的时间，所以这种思想在我们日常开发中，是非常有必要的。

这种场景在我们秒杀中就变成了：我们下单之后，利用redis去进行校验下单条件，再通过队列把消息发送出去，然后再启动一个线程去消费这个消息，完成解耦，同时也加快我们的响应速度。

这里我们可以使用一些现成的mq，比如kafka，rabbitmq等等，但是呢，如果没有安装mq，我们也可以直接使用redis提供的mq方案，降低我们的部署和学习成本。

<br/>

#### 基于List实现消息队列

消息队列（Message Queue），字面意思就是存放消息的队列。而Redis的list数据结构是一个双向链表，很容易模拟出队列效果。

队列是入口和出口不在一边，因此我们可以利用：LPUSH 结合 RPOP、或者 RPUSH 结合 LPOP来实现。不过要注意的是，当队列中没有消息时RPOP或LPOP操作会返回null，并不像JVM的阻塞队列那样会阻塞并等待消息。因此这里应该使用BRPOP或者BLPOP来实现阻塞效果。

![image-20240314105913851](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314105913851.png)

基于List的消息队列有哪些优缺点？

优点：

* 利用Redis存储，不受限于JVM内存上限
* 基于Redis的持久化机制，数据安全性有保证
* 可以满足消息有序性

缺点：

* 无法避免消息丢失
* 只支持单消费者

<br/>

#### 基于PubSub的消息队列

PubSub（发布订阅）是Redis2.0版本引入的消息传递模型。顾名思义，消费者可以订阅一个或多个channel，生产者向对应channel发送消息后，所有订阅者都能收到相关消息。

-  SUBSCRIBE channel [channel] ：订阅一个或多个频道
-  PUBLISH channel msg ：向一个频道发送消息
-  PSUBSCRIBE pattern[pattern] ：订阅与pattern格式匹配的所有频道

![image-20240314105815670](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240314105815670.png)

<br/>

基于PubSub的消息队列有哪些优缺点？

优点：

* 采用发布订阅模型，支持多生产、多消费

缺点：

* 不支持数据持久化
* 无法避免消息丢失
* 消息堆积有上限，超出时数据丢失

<br/>

#### 基于Stream的消息队列

Stream 是 Redis 5.0 引入的一种新数据类型，可以实现一个功能非常完善的消息队列。

发送消息的命令：

![image-169355136195417](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-169355136195417.png)

例如：

![image-169355136195418](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-169355136195418.png)

读取消息的方式之一：XREAD

![image-169355136195419](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-169355136195419.png)

例如，使用XREAD读取第一个消息：

![image-169355136195420](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-169355136195420.png)

XREAD阻塞方式，读取最新的消息：

![image-169355136195421](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-169355136195421.png)

在业务开发中，我们可以循环的调用XREAD阻塞方式来查询最新消息，从而实现持续监听队列的效果，伪代码如下

```java
while (true) {
    // 尝试读取队列中的消息，最多阻塞两秒
    Object msg = redis.execute("XREAD COUNT 1 BLOCK 2000 STREAMS users $");

    if (msg == null) {
        continue;
    }

    // 处理消息
    handleMessage(msg);
}
```

注意：当我们指定起始ID为$时，代表读取最新的消息，如果我们处理一条消息的过程中，又有超过1条以上的消息到达队列，则下次获取时也只能获取到最新的一条，会出现**漏读消息**的问题

<br/>

:::warning 总结：STREAM 类型消息队列的 XREAD 命令特点

* 消息可回溯
* 一个消息可以被多个消费者读取
* 可以阻塞读取
* 有消息漏读的风险

:::

<br/>

#### 基于Stream的消息队列-消费者组

消费者组（Consumer Group）：将多个消费者划分到一个组中，监听同一个队列。具备下列特点：

![1653577801668](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/1653577801668.png)

创建消费者组：

```sh
XGROUP CREATE key groupName ID [MKSTREAM]
```

- key：队列名称
- groupName：消费者组名称
- ID：起始ID标示，$代表队列中最后一个消息，0则代表队列中第一个消息
- MKSTREAM：队列不存在时自动创建队列

<br/>

其它常见命令：

**删除指定的消费者组**

```sh
XGROUP DESTORY key groupName
```

**给指定的消费者组添加消费者**

```sh
XGROUP CREATECONSUMER key groupname consumername
```

**删除消费者组中的指定消费者**

```sh
XGROUP DELCONSUMER key groupname consumername
```

<br/>

从消费者组读取消息：

```sh
XREADGROUP GROUP group consumer [COUNT count] [BLOCK milliseconds] [NOACK] STREAMS key [key ...] ID [ID ...]
```

* group：消费组名称
* consumer：消费者名称，如果消费者不存在，会自动创建一个消费者
* count：本次查询的最大数量
* BLOCK milliseconds：当没有消息时最长等待时间
* NOACK：无需手动ACK，获取到消息后自动确认
* STREAMS key：指定队列名称
* ID：获取消息的起始ID：
    * ">"：从下一个未消费的消息开始
    * 其它：根据指定id从pending-list中获取已消费但未确认的消息，例如0，是从pending-list中的第一个消息开始

<br/>

消费者监听消息的基本思路：

```java
while (true) {
    // 尝试监听队列，使用阻塞模式，最长等待 2000 毫秒
    Object msg = redis.call("XREADGROUP GROUP g1 c1 COUNT 1 BLOCK 2000 STREAMS s1 >");

    // 没有消息则继续下一次
    if (msg == null) {
        continue;
    }

    try {
        // 处理完消息一定要ACK
        handleMessage(msg);
    } catch (Exception e) {
        while (true) {
            Object msg = redis.call("XREADGROUP GROUP g1 c1 COUNT 1 BLOCK 2000 STREAMS s1 0");
           
            // 没有异常消息，所以消息都已经确认，结束循环
            if (msg == null) {
                break;
            }

            try {
                // 有异常消息，再次处理
                handleMessage(msg);
            } catch (Exception ex) {
                // 再次出现异常，记录日志，继续循环
                continue;
            }
        }
    }
}
```



:::warning 总结：STREAM 类型消息队列的 XREADGROUP 命令特点

* 消息可回溯
* 可以多消费者争抢消息，加快消费速度
* 可以阻塞读取
* 没有消息漏读的风险
* 有消息确认机制，保证消息至少被消费一次

:::

<br/>

最后我们来个小对比

![image-169355136195423](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-169355136195423.png)

<br/>

#### 实现异步秒杀下单

:::tip 基于Redis的Stream结构作为消息队列，实现异步秒杀下单

* 创建一个Stream类型的消息队列，名为stream.orders
* 修改之前的秒杀下单Lua脚本，在认定有抢购资格后，直接向stream.orders中添加消息，内容包含voucherId、userId、orderId
* 项目启动时，开启一个线程任务，尝试获取stream.orders中的消息，完成下单

:::

<br/>

修改 Lua 表达式

```lua {4,25,26}
-- 参数列表 优惠券ID 用户ID 订单ID
local voucherId = ARGV[1]
local userId = ARGV[2]
local orderId = ARGV[3]   
-- 数据KEY  库存KEY，订单KEY
local stockKey = 'seckill:stock:' .. voucherId
local orderKey = 'seckill:order:' .. voucherId

-- 判断库存是否充足，库存不足返回1
if(tonumber(redis.call('get',stockKey)) <= 0) then
    return 1
end

-- 判断用户是否下单，用户存在返回2
if (redis.call('sismember', orderKey, userId) == 1) then
    return 2
end

-- 扣库存
redis.call('incrby',stockKey,-1)

-- 下单
redis.call('sadd',orderKey,userId)

-- 发送到消息队列中  XADD stream.orders * k1 v1 k2 v2 ... 
redis.call('xadd','stream.orders','*','userId',userId,'voucherId',voucherId,'id',orderId)  

return 0


```

<br/>

**VoucherOrderServiceImpl**

```java {109-174}
package com.hmdp.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hmdp.dto.Result;
import com.hmdp.entity.SeckillVoucher;
import com.hmdp.entity.VoucherOrder;
import com.hmdp.mapper.VoucherOrderMapper;
import com.hmdp.service.ISeckillVoucherService;
import com.hmdp.service.IVoucherOrderService;
import com.hmdp.utils.RedisIdWorker;
import com.hmdp.utils.UserHolder;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.aop.framework.AopContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.connection.stream.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author 虎哥
 * @since 2021-12-22
 */
@Service
public class VoucherOrderServiceImpl extends ServiceImpl<VoucherOrderMapper, VoucherOrder> implements IVoucherOrderService {
    private static final DefaultRedisScript<Long> SECKILL_SCRIPT;

    @Autowired
    private RedisIdWorker redisIdWorker;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private RedissonClient redissonClient;

    static {
        SECKILL_SCRIPT = new DefaultRedisScript<>();
        SECKILL_SCRIPT.setLocation(new ClassPathResource("seckill.lua"));
        SECKILL_SCRIPT.setResultType(Long.class);
    }

    private IVoucherOrderService proxy;

    @Override
    public Result seckillVoucher(Long voucherId) {
        //获取用户
        Long userId = UserHolder.getUser().getId();
        // 1.执行lua脚本
        Long result = stringRedisTemplate.execute(
                SECKILL_SCRIPT,
                Collections.emptyList(),
                voucherId.toString(), userId.toString()
        );

        int r = result.intValue();
        // 2.判断结果是否为0
        if (r != 0) {
            // 2.1.不为0 ，代表没有购买资格
            return Result.fail(r == 1 ? "库存不足" : "不能重复下单");
        }

        //判断通过则加入阻塞队列
        VoucherOrder voucherOrder = new VoucherOrder();
        long orderId = redisIdWorker.nextId("order");
        voucherOrder.setId(orderId);
        voucherOrder.setUserId(userId);
        voucherOrder.setVoucherId(voucherId);
        orderTasks.add(voucherOrder);

        //获取代理对象
        proxy = (IVoucherOrderService) AopContext.currentProxy();

        //返回订单ID
        return Result.ok(orderId);
    }

    //创建阻塞队列
    private BlockingQueue<VoucherOrder> orderTasks = new ArrayBlockingQueue<>(1024 * 1024);

    //异步处理线程池
    private static final ExecutorService SECKILL_ORDER_EXECUTOR = Executors.newSingleThreadExecutor();

    //在类初始化之后执行，因为当这个类初始化好了以后，随时都有可能要执行
    @PostConstruct
    private void init() {
        SECKILL_ORDER_EXECUTOR.submit(new VoucherOrderHandler());
    }

    private class VoucherOrderHandler implements Runnable {

        @Override
        public void run() {
            while (true) {
                try {
                    // 1.获取消息队列中的订单信息 XREADGROUP GROUP g1 c1 COUNT 1 BLOCK 2000 STREAMS s1 >
                    List<MapRecord<String, Object, Object>> list = stringRedisTemplate.opsForStream().read(
                            Consumer.from("g1", "c1"),
                            StreamReadOptions.empty().count(1).block(Duration.ofSeconds(2)),
                            StreamOffset.create("stream.orders", ReadOffset.lastConsumed())
                    );
                    // 2.判断订单信息是否为空
                    if (list == null || list.isEmpty()) {
                        // 如果为null，说明没有消息，继续下一次循环
                        continue;
                    }
                    // 解析数据
                    MapRecord<String, Object, Object> record = list.get(0);
                    Map<Object, Object> value = record.getValue();
                    VoucherOrder voucherOrder = BeanUtil.fillBeanWithMap(value, new VoucherOrder(), true);
                    // 3.创建订单
                    createVoucherOrder(voucherOrder);
                    // 4.确认消息 XACK
                    stringRedisTemplate.opsForStream().acknowledge("s1", "g1", record.getId());
                } catch (Exception e) {
                    log.error("处理订单异常", e);
                    //处理异常消息
                    handlePendingList();
                }
            }
        }

        private void handlePendingList() {
            while (true) {
                try {
                    // 1.获取pending-list中的订单信息 XREADGROUP GROUP g1 c1 COUNT 1 BLOCK 2000 STREAMS s1 0
                    List<MapRecord<String, Object, Object>> list = stringRedisTemplate.opsForStream().read(
                            Consumer.from("g1", "c1"),
                            StreamReadOptions.empty().count(1),
                            StreamOffset.create("stream.orders", ReadOffset.from("0"))
                    );
                    // 2.判断订单信息是否为空
                    if (list == null || list.isEmpty()) {
                        // 如果为null，说明没有异常消息，结束循环
                        break;
                    }
                    // 解析数据
                    MapRecord<String, Object, Object> record = list.get(0);
                    Map<Object, Object> value = record.getValue();
                    VoucherOrder voucherOrder = BeanUtil.fillBeanWithMap(value, new VoucherOrder(), true);
                    // 3.创建订单
                    createVoucherOrder(voucherOrder);
                    // 4.确认消息 XACK
                    stringRedisTemplate.opsForStream().acknowledge("s1", "g1", record.getId());
                } catch (Exception e) {
                    log.error("处理pendding订单异常", e);
                    try{
                        Thread.sleep(20);
                    }catch(Exception ex){
                        ex.printStackTrace();
                    }
                }
            }
        }
    }

    @Autowired
    private ISeckillVoucherService seckillVoucherService;

    @Transactional
    public void createVoucherOrder(VoucherOrder voucherOrder) {
        Long userId = voucherOrder.getUserId();
        Long voucherId = voucherOrder.getVoucherId();
        // 创建锁对象
        RLock redisLock = redissonClient.getLock("lock:order:" + userId);
        // 尝试获取锁
        boolean isLock = redisLock.tryLock();
        // 判断
        if (!isLock) {
            // 获取锁失败，直接返回失败或者重试
            log.error("不允许重复下单！");
            return;
        }

        try {

            // 5.1.查询订单
            int count = query().eq("user_id", userId).eq("voucher_id", voucherId).count();
            // 5.2.判断是否存在
            if (count > 0) {
                // 用户已经购买过了
                log.error("不允许重复下单！");
                return;
            }

            // 6.扣减库存
            boolean success = seckillVoucherService.update()
                    .setSql("stock = stock - 1") // set stock = stock - 1
                    .eq("voucher_id", voucherId)
                    .gt("stock", 0) // where id = ? and stock > 0
                    .update();
            if (!success) {
                // 扣减失败
                log.error("库存不足！");
                return;
            }

            // 7.创建订单
            save(voucherOrder);
        } finally {
            // 释放锁
            redisLock.unlock();
        }
    }

}
```
