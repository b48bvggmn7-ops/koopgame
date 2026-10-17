# UMBAU-STATUS – alle Level an die neuen Fähigkeiten anpassen (Nutzerwunsch nach dem Nacht-Ausbau)

Auftrag (Nutzer): ALLE Level umbauen. Mit dem Dash kommt man viel weiter – Haken/Pilz/Schirm-Stellen, Kamine und
Verfolgungen sind dadurch zu leicht bzw. witzlos. Münzen müssen für ihre Figur erreichbar sein. Der Dash soll auch mal
2–3-mal kurz hintereinander gebraucht werden (darauf achten, dass er wieder voll ist). Verfolgungen sollen Spannung haben.

## Messwerte (echte Physik, tests/reichweiten.json)
- Sprung allein: ~8 Kästchen weit (gleiche Höhe). Sprung + Dash schräg hoch: ~16. Schweinchen Schirm + Dash: ~25.
- Laufen: gemessen ~7 px pro Schritt (MOVE_SPEED 4,4 ist nur der Beschleunigungs-Wert). Verfolger fahren ihr Tempo
  direkt in px/Schritt – vorher 3,6–6,3, also fast alle LANGSAMER als normales Laufen (deshalb keine Spannung).
- Sprung + Dash nach oben: ~8 Reihen hoch (Sprung ~3,4 + Dash 4). Pilz allein: ~6 Reihen, Pilz + Dash: ~11 Reihen.

## Regeln für den Umbau
1. **Hilfs-Stelle** (Haken, Pilz, Aufwind, Kamin, Fahrt): ohne die Hilfe darf man mit Sprung + Schirm + Dash nicht
   ankommen (Dash-Gegenprobe `tests/umbau/dashprobe.py`, Fenster 0). Hilfe + Dash zusammen ist erwünscht (Kombi).
2. **Rollen-Stelle** (früher nur eine Figur): die andere Figur darf es auch mit Dash nicht schaffen.
3. **Münzen:** jede Münze ist für ihre Figur erreichbar und man überlebt es (`tests/umbau/muenzen_erreichbar.py`).
4. **Verfolgungen:** Tempo je Jagd mit dem Bot gesucht (`tests/umbau/jagd_tempo.py`): ohne Dash eingeholt, mit Dash
   (auch zweite Figur 10 Schritte später) geschafft. Test `jagden_<welt>` (Liste JAGDEN_BOT).
5. **Dash-Ketten:** in jeder Welt ab Dschungel 2 Stellen, an denen 2–3 Dashes kurz hintereinander nötig sind.
6. **Neue Mechaniken auf dem Weg:** Durchbruch und Haftfläche als Pflicht-Stellen, nicht nur optional.
7. Alte Tests werden an die neuen Wege angepasst (jede Änderung hier unter „Geänderte Tests“). Großer Lauf grün
   nach jeder Welt, dann `main`.

## Stand je Level
| Level | Hilfs-Stellen dashfest | Abkürzungen (Werkzeug) | Münzen | Jagden (Tempo) | Dash-Ketten | Pflicht neu |
|---|---|---|---|---|---|---|
| dschungel/01-dschungel | ja | geprüft | ja | – | – | Durchbruch 715 (Probe) |
| dschungel/02-baumkronen | ja | geprüft | ja | 7,8 / 6,6 | – | Durchbruch 172 |
| dschungel/03-lianenschlucht | ja | geprüft | ja | – | – | Haft + Durchbruch (Nacht) |
| dschungel/04-gluehwald | ja | geprüft | ja | – | – | Haftdecke (Nacht) |
| dschungel/05-dornenpfad | ja | geprüft | ja | 5,6 / 5,8 / 7,4 | – | Durchbruch 298 |
| dschungel/06-wipfelsturm | ja | geprüft | ja | 8,4 / 8,0 / 6,6 | Tunnel + Doppel-Jagd | Durchbruch 381 |
| ruinen/01-ruinen | Kamin 522 höher | offen | Stein-Münzen behoben | 7,4 / 7,2 | – | Durchbruch 296 |
| ruinen/03-fallengang | Kamin 579 höher | offen | offen | – | – | offen |
| ruinen/04-sonnentempel | Kamine höher | offen | offen | – | Tunnel (3 Gruben) | Durchbruch 331 |
| ruinen/02-mondnacht | Kamin 89 höher | offen | offen | Doppel-Wand offen | – | offen |
| ruinen/05-felsenflucht | Kamin 580 höher | offen | Stein-Münze behoben | Felsen 5,5–14 | – | Durchbruch 532 |
| ruinen/06-tempelherz | – | offen | offen | Felsen 7–14 | – | offen |
| hoehle/02-tropfsteingang | Pilz-Dash | offen | offen | – | Tunnel (3 Gruben) | Durchbruch 585 |
| hoehle/03-eisgrotte | Pilz-Dash | offen | offen | – | – | offen |
| hoehle/01-kristallhoehle | Pilz-Dash | offen | offen | – | – | Durchbruch 115 |
| hoehle/04-leuchtgrotte | Kamine höher | offen | offen | – | – | offen |
| hoehle/05-foerderwerk | Kamine höher | offen | offen | – | – | Durchbruch 392 |
| hoehle/06-tiefenschlund | Pilz-Dash | offen | offen | – | – | offen |
| vulkan/01-glutpfad | Lava-Kamine höher | offen | offen | Lava 5 Stellen schneller | – | offen |
| vulkan/02-aschefeld | Lava-Kamin höher | offen | offen | – | – | Durchbruch 790 |
| vulkan/03-feuerberg | Pilz-Dash | offen | offen | Wand 4,5 (Grenze) | – | offen |
| vulkan/04-magmakammer | Pilz-Dash | offen | offen | Lava 5 Stellen schneller | – | offen |
| vulkan/05-schlackewerk | Pilz-Dash | offen | offen | – | Tunnel | Durchbruch 194 |
| vulkan/06-feuerschlund | Pilz-Dash | offen | offen | Lava 2 Stellen schneller | – | Durchbruch 589 |
| vulkan/07-kraterherz | Pilz-Dash | offen | offen | Lava 2 Stellen schneller | Tunnel (3 Gruben) | offen |

