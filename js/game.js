// TAUBENGAME - Engine (Raycaster, Waffen, Netzwerk, Rendering). Story-Modus: siehe story.js
const BG=new Audio();BG.loop=true;BG.volume=.15;BG.src='music.mp3';
addEventListener('pointerdown',()=>{if(BG.paused&&BG.src&&!BG.error)BG.play().catch(()=>{})});
addEventListener('keydown',()=>{if(BG.paused&&BG.src&&!BG.error)BG.play().catch(()=>{})});
const $=i=>document.getElementById(i),cv=$('cv'),VW=480,VH=270,HS=2;cv.width=VW*HS;cv.height=VH*HS;
// Zwei Zeichenflaechen: XW = 3D-Welt (480x270, pixelig), XH = Anzeige (doppelte Aufloesung, HUD und Texte scharf)
const XH=cv.getContext('2d'),wcv=document.createElement('canvas');wcv.width=VW;wcv.height=VH;const XW=wcv.getContext('2d');XW.imageSmoothingEnabled=false;
let x=XW;
for(const c of[XH,XW]){const f=c.fillText.bind(c);c.fillText=(s,a,b)=>f(LANG=='en'?trs(''+s):s,a,b)}
let SENS=1,pmOpen=0;   // Empfindlichkeit, Spielmenue offen
const toWorld=()=>{x=XW},toHud=()=>{XH.setTransform(HS,0,0,HS,0,0);XH.globalAlpha=1;XH.globalCompositeOperation='source-over';XH.imageSmoothingEnabled=false;XH.drawImage(wcv,0,0);x=XH};
// ---------- Karte ----------
const N=24,G=new Uint8Array(N*N);
// B = unsichtbare Hindernisse (Autos, Baeume), FG = Bodenart pro Feld (nur Aussenkarten), DECO = Deko-Sprites
const B=new Uint8Array(N*N),FG=new Uint8Array(N*N),DBLK={40:1,41:1,42:1,43:1,44:1,45:1,47:1,51:1};
let JP=[],DECO=[],OUT=null,FOG=.13,story=0,SS=null,storyLobby=0,myCh=0,EID=0;
const DC=(t,a,b)=>DECO.push({x:a,y:b,t}),FL=(a,b,w,h,t)=>{for(let j=b;j<b+h;j++)for(let i=a;i<a+w;i++)FG[j*N+i]=t};
const R=(a,b,w,h,t)=>{for(let j=b;j<b+h;j++)for(let i=a;i<a+w;i++)G[j*N+i]=t};
const MAPS=[
 {nm:'Arena',es:[[12,2],[2,12.5],[21.5,12.5],[12,21.5]],
  th:{f:[[70,58,46],[90,74,58],[40,32,26]],c:[[40,40,56],[48,48,66],[24,24,34]]},
  b:()=>{R(10,10,4,4,4);R(4,4,2,2,2);R(18,4,2,2,2);R(4,18,2,2,2);R(18,18,2,2,2);
   R(8,3,1,5,1);R(15,3,1,5,1);R(8,16,1,5,1);R(15,16,1,5,1);R(3,11,4,1,2);R(17,11,4,1,2)}},
 {nm:'Ringlabyrinth',es:[[12,2],[2,12.5],[21.5,12.5],[12,21.5]],
  th:{f:[[50,60,70],[66,78,90],[30,36,44]],c:[[30,34,44],[36,40,52],[18,20,28]]},
  b:()=>{R(4,4,16,1,2);R(4,19,16,1,2);R(4,4,1,16,2);R(19,4,1,16,2);
   R(11,4,2,1,0);R(11,19,2,1,0);R(4,11,1,2,0);R(19,11,1,2,0);
   R(8,8,8,1,3);R(8,15,8,1,3);R(8,8,1,8,3);R(15,8,1,8,3);
   R(8,8,2,1,0);R(14,15,2,1,0);R(8,14,1,2,0);R(15,8,1,2,0)}},
 {nm:'Pfeilerhalle',es:[[12,2],[2,12.5],[21.5,12.5],[12,21.5]],
  th:{f:[[80,30,20],[100,40,24],[40,14,10]],c:[[40,12,10],[50,16,12],[24,8,6]]},
  b:()=>{for(let a=4;a<=18;a+=7)for(let b=4;b<=18;b+=7)R(a,b,2,2,4)}},
 {nm:'Bunker',es:[[8.5,2.5],[15.5,2.5],[8.5,21.5],[15.5,21.5]],
  th:{f:[[60,70,56],[74,86,68],[34,42,32]],c:[[44,50,44],[54,60,54],[26,30,26]]},
  b:()=>{R(11,1,2,9,2);R(11,14,2,9,2);R(1,11,9,2,2);R(14,11,9,2,2);
   R(5,5,2,2,1);R(16,5,2,2,1);R(5,16,2,2,1);R(16,16,2,2,1)}},
 {nm:'Kathedrale',es:[[12,2],[2,12.5],[21.5,12.5],[12,21.5]],
  th:{f:[[90,84,70],[110,102,84],[50,46,38]],c:[[34,30,46],[44,38,58],[20,18,28]]},
  b:()=>{for(let y=4;y<=19;y+=3){R(7,y,1,1,3);R(16,y,1,1,3)}R(1,8,5,1,2);R(1,15,5,1,2);R(18,8,5,1,2);R(18,15,5,1,2)}},
 {nm:'Schlangenweg',es:[[12,2.5],[12,8.5],[12,13.5],[12,20.5]],
  th:{f:[[50,50,40],[64,64,52],[30,30,24]],c:[[30,36,30],[40,46,40],[18,22,18]]},
  b:()=>{R(1,6,18,1,2);R(5,11,18,1,3);R(1,16,18,1,2)}},
 // --- Praesidentenstrasse (Dortmund): zwei Kopfsteinpflaster-Spuren, gruener Mittelstreifen mit Baeumen, Backsteinhaeuser ---
 {nm:'Präsidentenstraße',bt:5,jp:[[5,11],[18,12],[11,1],[12,21],[2,7],[21,16]],es:[[12,2],[12,22],[5.5,11.5],[18.5,12.5]],o:{sky:0,fog:.035},
  th:{f:[[110,108,100],[120,118,110],[60,60,56]],c:[[120,170,230],[120,170,230],[120,170,230]]},
  b:()=>{
   for(const y of[3,7,11,15,19]){G[y*N]=6;G[y*N+N-1]=6}for(const a of[5,18]){G[a]=6;G[(N-1)*N+a]=6}
   FL(1,1,22,22,0);FL(1,1,22,2,4);FL(1,21,22,2,4);
   FL(1,3,2,18,2);FL(21,3,2,18,2);FL(3,3,1,18,1);FL(20,3,1,18,1);FL(7,3,1,18,3);FL(16,3,1,18,3);
   FL(8,3,8,8,2);FL(8,13,8,8,2);
   for(const[a,b]of[[9.5,4.5],[13.5,4.5],[11.5,6.5],[9.5,8.5],[13.5,9.5],[9.5,14.5],[13.5,14.5],[11.5,16.5],[9.5,18.5],[13.5,19.5],[1.5,6.5],[1.5,13.5],[22.5,9.5],[22.5,17.5]])DC(40,a,b);
   for(const[t,a,b]of[[41,7.5,4.5],[42,7.5,6.5],[43,7.5,9.5],[44,7.5,14.5],[41,7.5,16.5],[42,7.5,19.5],[45,16.5,4.5],[43,16.5,7.5],[41,16.5,9.5],[42,16.5,14.5],[44,16.5,17.5],[43,16.5,19.5]])DC(t,a,b);
   for(const[a,b]of[[1.3,3.4],[1.7,3.4],[2.1,3.4],[22.6,20.5],[22.2,20.5],[1.4,20.4]])DC(46,a,b);
   for(const b of[5,8.5,10.5,12,15.5,17.5])DC(48,1.4,b);for(const b of[4.5,6.5,12,14,15.5,19])DC(48,22.6,b);
   for(const[a,b]of[[3.5,5.5],[20.5,10.5],[3.5,17.5],[20.5,18.5]])DC(49,a,b);
   DC(50,15.6,2.9);DC(50,8.4,21.1);DC(47,6.5,1.5);DC(47,17.5,22.5)}},
 // --- Ultimative Kampf Arena Bonn: Nacht-Stadion mit Ring, Tribuenen, LED-Waenden ---
 {nm:'Ultimative Kampf Arena Bonn',bt:8,jp:[[11,11],[3,11],[20,12],[11,3],[12,20]],es:[[12,2.5],[2.5,12],[21.5,12],[12,21.5]],o:{sky:1,fog:.06},
  th:{f:[[30,20,40],[40,26,52],[16,10,22]],c:[[10,6,20],[10,6,20],[10,6,20]]},
  b:()=>{R(10,0,4,1,10);R(10,23,4,1,10);R(0,10,1,4,10);R(23,10,1,4,10);
   FL(1,1,22,22,7);FL(8,8,8,8,6);FL(7,7,10,1,5);FL(7,16,10,1,5);FL(7,7,1,10,5);FL(16,7,1,10,5);
   FL(1,11,6,2,5);FL(17,11,6,2,5);FL(11,1,2,6,5);FL(11,17,2,6,5);
   for(const[a,b]of[[7,7],[16,7],[7,16],[16,16]])G[b*N+a]=9;
   R(4,4,3,1,11);R(4,5,1,2,11);R(17,4,3,1,11);R(19,5,1,2,11);R(4,19,3,1,11);R(4,17,1,2,11);R(17,19,3,1,11);R(19,17,1,2,11);
   for(const[a,b]of[[1.5,1.5],[22.5,1.5],[1.5,22.5],[22.5,22.5]])DC(51,a,b);
   for(const[a,b]of[[9.5,5.5],[14.5,5.5],[9.5,18.5],[14.5,18.5],[5.5,9.5],[5.5,14.5],[18.5,9.5],[18.5,14.5]])DC(52,a,b)}}];
let cur=0,th,PLT=null;
function loadMap(i){cur=i;const M=MAPS[i],t=M.bt||1;G.fill(0);B.fill(0);FG.fill(0);DECO=[];R(0,0,N,1,t);R(0,N-1,N,1,t);R(0,0,1,N,t);R(N-1,0,1,N,t);M.b();ESP=M.es;th=M.th;OUT=M.o||null;FOG=OUT?OUT.fog:.13;PLT=null;for(const d of DECO)if(DBLK[d.t])B[(d.y|0)*N+(d.x|0)]=1;JP=(M.jp||[]).filter(q=>!G[q[1]*N+q[0]]&&!B[q[1]*N+q[0]]);for(const q of JP)FG[q[1]*N+q[0]]=8}
const SP=[[2.5,2.5],[21.5,2.5],[2.5,21.5],[21.5,21.5]],A0=[.785,2.356,-.785,-2.356];
let ESP;loadMap(0);
const wl=(a,b)=>G[(b|0)*N+(a|0)]!=0;
const sol=(a,b)=>{const k=(b|0)*N+(a|0);return G[k]!=0||B[k]!=0};
const can=(a,b,r)=>!sol(a-r,b-r)&&!sol(a+r,b-r)&&!sol(a-r,b+r)&&!sol(a+r,b+r);
function cast(px,py,rx,ry){
 let mx=px|0,my=py|0,ddx=Math.abs(1/rx),ddy=Math.abs(1/ry),sx,sy,sdx,sdy,side=0,t=1;
 if(rx<0){sx=-1;sdx=(px-mx)*ddx}else{sx=1;sdx=(mx+1-px)*ddx}
 if(ry<0){sy=-1;sdy=(py-my)*ddy}else{sy=1;sdy=(my+1-py)*ddy}
 for(let i=0;i<64;i++){
  if(sdx<sdy){sdx+=ddx;mx+=sx;side=0}else{sdy+=ddy;my+=sy;side=1}
  if(mx<0||my<0||mx>=N||my>=N)break;
  t=G[my*N+mx];if(t)break;
 }
 const d=side?sdy-ddy:sdx-ddx;let wx=side?px+d*rx:py+d*ry;
 return{d,side,t:t||1,wx:wx-Math.floor(wx)};
}
// ---------- Waffen ----------
const WP=[
 {nm:'FAUST',cd:.5,d:20,n:1,sp:0,rg:1.4,am:0},
 {nm:'PISTOLE',cd:.35,d:14,n:1,sp:.03,rg:40,am:0,ads:.25},
 {nm:'SHOTGUN',cd:.9,d:10,n:8,sp:.16,rg:40,am:1,ads:.65},
 {nm:'MASCHINENGEWEHR',cd:.09,d:9,n:1,sp:.06,rg:40,am:1,ads:.4},
 {nm:'RAKETENWERFER',cd:.9,pr:3,v:10,am:1},
 {nm:'PLASMA',cd:.12,pr:4,v:15,am:1},
 {nm:'BFG',cd:1.6,pr:12,v:8,am:1},
 {nm:'SNIPER',cd:1.1,d:90,n:1,sp:.06,rg:60,am:1,ads:0},
 {nm:'REVOLVER',cd:.5,d:38,n:1,sp:.035,rg:40,am:1,ads:.15},
 {nm:'FLAMMENWERFER',cd:.05,d:3.5,n:3,sp:.3,rg:4.5,am:1},
 {nm:'GRANATENWERFER',cd:.8,pr:18,v:9,am:1,l:1.1},
 {nm:'BLITZPISTOLE',cd:.45,d:22,n:1,sp:0,rg:12,am:1,ch:1},
 {nm:'RAILGUN',cd:1.4,d:70,n:1,sp:.04,rg:60,am:1,pi:1,ads:0},
 {nm:'STURMGEWEHR',cd:.12,d:17,n:1,sp:.045,rg:50,am:1,ads:.12},
 {nm:'MASCHINENPISTOLE',cd:.065,d:8,n:1,sp:.075,rg:30,am:1,ads:.5},
 {nm:'ARMBRUST',cd:.85,pr:72,v:24,am:1,pd:75},
 {nm:'MINIGUN',cd:.045,d:8,n:1,sp:.08,rg:40,am:1,su:1,ads:.6}];
const SN=['FAUST','PISTOLE','SHOTGUN','MG','RAKETE','PLASMA','BFG','SNIPER','REVOLVER','FLAMME','GRANATE','BLITZ','RAIL','AK','UZI','ARMBRUST','MINIGUN'],
 DS=['','unendlich Munition','8 Schrot, nah stark','schnelles Dauerfeuer','Flächenschaden','schneller Strahl','riesige Explosion','1 Schuss, 90 Schaden','langsam, hart','kurze Reichweite','explodiert nach Flug','springt auf Gegner über','durchschlägt alle','präzise beim Zielen','sehr schnell, streut','Bolzen durchschlägt Gegner','muss erst anlaufen'];
