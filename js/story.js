// TAUBENGAME - Story-Modus (1-4 Spieler): Level, Bosse, Wellen, Case Opening, Slime-Dialoge, Musik
// Der Host simuliert alles (SS = Story-Zustand), der Mitspieler bekommt SS in jedem Snapshot als S.st.

// ================= DATEN (hier kannst du alles anpassen) =================
const LEVELS=[null,
 {map:0,nm:'ARENA',mus:'level1_chief_keef',song:'Fühle mich wie Chief Keef 2012'},
 {map:1,nm:'RINGLABYRINTH',mus:'level2_skrrr_skrrr',song:'Skrrr Skrrr'},
 {map:3,nm:'BUNKER',mus:'level3_17',song:'17'},
 {map:4,nm:'KATHEDRALE',mus:'level4_cracker',song:'Cracker'},
 {map:6,nm:'PRÄSIDENTENSTRASSE',mus:'level5_ballack',song:'ballack'},
 {map:7,nm:'ULTIMATIVE KAMPF ARENA BONN',mus:'level6_fur_jacket_swag',song:'fur.jacket.swag.for.real'}];
const BOSS_HELPERS=false;           // true = Bosse rufen wieder Helfer dazu (deutlich schwerer)
const START_LIVES=5;                // gemeinsame Leben pro Level (ab dem 3. Spieler +1 pro Spieler)
const nPl=()=>Math.max(1,players.filter(p=>p.on).length),startLives=()=>START_LIVES+Math.max(0,nPl()-2);
const WAVES_PER_LEVEL=3;            // Level 1: 3 Wellen, Level 2: 6, ... Level 6: 18 (5 = 5/10/.../30)
// Bosse: hp Leben, sp Tempo, fan Faecherschuss (Winkel), fcd Pause dazwischen, rad Kugeln im Ring, rcd Pause,
// pt Geschoss beim Faecher, rt Geschosse im Ring (2 Feuer, 23 Becher, 26 Stein, 27 Kugel, 28 Messer, 29 Giftschaedel/verfolgt, 36 Musiknote, 37 Kugelblitz)
// min Helfer die er ruft (20 Messer-Typ, 21 Becher-Typ, 22 Sturmhaube), mel Nahkampf, bomb/dash/tele/spiral = Spezialangriffe
const BOSS=[null,
 {nm:'LIL M',spr:'lilm',pt:36,rt:[36],hp:450,sp:1.3,fan:[-.25,0,.25],fcd:1.9,rad:8,rcd:7.5,min:[20],mel:20},
 {nm:'DRACHENLORD',spr:'drachenlord',pt:2,rt:[2],hp:900,sp:1.15,fan:[-.25,0,.25],fcd:1.8,rad:10,rcd:7,min:[21,20],mel:28,bomb:{cd:4.5,d:30}},
 {nm:'SEHRJAMAL',spr:'sehrjamal',pt:29,rt:[27],hp:1400,sp:1.9,fan:[-.4,-.2,0,.2,.4],fcd:1.7,rad:12,rcd:6.5,min:[22,20],mel:28,tele:7},
 {nm:'JERMAINE',spr:'jermaine',pt:37,rt:[26],hp:2000,sp:1.7,fan:[-.25,0,.25],fcd:1.7,rad:14,rcd:6,min:[20,20,21],mel:35,dash:{cd:4,v:9.5,d:32}},
 {nm:'RAPHAEL',spr:'raphael',pt:28,rt:[28],hp:2700,sp:1.9,fan:[-.4,-.2,0,.2,.4],fcd:1.5,rad:16,rcd:5.5,min:[22,21,20],mel:35,bomb:{cd:2.6,d:38},dash:{cd:6,v:10,d:32}},
 {nm:'SLIMEE REBEL',spr:'slime',pt:23,rt:[23,2,36],hp:4200,sp:2,fan:[-.4,-.2,0,.2,.4],fcd:1.3,rad:20,rcd:5,min:[22,22,21,20],mel:40,bomb:{cd:3.2,d:42},dash:{cd:5,v:11,d:36},tele:6.5,spiral:1}];
// Spielbare Charaktere: [Name, Sprite-Datei, Name der Ulti, Abklingzeit in Sekunden]. Wirkung: js/ult.js
const CHARS=[['taubenopa','taubenopa','Taubenwächter',20],['EuroJunkie','eurojunkie','Jackpot',22],['Jxhn2k','jxhn2k','Schattensprung',10],['YoungCola','youngcola','Cola-Pfütze',18],
 ['werwlf','werwlf','Wolfsrausch',22],['Adam','adam','Steinhagel',16],['Kerimsi','kerimsi','Dog-Tag-Bumerang',9],['Sh1no','sh1no','Bestechung',20],
 ['saesix','saesix','Moshpit',18],['Joshie','joshie','Laser-Blick',16],['souf','souf','Herzschlag',25],['Muro','muro','Burger-Salve',15]];
