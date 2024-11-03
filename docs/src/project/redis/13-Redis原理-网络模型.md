[[toc]]

<br/>

Linux 系统中一个进程使用内存情况分为两个部分：用户空间和内核空间

- 用户空间只能执行受限的命令（Ring3），并且不能直接调用系统资源，必须通过内核提供的接口访问
- 内核空间可以执行特权命令（Ring0），调用一切系统资源

<br/>

Linux 系统为了提高 IO 效率，在用户空间和内核空间都加入缓冲区

- 写数据时，要把用户缓冲数据拷贝到内核缓冲区，然后写入设备
- 读数据时，要从设备读取数据到内核缓冲区，然后拷贝到用户缓冲区

<br/>

5种IO模型

- 阻塞 IO：用户进程在等待数据和拷贝数据都是处于阻塞状态。
- 非阻塞 IO：用户进行在等待数据是非阻塞，在拷贝数据处于阻塞状态。虽然等待数据是非阻塞但并没有提升性能，反而会因为忙等机制导致 CPU 空转而导致 CPU 使用率爆增。
- IO 多路复用：利用单个线程同时监听多个 FD，并在某个 FD 可读、可写时得到通知，从而避免无效等待，充分利用 CPU 资源。
  - 其中 select 和 poll 将监听的 FD 数据准备好后全部发送，需要通过遍历的方式寻找准备好的数据。 epoll 则直接将准备好的数据发送，省去了遍历的动作。
- 信号驱动 IO：在等待数据阶段不阻塞，当内核数据准备好后会回调用户进程 SIGIO 函数，在拷贝数据处于阻塞状态。但当有大量 IO 操作时，信号较多，SIGIO 处理函数不能及时处理可能导致信号队列溢出，而且内核空间与用户空间的频繁信号交互性能也较低。
- 异步 IO：在等待数据和拷贝数据都不会阻塞，性能极高，不会有任务阻塞。但实现复杂，当并发访问太多会导致服务崩溃，需要限流。

<br/>

网络模型

- 为什么Redis要选择单线程？
  - Redis 是纯内存操作，执行速度非常快，性能评价是网络延迟而不是执行速度，多线程并不会带来巨大的性能提升。
  - 多线程会导致过多的上下文切换，带来不必要的开销
  - 多线程会面临安全问题，需要引入线程锁这样的安全手段。实现复杂度增高，性能也会大打折扣。
- 解释一下 IO 多路复用模型





## Redis网络模型

### 用户态和内核态

服务器大多都采用 Linux 系统，这里我们以 Linux 为例来讲解:

Ubuntu 和 Centos 都是 Linux 的发行版，发行版可以看成对 Linux 包了一层壳，任何 Linux 发行版，其系统内核都是 Linux。我们的应用都需要通过 Linux 内核与硬件交互。

![1653844970346](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/1653844970346.png)

<br/>

用户的应用，比如 Redis，MySQL 等其实是没有办法去执行访问我们操作系统的硬件的，所以我们可以通过发行版的这个壳子去访问内核，再通过内核去访问计算机硬件

计算机硬件包括，如CPU，内存，网卡等等，内核（通过寻址空间）可以操作硬件的，但是内核需要不同设备的驱动，有了这些驱动之后，内核就可以去对计算机硬件去进行内存管理，文件系统的管理，进程的管理等等

![1653896065386](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/1653896065386.png)



<br/>

我们想要用户的应用来访问，计算机就必须要通过对外暴露的一些接口，才能访问到，从而简单的实现对内核的操控，但是内核本身上来说也是一个应用，所以他本身也需要一些内存，CPU 等设备资源，用户应用本身也在消耗这些资源，如果不加任何限制，用户去操作随意的去操作我们的资源，就有可能导致一些冲突，甚至有可能导致我们的系统出现无法运行的问题，因此我们需要把用户和**内核隔离开**

<br/>

进程的寻址空间划分成两部分：**内核空间、用户空间**

