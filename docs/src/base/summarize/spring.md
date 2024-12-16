# 框架篇总结
[返回首页](index.md)

[Spring入门到精通](../struct/spring/index.md)

<br/>

**Spring**

- Spring 框架中的单例 bean 是线程安全的吗？
- 什么是 AOP,你们项目中有没有使用到 AOP ？
- Spring 中的事务是如何实现的
- Spring 中有哪些事务传播行为
- Spring 事务失效的场景有哪些
- Spring 的 bean 的生命周期
- Spring 中的循环引用
- SpringMVC 的执行流程知道嘛
- Springboot 自动配置原理
- Spring 的常见注解有哪些？
- SpringMVC 常见的注解有哪些？
- Springboot 常见注解有哪些？

<br/>


**Mybatis**

- MyBatis 执行流程？
- Mybatis 是否支持延迟加载？
- 延迟加载的底层原理知道吗？
- Mybatis 的二级缓存什么时候会清理缓存中的数据



Spring
------

### Bean 线程安全

> 面试官：Spring框架中的单例 bean 是线程安全的吗？

```java
@Service
@Scope("singleton")
public class UserServiceImpl implements UserService {

}
```

- Singleton : Bean在每个 Spring IOC 容器中只有一个实例。
- Prototype：一个 bean 的定义可以有多个实例。 

<br/>

Spring bean 并没有可变的状态 (比如Service类和DAO类) ，所以在某种程度上说 Spring 的单例 bean是线程安全的。

但如果存在成员方法则**不是线程安全的**。

```java {5}
@Controller
@RequestMapping("/user")
public class UserController {
	  // ! 存在线程安全问题
    private int count;
    @Autowired
    private UserService userService;

    @GetMapping("/getById/{id}")
    public User getById(@PathVariable("id") Integer id) {
        count++;
        System.out.println(count);
        return userService.getById(id);
    }
}

```

<br/>

:::warning 💡思考：Spring 框架中的单例 Bean 是线程安全的吗？

不是线程安全的，Spring中有个 @Scope 注解，默认的值是 `Singleton`，单例的。当 Spring 的 Bean 对象是无状态的对象，则是线程安全的。如果在 Bean 中定义了可修改的成员变量，则需要考虑线程安全问题。可以使用多例或加锁来解决。

:::

<br/>

### Bean 生命周期

> 面试官：SpringBean 的生命周期

回答两方面内容：

- Spring 容器是如何管理和创建 Bean 实例
- 方便调试和解决问题

<br/>

**BeanDefinition**

Spring容器在进行实例化时，会将XML配置的 `<bean>` 的信息封装成 `BeanDefinition` 对象，Spring根据 `BeanDefinition`来创建Bean对象，里面有很多的属性来描述Bean

```xml
<bean id="userDao" class="com.itheima.dao.impl.UserDaoImpl" lazy-init="true"/>
<bean id="userService" class="com.itheima.service.UserServiceImpl" scope="singleton">
	<property name="userDao" ref="userDao"></property>
</bean>
```

- `beanClassName`：bean 的类名
- `initMethodName`：初始化方法名称
- `properryValues`：bean 的属性值
- `scope`：作用域
- `lazyInit`：延迟初始化

![image-20231223141045130](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231223141045130.png)

<br/>

**Bean生命周期**

![image-20231223141145378](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231223141145378.png)

代码实例：

需要的依赖

```xml
  <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>5.2.10.RELEASE</version>
        </dependency>
    </dependencies>
```

配置代码

```java
@Configuration
@ComponentScan("com.itheima.lifecycle")
public class SpringConfig {

}
```

用户类

