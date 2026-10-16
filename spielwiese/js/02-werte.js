// 02-werte.js – Spielwiese: alle einstellbaren Werte (Live-Tuning-Panel, Taste Tab) und die Varianten je Mechanik.
// Neue Werte nur hier eintragen – das Panel baut sich daraus selbst auf.

const WERTE_LISTE = [];   // {gruppe, key, name, std, min, max, schritt, art: 'zahl' | 'schalter', hilfe}
const V = {};             // aktuelle Werte (überall im Code: V.schwerkraft …)
function wert(gruppe, key, name, std, min, max, schritt, hilfe){
  WERTE_LISTE.push({gruppe, key, name, std, min, max, schritt, art: 'zahl', hilfe}); V[key] = std;
}
function schalter(gruppe, key, name, std, hilfe){
  WERTE_LISTE.push({gruppe, key, name, std, art: 'schalter', hilfe}); V[key] = std;
}

// ---------- Allgemein ----------
wert('Allgemein', 'spieltempo', 'Spieltempo', 0.9, 0.3, 1.5, 0.05, 'wie im Spiel 0,9 (alles 10 % langsamer); 1 = normal');

// ---------- Laufen & Springen (Startwerte = echtes Spiel) ----------
const G_LAUF = 'Laufen & Springen';
schalter(G_LAUF, 'laufWieSpiel', 'Laufen wie im Spiel', true, 'an: kräftiger Schub je Schritt, nach ~0,1 s volles Tempo (7,2), ohne Taste bremst der Boden · aus: weiches Anlaufen mit langsamem Sprint (Spielwiese bisher)');
wert(G_LAUF, 'laufSchub', 'Wie im Spiel: Schub je Schritt (× Lauftempo)', 0.35, 0.05, 1, 0.01);
wert(G_LAUF, 'spielSprint', 'Wie im Spiel: Sprint-Zuwachs', 0.045, 0, 0.3, 0.005);
wert(G_LAUF, 'bodenReibung', 'Wie im Spiel: Bremsen am Boden (je Schritt bleibt)', 0.78, 0.3, 0.99, 0.01);
wert(G_LAUF, 'luftReibung', 'Wie im Spiel: Bremsen in der Luft (je Schritt bleibt)', 0.94, 0.5, 1, 0.005);
wert(G_LAUF, 'luftKontrolle', 'Wie im Spiel: Lenken in der Luft (Anteil)', 0.85, 0.1, 1, 0.05);
wert(G_LAUF, 'laufTempo', 'Lauftempo', 4.4, 1, 10, 0.1, 'px pro Schritt');
schalter(G_LAUF, 'sprint', 'Anlauf-Sprint (wie im Spiel)', true, 'wer lange in eine Richtung läuft, wird schneller');
wert(G_LAUF, 'sprintTempo', 'Sprint-Höchsttempo', 7.2, 4, 14, 0.1);
wert(G_LAUF, 'sprintZuwachs', 'Sprint-Aufbau', 0.022, 0.005, 0.1, 0.001, 'wie schnell der Sprint anläuft');
wert(G_LAUF, 'bodenBeschl', 'Griff am Boden', 0.22, 0.02, 1, 0.01, '1 = sofort volles Tempo');
wert(G_LAUF, 'bodenBremse', 'Bremsen am Boden', 0.25, 0.02, 1, 0.01, '1 = steht sofort');
wert(G_LAUF, 'luftBeschl', 'Lenken in der Luft', 0.13, 0.01, 1, 0.01);
wert(G_LAUF, 'luftBremse', 'Bremsen in der Luft', 0.03, 0, 0.5, 0.01, 'ohne Taste: wie viel Schwung pro Schritt verloren geht');
wert(G_LAUF, 'schwerkraft', 'Schwerkraft', 0.62, 0.1, 2, 0.01);
wert(G_LAUF, 'maxFall', 'Höchste Fallgeschwindigkeit', 15, 4, 30, 0.5);
wert(G_LAUF, 'sprungKraft', 'Sprungkraft', 12.6, 5, 25, 0.1, 'reicht wie im Spiel für ca. 3,2 Kästchen');
schalter(G_LAUF, 'variablerSprung', 'Kurz drücken = kleiner Sprung', true);
wert(G_LAUF, 'sprungAbbruch', 'Kleiner Sprung: Rest-Tempo', 6.4, 0, 15, 0.1, 'Aufwärts-Tempo beim frühen Loslassen');
wert(G_LAUF, 'coyote', 'Coyote-Time (Schritte)', 6, 0, 20, 1, 'so lange nach der Kante darf man noch springen');
wert(G_LAUF, 'sprungPuffer', 'Sprung-Puffer (Schritte)', 6, 0, 20, 1, 'so früh vor der Landung zählt der Druck schon');
wert(G_LAUF, 'gipfelBand', 'Schwebe-Gipfel: Bereich', 2.2, 0.5, 6, 0.1, 'Variante B: so langsam muss man am Gipfel sein');
wert(G_LAUF, 'gipfelSchwer', 'Schwebe-Gipfel: Schwerkraft', 0.45, 0.1, 1, 0.05, 'Variante B: Anteil der Schwerkraft am Gipfel');
wert(G_LAUF, 'fallSchwer', 'Schwer fallen: Faktor', 1.6, 1, 3, 0.05, 'Variante C: Schwerkraft beim Fallen');
wert(G_LAUF, 'mondSchwer', 'Mondsprung: Schwerkraft', 0.45, 0.1, 1, 0.05, 'Variante D');
wert(G_LAUF, 'mondKraft', 'Mondsprung: Sprungkraft', 0.75, 0.3, 1.5, 0.05, 'Variante D: Anteil der Sprungkraft');