const owned=lo=>WP.map((_,i)=>i).filter(i=>lo>>i&1),firstW=lo=>{const L=owned(lo);return L.length>1?L[1]:0};
const MX=[0,0,50,200,25,200,10,20,60,300,20,80,12,180,300,30,400],AM0=()=>[0,0,8,40,3,50,0,5,24,100,5,30,3,60,90,10,150];
// ---------- Zustand (Host simuliert) ----------
const players=[0,1,2,3].map(i=>({i,on:i==0,x:SP[i][0],y:SP[i][1],a:A0[i],al:true,hp:100,w:1,lo:63,f:0,cd:0,rt:0,sc:0,rc:0,ar:0,am:AM0()}));
let E=[],J=[],PK=[],NJ=[],wave=0,toSpawn=0,spawnT=0,waitT=3,S=null,mode=0,id=0,me=players[0];
let dm=0,pkT=3,best=+(()=>{try{return localStorage.hfBest}catch(e){}})()||0,EV=[],bn=0,lastWv=-1,dif=1,dmg=1,hostCode='',bob=0,showMap=1,dt=.016,lc=0,fl=0,rec=0,hurtFl=0,lastHp=100,lost=0,snapT=0;
const chs=[];let pend=null,ch=null;
// Koop: alle 5 Wellen ein Boss, der Reihe nach (30-35 = Story-Bosse, 19 = Jxhn2K)
const CB=[30,31,32,33,34,19,35],coopBoss=w=>CB[((w/5|0)+CB.length-1)%CB.length],bossName=t=>t==19?'Jxhn2K':t==10?'LIL M':BOSS[t-29].nm;
function LV(){return story?SS.lv:Math.min(6,1+(wave/5|0))}
function hurtP(p,d){if(!p.al||p.iv>0)return;d*=dmg;if(p.ar>0){const a=Math.min(p.ar,d*.5);p.ar-=a;d-=a}p.hp-=d;if(p.hp<=0){p.hp=0;p.al=false;p.rt=dm||story?3:5}}
function spawnSpot(p){
 const C=[...SP,...ESP];for(let k=0;k<40;k++){const a=1.5+Math.random()*(N-3),b=1.5+Math.random()*(N-3);if(can(a,b,.4))C.push([a,b])}
 const sc=C.map(c=>{let d=99;for(const e of E)if(!e.dead)d=Math.min(d,Math.hypot(e.x-c[0],e.y-c[1]));for(const j of J)if(j.o<0)d=Math.min(d,Math.hypot(j.x-c[0],j.y-c[1])+1);
   if(dm)for(const q of players)if(q!==p&&q.on&&q.al)d=Math.min(d,Math.hypot(q.x-c[0],q.y-c[1]));
   if(p.lx!=null)d=Math.min(d,Math.hypot(p.lx-c[0],p.ly-c[1])+2);   // nicht wieder dort, wo man zuletzt erschienen ist
   return[d,c]}).sort((a,b)=>b[0]-a[0]);
 return sc[Math.random()*Math.min(4,sc.length)|0][1];   // einer der 4 sichersten Punkte, zufaellig
}
function resp(p){const c=spawnSpot(p);p.al=true;p.hp=100;p.x=c[0];p.y=c[1];p.lx=c[0];p.ly=c[1];p.a=Math.atan2(N/2-c[1],N/2-c[0]);p.rc++;p.ar=0;p.iv=story?2.5:2;if(story){storyAmmo(p);return}p.w=firstW(p.lo);p.am=AM0()}
function hurtE(e,d,o,q){if(e.dead)return;{const ow=players[o];if(ow&&ow.ua>0){if(ow.uk==1)d*=2;else if(ow.uk==4&&ow.al)ow.hp=Math.min(100,ow.hp+Math.min(d,120)*.3)}}   // Jackpot / Wolfsrausch
 e.hp-=d;if(!q){e.fl=.1;if(e.hp>0)ev(0)}if(e.hp<=0){e.dead=1;ev(1);if(story)storyKill(e);if(players[o])players[o].sc+=e.t>=30?500:e.t==19?250:e.t==10?100:e.t==1?15:10;const q=Math.random();if(e.t==10||e.t==19||e.t>=30)PK.push({x:e.x-.4,y:e.y,t:6},{x:e.x+.4,y:e.y,t:7},{x:e.x,y:e.y+.4,t:11});else if(q<.45)PK.push({x:e.x,y:e.y,t:q<.2?6:q<.35?7:11})}}
function shoot(p,a,w){
 const rx=Math.cos(a),ry=Math.sin(a);let bd=Math.min(cast(p.x,p.y,rx,ry).d,w.rg),best=null;const wd=bd;
 for(const e of E){if(e.dead||e.br>0)continue;const vx=e.x-p.x,vy=e.y-p.y,al=vx*rx+vy*ry;
  if(al<0||al>bd)continue;if(Math.abs(vx*ry-vy*rx)<e.r){best=e;bd=al}}
 if(w.pi){for(const e of E){if(e.dead||e.br>0)continue;const vx=e.x-p.x,vy=e.y-p.y,al=vx*rx+vy*ry;if(al>0&&al<wd&&Math.abs(vx*ry-vy*rx)<e.r)hurtE(e,w.d,p.i)}}
 else if(best){const bx=best.x,by=best.y;hurtE(best,w.d,p.i);if(w.ch){let c=0;for(const o of E){if(o===best||o.dead||c>=2)continue;if(Math.hypot(o.x-bx,o.y-by)<3.5){hurtE(o,w.d*.6,p.i);c++}}}}
 if(dm){let bp=null;for(const q of players){if(q===p||!q.on||!q.al)continue;const vx=q.x-p.x,vy=q.y-p.y,al=vx*rx+vy*ry;if(al<0||al>bd)continue;if(Math.abs(vx*ry-vy*rx)<.3){bp=q;bd=al}}if(bp)hitP(bp,w.d,p.i)}
}
function fire(p){
 const w=WP[p.w];if(!w)return;
 if(!(p.lo>>p.w&1)){p.cd=.2;return}
 if(w.su&&!(p.spn>=1)){p.cd=0;return}
 if(w.am&&p.am[p.w]<=0){p.cd=.3;return}
 if(w.am)p.am[p.w]--;p.cd=w.cd*(p.ua>0&&p.uk==1?.62:1);
 if(w.pr){J.push({x:p.x+Math.cos(p.a)*.4,y:p.y+Math.sin(p.a)*.4,vx:Math.cos(p.a)*w.v,vy:Math.sin(p.a)*w.v,t:w.pr,o:p.i,l:w.l||3,pd:w.pd,pc:w.pd?1:0,rr:w.pd?.15:0});return}
 const sp=w.sp*((p.ads||p.ad)?(w.ads!=null?w.ads:.3):1);   // beim Zielen genauer
 for(let k=0;k<w.n;k++)shoot(p,p.a+(Math.random()-.5)*sp*2,w);
}
function boom(j){
 if(j.t==24){for(const q of players){if(!q.on||!q.al)continue;const d=Math.hypot(q.x-j.x,q.y-j.y);if(d<2.2)hurtP(q,(j.d||30)*(1-d/2.6))}ev(2);NJ.push({x:j.x,y:j.y,vx:0,vy:0,t:5,o:-1,l:.35});return}
 const R=j.ex||(j.t==12?6:j.t==18?3.2:2.5),D=j.ex?j.xd:j.t==12?400:j.t==18?95:110;
 for(const e of E){const d=Math.hypot(e.x-j.x,e.y-j.y);if(d<R)hurtE(e,D*(1-d/R),j.o)}
 if(dm)for(const q of players){if(!q.on||!q.al)continue;const d=Math.hypot(q.x-j.x,q.y-j.y);if(d<R)hitP(q,D*(1-d/R)*(q.i==j.o?.5:1),j.o)}
 ev(2);NJ.push({x:j.x,y:j.y,vx:0,vy:0,t:5,o:j.o,l:.35});
}
function move(e,ux,uy,s){
 if(e.sl>0)s*=.3;
 const b=Math.atan2(uy,ux);
 for(const k of[0,.7,-.7,1.4,-1.4]){const nx=e.x+Math.cos(b+k)*s,ny=e.y+Math.sin(b+k)*s;
  if(can(nx,ny,e.r*.8)){e.x=nx;e.y=ny;return}}
}
function mk(t,at){const s=at||ESP[Math.random()*4|0];if(t>=20){const o=storyEnemy(t,s);o.id=++EID;E.push(o);return}const w=wave,T={0:[40+w*3,.35,1.7],1:[90+w*5,.45,3],9:[25+w*2,.3,4.6],10:[500+w*45,.6,1.3],19:[800+w*70,.62,1.5],13:[70+w*4,.4,3.6],14:[35+w*2,.32,4.4],15:[65+w*4,.34,1.9],16:[80+w*4,.36,2.1],17:[130+w*7,.4,2.4]}[t];
 E.push({id:++EID,x:s[0],y:s[1],t,hp:T[0]*dif,r:T[1],sp:T[2],fl:0,cd:1,dead:0,ph:Math.random()*6,mh:T[0]*dif})}
