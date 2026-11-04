// 20b-foto-tiere.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Tiere im Foto-Look (Nutzer: „wir brauchen im Foto-Look andere Tiere, das passt nur halb zum Wald“) ----------
// Nur Vögel und Eichhörnchen (Nutzerwahl), selbst gezeichnet, gedämpft und halb-realistisch: keine Kontur, keine
// Bäckchen, kleine dunkle Knopfaugen, weiche Schattierung, feine Feder-/Fellstriche.
// - Vögel (17-deko.js, gleiche Plätze und gleiches Verhalten): Rotkehlchen oder Kohlmeise (fest je Sitzplatz).
// - Frosch (20-tiere.js) wird zum Eichhörnchen: sitzt, knabbert an einer Nuss, wippt mit dem Schwanz, hüpft weg, wenn
//   jemand kommt (dieselbe Hüpf-Logik, stumm).
// - Schmetterling, Glühwürmchen, Faultier, Fledermaus, Schnecke, Eidechse: im Foto-Look ausgeblendet (auch ihre Töne).
// Alles nur Aussehen: die Tier-Listen bleiben gleich, Taste B schaltet sofort um. Pilze/Knospen bleiben wie bisher.
const FOTO_TIERE_AUS = new Set(['butterfly', 'firefly', 'sloth', 'bat', 'snail', 'lizard']);
const FOTO_EICHHORN_GROESSE = 1.25;   // Maßstab des Eichhörnchens (ca. 34 px hoch mit Schwanz)
const FOTO_VOGEL_GROESSE = 1.0;
function fotoTiereAn(){ return typeof fotoLookAktiv === 'function' && fotoLookAktiv(); }
function fotoTierZufall(a, b){ const v = Math.sin(a*12.9898 + b*78.233)*43758.5453; return v - Math.floor(v); }
// soll dieses Tier im Foto-Look stumm sein? (ausgeblendet oder Eichhörnchen statt Frosch)
function fotoTierStumm(c){ return fotoTiereAn() && (c.kind === 'frog' || FOTO_TIERE_AUS.has(c.kind)); }
// Töne für updateCritters (20): im Foto-Look ohne Frosch-Quaken, Entdeckungs-Ton und Flattern (die Tiere sind ja
// Eichhörnchen bzw. ausgeblendet); sonst die normalen Töne
let fotoTierStummSfx = null;
function fotoTierTon(){
  if(!fotoTiereAn()) return SFX;
  if(!fotoTierStummSfx || fotoTierStummSfx._von !== SFX){ const leer = () => {}; fotoTierStummSfx = Object.assign(Object.create(SFX), {frog: leer, discover: leer, birdFlap: leer, _von: SFX}); }
  return fotoTierStummSfx;
}
// aus drawCritters (20): true = erledigt (Eichhörnchen gezeichnet bzw. Tier ausgeblendet)
function fotoTierZeichnen(c, x, t){
  if(!fotoTiereAn()) return false;
  if(c.kind === 'frog'){ fotoEichhoernchen(c, x, t); return true; }
  return FOTO_TIERE_AUS.has(c.kind);
}