```java
package com.itheima.lifecycle;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.BeanNameAware;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

@Component
public class User implements BeanNameAware, BeanFactoryAware, ApplicationContextAware, InitializingBean {

    public User() {
        System.out.println("User的构造方法执行了.........");
    }

    private String name ;

    @Value("张三")
    public void setName(String name) {
        System.out.println("setName方法执行了.........");
    }

    @Override
    public void setBeanName(String name) {
        System.out.println("setBeanName方法执行了.........");
    }

    @Override
    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
        System.out.println("setBeanFactory方法执行了.........");
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        System.out.println("setApplicationContext方法执行了........");
    }

    @PostConstruct
    public void init() {
        System.out.println("init方法执行了.................");
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("afterPropertiesSet方法执行了........");
    }

    @PreDestroy
    public void destory() {
        System.out.println("destory方法执行了...............");
    }

}
```

继承了BeanPostProcessor

```java
package com.itheima.lifecycle;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.cglib.proxy.Enhancer;
import org.springframework.cglib.proxy.InvocationHandler;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Component
public class MyBeanPostProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (beanName.equals("user")) {
            System.out.println("postProcessBeforeInitialization方法执行了->user对象初始化方法前开始增强....");
        }
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (beanName.equals("user")) {
            System.out.println("postProcessAfterInitialization->user对象初始化方法后开始增强....");
            //cglib代理对象
            Enhancer enhancer = new Enhancer();
            //设置需要增强的类
            enhancer.setSuperclass(bean.getClass());
            //执行回调方法，增强方法
            enhancer.setCallback(new InvocationHandler() {
                @Override
                public Object invoke(Object o, Method method, Object[] objects) throws Throwable {
                    //执行目标方法
                    return method.invoke(method,objects);
                }
            });
            //创建代理对象
            return enhancer.create();
        }
        return bean;
    }

}
```

测试类

```java
package com.itheima.lifecycle;


import com.itheima.config.SpringConfig;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;


public class UserTest {

    public static void main(String[] args) {
        ApplicationContext ctx = new AnnotationConfigApplicationContext(SpringConfig.class);
        User user = ctx.getBean(User.class);
        System.out.println(user);
    }

}
```

打印信息

```sh
User的构造方法执行了.........
setName方法执行了.........
setBeanName方法执行了.........
setBeanFactory方法执行了.........
setApplicationContext方法执行了........
postProcessBeforeInitialization方法执行了->user对象初始化方法前开始增强....
init方法执行了.................
afterPropertiesSet方法执行了........
postProcessAfterInitialization->user对象初始化方法后开始增强....
User的构造方法执行了.........
public java.lang.String java.lang.Object.toString()
```

<br/>

:::warning 💡思考：Spring  Bean的生命周期

首先会通过一个非常重要的类，叫做 BeanDefinition 获取 Bean 的定义信息，这里面就封装了 Bean 的所有信息，比如类的全路径，是否是延迟加载，是否是单例等等这些信息。

第一步是在创建 Bean 的时候，调用构造函数实例化 Bean

第二步是 Bean 的依赖注入，比如一些 set 方法注入，像平时开发用的 @Autowire 都是这一步完成

第三步是处理 Aware 接口，如果某一个 Bean 实现了 Aware 接口就会重写方法执行

第四步是 Bean 的后置处理器 BeanPostProcessor，这个是前置处理器

第五步是初始化方法，比如实现了接口 InitializingBean 或者自定义了方法 init-method 标签或 @PostContruct

第六步是执行了 Bean 的后置处理器 BeanPostProcessor，主要是对 Bean进行增强，有可能在这里产生代理对象

最后一步是销毁 Bean

:::

<br/>

### Spring AOP

> 面试官：什么是AOP，你们项目中有没有使用到AOP

AOP称为面向切面编程，用于将那些与业务无关，但却对多个对象产生影响的公共行为和逻辑，抽取并封装为一个可重用的模块，这个模块被命名为“切面”（Aspect），减少系统中的重复代码，降低了模块间的耦合度，同时提高了系统的可维护性。

常见的AOP使用场景：

- 记录操作日志
- 缓存处理
- Spring中内置的事务处理

<br/>

