# JVM知识总结
[返回首页](index.md)

JVM基础

- JVM由那些部分组成
- 详细说一下JVM运行时数据区
- 什么是程序计数器
- 你能给我详细介绍一下Java堆吗
- 什么是虚拟机栈
- 详细说一下堆栈的区别
- 能不能介绍一下运行时常亮池

类加载器

- 什么是类加载器，类加载器有哪些
- 什么是双亲委派机制，JVM为什么采取双亲委派机制
- 说一下类加载器的执行过程

垃圾回收

- GC 是什么？为什么要 GC？对象什么时候可以被回收？
- JVM 垃圾回收算法有哪些
- 说一下 JVM 由哪些垃圾回收器
- 细聊一下 G1 垃圾回收器
- 强引用、软引用、弱引用、虚引用的区别

JVM实践

- JVM 调优的参数在哪里可以设置
- JVM 调优的参数都有哪些
- 说一下 JVM 调优的工具
- Java 内存泄漏的排查思路
- CPU 飙升排查方案与思路

[JVM入门到精通](../../base/jvm/index.md)



## JVM基础

### JVM的组成

**JVM是什么**：Java Virtual Machine Java程序的运行环境，他的职责是运行 Java 字节码文件。

Java 源代码执行流程如下：

- 使用 Java编译器（javac命令）将源代码编译成Java字节码文件。
- 使用 Java虚拟机加载并运行Java字节码文件，此时会启动一个新的进程。

![image-20240208141354541](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240208141354541.png)



**作用**

为了支持Java中Write Once，Run Anywhere；编写一次，到处运行的跨平台特性。

![image-20240209100236505](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240209100236505.png)

对于C/C++这类语言来说，需要将源代码编译成对应平台（不同的操作系统+CPU架构)的机器码，才能让计算机运行。不满足一次编译，到处运行的跨平台特性。

![image-20240209100307818](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240209100307818.png)

但是Java语言不同，Java语言将源代码编译成字节码文件之后，就可以交由不同平台下已经安装好的Java虚拟机。Java虚拟机会将字节码指令实时解释成机器码。这样就满足了一次编译（编译成字节码），到处运行的跨平台特性。

![image-20240209100326137](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240209100326137.png)

<br/>

**实现功能**

- 解释和运行：对字节码文件中的指令，实时的解释成机器码，让计算机执行
- 内存管理：自动为对象、方法等分配内存，自动的垃圾回收机制，回收不再使用的对象。
- 即时编译：对热点代码进行优化，提升执行效率。

<br/>

JVM由哪些部分组成，运行流程是什么？

![image-20230506094411247](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506094411247.png)

<br/>

**组成部分**

- ClassLoader（类加载器）
- Runtime Data Area（运行时数据区，内存分区）
- Execution Engine（执行引擎）
- Native Method Library（本地库接口）

<br/>

**运行流程**

- 通过编译器将源代码文件编译成字节码文件。
- 类加载器通过类加载子系统把字节码加载到内存中。
- 运行时数据区管理 JVM 使用到的内存，而字节码文件只是JVM的一套指令集规范，并不能直接交给底层系统去执行，而是由执行引擎运行。
- 执行引擎通过解释器将字节码翻译为底层系统指令，再交由CPU执行去执行，此时需要调用其他语言的本地库接口来实现整个程序的功能。即时编译器优化代码执行性能，垃圾回收器将不在使用的对象进行回收。

<br/>

:::warning 💡 思考：给我介绍一下 JVM？

- 定义：JVM 本质是一个运行在计算机上的程序，主要功能是运行 Java 的字节码文件。
- 特性：可以实现 Java 代码一次编译，到处运行。对于 C/C++ 来说会将源代码编译成 CPU 能识别机器码来运算，不同系统会重新编译连接。而 Java 语言通过 Java 编译器将源文件编译成字节码文件之后，通过不同平台的 JVM 将字节码文件实时解释成机器码文件。
- 功能
  - 解释和运行，通过执行引擎的解释器将字节码实时解释成CPU能够识别的机器码来运行。
  - 内存管理，通过运行时数据区自动的为对象、方法分配内存空间，通过执行引擎的垃圾回收器自动实现垃圾回收
  - 即时编译，通过执行引擎的编译器将热点代码进行优化，直接转变为机器码文件放在方法区中存储，提高执行效率。

<br/>

💡 **思考：为什么说 Java 是半编译半解释型语言？**

因为Java既能进行通过执行引擎的解释器将字节码文件实时编译成机器码文件，交由不同系统的CPU来执行，也可以通过执行引擎的编译器将热点代码进行优化，直接转变为机器码文件。

<br>

💡 **思考：JVM由哪些部分组成，如何运行**，

JVM主要由四大部分组成，类加载器，运行时数据区，执行引擎，本地库接口。

- Java 源文件是通过编译器将源代码文件编译成字节码文件。
- 类加载器通过类加载子系统把字节码加载到内存中。
- **运行时数据区**将加载到内存中的字节码自动分配内存。
- **执行引擎**则将字节码翻译为机器码，在交由CPU去执行。如果调用了C语言，此时就需要调用本地库接口来实现整个程序的功能。

<br/>

💡 **思考：详细说一下JVM运行时数据区**

![image-20240130210407535](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240130210407535.png)

运行时数据区可以分为线程共享区和线程私有区。

- 线程共享区有堆和方法区。
  - 堆主要是数据存储的地方，存储对象和数组，是垃圾回收器管理的主要部分。
  - 方法区存放的是类的信息，常量、方法、字段、静态变量、即时编译器优化后的代码。
- 线程私有区有虚拟机栈，本地方法栈，程序计数器。
  - 虚拟机栈是数据运行的地方，栈里存储的是栈帧，栈帧里面存储的是局部变量表、操作数栈、动态链接、方法出口等信息。
  - 本地方法栈的功能和栈的功能相同，区别是本地方法栈是 Java 调用非 Java 代码的接口。
  - 程序计数器存放的是当前线程所执行字节码的行数。JVM 工作就是通过改变程序计数器的值来选取下一个需要执行的字节码指令。

:::

<br/>

### 程序计数器

程序计数器：线程私有的，内部保存的字节码的行号。用于记录正在执行的字节码指令的地址。

>javap -verbose  xx.class    打印堆栈大小，局部变量的数量和方法的参数。

![image-20230506094602329](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506094602329.png)

<br/>

​	Java虚拟机对于多线程是通过线程轮流切换并且分配线程执行时间。在任何的一个时间点上，一个处理器只会处理执行一个线程，如果当前被执行的这个线程它所分配的执行时间用完了【挂起】。处理器会切换到另外的一个线程上来进行执行。并且这个线程的执行时间用完了，接着处理器就会又来执行被挂起的这个线程。

​	那么现在有一个问题就是，当前处理器如何能够知道，对于这个被挂起的线程，它上一次执行到了哪里？那么这时就需要从程序计数器中来回去到当前的这个线程他上一次执行的行号，然后接着继续向下执行。

​	程序计数器是JVM规范中唯一一个没有规定出现OOM的区域，所以这个空间也不会进行GC。

<br/>

:::warning 💡 思考：介绍一下程序计数器的作用？

Java虚拟机对于多线程是通过线程轮流切换并且分配线程执行时间。在任何的一个时间点上，一个处理器只会处理执行一个线程，如果当前被执行的这个线程它所分配的执行时间用完了【挂起】。处理器会切换到另外的一个线程上来进行执行。并且这个线程的执行时间用完了，接着处理器就会又来执行被挂起的这个线程。这时候程序计数器就起到了关键作用，程序计数器在来回切换的线程中记录他上一次执行的行号，然后接着继续向下执行。

:::

<br/>

### Java堆

线程共享的区域：主要用来保存对象实例，数组等，当堆中没有内存空间可分配给实例，也无法再扩展时，则抛出OutOfMemoryError异常。

![image-20230506094803545](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506094803545.png)

- 年轻代被划分为三部分，Eden区和两个大小严格相同的Survivor区，根据JVM的策略，在经过几次垃圾收集后，任然存活于Survivor的对象将被移动到老年代区间。
- 老年代主要保存生命周期长的对象，一般是一些老的对象
- 元空间保存的类信息、静态变量、常量、编译后的代码

<br/>

为了避免方法区出现OOM，所以在java8中将堆上的方法区【永久代】给移动到了本地内存上，重新开辟了一块空间，叫做**元空间**。那么现在就可以避免掉OOM的出现了。

![image-20230506094938843](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506094938843.png)

<br/>

**元空间(MetaSpace)介绍**

​	在 HotSpot JVM 中，永久代（ ≈ 方法区）中用于存放类和方法的元数据以及常量池，比如Class 和 Method。每当一个类初次被加载的时候，它的元数据都会放到永久代中。

​	永久代是有大小限制的，因此如果加载的类太多，很有可能导致永久代内存溢出，即`OutOfMemoryError`，为此不得不对虚拟机做调优。

​	那么，Java 8 中 PermGen 为什么被移出 HotSpot JVM 了？

官网给出了解释：http://openjdk.java.net/jeps/122

~~~
This is part of the JRockit and Hotspot convergence effort. JRockit customers do not need to configure the permanent generation (since JRockit does not have a permanent generation) and are accustomed to not configuring the permanent generation.

移除永久代是为融合HotSpot JVM与 JRockit VM而做出的努力，因为JRockit没有永久代，不需要配置永久代。
~~~

