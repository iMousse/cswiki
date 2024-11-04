import{_ as l,c as a,o as n,V as i}from"./chunks/framework.syB9hai_.js";const g=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"src/study/index.md","filePath":"src/study/index.md","lastUpdated":1730648885000}'),s={name:"src/study/index.md"},p=i(`<h3 id="时间管理四象限" tabindex="-1">时间管理四象限 <a class="header-anchor" href="#时间管理四象限" aria-label="Permalink to &quot;时间管理四象限&quot;">​</a></h3><p><strong>🆘 重要紧急</strong>：学习技能的提升，真正的提升自己</p><ul><li>学习方法：好的学习方法事半功倍</li><li><a href="./../summarize/">面试宝典</a>：每天进步一点点，日积月累 <ul><li><a href="./../summarize/java-virtual">Java虚拟机</a>：B站视频 + 知识整理。</li><li><a href="./../summarize/java-netty">网络编程</a>：Netty + Nginx + Linux</li><li><a href="./../summarize/spring">框架篇</a>：Spring B站新视频知识整理</li><li><a href="./../summarize/mysql">数据库</a>：知识整理</li><li><a href="./../summarize/java-concurrent">并发编程</a>： 知识整理</li><li><a href="./../summarize/spring-cloud">微服务</a>：知识整理</li></ul></li><li>项目实战 <ul><li>黑马点评：</li><li><a href="./../project/college/">天机学堂</a>：项目操作，笔记整理和总结。</li><li><a href="./../project/topnews/">黑马头条</a>：笔记功能整理 <ul><li>根据天机学堂的自定义部署，把黑马的虚拟机完善</li><li>谷粒学堂：单体版</li><li>做一个单体版天机学堂</li></ul></li><li>神领物流：</li><li>谷粒商城：</li><li>好客租房：知识整理</li><li>谷粒外卖：单体项目</li><li>谷粒健康：全栈项目 + mongodb实战</li><li>谷粒交友：网络编程实战</li></ul></li></ul><hr><p><strong>💡 重要不紧急</strong>：长期坚持的好习惯</p><ul><li>📑 学习英语：每天阅读英文原文</li><li>💪 强身健体：每周一二四五锻炼</li><li>🎬 电影影评：每周一部电影影评 <ul><li>黑客帝国</li><li>周处除三害</li></ul></li><li>📖 好书阅读：每月一本书籍阅读 <ul><li>长安的荔枝</li><li>置身室内</li><li>马斯克</li></ul></li><li>🎮 游戏鉴赏：每个季度一款游戏 <ul><li>只狼</li><li>艾尔登法环</li><li>死亡搁浅</li><li>狂野大镖客</li></ul></li></ul><hr><p><strong>🔥 不重要紧急</strong></p><ul><li>工作计划：每天记录自己做了啥，明天计划做啥 <ul><li>2月8号：年后主要工作 <ul><li>申购预约的订单做完并要提测试</li><li>T + 0.5 的设计文档和代码开发</li><li>T + 15 最低持有期产品的订单初评和设计文档</li><li>分行额度的处理，订单初评表和设计文档</li></ul></li></ul></li></ul><hr><p>💰 <strong>不重要不紧急</strong>：花钱花时间的不要做，花钱节约时间，提升效率的可以买</p><ul><li>刷抖音：通过每天做重要的时间把不重要的事情挤占掉就能完美解决刷抖音的习惯</li><li>旅游攻略</li></ul><hr><h3 id="学习计划" tabindex="-1">学习计划 <a class="header-anchor" href="#学习计划" aria-label="Permalink to &quot;学习计划&quot;">​</a></h3><p>初级程序员</p><p>基础：</p><ul><li><p>先虚拟机是什么，给一个定义</p></li><li><p>解决什么的问题，给一个功能</p></li><li><p>我应该如何使用，举几个例子</p></li></ul><p>高级程序员</p><p>高级</p><ul><li>能不能继续优化，结合优缺点，引入一个新的解决方案</li></ul><p>练习</p><ul><li>通过对原理的理解，自己动手实现</li></ul><p>面试</p><ul><li>最后在进行总结，给一个总结</li></ul><p>架构师</p><p>原理</p><ul><li>通过现象看本质，查看源码</li></ul><p>实战</p><ul><li>学习后进行应用，需要去实战</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>---</span></span>
<span class="line"><span>title: 大道至简</span></span>
<span class="line"><span>---</span></span>
<span class="line"><span>flowchart LR</span></span>
<span class="line"><span>	load(加载</span></span>
<span class="line"><span>	Loading) </span></span>
<span class="line"><span>  link1(验证</span></span>
<span class="line"><span>	Verification)</span></span>
<span class="line"><span>	link2(准备</span></span>
<span class="line"><span>	Preparation</span></span>
<span class="line"><span>	)</span></span>
<span class="line"><span>	link3(解析</span></span>
<span class="line"><span>	Resolution)</span></span>
<span class="line"><span>	init(初始化</span></span>
<span class="line"><span>	Initialization)</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>	load --&gt; link1</span></span>
<span class="line"><span>	subgraph &quot;链接(Link)&quot;</span></span>
<span class="line"><span>	link1 --&gt; link2</span></span>
<span class="line"><span>	link2 --&gt; link3</span></span>
<span class="line"><span>	end</span></span>
<span class="line"><span>	link3 --&gt; init</span></span></code></pre></div>`,30),e=[p];function t(r,u,o,c,d,h){return n(),a("div",null,e)}const _=l(s,[["render",t]]);export{g as __pageData,_ as default};