什么是寻址空间呢？我们的应用程序也好，还是内核空间也好，都是没有办法直接去物理内存的，而是通过分配一些虚拟内存映射到物理内存中，我们的内核和应用程序去访问虚拟内存的时候，就需要一个虚拟地址，这个地址是一个无符号的整数，比如一个 32 位的操作系统，他的带宽就是 32，他的虚拟地址就是 2^32^次方，也就是说他寻址的范围就是 0 ~ 2^32^， 这片寻址空间对应的就是2^32^个字节，就是 4GB，并且会有 3GB 分给用户空间，会有 1GB 给内核系统

<img src="https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315163859688.png" alt="image-20240315163859688" style="zoom:50%;" />

在 Linux 中，他们权限分成两个等级，0 和 3，用户空间只能执行受限的命令（Ring3），而且不能直接调用系统资源，必须通过内核提供的接口来访问内核空间可以执行特权命令（Ring0），调用一切系统资源，所以一般情况下，用户的操作是运行在用户空间，而内核运行的数据是在内核空间的，而有的情况下，一个应用程序需要去调用一些特权资源，去调用一些内核空间的操作，所以此时他俩需要在用户态和内核态之间进行切换。

<br/>

比如：Linux系统为了提高 IO 效率，会在用户空间和内核空间都加入缓冲区：

- 写数据时，要把用户缓冲数据拷贝到内核缓冲区，然后写入设备

- 读数据时，要从设备读取数据到内核缓冲区，然后拷贝到用户缓冲区


针对这个操作：我们的用户在写读数据时，会去向内核态申请，想要读取内核的数据，而内核数据要去等待驱动程序从硬件上读取数据，当从磁盘上加载到数据之后，内核会将数据写入到内核的缓冲区中，然后再将数据拷贝到用户态的 buffer 中，然后再返回给应用程序，整体而言，速度慢，就是这个原因，为了加速，我们希望 read 也好，还是 wait for data 也最好都不要等待，或者时间尽量的短。

 <img src="https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315163919176.png" alt="image-20240315163919176" style="zoom:50%;" />



<br/>

### 5种IO模型

在《UNIX网络编程》一书中，总结归纳了5种IO模型：

* 阻塞IO（Blocking IO）
* 非阻塞IO（Nonblocking IO）
* IO多路复用（IO Multiplexing）
* 信号驱动IO（Signal Driven IO）
* 异步IO（Asynchronous IO）

应用程序想要去读取数据，他是无法直接去读取磁盘数据的，他需要先到内核里边去等待内核操作硬件拿到数据，这个过程就是1，是需要等待的，等到内核从磁盘上把数据加载出来之后，再把这个数据写给用户的缓存区，这个过程是2，如果是阻塞IO，那么整个过程中，用户从发起读请求开始，一直到读取到数据，都是一个阻塞状态。

<br/>

具体流程如下图：

<img src="https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315164029754.png" alt="image-20240315164029754" style="zoom:67%;" />



用户去读取数据时，会去先发起 recvform 一个命令，去尝试从内核上加载数据，如果内核没有数据，那么用户就会等待，此时内核会去从硬件上读取数据，内核读取数据之后，会把数据拷贝到用户态，并且返回ok，整个过程，都是阻塞等待的，这就是阻塞 IO

<br/>

#### 阻塞IO

顾名思义，阻塞 IO 就是两个阶段都必须阻塞等待：

阶段一：

- 用户进程尝试读取数据（比如网卡数据）
- 此时数据尚未到达，内核需要等待数据
- 此时用户进程也处于阻塞状态

阶段二：

* 数据到达并拷贝到内核缓冲区，代表已就绪
* 将内核数据拷贝到用户缓冲区
* 拷贝过程中，用户进程依然阻塞等待
* 拷贝完成，用户进程解除阻塞，处理数据

![image-20240315164123397](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315164123397.png)

可以看到，阻塞 IO 模型中，用户进程在两个阶段都是阻塞状态。

<br/>

#### 非阻塞IO

顾名思义，非阻塞IO的 recvfrom 操作会立即返回结果而不是阻塞用户进程。

阶段一：

