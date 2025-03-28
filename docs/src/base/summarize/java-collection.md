# Java集合
[返回首页](index.md)

List相关面试题

- 说一说 Java 提供的常见集合？
- 数组索引为什么从零开始，而不是从一开始？
- ArrayList 底层的实现原理是什么？
- ArrayList list = new ArrayList(10) 中的 list 扩容几次？
- 如何实现数组和List之间的转换？
- ArrayList 和 LinkedList 的区别是什么？

<br/>

HashMap相关面试题

- 什么是二叉树？
- 什么是红黑树？
- 什么是散列表？
- HashMap 实现原理
- HashMap 的 JDK1.7 和 JDK1.8 有什么区别
- HashMap 的 put 方法的具体流程
- HashMap 的寻址算法
- 讲一讲 HashMap 的扩容机制
- 为何 HashMap 的数组长度一定是2的次幂？
- Hashmap 在1.7情况下的多线程死循环问题
- HashSet 与 HashMap 的区别
- HashTable 与 HashMap 的区别

## 导学

这次课程主要涉及到的是 List和Map相关的面试题，比较高频就是

- ArrayList
- LinkedList
- HashMap
- ConcurrentHashMap

![image-20230427162524322](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230427162524322.png)

<br/>

其中

- ArrayList 底层实现是<mark>数组</mark>
- LinkedList 底层实现是<mark>双向链表</mark>
- HashMap 底层实现使用了众多数据结构，包含了<mark>数组、链表、散列表、红黑树等</mark>

在讲解这些集合之后，我们会讲解数据结构，知道了数据结构的特点之后，熟悉集合就更加简单了。在讲解数据结构之前，我们也会简单普及一下算法复杂度分析，让大家能够评判代码的好坏，也能更加深入去理解数据结构和集合。

<br/>

::: warning 💡思考：说一说Java提供的常见集合？

Java中提供的集合框架主要分为两类，一个是 `Collection` 属于单列集合，第二个 `Map` 属于双列集合。

- 在 `Collection` 中有两个字接口 `List` 和 `Set` 。`List` 接口中的实现类 `ArrayList` 和 `LinkedList` ，是有序可重复的；`Set` 接口中实现的有 `HashSet `和 `TreeSet`，无序且唯一。
- 在 `Map` 接口中常见的实现类有 `HashMap` 和 `TreeMap`，还有一个线程安全的`Map:ConcurrentHashMap`。

:::

<br/>

### 算法复杂度分析

> 思考：为什么要进行复杂度分析？

我们先来看下面这个代码，你能评判这个代码的好坏吗？

```java
/*
 * 求1~n的累加和
 * @param n
 * @return
*/
public int sum(int n) {
   int sum = 0;
   for ( int i = 1; i <= n; i++) {
     sum = sum + i;
   }
   return sum;
}
```

其实学习算法复杂度的好处就是：

- 指导你编写出性能更优的代码
- 评判别人写的代码的好坏

>相信你学完了算法复杂度分析，就有能力评判上面代码的好坏了

关于算法复杂度分析，包含了两个内容，一个是时间复杂度，一个是空间复杂度，通常情况下说复杂度，都是指时间复杂度，我们也会重点讲解时间复杂度

<br/>

### 时间复杂度

时间复杂度分析：简单来说就是评估代码的执行耗时的，大家还是看刚才的代码：

```java
/*
 * 求1~n的累加和
 * @param n
 * @return
*/
public int sum(int n) {
   int sum = 0;
   for ( int i = 1; i <= n; i++) {
     sum = sum + i;
   }
   return sum;
}
```

分析这个代码的时间复杂度，分析过程如下：

1. 假如每行代码的执行耗时一样：`1ms`
2. 分析这段代码总执行多少行？`3n+3`
3. 代码耗时总时间：` T(n) = (3n + 3) * 1ms`

>`T(n)`：就是代码总耗时

我们现在有了总耗时，需要借助大O表示法来计算这个代码的时间复杂度

<br/>

#### 大O表示法

不具体表示代码真正的执行时间，而是表示**代码执行时间随数据规模增长的变化趋势**。

刚才的代码示例总耗时公式为：`T(n) = (3n + 3) * 1ms`

>其中 (3n + 3) 是代码的总行数，每行执行的时间都一样，所以得出结论：
>
>**T(n)与代码的执行次数成正比(代码行数越多，执行时间越长)**

不过，大O表示法只需要代码执行时间与数据规模的增长趋势，公式可以简化如下：

`T(n) =O(3n + 3)` ---> `T(n) = O(n)`

>当n很大时，公式中的低阶，常量，系数三部分并不左右其增长趋势，因此可以忽略，我们只需要记录一个最大的量级就可以了

下图也能表明数据的趋势

![image-20230427173120668](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230427173120668.png)

<br/>

#### 常见复杂度表示形式

![image-20230427173742389](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230427173742389.png)

速记口诀：<mark>常对幂指阶</mark>

越在上面的性能就越高，越往下性能就越低

下图是一些比较常见时间复杂度的时间与数据规模的趋势：

![image-20230427173937663](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230427173937663.png)

<br/>

#### 时间复杂度`O(1)`

实例代码：

```java
public int test01(int n){
    int i = 0;
    int j = 1;
    return i + j;
}
```

代码只有三行，它的复杂度也是`O(1)`，而不是`O(3)`

再看如下代码：

```java
public void test02(int n){
    int i = 0;
    int sum = 0;
    for(; i < 100; i ++){
        sum = sum + i;
    }
    System.out.println(sum);
}
```

整个代码中因为循环次数是固定的就是100次，这样的代码复杂度我们认为也是`O(1)`

一句话总结：**只要代码的执行时间不随着n的增大而增大，这样的代码复杂度都是`O(1)`**

<br/>

#### 时间复杂度`O(n)`

实例代码1：

```java
/**
 * 求1~n的累加和
 * @param n
 * @return
 */
public int sum(int n) {
    int sum = 0;
    for ( int i = 1; i <= n; i++) {
        sum = sum + i;
    }
    return sum;
}
```

一层for循序时间复杂度就是 `O(n)`

实例代码2：

```java
public static int sum2(int n){
    int sum = 0;
    for (int i = 1; i < n; ++i) {
        for (int j = 1; j < n; ++j) {
            sum = sum + i * j;
        }
    }
    return sum;
}
```

这个代码的执行行数为：`O( 3n^2  + 3n + 3 )`，不过，依据大O表示的规则：**常量、系数、低阶，可以忽略**

所以这个代码最终的时间复杂度为：`O(n^2)`

<br/>

#### 时间复杂度 `O(logn)`

