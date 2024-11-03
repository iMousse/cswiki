[返回首页](index.md)
## * 同步模式之顺序控制

#### 固定顺序

比如，必须先3 在 2 后 1 打印

```java
@Slf4j(topic = "c.ByOrderPrint")
public class ByOrderPrint {
    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            log.debug("1");

        }, "t1");

        Thread t2 = new Thread(() -> {
            log.debug("2");

        }, "t2");

        t1.start();
        t2.start();
    }
}
```

代码

::: code-group

```java [join实现]
package org.itcast.pattern;

import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "c.ByOrderPrint2Join")
public class ByOrderPrint2Join {
    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            log.debug("3");

        }, "t1");

        Thread t2 = new Thread(() -> {
            try {
                t1.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            log.debug("2");
        }, "t2");

        Thread t3 = new Thread(() -> {
            try {
                t2.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            log.debug("1");
        }, "t3");

        t1.start();
        t2.start();
        t3.start();
    }
}

```

```java [wait notify]
package org.itcast.pattern;

import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "c.ByOrderPrint2Sync")
public class ByOrderPrint2Sync {
    private static final Object object = new Object();
    public static boolean t2runFlag = false;
    public static boolean t3runFlag = false;

    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            synchronized (object) {
                log.debug("3");
                t2runFlag = true;

                object.notifyAll();
            }
        }, "t1");

        Thread t2 = new Thread(() -> {
            synchronized (object) {

                while (!t2runFlag) {
                    try {
                        object.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }

                log.debug("2");
                t3runFlag = true;
                object.notifyAll();
            }
        }, "t2");

        Thread t3 = new Thread(() -> {
            synchronized (object) {
                while (!t3runFlag) {
                    try {
                        object.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    
                }
                log.debug("1");
            }
        }, "t3");

        t1.start();
        t2.start();
        t3.start();
    }

}
```

```java [park unpark]
package org.itcast.pattern;

import lombok.extern.slf4j.Slf4j;
import org.itcast.util.Sleeper;

import java.util.concurrent.locks.LockSupport;

@Slf4j(topic = "c.ByOrderPrint2Park")
public class ByOrderPrint2Park {
    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            // 默认没有许可证，当没有『许可』时，当前线程暂停运行；
            // 有『许可』时，用掉这个『许可』，当前线程恢复运行
            LockSupport.park();
            System.out.println("1");
        });
        Thread t2 = new Thread(() -> {
            LockSupport.park();
            System.out.println("2");
            // 给线程 t1 发放『许可』（多次连续调用 unpark 只会发放一个『许可』）
            LockSupport.unpark(t1);
        });

        Thread t3 = new Thread(() -> {
            System.out.println("3");
            // 给线程 t2 发放『许可』（多次连续调用 unpark 只会发放一个『许可』）
            LockSupport.unpark(t2);
        });
        t1.start();
        t2.start();
        t3.start();
    }
}
```

:::

::: warning `Wait Notify` 和 `Park Unpark` 版对比

可以看到，实现上很麻烦： 

- 首先，需要保证先 wait 再 notify，否则 wait 线程永远得不到唤醒。因此使用了『运行标记』来判断该不该 wait 
- 第二，如果有些干扰线程错误地 notify 了 wait 线程，条件不满足时还要重新等待，使用了 while 循环来解决此问题 
- 最后，唤醒对象上的 wait 线程需要使用 notifyAll，因为『同步对象』上的等待线程可能不止一个 

可以使用 `LockSupport` 类的 park 和 unpark 来简化上面的题目：

park 和 unpark 方法比较灵活，他俩谁先调用，谁后调用无所谓。并且是以线程为单位进行『暂停』和『恢复』， 不需要『同步对象』和『运行标记』

:::

<br/>

#### 交替输出

要求：线程 1 输出 a 5 次，线程 2 输出 b 5 次，线程 3 输出 c 5 次。现在要求输出 `abcabcabcabcabc` 怎么实现

::: code-group

