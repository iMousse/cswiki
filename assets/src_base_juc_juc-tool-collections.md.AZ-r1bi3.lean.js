import{_ as r,E as p,c as d,m as s,J as n,w as i,b as e,a4 as E,a,V as h,o as l}from"./chunks/framework.syB9hai_.js";const g="/cswiki/assets/image-169539985711426.u8_mLDsB.png",M=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"src/base/juc/juc-tool-collections.md","filePath":"src/base/juc/juc-tool-collections.md","lastUpdated":1730648753000}'),y={name:"src/base/juc/juc-tool-collections.md"},F=s("p",null,[s("a",{href:"./"},"返回首页")],-1),c={class:"table-of-contents"},o=s("a",{href:"#collections"},"Collections",-1),A=s("a",{href:"#concurrenthashmap"},"ConcurrentHashMap",-1),C={href:"#应用之分治-单词计数"},u=s("li",null,[s("a",{href:"#实现一"},"实现一")],-1),D=s("li",null,[s("a",{href:"#正确答案一"},"正确答案一")],-1),B=s("li",null,[s("a",{href:"#正确答案二"},"正确答案二")],-1),b=h("",2),m=s("h2",{id:"collections",tabindex:"-1"},[a("Collections "),s("a",{class:"header-anchor",href:"#collections","aria-label":'Permalink to "Collections"'},"​")],-1),v=s("p",null,"线程安全集合类",-1),_=h("",8),f={id:"应用之分治-单词计数",tabindex:"-1"},S=s("a",{class:"header-anchor",href:"#应用之分治-单词计数","aria-label":`Permalink to "<font color='green'>*应用之分治：单词计数</font>"`},"​",-1),q=h("",21),x=h("",23);function w(j,O,T,L,P,N){const k=p("font"),t=p("Mermaid");return l(),d("div",null,[F,s("nav",c,[s("ul",null,[s("li",null,[o,s("ul",null,[s("li",null,[A,s("ul",null,[s("li",null,[s("a",C,[n(k,{color:"green"},{default:i(()=>[a("*应用之分治：单词计数")]),_:1})])]),u,D,B])]),b])])])]),m,v,(l(),e(E,null,{default:i(()=>[n(t,{id:"mermaid-12",class:"mermaid",graph:"graph%20%0A%0At1(%E9%81%97%E7%95%99%E7%9A%84%E5%AE%89%E5%85%A8%E9%9B%86%E5%90%88)%20--%3E%20t2(Hashtable)%0At1%20--%3E%20t3(Vector)%0A%0Aa1(%E4%BF%AE%E9%A5%B0%E7%9A%84%E5%AE%89%E5%85%A8%E9%9B%86%E5%90%88)%20--%3E%20a2(SynchronizedMap)%0Aa1%20--%3E%20a3(SynchronizedList)%0A%0As1(JUC%20%E5%AE%89%E5%85%A8%E9%9B%86%E5%90%88)%20--%3E%20s2(Blocking%E7%B1%BB)%0As1%20--%3E%20s3(CopyOnWrite%E7%B1%BB)%0As1%20--%3E%20s4(Concurrent%E7%B1%BB)%0A"})]),fallback:i(()=>[a(" Loading... ")]),_:1})),_,s("h4",f,[n(k,{color:"green"},{default:i(()=>[a("*应用之分治：单词计数")]),_:1}),a(),S]),q,(l(),e(E,null,{default:i(()=>[n(t,{id:"mermaid-218",class:"mermaid",graph:"graph%0A%0Asubgraph%20%22Connector%20-%3E%20NIO%20EndPoint%22%0At1(LimitLatch)%0At2(Acceptor)%0At3(SocketChannel%201)%0At4(SocketChannel%202)%0At5(Poller)%0Asubgraph%20Executor%0At7(worker1)%0At8(worker2)%0Aend%0At1%20--%3E%20t2%0At2%20--%3E%20t3%0At2%20--%3E%20t4%0At3%20--%E6%9C%89%E8%AF%BB--%3E%20t5%0At4%20--%E6%9C%89%E8%AF%BB--%3E%20t5%0At5%20--socketProcessor--%3E%20t7%0At5%20--socketProcessor--%3E%20t8%0Aend%0A"})]),fallback:i(()=>[a(" Loading... ")]),_:1})),x])}const V=r(y,[["render",w]]);export{M as __pageData,V as default};