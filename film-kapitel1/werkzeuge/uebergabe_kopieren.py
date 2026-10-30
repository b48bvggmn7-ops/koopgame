import os, shutil, gzip, subprocess
S = os.path.dirname(os.path.abspath(__file__)); Z = os.path.join(S, 'uebergabe', 'film-kapitel1')
kopiert = set()   # Quellpfade (relativ zu S), die übernommen wurden
def cp(rel, ziel=None):
    q = os.path.join(S, rel); d = os.path.join(Z, ziel or rel); os.makedirs(os.path.dirname(d), exist_ok=True)
    if os.path.isdir(q): shutil.copytree(q, d, dirs_exist_ok=True)
    else: shutil.copy2(q, d)
    kopiert.add(rel)
groesse = lambda p: int(subprocess.run(['du', '-sb', p], capture_output=True, text=True).stdout.split()[0])
# Blender: alle Skripte, kleine Daten/Bilder, aktueller Bewegungsstand (gepackt), aktuelle Tonspuren
for f in sorted(os.listdir(S + '/blender')):
    p = S + '/blender/' + f
    if os.path.isfile(p) and (f.endswith(('.py', '.sh')) or ((os.path.getsize(p) < 3e6 and f.endswith(('.json', '.png'))) or (os.path.getsize(p) < 2e5 and f.endswith('.txt')) and not f.startswith(('render_', 'vs_blender')))):
        cp('blender/' + f)
for f in ('ton_film13.wav', 'ton_film13.json', 'ton13_ganz.wav'): cp('blender/' + f)
os.makedirs(Z + '/blender', exist_ok=True)
with open(S + '/blender/film_voll9.json', 'rb') as a, gzip.open(Z + '/blender/film_voll9.json.gz', 'wb', 9) as b: shutil.copyfileobj(a, b)
kopiert.add('blender/film_voll9.json')
for d in ('flug_haus', 'flug_haus_innen'): cp('blender/' + d)
cp('blender/himmel2/h_0000.png')
for f in sorted(os.listdir(S + '/blender/film_vs12h')):
    if f.startswith('hintergrund_'): cp('blender/film_vs12h/' + f, 'blender/hintergruende_vorschau12/' + f)
# Prototyp (Bewegung/Regie im Browser): Quelltexte + Skripte
cp('prototyp/src')
for f in sorted(os.listdir(S + '/prototyp')):
    if f.endswith('.py'): cp('prototyp/' + f)
# Ton, Stimmen, Aufnahme-Seite, Werkzeuge
cp('sounds'); cp('sprechstudio'); cp('stimmen_affe1/liste.txt', 'sounds/stimmen/liste_aus_zip.txt')
for f in ('stimmen_aufbereiten.py', 'schritt_holen.py', 'pizz_bauen.py', 'uebergabe_kopieren.py'): cp(f, 'werkzeuge/' + f)
cp('tts/erzeugen.py'); cp('tts/saetze')
# Videos
for f in sorted(os.listdir(S + '/seite_film')):
    if f.endswith(('.mp4', '.mp3', '.py')) or f == 'vorlage.html': cp('seite_film/' + f, 'videos/' + f)
# Liste der nicht hochgeladenen Dinge (Ordner der Arbeitsumgebung, die nicht übernommen wurden)
zeilen = []
for top in ('blender', 'prototyp', 'tts', 'seite_film', 'sounds'):
    for f in sorted(os.listdir(S + '/' + top)):
        rel = top + '/' + f
        if rel in kopiert: continue
        if any(k.startswith(rel + '/') for k in kopiert):
            zeilen.append((groesse(S + '/' + rel), rel + ' (nur einzelne Dateien daraus übernommen)')); continue
        zeilen.append((groesse(S + '/' + rel), rel))
zeilen.sort(reverse=True)
mb = lambda b: f'{b/1e6:,.1f} MB'.replace(',', '.')
with open(Z + '/NICHT-HOCHGELADEN.md', 'w') as o:
    o.write('# Nicht hochgeladen (zu groß oder neu erzeugbar)\n\nAlles aus der alten Arbeitsumgebung (Cloud-Sitzung, Ordner `scratchpad/`), was NICHT im Zweig liegt. Größe = gesamter Ordner bzw. Datei.\n'
            'Fast alles davon wird von den Skripten neu erzeugt (siehe VIDEO-UEBERGABE.md, Abschnitt „Befehle“).\n\n| Größe | Pfad (alte Umgebung) |\n|---:|---|\n')
    for b, rel in zeilen: o.write(f'| {mb(b)} | `{rel}` |\n')
    o.write(f'\n**Summe nicht hochgeladen:** {mb(sum(b for b, _ in zeilen))}\n')
print('nicht hochgeladen:', len(zeilen), mb(sum(b for b, _ in zeilen)))
