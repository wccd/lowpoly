import{d as K,r as S,c as z,a as b,t as $,w as G,v as H,F as J,o as Q,n as W,S as X,b as Z}from"./vendor.73660f50.js";const ee=function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const l of t)if(l.type==="childList")for(const d of l.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&o(d)}).observe(document,{childList:!0,subtree:!0});function i(t){const l={};return t.integrity&&(l.integrity=t.integrity),t.referrerpolicy&&(l.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?l.credentials="include":t.crossorigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function o(t){if(t.ep)return;t.ep=!0;const l=i(t);fetch(t.href,l)}};ee();var O=1/1048576;function te(e){var s=Number.POSITIVE_INFINITY,i=Number.POSITIVE_INFINITY,o=Number.NEGATIVE_INFINITY,t=Number.NEGATIVE_INFINITY,l,d,a,f,g,p;for(l=e.length;l--;)e[l][0]<s&&(s=e[l][0]),e[l][0]>o&&(o=e[l][0]),e[l][1]<i&&(i=e[l][1]),e[l][1]>t&&(t=e[l][1]);return d=o-s,a=t-i,f=Math.max(d,a),g=s+d*.5,p=i+a*.5,[[g-20*f,p-f],[g,p+20*f],[g+20*f,p-f]]}function q(e,s,i,o){var t=e[s][0],l=e[s][1],d=e[i][0],a=e[i][1],f=e[o][0],g=e[o][1],p=Math.abs(l-a),k=Math.abs(a-g),v,F,I,N,_,E,P,C,T,A;if(p<O&&k<O)throw new Error("Eek! Coincident points!");return p<O?(N=-((f-d)/(g-a)),E=(d+f)/2,C=(a+g)/2,v=(d+t)/2,F=N*(v-E)+C):k<O?(I=-((d-t)/(a-l)),_=(t+d)/2,P=(l+a)/2,v=(f+d)/2,F=I*(v-_)+P):(I=-((d-t)/(a-l)),N=-((f-d)/(g-a)),_=(t+d)/2,E=(d+f)/2,P=(l+a)/2,C=(a+g)/2,v=(I*_-N*E+C-P)/(I-N),F=p>k?I*(v-_)+P:N*(v-E)+C),T=d-v,A=a-F,{i:s,j:i,k:o,x:v,y:F,r:T*T+A*A}}function ne(e){var s,i,o,t,l,d;for(i=e.length;i;)for(t=e[--i],o=e[--i],s=i;s;)if(d=e[--s],l=e[--s],o===l&&t===d||o===d&&t===l){e.splice(i,2),e.splice(s,2);break}}var ae={triangulate:function(e,s){var i=e.length,o,t,l,d,a,f,g,p,k,v,F,I;if(i<3)return[];if(e=e.slice(0),s)for(o=i;o--;)e[o]=e[o][s];for(l=new Array(i),o=i;o--;)l[o]=o;for(l.sort(function(N,_){var E=e[_][0]-e[N][0];return E!==0?E:N-_}),d=te(e),e.push(d[0],d[1],d[2]),a=[q(e,i+0,i+1,i+2)],f=[],g=[],o=l.length;o--;g.length=0){for(I=l[o],t=a.length;t--;){if(p=e[I][0]-a[t].x,p>0&&p*p>a[t].r){f.push(a[t]),a.splice(t,1);continue}k=e[I][1]-a[t].y,!(p*p+k*k-a[t].r>O)&&(g.push(a[t].i,a[t].j,a[t].j,a[t].k,a[t].k,a[t].i),a.splice(t,1))}for(ne(g),t=g.length;t;)F=g[--t],v=g[--t],a.push(q(e,v,F,I))}for(o=a.length;o--;)f.push(a[o]);for(a.length=0,o=f.length;o--;)f[o].i<i&&f[o].j<i&&f[o].k<i&&a.push(f[o].i,f[o].j,f[o].k);return a},contains:function(e,s){if(s[0]<e[0][0]&&s[0]<e[1][0]&&s[0]<e[2][0]||s[0]>e[0][0]&&s[0]>e[1][0]&&s[0]>e[2][0]||s[1]<e[0][1]&&s[1]<e[1][1]&&s[1]<e[2][1]||s[1]>e[0][1]&&s[1]>e[1][1]&&s[1]>e[2][1])return null;var i=e[1][0]-e[0][0],o=e[2][0]-e[0][0],t=e[1][1]-e[0][1],l=e[2][1]-e[0][1],d=i*l-o*t;if(d===0)return null;var a=(l*(s[0]-e[0][0])-o*(s[1]-e[0][1]))/d,f=(i*(s[1]-e[0][1])-t*(s[0]-e[0][0]))/d;return a<0||f<0||a+f>1?null:[a,f]}};const le={class:"show-box"},oe={class:"slider"},ue={class:"slider-input"},re=["min","max"],ie={class:"slider-input"},se=K({setup(e,{expose:s}){let i={originFile:null,imageData:null,saveData:null};function o(){i={originFile:null,imageData:null,saveData:null}}function t(c,n,h,m){let u=c.data,r=(m*h+n)*4;var y=u[r],w=u[r+1],x=u[r+2],D=u[r+3];return[y,w,x,D]}function l(c){return c<1?Math.round(c*1e3)/1e3:Math.round(c)}async function d(c){let n=new Image;const h=URL.createObjectURL(c);n.src=h,await new Promise((D,M)=>{n.onload=()=>D({}),n.onerror=()=>M(Error("Image loading error"))});let u=n.width,r=n.height;const y=document.createElement("canvas");u*r>1024*1024&&(u>r?(r=1024*r/u,u=1024):(u=1024*u/r,r=1024)),y.width=u,y.height=r;const w=y.getContext("2d");if(!w)throw new Error("Could not create canvas context");return URL.revokeObjectURL(h),w.drawImage(n,0,0,n.width,n.height,0,0,u,r),w.getImageData(0,0,u,r)}const a=S(!1),f=S([0,1e3]),g=S(1),p=S(1);function k(){a.value=!1,f.value=[0,1e3],g.value=1,p.value=1}function v(c,n){let h=1,m=[],u=c.width,r=c.height,y=n.data;for(let M=0;M<r;M+=h)for(let L=0;L<u;L+=h){let B=(u*M+L)*4;var w=y[B],x=y[B+1],D=y[B+2];w+x+D<=255||m.push([L,M])}return m}function F(c,n){let h=[],m=[];for(let u=0;u<n;u++){let r=Math.floor(Math.random()*c.length);for(;m.includes(r);)r=Math.floor(Math.random()*c.length),m.push(r);h.push(c[r])}return h}function I(c,n){let h=c.width-1,m=c.height-1,u=n-4,r=[],y=[];y=[[0,0],[0,m],[h,0],[h,m]];for(let w=0;w<u;w++){let x=Math.floor(Math.random()*h),D=Math.floor(Math.random()*m),M=[x,D],L=M.toString();for(;r.includes(L);)x=Math.floor(Math.random()*h),D=Math.floor(Math.random()*m),M=[x,D],L=M.toString(),r.push(L);y.push(M)}return y}async function N(c){let n,h,m,u;i.imageData?(console.log("use cache"),n=i.imageData):(n=await d(c),i.imageData=n),h=n.width*n.height/100,f.value=[h/10,h],m=h*90,u=h*10,a.value?(m=g.value*p.value,u=g.value*(100-p.value)):W(()=>{g.value=h,p.value=90});let y=X(n).toImageData(),w=v(n,y),x=F(w,m/100),D=I(n,u/100);return{imageData:n,pointData:D.concat(x)}}function _(){T.value.innerHTML="",A.value.innerHTML=""}async function E(c){let n=document.createElement("canvas"),h=n.getContext("2d"),{imageData:m,pointData:u}=await N(c);n.width=m.width,n.height=m.height,h.putImageData(m,0,0),T.value.appendChild(n),P(m,u)}function P(c,n){let h=document.createElement("canvas"),m=h.getContext("2d");h.width=c.width,h.height=c.height;for(var u=ae.triangulate(n),r=u.length;r;){m.beginPath(),--r,m.moveTo(n[u[r]][0],n[u[r]][1]);let y=t(c,n[u[r]][0],n[u[r]][1],c.width);--r,m.lineTo(n[u[r]][0],n[u[r]][1]);let w=t(c,n[u[r]][0],n[u[r]][1],c.width);--r,m.lineTo(n[u[r]][0],n[u[r]][1]);let x=t(c,n[u[r]][0],n[u[r]][1],c.width),D=(y[0]+w[0]+x[0])/3,M=(y[1]+w[1]+x[1])/3,L=(y[2]+w[2]+x[2])/3,B=`rgba(${D}, ${M}, ${L}, ${y[3]})`;m.fillStyle=B,m.strokeStyle=B,m.fill(),m.closePath(),m.stroke()}h.toBlob(y=>{i.saveData=y}),A.value.appendChild(h)}const C=S(),T=S(),A=S(),R=()=>{o(),k(),C.value.click()},U=c=>{_();let n=c.target.files;i.originFile=n,E(n[0]),c.target.value=null},j=()=>{a.value=!0,_(),E(i.originFile)},V=()=>{a.value=!0,_(),E(i.originFile)},Y=()=>{var c=document.createElement("a"),n=window.URL.createObjectURL(i.saveData);c.href=n,c.download=Math.floor(Math.random()*1e5)+".png",c.click(),window.URL.revokeObjectURL(n)};return s({selectFile:R,saveToImg:Y,changeFile:U,changePointNum:j,changeMarginRandom:V}),(c,n)=>(Q(),z(J,null,[b("input",{type:"file",ref_key:"selector",ref:C,style:{display:"none"},onChange:U},null,544),b("div",le,[b("div",{class:"origin-img img-box",ref_key:"orginImg",ref:T},null,512),b("div",{class:"lowpoly-img img-box",ref_key:"lowpolyImg",ref:A},null,512)]),b("div",oe,[b("div",ue,[b("p",null,"\u70B9\u6570 \u70B9\u6570\u8D8A\u591A\u8272\u5757\u8D8A\u5BC6\u96C6("+$(l(g.value))+")",1),G(b("input",{type:"range",min:f.value[0],max:f.value[1],"onUpdate:modelValue":n[0]||(n[0]=h=>g.value=h),onChange:j},null,40,re),[[H,g.value]])]),b("div",ie,[b("p",null,"\u8FB9\u7F18\u968F\u673A\u70B9\u6570\u6BD4,0-1\u8D8A\u5927\u8F6E\u5ED3\u8D8A\u6E05\u6670("+$(p.value/100)+")",1),G(b("input",{type:"range",min:"1","onUpdate:modelValue":n[1]||(n[1]=h=>p.value=h),onChange:V},null,544),[[H,p.value]])])]),b("div",{class:"btn-box"},[b("div",{class:"btn",onClick:R},"\u9009\u62E9\u56FE\u7247"),b("div",{class:"btn",style:{left:"calc(80% - 80px)"},onClick:Y},"\u5B58\u4E3A\u56FE\u7247")])],64))}});Z(se).mount("#app");