对数复杂度非常的常见，但相对比较难以分析，实例代码：

```java
public void test04(int n){
    int i=1;
    while(i<=n){
        i = i * 2;
    }
}
```

分析这个代码的复杂度，我们必须要再强调一个前提：**复杂度分析就是要弄清楚代码的执行次数和数据规模n之间的关系**

以上代码最关键的一行是：`i = i * 2`，这行代码可以决定这个while循环执行代码的行数，`i` 的值是可以无限接近 `n` 的值的。如果 `i`  一旦大于等于了 `n` 则循环条件就不满足了。也就说达到了最大的行数。我们可以分析一下 `i` 这个值变化的过程

分析过程如下：

![image-20230427174832858](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230427174832858.png)

由此可知，代码的时间复杂度表示为 `O(log n)`

<br/>

#### 时间复杂度 `O(n * log n)`

分析完O( log n )，那O( n * log n )就很容易理解了，比如下列代码：

```java
public void test05(int n){
    int i=0;
    for(;i<=n;i++){
        test04(n);
    }
}

public void test04(int n){
    int i=1;
    while(i<=n){
        i = i * 2;
    }
}
```

<br/>

### 空间复杂度

空间复杂度全称是渐进空间复杂度，表示算法占用的额外**存储空间**与**数据规模**之间的增长关系

看下面代码

```java
public void test(int n){
    int i=0;
    int sum=0;
    for(;i<n;i++){
        sum = sum+i;
    }
    System.out.println(sum);
}
```

代码执行并不需要占用额外的存储空间，只需要常量级的内存空间大小，因此空间复杂度是O(1)

再来看一个其他例子：

```java
void print(int n) {
    int i = 0;
    int[] a = new int[n];
    for (i; i <n; ++i) {
        a[i] = i * i;
    }
    for (i = n-1; i >= 0; --i) {
        System.out.println(a[i]);
    }
}
```

传入一个变量n，决定申请多少的int数组空间内存，此段代码的空间复杂度为O(n)

我们常见的空间复杂度就是`O(1),O(n),O(n ^2)`，其他像对数阶的复杂度几乎用不到，因此空间复杂度比时间复杂度分析要简单的多。



## List集合

### 数组

数组（Array）是一种用**连续的内存空间**存储**相同数据类型**数据的线性数据结构。

```java
int[] array = {22,33,88,66,55,25};
```

![image-20230427175545402](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230427175545402.png)

我们定义了这么一个数组之后，在内存的表示是这样的：

![image-20230427175633253](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230427175633253.png)

现在假如，我们通过`arrar[1]`，想要获得下标为1这个元素，但是现在栈内存中指向的堆内存数组的首地址，它是如何获取下标为1这个数据的？

![image-20230427175849493](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230427175849493.png)

<br/>

**寻址公式**

为了方便大家理解，我们把数组的内存地址稍微改了一下，都改成了数字，如下图

![image-20230427180056509](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230427180056509.png)

在数组在内存中查找元素的时候，是有一个寻址公式的，如下：

```java
arr[i] = baseAddress + i * dataTypeSize
```

- `arr`：指的是数组
- `i`：指的是数组的下标
- `baseAddress`：数组的首地址，目前是10
- `dataTypeSize`：代表数组中元素类型的大小，目前数组中存储的是int型的数据，`dataTypeSize = 4`个字节

<br/>

有了寻址公式以后，我们再来获取一下下标为1的元素，这个是原来的数组

```java
int[] array = {22,33,88,66,55,25};
```

套入公式：

```java
array[1] =10 + i * 4 = 14
```

获取到14这个地址，就能获取到下标为1的这个元素了。

<br/>

::: warning 💡思考：为什么数组索引从0开始呢？假如从1开始不行吗？

- 在根据数组索引获取元素的时候，会用索引和寻址公式来计算内存所对应的元素数据，寻址公式是：数组的首地址+索引乘以存储数据的类型大小
- 如果数组的索引从1开始，寻址公式中，就需要增加一次减法操作，对于CPU来说就多了一次指令，性能不高。

![image-20231224172600420](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224172600420.png)

:::

<br/>

**操作数组的时间复杂度**

**1.随机查询(根据索引查询)**

数组元素的访问是通过下标来访问的，计算机通过数组的**首地址**和**寻址公式**能够很快速的找到想要访问的元素

```java
public int test01(int[] a,int i){
   return a[i];
   // a[i] = baseAddress + i \* dataSize
}
```

代码的执行次数并不会随着数组的数据规模大小变化而变化，是常数级的，所以查询数据操作的时间复杂度是O(1)

<br/>

**2. 未知索引查询O(n)或O(log2n)**

情况一：查找数组内的元素，查找55号数据，遍历数组时间复杂度为O(n)

![image-20221007101831281](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20221007101831281.png )

情况二：查找排序后数组内的元素，通过二分查找算法查找55号数据时间复杂度为O(logn)

![image-20221007101811885](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20221007101811885.png )

<br/>

**3.插入O(n)**

数组是一段连续的内存空间，因此为了保证数组的连续性会使得数组的插入和删除的效率变的很低。

假设数组的长度为 n，现在如果我们需要将一个数据插入到数组中的第 k 个位置。为了把第 k 个位置腾出来给新来的数据，我们需要将第 k～n 这部分的元素都顺序地往后挪一位。如下图所示：

![image-20220820104903422](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220820104903422.png)

新增之后的数据变化，如下

![image-20220820104950846](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220820104950846.png)

所以：

插入操作，最好情况下是O(1)的，最坏情况下是O(n)的，**平均情况下的时间复杂度是O(n)**。

<br/>

**4.删除O(n)**

同理可得：如果我们要删除第 k 个位置的数据，为了内存的连续性，也需要搬移数据，不然中间就会出现空洞，内存就不连续了，时间复杂度仍然是O(n)。

<br/>

**总结**

数组概念

- 数组是一种用连续的<mark>内存空间</mark>存储<mark>相同数据类型</mark>数据的线性数据结构

数组为什么下标从零开始

- 数组下标从0开始是因为下标从0开始的内存地址效率较高，  寻址公式是：数组的首地址+索引乘以存储数据的类型大小

  ```java
  arr[i] = baseAddress + i * dataTypeSize
  ```

时间复杂度

- 查找元素（按照下标）查询的时间复杂度为` O(1)`
- 查找元素（未知下标）查询的时间复杂度为 `O(n)`
- 查找元素（未知下标但是排序）通过二分查找的时间复杂度为`O(logn)`
- 插入元素和删除元素，为了保证数组的内存连续性，需要挪动数组元素，平均时间复杂度为 `O(n)`

