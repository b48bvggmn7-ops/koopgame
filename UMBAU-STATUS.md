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
| Level | Kombi-Stellen dashfest | Abkürzungen | Münzen | Jagden | Dash-Ketten | Pflicht neu | Tests |
|---|---|---|---|---|---|---|---|
| dschungel/01-dschungel | offen | offen | offen | offen | offen | offen | offen |
| dschungel/02-baumkronen | offen | offen | offen | offen | offen | offen | offen |
| dschungel/03-lianenschlucht | offen | offen | offen | offen | offen | offen | offen |
| dschungel/04-gluehwald | offen | offen | offen | offen | offen | offen | offen |
| dschungel/05-dornenpfad | offen | offen | offen | offen | offen | offen | offen |
| dschungel/06-wipfelsturm | offen | offen | offen | offen | offen | offen | offen |
| ruinen/01-ruinen | offen | offen | offen | offen | offen | offen | offen |
| ruinen/03-fallengang | offen | offen | offen | offen | offen | offen | offen |
| ruinen/04-sonnentempel | offen | offen | offen | offen | offen | offen | offen |
| ruinen/02-mondnacht | offen | offen | offen | offen | offen | offen | offen |
| ruinen/05-felsenflucht | offen | offen | offen | offen | offen | offen | offen |
| ruinen/06-tempelherz | offen | offen | offen | offen | offen | offen | offen |
| hoehle/02-tropfsteingang | offen | offen | offen | offen | offen | offen | offen |
| hoehle/03-eisgrotte | offen | offen | offen | offen | offen | offen | offen |
| hoehle/01-kristallhoehle | offen | offen | offen | offen | offen | offen | offen |
| hoehle/04-leuchtgrotte | offen | offen | offen | offen | offen | offen | offen |
| hoehle/05-foerderwerk | offen | offen | offen | offen | offen | offen | offen |
| hoehle/06-tiefenschlund | offen | offen | offen | offen | offen | offen | offen |
| vulkan/01-glutpfad | offen | offen | offen | offen | offen | offen | offen |
| vulkan/02-aschefeld | offen | offen | offen | offen | offen | offen | offen |
| vulkan/03-feuerberg | offen | offen | offen | offen | offen | offen | offen |
| vulkan/04-magmakammer | offen | offen | offen | offen | offen | offen | offen |
| vulkan/05-schlackewerk | offen | offen | offen | offen | offen | offen | offen |
| vulkan/06-feuerschlund | offen | offen | offen | offen | offen | offen | offen |
| vulkan/07-kraterherz | offen | offen | offen | offen | offen | offen | offen |

## Rezepte
- **Pilz-Grube -> Pilz-Dash-Grube:** Landeplatz 9 Reihen über der Pilz-Fläche (Sprung+Dash ~8 reicht nicht, Pilz allein ~6
  nicht, Pilz+Dash ~11 schon). Werkzeug `tests/umbau/pilzgruben.py`, Plan `kombi_pilz_dash_grube` (Dash am höchsten Punkt).
  Achtung: liegt daneben eine höhere Absprungkante, muss der Landeplatz entsprechend höher (Glühwald 668).

- **Breite Haken-Grube:** Grube >= 17 breit (Sprung + Dash ~16), Haken etwa in der Mitte. Affe: Haken (bei kurzem
  Anlauf Haken + Dash am höchsten Punkt), Schweinchen: Schirm + Dash (Schirm ERST NACH dem Dash öffnen – sonst kürzer).
- **Kamin-Grube -> Kamin + breite Grube:** Landeplatz >= 17 Spalten hinter der Kaminkante, Haken dazwischen.
- Achtung Bot-Tests: die zweite Figur muss in der Nähe stehen (sonst hält der Bildrand die erste Figur fest).

## Prüfwerkzeug-Korrektur
- Dash-Gegenprobe und stelle_pruefen kannten beim Schweinchen nur „Schirm ab Absprung“. Weiter kommt man mit
  „Sprung, Dash, DANN Schirm“ (Variante `'nach'`). Alle Gegenproben werden damit neu gerechnet.

## Erledigt (Einzelstellen)
- Dschungel 1: Haken-Gruben am Anfang (Inseln 76–78/88–89) -> zwei breite Gruben 65–83 und 87–104 mit Pilz-Insel 84–86
  (Haken 73 und 95). Kamin-Grube vor dem Ziel: Landeblock 762–770 -> 769–776, Pilz 769 -> 770 (vor dem Pilz-Dash-Turm).
- Dschungel 1: Pilz-Grube 233 -> Pilz-Dash-Grube; Pilz-Grube vor dem Ziel -> Pilz-Dash-Turm (Pilz auf dem Block, Sims oben).
- Dschungel 2: 7 Pilz-Gruben -> Pilz-Dash-Gruben; Jagd über die Bröckel-Brücken 4,5 -> 7,8 (Dash für den Pilz aufheben).
  Die Hebel-Staffel unter Jagd (Hebel 8–11) bleibt 4,5 – Ablauf noch nicht als Bot-Plan verstanden (offen).
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

## Geänderte Tests
- KOMBI_STELLEN_BOT: alle Pilz-Gruben -> Pilz-Dash-Gruben (neuer Plan, Ziel-Reihe = neuer Landeplatz); Glühwald 681 entfernt.
- dschungel5_dornenpfad, dschungel6_wipfelsturm: die Jagd-Abschnitte nutzen die JAGDEN_BOT-Pläne mit Dash; statt „1 s
  gezögert -> eingeholt“ wird jetzt „ohne Dash -> eingeholt“ geprüft.
- level8_gluehwald: Start des Schweinchens für die Doppel-Gang-Staffel auf den neuen (höheren) Landeplatz.
- dschungel5_dornenpfad Seilbahn: Affe lässt am Ende los und dasht schräg hoch auf den Sims; neue Gegenprobe „Schweinchen
  mit Schirm + Dash ohne Fähre -> tot“.
- KOMBI_STELLEN_BOT Dschungel 1: „Pilz in der Hakengrube (88)“ -> zwei Stellen (73: Haken / Schirm + Dash, 95: Haken + Dash /
  Pilz + Dash); „Kamin-Grube vor dem Ziel“ -> eigener Plan `_d1_kamin_grube`; Pilz-Dash-Turm startet am Pilz 770.
- partner_koop_dschungel: mein Bot-Teil flieht mit Dash, steht beim Umlegen von Hebel 14 an dessen neuer Stelle.
