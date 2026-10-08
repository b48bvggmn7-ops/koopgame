// 00-setup.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

const cvs = document.getElementById('c');
const ctx = cvs.getContext('2d');
const W = 1280, H = 720;   // Spielfeld in Spiel-Pixeln (alles wird in diesen Koordinaten gezeichnet)
// Scharfes Bild: die Leinwand hat so viele echte Pixel wie auf dem Bildschirm (× Pixeldichte, höchstens 2560 breit)
// statt 1280×720 hochzuskalieren. draw() setzt dazu am Anfang die Skalierung RS (Spiel-Pixel -> Leinwand-Pixel).
let RS = 1;
function fitCanvasRes(){
  const r = cvs.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  const want = Math.max(W, Math.min(2560, Math.round((r.width || W)*dpr)));
  if(cvs.width !== want){ cvs.width = want; cvs.height = Math.round(want*H/W); }
  RS = cvs.width / W;
}
fitCanvasRes();
window.addEventListener('resize', fitCanvasRes);
document.addEventListener('fullscreenchange', () => setTimeout(fitCanvasRes, 50));
const css = getComputedStyle(document.documentElement);
const ASSET_SRC = {
  pig: "assets/pig.png",
  pigBlink: "assets/pigBlink.png",
  monkey: "assets/monkey.png",
  monkeyBlink: "assets/monkeyBlink.png",
  platformWood: "assets/platformWood.png",
  wallStone: "assets/wallStone.png",
  groundGrass: "assets/groundGrass.png",
  signExit: "assets/signExit.png",
};
const ASSETS = {};
let assetsLoadedCount = 0;
const assetNames = Object.keys(ASSET_SRC);
for(const name of assetNames){
  const img = new Image();
  img.onload = () => {
    assetsLoadedCount++;
    if(name === 'wallStone'){
      const rc = document.createElement('canvas');
      rc.width = img.naturalHeight; rc.height = img.naturalWidth;
      const rctx = rc.getContext('2d');
      rctx.translate(rc.width/2, rc.height/2);
      rctx.rotate(Math.PI/2);
      rctx.drawImage(img, -img.naturalWidth/2, -img.naturalHeight/2);
      ASSETS.wallStoneRot = rc;
    }
  };
  img.src = ASSET_SRC[name];
  ASSETS[name] = img;
}

const colorCache = {};
const colorOf = name => {
  if(!(name in colorCache)) colorCache[name] = css.getPropertyValue(name).trim();
  return colorCache[name];
};