„offen“ = noch nicht mit dem Werkzeug durchgeprüft (Abkürzungen: `tests/umbau/abkuerzungen.py`, ~20 min je Level;
Münzen: `tests/umbau/muenzen_erreichbar.py`). Pilz-Gruben sind überall schon Pilz-Dash-Gruben.

## Rezepte
- **Pilz-Grube -> Pilz-Dash-Grube:** Landeplatz 9 Reihen über der Pilz-Fläche (Sprung+Dash ~8 reicht nicht, Pilz allein ~6
  nicht, Pilz+Dash ~11 schon). Werkzeug `tests/umbau/pilzgruben.py`, Plan `kombi_pilz_dash_grube` (Dash am höchsten Punkt).
  Achtung: liegt daneben eine höhere Absprungkante, muss der Landeplatz entsprechend höher (Glühwald 668).

- **Breite Haken-Grube:** Grube >= 17 breit (Sprung + Dash ~16), Haken etwa in der Mitte. Affe: Haken (bei kurzem
  Anlauf Haken + Dash am höchsten Punkt), Schweinchen: Schirm + Dash (Schirm ERST NACH dem Dash öffnen – sonst kürzer).
- **Kamin-Grube -> Kamin + breite Grube:** Landeplatz >= 17 Spalten hinter der Kaminkante, Haken dazwischen.
- Achtung Bot-Tests: die zweite Figur muss in der Nähe stehen (sonst hält der Bildrand die erste Figur fest).

- **Flammen-/Kamin-/Lava-Kamin-Gruben** (Baustein kombi_flammen_kamin): beide Kaminwände, Landeplatz (samt Versteck,
  Haft-Arm, Münzen), Haken und Flamme über der Grube 3 Reihen höher (`tests/umbau/kamine_heben.py`). Danach reicht
  Sprung + Dash hoch + Schirm nicht mehr, um den Kamin zu überspringen. Plan: `kombi_flammen_kamin(..., hoch=3)`.

## Prüfwerkzeug-Korrektur
- Dash-Gegenprobe und stelle_pruefen kannten beim Schweinchen nur „Schirm ab Absprung“. Weiter kommt man mit
  „Sprung, Dash, DANN Schirm“ (Variante `'nach'`). Alle Gegenproben werden damit neu gerechnet.

## Erledigt (Einzelstellen)
- Dschungel 1: Haken-Gruben am Anfang (Inseln 76–78/88–89) -> zwei breite Gruben 65–83 und 87–104 mit Pilz-Insel 84–86
  (Haken 73 und 95). Kamin-Grube vor dem Ziel: Landeblock 762–770 -> 769–776, Pilz 769 -> 770 (vor dem Pilz-Dash-Turm).