<br/>

### ArrayList

分析ArrayList源码主要从三个方面去翻阅：成员变量，构造函数，关键方法

>以下源码都来源于jdk1.8

#### 成员变量

```java
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable
{
    private static final long serialVersionUID = 8683452581122892189L;

    /**
     * Default initial capacity.
     * 
     * 默认初始化大小
     */
    private static final int DEFAULT_CAPACITY = 10;

    /**
     * Shared empty array instance used for empty instances.
     *
     * 用于空实例的共享空数组实例
     */
    private static final Object[] EMPTY_ELEMENTDATA = {};

    /**
     * Shared empty array instance used for default sized empty instances. We
     * distinguish this from EMPTY_ELEMENTDATA to know how much to inflate when
     * first element is added.
     *
     * 用于默认大小的空实例的共享空数组实例
     * 我们将其与 EMPTY_ELEMENTDATA 区分开来，以了解添加第一个元素要膨胀多少
     */
    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

    /**
     * The array buffer into which the elements of the ArrayList are stored.
     * The capacity of the ArrayList is the length of this array buffer. Any
     * empty ArrayList with elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA
     * will be expanded to DEFAULT_CAPACITY when the first element is added.
     *
     * 存储 ArrayList 元素的数组缓冲区。
     * ArrayList 的容量就是这个数组缓冲区的长度。
     * 当添加第一个元素时，任何具有 elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA  
     * 的空 ArrayList 都将扩展为 DEFAULT_CAPACITY
     * 前对象不参与序列化
     */
    transient Object[] elementData; // non-private to simplify nested class access

    /**
     * The size of the ArrayList (the number of elements it contains).
     * 
     * ArrayList 的大小（它包含的元素数量）
     * @serial
     */
    private int size;
}
```

<br/>

#### 构造方法

```java
/**
 * Constructs an empty list with the specified initial capacity.
 *
 * @param  initialCapacity  the initial capacity of the list
 * @throws IllegalArgumentException if the specified initial capacity
 *         is negative
 */
public ArrayList(int initialCapacity) {
    if (initialCapacity > 0) {
        this.elementData = new Object[initialCapacity];
    } else if (initialCapacity == 0) {
        this.elementData = EMPTY_ELEMENTDATA;
    } else {
        throw new IllegalArgumentException("Illegal Capacity: "+
                                           initialCapacity);
    }
}

/**
 * Constructs an empty list with an initial capacity of ten.
 */
public ArrayList() {
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}
```

>第一个构造是带初始化容量的构造函数，可以按照指定的容量初始化数组
>
>第二个是无参构造函数，默认创建一个空集合

```java
/**
 * Constructs a list containing the elements of the specified
 * collection, in the order they are returned by the collection's
 * iterator.
 *
 * @param c the collection whose elements are to be placed into this list
 * @throws NullPointerException if the specified collection is null
 */
public ArrayList(Collection<? extends E> c) {
    Object[] a = c.toArray();
    if ((size = a.length) != 0) {
        if (c.getClass() == ArrayList.class) {
            elementData = a;
        } else {
            elementData = Arrays.copyOf(a, size, Object[].class);
        }
    } else {
        // replace with empty array.
        elementData = EMPTY_ELEMENTDATA;
    }
}
```

>将 `Collection` 对象转换成数组，然后将数组的地址的赋给 `elementData`

<br/>

#### 源码分析

添加数据的流程

![image-20230427192644244](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230427192644244.png)

<br/>

**ArrayList底层的实现原理是什么**

- 底层数据结构

`ArrayList` 底层是用动态的数组实现的

- 初始容量

`ArrayList` 初始容量为0，当第一次添加数据的时候才会初始化容量为10

- 扩容逻辑

`ArrayList` 在进行扩容的时候是原来容量的1.5倍，每次扩容都需要拷贝数组

- 添加逻辑

  - 确保数组已使用长度（size）加1之后足够存下下一个数据 
  - 计算数组的容量，如果当前数组已使用长度+1后的大于当前的数组长度，则调用grow方法扩容（原来的1.5倍）

  - 确保新增的数据有地方存储之后，则将新元素添加到位于size的位置上。
  - 返回添加成功布尔值。

<br/>

::: warning 💡思考：ArrayList底层是如何实现的？

- `ArrayList` 底层是用动态的数组实现的，初始容量为0，当第一次添加数据的时候才会初始化容量为10，在进行扩容的时候是原来容量的1.5倍，每次扩容都需要拷贝数组。
- 确保数组已使用长度（size）加1之后足够存下下一个数据 ，计算数组的容量，如果当前数组已使用长度+1后的大于当前的数组长度，则调用grow方法扩容（原来的1.5倍），确保新增的数据有地方存储之后，则将新元素添加到位于size的位置上。返回添加成功布尔值。

💡思考：`ArrayList list=new ArrayList(10)`中的 List 扩容几次？

- 该语句只是声明和实例了一个 ArrayList，指定了容量为 10，未扩容。

:::

<br/>

#### 如何实现数组和List之间的转换

```java
// 数组转List
public static void testArray2List() {
    String[] strs = {"aaa", "bbb", "ccc"};
    List<String> list = Arrays.asList(strs);
    for (String s : list) {
        System.out.println(s);
    }
}

// List转数组
public static void testList2Array() {
    List<String> list = new ArrayList<String>();
    list.add("aaa");
    list.add("bbb");
    list.add("ccc");
    String[] array = list.toArray(new String[list.size()]);
    for (String s : array) {
        System.out.println(s);
    }
}
```

参考回答：

- 数组转List ，使用JDK中java.util.Arrays工具类的asList方法

- List转数组，使用List的toArray方法。无参toArray方法返回 Object数组，传入初始化长度的数组对象，返回该对象数组

再问：

- 用Arrays.asList转List后，如果修改了数组内容，list受影响吗


- List用toArray转数组后，如果修改了List内容，数组受影响吗

```java
// 数组转List 
public static void testArray2List() {
    String[] strs = {"aaa", "bbb", "ccc"};
    List<String> list = Arrays.asList(strs);
    for (String s : list) {
        System.out.println(s);
    }
    strs[1] = "ddd";
    System.out.println("================");
    for (String s : list) {
        System.out.println(s);
    }
}

// List转数组
public static void testList2Array() {
    List<String> list = new ArrayList<String>();
    list.add("aaa");
    list.add("bbb");
    list.add("ccc");
    String[] array = list.toArray(new String[list.size()]);
    for (String s : array) {
        System.out.println(s);
    }
    list.add("ddd");
    System.out.println("================");
    for (String s : array) {
        System.out.println(s);
    }
}
```

