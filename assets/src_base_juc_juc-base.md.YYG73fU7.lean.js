import{_ as c}from"./chunks/image-16953998571144.rXBgCuLs.js";import{_ as o,E,c as u,J as n,w as a,m as s,a as i,b as p,a4 as e,V as l,o as k,e as A}from"./chunks/framework.syB9hai_.js";const C="/cswiki/assets/image-20221026105350827.eXCouLgy.png",D="/cswiki/assets/image-20221026105442158.ilC8SoiC.png",B="/cswiki/assets/image-20230503203246348.BfyR0DS1.png",b="/cswiki/assets/image-20221026105607248.nh3h15U1.png",v="/cswiki/assets/image-20230503203330700.KYZSNsgo.png",m="/cswiki/assets/image-20230929133655975.9I3_HdcE.png",T="/cswiki/assets/image-20230929133746403.WQSBwWP8.png",q="/cswiki/assets/image-16953998571143.TwIEn4X_.png",Ns=JSON.parse('{"title":"线程基础","description":"","frontmatter":{},"headers":[],"relativePath":"src/base/juc/juc-base.md","filePath":"src/base/juc/juc-base.md","lastUpdated":1730648753000}'),_={name:"src/base/juc/juc-base.md"},f=s("h1",{id:"线程基础",tabindex:"-1"},[i("线程基础 "),s("a",{class:"header-anchor",href:"#线程基础","aria-label":'Permalink to "线程基础"'},"​")],-1),j=s("p",null,[s("a",{href:"./"},"返回首页")],-1),S={class:"table-of-contents"},w=s("a",{href:"#线程基础"},"线程基础",-1),I=s("a",{href:"#基础概念"},"基础概念",-1),x=s("li",null,[s("a",{href:"#线程和进程"},"线程和进程")],-1),P=s("li",null,[s("a",{href:"#并发与并行"},"并发与并行")],-1),R={href:"#应用之异步调用"},M=s("a",{href:"#如何使用线程"},"如何使用线程",-1),N=l("",3),O={href:"#原理之线程运行"},L=s("ul",null,[s("li",null,[s("a",{href:"#栈与栈帧"},"栈与栈帧")]),s("li",null,[s("a",{href:"#线程上下文切换"},"线程上下文切换")])],-1),U=s("a",{href:"#基础线程方法"},"基础线程方法",-1),V=s("a",{href:"#sleep-yield"},"sleep & yield",-1),J={href:"#应用之限制"},W=s("a",{href:"#join方法详解"},"join方法详解",-1),z={href:"#应用之同步"},H=s("li",null,[s("a",{href:"#等待多个结果"},"等待多个结果")],-1),G=s("li",null,[s("a",{href:"#有实效的join"},"有实效的Join")],-1),Y={href:"#应用之统筹"},$=s("a",{href:"#interrupt方法详解"},"interrupt方法详解",-1),X=s("li",null,[s("a",{href:"#interrupt说明"},"Interrupt说明")],-1),K=s("li",null,[s("a",{href:"#打断等待的线程"},"打断等待的线程")],-1),Q=s("li",null,[s("a",{href:"#打断正常运行的线程"},"打断正常运行的线程")],-1),Z={href:"#模式之两阶段终止"},ss=s("li",null,[s("a",{href:"#打断park线程"},"打断park线程")],-1),is=s("li",null,[s("a",{href:"#不推荐的方法"},"不推荐的方法")],-1),as=s("li",null,[s("a",{href:"#主线程与守护线程"},"主线程与守护线程")],-1),ns=s("li",null,[s("a",{href:"#线程之间状态"},"线程之间状态"),s("ul",null,[s("li",null,[s("a",{href:"#五种状态"},"五种状态")]),s("li",null,[s("a",{href:"#六种状态"},"六种状态")])])],-1),hs=l("",35),ls={id:"应用之异步调用",tabindex:"-1"},ks=s("a",{class:"header-anchor",href:"#应用之异步调用","aria-label":`Permalink to "<font color='green'>*应用之异步调用</font>"`},"​",-1),ps=l("",92),ts={id:"原理之线程运行",tabindex:"-1"},es=s("a",{class:"header-anchor",href:"#原理之线程运行","aria-label":`Permalink to "<font color='blue'>* 原理之线程运行</font>"`},"​",-1),Es=l("",39),rs={id:"应用之限制",tabindex:"-1"},ds=s("a",{class:"header-anchor",href:"#应用之限制","aria-label":'Permalink to "<font color="green">*应用之限制</font>"'},"​",-1),gs=l("",14),ys={id:"应用之同步",tabindex:"-1"},Fs=s("a",{class:"header-anchor",href:"#应用之同步","aria-label":'Permalink to "<font color="green"> *应用之同步</font>"'},"​",-1),cs=l("",7),os=l("",9),us=l("",11),As={id:"应用之统筹",tabindex:"-1"},Cs=s("a",{class:"header-anchor",href:"#应用之统筹","aria-label":'Permalink to "<font color="green">*应用之统筹</font>"'},"​",-1),Ds=l("",10),Bs=s("p",null,"从这个图上可以一眼看出，办法甲总共要16分钟（而办法乙、丙需要20分钟）。如果要缩短工时、提高工作效率，应当主要抓烧开水这个环节，而不是抓拿茶叶等环节。同时，洗茶壶茶杯、拿茶叶总共不过4分钟，大可利用“等水开”的时间来做。",-1),bs=s("p",null,"是的，这好像是废话，卑之无甚高论。有如走路要用两条腿走，吃饭要一口一口吃，这些道理谁都懂得。但稍有变化，临事而迷的情况，常常是存在的。在近代工业的错综复杂的工艺过程中，往往就不是像泡茶喝这么简单了。任务多了，几百几千，甚至有好几万个任务。关系多了，错综复杂，千头万绪，往往出现“万事俱备，只欠东风”的情况。由于一两个零件没完成，耽误了一台复杂机器的出厂时间。或往往因为抓的不是关键，连夜三班，急急忙忙，完成这一环节之后，还得等待旁的环节才能装配。",-1),vs=s("p",null,"洗茶壶，洗茶杯，拿茶叶，或先或后，关系不大，而且同是一个人的活儿，因而可以合并成为：",-1),ms=l("",29),Ts={id:"模式之两阶段终止",tabindex:"-1"},qs=s("a",{class:"header-anchor",href:"#模式之两阶段终止","aria-label":'Permalink to "<font color="orange">*模式之两阶段终止</font>"'},"​",-1),_s=l("",7),fs=l("",59);function js(r,Ss,ws,Is,xs,Ps){const y=E("ArticleMetadata"),F=E("ClientOnly"),h=E("font"),t=E("Mermaid");return k(),u("div",null,[f,n(F,null,{default:a(()=>{var d,g;return[(((d=r.$frontmatter)==null?void 0:d.aside)??!0)&&(((g=r.$frontmatter)==null?void 0:g.showArticleMetadata)??!0)?(k(),p(y,{key:0,article:r.$frontmatter},null,8,["article"])):A("",!0)]}),_:1}),j,s("nav",S,[s("ul",null,[s("li",null,[w,s("ul",null,[s("li",null,[I,s("ul",null,[x,P,s("li",null,[s("a",R,[n(h,{color:"green"},{default:a(()=>[i("*应用之异步调用")]),_:1})])])])]),s("li",null,[M,s("ul",null,[N,s("li",null,[s("a",O,[n(h,{color:"blue"},{default:a(()=>[i("* 原理之线程运行")]),_:1})]),L])])]),s("li",null,[U,s("ul",null,[s("li",null,[V,s("ul",null,[s("li",null,[s("a",J,[n(h,{color:"green"},{default:a(()=>[i("*应用之限制")]),_:1})])])])]),s("li",null,[W,s("ul",null,[s("li",null,[s("a",z,[n(h,{color:"green"},{default:a(()=>[i(" *应用之同步")]),_:1})])]),H,G,s("li",null,[s("a",Y,[n(h,{color:"green"},{default:a(()=>[i("*应用之统筹")]),_:1})])])])]),s("li",null,[$,s("ul",null,[X,K,Q,s("li",null,[s("a",Z,[n(h,{color:"orange"},{default:a(()=>[i("*模式之两阶段终止")]),_:1})])]),ss,is])]),as])]),ns])])])]),hs,s("h3",ls,[n(h,{color:"green"},{default:a(()=>[i("*应用之异步调用")]),_:1}),i(),ks]),ps,s("h3",ts,[n(h,{color:"blue"},{default:a(()=>[i("* 原理之线程运行")]),_:1}),i(),es]),Es,s("h4",rs,[n(h,{color:"green"},{default:a(()=>[i("*应用之限制")]),_:1}),i(),ds]),gs,s("h4",ys,[n(h,{color:"green"},{default:a(()=>[i(" *应用之同步")]),_:1}),i(),Fs]),cs,(k(),p(e,null,{default:a(()=>[n(t,{id:"mermaid-940",class:"mermaid",graph:"graph%20TD%3B%0A%09id1(r%3D10)%0A%09id2(main)%0A%09id3(t1.join)%0A%20%20id4(t1.start)%0A%09id2%20--%3E%20id3%0A%20%20id2%20--%3E%20id4%0A%20%20id4%20--%3E%7C1s%E5%90%8E%7Cid1%0A%20%20id1%20--%3E%7Ct1%E7%BB%88%E6%AD%A2%7C%20id3%0A"})]),fallback:a(()=>[i(" Loading... ")]),_:1})),os,(k(),p(e,null,{default:a(()=>[n(t,{id:"mermaid-971",class:"mermaid",graph:"graph%20TD%3B%0A%09t0(main)%0A%09t1(t1.start)%0A%09t2(r%3D10)%0A%09t3(t1.join)%0A%09t4(t2.join%20-%20%E4%BB%85%E9%9C%80%E8%A6%81%E7%AD%891s)%0A%09t5(t2.start)%0A%09t6(r%3D20)%0A%09s0(main)%0A%09s1(t1.start)%0A%09s2(t2.start)%0A%09s3(r%3D10)%0A%09s4(t2.join)%0A%09s5(t1.join%20-%20%E6%97%A0%E9%9C%80%E7%AD%89%E5%BE%85)%0A%09s6(r%3D20)%0A%09%0A%09t0%20--%3E%20t1%0A%09t0%20--%3E%20t3%0A%09t2%20--%3E%20t3%0A%20%20t1%20--%3E%7C1s%E5%90%8E%7C%20t2%0A%20%20t3%20--%3E%20t4%0A%20%20t0%20--%3E%20t5%0A%20%20t5%20--%3E%7C2s%E5%90%8E%7Ct6%0A%20%20t6%20--%3E%7Ct2%E7%BB%88%E6%AD%A2%7C%20t4%0A%20%20%0A%20%20%0A%20%20s0%20--%3E%20s1%0A%20%20s1%20--%3E%20%7C1s%20%E5%90%8E%7Cs3%0A%20%20s3%20--%3E%20%7Ct1%20%E7%BB%88%E6%AD%A2%7Cs5%0A%20%20s0%20--%3E%20s4%0A%20%20s4%20--%3E%20s5%0A%20%20s0%20--%3E%20s2%0A%20%20s2%20--%3E%20%7C2s%20%E5%90%8E%7Cs6%0A%20%20s6%20--%3E%20%7Ct2%E7%BB%88%E6%AD%A2%7Cs4%0A"})]),fallback:a(()=>[i(" Loading... ")]),_:1})),us,s("h4",As,[n(h,{color:"green"},{default:a(()=>[i("*应用之统筹")]),_:1}),i(),Cs]),Ds,(k(),p(e,null,{default:a(()=>[n(t,{id:"mermaid-1061",class:"mermaid",graph:"graph%20LR%3B%0A%09id1(%E6%B4%97%E6%B0%B4%E5%A3%B6%201%E5%88%86%E9%92%9F)%0A%09id2(%E7%83%A7%E5%BC%80%E6%B0%B4%2015%E5%88%86%E9%92%9F)%0A%09id3(%E6%B4%97%E8%8C%B6%E5%A3%B6%201%E5%88%86%E9%92%9F)%0A%09id4(%E6%B4%97%E8%8C%B6%E6%9D%AF%202%E5%88%86%E9%92%9F)%0A%09id5(%E6%8B%BF%E8%8C%B6%E5%8F%B6%201%E5%88%86%E9%92%9F)%0A%09id6(%E6%B3%A1%E8%8C%B6)%0A%0A%09id1%20--%3E%20id2%0A%09id2%20--%3E%20id6%0A%09id3%20--%3E%20id6%0A%09id4%20--%3E%20id6%0A%09id5%20--%3E%20id6%0A"})]),fallback:a(()=>[i(" Loading... ")]),_:1})),Bs,bs,vs,(k(),p(e,null,{default:a(()=>[n(t,{id:"mermaid-1071",class:"mermaid",graph:"graph%20LR%3B%0A%09id1(%E6%B4%97%E6%B0%B4%E5%A3%B6%201%E5%88%86%E9%92%9F)%0A%09id2(%E7%83%A7%E5%BC%80%E6%B0%B4%2015%E5%88%86%E9%92%9F)%0A%09id3(%E6%B4%97%E8%8C%B6%E5%A3%B6%2C%E6%B4%97%E8%8C%B6%E6%9D%AF%2C%E6%8B%BF%E8%8C%B6%E5%8F%B6%204%E5%88%86%E9%92%9F)%0A%09id6(%E6%B3%A1%E8%8C%B6)%0A%0A%09id1%20--%3E%20id2%0A%09id2%20--%3E%20id6%0A%09id3%20--%3E%20id6%0A"})]),fallback:a(()=>[i(" Loading... ")]),_:1})),ms,s("h4",Ts,[n(h,{color:"orange"},{default:a(()=>[i("*模式之两阶段终止")]),_:1}),i(),qs]),_s,(k(),p(e,null,{default:a(()=>[n(t,{id:"mermaid-1231",class:"mermaid",graph:"---%0Atitle%3A%20%E4%B8%A4%E9%98%B6%E6%AE%B5%E7%BB%88%E6%AD%A2%E6%A8%A1%E5%BC%8F%0A---%0Agraph%20TD%3B%0Aid1(%22while(true)%22)%0Aid2(%E6%9C%89%E6%B2%A1%E6%9C%89%E8%A2%AB%E6%89%93%E6%96%AD%3F)%0Aid3(%E6%96%99%E7%90%86%E5%90%8E%E4%BA%8B)%0Aid4(%E7%9D%A1%E7%9C%A02s)%0Aid5(%E6%89%A7%E8%A1%8C%E7%9B%91%E6%8E%A7%E8%AE%B0%E5%BD%95)%0Aid6(%E8%AE%BE%E7%BD%AE%E6%89%93%E6%96%AD%E6%A0%87%E5%BF%97)%0Aid7((%E7%BB%93%E6%9D%9F%E5%BE%AA%E7%8E%AF))%0A%0Aid1%20--%3E%20id2%0Aid2%20--%3E%7CYES%7C%20id3%0Aid2%20--%3E%7CNO%7C%20id4%0Aid3%20--%3E%20id7%0Aid4%20--%3E%7C%E6%97%A0%E5%BC%82%E5%B8%B8%7C%20id5%0Aid5%20--%3E%20id1%0Aid4%20--%3E%7C%E6%9C%89%E5%BC%82%E5%B8%B8%7C%20id6%0Aid6%20--%3E%20id1%0A"})]),fallback:a(()=>[i(" Loading... ")]),_:1})),i(),fs])}const Os=o(_,[["render",js]]);export{Ns as __pageData,Os as default};