// ---------- Vögel ----------
const FOTO_VOGEL_ARTEN = {
  rotkehlchen: {ruecken: '#6e6148', rueckenDunkel: '#4a412f', fluegel: '#5a4f3c', kante: 'rgba(196,176,138,.55)', bauch: '#d8cfbb',
                brust: '200,98,44', kopf: '#6e6148', schnabel: '#2a231d', bein: '#5a4436'},
  meise:       {ruecken: '#737c4c', rueckenDunkel: '#4f5634', fluegel: '#5f6d7a', kante: 'rgba(215,220,225,.5)', bauch: '#c2ae4c',
                kopf: '#151514', wange: '#e9e7dd', schnabel: '#1b1b1b', bein: '#4c5560', streifen: '#181816'}
};
function fotoVogelZeichnen(b, x, hopY){
  const art = fotoTierZufall(Math.round(b.homeX)*0.731 + 3.1, Math.round(b.homeY)*1.37) < 0.5 ? 'rotkehlchen' : 'meise', A = FOTO_VOGEL_ARTEN[art];
  const fliegt = b.state === 'fly', s = FOTO_VOGEL_GROESSE;
  ctx.save(); ctx.translate(Math.round(x), Math.round(b.y + hopY)); ctx.scale(b.dir*s, s);
  if(!fliegt){
    ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 1.8, 0, 0, 7); ctx.fill();   // Kontaktschatten
    ctx.strokeStyle = A.bein; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-1.5, -5.5); ctx.lineTo(-2.2, 0); ctx.lineTo(0.2, 0); ctx.moveTo(1.8, -5.5); ctx.lineTo(2.4, 0); ctx.lineTo(4.6, 0); ctx.stroke();
  }
  const kipp = fliegt ? -0.2 : (b.peck > 0 ? 0.5*Math.sin((1 - b.peck/380)*Math.PI) : -0.08);
  ctx.translate(0, fliegt ? -2 : -10); ctx.rotate(kipp);
  // Schwanz: schmale, lange Federn, etwas angehoben
  ctx.fillStyle = A.rueckenDunkel;
  ctx.beginPath(); ctx.moveTo(-6, -1.5); ctx.lineTo(-16.5, -4.5); ctx.lineTo(-17, -2.2); ctx.lineTo(-15.8, 0.6); ctx.lineTo(-6, 2.6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(-8, 0.2); ctx.lineTo(-16.6, -2.4); ctx.stroke();
  // Körper: rundlich, oben Rückenfarbe, unten Bauch (weicher Übergang)
  const koerper = new Path2D(); koerper.ellipse(0, 0, 9, 6.8, -0.12, 0, Math.PI*2);
  const kopf = new Path2D(); kopf.arc(6.3, -5.8, 5, 0, Math.PI*2);
  ctx.save(); ctx.clip(koerper);
  const gk = ctx.createLinearGradient(0, -7, 0, 7); gk.addColorStop(0, A.ruecken); gk.addColorStop(0.45, A.ruecken); gk.addColorStop(0.62, A.bauch); gk.addColorStop(1, A.bauch);
  ctx.fillStyle = gk; ctx.fillRect(-10, -8, 20, 16);
  if(art === 'rotkehlchen'){   // orange Brust, weich auslaufend
    const gb = ctx.createRadialGradient(6, -1.5, 0.5, 6, -1.5, 7.5); gb.addColorStop(0, `rgba(${A.brust},1)`); gb.addColorStop(0.7, `rgba(${A.brust},.9)`); gb.addColorStop(1, `rgba(${A.brust},0)`);
    ctx.fillStyle = gb; ctx.fillRect(-3, -9, 14, 14);
  } else {   // Meise: schwarzer Mittelstreifen auf dem gelben Bauch
    ctx.strokeStyle = A.streifen; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(6.5, -2); ctx.quadraticCurveTo(4.5, 3, 1, 6.5); ctx.stroke();
  }
  // feine Federstriche + Schattierung unten
  ctx.strokeStyle = 'rgba(30,22,14,.18)'; ctx.lineWidth = 0.45;
  for(let i = 0; i < 9; i++){ const fx = -6 + i*1.6, fy = 1.5 + fotoTierZufall(i, b.homeX)*3.5; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx - 1.4, fy + 1.2); ctx.stroke(); }
  const gs = ctx.createLinearGradient(0, -7, 0, 7); gs.addColorStop(0, 'rgba(255,248,230,.18)'); gs.addColorStop(0.5, 'rgba(0,0,0,0)'); gs.addColorStop(1, 'rgba(0,0,0,.3)');
  ctx.fillStyle = gs; ctx.fillRect(-10, -8, 20, 16);
  ctx.restore();
  // Kopf
  ctx.save(); ctx.clip(kopf);
  if(art === 'rotkehlchen'){
    ctx.fillStyle = A.kopf; ctx.fillRect(0, -12, 13, 13);
    const gf = ctx.createRadialGradient(9, -3.5, 0.5, 9, -3.5, 5.5); gf.addColorStop(0, `rgba(${A.brust},1)`); gf.addColorStop(0.75, `rgba(${A.brust},.95)`); gf.addColorStop(1, `rgba(${A.brust},0)`);
    ctx.fillStyle = gf; ctx.fillRect(0, -12, 13, 13);
    ctx.strokeStyle = 'rgba(140,140,132,.55)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(9, -3.5, 5.2, -2.3, -0.9); ctx.stroke();   // graues Band über dem Orange
  } else {
    ctx.fillStyle = A.kopf; ctx.fillRect(0, -12, 13, 13);
    ctx.fillStyle = A.wange; ctx.beginPath(); ctx.ellipse(6.6, -4.4, 3.2, 2.2, -0.15, 0, 7); ctx.fill();
  }
  const gh = ctx.createLinearGradient(0, -11, 0, -1); gh.addColorStop(0, 'rgba(255,248,230,.16)'); gh.addColorStop(1, 'rgba(0,0,0,.18)');
  ctx.fillStyle = gh; ctx.fillRect(0, -12, 13, 13);
  ctx.restore();
  // Auge (klein, dunkel, mit Lichtpunkt) und feiner Schnabel
  ctx.fillStyle = '#0d0b0a'; ctx.beginPath(); ctx.arc(8.3, -6.8, 1.15, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(8.6, -7.15, 0.38, 0, 7); ctx.fill();
  ctx.fillStyle = A.schnabel; ctx.beginPath(); ctx.moveTo(10.6, -6.6); ctx.lineTo(14, -5.6); ctx.lineTo(10.7, -4.7); ctx.closePath(); ctx.fill();
  // Flügel
  if(fliegt){
    const f = Math.sin(b.flap);
    ctx.fillStyle = A.fluegel;
    ctx.beginPath(); ctx.moveTo(-2, -2); ctx.quadraticCurveTo(-4, -2 - 14*f, -13, -4 - 12*f); ctx.quadraticCurveTo(-6, 0, -2, 2); ctx.fill();
    ctx.strokeStyle = A.kante; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(-4, -1 - 6*f); ctx.lineTo(-11, -3 - 10*f); ctx.stroke();
  } else {
    const fl = new Path2D(); fl.moveTo(-5, -3.6); fl.quadraticCurveTo(1.5, -5, 4.5, -2.2); fl.quadraticCurveTo(3, 2.4, -2, 2.8); fl.lineTo(-11, 1.2); fl.closePath();
    const gf = ctx.createLinearGradient(0, -5, 0, 3); gf.addColorStop(0, A.fluegel); gf.addColorStop(1, A.rueckenDunkel);
    ctx.fillStyle = gf; ctx.fill(fl);
    ctx.strokeStyle = A.kante; ctx.lineWidth = 0.55;   // helle Federränder (Schwungfedern)
    for(let i = 0; i < 3; i++){ ctx.beginPath(); ctx.moveTo(-1 + i*1.6, -2.6 + i*1.6); ctx.lineTo(-9 + i*0.6, 0.6 + i*0.6); ctx.stroke(); }
    if(art === 'meise'){ ctx.strokeStyle = 'rgba(240,240,232,.75)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(2.5, -3.2); ctx.lineTo(-4, -2.4); ctx.stroke(); }   // weiße Flügelbinde
  }
  ctx.restore();
}

// ---------- Eichhörnchen (statt Frosch) ----------
const FOTO_EICHHORN = {fell: '#86482a', dunkel: '#5a2f17', hell: '#a96a3c', bauch: '#d6c6a8', nuss: '#6e5233'};
function fotoEichhoernchen(c, x, t){
  const F = FOTO_EICHHORN, k = FOTO_EICHHORN_GROESSE, y = c.y + (c.jy || 0), springt = !!c.jy;
  const ph = (c.home || 0)*0.01, wipp = Math.sin(t*0.0035 + ph), knabber = !springt && Math.sin(t*0.002 + ph*3) > 0.3;
  ctx.translate(x, y);
  if(!springt){ ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(-2*c.dir, 0, 12*k, 2.2, 0, 0, 7); ctx.fill(); }
  ctx.scale(c.dir*k, k);
  if(springt) ctx.rotate(0.45);   // im Sprung gestreckt nach vorn
  // buschiger Schwanz: S-Bogen hinter dem Rücken bis über den Kopf, aus vielen Fell-Kreisen + feinen Haaren
  const B = (u) => { const a = 1 - u, P = [[-5, -3], [-21, -4], [-19, -31 - wipp*1.5], [-5 + wipp*1.2, -31]];
    return [a*a*a*P[0][0] + 3*a*a*u*P[1][0] + 3*a*u*u*P[2][0] + u*u*u*P[3][0], a*a*a*P[0][1] + 3*a*a*u*P[1][1] + 3*a*u*u*P[2][1] + u*u*u*P[3][1]]; };
  const n = 22, R = u => 2.4 + 4.4*Math.sin(Math.PI*Math.min(1, u*1.12));
  // weicher Haar-Saum: viele feine, kurze Haare quer zur Schwanz-Linie (nach außen, leicht schräg), darunter der Kern
  ctx.lineCap = 'round';
  for(let i = 0; i < 150; i++){
    const u = fotoTierZufall(i, 3), [bx, by] = B(u), [ax, ay] = B(Math.min(1, u + 0.02)), r = R(u);
    let nx = -(ay - by), ny = ax - bx; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const sd = i % 2 ? 1 : -1, sch = (fotoTierZufall(i, 9) - 0.3)*0.6, lang = r + 0.8 + fotoTierZufall(i, 5)*1.8;
    const dx = nx*sd + (ax - bx)/l*sch, dy = ny*sd + (ay - by)/l*sch;
    ctx.strokeStyle = i % 4 ? 'rgba(120,62,30,.45)' : 'rgba(196,150,108,.4)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(bx + dx*r*0.5, by + dy*r*0.5); ctx.lineTo(bx + dx*lang, by + dy*lang); ctx.stroke();
  }
  for(let pass = 0; pass < 2; pass++){
    for(let i = 0; i <= n; i++){
      const u = i/n, [bx, by] = B(u), r = R(u)*(pass ? 0.55 : 0.92);
      ctx.fillStyle = pass ? F.hell : F.fell; ctx.globalAlpha = pass ? 0.35 : 1;
      ctx.beginPath(); ctx.arc(bx + (pass ? 0.9 : 0), by + (pass ? -0.5 : 0), r, 0, 7); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(60,28,12,.3)'; ctx.lineWidth = 0.45;   // Fell-Strähnen im Kern
  for(let i = 0; i < 26; i++){ const u = fotoTierZufall(i, 13), [bx, by] = B(u), [ax, ay] = B(Math.min(1, u + 0.05)), o = (fotoTierZufall(i, 17) - 0.5)*R(u);
    ctx.beginPath(); ctx.moveTo(bx + o*0.4, by + o*0.3); ctx.lineTo(ax + o*0.5, ay + o*0.4); ctx.stroke(); }
  // Hinterbein/Keule und Fuß
  ctx.fillStyle = F.dunkel; ctx.beginPath(); ctx.ellipse(-1, -4.5, 6.2, 4.6, -0.2, 0, 7); ctx.fill();
  ctx.fillStyle = F.fell; ctx.beginPath(); ctx.ellipse(-0.5, -5, 5.4, 4, -0.2, 0, 7); ctx.fill();
  ctx.fillStyle = F.dunkel; ctx.beginPath(); ctx.ellipse(3.2, -0.9, 4.2, 1.3, 0, 0, 7); ctx.fill();
  // Körper (aufrecht sitzend) mit hellem Bauch
  const leib = new Path2D(); leib.ellipse(1, -10.5, 6, 8.6, -0.28, 0, 7);
  ctx.save(); ctx.clip(leib);
  const gl = ctx.createLinearGradient(-6, 0, 7, 0); gl.addColorStop(0, F.dunkel); gl.addColorStop(0.5, F.fell); gl.addColorStop(1, F.hell);
  ctx.fillStyle = gl; ctx.fillRect(-7, -21, 15, 21);
  ctx.fillStyle = F.bauch; ctx.beginPath(); ctx.ellipse(4.6, -9.5, 2.8, 6.4, -0.3, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(60,26,8,.25)'; ctx.lineWidth = 0.45;
  for(let i = 0; i < 8; i++){ const fx = -3 + fotoTierZufall(i, 11)*5, fy = -16 + i*1.8; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx - 1, fy + 1.6); ctx.stroke(); }
  ctx.restore();
  // Vorderpfoten (mit Nuss beim Knabbern)
  const py = knabber ? -14.5 : -12;
  if(knabber){ ctx.fillStyle = F.nuss; ctx.beginPath(); ctx.ellipse(8, py - 0.5, 2.1, 2.5, 0.3, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,230,190,.3)'; ctx.beginPath(); ctx.arc(7.4, py - 1.4, 0.7, 0, 7); ctx.fill(); }
  ctx.fillStyle = F.fell; ctx.beginPath(); ctx.ellipse(6.4, py, 2.2, 1.4, 0.4, 0, 7); ctx.fill();
  // Kopf: rundlich, Schnauze, Ohr mit Pinsel, Auge mit hellem Ring
  const nick = knabber ? Math.sin(t*0.03)*0.4 : 0;
  ctx.save(); ctx.translate(4.5, -20 + nick);
  const kopf = new Path2D(); kopf.ellipse(0, 0, 5, 4.4, -0.1, 0, 7); kopf.ellipse(3.6, 1.2, 3, 2.4, 0.15, 0, 7);
  const gk = ctx.createLinearGradient(-5, -4, 4, 4); gk.addColorStop(0, F.fell); gk.addColorStop(1, F.hell);
  ctx.fillStyle = gk; ctx.fill(kopf);
  ctx.fillStyle = F.bauch; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.ellipse(3.4, 2.6, 2.4, 1.2, 0.1, 0, 7); ctx.fill(); ctx.globalAlpha = 1;   // helle Kehle
  ctx.fillStyle = '#1e1410'; ctx.beginPath(); ctx.arc(6.5, 0.6, 0.85, 0, 7); ctx.fill();   // Nase
  ctx.fillStyle = 'rgba(214,190,156,.45)'; ctx.beginPath(); ctx.ellipse(1.6, -1.2, 1.5, 1.25, 0, 0, 7); ctx.fill();   // schmaler, heller Augenring
  ctx.fillStyle = '#0b0807'; ctx.beginPath(); ctx.ellipse(1.7, -1.2, 1.0, 0.95, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(1.95, -1.5, 0.3, 0, 7); ctx.fill();
  // Ohr mit Haarpinsel
  ctx.fillStyle = F.dunkel; ctx.beginPath(); ctx.moveTo(-2.6, -3); ctx.lineTo(-2.2, -8.5); ctx.lineTo(0.6, -3.6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = F.dunkel; ctx.lineWidth = 0.6;
  for(const [dx, dy] of [[-1.2, -2.6], [0, -3], [-2.4, -2]]){ ctx.beginPath(); ctx.moveTo(-2.2, -8); ctx.lineTo(-2.2 + dx, -8 + dy); ctx.stroke(); }
  ctx.restore();
}
