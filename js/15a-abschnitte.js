// 15a-abschnitte.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Abschnitte (Dschungel-Neu): ein langes Level aus mehreren Teilen ----------
// Eine Abschnitt-Datei (z. B. levels/dschungel/a1-sternschnuppenspur.json) enthält KEIN Gelände, nur
//   {"abschnitt": 1, "titel": …, "teile": ["dschungel/01-dschungel.json", …], "welt", "tageszeit", "wetter", "nachSzene"}
// Die Teile sind normale Level-Dateien (im Editor einzeln bearbeitbar und testbar). Beim Spielen werden sie
// hintereinander gesetzt: Teil k rückt um die Breite der Teile davor nach rechts, seine Verknüpfungs-Nummern um
// ABSCHNITT_NUMMERN_JE_TEIL·k (so stören sich die Hebel der Teile nicht), Teleporter-Paare und Gruppen bewegter Teile
// bekommen eigene Nummern. Nur der Start des ersten und das Ziel des letzten Teils bleiben. An der Naht entfallen die
// Rand-Mauern über dem Boden: am Ende eines Teils alles, was bis an den rechten Rand reicht (höchstens 8 Kästchen
// breit, oberhalb der Ziel-Höhe – Randmauer oder Endturm), am Anfang des nächsten die Spalte 0 oberhalb der Start-Höhe.
const ABSCHNITT_NUMMERN_JE_TEIL = 20;   // Teil 1: Nummern 1–20, Teil 2: 21–40, Teil 3: 41–60 (MAX_LINK)
const ABSCHNITT_TILE = 40;
// Breite eines Teils in Kästchen: bis zum rechtesten Gelände-Stück (oder Ziel)
function abschnittTeilSpalten(d){
  let maxX = d.goal ? d.goal.x + ABSCHNITT_TILE : 0;
  for(const s of d.solids || []) maxX = Math.max(maxX, s.x + s.w);
  return Math.ceil(maxX/ABSCHNITT_TILE - 1e-6);
}
// Zahlen, die eine waagerechte Lage sind (Pixel), und Zahlen, die eine Nummer sind – in allen Listen eines Levels
const ABSCHNITT_X_FELDER = ['x', 'targetX'];
const ABSCHNITT_NUMMER_FELDER = ['link', 'switchLink'];
function abschnittZusammensetzen(def, teile){
  const out = {};
  let spalte = 0;
  const N = teile.length;
  teile.forEach((d, k) => {
    const dx = spalte*ABSCHNITT_TILE, dl = k*ABSCHNITT_NUMMERN_JE_TEIL, spalten = abschnittTeilSpalten(d);
    const rechts = spalten*ABSCHNITT_TILE;
    // Naht: Rand-Wände weg (rechter Rand aller Teile außer dem letzten, Spalte 0 aller Teile außer dem ersten)
    const gy = d.goal ? d.goal.y : -1e9, sy = d.startM ? d.startM.y : -1e9;
    const nahtWeg = s => (k < N - 1 && Math.abs(s.x + s.w - rechts) < 0.5 && s.x >= rechts - 8*ABSCHNITT_TILE - 0.5 && s.y + s.h <= gy + 0.5) ||
                         (k > 0 && s.x <= 0.5 && s.w <= ABSCHNITT_TILE + 0.5 && s.y + s.h <= sy + 0.5);
    for(const feld in d){
      const v = d[feld];
      if(!Array.isArray(v)) continue;
      const liste = out[feld] || (out[feld] = []);
      for(const o of v){
        if(!o || typeof o !== 'object') continue;
        if(feld === 'solids' && nahtWeg(o)) continue;
        const n = {...o};
        for(const f of ABSCHNITT_X_FELDER) if(typeof n[f] === 'number') n[f] += dx;
        for(const f of ABSCHNITT_NUMMER_FELDER) if(typeof n[f] === 'number' && n[f] > 0) n[f] += dl;
        if(feld === 'teleporters' && n.paar !== undefined) n.paar = k*1000 + Number(n.paar);
        if(feld === 'movingPlatforms' && n.group !== undefined && n.group !== null) n.group = 't' + k + '-' + n.group;
        liste.push(n);
      }
    }
    if(k === 0){ out.startM = d.startM; out.startF = d.startF; }
    if(k === N - 1 && d.goal) out.goal = {x: d.goal.x + dx, y: d.goal.y};
    spalte += spalten;
  });
  for(const k of ['welt', 'tageszeit', 'wetter', 'look', 'theme']) if(def[k] !== undefined) out[k] = def[k];
  out.abschnitt = def.abschnitt || 1;
  out.abschnittTeile = teile.length;
  if(def.nachSzene) out.nachSzene = def.nachSzene;
  return out;
}
const istAbschnitt = d => !!(d && Array.isArray(d.teile) && !d.solids);
// Abschnitt-Datei -> fertiges Level (Teile laden, zusammensetzen); normale Level kommen unverändert zurück
async function abschnittLaden(data, holen){
  if(!istAbschnitt(data)) return data;
  holen = holen || (async datei => {
    const r = await fetch(PROJECT_LEVELS + levelPfadUrl(datei), {cache: 'no-store'});
    if(!r.ok) throw new Error('Teil nicht erreichbar: ' + datei + ' (HTTP ' + r.status + ')');
    return r.json();
  });
  const teile = await Promise.all(data.teile.map(holen));
  return abschnittZusammensetzen(data, teile);
}
