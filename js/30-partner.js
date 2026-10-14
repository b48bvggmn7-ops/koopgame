// 30-partner.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.
//
// ---------- Computer-Partner (nur im Testmodus aus dem Editor) ----------
// Wer ein Level allein testen will, lässt die zweite Figur vom Computer steuern. Der Partner drückt dabei echte
// (virtuelle) Tasten im selben Eingabesystem wie ein Spieler (KEYS in 03-eingabe.js) – es gilt also genau dieselbe
// Physik, er kann nichts, was ein Spieler nicht kann. Ich (der Mensch) steuere meine Figur mit BEIDEN Tastaturhälften
// und beiden Controllern. Im normalen Spiel zu zweit ist der Partner aus und ändert nichts (partnerAktiv() = false).
// Werte (Reaktionszeit, Abstand …) in js/02-physik-werte.js (PARTNER_*).

const PARTNER_SPEICHER = 'monchichi_partner';   // {an, ich: 'm' | 'f'} – im Browser gemerkt (Editor-Auswahl „Allein testen“)
const PARTNER_AKTIONEN = ['left', 'right', 'jump', 'ability', 'pull', 'slack', 'use', 'padUse'];
const partnerCode = a => 'Partner_' + a;   // Tasten, die der Partner drückt
const soloCode = a => 'Solo_' + a;         // meine Tasten (beide Tastaturhälften + beide Controller zusammen)

let partner = {
  an: false,          // Schalter (Editor: „Allein testen“, im Spiel P)
  ich: 'm',           // welche Figur ICH spiele ('m' = Affe, 'f' = Schweinchen); der Partner hat die andere
  frei: false,        // auch außerhalb des Editor-Tests erlaubt (nur für die automatischen Tests; später Hauptspiel)
  modus: 'folgen',    // folgen | warten (auf meinen Ruf) | aufgabe | fest (hängt fest)
  text: '',           // was er gerade tut (Anzeige über seiner Figur)
};

function partnerEinstellungLaden(){
  try{
    const d = JSON.parse(localStorage.getItem(PARTNER_SPEICHER) || 'null');
    if(d){ partner.an = !!d.an; partner.ich = d.ich === 'f' ? 'f' : 'm'; }
  }catch(e){}
}
function partnerEinstellungMerken(){
  try{ localStorage.setItem(PARTNER_SPEICHER, JSON.stringify({an: partner.an, ich: partner.ich})); }catch(e){}
}
function partnerAktiv(){
  return partner.an && (partner.frei || PARTNER_IM_HAUPTSPIEL || (typeof editorTestMode !== 'undefined' && editorTestMode));
}
// Figur des Partners bzw. meine Figur
const partnerFigur = () => partner.ich === 'm' ? p2 : p1;
const meineFigur = () => partner.ich === 'm' ? p1 : p2;

// Tasten je Figur (aufgerufen von keysFor in 03-eingabe.js); null = wie immer (zwei Spieler)
function partnerTasten(male){
  if(!partnerAktiv()) return null;
  const istPartner = (partner.ich === 'm') !== male;
  const c = istPartner ? partnerCode : soloCode;
  return male ? {left: c('left'), right: c('right'), jump: c('jump'), hook: c('ability'), pull: c('pull'), slack: c('slack'),
                 use: c('use'), padUse: c('padUse'), swimUp: c('pull'), swimDown: c('slack')}
              : {left: c('left'), right: c('right'), jump: c('jump'), glide: c('ability'), use: c('use'), padUse: c('padUse'),
                 swimUp: c('pull'), swimDown: c('slack')};
}
function partnerTastenNeu(){
  if(typeof p1 === 'undefined' || !p1) return;
  p1.keys = keysFor(true); p2.keys = keysFor(false);
  for(const a of PARTNER_AKTIONEN){ KEYS[partnerCode(a)] = false; KEYS[partnerCode(a) + '_pressed'] = false; }
  if(typeof updateHudKeys === 'function') updateHudKeys();
}

// Ein-/Ausschalten und Rollenwechsel (Editor-Auswahl, Tasten P/V, Controller Share)
function partnerSetzen(an, ich){
  partner.an = !!an;
  if(ich === 'm' || ich === 'f') partner.ich = ich;
  partnerEinstellungMerken();
  partnerHirnNeu();
  partnerTastenNeu();
}
function partnerTauschen(){
  if(!partnerAktiv()) return;
  partner.ich = partner.ich === 'm' ? 'f' : 'm';
  partnerEinstellungMerken();
  partnerHirnNeu();
  partnerTastenNeu();
}

// ---------- „Gehirn“ (Teilschritte 2–4) ----------
let partnerHirn = null;
const partnerQuelle = {};   // letzter Stand meiner echten Tasten je Aktion (siehe partnerVorSchritt)
function partnerHirnNeu(){
  partnerHirn = {schritt: 0};
  partner.modus = 'folgen'; partner.text = '';
}
// Was der Partner in diesem Schritt drücken möchte: {left, right, jump, ability, pull, slack, use} (true = halten),
// press = Liste der Tasten, die gerade neu gedrückt werden. Teilschritt 1: er steht still.
function partnerDenken(P, M){
  return {halten: {}, druecken: []};
}

