// TAUBENGAME - Ultimates (Spezialfaehigkeit auf Q / Rechtsklick / X)
// Jeder Charakter hat eine eigene Mechanik: Schild, Buff, Teleport, Zone, Luftschlag, Bumerang, Bekehren, Betaeubung, Dauerstrahl, Heilung.
// Name und Abklingzeit stehen in CHARS (story.js), die Beschreibung in CDESC, die Wirkung in special() und ultTick().
// Laeuft nur beim Host; Mitspieler sehen alles ueber den Snapshot (Spielerfelder ua/uk/ob, Gegnerfelder sn/sl/br, Zonen S.z).
const CDESC=[
 'Fünf Tauben kreisen 8 Sekunden um dich, picken Gegner und fangen feindliche Geschosse ab.',
 '7 Sekunden doppelter Schaden und 60 % schnelleres Feuer.',
 'Teleport bis zu 7 Felder nach vorn. Alles auf dem Weg nimmt schweren Schaden, du bist kurz unverwundbar.',
 'Wirft eine Dose, die zu einer klebrigen Pfütze wird: Gegner darin sind stark verlangsamt, nehmen Schaden, am Ende explodiert sie.',
 'Ein Heulen schleudert Gegner weg. Danach 8 Sekunden schneller, und Treffer heilen dich.',
 'Ruft einen Steinhagel auf die Stelle, auf die du zielst. 14 Steine in 2,5 Sekunden.',
 'Drei Dog Tags fliegen raus und kommen zurück. Jeder Gegner wird zweimal getroffen.',
 'Geldfächer: Getroffene Gegner wechseln 8 Sekunden die Seite, kämpfen für dich und hauen dann mit der Kohle ab.',
 'Eine Schallwelle betäubt alle Gegner im Umkreis 3 Sekunden lang und löscht feindliche Geschosse.',
 '3 Sekunden ein Laserstrahl, der deinem Blick folgt und alles in der Linie durchbrennt.',
 'Heilt das ganze Team, holt gefallene Mitspieler sofort zurück und stößt Gegner in der Nähe weg.',
 'Wirft drei Burger im Fächer, die beim Aufprall explodieren.'];