// ---------- Wand ----------
const G_WAND = 'Wand';
schalter(G_WAND, 'wandsprung', 'Wandsprung an', true);
wert(G_WAND, 'wandSprungX', 'Wandsprung: weg von der Wand', 7.5, 2, 16, 0.1);
wert(G_WAND, 'wandSprungY', 'Wandsprung: nach oben', 12.8, 4, 20, 0.1);
wert(G_WAND, 'wandFenster', 'Wandsprung-Fenster (Schritte)', 10, 0, 30, 1, 'so lange nach dem Wandkontakt klappt er noch');
wert(G_WAND, 'wandSperre', 'Lenk-Sperre danach (Schritte)', 9, 0, 30, 1, 'kurz nicht zurücklenken -> sauberer Kamin');
wert(G_WAND, 'wandRutschen', 'Rutschen an der Wand (Tempo)', 2.4, 0.5, 15, 0.1);
wert(G_WAND, 'wandSpielXmin', 'Wie im Spiel: weg ohne Schwung', 6.96, 2, 16, 0.1, 'Variante B: Wandsprung ohne Anlauf');
wert(G_WAND, 'wandSpielXmax', 'Wie im Spiel: weg mit vollem Schwung', 12.8, 2, 20, 0.1, 'Variante B: mit vollem Sprint an die Wand');
wert(G_WAND, 'wandSpielYmin', 'Wie im Spiel: hoch ohne Schwung', 14.4, 4, 22, 0.1);
wert(G_WAND, 'wandSpielYmax', 'Wie im Spiel: hoch mit vollem Schwung', 16.06, 4, 24, 0.1);

// ---------- Kantenhilfe (Vorschlag aus Teil 1) ----------
const G_KANTE = 'Kantenhilfe';
schalter(G_KANTE, 'kantenhilfe', 'Kantenhilfe an', true, 'Kopf knapp an einer Ecke: man rutscht vorbei statt hängen zu bleiben');
wert(G_KANTE, 'kantenPx', 'Kantenhilfe: bis zu (px)', 12, 1, 24, 1, 'so weit wird die Figur höchstens seitlich geschoben');
wert(G_KANTE, 'kantenStufe', 'Stufenhilfe beim Dash (px)', 14, 0, 30, 1, 'Dash knapp gegen eine Kante: Figur hüpft hinauf');