- Dschungel 1: Pilz-Grube 233 -> Pilz-Dash-Grube; Pilz-Grube vor dem Ziel -> Pilz-Dash-Turm (Pilz auf dem Block, Sims oben).
- Dschungel 2: 7 Pilz-Gruben -> Pilz-Dash-Gruben; Jagd über die Bröckel-Brücken 4,5 -> 7,8 (Dash für den Pilz aufheben).
  Hebel-Staffel unter Jagd (Hebel 8–11): 4,5 -> 6,6 (Bot-Plan `_d2_staffel`: oben Kamin bzw. mit Dash senkrecht über die
  Wand 331, unten wartet das Schweinchen am Tor – ohne Dash eingeholt).
- Dschungel 3: 8 Pilz-Stachelgruben -> Pilz-Dash. Dschungel 4: 4 Pilz-Gruben -> Pilz-Dash, die Pilz-Grube 681 entfällt.
- Dornenpfad: Jagden 4,6/5,0/5,2 -> 5,6/5,8/7,4 (Finale: Hebel 2 Spalten nach vorn, sonst stand man zu nah an der Wand).
- Wipfelsturm: 3 Pilz-Stachelgruben -> Pilz-Dash; Jagden 4,8/4,4/5,4 -> 8,4/8,0/6,6; Doppel-Jagd = Dash-Kette.
- Höhle/Vulkan: alle Pilz-Gruben -> Pilz-Dash (je Level per Bot geprüft).
- Computer-Partner: konnte im Partner-Modus gar nicht dashen (Taste fehlte) – behoben; flieht jetzt mit Dash.
- Lianenschlucht: 3 pinke Münzen (103/106/110) lagen so, dass das Schweinchen sie nur im Sturz in die Stacheln bekam –
  jetzt auf der Gleit-Bahn von der Brücke (104/5, 108/5, 112/6), per Bot geprüft.

- Dornenpfad Seilbahn/Fähre: Grube 251–268 -> 251–271, Landesims 272–276 vier Reihen höher, Hebel 5 bei 273, Haken fährt
  17, Fähre 18 Spalten schräg 5 Reihen hoch (endet über dem Sims, weil sie sofort umkehrt). Schweinchen mit Schirm + Dash
  ohne Fähre: vorher Fenster 24, jetzt 7 Schritte (Profi-Trick, bewusst gelassen). Bild-Regel-Ausnahmen begründet.
- Glühwald 287→306: Schweinchen-Rolle (Schirm) bleibt; Affe nur Fenster 2 (bewusst gelassen).

- Wipfelsturm: Dash-Tunnel vor dem Ziel (Decke 3 Reihen über dem Boden, Stachelgruben 769–778 und 782–791, Podest
  779–781): zweimal Dash, auf dem Podest warten, bis er wieder voll ist (Test dash_ketten_dschungel: sofort weiter -> tot).
- Pflicht-Durchbruch (Regel 6) auf dem Hauptweg: Baumkronen 172, Dornenpfad 298, Wipfelsturm 381 (nacht_stellen_dschungel).
- Computer-Partner: dasht durch Durchbruch-Wände (`partnerBruchVorn`, Konstante PARTNER_BRUCH_NAH), Test partner_gefahren.

- Baumkronen fahrender Haken 13: Hebel-Block 647–651 jetzt 6 Reihen hoch (Oberkante Reihe 9), Hebel 13 oben bei 647,
  Aufwind 639–640 in der Grube (nur das segelnde Schweinchen steigt). Affe kommt mit Sprung + Dash nicht mehr hinüber,
  sondern fährt am Haken (Sprung + Dash hoch zum Haken, Seil kurz ziehen). Test umbau_rollen_dschungel.
- Bewusst gelassen (geprüft): D1 Lift 134 (Komfort-Lift, kein Partner nötig), D2 791→807 (hinter dem Ziel),
  D1 68→82 / 206→220 (Affe erreicht nur pinke Münzen bzw. eine Tür, die er selbst nicht öffnen kann).

- Wipfelsturm: Baumstamm 186 (Wand bis oben, unten Durchgang) zwischen Pilz-Turm 180–183 und Turm 200–203 – keine
  Abkürzung Turm zu Turm mehr (vorher Affe Fenster 8, Schweinchen 24). Wechsel-Schleuse: Grube 492–505 -> 492–508,
  Brücke (Wechselboden B, Platte 7) entsprechend länger, Hebel 8 bei 510 (vorher Affe allein Fenster 14).
  Gang-Grube 628–636 bewusst gelassen: oben/unten sind dort gleichwertige Rollen, beide Hebel bleiben nötig.
- Bewusst gelassen: Wipfelsturm 58→75 (Brücke Platte 2): Schweinchen schafft es mit Schirm + Dash ohne Brücke
  (Fenster 24) – die Grube müsste dafür 25 breit sein; Hebel 3 bleibt Aufgabe des Schweinchens.

