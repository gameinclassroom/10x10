var R = R || {};

//
R.BASE_GAME_WIDTH = 640;
R.BASE_GAME_HEIGHT = 960;

//
R.fontName = 'Arvo';
R.strings = null;

//
R.canAudio = false;
R.sfx = {};

//
R.score = 0;


R.playerData = {
    score: 0,
    theme: 0
};

//
var game = null;

//
function startGame() {
    game = new Phaser.Game(R.BASE_GAME_WIDTH, R.BASE_GAME_HEIGHT, Phaser.CANVAS, 'gameContainer', BootState);
};

//
window.onunload = function () {
    R.saveGame();
};