// ---------- Dash (Teil 2) ----------
const G_DASH = 'Dash';
schalter(G_DASH, 'dashLangsam', 'Dash lädt langsam auf', true, 'an: jeder Dash (auch am Boden) kostet einen Punkt, der sich über die Zeit wieder füllt · aus: wie vorher (Landung/Wand/Haken füllen sofort)');
wert(G_DASH, 'dashLadeZeit', 'Aufladen: Zeit je Punkt (Sekunden)', 0.9, 0.1, 4, 0.05, 'so lange dauert es, bis ein Dash wieder da ist');
schalter(G_DASH, 'dashLadenNurBoden', 'Aufladen nur am Boden', false, 'aus: lädt auch in der Luft (langsam)');
wert(G_DASH, 'dashDauer', 'Dauer (Schritte)', 10, 4, 24, 1);
wert(G_DASH, 'dashTempo', 'Tempo (px pro Schritt)', 16, 6, 30, 0.5);
wert(G_DASH, 'dashBehalten', 'Tempo danach behalten', 0.5, 0, 1, 0.05, '0,5 = die Hälfte; nach oben höchstens Sprungkraft');
wert(G_DASH, 'dashLuft', 'Luft-Dashes (4 = unbegrenzt)', 1, 1, 4, 1, 'wieder voll: Landung, neue Wandberührung (später Haken)');
wert(G_DASH, 'dashPuffer', 'Puffer (Schritte)', 5, 0, 15, 1, 'zu früh gedrückt (z. B. kurz vor der Landung): klappt trotzdem');
wert(G_DASH, 'dashPause', 'Pause danach am Boden (Schritte)', 6, 0, 30, 1, 'gegen Dauer-Dashen am Boden');
wert(G_DASH, 'dashStopp', 'Kurzer Stopp beim Start (Schritte)', 2, 0, 6, 1, 'Trefferstopp-Gefühl beim Losdashen');
wert(G_DASH, 'dashGleitZeit', 'B: Gleitzeit danach (Schritte)', 30, 0, 90, 1, 'Variante B: so lange bleibt der Schwung');
wert(G_DASH, 'dashLenken', 'B: Lenken während des Dashs', 0.12, 0, 0.5, 0.01, 'Variante B');
wert(G_DASH, 'hyperX', 'C: Dash-Sprung weit', 13, 6, 24, 0.5, 'Variante C: Tempo nach vorn');
wert(G_DASH, 'hyperY', 'C: Dash-Sprung hoch (× Sprung)', 1.1, 0.5, 2, 0.05, 'Variante C');
wert(G_DASH, 'hyperFenster', 'C: Fenster nach dem Dash (Schritte)', 6, 0, 20, 1, 'so lange nach dem Dash zählt der Sprung noch');
wert(G_DASH, 'abbruchBehalten', 'D: Tempo beim Abbrechen', 0.7, 0, 1, 0.05, 'Variante D');
wert(G_DASH, 'abbruchHop', 'D: kleiner Hüpfer in der Luft', 5, 0, 12, 0.5, 'Variante D: Abbruch in der Luft');
// ---------- Haken (Teil 3) ----------
const G_HAKEN = 'Haken';
schalter(G_HAKEN, 'hakenHalten', 'Taste halten (aus = drücken zum An/Los)', true, 'halten: loslassen = Seil los · drücken: nochmal drücken = los bzw. zum nächsten Anker');
wert(G_HAKEN, 'hakenReichweite', 'Reichweite (px)', 600, 200, 1000, 10, 'wird nicht als Kreis gezeigt');
wert(G_HAKEN, 'hakenPuffer', 'Puffer (Schritte)', 10, 0, 30, 1, 'K zu früh gedrückt (Anker noch verdeckt): greift, sobald einer auftaucht');
wert(G_HAKEN, 'hakenFlug', 'Flugzeit der Liane (Schritte)', 6, 1, 15, 1);
wert(G_HAKEN, 'zielRichtung', 'Ziel: Gewicht Blick-/Stickrichtung', 1, 0, 3, 0.05, 'wie stark die gedrückte Richtung zählt');
wert(G_HAKEN, 'zielOben', 'Ziel: Gewicht „nach oben“', 0.6, 0, 3, 0.05);
wert(G_HAKEN, 'zielNaehe', 'Ziel: Gewicht „nah“', 0.5, 0, 3, 0.05);
schalter(G_HAKEN, 'fehlschussZeigen', 'Ohne Ziel: Liane kurz ins Leere', false, 'aus: ohne Anker in Reichweite passiert nichts (nur ein leises Klicken)');
schalter(G_HAKEN, 'perfektAn', 'Perfektes Loslassen (Extra-Schub)', true, 'loslassen vorn im Aufschwung: Liane leuchtet golden, Loslassen gibt Extra-Schub');
wert(G_HAKEN, 'perfektBoost', 'Perfekt: Extra-Schub (× Tempo)', 1.18, 1, 1.6, 0.01);
wert(G_HAKEN, 'perfektVon', 'Perfekt: Fenster ab Winkel (°)', 30, 0, 89, 1, '0° = genau unter dem Anker, 90° = waagerecht');
wert(G_HAKEN, 'perfektBis', 'Perfekt: Fenster bis Winkel (°)', 70, 1, 120, 1);
schalter(G_HAKEN, 'gummiLiane', 'Gummi-Liane', false, 'die Liane gibt nach und schnellt zurück (Katapult)');
wert(G_HAKEN, 'gummiHaerte', 'Gummi: Härte', 0.06, 0.01, 0.3, 0.005, 'klein = weich und weit dehnbar');
wert(G_HAKEN, 'gummiDaempfung', 'Gummi: Nachfedern (1 = ewig)', 0.9, 0.5, 1, 0.01);
wert(G_HAKEN, 'gummiMax', 'Gummi: höchstens dehnen (Anteil)', 0.6, 0.1, 1.5, 0.05);
schalter(G_HAKEN, 'ketteAn', 'Nahtlose Kette', true, 'K kurz nach dem Loslassen wieder drücken: die nächste Liane sitzt sofort, ohne Flugzeit');
wert(G_HAKEN, 'kettenFenster', 'Kette: Fenster (Schritte)', 12, 1, 40, 1, 'so lange nach dem Loslassen zählt das neue Drücken als Kette');
wert(G_HAKEN, 'schwankWeite', 'Schwankender Anker: Weite (px)', 70, 10, 200, 5);
wert(G_HAKEN, 'schwankTempo', 'Schwankender Anker: Tempo', 0.45, 0.1, 2, 0.05, 'Hin und her pro Sekunde');
wert(G_HAKEN, 'einmalZeit', 'Einmal-Anker: hält (Sekunden)', 1.6, 0.3, 5, 0.1, 'dann reißt er (oder sofort beim Loslassen)');
wert(G_HAKEN, 'einmalZurueck', 'Einmal-Anker: wieder da nach (s)', 3, 0.5, 10, 0.5);
wert(G_HAKEN, 'ringBoost', 'Schwung-Ring: Beschleunigung (×)', 1.3, 1, 2, 0.05);
wert(G_HAKEN, 'ringMax', 'Schwung-Ring: Höchsttempo', 22, 10, 35, 0.5);
schalter(G_HAKEN, 'zielRing', 'Zielanker vorher zeigen (Ring)', true);
wert(G_HAKEN, 'seilStartMax', 'Straffen auf höchstens (px)', 260, 80, 700, 10, 'nach dem Greifen zieht sich die Liane auf diese Länge zusammen');
wert(G_HAKEN, 'straffTempo', 'Straffen: Tempo (px pro Schritt)', 9, 1, 30, 0.5);
wert(G_HAKEN, 'schwungKraft', 'Schwung holen (links/rechts)', 0.22, 0, 1, 0.01);
wert(G_HAKEN, 'seilDaempfung', 'Dämpfung (1 = keine)', 0.995, 0.95, 1, 0.001, 'je Schritt bleibt so viel vom Tempo');
wert(G_HAKEN, 'seilRan', 'Seil ranziehen (W)', 3, 0.5, 10, 0.1);
wert(G_HAKEN, 'seilGeben', 'Seil geben (S)', 4, 0.5, 10, 0.1);
wert(G_HAKEN, 'rutschMax', 'Rutschen: Höchsttempo (S halten)', 12, 4, 25, 0.5, 'wer S hält, rutscht immer schneller hinunter');
wert(G_HAKEN, 'rutschBeschl', 'Rutschen: Beschleunigung', 0.35, 0, 2, 0.05);
wert(G_HAKEN, 'seilMin', 'Kürzestes Seil (px)', 50, 20, 200, 5);
wert(G_HAKEN, 'abwurfBoost', 'Abwurf-Boost (× Tempo)', 1.15, 1, 2, 0.01, 'beim Loslassen');
wert(G_HAKEN, 'abwurfHoch', 'Abwurf: Extra nach oben', 3, 0, 10, 0.1);
wert(G_HAKEN, 'abwurfMax', 'Abwurf: Höchsttempo', 17, 8, 30, 0.5);
wert(G_HAKEN, 'seilSprung', 'Springen am Seil: Hüpfer', 7, 0, 16, 0.5, 'Leertaste am Seil = loslassen + Hüpfer (an der Wand: Wandsprung)');
wert(G_HAKEN, 'magnetZug', 'C: Magnet zieht (px pro Schritt)', 5, 0.5, 15, 0.5, 'Variante C');
wert(G_HAKEN, 'magnetAnteil', 'C: Magnet bis Anteil der Länge', 0.5, 0.1, 1, 0.05, 'Variante C: so weit zieht er');
wert(G_HAKEN, 'ankerBonus', 'B: Vorrang für echte Anker', 0.3, 0, 2, 0.05, 'Variante B: Anker vor beliebigen Flächen');

