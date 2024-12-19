import{_ as r,E,c as d,m as s,J as n,w as i,b as t,a4 as p,a,V as h,o as k}from"./chunks/framework.syB9hai_.js";const g="/cswiki/assets/image-169539985711424.7Bjcdndd.png",y="/cswiki/assets/image-169539985711425.BKwHKWMw.png",F="/cswiki/assets/image-20230505221424359.z3FQd44x.png",c="/cswiki/assets/image-20220821003816845.VLOeLT-p.png",H=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"src/base/juc/juc-tools-pool.md","filePath":"src/base/juc/juc-tools-pool.md","lastUpdated":1730648753000}'),o={name:"src/base/juc/juc-tools-pool.md"},C={class:"table-of-contents"},A=s("a",{href:"#线程池"},"线程池",-1),D=h("",2),u={href:"#应用之定时任务"},B={href:"#异步模式之工作线程"},T=s("ul",null,[s("li",null,[s("a",{href:"#定义"},"定义")]),s("li",null,[s("a",{href:"#饥饿"},"饥饿")])],-1),b=s("li",null,[s("a",{href:"#fork-join"},"Fork/Join"),s("ul",null,[s("li",null,[s("a",{href:"#概念"},"概念")]),s("li",null,[s("a",{href:"#使用"},"使用")])])],-1),m=s("li",null,[s("a",{href:"#computefuture"},"ComputeFuture")],-1),v=h("",6),P=h("",3),x=h("",12),q=h("",126),f=h("",75),S=h("",3),w={id:"应用之定时任务",tabindex:"-1"},$=s("a",{class:"header-anchor",href:"#应用之定时任务","aria-label":`Permalink to "<font color='green'>\\* 应用之定时任务</font>"`},"​",-1),j=h("",3),L={id:"异步模式之工作线程",tabindex:"-1"},_=s("a",{class:"header-anchor",href:"#异步模式之工作线程","aria-label":`Permalink to "<font color='orange'>* 异步模式之工作线程</font>"`},"​",-1),I=h("",36),Q=h("",7),R=s("h3",{id:"computefuture",tabindex:"-1"},[a("ComputeFuture "),s("a",{class:"header-anchor",href:"#computefuture","aria-label":'Permalink to "ComputeFuture"'},"​")],-1);function N(U,z,O,W,M,J){const e=E("font"),l=E("Mermaid");return k(),d("div",null,[s("nav",C,[s("ul",null,[s("li",null,[A,s("ul",null,[D,s("li",null,[s("a",u,[n(e,{color:"green"},{default:i(()=>[a("* 应用之定时任务")]),_:1})])]),s("li",null,[s("a",B,[n(e,{color:"orange"},{default:i(()=>[a("* 异步模式之工作线程")]),_:1})]),T]),b,m])])])]),v,(k(),t(p,null,{default:i(()=>[n(l,{id:"mermaid-19",class:"mermaid",graph:"---%0Atitle%3A%20%E6%A0%B8%E5%BF%83%E5%8F%82%E6%95%B0%E7%A4%BA%E6%84%8F%E5%9B%BE%0A---%0Agraph%20%0A%0Asubgraph%20%22%E9%98%BB%E5%A1%9E%E9%98%9F%E5%88%97%22%0As1(size%3D2)%0At3(%E4%BB%BB%E5%8A%A13)%0At4(%E4%BB%BB%E5%8A%A14)%0Aend%0A%0Asubgraph%20%22%E7%BA%BF%E7%A8%8B%E6%B1%A0%20%E6%A0%B8%E5%BF%83%E7%BA%BF%E7%A8%8B%20%3D%202%2C%E6%9C%80%E5%A4%A7%E7%BA%BF%E7%A8%8B%20%3D%203%22%0Act1(%E6%A0%B8%E5%BF%83%E7%BA%BF%E7%A8%8B1)%0Act2(%E6%A0%B8%E5%BF%83%E7%BA%BF%E7%A8%8B2)%0Act1%20--%3E%20t1(%E4%BB%BB%E5%8A%A11)%0Act2%20--%3E%20t2(%E4%BB%BB%E5%8A%A12)%0Amt1(%E6%95%91%E6%80%A5%E7%BA%BF%E7%A8%8B1)%20--%3E%20t5(%E4%BB%BB%E5%8A%A15)%0Aend%0A%0A%0Astyle%20ct1%20fill%3A%23%2Cstroke%3A%23f66%2Cstroke-width%3A2px%0Astyle%20ct2%20fill%3A%23%2Cstroke%3A%23f66%2Cstroke-width%3A2px%0Astyle%20mt1%20fill%3A%23%2Cstroke%3A%23f66%2Cstroke-width%3A2px%2Cstroke-dasharray%3A5%2C5%0A"})]),fallback:i(()=>[a(" Loading... ")]),_:1})),P,(k(),t(p,null,{default:i(()=>[n(l,{id:"mermaid-59",class:"mermaid",graph:"---%0Atitle%3A%20%E7%BA%BF%E7%A8%8B%E6%B1%A0%E5%8F%82%E6%95%B0%E6%89%A7%E8%A1%8C%E5%8E%9F%E7%90%86%0A---%0Agraph%20LR%0At1(%E6%B7%BB%E5%8A%A0%E6%96%B0%E4%BB%BB%E5%8A%A1)%20--%3E%20t2(%E6%A0%B8%E5%BF%83%E7%BA%BF%E7%A8%8B%E6%95%B0%E6%98%AF%E5%90%A6%E5%B7%B2%E6%BB%A1)%0At2%20--%3E%20%7C%E5%90%A6%7C%20t3(%E5%8A%A0%E5%85%A5%E9%98%9F%E5%88%97)%0At2%20--%3E%20%7C%E6%98%AF%7C%20t4(%E9%98%BB%E5%A1%9E%E9%98%9F%E5%88%97%E6%98%AF%E5%90%A6%E5%B7%B2%E6%BB%A1)%0At4%20--%3E%20%7C%E5%90%A6%7C%20t3%0At4%20--%3E%20%7C%E6%98%AF%7C%20t5(%E6%9C%80%E5%A4%A7%E7%BA%BF%E7%A8%8B%E6%95%B0%E6%98%AF%E5%90%A6%E5%B7%B2%E6%BB%A1)%0At5%20--%3E%20%7C%E5%90%A6%7C%20t7(%E5%88%9B%E5%BB%BA%E6%95%91%E6%80%A5%E7%BA%BF%E7%A8%8B)%0At5%20--%3E%20%7C%E6%98%AF%7C%20t6(%E6%8B%92%E7%BB%9D%E7%AD%96%E7%95%A5%E5%A4%84%E7%90%86)%0A"})]),fallback:i(()=>[a(" Loading... ")]),_:1})),x,(k(),t(p,null,{default:i(()=>[n(l,{id:"mermaid-173",class:"mermaid",graph:"---%0Atitle%3A%20%E7%BA%BF%E7%A8%8B%E6%B1%A0%E5%A6%82%E4%BD%95%E8%BF%90%E8%A1%8C%0A---%0Agraph%20LR%0A%0Asubgraph%20ThreadPool%0A%20t1%20%0A%20t2%0A%20t3%0Aend%0A%0Asubgraph%20BlockingQueue%0A%20t1%20--%3E%7Cpoll%7C%20t(task%201)%0A%20t2%20-.-%3E%7Cpoll%7C%20t%0A%20t3%20-.-%3E%7Cpoll%7C%20t%0A%20t%20--%3E%20tt2(task%202)%0A%20tt2%20--%3E%20tt3(task%203)%0Aend%0A%0A%20tt3%20--%3E%20%7Cput%7Cmain%0A"})]),fallback:i(()=>[a(" Loading... ")]),_:1})),q,(k(),t(p,null,{default:i(()=>[n(l,{id:"mermaid-775",class:"mermaid",graph:"---%0Atitle%3A%20Tomca%E7%BA%BF%E7%A8%8B%E6%B1%A0%0A---%0Agraph%20%0A%0Asubgraph%20%22Connector(NIO%20EndPoint)%22%0At1(LimitLatch)%0At2(Acceptor)%0At3(SocketChannel%201)%0At4(SocketChannel%202)%0At5(Poller)%0Asubgraph%20Executor%0At7(worker1)%0At8(worker2)%0Aend%0At1%20--%3E%20t2%0At2%20--%3E%20t3%0At2%20--%3E%20t4%0At3%20--%E6%9C%89%E8%AF%BB--%3E%20t5%0At4%20--%E6%9C%89%E8%AF%BB--%3E%20t5%0At5%20--socketProcessor--%3E%20t7%0At5%20--socketProcessor--%3E%20t8%0Aend%0A%0A%0A"})]),fallback:i(()=>[a(" Loading... ")]),_:1})),f,(k(),t(p,null,{default:i(()=>[n(l,{id:"mermaid-1139",class:"mermaid",graph:"classDiagram%0Adirection%20BT%0Aclass%20BlockingQueue~T~%20%7B%0A%20%20%2B%20BlockingQueue(int)%20%0A%20%20%2B%20ReentrantLock%20lock%0A%20%20%2B%20Condition%20fullWaitSet%0A%20%20%2B%20int%20capacity%0A%20%20%2B%20Condition%20emptyWaitSet%0A%20%20%2B%20Deque~T~%20queue%0A%20%20%2B%20put(T)%20void%0A%20%20%2B%20tryPut(RejectPolicy~T~%2C%20T)%20void%0A%20%20%2B%20poll(long%2C%20TimeUnit)%20T%0A%20%20%2B%20take()%20T%0A%20%20%2B%20offer(T%2C%20long%2C%20TimeUnit)%20boolean%0A%7D%0Aclass%20RejectPolicy~T~%20%7B%0A%3C%3CInterface%3E%3E%0A%20%20%2B%20reject(BlockingQueue~T~%2C%20T)%20void%0A%7D%0Aclass%20ThreadPool%20%7B%0A%20%20%2B%20ThreadPool(int%2C%20long%2C%20TimeUnit%2C%20int%2C%20RejectPolicy~Runnable~)%20%0A%20%20%2B%20TimeUnit%20timeUnit%0A%20%20%2B%20RejectPolicy~Runnable~%20rejectPolicy%0A%20%20%2B%20int%20coreSize%0A%20%20%2B%20HashSet~Worker~%20workers%0A%20%20%2B%20long%20timeout%0A%20%20%2B%20BlockingQueue~Runnable~%20taskQue%0A%20%20%2B%20execute(Runnable)%20void%0A%7D%0A%0AThreadPool%20%20..%3E%20%20BlockingQueue~T~%20%3A%20%C2%ABcreate%C2%BB%0AThreadPool%20%221%22%20*--%3E%20%22taskQue%201%22%20BlockingQueue~T~%20%0AThreadPool%20%221%22%20*--%3E%20%22rejectPolicy%201%22%20RejectPolicy~T~%20%0A"})]),fallback:i(()=>[a(" Loading... ")]),_:1})),S,s("h3",w,[n(e,{color:"green"},{default:i(()=>[a("* 应用之定时任务")]),_:1}),a(),$]),j,s("h3",L,[n(e,{color:"orange"},{default:i(()=>[a("* 异步模式之工作线程")]),_:1}),a(),_]),I,(k(),t(p,null,{default:i(()=>[n(l,{id:"mermaid-1287",class:"mermaid",graph:"graph%20LR%0At1(%22t1%205%20%2B%20%7B4%7D%22)%20--%3E%20%7C%22t4%22%7C%20t2(%22t2%204%20%2B%20%7B3%7D%22)%0At2%20--%3E%20%7C%22%7B3%7D%22%7C%20t3(%22t3%203%20%2B%20%7B2%7D%22)%0At3%20--%3E%20%7C%22%7B2%7D%22%7C%20t4(%22t0%202%20%2B%20%7B1%7D%22)%0At4%20--%3E%20%7C%22%7B1%7D%22%7C%20t0%0At0%20-.-%3E%7C1%7C%20t4%0At4%20-.-%3E%7C3%7C%20t3%0At3%20-.-%3E%7C6%7C%20t2%0At2%20-.-%3E%7C10%7C%20t1%0At1%20-.-%3E%7C15%7C%20%E7%BB%93%E6%9E%9C%0A"})]),fallback:i(()=>[a(" Loading... ")]),_:1})),Q,(k(),t(p,null,{default:i(()=>[n(l,{id:"mermaid-1303",class:"mermaid",graph:"graph%20LR%0At1(%22t1%20%7B1%2C3%7D%20%2B%20%7B4%2C5%7D%22)%20--%3E%7C%22%7B1%2C3%7D%22%7C%20t2(%22t2%20%7B1%2C2%7D%20%2B%20%7B3%2C3%7D%22)%0At2%20-.-%3E%7C6%7C%20t1%0At1%20--%3E%20%7C%22%7B4%2C5%7D%22%7Ct3%0At3%20--%3E%20%7C9%7C%20t1%0At1%20-.-%3E%7C15%7C%20t4(%22%E7%BB%93%E6%9E%9C%22)%0At2%20--%3E%20%7C%22%7B3%2C3%7D%22%7Ct0%0At2%20--%3E%20%7C%22%7B1%2C2%7D%22%7C%20t0%0At0%20-.-%3E%20%7C3%7C%20t2%0At0%20-.-%3E%20%7C3%7C%20t2%0A"})]),fallback:i(()=>[a(" Loading... ")]),_:1})),R])}const G=r(o,[["render",N]]);export{H as __pageData,G as default};