**Spring中的事务是如何实现的**

Spring支持编程式事务管理和声明式事务管理两种方式。

编程式事务控制：需使用 TransactionTemplate 来进行实现，对业务代码有侵入性，项目中很少使用

声明式事务管理：声明式事务管理建立在AOP之上的。其本质是通过AOP功能，对方法前后进行拦截，将事务处理的功能编织到拦截的方法中，也就是在目标方法开始之前加入一个事务，在执行完目标方法之后根据执行情况提交或者回滚事务。

![image-20231221094357582](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231221094357582.png)

<br/>

:::warning 💡思考：什么是 AOP ，你们项目中有没有使用到 AOP

AOP 的含义是面向切面编程。将与业务无关，但对多个对象产生影响的行为和逻辑，抽取成为公共的功能模块来进行复用。

我们系统中日志文件的方法，菜单按钮权限的管理都是通过 AOP 来实现的。通过切点表达式获取日志记录的方法，然后通过环绕通知获取请求方法的参数，比如类信息、方法信息、注解、请求方式等，获取这些参数以后保存到数据库。

<br/>

💡**思考：Spring 中的事务是如何实现的？**

Spring 本质是 AOP 来实现的，对方法的前后进行拦截，在执行方法之前开启事务，在方法执行之后提交或回滚事务。

:::

<br/>

### Spring 事务传播行为



### Spring 事务失效

> 面试官：对spring框架的深入理解、复杂业务的编码经验

- 异常捕获处理
- 抛出检查异常
- 非public方法

<br/>

**情况一：异常捕获处理**

![image-20231221094706821](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231221094706821.png)

<br/>

**情况二：抛出检查异常**

![image-20231221094803359](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231221094803359.png)

<br/>

**情况三：非public方法导致的事务失效**

![image-20231221094844464](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231221094844464.png)

<br/>

:::warning 💡思考：Spring 事务失效的场景有哪些？

- 方法上异常捕获处理，自己处理了异常但是没有抛出就会导致事务失效，所以我们在处理异常之后需要对异常进行抛出。
- 方法抛出异常检查，如果报错也会导致事务失效，因为Spring默认只会回滚非检查异常，所以我们需要在Transactional注解上配置rollbackFor属性为Exception。
- 方法上不是public修饰也会失效。

:::

<br/>

### *Spring 循环依赖

Spring中的循环引用

![image-20231224000223068](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224000223068.png)

循环依赖流程图

![image-20231224002346813](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224002346813.png)

<br/>

三级缓存解决循环依赖

![image-20231224005813459](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224005813459.png)

<br/>

一级缓存作用：限制bean在beanFactory中只存一份，即实现singleton scope，解决不了循环依赖。

![image-20231224022839719](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224022839719.png)

<br/>

如果要想打破循环依赖, 就需要一个中间人的参与, 这个中间人就是二级缓存。<mark>对象A和对象B从二级缓存存入了一级缓存。</mark>

![image-20231224023549457](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224023549457.png)

<br/>

但是一级缓存和二级缓存只能解决一般对象的循环依赖问题。如果A是代理对象，则需要借助三级缓存

![image-20231224023658943](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224023658943.png)

<br/>

三级缓存解决循环依赖

![image-20231224023958186](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224023958186.png)

<br/>

手动解决循环依赖：构造方法出现了循环依赖。

![image-20231224024045030](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224024045030.png)

<br/>

回答要点：Spring中的循环引用

循环依赖：循环依赖其实就是循环引用,也就是两个或两个以上的bean互相持有对方,最终形成闭环。比如A依赖于B,B依赖于A

循环依赖在spring中是允许存在，spring框架依据三级缓存已经解决了大部分的循环依赖

①一级缓存：单例池，缓存已经经历了完整的生命周期，已经初始化完成的bean对象

②二级缓存：缓存早期的bean对象（生命周期还没走完）