```java [wait notify]
package org.itcast.pattern;

import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "c.SyncWaitNotify")
public class SyncWaitNotify {
    private int flag;
    private int loopNum;

    /**
     * @param flag    开始序号
     * @param loopNum 遍历次数
     */
    public SyncWaitNotify(int flag, int loopNum) {
        this.flag = flag;
        this.loopNum = loopNum;
    }

    /**
     * 交替打印数据
     *
     * @param waitFlag 开始序号
     * @param nextFlag 下一次序号
     * @param str      打印的字符
     */
    public void print(int waitFlag, int nextFlag, String str) {
        for (int i = 0; i < loopNum; i++) {
            synchronized (this) {
                while (this.flag != waitFlag) {
                    try {
                        this.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                System.out.print(str);
                this.flag = nextFlag;
                this.notifyAll();
            }
        }
    }

    public static void main(String[] args) {
        SyncWaitNotify syncWaitNotify = new SyncWaitNotify(1, 5);
        new Thread( ()-> {syncWaitNotify.print(1,2,"a");}).start();
        new Thread( ()-> {syncWaitNotify.print(2,3,"b");}).start();
        new Thread( ()-> {syncWaitNotify.print(3,1,"c");}).start();
    }
}
```

```java [await signal]
package org.itcast.pattern;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

@Slf4j(topic = "c.SyncAwaitSignal")
public class SyncAwaitSignal extends ReentrantLock {
    private int loopNumber;

    public SyncAwaitSignal(int loopNumber) {
        this.loopNumber = loopNumber;
    }

    /**
     * @param first 开始条件
     */
    public void start(Condition first) {
        this.lock();
        try {
            log.debug("start");
            first.signal();
        } finally {
            this.unlock();
        }
    }

    /**
     * 交替打印数据
     *
     * @param current 当前条件
     * @param next    下个条件
     * @param str     打印的字符
     */
    public void print(Condition current, Condition next, String str) {
        for (int i = 0; i < loopNumber; i++) {
            this.lock();
            try {
                current.await();
                log.debug(str);
                next.signal();
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                this.unlock();
            }
        }
    }

    // 该实现没有考虑 a，b，c 线程都就绪再开始
    public static void main(String[] args) {
        SyncAwaitSignal as = new SyncAwaitSignal(5);

        Condition aWaitSet = as.newCondition();
        Condition bWaitSet = as.newCondition();
        Condition cWaitSet = as.newCondition();

        new Thread(() -> as.print(aWaitSet, bWaitSet, "a")).start();
        new Thread(() -> as.print(bWaitSet, cWaitSet, "b")).start();
        new Thread(() -> as.print(cWaitSet, aWaitSet, "c")).start();

        as.start(aWaitSet);
    }
}

```

```java [park unpark]
package org.itcast.pattern;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.locks.LockSupport;

@Slf4j(topic = "c.SyncParkUnPark")
public class SyncParkUnPark {
    private final int loopNumber;
    private Thread[] threads;

    /**
     * @param loopNumber 循环次数
     */
    public SyncParkUnPark(int loopNumber) {
        this.loopNumber = loopNumber;
    }

    /**
     * @param threads 设置线程顺序
     */
    public void setThreads(Thread... threads) {
        this.threads = threads;
    }

    /**
     * @param str 打印字符串
     */
    public void print(String str) {
        for (int i = 0; i < loopNumber; i++) {
            // 清除打断标记
            LockSupport.park();
            System.out.print(str);
            // 为下个线程设置标记
            LockSupport.unpark(nextThread());
        }
    }

    /**
     * @return 获取下一个线程，可以循环
     */
    private Thread nextThread() {
        Thread current = Thread.currentThread();
        int index = 0;
        for (int i = 0; i < threads.length; i++) {
            if (threads[i] == current) {
                index = i;
                break;
            }
        }
        if (index < threads.length - 1) {
            return threads[index + 1];
        } else {
            return threads[0];
        }
    }

    /**
     * 从第一个线程运行
     */
    public void start() {
        for (Thread thread : threads) {
            thread.start();
        }
        // 设置打断标记
        LockSupport.unpark(threads[0]);
    }

    public static void main(String[] args) {
        SyncParkUnPark syncPark = new SyncParkUnPark(5);

        Thread t1 = new Thread(() -> syncPark.print("a"));
        Thread t2 = new Thread(() -> syncPark.print("b"));
        Thread t3 = new Thread(() -> syncPark.print("c"));

        syncPark.setThreads(t1, t2, t3);

        syncPark.start();
    }
}
```

:::
