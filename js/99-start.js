// 99-start.js – startet das Spiel, nachdem alle anderen Dateien geladen sind.

resetLevel();
if(!startEditorTest()) showTitleScreen();   // sonst Titelbild des Startmenüs (24-startmenue.js)
requestAnimationFrame(loop);
