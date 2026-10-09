// 26-kosmetik-daten.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Package-/Loot-System: Katalog, Seltenheiten, Ziehen, Inventar ----------
// Rein kosmetisch: nichts hier verändert Tempo, Sprünge, Kollision, Münzen oder Levelmechanik.
// Jede Figur (m = Affe, f = Schweinchen) hat eigene Packages, eigene Items und eigene Ausrüstung.
// Alle Items sind für rollende Kugeln gedacht: Spuren hinter der Kugel, Auren um sie herum, Begleiter, kreisende
// Objekte, Sonnenbrillen und Tattoos (rollen mit dem Gesicht). (Anhängsel und Kugel-Skins wurden auf Nutzerwunsch entfernt.)

const RARITIES = [
  {id:'empty',     name:'Leer',      chance:0.10,  color:'#9aa3ab', glow:'rgba(180,190,200,.5)'},
  {id:'common',    name:'Gewöhnlich', chance:0.42, color:'#e8eef2', glow:'rgba(232,238,242,.55)'},
  {id:'uncommon',  name:'Ungewöhnlich', chance:0.25, color:'#6fdc6a', glow:'rgba(111,220,106,.6)'},
  {id:'rare',      name:'Selten',    chance:0.13,  color:'#4fa8ff', glow:'rgba(79,168,255,.65)'},
  {id:'epic',      name:'Episch',    chance:0.07,  color:'#b46bff', glow:'rgba(180,107,255,.7)'},
  {id:'legendary', name:'Legendär',  chance:0.025, color:'#ffb52e', glow:'rgba(255,181,46,.8)'},
  {id:'prestige',  name:'Prestige',  chance:0.005, color:'#ff5fd2', glow:'rgba(255,255,255,.9)'},
];
const RARITY = Object.fromEntries(RARITIES.map((r, i) => [r.id, {...r, rank:i}]));
const SLOTS = [
  {id:'trail',  name:'Roll-Spur'},
  {id:'aura',   name:'Aura'},
  {id:'pet',    name:'Begleiter'},
  {id:'orbit',  name:'Kreisende Objekte'},
  {id:'glasses',name:'Sonnenbrille'},
  {id:'tattoo', name:'Tattoo'},
];
// Katalog: id, Name, Slot, Seltenheit, Darstellung (fx) – die Darstellung steckt in 27-kosmetik-zeichnen.js
const COSMETICS = [
  // ---- Gewöhnlich: einfache Spuren, sanfte Auren ----
  {id:'trail_dust',     name:'Staubwölkchen',    slot:'trail',  rarity:'common',   fx:{kind:'puff',   cols:['#d8cbb5','#bfb39d']}},
  {id:'trail_bubbles',  name:'Blubberblasen',    slot:'trail',  rarity:'common',   fx:{kind:'bubble', cols:['#bfe9ff','#e6f7ff']}},
  {id:'trail_leaves',   name:'Blätterspur',      slot:'trail',  rarity:'common',   fx:{kind:'leaf',   cols:['#7cc36b','#a7d86d','#5aa04f']}},
  {id:'aura_soft',      name:'Sanftes Leuchten', slot:'aura',   rarity:'common',   fx:{kind:'glow',   cols:['#fff6d8','#ffe9a8']}},
  {id:'aura_mint',      name:'Minzhauch',        slot:'aura',   rarity:'common',   fx:{kind:'glow',   cols:['#c9ffe9','#8ff0c8']}},
  {id:'orbit_leaf',     name:'Kreisendes Blatt', slot:'orbit',  rarity:'common',   fx:{kind:'leaf',   n:1}},
  // ---- Ungewöhnlich: besondere Spuren, kleine Begleiter ----
  {id:'trail_hearts',   name:'Herzchenspur',     slot:'trail',  rarity:'uncommon', fx:{kind:'heart',  cols:['#ff6f9f','#ff9fc0']}},
  {id:'trail_stars',    name:'Sternchenspur',    slot:'trail',  rarity:'uncommon', fx:{kind:'star',   cols:['#fff27a','#ffd23f']}},
  {id:'trail_slime',    name:'Schleimspur',      slot:'trail',  rarity:'uncommon', fx:{kind:'slime',  cols:['#8be36a','#5cc23f']}},
  {id:'trail_confetti', name:'Konfetti',         slot:'trail',  rarity:'uncommon', fx:{kind:'confetti', cols:['#ff5c6c','#ffd23f','#4fa8ff','#6fdc6a','#b46bff']}},
  {id:'pet_snail',      name:'Schnecke',         slot:'pet',    rarity:'uncommon', fx:{kind:'snail'}},
  {id:'pet_chick',      name:'Küken',            slot:'pet',    rarity:'uncommon', fx:{kind:'chick'}},
  {id:'pet_mouse',      name:'Maus',             slot:'pet',    rarity:'uncommon', fx:{kind:'mouse'}},
  {id:'orbit_hearts',   name:'Herzenkreis',      slot:'orbit',  rarity:'uncommon', fx:{kind:'heart',  n:2}},
  // ---- Selten: besondere Begleiter, starke Partikel, besondere Auren ----
  {id:'trail_fire',     name:'Feuerspur',        slot:'trail',  rarity:'rare',     fx:{kind:'flame',  cols:['#ffd23f','#ff8a2a','#ff4b1f']}},
  {id:'trail_ice',      name:'Eisspur',          slot:'trail',  rarity:'rare',     fx:{kind:'ice',    cols:['#e6fbff','#9fe3ff','#6fc8ff']}},
  {id:'trail_spark',    name:'Funkenspur',       slot:'trail',  rarity:'rare',     fx:{kind:'spark',  cols:['#fffbd0','#ffe066','#9fd4ff']}},
  {id:'aura_fire',      name:'Feuer-Aura',       slot:'aura',   rarity:'rare',     fx:{kind:'flames', cols:['#ffd23f','#ff7a1f']}},
  {id:'aura_ice',       name:'Eis-Aura',         slot:'aura',   rarity:'rare',     fx:{kind:'frost',  cols:['#e6fbff','#8fd8ff']}},
  {id:'aura_toxic',     name:'Gift-Aura',        slot:'aura',   rarity:'rare',     fx:{kind:'toxic',  cols:['#b6ff5c','#5ad13a']}},
  {id:'aura_bubbles',   name:'Blasen-Aura',      slot:'aura',   rarity:'rare',     fx:{kind:'bubbles',cols:['#d9f6ff','#9fe0ff']}},
  {id:'pet_frog',       name:'Frosch',           slot:'pet',    rarity:'rare',     fx:{kind:'frog'}},
  {id:'pet_duck',       name:'Ente',             slot:'pet',    rarity:'rare',     fx:{kind:'duck'}},
  {id:'pet_rabbit',     name:'Kaninchen',        slot:'pet',    rarity:'rare',     fx:{kind:'rabbit'}},
  {id:'orbit_stars',    name:'Sternenkreis',     slot:'orbit',  rarity:'rare',     fx:{kind:'star',   n:3}},
  // ---- Episch: mehrere kreisende Objekte, komplexere Animationen, besondere Formen ----
  {id:'trail_gold',     name:'Goldspur',         slot:'trail',  rarity:'epic',     fx:{kind:'gold',   cols:['#fff1a8','#ffd23f','#d99a00']}},
  {id:'trail_crystal',  name:'Kristallspur',     slot:'trail',  rarity:'epic',     fx:{kind:'crystal',cols:['#e7d6ff','#b38bff','#7fd8ff']}},
  {id:'aura_lightning', name:'Blitz-Aura',       slot:'aura',   rarity:'epic',     fx:{kind:'lightning', cols:['#f4fbff','#8fd0ff']}},
  {id:'aura_magic',     name:'Magie-Aura',       slot:'aura',   rarity:'epic',     fx:{kind:'magic',  cols:['#ff9cf2','#b46bff']}},
  {id:'pet_ghost',      name:'Geistchen',        slot:'pet',    rarity:'epic',     fx:{kind:'ghost'}},
  {id:'pet_bat',        name:'Fledermaus',       slot:'pet',    rarity:'epic',     fx:{kind:'bat'}},
  {id:'orbit_crystals', name:'Kristallkranz',    slot:'orbit',  rarity:'epic',     fx:{kind:'crystal',n:4}},
  {id:'orbit_runes',    name:'Magische Runen',   slot:'orbit',  rarity:'epic',     fx:{kind:'rune',   n:4}},
  // ---- Legendär: sehr auffällige Formen, starke Effekte ----
  {id:'trail_galaxy',   name:'Sternenstaub',     slot:'trail',  rarity:'legendary',fx:{kind:'galaxy', cols:['#ffffff','#9fb4ff','#ff9cf2']}},
  {id:'aura_crystal',   name:'Kristall-Aura',    slot:'aura',   rarity:'legendary',fx:{kind:'shards', cols:['#e7d6ff','#7fd8ff']}},
  {id:'pet_robot',      name:'Mini-Roboter',     slot:'pet',    rarity:'legendary',fx:{kind:'robot'}},
  {id:'pet_mini',       name:'Mini-Ich',         slot:'pet',    rarity:'legendary',fx:{kind:'mini'}},
  {id:'orbit_planets',  name:'Mini-Planeten',    slot:'orbit',  rarity:'legendary',fx:{kind:'planet', n:3}},
  // ---- Prestige: eigene visuelle Identität ----
  {id:'pres_saturn',    name:'Saturn',           slot:'orbit',  rarity:'prestige', fx:{kind:'saturn'}},
  {id:'pres_bubble',    name:'Riesenblase',      slot:'aura',   rarity:'prestige', fx:{kind:'bigbubble'}},
  {id:'pres_inferno',   name:'Inferno',          slot:'aura',   rarity:'prestige', fx:{kind:'inferno'}},
  {id:'pres_rainbow',   name:'Regenbogen',       slot:'trail',  rarity:'prestige', fx:{kind:'rainbow'}},
  // ---- Sonnenbrillen (groß auf den Augen, rollen mit dem Gesicht) ----
  {id:'gl_classic',     name:'Coole Sonnenbrille', slot:'glasses', rarity:'common',    fx:{kind:'classic'}},
  {id:'gl_round',       name:'Retro-Brille',       slot:'glasses', rarity:'common',    fx:{kind:'round'}},
  {id:'gl_aviator',     name:'Pilotenbrille',      slot:'glasses', rarity:'uncommon',  fx:{kind:'aviator'}},
  {id:'gl_shutter',     name:'Gitterbrille',       slot:'glasses', rarity:'uncommon',  fx:{kind:'shutter'}},
  {id:'gl_heart',       name:'Herzbrille',         slot:'glasses', rarity:'rare',      fx:{kind:'heart'}},
  {id:'gl_3d',          name:'3D-Brille',          slot:'glasses', rarity:'rare',      fx:{kind:'3d'}},
  {id:'gl_star',        name:'Sternbrille',        slot:'glasses', rarity:'epic',      fx:{kind:'star'}},
  {id:'gl_cyber',       name:'Cyber-Visier',       slot:'glasses', rarity:'epic',      fx:{kind:'cyber'}},
  {id:'gl_bling',       name:'Gold-Bling-Brille',  slot:'glasses', rarity:'legendary', fx:{kind:'bling'}},
  // ---- Tattoos: Tribal-Muster über die ganze Figur (Augen/Mund bleiben frei), rollen mit ----
  // (ids von früher behalten, damit schon gesammelte Tattoos erhalten bleiben)
  {id:'tat_heart',      name:'Tribal-Streifen',    slot:'tattoo',  rarity:'common',    fx:{kind:'stripes'}},
  {id:'tat_star',       name:'Punkte-Tribal',      slot:'tattoo',  rarity:'common',    fx:{kind:'dots'}},
  {id:'tat_anchor',     name:'Wellen-Tribal',      slot:'tattoo',  rarity:'uncommon',  fx:{kind:'waves'}},
  {id:'tat_lightning',  name:'Zacken-Tribal',      slot:'tattoo',  rarity:'uncommon',  fx:{kind:'zigzag'}},
  {id:'tat_flame',      name:'Flammen-Tribal',     slot:'tattoo',  rarity:'rare',      fx:{kind:'flames'}},
  {id:'tat_tribal',     name:'Maori-Spiralen',     slot:'tattoo',  rarity:'rare',      fx:{kind:'spirals'}},
  {id:'tat_skull',      name:'Drachen-Tribal',     slot:'tattoo',  rarity:'epic',      fx:{kind:'dragon'}},
  {id:'tat_rose',       name:'Dornenranke',        slot:'tattoo',  rarity:'epic',      fx:{kind:'thorns'}},
  {id:'tat_rune',       name:'Glühende Runen',     slot:'tattoo',  rarity:'legendary', fx:{kind:'rune'}},
];
const COSMETIC = Object.fromEntries(COSMETICS.map(c => [c.id, c]));