const ZN=[];let healFl=0;   // Zonen am Boden: Cola-Pfuetze (k:3), Steinhagel-Ziel (k:5)
const isBoss=e=>e.t>=30||e.t==10||e.t==19;
const vfx=(x0,y0,t,a,v,l)=>J.push({x:x0,y:y0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t,o:-2,l,vis:1});   // reines Effekt-Geschoss ohne Schaden
function push(e,fx,fy,dist){const d=Math.hypot(e.x-fx,e.y-fy)||1,ux=(e.x-fx)/d,uy=(e.y-fy)/d,n=Math.ceil(dist/.2),sl=e.sl;e.sl=0;for(let k=0;k<n;k++)move(e,ux,uy,.2);e.sl=sl}
function special(p){
 if(!p.al)return;const c=p.ch|0,a=p.a,rx=Math.cos(a),ry=Math.sin(a),cd=(CHARS[c]&&CHARS[c][3])||SPEC_CD;
 const P=(t,da,v,o)=>J.push(Object.assign({x:p.x+Math.cos(a+da)*.4,y:p.y+Math.sin(a+da)*.4,vx:Math.cos(a+da)*v,vy:Math.sin(a+da)*v,t,o:p.i,l:3},o));
 const act=s=>{p.ua=s;p.um=s;p.uk=c};
 switch(c){
  case 0:act(8);p.ob=a;break;                                                     // taubenopa: Taubenwaechter
  case 1:act(7);break;                                                            // EuroJunkie: Jackpot
  case 2:{let d=0;const sx=p.x,sy=p.y;while(d<7&&can(sx+rx*(d+.1),sy+ry*(d+.1),.25))d+=.1;   // Jxhn2k: Schattensprung
   for(const e of E){if(e.dead||e.br>0)continue;const vx=e.x-sx,vy=e.y-sy,al=vx*rx+vy*ry;if(al>-.3&&al<d+.5&&Math.abs(vx*ry-vy*rx)<e.r+.6)hurtE(e,isBoss(e)?110:150,p.i)}
   if(dm)for(const q of players){if(q===p||!q.on||!q.al)continue;const vx=q.x-sx,vy=q.y-sy,al=vx*rx+vy*ry;if(al>0&&al<d+.3&&Math.abs(vx*ry-vy*rx)<.6)hitP(q,60,p.i)}
   for(let k=0;k<=d;k+=.45)vfx(sx+rx*k,sy+ry*k,71,0,0,.35+k*.03);
   p.x=sx+rx*d;p.y=sy+ry*d;p.tp=(p.tp|0)+1;p.iv=Math.max(p.iv||0,1);break}
  case 3:P(63,0,9,{pu:1,l:.9});break;                                             // YoungCola: Cola-Pfuetze
  case 4:for(const e of E){if(e.dead||e.br>0)continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<5){hurtE(e,40,p.i);push(e,p.x,p.y,isBoss(e)?1:2.6)}}   // werwlf: Wolfsrausch
   if(dm)for(const q of players)if(q!==p&&q.on&&q.al&&Math.hypot(q.x-p.x,q.y-p.y)<5)hitP(q,25,p.i);
   for(let k=0;k<20;k++)vfx(p.x,p.y,67,k/20*6.283,10,.45);act(8);break;
  case 5:{const d=Math.max(1.2,Math.min(cast(p.x,p.y,rx,ry).d-.6,9));ZN.push({x:p.x+rx*d,y:p.y+ry*d,r:2.2,l:2.6,k:5,o:p.i,tk:.35});break}   // Adam: Steinhagel
  case 6:for(const k of[-.12,0,.12])P(66,k,13,{pd:55,pc:1,rr:.35,bm:1,l:3.5});break;   // Kerimsi: Dog-Tag-Bumerang
  case 7:for(let k=-3;k<=3;k++)P(65,k*.12,11,{pd:15,pc:1,br:1,l:1.5});break;       // Sh1no: Bestechung
  case 8:for(const e of E){if(e.dead||e.br>0)continue;if(Math.hypot(e.x-p.x,e.y-p.y)<7){e.sn=isBoss(e)?1.2:3;hurtE(e,35,p.i)}}   // saesix: Moshpit
   if(dm)for(const q of players)if(q!==p&&q.on&&q.al&&Math.hypot(q.x-p.x,q.y-p.y)<7)hitP(q,20,p.i);
   for(const j of J)if(j.o==-1&&Math.hypot(j.x-p.x,j.y-p.y)<7)j.kill=1;
   for(let k=0;k<16;k++)vfx(p.x,p.y,68,k/16*6.283,13,.5);break;
  case 9:act(3);p.lt=0;break;                                                     // Joshie: Laser-Blick
  case 11:for(const k of[-.18,0,.18])P(73,k,10,{ex:2.4,xd:120,l:1.6});break;   // Muro: Burger-Salve
  default:{for(const q of players){if(!q.on)continue;if(dm&&q!==p)continue;       // souf: Herzschlag
    if(q.al){q.hp=Math.min(100,q.hp+60);q.ar=Math.min(100,(q.ar||0)+30)}
    else{q.al=true;q.hp=60;q.ar=0;q.x=p.x;q.y=p.y;q.rc++;q.iv=2.5;q.rt=0;if(story)storyAmmo(q)}}
   for(const e of E){if(e.dead||e.br>0)continue;if(Math.hypot(e.x-p.x,e.y-p.y)<3.5){hurtE(e,50,p.i);push(e,p.x,p.y,isBoss(e)?.6:1.8)}}
   for(let k=0;k<12;k++)vfx(p.x,p.y,70,k/12*6.283,7,.5)}
 }
 p.qc=cd;ev(10);
}
// Laeuft jeden Tick beim Host (aus sim aufgerufen)
function ultTick(dt){
 for(const e of E){if(e.pk>0)e.pk-=dt}
 for(const p of players){
  if(!p.on)continue;if(!(p.ua>0))continue;p.ua-=dt;if(!p.al){p.ua=0;continue}
  if(p.uk==0){p.ob=(p.ob||0)+dt*3.4;   // Tauben
   for(let k=0;k<5;k++){const a=p.ob+k*1.2566,tx=p.x+Math.cos(a)*1.15,ty=p.y+Math.sin(a)*1.15;
    for(const e of E)if(!e.dead&&!(e.br>0)&&!(e.pk>0)&&Math.hypot(e.x-tx,e.y-ty)<e.r+.35){hurtE(e,32,p.i);e.pk=.35}
    for(const j of J)if(j.o==-1&&!j.kill&&Math.hypot(j.x-tx,j.y-ty)<.5)j.kill=1;
    if(dm)for(const q of players)if(q!==p&&q.on&&q.al&&!(q.pkd>0)&&Math.hypot(q.x-tx,q.y-ty)<.45){hitP(q,12,p.i);q.pkd=.5}}}
  else if(p.uk==9){p.lt=(p.lt||0)-dt;if(p.lt<=0){p.lt=.1;   // Laser
   const rx=Math.cos(p.a),ry=Math.sin(p.a),d=cast(p.x,p.y,rx,ry).d;
   for(const e of E){if(e.dead||e.br>0)continue;const vx=e.x-p.x,vy=e.y-p.y,al=vx*rx+vy*ry;if(al>0&&al<d&&Math.abs(vx*ry-vy*rx)<e.r+.2)hurtE(e,isBoss(e)?13:17,p.i,1)}
   if(dm)for(const q of players){if(q===p||!q.on||!q.al)continue;const vx=q.x-p.x,vy=q.y-p.y,al=vx*rx+vy*ry;if(al>0&&al<d&&Math.abs(vx*ry-vy*rx)<.35)hitP(q,7,p.i)}}}
 }
 for(const p of players)if(p.pkd>0)p.pkd-=dt;
 for(let i=ZN.length-1;i>=0;i--){const z=ZN[i];z.l-=dt;z.tk-=dt;
  if(z.k==3){for(const e of E)if(!e.dead&&!(e.br>0)&&Math.hypot(e.x-z.x,e.y-z.y)<z.r)e.sl=.3;   // Cola-Pfuetze
   if(z.tk<=0){z.tk=.25;for(const e of E)if(!e.dead&&!(e.br>0)&&Math.hypot(e.x-z.x,e.y-z.y)<z.r)hurtE(e,8,z.o,1);
    if(dm)for(const q of players)if(q.on&&q.al&&q.i!==z.o&&Math.hypot(q.x-z.x,q.y-z.y)<z.r)hitP(q,4,z.o)}
   if(z.l<=0)boom({x:z.x,y:z.y,t:63,ex:3.2,xd:110,o:z.o})}
  else if(z.k==5&&z.tk<=0&&z.l>.25){z.tk=.17;const a=Math.random()*6.283,r=Math.sqrt(Math.random())*z.r;   // Steinhagel
   let rx=z.x+Math.cos(a)*r,ry=z.y+Math.sin(a)*r;if(sol(rx,ry)){rx=z.x;ry=z.y}J.push({x:rx,y:ry,vx:0,vy:0,t:26,o:z.o,l:9,fz:3.4,ex:1.5,xd:48})}
  if(z.l<=0)ZN.splice(i,1)}
}
// Bestochener Gegner: kaempft gegen andere Gegner, verschwindet danach (zaehlt als Kill fuer den, der bestochen hat)
function bribeAI(e,dt){
 e.br-=dt;if(e.br<=0){e.br=0;hurtE(e,1e9,e.bo);return}
 let tg=null,bd=1e9;for(const o of E){if(o===e||o.dead||o.br>0)continue;const d=Math.hypot(o.x-e.x,o.y-e.y);if(d<bd){bd=d;tg=o}}
 const ox=e.x,oy=e.y;
 if(tg){if(bd>1)move(e,(tg.x-e.x)/bd,(tg.y-e.y)/bd,e.sp*1.25*dt);else if(e.cd<=0){hurtE(tg,isBoss(tg)?30:45,e.bo);e.cd=.55;e.at=.3}}
 else e.br-=dt*2;   // keiner mehr da: schneller abhauen
 const mvd=Math.hypot(e.x-ox,e.y-oy);e.ph+=mvd*4;e.mv=mvd>0?1:0;e.at=Math.max(0,(e.at||0)-dt);
}
function bribe(e,o){if(isBoss(e)){hurtE(e,45,o);return}if(!(e.br>0)){e.br=8;e.bo=o;e.cd=.3}}
// ---------- Anzeige (Host und Mitspieler) ----------
function ultRender(sp,now){
 for(const p of S.p){if(!p.on||!p.al||!(p.ua>0))continue;const loc=p.i==id,px=loc?me.x:p.x,py=loc?me.y:p.y;
  if(p.uk==0){const ob=mode==2?now*3.4+p.i:p.ob||0;for(let k=0;k<5;k++){const a=ob+k*1.2566;sp.push({x:px+Math.cos(a)*1.15,y:py+Math.sin(a)*1.15,t:60,z:.15+.08*Math.sin(now*6+k)})}}
  else if(p.uk==9){const a=loc?me.a:p.a,rx=Math.cos(a),ry=Math.sin(a),d=cast(px,py,rx,ry).d;
   for(let k=loc?1.2:.4;k<d;k+=.28)WPT.push({x:px+rx*k,y:py+ry*k,z:.48+(Math.random()-.5)*.03,vx:0,vy:0,vz:0,g:0,l:.05,m:.05,c:Math.random()<.4?'#fff':'#ff3b3b',s:.07});
   for(let k=0;k<2;k++)WPT.push({x:px+rx*d*.98,y:py+ry*d*.98,z:.5,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,vz:Math.random()*2,g:5,l:.3,m:.3,c:'#ffb347',s:.04})}
  else if(p.uk==1&&!loc&&Math.random()<.3)WPT.push({x:px,y:py,z:.9,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,vz:1.5,g:5,l:.6,m:.6,c:Math.random()<.5?'#ffd23f':'#e9e9ee',s:.04})
  else if(p.uk==4&&!loc&&Math.random()<.4)WPT.push({x:px,y:py,z:.5,vx:(Math.random()-.5),vy:(Math.random()-.5),vz:.8,g:-1,l:.4,m:.4,c:'#ff2a2a',s:.05})}
 for(const z of(S.z||[])){
  if(z.k==3){for(let k=0;k<5;k++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*z.r;WPT.push({x:z.x+Math.cos(a)*r,y:z.y+Math.sin(a)*r,z:0,vx:0,vy:0,vz:.5+Math.random(),g:2.5,l:.45,m:.45,c:['#4a1f08','#6b3a1a','#8a4a1c','#e8d6c0'][Math.random()*4|0],s:.05+Math.random()*.03})}
   if(Math.random()<.6){const a=Math.random()*6.283;WPT.push({x:z.x+Math.cos(a)*z.r,y:z.y+Math.sin(a)*z.r,z:0,vx:0,vy:0,vz:0,g:0,l:.3,m:.3,c:'#c46a2a',s:.05})}}
  else if(z.k==5){for(let k=0;k<3;k++){const a=Math.random()*6.283;WPT.push({x:z.x+Math.cos(a)*z.r,y:z.y+Math.sin(a)*z.r,z:0,vx:0,vy:0,vz:0,g:0,l:.15,m:.15,c:'#ff3b3b',s:.05})}
   WPT.push({x:z.x+(Math.random()-.5)*.4,y:z.y+(Math.random()-.5)*.4,z:0,vx:0,vy:0,vz:0,g:0,l:.15,m:.15,c:'#ffd23f',s:.06})}}
}
// Symbole ueber Gegnern: betaeubt (Sterne), bestochen ($), verlangsamt (Tropfen)
function enemyMarks(s,cx,top,sz,now){
 if(s.sn){for(let k=0;k<3;k++){const a=now*5+k*2.09;x.fillStyle='#ffd23f';const r=Math.max(1.5,sz*.025);x.fillRect(cx+Math.cos(a)*sz*.14-r,top-sz*.05+Math.sin(a)*sz*.04-r,r*2,r*2)}}
 if(s.br){const fs=Math.max(7,sz*.16|0);x.font='bold '+fs+'px monospace';x.textAlign='center';x.fillStyle='#000a';x.fillText('$',cx+1,top-sz*.04+1);x.fillStyle='#5ee87a';x.fillText('$',cx,top-sz*.04)}
 if(s.sl&&Math.random()<.5){const r=Math.max(1,sz*.02);x.fillStyle='#8a4a1c';x.fillRect(cx+(Math.random()-.5)*sz*.25,top+sz*(.2+Math.random()*.5),r,r*2)}
}
// Bildschirm-Effekte fuer den eigenen Spieler
function ultHud(P,now){
 if(!(P.ua>0)||!P.al)return;const k=Math.min(1,P.ua/.4);
 if(P.uk==1){const q=x.createRadialGradient(VW/2,VH/2,VH*.35,VW/2,VH/2,VW*.6);q.addColorStop(0,'rgba(255,210,63,0)');q.addColorStop(1,'rgba(255,190,40,'+(.28*k).toFixed(2)+')');x.fillStyle=q;x.fillRect(0,0,VW,VH);
  x.font='bold 13px monospace';x.textAlign='center';x.fillStyle='#000a';x.fillText('JACKPOT  x2',VW/2+1,VH/2-29);x.fillStyle='#ffd23f';x.fillText('JACKPOT  x2',VW/2,VH/2-30)}
 else if(P.uk==4){const q=x.createRadialGradient(VW/2,VH/2,VH*.3,VW/2,VH/2,VW*.6);q.addColorStop(0,'rgba(200,0,0,0)');q.addColorStop(1,'rgba(200,0,0,'+((.22+.06*Math.sin(now*8))*k).toFixed(2)+')');x.fillStyle=q;x.fillRect(0,0,VW,VH)}
 else if(P.uk==9){const gx=VW/2+Math.sin(bob)*5,j=Math.random()*1.5;x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,40,40,.55)';x.lineWidth=9+j;x.beginPath();x.moveTo(VM.mx,VM.my);x.lineTo(VW/2,VH/2);x.stroke();
  x.strokeStyle='rgba(255,230,230,.9)';x.lineWidth=2.5;x.beginPath();x.moveTo(VM.mx,VM.my);x.lineTo(VW/2,VH/2);x.stroke();x.globalCompositeOperation='source-over'}
}