function sim(dt){
 for(const p of players){if(!p.on)continue;p.cd-=dt;
  if(p.iv>0)p.iv-=dt;
  if(!p.al){p.rt-=dt;if(p.rt<=0){if(!story)resp(p);else if(SS.lives>0){SS.lives--;resp(p)}}continue}
  p.spn=WP[p.w]&&WP[p.w].su?(p.f?Math.min(1,(p.spn||0)+dt*1.7):Math.max(0,(p.spn||0)-dt*2)):0;   // Minigun dreht hoch
  if(p.f&&p.cd<=0)fire(p);
  p.qc=Math.max(0,(p.qc||0)-dt);if(p.qn!==p.qd){p.qd=p.qn;if(p.qc<=0)special(p)}
  PK=PK.filter(k=>{if(Math.hypot(k.x-p.x,k.y-p.y)>.6)return true;
   if(k.t==25)storyCoin(p);else if(k.t==7){if(p.hp>=100)return true;p.hp=Math.min(100,p.hp+25)}else if(k.t==11){if(p.ar>=100)return true;p.ar=Math.min(100,p.ar+35)}
   else{const G=[0,0,6,30,2,30,Math.random()<.3?1:0,3,12,60,2,12,Math.random()<.4?1:0,30,50,4,80];for(let w=2;w<WP.length;w++)if(p.lo>>w&1)p.am[w]=Math.min(MX[w],p.am[w]+G[w])}ev(3);
   return false});
 }
 ultTick(dt);
 const np=players.filter(p=>p.on).length;
 if(dm){pkT-=dt;if(pkT<=0&&PK.length<8){pkT=6;const s=ESP[Math.random()*4|0];PK.push({x:s[0]+Math.random()-.5,y:s[1]+Math.random()-.5,t:[6,7,11][Math.random()*3|0]})}}
 if(story)storyWaves(dt,np);else if(!dm&&!E.some(e=>!e.dead)&&toSpawn<=0){waitT-=dt;if(waitT<=0){wave++;toSpawn=2+wave*2+np*2;waitT=4;if(wave%5==0)mk(coopBoss(wave))}}
 if(toSpawn>0){spawnT-=dt;if(story)storySpawn();else if(spawnT<=0&&E.length<14){
  {const r=Math.random(),a=Math.min(.4,.08+wave*.05),b=Math.min(.25,.04+wave*.03);{const L=[16,14,20,21];if(wave>=2)L.push(13,22);if(wave>=4)L.push(17);mk(L[Math.random()*L.length|0])}}
  toSpawn--;spawnT=1.2}}
 for(const e of E){
  if(e.dead){e.dd=(e.dd||0)+dt;continue}
  e.fl-=dt;e.cd-=dt;
  if(e.sn>0){e.sn-=dt;e.mv=0;continue}   // betaeubt (saesix)
  if(e.sl>0)e.sl-=dt;                    // verlangsamt (Cola-Pfuetze)
  if(e.br>0){bribeAI(e,dt);continue}     // bestochen (Sh1no)
  let tp=null,bd=1e9;
  for(const p of players)if(p.on&&p.al){const d=Math.hypot(p.x-e.x,p.y-e.y);if(d<bd){bd=d;tp=p}}
  if(!tp)continue;
  const ux=(tp.x-e.x)/bd,uy=(tp.y-e.y)/bd,los=cast(e.x,e.y,ux,uy).d>bd;
  const ox=e.x,oy=e.y,pcd=e.cd;e.at=Math.max(0,(e.at||0)-dt);
  if(e.t>=20)storyAI(e,tp,bd,ux,uy,los,dt);
  else if(e.t==0||e.t==15||e.t==16){
   if(!(los&&bd<(e.t==0?5:6)))move(e,ux,uy,e.sp*dt);
   if(los&&bd<12&&e.cd<=0){ev(4);
    if(e.t==15){for(const k of[-.12,.12]){const c=Math.cos(k),s=Math.sin(k);J.push({x:e.x,y:e.y,vx:(ux*c-uy*s)*6,vy:(ux*s+uy*c)*6,t:27,o:-1,l:4})}e.cd=1.6}
    else if(e.t==16){J.push({x:e.x,y:e.y,vx:ux*7,vy:uy*7,t:26,o:-1,l:4});e.cd=1.1}
    else{J.push({x:e.x,y:e.y,vx:ux*5,vy:uy*5,t:2,o:-1,l:4});e.cd=2}}
  }else if(e.t==14){
   const z=Math.sin(e.ph*.6)*.9,c=Math.cos(z),s2=Math.sin(z);
   if(bd>.9)move(e,ux*c-uy*s2,ux*s2+uy*c,e.sp*dt);else if(e.cd<=0){hurtP(tp,8);e.cd=.5}
  }else if(e.t==10||e.t==19){const B2=e.t==19;
   if(!(los&&bd<7))move(e,ux,uy,e.sp*dt);
   if(!e.en&&e.hp<e.mh*.5){e.en=1;e.sp*=1.4;e.at=.3;ev(5)}
   e.rb=(e.rb===undefined?5:e.rb)-dt;
   if(e.rb<=0&&los){const n=B2?(e.en?28:20):(e.en?18:12);for(let k=0;k<n;k++){const a=k/n*6.283+e.ph;J.push({x:e.x,y:e.y,vx:Math.cos(a)*4.5,vy:Math.sin(a)*4.5,t:2,o:-1,l:4})}
    if(BOSS_HELPERS&&E.length<14){if(B2){mk(13);mk(17);if(e.en)mk(22)}else{mk(14);if(e.en)mk(16)}}e.rb=B2?(e.en?3:5):(e.en?4:6.5);e.at=.3;ev(5)}
   if(los&&e.cd<=0){for(const k of(B2?[-.5,-.25,0,.25,.5]:[-.25,0,.25])){const c=Math.cos(k),s=Math.sin(k);J.push({x:e.x,y:e.y,vx:(ux*c-uy*s)*6,vy:(ux*s+uy*c)*6,t:B2?37:2,o:-1,l:4})}e.cd=1.4}
   if(bd<1.2&&e.cd<=.5){hurtP(tp,B2?35:25);e.cd=1}
  }else{if(bd>.9)move(e,ux,uy,e.sp*dt);else if(e.cd<=0){hurtP(tp,e.t==9?10:e.t==13?18:e.t==17?20:15);e.cd=e.t==13?.6:.8}}
  const mvd=Math.hypot(e.x-ox,e.y-oy);e.ph+=mvd*4;e.mv=mvd>0?1:0;if(e.cd>pcd+.1)e.at=.3;
 }
 J=J.filter(j=>{
  if(j.t==5){j.l-=dt;return j.l>0}
  if(j.kill)return false;
  if(j.vis){j.x+=j.vx*dt;j.y+=j.vy*dt;j.l-=dt;return j.l>0}           // nur Effekt
  if(j.fz!=null){j.fz-=dt*7;if(j.fz>0)return true;boom(j);return false} // fallender Stein (Steinhagel)
  if(j.bm){const o=players[j.o];j.bt=(j.bt||0)+dt;                      // Bumerang (Kerimsi)
   if(!j.back&&(j.bt>.6||wl(j.x+j.vx*dt,j.y+j.vy*dt))){j.back=1;j.hs=[]}
   if(j.back){if(!o||!o.al)return false;const dx=o.x-j.x,dy=o.y-j.y,d=Math.hypot(dx,dy);if(d<.5)return false;j.vx=dx/d*15;j.vy=dy/d*15}}
  if(j.t==29){let tp=null,bd=9;for(const p of players)if(p.on&&p.al){const d=Math.hypot(p.x-j.x,p.y-j.y);if(d<bd){bd=d;tp=p}}   // Giftschaedel verfolgt
   if(tp){const v=Math.hypot(j.vx,j.vy),a=Math.atan2(j.vy,j.vx);let da=Math.atan2(tp.y-j.y,tp.x-j.x)-a;da=Math.atan2(Math.sin(da),Math.cos(da));const na=a+Math.max(-1.5*dt,Math.min(1.5*dt,da));j.vx=Math.cos(na)*v;j.vy=Math.sin(na)*v}}
  else if(j.t==36){j.w=(j.w||0)+dt*8;const v=Math.hypot(j.vx,j.vy)||1,k=Math.cos(j.w)*2.4*dt;j.x-=j.vy/v*k;j.y+=j.vx/v*k}   // Musiknoten fliegen in Schlangenlinie
  if(j.hm){let tg=null,bd=9;for(const e of E)if(!e.dead){const d=Math.hypot(e.x-j.x,e.y-j.y);if(d<bd){bd=d;tg=e}}if(dm)for(const q of players)if(q.on&&q.al&&q.i!==j.o){const d=Math.hypot(q.x-j.x,q.y-j.y);if(d<bd){bd=d;tg=q}}
   if(tg){const v=Math.hypot(j.vx,j.vy),a=Math.atan2(j.vy,j.vx);let da=Math.atan2(tg.y-j.y,tg.x-j.x)-a;da=Math.atan2(Math.sin(da),Math.cos(da));const na=a+Math.max(-4*dt,Math.min(4*dt,da));j.vx=Math.cos(na)*v;j.vy=Math.sin(na)*v}}
  j.x+=j.vx*dt;j.y+=j.vy*dt;j.l-=dt;let hit=(!j.back&&wl(j.x,j.y))||j.l<=0;
  if(j.o<0){for(const p of players)if(p.on&&p.al&&!(p.z>.25&&j.t!=24)&&Math.hypot(p.x-j.x,p.y-j.y)<.4){hurtP(p,j.d||12);hit=1}}
  else for(const e of E)if(!e.dead&&!(e.br>0)&&Math.hypot(e.x-j.x,e.y-j.y)<e.r+(j.rr||.1)){if(j.pc){if((j.hs=j.hs||[]).includes(e.id))continue;j.hs.push(e.id);hurtE(e,j.pd,j.o);if(j.br)bribe(e,j.o);continue}if(j.pd)hurtE(e,j.pd,j.o);else if(j.t==4)hurtE(e,16,j.o);hit=1;break}
  if(dm&&j.o>=0)for(const q of players)if(q.on&&q.al&&q.i!==j.o&&Math.hypot(q.x-j.x,q.y-j.y)<.4){if(j.pd)hitP(q,j.pd*.5,j.o);else if(j.t==4)hitP(q,16,j.o);hit=1}
  if(hit&&j.pu){if(sol(j.x,j.y)){j.x-=j.vx*.06;j.y-=j.vy*.06}ZN.push({x:j.x,y:j.y,r:2.4,l:6,k:3,o:j.o,tk:0});ev(2);return false}   // Cola-Pfuetze
  if(hit){if(j.ex||j.t==3||j.t==12||j.t==18||j.t==24)boom(j);return false}
  return true});
 J.push(...NJ);NJ=[];E=E.filter(e=>!e.dead||(e.dd||0)<.9);
}
// ---------- Audio ----------
let AC,mst,nb,muted=0,paused=0,hm=0,shk=0;const TR=[],PT=[];
function ac(){if(!AC){AC=new AudioContext();mst=AC.createGain();mst.gain.value=.85;const c=AC.createDynamicsCompressor();mst.connect(c);c.connect(AC.destination);
 nb=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
 if(AC.state=='suspended')AC.resume();return AC}
function tone(f0,f1,d,ty,v,dl){if(muted)return;try{ac();const t=AC.currentTime+(dl||0),o=AC.createOscillator(),g=AC.createGain();o.type=ty;
 o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 o.connect(g);g.connect(mst);o.start(t);o.stop(t+d+.02)}catch(e){}}
function nz(d,ty,f0,f1,v,dl,q){if(muted)return;try{ac();const t=AC.currentTime+(dl||0),s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=nb;f.type=ty;f.Q.value=q||1;
 f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 s.connect(f);f.connect(g);g.connect(mst);s.start(t,Math.random()*.5);s.stop(t+d+.02)}catch(e){}}
function gun(w){if(typeof sfx=='function'&&sfx(w))return;switch(w){
 case 0:nz(.12,'bandpass',600,200,.25);tone(120,50,.12,'sine',.35);break;
 case 1:nz(.06,'highpass',2800,2800,.35);nz(.12,'bandpass',1500,400,.25);tone(240,55,.14,'sine',.45);break;
 case 2:nz(.5,'lowpass',4200,180,.75);nz(.07,'highpass',1800,1800,.45);tone(110,28,.4,'sine',.8);tone(60,25,.45,'sawtooth',.2);nz(.25,'bandpass',700,200,.3,.12);break;
 case 3:nz(.05,'highpass',2200,2200,.3);nz(.08,'bandpass',1300,500,.22);tone(170,70,.06,'square',.14);break;
 case 4:nz(.7,'bandpass',300,2400,.4);tone(85,30,.45,'sawtooth',.4);nz(.1,'lowpass',2500,300,.5);break;
 case 5:tone(1700,170,.14,'square',.11);tone(950,120,.22,'sine',.22);nz(.05,'highpass',5000,5000,.08);break;
 case 6:tone(50,420,.55,'sawtooth',.3);tone(320,40,.9,'square',.14,.15);nz(.9,'lowpass',3200,100,.5,.1);break
 case 7:nz(.08,'highpass',3000,3000,.4);nz(.5,'lowpass',3500,150,.6);tone(140,30,.5,'sine',.7);tone(900,200,.25,'sawtooth',.1);break
 case 8:nz(.06,'highpass',2400,2400,.35);nz(.2,'lowpass',2500,200,.5);tone(130,40,.25,'sine',.6);break
 case 9:nz(.12,'bandpass',900,600,.18,0,.7);nz(.1,'lowpass',2500,500,.15);break
 case 10:tone(150,50,.2,'sine',.5);nz(.15,'lowpass',1800,200,.4);tone(500,250,.12,'square',.1);break
 case 11:tone(1200,200,.12,'sawtooth',.14);nz(.12,'highpass',4000,4000,.15);tone(60,60,.1,'square',.1);break
 case 12:tone(2000,100,.35,'sine',.3);tone(60,300,.2,'sawtooth',.2);nz(.35,'bandpass',3000,300,.3);break}}
function click(){tone(900,650,.03,'square',.08)}
function hurtSnd(){tone(150,45,.22,'sawtooth',.4);nz(.14,'lowpass',1300,200,.4)}
function jingle(b){if(b){tone(110,95,.6,'sawtooth',.3);tone(104,88,.6,'sawtooth',.18,.15);nz(.6,'lowpass',700,90,.4)}else{tone(440,440,.1,'square',.1);tone(660,660,.16,'square',.1,.1)}}
function spark(n,c){for(let k=0;k<n;k++){const a=Math.random()*6.28,s=40+Math.random()*90;PT.push({x:VW/2,y:VH/2,vx:Math.cos(a)*s,vy:Math.sin(a)*s-20,g:200,l:.2+Math.random()*.2,c:c||'#fd6'})}}
function shotFx(w){shk=Math.max(shk,([0,.6,2.4,.8,2.2,.3,3.6,3,1.4,.3,1.8,.6,3.2,1,.5,1.3,.6][w]||0));
 if(w==7||w==8){TR.push({l:.1,m:.1,c:w==7?'#fff':'#ffd',w:w==7?2:1.5,ox:3,tx:0,ty:0});spark(w==7?8:5)}
 if(w==9)for(let k=0;k<5;k++)PT.push({x:VM.mx+(Math.random()-.5)*10,y:VM.my+10,vx:(Math.random()-.5)*50,vy:-(120+Math.random()*120),g:-10,l:.25+Math.random()*.15,c:Math.random()<.5?'#f80':'#fd3',s:3+Math.random()*3});
 if(w==11){TR.push({l:.12,m:.12,c:'#6cf',w:2,ox:2,tx:(Math.random()-.5)*10,ty:(Math.random()-.5)*10});TR.push({l:.12,m:.12,c:'#fff',w:1,ox:2,tx:(Math.random()-.5)*10,ty:(Math.random()-.5)*10});spark(6,'#6cf')}
 if(w==12){TR.push({l:.3,m:.3,c:'#4ef',w:4,ox:0,tx:0,ty:0});TR.push({l:.3,m:.3,c:'#fff',w:1.5,ox:0,tx:0,ty:0});spark(10,'#8ef')}
 if(w==1||w==3){TR.push({l:.07,m:.07,c:'#ffd',w:1.5,ox:3,tx:(Math.random()-.5)*4,ty:(Math.random()-.5)*4});spark(5)}
 if(w==2){for(let k=0;k<8;k++)TR.push({l:.09,m:.09,c:'#fc8',w:1,ox:(k-4)*2,tx:(Math.random()-.5)*70,ty:(Math.random()-.5)*40});spark(10)}}
function play(k){if(k==0){hm=.15;spark(6,'#c22')}
 if(k==1){tone(380,50,.35,'sawtooth',.25);nz(.3,'lowpass',1800,150,.35)}
 else if(k==0){nz(.07,'bandpass',900,300,.3);tone(260,90,.08,'triangle',.3)}
 else if(k==2){shk=Math.max(shk,4);nz(.8,'lowpass',1500,80,.8);tone(75,22,.7,'sine',.9);tone(120,30,.5,'sawtooth',.25)}
 else if(k==3){tone(660,660,.08,'sine',.2);tone(990,990,.08,'sine',.2,.07);tone(1320,1320,.14,'sine',.2,.14)}
 else if(k==4){tone(700,260,.1,'square',.08);nz(.05,'bandpass',2000,800,.1)}
 else if(k==5){shk=Math.max(shk,3);tone(90,45,1,'sawtooth',.35);tone(70,35,1,'square',.2);nz(.9,'lowpass',900,100,.5)}
 else if(k==7){[330,392,659,523,587,784].forEach((f,i)=>tone(f,f,.11,'square',.14,i*.1))}
 else if(k==8){[392,523,659,784,659,784,1047].forEach((f,i)=>tone(f,f,i==6?.6:.14,'square',.16,i*.14));[196,262,330,392].forEach((f,i)=>tone(f,f,.5,'triangle',.2,i*.28))}
 else if(k==9){[392,370,349,330,262,196].forEach((f,i)=>tone(f,f*.97,i==5?.9:.22,'triangle',.25,i*.22))}
 else if(k==10){tone(260,980,.2,'sawtooth',.11);tone(130,620,.28,'triangle',.12);nz(.18,'bandpass',1800,600,.12)}}
function star(cx,cy,r){const n=8;for(const[rr,c]of[[r,'#fa2'],[r*.55,'#fff']]){x.fillStyle=c;x.beginPath();for(let k=0;k<n*2;k++){const a=k*Math.PI/n+performance.now()%7,d=k&1?rr*.4:rr*(.7+.3*Math.random());x.lineTo(cx+Math.cos(a)*d,cy+Math.sin(a)*d)}x.closePath();x.fill()}}
function ev(k){EV.push(k);play(k)}
function hitP(q,d,o){const was=q.al;hurtP(q,d);if(was&&!q.al&&q.i!==o&&players[o])players[o].sc+=1}
// ---------- Netzwerk (WebRTC, Codes per Copy&Paste) ----------
const cfg={iceServers:[]},enc=d=>btoa(JSON.stringify(d)),dec=s=>JSON.parse(atob(s.trim()));
const waitIce=pc=>new Promise(r=>{if(pc.iceGatheringState=='complete')return r();pc.onicegatheringstatechange=()=>pc.iceGatheringState=='complete'&&r();setTimeout(r,4000)});
const rnd=(k,v)=>typeof v=='number'?Math.round(v*100)/100:v;
const ul=()=>{$('pl').textContent=players.map(p=>'P'+(p.i+1)+': '+(p.on?'verbunden':'frei')).join(' | ');$('pl2').textContent=players.map(p=>'Spieler '+(p.i+1)+': '+(p.i==0?'du':p.on?'verbunden \u2714':'frei')).join('  |  ')};
const HC={set t(v){for(const k of['hc','hc2'])document.getElementById(k).textContent=v}};
function hostMode(){$('m0').style.display='none';$('mh').style.display='block';ul();mkPeer()}
function joinMode(){$('m0').style.display='none';$('mj').style.display='block'}
// Platz fuer einen neuen Mitspieler: frei und nicht gerade von einem anderen Beitritt reserviert (wichtig bei 3-4 Spielern)
const rsv=[0,0,0,0],freeSlot=()=>{const i=players.findIndex((p,i)=>i&&!p.on&&rsv[i]<Date.now());if(i>0)rsv[i]=Date.now()+20000;return i};
async function invite(){
 const slot=freeSlot();if(slot<0){alert(trs('Alle Plätze belegt'));return}
 if(pend){try{pend.pc.close()}catch(e){}rsv[pend.slot]=0}
 const pc=new RTCPeerConnection(cfg),c=pc.createDataChannel('g');pend={pc,slot};
 c.onopen=()=>{if(pend&&pend.pc===pc)pend=null;players[slot].on=true;chs[slot]=c;c.send(JSON.stringify({t:'hi',id:slot}));ul()};
 c.onmessage=e=>{const m=JSON.parse(e.data),p=players[slot];
  if(p.al&&m.c===p.rc&&(m.tp|0)===(p.tp|0)&&can(m.x,m.y,.2)){p.x=m.x;p.y=m.y}p.a=m.a;p.ad=m.ad|0;p.z=+m.z||0;p.f=m.f;p.w=m.w;if(!story)p.lo=(m.l|1)&131071;p.nm=String(m.n||"").slice(0,10);p.ch=m.h|0;if(m.q)p.qn=m.q;if(m.k!==p.k){p.k=m.k;if(story&&SS)SS.cf=1}};
 c.onclose=()=>{players[slot].on=false;chs[slot]=null;rsv[slot]=0;ul()};
 await pc.setLocalDescription(await pc.createOffer());await waitIce(pc);$('oc').value=enc(pc.localDescription);
}
async function accept(){if(!pend){alert(trs('Erst auf „Mitspieler einladen“ klicken.'));return}try{await pend.pc.setRemoteDescription(dec($('ia').value));$('ia').value=''}catch(e){alert('Fehler: '+e.message)}}
async function join(){
 try{
  const pc=new RTCPeerConnection(cfg);
  pc.ondatachannel=e=>{ch=e.channel;ch.onmessage=ev=>{const m=JSON.parse(ev.data);
   if(m.t=='hi'){id=m.id;me={x:0,y:0,a:0,w:firstW(LO|1),lo:LO|1,f:0,rc:-1};mode=2;$('m').style.display='none';
    setInterval(()=>{if(ch.readyState=='open')ch.send(JSON.stringify({x:me.x,y:me.y,a:me.a,f:me.f,w:me.w,c:me.rc,l:me.lo,n:$('nm').value.slice(0,10),h:myCh,k:me.k|0,z:me.z||0,q:me.qn|0,tp:me.tp|0,ad:me.ads|0},rnd))},33)}
   else if(m.t=='s'){S=m;(m.ev||[]).forEach(play)}};ch.onclose=()=>lost=1};
  await pc.setRemoteDescription(dec($('ic').value));await pc.setLocalDescription(await pc.createAnswer());await waitIce(pc);
  $('oc2').value=enc(pc.localDescription);
 }catch(e){alert('Fehler: '+e.message)}
}
function mkPeer(){
 if(typeof Peer=='undefined'){HC.t='(offline)';return}
 const A='ABCDEFGHJKLMNPQRSTUVWXYZ',code=[0,1,2,3].map(()=>A[Math.random()*A.length|0]).join('');
 const pr=new Peer('HFL-'+code);
 pr.on('open',()=>{hostCode=code;HC.t=code});
 pr.on('connection',hostConn);pr.on('disconnected',()=>{HC.t='...';setTimeout(()=>{try{if(!pr.destroyed)pr.reconnect()}catch(e){}},2500)});
 pr.on('error',e=>{if(e.type=='unavailable-id')mkPeer();else HC.t='Fehler: '+e.type});
}
function hostConn(c){
 const slot=freeSlot();
 if(slot<0){c.on('open',()=>{c.send(JSON.stringify({t:'full'}));setTimeout(()=>c.close(),300)});return}
 c.on('open',()=>{players[slot].on=true;chs[slot]=c;c.send(JSON.stringify({t:'hi',id:slot}));ul()});
 c.on('data',d=>{const m=JSON.parse(d),p=players[slot];
  if(p.al&&m.c===p.rc&&(m.tp|0)===(p.tp|0)&&can(m.x,m.y,.2)){p.x=m.x;p.y=m.y}p.a=m.a;p.ad=m.ad|0;p.z=+m.z||0;p.f=m.f;p.w=m.w;if(!story)p.lo=(m.l|1)&131071;p.nm=String(m.n||"").slice(0,10);p.ch=m.h|0;if(m.q)p.qn=m.q;if(m.k!==p.k){p.k=m.k;if(story&&SS)SS.cf=1}});
 c.on('close',()=>{players[slot].on=false;chs[slot]=null;rsv[slot]=0;ul()});
}
function onNet(m){
 if(m.t=='hi'&&!mode){id=m.id;me={x:0,y:0,a:0,w:firstW(LO|1),lo:LO|1,f:0,rc:-1};mode=2;$('m').style.display='none';
  setInterval(()=>{if(ch.open)ch.send(JSON.stringify({x:me.x,y:me.y,a:me.a,f:me.f,w:me.w,c:me.rc,l:me.lo,n:$('nm').value.slice(0,10),h:myCh,k:me.k|0,z:me.z||0,q:me.qn|0,tp:me.tp|0,ad:me.ads|0},rnd))},33)}
 else if(m.t=='s'){S=m;(m.ev||[]).forEach(play)}else if(m.t=='full')$('js2').textContent='Spiel ist voll';
}
function joinCode(tries){
 tries=tries||0;
 const raw=$('jc').value.toUpperCase().replace(/[^A-Z]/g,''),code=raw.slice(-4),st=$('js2');
 if(raw.length<4){st.textContent='Bitte den 4-stelligen Raum-Code eingeben';return}
 if(typeof Peer=='undefined'){st.textContent='Bibliothek nicht geladen (kein Internet?) - nutze die manuellen Codes';return}
 st.textContent='Verbinde mit Raum '+code+'...';
 const pr=new Peer();
 pr.on('open',()=>{const c=pr.connect('HFL-'+code,{reliable:true});ch=c;
  c.on('open',()=>{st.textContent='Verbunden, warte auf Start...'});
  c.on('data',d=>onNet(JSON.parse(d)));c.on('close',()=>{if(mode)lost=1});
  c.on('error',e=>{st.textContent='Verbindungsfehler: '+e.type});
  setTimeout(()=>{if(!c.open&&!mode)st.textContent='Raum gefunden, aber noch keine Datenverbindung (Firewall/Netz?). Es wird weiter versucht...'},10000)});
 pr.on('error',e=>{
  if(e.type=='peer-unavailable'){
   if(tries<3){st.textContent='Raum '+code+' nicht gefunden, neuer Versuch...';pr.destroy();setTimeout(()=>joinCode(tries+1),2000)}
   else st.textContent='Raum '+code+' nicht gefunden. Der Host muss zuerst auf "Host / Solo" geklickt haben und seinen Code sehen. Code und Internet bei beiden prüfen.'}
  else st.textContent='Fehler: '+e.type+' '+(e.message||'')});
}
function startGame(){loadMap(+$('mp').value);const D=+$('df').value;dif=[.7,1,1.5][D];dmg=[.6,1,1.4][D];dm=+$('gm').value;if(dm)dmg=1;players[0].nm=$('nm').value.slice(0,10);players[0].lo=LO|1;players[0].w=firstW(LO|1);players[0].ch=myCh;story=0;mode=1;$('m').style.display='none';cv.requestPointerLock()}
// ---------- Eingabe ----------
$('mf').onchange=e=>{const f=e.target.files[0];if(!f)return;BG.src=URL.createObjectURL(f);BG.play().catch(()=>{})};
const bgVol=()=>{BG.volume=Math.min(1,$('mv').value/100*(story||(S&&S.st)?2.2:1))};$('mv').oninput=bgVol;
let LO=(()=>{try{return +localStorage.hfInv||3}catch(e){return 3}})()|3;   // freigeschaltete Waffen (Bitmaske), kommt aus dem Case-Shop (js/shop.js)
function tab(n){for(let i=0;i<3;i++){$('t'+i).style.display=i==n?'block':'none';$('tb'+i).className='tab'+(i==n?' on':'')}}
const ky={};
addEventListener('keydown',e=>{ky[e.code]=1;if(/^Digit[1-9]$/.test(e.code)&&mode){const L=owned(me.lo||63),k=+e.code[5]-1;if(L[k]!==undefined)me.w=L[k]}if(e.code.startsWith('Arrow')||e.code=='Space')e.preventDefault()});
addEventListener('keyup',e=>ky[e.code]=0);
addEventListener('keydown',e=>{if(pmOpen||document.activeElement&&document.activeElement.tagName=='INPUT'&&!mode)return;if(e.code=='KeyQ'&&mode)me.qn=(me.qn|0)+1;if(e.code=='KeyM')showMap^=1;if(e.code=='KeyN'){muted^=1;BG.muted=!!muted}if(e.code=='KeyP'&&mode==1)paused^=1});
addEventListener('mousemove',e=>{if(document.pointerLockElement===cv){const s2=SENS*(1-.45*VM.ak);me.a+=e.movementX*.0025*s2;me.pt=Math.max(-95,Math.min(95,(me.pt||0)-e.movementY*.3*s2))}});
addEventListener('mousedown',e=>{if(!mode||pmOpen)return;if(document.pointerLockElement===cv){if(e.button==2)me.ads=1;else me.f=1}else cv.requestPointerLock()});
addEventListener('contextmenu',e=>{if(mode)e.preventDefault()});
addEventListener('mouseup',e=>{if(e.button==2)me.ads=0;else me.f=0});
addEventListener('wheel',e=>{if(mode&&!pmOpen){const L=owned(me.lo||63),k=Math.max(0,L.indexOf(me.w));me.w=L[(k+(e.deltaY>0?1:L.length-1))%L.length]}});
// ---------- Controller (Gamepad) ----------
// Linker Stick laufen, rechter Stick drehen/hoch-runter schauen, A springen, RT schiessen, LT/L3 rennen, RB/LB oder Steuerkreuz Waffe, A weiter, Y Minimap, Start Pause
const GP={f:0,s:0,t:0,l:0,jump:0,run:0,on:0,fr:0,b:[],pad:null};
function padRumble(){try{const a=GP.pad&&GP.pad.vibrationActuator;if(a&&a.playEffect)a.playEffect('dual-rumble',{duration:140,strongMagnitude:.6,weakMagnitude:.4})}catch(e){}}
function padPoll(){
 let g=null;try{for(const q of navigator.getGamepads())if(q&&q.connected){g=q;break}}catch(e){}
 GP.pad=g;if(!g||pmOpen){GP.f=GP.s=GP.t=GP.l=GP.jump=GP.run=0;if(pmOpen&&me.f)me.f=0;return}
 const dz=v=>{v=v||0;return Math.abs(v)<.18?0:(v-Math.sign(v)*.18)/.82},B=i=>{const q=g.buttons[i];return q&&(q.pressed||q.value>.4)?1:0},hit=i=>B(i)&&!GP.b[i];
 const rx=dz(g.axes[2]);GP.s=dz(g.axes[0]);GP.f=-dz(g.axes[1]);GP.t=rx*(.35+.65*Math.abs(rx));GP.run=B(10);{const ad=B(6);if(ad!==GP.ad){GP.ad=ad;me.ads=ad}}GP.l=dz(g.axes[3]);GP.jump=B(0);
 if(GP.s||GP.f||GP.t||g.buttons.some((q,i)=>B(i)))GP.on=1;
 const fr=B(7);if(fr!==GP.fr){GP.fr=fr;me.f=fr}
 const sw=d=>{const L=owned(me.lo||63),k=Math.max(0,L.indexOf(me.w));me.w=L[(k+d+L.length)%L.length]};
 if(hit(5)||hit(15))sw(1);if(hit(4)||hit(14))sw(-1);
 if(hit(0)||(hit(7)&&S&&S.st&&S.st.ph!='play'&&S.st.ph!='clear'))storyConfirm();
 if(hit(3))showMap^=1;if(hit(2))me.qn=(me.qn|0)+1;if(hit(9)){for(let i=0;i<17;i++)GP.b[i]=B(i);gameMenu(1,1);return}
 for(let i=0;i<17;i++)GP.b[i]=B(i);
}
addEventListener('gamepadconnected',()=>{GP.on=1});
// ---------- Lokaler Spieler ----------
function local(){
 const P=S.p[id];if(!P)return;
 if(mode==2&&P.rc!==me.rc){if(me.rc>=0)me.a=Math.atan2(N/2-P.y,N/2-P.x);me.rc=P.rc;me.x=P.x;me.y=P.y;me.pt=0;if(!S.st)me.w=firstW(me.lo)}
 if(S.st){if(mode==2)me.lo=P.lo;if(!(me.lo>>me.w&1))me.w=1}
 if(mode==2)for(const j of S.j)if(j.t!=5){j.x+=j.vx*dt;j.y+=j.vy*dt}   // Geschosse zwischen zwei Updates weiterfliegen lassen
 if(mode==2&&(P.tp|0)!==(me.tp|0)){me.tp=P.tp|0;me.x=P.x;me.y=P.y}
 if(P.al&&P.hp>lastHp+15&&lastHp>0)healFl=.4;
 shopTick(P);   // Punkte -> Shop-Coins
 if(P.hp<lastHp){padRumble();hurtFl=.3;hurtSnd();shk=Math.max(shk,2.5)}lastHp=P.hp;
 hm-=dt;shk=Math.max(0,shk-dt*14);fl-=dt;rec=Math.max(0,rec-dt*6);hurtFl-=dt;lc-=dt;landT=Math.max(0,landT-dt*5);flameTick(dt);
 {const wk=S.st?S.st.lv*1e3+S.st.wv+(S.st.boss?500:0):S.wv;if(wk!==lastWv){lastWv=wk;if(S.st?S.st.ph=='play'&&S.st.wv>0:S.wv>0){bn=3.5;jingle(S.st?S.st.boss:S.wv%5==0)}}}bn-=dt;
 if(!P.al||pmOpen||(S.st&&S.st.ph!='play'&&S.st.ph!='clear'))return;
 me.a+=((ky.ArrowRight?1:0)-(ky.ArrowLeft?1:0))*2.5*dt+GP.t*3.3*SENS*(1-.45*VM.ak)*dt;
 me.pt=Math.max(-95,Math.min(95,(me.pt||0)+((ky.PageUp?1:0)-(ky.PageDown?1:0))*140*dt-GP.l*150*SENS*dt));
 const f=(ky.KeyW||ky.ArrowUp?1:0)-(ky.KeyS||ky.ArrowDown?1:0)+GP.f,sd=(ky.KeyD?1:0)-(ky.KeyA?1:0)+GP.s,c=Math.cos(me.a),s=Math.sin(me.a);
 let vx=c*f-s*sd,vy=s*f+c*sd;const l=Math.hypot(vx,vy);if(l>1){vx/=l;vy/=l}
 const V=(ky.ShiftLeft||GP.run?5:3.4)*(P.ua>0&&P.uk==4?1.45:1)*(me.ads&&me.w?.62:1);bob+=l>0&&!(me.z>0)?dt*(V>4?13:9):0;const cx2=me.pad&&me.z>0?me.pad.x:0,cy2=me.pad&&me.z>0?me.pad.y:0,nx=me.x+(vx*V+cx2)*dt,ny=me.y+(vy*V+cy2)*dt;if(can(nx,me.y,.25))me.x=nx;if(can(me.x,ny,.25))me.y=ny;
 // Springen (Leertaste / A): ueber Geschosse am Boden kommt man so drueber
 if(OUT&&!(me.z>0)&&!(me.vz>0)&&FG[(me.y|0)*N+(me.x|0)]==8){me.vz=5.6;me.pad={x:Math.cos(me.a)*3.4,y:Math.sin(me.a)*3.4};shk=Math.max(shk,1.5);tone(160,900,.4,'sawtooth',.12);tone(320,1500,.35,'triangle',.1);nz(.3,'highpass',1200,4000,.1)}   // Sprungfeld
 if((ky.Space||GP.jump)&&!(me.z>0)&&!(me.vz>0)){me.vz=3.1;tone(200,340,.1,'triangle',.07)}
 if(me.z>0||me.vz>0){me.vz-=9.8*dt;me.z=(me.z||0)+me.vz*dt;if(me.z<=0){if(me.pad)shk=Math.max(shk,2);me.z=0;me.vz=0;me.pad=null;landT=1;nz(.06,'lowpass',500,150,.12)}}
 if(me.f&&lc<=0){const w=WP[me.w];if(w.su&&!(P.spn>=.98)){lc=.1;tone(70+(P.spn||0)*260,120+(P.spn||0)*420,.1,'sawtooth',.045)}
  else if(!w.am||P.am[me.w]>0){lc=w.cd*(P.ua>0&&P.uk==1?.62:1);fl=.08;rec=1;gun(me.w);shotFx(me.w);me.pt=Math.min(95,(me.pt||0)+(WKICK[me.w]||0)*.06*(me.ads?.5:1))}else{lc=.3;click()}}
}
// ---------- Rendering ----------
const TX=[0,1,2,3,4].map(t=>{if(!t)return 0;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),R=Math.random;
 if(t==1){ // Ziegel
  g.fillStyle='#2a1612';g.fillRect(0,0,64,64);for(let r=0;r<8;r++)for(let k=-1;k<4;k++){const a=k*16+(r&1?8:0),v=R();g.fillStyle=v<.3?'#7c4030':v<.6?'#8f4c39':v<.85?'#9c5741':'#6d3628';g.fillRect(a+1,r*8+1,15,7);g.fillStyle='#ffffff1c';g.fillRect(a+1,r*8+1,15,1);g.fillStyle='#00000038';g.fillRect(a+1,r*8+7,15,1)}}
 if(t==2){ // Metallplatten
  const q=g.createLinearGradient(0,0,64,64);q.addColorStop(0,'#566b80');q.addColorStop(1,'#34455a');g.fillStyle=q;g.fillRect(0,0,64,64);g.strokeStyle='#17202b';g.lineWidth=2;g.strokeRect(1,1,62,62);g.strokeRect(8,8,48,48);
  g.fillStyle='#ffffff22';g.fillRect(2,2,60,1);g.fillRect(9,9,46,1);g.fillStyle='#0b1118';g.fillRect(12,26,40,10);g.fillStyle='#7fd0ff';g.fillRect(14,28,36,6);g.fillStyle='#dff4ff';g.fillRect(14,28,36,1);
  g.fillStyle='#9fb2c6';for(const[a,b]of[[4,4],[58,4],[4,58],[58,58],[31,4],[31,58]]){g.fillRect(a-1,b-1,3,3);g.fillStyle='#17202b';g.fillRect(a,b+1,2,1);g.fillStyle='#9fb2c6'}
  g.fillStyle='#f6c945';for(let k=0;k<5;k++){g.beginPath();g.moveTo(10+k*10,54);g.lineTo(15+k*10,54);g.lineTo(11+k*10,48);g.lineTo(6+k*10,48);g.fill()}}
 if(t==3){ // bemooste Steinquader
  g.fillStyle='#1f2a1d';g.fillRect(0,0,64,64);for(const[a,b,w,h]of[[0,0,30,20],[32,0,32,20],[0,22,18,20],[20,22,26,20],[48,22,16,20],[0,44,34,20],[36,44,28,20]]){const v=R();g.fillStyle=v<.4?'#4a6646':v<.75?'#557350':'#3f5a3c';g.fillRect(a+1,b+1,w-1,h-1);g.fillStyle='#ffffff18';g.fillRect(a+1,b+1,w-1,1);g.fillStyle='#00000030';g.fillRect(a+1,b+h-1,w-1,1)}
  for(let k=0;k<70;k++){g.fillStyle=R()<.5?'#6f9a3e':'#86b24a';g.fillRect(R()*64|0,(R()*R()*64)|0,2+(R()*3|0),1+(R()*2|0))}}
 if(t==4){ // Hoellenstein mit gluehenden Rissen
  g.fillStyle='#3d100c';g.fillRect(0,0,64,64);for(let k=0;k<40;k++){g.fillStyle=R()<.5?'#5a1a14':'#2c0b08';g.fillRect(R()*64|0,R()*64|0,6+R()*8,4+R()*6)}
  for(const[c,w]of[['#ff5a00',3],['#ffd04a',1]]){g.strokeStyle=c;g.lineWidth=w;g.globalAlpha=w>1?.55:1;for(let k=0;k<5;k++){g.beginPath();let a=(k*13+7)%64,b=0;g.moveTo(a,b);for(let s=0;s<7;s++){a+=((k*7+s*5)%15)-7;b+=10;g.lineTo(a,b)}g.stroke()}}g.globalAlpha=1}
 for(let k=0;k<300;k++){g.fillStyle=R()<.5?'#0003':'#fff1';g.fillRect(R()*64|0,R()*64|0,1+(R()*2|0),1)}
 return c});