③三级缓存：缓存的是ObjectFactory，表示对象工厂，用来创建某个对象的

![image-20231224024304233](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224024304233.png)



**面试官**：Spring中的循环引用

**候选人**：

嗯，好的，我来解释一下

循环依赖：循环依赖其实就是循环引用,也就是两个或两个以上的bean互相持有对方,最终形成闭环。比如A依赖于B,B依赖于A

循环依赖在spring中是允许存在，spring框架依据三级缓存已经解决了大部分的循环依赖

①一级缓存：单例池，缓存已经经历了完整的生命周期，已经初始化完成的bean对象

②二级缓存：缓存早期的bean对象（生命周期还没走完）

③三级缓存：缓存的是ObjectFactory，表示对象工厂，用来创建某个对象的





**面试官**：那具体解决流程清楚吗？

**候选人**：

第一，先实例A对象，同时会创建ObjectFactory对象存入三级缓存singletonFactories  

第二，A在初始化的时候需要B对象，这个走B的创建的逻辑

第三，B实例化完成，也会创建ObjectFactory对象存入三级缓存singletonFactories  

第四，B需要注入A，通过三级缓存中获取ObjectFactory来生成一个A的对象同时存入二级缓存，这个是有两种情况，一个是可能是A的普通对象，另外一个是A的代理对象，都可以让ObjectFactory来生产对应的对象，这也是三级缓存的关键

第五，B通过从通过二级缓存earlySingletonObjects  获得到A的对象后可以正常注入，B创建成功，存入一级缓存singletonObjects  

第六，回到A对象初始化，因为B对象已经创建完成，则可以直接注入B，A创建成功存入一次缓存singletonObjects 

第七，二级缓存中的临时对象A清除 



**面试官**：构造方法出现了循环依赖怎么解决？

**候选人**：

由于bean的生命周期中构造函数是第一个执行的，spring框架并不能解决构造函数的的依赖注入，可以使用@Lazy懒加载，什么时候需要对象再进行bean对象的创建





## SpringMVC

### SpringMVC 的执行流程

> 面试官：SpringMVC的执行流程你知道吗？

SpringMVC的执行流程是这个框架最核心的内容。

- 视图阶段（老旧JSP等）
- 前后端分离阶段（接口开发，异步）

<br/>

**视图阶段**

![image-20231224032311005](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224032311005.png)

**前后端分离阶段**

![image-20231224032336004](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224032336004.png)

<br/>

:::warning 💡思考：SpringMVC的执行流程知道嘛

1、用户发送出请求到前端控制器 DispatcherServlet，这是一个调度中心

2、DispatcherServlet 收到请求调用 HandlerMapping（处理器映射器）。

3、HandlerMapping 找到具体的处理器 （可查找xml配置或注解配置），生成处理器对象及**处理器拦截器**(如果有)，再一起返回给DispatcherServlet。

4、DispatcherServlet 调用 HandlerAdapter（处理器适配器）。

5、HandlerAdapter 经过适配调用具体的处理器（Handler/Controller）。

6、Controller 执行完成返回 ModelAndView 对象。

7、HandlerAdapter 将 Controller 执行结果 ModelAndView 返回给 DispatcherServlet。

8、DispatcherServlet 将 ModelAndView 传给 ViewReslover（视图解析器）。

9、ViewReslover 解析后返回具体 View（视图）。

10、DispatcherServlet 根据 View 进行渲染视图（即将模型数据填充至视图中）。

11、DispatcherServlet 响应用户。

当然现在的开发，基本都是前后端分离的开发的，并没有视图这些，一般都是handler中使用Response直接结果返回

:::

SpringBoot
----------

### 自动配置原理

SpringBoot 中最高频的一道面试题，也是框架最核心的思想。

![image-20231224130558060](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224130558060.png)

- `@SpringBootConfiguration`: 该注解与`@Configutation`注解作用相同，用来声明当前也是一个配置类。
- `@ComponentScan`: 组件扫描，默认扫描当前引导类所在包及其子包。
- `@EnableAutoConfiguration`: SpringBoot实现自动化配置的核心注解。