- Lianenschlucht Ende: letzte Haken-Schlucht 714–726 -> 712–731 (dritter Haken 729): Affe nur mit Haken, Schweinchen
  mit Schirm (+ Dash). Baumstämme 757 und 777 zwischen den Pilz-Dash-Türmen (vorher Turm zu Turm mit Dash, Fenster 8/10).
- Bewusst gelassen: Lianenschlucht 626/650 (oben/unten-Staffel: der Affe oben blockiert sich selbst, das Schweinchen
  kann unten keine Haken) und 172→190 (Affe Fenster 3).

- Münzen Dschungel 1: 6 Münzen auf die neuen Bahnen gelegt (Kamin-Grube: pink 758/-1, 764/1 auf der Schirm-Bahn, blau
  758/7 am Haken-Schwung; 779/-1 auf dem Turm, 576/5 Dornengrube) – per Bot eingesammelt. Glühwald: 2 blaue Münzen über
  der Grube 247–261 an den Rand (247/14, 262/13). Baumkronen 269–274: Werkzeug irrt (fahrender Haken / Segeln sammelt
  alle pinken ein, per Bot geprüft). `muenzen_erreichbar.py --nur c,r;c,r` prüft einzelne Münzen.

- Kamine angehoben (Dash-Gegenprobe vorher Schweinchen Fenster 7): Ruinen 1 (522), Sonnentempel (168/303/584),
  Mondnacht (89), Fallengang (579), Felsenflucht (580), Leuchtgrotte (180/568/760), Förderwerk (366/546), Glutpfad
  (346/370/546/570/768), Aschefeld (352).
- Vulkan 4/7: zwei Münz-Verstecke lagen seit dem Pilz-Dash-Umbau begraben – wieder an die Oberkante (203/7, 333/7).
- Münzen Lianenschlucht (487–501, 256–262) und Wipfelsturm (780) auf die echten Bahnen gelegt (per Bot eingesammelt).

- Ruinen 1: Stachelwände 3,6 -> 7,4 (Hebel 13/14, durch die Tore) und 3,8 -> 7,2 (Hebel 19, über das Pendel).
- Felsenflucht: Fels „erste Flucht“ 3,6 -> 10, „Flucht nach oben“ 5,4 -> 14, „Teleporter-Flucht“ 4,4 -> 14 (der Fels beschleunigt erst und startet nach
  ½ s Wackeln, deshalb brauchen Felsen deutlich mehr Tempo als Wände). Timing-Fluchten so schnell, wie das Warten an den
  Fallen erlaubt, mit einer halben Stufe Puffer unter der Bot-Grenze (Menschen warten länger): Pfeil-Flucht 3,6 -> 6,
  Flammen-Welle 3,6 -> 6,5, Takt-Steine 3,6 -> 5,5 (darüber wird man beim Warten überrollt). Wechsel-Schleuse und Finale 4,4 -> 14 (der Fels endet dort in einer Grube und schiebt nur an).
  Bleibt: Schleuse (Hebel 6, Fels zerschellt an der Tür – Rätsel unter Druck) und Felsbrecher-Licht (Hebel 40, Rätsel).
- Tempelherz: Flucht durch die Tore 5,4 -> 14 (nur mit Dash), Wechsel-Flucht, Fels und Licht-Tor, letzte Felsflucht -> 14
  (Felsen enden in Gruben/an Toren und schieben an); Timing-Fluchten (Pfeilregen, Takt-Steine, Flammen-Welle) 3,8 -> 7
  (Bot-Grenze 8). Tests: JAGDEN_BOT-Einträge für alle Felsen, JAGDEN_TAKT = Fluchten, bei denen nur „mit Dash geschafft“
  geprüft wird.
- Feuerberg: Stachelwand bleibt 4,5 (Pilz-Strecke – man fliegt fast senkrecht; mit Dash schafft der Bot nicht mehr), neuer
  Bot-Plan + Test jagden_vulkan.
- Steigende Lava eine Stufe schneller, wo die Level-Tests es zulassen: Glutpfad 262/310/425/470 -> schnell, 676 -> mittel;
  Magmakammer 93/330/420/475/706 -> schnell; Feuerschlund 143/479 -> schnell; Kraterherz 70/671 -> schnell, 235 -> mittel.
  Unverändert (dort holt die schnellere Lava die zweite Figur ein): Glutpfad 218/505/630, Magmakammer 226/283/616,
  Feuerschlund 612/617, Kraterherz 356/420/442/470.
