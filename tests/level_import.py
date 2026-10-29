# Level aus dem Spiel-Format (z. B. „Herunterladen“ im Editor) ins Projekt übernehmen – in BEIDE Formate:
#   python3 tests/level_import.py <spiel.json> <welt>/<datei>.json
# Schreibt levels/<welt>/<datei>.json (Export des Editors, inhaltlich = die Vorlage) und levels/editor-format/<welt>/<datei>.json (umgewandelt).
# Die Umwandlung läuft im echten Editor: Spiel-Format -> Editor-Stand -> exportLevel(); das Ergebnis muss Feld für Feld
# wieder dasselbe Spiel-Format ergeben (sonst bricht das Skript ab und schreibt nichts).
import asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import run_tests as T
from playwright.async_api import async_playwright

ROOT = T.ROOT

UMWANDELN = r"""(spiel) => {
  const T = TILE, d = {cols: 0, tiles: [], hooks: [], spikes: [], coins: [], checkpoints: [], movers: []};
  const zelle = new Map(), setze = (c, r, typ) => zelle.set(c + ',' + r, typ);
  const rechteckZellen = (o, f) => { for(let x = o.x; x < o.x + o.w - 1; x += T) for(let y = o.y; y < o.y + o.h - 1; y += T) f(Math.floor(x/T), Math.floor(y/T)); };
  for(const s of spiel.solids || []) rechteckZellen(s, (c, r) => setze(c, r, s.type));
  // bewegte Teile: je Gruppe Kästchen + EINE Bewegung (am ersten Kästchen)
  const gruppen = new Map();
  for(const m of spiel.movingPlatforms || []){ const k = m.group ?? JSON.stringify([m.x, m.y]); if(!gruppen.has(k)) gruppen.set(k, []); gruppen.get(k).push(m); }
  for(const teile of gruppen.values()){
    let c0 = Infinity, r0 = Infinity;
    for(const m of teile) rechteckZellen(m, (c, r) => { setze(c, r, m.look || 'ground'); if(r < r0 || (r === r0 && c < c0)){ c0 = c; r0 = r; } });
    const m = teile[0], mv = {c: c0, r: r0, dc: Math.round((m.targetX - m.x)/T), dr: Math.round((m.targetY - m.y)/T), speed: m.speed || 4.5, link: m.switchLink || null};
    if(m.einmal) mv.einmal = true;
    d.movers.push(mv);
  }
  d.hooks = (spiel.hooks || []).map(h => { const o = {c: Math.round((h.x - T/2)/T), r: Math.round((h.y - T/2)/T), radius: (h.radius || 6.5*T)/T};
    if(typeof h.targetX === 'number') o.move = {dc: Math.round((h.targetX - h.x)/T), dr: Math.round((h.targetY - h.y)/T), speed: h.speed || 4.5, link: h.switchLink || null, ...(h.einmal ? {einmal: true} : {})};
    return o; });
  const fuss = p => ({c: Math.round((p.x - T/2)/T), r: Math.round((p.y - T)/T)});
  d.spikes = (spiel.spikes || []).map(s => ({...fuss(s), dir: s.dir || 0}));
  d.coins = (spiel.coins || []).map(m => ({c: Math.round((m.x - T/2)/T), r: Math.round((m.y - T/2)/T), color: m.color || 'gold', ...(m.klasse && m.klasse !== 'pfad' ? {klasse: m.klasse} : {})}));
  d.checkpoints = (spiel.checkpoints || []).map(fuss);
  for(const k of ['startM', 'startF', 'goal']) d[k] = spiel[k] ? fuss(spiel[k]) : null;
  // Register-Elemente: Kachel -> Kästchen; Punkt -> passende (c, r) + übrige Felder suchen, geprüft mit exportieren()
  const fehler = [];
  for(const E of ELEMENTE.filter(E => E.editor)){
    const liste = spiel[E.feld]; if(!liste || !liste.length) continue;
    if(E.editor.art === 'kachel'){ for(const o of liste) rechteckZellen(o, (c, r) => setze(c, r, E.editor.werkzeug)); continue; }
    d[E.feld] = liste.map(o => {
      const rest = {...o}; for(const k of ['x', 'y', 'w', 'h']) delete rest[k];
      const cx = Math.floor(o.x/T), cy = Math.floor(o.y/T);
      for(let c = cx - 1; c <= cx + 1; c++) for(let r = cy - 2; r <= cy + 1; r++){
        for(const extra of [{}, {schalter: 'nummer'}]){   // z. B. Teleporter per Nummer: im Editor mit Auswahl „schalter“
          const p = {c, r, ...rest, ...extra}, e = E.editor.exportieren([p], T, mergeRects)[0];
          if(JSON.stringify(e) === JSON.stringify(o)) return p;
        }
      }
      fehler.push(E.feld + ' ' + JSON.stringify(o)); return {c: cx, r: cy, ...rest};
    });
  }
  d.tiles = [...zelle].map(([k, t]) => { const [c, r] = k.split(',').map(Number); return [c, r, t]; });
  d.cols = Math.max(MIN_COLS, ...d.tiles.map(t => t[0] + 1), (d.goal ? d.goal.c + 2 : 0));
  d.welt = spiel.welt; d.wetter = spiel.wetter; if(spiel.tageszeit) d.tageszeit = spiel.tageszeit; if(spiel.look) d.theme = spiel.look; if(spiel.nachSzene) d.nachSzene = spiel.nachSzene;
  return {d, fehler};
}"""