// ---------- Unterseite: Haften und Rollen (Teil 4) ----------
const G_HAFT = 'Unterseite';
schalter(G_HAFT, 'haftAuto', 'A/C: automatisch greifen (ohne L)', false, 'aus: L halten zum Festhalten · an: Berühren von unten reicht');
wert(G_HAFT, 'haftTempo', 'A/C: Tempo an der Decke', 4.2, 1, 10, 0.1);
wert(G_HAFT, 'haftBeschl', 'A/C: Griff an der Decke', 0.25, 0.02, 1, 0.01);
wert(G_HAFT, 'haftAbsprungY', 'A/C: Absprung nach unten', 3, 0, 12, 0.5, 'Leertaste an der Decke');
wert(G_HAFT, 'haftAbsprungX', 'A/C: Absprung nach vorn', 5, 0, 14, 0.5);
schalter(G_HAFT, 'haftKante', 'A/C: am Ende der Fläche anhalten (Rail)', true, 'aus: am Ende fällt man herunter');
schalter(G_HAFT, 'rollUmschalten', 'B: L drücken schaltet Rollen an/aus', false, 'aus: L halten = rollen');
wert(G_HAFT, 'rollBeschl', 'B: Rollen beschleunigen', 0.28, 0.02, 1.5, 0.01);
wert(G_HAFT, 'rollMax', 'B: Rollen Höchsttempo (mit Taste)', 11, 3, 25, 0.5, 'Rampen und Schwung dürfen schneller machen');
wert(G_HAFT, 'rollReibung', 'B: Rollen ausrollen (1 = nie bremsen)', 0.992, 0.95, 1, 0.001);
wert(G_HAFT, 'rollSchwer', 'B: Schwerkraft beim Rollen (× normal)', 1, 0, 2, 0.05, 'zieht auf Rampen und an Wänden');
wert(G_HAFT, 'rollKlebSchwer', 'B: Schwerkraft auf Haftflächen (× normal)', 0.25, 0, 1, 0.05, 'klein = Wände hochrollen geht auch langsam');
wert(G_HAFT, 'rollFang', 'B: Haftflächen fangen ab (px)', 6, 0, 20, 1, 'so weit darf die Kugel abheben und bleibt trotzdem kleben');
wert(G_HAFT, 'rollSprung', 'B: Absprung von der Fläche', 9, 2, 18, 0.5, 'Leertaste beim Rollen: weg von der Fläche');

