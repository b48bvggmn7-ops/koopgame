// 99-start.js – startet das Spiel, nachdem alle anderen Dateien geladen sind.

resetLevel();
if(!startEditorTest() && !startTestLevelFromUrl()) showTitleScreen();   // Testlevel: index.html?testlevel=<name>   // sonst Titelbild des Startmenüs (24-startmenue.js)
requestAnimationFrame(loop);