![image-20231224131426774](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224131426774.png)

举例：查看 `RedisAutoConfiguration` 的配置信息

```java {2,4,11}
// 是一个配置类
@AutoConfiguration
// 判断是否有对应的字节码
@ConditionalOnClass(RedisOperations.class) 
@EnableConfigurationProperties(RedisProperties.class)
@Import({ LettuceConnectionConfiguration.class, JedisConnectionConfiguration.class })
public class RedisAutoConfiguration {

	@Bean
  // 判断环境中有没有对应的 Bean
	@ConditionalOnMissingBean(name = "redisTemplate")
	@ConditionalOnSingleCandidate(RedisConnectionFactory.class)
	public RedisTemplate<Object, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
		RedisTemplate<Object, Object> template = new RedisTemplate<>();
		template.setConnectionFactory(redisConnectionFactory);
		return template;
	}

	@Bean
	@ConditionalOnMissingBean
	@ConditionalOnSingleCandidate(RedisConnectionFactory.class)
	public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory redisConnectionFactory) {
		return new StringRedisTemplate(redisConnectionFactory);
	}

}
```

<br/>

:::warning 💡思考：Springboot自动配置原理

SpringBoot项目中有个注解 @SpringBootApplication，主要由三个注解组成。

- `@SpringBootConfiguration` 表明这个类当前是配置类。
- `@ComponentScan` 表明默认扫描当前引导类所在包及其子包。
- `@EnableAutoConfiguration` 是实现自动化配置的核心包。其主要通过 `@Import` 注解导入相应的配置。内部读取了该项目和该项目引用的 Jar 包下 classpath 下 `METE/spring.factories` 文件中的所配置类的全类名。并会有 `@ConditionalOnClass` 注解判断是否有对象的 class 文件，如果有则加载该类，把这个配置类的所有 Bean 放入 Spring 容器中。

:::

<br/>

### Spring 框架常见注解

> 面试官：Spring框架常见注解（Spring、SpringBoot、SpringMVC）

- Spring 常见的注解有哪些？
- SpringMVC 常见的注解有哪些？
- SpringBoot 常见的注解有哪些？

<br/>

**Spring常见注解**

![image-20231224131918449](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224131918449.png)

<br/>

**SpringMVC常见注解**

![image-20231224131949623](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224131949623.png)

<br/>

**SpringBoot常见注解**

![image-20231224132051165](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224132051165.png)

<br/>

:::warning 💡思考：Spring 的常见注解有哪些？

第一类是：声明bean，有@Component、@Service、@Repository、@Controller

第二类是：依赖注入相关的，有@Autowired、@Qualifier、@Resourse

第三类是：设置作用域 @Scope

第四类是：spring配置相关的，比如@Configuration，@ComponentScan 和 @Bean 

第五类是：跟aop相关做增强的注解  @Aspect，@Before，@After，@Around，@Pointcut

<br/>

💡**思考：SpringMVC 常见的注解有哪些？**

- @RequestMapping：用于映射请求路径；
- @RequestBody：注解实现接收http请求的json数据，将json转换为java对象；
- @RequestParam：指定请求参数的名称；
- @PathViriable：从请求路径下中获取请求参数(/user/{id})，传递给方法的形式参数；
- @ResponseBody：注解实现将controller方法返回对象转化为json对象响应给客户端。
- @RequestHeader：获取指定的请求头数据，还有像@PostMapping、@GetMapping这些。

<br/>

💡**思考：SpringBoot 常见的注解有哪些？**

Spring Boot的核心注解是@SpringBootApplication , 他由几个注解组成 : 

- @SpringBootConfiguration： 组合了- @Configuration注解，实现配置文件的功能；
- @EnableAutoConfiguration：打开自动配置的功能，也可以关闭某个自动配置的选项
- @ComponentScan：Spring组件扫描