>数组转List受影响
>
>List转数组不受影响

再答：

- 用Arrays.asList转List后，如果修改了数组内容，list受影响吗


Arrays.asList转换list之后，如果修改了数组的内容，list会受影响，因为它的底层使用的Arrays类中的一个内部类ArrayList来构造的集合，在这个集合的构造器中，把我们传入的这个集合进行了包装而已，最终指向的都是同一个内存地址

- List用toArray转数组后，如果修改了List内容，数组受影响吗


list用了toArray转数组后，如果修改了list内容，数组不会影响，当调用了toArray以后，在底层是它是进行了数组的拷贝，跟原来的元素就没啥关系了，所以即使list修改了以后，数组也不受影响

<br/>

::: warning 💡思考：如何实现数组和List之间的转换？

- 数组转换成List需要用到Arrays.asList；
- List转换成数组需要用到list.toArray，无参toArray方法返回Object数组，传入初始化长度的数组对象，返回该对象数组。

用Arrays.asList转List后，如果修改了数组内容，list受影响吗

- 受影响，asList方法只是在内部封装了数组对象，并没有对原有数组对象做重新拷贝。

List用toArray转数组后，如果修改了List内容，数组受影响吗

- 不受影响，因为toArray方法底层对数组进行了拷贝，跟原来的元素没啥关系，即时list修改了以后，数组也不受影响。

:::

<br/>

### LinkedList

#### 单向链表

- 链表中的每一个元素称之为结点（Node）

- 物理存储单元上，非连续、非顺序的存储结构

- 单向链表：每个结点包括两个部分：一个是存储数据元素的数据域，另一个是存储下一个结点地址的指针域。记录下个结点地址的指针叫作后继指针 next

![image-20230428185922776](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428185922776.png)

代码实现参考：

```java
private static class Node<E> {
  E item;   
  Node<E> next;    
  
  Node(E element, Node<E> next) {        
    this.item = element;        
    this.next = next;    
  }
}

```

链表中的某个节点为B，B的下一个节点为C         表示： B.next==C

<br/>

**时间复杂度分析**

查询操作

![image-20230428190130901](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428190130901.png)

- 只有在查询头节点的时候不需要遍历链表，时间复杂度是O(1)

- 查询其他结点需要遍历链表，时间复杂度是O(n)

插入和删除操作

![image-20230428190210915](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428190210915.png)

- 只有在添加和删除头节点的时候不需要遍历链表，时间复杂度是O(1)
- 添加或删除其他结点需要遍历链表找到对应节点后，才能完成新增或删除节点，时间复杂度是O(n)

<br/>

#### 双向链表

而双向链表，顾名思义，它支持两个方向

- 每个结点不止有一个后继指针 next 指向后面的结点

- 有一个前驱指针 prev 指向前面的结点

![image-20230428190353286](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428190353286.png)

参考代码

```java
private static class Node<E> {
  E item;   
  Node<E> next;    
  Node<E> prev;    
  
  Node(E element, Node<E> next,Node<E> prev) {        
    this.item = element;        
    this.next = next;    
    this.prev = prev;
  }
}
```

对比单链表：

- 双向链表需要额外的两个空间来存储后继结点和前驱结点的地址

- 支持双向遍历，这样也带来了双向链表操作的灵活性

<br/>

**时间复杂度分析**

![image-20230428190450517](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428190450517.png)

查询操作

- 查询头尾结点的时间复杂度是O(1)

- 平均的查询时间复杂度是O(n)

- 给定节点找前驱节点的时间复杂度为O(1)

增删操作

- 头尾结点增删的时间复杂度为O(1)

- 其他部分结点增删的时间复杂度是 O(n)

- 给定节点增删的时间复杂度为O(1)

<br/>

**总结**

单向链表和双向链表的区别是什么

- 单向链表只有一个方向，结点只有一个后继指针 next。
- 双向链表它支持两个方向，每个结点不止有一个后继指针next指向后面的结点，还有一个前驱指针prev指向前面的结点

链表操作数据的时间复杂度是多少

- 单向链表：查询`头O(1)`,其他`O(n)`，给定节点`O(1)`
- 双向链表：查询`头尾O(1),`其他`O(n)`,给定节点`O(1)`

<br/>

ArrayList和LinkedList的区别是什么？

- 底层数据结构

  - ArrayList 是动态数组的数据结构实现

  - LinkedList 是双向链表的数据结构实现

- 操作数据效率

  - ArrayList按照下标查询的时间复杂度O(1)【内存是连续的，根据寻址公式】， LinkedList不支持下标查询
  - 查找（未知索引）： ArrayList需要遍历，链表也需要链表，时间复杂度都是O(n)
  - 新增和删除
    - ArrayList尾部插入和删除，时间复杂度是O(1)；其他部分增删需要挪动数组，时间复杂度是O(n)
    - LinkedList头尾节点增删时间复杂度是O(1)，其他都需要遍历链表，时间复杂度是O(n)

- 内存空间占用

  - ArrayList底层是数组，内存连续，节省内存

  - LinkedList 是双向链表需要存储数据，和两个指针，更占用内存

- 线程安全

  - ArrayList和LinkedList都不是线程安全的

  - 如果需要保证线程安全，有两种方案：

    - 在方法内使用，局部变量则是线程安全的

    - 使用线程安全的ArrayList和LinkedList

      ![image-20231224191559183](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224191559183.png)



<br/>

::: warning 💡 思考：ArrayList 和 LinkedList 的区别是什么？

1. 底层数据结构不同：ArrayList是动态数组的数据结构实现；LinkedList是双向链表的数据结构实现。
2. 数据操作效率不同：
   - 按下标查询：ArrayList可以通过下标查询，时间复杂度为O(1),LinkedList不支持下标查询
   - 遍历：ArrayList和LinkedList遍历的时间复杂度都是O(n)。
   - 新增和删除：ArrayList尾部插入和删除的时间复杂度是O(1)，其他部分增删需要挪动数组，时间复杂度是O(n)；LinkedList头尾节点增删时间复杂度是O(1)，其他部分都需要遍历链表，时间复杂度是O(n)

3. 内存空间占用不同：ArrayList是数组，内存连续，节省内存；LinkedList是链表，内存不连续。

4. 数据都是线程不安全。

:::

## Map集合

### 二叉树

二叉树，顾名思义，每个节点最多有两个“叉”，也就是两个子节点，分别是左子节点和右子节点。不过，二叉树并不要求每个节点都有两个子节点，有的节点只有左子节点，有的节点只有右子节点。

二叉树每个节点的左子树和右子树也分别满足二叉树的定义。

