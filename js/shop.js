// TAUBENGAME - Case-Shop (gilt fuer Koop und Deathmatch; der Story-Modus hat sein eigenes Case Opening)
// Coins verdienst du in Koop und Story: 1 Coin pro 10 Punkte (normaler Kill = 1, Boss = 50). Im Deathmatch gibt es keine.
// Freigeschaltete Waffen (LO, Bitmaske) und Coins werden im Browser gespeichert.
// od = Chance in Prozent je Seltenheit: [Gewoehnlich, Selten, Episch, Legendaer, ULTRA]
const CHESTS=[
 {nm:'Taubenkiste',cost:40,c1:'#c98a4b',c2:'#7a4a22',od:[70,25,5,0,0]},
 {nm:'Silberkiste',cost:100,c1:'#dfe6ee',c2:'#7d8896',od:[20,45,28,7,0]},
 {nm:'Goldkiste',cost:220,c1:'#ffd65a',c2:'#a8730f',od:[0,15,45,32,8]}];
const DUP_REFUND=.5,START_COINS=50;
let COINS=(()=>{try{const v=localStorage.hfCoins;return v==null?START_COINS:Math.max(0,+v||0)}catch(e){return START_COINS}})();
let lastSc=0,coinFl=0,coinAdd=0,shopBusy=0,shopPend=-1;   // shopPend = gerade gezogene Waffe, bleibt bis zum Ende der Walze verdeckt
const RW=r=>Object.keys(RAR).map(Number).filter(w=>RAR[w]==r);   // Waffen einer Seltenheit
const hasW=w=>(LO>>w&1)&&w!==shopPend;
const chestDone=c=>![0,1,2,3,4].some(r=>c.od[r]>0&&RW(r).some(w=>!(LO>>w&1)));   // Kiste kann nichts Neues mehr geben
function saveShop(){try{localStorage.hfCoins=Math.floor(COINS*10)/10;localStorage.hfInv=LO}catch(e){}}
function earn(n){if(!(n>0))return;const a=COINS|0;COINS+=n;coinAdd+=n;coinFl=1.4;if((COINS|0)!==a)saveShop()}
// Wird jeden Frame im Spiel aufgerufen (Host und Mitspieler): Punkte des eigenen Spielers -> Coins
function shopTick(P){const sc=P.sc|0;if(sc<lastSc)lastSc=sc;if(!S.dm&&sc>lastSc)earn((sc-lastSc)/10);lastSc=sc;if(coinFl>0){coinFl-=dt;if(coinFl<=0)coinAdd=0}}
function coinHud(){if(S.dm)return;const y=showMap?62+N*3+14:66;x.textAlign='right';x.font='bold 10px monospace';x.fillStyle='#000a';x.fillText('Shop-Coins '+(COINS|0),VW-7,y+1);x.fillStyle='#ffd23f';x.fillText('Shop-Coins '+(COINS|0),VW-8,y);
 if(coinFl>0&&coinAdd>=1){x.globalAlpha=Math.min(1,coinFl);x.fillStyle='#fff3a0';x.fillText('+'+(coinAdd|0),VW-8,y+12+(1.4-coinFl)*-6);x.globalAlpha=1}}
// ---------- Menue ----------
const ICON={};
function icon(w){if(ICON[w])return ICON[w];const im=WIMG[w],c=document.createElement('canvas');c.width=64;c.height=64;const g=c.getContext('2d');if(im){const h=60,wd=h*WIMG.W/WIMG.H;g.drawImage(im,32-wd/2,62-h,wd,h)}return ICON[w]=c.toDataURL()}
function lsu(){$('ls').textContent=(COINS|0)+' Coins · '+(owned(LO).filter(hasW).length-1)+'/'+(WP.length-1)+' Waffen';if($('coinbal'))shopRender()}
function chestSvg(c){return '<svg viewBox="0 0 80 64" aria-hidden="true"><rect x="8" y="30" width="64" height="30" rx="3" fill="'+c.c2+'"/><rect x="10" y="32" width="60" height="26" rx="2" fill="'+c.c1+'"/>'+
 '<g class="lid"><path d="M8 30 Q8 10 40 10 Q72 10 72 30 Z" fill="'+c.c2+'"/><path d="M11 29 Q11 13 40 13 Q69 13 69 29 Z" fill="'+c.c1+'"/></g>'+
 '<rect x="34" y="26" width="12" height="14" rx="2" fill="#2a1d10"/><rect x="37" y="30" width="6" height="6" rx="1" fill="'+c.c1+'"/><rect x="8" y="44" width="64" height="3" fill="#0004"/></svg>'}