1）由于 `PermGen` 内存经常会溢出，引发`OutOfMemoryError`，因此 JVM 的开发者希望这一块内存可以更灵活地被管理，不要再经常出现这样的 OOM。

2）移除 `PermGen` 可以促进 `HotSpot JVM` 与 `JRockit VM `的融合，因为 JRockit 没有永久代。

​	准确来说，Perm 区中的字符串常量池被移到了堆内存中是在 Java7 之后，Java 8 时，PermGen 被元空间代替，其他内容比如**类元信息、字段、静态属性、方法、常量**等都移动到元空间区。比如 `java/lang/Object` 类元信息、静态属性 `System.out`、整型常量等。

​	元空间的本质和永久代类似，都是对 JVM 规范中方法区的实现。不过元空间与永久代之间最大的区别在于：元空间并不在虚拟机中，而是使用本地内存。因此，默认情况下，元空间的大小仅受本地内存限制。

<br/>

:::warning 💡 思考：你能给我详细的介绍Java堆吗?

Java堆是线程共享的区域，主要存储对象和数组，内存不足则会报 `OutOfMemoryError` 异常。

主要由年轻代和老年代构成。年轻代有伊甸园区，From区和To区，存放一些年轻的对象；老年代存放的是一些大对象或者年老的对象。

`JDK7` 中原本有一个永久代，存放的是类元信息、字段、静态属性、方法、常量、即时编译器优化的代码。但是因为永久代大小有限制，当类信息太多则会造成内存溢出，所以在 `JDK8` 中将永久代移除，把数据存储到了本地内存的元空间中，将字符串常量放到了堆中。

:::

<br/>

### 虚拟机栈

Java Virtual machine Stacks (java 虚拟机栈)

- 每个线程运行时所需要的内存，称为虚拟机栈，先进后出
- 每个栈由多个栈帧（frame）组成，对应着每次方法调用时所占用的内存
- 每个线程只能有一个活动栈帧，对应着当前正在执行的那个方法

<img src="https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506095140595.png" alt="image-20230506095140595" style="zoom:50%;" />

1. 垃圾回收是否涉及栈内存？

   垃圾回收主要指就是堆内存，不涉及栈内存。当栈帧弹栈以后，内存就会释放

2. 栈内存分配越大越好吗？

   未必，默认的栈内存通常为1024k

   栈帧过大会导致线程数变少，例如，机器总内存为512m，目前能活动的线程数则为512个，如果把栈内存改为2048k，那么能活动的栈帧就会减半

3. 方法内的局部变量是否线程安全？

   - 如果方法内局部变量没有逃离方法的作用范围，它是线程安全的
   - 如果是局部变量引用了对象，并逃离方法的作用范围，需要考虑线程安全
   - 比如以下代码：

   ![image-20230506095306061](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506095306061.png)

4. 栈内存溢出情况

   - 栈帧过多导致栈内存溢出，典型问题：递归调用

     ![image-20230506095401637](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506095401637.png)
   
   
   - 栈帧过大导致栈内存溢出
   


5. 堆栈的区别是什么？
   - 栈内存一般会用来存储局部变量和方法调用，但堆内存是用来存储Java对象和数组的。堆回GC垃圾回收，栈调用完成后自动回收
   - 栈内存是线程私有的，而堆内存是线程共有的。
   - 两者异常错误不同，如果栈内存或堆内存不足都会抛出异常
      - 栈空间不足：java.lang.StackOverFlowError
      - 堆空间不足：java.lang.OutOfMemoryError

<br/>

:::warning 💡 思考：什么是虚拟机栈

- 每个线程运行时所需要的内存，称为虚拟机栈，遵循后进先出原则。
- 每个栈由多个栈帧组成，对应着每次方法调用时所占用的内存。
- 并且每个线程的活动栈帧只有一个，对应着当前正在执行的方法。

💡 **思考：方法内的局部变量是否线程安全？**

- 如果方法内局部变量没有逃离方法的作用范围，它是线程安全的
- 如果是局部变量引用了对象，并逃离方法的作用范围，需要考虑线程安全

💡 **思考：垃圾回收是否涉及栈内存？**

- 垃圾回收主要指就是堆内存，不涉及栈内存。因为当栈调用完栈以后都会弹出，内存就会释放

💡 **思考：栈内存分配越大越好吗？**

- 栈帧过大会导致线程数变少，例如，机器总内存为512m，目前能活动的线程数则为512个，如果把栈内存改为2048k，那么能活动的栈帧就会减半

💡 **思考：什么情况下会导致栈内存溢出？**

- 有两种情况，一种是递归调用导致的栈帧过多，一种是栈帧过大导致的栈内存溢出。

 💡 **思考：能说一下堆栈的区别是什么吗？**

- 最本质的区别堆是存储单位，存储Java对象和数组；栈是运行单位，在运行时调用局部变量和方法变量。
- 内存时线程私有的，堆是线程共有的。
- 当两者内存不足都会抛出异常，但是异常不同。栈空间不足抛出 `StackOverFlowError`，堆空间不足抛出`OutOfMemoryError`。

:::

<br/>

### 方法区

概述

- 方法区(Method Area)是各个线程共享的内存区域
- 主要存储类的信息、运行时常量池
- 虚拟机启动的时候创建，关闭虚拟机时释放
- 如果方法区域中的内存无法满足分配请求，则会抛出OutOfMemoryError: Metaspace

![image-20230506095504213](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506095504213.png)

<br/>

**常量池**

可以看作是一张表，虚拟机指令根据这张常量表找到要执行的类名、方法名、参数类型、字面量等信息

查看字节码结构（类的基本信息、常量池、方法定义）`javap -v xx.class`

比如下面是一个Application类的main方法执行，源码如下：

```java
public class Application {
    public static void main(String[] args) {
        System.out.println("hello world");
    }
}
```

找到类对应的class文件存放目录，执行命令：`javap -v Application.class`   查看字节码结构

```java
D:\code\jvm-demo\target\classes\com\heima\jvm>javap -v Application.class
Classfile /D:/code/jvm-demo/target/classes/com/heima/jvm/Application.class
  Last modified 2023-05-07; size 564 bytes    //最后修改的时间
  MD5 checksum c1b64ed6491b9a16c2baab5061c64f88   //签名
  Compiled from "Application.java"   //从哪个源码编译
public class com.heima.jvm.Application   //包名，类名
  minor version: 0
  major version: 52     //jdk版本
  flags: ACC_PUBLIC, ACC_SUPER  //修饰符
Constant pool:   //常量池
   #1 = Methodref          #6.#20         // java/lang/Object."<init>":()V
   #2 = Fieldref           #21.#22        // java/lang/System.out:Ljava/io/PrintStream;
   #3 = String             #23            // hello world
   #4 = Methodref          #24.#25        // java/io/PrintStream.println:(Ljava/lang/String;)V
   #5 = Class              #26            // com/heima/jvm/Application
   #6 = Class              #27            // java/lang/Object
   #7 = Utf8               <init>
   #8 = Utf8               ()V
   #9 = Utf8               Code
  #10 = Utf8               LineNumberTable
  #11 = Utf8               LocalVariableTable
  #12 = Utf8               this
  #13 = Utf8               Lcom/heima/jvm/Application;
  #14 = Utf8               main
  #15 = Utf8               ([Ljava/lang/String;)V
  #16 = Utf8               args
  #17 = Utf8               [Ljava/lang/String;
  #18 = Utf8               SourceFile
  #19 = Utf8               Application.java
  #20 = NameAndType        #7:#8          // "<init>":()V
  #21 = Class              #28            // java/lang/System
  #22 = NameAndType        #29:#30        // out:Ljava/io/PrintStream;
  #23 = Utf8               hello world
  #24 = Class              #31            // java/io/PrintStream
  #25 = NameAndType        #32:#33        // println:(Ljava/lang/String;)V
  #26 = Utf8               com/heima/jvm/Application
  #27 = Utf8               java/lang/Object
  #28 = Utf8               java/lang/System
  #29 = Utf8               out
  #30 = Utf8               Ljava/io/PrintStream;
  #31 = Utf8               java/io/PrintStream
  #32 = Utf8               println
  #33 = Utf8               (Ljava/lang/String;)V
{
  public com.heima.jvm.Application();  //构造方法
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 3: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       5     0  this   Lcom/heima/jvm/Application;

  public static void main(java.lang.String[]);  //main方法
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=1, args_size=1
         0: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
         3: ldc           #3                  // String hello world
         5: invokevirtual #4                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
         8: return
      LineNumberTable:
        line 7: 0
        line 8: 8
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       9     0  args   [Ljava/lang/String;
}
SourceFile: "Application.java"
```

下图，左侧是main方法的指令信息，右侧constant pool  是常量池

main方法按照指令执行的时候，需要到常量池中查表翻译找到具体的类和方法地址去执行

![image-20230506095634842](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506095634842.png)

<br/>

**运行时常量池**

常量池是 *.class 文件中的，当该类被加载，它的常量池信息就会放入运行时常量池，并把里面的符号地址变为真实地址

![image-20230506100142724](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506100142724.png)

<br/>

:::warning 💡 思考：能不能介绍一下方法区

- 方法区是各个线程共享的内存区域，存储于本地内存。
- 主要存储类元信息、静态属性、字段、方法、运行时常量、即时编译器优化的代码。虚拟机启动时创建，关闭虚拟机时释放。
- `JDK7`  有个永久代的概念，将大量动态生成类放在永久代，很容易导致 `OOM`，在 `JDK8 ` 中就将方法区的实现放在了本地内存的元空间中，这样方法区就不受 JVM 控制，就不会进行GC，提升了性能。
- 如果方法区域无法存放，则会抛出 `OutOfMemory：Metaspace`