* 用户进程尝试读取数据（比如网卡数据）
* 此时数据尚未到达，内核需要等待数据
* 返回异常给用户进程
* 用户进程拿到 error 后，再次尝试读取
* 循环往复，直到数据就绪

阶段二：

* 将内核数据拷贝到用户缓冲区
* 拷贝过程中，用户进程依然阻塞等待
* 拷贝完成，用户进程解除阻塞，处理数据

![image-20240315164150966](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315164150966.png)

可以看到，非阻塞IO模型中，用户进程在第一个阶段是非阻塞，第二个阶段是阻塞状态。虽然是非阻塞，但性能并没有得到提高。而且忙等机制会导致CPU空转，CPU使用率暴增。

<br/>

#### IO多路复用

无论是阻塞IO还是非阻塞IO，用户应用在一阶段都需要调用 recvfrom 来获取数据，差别在于无数据时的处理方案：

- 如果调用 recvfrom 时，恰好没有数据，阻塞 IO 会使 CPU 阻塞，非阻塞 IO 使 CPU 空转，都不能充分发挥CPU的作用。
- 如果调用 recvfrom 时，恰好有数据，则用户进程可以直接进入第二阶段，读取并处理数据

所以怎么看起来以上两种方式性能都不好。而在单线程情况下，只能依次处理 IO 事件，如果正在处理的 IO 事件恰好未就绪（数据不可读或不可写），线程就会被阻塞，所有 IO 事件都必须等待，性能自然会很差。

<br/>

就比如服务员给顾客点餐，**分两步**：

* 顾客思考要吃什么（等待数据就绪）
* 顾客想好了，开始点餐（读取数据）

要提高效率有几种办法？

- 方案一：增加更多服务员（多线程）
- 方案二：不排队，谁想好了吃什么（数据就绪了），服务员就给谁点餐（用户应用就去读取数据）

<br/>

那么问题来了：用户进程如何知道内核中数据是否就绪呢？

**文件描述符**（File Descriptor）：简称 FD，是一个从 0 开始的无符号整数，用来关联 Linux 中的一个文件。在Linux中，一切皆文件，例如常规文件、视频、硬件设备等，当然也包括网络套接字（Socket）。

通过 FD，我们的网络模型可以利用一个线程监听多个 FD，并在某个 FD 可读、可写时得到通知，从而避免无效的等待，充分利用 CPU 资源。

<br/>

阶段一：

* 用户进程调用 select，指定要监听的 FD 集合
* 核监听 FD 对应的多个 socket
* 任意一个或多个 socket 数据就绪则返回 readable
* 此过程中用户进程阻塞

阶段二：

* 用户进程找到就绪的socket
* 依次调用recvfrom读取数据
* 内核将数据拷贝到用户空间
* 用户进程处理数据

![image-20240315164226238](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315164226238.png)

当用户去读取数据的时候，不再去直接调用 recvfrom 了，而是调用 select 的函数，select 函数会将需要监听的数据交给内核，由内核去检查这些数据是否就绪了，如果说这个数据就绪了，就会通知应用程序数据就绪，然后来读取数据，再从内核中把数据拷贝给用户态，完成数据处理，如果 N 多个 FD 一个都没处理完，此时就进行等待。

用 IO 复用模式，可以确保去读数据的时候，数据是一定存在的，他的效率比原来的阻塞 IO 和非阻塞 IO 性能都要高

<br/>

IO 多路复用是利用单个线程来同时监听多个 FD，并在某个 FD 可读、可写时得到通知，从而避免无效的等待，充分利用 CPU 资源。不过监听 FD 的方式、通知的方式又有多种实现，常见的有：

- select
- poll
- epoll

差异

- 其中 select 和 poll 相当于是当被监听的数据准备好之后，他会把你监听的 FD 整个数据都发给你，你需要到整个 FD 中去找，哪些是处理好了的，需要通过遍历的方式，所以性能也并不是那么好

- 而 epoll，则相当于内核准备好了之后，他会把准备好的数据，直接发给你，咱们就省去了遍历的动作。


<br/>

##### select

select 是 Linux 最早是由的 I/O 多路复用技术：

