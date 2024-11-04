import{c as S,p as sn}from"./constant-b644328d.Q005Z5CD.js";import{at as en,au as y,as as ln,av as G,aw as w,ax as K,ay as b,az as an,aA as rn,aB as t,aC as un,aD as on,aE as tn}from"../app.e_2uyXC4.js";function fn(l){return l.innerRadius}function cn(l){return l.outerRadius}function yn(l){return l.startAngle}function gn(l){return l.endAngle}function mn(l){return l&&l.padAngle}function pn(l,x,q,D,h,v,$,a){var i=q-l,n=D-x,m=$-h,s=a-v,r=s*i-m*n;if(!(r*r<y))return r=(m*(x-v)-s*(l-h))/r,[l+r*i,x+r*n]}function U(l,x,q,D,h,v,$){var a=l-q,i=x-D,n=($?v:-v)/K(a*a+i*i),m=n*i,s=-n*a,r=l+m,f=x+s,c=q+m,z=D+s,o=(r+c)/2,B=(f+z)/2,p=c-r,g=z-f,A=p*p+g*g,C=h-v,P=r*z-c*f,I=(g<0?-1:1)*K(tn(0,C*C*A-P*P)),O=(P*g-p*I)/A,d=(-P*p-g*I)/A,R=(P*g+p*I)/A,T=(-P*p+g*I)/A,e=O-o,u=d-B,j=R-o,F=T-B;return e*e+u*u>j*j+F*F&&(O=R,d=T),{cx:O,cy:d,x01:-m,y01:-s,x11:O*(h/C-1),y11:d*(h/C-1)}}function hn(){var l=fn,x=cn,q=S(0),D=null,h=yn,v=gn,$=mn,a=null;function i(){var n,m,s=+l.apply(this,arguments),r=+x.apply(this,arguments),f=h.apply(this,arguments)-en,c=v.apply(this,arguments)-en,z=an(c-f),o=c>f;if(a||(a=n=sn()),r<s&&(m=r,r=s,s=m),!(r>y))a.moveTo(0,0);else if(z>ln-y)a.moveTo(r*G(f),r*w(f)),a.arc(0,0,r,f,c,!o),s>y&&(a.moveTo(s*G(c),s*w(c)),a.arc(0,0,s,c,f,o));else{var B=f,p=c,g=f,A=c,C=z,P=z,I=$.apply(this,arguments)/2,O=I>y&&(D?+D.apply(this,arguments):K(s*s+r*r)),d=b(an(r-s)/2,+q.apply(this,arguments)),R=d,T=d,e,u;if(O>y){var j=un(O/s*w(I)),F=un(O/r*w(I));(C-=j*2)>y?(j*=o?1:-1,g+=j,A-=j):(C=0,g=A=(f+c)/2),(P-=F*2)>y?(F*=o?1:-1,B+=F,p-=F):(P=0,B=p=(f+c)/2)}var H=r*G(B),J=r*w(B),L=s*G(A),M=s*w(A);if(d>y){var N=r*G(p),Q=r*w(p),V=s*G(g),W=s*w(g),E;if(z<rn&&(E=pn(H,J,V,W,N,Q,L,M))){var X=H-E[0],Y=J-E[1],Z=N-E[0],k=Q-E[1],_=1/w(on((X*Z+Y*k)/(K(X*X+Y*Y)*K(Z*Z+k*k)))/2),nn=K(E[0]*E[0]+E[1]*E[1]);R=b(d,(s-nn)/(_-1)),T=b(d,(r-nn)/(_+1))}}P>y?T>y?(e=U(V,W,H,J,r,T,o),u=U(N,Q,L,M,r,T,o),a.moveTo(e.cx+e.x01,e.cy+e.y01),T<d?a.arc(e.cx,e.cy,T,t(e.y01,e.x01),t(u.y01,u.x01),!o):(a.arc(e.cx,e.cy,T,t(e.y01,e.x01),t(e.y11,e.x11),!o),a.arc(0,0,r,t(e.cy+e.y11,e.cx+e.x11),t(u.cy+u.y11,u.cx+u.x11),!o),a.arc(u.cx,u.cy,T,t(u.y11,u.x11),t(u.y01,u.x01),!o))):(a.moveTo(H,J),a.arc(0,0,r,B,p,!o)):a.moveTo(H,J),!(s>y)||!(C>y)?a.lineTo(L,M):R>y?(e=U(L,M,N,Q,s,-R,o),u=U(H,J,V,W,s,-R,o),a.lineTo(e.cx+e.x01,e.cy+e.y01),R<d?a.arc(e.cx,e.cy,R,t(e.y01,e.x01),t(u.y01,u.x01),!o):(a.arc(e.cx,e.cy,R,t(e.y01,e.x01),t(e.y11,e.x11),!o),a.arc(0,0,s,t(e.cy+e.y11,e.cx+e.x11),t(u.cy+u.y11,u.cx+u.x11),o),a.arc(u.cx,u.cy,R,t(u.y11,u.x11),t(u.y01,u.x01),!o))):a.arc(0,0,s,A,g,o)}if(a.closePath(),n)return a=null,n+""||null}return i.centroid=function(){var n=(+l.apply(this,arguments)+ +x.apply(this,arguments))/2,m=(+h.apply(this,arguments)+ +v.apply(this,arguments))/2-rn/2;return[G(m)*n,w(m)*n]},i.innerRadius=function(n){return arguments.length?(l=typeof n=="function"?n:S(+n),i):l},i.outerRadius=function(n){return arguments.length?(x=typeof n=="function"?n:S(+n),i):x},i.cornerRadius=function(n){return arguments.length?(q=typeof n=="function"?n:S(+n),i):q},i.padRadius=function(n){return arguments.length?(D=n==null?null:typeof n=="function"?n:S(+n),i):D},i.startAngle=function(n){return arguments.length?(h=typeof n=="function"?n:S(+n),i):h},i.endAngle=function(n){return arguments.length?(v=typeof n=="function"?n:S(+n),i):v},i.padAngle=function(n){return arguments.length?($=typeof n=="function"?n:S(+n),i):$},i.context=function(n){return arguments.length?(a=n??null,i):a},i}export{hn as d};