💡 **思考：介绍一下运行时常量池**

常量池可以看作是一张表，虚拟机指令根据这张常量表找到要执行的类名、方法名、参数类型、字面量等信息。而运行时常量是类被加载以后，里面的符号引用变为真实地址。

:::

<br/>

### 直接内存

不受 JVM 内存回收管理，是虚拟机的系统内存，常见于 NIO 操作时，用于数据缓冲区，分配回收成本较高，但读写性能高，不受 JVM 内存回收管理。

举例：需求，在本地电脑中的一个较大的文件（超过100m）从一个磁盘挪到另外一个磁盘

![image-20230506100501905](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506100501905.png)

代码如下：

```java
/**
 * 演示 ByteBuffer 作用
 */
public class Demo1_9 {
    static final String FROM = "E:\\编程资料\\第三方教学视频\\youtube\\Getting Started with Spring Boot-sbPSjI4tt10.mp4";
    static final String TO = "E:\\a.mp4";
    static final int _1Mb = 1024 * 1024;

    public static void main(String[] args) {
        io(); // io 用时：1535.586957 1766.963399 1359.240226
        directBuffer(); // directBuffer 用时：479.295165 702.291454 562.56592
    }

    private static void directBuffer() {
        long start = System.nanoTime();
        try (FileChannel from = new FileInputStream(FROM).getChannel();
             FileChannel to = new FileOutputStream(TO).getChannel();
        ) {
            ByteBuffer bb = ByteBuffer.allocateDirect(_1Mb);
            while (true) {
                int len = from.read(bb);
                if (len == -1) {
                    break;
                }
                bb.flip();
                to.write(bb);
                bb.clear();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        long end = System.nanoTime();
        System.out.println("directBuffer 用时：" + (end - start) / 1000_000.0);
    }

    private static void io() {
        long start = System.nanoTime();
        try (FileInputStream from = new FileInputStream(FROM);
             FileOutputStream to = new FileOutputStream(TO);
        ) {
            byte[] buf = new byte[_1Mb];
            while (true) {
                int len = from.read(buf);
                if (len == -1) {
                    break;
                }
                to.write(buf, 0, len);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        long end = System.nanoTime();
        System.out.println("io 用时：" + (end - start) / 1000_000.0);
    }
}
```

可以发现，使用传统的IO的时间要比NIO操作的时间长了很多了，也就说NIO的读性能更好。

这个是跟我们的JVM的直接内存是有一定关系，如下图，是传统阻塞IO的数据传输流程

![image-20230506100548455](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506100548455.png)

<br/>

下图是NIO传输数据的流程，在这个里面主要使用到了一个直接内存，不需要在堆中开辟空间进行数据的拷贝，jvm可以直接操作直接内存，从而使数据读写传输更快。

![image-20230506100621146](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506100621146.png)

<br/>

:::warning 💡 思考：你听过直接内存吗？

- 直接内存不是虚拟机运行时数据区的一部分，直接内存是在 Java 堆外地、直接向系统申请的内存区域。
- 直接内存使用 NIO，通过存在堆中的 DirectByteBuffer 操作 Native 内存，所以读写性能高。
- 直接内存不受 JVM 管理，但是系统内存是有限的，物理内存不足时会报 OOM。

:::

## 类加载器

JVM只会运行二进制文件，而类加载器（ClassLoader）的主要作用就是将**字节码文件加载到JVM中**，从而让Java程序能够启动起来。现有的类加载器基本上都是java.lang.ClassLoader的子类，该类的只要职责就是用于将指定的类找到或生成对应的字节码文件，同时类加载器还会负责加载程序所需要的资源

<br/>

### 类加载器种类

类加载器根据各自加载范围的不同，划分为四种类加载器：

- **启动类加载器(BootStrap ClassLoader)：**

  该类并不继承ClassLoader类，其是由C++编写实现。用于加载**JAVA_HOME/jre/lib**目录下的类库。

- **扩展类加载器(ExtClassLoader)：**

  该类是ClassLoader的子类，主要加载**JAVA_HOME/jre/lib/ext**目录中的类库。

- **应用类加载器(AppClassLoader)：**

  该类是ClassLoader的子类，主要用于加载**classPath**下的类，也就是加载开发者自己编写的Java类。

- **自定义类加载器：**

  开发者自定义类继承ClassLoader，实现自定义类加载规则。

上述三种类加载器的层次结构如下如下：

![image-20230506100746624](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506100746624.png)

类加载器的体系并不是“继承”体系，而是**委派体系**，类加载器首先会到自己的parent中查找类或者资源，如果找不到才会到自己本地查找。类加载器的委托行为动机是为了避免相同的类被加载多次。

<br/>

:::warning 💡 思考：什么是类加载器，类加载器有哪些?

JVM只会运行二进制文件，类加载器可以将字节码加载到JVM中，让Java程序能够启动起来。

常见的类加载器有四个

- 引导类加载器，是最顶级的加载器，由C++编写实现，主要用于加载 `JAVA_HOME/jre/lib` 目录下的库类
- 拓展类加载器，是引导类加载器的子类，由Java编写实现，主要用于记载`JAVA_HOME/jre/lib/ext`目录中的库类。
- 应用类加载器，是拓展类加载器的字类，由Java编写实现，主要用于加载`Classpath`下的类，也就是自己编写的 Java 类。
- 自定义类加载器，开发者自定义类继承 `ClassLoader` ，实现自定义类加载规则。

:::

<br/>

### 双亲委派模型

如果一个类加载器在接到加载类的请求时，它首先不会自己尝试去加载这个类，而是把这个请求任务委托给父类加载器去完成，依次递归，如果父类加载器可以完成类加载任务，就返回成功；只有父类加载器无法完成此加载任务时，才由下一级去加载。

![image-20230506100920042](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506100920042.png)

<br/>

**JVM为什么采用双亲委派机制**

- 通过双亲委派机制可以避免某一个类被重复加载，当父类已经加载后则无需重复加载，保证唯一性。

- 为了安全，保证类库API不会被修改


在工程中新建java.lang包，接着在该包下新建String类，并定义main函数

```java
public class String {

    public static void main(String[] args) {

        System.out.println("demo info");
    }
}
```

​	此时执行main函数，会出现异常，在类 java.lang.String 中找不到 main 方法

![image-20220903144547378](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220903144547378.png)

​	出现该信息是因为由双亲委派的机制，java.lang.String的在启动类加载器(Bootstrap classLoader)得到加载，因为在核心jre库中有其相同名字的类文件，但该类中并没有main方法。这样就能防止恶意篡改核心API库。

<br/>

:::warning  💡思考：什么是双亲委派模型？

如果一个类加载器收到了类加载的请求，它首先不会自己尝试加载这个类，而是把这请求委派给父类加载器去完成，每一个层次的类加载器都是如此，因此所有的加载请求最终都应该传说到顶层的启动类加载器中，只有当父类加载器返回自己无法完成这个加载请求（它的搜索返回中没有找到所需的类）时，子类加载器才会尝试自己去加载。

<br/>

💡 **思考：JVM为什么采用双亲委派机制？**

- 通过双亲委派机制可以避免某一个类被重复加载，当父类已经加载后则无需重复加载，保证唯一性。
- 为了安全，保证类库都由父类加载器加载，API不会被修改

:::

<br/>

### 类加载的执行过程

类从加载到虚拟机中开始，直到卸载为止，它的整个生命周期包括了：加载、验证、准备、解析、初始化、使用和卸载这7个阶段。其中，验证、准备和解析这三个部分统称为连接（linking）。

![image-20230506101032605](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506101032605.png)

**类加载过程详解**

<br/>

**1.加载**

![image-20230506101115674](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506101115674.png)

- 通过类的全名，获取类的二进制数据流。
- 解析类的二进制数据流为方法区内的数据结构（Java类模型）
- 创建java.lang.Class类的实例，表示该类型。作为方法区这个类的各种数据的访问入口

![image-20230506101213373](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506101213373.png)

<br/>

**2.验证**

![image-20230506101420202](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506101420202.png)

**验证类是否符合JVM规范，安全性检查**

- 文件格式验证
  - 是否符合Class文件的规范
- 元数据验证
  - 这个类是否有父类（除了Object这个类之外，其余的类都应该有父类）。
  - 这个类是否继承（extends）了被final修饰过的类（被final修饰过的类表示类不能被继承）。
  - 类中的字段、方法是否与父类产生矛盾。（被final修饰过的方法或字段是不能覆盖的）

- 字节码验证
  - 主要的目的是通过对数据流和控制流的分析，确定程序语义是合法的、符合逻辑的。
- 符号引用验证
  - 符号引用以一组符号来描述所引用的目标，符号可以是任何形式的字面量


>比如：int i = 3；字面量：3 ；符号引用：i

<br/>

**3.准备**

![image-20230506101445898](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506101445898.png)

**为类变量分配内存并设置类变量初始值**

- static变量，分配空间在准备阶段完成（设置默认值），赋值在初始化阶段完成

- static变量是final的基本类型，以及字符串常量，值已确定，赋值在准备阶段完成

- static变量是final的引用类型，那么赋值也会在初始化阶段完成

![image-20230506101824622](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506101824622.png)