简单说，就是我们把需要处理的数据封装成 FD，然后在用户态时创建一个 FD 的集合（这个集合的大小是要监听的那个FD的最大值+1，但是大小整体是有限制的 ），这个集合的长度大小是有限制的，同时在这个集合中，标明出来我们要控制哪些数据，

比如要监听的数据，是1,2,5 三个数据，此时会执行 Select 函数，然后将整个 FD 发给内核态，内核态会去遍历用户态传递过来的数据，如果发现这里边都数据都没有就绪，就休眠，直到有数据准备好时，就会被唤醒，唤醒之后，再次遍历一遍，看看谁准备好了，然后再将处理掉没有准备好的数据，最后再将这个FD集合写回到用户态中去，此时用户态就知道了，奥，有人准备好了，但是对于用户态而言，并不知道谁处理好了，所以用户态也需要去进行遍历，然后找到对应准备好数据的节点，再去发起读请求，我们会发现，这种模式下他虽然比阻塞IO和非阻塞IO好，但是依然有些麻烦的事情， 比如说频繁的传递 FD 集合，频繁的去遍历 FD 等问题

![image-20240315164247961](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315164247961.png)

:::danger 🚨  select 模式存在的问题

- 需要将整个 fd_set 从用户空间拷贝到内核空间，
- select 结束还要再次拷贝回用户空间 select 无法得知具体是哪个 FD 就绪，需要遍历整个  fd_set
- fd_set 监听的 FD 数量不能超过 1024

:::

<br/>

##### poll

poll 模式对 select 模式做了简单改进，但性能提升不明显，部分关键代码如下：

<img src="https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315164503184.png" alt="image-20240315164503184" style="zoom:50%;" />

IO流程：

* 创建 pollfd 数组，向其中添加关注的 fd 信息，数组大小自定义
* 调用 poll 函数，将 pollfd 数组拷贝到内核空间，转链表存储，无上限
* 内核遍历 fd，判断是否就绪
* 数据就绪或超时后，拷贝 pollfd 数组到用户空间，返回就绪 fd 数量 n
* 用户进程判断 n 是否大于 0，大于 0 则遍历 pollfd 数组，找到就绪的 fd

<br/>

**与select对比：**

* select 模式中的 fd_set 大小固定为 1024，而 pollfd 在内核中采用链表，理论上无上限
* 监听 FD 越多，每次遍历消耗时间也越久，性能反而会下降

<br/>

##### epoll

![image-20240315164544063](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315164544063.png)

epoll 模式是对 select 和 poll 的改进，它提供了三个函数

<br/>

eventpoll 的函数，他内部包含两个东西

- 红黑树-> 记录的事要监听的FD

- 一个是链表->一个链表，记录的是就绪的FD


<br/>

紧接着调用 epoll_ctl 操作，将要监听的数据添加到红黑树上去，并且给每个 fd 设置一个监听函数，这个函数会在 fd 数据就绪时触发，就是准备好了，现在就把 fd 把数据添加到 list_head 中去

<br/>

调用 epoll_wait 函数就去等待，在用户态创建一个空的 events 数组，当就绪之后，我们的回调函数会把数据添加到 list_head 中去，当调用这个函数的时候，会去检查 list_head，当然这个过程需要参考配置的等待时间，可以等一定时间，也可以一直等， 如果在此过程中，检查到了list_head中有数据会将数据添加到链表中，此时将数据放入到events数组中，并且返回对应的操作的数量，用户态的此时收到响应后，从events中拿到对应准备好的数据的节点，再去调用方法去拿数据。

<br>

总结

select 模式存在的三个问题：

* 能监听的FD最大不超过1024
* 每次select都需要把所有要监听的FD都拷贝到内核空间
* 每次都要遍历所有FD来判断就绪状态

poll 模式的问题：

* poll利用链表解决了select中监听FD上限的问题，但依然要遍历所有FD，如果监听较多，性能会下降

epoll 模式中如何解决这些问题的？