const FI=XW.createImageData(VW,VH),F32=new Uint32Array(FI.data.buffer);
const LVN=12;
function lvls(d){const L=[];for(let l=0;l<LVN;l++){const k=.1+.9*l/(LVN-1),a=new Uint32Array(4096);for(let i=0;i<4096;i++)a[i]=0xff000000|(d[i*4+2]*k|0)<<16|(d[i*4+1]*k|0)<<8|(d[i*4]*k|0);L.push(a)}return L}
// Boden und Decke der Innenkarten: Fliesen bzw. Deckenplatten mit Lampen in den Farben der Karte
function planeTex(){
 const rgb=c=>'rgb('+c.map(v=>Math.min(255,v*1.3|0)).join(',')+')',mk=f=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');f(g);return lvls(g.getImageData(0,0,64,64).data)},F=th.f,C=th.c;
 PLT={f:mk(g=>{for(let j=0;j<2;j++)for(let i=0;i<2;i++){const a=i*32,b=j*32;g.fillStyle=rgb((i+j)&1?F[1]:F[0]);g.fillRect(a,b,32,32);g.fillStyle='#fff2';g.fillRect(a+1,b+1,30,1);g.fillRect(a+1,b+1,1,30);g.fillStyle='#0004';g.fillRect(a+1,b+30,30,1);g.fillRect(a+30,b+1,1,30)}
   g.fillStyle=rgb(F[2]);for(const k of[0,32]){g.fillRect(k,0,1,64);g.fillRect(0,k,64,1)}
   for(let k=0;k<420;k++){g.fillStyle=Math.random()<.5?'#0002':'#fff1';g.fillRect(Math.random()*64|0,Math.random()*64|0,1+(Math.random()*2|0),1)}
   g.strokeStyle='#0005';g.lineWidth=1;for(let k=0;k<3;k++){g.beginPath();let a=Math.random()*64,b=Math.random()*64;g.moveTo(a,b);for(let s=0;s<4;s++){a+=Math.random()*12-6;b+=Math.random()*12-6;g.lineTo(a,b)}g.stroke()}}),
  c:mk(g=>{g.fillStyle=rgb(C[0]);g.fillRect(0,0,64,64);g.fillStyle=rgb(C[1]);g.fillRect(3,3,58,58);g.fillStyle=rgb(C[2]);g.fillRect(0,0,64,2);g.fillRect(0,0,2,64);g.fillRect(31,3,2,58);
   g.fillStyle='#fff3';for(const[a,b]of[[5,5],[57,5],[5,57],[57,57]])g.fillRect(a,b,2,2);
   g.fillStyle='#fff6';g.fillRect(11,25,12,14);g.fillStyle='#fffd';g.fillRect(13,27,8,10);
   for(let k=0;k<260;k++){g.fillStyle=Math.random()<.5?'#0002':'#fff1';g.fillRect(Math.random()*64|0,Math.random()*64|0,2,1)}})};
}
// Boden, Decke und Himmel. HZ = Horizontlinie (Hoch-/Runterschauen), EY = Augenhoehe (Springen)
function planes(px,py,dx,dy,plx,ply,ang){
 if(!OUT&&!PLT)planeTex();
 const hz=Math.max(0,Math.min(VH,Math.round(HZ)));
 for(let y=0;y<VH;y++){
  const ro=y*VW;let rd,T=null;
  if(y>hz)rd=EY*VH/(y-hz);else if(y<hz&&!OUT)rd=(1-EY)*VH/(hz-y);else{if(!OUT||y==hz)F32.fill(0xff000000,ro,ro+VW);continue}
  const lv=Math.max(0,Math.min(LVN-1,(LVN*1.15/(1+rd*FOG*1.6))|0));
  let fx=px+(dx-plx)*rd,fy=py+(dy-ply)*rd;const sx=2*plx*rd/VW,sy=2*ply*rd/VW;
  if(OUT){for(let i=0;i<VW;i++){const ix=Math.floor(fx),iy=Math.floor(fy),ft=ix>=0&&iy>=0&&ix<N&&iy<N?FG[iy*N+ix]:4;
    F32[ro+i]=FT[ft][lv][(((fy-iy)*64)&63)*64+(((fx-ix)*64)&63)];fx+=sx;fy+=sy}}
  else{T=(y>hz?PLT.f:PLT.c)[lv];for(let i=0;i<VW;i++){F32[ro+i]=T[((fy*64)&63)*64+((fx*64)&63)];fx+=sx;fy+=sy}}
 }
 x.putImageData(FI,0,0);
 if(OUT){const sk=SKYS[OUT.sky],W2=SKYW/ZF,o=(((ang/(2*Math.PI))%1+1)%1)*W2|0;x.save();x.beginPath();x.rect(0,0,VW,hz);x.clip();x.drawImage(sk,-o,hz-VH,W2,VH);x.drawImage(sk,W2-o,hz-VH,W2,VH);x.restore()}
}
// ---------- Aussenkarten: hohe Fassaden, Boden-Texturen, Himmel ----------
const WH={5:3,6:3,8:2.5,9:2.5,10:2.5,11:2.5};
(function(){
 const mk=(h,f)=>{const c=document.createElement('canvas');c.width=64;c.height=h;f(c.getContext('2d'));return c};
 const brick=(g,h)=>{g.fillStyle='#6a3a30';g.fillRect(0,0,64,h);
  for(let r=0;r<h/4;r++)for(let k=0;k<5;k++){const v=Math.random();g.fillStyle=v<.25?'#5a2f27':v<.5?'#74423a':v<.75?'#633630':'#7c4a3e';g.fillRect(((r&1)*8+k*16)%64,r*4,15,3)}
  g.fillStyle='#3a211c';for(let r=0;r<h/4;r++)g.fillRect(0,r*4+3,64,1)};
 const win=(g,y,a,w,hh)=>{g.fillStyle='#f1f0ea';g.fillRect(a,y,w,hh);g.fillStyle='#2b3a4c';g.fillRect(a+3,y+3,w-6,hh-6);g.fillStyle='#7fa1c4';g.fillRect(a+4,y+4,(w-8)/2-1,5);
  g.fillStyle='#f1f0ea';g.fillRect(a+w/2-1,y,2,hh);g.fillRect(a,y+hh*.38|0,w,2);g.fillStyle='#d7d5cc';g.fillRect(a-1,y+hh,w+2,2)};
 const fac=door=>mk(192,g=>{brick(g,192);g.fillStyle='#2e1a16';g.fillRect(0,0,64,5);g.fillStyle='#4a2a24';g.fillRect(0,5,64,2);
  win(g,18,14,36,34);win(g,80,14,36,34);
  if(door){g.fillStyle='#d9d7cf';g.fillRect(16,134,32,58);g.fillStyle='#23402e';g.fillRect(20,140,24,52);g.fillStyle='#35604a';g.fillRect(23,144,8,18);g.fillRect(33,144,8,18);g.fillStyle='#cb9';g.fillRect(40,168,2,3);
   g.fillStyle='#c9c7be';g.fillRect(12,130,40,5);g.fillStyle='#fff';g.fillRect(50,146,10,10);g.fillStyle='#124';g.font='bold 9px monospace';g.fillText('7',52,154)}
  else win(g,142,14,36,32);
  g.fillStyle='#4b4640';g.fillRect(0,184,64,8)});
 TX[5]=fac(0);TX[6]=fac(1);
 // Tribuene mit Publikum
 TX[8]=mk(128,g=>{g.fillStyle='#120c1c';g.fillRect(0,0,64,128);for(let r=0;r<11;r++){g.fillStyle=r&1?'#1c1430':'#241a3c';g.fillRect(0,8+r*8,64,8);
   for(let k=0;k<10;k++){const C=['#f58','#fa3','#8cf','#fd6','#c7f','#eee','#6e8'];g.fillStyle=C[Math.random()*C.length|0];const a=(k*6.4+(r&1)*3)|0;g.fillRect(a+1,9+r*8,3,3);g.fillStyle='#0008';g.fillRect(a,12+r*8,5,3)}}
  g.fillStyle='#fff';for(let k=0;k<4;k++)g.fillRect(6+k*16,2,6,3);
  g.fillStyle='#2a2238';g.fillRect(0,96,64,32);const q=g.createLinearGradient(0,0,64,0);q.addColorStop(0,'#7b2ff7');q.addColorStop(.5,'#f1076b');q.addColorStop(1,'#ffb13d');g.fillStyle=q;g.fillRect(0,100,64,4);g.fillRect(0,122,64,2)});
 // Neon-Pfeiler
 TX[9]=mk(128,g=>{g.fillStyle='#0c0814';g.fillRect(0,0,64,128);const q=g.createLinearGradient(0,0,0,128);q.addColorStop(0,'#7b2ff7');q.addColorStop(.5,'#f1076b');q.addColorStop(1,'#ffb13d');g.fillStyle=q;for(const a of[8,28,48])g.fillRect(a,4,8,120);g.fillStyle='#fff8';for(const a of[11,31,51])g.fillRect(a,4,2,120);g.fillStyle='#333';g.fillRect(0,0,64,4);g.fillRect(0,124,64,4)});
 // Arena-Barrikade
 TX[11]=mk(128,g=>{g.fillStyle='#1b1626';g.fillRect(0,0,64,128);g.strokeStyle='#0c0912';g.lineWidth=2;for(let y=0;y<128;y+=32)g.strokeRect(1,y+1,62,30);
  g.fillStyle='#f1076b';g.fillRect(0,60,64,3);g.fillStyle='#7b2ff7';g.fillRect(0,4,64,2);g.fillStyle='#ffb13d';g.fillRect(0,122,64,2);
  g.fillStyle='#fd4';for(let k=0;k<8;k++){g.beginPath();g.moveTo(k*16-16,112);g.lineTo(k*16-8,112);g.lineTo(k*16,100);g.lineTo(k*16-8,100);g.fill()}
  for(let k=0;k<200;k++){g.fillStyle=Math.random()<.5?'#0003':'#fff1';g.fillRect(Math.random()*64|0,Math.random()*128|0,2,1)}});
 // LED-Wand
 TX[10]=mk(128,g=>{g.fillStyle='#16101f';g.fillRect(0,0,64,128);const q=g.createLinearGradient(0,10,64,90);q.addColorStop(0,'#7b2ff7');q.addColorStop(.5,'#f1076b');q.addColorStop(1,'#ffb13d');g.fillStyle=q;g.fillRect(3,8,58,84);
  g.strokeStyle='#fff';g.lineWidth=3;g.strokeRect(20,16,24,24);g.beginPath();g.arc(32,28,6,0,7);g.stroke();g.fillStyle='#fff';g.fillRect(38,19,3,3);
  g.font='bold 11px monospace';g.textAlign='center';g.fillText('LIFE',32,56);g.fillText('STYLE',32,68);g.fillText('CRAZY',32,80);
  g.fillStyle='#0003';for(let y=8;y<92;y+=2)g.fillRect(3,y,58,1);g.fillStyle='#2a2238';g.fillRect(0,96,64,32);g.fillStyle='#fd4';g.font='bold 10px monospace';g.fillText('BONN',32,116)});
})();
// Boden-Texturen: 0 Kopfsteinpflaster, 1 Gehweg, 2 Rasen, 3 Parkbucht, 4 Asphalt, 5 Neon, 6 Ring, 7 Arena-Beton
const FT=(function(){
 const out=[];
 const gen=f=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');f(g);
  out.push(lvls(g.getImageData(0,0,64,64).data))};
 const noise=(g,n,a,b)=>{for(let k=0;k<n;k++){g.fillStyle=Math.random()<.5?a:b;g.fillRect(Math.random()*64|0,Math.random()*64|0,1+(Math.random()*2|0),1)}};
 const stones=(g,sz,C,gap)=>{g.fillStyle=gap;g.fillRect(0,0,64,64);for(let r=0;r<64/sz;r++)for(let k=-1;k<64/sz;k++){g.fillStyle=C[Math.random()*C.length|0];g.fillRect(k*sz+(r&1?sz/2:0)+1,r*sz+1,sz-1,sz-1)}};
 gen(g=>{stones(g,8,['#8a867e','#7c7972','#96928a','#6f6c66','#84807a'],'#4c4a45');noise(g,120,'#0002','#fff1');g.fillStyle='#4f7a3040';for(let k=0;k<14;k++)g.fillRect(Math.random()*64|0,Math.random()*64|0,2,1)});
 gen(g=>{g.fillStyle='#8f8d88';g.fillRect(0,0,64,64);g.fillStyle='#6c6a66';g.fillRect(0,0,64,1);g.fillRect(0,32,64,1);g.fillRect(0,0,1,64);g.fillRect(32,0,1,64);noise(g,260,'#0002','#fff2')});
 gen(g=>{g.fillStyle='#3f8a2c';g.fillRect(0,0,64,64);for(let k=0;k<700;k++){const C=['#2f7422','#4fa036','#5cb040','#377e28','#6abf4a'];g.fillStyle=C[Math.random()*5|0];g.fillRect(Math.random()*64|0,Math.random()*64|0,1,2+(Math.random()*2|0))}});
 gen(g=>{stones(g,16,['#9b978f','#8d8982','#a5a199'],'#5a5852');noise(g,160,'#0002','#fff1')});
 gen(g=>{g.fillStyle='#55555a';g.fillRect(0,0,64,64);noise(g,500,'#0003','#fff2')});
 gen(g=>{g.fillStyle='#160f24';g.fillRect(0,0,64,64);g.fillStyle='#f1076b';g.fillRect(0,0,64,2);g.fillRect(0,0,2,64);g.fillStyle='#7b2ff7';g.fillRect(0,31,64,1);g.fillRect(31,0,1,64);noise(g,80,'#fff1','#0003')});
 gen(g=>{g.fillStyle='#e6e0ec';g.fillRect(0,0,64,64);g.fillStyle='#d3cadd';g.fillRect(0,0,64,1);g.fillRect(0,0,1,64);g.fillStyle='#f1076b30';g.fillRect(8,8,48,48);g.fillStyle='#e6e0ec';g.fillRect(12,12,40,40);noise(g,150,'#0001','#fff3')});
 gen(g=>{g.fillStyle='#2c2636';g.fillRect(0,0,64,64);g.fillStyle='#1d1826';g.fillRect(0,0,64,1);g.fillRect(0,0,1,64);noise(g,300,'#0003','#fff1')});
 gen(g=>{g.fillStyle='#1b1f26';g.fillRect(0,0,64,64);g.fillStyle='#ffd23f';for(let k=0;k<8;k++){g.fillRect(k*8,0,4,3);g.fillRect(k*8+4,61,4,3);g.fillRect(0,k*8+4,3,4);g.fillRect(61,k*8,3,4)}   // 8 Sprungfeld
  const q=g.createRadialGradient(32,32,2,32,32,26);q.addColorStop(0,'#eaffff');q.addColorStop(.35,'#3df4ff');q.addColorStop(.75,'#0a6f8a');q.addColorStop(1,'#1b1f26');g.fillStyle=q;g.beginPath();g.arc(32,32,26,0,7);g.fill();
  g.strokeStyle='#0b2a33';g.lineWidth=3;for(const r of[10,18])g.beginPath(),g.arc(32,32,r,0,7),g.stroke();
  g.fillStyle='#fff';for(const y of[14,26,38]){g.beginPath();g.moveTo(32,y);g.lineTo(42,y+8);g.lineTo(37,y+8);g.lineTo(32,y+4);g.lineTo(27,y+8);g.lineTo(22,y+8);g.fill()}});
 return out})();
