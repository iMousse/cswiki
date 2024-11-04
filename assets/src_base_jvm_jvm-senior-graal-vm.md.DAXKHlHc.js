import{_ as i,c as a,o as t,V as n}from"./chunks/framework.syB9hai_.js";const p="/cswiki/assets/20240209112440775.S2ehwsBy.png",l="/cswiki/assets/20240209112440628.j3zhwA0X.png",h="/cswiki/assets/20240209112440632.Z9QzRDqz.png",k="/cswiki/assets/20240209112440699.M4iTT9Y9.png",e="/cswiki/assets/20240209112440633.IpEgm2IT.png",r="/cswiki/assets/20240209112440950.Q2AfxA5M.png",g="/cswiki/assets/20240209112440805.X1yfbDb-.png",E="/cswiki/assets/20240209112440948.vyOb3gkR.png",d="/cswiki/assets/20240209112441190.W33zj773.png",o="/cswiki/assets/20240209112440899.uaIKSBE0.png",c="/cswiki/assets/20240209112440966.3SbfbplP.png",y="/cswiki/assets/20240209112441217.F012SXi0.png",m="/cswiki/assets/20240209112441156.FpVrUw62.png",_="/cswiki/assets/20240209112441141.RVQL4e2v.png",u="/cswiki/assets/20240209112441330.LE-xAOG7.png",D="/cswiki/assets/20240209112441131.twBaB_sv.png",A="/cswiki/assets/20240209112441209.dxDsj2ri.png",F="/cswiki/assets/20240209112441288.GjR655Bq.png",v="/cswiki/assets/20240209112441299.gpWxYe60.png",b="/cswiki/assets/20240209112441364.ofGodo5E.png",w="/cswiki/assets/20240209112441365.GJukuSy3.png",f="/cswiki/assets/20240209112441429.Vr6EH1sx.png",M="/cswiki/assets/20240209112441370.s-S9htSE.png",s="/cswiki/assets/20240209112441521.J0xPPmLS.png",z="/cswiki/assets/20240209112441545.w7k5EZM3.png",C="/cswiki/assets/20240209112441730.JYfF3Bt_.png",G="/cswiki/assets/20240209112441567.EOy0pP17.png",V="/cswiki/assets/20240209112441549.WRGQ-D-p.png",S="/cswiki/assets/20240209112441640.nby2-CD8.png",P="/cswiki/assets/20240209112441685.ebG3Pvz3.png",B="/cswiki/assets/20240209112441744.w8D8XUIQ.png",J="/cswiki/assets/20240209112441716.MH-_JGYU.png",U="/cswiki/assets/20240209112441747.j2SUBP6o.png",O="/cswiki/assets/20240209112441876.-fZz9ltr.png",T="/cswiki/assets/20240209112441900.odQZNJi7.png",x="/cswiki/assets/20240209112441796.TSw3LF_F.png",I="/cswiki/assets/20240209112441924.Z-civzaJ.png",R="/cswiki/assets/20240209112441963.K8piRBrQ.png",q="/cswiki/assets/20240209112441968.sctZ06Vk.png",j="/cswiki/assets/20240209112442053.GWD_I9Vi.png",X="/cswiki/assets/20240209112442026.kgeOiAac.png",L="/cswiki/assets/20240209112442095.Upz5eUUt.png",N="/cswiki/assets/20240209112442150.Wzxx7nLv.png",W="/cswiki/assets/20240209112442174.n1zVShkk.png",K="/cswiki/assets/20240209112442223.dX7Xnvvc.png",Y="/cswiki/assets/20240209112442144.ysHFbP4j.png",Q="/cswiki/assets/20240209112442252.hkS0s0-3.png",Z="/cswiki/assets/20240209112442234._HAh3tRf.png",H="/cswiki/assets/20240209112442342.QMcjYgvD.png",rs=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"src/base/jvm/jvm-senior-graal-vm.md","filePath":"src/base/jvm/jvm-senior-graal-vm.md","lastUpdated":1730648753000}'),$={name:"src/base/jvm/jvm-senior-graal-vm.md"},ss=n('<nav class="table-of-contents"><ul><li><a href="#graalvm">GraalVM</a><ul><li><a href="#什么是graalvm">什么是GraalVM</a></li><li><a href="#graalvm的两种模式">GraalVM的两种模式</a></li><li><a href="#应用场景">应用场景</a><ul><li><a href="#springboot搭建graalvm应用">SpringBoot搭建GraalVM应用</a></li><li><a href="#函数计算">函数计算</a></li><li><a href="#serverless应用">Serverless应用</a></li></ul></li><li><a href="#参数优化和故障诊断">参数优化和故障诊断</a><ul><li><a href="#实战案例4-内存快照文件的获取">实战案例4：内存快照文件的获取</a></li><li><a href="#实战案例5-运行时数据的获取">实战案例5：运行时数据的获取</a></li></ul></li></ul></li></ul></nav><h2 id="graalvm" tabindex="-1">GraalVM <a class="header-anchor" href="#graalvm" aria-label="Permalink to &quot;GraalVM&quot;">​</a></h2><h3 id="什么是graalvm" tabindex="-1">什么是GraalVM <a class="header-anchor" href="#什么是graalvm" aria-label="Permalink to &quot;什么是GraalVM&quot;">​</a></h3><p>GraalVM是Oracle官方推出的一款高性能JDK，使用它享受比OpenJDK或者OracleJDK更好的性能。 GraalVM的官方网址：<a href="https://www.graalvm.org/" target="_blank" rel="noreferrer">https://www.graalvm.org/</a> 官方标语：Build faster, smaller, leaner applications。 更低的CPU、内存使用率</p><p><img src="'+p+'" alt="img" loading="lazy"></p><p><img src="'+l+'" alt="img" loading="lazy"></p><p>官方标语：Build faster, smaller, leaner applications。</p><ul><li>更低的CPU、内存使用率</li><li>更快的启动速度，无需预热即可获得最好的性能</li><li>更好的安全性、更小的可执行文件</li><li>支持多种框架Spring Boot、Micronaut、Helidon 和 Quarkus。</li><li>多家云平台支持。</li><li>通过Truffle框架运行JS、Python、Ruby等其他语言。</li></ul><p>GraalVM分为社区版（Community Edition）和企业版（Enterprise Edition）。企业版相比较社区版，在性能上有更多的优化。</p><table><thead><tr><th>特性</th><th>描述</th><th>社区版</th><th>企业版</th></tr></thead><tbody><tr><td>收费</td><td>是否收费</td><td>免费</td><td>收费</td></tr><tr><td>G1<strong>垃圾回收器</strong></td><td>使用<strong>G1垃圾回收器优化垃圾回收性能</strong></td><td>×</td><td>√</td></tr><tr><td>Profile Guided<strong>Optimization（PGO）</strong></td><td>运行过程中收集动态数据，进一步优化本地镜像的性能</td><td>×</td><td>√</td></tr><tr><td>高级优化特性</td><td>更多优化技术，降低内存和垃圾回收的开销</td><td>×</td><td>√</td></tr><tr><td>高级优化参数</td><td>更多的高级优化参数可以设置</td><td>×</td><td>√</td></tr></tbody></table><p>需求： 搭建Linux下的GraalVM社区版本环境。 步骤： 1、使用arch查看Linux架构</p><p><img src="'+h+'" alt="img" loading="lazy"></p><p>2、根据架构下载社区版的GraalVM：<a href="https://www.graalvm.org/downloads/" target="_blank" rel="noreferrer">https://www.graalvm.org/downloads/</a></p><p><img src="'+k+'" alt="img" loading="lazy"></p><p>3、安装GraalVM，安装方式与安装JDK相同 解压文件：</p><p><img src="'+e+'" alt="img" loading="lazy"></p><p>设置环境变量:</p><p><img src="'+r+'" alt="img" loading="lazy"></p><p>4、使用java -version和HelloWorld测试GraalVM。</p><p><img src="'+g+'" alt="img" loading="lazy"></p><h3 id="graalvm的两种模式" tabindex="-1">GraalVM的两种模式 <a class="header-anchor" href="#graalvm的两种模式" aria-label="Permalink to &quot;GraalVM的两种模式&quot;">​</a></h3><ul><li>JIT（ Just-In-Time ）模式 ，即时编译模式</li><li>AOT（Ahead-Of-Time）模式 ，提前编译模式</li></ul><p>JIT模式的处理方式与Oracle JDK类似，满足两个特点：</p><p>Write Once,Run Anywhere -&gt; 一次编写，到处运行。</p><p>预热之后，通过内置的Graal即时编译器优化热点代码，生成比Hotspot JIT更高性能的机器码。</p><p><img src="'+E+'" alt="img" loading="lazy"></p><p>需求：</p><p>分别在JDK8 、 JDK21 、 GraalVM 21 Graal即时编译器、GraalVM 21 不开启Graal即时编译器运行Jmh性能测试用例，对比其性能。</p><p>步骤：</p><p>1、在代码文件夹中找到GraalVM的案例代码，将java-simple-stream-benchmark文件夹下的代码使用maven打包成jar包。</p><p><img src="'+d+'" alt="img" loading="lazy"></p><p><img src="'+o+'" alt="img" loading="lazy"></p><p>2、将jar包上传到服务器，使用不同的JDK进行测试，对比结果。</p><p>注意：</p><p>-XX:-UseJVMCICompiler参数可以关闭GraalVM中的Graal编译器。</p><p><img src="'+c+'" alt="img" loading="lazy"></p><p>GraalVM开启Graal编译器下的性能还是不错的：</p><p><img src="'+y+'" alt="img" loading="lazy"></p><p>AOT（Ahead-Of-Time）模式 ，提前编译模式</p><p>AOT 编译器通过源代码，为特定平台创建可执行文件。比如，在Windows下编译完成之后，会生成exe文件。通过这种方式，达到启动之后获得最高性能的目的。但是不具备跨平台特性，不同平台使用需要单独编译。</p><p>这种模式生成的文件称之为Native Image本地镜像。</p><p><img src="'+m+'" alt="img" loading="lazy"></p><p>需求： 使用GraalVM AOT模式制作本地镜像并运行。 步骤： 1、安装Linux环境本地镜像制作需要的依赖库： <a href="https://www.graalvm.org/latest/reference-manual/native-image/#prerequisites" target="_blank" rel="noreferrer">https://www.graalvm.org/latest/reference-manual/native-image/#prerequisites</a> 2、使用 native-image 类名 制作本地镜像。</p><p><img src="'+_+'" alt="img" loading="lazy"></p><p>3、运行本地镜像可执行文件。</p><p><img src="'+u+'" alt="img" loading="lazy"></p><p>社区版的GraalVM使用本地镜像模式性能不如Hotspot JVM的JIT模式，但是企业版的性能相对会高很多。</p><p><img src="'+D+'" alt="img" loading="lazy"></p><h3 id="应用场景" tabindex="-1">应用场景 <a class="header-anchor" href="#应用场景" aria-label="Permalink to &quot;应用场景&quot;">​</a></h3><p>GraalVM的AOT模式虽然在启动速度、内存和CPU开销上非常有优势，但是使用这种技术会带来几个问题：</p><p>1、跨平台问题，在不同平台下运行需要编译多次。编译平台的依赖库等环境要与运行平台保持一致。</p><p>2、使用框架之后，编译本地镜像的时间比较长，同时也需要消耗大量的CPU和内存。</p><p>3、AOT 编译器在编译时，需要知道运行时所有可访问的所有类。但是Java中有一些技术可以在运行时创建类，例如反射、动态代理等。这些技术在很多框架比如Spring中大量使用，所以框架需要对AOT编译器进行适配解决类似的问题。</p><p>解决方案：</p><p>1、使用公有云的Docker等容器化平台进行在线编译，确保编译环境和运行环境是一致的，同时解决了编译资源问题。</p><p>2、使用SpringBoot3等整合了GraalVM AOT模式的框架版本。</p><h4 id="springboot搭建graalvm应用" tabindex="-1">SpringBoot搭建GraalVM应用 <a class="header-anchor" href="#springboot搭建graalvm应用" aria-label="Permalink to &quot;SpringBoot搭建GraalVM应用&quot;">​</a></h4><p>需求： SpringBoot3对GraalVM进行了完整的适配，所以编写GraalVM服务推荐使用SpringBoot3。 步骤： 1、使用 <a href="https://start.spring.io/" target="_blank" rel="noreferrer">https://start.spring.io/</a> spring提供的在线生成器构建项目。</p><p><img src="'+A+`" alt="img" loading="lazy"></p><p>2、编写业务代码，修改原代码将<code>PostConstructor</code>注解去掉：</p><div class="language-Java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">Java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Service</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UserServiceImpl</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> implements</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UserService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">InitializingBean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> List&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">User</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; users </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArrayList&lt;&gt;();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Autowired</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UserDao userDao;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> List&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">UserDetails</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getUserDetails</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userDao.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">findUsers</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> List&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">User</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getUsers</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> users;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> afterPropertiesSet</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Exception {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        //初始化时生成数据</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            users.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> User</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">long</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) i, RandomStringUtils.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">randomAlphabetic</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>3、执行 mvn -Pnative clean native:compile 命令生成本地镜像。</p><p><img src="`+F+'" alt="img" loading="lazy"></p><p><img src="'+v+'" alt="img" loading="lazy"></p><p>4、运行本地镜像。</p><p><img src="'+b+'" alt="img" loading="lazy"></p><p>什么场景下需要使用GraalVM呢？</p><p>1、对性能要求比较高的场景，可以选择使用收费的企业版提升性能。</p><p>2、公有云的部分服务是按照CPU和内存使用量进行计费的，使用GraalVM可以有效地降低费用。</p><p><img src="'+w+'" alt="img" loading="lazy"></p><h4 id="函数计算" tabindex="-1">函数计算 <a class="header-anchor" href="#函数计算" aria-label="Permalink to &quot;函数计算&quot;">​</a></h4><p>传统的系统架构中，服务器等基础设施的运维、安全、高可用等工作都需要企业自行完成，存在两个主要问题：</p><p>1、开销大，包括了人力的开销、机房建设的开销。</p><p>2、资源浪费，面对一些突发的流量冲击，比如秒杀等活动，必须提前规划好容量准备好大量的服务器，这些服务器在其他时候会处于闲置的状态，造成大量的浪费。</p><p><img src="'+f+'" alt="img" loading="lazy"></p><p>随着虚拟化技术、云原生技术的愈发成熟，云服务商提供了一套称为Serverless无服务器化的架构。企业无需进行服务器的任何配置和部署，完全由云服务商提供。比较典型的有亚马逊AWS、阿里云等。</p><p><img src="'+M+'" alt="img" loading="lazy"></p><p>Serverless架构中第一种常见的服务是函数计算（Function as a Service），将一个应用拆分成多个函数，每个函数会以事件驱动的方式触发。典型代表有AWS的Lambda、阿里云的FC。</p><p><img src="'+s+'" alt="img" loading="lazy"></p><p>函数计算主要应用场景有如下几种：</p><p>小程序、API服务中的接口，此类接口的调用频率不高，使用常规的服务器架构容易产生资源浪费，使用Serverless就可以实现按需付费降低成本，同时支持自动伸缩能应对流量的突发情况。</p><p>大规模任务的处理，比如音视频文件转码、审核等，可以利用事件机制当文件上传之后，自动触发对应的任务。</p><p>函数计算的计费标准中包含CPU和内存使用量，所以使用GraalVM AOT模式编译出来的本地镜像可以节省更多的成本。</p><p><img src="'+z+`" alt="img" loading="lazy"></p><p>步骤：</p><p>1、在项目中编写Dockerfile文件。</p><div class="language-Java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">Java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"># Using Oracle GraalVM </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> JDK </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">17</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">FROM container</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">registry.oracle.com</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">graalvm</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/native-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">image</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">17</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ol8 AS builder</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"># Set the working directory to </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">home</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">app</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">WORKDIR </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">build</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"># Copy the source code into the image </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> building</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">COPY . </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">build</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">RUN chmod </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">777</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mvnw</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"># Build</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">RUN .</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mvnw </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">--</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">no</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">transfer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">progress </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">native:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">compile </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Pnative</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"># The deployment Image</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">FROM container</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">registry.oracle.com</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">os</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">oraclelinux</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">slim</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">EXPOSE </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8080</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"># Copy the </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">native</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> executable into the containers</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">COPY </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">--</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">from</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">builder </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">build</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">target</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">spring</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">boot</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-native-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">demo app</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ENTRYPOINT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/app&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span></code></pre></div><p>2、使用服务器制作镜像，这一步会消耗大量的CPU和内存资源，同时GraalVM相关的镜像服务器在国外，建议使用阿里云的镜像服务器制作Docker镜像。</p><p><img src="`+s+'" alt="img" loading="lazy"></p><p>3、使用函数计算将Docker镜像转换成函数服务。</p><p><img src="'+C+'" alt="img" loading="lazy"></p><p><img src="'+G+'" alt="img" loading="lazy"></p><p>配置触发器：</p><p><img src="'+V+'" alt="img" loading="lazy"></p><p>4、绑定域名并进行测试。</p><p><img src="'+S+'" alt="img" loading="lazy"></p><p>需要准备一个自己的域名：</p><p><img src="'+P+'" alt="img" loading="lazy"></p><p>配置接口路径：</p><p><img src="'+B+'" alt="img" loading="lazy"></p><p>会出现一个错误：</p><p><img src="'+J+'" alt="img" loading="lazy"></p><p>把域名导向阿里云的域名：</p><p><img src="'+U+'" alt="img" loading="lazy"></p><p>测试成功：</p><p><img src="'+O+'" alt="img" loading="lazy"></p><h4 id="serverless应用" tabindex="-1">Serverless应用 <a class="header-anchor" href="#serverless应用" aria-label="Permalink to &quot;Serverless应用&quot;">​</a></h4><p>函数计算的服务资源比较受限，比如AWS的Lambda服务一般无法支持超过15分钟的函数执行，所以云服务商提供了另外一套方案：基于容器的Serverless应用，无需手动配置K8s中的Pod、Service等内容，只需选择镜像就可自动生成应用服务。</p><p>同样，Serverless应用的计费标准中包含CPU和内存使用量，所以使用GraalVM AOT模式编译出来的本地镜像可以节省更多的成本。</p><table><thead><tr><th>服务分类</th><th>交付模式</th><th>弹性效率</th><th>计费模式</th></tr></thead><tbody><tr><td>函数计算</td><td>函数</td><td>毫秒级</td><td>调用次数<strong>CPU内存使用量</strong></td></tr><tr><td>Serverless<strong>应用</strong></td><td>镜像容器</td><td>秒级</td><td>CPU<strong>内存使用量</strong></td></tr></tbody></table><p>步骤：</p><p>1、在项目中编写Dockerfile文件。</p><p>2、使用服务器制作镜像，这一步会消耗大量的CPU和内存资源，同时GraalVM相关的镜像服务器在国外，建议使用阿里云的镜像服务器制作Docker镜像。</p><p>前两步同实战案例2</p><p>3、配置Serverless应用，选择容器镜像、CPU和内存。</p><p><img src="'+T+'" alt="img" loading="lazy"></p><p>4、绑定外网负载均衡并使用Postman进行测试。</p><p><img src="'+x+'" alt="img" loading="lazy"></p><p>先别急着点确定，需要先创建弹性公网IP:</p><p><img src="https://lisxpq12rl7.feishu.cn/space/api/box/stream/download/asynccode/?code=YjI4MzZmYmRlMWRmNzJlMjBlMmY3NDRhZDZlMDNmYTVfak56NjU5NFl6MEVoaGhUeVJrSWo2V24xMFlrcDY5UnFfVG9rZW46V2Q3MWJKOE5ub1B0aER4bFE4RWNwZ3F6bkhkXzE3MDc0NDkwNzk6MTcwNzQ1MjY3OV9WNA" alt="img" loading="lazy"></p><p>全选默认，然后创建：</p><p><img src="'+I+'" alt="img" loading="lazy"></p><p>创建SLB负载均衡：</p><p><img src="'+R+'" alt="img" loading="lazy"></p><p>这次就可以成功创建了：</p><p><img src="'+q+'" alt="img" loading="lazy"></p><p>绑定刚才创建的SLB负载均衡：</p><p><img src="'+j+'" alt="img" loading="lazy"></p><p><img src="'+X+'" alt="img" loading="lazy"></p><p>访问公网IP就能处理请求了：</p><p><img src="'+L+'" alt="img" loading="lazy"></p><h3 id="参数优化和故障诊断" tabindex="-1">参数优化和故障诊断 <a class="header-anchor" href="#参数优化和故障诊断" aria-label="Permalink to &quot;参数优化和故障诊断&quot;">​</a></h3><p>由于GraalVM是一款独立的JDK，所以大部分HotSpot中的虚拟机参数都不适用。常用的参数参考：官方手册。</p><ul><li>社区版只能使用串行垃圾回收器（Serial GC），使用串行垃圾回收器的默认最大 Java 堆大小会设置为物理内存大小的 80%，调整方式为使用 -Xmx最大堆大小。如果希望在编译期就指定该大小，可以在编译时添加参数-R:MaxHeapSize=最大堆大小。</li><li>G1垃圾回收器只能在企业版中使用，开启方式为添加--gc=G1参数，有效降低垃圾回收的延迟。</li><li>另外提供一个Epsilon GC，开启方式：--gc=epsilon ，它不会产生任何的垃圾回收行为所以没有额外的内存、CPU开销。如果在公有云上运行的程序生命周期短暂不产生大量的对象，可以使用该垃圾回收器，以节省最大的资源。</li></ul><p>-XX:+PrintGC -XX:+VerboseGC 参数打印垃圾回收详细信息。</p><p>添加虚拟机参数：</p><p><img src="'+N+'" alt="img" loading="lazy"></p><p>打印出了垃圾回收的信息：</p><p><img src="'+W+`" alt="img" loading="lazy"></p><h4 id="实战案例4-内存快照文件的获取" tabindex="-1">实战案例4：内存快照文件的获取 <a class="header-anchor" href="#实战案例4-内存快照文件的获取" aria-label="Permalink to &quot;实战案例4：内存快照文件的获取&quot;">​</a></h4><p><strong>需求：</strong></p><p>获得运行中的内存快照文件，使用MAT进行分析。</p><p><strong>步骤：</strong></p><p>1、编译程序时，添加 --enable-monitoring=heapdump，参数添加到pom文件的对应插件中。</p><div class="language-XML vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">XML</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">plugin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">groupId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;org.graalvm.buildtools&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">groupId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">artifactId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;native-maven-plugin&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">artifactId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">configuration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">buildArgs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">arg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;--enable-monitoring=heapdump,jfr&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">arg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">buildArgs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">configuration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">plugin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>2、运行中使用 kill -SIGUSR1 进程ID 命令，创建内存快照文件。</p><p><img src="`+K+'" alt="img" loading="lazy"></p><p>3、使用MAT分析内存快照文件。</p><p><img src="'+Y+`" alt="img" loading="lazy"></p><h4 id="实战案例5-运行时数据的获取" tabindex="-1">实战案例5：运行时数据的获取 <a class="header-anchor" href="#实战案例5-运行时数据的获取" aria-label="Permalink to &quot;实战案例5：运行时数据的获取&quot;">​</a></h4><p>JDK Flight Recorder (JFR) 是一个内置于 JVM 中的工具，可以收集正在运行中的 Java 应用程序的诊断和分析数据，比如线程、异常等内容。GraalVM本地镜像也支持使用JFR生成运行时数据，导出的数据可以使用VisualVM分析。</p><p>步骤：</p><p>1、编译程序时，添加 --enable-monitoring=jfr，参数添加到pom文件的对应插件中。</p><div class="language-XML vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">XML</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">plugin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">groupId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;org.graalvm.buildtools&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">groupId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">artifactId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;native-maven-plugin&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">artifactId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">configuration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">buildArgs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">arg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;--enable-monitoring=heapdump,jfr&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">arg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">buildArgs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">configuration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">plugin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>2、运行程序，添加 -XX:StartFlightRecording=filename=recording.jfr,duration=10s参数。</p><p><img src="`+Q+'" alt="img" loading="lazy"></p><p>3、使用VisualVM分析JFR记录文件。</p><p><img src="'+Z+'" alt="img" loading="lazy"></p><p><img src="'+H+'" alt="img" loading="lazy"></p>',159),is=[ss];function as(ts,ns,ps,ls,hs,ks){return t(),a("div",null,is)}const gs=i($,[["render",as]]);export{rs as __pageData,gs as default};