* 基于 epoll 实例中的红黑树保存要监听的 FD，理论上无上限，而且增删改查效率都非常高
* 每个 FD 只需要执行一次 epoll_ctl 添加到红黑树，以后每次 epol_wait 无需传递任何参数，无需重复拷贝 FD 到内核空间
* 利用 ep_poll_callback 机制来监听 FD 状态，无需遍历所有 FD，因此性能不会随监听的 FD 数量增多而下降

<br/>

##### 事件通知机制

当FD有数据可读时，我们调用epoll_wait（或者select、poll）可以得到通知。但是事件通知的模式有两种：

* LevelTriggered：简称LT，当FD有数据可读时，会重复通知多次，直至数据处理完成。是 Epoll 的默认模式。
* EdgeTriggered：简称ET，当FD有数据可读时，只会被通知一次，不管数据是否处理完成。

<br/>

举个栗子：

1. 假设一个客户端 socket 对应的 FD 已经注册到了 epoll 实例中
2. 客户端 socket 发送了 2kb 的数据
3. 服务端调用 epoll_wait，得到通知说FD就绪
4. 服务端从FD读取了1kb
5. 数据回到步骤3（再次调用 epoll_wait，形成循环）

<br/>

总结：

- 如果我们采用LT模式，因为FD中仍有1kb数据，则第⑤步依然会返回结果，并且得到通知

- 如果我们采用ET模式，因为第③步已经消费了FD可读事件，第⑤步FD状态没有变化，因此epoll_wait不会返回，数据无法读取，客户端响应超时。

<br/>

结论：

- LT：事件通知频率较高，会有重复通知，影响性能
- ET：仅通知一次，效率高。可以基于非阻塞IO循环读取解决数据读取不完整问题。

<br/>

注意：

- select 和 poll 仅支持 LT 模式，epoll 可以自由选择 LT 和 ET 两种模式。

<br/>

##### Web服务流程

基于 Epoll 模式的 Web 服务基本流程如图：

![image-20240315164851183](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315164851183.png)

服务器启动以后，服务端会去调用 epoll_create，创建一个在内核中的 epoll 实例，epoll 实例中包含两个数据

- 红黑树（为空）：rb_root 用来去记录需要被监听的FD
- 链表（为空）：list_head用来存放已经就绪的FD

创建好了之后，会去调用 epoll_ctl 函数，此函数会将需要监听的数据添加到 rb_root 中去，并且对当前这些存在于红黑树的节点设置回调函数，当这些被监听的数据一旦准备完成，就会被调用，而调用的结果就是将红黑树的 fd 添加到 list_head 中去(但是此时并没有完成)

当第二步完成后，就会调用 epoll_wait 函数，这个函数会去校验是否有数据准备完毕（因为数据一旦准备就绪，就会被回调函数添加到 list_head 中），在等待了一段时间后(可以进行配置)，如果等够了超时时间，则返回没有数据；如果有，则进一步判断当前是什么事件，如果是建立连接时间，则调用 accept() 接受客户端 socket，拿到建立连接的 socket ，然后建立起来连接，如果是其他事件，则把数据进行写出

<br/>

#### 信号驱动IO

信号驱动IO是与内核建立SIGIO的信号关联并设置回调，当内核有FD就绪时，会发出SIGIO信号通知用户，期间用户应用可以执行其它业务，无需阻塞等待。

阶段一：

* 用户进程调用sigaction，注册信号处理函数
* 内核返回成功，开始监听 FD
* 用户进程不阻塞等待，可以执行其它业务
* 当内核数据就绪后，回调用户进程的 SIGIO 处理函数

阶段二：

* 收到 SIGIO 回调信号
* 调用recvfrom，读取
* 内核将数据拷贝到用户空间
* 用户进程处理数据

![image-20240315164925539](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315164925539.png)

当有大量 IO 操作时，信号较多，SIGIO 处理函数不能及时处理可能导致信号队列溢出，而且内核空间与用户空间的频繁信号交互性能也较低。

<br/>

#### 异步IO

这种方式，不仅仅是用户态在试图读取数据后，不阻塞，而且当内核的数据准备完成后，也不会阻塞

![image-20240315164952506](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315164952506.png)

