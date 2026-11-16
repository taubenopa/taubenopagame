// TAUBENGAME - Effekte: Waffensounds (Samples), Geschoss-Grafiken, Explosionen, Waffen-Grafik mit Animation
// ================= WAFFENSOUNDS (assets/sfx/*.wav) =================
// SFXV = Lautstaerke pro Waffe. Datei tauschen = Sound tauschen.
const SFXF={1:'pistol',2:'shotgun',3:'mg',4:'rocket',5:'plasma',6:'bfg',7:'sniper',8:'revolver',9:'flame',10:'grenade',11:'blitz',12:'rail',13:'mg',14:'pistol',16:'mg'};
const SFXR={13:.78,14:1.4,16:1.25};   // Tonhoehe (gleiches Sample, anderer Klang)
const SFXV={1:.55,2:.8,3:.42,4:.75,5:.4,6:.9,7:.85,8:.7,9:.5,10:.7,11:.55,12:.85,13:.55,14:.36,16:.34};
const SFX={};let sfxOn=0,flameSrc=null,flameGain=null,flameT=0;
function sfxInit(){
 if(sfxOn)return;sfxOn=1;try{ac()}catch(e){}
 for(const w in SFXF){const url='assets/sfx/'+SFXF[w]+'.wav',o=SFX[w]={buf:null,pool:[],k:0};
  for(let i=0;i<(w==3||w==5?6:w==9?1:3);i++){const a=new Audio(url);a.preload='auto';if(w==9)a.loop=true;o.pool.push(a)}
  // Web Audio (ohne Verzoegerung); klappt das Laden nicht (z.B. Doppelklick auf index.html), spielen die Audio-Elemente oben
  try{fetch(url).then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(b=>{o.buf=b}).catch(()=>{})}catch(e){}}
}
addEventListener('pointerdown',sfxInit);addEventListener('keydown',sfxInit);
function sfx(w){
 if(w==15){if(!muted){tone(620,170,.2,'triangle',.32);tone(1400,700,.05,'square',.08);nz(.09,'bandpass',2600,900,.28)}return true}   // Armbrust
 const o=SFX[w];if(!o)return false;if(muted)return true;
 if(w==9){flameT=.16;return true}
 if(o.buf){try{const s=AC.createBufferSource(),g=AC.createGain();s.buffer=o.buf;s.playbackRate.value=(SFXR[w]||1)*(.96+Math.random()*.08);g.gain.value=SFXV[w];s.connect(g);g.connect(mst);s.start();return true}catch(e){}}
 const a=o.pool[o.k++%o.pool.length];try{a.currentTime=0;if(SFXR[w]){a.preservesPitch=false;a.playbackRate=SFXR[w]}a.volume=Math.min(1,SFXV[w]*(mst?mst.gain.value:1));a.play().catch(()=>{})}catch(e){}return true;
}
function flameTick(dt){ // Flammenwerfer laeuft als Schleife, solange geschossen wird
 flameT-=dt;const o=SFX[9];if(!o)return;const on=flameT>0&&!muted;
 if(o.buf){if(on&&!flameSrc){try{flameSrc=AC.createBufferSource();flameGain=AC.createGain();flameSrc.buffer=o.buf;flameSrc.loop=true;flameGain.gain.value=SFXV[9];flameSrc.connect(flameGain);flameGain.connect(mst);flameSrc.start()}catch(e){flameSrc=null}}
  else if(!on&&flameSrc){try{flameGain.gain.setTargetAtTime(0,AC.currentTime,.05);flameSrc.stop(AC.currentTime+.25)}catch(e){}flameSrc=null}}
 else{const a=o.pool[0];if(on&&a.paused){a.volume=SFXV[9];a.play().catch(()=>{})}else if(!on&&!a.paused)a.pause()}
}

// ================= GESCHOSSE UND EXPLOSIONEN (vorgerenderte Bilder) =================
// Rauch-/Funkenspur pro Geschoss-Typ: [Menge, Farben, Lebensdauer, Hoehe, Auftrieb, Schwerkraft, Groesse]
const TRL={3:[.9,['#bbb','#888','#fa3'],.5,.42,.3,0,.05],4:[.5,['#4ef','#aff'],.2],12:[1,['#6f6','#cfc','#3a3'],.4,.42,.2,0,.06],18:[.4,['#888','#665'],.3],
 2:[.6,['#f80','#fd3','#f42'],.25],72:[.4,['#ddd','#aaa'],.2,.48],60:[.3,['#fff','#ccd'],.3],73:[.35,['#f6c838','#c98a3a','#4caf3a'],.3],70:[.5,['#ff4455','#ffb3ba'],.3],68:[.5,['#ffe45c','#fff7c2'],.25],69:[.9,['#ff5a5a','#fff'],.12,.52],62:[.8,['#7b2ff7','#c9a0ff','#1a0b2e'],.3],63:[.5,['#6b3a1a','#fff'],.3],65:[.25,['#8fc98a','#e8d06a'],.35],66:[.4,['#dde','#99a'],.2],24:[.7,['#555','#f80','#333'],.4,.5,.4],29:[.6,['#6f4','#3a2'],.35],37:[.7,['#8cf','#fff'],.15],36:[.3,['#f6c','#fbd'],.3],23:[.3,['#a4f','#d9f'],.25]};
