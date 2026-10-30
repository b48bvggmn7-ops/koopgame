P='/tmp/claude-0/-home-user-koopgame/f80d235d-472d-51e4-84ca-119d3eca1c23/scratchpad/prototyp'
r=lambda f: open(P+'/src/'+f).read()
eng=r('engine_head.js')+r('engine_core.js')+r('engine_tail.js')
open(P+'/engine.js','w').write(eng)
js='\n'.join([eng, r('skript.js'), r('ton.js'), r('stimmen.js'), r('zimmerbild.js'), r('aussenbild.js'), r('bild.js'), r('vorhang.js'), r('regie.js')])
html=r('seite.html').replace('/*SKRIPT*/', js)
open(P+'/kapitel1.html','w').write(html)
# lokale Testfassung mit Seitengerüst
open(P+'/kapitel1_lokal.html','w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>'+html+'</body></html>')
print(len(html))