// Himmel-Panoramen (0 = Tag ueber Dortmund, 1 = Nacht ueber Bonn)
const SKYW=Math.round(VW*2*Math.PI/(2*Math.atan(.77)));
const SKYS=[0,1].map(n=>{const c=document.createElement('canvas');c.width=SKYW;c.height=VH;const g=c.getContext('2d'),h=c.height,q=g.createLinearGradient(0,0,0,h);
 if(!n){q.addColorStop(0,'#3f86d8');q.addColorStop(.7,'#9cc9f0');q.addColorStop(1,'#d8ecf8');g.fillStyle=q;g.fillRect(0,0,SKYW,h);
  for(let k=0;k<44;k++){const cx=Math.random()*SKYW,cy=20+Math.random()*(h-80);for(let b=0;b<9;b++){g.fillStyle=b<6?'#ffffffcc':'#e9f1f8cc';const w=18+Math.random()*30,hh=5+Math.random()*7,ax=cx+(Math.random()-.5)*46,ay=cy+(Math.random()-.5)*9;g.fillRect(ax|0,ay|0,w|0,hh|0);if(ax+w>SKYW)g.fillRect((ax-SKYW)|0,ay|0,w|0,hh|0)}}
  for(let a=0;a<SKYW;a+=3){const t=10+6*Math.sin(a*.021)+5*Math.sin(a*.057+1)+3*Math.sin(a*.13);g.fillStyle='#3f7f33';g.fillRect(a,h-t,3,t);g.fillStyle='#2f6627';g.fillRect(a,h-t*.5,3,t*.5)}}
 else{q.addColorStop(0,'#05030c');q.addColorStop(.6,'#1a0b33');q.addColorStop(.88,'#5b1460');q.addColorStop(1,'#c2364f');g.fillStyle=q;g.fillRect(0,0,SKYW,h);
  for(let k=0;k<420;k++){g.fillStyle=Math.random()<.2?'#fff':'#ffffff80';g.fillRect(Math.random()*SKYW|0,Math.random()*h*.8|0,1,1)}
  for(let k=0;k<14;k++){const a=k*SKYW/14+40,w=g.createLinearGradient(a,h,a+(k&1?60:-60),0);w.addColorStop(0,'#ffffff50');w.addColorStop(1,'#ffffff00');g.fillStyle=w;g.beginPath();g.moveTo(a-3,h);g.lineTo(a+3,h);g.lineTo(a+(k&1?90:-90),0);g.lineTo(a+(k&1?50:-50),0);g.fill()}
  g.fillStyle='#0d0716';for(let a=0;a<SKYW;){const w=10+Math.random()*26|0,t=6+Math.random()*20|0;g.fillRect(a,h-t,w,t);g.fillStyle='#fd68';for(let j=0;j<3;j++)g.fillRect(a+2+Math.random()*(w-4)|0,h-t+2+Math.random()*(t-4)|0,1,1);g.fillStyle='#0d0716';a+=w+2}}
 return c});
