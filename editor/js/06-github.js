// editor/js/06-github.js – Teil des Level-Editors für "Monchichi Koop".
// Alle editor/js/*.js teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags, kein Build)
// und werden in editor/index.html in fester Reihenfolge geladen.
// „☁ Auf GitHub speichern“: Spiel- und Editor-Datei in einem Commit nach main.

// ---------- Auf GitHub speichern ----------
// Schreibt Spiel-Datei (levels/<datei>) und Editor-Datei (levels/editor-format/<datei>) in EINEM Commit nach main
// (GitHub-API, Git-Daten: Baum + Commit + Branch weiterschieben). Danach baut GitHub Pages die Seite neu (1–2 Min).
// Zugang: persönlicher „Fine-grained“-Schlüssel des Nutzers (nur dieses Repo, Contents: Read and write), liegt nur
// im Browser (localStorage). Ohne Schlüssel: Anleitung zum Einrichten.
const GH = {owner:'b48bvggmn7-ops', repo:'koopgame', branch:'main', api:'https://api.github.com', key:'monchichi_github_token'};
const ghBox = document.getElementById('ghBox'), ghStatus = document.getElementById('ghStatus');
const ghToken = () => { try{ return localStorage.getItem(GH.key) || ''; }catch(e){ return ''; } };
function ghSay(t, err){ ghStatus.textContent = t || ''; ghStatus.style.color = err ? '#ff8a80' : 'var(--sub)'; }
function ghShowKey(on){ document.getElementById('ghKeySect').style.display = on ? '' : 'none'; document.getElementById('ghSave').style.display = on ? 'none' : ''; }
async function ghOpen(){
  ghSay(''); ghBox.classList.add('show');
  ghShowKey(!ghToken());
  const sel = document.getElementById('ghTarget'); sel.innerHTML = '';
  try{
    const r = await fetch(PROJECT_DIR+'levels.json', {cache:'no-store'}); if(!r.ok) throw 0;
    const list = await r.json();
    for(const P of list){
      if(P.versteckt) continue;
      const o = document.createElement('option'); o.value = P.datei; o.textContent = `${P.name}${P.titel ? ' – '+P.titel : ''} (${P.datei})`;
      o.dataset.name = P.name || ''; sel.appendChild(o);
    }
    // Ausbau 2: als NEUES Level speichern (nächste freie Nummer), kommt in die gewählte Welt an die gewählte Position
    const n = nextLevelNumber(list), o = document.createElement('option');
    o.value = `level-${n}.json`; o.dataset.neu = '1'; o.dataset.name = `Level ${n}`; o.textContent = `➕ Neues Level ${n} (level-${n}.json)`;
    sel.appendChild(o);
    if(currentProjectFile) sel.value = currentProjectFile;
  }catch(e){ ghSay('Levelliste nicht erreichbar – Editor bitte über die Webseite öffnen.', true); }
}
async function ghApi(path, opt){
  // cache:'no-store': sonst liefert der Browser bis zu 60 s lang den alten Stand von main -> zweites Hochladen
  // kurz hintereinander scheitert mit HTTP 422 („kein Fast-Forward“)
  const r = await fetch(GH.api + '/repos/' + GH.owner + '/' + GH.repo + path, {...(opt||{}), cache:'no-store',
    headers:{'Accept':'application/vnd.github+json', 'Authorization':'Bearer ' + ghToken(), 'Content-Type':'application/json'}});
  if(!r.ok){
    let msg = ''; try{ msg = (await r.json()).message || ''; }catch(e){}
    const e = new Error('HTTP ' + r.status + (msg ? ': ' + msg : '')); e.status = r.status; throw e;
  }
  return r.json();
}
// nächste freie Nummer für „level-N.json“
function nextLevelNumber(list){
  let n = 0;
  for(const P of list || []){ const m = /^level-(\d+)\.json$/.exec(P.datei || ''); if(m) n = Math.max(n, Number(m[1])); }
  return n + 1;
}
// Datei aus dem Repo (Stand eines Commits) als Text holen (Base64 -> UTF-8)
async function ghReadText(path, sha){
  const d = await ghApi('/contents/' + path + '?ref=' + sha);
  const bin = atob(String(d.content || '').replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, ch => ch.charCodeAt(0)));
}
// worlds.json lesbar schreiben: jede Welt in einer Zeile (wie im Projekt)
function formatWorlds(w){
  const head = Object.keys(w).filter(k => k !== 'welten').map(k => ` ${JSON.stringify(k)}: ${JSON.stringify(w[k])}`);
  const val = v => Array.isArray(v) ? '[' + v.map(x => JSON.stringify(x)).join(', ') + ']' : JSON.stringify(v);
  const ws = (w.welten || []).map(x => '  {' + Object.keys(x).map(k => JSON.stringify(k) + ': ' + val(x[k])).join(', ') + '}');
  return '{\n' + head.concat([' "welten": [\n' + ws.join(',\n') + '\n ]']).join(',\n') + '\n}\n';
}
// Level in die gewählte Welt an die gewählte Position setzen (aus allen anderen Welten heraus); Titel/neues Level in levels.json
async function ghProjectFiles(sha, datei, name, neu){
  const out = [];
  const worlds = JSON.parse(await ghReadText('levels/worlds.json', sha));
  const ziel = (worlds.welten || []).find(w => w.id === meta.welt);
  if(!ziel) throw new Error('Welt „' + meta.welt + '“ gibt es in worlds.json nicht');
  for(const w of worlds.welten) w.level = (w.level || []).filter(d => d !== datei);
  const pos = meta.position > 0 ? Math.min(meta.position - 1, ziel.level.length) : ziel.level.length;
  ziel.level.splice(pos, 0, datei);
  out.push({path:'levels/worlds.json', content: formatWorlds(worlds)});
  const list = JSON.parse(await ghReadText('levels/levels.json', sha));
  let L = list.find(x => x.datei === datei), changed = false;
  if(!L){ L = {datei, name}; list.push(L); changed = true; }
  if(meta.titel && L.titel !== meta.titel){ L.titel = meta.titel; changed = true; }
  if(changed) out.push({path:'levels/levels.json', content: JSON.stringify(list, null, 1)});
  return out;
}
async function ghUpload(){
  const sel = document.getElementById('ghTarget'), datei = sel.value, opt = sel.selectedOptions[0];
  if(!datei){ ghSay('Bitte ein Level auswählen.', true); return; }
  if(!ghToken()){ ghShowKey(true); ghSay('Erst den Zugangsschlüssel einrichten.', true); return; }
  const name = (opt && opt.dataset.name) || currentLevelName || datei, neu = !!(opt && opt.dataset.neu);
  const files = [
    {path:'levels/' + datei, content: exportLevel() + '\n'},
    {path:'levels/editor-format/' + datei, content: JSON.stringify({name, ...snapshot()})},
  ];
  const btn = document.getElementById('ghUpload'); btn.disabled = true; ghSay('Wird hochgeladen …');
  try{
    for(let attempt = 0; attempt < 2; attempt++){
      try{
        const ref = await ghApi('/git/ref/heads/' + GH.branch);
        const head = await ghApi('/git/commits/' + ref.object.sha);
        // Ausbau 2: worlds.json (Welt + Position) und ggf. levels.json (Titel, neues Level) im SELBEN Commit anpassen –
        // dafür den aktuellen Stand genau dieses Commits holen
        const extra = await ghProjectFiles(ref.object.sha, datei, name, neu);
        const allFiles = files.concat(extra);
        const tree = await ghApi('/git/trees', {method:'POST', body: JSON.stringify({base_tree: head.tree.sha,
          tree: allFiles.map(f => ({path: f.path, mode:'100644', type:'blob', content: f.content}))})});
        const commit = await ghApi('/git/commits', {method:'POST', body: JSON.stringify({
          message: `${name} im Editor bearbeitet (${datei})`, tree: tree.sha, parents: [ref.object.sha]})});
        await ghApi('/git/refs/heads/' + GH.branch, {method:'PATCH', body: JSON.stringify({sha: commit.sha})});
        currentProjectFile = datei; save(); dirty = false; updateName();
        ghSay(`✓ Gespeichert als ${name}. In 1–2 Minuten ist es online (im Spiel dann Strg + F5).`);
        flash('✓ Auf GitHub gespeichert: ' + name + ' – in 1–2 Min. online');
        setTimeout(()=> ghBox.classList.remove('show'), 1200);   // Fenster schließt sich nach Erfolg von selbst
        return;
      }catch(e){
        if(e.status === 422 && attempt === 0){ await new Promise(r => setTimeout(r, 800)); continue; }   // main hat sich gerade geändert: neu versuchen
        throw e;
      }
    }
  }catch(e){
    const st = e.status;
    ghSay(st === 401 ? 'Schlüssel ungültig oder abgelaufen – bitte neu einrichten.'
        : (st === 403 || st === 404) ? 'Keine Berechtigung – beim Schlüssel „koopgame“ und „Contents: Read and write“ auswählen.'
        : 'Hochladen fehlgeschlagen (' + (e.message || e) + '). Internet prüfen und nochmal versuchen.', true);
    if(st === 401 || st === 403 || st === 404) ghShowKey(true);
  }finally{ btn.disabled = false; }
}
document.getElementById('githubBtn').addEventListener('click', ghOpen);
document.getElementById('ghClose').addEventListener('click', ()=> ghBox.classList.remove('show'));
document.getElementById('ghUpload').addEventListener('click', ghUpload);
document.getElementById('ghKeyShow').addEventListener('click', ()=> ghShowKey(true));
document.getElementById('ghKeySave').addEventListener('click', ()=>{
  const t = document.getElementById('ghToken').value.trim();
  if(!/^(github_pat_|ghp_)/.test(t)){ ghSay('Das sieht nicht wie ein GitHub-Schlüssel aus (beginnt mit „github_pat_“).', true); return; }
  try{ localStorage.setItem(GH.key, t); }catch(e){ ghSay('Konnte nicht gespeichert werden.', true); return; }
  document.getElementById('ghToken').value = ''; ghShowKey(false); ghSay('Schlüssel gespeichert – jetzt „Hochladen“.');
});
document.getElementById('ghForget').addEventListener('click', ()=>{
  try{ localStorage.removeItem(GH.key); }catch(e){}
  ghShowKey(true); ghSay('Schlüssel aus diesem Browser entfernt.');
});