// ---------- Spielstand der Sammlung (im Browser gespeichert) ----------
const COSMETIC_KEY = 'monchichi_cosmetics_v1';
function cosmeticsBlank(){ return {pending:{m:0, f:0}, owned:{m:{}, f:{}}, equipped:{m:{}, f:{}}, opened:{m:0, f:0}, coins:{m:0, f:0}}; }
let cosmeticsSave = cosmeticsBlank();
try{
  const raw = JSON.parse(localStorage.getItem(COSMETIC_KEY) || 'null');
  if(raw && raw.owned) cosmeticsSave = Object.assign(cosmeticsBlank(), raw);
}catch(e){}
function cosmeticsPersist(){ try{ localStorage.setItem(COSMETIC_KEY, JSON.stringify(cosmeticsSave)); }catch(e){} }
function cosmeticsReset(){ cosmeticsSave = cosmeticsBlank(); cosmeticsPersist(); }
const ownedCount = (who, id) => cosmeticsSave.owned[who][id] || 0;
const equippedItem = (who, slot) => { const id = cosmeticsSave.equipped[who][slot]; return id && COSMETIC[id] ? COSMETIC[id] : null; };

// ---------- Packages vergeben ----------
// Pro geschafftem Level bekommt jede Figur 1 Package, und 1 weiteres, wenn ALLE Münzen des Levels gesammelt wurden
// (also höchstens 2 pro Figur und Level).
function packagesForLevel(allCoins){ return allCoins ? 2 : 1; }
// Münz-Konto je Figur: am Levelende kommen die selbst gesammelten Münzen dazu; für PACKAGE_PRICE gibt es ein Paket
const PACKAGE_PRICE = 200;
function addCoins(m, f){ cosmeticsSave.coins = cosmeticsSave.coins || {m:0, f:0}; cosmeticsSave.coins.m += m || 0; cosmeticsSave.coins.f += f || 0; cosmeticsPersist(); }
function coinBalance(who){ return (cosmeticsSave.coins && cosmeticsSave.coins[who]) || 0; }
function buyPackage(who){
  if(coinBalance(who) < PACKAGE_PRICE) return false;
  cosmeticsSave.coins[who] -= PACKAGE_PRICE; cosmeticsSave.pending[who]++; cosmeticsPersist();
  return true;
}
function awardPackages(allCoins){
  const n = packagesForLevel(allCoins);
  cosmeticsSave.pending.m += n; cosmeticsSave.pending.f += n;
  cosmeticsPersist();
  return n;
}