(function(){
 const mk=(n,f,N)=>{const fr=[];for(let k=0;k<(N||1);k++){const c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d');g.translate(n/2,n/2);f(g,n/2,k/(N||1),k);fr.push(c)}return fr};
 const glow=(g,r,stops)=>{const q=g.createRadialGradient(0,0,0,0,0,r);stops.forEach((c,i)=>q.addColorStop(i/(stops.length-1),c));g.fillStyle=q;g.beginPath();g.arc(0,0,r,0,7);g.fill()};
 const fx=(t,s,z,fr,o)=>{ST[t]=Object.assign({fx:1,s,z,fr},o||{})};
 // 2 Feuerball
 fx(2,.46,.42,mk(48,(g,r,u)=>{glow(g,r,['#fff','#ffe27a','#ff8a1e','#e2330055','#e2330000']);g.rotate(u*6.28);g.fillStyle='#ffb347aa';for(let k=0;k<5;k++){g.rotate(1.26);g.beginPath();g.ellipse(r*.45,0,r*.3,r*.13,0,0,7);g.fill()}},6),{add:1,fps:14});
 // 3 Rakete
 fx(3,.34,.42,mk(48,(g,r,u)=>{glow(g,r,['#ffd36bcc','#ff7a1a66','#ff7a1a00']);g.fillStyle='#8d949c';g.beginPath();g.arc(0,0,r*.42,0,7);g.fill();g.fillStyle='#c5ccd3';g.beginPath();g.arc(-r*.1,-r*.1,r*.22,0,7);g.fill();g.fillStyle='#c22';g.beginPath();g.arc(0,0,r*.16,0,7);g.fill();g.fillStyle='#555';for(let k=0;k<4;k++){g.rotate(1.571);g.fillRect(-r*.06,r*.36,r*.12,r*.22)}},1));
 // 4 Plasma
 fx(4,.36,.42,mk(48,(g,r,u)=>{glow(g,r*(.8+.2*Math.sin(u*6.28)),['#fff','#9ff','#2cf','#2cf5','#2cf0'])},4),{add:1,fps:20});
 // 12 BFG-Kugel
 fx(12,1,.45,mk(96,(g,r,u)=>{glow(g,r,['#fff','#cfc','#5f5','#2a2a','#2a20']);g.strokeStyle='#efe';g.lineWidth=2;for(let k=0;k<3;k++){g.rotate(u*6.28/3+k*2.1);g.beginPath();g.ellipse(0,0,r*.55,r*.2,0,0,7);g.stroke()}},6),{add:1,fps:14});
 // 18 Granate
 fx(18,.24,.3,mk(32,(g,r,u)=>{g.rotate(u*6.28);g.fillStyle='#3d4a2c';g.beginPath();g.arc(0,0,r*.8,0,7);g.fill();g.fillStyle='#62773f';g.beginPath();g.arc(-r*.25,-r*.25,r*.35,0,7);g.fill();g.fillStyle='#222';g.fillRect(-r*.15,-r,r*.3,r*.35)},6),{fps:12});
 // 23 Becher (lila)
 fx(23,.34,.42,mk(40,(g,r,u)=>{glow(g,r,['#b45cff55','#b45cff00']);g.rotate(Math.sin(u*6.28)*.5);g.fillStyle='#f4f1f8';g.beginPath();g.moveTo(-r*.42,-r*.5);g.lineTo(r*.42,-r*.5);g.lineTo(r*.3,r*.55);g.lineTo(-r*.3,r*.55);g.fill();g.fillStyle='#8a2be2';g.fillRect(-r*.4,-r*.5,r*.8,r*.22);g.fillStyle='#c9a0ff';g.fillRect(-r*.36,-r*.12,r*.72,r*.16);g.fillStyle='#fff';g.fillRect(-r*.46,-r*.6,r*.92,r*.12)},8),{fps:10});
 // 24 Bombe mit Zuendschnur
 fx(24,.46,.48,mk(48,(g,r,u,k)=>{g.fillStyle='#17171b';g.beginPath();g.arc(0,r*.12,r*.62,0,7);g.fill();g.fillStyle='#3b3b44';g.beginPath();g.arc(-r*.2,-r*.08,r*.2,0,7);g.fill();g.fillStyle='#555';g.fillRect(-r*.12,-r*.62,r*.24,r*.2);g.strokeStyle='#a87';g.lineWidth=2;g.beginPath();g.moveTo(0,-r*.6);g.quadraticCurveTo(r*.3,-r*.9,r*.42,-r*.7);g.stroke();g.translate(r*.42,-r*.7);glow(g,r*(.25+.12*(k&1)),['#fff','#fd4','#f6000000'])},4),{fps:16});
 // 26 Stein
 fx(26,.2,.42,mk(24,(g,r,u)=>{g.rotate(u*6.28);g.fillStyle='#7c7770';g.beginPath();[[.8,0],[.5,.6],[-.3,.75],[-.8,.2],[-.6,-.6],[.2,-.8]].forEach(([a,b],i)=>i?g.lineTo(a*r,b*r):g.moveTo(a*r,b*r));g.fill();g.fillStyle='#a8a29a';g.fillRect(-r*.3,-r*.4,r*.4,r*.3)},6),{fps:14});
 // 27 Kugel (Leuchtspur)
 fx(27,.2,.42,mk(24,(g,r)=>{glow(g,r,['#fff','#ffe66d','#ffb30066','#ffb30000'])},1),{add:1});
 // 28 Wurfmesser
 fx(28,.36,.42,mk(40,(g,r,u)=>{g.rotate(u*6.28);g.fillStyle='#d9dde2';g.beginPath();g.moveTo(-r*.1,-r*.9);g.lineTo(r*.14,-r*.1);g.lineTo(-r*.14,-r*.1);g.fill();g.fillStyle='#8a9098';g.fillRect(-r*.02,-r*.8,r*.04,r*.7);g.fillStyle='#3a2a20';g.fillRect(-r*.09,-r*.1,r*.18,r*.75);g.fillStyle='#bbb';g.fillRect(-r*.22,-r*.14,r*.44,r*.1)},8),{fps:18});
 // 29 Giftschaedel (verfolgt Spieler)
 fx(29,.42,.42,mk(48,(g,r,u)=>{glow(g,r,['#8f6c','#4c38','#4c30']);g.fillStyle='#b7f5a0';g.beginPath();g.arc(0,-r*.08,r*.42,0,7);g.fill();g.fillRect(-r*.24,r*.2,r*.48,r*.24);g.fillStyle='#143';g.beginPath();g.arc(-r*.16,-r*.1,r*.11,0,7);g.arc(r*.16,-r*.1,r*.11,0,7);g.fill();g.fillRect(-r*.03,r*.08,r*.06,r*.1);for(let k=-1;k<=1;k++)g.fillRect(k*r*.14-1,r*.3,2,r*.14)},1));
 // 36 Musiknote
 fx(36,.4,.42,mk(40,(g,r,u)=>{glow(g,r,['#ff6ad555','#ff6ad500']);g.rotate(Math.sin(u*6.28)*.35);g.fillStyle='#ff4fc3';g.beginPath();g.ellipse(-r*.18,r*.38,r*.24,r*.17,-.4,0,7);g.fill();g.fillRect(-r*.02,-r*.6,r*.1,r*1);g.beginPath();g.moveTo(r*.08,-r*.6);g.quadraticCurveTo(r*.6,-r*.4,r*.4,r*.05);g.quadraticCurveTo(r*.42,-r*.25,r*.08,-r*.3);g.fill();g.fillStyle='#fff';g.fillRect(-r*.28,r*.3,r*.1,r*.06)},8),{fps:10});
 // 37 Kugelblitz
 fx(37,.42,.42,mk(48,(g,r)=>{glow(g,r,['#fff','#bfe6ff','#49f8','#49f0']);g.strokeStyle='#fff';g.lineWidth=1.5;for(let k=0;k<5;k++){let a=Math.random()*6.28,d=r*.15;g.beginPath();g.moveTo(Math.cos(a)*d,Math.sin(a)*d);for(let s=0;s<4;s++){a+=(Math.random()-.5)*1.4;d+=r*.2;g.lineTo(Math.cos(a)*d,Math.sin(a)*d)}g.stroke()}},6),{add:1,fps:24});
 // Pickups: 6 Munitionskiste, 7 Verbandskasten, 11 Ruestung
 const bx=(g,r,c,d,f)=>{const q=g.createLinearGradient(-r*.7,0,r*.7,0);q.addColorStop(0,d);q.addColorStop(.3,c);q.addColorStop(1,d);g.fillStyle=q;g.beginPath();g.roundRect(-r*.7,-r*.45,r*1.4,r*1.1,r*.12);g.fill();g.strokeStyle='#000a';g.lineWidth=1.5;g.stroke();g.fillStyle='#fff3';g.fillRect(-r*.62,-r*.4,r*1.24,r*.1);f(g,r)};
 fx(6,.34,.17,mk(48,(g,r)=>bx(g,r,'#6f8a3c','#3a4a20',(g,r)=>{g.fillStyle='#2a3418';g.fillRect(-r*.7,-r*.1,r*1.4,r*.12);for(let k=-1;k<=1;k++){g.fillStyle='#d9b23a';g.fillRect(k*r*.3-r*.07,r*.12,r*.14,r*.36);g.fillStyle='#a8541f';g.beginPath();g.arc(k*r*.3,r*.12,r*.07,3.14,0);g.fill()}})));
 fx(7,.32,.17,mk(48,(g,r)=>bx(g,r,'#f4f4f0','#b9b9b2',(g,r)=>{g.fillStyle='#d8242c';g.fillRect(-r*.12,-r*.3,r*.24,r*.8);g.fillRect(-r*.4,-r*.02,r*.8,r*.24);g.fillStyle='#777';g.fillRect(-r*.2,-r*.6,r*.4,r*.14)})));
 fx(11,.34,.19,mk(48,(g,r)=>{const q=g.createLinearGradient(-r*.6,0,r*.6,0);q.addColorStop(0,'#1d4f9a');q.addColorStop(.35,'#6db4ff');q.addColorStop(1,'#16407e');g.fillStyle=q;g.beginPath();g.moveTo(0,-r*.75);g.lineTo(r*.65,-r*.5);g.quadraticCurveTo(r*.65,r*.4,0,r*.8);g.quadraticCurveTo(-r*.65,r*.4,-r*.65,-r*.5);g.closePath();g.fill();g.strokeStyle='#061a36';g.lineWidth=2;g.stroke();g.strokeStyle='#cfe6ff';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-r*.5);g.lineTo(0,r*.5);g.moveTo(-r*.38,-r*.1);g.lineTo(r*.38,-r*.1);g.stroke()}));
 // --- Spezialwaffen der Charaktere ---
 // 60 Taube
 fx(60,.36,.5,mk(40,(g,r,u,k)=>{const f=k&1?-1:1;g.fillStyle='#9aa3ad';g.beginPath();g.ellipse(0,0,r*.42,r*.26,0,0,7);g.fill();g.fillStyle='#c7ced6';g.beginPath();g.moveTo(-r*.1,0);g.lineTo(-r*.75,-r*.55*f);g.lineTo(-r*.35,r*.05);g.fill();g.beginPath();g.moveTo(r*.1,0);g.lineTo(r*.75,-r*.55*f);g.lineTo(r*.35,r*.05);g.fill();g.fillStyle='#6d7680';g.beginPath();g.arc(0,-r*.28,r*.17,0,7);g.fill();g.fillStyle='#f5a623';g.fillRect(-r*.04,-r*.2,r*.08,r*.12);g.fillStyle='#111';g.fillRect(-r*.1,-r*.32,2,2);g.fillRect(r*.05,-r*.32,2,2)},2),{fps:9});
 // 61 Euro-Muenze
 fx(61,.2,.42,mk(24,(g,r,u)=>{const w=Math.max(.15,Math.abs(Math.cos(u*6.28)));g.fillStyle='#c9a227';g.beginPath();g.ellipse(0,0,r*.8*w,r*.8,0,0,7);g.fill();g.fillStyle='#e9e9ee';g.beginPath();g.ellipse(0,0,r*.5*w,r*.5,0,0,7);g.fill();g.fillStyle='#fff8';g.fillRect(-r*.2*w,-r*.6,r*.15*w+1,r*.3)},6),{fps:16});
 // 62 Schattenklinge
 fx(62,1.1,.42,mk(96,(g,r,u)=>{glow(g,r,['#7b2ff766','#7b2ff700']);g.fillStyle='#1a0b2e';g.beginPath();g.moveTo(-r*.95,r*.1);g.quadraticCurveTo(0,-r*.75,r*.95,r*.1);g.quadraticCurveTo(0,-r*.3,-r*.95,r*.1);g.fill();g.strokeStyle='#c9a0ff';g.lineWidth=2.5;g.beginPath();g.moveTo(-r*.95,r*.1);g.quadraticCurveTo(0,-r*(.75+.05*Math.sin(u*6.28)),r*.95,r*.1);g.stroke()},4),{fps:14});
 // 63 Cola-Dose
 fx(63,.34,.45,mk(40,(g,r,u)=>{g.rotate(u*6.28);const q=g.createLinearGradient(-r*.4,0,r*.4,0);q.addColorStop(0,'#7d0f12');q.addColorStop(.35,'#ee3b3f');q.addColorStop(1,'#7d0f12');g.fillStyle=q;g.beginPath();g.roundRect(-r*.4,-r*.7,r*.8,r*1.4,r*.1);g.fill();g.fillStyle='#d9dde2';g.fillRect(-r*.36,-r*.74,r*.72,r*.12);g.fillRect(-r*.36,r*.62,r*.72,r*.1);g.fillStyle='#fff';g.fillRect(-r*.4,-r*.1,r*.8,r*.16)},8),{fps:16});
 // 65 Geldschein
 fx(65,.32,.42,mk(40,(g,r,u,k)=>{g.rotate(Math.sin(u*6.28)*.7);const C=['#8fc98a','#f0a45d','#7fb6e8','#e8d06a'][k%4];g.fillStyle=C;g.fillRect(-r*.75,-r*.38,r*1.5,r*.76);g.strokeStyle='#0005';g.lineWidth=1.5;g.strokeRect(-r*.75,-r*.38,r*1.5,r*.76);g.fillStyle='#fff8';g.beginPath();g.arc(0,0,r*.2,0,7);g.fill();g.fillStyle='#0006';g.fillRect(-r*.62,-r*.26,r*.22,r*.12);g.fillRect(r*.4,r*.14,r*.22,r*.12)},8),{fps:12});
 // 66 Dog Tag
 fx(66,.3,.42,mk(40,(g,r,u)=>{g.rotate(u*6.28);g.strokeStyle='#b9bec6';g.lineWidth=1.5;g.beginPath();g.arc(0,-r*.45,r*.4,2.2,7.2);g.stroke();const q=g.createLinearGradient(-r*.3,0,r*.3,0);q.addColorStop(0,'#7f858e');q.addColorStop(.4,'#f2f4f7');q.addColorStop(1,'#7f858e');g.fillStyle=q;g.beginPath();g.roundRect(-r*.28,-r*.15,r*.56,r*.9,r*.14);g.fill();g.fillStyle='#555';g.fillRect(-r*.16,r*.1,r*.32,2);g.fillRect(-r*.16,r*.3,r*.32,2);g.fillRect(-r*.16,r*.5,r*.2,2)},8),{fps:20});
 // 67 Schockwelle (Wolfsgeheul)
 fx(67,.6,.4,mk(48,(g,r,u)=>{glow(g,r,['#ffffff55','#9fd0ff33','#9fd0ff00']);g.strokeStyle='#e8f3ff';g.lineWidth=3;g.beginPath();g.arc(0,r*.5,r*.8,-2.3,-.85);g.stroke();g.strokeStyle='#9fd0ff';g.lineWidth=1.5;g.beginPath();g.arc(0,r*.75,r*.8,-2.2,-.95);g.stroke()},1),{add:1});
 // 68 Schallwelle (saesix)
 fx(68,1.2,.42,mk(96,(g,r,u)=>{glow(g,r,['#ffe45c44','#ffe45c00']);for(let k=0;k<3;k++){g.strokeStyle=k==1?'#fff7c2':'#e6c62e';g.lineWidth=k==1?4:2.5;g.beginPath();g.arc(0,r*(.9+k*.28)+Math.sin(u*6.28+k)*r*.04,r*(.95+k*.06),-2.25,-.9);g.stroke()}},4),{add:1,fps:16});
 // 69 Laser (Joshie)
 fx(69,.34,.52,mk(40,(g,r,u)=>{glow(g,r,['#fff','#ff5a5a','#ff1e1e66','#ff1e1e00']);g.fillStyle='#fff';g.beginPath();g.arc(0,0,r*(.22+.06*Math.sin(u*6.28)),0,7);g.fill()},3),{add:1,fps:24});
 // 70 Herz (souf)
 fx(70,.4,.45,mk(48,(g,r,u)=>{const k=1+.14*Math.sin(u*6.28);glow(g,r,['#ff3b4a66','#ff3b4a00']);g.scale(k,k);const q=g.createLinearGradient(-r*.5,0,r*.5,0);q.addColorStop(0,'#8e0f1b');q.addColorStop(.35,'#ff4455');q.addColorStop(1,'#8e0f1b');g.fillStyle=q;g.beginPath();g.moveTo(0,r*.6);g.bezierCurveTo(-r*.9,r*.05,-r*.6,-r*.65,0,-r*.25);g.bezierCurveTo(r*.6,-r*.65,r*.9,r*.05,0,r*.6);g.fill();g.fillStyle='#fff6';g.beginPath();g.ellipse(-r*.25,-r*.2,r*.1,r*.16,-.5,0,7);g.fill()},6),{fps:10});
 // 71 Schatten (Schattensprung)
 fx(71,.9,.45,mk(64,(g,r,u)=>{glow(g,r,['#7b2ff7aa','#3a0f6e66','#1a0b2e00']);g.fillStyle='#0d0618aa';for(let k=0;k<7;k++){const a=k*.9+u*6.28;g.beginPath();g.arc(Math.cos(a)*r*.35,Math.sin(a)*r*.35,r*.28,0,7);g.fill()}},4),{fps:12});
 // 72 Armbrust-Bolzen
 fx(72,.26,.48,mk(32,(g,r,u)=>{g.rotate(u*6.28);g.fillStyle='#5a3a1e';g.beginPath();g.arc(0,0,r*.22,0,7);g.fill();for(let k=0;k<3;k++){g.rotate(2.094);g.fillStyle=k?'#f2efe8':'#d8242c';g.beginPath();g.moveTo(0,-r*.15);g.lineTo(r*.85,-r*.05);g.lineTo(r*.85,r*.12);g.lineTo(0,r*.12);g.fill()}g.fillStyle='#cfd5dc';g.beginPath();g.arc(0,0,r*.1,0,7);g.fill()},6),{fps:18});
 // 73 Burger (Muro)
 fx(73,.4,.45,mk(48,(g,r,u)=>{g.rotate(Math.sin(u*6.28)*.35);const E=(y,w,h,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(0,y*r,w*r,h*r,0,0,7);g.fill()};
  E(.28,.78,.22,'#c98a3a');E(.12,.82,.14,'#5a2e14');g.fillStyle='#f6c838';g.beginPath();g.moveTo(-.8*r,.0);g.lineTo(.8*r,0);g.lineTo(.5*r,.14*r);g.lineTo(.2*r,.02*r);g.lineTo(-.3*r,.16*r);g.closePath();g.fill();
  g.fillStyle='#4caf3a';for(let k=-3;k<=3;k++){g.beginPath();g.arc(k*.24*r,-.04*r,.13*r,0,7);g.fill()}g.fillStyle='#e0402e';g.fillRect(-.6*r,-.14*r,1.2*r,.08*r);
  g.fillStyle='#d9973f';g.beginPath();g.ellipse(0,-.2*r,.78*r,.42*r,0,3.14,0);g.fill();g.fillStyle='#fff3d6';for(const[a,b]of[[-.4,-.4],[0,-.5],[.35,-.38],[-.15,-.32],[.15,-.42]])g.fillRect(a*r,b*r,2,1.4)},6),{fps:10});
 // 5 Explosion (Feuerball -> Rauch)
 fx(5,1.7,.42,mk(96,(g,r,u)=>{const R=r*(.35+.65*u);if(u<.7)glow(g,R,['#fff','#ffe680','#ff8a1e','#c32a00aa','#c32a0000']);g.globalAlpha=Math.min(1,u*1.6)*(1-u*.5);for(let k=0;k<9;k++){const a=k*.7+u,d=R*.55;g.fillStyle=k&1?'#3a3331':'#57504c';g.beginPath();g.arc(Math.cos(a)*d,Math.sin(a)*d-u*r*.2,R*.32,0,7);g.fill()}g.globalAlpha=1;if(u<.5){g.fillStyle='#fff8';g.beginPath();g.arc(0,0,R*.35*(1-u*2),0,7);g.fill()}},9));
})();
function drawFx(s,T,sz,cx,gy,now){
 const ci=cx|0;if(ci<0||ci>=VW||Z[ci]<s.ty)return;
 let k=T.s,f;const fr=T.fr;
 if(s.t==5){const u=1-Math.max(0,s.l==null?.2:s.l)/.35;f=fr[Math.max(0,Math.min(fr.length-1,u*fr.length|0))];k*=.75+u*.5}
 else f=fr[((now*(T.fps||12)+s.x*7)|0)%fr.length];
 const h=sz*k;let cy=gy-sz*T.z-(s.z||0)*sz;
 if(s.pk){x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(cx,gy,h*.45,Math.max(1,sz*.022),0,0,6.3);x.fill();cy-=(.03+.03*Math.sin(now*3+s.x*5))*sz}
 if(T.add)x.globalCompositeOperation='lighter';
 x.drawImage(f,cx-h/2,cy-h/2,h,h);x.globalCompositeOperation='source-over';
}

// ================= WAFFEN (Ego-Ansicht) =================
// Jede Waffe wird einmal in ein Bild gezeichnet (WIMG) und dann mit Schwung, Rueckstoss, Wechsel-Animation bewegt.
const WIMG=[],WMZ=[];   // WMZ = Muendung [x,y] relativ zur Bildmitte unten (fuer Muendungsfeuer)
(function(){
 const W=150,H=170,Q=2;
 const col=(c,k)=>{const v=parseInt(c.slice(1),16),f=a=>Math.max(0,Math.min(255,a*k|0));return'rgb('+f(v>>16)+','+f(v>>8&255)+','+f(v&255)+')'};
 const make=(i,mz,f)=>{const c=document.createElement('canvas');c.width=W*Q;c.height=H*Q;const g=c.getContext('2d');g.scale(Q,Q);g.translate(W/2,H);g.lineJoin='round';f(g);WIMG[i]=c;WMZ[i]=mz};
 // Rohr: von unten (y0, Breite w0) nach oben (y1, Breite w1) mit Rund-Schattierung
 const tube=(g,cx,y0,y1,w0,w1,c)=>{const q=g.createLinearGradient(cx-w0/2,0,cx+w0/2,0);q.addColorStop(0,col(c,.45));q.addColorStop(.3,col(c,1.25));q.addColorStop(.55,c);q.addColorStop(1,col(c,.35));g.fillStyle=q;g.beginPath();g.moveTo(cx-w0/2,-y0);g.lineTo(cx-w1/2,-y1);g.lineTo(cx+w1/2,-y1);g.lineTo(cx+w0/2,-y0);g.closePath();g.fill();g.strokeStyle='#0009';g.lineWidth=1;g.stroke()};
 const box=(g,a,y0,w,h,c)=>{const q=g.createLinearGradient(a,0,a+w,0);q.addColorStop(0,col(c,.55));q.addColorStop(.25,col(c,1.15));q.addColorStop(1,col(c,.5));g.fillStyle=q;g.fillRect(a,-y0-h,w,h);g.strokeStyle='#0009';g.lineWidth=1;g.strokeRect(a+.5,-y0-h+.5,w-1,h-1)};
 const ring=(g,cx,y,w,c)=>{g.fillStyle=c;g.fillRect(cx-w/2,-y-1.5,w,3);g.fillStyle='#0006';g.fillRect(cx-w/2,-y+1.5,w,1)};
 const hole=(g,cx,y,w)=>{g.fillStyle='#050505';g.beginPath();g.ellipse(cx,-y,w/2,w/5,0,0,7);g.fill()};
 // Hand mit Aermel
 const hand=(g,cx,w,top)=>{tube(g,cx,0,top-14,w+16,w+8,'#34343f');const q=g.createLinearGradient(cx-w/2,0,cx+w/2,0);q.addColorStop(0,'#8c5c44');q.addColorStop(.35,'#e0a988');q.addColorStop(1,'#7d4f3a');g.fillStyle=q;g.beginPath();g.roundRect(cx-w/2-2,-top,w+4,20,6);g.fill();g.strokeStyle='#0008';g.stroke();g.strokeStyle='#5e3a2a88';for(let k=1;k<4;k++){g.beginPath();g.moveTo(cx-w/2+k*(w+4)/4-2,-top+2);g.lineTo(cx-w/2+k*(w+4)/4-2,-top+11);g.stroke()}};
 const glowDot=(g,cx,y,r,c)=>{const q=g.createRadialGradient(cx,-y,0,cx,-y,r);q.addColorStop(0,'#fff');q.addColorStop(.35,c);q.addColorStop(1,c+'00');g.fillStyle=q;g.beginPath();g.arc(cx,-y,r,0,7);g.fill()};
 // 0 Faust
 make(0,[0,96],g=>{tube(g,0,0,58,46,34,'#34343f');const q=g.createLinearGradient(-22,0,22,0);q.addColorStop(0,'#8c5c44');q.addColorStop(.35,'#e6b091');q.addColorStop(1,'#7d4f3a');g.fillStyle=q;g.beginPath();g.roundRect(-21,-98,42,44,10);g.fill();g.strokeStyle='#0008';g.stroke();g.strokeStyle='#5e3a2a';for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(k*10,-96);g.lineTo(k*10,-78);g.stroke()}g.fillStyle='#f3c7ab';for(let k=-2;k<2;k++)g.fillRect(k*10+2,-97,6,4)});
 // 1 Pistole
 make(1,[0,118],g=>{hand(g,0,26,62);box(g,-9,56,18,56,'#7a7f8c');box(g,-7,104,14,10,'#3d4049');hole(g,0,114,9);g.fillStyle='#22242a';g.fillRect(-9,-70,3,10);g.fillRect(6,-70,3,10);g.fillRect(-1.5,-116,3,5);for(let k=0;k<5;k++){g.fillStyle='#0005';g.fillRect(-9,-66-k*4,18,1.5)}});
 // 2 Schrotflinte (Doppellauf)
 make(2,[0,150],g=>{hand(g,0,30,56);box(g,-17,48,34,26,'#6b4226');tube(g,-8,70,148,16,13,'#5a5d66');tube(g,8,70,148,16,13,'#5a5d66');box(g,-18,96,36,14,'#7a4b2a');hole(g,-8,148,11);hole(g,8,148,11);ring(g,0,74,36,'#2a2b30');g.fillStyle='#d8b56a';g.fillRect(-1,-152,2,5)});
 // 3 Maschinengewehr
 make(3,[0,146],g=>{hand(g,0,30,54);box(g,-14,48,28,40,'#4b4f5a');tube(g,0,88,128,22,18,'#3a3d46');for(let k=0;k<4;k++){g.fillStyle='#0b0b0d';g.fillRect(-7,-96-k*8,5,4);g.fillRect(2,-96-k*8,5,4)}tube(g,0,128,144,9,8,'#6d727e');hole(g,0,144,7);box(g,14,58,12,26,'#2c2e35');g.fillStyle='#c9a13a';g.fillRect(16,-80,8,3);box(g,-3,128,6,8,'#22242a')});
 // 4 Raketenwerfer
 make(4,[0,150],g=>{hand(g,-4,30,50);tube(g,0,44,132,40,34,'#566b3a');tube(g,0,132,146,40,44,'#3d4d29');ring(g,0,70,40,'#2c3a1c');ring(g,0,108,37,'#2c3a1c');g.fillStyle='#070707';g.beginPath();g.ellipse(0,-146,20,6,0,0,7);g.fill();g.fillStyle='#c22';g.beginPath();g.ellipse(0,-145,9,4,0,0,7);g.fill();box(g,18,60,10,22,'#2c2e35');g.fillStyle='#fd4';g.fillRect(-14,-96,10,3);g.fillRect(-14,-90,6,3)});
 // 5 Plasma
 make(5,[0,140],g=>{hand(g,0,30,52);box(g,-16,46,32,44,'#1d3a5c');tube(g,0,90,134,20,16,'#27507c');for(let k=0;k<5;k++)ring(g,0,96+k*8,22-k,'#0e2238');g.fillStyle='#3df';g.fillRect(-3,-132,6,40);g.fillStyle='#cff';g.fillRect(-1,-132,2,40);box(g,-20,56,5,24,'#0e2238');box(g,15,56,5,24,'#0e2238');hole(g,0,134,12)});
 // 6 BFG
 make(6,[0,150],g=>{hand(g,-6,32,48);tube(g,0,40,116,62,52,'#2e6b34');box(g,-34,58,10,36,'#1c3d20');box(g,24,58,10,36,'#1c3d20');tube(g,0,116,140,44,50,'#3f8a46');ring(g,0,84,58,'#143016');ring(g,0,116,50,'#143016');g.fillStyle='#061006';g.beginPath();g.ellipse(0,-140,25,8,0,0,7);g.fill();for(let k=0;k<3;k++){g.fillStyle='#9f9';g.fillRect(-18+k*14,-74,8,4)}});
 // 7 Scharfschuetzengewehr
 make(7,[0,160],g=>{hand(g,0,28,50);box(g,-9,44,18,50,'#4a3a2a');tube(g,0,94,158,9,6,'#3c3f48');hole(g,0,158,5);tube(g,12,60,112,13,13,'#22242b');g.fillStyle='#59c8ff';g.beginPath();g.ellipse(12,-112,6.5,2.5,0,0,7);g.fill();g.fillStyle='#0b0b0d';g.beginPath();g.ellipse(12,-60,6.5,2.5,0,0,7);g.fill();box(g,5,74,6,5,'#22242b');box(g,5,96,6,5,'#22242b');g.fillStyle='#22242a';g.fillRect(-1,-162,2,5)});
 // 8 Revolver
 make(8,[0,128],g=>{hand(g,0,26,58);box(g,-7,50,14,22,'#5b3a22');tube(g,0,70,92,26,26,'#9aa0ab');for(let k=-1;k<=1;k++){g.fillStyle='#3d4049';g.fillRect(k*8-2,-91,4,20)}tube(g,0,92,126,10,9,'#8b919c');hole(g,0,126,7);g.fillStyle='#2a2b30';g.fillRect(-1.5,-131,3,5);g.fillStyle='#c9a13a';g.fillRect(-4,-72,8,3)});
 // 9 Flammenwerfer
 make(9,[0,136],g=>{hand(g,-4,30,50);tube(g,26,10,92,22,20,'#b8322a');ring(g,26,40,22,'#6d1612');ring(g,26,76,21,'#6d1612');tube(g,0,46,112,18,14,'#4b4f5a');tube(g,0,112,134,10,16,'#2b2d33');hole(g,0,134,12);g.strokeStyle='#22242a';g.lineWidth=4;g.beginPath();g.moveTo(22,-88);g.quadraticCurveTo(14,-108,4,-100);g.stroke();g.fillStyle='#fd4';g.fillRect(-8,-70,5,5)});
 // 10 Granatwerfer
 make(10,[0,132],g=>{hand(g,0,32,48);box(g,-13,44,26,24,'#5a5a3c');tube(g,0,66,96,40,40,'#6b6b47');for(let k=-1;k<=1;k++){g.fillStyle='#2c2c1c';g.beginPath();g.ellipse(k*12,-82,4,9,0,0,7);g.fill()}tube(g,0,96,130,24,22,'#4c4c32');g.fillStyle='#060606';g.beginPath();g.ellipse(0,-130,11,4,0,0,7);g.fill();ring(g,0,100,25,'#2c2c1c')});
 // 11 Blitzpistole
 make(11,[0,128],g=>{hand(g,0,26,58);box(g,-10,54,20,40,'#2a4f9c');for(let k=0;k<4;k++)ring(g,0,62+k*8,24,'#9fd0ff');tube(g,0,94,112,12,8,'#c9d6e6');g.strokeStyle='#dfe9f5';g.lineWidth=2.5;g.beginPath();g.moveTo(-4,-110);g.lineTo(-9,-126);g.moveTo(4,-110);g.lineTo(9,-126);g.stroke();g.fillStyle='#6cf';g.fillRect(-12,-88,3,10)});
 // 12 Railgun
 make(12,[0,158],g=>{hand(g,-4,30,50);box(g,-16,44,32,40,'#3a3f52');box(g,-13,84,7,74,'#596079');box(g,6,84,7,74,'#596079');for(let k=0;k<6;k++)ring(g,0,90+k*11,28,'#22263a');g.fillStyle='#3cf';g.fillRect(-3,-156,6,72);g.fillStyle='#fff';g.fillRect(-1,-156,2,72);box(g,16,52,8,20,'#22263a');g.fillStyle='#3cf';g.fillRect(18,-68,4,4)});
 // 13 Sturmgewehr
 make(13,[0,152],g=>{hand(g,0,28,50);box(g,-11,44,22,42,'#3b3d42');g.fillStyle='#2a2b30';g.beginPath();g.moveTo(9,-58);g.quadraticCurveTo(30,-50,30,-30);g.lineTo(20,-28);g.quadraticCurveTo(20,-44,9,-48);g.fill();g.strokeStyle='#0008';g.stroke();
  box(g,-10,86,20,28,'#8a5a2e');for(let k=0;k<3;k++){g.fillStyle='#5a3a1a';g.fillRect(-8,-92-k*8,16,2)}tube(g,-5,108,128,5,5,'#2a2c31');tube(g,0,112,150,7,6,'#2a2c31');box(g,-2,140,4,10,'#1a1b1f');hole(g,0,150,5);box(g,-3,70,6,7,'#1a1b1f')});
 // 14 Maschinenpistole
 make(14,[0,124],g=>{hand(g,0,26,54);box(g,-12,50,24,50,'#2f3236');for(let k=0;k<4;k++){g.fillStyle='#15171a';g.fillRect(-10,-60-k*9,20,3)}box(g,-4,58,8,10,'#15171a');tube(g,0,100,124,9,8,'#4a4d55');hole(g,0,124,6);box(g,-2,114,4,9,'#15171a');g.fillStyle='#9aa0ab';g.fillRect(-12,-98,24,2)});
 // 15 Armbrust
 make(15,[0,132],g=>{hand(g,0,28,50);box(g,-7,44,14,72,'#7a4e2a');g.fillStyle='#5a3a1a';for(let k=0;k<4;k++)g.fillRect(-6,-58-k*14,12,2);
  g.strokeStyle='#2f343c';g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(-52,-96);g.quadraticCurveTo(0,-124,52,-96);g.stroke();g.strokeStyle='#59606b';g.lineWidth=2;g.beginPath();g.moveTo(-50,-98);g.quadraticCurveTo(0,-125,50,-98);g.stroke();
  g.strokeStyle='#e8e2d0';g.lineWidth=1.5;g.beginPath();g.moveTo(-52,-96);g.lineTo(0,-74);g.lineTo(52,-96);g.stroke();
  g.strokeStyle='#5a3a1e';g.lineWidth=3;g.beginPath();g.moveTo(0,-74);g.lineTo(0,-126);g.stroke();g.fillStyle='#cfd5dc';g.beginPath();g.moveTo(-4,-124);g.lineTo(0,-134);g.lineTo(4,-124);g.fill();g.fillStyle='#d8242c';g.fillRect(-4,-80,8,5)});
 // 16 Minigun
 make(16,[0,150],g=>{hand(g,-8,32,44);box(g,-26,42,52,44,'#3a3d42');box(g,-22,48,10,30,'#2a2c31');g.fillStyle='#c9a13a';g.fillRect(24,-74,10,4);g.fillRect(26,-66,10,4);
  for(let k=-2;k<=2;k++)tube(g,k*7,86,146,8,7,'#555a63');for(const y of[98,134])ring(g,0,y,42,'#2a2c31');for(let k=-2;k<=2;k++)hole(g,k*7,146,5)});
 WIMG.W=W;WIMG.H=H;
})();
// Zustand der Waffen-Animation. ak = wie weit gezielt wird (0 = Huefte, 1 = Kimme und Korn), mx/my = Muendung auf dem Bildschirm, sc = Zielfernrohr aktiv
const VM={w:1,sw:1,sx:0,sy:0,la:0,lp:0,ak:0,sc:0,mx:VW/2+90,my:VH-60};
const WKICK=[26,7,16,4,18,3,22,20,11,1.5,13,6,20,6,3,12,2.5],WROT=[0,.05,.1,.02,.07,.015,.09,.1,.09,.008,.07,.03,.09,.03,.02,.06,.01];
const FLR=[0,15,30,17,28,18,38,26,20,0,22,18,30,20,13,0,22];   // Groesse Muendungsfeuer
const SCOPED={7:1,12:1};
// Die Waffe selbst wird in js/vm.js als 3D-Modell gezeichnet (drawWeapon). WIMG oben dient nur noch als Symbol in Shop und Case Opening.
// Zielfernrohr (Sniper, Railgun)
function drawScope(now){
 const r=VH*.47,cx=VW/2,cy=VH/2,sway=Math.sin(now*1.3)*.6;
 x.fillStyle='#000';x.beginPath();x.rect(0,0,VW,VH);x.moveTo(cx+r,cy);x.arc(cx,cy,r,0,6.2832,true);x.closePath();x.fill('evenodd');
 const q=x.createRadialGradient(cx,cy,r*.7,cx,cy,r);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.75)');x.fillStyle=q;x.beginPath();x.arc(cx,cy,r,0,7);x.fill();
 x.strokeStyle='#000';x.lineWidth=1;x.beginPath();x.moveTo(cx-r,cy+sway);x.lineTo(cx-6,cy+sway);x.moveTo(cx+6,cy+sway);x.lineTo(cx+r,cy+sway);x.moveTo(cx,cy-r);x.lineTo(cx,cy-6);x.moveTo(cx,cy+6);x.lineTo(cx,cy+r);x.stroke();
 x.lineWidth=3;x.beginPath();x.moveTo(cx-r,cy+sway);x.lineTo(cx-r*.55,cy+sway);x.moveTo(cx+r*.55,cy+sway);x.lineTo(cx+r,cy+sway);x.moveTo(cx,cy+r*.55);x.lineTo(cx,cy+r);x.stroke();
 x.fillStyle='#ff3030';x.fillRect(cx-1,cy-1+sway,2,2);
 if(fl>0){x.fillStyle='rgba(255,220,160,'+(fl*2).toFixed(2)+')';x.fillRect(0,0,VW,VH)}
 VM.mx=cx;VM.my=VH;
}