<br/>

**4.解析**

![image-20230506101504632](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506101504632.png)

**把类中的符号引用转换为直接引用**

比如：方法中调用了其他方法，方法名可以理解为符号引用，而直接引用就是使用指针直接指向方法。

![image-20230506102311951](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506102311951.png)

<br/>

**5.初始化**

![image-20230506101625087](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506101625087.png)

**对类的静态变量，静态代码块执行初始化操作**

- 如果初始化一个类的时候，其父类尚未初始化，则优先初始化其父类。

- 如果同时包含多个静态变量和静态代码块，则按照自上而下的顺序依次执行。

<br/>

**6.使用**

![image-20230506101641837](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506101641837.png)

JVM 开始从入口方法开始执行用户的程序代码

- 调用静态类成员信息（比如：静态字段、静态方法）

- 使用new关键字为其创建对象实例

<br/>

**7.卸载**

当用户程序代码执行完毕后，JVM 便开始销毁创建的 Class 对象，最后负责运行的 JVM 也退出内存

<br/>

:::warning 💡 思考：说一下类装载的执行过程

类从加载到虚拟机中开始，直到卸载为止，它的整个生命周期包括了：加载、验证、准备、解析、初始化、使用和卸载这7个阶段。其中，验证、准备和解析这三个部分统称为连接（linking）

- 加载：查找和导入class文件
- 验证：保证加载类的准确性
- 准备：为类变量分配内存并设置类变量初始值
- 解析：把类中的符号引用转换为直接引用
- 初始化：对类的静态变量，静态代码块执行初始化操作
- 使用：JVM 开始从入口方法开始执行用户的程序代码
- 卸载：当用户程序代码执行完毕后，JVM 便开始销毁创建的 Class 对象，最后负责运行的 JVM 也退出内存。

:::

## 垃圾收回

### 垃圾回收概述

> 提问：GC是什么？为什么要GC

为了让程序员更专注于代码的实现，而不用过多的考虑内存释放的问题，所以，在Java语言中，有了自动的垃圾回收机制，也就是我们熟悉的GC(Garbage Collection)。

有了垃圾回收机制后，程序员只需要关心内存的申请即可，内存的释放由系统自动识别完成。

在进行垃圾回收时，不同的对象引用类型，GC会采用不同的回收时机

<br/>

换句话说，自动的垃圾回收的算法就会变得非常重要了，如果因为算法的不合理，导致内存资源一直没有释放，同样也可能会导致内存溢出的。

当然，除了Java语言，C#、Python等语言也都有自动的垃圾回收机制。

<br/>

:::warning 💡 思考：为什么需要Java垃圾回收机制？

让程序员更加专注于代码的实现，而不用过多考虑内存释放问题，因为垃圾回收机制可以帮助我们自动进行垃圾回收。

:::



> 提问：对象什么时候可以被垃圾器回收

![image-20230506104954777](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506104954777.png)

简单一句就是：如果一个或多个对象没有任何的引用指向它了，那么这个对象现在就是垃圾，如果定位了垃圾，则有可能会被垃圾回收器回收。

如果要定位什么是垃圾，有两种方式来确定，第一个是引用计数法，第二个是可达性分析算法

<br/>

**引用计数法**

一个对象被引用了一次，在当前的对象头上递增一次引用次数，如果这个对象的引用次数为0，代表这个对象可回收

```java
String demo = new String("123");
```

![image-20230506111102825](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506111102825.png)

```java
String demo = null;
```

![image-20230506111136231](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506111136231.png)

当对象间出现了循环引用的话，则引用计数法就会失效

![image-20230506111255401](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506111255401.png)

先执行右侧代码的前4行代码

![image-20230506111327590](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506111327590.png)

目前上方的引用关系和计数都是没问题的，但是，如果代码继续往下执行，如下图

![image-20230506111512450](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506111512450.png)

虽然a和b都为null，但是由于a和b存在循环引用，这样a和b永远都不会被回收。

优点：

- 实时性较高，无需等到内存不够的时候，才开始回收，运行时根据对象的计数器是否为0，就可以直接回收。
- 在垃圾回收过程中，应用无需挂起。如果申请内存时，内存不足，则立刻报OOM错误。
- 区域性，更新对象的计数器时，只是影响到该对象，不会扫描全部对象。

缺点：

- 每次对象被引用时，都需要去更新计数器，有一点时间开销。
- **浪费CPU资源**，即使内存够用，仍然在运行时进行计数器的统计。
- **无法解决循环引用问题，会引发内存泄露**。（最大的缺点）

<br/>

**可达性分析算法**

现在的虚拟机采用的都是通过可达性分析算法来确定哪些内容是垃圾。

会存在一个根节点【GC Roots】，引出它下面指向的下一个节点，再以下一个节点节点开始找出它下面的节点，依次往下类推。直到所有的节点全部遍历完毕。

> 根对象是那些肯定不能当做垃圾回收的对象，比如：<mark>局部变量，静态方法，静态变量，类信息</mark>
>
> 核心是：判断某对象是否与根对象有直接或间接的引用，如果没有被引用，则可以当做垃圾回收

![image-20240205141533159](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240205141533159.png)

​	Object5,Object6,Object7这三个节点是可回收的，但是**并不会马上的被回收！！** 对象中存在一个方法【finalize】。当对象被标记为可回收后，当发生GC时，首先**会判断这个对象是否执行了finalize方法**，如果这个方法还没有被执行的话，那么就会先来执行这个方法，接着在这个方法执行中，可以设置当前这个对象与GC ROOTS产生关联，那么这个方法执行完成之后，GC会再次判断对象是否可达，如果仍然不可达，则会进行回收，如果可达了，则不会进行回收。

​	finalize方法对于每一个对象来说，只会执行一次。如果第一次执行这个方法的时候，设置了当前对象与RC ROOTS关联，那么这一次不会进行回收。 那么等到这个对象第二次被标记为可回收时，那么该对象的finalize方法就不会再次执行了。

<br/>

**GC ROOTS：**

- 虚拟机栈（栈帧中的本地变量表）中引用的对象

```java
/**
 * demo是栈帧中的本地变量，当 demo = null 时，
 * 由于此时 demo 充当了 GC Root 的作用，
 * demo与原来指向的实例 new Demo() 断开了连接，对象被回收。
 */
public class Demo {
    public static  void main(String[] args) {
    	Demo demo = new Demo();
    	demo = null;
    }
}
```

- 方法区中类静态属性引用的对象

```java
/**
 * 当栈帧中的本地变量 b = null 时，
 * 由于 b 原来指向的对象与 GC Root (变量 b) 断开了连接，
 * 所以 b 原来指向的对象会被回收，而由于我们给 a 赋值了变量的引用，
 * a在此时是类静态属性引用，充当了 GC Root 的作用，它指向的对象依然存活!
 */
public class Demo {
    public static Demo a;
    public static  void main(String[] args) {
        Demo b = new Demo();
        b.a = new Demo();
        b = null;
    }
}
```

- 方法区中常量引用的对象

```java
/**
 * 常量 a 指向的对象并不会因为 demo 指向的对象被回收而回收
 */
public class Demo {
    
    public static final Demo a = new Demo();
    
    public static  void main(String[] args) {
        Demo demo = new Demo();
        demo = null;
    }
}
```

- 本地方法栈中 JNI（即一般说的 Native 方法）引用的对象

<br/>

:::warning 💡 思考：什么时候可以被垃圾器回收？

首先我们需要对垃圾进行定义，垃圾就是对象没有任何的引用指向了，则需要被垃圾回收器进行回收。

然后是对垃圾进行定位，有两种定位垃圾的算法，分别是引用器计数法和可达性分析算法。因为引用器计数算法无法解决循环依赖问题，所以Java使用的是可达性分析算法。

:::

### 垃圾回收概念

**强引用**

只有所有 GC Roots 对象都不通过【强引用】引用该对象，该对象才能被垃圾回收

```java
User user = new User();
```

![image-20230506155341703](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506155341703.png)

<br/>

**软引用**

仅有软引用引用该对象时，在垃圾回收后，内存仍不足时会再次出发垃圾回收

```java
User user = new User();
SoftReference softReference = new SoftReference(user);
```

![image-20230506155416293](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506155416293.png)

<br/>

**弱引用**

仅有弱引用引用该对象时，在垃圾回收时，无论内存是否充足，都会回收弱引用对象

```java
User user = new User();
WeakReference weakReference = new WeakReference(user);
```

![image-20230506155501557](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506155501557.png)

>延伸话题：ThreadLocal内存泄漏问题

ThreadLocal用的就是弱引用，看以下源码：

```java
static class Entry extends WeakReference<ThreadLocal<?>> {
    Object value;

    Entry(ThreadLocal<?> k, Object v) {
         super(k);
         value = v; //强引用，不会被回收
     }
}
```

`Entry`的key是当前ThreadLocal，value值是我们要设置的数据。

`WeakReference`表示的是弱引用，当JVM进行GC时，一旦发现了只具有弱引用的对象，不管当前内存空间是否足够，都会回收它的内存。但是`value`是强引用，它不会被回收掉。

>ThreadLocal使用建议：使用完毕后注意调用清理方法。

<br/>

**虚引用**

必须配合引用队列使用，被引用对象回收时，会将虚引用入队，由 Reference Handler 线程调用虚引用相关方法释放直接内存

![image-20230506155518510](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506155518510.png)

![image-20230506155552693](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506155552693.png)