// ---------- Ziehen mit Duplikat-Schutz ----------
// 1) Seltenheit nach Wahrscheinlichkeit. 2) Item dieser Seltenheit:
//    gewöhnlich/ungewöhnlich: beliebig (Duplikate möglich, aber noch fehlende werden bevorzugt);
//    selten/episch: nur fehlende, solange es welche gibt (sonst Duplikat);
//    legendär/Prestige: nie doppelt – sind alle schon da, wird eine Stufe tiefer gezogen, wo noch etwas fehlt.
function rollRarity(rng){
  let x = (rng || Math.random)(), acc = 0;
  for(const r of RARITIES){ acc += r.chance; if(x < acc) return r.id; }
  return 'common';
}
function pickItem(who, rarity, rng){
  const pool = COSMETICS.filter(c => c.rarity === rarity);
  const missing = pool.filter(c => !ownedCount(who, c.id));
  const pick = list => list[Math.floor(rng()*list.length) % list.length];
  if(rarity === 'common' || rarity === 'uncommon'){
    // fehlende werden bevorzugt (2/3), Duplikate bleiben möglich
    return missing.length && rng() < 0.67 ? pick(missing) : pick(pool);
  }
  if(missing.length) return pick(missing);
  if(rarity === 'rare' || rarity === 'epic'){
    // alles dieser Seltenheit schon da: wenn darunter noch etwas fehlt, lieber das (sonst Duplikat)
    const lower = pickItemBelow(who, RARITY[rarity].rank, rng);
    return lower || pick(pool);
  }
  return pickItemBelow(who, RARITY[rarity].rank, rng) || pick(COSMETICS.filter(c => c.rarity === 'common'));
}
function pickItemBelow(who, rank, rng){
  for(let k = rank - 1; k >= 1; k--){
    const missing = COSMETICS.filter(c => c.rarity === RARITIES[k].id && !ownedCount(who, c.id));
    if(missing.length) return missing[Math.floor(rng()*missing.length) % missing.length];
  }
  return null;
}
// öffnet ein Package der Figur: Ergebnis {empty:true} oder {item, rarity, duplicate}
function openPackage(who, rng){
  rng = rng || Math.random;
  if(cosmeticsSave.pending[who] <= 0) return null;
  cosmeticsSave.pending[who]--;
  cosmeticsSave.opened[who] = (cosmeticsSave.opened[who] || 0) + 1;
  const rarity = rollRarity(rng);
  let result;
  if(rarity === 'empty') result = {empty:true, rarity:'empty'};
  else {
    const item = pickItem(who, rarity, rng);
    const duplicate = ownedCount(who, item.id) > 0;
    cosmeticsSave.owned[who][item.id] = ownedCount(who, item.id) + 1;
    result = {item, rarity:item.rarity, duplicate};
  }
  cosmeticsPersist();
  return result;
}
// ausrüsten (gleicher Slot wird ersetzt); nochmal = ablegen
function equipItem(who, id){
  const it = COSMETIC[id]; if(!it || !ownedCount(who, id)) return false;
  if(cosmeticsSave.equipped[who][it.slot] === id) delete cosmeticsSave.equipped[who][it.slot];
  else cosmeticsSave.equipped[who][it.slot] = id;
  cosmeticsPersist();
  return true;
}
function isEquipped(who, id){ const it = COSMETIC[id]; return !!it && cosmeticsSave.equipped[who][it.slot] === id; }
function collectionCount(who){ return COSMETICS.filter(c => ownedCount(who, c.id)).length; }