![image-20230428194831426](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428194831426.png)

Java中有两个方式实现二叉树：数组存储，链式存储。

基于链式存储的树的节点可定义如下：

![image-20230428194931132](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428194931132.png)

代码演示

```java
public class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode() {
    }

    TreeNode(int val) {
        this.val = val;
    }

    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
```

<br/>

在二叉树中，比较常见的二叉树有：

- 满二叉树

- 完全二叉树

- **二叉搜索树**

- **红黑树**

我们重点讲解<mark>二叉搜索树</mark>和<mark>红黑树</mark>

<br/>

#### 二叉搜索树

二叉搜索树 `Binary Search Tree,BST` 又名二叉查找树，有序二叉树或者排序二叉树，是二叉树中比较常用的一种类型

二叉查找树要求，在树中的任意一个节点，其左子树中的每个节点的值，都要小于这个节点的值，而右子树节点的值都大于这个节点的值

![image-20230428195206422](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428195206422.png)

<br/>

**时间复杂度**

实际上由于二叉查找树的形态各异，时间复杂度也不尽相同，我画了几棵树我们来看一下插入，查找，删除的时间复杂度

![image-20230428195341917](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428195341917.png)

插入，查找，删除的时间复杂度**O(logn)**

<br/>

极端情况下二叉搜索的时间复杂度

![image-20230428195449799](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428195449799.png)

对于图中这种情况属于最坏的情况，二叉查找树已经退化成了链表，左右子树极度不平衡，此时查找的时间复杂度肯定是O(n)。

<br/>

#### 红黑树

**红黑树（Red Black Tree）**：也是一种自平衡的二叉搜索树(BST)，之前叫做平衡二叉B树（Symmetric Binary B-Tree）

![image-20230428195832724](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428195832724.png)

<br/>

红黑树的特质

- 节点要么是**红色**,要么是**黑色**

- 根节点是**黑色**

- 叶子节点都是黑色的空节点

- 红黑树中红色节点的子节点都是黑色

- 从任一节点到叶子节点的所有路径都包含相同数目的黑色节点


**在添加或删除节点的时候，如果不符合这些性质会发生旋转，以达到所有的性质，保证红黑树的平衡**

<br/>

时间复杂度

- 查找：
  - 红黑树也是一棵BST（二叉搜索树）树，查找操作的时间复杂度为：O(log n)

- 添加：
  - 添加先要从根节点开始找到元素添加的位置，时间复杂度O(log n)
  - 添加完成后涉及到复杂度为O(1)的旋转调整操作
  - 故整体复杂度为：O(log n)

- 删除：
  - 首先从根节点开始找到被删除元素的位置，时间复杂度O(log n)
  - 删除完成后涉及到复杂度为O(1)的旋转调整操作
  - 故整体复杂度为：O(log n)

<br/>

**总结**

什么是二叉树

- 每个节点最多有两个“叉”，分别是左子节点和右子节点。
- 不要求每个节点都有两个子节点，有的节点只有左子节点，有的节点只有右子节点。
- 二叉树每个节点的左子树和右子树也分别满足二叉树的定义

什么是二叉搜索树

- 二叉搜索树(Binary Search Tree,BST)又名二叉查找树，有序二叉树
- 在树中的任意一个节点，其左子树中的每个节点的值，都要小于这个节点的值而右子树节点的值都大于这个节点的值
- 没有键值相等的节点
- 通常情况下二叉树搜索的时间复杂度为O(logn)

什么是红黑树

- 红黑树（Red Black Tree）：也是一种自平衡的二叉搜索树(BST)
- 所有的红黑规则都是希望红黑树能够保证平衡红黑树的
- 时间复杂度：查找、添加、删除都是O(logn)

<br/>

### 散列表

在HashMap中的最重要的一个数据结构就是散列表，在散列表中又使用到了红黑树和链表

散列表(Hash Table)又名哈希表/Hash表，是根据键（Key）直接访问在内存存储位置值（Value）的数据结构，它是由数组演化而来的，利用了数组支持按照下标进行随机访问数据的特性

举个例子：假设有100个人参加马拉松，编号是1-100，如果要编程实现根据选手的编号迅速找到选手信息？

<br/>

可以把选手信息存入数组中，选手编号就是数组的下标，数组的元素就是选手的信息。

当我们查询选手信息的时候，只需要根据选手的编号到数组中查询对应的元素就可以快速找到选手的信息，如下图：

![image-20230428201000814](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428201000814.png)

<br/>

现在需求升级了：

假设有100个人参加马拉松，不采用1-100的自然数对选手进行编号，编号有一定的规则比如：2023ZHBJ001，其中2023代表年份，ZH代表中国，BJ代表北京，001代表原来的编号，那此时的编号2023ZHBJ001不能直接作为数组的下标，此时应该如何实现呢？

![image-20230428201321607](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428201321607.png)

我们目前是把选手的信息存入到数组中，不过选手的编号不能直接作为数组的下标，不过，可以把选手的选号进行转换，转换为数值就可以继续作为数组的下标了？

转换可以使用散列函数进行转换。

<br/>

#### 散列函数和散列冲突

将键(key)映射为数组下标的函数叫做散列函数。可以表示为：hashValue = hash(key)

散列函数的基本要求：

- 散列函数计算得到的散列值必须是大于等于0的正整数，因为hashValue需要作为数组的下标。

