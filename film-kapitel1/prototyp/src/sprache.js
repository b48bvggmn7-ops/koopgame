// ===== Echte Sprache (Sprachausgabe des Browsers, deutsche Stimmen) =====
// Schweinchen ganz hell, Affe normal, Professor tief. Die Stimmen kommen vom Gerät (Windows/Mac/Handy) – je nach Gerät
// klingen sie verschieden. Platzhalter, bis echte Aufnahmen da sind.
const SPRACHE = (function(){
  const geht = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let stimmen = [];
  function laden(){ if(geht) stimmen = speechSynthesis.getVoices().filter(v => /^de(-|_|$)/i.test(v.lang)); }
  if(geht){ laden(); speechSynthesis.addEventListener('voiceschanged', laden); }
  const MANN = /conrad|stefan|markus|hans|killian|florian|jonas|bernd|ralf|yannick|klaus|male|mann/i;
  const FRAU = /katja|hedda|anna|petra|marlene|vicki|amala|seraphina|louisa|elke|helena|female|frau|google/i;
  const PROFIL = {
    schwein: {pitch: 2.0, rate: 1.06, typ: 'frau'},
    affe:    {pitch: 1.25, rate: 1.1, typ: 'mann'},
    prof:    {pitch: .25, rate: .84, typ: 'mann'},
  };
  function stimmeFuer(typ){
    if(!stimmen.length) return null;
    const lokal = stimmen.filter(v => v.localService);
    const suche = l => l.find(v => (typ === 'mann' ? MANN : FRAU).test(v.name));
    return suche(lokal) || suche(stimmen) || lokal[0] || stimmen[0];
  }
  // spricht einen Satz; ereignisse: {grenze(i), ende()}
  function sprich(wer, text, leise, ev){
    if(!geht || !stimmen.length) return false;
    const p = PROFIL[wer], u = new SpeechSynthesisUtterance(text.replace(/\b([A-ZÄÖÜ])([A-ZÄÖÜ]+)\b/g, (m, a, b) => a + b.toLowerCase()));
    const v = stimmeFuer(p.typ); if(v){ u.voice = v; u.lang = v.lang; } else u.lang = 'de-DE';
    u.pitch = p.pitch; u.rate = p.rate; u.volume = leise ? .55 : 1;
    u.onboundary = e => { if(ev.grenze) ev.grenze(e.charIndex + (e.charLength || 0)); };
    u.onend = () => { if(ev.ende) ev.ende(); };
    u.onerror = () => { if(ev.ende) ev.ende(); };
    speechSynthesis.cancel(); speechSynthesis.speak(u);
    return true;
  }
  function stopp(){ if(geht) speechSynthesis.cancel(); }
  return {sprich, stopp, verfuegbar: () => geht && stimmen.length > 0, PROFIL};
})();