他会由内核将所有数据处理完成后，由内核将数据写入到用户态中，然后才算完成，所以性能极高，不会有任何阻塞，全部都由内核完成，可以看到，异步IO模型中，用户进程在两个阶段都是非阻塞状态。

- 并发访问太多会导致服务崩溃，需要限流。
- 实现比较复杂

<br/>

**对比**

最后用一幅图，来说明他们之间的区别

IO操作是同步还是异步，关键看数据在内核空间与用户空间的拷贝过程（数据读写的IO操作），也就是阶段二是同步还是异步：

![1653912219712](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/1653912219712.png)



<br/>

### 网络模型

**Redis到底是单线程还是多线程？**

* 如果仅仅聊 Redis 的核心业务部分（命令处理），答案是单线程
* 如果是聊整个 Redis，那么答案就是多线程

在Redis版本迭代过程中，在两个重要的时间节点上引入了多线程的支持：

* Redis v4.0：引入多线程异步处理一些耗时较旧的任务，例如异步删除命令 unlink
* Redis v6.0：在核心网络模型中引入 多线程，进一步提高对于多核 CPU 的利用率

因此，对于 Redis 的核心网络模型，在Redis 6.0之前确实都是单线程。是利用 epoll（Linux系统）这样的IO 多路复用技术在事件循环中不断处理客户端情况。

<br/>

**为什么Redis要选择单线程？**

* 抛开持久化不谈，Redis 是纯内存操作，执行速度非常快，它的性能瓶颈是网络延迟而不是执行速度，因此多线程并不会带来巨大的性能提升。
* 多线程会导致过多的上下文切换，带来不必要的开销
* 引入多线程会面临线程安全问题，必然要引入线程锁这样的安全手段，实现复杂度增高，而且性能也会大打折扣

<br/>

Redis 通过 IO 多路复用来提高网络性能，并且支持各种不同的多路复用实现，并且将这些实现进行封装， 提供了统一的高性能事件库 API 库 AE：

![image-20240326102458080](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240326102458080.png)

<br/>

来看下 Redis 单线程网络模型的整个流程：

![image-20240326112452925](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240326112452925.png)



![image-20240326113723541](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240326113723541.png)



![image-20240326114301012](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240326114301012.png)

<br/>

Redis6.0 版本中引入了多线程，目的是为了提高 IO 读写效率。因此在解析客户端命令、写响应结果时采用了多线程。核心的命令执行、IO 多路复用模块依旧是由主线程执行。

![image-20240315165355772](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240315165355772.png)

当我们的客户端想要去连接我们服务器，会去先到 IO 多路复用模型去进行排队，会有一个连接应答处理器，他会去接受读请求，然后又把读请求注册到具体模型中去，此时这些建立起来的连接，如果是客户端请求处理器去进行执行命令时，他会去把数据读取出来，然后把数据放入到 Client 中， Clinet 去解析当前的命令转化为 Redis 认识的命令，接下来就开始处理这些命令，从 Redis 中的 Command 中找到这些命令，然后就真正的去操作对应的数据了，当数据操作完成后，会去找到命令回复处理器，再由他将数据写出。

<br/>

### 通信协议

Redis是一个CS架构的软件，通信一般分两步（不包括pipeline和PubSub）：

- 客户端（client）向服务端（server）发送一条命令
- 服务端解析并执行命令，返回响应结果给客户端

因此客户端发送命令的格式、服务端响应结果的格式必须有一个规范，这个规范就是通信协议。

<br/>

而在 Redis 中采用的是 RESP（Redis Serialization Protocol）协议：

- Redis 1.2 版本引入了 RESP 协议
- Redis 2.0 版本中成为与 Redis 服务端通信的标准，称为RESP2
- Redis 6.0 版本中，从RESP2升级到了RESP3协议，增加了更多数据类型并且支持6.0的新特性--客户端缓存

但目前，默认使用的依然是RESP2协议，也是我们要学习的协议版本（以下简称RESP）。

<br/>

在RESP中，通过首字节的字符来区分不同数据类型，常用的数据类型包括5种：

