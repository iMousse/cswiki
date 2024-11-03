[[toc]]

## 短信登录

### 基于Session实现登录

- **发送验证码**

用户在提交手机号后，会校验手机号是否合法，如果不合法，则要求用户重新输入手机号

如果手机号合法，后台此时生成对应的验证码，同时将验证码进行保存，然后再通过短信的方式将验证码发送给用户

<br/>

- **短信验证码登录、注册**

用户将验证码和手机号进行输入，后台从 Session 中拿到当前验证码，然后和用户输入的验证码进行校验，如果不一致，则无法通过校验，如果一致，则后台根据手机号查询用户，如果用户不存在，则为用户创建账号信息，保存到数据库，无论是否存在，都会将用户信息保存到 Session中，方便后续获得当前登录信息

<br/>

- **校验登录状态**

用户在请求时候，会从 Cookie 中携带者 JsessionId 到后台，后台通过 JsessionId 从 Session 中拿到用户信息，如果没有 Session 信息，则进行拦截，如果有 Session信息，则将用户信息保存到ThreadLocal中，并且放行

<br/>

**流程图如下**

![image-20240313215740514](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313215740514.png)

<br/>

**发送短信验证码**

![image-20240313215855837](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313215855837.png)

> 提示：具体逻辑上文已经分析，我们仅仅只需要按照提示的逻辑写出代码即可。

<br/>

**短信验证码登录**

![image-20240313220204640](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313220204640.png)

<br/>

**代码如下**：UserServiceImpl

- 发送短信验证码

  ```java
  @Override
  public Result sendCode(String phone, HttpSession session) {
      //  校验手机号
      if (RegexUtils.isPhoneInvalid(phone)) {
          return Result.fail("手机号格式错误！");
      }
      // 符合，生成验证码
      String code = RandomUtil.randomNumbers(6);
  
      // 保存验证码到 session
      session.setAttribute("code", code);
      // 发送验证码
      log.debug("发送短信验证码成功，验证码：{}", code);
      // 返回ok
      return Result.ok();
  }
  ```
  
- 登录

  ```java
  @Override
  public Result login(LoginFormDTO loginForm, HttpSession session) {
      // 校验手机号
      String phone = loginForm.getPhone();
      if (RegexUtils.isPhoneInvalid(phone)) {
          // 如果不符合，返回错误信息
          return Result.fail("手机号格式错误！");
      }
  
      //  校验验证码
      Object cacheCode = session.getAttribute("code");
      String code = loginForm.getCode();
      if (cacheCode == null || !cacheCode.toString().equals(code)) {
          // 不一致，报错
          return Result.fail("验证码错误");
      }
      // 一致，根据手机号查询用户
      User user = query().eq("phone", phone).one();
  
      // 判断用户是否存在
      if (user == null) {
          // 不存在，则创建
          user = createUserWithPhone(phone);
      }
      // 保存用户信息到session中
      session.setAttribute("user", user);
  
      return Result.ok();
  }
  
  private User createUserWithPhone(String phone) {
      // 创建用户
      User user = new User();
      user.setPhone(phone);
      user.setNickName(USER_NICK_NAME_PREFIX + RandomUtil.randomString(10));
      // 保存用户
      save(user);
      return user;
  }
  ```

<br/>

**实现登录拦截功能**

:::warning 📌 提示：Tomcat 的运行原理

![1653068196656](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/1653068196656.png)

当用户发起请求时，会访问我们像 Tomcat 注册的端口，任何程序想要运行，都需要有一个线程对当前端口号进行监听，Tomcat 也不例外，当监听线程知道用户想要和 Tomcat 连接连接时，那会由监听线程创建 Socket 连接，Socket 都是成对出现的，用户通过 Socket 像互相传递数据，当 Tomcat 端的 Socket 接受到数据后，此时监听线程会从 Tomcat 的线程池中取出一个线程执行用户请求，在我们的服务部署到 Tomca t后，线程会找到用户想要访问的工程，然后用这个线程转发到工程中的Controller，Service，Dao 中，并且访问对应的 DB，在用户执行完请求后，再统一返回，再找到Tomcat 端的 Socket，再将数据写回到用户端的 Socket，完成请求和响应。

通过以上讲解，我们可以得知 每个用户其实对应都是去找 Tomcat 线程池中的一个线程来完成工作的， 使用完成后再进行回收，既然每个请求都是独立的，所以在每个用户去访问我们的工程时，我们可以使用 ThreadLocal 来做到线程隔离，每个线程操作自己的一份数据。

:::

<br/>

**登录验证功能**

![image-20240313231432987](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313231432987.png)

**拦截器代码**