// ---------- Durchbruch (Teil 5) ----------
const G_BRUCH = 'Durchbruch';
wert(G_BRUCH, 'bruchBehalten', 'Tempo nach dem Bruch behalten', 0.8, 0.2, 1, 0.05, 'je zerbrochener Wand');
wert(G_BRUCH, 'bruchStopp', 'Trefferstopp beim Bruch (Schritte)', 3, 0, 10, 1);
wert(G_BRUCH, 'bruchWackeln', 'Wackeln beim Bruch', 0.35, 0, 1, 0.05);
wert(G_BRUCH, 'bruchFenster', 'Durchbruch-Fenster (Schritte)', 14, 0, 40, 1, 'so lange danach geht noch ein Dash oder Sprung (auch ohne Dash-Punkt)');
wert(G_BRUCH, 'bruchStuecke', 'Bruchstücke je Kästchen', 7, 0, 20, 1);
wert(G_BRUCH, 'abprall', 'Abprallen ohne Dash', 0.5, 0, 1.2, 0.05, 'wer nur läuft oder springt, prallt so stark zurück');
wert(G_BRUCH, 'nachwachsZeit', 'B: wächst nach (Sekunden)', 3, 0.5, 15, 0.5, 'Variante B');
wert(G_BRUCH, 'bruchTempo', 'C: nötiges Tempo', 21, 10, 40, 0.5, 'Variante C: Dash-Tempo + Schwung davor (z. B. aus dem Seil) muss so hoch sein');

