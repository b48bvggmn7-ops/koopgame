# UMBAU-STATUS – alle Level an die neuen Fähigkeiten anpassen (Nutzerwunsch nach dem Nacht-Ausbau)

Auftrag (Nutzer): ALLE Level umbauen. Mit dem Dash kommt man viel weiter – Haken/Pilz/Schirm-Stellen, Kamine und
Verfolgungen sind dadurch zu leicht bzw. witzlos. Münzen müssen für ihre Figur erreichbar sein. Der Dash soll auch mal
2–3-mal kurz hintereinander gebraucht werden (darauf achten, dass er wieder voll ist). Verfolgungen sollen Spannung haben.

## Messwerte (echte Physik, tests/reichweiten.json)
- Sprung allein: ~8 Kästchen weit (gleiche Höhe). Sprung + Dash schräg hoch: ~16. Schweinchen Schirm + Dash: ~25.
- Laufen 4,4 px/Schritt. Mit Dash, sobald er voll ist (10 Schritte à 16 px + 54 Schritte Aufladen): im Schnitt ~6,2.
- Verfolgungen vorher: Stachelwände 3,6–6,3, Felsen 3,6–5,4 – meist 82–105 % vom Laufen (zu langsam).

## Regeln für den Umbau
1. **Hilfs-Stelle** (Haken, Pilz, Aufwind, Kamin, Fahrt): ohne die Hilfe darf man mit Sprung + Schirm + Dash nicht
   ankommen (Dash-Gegenprobe `tests/umbau/dashprobe.py`, Fenster 0). Hilfe + Dash zusammen ist erwünscht (Kombi).
2. **Rollen-Stelle** (früher nur eine Figur): die andere Figur darf es auch mit Dash nicht schaffen.
3. **Münzen:** jede Münze ist für ihre Figur erreichbar und man überlebt es (`tests/umbau/muenzen_erreichbar.py`).
4. **Verfolgungen:** Tempo mindestens 5,2 (schneller als Laufen) – entkommen nur, wenn man den Dash immer wieder
   einsetzt, sobald er voll ist. Jede Jagd per Bot mit Dash geschafft, ohne Dash eingeholt.
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

## Erledigt (Einzelstellen)
- Lianenschlucht: 3 pinke Münzen (103/106/110) lagen so, dass das Schweinchen sie nur im Sturz in die Stacheln bekam –
  jetzt auf der Gleit-Bahn von der Brücke (104/5, 108/5, 112/6), per Bot geprüft.

## Geänderte Tests
(noch keine)