> **面试官**：强引用、软引用、弱引用、虚引用的区别？
>
> **候选人:**
>
> 嗯嗯~
>
> 强引用最为普通的引用方式，表示一个对象处于**有用且必须**的状态，如果一个对象具有强引用，则GC并不会回收它。即便堆中内存不足了，宁可出现OOM，也不会对其进行回收
>
> 软引用表示一个对象处于**有用且非必须**状态，如果一个对象处于软引用，在内存空间足够的情况下，GC机制并不会回收它，而在内存空间不足时，则会在OOM异常出现之间对其进行回收。但值得注意的是，因为GC线程优先级较低，软引用并不会立即被回收。
>
> 弱引用表示一个对象处于**可能有用且非必须**的状态。在GC线程扫描内存区域时，一旦发现弱引用，就会回收到弱引用相关联的对象。对于弱引用的回收，无关内存区域是否足够，一旦发现则会被回收。同样的，因为GC线程优先级较低，所以弱引用也并不是会被立刻回收。
>
> 虚引用表示一个对象处于**无用**的状态。在任何时候都有可能被垃圾回收。虚引用的使用必须和引用队列Reference Queue联合使用。



###  垃圾回收算法

**标记清除算法**

标记清除算法，是将垃圾回收分为2个阶段，分别是**标记和清除**。

1.根据可达性分析算法得出的垃圾进行标记

2.对这些标记为可回收的内容进行垃圾回收

![image-20230506112047190](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506112047190.png)

可以看到，标记清除算法解决了引用计数算法中的循环引用的问题，没有从root节点引用的对象都会被回收。

同样，标记清除算法也是有缺点的：

- 效率较低，**标记和清除两个动作都需要遍历所有的对象**，并且在GC时，**需要停止应用程序**，对于交互性要求比较高的应用而言这个体验是非常差的。
- （**重要**）通过标记清除算法清理出来的内存，碎片化较为严重，因为被回收的对象可能存在于内存的各个角落，所以清理出来的内存是不连贯的。

<br/>

**复制算法**

​	复制算法的核心就是，**将原有的内存空间一分为二，每次只用其中的一块**，在垃圾回收时，将正在使用的对象复制到另一个内存空间中，然后将该内存空间清空，交换两个内存的角色，完成垃圾的回收。

​	如果内存中的垃圾对象较多，需要复制的对象就较少，这种情况下适合使用该方式并且效率比较高，反之，则不适合。

![image-20230506111919008](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506111919008.png)

- 将内存区域分成两部分，每次操作其中一个。
- 当进行垃圾回收时，将正在使用的内存区域中的存活对象移动到未使用的内存区域。当移动完对这部分内存区域一次性清除。

- 周而复始。


优点：

- 在垃圾对象多的情况下，效率较高
- 清理后，内存无碎片

缺点：

- 分配的2块内存空间，在同一个时刻，只能使用一半，内存使用率较低

<br/>

**标记整理算法**

​	标记压缩算法是在标记清除算法的基础之上，做了优化改进的算法。和标记清除算法一样，也是从根节点开始，对对象的引用进行标记，在清理阶段，并不是简单的直接清理可回收对象，而是将存活对象都向内存另一端移动，然后清理边界以外的垃圾，从而解决了碎片化的问题。

![image-20230506111957793](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506111957793.png)

- 标记垃圾。

- 需要清除向右边走，不需要清除的向左边走。

- 清除边界以外的垃圾。


优缺点同标记清除算法，解决了标记清除算法的碎片化的问题，同时，标记压缩算法多了一步，对象移动内存位置的步骤，其效率也有有一定的影响。

与复制算法对比：复制算法标记完就复制，但标记整理算法得等把所有存活对象都标记完毕，再进行整理。

<br/>

::: warning 💡思考：JVM垃圾回收算法有哪些

- 标记清除算法：垃圾回收分为两个阶段，分别为标记和清除，效率高，但是有磁盘碎片，内存不连续
- 标记整理算法：垃圾回收分为三个阶段，分别为标记，清除和整理，会将存活对象移动到内存的另一端，无碎片。但是因为对象需要移动，所以效率比较低。
- 复制算法：将原有的内存空间一分为二，每次只使用其中的一块，正在使用的对象复制到宁一个内存空间中，然后将该内存清空，交换两个内存的角色完成垃圾的回收；虽然没碎片，但是会有内存浪费，效率高低标记整理算法但是高于标记清除算法。

:::

<br/>

### 分代收集算法

在java8时，堆被分为了两份：**新生代和老年代【1：2】**，在java7时，还存在一个永久代。

![image-20230506131229649](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506131229649.png)

对于新生代，内部又被分为了三个区域。Eden区，S0区，S1区【8：1：1】

当对新生代产生GC：MinorGC【Young GC】

当对老年代代产生GC：Major GC

当对新生代和老年代产生FullGC： 新生代 + 老年代完整垃圾回收，暂停时间长，**应尽力避免**

<br/>

**工作机制**

![image-20230506131308654](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506131308654.png)

- 新创建的对象，都会先分配到eden区

![image-20230506131415418](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506131415418.png)

- 当伊甸园内存不足，标记伊甸园与 from（现阶段没有）的存活对象

- 将存活对象采用复制算法复制到 to 中，复制完毕后，伊甸园和 from 内存都得到释放

![image-20230506131442503](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506131442503.png)

- 经过一段时间后伊甸园的内存又出现不足，标记eden区域to区存活的对象，将存活的对象复制到from区

![image-20230506131544447](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506131544447.png)

![image-20230506131607645](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506131607645.png)

- 当幸存区对象熬过几次回收（最多15次），晋升到老年代（幸存区内存不足或大对象会导致提前晋升）



**MinorGC、 Mixed GC 、 FullGC的区别是什么**

![image-20230506131640893](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506131640893.png)

- MinorGC【young GC】发生在新生代的垃圾回收，暂停时间短（STW）

- Mixed GC 新生代 + 老年代部分区域的垃圾回收，G1 收集器特有

- FullGC： 新生代 + 老年代完整垃圾回收，暂停时间长（STW），应尽力避免

<br/>

:::warning 💡思考：JVM中的分代回收的流程是怎么样的？

JDK8版本时，堆被分为了两个部分，一个是新生代，一个是老年代，默认空间占用比例是1:2

新生代内部又被分为三个区域。伊甸园区，FROM区和TO区。默认空间占比为8:1:1

具体的工作流程是这样的：

- 新创建的对象先放到伊甸园区，当伊甸园区和 FROM 区满时会触发 YoungGC，将存活对象采用复制算法复制到 TO区 并年龄加一，复制完成后伊甸园区和FROM区都会释放内存，并把TO 区改为FROM 区。
- 当经过一段时间内存又不足时触发 YoungGC，重复上面的步骤，当TO 区存活的对象超过15岁后则晋升为老年代。如果幸存区内存不足或大对象会提前晋升为老年代。
- 当老年代满了以后会触发FullGC，同时收集年轻代和老年代，这时是只存在FullGC的线程执行，其他线程都会被挂起。我们需要在程序中尽量避免FullGC出现。

<br/>

💡**思考：新生代、老年代、永久代的区别**

- 新生代存放的是新创建对象的数据。
- 老年代存放的是存活时间长的数据和占用空间大的数据。
- 永久代存放的是类元信息、静态属性、字段、方法、常量。在JDK8版本中永久代已经被元空间取代，元空间相较于永久代，使用的是本地内存实现，而不在虚拟机中，所以元空间的大小只受本地空间的限制。

<br/>

💡**思考：MinorGC、MajorGC、FullGC的区别**

![image-20240206205538397](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240206205538397.png)

针对 `HotSpot VM` 的实现，它里面的 GC 其实准确分类只有两大种：

- `Partial GC`：并不收集整个 GC 堆的模式
  - `Young GC`：只收集 `young gen`的 GC
  - `Old GC`：只收集 `old gen` 的 GC。只有 `CMS` 的 `concurrent collection` 是这个模式
  - `Mixed GC`：收集整个`young gen`以及部分 `old gen` 的GC。只有G1有这个模式
- `Full GC`：收集整个堆，包括 `young gen`、`old gen`、`perm gen`（如果存在的话）等所有部分的模式。

`Major GC` 通常是跟 `Full GC` 是等价的，收集整个GC堆。但因为 `HotSpot VM`发展了这么多年，外界对各种名词的解读已经完全混乱了，当有人说 Major GC 的时候一定要问清楚他想要指的是上面的 Full GC 还是 Old GC。

:::

<br/>

### 垃圾回收器

> 思考：有哪些垃圾回收器？如何评估垃圾回收器的性能？垃圾回收器如何选择？

按照<mark>内存区间</mark>分类：

![image-20200713093757644](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/fd16701d3e150d5e58d52b7306473a42.png)

- 新生代收集器：`Serial GC`、`Parallel Scavenge GC`、`ParNew GC` 
- 老年代收集器：`Serial Old GC`、`Parallel Old GC`、`CMS GC`
- 整堆收集器：`G1 GC`

<br/>

按照<mark>工作模式</mark>分类：

![image-20200713093551365](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/90c3bcdc22cd0b49e10d702c608c4fc6.png)

- 串行回收器：`Serial GC`、`Serial Old GC`
- 并行回收器：`ParNew GC`、`Parallel Scavenge GC`、`Parallel old GC`
- 并发回收器：`CMS GC`、`G1 GC`

<br/>