def normal(spiel):
    """Spiel-Format vergleichbar machen: Flächen als Kästchen-Mengen je Sorte, Listen sortiert"""
    out = {}
    for k, v in spiel.items():
        if k == 'solids':
            z = sorted((s['type'], c, r) for s in v for c in range(int(s['x'])//40, int(s['x'] + s['w'] - 1)//40 + 1)
                       for r in range(int(s['y'])//40, int(s['y'] + s['h'] - 1)//40 + 1))
            out[k] = z
        elif k == 'movingPlatforms':
            out[k] = sorted((m.get('look'), c, r, m.get('targetX') - m['x'], m.get('targetY') - m['y'], m.get('speed'), m.get('switchLink'), bool(m.get('einmal')))
                            for m in v for c in range(int(m['x'])//40, int(m['x'] + m['w'] - 1)//40 + 1) for r in range(int(m['y'])//40, int(m['y'] + m['h'] - 1)//40 + 1))
        elif isinstance(v, list) and v and isinstance(v[0], dict) and 'w' in v[0] and 'h' in v[0] and k not in ('spikes',):
            out[k] = sorted((c, r) for o in v for c in range(int(o['x'])//40, int(o['x'] + o['w'] - 1)//40 + 1) for r in range(int(o['y'])//40, int(o['y'] + o['h'] - 1)//40 + 1))
        elif isinstance(v, list):
            out[k] = sorted(json.dumps(x, sort_keys=True) for x in v)
        else:
            out[k] = v
    return out

async def umwandeln(spiel):
    srv = T.webserver()
    async with async_playwright() as pw:
        br = await pw.chromium.launch(executable_path=__import__('os').environ.get('CHROMIUM_PATH') or None); p = await (await br.new_context(viewport={'width': 1400, 'height': 840})).new_page()
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_function("window.editorBereit", timeout=8000)
        r = await p.evaluate(UMWANDELN, spiel)
        rueck = await p.evaluate("d => { applySnapshot(d); return JSON.parse(exportLevel()); }", r['d'])
        await br.close()
    srv.shutdown()
    return r['d'], r['fehler'], rueck

def main():
    quelle, ziel = Path(sys.argv[1]), sys.argv[2]
    spiel = json.loads(quelle.read_text(encoding='utf-8'))
    ed, fehler, rueck = asyncio.run(umwandeln(spiel))
    a, b = normal(spiel), normal(rueck)
    unterschiede = [k for k in set(a) | set(b) if a.get(k) != b.get(k) and not (not a.get(k) and not b.get(k))]
    if fehler or unterschiede:
        print('NICHT übernommen – Umwandlung nicht verlustfrei:', fehler[:5], unterschiede)
        for k in unterschiede[:5]: print(' ', k, str(a.get(k))[:200], '|', str(b.get(k))[:200])
        sys.exit(1)
    alt = ROOT / 'levels' / 'editor-format' / ziel
    if alt.exists():   # Name/Titel/Position des bisherigen Editor-Stands behalten
        vorher = json.loads(alt.read_text(encoding='utf-8'))
        for k in ('name', 'titel', 'position', 'linkNames'):
            if k in vorher and k not in ed: ed[k] = vorher[k]
    # Spiel-Datei = Export des Editors aus dem umgewandelten Stand (inhaltlich gleich wie die Vorlage, siehe Prüfung oben;
    # so sind beide Formate genau so deckungsgleich, wie wenn der Editor selbst speichert)
    (ROOT / 'levels' / ziel).write_text(json.dumps(rueck, indent=2, ensure_ascii=False), encoding='utf-8')
    alt.parent.mkdir(parents=True, exist_ok=True); alt.write_text(json.dumps(ed), encoding='utf-8')
    print('übernommen:', ziel, '(Spiel-Format + Editor-Format, Rückweg geprüft)')

if __name__ == '__main__':
    main()
