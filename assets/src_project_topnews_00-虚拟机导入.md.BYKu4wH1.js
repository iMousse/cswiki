import{_ as n,E as o,c,J as p,w as d,m as s,a as m,V as _,o as i,b as h,e as g}from"./chunks/framework.syB9hai_.js";const u="/cswiki/assets/image-20210407205305080.jxKHzK9v.png",w="/cswiki/assets/image-20210407205325182.WuHdt7--.png",f="/cswiki/assets/image-20210407205431849.HoE2_CLN.png",k="/cswiki/assets/image-20210407205502305.zsbVmbpJ.png",y=JSON.parse('{"title":"虚拟机导入","description":"","frontmatter":{},"headers":[],"relativePath":"src/project/topnews/00-虚拟机导入.md","filePath":"src/project/topnews/00-虚拟机导入.md","lastUpdated":1730648753000}'),b={name:"src/project/topnews/00-虚拟机导入.md"},N=s("h1",{id:"虚拟机导入",tabindex:"-1"},[m("虚拟机导入 "),s("a",{class:"header-anchor",href:"#虚拟机导入","aria-label":'Permalink to "虚拟机导入"'},"​")],-1),V=_('<h2 id="windows-10" tabindex="-1">Windows 10 <a class="header-anchor" href="#windows-10" aria-label="Permalink to &quot;Windows 10&quot;">​</a></h2><h3 id="虚拟机镜像准备" tabindex="-1">虚拟机镜像准备 <a class="header-anchor" href="#虚拟机镜像准备" aria-label="Permalink to &quot;虚拟机镜像准备&quot;">​</a></h3><ol><li><p>打开当天资料文件中的镜像，拷贝到一个地方，然后解压</p></li><li><p>解压后，双击ContOS7-hmtt.vmx文件，前提是电脑上已经安装了VMware</p></li></ol><p><img src="'+u+'" alt="image-20210407205305080" loading="lazy"></p><ol start="3"><li>-修改虚拟网络地址（NAT）</li></ol><p><img src="'+w+'" alt="image-20210407205325182" loading="lazy"></p><p>​ ①，选中VMware中的编辑</p><p>​ ②，选择虚拟网络编辑器</p><p>​ ③，找到NAT网卡，把网段改为200（当前挂载的虚拟机已固定ip地址）</p><ol start="4"><li>修改虚拟机的网络模式为NAT</li></ol><p><img src="'+f+'" alt="image-20210407205431849" loading="lazy"></p><ol start="5"><li><p>启动虚拟机，<strong>用户名：root 密码：itcast</strong>，当前虚拟机的ip已手动固定（静态IP）, 地址为：<strong>192.168.200.130</strong></p></li><li><p>使用FinalShell客户端链接</p></li></ol><p><img src="'+k+'" alt="image-20210407205502305" loading="lazy"></p><h2 id="macos-m1芯片" tabindex="-1">MacOS M1芯片 <a class="header-anchor" href="#macos-m1芯片" aria-label="Permalink to &quot;MacOS M1芯片&quot;">​</a></h2>',14);function T(a,A,C,M,P,S){const r=o("ArticleMetadata"),l=o("ClientOnly");return i(),c("div",null,[N,p(l,null,{default:d(()=>{var t,e;return[(((t=a.$frontmatter)==null?void 0:t.aside)??!0)&&(((e=a.$frontmatter)==null?void 0:e.showArticleMetadata)??!0)?(i(),h(r,{key:0,article:a.$frontmatter},null,8,["article"])):g("",!0)]}),_:1}),V])}const $=n(b,[["render",T]]);export{y as __pageData,$ as default};