- 单行字符串：首字节是 `+` ，后面跟上单行字符串，以CRLF（ `\r\n` ）结尾。例如返回 `OK`： `+OK\r\n`
  - 二进制不安全，不能返回特殊字符，一般用于服务端返回信息
  
- 错误（Errors）：首字节是 `-` ，与单行字符串格式一样，只是字符串是异常信息，例如：`-Error message\r\n`

- 数值：首字节是`:` ，后面跟上数字格式的字符串，以CRLF结尾。例如：`:10\r\n`

- 多行字符串：首字节是 `$` ，表示二进制安全的字符串，最大支持512MB：
  
  - 如果大小为0，则代表空字符串：`$0\r\n\r\n`
  
  - 如果大小为-1，则代表不存在：`$-1\r\n`
  
    <img src="https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240326150545224.png" alt="image-20240326150545224" style="zoom:50%;" />
  
- 数组：首字节是 `*`，后面跟上数组元素个数，再跟上元素，元素数据类型不限

![1653982993020](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/1653982993020.png)

<br/>

基于 Socket 自定义 Redis 的客户端

Redis 支持 TCP 通信，因此我们可以使用 Socket 来模拟客户端，与 Redis 服务端建立连接：

```java
public class Main {

    static Socket s;
    static PrintWriter writer;
    static BufferedReader reader;

    public static void main(String[] args) {
        try {
            // 1.建立连接
            String host = "192.168.150.101";
            int port = 6379;
            s = new Socket(host, port);
            // 2.获取输出流、输入流
            writer = new PrintWriter(new OutputStreamWriter(s.getOutputStream(), StandardCharsets.UTF_8));
            reader = new BufferedReader(new InputStreamReader(s.getInputStream(), StandardCharsets.UTF_8));

            // 3.发出请求
            // 3.1.获取授权 auth 123321
            sendRequest("auth", "123321");
            Object obj = handleResponse();
            System.out.println("obj = " + obj);

            // 3.2.set name 虎哥
            sendRequest("set", "name", "虎哥");
            // 4.解析响应
            obj = handleResponse();
            System.out.println("obj = " + obj);

            // 3.2.set name 虎哥
            sendRequest("get", "name");
            // 4.解析响应
            obj = handleResponse();
            System.out.println("obj = " + obj);

            // 3.2.set name 虎哥
            sendRequest("mget", "name", "num", "msg");
            // 4.解析响应
            obj = handleResponse();
            System.out.println("obj = " + obj);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            // 5.释放连接
            try {
                if (reader != null) reader.close();
                if (writer != null) writer.close();
                if (s != null) s.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private static Object handleResponse() throws IOException {
        // 读取首字节
        int prefix = reader.read();
        // 判断数据类型标示
        switch (prefix) {
            case '+': // 单行字符串，直接读一行
                return reader.readLine();
            case '-': // 异常，也读一行
                throw new RuntimeException(reader.readLine());
            case ':': // 数字
                return Long.parseLong(reader.readLine());
            case '$': // 多行字符串
                // 先读长度
                int len = Integer.parseInt(reader.readLine());
                if (len == -1) {
                    return null;
                }
                if (len == 0) {
                    return "";
                }
                // 再读数据,读len个字节。我们假设没有特殊字符，所以读一行（简化）
                return reader.readLine();
            case '*':
                return readBulkString();
            default:
                throw new RuntimeException("错误的数据格式！");
        }
    }

    private static Object readBulkString() throws IOException {
        // 获取数组大小
        int len = Integer.parseInt(reader.readLine());
        if (len <= 0) {
            return null;
        }
        // 定义集合，接收多个元素
        List<Object> list = new ArrayList<>(len);
        // 遍历，依次读取每个元素
        for (int i = 0; i < len; i++) {
            list.add(handleResponse());
        }
        return list;
    }

    // set name 虎哥
    private static void sendRequest(String ... args) {
        writer.println("*" + args.length);
        for (String arg : args) {
            writer.println("$" + arg.getBytes(StandardCharsets.UTF_8).length);
            writer.println(arg);
        }
        writer.flush();
    }
}

```



