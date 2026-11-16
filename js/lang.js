// TAUBENGAME - Sprache (Deutsch / English)
// Das Spiel ist auf Deutsch geschrieben. Fuer Englisch werden Texte beim Anzeigen uebersetzt:
//  - Menue-HTML: jedes Element mit data-en="..." bekommt den englischen Text
//  - Spiel (Canvas) und wechselnde Menue-Texte: Woerterbuch I18N unten (deutsches Stueck -> englisches Stueck)
//  - Slimes Dialoge: DLG_EN
let LANG='de';try{LANG=localStorage.hfLang=='en'?'en':'de'}catch(e){}
const I18N=[
 // --- Spiel-HUD ---
 ['KEINE LEBEN MEHR - dein Team muss durchhalten!','NO LIVES LEFT - your team has to hold on!'],['DU BIST TOT - Respawn in ','YOU ARE DEAD - respawn in '],
 ['Der Boss kommt...','The boss is coming...'],['Nächste Welle kommt...','Next wave incoming...'],['KLICKEN ZUM STEUERN','CLICK TO PLAY'],['PAUSE  (P = weiter)','PAUSED  (P = resume)'],
 ['Ton aus (N)','Sound off (N)'],['VERBINDUNG ZUM HOST VERLOREN','CONNECTION TO HOST LOST'],['Verbunden! Warte, bis der Host startet...','Connected! Waiting for the host to start...'],
 ['Raum-Code: ','Room code: '],['WELLE ','WAVE '],['Gegner ','Enemies '],['Rekord ','Best '],['RÜSTUNG ','ARMOR '],['Munition ','Ammo '],['  tot  ','  dead  '],['BEREIT','READY'],
 // --- Waffen ---
 ['MASCHINENPISTOLE','SUBMACHINE GUN'],['STURMGEWEHR','ASSAULT RIFLE'],['ARMBRUST','CROSSBOW'],['MASCHINENGEWEHR','MACHINE GUN'],
 ['präzise beim Zielen','accurate when aiming'],['sehr schnell, streut','very fast, spreads'],['Bolzen durchschlägt Gegner','bolt pierces enemies'],['muss erst anlaufen','needs to spin up'],['RAKETENWERFER','ROCKET LAUNCHER'],['FLAMMENWERFER','FLAMETHROWER'],['GRANATENWERFER','GRENADE LAUNCHER'],['BLITZPISTOLE','LIGHTNING PISTOL'],
 ['PISTOLE','PISTOL'],['FAUST','FIST'],['RAKETE','ROCKET'],['FLAMME','FLAME'],['GRANATE','GRENADE'],['BLITZ','BOLT'],
 ['unendlich Munition','infinite ammo'],['8 Schrot, nah stark','8 pellets, strong up close'],['schnelles Dauerfeuer','rapid fire'],['Flächenschaden','splash damage'],['schneller Strahl','fast beam'],
 ['riesige Explosion','huge explosion'],['1 Schuss, 90 Schaden','1 shot, 90 damage'],['langsam, hart','slow, hits hard'],['kurze Reichweite','short range'],['explodiert nach Flug','explodes after flight'],
 ['springt auf Gegner über','jumps to nearby enemies'],['durchschlägt alle','pierces everything'],
 // --- Spezialwaffen der Charaktere ---
 ['Taubenschwarm','Pigeon Swarm'],['Euro-Schrot','Euro Blast'],['Schattenklinge','Shadow Blade'],['Cola-Bombe','Cola Bomb'],['Wolfsgeheul','Wolf Howl'],['Zwillen-Salve','Slingshot Volley'],['Dog-Tag-Wirbel','Dog Tag Storm'],['Geldregen','Money Rain'],['Grunge-Riff','Grunge Riff'],['Laser-Blick','Laser Stare'],['Taubenwächter','Pigeon Guard'],['Schattensprung','Shadow Step'],['Cola-Pfütze','Cola Spill'],['Wolfsrausch','Wolf Frenzy'],['Steinhagel','Rock Rain'],['Dog-Tag-Bumerang','Dog Tag Boomerang'],['Bestechung','Bribe'],['Burger-Salve','Burger Volley'],['Wirft drei Burger im Fächer, die beim Aufprall explodieren.','Throws three burgers in a fan that explode on impact.'],
 ['  AKTIV','  ACTIVE'],['Ulti „','Ultimate "'],['“ (Q, alle ','" (Q, every '],
 ['Fünf Tauben kreisen 8 Sekunden um dich, picken Gegner und fangen feindliche Geschosse ab.','Five pigeons circle you for 8 seconds, peck enemies and catch enemy projectiles.'],
 ['7 Sekunden doppelter Schaden und 60 % schnelleres Feuer.','7 seconds of double damage and 60% faster fire.'],
 ['Teleport bis zu 7 Felder nach vorn. Alles auf dem Weg nimmt schweren Schaden, du bist kurz unverwundbar.','Teleport up to 7 tiles forward. Everything in the way takes heavy damage, and you are briefly invulnerable.'],
 ['Wirft eine Dose, die zu einer klebrigen Pfütze wird: Gegner darin sind stark verlangsamt, nehmen Schaden, am Ende explodiert sie.','Throws a can that bursts into a sticky puddle: enemies inside are heavily slowed and take damage, and it explodes at the end.'],
 ['Ein Heulen schleudert Gegner weg. Danach 8 Sekunden schneller, und Treffer heilen dich.','A howl knocks enemies back. Then 8 seconds of extra speed, and your hits heal you.'],
 ['Ruft einen Steinhagel auf die Stelle, auf die du zielst. 14 Steine in 2,5 Sekunden.','Calls a rain of rocks onto the spot you aim at. 14 rocks in 2.5 seconds.'],
 ['Drei Dog Tags fliegen raus und kommen zurück. Jeder Gegner wird zweimal getroffen.','Three dog tags fly out and come back. Every enemy gets hit twice.'],
 ['Geldfächer: Getroffene Gegner wechseln 8 Sekunden die Seite, kämpfen für dich und hauen dann mit der Kohle ab.','Cash fan: enemies it hits switch sides for 8 seconds, fight for you, then run off with the money.'],
 ['Eine Schallwelle betäubt alle Gegner im Umkreis 3 Sekunden lang und löscht feindliche Geschosse.','A sound wave stuns every enemy around you for 3 seconds and wipes out enemy projectiles.'],
 ['3 Sekunden ein Laserstrahl, der deinem Blick folgt und alles in der Linie durchbrennt.','A 3-second laser beam that follows your aim and burns through everything in its line.'],
 ['Heilt das ganze Team, holt gefallene Mitspieler sofort zurück und stößt Gegner in der Nähe weg.','Heals the whole team, instantly brings back fallen teammates and pushes nearby enemies away.'],['Herzschlag','Heartbeat'],
 // --- Story ---
 ['ENTER / Klick: zurück zum Hauptmenü','ENTER / click: back to main menu'],['ENTER / Klick: nochmal versuchen','ENTER / click: try again'],['ENTER / Klick: Level starten','ENTER / click: start level'],['ENTER / Klick: weiter','ENTER / click: continue'],['ENTER / Klick','ENTER / click'],
 ['STORY-MODUS','STORY MODE'],['WELT LIFESTYLECRAZY','WORLD LIFESTYLECRAZY'],[' Wellen',' waves'],['Instagram-Account','Instagram account'],['Checkpoint: direkt zum Boss','Checkpoint: straight to the boss'],['weiter ab Welle ','continue from wave '],
 ['Die letzte Kiste...','The last case...'],[' geschafft - eure Belohnung:',' cleared - your reward:'],['DER ACCOUNT BLEIBT BEI EUCH!','THE ACCOUNT STAYS WITH YOU!'],['NEUE WAFFE','NEW WEAPON'],
 ['Gewöhnlich','Common'],['Selten','Rare'],['Episch','Epic'],['Legendär','Legendary'],['Im Spiel: Taste ','In game: key '],[' oder Mausrad',' or mouse wheel'],
 ['LIFESTYLECRAZY GERETTET!','LIFESTYLECRAZY SAVED!'],['Slimee Rebel wurde in der Ultimativen Kampf Arena Bonn besiegt.','Slimee Rebel was defeated in the Ultimate Fight Arena Bonn.'],
 ['Spielzeit ','Play time '],['Besiegte Gegner ','Enemies defeated '],['Danke fürs Spielen!','Thanks for playing!'],[' GESCHAFFT!',' CLEARED!'],[' wurde besiegt',' was defeated'],['Gleich: Case Opening','Up next: case opening'],
 ['Keine Leben mehr in Level ','No lives left in level '],['Waffen bleiben','weapons are kept'],
 ['Status: sicher ...oder?','Status: safe ...right?'],['! 3x "Passwort vergessen"','! 3x "forgot password"'],['! Support-Ticket von Slime','! Support ticket from Slime'],['! 5.000 Bot-Meldungen','! 5,000 bot reports'],
 ['! Fake-Account entdeckt','! Fake account spotted'],['! Slime dreht komplett durch','! Slime is losing it'],['Account gesichert','Account secured'],
 ['RINGLABYRINTH','RING MAZE'],['KATHEDRALE','CATHEDRAL'],['ULTIMATIVE KAMPF ARENA BONN','ULTIMATE FIGHT ARENA BONN'],
 // --- wechselnde Menue-Texte ---
 ['verbunden ✔','connected ✔'],[': verbunden',': connected'],[': frei',': open'],['Spieler 1','Player 1'],['Spieler 2','Player 2'],['Spieler 3','Player 3'],['Spieler 4','Player 4'],[': du',': you'],
 ['Taubenkiste','Pigeon Chest'],['Silberkiste','Silver Chest'],['Goldkiste','Gold Chest'],['Alles freigeschaltet','Everything unlocked'],['Öffnen · ','Open · '],['Doppelt: +','Duplicate: +'],[' Coins zurück',' coins back'],['NEU! ','NEW! '],[' Waffen',' weapons'],['Shop-Coins','Shop coins'],['Fortsetzen (Level ','Continue (level '],['Fortsetzen','Continue'],['Spiel ist voll','Game is full'],['Alle Plätze belegt','All slots are taken'],['Fehler: ','Error: '],
 ['Erst auf „Mitspieler einladen“ klicken.','Click "Invite player" first.'],['Bitte den 4-stelligen Raum-Code eingeben','Please enter the 4-letter room code'],
 ['Bibliothek nicht geladen (kein Internet?) - nutze die manuellen Codes','Library not loaded (no internet?) - use the manual codes'],['Verbinde mit Raum ','Connecting to room '],['Verbunden, warte auf Start...','Connected, waiting for start...'],
 ['Verbindungsfehler: ','Connection error: '],['Raum gefunden, aber noch keine Datenverbindung (Firewall/Netz?). Es wird weiter versucht...','Room found, but no data connection yet (firewall/network?). Still trying...'],
 [' nicht gefunden, neuer Versuch...',' not found, trying again...'],[' nicht gefunden. Der Host muss zuerst auf "Host / Solo" geklickt haben und seinen Code sehen. Code und Internet bei beiden prüfen.',' not found. The host has to open Story or Co-op first and see their code. Check the code and both internet connections.'],
 ['Raum ','Room '],['Das Spiel ist pausiert.','The game is paused.'],['Das Spiel läuft weiter, weil Mitspieler verbunden sind.','The game keeps running because other players are connected.'],['Das Spiel läuft weiter. Karte und Schwierigkeit bestimmt der Host.','The game keeps running. The host decides map and difficulty.'],
 ['Minimap: an','Minimap: on'],['Minimap: aus','Minimap: off'],['Ton: an','Sound: on'],['Ton: aus','Sound: off'],['Wirklich beenden? Nochmal klicken','Really quit? Click again'],['Zum Hauptmenü','Back to main menu'],
].sort((a,b)=>b[0].length-a[0].length);
const TRC=new Map();
function trs(s){if(LANG!='en')return s;let r=TRC.get(s);if(r!==undefined)return r;r=s;for(const q of I18N)if(r.indexOf(q[0])>=0)r=r.split(q[0]).join(q[1]);if(TRC.size>4000)TRC.clear();TRC.set(s,r);return r}
// Slimes Dialoge auf Englisch (gleiche Reihenfolge wie DLG in story.js)
const DLG_EN={
 intro:['Yo. It\'s me. Slimee Rebel.',
  'The Insta account LIFESTYLECRAZY is MINE. You have it - and I\'m taking it back.',
  'Guessing the password, fake mails, sending my people after you... I\'ll do whatever it takes.',
  'Six levels, six bosses. And at the very end I\'ll be waiting myself: in the Ultimate Fight Arena Bonn.',
  'You get a pistol. That\'s it. Good luck - you\'re going to need it.'],
 1:['You knocked out Lil M in the arena? Okay. Beginner\'s luck.',
  'While you were busy shooting, I already hit "forgot password" on LIFESTYLECRAZY three times.',
  'The Drachenlord is waiting in the ring maze. {n} waves. Don\'t get lost.'],
 2:['You made it through the ring maze... respect. I get lost in there every time myself.',
  'Whatever. I wrote to Insta support that the account belongs to me. With lots of exclamation marks!!!',
  'Next stop: the bunker. {n} waves. SehrJamal doesn\'t let anyone back out.'],
 3:['You cracked the bunker too?! SehrJamal, you had ONE job!',
  'Doesn\'t matter. I bought 5,000 bots that report LIFESTYLECRAZY around the clock now.',
  'Jermaine is waiting in the cathedral. {n} waves. Start praying.'],
 4:['Jermaine went down in the cathedral... you\'re really starting to annoy me.',
  'I made a fake account now: LIFESTYLECRAZYY with two Ys. Nobody notices. The followers are already coming over.',
  'Come to Präsidentenstraße. Raphael is waiting between the trees. {n} waves - you\'ll never make it.'],
 5:['Raphael?! On Präsidentenstraße?! In front of all the neighbours?!',
  'Fine. Then we do it the hard way. The account is mine. Always has been.',
  'Ultimate Fight Arena Bonn. {n} waves. And then ME. Bring everything you found in those cases.'],
 6:['Okay... okay! I give up. You win.',
  'LIFESTYLECRAZY stays with you. I\'ll delete the bots, the fake account, everything.',
  '...but change the password anyway. Just a tip.',
  'See you around. Slimee Rebel never forgets.']};