// ---------- Ideen-Schalter (Vorschläge 1–4) ----------
wert(G_DASH, 'kristallZeit', 'Dash-Kristall: wieder da nach (Sekunden)', 2.5, 0.5, 10, 0.5, 'Kristalle (grüne Rauten) laden den Dash in der Luft auf');
schalter(G_DASH, 'kristallNurLeer', 'Kristall nur nehmen, wenn Dash leer', true, 'aus: jeder Kristall wird beim Berühren verbraucht');
wert(G_BRUCH, 'bruchForm', 'Lochgröße: 0 Figur · 1 3×3 · 2 ganze Säule', 0, 0, 2, 1, 'größere Löcher: kein Wandstumpf mehr, fühlt sich saftiger an');
schalter(G_HAKEN, 'seilKnick', 'Liane knickt an Ecken', false, 'an: die Liane wickelt sich um Ecken statt durch sie zu schneiden');
schalter(G_HAFT, 'rollUmlenken', 'B: Schwung auch an normalen Wänden umlenken', false, 'wie in einer Halfpipe: an Wänden hochrollen, oben fällt man wieder ab');

schalter(G_DASH, 'dashPunkte', 'Dash-Punkte über der Figur', true, 'zeigt, wie viele Luft-Dashes noch da sind');

// ---------- Kamera ----------
const G_KAM = 'Kamera';
wert(G_KAM, 'kameraWeich', 'Kamera folgt (weich ↔ hart)', 0.12, 0.02, 1, 0.01);
wert(G_KAM, 'kameraVoraus', 'Blick nach vorn (px)', 140, 0, 400, 10);
wert(G_KAM, 'kameraPos', 'Figur im Bild (links ↔ rechts)', 0.42, 0.2, 0.8, 0.01);

