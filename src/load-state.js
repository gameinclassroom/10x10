var R = R || {};
//
var LoadState = {

    loadText: null,
    sfx_key: null,

    //
    init: function () {
        game.load.onFileComplete.add(this.fileComplete, this);
        game.load.onLoadComplete.add(this.loadComplete, this);
    },

    //
    create: function () {
        game.load.spritesheet('bg_home', 'assets/bg_home.png', 640, 960, 2);
        game.load.spritesheet('bg_play', 'assets/bg_play.png', 640, 960, 2);
        game.load.spritesheet('quads', 'assets/quads5.png', 58, 58, 5);
        game.load.atlas('gui', 'assets/gui.png', 'assets/gui.json');
        game.load.json('strings', 'text/en.json');

        //sfx
        if (R.canAudio) {
            var sfx = ['error', 'new_shapes', 'new_game', 'put_stone', 'row_removed', 'button'];
            for (var i in sfx) game.load.audio(sfx[i], ['assets/sfx/' + sfx[i] + '.ogg', 'assets/sfx/' + sfx[i] + '.mp3']);
            this.sfx_key = sfx;
        }


        //
        this.createEnvironment();

        //
        game.load.start();
    },

    shutdown: function () {
        this.loadText = null;
        this.sfx_key = null;
    },

    createEnvironment: function () {
        this.loadText = R.createText(game.world.centerX, game.world.centerY, 50, '');
    },

    //
    fileComplete: function (progress, cacheKey, success, totalLoaded, totalFiles) {
        this.loadText.setText(progress + "%");
    },

    //
    loadComplete: function () {
        //sfx
        if (R.canAudio)
            for (var i in this.sfx_key) R.sfx[this.sfx_key[i]] = game.add.audio(this.sfx_key[i]);

        // 
        R.strings = game.cache.getJSON('strings');

        //
        R.loadGame();

        //
        game.renderer.clearBeforeRender = false;
        game.state.start('menu');
    }
};

//
R.saveGame = function () {
    var data = JSON.stringify(R.playerData);

    var encodedData = btoa(data);

    if (R.playerData.score < R.score) {
        R.playerData.score = R.score;
        if (game.device.localStorage) localStorage.setItem('Coolgames_10x10_PlayerData', encodedData);
    } else {
        if (game.device.localStorage) localStorage.setItem('Coolgames_10x10_PlayerData', encodedData);
    }
};

//
R.loadGame = function () {
    if (game.device.localStorage) {
        var rawData = localStorage.getItem('Coolgames_10x10_PlayerData');
        if (rawData) {
            var data;

            try {
                data = atob(rawData);
            } catch (e) {
                data = rawData;
            }

            if (data) {
                R.playerData = JSON.parse(data);
            }

            if (R.playerData && R.playerData.theme > 1) {
                R.playerData.theme = 0;
            }
        }
    }
};