function drawDeco(s,T,sz,gy){
 const h=sz*T.s,w=h*T.a,cx=VW/2*(1+s.tx/s.ty),bot=gy,top=bot-h,c=T.c,x0=Math.max(0,(cx-w/2)|0),x1=Math.min(VW-1,(cx+w/2)|0);
 for(let i=x0;i<=x1;i++){if(Z[i]<s.ty)continue;const u=(i-(cx-w/2))/w;if(u<0||u>=1)continue;x.drawImage(c,(u*c.width)|0,0,1,c.height,i,top,1,h)}
}
const vg=XW.createRadialGradient(VW/2,VH/2,VH*.35,VW/2,VH/2,VW*.6);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.6)');
function mini(){if(!showMap)return;const c=3,ox=VW-N*c-6,oy=62;
 x.globalAlpha=.65;x.fillStyle='#000';x.fillRect(ox-1,oy-1,N*c+2,N*c+2);x.fillStyle='#889';
  for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(G[j*N+i])x.fillRect(ox+i*c,oy+j*c,c,c);
  x.fillStyle='#454';for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(B[j*N+i])x.fillRect(ox+i*c,oy+j*c,c,c);
  x.fillStyle='#3df4ff';for(const q of JP)x.fillRect(ox+q[0]*c+.5,oy+q[1]*c+.5,c-1,c-1);
 S.e.forEach(e=>{if(e.dead)return;x.fillStyle=e.t>=30?'#f0f':e.t==10?'#fd4':e.t==19?'#f0f':'#f33';x.fillRect(ox+e.x*c-1,oy+e.y*c-1,2,2)});
 S.p.forEach(p=>{if(p.on&&p.al){x.fillStyle=PC[p.i];x.fillRect(ox+p.x*c-1.5,oy+p.y*c-1.5,3,3)}});
 x.globalAlpha=1}

const Z=new Float32Array(VW),SC={};
function SH(c,l){const k=c+l;if(SC[k])return SC[k];const f=l/8,v=parseInt(c.length==4?c[1]+c[1]+c[2]+c[2]+c[3]+c[3]:c.slice(1,7),16);return SC[k]='rgb('+((v>>16)*f|0)+','+((v>>8&255)*f|0)+','+((v&255)*f|0)+')'}
const circ=(c,cy,r)=>u=>{const d=u-.5;if(Math.abs(d)>r)return[];const h=Math.sqrt(r*r-d*d);return[[cy-h,cy+h,c]]};
const hum=(c1,c2,c3,dk,hn,ey)=>(u,s)=>{const r=[],a=s.f?'#fff':c1,b=s.f?'#fff':c2,l=s.f?'#fff':c3,d=s.f?'#ddd':(dk||'#222');
 if(hn&&((u>.28&&u<.36)||(u>.64&&u<.72)))r.push([0,.12,'#eed']);
 if(u>.3&&u<.7)r.push([.04,.28,b]);
 if(u>.2&&u<.8){r.push([.28,.7,a]);if(u<.28||u>.72)r.push([.28,.7,d]);r.push([.58,.64,d])}
 if((u>.08&&u<.2)||(u>.8&&u<.92))r.push([.3,.62,u<.5?d:a]);
 if((u>.22&&u<.46)||(u>.54&&u<.78))r.push([.7,1,l]);
 if(!s.f&&((u>.4&&u<.46)||(u>.54&&u<.6)))r.push([.12,.17,ey||'#ff0']);
 return r};
const PC=['#d33','#36d','#3a3','#da3'];
const ST={0:{s:.8,w:.8,z:0,f:hum('#a52','#c73','#531','#742',0,'#ff0')},1:{s:1,w:.95,z:0,f:hum('#d68','#e9a','#823','#a46',1,'#f00')},
 2:{s:.3,w:1,z:.4,f:u=>{const d=u-.5;if(Math.abs(d)>.5)return[];const h=Math.sqrt(.25-d*d);return[[.5-h,.5+h,'#f42'],[.5-h*.6,.5+h*.6,'#fd6'],[.5-h*.25,.5+h*.25,'#fff']]}},3:{s:.2,w:1.6,z:.4,f:circ('#bbb',.5,.4)},4:{s:.25,w:1,z:.4,f:circ('#4ef',.5,.5)},
 5:{s:1.2,w:1,z:.1,f:circ('#fb2',.5,.5)},
 6:{s:.3,w:1.2,z:0,f:u=>u>.1&&u<.9?(u>.4&&u<.6?[[0,1,'#3a3'],[.35,.65,'#fd3']]:[[0,1,'#3a3']]):[]},
 7:{s:.3,w:1.2,z:0,f:u=>u<.1||u>.9?[]:u>.4&&u<.6?[[0,1,'#eee'],[.15,.85,'#e22']]:[[0,1,'#eee'],...(u>.2&&u<.8?[[.4,.6,'#e22']]:[])]},
 8:{s:.8,w:.8,z:0,f:(u,s)=>hum(PC[s.i],'#fc9','#222','#222')(u,s)},
 9:{s:.45,w:1,z:.3,f:u=>{const d=u-.5;if(Math.abs(d)>.5)return[];const h=Math.sqrt(.25-d*d),r=[[.5-h,.5+h,'#ddd']];if((u>.3&&u<.42)||(u>.58&&u<.7))r.push([.38,.52,'#400']);if(u>.4&&u<.6)r.push([.7,.8,'#999']);return r}},
 10:{s:1.5,w:.9,z:0,f:hum('#722','#a33','#311','#511',1,'#fe0')},
 11:{s:.3,w:1.2,z:0,f:u=>u<.1||u>.9?[]:[[0,1,'#36d'],[.3,.7,'#8cf']]},
 12:{s:.7,w:1,z:.4,f:circ('#6f6',.5,.5)},18:{s:.3,w:1,z:.35,f:circ('#7a5',.5,.5)},
 23:{s:.26,w:1,z:.4,f:u=>{const d=u-.5;if(Math.abs(d)>.5)return[];const h=Math.sqrt(.25-d*d);return[[.5-h,.5+h,'#a4f'],[.5-h*.55,.5+h*.55,'#e9f']]}},
 24:{s:.5,w:1,z:.5,f:u=>{const d=u-.5;if(Math.abs(d)>.5)return[];const h=Math.sqrt(.25-d*d);return[[.5-h,.5+h,'#311'],[.5-h*.7,.5+h*.7,'#d31'],[.5-h*.3,.5+h*.3,'#fd6']]}},
 25:{s:.22,w:.8,z:.12,f:u=>{const d=u-.5;if(Math.abs(d)>.5)return[];const h=Math.sqrt(.25-d*d);return[[.5-h,.5+h,'#fc2'],...(Math.abs(d)<.12?[[.5-h*.6,.5+h*.6,'#a70']]:[[.5-h*.75,.5+h*.75,'#fe7']])]}}};
// ---------- Sprites (PNG-Dateien in assets/sprites) ----------
// Typ -> [Datei, Groesse]. 13-19/10: alte Gegner, 20-22: Story-NPCs, 30-35: Story-Bosse, c0-c5: spielbare Charaktere
const SPR={13:['werwlf',.88],14:['eurojunkie',.8],16:['adam',.86],17:['youngcola',.84],19:['jxhn2k',1.5],10:['lilm',1.4],
 20:['npc1',.84],21:['npc2',.86],22:['npc3',.9],
 30:['lilm',1.3],31:['drachenlord',1.45],32:['sehrjamal',1.4],33:['jermaine',1.5],34:['raphael',1.35],35:['slime',1.75],
 c0:['taubenopa',.9],c1:['eurojunkie',.84],c2:['jxhn2k',.92],c3:['youngcola',.86],c4:['werwlf',.88],c5:['adam',.86],c6:['kerimsi',.9],c7:['sh1no',.9],c8:['saesix',.92],c9:['joshie',.9],c10:['souf',.92],c11:['muro',.92]};
const IMG={},RAW={};
(function(){const by={};for(const t in SPR){const[n,sc]=SPR[t];if(t!=10)ST[t]={s:sc,w:.4,z:0,f:()=>[],img:1};(by[n]=by[n]||[]).push(t)}
 for(const n in by){const im=new Image();im.onload=()=>{
  const w=im.width,h=im.height,mkc=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
  const fl=mkc(),g=fl.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#fff';g.fillRect(0,0,w,h);
  const sh={};for(let l=2;l<=8;l++){const c=mkc(),q=c.getContext('2d');q.drawImage(im,0,0);q.globalCompositeOperation='source-atop';q.fillStyle='rgba(0,0,0,'+(1-l/8)+')';q.fillRect(0,0,w,h);sh[l]=c}
  const rd=mkc(),q2=rd.getContext('2d');q2.drawImage(im,0,0);q2.globalCompositeOperation='source-in';q2.fillStyle='#f22';q2.fillRect(0,0,w,h);
  RAW[n]=im;for(const t of by[n]){IMG[t]={sh,fl,rd,w,h};if(t==10)ST[10]={s:1.4,w:w/h,z:0,f:()=>[],img:1};else{ST[t].w=w/h;ST[t].ok=1}}};
  im.src='assets/sprites/'+n+'.png'}})();