```Java
package com.hmdp.interceptor;

import com.hmdp.dto.UserDTO;
import com.hmdp.utils.UserHolder;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 1.获取session
        HttpSession session = request.getSession();
        // 2.获取session中的用户
        Object user = session.getAttribute("user");
        // 3.判断用户是否存在
        if (user == null) {
            // 4.不存在，拦截， 返回401状态码
            response.setStatus(401);
            return false;
        }
        // 5.存在，保存用户信息到 ThreadLocal
        UserHolder.saveUser(user);
        // 6.放行
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 移除用户
        UserHolder.removeUser();
    }
}
```

<br/>

**让拦截器生效**

```java
package com.hmdp.config;

import com.hmdp.interceptor.LoginInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginInterceptor())
                .excludePathPatterns(
                        "/shop/**",
                        "/voucher/**",
                        "/shop-type/**",
                        "/upload/**",
                        "/blog/hot",
                        "/user/code",
                        "/user/login"
                );
    }
}
```

<br/>

:::warning 📌 提示：关于ThreadLocal

- 如果小伙伴们看过 ThreadLocal 的源码，你会发现在 ThreadLocal 中，无论是他的put方法和他的get方法， 都是先从获得当前用户的线程，然后从线程中取出线程的成员变量map，只要线程不一样，map就不一样，所以可以通过这种方式来做到线程隔离。

:::

<br/>

**隐藏用户敏感信息**

我们通过浏览器观察到此时用户的全部信息都在，这样极为不靠谱，所以我们应当在返回用户信息之前，将用户的敏感信息进行隐藏，采用的核心思路就是书写一个 UserDTO 对象，这个UserDTO 对象就没有敏感信息了，我们在返回前，将有用户敏感信息的 User 对象转化成没有敏感信息的 UserDTO 对象，那么就能够避免这个尴尬的问题了

<br/>

**在登录方法处修改**

```java
@Override
public Result login(LoginFormDTO loginForm, HttpSession session) {
    // 校验手机号
    String phone = loginForm.getPhone();
    if (RegexUtils.isPhoneInvalid(phone)) {
        // 如果不符合，返回错误信息
        return Result.fail("手机号格式错误！");
    }

    //  校验验证码
    Object cacheCode = session.getAttribute("code");
    String code = loginForm.getCode();
    if (cacheCode == null || !cacheCode.toString().equals(code)) {
        // 不一致，报错
        return Result.fail("验证码错误");
    }
    // 一致，根据手机号查询用户
    User user = query().eq("phone", phone).one();

    // 判断用户是否存在
    if (user == null) {
        // 不存在，则创建
        user = createUserWithPhone(phone);
    }
    // 保存用户信息到session中
    session.setAttribute("user", user); // [!code --]
    session.setAttribute("user", BeanUtil.copyProperties(user, UserDTO.class)); // [!code ++]


    return Result.ok();
}
```

<br/>

**在拦截器处**

```java
package com.hmdp.interceptor;

import com.hmdp.dto.UserDTO;
import com.hmdp.utils.UserHolder;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 1.获取session
        HttpSession session = request.getSession();
        // 2.获取session中的用户
        Object user = session.getAttribute("user");
        // 3.判断用户是否存在
        if (user == null) {
            // 4.不存在，拦截， 返回401状态码
            response.setStatus(401);
            return false;
        }
        // 5.存在，保存用户信息到 ThreadLocal
        UserHolder.saveUser(user); // [!code --]
        UserHolder.saveUser((UserDTO) user); // [!code ++]
        // 6.放行
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 移除用户
        UserHolder.removeUser();
    }
}
```

<br/>

**在UserHolder处：将user对象换成UserDTO**

```java
package com.hmdp.utils;

import com.hmdp.dto.UserDTO;

public class UserHolder {
    private static final ThreadLocal<UserDTO> tl = new ThreadLocal<>();

    public static void saveUser(UserDTO user){
        tl.set(user);
    }

    public static UserDTO getUser(){
        return tl.get();
    }

    public static void removeUser(){
        tl.remove();
    }
}
```

<br/>

### 集群Session共享问题

:::warning 💡 核心思路分析

每个 Tomcat 中都有一份属于自己的 Session，假设用户第一次访问第一台 Tomcat，并且把自己的信息存放到第一台服务器的 Session 中，但是第二次这个用户访问到了第二台 Tomcat，那么在第二台服务器上，肯定没有第一台服务器存放的 Session，所以此时 整个登录拦截功能就会出现问题，我们能如何解决这个问题呢？早期的方案是 Session 拷贝，就是说虽然每个 Tomcat 上都有不同的 Session，但是每当任意一台服务器的 Session 修改时，都会同步给其他的 Tomcat 服务器的 Session，这样的话，就可以实现 Session 的共享了。

:::

<br/>

但是这种方案具有两个大问题