:::

MyBatis
-------

### MyBatis执行流程

> 面试官：MyBatis执行流程是怎么样的，能描述一下吗？

- 理解各个组件的关系
- SQL执行过程（参数映射，SQL解析，执行和结果处理）

<br/>

核心配置 :`mybatis-config.xml`

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224133216040.png)


MappendStatement对象

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224133449346.png)

<br/>


**Mybatis执行流程**

![image-20231224133410862](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224133410862.png)

<br/>

:::warning 💡思考：MyBatis执行流程

读取mybatis-config.xml加载运行环境和映射文件，并创建全局唯一的会话工厂SqlSessionFactory，生产SqlSession对象，包含了执行SQL语句的所有方法，并通过Executor执行器来执行数据库操作接口。其中Executor接口的执行方法中有一个MappedStatement类型的参数，封装了映射信息。通过输入参数映射来获取输出结果映射。

:::

<br/>

### Mybatis延迟加载

> 面试官：Mybatis是否支持延迟加载？

![image-20231224135431031](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224135431031.png)

查询用户的时候，把用户所属的订单数据也查询出来，这个是<mark>立即加载</mark>

查询用户的时候，暂时不查询订单数据，当需要订单的时候，再查询订单，这个就是<mark>延迟加载</mark>

<br/>

**延迟加载原理**

1. 使用CGLIB创建目标对象的代理对象
2. 当调用目标方法`user.getOrderList()`时，进入拦截器invoke方法，发现`user.getOrderList()`是null值，执行sql查询order列
3. 把order查询上来，然后调用`user.setOrderList(List<Order> orderList)` ，接着完成`user.getOrderList()`方法的调用

![image-20231224135627464](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224135627464.png)

<br/>

:::warning 💡思考：Mybatis是否支持延迟加载？

延迟加载就是指用到数据才加载，没有用到数据不加载。Mybatis支持一对一关联对象和一对多关联对象的延迟加载。可以通过配置是否加载延迟加载来实现，默认是关闭的。

<br/>

💡**思考：延迟加载的底层原理知道吗？**

延迟加载底层是通过CGLIB动态代理实现的。通过创建目标对象的代理对象，目标对象是开启延迟加载的mapper，当调用目标方法后进入拦截器invoke方法，发现目标对象为空则执行SQL，在获取数据以后调用SET方法设置属性值，在查询目标方法则会有数据。

:::

<br/>

### Mybatis一级二级缓存

> 面试官：Mybatis的一级，二级缓存用过吗？

![image-20231224140431881](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224140431881.png)

<br/>

**一级缓存**

基于 PerpetualCache 的 HashMap 本地缓存，其存储作用域为 Session，当Session进行flush或close之后，该Session中的所有Cache就将清空，默认打开一级缓存

![](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224140515933.png)

<br/>

**二级缓存**

二级缓存是基于namespace和mapper的作用域起作用的，不是依赖于SQL session，默认也是采用 PerpetualCache，HashMap 存储

![image-20231224140612820](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20231224140612820.png)

注意事项

1. 对于缓存数据更新机制，当某一个作用域(一级缓存 Session/二级缓存Namespaces)的进行了新增、修改、删除操作后，默认该作用域下所有 select 中的缓存将被 clear

2. 二级缓存需要缓存的数据实现Serializable接口

3. 只有会话提交或者关闭以后，一级缓存中的数据才会转移到二级缓存中

<br/>

:::warning 💡思考：Mybatis的二级缓存什么时候会清理缓存中的数据

- 一级缓存是基于session的HashMap本地缓存，当session进行flush或close则对缓存进行清空，默认开启。
- 二级缓存是基于namespace和mapper作用域的本地缓存，需要打开配置才会生效。
- 二级缓存会在数据进行新增，修改，删除后对所有默认改作用域下的select缓存进行clear。

:::