const SPEC_CD=15;   // Ersatzwert, falls ein Charakter keine Abklingzeit hat
// Case Opening: welche Waffen (Index in WP) nach welchem Level in der Kiste sein koennen
const CASEP=[null,[2,8,3,14],[2,8,3,9,11,14,13],[2,8,3,9,11,5,10,7,13,15],[3,9,11,5,10,7,4,12,13,15,16],[5,10,7,4,12,6,15,16]];
const RAR={2:0,8:0,14:0,3:1,9:1,11:1,13:1,5:2,10:2,7:2,15:2,4:3,12:3,16:3,6:4},RARC=['#4b69ff','#8847ff','#d32ce6','#eb4b4b','#ffd700'],RARN=['Gewöhnlich','Selten','Episch','Legendär','ULTRA'];
// Slimes Sprueche: intro = vor Level 1, 1-5 = nach dem jeweiligen Level, 6 = Ende
const DLG={
 intro:['Yo. Ich bin\'s. Slimee Rebel.',
  'Der Insta-Account LIFESTYLECRAZY gehört MIR. Ihr habt ihn - und ich hol ihn mir zurück.',
  'Passwort raten, Fake-Mails, meine Leute auf euch hetzen... mir ist jedes Mittel recht.',
  'Sechs Level, sechs Bosse. Ganz am Ende warte ich selbst: in der Ultimativen Kampf Arena Bonn.',
  'Ihr kriegt eine Pistole. Mehr nicht. Viel Glück - ihr werdet es brauchen.'],
 1:['Lil M in der Arena umgehauen? Okay. Anfängerglück.',
  'Während ihr da rumgeballert habt, hab ich schon dreimal "Passwort vergessen" bei LIFESTYLECRAZY gedrückt.',
  'Im Ringlabyrinth wartet der Drachenlord. {n} Wellen. Verlauft euch nicht.'],
 2:['Durchs Ringlabyrinth gekommen... Respekt. Da verlauf ich mich selber jedes Mal.',
  'Egal. Ich hab dem Insta-Support geschrieben, dass der Account mir gehört. Mit ganz vielen Ausrufezeichen!!!',
  'Nächster Halt: der Bunker. {n} Wellen. SehrJamal lässt da keinen wieder raus.'],
 3:['Den Bunker habt ihr auch geknackt?! SehrJamal, du hattest EINE Aufgabe!',
  'Macht nichts. Ich hab 5.000 Bots gekauft, die melden LIFESTYLECRAZY jetzt rund um die Uhr.',
  'In der Kathedrale wartet Jermaine. {n} Wellen. Betet schon mal.'],
 4:['Jermaine ist in der Kathedrale gefallen... langsam nervt ihr richtig.',
  'Ich hab jetzt einen Fake-Account gemacht: LIFESTYLECRAZYY mit zwei Y. Merkt keiner. Die Follower kommen schon rüber.',
  'Kommt in die Präsidentenstraße. Raphael wartet zwischen den Bäumen. {n} Wellen - das schafft ihr nie.'],
 5:['Raphael?! In der Präsidentenstraße?! Vor allen Nachbarn?!',
  'Na gut. Dann eben auf die harte Tour. Der Account gehört mir. Schon immer.',
  'Ultimative Kampf Arena Bonn. {n} Wellen. Und dann ICH. Bringt alles mit, was ihr in den Kisten gefunden habt.'],
 6:['Okay... okay! Ich geb auf. Ihr habt gewonnen.',
  'LIFESTYLECRAZY bleibt bei euch. Ich lösch die Bots, den Fake-Account, alles.',
  '...aber ändert trotzdem mal das Passwort. Nur so ein Tipp.',
  'Wir sehen uns. Slimee Rebel vergisst nie.']};
const ACCSTAT=['Status: sicher ...oder?','! 3x "Passwort vergessen"','! Support-Ticket von Slime','! 5.000 Bot-Meldungen','! Fake-Account entdeckt','! Slime dreht komplett durch','Account gesichert'];