function shopRender(){
 $('coinbal').textContent=(COINS|0)+' Coins';
 const cs=$('chests');if(!cs.dataset.ok){cs.dataset.ok=1;CHESTS.forEach((c,i)=>{const d=document.createElement('div');d.className='chest';d.style.setProperty('--c1',c.c1);
  d.innerHTML=chestSvg(c)+'<b>'+c.nm+'</b><ul>'+c.od.map((p,r)=>p?'<li><i style="background:'+RARC[r]+'"></i>'+RARN[r]+' '+p+' %</li>':'').join('')+'</ul><button class="pri" data-i="'+i+'"></button>';
  d.querySelector('button').onclick=()=>openChest(i);cs.appendChild(d)})}
 cs.querySelectorAll('button').forEach(b=>{const c=CHESTS[+b.dataset.i],dn=chestDone(c);b.disabled=shopBusy||dn||COINS<c.cost;b.textContent=dn?'Alles freigeschaltet':'Öffnen · '+c.cost+' Coins'});
 const inv=$('inv');inv.innerHTML='';for(let w=1;w<WP.length;w++){const has=hasW(w),r=w==1?0:RAR[w],d=document.createElement('div');d.className='wi'+(has?' has':'');d.style.setProperty('--rc',RARC[r]);
  d.innerHTML='<img src="'+icon(w)+'" alt=""><b>'+(has?WP[w].nm:'???')+'</b><i>'+(w==1?'Start':RARN[r])+'</i>';inv.appendChild(d)}
}
function roll(od){let q=Math.random()*100;for(let r=0;r<od.length;r++){q-=od[r];if(q<0)return r}return 0}
function openChest(i){
 const c=CHESTS[i];if(shopBusy||COINS<c.cost||chestDone(c))return;
 let r=roll(c.od),cand=RW(r).filter(w=>!(LO>>w&1));
 if(!cand.length){const up=[0,1,2,3,4].filter(q=>c.od[q]>0&&RW(q).some(w=>!(LO>>w&1)));if(up.length&&Math.random()<.5){r=up[Math.random()*up.length|0];cand=RW(r).filter(w=>!(LO>>w&1))}}   // halbe Chance auf eine andere Stufe, in der noch was fehlt
 const dup=!cand.length,pool=dup?RW(r):cand,w=pool[Math.random()*pool.length|0];
 COINS-=c.cost;if(!dup){LO|=1<<w;shopPend=w}saveShop();shopBusy=1;lsu();spin(c,w,dup);
}
// Walze wie im Story-Case-Opening, nur als HTML
function spin(c,w,dup){
 const box=$('reel'),strip=box.querySelector('.strip'),res=$('reelres'),IW=86,WIN=36;box.classList.add('on');res.className='res dyn';res.innerHTML='';
 const items=[];for(let k=0;k<44;k++){const r=roll(c.od),L=RW(r);items.push(L[Math.random()*L.length|0])}items[WIN]=w;
 strip.style.transition='none';strip.style.transform='translateX(0)';strip.innerHTML=items.map(v=>'<div class="it" style="--rc:'+RARC[RAR[v]]+'"><img src="'+icon(v)+'" alt=""><span>'+trs(SN[v])+'</span></div>').join('');
 const off=WIN*IW-box.clientWidth/2+IW/2+(Math.random()-.5)*50;void strip.offsetWidth;
 strip.style.transition='transform 5.2s cubic-bezier(.1,.7,.1,1)';strip.style.transform='translateX('+(-off)+'px)';
 box.scrollIntoView({block:'nearest',behavior:'smooth'});
 let last=-1;const t0=performance.now(),tick=()=>{const m=new DOMMatrix(getComputedStyle(strip).transform),k=Math.floor((-m.m41+box.clientWidth/2)/IW);if(k!==last){last=k;try{ac();tone(900+Math.random()*80,700,.035,'square',.07)}catch(e){}}if(performance.now()-t0<5300)requestAnimationFrame(tick);else done()};requestAnimationFrame(tick);
 function done(){const rf=dup?Math.round(c.cost*DUP_REFUND):0;if(rf){COINS+=rf;saveShop()}shopBusy=0;shopPend=-1;
  try{play(3);play(7)}catch(e){}
  res.style.setProperty('--rc',RARC[RAR[w]]);res.className='res dyn on';
  res.innerHTML='<img src="'+icon(w)+'" alt=""><div><i>'+RARN[RAR[w]]+'</i><b>'+WP[w].nm+'</b><span>'+(dup?'Doppelt: +'+rf+' Coins zurück':'NEU! '+DS[w])+'</span></div>';
  lsu()}
}
function shopInit(){const p=$('p-guns');if(!p)return;lsu()}
