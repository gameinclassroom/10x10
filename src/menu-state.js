var R = R || {};
//
var MenuState = {

    bg: null,

    shutdown: function () {
        this.bg = null;
    },

    //
    create: function () {
        this.bg = game.add.image(0, 0, 'bg_home', R.playerData.theme);

        var label = R.createText(327, 240, 50, R.playerData.score.toString(), '#21c1ef');

        //
        R.ui.createBigPlayButton(329, 425, game.world, this.onPlayButton, this);
        R.ui.createThemeButton(325, 610, game.world);

        //
        this.setTheme();

        //
        Publisher.analyticsMenu();
    },

    onPlayButton: function () {
        game.state.start('play');
    },

    setTheme: function () {
        this.bg.frame = R.playerData.theme;
        game.canvas.parentElement.style.backgroundColor = (R.playerData.theme === 1 ? '#061528' : '#979ea5');
    }
};