// ---------- Deko-Sprites (prozedural gezeichnet) ----------
(function(){
 const mk=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c};
 const dec=(t,s,c,z)=>{ST[t]={dec:1,s,a:c.width/c.height,c,z:z||0}};
 // Baum
 dec(40,3.3,mk(96,128,(g,w,h)=>{g.fillStyle='#4a3626';g.fillRect(44,62,8,66);g.fillStyle='#3a2a1c';g.fillRect(49,62,3,66);g.fillStyle='#4a3626';g.fillRect(36,70,10,3);g.fillRect(50,64,12,3);
  const C=['#1f4d1a','#2a6a22','#35822a','#4a9a34','#63b244'];for(let k=0;k<260;k++){const a=Math.random()*6.28,r=Math.sqrt(Math.random()),px=48+Math.cos(a)*r*44,py=42+Math.sin(a)*r*38,q=Math.min(4,Math.max(0,((1-(py/84))*3+Math.random()*2.4)|0));g.fillStyle=C[q];const z=4+Math.random()*7|0;g.fillRect(px-z/2|0,py-z/2|0,z,z)}}));
 // Autos (Seitenansicht)
 const car=(col,dk)=>mk(80,32,(g)=>{g.fillStyle=col;g.fillRect(4,14,72,11);g.fillRect(18,5,40,10);g.fillRect(12,9,8,6);g.fillRect(56,9,10,6);g.fillStyle=dk;g.fillRect(4,22,72,3);
  g.fillStyle='#223';g.fillRect(21,7,15,7);g.fillRect(39,7,16,7);g.fillStyle='#9bd';g.fillRect(22,8,5,3);g.fillRect(40,8,5,3);
  g.fillStyle='#111';for(const a of[12,56]){g.fillRect(a,20,13,12);g.fillStyle='#999';g.fillRect(a+4,24,5,4);g.fillStyle='#111'}g.fillStyle='#e33';g.fillRect(4,15,2,4);g.fillStyle='#ffd';g.fillRect(74,16,2,3)});
 dec(41,.6,car('#b9bcc0','#7c7f84'));dec(42,.6,car('#1d2238','#10131f'));dec(43,.6,car('#b3242a','#701418'));dec(44,.6,car('#2b2b2e','#161618'));
 // weisser Transporter
 dec(45,1,mk(96,50,(g)=>{g.fillStyle='#e8e8e4';g.fillRect(4,4,70,36);g.fillRect(74,16,18,24);g.fillRect(70,8,10,10);g.fillStyle='#b9b9b4';g.fillRect(4,36,88,4);g.fillStyle='#223';g.fillRect(72,10,12,10);g.fillStyle='#333';g.fillRect(30,22,22,2);
  g.fillStyle='#111';for(const a of[14,68]){g.fillRect(a,34,14,14);g.fillStyle='#aaa';g.fillRect(a+4,38,6,6);g.fillStyle='#111'}g.fillStyle='#e33';g.fillRect(4,24,2,6)}));
 // Muelltonne (gelber Deckel), Baustellen-Absperrung, Busch, Laterne, Schild
 dec(46,.48,mk(16,24,(g)=>{g.fillStyle='#26272b';g.fillRect(2,5,12,17);g.fillStyle='#e8c21a';g.fillRect(1,2,14,4);g.fillStyle='#ddd';g.fillRect(5,10,6,6);g.fillStyle='#111';g.fillRect(2,21,3,3);g.fillRect(11,21,3,3)}));
 dec(47,.6,mk(48,28,(g)=>{g.fillStyle='#eee';g.fillRect(2,2,44,9);g.fillRect(2,15,44,5);g.fillStyle='#d22';for(let k=0;k<4;k++)g.fillRect(4+k*12,2,6,9);g.fillStyle='#ccc';g.fillRect(4,0,3,28);g.fillRect(41,0,3,28)}));
 dec(48,.5,mk(40,22,(g)=>{const C=['#235a1e','#2f7426','#3f8f30','#58a83e'];for(let k=0;k<120;k++){const a=Math.random()*3.14,r=Math.sqrt(Math.random());g.fillStyle=C[Math.random()*4|0];g.fillRect(20+Math.cos(a)*r*18-2|0,22-Math.sin(a)*r*20-2|0,5,5)}}));
 dec(49,2.6,mk(12,104,(g)=>{g.fillStyle='#555a5e';g.fillRect(5,10,2,94);g.fillStyle='#d9d9d2';g.fillRect(1,2,10,9);g.fillStyle='#fffbe0';g.fillRect(2,8,8,3)}));
 dec(50,1.5,mk(20,60,(g)=>{g.fillStyle='#777';g.fillRect(9,14,2,46);g.fillStyle='#d22';g.beginPath();g.arc(10,9,9,0,7);g.fill();g.fillStyle='#fff';g.fillRect(4,7,12,4);g.fillStyle='#1b5fc4';g.fillRect(3,22,14,12);g.fillStyle='#fff';g.fillRect(7,24,2,8);g.fillRect(7,24,5,2);g.fillRect(11,24,2,5);g.fillRect(7,27,5,2)}));
 // Arena: Flutlicht-Turm, Feuerschale
 dec(51,3.2,mk(28,128,(g)=>{g.strokeStyle='#667';g.lineWidth=2;g.strokeRect(9,26,10,102);for(let y=26;y<128;y+=12){g.beginPath();g.moveTo(9,y);g.lineTo(19,y+12);g.moveTo(19,y);g.lineTo(9,y+12);g.stroke()}
  g.fillStyle='#223';g.fillRect(0,2,28,24);g.fillStyle='#fff';for(let j=0;j<3;j++)for(let i=0;i<4;i++)g.fillRect(2+i*7,4+j*7,4,4);g.fillStyle='#fdf6';g.fillRect(0,0,28,28)}));
 dec(52,.75,mk(24,40,(g)=>{g.fillStyle='#444';g.fillRect(10,22,4,16);g.fillRect(5,36,14,4);g.fillStyle='#777';g.fillRect(2,18,20,5);
  g.fillStyle='#f52';g.fillRect(5,6,14,12);g.fillStyle='#fa2';g.fillRect(7,3,10,13);g.fillRect(10,0,4,6);g.fillStyle='#fe8';g.fillRect(10,8,4,9)}));
})();
// ---------- Kamera (Hoch-/Runterschauen, Springen), Glaettung, Welt-Partikel ----------
let ZF=1,HZ=VH/2,EY=.5,frameN=0,landT=0,attractOn=0;const SMO={},FXS={},WPT=[],PAN={},SHOOTER={0:1,15:1,16:1,21:1,22:1};
// Mitspieler sehen Gegner nur 20x pro Sekunde -> Positionen weich nachziehen
function smo(k,o){if(mode!=2)return o;let q=SMO[k];if(!q||Math.hypot(q.x-o.x,q.y-o.y)>2.5)q=SMO[k]={x:o.x,y:o.y};const a=Math.min(1,dt*16);q.x+=(o.x-q.x)*a;q.y+=(o.y-q.y)*a;q.u=frameN;return q}
function puff(x0,y0,z0,n,c,sp,o){sp=sp||1.5;for(let k=0;k<n&&WPT.length<500;k++){const a=Math.random()*6.283,v=sp*(.3+Math.random());WPT.push(Object.assign({x:x0,y:y0,z:z0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:(Math.random()*1.6+.4)*sp*.6,g:6,l:.35+Math.random()*.35,m:.7,c:c[Math.random()*c.length|0],s:.03+Math.random()*.03},o||{}))}}
function render(){
 toWorld();
 const now=performance.now()/1000,ja=me.a+(Math.random()-.5)*shk*.012,px=me.x,py=me.y,dx=Math.cos(ja),dy=Math.sin(ja),zf=attractOn?1:1-VM.ak*((VM.w==7||VM.w==12)?.62:.25),plx=-dy*.77*zf,ply=dx*.77*zf;ZF=zf;
 HZ=VH/2+(me.pt||0)+(Math.random()-.5)*shk*1.5;EY=Math.min(OUT?2.25:.94,.5+(me.z||0)+Math.sin(bob*2)*.008-landT*.06);frameN++;
 planes(px,py,dx,dy,plx,ply,ja);
 for(let i=0;i<VW;i++){
  const cm=2*i/VW-1,rdx=dx+plx*cm,rdy=dy+ply*cm,r=cast(px,py,rdx,rdy);Z[i]=r.d;
  const tx=TX[r.t]||TX[1],l1=VH/r.d,lh=l1*(WH[r.t]||1),top=HZ+EY*l1-lh,dk=1-Math.min(1,(r.side?(OUT?.82:.72):1)/(1+r.d*FOG));
  x.drawImage(tx,((((r.side?rdy>0:rdx<0)?1-r.wx:r.wx)*64)|0)&63,0,1,tx.height,i,top,1,lh);
  if(dk>.02){x.fillStyle='rgba(0,0,0,'+dk.toFixed(2)+')';x.fillRect(i,top,1,lh)}
 }
 const sp=[];
 S.e.forEach(e=>{const q=smo('e'+e.id,e);let f=FXS[e.id];
  if(!f){f=FXS[e.id]={b:now,h:0,d:0};if(frameN>5&&!e.dead&&!attractOn)puff(e.x,e.y,.4,14,['#fff','#fd6','#f80'],1.1,{g:-1,l:.5})}
  f.u=frameN;
  if(e.fl>0){if(!f.h){f.h=1;puff(q.x,q.y,.55,6,['#b11','#e22','#711'],1.3)}}else f.h=0;
  if(e.dead&&!f.d){f.d=1;puff(q.x,q.y,.5,e.t>=30||e.t==19?60:22,['#b11','#e22','#711','#400'],e.t>=30?3.2:2.2)}
  sp.push({x:q.x,y:q.y,t:e.t,sn:e.sn>0,br:e.br>0,sl:e.sl>0,f:e.fl>0,ph:e.ph||0,mv:e.mv,at:e.at||0,dd:e.dd||0,en:e.en,age:now-f.b})});
 S.j.forEach(j=>{sp.push({x:j.x,y:j.y,t:j.t,l:j.l,z:j.fz||0});
  if(j.t==5){const k='x'+j.x.toFixed(1)+j.y.toFixed(1);if(!FXS[k]){puff(j.x,j.y,.45,26,['#fd6','#f80','#fff','#555'],3.4,{s:.04});puff(j.x,j.y,.3,10,['#444','#666'],1,{g:-1.2,l:.9,m:.9,s:.09})}(FXS[k]=FXS[k]||{}).u=frameN;return}
  const tr=TRL[j.t];if(tr&&Math.random()<tr[0]*dt*60)WPT.push({x:j.x,y:j.y,z:tr[3]||.42,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,vz:tr[4]||.2,g:tr[5]||0,l:tr[2],m:tr[2],c:tr[1][Math.random()*tr[1].length|0],s:tr[6]||.035})});
 S.k.forEach(k=>sp.push({x:k.x,y:k.y,t:k.t,pk:1}));
 for(const d of DECO)sp.push(d);
 S.p.forEach(p=>{if(!(p.on&&p.al&&p.i!=id))return;const q=smo('p'+p.i,p),a=PAN[p.i]||(PAN[p.i]={x:q.x,y:q.y,ph:0,t:0});
  const d=Math.hypot(q.x-a.x,q.y-a.y);a.x=q.x;a.y=q.y;a.ph+=d*4;if(d>.0015)a.t=.15;else a.t-=dt;
  sp.push({x:q.x,y:q.y,z:p.z||0,t:IMG['c'+p.ch]?'c'+p.ch:8,pl:1,c:PC[p.i],ph:a.ph,mv:a.t>0?1:0,at:0,dd:0,f:0,i:p.i,n:p.nm||'P'+(p.i+1)})});
 ultRender(sp,now);
 for(const q of JP)if(Math.random()<.7)WPT.push({x:q[0]+.15+Math.random()*.7,y:q[1]+.15+Math.random()*.7,z:0,vx:0,vy:0,vz:1.2+Math.random()*1.2,g:-.5,l:.7,m:.7,c:Math.random()<.3?'#fff':'#3df4ff',s:.035});
 for(let i=WPT.length-1;i>=0;i--){const q=WPT[i];q.l-=dt;if(q.l<=0){WPT.splice(i,1);continue}q.x+=q.vx*dt;q.y+=q.vy*dt;q.vz-=q.g*dt;q.z+=q.vz*dt;if(q.z<0){q.z=0;q.vz*=-.3;q.vx*=.5;q.vy*=.5}sp.push({x:q.x,y:q.y,t:'P',q})}
 if(frameN%300==0){for(const k in FXS)if(FXS[k].u<frameN-200)delete FXS[k];for(const k in SMO)if(SMO[k].u<frameN-200)delete SMO[k]}
 const inv=1/(plx*dy-dx*ply);
 for(const s of sp){const ax=s.x-px,ay=s.y-py;s.tx=inv*(dy*ax-dx*ay);s.ty=inv*(-ply*ax+plx*ay)}
 sp.sort((a,b)=>b.ty-a.ty);
 for(const s of sp){
  if(s.ty<.15)continue;
  const sz=VH/s.ty,cxr=VW/2*(1+s.tx/s.ty),gy=HZ+EY*sz;   // gy = Bodenlinie auf dem Bildschirm
  if(s.t==='P'){const q=s.q,ci=cxr|0;if(ci<0||ci>=VW||Z[ci]<s.ty)continue;const d=Math.max(1,q.s*sz);x.globalAlpha=Math.min(1,q.l/q.m*1.6);x.fillStyle=q.c;x.fillRect(cxr-d/2,gy-q.z*sz-d/2,d,d);x.globalAlpha=1;continue}
  const T=ST[s.t];if(!T)continue;
  if(T.dec){drawDeco(s,T,sz,gy);continue}
  if(T.fx){drawFx(s,T,sz,cxr,gy,now);continue}
  if(T.img){
   const I=IMG[s.t];if(!I)continue;
   const dd=s.dd||0,fa=Math.min(1,dd/.6),fe=fa*fa*(3-2*fa),mv=s.mv&&!dd?1:0,atk=Math.min(1,s.at/.3),ph=s.ph,gr=Math.min(1,(s.age==null?1:s.age)/.35);
   const br=.012*Math.sin(now*3+s.x*3),sq=1+br+.1*atk+(s.f?.05:0);
   const h=sz*T.s*sq*(.35+.65*gr)*(1-.74*fe),w=sz*T.s*T.w*(1+.08*atk)*(2-sq)*(1+.55*fe),cx=cxr+(s.f?Math.sin(now*90)*1.5:0),bot=gy-(s.z||0)*sz,top=bot-h,ci=cxr|0,vis=ci>=0&&ci<VW&&Z[ci]>s.ty;
   if(vis){x.fillStyle='rgba(0,0,0,.36)';x.beginPath();x.ellipse(cxr,gy,w*.48*(1-(s.z||0)*.7),Math.max(1,sz*.03),0,0,6.3);x.fill()}
   const lv=Math.max(2,Math.min(8,(8/(1+s.ty*FOG))|0)),src=s.f?I.fl:dd>.25?I.sh[Math.max(2,lv-2)]:I.sh[lv];
   const sw=Math.sin(ph),bb=Math.abs(Math.cos(ph))*sz*.04*mv,lean=sw*h*.05*mv-atk*h*.05+(s.f?h*.04:0),stride=sz*.11*mv,SPL=.62,uh=h*SPL,lh=h*(1-SPL),sy=I.h*SPL;
   const x0=Math.max(0,(cx-w/2)|0),x1=Math.min(VW-1,(cx+w/2)|0);
   if(s.en&&!dd&&I.rd){const k=1.1+.03*Math.sin(now*9),aw=w*k,ah=h*k;x.globalAlpha=.4+.2*Math.sin(now*7);   // Wut-Aura der Bosse
    for(let i=Math.max(0,(cx-aw/2)|0);i<=Math.min(VW-1,(cx+aw/2)|0);i++){if(Z[i]<s.ty)continue;const u=(i-(cx-aw/2))/aw;if(u<0||u>=1)continue;x.drawImage(I.rd,(u*I.w)|0,0,1,I.h,i,bot-ah,1,ah)}}
   x.globalAlpha=(1-.92*fe)*(.4+.6*gr);
   for(let i=x0;i<=x1;i++){if(Z[i]<s.ty)continue;const u=(i-(cx-w/2))/w;if(u<0||u>=1)continue;
    const sx=Math.min(I.w-1,(u*I.w)|0),lift=(u<.5?Math.max(0,sw):Math.max(0,-sw))*stride,off=(u-.5)*2;
    x.drawImage(src,sx,0,1,sy,i,top-bb+lean*off,1,uh+.5);
    x.drawImage(src,sx,sy,1,I.h-sy,i,top+uh-lift*(1-.35*Math.abs(off)),1,lh+.5+lift*.3)}
   x.globalAlpha=1;
   if(vis&&(s.sn||s.br||s.sl))enemyMarks(s,cxr,top,sz,now);
   if(atk>.55&&SHOOTER[s.t]&&vis)star(cx+w*.3,top+h*.42,Math.max(2,sz*.07));
   continue}
  let h=sz*T.s,w=h*T.w,bot=gy-sz*T.z-(s.z||0)*sz;
  if(s.pk){bot-=(.07+.04*Math.sin(now*3+s.x*5))*sz;if(s.t==25)w*=Math.max(.18,Math.abs(Math.cos(now*4+s.x)))}
  const cx=cxr,top=bot-h,x0=Math.max(0,(cx-w/2)|0),x1=Math.min(VW-1,(cx+w/2)|0),lv=Math.max(2,Math.min(8,(8/(1+s.ty*FOG))|0));
  if((s.pk||s.pl)&&cx>=0&&cx<VW&&Z[cx|0]>s.ty){x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(cx,gy,w*.5,Math.max(1,sz*.025),0,0,6.3);x.fill()}
  for(let i=x0;i<=x1;i++){
   if(Z[i]<s.ty)continue;const u=(i-(cx-w/2))/w;
   for(const q of T.f(u,s)){x.fillStyle=(s.t>1&&s.t<6||s.t==12||s.t>22||s.pk)?q[2]:SH(q[2],lv);x.fillRect(i,top+h*q[0],1,h*(q[1]-q[0])+.5)}
  }
 }
 if(attractOn){toHud();return}
 const lab=[];for(const s of sp)if(s.pl&&s.ty>.3&&Math.abs(s.tx/s.ty)<1){const cx=VW/2*(1+s.tx/s.ty),sz=VH/s.ty;if(Z[cx|0]>s.ty)lab.push([s.n,cx,HZ+EY*sz-(s.z||0)*sz-sz*.92,s.c])}
 toHud();
 x.font='bold 7px monospace';x.textAlign='center';for(const[n,a,b,c]of lab){x.fillStyle='#000a';x.fillText(n,a+.5,b-2.5);x.fillStyle='#fff';x.fillText(n,a,b-3);x.fillStyle=c;x.beginPath();x.moveTo(a-3,b-1);x.lineTo(a+3,b-1);x.lineTo(a,b+3);x.fill()}
 hud();
}
function hud(){
 const P=S.p[id],w=WP[me.w],gx=VW/2,now=performance.now()/1000;
 x.fillStyle=vg;x.fillRect(0,0,VW,VH);if(fl>0){x.fillStyle='rgba(255,190,80,.08)';x.fillRect(0,0,VW,VH)}mini();
 for(let i=TR.length-1;i>=0;i--){const q=TR[i];q.l-=dt;if(q.l<=0){TR.splice(i,1);continue}x.globalAlpha=q.l/q.m;x.strokeStyle=q.c;x.lineWidth=q.w;x.beginPath();x.moveTo(VM.mx+q.ox*.3,VM.my);x.lineTo(gx+q.tx,VH/2+q.ty);x.stroke()}x.globalAlpha=1;
 for(let i=PT.length-1;i>=0;i--){const q=PT[i];q.l-=dt;if(q.l<=0){PT.splice(i,1);continue}q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=q.g*dt;x.fillStyle=q.c;x.fillRect(q.x,q.y,q.s||2,q.s||2)}
 drawWeapon(P,now);
 if(hm>0){x.strokeStyle='#f33';x.lineWidth=1.5;x.beginPath();for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){x.moveTo(gx+a*4,VH/2+b*4);x.lineTo(gx+a*9,VH/2+b*9)}x.stroke()}
 if(VM.ak<.4){const g=(2.5+rec*4+(me.z>0?2:0))*(WP[me.w]&&WP[me.w].sp>.06?1.5:1);x.fillStyle='#000a';x.fillRect(gx-1,VH/2-g-4.5,2,5);x.fillRect(gx-1,VH/2+g-.5,2,5);x.fillRect(gx-g-4.5,VH/2-1,5,2);x.fillRect(gx+g-.5,VH/2-1,5,2);
  x.fillStyle='#fff';x.fillRect(gx-.5,VH/2-g-4,1,4);x.fillRect(gx-.5,VH/2+g,1,4);x.fillRect(gx-g-4,VH/2-.5,4,1);x.fillRect(gx+g,VH/2-.5,4,1);x.fillRect(gx-.5,VH/2-.5,1,1)}
 else if(!VM.sc){x.fillStyle='#000a';x.fillRect(gx-1.5,VH/2-1.5,3,3);x.fillStyle='#ff3b3b';x.fillRect(gx-1,VH/2-1,2,2)}
 if(hurtFl>0){x.fillStyle='rgba(255,0,0,'+hurtFl+')';x.fillRect(0,0,VW,VH)}
 if(healFl>0){healFl-=dt;x.fillStyle='rgba(80,255,140,'+(healFl*.5).toFixed(2)+')';x.fillRect(0,0,VW,VH)}
 ultHud(P,now);
 if(P.al&&P.hp<30){const q=x.createRadialGradient(gx,VH/2,VH*.3,gx,VH/2,VW*.6);q.addColorStop(0,'rgba(200,0,0,0)');q.addColorStop(1,'rgba(200,0,0,'+(.3+.15*Math.sin(now*6)).toFixed(2)+')');x.fillStyle=q;x.fillRect(0,0,VW,VH)}
 // Statusleiste unten links: Leben, Ruestung, Waffe, Munition
 {const bx=8,by=VH-22,bw=104;x.fillStyle='#000b';x.fillRect(bx-2,by-2,bw+4,19);
  const q=x.createLinearGradient(bx,0,bx+bw,0);q.addColorStop(0,'#8e1414');q.addColorStop(1,P.hp<30?'#ff3b3b':'#e8482e');x.fillStyle='#2a0d0d';x.fillRect(bx,by,bw,10);x.fillStyle=q;x.fillRect(bx,by,bw*Math.max(0,P.hp)/100,10);x.fillStyle='#fff3';x.fillRect(bx,by,bw*Math.max(0,P.hp)/100,2);
  x.fillStyle='#0d1a2e';x.fillRect(bx,by+11,bw,4);x.fillStyle='#4aa3ff';x.fillRect(bx,by+11,bw*(P.ar||0)/100,4);
  x.font='bold 9px monospace';x.textAlign='left';x.fillStyle='#fff';x.fillText('HP '+(P.hp|0),bx+3,by+8.5);if(P.ar){x.textAlign='right';x.fillStyle='#bfe0ff';x.fillText('RÜSTUNG '+(P.ar|0),bx+bw-3,by+8.5);x.textAlign='left'}
  x.font='bold 11px monospace';x.fillStyle='#000a';x.fillText(w.nm,bx+bw+9,by+5);x.fillStyle='#fd4';x.fillText(w.nm,bx+bw+8,by+4);
  x.font='bold 10px monospace';const am=w.am?P.am[me.w]:null;x.fillStyle=am===0?'#f55':'#fff';x.fillText(w.am?'Munition '+am+' / '+MX[me.w]:me.w?'Munition ∞':'',bx+bw+8,by+15);
  x.font='8px monospace';let xx=8;const OL=owned(me.lo||63),cmp=OL.reduce((n,v,k)=>n+((k+1)+' '+trs(SN[v])).length*4.9+8,0)>270;OL.forEach((v,k)=>{const t=cmp?''+(k+1):(k+1)+' '+trs(SN[v]),tw=t.length*4.9+6;x.fillStyle=v==me.w?'#fd4':'#000a';x.fillRect(xx,by-15,tw,10);x.fillStyle=v==me.w?'#000':'#bbb';x.fillText(t,xx+3,by-7.5);xx+=tw+2})}
 // Spezialwaffe des Charakters (Q)
 if(CHARS[P.ch|0]){const qx=8,qy=VH-52,qw=96,on=P.ua>0,rdy=!(P.qc>0),k=on?P.ua/(P.um||1):rdy?1:1-P.qc/(CHARS[P.ch|0][3]||SPEC_CD);x.fillStyle='#000b';x.fillRect(qx-2,qy-11,qw+4,19);x.fillStyle='#2a1a0d';x.fillRect(qx,qy,qw,6);
  x.fillStyle=on?'#5ee8ff':rdy?(Math.sin(now*6)>0?'#ffd23f':'#ff9a2a'):'#8a5a2a';x.fillRect(qx,qy,qw*k,6);x.font='bold 8px monospace';x.textAlign='left';x.fillStyle=rdy||on?'#fff':'#bbb';x.fillText('Q  '+CHARS[P.ch|0][2]+(on?'  AKTIV':rdy?'':'  '+Math.ceil(P.qc)+'s'),qx+1,qy-3)}
 x.font='bold 12px monospace';x.textAlign='left';x.fillStyle='#fff';
 x.fillText(S.st?storyHudTop():S.dm?'DEATHMATCH':'WELLE '+S.wv+'   Gegner '+S.e.filter(e=>!e.dead).length+(mode==1&&best?'  Rekord '+best:''),8,14);if(S.st)storyHud();if(hostCode&&mode==1)x.fillText('Raum-Code: '+hostCode,8,S.st?42:28);
 x.textAlign='right';
 S.p.forEach((p,k)=>{if(p.on){x.fillStyle=PC[p.i];x.fillText((p.i==id?'> ':'')+(p.nm||'P'+(p.i+1))+'  '+(p.al?p.hp|0:'tot')+'  '+p.sc,VW-8,14+k*14)}});
 coinHud();
 x.textAlign='center';x.fillStyle='#fff';x.font='bold 16px monospace';
 {const B=S.e.find(e=>(e.t==10||e.t==19||e.t>=30)&&!e.dead);if(B){const bw=220,bx0=gx-bw/2;x.fillStyle='#000a';x.fillRect(bx0-2,38,bw+4,14);x.fillStyle=B.hp<B.mh*.5?'#f80':B.t==19||B.t==35?'#a2c':'#c22';x.fillRect(bx0,40,bw*Math.max(0,B.hp/B.mh),10);x.fillStyle='#fff3';x.fillRect(bx0,40,bw*Math.max(0,B.hp/B.mh),2);x.font='bold 11px monospace';x.fillStyle='#fff';x.textAlign='center';x.fillText(bossName(B.t),gx,36);x.font='bold 16px monospace'}}
 if(!P.al){x.fillStyle='rgba(120,0,0,.5)';x.fillRect(0,0,VW,VH);x.fillStyle='#fff';x.fillText(S.st&&S.st.lives<=0&&P.rt<=0?'KEINE LEBEN MEHR - dein Team muss durchhalten!':'DU BIST TOT - Respawn in '+Math.max(0,Math.ceil(P.rt)),VW/2,VH/2)}
 else if(!S.dm&&!S.e.some(e=>!e.dead)&&(!S.st||S.st.ph=='play'))x.fillText(S.st&&S.st.wv>=S.st.wm?'Der Boss kommt...':'Nächste Welle kommt...',VW/2,50);
 if(bn>0){const bo=S.st?S.st.boss:S.wv%5==0,sc=1+Math.max(0,bn-3.2)*1.5;x.save();x.translate(VW/2,70);x.scale(sc,sc);x.globalAlpha=Math.min(1,bn);x.font='bold 26px monospace';const t=S.st?storyBanner():bo?'WELLE '+S.wv+' - BOSS: '+bossName(coopBoss(S.wv))+'!':'WELLE '+S.wv;x.fillStyle='#000a';x.fillText(t,1.5,1.5);x.fillStyle=bo?'#f44':'#fd4';x.fillText(t,0,0);x.restore();x.globalAlpha=1;x.font='bold 16px monospace'}
 if(document.pointerLockElement!==cv&&!GP.on&&!pmOpen){x.fillStyle='#fd4';x.fillText('KLICKEN ZUM STEUERN',VW/2,VH/2-40)}
 if(paused){x.fillStyle='rgba(0,0,0,.5)';x.fillRect(0,0,VW,VH);x.fillStyle='#fff';x.fillText('PAUSE  (P = weiter)',VW/2,VH/2)}
 if(muted){x.font='10px monospace';x.fillStyle='#aaa';x.textAlign='left';x.fillText('Ton aus (N)',8,VH-46);x.textAlign='center';x.font='bold 16px monospace'}
 if(lost){x.fillStyle='#f55';x.fillText('VERBINDUNG ZUM HOST VERLOREN',VW/2,VH/2)}
}
// ---------- Hauptschleife ----------
let last=performance.now();
function loop(t){
 dt=Math.min(.05,(t-last)/1000);last=t;
 if(mode){
  if(pmOpen)padMenu();padPoll();
  if(mode==1){
    if(story)storyTick(dt);else if(!paused)sim(dt);if(!dm&&!story&&wave>best){best=wave;try{localStorage.hfBest=wave}catch(e){}}S={t:'s',m:cur,dm:dm,ev:EV,p:players,e:E,j:J,k:PK,wv:wave,z:ZN,st:story?SS:undefined};
   snapT-=dt;if(snapT<=0){snapT=.05;const m=JSON.stringify(S,rnd);chs.forEach(c=>{if(c&&(c.readyState=='open'||c.open))c.send(m)});EV=[]}
  }
   if(S&&S.p){if(mode==2&&S.m!==undefined&&S.m!==cur)loadMap(S.m);local();if(S.st)storyClient();if(S.st&&storyFull()){toHud();storyScreen()}else{render();if(S.st)storyOverlay()}}
   else if(mode==2){toHud();x.fillStyle='#0b0b0e';x.fillRect(0,0,VW,VH);x.fillStyle='#fd4';x.font='bold 14px monospace';x.textAlign='center';x.fillText('Verbunden! Warte, bis der Host startet...',VW/2,VH/2)}
 }else if(typeof attract=='function')attract(t);
 requestAnimationFrame(loop);
}
function boot(){storyMenu();if(typeof menuInit=='function')menuInit();requestAnimationFrame(loop)}
