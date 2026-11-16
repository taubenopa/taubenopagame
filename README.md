# TAUBENGAME

Koop-Shooter (Raycaster) für den Browser. Koop und Deathmatch sind wie vorher, dazu der **Story-Modus für 1 bis 4 Spieler**.

## Starten

- **Lokal:** `index.html` doppelklicken. Fertig.
- **Online:** Den kompletten Ordner bei einem beliebigen Hoster für statische Seiten hochladen
  (z. B. GitHub Pages, Netlify oder itch.io als HTML5-Spiel). Es gibt keinen Server-Teil –
  nur Dateien. Wichtig ist, dass `index.html` im Hauptordner liegt und die Ordner `js`, `css`
  und `assets` daneben.
- **Zusammen (bis zu 4):** Einer klickt auf „Story-Modus“, wählt seinen Charakter und schickt den
  4-stelligen Raum-Code. Die anderen klicken auf „Beitreten“, wählen ihren Charakter und geben
  den Code ein. Alle brauchen Internet (die Verbindung läuft direkt zwischen euch über PeerJS).

## Story-Modus

| Level | Karte | Wellen | Boss | Song |
|---|---|---|---|---|
| 1 | Arena | 3 | Lil M | Fühle mich wie Chief Keef 2012 |
| 2 | Ringlabyrinth | 6 | Drachenlord | Skrrr Skrrr |
| 3 | Bunker | 9 | SehrJamal | 17 |
| 4 | Kathedrale | 12 | Jermaine | Cracker |
| 5 | Präsidentenstraße | 15 | Raphael | ballack |
| 6 | Ultimative Kampf Arena Bonn | 18 | Slimee Rebel | fur.jacket.swag.for.real |

- Start nur mit Faust und Pistole. Nach jedem Level: Case Opening (neue Waffe für beide), danach meldet sich Slime.
- 5 gemeinsame Leben pro Level (ab dem 3. Spieler eins mehr pro Spieler), Münzen sammeln: 50 Münzen = 1 Extraleben.
- Checkpoint alle 3 Wellen und direkt vor dem Boss. Bei Game Over geht es am Checkpoint weiter, die Waffen bleiben.
- Der Fortschritt wird im Browser des Hosts gespeichert („Fortsetzen“).
- `Enter`, `Leertaste` oder Klick: Dialoge und Bildschirme weiter.

## Steuerung

- Tastatur/Maus: `WASD` laufen, Maus umsehen, Klick schießen, Rechtsklick zielen (über Kimme und Korn, Sniper/Railgun mit Zielfernrohr), `Q` Ulti, `Leertaste` springen, `Shift` rennen, `1`–`9` oder Mausrad Waffe wechseln, `Esc` Spielmenü.
- Controller: linker Stick laufen, rechter Stick zielen, `RT` schießen, `X` Ulti, `A` springen, `LT` zielen, linken Stick drücken rennen, `RB`/`LB` Waffe, `Start` Spielmenü. In Menüs: Steuerkreuz, `A` auswählen, `B` zurück.
- Wer springt, weicht Geschossen am Boden aus (Bomben treffen trotzdem).
- Präsidentenstraße und Ultimative Kampf Arena Bonn haben Sprungfelder (blau leuchtend, auch auf der Minimap): drauflaufen, und du fliegst hoch und ein Stück in Blickrichtung. Positionen stehen bei der Karte in `js/game.js` unter `jp`.

## Case-Shop (Koop und Deathmatch)

Es gibt kein Loadout mehr. In Koop und Deathmatch hast du alle Waffen dabei, die du freigeschaltet hast. Am Anfang sind das Faust und Pistole, dazu bekommst du 50 Start-Coins.

- **Coins verdienen:** in Koop und Story, 1 Coin pro 10 Punkte (normaler Kill = 1, Boss = 50). Im Deathmatch gibt es keine.
- **Kisten:**

| Kiste | Preis | Gewöhnlich | Selten | Episch | Legendär | ULTRA |
|---|---|---|---|---|---|---|
| Taubenkiste | 40 | 70 % | 25 % | 5 % | – | – |
| Silberkiste | 100 | 20 % | 45 % | 28 % | 7 % | – |
| Goldkiste | 220 | – | 15 % | 45 % | 32 % | 8 % |

- **Doppelte:** nur, wenn du alles aus der gezogenen Seltenheit schon hast; dann gibt es die Hälfte des Preises zurück. Eine Kiste, die nichts Neues mehr geben kann, wird gesperrt.
- Coins und Waffen werden im Browser gespeichert. Preise und Chancen stehen oben in `js/shop.js` (`CHESTS`).
- Im Story-Modus bleibt alles wie vorher (Start mit Pistole, Case Opening nach jedem Level).

## Waffen halten und zielen