- 每台服务器中都有完整的一份 Session 数据，服务器压力过大。
- Session 拷贝数据时，可能会出现延迟

所以咱们后来采用的方案都是基于 Redis来完成，我们把 Session 换成 Redis，Redis数据本身就是共享的，就可以避免 Session 共享的问题了

<br/>

**如图所示**

![image-20240313232608841](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313232608841.png)

<br/>

### 基于Redis实现共享登录

#### Redis代替Session的设计

**设计key的结构**

首先我们要思考一下利用redis来存储数据，那么到底使用哪种结构呢？由于存入的数据比较简单，我们可以考虑使用String，或者是使用哈希，如下图，如果使用String，同学们注意他的value，用多占用一点空间，如果使用哈希，则他的value中只会存储他数据本身，如果不是特别在意内存，其实使用String就可以啦。

<br/>

保存登录的用户信息，可以使用 String 结构，以 JSON 字符串来保存，比较直观：

![image-20240313234003384](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313234003384.png)

<br/>

Hash 结构可以将对象中的每个字段独立存储，可以针对单个字段做 CRUD，并且内存占用更少：

![image-20240313234016421](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313234016421.png)

<br/>

**设计key的具体细节**

所以我们可以使用String结构，就是一个简单的key，value键值对的方式，但是关于key的处理，session他是每个用户都有自己的session，但是redis的key是共享的，咱们就不能使用code了

在设计这个key的时候，我们之前讲过需要满足两点

- key要具有唯一性
- key要方便携带

如果我们采用 Phone：手机号这个的数据来存储当然是可以的，但是如果把这样的敏感数据存储到 Redis 中并且从页面中带过来毕竟不太合适，所以我们在后台生成一个随机串 Token，然后让前端带来这个 Token 就能完成我们的整体逻辑了

<br/>

**整体访问流程**

当注册完成后，用户去登录会去校验用户提交的手机号和验证码，是否一致，如果一致，则根据手机号查询用户信息，不存在则新建，最后将用户数据保存到redis，并且生成token作为redis的key，当我们校验用户是否登录时，会去携带着token进行访问，从redis中取出token对应的value，判断是否存在这个数据，如果没有则拦截，如果存在则将其保存到threadLocal中，并且放行。

![image-20240313233638891](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313233638891.png)



<br/>

#### 基于Redis实现短信登录

这里具体逻辑就不分析了，之前咱们已经重点分析过这个逻辑啦。

**UserServiceImpl代码**

```java {53,54,87-104}
package com.hmdp.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import cn.hutool.core.lang.UUID;
import cn.hutool.core.util.RandomUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hmdp.dto.LoginFormDTO;
import com.hmdp.dto.Result;
import com.hmdp.dto.UserDTO;
import com.hmdp.entity.User;
import com.hmdp.mapper.UserMapper;
import com.hmdp.service.IUserService;
import com.hmdp.utils.RegexUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static com.hmdp.utils.RedisConstants.*;
import static com.hmdp.utils.SystemConstants.USER_NICK_NAME_PREFIX;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author 虎哥
 * @since 2021-12-22
 */
@Slf4j
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Override
    public Result sendCode(String phone, HttpSession session) {
        //  校验手机号
        if (RegexUtils.isPhoneInvalid(phone)) {
            return Result.fail("手机号格式错误！");
        }
        // 符合，生成验证码
        String code = RandomUtil.randomNumbers(6);

        // 保存验证码到 redis
        stringRedisTemplate.opsForValue().set(LOGIN_CODE_KEY + phone, code, LOGIN_CODE_TTL, TimeUnit.MINUTES);
        // 发送验证码
        log.debug("发送短信验证码成功，验证码：{}", code);
        // 返回ok
        return Result.ok();
    }

    @Override
    public Result login(LoginFormDTO loginForm, HttpSession session) {
        // 校验手机号
        String phone = loginForm.getPhone();
        if (RegexUtils.isPhoneInvalid(phone)) {
            // 如果不符合，返回错误信息
            return Result.fail("手机号格式错误！");
        }

        //  从redis中获取验证码并校验
        String cacheCode = stringRedisTemplate.opsForValue().get(LOGIN_CODE_KEY + phone);

        String code = loginForm.getCode();
        if (cacheCode == null || !cacheCode.equals(code)) {
            // 不一致，报错
            return Result.fail("验证码错误");
        }
        // 一致，根据手机号查询用户
        User user = query().eq("phone", phone).one();

        // 判断用户是否存在
        if (user == null) {
            // 不存在，则创建
            user = createUserWithPhone(phone);
        }

        // 保存用户信息到 redis 中
        String token = UUID.randomUUID().toString(true);
        // 将 User 对象转换成 HashMap
        UserDTO userDTO = BeanUtil.copyProperties(user, UserDTO.class);
        Map<String, Object> userMap = BeanUtil.beanToMap(userDTO, new HashMap<>(),
                CopyOptions.create()
                        .setIgnoreNullValue(true)
                        .setFieldValueEditor((fieldName, fieldValue) -> fieldValue.toString()));

        // 存储
        String tokenKey = LOGIN_USER_KEY + token;
        stringRedisTemplate.opsForHash().putAll(tokenKey, userMap);

        // 设置过期时间
        stringRedisTemplate.expire(tokenKey, LOGIN_USER_TTL, TimeUnit.MINUTES);

        // 返回 token
        return Result.ok(token);
    }

    private User createUserWithPhone(String phone) {
        // 创建用户
        User user = new User();
        user.setPhone(phone);
        user.setNickName(USER_NICK_NAME_PREFIX + RandomUtil.randomString(10));
        // 保存用户
        save(user);
        return user;
    }
}
```