// Menue umschalten: data-en-Elemente tauschen, wechselnde Texte (Lobby, Loadout ...) laufend uebersetzen
const DYN=new WeakMap();
function dynTr(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){let r=DYN.get(n);if(!r||n.nodeValue!==r.out)r={de:n.nodeValue};r.out=LANG=='en'?trs(r.de):r.de;DYN.set(n,r);if(n.nodeValue!==r.out)n.nodeValue=r.out}}
function setLang(l){
 LANG=l=='en'?'en':'de';try{localStorage.hfLang=LANG}catch(e){}TRC.clear();document.documentElement.lang=LANG;
 document.querySelectorAll('[data-en]').forEach(e=>{if(e.dataset.de===undefined)e.dataset.de=e.innerHTML;e.innerHTML=LANG=='en'?e.dataset.en:e.dataset.de});
 document.querySelectorAll('[data-en-ph]').forEach(e=>{if(e.dataset.dePh===undefined)e.dataset.dePh=e.placeholder;e.placeholder=LANG=='en'?e.dataset.enPh:e.dataset.dePh});
 document.querySelectorAll('.dyn').forEach(dynTr);
 document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('on',b.dataset.lang==LANG));
}
function langInit(){
 document.querySelectorAll('.dyn').forEach(e=>new MutationObserver(()=>dynTr(e)).observe(e,{childList:true,characterData:true,subtree:true}));
 document.querySelectorAll('[data-lang]').forEach(b=>{b.addEventListener('click',()=>setLang(b.dataset.lang))});
 setLang(LANG);
}
