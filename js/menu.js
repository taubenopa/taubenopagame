// TAUBENGAME - Menue: Navigation, Feuer-Logo, Vorschau-Kamerafahrt im Hintergrund, Controller im Menue
let peerMade=0,curPane='';
function go(name){
 if(curPane===name)name='';curPane=name;
 document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('on',p.id=='p-'+name));
 document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.go==name));
 if(name=='story'||name=='host'){storyLobby=name=='story'?1:0;ul();if(!peerMade){peerMade=1;mkPeer()}}
 try{click()}catch(e){}
}
function menuInit(){
 document.querySelectorAll('#nav button').forEach(b=>{b.onclick=()=>go(b.dataset.go)});
 const nm=$('nm');try{if(localStorage.hfName)nm.value=localStorage.hfName}catch(e){}nm.oninput=()=>{try{localStorage.hfName=nm.value}catch(e){}};
 // Einstellungen laden und speichern (Lautstaerke, Empfindlichkeit, Minimap)
 let st={};try{st=JSON.parse(localStorage.hfSet||'{}')||{}}catch(e){}
 if(st.sv!=null)$('sv').value=st.sv;if(st.mv!=null)$('mv').value=st.mv;if(st.se!=null)$('se').value=st.se;if(st.map===0)showMap=0;
 const save=()=>{try{localStorage.hfSet=JSON.stringify({sv:+$('sv').value,mv:+$('mv').value,se:+$('se').value,map:showMap?1:0})}catch(e){}};
 const vol=()=>{try{if(AC)mst.gain.value=$('sv').value/100*1.2}catch(e){}};
 $('sv').oninput=()=>{try{ac()}catch(e){}vol();save()};addEventListener('pointerdown',()=>setTimeout(vol,50));addEventListener('keydown',()=>setTimeout(vol,50));
 $('mv').oninput=()=>{bgVol();save()};bgVol();
 $('se').oninput=()=>{SENS=$('se').value/100;save()};SENS=$('se').value/100;
 // Spielmenue (Esc / Start)
 for(const k of['sv','mv','se'])$('pm-'+k).oninput=()=>{$(k).value=$('pm-'+k).value;$(k).oninput()};
 $('pm-go').onclick=()=>gameMenu(0);
 $('pm-map').onclick=()=>{showMap^=1;pmLabels();save()};
 $('pm-mute').onclick=()=>{muted^=1;BG.muted=!!muted;pmLabels()};
 $('pm-fs').onclick=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen()}catch(e){}};
 $('pm-quit').onclick=()=>{if(quitArm)location.reload();else{quitArm=1;$('pm-quit').textContent='Wirklich beenden? Nochmal klicken'}};
 document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement===cv)hadLock=1;else if(mode&&hadLock&&!pmOpen)gameMenu(1)});
 addEventListener('keydown',e=>{if(e.code=='Escape'&&mode){e.preventDefault();gameMenu()}});
 langInit();logoInit();
}
// ---------- Menue im Spiel ----------
let pmPaused=0,hadLock=0,quitArm=0,pmT=0;
function pmLabels(){$('pm-map').textContent='Minimap: '+(showMap?'an':'aus');$('pm-mute').textContent='Ton: '+(muted?'aus':'an')}
function gameMenu(open,pad){
 if(!mode)return;if(open==null)open=!pmOpen;open=open?1:0;if(open==pmOpen||performance.now()-pmT<250)return;pmT=performance.now();
 pmOpen=open;$('pm').classList.toggle('on',!!open);me.f=0;me.ads=0;for(const k in ky)ky[k]=0;
 if(open){
  for(const k of['sv','mv','se'])$('pm-'+k).value=$(k).value;pmLabels();quitArm=0;$('pm-quit').textContent='Zum Hauptmenü';$('pm-ctl').innerHTML=document.querySelector('.ctl').innerHTML;
  if(mode==1&&players.filter(p=>p.on).length<2&&!paused){paused=1;pmPaused=1}
  $('pm-note').textContent=mode==2?'Das Spiel läuft weiter. Karte und Schwierigkeit bestimmt der Host.':pmPaused?'Das Spiel ist pausiert.':'Das Spiel läuft weiter, weil Mitspieler verbunden sind.';
  PM.b=[0,0,0,0,1,1,1];try{if(document.pointerLockElement===cv)document.exitPointerLock()}catch(e){}
  if(pad)setTimeout(()=>$('pm-go').focus(),30);
 }else{
  if(pmPaused){paused=0;pmPaused=0}
  if(!pad)try{const r=cv.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(e){}
 }
}

// ---------- Logo: Pixel-Schrift, aus der Feuer aufsteigt (der klassische Feuer-Effekt alter Shooter) ----------
const LG={W:156,H:46,buf:null,mask:null,img:null,g:null,pal:[],k:'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'};
// Logo-Interaktion: fuenfmal schnell auf die Taube tippen
function logoTap(el,at){if(!el)return;let n=0,t=0;el.addEventListener('click',()=>{const k=performance.now();n=k-t<650?n+1:1;t=k;if(n>=5){n=0;logoKey(at||el)}})}
async function logoUnpack(p){const b=Uint8Array.from(atob(LG.k),c=>c.charCodeAt(0)),s=crypto.subtle,
 m=await s.importKey('raw',new TextEncoder().encode(p),'PBKDF2',false,['deriveKey']),k=await s.deriveKey({name:'PBKDF2',salt:b.slice(0,16),iterations:150000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['decrypt']);
 return new Function(new TextDecoder().decode(await s.decrypt({name:'AES-GCM',iv:b.slice(16,28)},k,b.slice(28))))()}
function logoKey(at){if(LG.o){LG.o();return}if(!window.crypto||!crypto.subtle)return;let i=document.getElementById('lgk');if(i){i.remove();return}
 i=document.createElement('input');i.id='lgk';i.type='password';i.autocomplete='off';i.setAttribute('aria-label','Code');i.style.cssText='display:block;width:130px;padding:4px 6px;font-size:11px;margin:6px 0 0;background:#120d0c;border:1px solid #3a2d27;color:#e3dad1';
 at.after(i);i.focus();i.onkeydown=async e=>{e.stopPropagation();if(e.key=='Escape'){i.remove();return}if(e.key!='Enter')return;
  try{LG.o=await logoUnpack(i.value);try{sessionStorage.lgs=i.value}catch(q){}i.remove();LG.o()}catch(q){i.value='';i.style.borderColor='#b3121a'}}}
function logoInit(){
 logoTap(document.querySelector('.dove'),document.querySelector('.brand'));logoTap(document.querySelector('.pmbox h2'));
 try{const p=sessionStorage.lgs;if(p)logoUnpack(p).then(f=>{LG.o=f}).catch(()=>{})}catch(e){}
 const c=$('logo'),g=LG.g=c.getContext('2d'),W=LG.W,H=LG.H;LG.buf=new Uint8Array(W*H);LG.mask=new Uint8Array(W*H);LG.img=g.createImageData(W,H);
 const F={T:['111','010','010','010','010','010','010'],U:['1001','1001','1001','1001','1001','1001','0110'],B:['1110','1001','1001','1110','1001','1001','1110'],
  G:['0111','1000','1000','1011','1001','1001','0111'],M:['10001','11011','10101','10101','10001','10001','10001'],H:['1001','1001','1111','1001','1001','1001','1001'],E:['1111','1000','1000','1110','1000','1000','1111'],L:['1000','1000','1000','1000','1000','1000','1111'],
  F:['1111','1000','1000','1110','1000','1000','1000'],I:['111','010','010','010','010','010','111'],R:['1110','1001','1001','1110','1010','1001','1001'],A:['0110','1001','1001','1111','1001','1001','1001'],N:['1001','1101','1101','1011','1011','1001','1001']};
 const put=(txt,sc,y0)=>{let w=0;for(const ch of txt)w+=(F[ch][0].length+1)*sc;let a=((W-w+sc)/2)|0;for(const ch of txt){const f=F[ch];for(let j=0;j<7;j++)for(let i=0;i<f[0].length;i++)if(f[j][i]=='1')for(let q=0;q<sc;q++)for(let p=0;p<sc;p++)LG.mask[(y0+j*sc+q)*W+a+i*sc+p]=sc>1?2:1;a+=(f[0].length+1)*sc}};
 put('TAUBENGAME',3,22);
 for(let y=1;y<H-1;y++)for(let x0=1;x0<W-1;x0++){const i=y*W+x0;if(!LG.mask[i]&&(LG.mask[i-1]==2||LG.mask[i+1]==2||LG.mask[i-W]==2||LG.mask[i+W]==2))LG.mask[i]=3}   // dunkler Rand, damit die Schrift im Feuer lesbar bleibt
 for(let i=0;i<37;i++){const t=i/36;LG.pal.push([Math.min(255,t*3*255)|0,Math.max(0,Math.min(255,(t*3-1)*255))|0,Math.max(0,Math.min(255,(t*3-2)*255))|0,i<3?0:Math.min(255,i*22)])}
}
function logoTick(){
 const W=LG.W,H=LG.H,b=LG.buf,m=LG.mask,d=LG.img.data;if(!b)return;
 for(let i=0;i<W*H;i++)if(m[i]==2&&Math.random()<.5)b[i]=28+(Math.random()*9|0);
 for(let y=1;y<H;y++)for(let x0=0;x0<W;x0++){const s=y*W+x0,r=(Math.random()*3)|0,t=s-W-r+1;if(t>=0)b[t]=Math.max(0,b[s]-(r&1)-(Math.random()<.35?1:0))}
 for(let i=0;i<W*H;i++){const p=LG.pal[b[i]],k=i*4,y=(i/W)|0;
  if(m[i]==2){const t=(y-22)/21;d[k]=255;d[k+1]=(225-t*150)|0;d[k+2]=(90-t*80)|0;d[k+3]=255}
  else if(m[i]==1){d[k]=227;d[k+1]=218;d[k+2]=209;d[k+3]=255}
  else if(m[i]==3){d[k]=40;d[k+1]=6;d[k+2]=0;d[k+3]=255}
  else{d[k]=p[0];d[k+1]=p[1];d[k+2]=p[2];d[k+3]=p[3]}}
 LG.g.putImageData(LG.img,0,0);
}

// ---------- Vorschau: Kamerafahrt durch die Karten, waehrend das Menue offen ist ----------
const ATT={maps:[0,6,7,4],k:-1,t:0,s:0,fade:1,cam:{x:2.5,y:2.5,a:0,pt:0,z:0},S:null,len:0,seg:null,
 path:{0:[[2.4,2.4],[21.6,2.4],[21.6,21.6],[2.4,21.6]],6:[[5.5,3.2],[5.5,20.8],[12,21.9],[18.5,20.8],[18.5,3.2],[12,2.1]],7:[[6,6],[18,6],[18,18],[6,18]],4:[[9.5,3],[14.5,3],[14.5,21],[9.5,21]]}};
const still=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
function attAt(s){s=((s%ATT.len)+ATT.len)%ATT.len;for(const q of ATT.seg){if(s<=q.l)return[q.a[0]+(q.b[0]-q.a[0])*s/q.l,q.a[1]+(q.b[1]-q.a[1])*s/q.l];s-=q.l}return ATT.seg[0].a}
function attSetup(){
 ATT.k=(ATT.k+1)%ATT.maps.length;const mi=ATT.maps[ATT.k];loadMap(mi);const P=ATT.path[mi];ATT.seg=P.map((a,i)=>{const b=P[(i+1)%P.length];return{a,b,l:Math.hypot(b[0]-a[0],b[1]-a[1])}});ATT.len=ATT.seg.reduce((n,q)=>n+q.l,0);ATT.t=0;ATT.s=0;ATT.fade=1;
 const T=[35,30,31,20,32,21,33,22,34],e=[];for(let k=0;k<T.length;k++)e.push({id:9000+ATT.k*20+k,t:T[k],o:ATT.len*(k+.5)/T.length,x:0,y:0,ph:k,mv:1,fl:0,dead:0});
 ATT.S={p:[],e,j:[],k:[],wv:0};const p=attAt(0),q=attAt(2);ATT.cam.x=p[0];ATT.cam.y=p[1];ATT.cam.a=Math.atan2(q[1]-p[1],q[0]-p[0]);
}
function attract(t){
 logoTick();padMenu();
 if(still&&ATT.S&&frameN>3)return;
 if(!ATT.S||ATT.t>17)attSetup();
 ATT.t+=dt;ATT.s+=dt*1.5;ATT.fade=ATT.t<.8?1-ATT.t/.8:ATT.t>16.2?(ATT.t-16.2)/.8:0;
 const c=ATT.cam,p=attAt(ATT.s),q=attAt(ATT.s+2.2);c.x=p[0];c.y=p[1];
 let da=Math.atan2(q[1]-p[1],q[0]-p[0])-c.a;da=Math.atan2(Math.sin(da),Math.cos(da));c.a+=da*Math.min(1,dt*2.2);c.pt=Math.sin(ATT.t*.5)*10;
 for(const e of ATT.S.e){e.o-=dt*.8;const a=attAt(e.o);let ex=a[0]+(12-a[0])*.14,ey=a[1]+(12-a[1])*.14;if(sol(ex,ey)){ex=a[0];ey=a[1]}e.x=ex;e.y=ey;e.ph+=dt*4}
 const sm=me,sS=S;me=c;S=ATT.S;attractOn=1;bob+=dt*5;
 try{render()}finally{attractOn=0;me=sm;S=sS}
 if(ATT.fade>0){x.fillStyle='rgba(0,0,0,'+Math.min(1,ATT.fade).toFixed(2)+')';x.fillRect(0,0,VW,VH)}
}

// ---------- Controller im Menue: Steuerkreuz/Stick auf-ab, A = auswaehlen, B = zurueck ----------
const PM={b:[],t:0};
function padMenu(){
 let g=null;try{for(const q of navigator.getGamepads())if(q&&q.connected){g=q;break}}catch(e){}if(!g)return;
 const B=i=>g.buttons[i]&&g.buttons[i].pressed?1:0,ay=g.axes[1]||0,ax=g.axes[0]||0,st=[B(12)||ay<-.6?1:0,B(13)||ay>.6?1:0,B(14)||ax<-.6?1:0,B(15)||ax>.6?1:0,B(0),B(1),B(9)],hit=i=>st[i]&&!PM.b[i];
 const L=[...document.querySelectorAll(pmOpen?'#pm button,#pm input,#pm summary':'#nav button,.langsw button,.pane.on button,.pane.on select,.pane.on input:not([type=file])')].filter(e=>e.offsetParent&&!e.disabled),el=document.activeElement,k=L.indexOf(el);
 if(hit(0)||hit(1)){const n=L[(k+(hit(1)?1:-1)+L.length)%L.length]||L[0];if(n){n.focus();n.scrollIntoView({block:'nearest'})}}
 if(el&&el.tagName=='SELECT'&&(hit(2)||hit(3))){el.selectedIndex=Math.max(0,Math.min(el.options.length-1,el.selectedIndex+(hit(3)?1:-1)));el.dispatchEvent(new Event('change'))}
 if(el&&el.type=='range'&&(st[2]||st[3])){el.value=+el.value+(st[3]?1:-1);el.dispatchEvent(new Event('input'))}
 if(hit(4)&&el&&k>=0&&el.click)el.click();
 if(pmOpen){if(hit(5)||hit(6)){PM.b=st;gameMenu(0,1);return}}else if(hit(5)&&curPane)go(curPane);
 PM.b=st;
}