- 如果key1==key2，那么经过hash后得到的哈希值也必相同即：hash(key1) == hash(key2）

- **如果key1 != key2，那么经过hash后得到的哈希值也必不相同即：hash(key1) != hash(key2)**

<br/>

实际的情况下想找一个散列函数能够做到对于不同的key计算得到的散列值都不同几乎是不可能的，即便像著名的MD5,SHA等哈希算法也无法避免这一情况，这就是散列冲突(或者哈希冲突，哈希碰撞，**就是指多个key映射到同一个数组下标位置**)

![image-20230428203219225](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428203219225.png)

<br/>

#### 散列冲突-链表法（拉链）

在散列表中，数组的每个下标位置我们可以称之为桶（bucket）或者槽（slot），每个桶(槽)会对应一条链表，所有散列值相同的元素我们都放到相同槽位对应的链表中。

![image-20230428203437910](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428203437910.png)

简单就是，如果有多个key最终的hash值是一样的，就会存入数组的同一个下标中，下标中挂一个链表存入多个数据

<br/>

#### 时间复杂度

1. 插入操作，通过散列函数计算出对应的散列槽位，将其插入到对应链表中即可，插入的时间复杂度是 O(1)

![image-20230428203711269](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428203711269.png)

>通过计算就可以找到元素

<br/>

2. 当查找、删除一个元素时，我们同样通过散列函数计算出对应的槽，然后遍历链表查找或者删除

- 平均情况下基于链表法解决冲突时查询的时间复杂度是O(1)

- 散列表可能会退化为链表,查询的时间复杂度就从 O(1) 退化为 O(n)

![image-20230428203858903](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428203858903.png)

- 将链表法中的链表改造为其他高效的动态数据结构，比如红黑树，查询的时间复杂度是 O(logn)

![image-20230428203924816](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428203924816.png)

将链表法中的链表改造红黑树还有一个非常重要的原因，可以防止DDos攻击

>DDos 攻击：分布式拒绝服务攻击(英文意思是Distributed Denial of Service，简称DDoS）
>
>指处于不同位置的多个攻击者同时向一个或数个目标发动攻击，或者一个攻击者控制了位于不同位置的多台机器并利用这些机器对受害者同时实施攻击。由于攻击的发出点是分布在不同地方的，这类攻击称为分布式拒绝服务攻击，其中的攻击者可以有多个

<br/>

**总结**

什么是散列表？

- 散列表(Hash Table)又名哈希表/Hash表
- 根据键（Key）直接访问在内存存储位置值（Value）的数据结构
- 由数组演化而来的，利用了数组支持按照下标进行随机访问数据

散列冲突

- 散列冲突又称哈希冲突，哈希碰撞
- 指多个key映射到同一个数组下标位置

散列冲突-链表法（拉链）

- 数组的每个下标位置称之为桶（bucket）或者槽（slot）
- 每个桶(槽)会对应一条链表
- hash冲突后的元素都放到相同槽位对应的链表中或红黑树中

<br/>

### HashMap

#### 数据结构

 底层使用hash表数据结构，即数组和链表或红黑树

1. 当我们往HashMap中put元素时，利用key的hashCode重新hash计算出当前对象的元素在数组中的下标 

2. 存储时，如果出现hash值相同的key，此时有两种情况。

   a. 如果key相同，则覆盖原始值；

   b. 如果key不同（出现冲突），则将当前的key-value放入链表或红黑树中 

3. 获取时，直接找到hash值对应的下标，在进一步判断key是否相同，从而找到对应值。

![image-20230428204902016](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428204902016.png)

<br/>

::: warning 💡思考：说一下HashMap的实现原理？

HashMap底层使用 `Hash` 表数据结构，即通过数组、链表和红黑树组成。

- 当我们在 `HashMap` 中 `put` 元素时，会通过 `hashCode` 将 `key` 进行计算，获取当前对象的元素在数组中的下标。
- 存储时，如果出现 `hash` 值相同的 `key`，则会对 `key` 进行判断，如果 `key` 相同则覆盖原始值，`key` 不相同则将当前的 `key-value` 放入链表当链表的长度大于8且数组长度大于64，则会转换为红黑树。
- 获取时，通过 `hash` 值对应的下标，进一步判断 `key` 是否相同，从而找到对应值。

💡**思考：HashMap的 `JDK1.7` 和 `JDK1.8` 有什么区别**

- JDK1.8之前采用的是拉链法。拉链法：将链表和数组相结合。也就是说创建一个链表数组，数组中每一格就是一个链表。若遇到哈希冲突，则将冲突的值加到链表中即可。

- JDK1.8在解决哈希冲突时有了较大的变化，当链表长度大于阈值（默认为8） 时并且数组长度达到64时，将链表转化为红黑树，以减少搜索时间。扩容 resize( ) 时，红黑树拆分成的树的结点数小于等于临界值6个，则退化成链表

:::

<br/>

#### 添加数据

**hashMap常见属性**

![image-20230428210404117](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428210404117.png)

**源码分析**

![image-20230428210450744](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428210450744.png)

- HashMap是懒惰加载，在创建对象时并没有初始化数组

- 在无参的构造函数中，设置了默认的加载因子是0.75

添加数据流程

1. 判断键值对数组table是否为空或为null，否则执行resize()进行扩容（初始化）

2. 根据键值key计算hash值得到数组索引

3. 判断table[i]==null，条件成立，直接新建节点添加

4. 如果table[i]==null ,不成立

   4.1 判断table[i]的首个元素是否和key一样，如果相同直接覆盖value

   4.2 判断table[i] 是否为treeNode，即table[i] 是否是红黑树，如果是红黑树，则直接在树中插入键值对

   4.3 遍历table[i]，链表的尾部插入数据，然后判断链表长度是否大于8，大于8的话把链表转换为红黑树，在红黑树中执行插入操 作，遍历过程中若发现key已经存在直接覆盖value

5. 插入成功后，判断实际存在的键值对数量size是否超多了最大容量threshold（数组长度*0.75），如果超过，进行扩容。

<br/>

流程图

![image-20230428210624847](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428210624847.png)

:::details 具体的源码：

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    //判断数组是否未初始化
    if ((tab = table) == null || (n = tab.length) == 0)
        //如果未初始化，调用resize方法 进行初始化
        n = (tab = resize()).length;
    //通过 & 运算求出该数据（key）的数组下标并判断该下标位置是否有数据
    if ((p = tab[i = (n - 1) & hash]) == null)
        //如果没有，直接将数据放在该下标位置
        tab[i] = newNode(hash, key, value, null);
    //该数组下标有数据的情况
    else {
        Node<K,V> e; K k;
        //判断该位置数据的key和新来的数据是否一样
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
            //如果一样，证明为修改操作，该节点的数据赋值给e,后边会用到
            e = p;
        //判断是不是红黑树
        else if (p instanceof TreeNode)
            //如果是红黑树的话，进行红黑树的操作
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        //新数据和当前数组既不相同，也不是红黑树节点，证明是链表
        else {
            //遍历链表
            for (int binCount = 0; ; ++binCount) {
                //判断next节点，如果为空的话，证明遍历到链表尾部了
                if ((e = p.next) == null) {
                    //把新值放入链表尾部
                    p.next = newNode(hash, key, value, null);
                    //因为新插入了一条数据，所以判断链表长度是不是大于等于8
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        //如果是，进行转换红黑树操作
                        treeifyBin(tab, hash);
                    break;
                }
                //判断链表当中有数据相同的值，如果一样，证明为修改操作
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                //把下一个节点赋值为当前节点
                p = e;
            }
        }
        //判断e是否为空（e值为修改操作存放原数据的变量）
        if (e != null) { // existing mapping for key
            //不为空的话证明是修改操作，取出老值
            V oldValue = e.value;
            //一定会执行  onlyIfAbsent传进来的是false
            if (!onlyIfAbsent || oldValue == null)
                //将新值赋值当前节点
                e.value = value;
            afterNodeAccess(e);
            //返回老值
            return oldValue;
        }
    }
    //计数器，计算当前节点的修改次数
    ++modCount;
    //当前数组中的数据数量如果大于扩容阈值
    if (++size > threshold)
        //进行扩容操作
        resize();
    //空方法
    afterNodeInsertion(evict);
    //添加操作时 返回空值
    return null;
}
```

:::

::: warning 💡思考：HashMap的put方法的具体流程

- 判断键值对数组table是否为null或长度为空，如果为空则进行扩容。
- 根据key值计算hash得到数组索引，根据table下的索引来判断key是否为空。
- 如果为空则直接向数据放在该下标位置
- 如果不为空则判单key是否相同，相同则覆盖，如果不同则判断是否为树节点，如果是红黑素，则直接在树中插入键值对。不是树节点则遍历链表，向链表的尾部插入数据，然后判断链表长度是否大于8，大于则将链表转化为红黑树。
- 插入成功后判断数组中的数量是否大于需要扩容的阈值（数组长度 * 0.75），如果超过则需要扩容

:::

<br/>

#### 扩容机制

![image-20230428210844694](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428210844694.png)

扩容流程：

- 在添加元素或初始化的时候需要调用resize方法进行扩容，第一次添加数据初始化数组长度为16，以后每次每次扩容都是达到了扩容阈值（数组长度 * 0.75）

- 每次扩容的时候，都是扩容之前容量的2倍； 

- 扩容之后，会新创建一个数组，需要把老数组中的数据挪动到新的数组中
  - 没有hash冲突的节点，则直接使用 e.hash & (newCap - 1) 计算新数组的索引位置
  - 如果是红黑树，走红黑树的添加
  - 如果是链表，则需要遍历链表，可能需要拆分链表，判断(e.hash & oldCap)是否为0，该元素的位置要么停留在原始位置，要么移动到原始位置+增加的数组大小这个位置上

流程图：

![image-20230428211031968](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428211031968.png)

:::details 具体的源码：

```java
//扩容、初始化数组
final Node<K,V>[] resize() {
        Node<K,V>[] oldTab = table;
    	//如果当前数组为null的时候，把oldCap老数组容量设置为0
        int oldCap = (oldTab == null) ? 0 : oldTab.length;
        //老的扩容阈值
    	int oldThr = threshold;
        int newCap, newThr = 0;
        //判断数组容量是否大于0，大于0说明数组已经初始化
    	if (oldCap > 0) {
            //判断当前数组长度是否大于最大数组长度
            if (oldCap >= MAXIMUM_CAPACITY) {
                //如果是，将扩容阈值直接设置为int类型的最大数值并直接返回
                threshold = Integer.MAX_VALUE;
                return oldTab;
            }
            //如果在最大长度范围内，则需要扩容  OldCap << 1等价于oldCap*2
            //运算过后判断是不是最大值并且oldCap需要大于16
            else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                     oldCap >= DEFAULT_INITIAL_CAPACITY)
                newThr = oldThr << 1; // double threshold  等价于oldThr*2
        }
    	//如果oldCap<0，但是已经初始化了，像把元素删除完之后的情况，那么它的临界值肯定还存在，       			如果是首次初始化，它的临界值则为0
        else if (oldThr > 0) // initial capacity was placed in threshold
            newCap = oldThr;
        //数组未初始化的情况，将阈值和扩容因子都设置为默认值
    	else {               // zero initial threshold signifies using defaults
            newCap = DEFAULT_INITIAL_CAPACITY;
            newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
        }
    	//初始化容量小于16的时候，扩容阈值是没有赋值的
        if (newThr == 0) {
            //创建阈值
            float ft = (float)newCap * loadFactor;
            //判断新容量和新阈值是否大于最大容量
            newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                      (int)ft : Integer.MAX_VALUE);
        }
    	//计算出来的阈值赋值
        threshold = newThr;
        @SuppressWarnings({"rawtypes","unchecked"})
        //根据上边计算得出的容量 创建新的数组       
    	Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    	//赋值
    	table = newTab;
    	//扩容操作，判断不为空证明不是初始化数组
        if (oldTab != null) {
            //遍历数组
            for (int j = 0; j < oldCap; ++j) {
                Node<K,V> e;
                //判断当前下标为j的数组如果不为空的话赋值个e，进行下一步操作
                if ((e = oldTab[j]) != null) {
                    //将数组位置置空
                    oldTab[j] = null;
                    //判断是否有下个节点
                    if (e.next == null)
                        //如果没有，就重新计算在新数组中的下标并放进去
                        newTab[e.hash & (newCap - 1)] = e;
                   	//有下个节点的情况，并且判断是否已经树化
                    else if (e instanceof TreeNode)
                        //进行红黑树的操作
                        ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                    //有下个节点的情况，并且没有树化（链表形式）
                    else {
                        //比如老数组容量是16，那下标就为0-15
                        //扩容操作*2，容量就变为32，下标为0-31
                        //低位：0-15，高位16-31
                        //定义了四个变量
                        //        低位头          低位尾
                        Node<K,V> loHead = null, loTail = null;
                        //        高位头		   高位尾
                        Node<K,V> hiHead = null, hiTail = null;
                        //下个节点
                        Node<K,V> next;
                        //循环遍历
                        do {
                            //取出next节点
                            next = e.next;
                            //通过 与操作 计算得出结果为0
                            if ((e.hash & oldCap) == 0) {
                                //如果低位尾为null，证明当前数组位置为空，没有任何数据
                                if (loTail == null)
                                    //将e值放入低位头
                                    loHead = e;
                                //低位尾不为null，证明已经有数据了
                                else
                                    //将数据放入next节点
                                    loTail.next = e;
                                //记录低位尾数据
                                loTail = e;
                            }
                            //通过 与操作 计算得出结果不为0
                            else {
                                 //如果高位尾为null，证明当前数组位置为空，没有任何数据
                                if (hiTail == null)
                                    //将e值放入高位头
                                    hiHead = e;
                                //高位尾不为null，证明已经有数据了
                                else
                                    //将数据放入next节点
                                    hiTail.next = e;
                               //记录高位尾数据
                               	hiTail = e;
                            }
                            
                        } 
                        //如果e不为空，证明没有到链表尾部，继续执行循环
                        while ((e = next) != null);
                        //低位尾如果记录的有数据，是链表
                        if (loTail != null) {
                            //将下一个元素置空
                            loTail.next = null;
                            //将低位头放入新数组的原下标位置
                            newTab[j] = loHead;
                        }
                        //高位尾如果记录的有数据，是链表
                        if (hiTail != null) {
                            //将下一个元素置空
                            hiTail.next = null;
                            //将高位头放入新数组的(原下标+原数组容量)位置
                            newTab[j + oldCap] = hiHead;
                        }
                    }
                }
            }
        }
    	//返回新的数组对象
        return newTab;
    }