// ================= MENUE / START =================
function loadSave(){try{const v=JSON.parse(localStorage.hfStory||'null');return v&&v.lv>=1&&v.lv<=6?v:null}catch(e){return null}}
function saveGame(){try{localStorage.hfStory=JSON.stringify({lv:SS.lv,ck:SS.ck,lo:SS.lo,coins:SS.coins})}catch(e){}}
function chDesc(){const c=CHARS[myCh];document.querySelectorAll('.chdesc').forEach(d=>{d.textContent='Ulti „'+c[2]+'“ (Q, alle '+c[3]+' s): '+CDESC[myCh]})}
function storyMenu(){
 try{myCh=Math.min(CHARS.length-1,+localStorage.hfCh||0)}catch(e){}
 for(const gid of['cg','cg2','cg3']){const g=$(gid);CHARS.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.className='ch'+(i==myCh?' on':'');b.dataset.i=i;
  b.innerHTML='<img src="assets/sprites/'+c[1]+'.png" alt=""><span>'+c[0]+'</span><em>'+c[2]+'</em>';
  b.title=c[2]+': '+CDESC[i];
  b.onclick=()=>{myCh=i;try{localStorage.hfCh=i}catch(e){}document.querySelectorAll('.ch').forEach(q=>q.classList.toggle('on',q.dataset.i==i));chDesc()};g.appendChild(b)});
  const d=document.createElement('p');d.className='hint chdesc dyn';g.after(d)}
 chDesc();
 const sv=loadSave();$('scont').disabled=!sv;if(sv)$('scont').textContent='Fortsetzen (Level '+sv.lv+')';
}
function startStory(cont){
 const sv=cont?loadSave():null,D=+$('sdf').value;dif=[.6,.85,1.2][D];dmg=[.4,.65,1][D];dm=0;story=1;
 SS={lv:sv?sv.lv:1,ph:sv?'map':'intro',t:0,wv:0,wm:0,boss:0,lives:START_LIVES,coins:sv?sv.coins|0:0,ck:sv?sv.ck||1:1,lo:sv?sv.lo|3:3,dl:0,cw:0,seed:0,kills:0,tm:0,cf:0};
 players[0].nm=$('nm').value.slice(0,10);players[0].ch=myCh;
 for(const q of players){q.lo=SS.lo;q.w=1;q.am=AM0();q.sc=0}
 mode=1;$('m').style.display='none';bgVol();try{const r=cv.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(e){}
}
function storyConfirm(){if(!mode)return;if(mode==1){if(story&&SS)SS.cf=1}else me.k=(me.k|0)+1}
addEventListener('keydown',e=>{if(e.code=='Enter'||e.code=='Space')storyConfirm()});
addEventListener('mousedown',()=>{if(mode&&S&&S.st&&S.st.ph!='play'&&S.st.ph!='clear'&&document.pointerLockElement===cv)storyConfirm()});

// ================= ABLAUF (nur Host) =================
const dlgL=s=>((LANG=='en'?DLG_EN:DLG)[s.ph=='intro'?'intro':s.lv]).map(t=>t.replace('{n}',(s.lv+1)*WAVES_PER_LEVEL));
function setPh(p){SS.ph=p;SS.t=0;SS.cf=0;SS.dl=0}
function storyAmmo(p){for(let w=2;w<WP.length;w++)if(p.lo>>w&1)p.am[w]=Math.max(p.am[w]||0,Math.ceil(MX[w]*.4))}
function startLevel(){
 const s=SS;loadMap(LEVELS[s.lv].map);E=[];J=[];PK=[];NJ=[];s.wm=s.lv*WAVES_PER_LEVEL;s.wv=Math.min(s.wm,Math.max(0,s.ck-1));wave=s.wv;s.boss=0;toSpawn=0;spawnT=0;waitT=2.5;s.lives=Math.max(startLives(),s.lives);
 for(const p of players){p.x=SP[p.i][0];p.y=SP[p.i][1];p.a=A0[p.i];p.rc++;p.al=true;p.hp=100;p.ar=0;p.iv=2;p.lo=s.lo;storyAmmo(p)}
 flow();saveGame();setPh('play');
}
function openCase(){
 const s=SS;s.seed=1+(Math.random()*1e6|0);
 if(s.lv>=6)s.cw=-1;
 else{let P=CASEP[s.lv].filter(w=>!(s.lo>>w&1));if(!P.length)P=WP.map((_,i)=>i).filter(w=>w>1&&!(s.lo>>w&1));
  s.cw=P.length?P[Math.random()*P.length|0]:2;s.lo|=1<<s.cw;
  for(const p of players){p.lo=s.lo;p.am[s.cw]=Math.max(p.am[s.cw]||0,Math.ceil(MX[s.cw]*.6))}
  try{localStorage.hfStory=JSON.stringify({lv:s.lv+1,ck:1,lo:s.lo,coins:s.coins})}catch(e){}}
 setPh('case');
}
let flowT=0;
function storyTick(dt){
 const s=SS;s.t+=dt;const cf=s.cf&&s.t>.5;s.cf=0;
 for(const p of players)if(p.on&&p.lo!==s.lo){p.lo=s.lo;storyAmmo(p)}
 switch(s.ph){
  case'intro':case'talk':{const L=dlgL(s);
   if(cf){if(s.t*40<L[s.dl].length)s.t=99;else if(s.dl<L.length-1){s.dl++;s.t=0}
    else if(s.ph=='intro')setPh('map');else if(s.lv>=6)openCase();else{s.lv++;s.ck=1;saveGame();setPh('map')}}
   break}
  case'map':if(cf||s.t>12)setPh('card');break;
  case'card':if(s.t>3.4)startLevel();break;
  case'play':if(paused)break;flowT-=dt;if(flowT<=0){flow();flowT=.25}sim(dt);s.tm+=dt;
   {const on=players.filter(p=>p.on);if(s.ph=='play'&&on.length&&on.every(p=>!p.al)&&s.lives<=0){ev(9);setPh('over')}}break;
  case'clear':sim(dt);if(s.t>4.5){if(s.lv>=6)setPh('talk');else openCase()}break;
  case'case':if(cf&&s.t>7)setPh(s.lv>=6?'end':'talk');break;
  case'over':if(cf&&s.t>1.5){s.lives=startLives();setPh('card')}break;
  case'end':if(s.t<1)try{localStorage.removeItem('hfStory')}catch(e){}if(cf&&s.t>3)location.reload();break;
 }
}
// ----- Wellen -----
function storyWaves(dt,np){
 const s=SS;if(s.ph!='play')return;
 if(s.boss==1){const b=E.find(e=>e.t>=30);if(!b||b.dead){s.boss=2;for(const e of E)if(!e.dead){e.dead=1;e.hp=0}J=J.filter(j=>j.o>=0);toSpawn=0;ev(8);setPh('clear');return}}
 if(!E.some(e=>!e.dead)&&toSpawn<=0){waitT-=dt;if(waitT<=0){
  if(s.wv<s.wm){s.wv++;wave=s.wv;for(const p of players)if(p.on&&p.al)p.hp=Math.min(100,p.hp+25);for(const p of players)if(p.on)for(let w=2;w<WP.length;w++)if(p.lo>>w&1)p.am[w]=Math.max(p.am[w]||0,w==6?1:Math.ceil(MX[w]*.25));if((s.wv-1)%WAVES_PER_LEVEL==0){s.ck=s.wv;saveGame()}toSpawn=2+Math.ceil(s.lv/2)+Math.min(4,s.wv/5|0)+np;waitT=2.5}
  else if(!s.boss){s.boss=1;s.ck=s.wm+1;saveGame();E=[];J=J.filter(j=>j.o>=0);for(const p of players)if(p.on&&p.al){p.hp=100;p.ar=Math.max(p.ar,50)}mk(29+s.lv,farSpawn());ev(5);waitT=2.5}}}
}
function farSpawn(){const L=ESP.filter(q=>players.every(p=>!p.on||!p.al||Math.hypot(p.x-q[0],p.y-q[1])>5));const P=L.length?L:ESP;return P[Math.random()*P.length|0]}
function storySpawn(){
 const s=SS;if(spawnT>0||E.length>=4+s.lv+nPl())return;
 const L=[20,21];if(s.lv>1||s.wv>=3)L.push(22);if(s.lv>=3)L.push(20,22);
 mk(L[Math.random()*L.length|0],farSpawn());toSpawn--;spawnT=Math.max(.7,1.5-s.lv*.1);
}
function storyEnemy(t,at){
 const L=LV(),np=players.filter(p=>p.on).length;let hp,r,sp;
 if(t>=30){const c=BOSS[t-29];hp=story?c.hp*(1+.3*(np-1)):(c.hp*1.3+wave*45)*(1+.3*(np-1));r=.6;sp=c.sp}
 else{const k=story?1+(L-1)*.28+SS.wv*.012:1+wave*.07,T={20:[26,.3,2.5+L*.12],21:[60,.42,1.6+L*.07],22:[36,.34,2+L*.08]}[t];hp=T[0]*k;r=T[1];sp=T[2]}
 let ex=at[0]+(Math.random()-.5)*.8,ey=at[1]+(Math.random()-.5)*.8;if(!can(ex,ey,.5)){ex=at[0];ey=at[1]}
 return{x:ex,y:ey,t,hp:hp*dif,mh:hp*dif,r,sp,fl:0,cd:1,dead:0,ph:Math.random()*6};
}
function storyKill(e){
 SS.kills++;
 if(e.t>=30){for(let k=0;k<10;k++){const a=k*.63;PK.push({x:e.x+Math.cos(a)*.9,y:e.y+Math.sin(a)*.9,t:25})}}
 else{if(Math.random()<.45)PK.push({x:e.x+.25,y:e.y+.25,t:25});if(Math.random()<.14)PK.push({x:e.x-.25,y:e.y-.2,t:7})}
 for(let i=0;PK.length>60&&i<PK.length;i++)if(PK[i].t==25){PK.splice(i,1);i--}
}
function storyCoin(p){p.sc+=5;if(++SS.coins>=50){SS.coins-=50;SS.lives++;ev(7)}}
// ----- Wegfindung: Abstandsfeld von allen lebenden Spielern (damit kein Gegner haengen bleibt) -----
const FD=new Int16Array(N*N),D4=[[1,0],[-1,0],[0,1],[0,-1]];
function flow(){
 FD.fill(-1);const q=[];
 for(const p of players)if(p.on&&p.al){const c=(p.y|0)*N+(p.x|0);if(FD[c]<0){FD[c]=0;q.push(c)}}
 for(let h=0;h<q.length;h++){const c=q[h],cx=c%N,cy=c/N|0;for(const d of D4){const nx=cx+d[0],ny=cy+d[1];if(nx<0||ny<0||nx>=N||ny>=N)continue;const n=ny*N+nx;if(FD[n]>=0||G[n]||B[n])continue;FD[n]=FD[c]+1;q.push(n)}}
}
function chase(e,ux,uy,los,s){
 if(!los){const cx=e.x|0,cy=e.y|0;let bd=FD[cy*N+cx]<0?1e9:FD[cy*N+cx],bx=0,by=0,f=0;
  for(const d of D4){const n=(cy+d[1])*N+cx+d[0],v=FD[n];if(v>=0&&v<bd){bd=v;bx=cx+d[0]+.5-e.x;by=cy+d[1]+.5-e.y;f=1}}
  if(f){const l=Math.hypot(bx,by)||1;ux=bx/l;uy=by/l}}
 move(e,ux,uy,s);
}
const shot=(e,ux,uy,k,v,t,d,l)=>{const c=Math.cos(k),s=Math.sin(k);J.push({x:e.x,y:e.y,vx:(ux*c-uy*s)*v,vy:(ux*s+uy*c)*v,t,o:-1,l:l||4,d})};
// ----- Gegner-KI -----
function storyAI(e,tp,bd,ux,uy,los,dt){
 const L=LV();
 if(e.t==20){ // Messer-Typ: rennt im Zickzack, sticht zu
  if(bd>.9){if(los){const z=Math.sin(e.ph*.6)*.7,c=Math.cos(z),s=Math.sin(z);move(e,ux*c-uy*s,ux*s+uy*c,e.sp*dt)}else chase(e,ux,uy,los,e.sp*dt)}
  else if(e.cd<=0){hurtP(tp,5+L);e.cd=.8}
  return}
 if(e.t==21){ // Becher-Typ: zaeh, wirft seinen Becher
  if(!(los&&bd<5))chase(e,ux,uy,los,e.sp*dt);
  if(bd<1.1&&e.cd<=.9){hurtP(tp,7+L);e.cd=1.2}
  else if(los&&bd<10&&e.cd<=0){ev(4);shot(e,ux,uy,0,4.5,23,7+L*1.2);e.cd=2.8-L*.1}
  return}
 if(e.t==22){ // Sturmhaube: haelt Abstand und schiesst
  if(!(los&&bd<7))chase(e,ux,uy,los,e.sp*dt);else if(bd<3.5)move(e,-ux,-uy,e.sp*.6*dt);
  if(los&&bd<13&&e.cd<=0){ev(4);for(const k of(L>=5?[-.1,.1]:[0]))shot(e,ux,uy,k,5.5+L*.3,27,5+L);e.cd=1.9-L*.08}
  return}
 // ----- Boss -----
 const c=BOSS[e.t-29],cap=10+L*2;
 e.mc=(e.mc||0)-dt;
 if(e.dash>0){e.dash-=dt;move(e,e.dx,e.dy,c.dash.v*dt);if(bd<1.4&&!e.dh){hurtP(tp,c.dash.d);e.dh=1}return}
 if(!e.en&&e.hp<e.mh*.5){e.en=1;e.sp*=1.2;e.at=.3;ev(5)}
 const q=e.en?.8:1;
 if(!(los&&bd<5.5))chase(e,ux,uy,los,e.sp*dt);
 if(bd<1.4&&e.mc<=0){hurtP(tp,c.mel);e.mc=1}
 e.rb=(e.rb===undefined?4:e.rb)-dt;
 if(e.rb<=0&&los){const n=c.rad+(e.en?4:0);for(let k=0;k<n;k++){const a=k/n*6.283+e.ph;J.push({x:e.x,y:e.y,vx:Math.cos(a)*3.8,vy:Math.sin(a)*3.8,t:(c.rt||[2])[k%(c.rt||[2]).length],o:-1,l:4,d:6+L})}
  if(BOSS_HELPERS){for(const m of c.min)if(E.length<cap)mk(m,farSpawn());if(e.en&&E.length<cap)mk(22,farSpawn())}e.rb=c.rcd*q;e.at=.3;ev(5)}
 if(los&&e.cd<=0){for(const k of c.fan)shot(e,ux,uy,k,c.pt==29?3.4:5+L*.25,c.pt||2,7+L*1.2,c.pt==29?6:4);e.cd=c.fcd*q;ev(4)}
 if(c.dash){e.t2=(e.t2===undefined?c.dash.cd:e.t2)-dt;if(e.t2<=0&&los&&bd>2.5){e.dash=.75;e.dx=ux;e.dy=uy;e.dh=0;e.t2=c.dash.cd*q;e.at=.3;ev(5)}}
 if(c.bomb){e.t3=(e.t3===undefined?c.bomb.cd:e.t3)-dt;if(e.t3<=0&&los&&bd<14){J.push({x:e.x,y:e.y,vx:ux*7,vy:uy*7,t:24,o:-1,l:Math.max(.25,bd/7),d:c.bomb.d});e.t3=c.bomb.cd*q}}
 if(c.tele){e.t4=(e.t4===undefined?c.tele:e.t4)-dt;if(e.t4<=0){const p=farSpawn();NJ.push({x:e.x,y:e.y,vx:0,vy:0,t:5,o:-1,l:.3});e.x=p[0];e.y=p[1];e.t4=c.tele*q;ev(5)}}
 if(c.spiral&&e.en){e.t5=(e.t5||0)-dt;if(e.t5<=0){e.sa=(e.sa||0)+.42;for(const a of[e.sa,e.sa+3.1416])J.push({x:e.x,y:e.y,vx:Math.cos(a)*5,vy:Math.sin(a)*5,t:23,o:-1,l:4,d:9});e.t5=e.hp<e.mh*.2?.16:.24}}
}

// ================= ANZEIGE (Host und Mitspieler) =================
const txt=(s,a,b,sz,c,al)=>{x.font='bold '+(sz||10)+'px monospace';x.textAlign=al||'left';x.fillStyle=c||'#fff';x.fillText(s,a,b)};
function wrapT(s,n){const o=[];let l='';for(const w of s.split(' ')){const t=l?l+' '+w:w;if(t.length>n&&l){o.push(l);l=w}else l=t}if(l)o.push(l);return o}
function sprD(n,cx,bot,h,al){const im=RAW[n];if(!im)return;const w=im.width*h/im.height;if(al!=null)x.globalAlpha=al;x.imageSmoothingEnabled=true;x.drawImage(im,cx-w/2,bot-h,w,h);x.imageSmoothingEnabled=false;x.globalAlpha=1}
const igrad=(a,b,c,d)=>{const q=x.createLinearGradient(a,b,c,d);q.addColorStop(0,'#7b2ff7');q.addColorStop(.5,'#f1076b');q.addColorStop(1,'#ffb13d');return q};
const blink=()=>performance.now()%900<600;
const prompt_=(y,t)=>{if(blink())txt(t||'ENTER / Klick: weiter',VW/2,y,10,'#fd4','center')};
function storyHudTop(){const s=S.st;return'LEVEL '+s.lv+'/6  '+(s.boss?'BOSS':'WELLE '+s.wv+'/'+s.wm)+'   Gegner '+S.e.filter(e=>!e.dead).length}
function storyHud(){const s=S.st;x.fillStyle='#f55';x.fillText('♥ '+s.lives,8,28);x.fillStyle='#fc2';x.fillText('● '+s.coins+'/50',52,28);x.fillStyle='#fff'}
function storyBanner(){const s=S.st;return s.boss?'BOSS: '+BOSS[s.lv].nm+'!':'WELLE '+s.wv+' / '+s.wm}
const storyFull=()=>{const p=S.st.ph;return p!='play'&&p!='clear'&&p!='over'};
let curMus=0,cPh='',cTick=-1,cRev=0;
function storyClient(){
 const s=S.st;
 if(s.ph!=cPh){cPh=s.ph;cTick=-1;cRev=0}
 if(s.ph!='intro'&&s.ph!='map'&&curMus!==s.lv){curMus=s.lv;BG.src='assets/music/'+LEVELS[s.lv].mus+'.mp3';bgVol();BG.play().catch(()=>{})}
}
function accCard(a,b,st,ok){
 x.fillStyle='#0e0e14';x.fillRect(a,b,186,54);x.strokeStyle=ok?'#3c6':'#33333f';x.lineWidth=1;x.strokeRect(a+.5,b+.5,185,53);
 x.fillStyle=igrad(a+8,b+8,a+46,b+46);x.beginPath();x.arc(a+27,b+27,19,0,7);x.fill();x.fillStyle='#0e0e14';x.beginPath();x.arc(a+27,b+27,16,0,7);x.fill();
 txt('LC',a+27,b+32,14,'#fff','center');txt('@lifestylecrazy',a+54,b+20,11,'#fff');txt('Instagram-Account',a+54,b+32,8,'#889');txt(st,a+54,b+45,8,ok?'#5e8':'#fb4');
}
function storyScreen(){
 const s=S.st;x.globalAlpha=1;x.textAlign='left';
 if(s.ph=='intro'||s.ph=='talk')drawTalk(s);else if(s.ph=='map')drawMap(s);else if(s.ph=='card')drawCard(s);else if(s.ph=='case')drawCase(s);else drawEnd(s);
 if(lost)txt('VERBINDUNG ZUM HOST VERLOREN',VW/2,14,12,'#f55','center');
}
function drawTalk(s){
 const L=dlgL(s),line=L[Math.min(s.dl,L.length-1)],n=Math.min(line.length,s.t*40|0),won=s.ph=='talk'&&s.lv>=6;
 const g=x.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#12061f');g.addColorStop(1,'#2a0a1c');x.fillStyle=g;x.fillRect(0,0,VW,VH);
 x.globalAlpha=.35;x.fillStyle=igrad(0,40,150,230);x.beginPath();x.arc(66,150,92+Math.sin(performance.now()/500)*4,0,7);x.fill();x.globalAlpha=1;
 sprD('slime',66,300,268);
 accCard(286,10,ACCSTAT[s.ph=='intro'?0:s.lv],won);
 x.fillStyle='#0b0b11ee';x.fillRect(128,150,340,104);x.strokeStyle=igrad(128,150,468,254);x.lineWidth=2;x.strokeRect(128,150,340,104);
 x.fillStyle='#f1076b';x.fillRect(136,141,96,16);txt('SLIMEE REBEL',184,153,10,'#fff','center');
 wrapT(line.slice(0,n),53).forEach((l,i)=>txt(l,138,178+i*14,10,'#fff'));
 txt((s.dl+1)+'/'+L.length,460,166,8,'#778','right');
 if(n>=line.length&&blink())txt('▼ ENTER / Klick',460,246,9,'#fd4','right');
}
const NODES=[[52,196],[128,152],[204,192],[280,148],[356,186],[428,124]];
function drawMap(s){
 const now=performance.now()/1000;
 x.fillStyle='#6aa8f0';x.fillRect(0,0,VW,VH);
 x.fillStyle='#fff';for(const[a,b,w]of[[40,40,46],[150,26,60],[300,48,50],[400,22,44]]){const ax=(a+now*4)%(VW+80)-60;x.fillRect(ax,b,w,10);x.fillRect(ax+8,b-6,w-18,8)}
 for(const[a,r,c]of[[90,70,'#4c9a38'],[250,90,'#58a842'],[400,64,'#4c9a38']]){x.fillStyle=c;x.beginPath();x.arc(a,222,r,Math.PI,0);x.fill()}
 x.fillStyle='#3f8a2c';x.fillRect(0,206,VW,64);x.fillStyle='#35782a';for(let a=0;a<VW;a+=16)x.fillRect(a,206,8,3);
 x.fillStyle='#e8d59a';for(let k=0;k<5;k++){const[a,b]=NODES[k],[c,d]=NODES[k+1];for(let u=1;u<8;u++)x.fillRect(a+(c-a)*u/8-2,b+(d-b)*u/8-2,4,4)}
 // Slimes Burg am letzten Punkt
 {const[a,b]=NODES[5];x.fillStyle='#3a2a44';x.fillRect(a-22,b-58,44,58);for(let k=0;k<4;k++)x.fillRect(a-22+k*12,b-64,8,6);x.fillStyle=igrad(a-8,b-40,a+8,b);x.fillRect(a-8,b-24,16,24);x.fillStyle='#fd4';x.fillRect(a-14,b-46,6,8);x.fillRect(a+8,b-46,6,8)}
 for(let k=0;k<6;k++){const[a,b]=NODES[k],lv=k+1,done=lv<s.lv,cur=lv==s.lv;
  sprD(BOSS[lv].spr,a,b-12,lv==6?40:32,done?.3:1);
  if(done){x.strokeStyle='#e22';x.lineWidth=2;x.beginPath();x.moveTo(a-9,b-38);x.lineTo(a+9,b-16);x.moveTo(a+9,b-38);x.lineTo(a-9,b-16);x.stroke()}
  x.fillStyle='#222';x.beginPath();x.arc(a,b,10,0,7);x.fill();x.fillStyle=done?'#3c3':cur?(blink()?'#fd4':'#fa0'):'#c33';x.beginPath();x.arc(a,b,8,0,7);x.fill();txt(''+lv,a,b+4,10,'#fff','center')}
 const[ca,cb]=NODES[s.lv-1],ps=S.p.filter(p=>p.on);
 ps.forEach((p,i)=>{const c=CHARS[p.ch|0]||CHARS[0];sprD(c[1],ca-26+(i-(ps.length-1)/2)*13,cb+14+Math.abs(Math.sin(now*5+i))*-4,34)});
 x.fillStyle='#000a';x.fillRect(0,0,VW,22);txt('STORY-MODUS  ·  WELT LIFESTYLECRAZY',8,15,11,'#fff');txt('♥ '+s.lives+'   ● '+s.coins,VW-8,15,11,'#fd4','right');
 const L=LEVELS[s.lv];x.fillStyle='#000c';x.fillRect(0,224,VW,46);
 txt('LEVEL '+s.lv+': '+L.nm,VW/2,240,13,'#fff','center');txt((s.lv*WAVES_PER_LEVEL)+' Wellen  ·  Boss: '+BOSS[s.lv].nm+'  ·  Song: '+L.song,VW/2,253,8,'#bbc','center');prompt_(265,'ENTER / Klick: Level starten');
}
function drawCard(s){
 const L=LEVELS[s.lv],ps=S.p.filter(p=>p.on);x.fillStyle='#000';x.fillRect(0,0,VW,VH);
 txt('LEVEL 1-'+s.lv,VW/2,62,28,'#fff','center');txt(L.nm,VW/2,84,L.nm.length>20?12:15,'#fd4','center');
 const w=ps.length*30+70,a0=VW/2-w/2;ps.forEach((p,i)=>sprD((CHARS[p.ch|0]||CHARS[0])[1],a0+15+i*30,170,60));
 txt('× '+Math.max(START_LIVES+Math.max(0,ps.length-2),s.lives),a0+ps.length*30+12,150,22,'#fff');
 txt('BOSS: '+BOSS[s.lv].nm,VW/2,204,12,'#f55','center');txt(s.lv*WAVES_PER_LEVEL+' Wellen',VW/2,220,10,'#bbc','center');
 txt('Song: '+L.song,VW/2,236,9,'#889','center');
 if(s.ck>1)txt('Checkpoint: '+(s.ck>s.lv*WAVES_PER_LEVEL?'direkt zum Boss':'weiter ab Welle '+s.ck),VW/2,254,9,'#5e8','center');
}
function wIcon(w,cx,bot,H){const im=WIMG[w];if(!im)return;const wd=H*WIMG.W/WIMG.H;x.imageSmoothingEnabled=true;x.drawImage(im,cx-wd/2,bot-H,wd,H);x.imageSmoothingEnabled=false}
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let cItems=null,cSeed=0;
function drawCase(s){
 const P=70,WIN=38,SPIN=5.5,fin=s.cw<0;
 if(cSeed!==s.seed){cSeed=s.seed;const r=rng(s.seed),bag=[2,2,2,2,8,8,8,8,14,14,14,3,3,3,9,9,9,11,11,11,13,13,5,5,10,10,7,7,15,15,4,12,16,6];cItems=[];for(let i=0;i<46;i++)cItems.push(bag[r()*bag.length|0]);cItems[WIN]=s.cw}
 const g=x.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#101018');g.addColorStop(1,'#1c1226');x.fillStyle=g;x.fillRect(0,0,VW,VH);
 txt('CASE OPENING',VW/2,34,24,'#fd4','center');txt(fin?'Die letzte Kiste...':'Level '+s.lv+' geschafft - eure Belohnung:',VW/2,52,10,'#bbc','center');
 const u=Math.min(1,s.t/SPIN),e=1-Math.pow(1-u,3.4),off=e*(WIN*P+(s.seed%41-20));
 x.fillStyle='#07070b';x.fillRect(16,66,448,78);x.save();x.beginPath();x.rect(18,68,444,74);x.clip();
 for(let i=0;i<cItems.length;i++){const cx=VW/2+i*P-off;if(cx<-40||cx>VW+40)continue;const w=cItems[i],a=cx-32;
  x.fillStyle='#1d1d27';x.fillRect(a,72,64,66);
  if(fin||w<0){x.fillStyle=fin&&i!=WIN?'#2a2a36':'#3a2f10';x.fillRect(a,72,64,66);x.fillStyle=i==WIN?RARC[4]:'#555';x.fillRect(a,134,64,4);if(i==WIN){x.fillStyle=igrad(a+18,82,a+46,110);x.beginPath();x.arc(a+32,98,15,0,7);x.fill();txt('LC',a+32,102,11,'#fff','center');txt('ACCOUNT',a+32,128,8,'#fd4','center')}else txt('?',a+32,112,24,'#666','center')}
  else{x.fillStyle=RARC[RAR[w]];x.globalAlpha=.16;x.fillRect(a,72,64,66);x.globalAlpha=1;x.fillRect(a,134,64,4);wIcon(w,a+32,124,50);txt(SN[w],a+32,131,8,'#fff','center')}}
 x.restore();x.fillStyle='#fd4';x.fillRect(VW/2-1,62,2,86);x.beginPath();x.moveTo(VW/2-6,60);x.lineTo(VW/2+6,60);x.lineTo(VW/2,68);x.fill();
 const idx=off/P|0;if(u<1&&idx!==cTick){cTick=idx;tone(900+Math.random()*80,700,.035,'square',.09)}
 if(u>=1){if(!cRev){cRev=1;play(3);play(7)}
  const col=fin?RARC[4]:RARC[RAR[s.cw]],k=Math.min(1,(s.t-SPIN)*4);x.globalAlpha=k;
  x.fillStyle='#0b0b11';x.fillRect(110,156,260,92);x.strokeStyle=col;x.lineWidth=2;x.strokeRect(110,156,260,92);
  if(fin){accCard(147,166,ACCSTAT[6],1);txt('DER ACCOUNT BLEIBT BEI EUCH!',VW/2,238,11,'#fd4','center')}
  else{txt('NEUE WAFFE  ·  '+RARN[RAR[s.cw]],VW/2,172,9,col,'center');wIcon(s.cw,152,244,82);txt(WP[s.cw].nm,275,198,WP[s.cw].nm.length>12?14:17,'#fff','center');txt(DS[s.cw],275,214,9,'#bbc','center');
   txt('Im Spiel: Taste '+(owned(s.lo).indexOf(s.cw)+1)+' oder Mausrad',275,232,8,'#889','center')}
  x.globalAlpha=1;if(s.t>7)prompt_(263)}
}
function drawEnd(s){
 const g=x.createLinearGradient(0,0,VW,VH);g.addColorStop(0,'#1a0b33');g.addColorStop(1,'#3a0d24');x.fillStyle=g;x.fillRect(0,0,VW,VH);
 x.fillStyle=igrad(0,0,VW,0);x.fillRect(0,0,VW,5);x.fillRect(0,VH-5,VW,5);
 txt('LIFESTYLECRAZY GERETTET!',VW/2,40,24,'#fd4','center');txt('Slimee Rebel wurde in der Ultimativen Kampf Arena Bonn besiegt.',VW/2,58,9,'#fff','center');
 accCard(147,70,ACCSTAT[6],1);
 const ps=S.p.filter(p=>p.on);ps.forEach((p,i)=>{sprD((CHARS[p.ch|0]||CHARS[0])[1],VW/2-(ps.length-1)*22+i*44,206+Math.abs(Math.sin(performance.now()/200+i))*-5,66);txt(p.nm||'P'+(p.i+1),VW/2-(ps.length-1)*22+i*44,218,8,'#fff','center')});
 for(let k=1;k<=6;k++)sprD(BOSS[k].spr,k<4?40+k*34:VW-210+k*34,206,40,.45);
 const m=s.tm/60|0,sec=(s.tm%60|0);txt('Spielzeit '+m+':'+(sec<10?'0':'')+sec+'   ·   Besiegte Gegner '+s.kills,VW/2,236,10,'#bbc','center');
 if(s.t>3)prompt_(256,mode==1?'ENTER / Klick: zurück zum Hauptmenü':'Danke fürs Spielen!');
}
function storyOverlay(){
 const s=S.st;x.textAlign='center';
 if(s.ph=='clear'){const k=Math.min(1,s.t*2);x.globalAlpha=k*.55;x.fillStyle='#000';x.fillRect(0,88,VW,84);x.globalAlpha=k;
  txt('LEVEL '+s.lv+' GESCHAFFT!',VW/2,122,26,'#fd4','center');txt(BOSS[s.lv].nm+' wurde besiegt',VW/2,142,12,'#fff','center');txt(s.lv<6?'Gleich: Case Opening':'...',VW/2,160,9,'#bbc','center');x.globalAlpha=1}
 else if(s.ph=='over'){x.fillStyle='rgba(60,0,0,.78)';x.fillRect(0,0,VW,VH);txt('GAME OVER',VW/2,112,36,'#f44','center');
  txt('Keine Leben mehr in Level '+s.lv+' ('+LEVELS[s.lv].nm+')',VW/2,138,10,'#fff','center');
  txt('Checkpoint: '+(s.ck>s.wm?'direkt zum Boss':'weiter ab Welle '+s.ck)+'  ·  Waffen bleiben',VW/2,154,10,'#5e8','center');if(s.t>1.5)prompt_(180,'ENTER / Klick: nochmal versuchen')}
 x.font='bold 16px monospace';
}
