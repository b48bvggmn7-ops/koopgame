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
    for(const P of (await r.json())){
      if(P.versteckt) continue;
      const o = document.createElement('option'); o.value = P.datei; o.textContent = `${P.name}${P.titel ? ' – '+P.titel : ''} (${P.datei})`;
      o.dataset.name = P.name || ''; sel.appendChild(o);
    }
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
async function ghUpload(){
  const sel = document.getElementById('ghTarget'), datei = sel.value, opt = sel.selectedOptions[0];
  if(!datei){ ghSay('Bitte ein Level auswählen.', true); return; }
  if(!ghToken()){ ghShowKey(true); ghSay('Erst den Zugangsschlüssel einrichten.', true); return; }
  const name = (opt && opt.dataset.name) || currentLevelName || datei;
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
        const tree = await ghApi('/git/trees', {method:'POST', body: JSON.stringify({base_tree: head.tree.sha,
          tree: files.map(f => ({path: f.path, mode:'100644', type:'blob', content: f.content}))})});
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