// ---------- Spielgefühl-Hilfen (einzeln zuschaltbar) ----------
const G_GEF = 'Spielgefühl';
schalter(G_GEF, 'fxWackeln', 'Bildschirmwackeln', true);
wert(G_GEF, 'wackelStaerke', 'Wackeln: Stärke', 1, 0, 3, 0.05);
schalter(G_GEF, 'fxStopp', 'Trefferstopp (Hitstop)', true, 'Spiel hält für wenige Schritte an');
wert(G_GEF, 'stoppFaktor', 'Trefferstopp: Länge', 1, 0, 4, 0.1);
schalter(G_GEF, 'fxStaub', 'Staub und Partikel', true);
wert(G_GEF, 'staubMenge', 'Staub: Menge', 1, 0, 3, 0.1);
schalter(G_GEF, 'fxNachbilder', 'Nachbilder (Tempo-Spur)', true);
wert(G_GEF, 'nachbildTempo', 'Nachbilder ab Tempo', 11, 2, 25, 0.5, 'darunter keine Spur (Laufen erreicht 7,2 – darüber nur Dash, Seil, Ringe)');
schalter(G_GEF, 'fxDehnen', 'Dehnen und Stauchen', true);
wert(G_GEF, 'dehnStaerke', 'Dehnen: Stärke', 1, 0, 2.5, 0.05);
wert(G_GEF, 'hartLandung', 'Harte Landung ab Falltempo', 13, 6, 30, 0.5, 'dann Wackeln + kurzer Stopp');
schalter(G_GEF, 'fxTon', 'Töne', true);
wert(G_GEF, 'lautstaerke', 'Lautstärke', 0.5, 0, 1, 0.05);

// ---------- Aussehen ----------
schalter('Aussehen', 'spielLook', 'Spiel-Look (Dschungel wie im Spiel)', true, 'aus: schlichte Farben');
schalter('Aussehen', 'figurRollt', 'Figur rollt beim Laufen (wie im Spiel)', true, 'aus: Figur bleibt aufrecht');
schalter('Aussehen', 'figurSchatten', 'Schatten unter der Figur', true);

// ---------- Anzeige ----------
schalter('Anzeige', 'legende', 'Tasten-Legende zeigen', true);
schalter('Anzeige', 'zahlen', 'Tempo-Anzeige (Messwerte)', false, 'zeigt Tempo, Boden/Wand, Coyote und Puffer');