// Jeder Physik-Schritt (Anfang von stepSim in 14-spielschleife.js): meine Tasten zusammenführen, Partner-Tasten setzen
function partnerVorSchritt(){
  if(!partnerAktiv()) return;
  if(!partnerHirn){ partnerHirnNeu(); if(typeof updateHudKeys === 'function') updateHudKeys(); }
  // Meine Figur: beide Tastaturhälften und beide Controller. Ein „gerade gedrückt“ der Original-Taste wird übernommen
  // und dort gelöscht (sonst bliebe es liegen, weil keine Figur mehr auf diese Taste hört).
  // Gehalten wird nur bei einer Änderung übernommen – so kann ein Test-Skript (Koop-Bot) meine Figur auch direkt steuern.
  for(const a of PARTNER_AKTIONEN){
    const c1 = KEYSETS[1][a], c2 = KEYSETS[2][a], s = soloCode(a), q = isDown(c1) || isDown(c2);
    if(q !== !!partnerQuelle[a]){ KEYS[s] = q; partnerQuelle[a] = q; }
    if(KEYS[c1 + '_pressed'] || KEYS[c2 + '_pressed']){ KEYS[s + '_pressed'] = true; KEYS[c1 + '_pressed'] = false; KEYS[c2 + '_pressed'] = false; }
  }
  const P = partnerFigur(), M = meineFigur();
  if(!P || !M) return;
  partnerHirn.schritt++;
  const w = partnerDenken(P, M);
  const vorher = partnerHirn.tasten || (partnerHirn.tasten = {});
  for(const a of PARTNER_AKTIONEN){
    const c = partnerCode(a), jetzt = !!w.halten[a] || w.druecken.includes(a);
    if(jetzt && (!vorher[a] || w.druecken.includes(a))) KEYS[c + '_pressed'] = true;   // neu gedrückt
    if(!jetzt) KEYS[c + '_pressed'] = false;
    KEYS[c] = jetzt; vorher[a] = jetzt;
  }
}

// ---------- Anzeige: kleines Schild über dem Partner (was er gerade tut) ----------
function partnerZeichnen(){
  if(!partnerAktiv() || !p1 || !p2) return;
  const P = partnerFigur();
  const sx = (P.x - camX) * zoom, sy = (P.y - P.h - 14) * zoom + H*(1 - zoom) + CEILING_MARGIN;
  const txt = '🤖 ' + (partner.text || 'Partner');
  ctx.save();
  ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(txt).width + 14;
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = 'rgba(20,28,38,.75)'; roundRect(sx - tw/2, sy - 20, tw, 18, 8); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#e8f1ff'; ctx.fillText(txt, sx, sy - 11);
  ctx.restore();
}

// ---------- Tasten im Testmodus: P = Partner an/aus, V = Rollen tauschen ----------
window.addEventListener('keydown', e => {
  if(e.repeat || typeof menuActive !== 'function' || menuActive()) return;
  const erlaubt = partner.frei || PARTNER_IM_HAUPTSPIEL || (typeof editorTestMode !== 'undefined' && editorTestMode);
  if(!erlaubt) return;
  if(e.code === 'KeyP'){ partnerSetzen(!partner.an); return; }
  if(!partnerAktiv()) return;
  if(e.code === 'KeyV') partnerTauschen();
});

partnerEinstellungLaden();

// Anzeige oben links/rechts, wenn der Partner an ist: wer bin ich, welche Tasten (aufgerufen aus updateHudKeys)
function partnerHud(set){
  if(!partnerAktiv()) return false;
  const ichAffe = partner.ich === 'm';
  const meins = 'A/D oder ← → bewegen · Leertaste/Num&nbsp;0 springen · G/Num&nbsp;1 ' + (ichAffe ? 'Haken' : 'Schirm') +
    ' · J/Num&nbsp;2 Hebel' + (ichAffe ? ' · W/S Seil' : '');
  const seins = 'Q warten/komm · E Aufgabe jetzt · V Rollen tauschen · P Partner aus · Controller: L1 / R1 / Share';
  set(ichAffe ? 'hudMHead' : 'hudFHead', '<b>Du</b> <span class="' + (ichAffe ? 'p1">● Affe, Haken' : 'p2">● Schweinchen, Schirm') + '</span>');
  set(ichAffe ? 'hudMKeys' : 'hudFKeys', meins);
  set(ichAffe ? 'hudFHead' : 'hudMHead', '<b>🤖 Computer-Partner</b> <span class="' + (ichAffe ? 'p2">● Schweinchen' : 'p1">● Affe') + '</span>');
  set(ichAffe ? 'hudFKeys' : 'hudMKeys', seins);
  return true;
}
