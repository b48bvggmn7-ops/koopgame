# Monchichi Koop

2D-Koop-Jump'n'Run für zwei Spieler an einem Gerät: ein Affe mit Enterhaken und ein pinkes Schweinchen mit Schirm.

## Spielen
- **Online:** über die GitHub-Pages-Adresse dieses Projekts (Einstellungen → Pages).
- **Lokal:** `index.html` im Browser öffnen.
- **Level-Editor:** `editor/index.html`
- Eigene Levels: im Editor bauen → „Exportieren“ → „Als Datei speichern (fürs Spiel)“ → im Spiel „Level laden (JSON)“.
  Fertige Levels liegen im Ordner `levels/`.

## Steuerung
| | Affe | Schweinchen | Controller |
|---|---|---|---|
| Laufen | A / D | ← / → | Stick / Steuerkreuz |
| Springen / Wandsprung | Leertaste | Num 0 | ✕ |
| Fähigkeit | G = Haken | Num 1 halten = Schirm | □ |
| Seil ranziehen / geben | W / S | – | hoch / runter |
| Hebel betätigen | J | Num 2 | ○ |

R = Neustart · F = Leistungsanzeige · C / X = zum nächsten / vorherigen Checkpoint springen (Test)

## Für die Entwicklung
- `CLAUDE.md` – Regeln und Aufbau (liest Claude Code automatisch)
- `FEATURES.md` – vollständige Funktionsliste
- Tests: `pip install playwright && playwright install chromium`, dann `python tests/run_tests.py`
