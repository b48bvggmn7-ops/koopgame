// ===== 3D-Fellfiguren (aus dem Spiel, js/33-figuren-3d.js) + neu: Professor als Marienkäfer =====
const FIG3D = (function(){
  'use strict';
  const SPR = 420, SPRH = 560, FELL_DICHTE = 0.2, FELL_SCHICHTEN = 14;
  const FR = {x0:-2.4, x1:2.4, y0:-0.7, y1:5.7};
  let E = null;
  function baue(){
