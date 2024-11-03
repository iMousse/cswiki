[返回首页](index.md)

#### <font color="green">*应用之限制</font>

案例-防止CPU占用100%，通过sleep 实现 

在没有利用 cpu 来计算时，不要让 while(true) 空转浪费 cpu，这时可以使用 yield 或 sleep 来让出 cpu 的使用权给其他程序

```java
while(true) {
    try {
        Thread.sleep(50);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}
```

::: warning 💡 提示

- 可以用 `wait/nofity/nofifyAll` 或 `await/signal/signalAll` 达到类似的效果；
- 不同的是，`wait` 和 `await` 都需要加锁，并且需要相应的唤醒操作，一般适用于要进行同步的场景，sleep 适用于无需锁同步的场景，用来限制空转CPU

:::

<br/>

### 