// ---------- Varianten je Mechanik (Tasten 1–4 gelten für die Mechanik der aktuellen Station) ----------
const MECHANIKEN = {};
function mechanik(id, name, varianten){ MECHANIKEN[id] = {id, name, varianten, aktiv: 0}; }
mechanik('sprung', 'Sprung', [
  {name: 'A – Wie im Spiel', hilfe: 'gleichmäßige Schwerkraft'},
  {name: 'B – Schwebe-Gipfel', hilfe: 'Taste halten: am höchsten Punkt kurz schweben (mehr Zeit zum Zielen)'},
  {name: 'C – Schwer fallen', hilfe: 'hoch wie immer, runter schneller -> knackiger'},
  {name: 'D – Mondsprung', hilfe: 'leicht und weit, viel Zeit in der Luft'},
]);
mechanik('wand', 'Wandsprung', [
  {name: 'A – Einfach', hilfe: 'immer gleich stark, Richtung egal'},
  {name: 'B – Wie im Spiel', hilfe: 'stärker mit mehr Schwung beim Anprall, Taste muss von der Wand weg zeigen, je Wandseite einmal'},
]);
mechanik('dash', 'Dash', [
  {name: 'A – Fester Dash', hilfe: 'gerade Strecke, kein Eingriff'},
  {name: 'B – Gleitender Dash', hilfe: 'lenkbar, danach bleibt der Schwung eine Weile'},
  {name: 'C – Dash-Sprung', hilfe: 'Springen während/kurz nach dem Dash (am Boden oder an der Wand) = weiter, höherer Sprung'},
  {name: 'D – Dash mit Abbruch', hilfe: 'Springen bricht den Dash ab (in der Luft mit kleinem Hüpfer)'},
]);
mechanik('haken', 'Haken', [
  {name: 'A – Automatisch (Anker)', hilfe: 'greift den besten Anker in Blick-/Stickrichtung, bevorzugt nach oben'},
  {name: 'B – Decken überall', hilfe: 'haftet an jeder festen Fläche über oder neben dir (Anker haben Vorrang)'},
  {name: 'C – Anker mit Magnet', hilfe: 'wie A, aber der Anker zieht dich ein Stück heran'},
  {name: 'D – Freies Zielen', hilfe: 'zielen mit Maus oder rechtem Stick, trifft Anker und Flächen; Maustaste = Haken'},
]);
mechanik('haft', 'Unterseite', [
  {name: 'A – Unterseiten-Haften', hilfe: 'an Haftflächen (lila) von unten festhalten (L), entlanglaufen, abspringen, dashen'},
  {name: 'B – Rollen', hilfe: 'L halten = Kugel: rollt mit Schwung, klebt an Haftflächen (auch um Ecken), Rampen geben Tempo'},
  {name: 'C – Haften überall', hilfe: 'wie A, aber jede Decke ist klebrig (zum Testen)'},
]);
mechanik('bruch', 'Durchbruch', [
  {name: 'A – Bleibt kaputt', hilfe: 'zerbrochen bis R (zurück zum Rücksetzpunkt)'},
  {name: 'B – Wächst nach', hilfe: 'nach ein paar Sekunden ist die Wand wieder da'},
  {name: 'C – Nur bei hohem Tempo', hilfe: 'Dash allein reicht nicht: Schwung mitbringen (Seil, Dash-Sprung, Fall)'},
]);
let aktiveMechanik = 'sprung';
function varianteSetzen(id, i){
  const m = MECHANIKEN[id]; if(!m || i < 0 || i >= m.varianten.length) return;
  m.aktiv = i; einstellungenMerken();
  if(typeof hinweis === 'function') hinweis(m.name + ': ' + m.varianten[i].name);
  if(typeof ton === 'function') ton('klick');
  if(typeof panelAktualisieren === 'function') panelAktualisieren();
}

// ---------- Speichern / Laden (eigener Schlüssel „spielwiese-einstellungen“) ----------
let figurAussehen = 'affe';
function einstellungenObjekt(){
  const werte = {}; for(const w of WERTE_LISTE) werte[w.key] = V[w.key];
  const varianten = {}; for(const id in MECHANIKEN) varianten[id] = MECHANIKEN[id].aktiv;
  return {spielwiese: 2, figur: figurAussehen, werte, varianten};
}
function einstellungenAnwenden(o){
  if(!o || typeof o !== 'object') return false;
  if(o.figur === 'affe' || o.figur === 'schwein') figurAussehen = o.figur;
  const alt = (o.spielwiese || 1) < 2;   // ältere Speicherstände: geänderte Standardwerte nicht überschreiben
  for(const w of WERTE_LISTE){
    if(!o.werte || !(w.key in o.werte)) continue;
    if(alt && w.key === 'nachbildTempo') continue;
    const v = o.werte[w.key];
    if(w.art === 'schalter') V[w.key] = !!v;
    else if(typeof v === 'number' && isFinite(v)) V[w.key] = klemmen(v, w.min, w.max);
  }
  if(o.varianten) for(const id in o.varianten) if(MECHANIKEN[id]){
    const i = o.varianten[id] | 0; if(i >= 0 && i < MECHANIKEN[id].varianten.length) MECHANIKEN[id].aktiv = i;
  }
  return true;
}
function standardWerte(gruppe){
  for(const w of WERTE_LISTE) if(!gruppe || w.gruppe === gruppe) V[w.key] = w.std;
  if(!gruppe) for(const id in MECHANIKEN) MECHANIKEN[id].aktiv = 0;
  einstellungenMerken();
}
let merkenZeit = 0;
function einstellungenMerken(){
  clearTimeout(merkenZeit);
  merkenZeit = setTimeout(() => speicherSchreiben('einstellungen', einstellungenObjekt()), 200);
}
einstellungenAnwenden(speicherLesen('einstellungen', null));