#### 评估GC性能指标

> 提问：影响GC性能的主要原因是什么？

- <mark>吞吐量</mark>：运行用户代码的时间占总运行时间的比例（总运行时间 = 程序的运行时间 + 内存回收的时间）
- <mark>垃圾收集开销</mark>：吞吐量的补数，垃圾收集所用时间与总运行时间的比例。
- <mark>暂停时间</mark>：执行垃圾收集时，程序的工作线程被暂停的时间。
- <mark>收集频率</mark>：相对于应用程序的执行，收集操作发生的频率。
- <mark>内存占用</mark>：Java 堆区所占的内存大小。
- <mark>快速</mark>：一个对象从诞生到被回收所经历的时间。

<br/>

**吞吐量**

吞吐量就是 CPU 用于运行用户代码的时间与 CPU 总消耗时间的比值，即吞吐量 = 运行用户代码时间 /（运行用户代码时间+垃圾收集时间）。比如：虚拟机总共运行了 100 分钟，其中垃圾收集花掉 1 分钟，那吞吐量就是 99%。

这种情况下，应用程序能容忍较高的暂停时间，因此，高吞吐量的应用程序有更长的时间基准，快速响应是不必考虑的

吞吐量优先，意味着在单位时间内，STW 的时间最短：0.2 + 0.2 = 0.4

![image-20200713084726176](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/a05d48c1926a03c3acdebf74d10bf522.png)

<br/>

**暂停时间**

”暂停时间”是指一个时间段内应用程序线程暂停，让 GC 线程执行的状态。

例如，GC 期间 100 毫秒的暂停时间意味着在这 100 毫秒期间内没有应用程序线程是活动的。

暂停时间优先，意味着尽可能让单次 STW 的时间最短：0.1 + 0.1 + 0.1 + 0.1 + 0.1 = 0.5

![image-20200713085306400](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/de90092e21cbff31926f7cc7dceebf25.png)

<br/>

**吞吐量 vs 暂停时间**

高吞吐量较好因为这会让应用程序的最终用户感觉只有应用程序线程在做“生产性”工作。直觉上，吞吐量越高程序运行越快。

低暂停时间（低延迟）较好因为从最终用户的角度来看不管是 GC 还是其他原因导致一个应用被挂起始终是不好的。这取决于应用程序的类型，<mark>有时候甚至短暂的 200 毫秒暂停都可能打断终端用户体验</mark>。因此，具有低的较大暂停时间是非常重要的，特别是对于一个<mark>交互式应用程序</mark>。

不幸的是”高吞吐量”和”低暂停时间”是一对相互竞争的目标（矛盾）。

- 因为如果选择以吞吐量优先，那么<mark>必然需要降低内存回收的执行频率</mark>，但是这样会导致 GC 需要更长的暂停时间来执行内存回收。
- 相反的，如果选择以低延迟优先为原则，那么为了降低每次执行内存回收时的暂停时间，也<mark>只能频繁地执行内存回收</mark>，但这又引起了年轻代内存的缩减和导致程序吞吐量的下降。

在设计（或使用）GC 算法时，我们必须确定我们的目标：一个 GC 算法只可能针对两个目标之一（即只专注于较大吞吐量或最小暂停时间），或尝试找到一个二者的折衷。

现在标准：<mark>在最大吞吐量优先的情况下，降低停顿时间</mark>

<br/>

#### 串行垃圾收集器

Serial和Serial Old串行垃圾收集器，是指使用单线程进行垃圾回收，堆内存较小，适合个人电脑，**JDK8 在 Client 模式下默认使用此垃圾回收器**

- Serial 作用于新生代，采用复制算法
- Serial Old 作用于老年代，采用标记-整理算法

垃圾回收时，只有一个线程在工作，并且 Java应用中的所有线程都要暂停（STW），等待垃圾回收的完成。

![image-20240206193524726](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240206193524726.png)

**参数配置**

- `-XX:+UseSerialGC`：Serial 回收器 年轻代使用Serial GC， 老年代使用Serial Old GC。
- `-XX:+UseParNewGC`：ParNew 回收器 年轻代使用ParNew GC，不影响老年代。

<br/>

#### 并行垃圾收集器：吞吐量优先

Parallel Scavenge 和 Parallel Old 是一个并行垃圾回收器，**JDK8 在 Server 模式下默认使用此垃圾回收器**

- Parallel Scavenge 作用于新生代，采用复制算法
- Parallel Old 作用于老年代，采用标记-整理算法

垃圾回收时，多个线程在工作，并且 Java应用中的所有线程都要暂停（STW），等待垃圾回收的完成。

![image-20240206193657067](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240206193657067.png)

**参数配置**

- `-XX:+UseParallelGC`：年轻代使用 Parallel Scavenge GC，互相激活，JDK8 默认参数。
- `-XX:+UseParallelOldGC`：老年代使用 Parallel Old GC，互相激活

<br/>

#### 并发垃圾收集器：响应时间优先

CMS 全称 Concurrent Mark Sweep，是一款并发的，以获取最短回收停顿时间为目标的收集器，<mark>停顿时间短</mark>，用户体验就好。其最大特点是在进行垃圾回收时，应用仍然能正常运行。

- Parallel New 作用于新生代，采用复制算法
- Concurrent Mark Sweep 作用于老年代，采用标记-清除算法

![image-20240206193649421](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240206193649421.png)

**参数配置**

- `-XX:+UseConcMarkSweepGC` ：年轻代使用CMS GC。
  - 开启该参数后会自动将 `-XX:＋UseParNewGC` 打开。即：ParNew（Young区）+ CMS（Old区）+ Serial Old的组合

<br/>

CMS 整个过程分为四个阶段：初始标记阶段（Inital-Mark）、并发标记阶段（Concurrent-Mark）、重新标记阶段（Remark）、并发清除阶段（Concurrent-Sweep）

- 初始标记：在这个阶段中，程序中所有的工作线程都将会因为“Stop-the-World”机制而出现短暂的暂停，这个阶段的主要任务<mark>仅仅只是标记出 GCRoots 能直接关联到的对象</mark>。一旦标记完成之后就会恢复之前被暂停的所有应用线程。由于直接关联对象比较小，所以这里的<mark>速度非常快</mark>。
- 并发标记：从 GC Roots 的<mark>直接关联对象开始遍历整个对象图的过程</mark>，这个过程耗时较长但是<mark>不需要停顿用户线程</mark>，可以与垃圾收集线程一起并发运行。
- 重新标记：由于在并发标记阶段中，程序的工作线程会和垃圾收集线程同时运行或者交叉运行，因此为了<mark>修正并发标记期间，因用户程序继续运作而导致标记产生变动的那一部分对象的标记记录</mark>，这个阶段的停顿时间通常会比初始标记阶段稍长一些，但也远比并发标记阶段的时间短。
- 并发清除：此阶段<mark>清理删除掉标记阶段判断的已经死亡的对象，释放内存空间</mark>。由于不需要移动存活对象，所以这个阶段也是可以与用户线程同时并发的

尽管 CMS 收集器采用的是并发回收（非独占式），但是<mark>在其初始化标记和重新标记这两个阶段中仍然需要执行 STW 机制</mark>暂停程序中的工作线程，不过暂停时间并不会太长，因此可以说明目前所有的垃圾收集器都做不到完全不需要 STW，只是尽可能地缩短暂停时间。

<mark>由于最耗费时间的并发标记与并发清除阶段都不需要暂停工作，所以整体的回收是低停顿的。</mark>

另外，由于在垃圾收集阶段用户线程没有中断，<mark>所以在 CMS 回收过程中，还应该确保应用程序用户线程有足够的内存可用</mark>。因此，CMS 收集器不能像其他收集器那样等到老年代几乎完全被填满了再进行收集，而是<mark>当堆内存使用率达到某一阈值时，便开始进行回收</mark>，以确保应用程序在 CMS 工作过程中依然有足够的空间支持应用程序运行。要是 CMS 运行期间预留的内存无法满足程序需要，就会出现一次 `Concurrent Mode Failure` 失败，这时虚拟机将启动后备预案：临时启用 Serial Old 收集器来重新进行老年代的垃圾收集，这样停顿时间就很长了。

CMS 收集器的垃圾收集算法采用的是标记清除算法，这意味着每次执行完内存回收后，由于被执行内存回收的无用对象所占用的内存空间极有可能是不连续的一些内存块，不可避免地将会<mark>产生一些内存碎片</mark>。那么 CMS 在为新对象分配内存空间时，将无法使用指针碰撞（Bump the Pointer）技术，而只能够选择空闲列表（Free List）执行内存分配。

![image-20240207000501328](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240207000501328.png)

**CMS 优点**

- 并发收集，低延迟，响应时间快，用户感受不到服务停顿。

CMS 缺点

- <mark>会产生内存碎片</mark>，导致并发清除后，用户线程可用的空间不足。在无法分配大对象的情况下，不得不提前触发 FullGC。
- <mark>CMS 收集器对 CPU 资源非常敏感</mark>。在并发阶段，它虽然不会导致用户停顿，但是会因为占用了一部分线程而导致应用程序变慢，总吞吐量会降低。
- <mark>CMS 收集器无法处理浮动垃圾</mark>。可能出现 `Concurrent Mode Failure`失败而导致另一次 Full GC 的产生。在并发标记阶段由于程序的工作线程和垃圾收集线程是同时运行或者交叉运行的，那么<mark>在并发标记阶段如果产生新的垃圾对象，CMS 将无法对这些垃圾对象进行标记，最终会导致这些新产生的垃圾对象没有被及时回收</mark>，从而只能在下一次执行 GC 时释放这些之前未被回收的内存空间。