- Dash-Ketten (Regel 5): Dash-Tunnel (Werkzeug tests/umbau/dash_tunnel.py) in Sonnentempel 738–777 (3 Gruben),
  Tropfsteingang 746–785 (3 Gruben), Schlackewerk 757–781 und Kraterherz 744–780 (3 Gruben; Gruben dort 9 breit – bei
  10 landete man mit Anlauf knapp zu kurz). Ruinen und Höhle haben nur je eine Kette: alle anderen flachen Strecken liegen
  in Rätseln (Sonnentempel 370 = „Tunnel mit Licht“, Teleporter/Dunkelzone in der Leuchtgrotte, Band-Rätsel im
  Förderwerk, Zwei-Wege-Gänge in Fallengang/Eisgrotte/Tropfsteingang). Tempelherz 581–603 verworfen (Gruben dort nur 8
  breit möglich – das Schweinchen segelt ohne Dash drüber).
- Geänderte Tests: level10_sonnentempel „bis zum Ziel“, level12_tropfsteingang „E4 Ziel“, level20_schlackewerk „E4 Finale“
  laufen durch den Dash-Tunnel (dash_kette).
- Pflicht-Durchbruch (Regel 6) auch in Ruinen/Höhle/Vulkan: Säulen (unten Durchbruch, darüber Wand bis oben) in
  Ruinen 1 (296), Sonnentempel (331), Felsenflucht (532), Kristallhöhle (115), Tropfsteingang (585), Förderwerk (392),
  Aschefeld (790), Schlackewerk (194), Feuerschlund (589) – nur auf flachen Wegstücken ohne Bot-Test, Elemente und
  Rätsel (Glutpfad 788 verworfen: dort entstand ein 1 breiter Kamin; Sonnentempel 327 -> 331 wegen Haft-Arm).
  Tests nacht_stellen_<welt>. Kristallhöhle zählt dadurch eine Kombi-Stelle mehr (Ausnahme „Kombi-Etappe 0“ entfällt).
- Offen: Mondnacht Doppel-Wand (Hebel 5) – Bot-Plan für die Haken-Kette unter zwei Wänden fehlt noch, Tempo unverändert.

## Geänderte Tests
- KOMBI_STELLEN_BOT: alle Pilz-Gruben -> Pilz-Dash-Gruben (neuer Plan, Ziel-Reihe = neuer Landeplatz); Glühwald 681 entfernt.
- dschungel5_dornenpfad, dschungel6_wipfelsturm: die Jagd-Abschnitte nutzen die JAGDEN_BOT-Pläne mit Dash; statt „1 s
  gezögert -> eingeholt“ wird jetzt „ohne Dash -> eingeholt“ geprüft.
- level8_gluehwald: Start des Schweinchens für die Doppel-Gang-Staffel auf den neuen (höheren) Landeplatz.
- dschungel5_dornenpfad Seilbahn: Affe lässt am Ende los und dasht schräg hoch auf den Sims; neue Gegenprobe „Schweinchen
  mit Schirm + Dash ohne Fähre -> tot“.
- KOMBI_STELLEN_BOT Dschungel 1: „Pilz in der Hakengrube (88)“ -> zwei Stellen (73: Haken / Schirm + Dash, 95: Haken + Dash /
  Pilz + Dash); „Kamin-Grube vor dem Ziel“ -> eigener Plan `_d1_kamin_grube`; Pilz-Dash-Turm startet am Pilz 770.
- dschungel6_wipfelsturm „E4 Ziel“: führt jetzt durch den Dash-Tunnel (dash_kette).
- level7_lianenschlucht „letzte Schlucht“: Landung ab 732, Affe drei Haken, Schweinchen auch mit Dash + Schirm.
- KOMBI_ABKUERZUNG: neue Turmhöhen (Reihe -1 bzw. 6) und zusätzlich Dash-Varianten (m_dash/f_dash) – keine Abkürzung.
- KOMBI_STELLEN_BOT: Flammen-/Kamin-/Lava-Kamine mit hoch=3 und Ziel-Reihe 3 höher; Verstecke/Haft-Arme in
  tests/bausteine/stellen.py an die neuen Höhen.
- level11_felsenflucht: erste Flucht und Flucht nach oben laufen jetzt mit Dash (Pläne _r5_e1a/_r5_e1c aus JAGDEN_BOT).
- Neu: jagden_ruinen, jagden_vulkan, dash_ketten_ruinen/hoehle/vulkan (die andere Figur folgt mit dem Warten-Plan).
- partner_koop_dschungel: mein Bot-Teil flieht mit Dash, steht beim Umlegen von Hebel 14 an dessen neuer Stelle.