```

:::

::: warning 💡思考：HashMap是如何实现的扩容

- 在添加元素或初始化的时候需要调用resize方法进行扩容，第一次添加数据初始化数组长度为16，然后每次扩容都是达到了数组长度的四分之三。每次扩容都是之前容量的两倍。
- 扩容之后需要将原先的数组放到新数组中。如果没有hash冲突，则直接取模计算新数组的索引位置。如果是红黑树走红黑树的添加，如果是链表则需要遍历链表。并且需要判断判断(e.hash & oldCap)是否为0，为0则停留在原始位置，不为0则移动到原始位置 + 增加数组大小的位置上。

:::

<br/>

#### 寻址算法

::: tip 📌提示：异或与运算

异或运算^：同为0，异为1（可以理解为不带进位的加法）

- 运算法则：0 ⊕ 0 = 0，1 ⊕ 0 = 1，0 ⊕ 1 = 1，1 ⊕ 1 = 0

按位与运算符&：两位同时为“1”，结果才为“1”，否则为0 

- 运算法则：0 & 0=0，0 &1=0，1 & 0 = 0，1 & 1 = 1

按位或运算符｜：参加运算的两个对象只要有一个为1，其值为1

- 运算法则：0 | 0 = 0，0 | 1 = 1，1 | 0 = 1，1 | 1 =1

:::

<br/>

**put方法**

![image-20230428212501408](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428212501408.png)

在 putVal 方法中，有一个 hash(key) 方法，这个方法就是来去计算key的hash值的，看下面的代码

![image-20230428212601977](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428212601977.png)

首先获取key的hashCode值，然后右移16位 异或运算 原来的hashCode值，主要作用就是使原来的hash值更加均匀，减少hash冲突

有了hash值之后，就很方便的去计算当前key的在数组中存储的下标，看下面的代码：

![image-20230428212729580](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428212729580.png)

(n-1)&hash : 得到数组中的索引，代替取模，性能更好，数组长度必须是2的n次幂

<br/>

**关于hash值的其他面试题：为何HashMap的数组长度一定是2的次幂？**

1.  计算索引时效率更高：如果是 2 的 n 次幂可以使用按位与运算代替取模

2.  扩容时重新计算索引效率更高： hash & oldCap == 0 的元素留在原来位置 ，否则新位置 = 旧位置 + oldCap

<br/>

::: warning 💡思考：hashMap的寻址算法

- 哈希方法首先计算出hashCode值，然后将hash值右移16位后参与按位异或运算得到最后的hash值，使原来的hash值更加均匀。
- 在计算数组下标的时候使用hash值与数组长度取模得到存储下标的位置。为了得到更好的性能，通过2的n次幂减一和按位与运算代替取模。

💡**思考：为何HashMap的数组长度一定是2的次幂？**
  - 计算索引时效率更高。因为相比于取模运算，2的次幂减一可以替代取模运算，并且性能更好。
  - 扩容时重新计算索引效率更高，在扩容时会使用hash值按位与运算旧数组长度是否等于0，是0则在原来的位置，不是0则新位置 = 旧位置下标 + 旧数组长度

:::

<br/>

#### hashmap在1.7情况下的多线程死循环问题

jdk7的的数据结构是：数组+链表

在数组进行扩容的时候，因为链表是头插法，在进行数据迁移的过程中，有可能导致死循环

![image-20230428213115071](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428213115071.png)

- 变量e指向的是需要迁移的对象

- 变量next指向的是下一个需要迁移的对象

- Jdk1.7中的链表采用的头插法

- 在数据迁移的过程中并没有新的对象产生，只是改变了对象的引用

<br/>

产生死循环的过程：

线程1和线程2的变量e和next都引用了这个两个节点

![image-20230428213533483](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428213533483.png)

线程2扩容后，由于头插法，链表顺序颠倒，但是线程1的临时变量e和next还引用了这两个节点

![image-20230428214732877](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428214732877.png)

第一次循环

由于线程2迁移的时候，已经把B的next执行了A

![image-20230428214806072](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428214806072.png)

第二次循环

![image-20230428214908652](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428214908652.png)

第三次循环

![image-20230428214937231](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230428214937231.png)

<br/>

::: warning 💡思考：hashmap在1.7情况下的多线程死循环问题

jdk1.7的hashmap中在数组进行扩容的时候，因为链表是头插法，在进行数据迁移的过程中，有可能导致死循环

比如说，现在有两个线程

线程一：读取到当前的hashmap数据，数据中一个链表，在准备扩容时，

线程二介入线程二：也读取hashmap，直接进行扩容。因为是头插法，链表的顺序会进行颠倒过来。比如原来的顺序是AB，扩容后的顺序是BA，线程二执行结束。

线程一：继续执行的时候就会出现死循环的问题。

线程一先将A移入新的链表，再将B插入到链头，由于另外一个线程的原因，B的next指向了A，所以B->A->B,形成循环。

当然，JDK 8 将扩容算法做了调整，不再将元素加入链表头（而是保持与扩容前一样的顺序），尾插法，就避免了jdk7中死循环的问题。

:::

<br/>

#### HashSet与HashMap的区别

- HashSet实现了Set接口, 仅存储对象; HashMap实现了 Map接口, 存储的是键值对.


- HashSet底层其实是用HashMap实现存储的, HashSet封装了一系列HashMap的方法. 依靠HashMap来存储元素值,(利用hashMap的key键进行存储), 而value值默认为Object对象. 所以HashSet也不允许出现重复值, 判断标准和HashMap判断标准相同, 两个元素的hashCode相等并且通过equals()方法返回true.


![image-20221007110404375](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20221007110404375.png)

<br/>

#### HashTable与HashMap的区别

主要区别：

| **区别**       | **HashTable**                  | **HashMap**      |
| -------------- | ------------------------------ | ---------------- |
| 数据结构       | 数组+链表                      | 数组+链表+红黑树 |
| 是否可以为null | Key和value都不能为null         | 可以为null       |
| hash算法       | key的hashCode()                | 二次hash         |
| 扩容方式       | 当前容量翻倍 +1                | 当前容量翻倍     |
| 线程安全       | 同步(synchronized)的，线程安全 | 非线程安全       |

在实际开中不建议使用HashTable，在多线程环境下可以使用ConcurrentHashMap类