<br/>

**总结**

HotSpot 有这么多的垃圾回收器，那么如果有人问，Serial GC、Parallel GC、CMS 这三个 GC 有什么不同呢？

请记住以下口令：

- 如果你想要最小化地使用内存和并行开销，请选 Serial GC；
- 如果你想要最大化应用程序的吞吐量，请选 Parallel GC；
- 如果你想要最小化 GC 的中断或停顿时间，请选 CMS GC。

<br/>

> 思考：为什么需要 Serial Old GC 作为 CMS GC 的备用



#### 并发垃圾收集器：G1垃圾优先

> 思考：既然我们已经有了前面几个强大的 GC，为什么还要发布区域化分区代 Garbage First（G1）？
>

原因就在于应用程序所应对的<mark>业务越来越庞大、复杂，用户越来越多</mark>，没有 GC 就不能保证应用程序正常进行，而经常造成 STW 的 GC 又跟不上实际的需求，所以才会不断地尝试对 GC 进行优化。G1 垃圾回收器为了适应现在<mark>不断扩大的内存和不断增加的处理器数量</mark>，进一步降低暂停时间（pause time），同时兼顾良好的吞吐量。

官方给 G1 设定的目标是在延迟可控的情况下获得尽可能高的吞吐量，所以才担当起“全功能收集器”的重任与期望。

![image-20240207001644425](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240207001644425.png)

- 应用于新生代和老年代，**在JDK9之后默认使用G1**

- 划分成多个区域，每个区域都可以充当 eden，survivor，old， humongous，其中 humongous 专为大对象准备

- 采用复制算法

- 响应时间与吞吐量兼顾

- 分成三个阶段：新生代回收、并发标记、混合收集

- 如果并发失败（即回收速度赶不上创建新对象速度），会触发 Full GC



<br/>

Young Collection(年轻代垃圾回收)

- 初始时，所有区域都处于空闲状态

  ![image-20230506154542687](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506154542687.png)

- 创建了一些对象，挑出一些空闲区域作为伊甸园区存储这些对象

  ![image-20230506154607558](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506154607558.png)

- 当伊甸园需要垃圾回收时，挑出一个空闲区域作为幸存区，用复制算法复制存活对象，需要暂停用户线程

  ![image-20230506154633118](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506154633118.png)

  ![image-20230506154705088](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506154705088.png)

- 随着时间流逝，伊甸园的内存又有不足

- 将伊甸园以及之前幸存区中的存活对象，采用复制算法，复制到新的幸存区，其中较老对象晋升至老年代

  ![image-20230506154759809](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506154759809.png)

  ![image-20230506154826981](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506154826981.png)

  ![image-20230506154859985](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506154859985.png)

<br/>

Young Collection + Concurrent Mark (年轻代垃圾回收+并发标记)

当老年代占用内存超过阈值(默认是45%)后，触发并发标记，这时无需暂停用户线程

![image-20230506155000503](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506155000503.png)

- 并发标记之后，会有重新标记阶段解决漏标问题，此时需要暂停用户线程。

- 这些都完成后就知道了老年代有哪些存活对象，随后进入混合收集阶段。此时不会对所有老年代区域进行回收，而是根据暂停时间目标优先回收价值高（存活对象少）的区域（这也是 Gabage First 名称的由来）。

  ![image-20230506155047765](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506155047765.png)

<br/>

Mixed Collection (混合垃圾回收)

复制完成，内存得到释放。进入下一轮的新生代回收、并发标记、混合收集

![image-20230506155116267](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506155116267.png)

其中H叫做巨型对象，如果对象非常大，会开辟一块连续的空间存储巨型对象

![image-20230506155146370](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506155146370.png)

<br/>

:::warning 💡思考：详细聊一下G1垃圾回收器

:::

## JVM实践

### JVM 调优的参数可以在哪里设置参数值？

#### tomcat的设置vm参数

修改TOMCAT_HOME/bin/catalina.sh文件，如下图

`JAVA_OPTS="-Xms512m -Xmx1024m" `

![image-20220904151948778](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904151948778.png)

#### springboot项目jar文件启动

通常在linux系统下直接加参数启动springboot项目

```sh
nohup java -Xms512m -Xmx1024m -jar xxxx.jar --spring.profiles.active=prod &
```

>nohup  :  用于在系统后台不挂断地运行命令，退出终端不会影响程序的运行
>
>参数 **&**  ：让命令在后台执行，终端退出后命令仍旧执行。



### 用的 JVM 调优的参数都有哪些？

>难易程度：☆☆☆
>
>出现频率：☆☆☆☆

​	对于JVM调优，主要就是调整年轻代、年老大、元空间的内存空间大小及使用的垃圾回收器类型。

https://www.oracle.com/java/technologies/javase/vmoptions-jsp.html

1）设置堆的初始大小和最大大小，为了防止垃圾收集器在初始大小、最大大小之间收缩堆而产生额外的时间，通常把最大、初始大小设置为相同的值。

```
-Xms：设置堆的初始化大小

-Xmx：设置堆的最大大小
```

2） 设置年轻代中Eden区和两个Survivor区的大小比例。该值如果不设置，则默认比例为8:1:1。Java官方通过增大Eden区的大小，来减少YGC发生的次数，但有时我们发现，虽然次数减少了，但Eden区满

的时候，由于占用的空间较大，导致释放缓慢，此时STW的时间较长，因此需要按照程序情况去调优。

```
-XXSurvivorRatio=3，表示年轻代中的分配比率：survivor:eden = 2:3
```

3）年轻代和老年代默认比例为1：2。可以通过调整二者空间大小比率来设置两者的大小。

```
-XX:newSize   设置年轻代的初始大小
-XX:MaxNewSize   设置年轻代的最大大小，  初始大小和最大大小两个值通常相同
```

4）线程堆栈的设置：**每个线程默认会开启1M的堆栈**，用于存放栈帧、调用参数、局部变量等，但一般256K就够用。通常减少每个线程的堆栈，可以产生更多的线程，但这实际上还受限于操作系统。

```
-Xss   对每个线程stack大小的调整,-Xss128k
```

5）一般来说，当survivor区不够大或者占用量达到50%，就会把一些对象放到老年区。通过设置合理的eden区，survivor区及使用率，可以将年轻对象保存在年轻代，从而避免full GC，使用-Xmn设置年轻代的大小

6）系统CPU持续飙高的话，首先先排查代码问题，如果代码没问题，则咨询运维或者云服务器供应商，通常服务器重启或者服务器迁移即可解决。

7）对于占用内存比较多的大对象，一般会选择在老年代分配内存。如果在年轻代给大对象分配内存，年轻代内存不够了，就要在eden区移动大量对象到老年代，然后这些移动的对象可能很快消亡，因此导致full GC。通过设置参数：-XX:PetenureSizeThreshold=1000000，单位为B，标明对象大小超过1M时，在老年代(tenured)分配内存空间。

8）一般情况下，年轻对象放在eden区，当第一次GC后，如果对象还存活，放到survivor区，此后，每GC一次，年龄增加1，当对象的年龄达到阈值，就被放到tenured老年区。这个阈值可以同构-XX:MaxTenuringThreshold设置。如果想让对象留在年轻代，可以设置比较大的阈值。

```
（1）-XX:+UseParallelGC:年轻代使用并行垃圾回收收集器。这是一个关注吞吐量的收集器，可以尽可能的减少垃圾回收时间。

（2）-XX:+UseParallelOldGC:设置老年代使用并行垃圾回收收集器。
```

9）尝试使用大的内存分页：使用大的内存分页增加CPU的内存寻址能力，从而系统的性能。

```
-XX:+LargePageSizeInBytes 设置内存页的大小
```

10）使用非占用的垃圾收集器。

```
-XX:+UseConcMarkSweepGC老年代使用CMS收集器降低停顿。
```

### 说一下 JVM 调优的工具？

>难易程度：☆☆☆☆
>
>出现频率：☆☆☆☆

#### 4.3.1 命令工具

##### 4.3.1.1 jps（Java Process Status）

输出JVM中运行的进程状态信息(现在一般使用jconsole)

![image-20220904104739581](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904104739581.png)

##### 4.3.1.2 jstack

查看java进程内**线程的堆栈**信息。

```sh
jstack [option] <pid>  
```

java案例

```java
package com.heima.jvm;

public class Application {

    public static void main(String[] args) throws InterruptedException {
        while (true){
            Thread.sleep(1000);
            System.out.println("哈哈哈");
        }
    }
}

```

使用jstack查看进行堆栈运行信息

![image-20220904111059602](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904111059602.png)

##### 4.3.1.3 jmap

用于生成堆转存快照

> jmap [options] pid  内存映像信息
>
> jmap -heap pid   显示Java堆的信息
>
> jmap -dump:format=b,file=heap.hprof pid
>
> ​		format=b表示以hprof二进制格式转储Java堆的内存
> ​		file=`<filename>`用于指定快照dump文件的文件名。

例：显示了某一个java运行的堆信息