<br/>

#### 解决状态登录刷新问题

**初始方案**

在这个方案中，他确实可以使用对应路径的拦截，同时刷新登录token令牌的存活时间，但是现在这个拦截器他只是拦截需要被拦截的路径，<mark>假设当前用户访问了一些不需要拦截的路径，那么这个拦截器就不会生效，所以此时令牌刷新的动作实际上就不会执行，所以这个方案他是存在问题的</mark>

![image-20240313234245813](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313234245813.png)

<br/>

**优化方案**

既然之前的拦截器无法对不需要拦截的路径生效，那么我们可以添加一个拦截器，在第一个拦截器中拦截所有的路径，把第二个拦截器做的事情放入到第一个拦截器中，同时刷新令牌，因为第一个拦截器有了threadLocal的数据，所以此时第二个拦截器只需要判断拦截器中的user对象是否存在即可，完成整体刷新功能。

![image-20240313234308453](https://mugrain.oss-cn-hangzhou.aliyuncs.com/cswiki/image-20240313234308453.png)

<br/>

**具体实现**：RefreshTokenInterceptor

```java
package com.hmdp.interceptor;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.hmdp.dto.UserDTO;
import com.hmdp.utils.UserHolder;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.Map;
import java.util.concurrent.TimeUnit;

import static com.hmdp.utils.RedisConstants.LOGIN_USER_KEY;
import static com.hmdp.utils.RedisConstants.LOGIN_USER_TTL;

public class RefreshTokenInterceptor implements HandlerInterceptor {

    private StringRedisTemplate stringRedisTemplate;

    public RefreshTokenInterceptor(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 获取请求头中的 token，请求头为空则不刷新 token 过期时间
        String token = request.getHeader("authorization");
        if (StrUtil.isBlank(token)) {
            return true;
        }

        // 如果获取 token 的用户为空，则不刷新 token 过期时间
        String key = LOGIN_USER_KEY + token;
        Map<Object, Object> userMap = stringRedisTemplate.opsForHash().entries(key);
        if (userMap.isEmpty()) {
            return true;
        }

        // 将查询到的 hash 数据转换为 UserDTO，保存到 ThreadLocal 并刷新 过期时间
        UserDTO userDTO = BeanUtil.fillBeanWithMap(userMap, new UserDTO(), false);
        UserHolder.saveUser(userDTO);
        stringRedisTemplate.expire(key, LOGIN_USER_TTL, TimeUnit.MINUTES);

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserHolder.removeUser();
    }
}

```

<br/>

**LoginInterceptor**

```java
package com.hmdp.interceptor;

import com.hmdp.utils.UserHolder;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 用户为空则拦截
        if (UserHolder.getUser() == null) {
            response.setStatus(401);
            return false;
        }
        // 用户不为空则放行
        return true;
    }
}
```

<br/>

**WebMvcConfigurer**

```Java
package com.hmdp.config;

import com.hmdp.interceptor.LoginInterceptor;
import com.hmdp.interceptor.RefreshTokenInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginInterceptor())
                .excludePathPatterns(
                        "/shop/**",
                        "/voucher/**",
                        "/shop-type/**",
                        "/upload/**",
                        "/blog/hot",
                        "/user/code",
                        "/user/login"
                ).order(1);

        registry.addInterceptor(new RefreshTokenInterceptor(redisTemplate))
                .addPathPatterns("/**").order(0);
    }
}
```



实现其余功能，验证测试

```java
/**
 * 登出功能
 * @return 无
 */
@PostMapping("/logout")
public Result logout(){
    UserHolder.removeUser();
    return Result.ok();
}

@GetMapping("/me")
public Result me(){
    // 获取当前登录的用户并返回
    UserDTO user = UserHolder.getUser();
    return Result.ok(user);
}
```