Die Waffe ist ein echtes 3D-Modell wie in Call of Duty: schräg von hinten rechts, mit zwei Armen (rechts am Griff, links am Vordergriff). Die Modelle stehen in `js/vm.js`. Mit Rechtsklick (Controller: `LT`) zielst du: Die Waffe kommt in die Bildmitte, das Bild zoomt leicht, du läufst langsamer und die Schüsse streuen viel weniger. Sniper und Railgun haben ein Zielfernrohr mit stärkerem Zoom. Wie stark das Zielen die Streuung senkt, steht pro Waffe in `WP` (`js/game.js`) als `ads`.

Neue Waffen: Sturmgewehr (AK, präzise beim Zielen), Maschinenpistole (UZI, sehr schnell), Armbrust (Bolzen durchschlägt Gegner), Minigun (muss erst anlaufen). Im Story-Modus kommen sie über das Case Opening.

## Charaktere und Ultis

Der Charakter lässt sich in allen Modi wählen. Jeder hat eine eigene Ulti (`Q` oder Controller `X`) mit eigener Mechanik:

| Charakter | Ulti | Abklingzeit | Was sie macht |
|---|---|---|---|
| taubenopa | Taubenwächter | 20 s | 5 Tauben kreisen 8 s um dich, picken Gegner und fangen feindliche Geschosse ab |
| EuroJunkie | Jackpot | 22 s | 7 s doppelter Schaden und 60 % schnelleres Feuer |
| Jxhn2k | Schattensprung | 10 s | Teleport bis 7 Felder nach vorn, Schaden an allem auf dem Weg, kurz unverwundbar |
| YoungCola | Cola-Pfütze | 18 s | klebrige Pfütze: Gegner verlangsamt, nehmen Schaden, am Ende Explosion |
| werwlf | Wolfsrausch | 22 s | Heulen schleudert Gegner weg, dann 8 s schneller und Treffer heilen dich |
| Adam | Steinhagel | 16 s | 14 Steine regnen auf die Stelle, auf die du zielst |
| Kerimsi | Dog-Tag-Bumerang | 9 s | 3 Dog Tags fliegen raus und zurück, treffen jeden Gegner zweimal |
| Sh1no | Bestechung | 20 s | getroffene Gegner kämpfen 8 s für dich und hauen dann ab (Bosse nehmen nur Schaden) |
| saesix | Moshpit | 18 s | betäubt alle Gegner im Umkreis 3 s, löscht feindliche Geschosse |
| Joshie | Laser-Blick | 16 s | 3 s Dauerstrahl, der deinem Blick folgt |
| Muro | Burger-Salve | 15 s | 3 Burger im Fächer, die beim Aufprall explodieren |
| souf | Herzschlag | 25 s | heilt das Team, holt Gefallene sofort zurück (im Story-Modus ohne Leben zu kosten), stößt Gegner weg |

## Sprache

Deutsch und Englisch, umschaltbar im Hauptmenü, in den Einstellungen und im Spielmenü. Die englischen Texte stehen in `js/lang.js`.

## Koop

Alle 5 Wellen kommt ein Boss, der Reihe nach: Lil M, Drachenlord, SehrJamal, Jermaine, Raphael, Jxhn2K, Slimee Rebel. Danach beginnt die Runde von vorn, nur stärker.

## Aufbau

```
index.html            Menü
css/style.css         Aussehen des Menüs
js/game.js            Engine: Karten, Waffen, Gegner, Netzwerk, Grafik
js/fx.js              Waffensounds, Waffen-Symbole, Geschosse, Explosionen
js/vm.js              Waffe in der Ego-Ansicht (3D-Modelle, Arme, Zielen)
js/story.js           Story-Modus: Level, Bosse, Wellen, Case Opening, Slimes Texte
js/menu.js            Menü, Spielmenü (Esc), Feuer-Logo, Kamerafahrt im Hintergrund
js/ult.js             Ultis der Charaktere
js/shop.js            Case-Shop und Coins
js/lang.js            Englische Übersetzung
js/peerjs.min.js      Netzwerk-Bibliothek (liegt lokal bei, kein CDN nötig)
assets/sprites/*.png  Charaktere, Gegner, Bosse
assets/music/*.mp3    ein Song pro Level
assets/sfx/*.wav      ein Sound pro Waffe (Datei ersetzen = Sound ersetzen)
```

## Schnell anpassen (alles oben in `js/story.js`)

- `LEVELS` – Karte, Name und Song pro Level
- `WAVES_PER_LEVEL` – 3 bedeutet 3/6/9/12/15/18 Wellen, 5 wäre 5/10/15/20/25/30
- `BOSS` – Leben, Tempo und Angriffe der Bosse
- `CASEP` – welche Waffen nach welchem Level in der Kiste sein können
- `DLG` – Slimes Sprüche
- `pt` / `rt` bei den Bossen – womit sie schießen (Feuer, Becher, Messer, Musiknoten, Giftschädel, Kugelblitz ...)
- Lautstärke einzelner Waffen: `SFXV` oben in `js/fx.js`
- `CHARS` (story.js) – Charaktere, Name und Abklingzeit der Ulti; Wirkung und Beschreibung in `js/ult.js`