```java
C:\Users\yuhon>jmap -heap 53280
Attaching to process ID 53280, please wait...
Debugger attached successfully.
Server compiler detected.
JVM version is 25.321-b07

using thread-local object allocation.
Parallel GC with 8 thread(s)   //并行的垃圾回收器

Heap Configuration:  //堆配置
   MinHeapFreeRatio         = 0   //空闲堆空间的最小百分比
   MaxHeapFreeRatio         = 100  //空闲堆空间的最大百分比
   MaxHeapSize              = 8524922880 (8130.0MB) //堆空间允许的最大值
   NewSize                  = 178257920 (170.0MB) //新生代堆空间的默认值
   MaxNewSize               = 2841640960 (2710.0MB) //新生代堆空间允许的最大值
   OldSize                  = 356515840 (340.0MB) //老年代堆空间的默认值
   NewRatio                 = 2 //新生代与老年代的堆空间比值，表示新生代：老年代=1：2
   SurvivorRatio            = 8 //两个Survivor区和Eden区的堆空间比值为8,表示S0:S1:Eden=1:1:8
   MetaspaceSize            = 21807104 (20.796875MB) //元空间的默认值
   CompressedClassSpaceSize = 1073741824 (1024.0MB) //压缩类使用空间大小
   MaxMetaspaceSize         = 17592186044415 MB //元空间允许的最大值
   G1HeapRegionSize         = 0 (0.0MB)//在使用 G1 垃圾回收算法时，JVM 会将 Heap 空间分隔为若干个 Region，该参数用来指定每个 Region 空间的大小。

Heap Usage:
PS Young Generation
Eden Space: //Eden使用情况
   capacity = 134217728 (128.0MB)
   used     = 10737496 (10.240074157714844MB)
   free     = 123480232 (117.75992584228516MB)
   8.000057935714722% used
From Space: //Survivor-From 使用情况
   capacity = 22020096 (21.0MB)
   used     = 0 (0.0MB)
   free     = 22020096 (21.0MB)
   0.0% used
To Space: //Survivor-To 使用情况
   capacity = 22020096 (21.0MB)
   used     = 0 (0.0MB)
   free     = 22020096 (21.0MB)
   0.0% used
PS Old Generation  //老年代 使用情况
   capacity = 356515840 (340.0MB)
   used     = 0 (0.0MB)
   free     = 356515840 (340.0MB)
   0.0% used

3185 interned Strings occupying 261264 bytes.
```



##### 4.3.1.4 jhat

用于分析jmap生成的堆转存快照（一般不推荐使用，而是使用Ecplise Memory Analyzer）

##### 4.3.1.5 jstat

是JVM统计监测工具。可以用来显示垃圾回收信息、类加载信息、新生代统计信息等。

**常见参数**：

①总结垃圾回收统计

```sh
jstat -gcutil pid
```

![image-20220904114511854](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904114511854.png)

| 字段   | 含义                   |
| ------ | ---------------------- |
| `S0`   | 幸存1区当前使用比例    |
| `S1`   | 幸存2区当前使用比例    |
| `E`    | 伊甸园区使用比例       |
| `O`    | 老年代使用比例         |
| `M`    | 元数据区使用比例       |
| `CCS`  | 压缩使用比例           |
| `YGC`  | 年轻代垃圾回收次数     |
| `YGCT` | 年轻代垃圾回收消耗时间 |
| `FGC`  | 老年代垃圾回收次数     |
| `FGCT` | 老年代垃圾回收消耗时间 |
| `GCT`  | 垃圾回收消耗总时间     |

②垃圾回收统计

```sh
jstat -gc pid
```

![image-20220904115157363](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904115157363.png)

#### 4.3.2 可视化工具

##### 4.3.2.1 jconsole

用于对jvm的内存，线程，类 的监控，是一个基于 jmx 的 GUI 性能监控工具

打开方式：java 安装目录 bin目录下 直接启动 jconsole.exe 就行

![image-20220904115936095](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904115936095.png)

可以内存、线程、类等信息

![image-20220904120057211](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904120057211.png)



##### 4.3.2.2 VisualVM：故障处理工具

能够监控线程，内存情况，查看方法的CPU时间和内存中的对 象，已被GC的对象，反向查看分配的堆栈

打开方式：java 安装目录 bin目录下 直接启动 jvisualvm.exe就行

![image-20220904120356174](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904120356174.png)

监控程序运行情况

![image-20220904132011289](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904132011289.png)

查看运行中的dump

![image-20220904132134095](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904132134095.png)

查看堆中的信息

![image-20220904132346495](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904132346495.png)

总结

![image-20240101131051073](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240101131051073.png)



### Java 内存泄露的排查思路？

>难易程度：☆☆☆☆
>
>出现频率：☆☆☆☆

原因：

如果线程请求分配的栈容量超过java虚拟机栈允许的最大容量的时候，java虚拟机将抛出一个StackOverFlowError异常

如果java虚拟机栈可以动态拓展，并且扩展的动作已经尝试过，但是目前无法申请到足够的内存去完成拓展，或者在建立新线程的时候没有足够的内存去创建对应的虚拟机栈，那java虚拟机将会抛出一个OutOfMemoryError异常

如果一次加载的类太多，元空间内存不足，则会报OutOfMemoryError: Metaspace

![image-20230506155704119](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20230506155704119.png)



1、通过jmap指定打印他的内存快照 dump

>有的情况是内存溢出之后程序则会直接中断，而jmap只能打印在运行中的程序，所以建议通过参数的方式的生成dump文件，配置如下：
>
>-XX:+HeapDumpOnOutOfMemoryError
>-XX:HeapDumpPath=/home/app/dumps/      指定生成后文件的保存目录

2、通过工具， VisualVM（Ecplise MAT）去分析 dump文件

VisualVM可以加载离线的dump文件，如下图

文件-->装入--->选择dump文件即可查看堆快照信息

>如果是linux系统中的程序，则需要把dump文件下载到本地（windows环境）下，打开VisualVM工具分析。VisualVM目前只支持在windows环境下运行可视化

![image-20220904132925812](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904132925812.png)

3、通过查看堆信息的情况，可以大概定位内存溢出是哪行代码出了问题

![image-20220904133722905](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904133722905.png)

4、找到对应的代码，通过阅读上下文的情况，进行修复即可



### CPU飙高排查方案与思路？

>难易程度：☆☆☆☆
>
>出现频率：☆☆☆☆

1.使用top命令查看占用cpu的情况

![image-20220904161818255](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904161818255.png)

2.通过top命令查看后，可以查看是哪一个进程占用cpu较高，上图所示的进程为：30978

3.查看当前线程中的进程信息

```sh
ps H -eo pid,tid,%cpu | grep 40940
```

>pid  进行id
>
>tid   进程中的线程id
>
>%  cpu使用率

![image-20220904162117022](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904162117022.png)

4.通过上图分析，在进程30978中的线程30979占用cpu较高

>注意：上述的线程id是一个十进制，我们需要把这个线程id转换为16进制才行，因为通常在日志中展示的都是16进制的线程id名称
>
>转换方式：
>
>在linux中执行命令
>
>`printf "%x\n" 30979`
>
>![image-20220904162654928](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904162654928.png)

5.可以根据线程 id 找到有问题的线程，进一步定位到问题代码的源码行号

执行命令

```sh
jstack 30978   此处是进程id
```

![image-20220904162941977](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20220904162941977.png)



> **面试官**：JVM 调优的参数可以在哪里设置参数值？
>
> **候选人:**
>
> 我们当时的项目是springboot项目，可以在项目启动的时候，java -jar中加入参数就行了
>
>
>
> **面试官**：用的 JVM 调优的参数都有哪些？
>
> **候选人:**
>
> 嗯，这些参数是比较多的
>
> 我记得当时我们设置过堆的大小，像-Xms和-Xmx
>
> 还有就是可以设置年轻代中Eden区和两个Survivor区的大小比例
>
> 还有就是可以设置使用哪种垃圾回收器等等。具体的指令还真记不太清楚。
>
>
>
> **面试官**：嗯，好的，你们平时调试 JVM都用了哪些工具呢？
>
> **候选人:**
>
> 嗯，我们一般都是使用jdk自带的一些工具，比如
>
> jps 输出JVM中运行的进程状态信息
>
> jstack查看java进程内**线程的堆栈**信息。
>
> jmap 用于生成堆转存快照
>
> jstat用于JVM统计监测工具
>
> 还有一些可视化工具，像jconsole和VisualVM等
>
> **面试官**：假如项目中产生了java内存泄露，你说一下你的排查思路？
>
> **候选人:**
>
> 嗯，这个我在之前项目排查过
>
> 第一呢可以通过jmap指定打印他的内存快照 dump文件，不过有的情况打印不了，我们会设置vm参数让程序自动生成dump文件
>
> 第二，可以通过工具去分析 dump文件，jdk自带的VisualVM就可以分析
>
> 第三，通过查看堆信息的情况，可以大概定位内存溢出是哪行代码出了问题
>
> 第四，找到对应的代码，通过阅读上下文的情况，进行修复即可
>
> **面试官**：好的，那现在再来说一种情况，就是说服务器CPU持续飙高，你的排查方案与思路？
>
> **候选人:**
>
> 嗯，我思考一下~~
>
> 可以这么做~~
>
> 第一可以使用使用top命令查看占用cpu的情况
>
> 第二通过top命令查看后，可以查看是哪一个进程占用cpu较高，记录这个进程id
>
> 第三可以通过ps 查看当前进程中的线程信息，看看哪个线程的cpu占用较高
>
> 第四可以jstack命令打印进行的id，找到这个线程，就可以进一步定位问题代码的行号

