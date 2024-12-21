var R = R || {};
//
var BootState = {

    //
    init: function () {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        if (!game.device.desktop) {
            game.scale.forceOrientation(false, true);
            game.scale.enterIncorrectOrientation.add(this.onEnterIncorrectOrientation, this);
            game.scale.leaveIncorrectOrientation.add(this.onLeaveIncorrectOrientation, this);
        }

        if (!game.scale.parentIsWindow) game.scale.setResizeCallback(this.gameResized, this);

        game.input.maxPointers = 1;
        game.stage.disableVisibilityChange = false;

        //
        R.canAudio = game.device.canPlayAudio('ogg') || game.device.canPlayAudio('mp3');

        //
        this.additionalAudioCheck();
    },

    //
    gameResized: function (scale, parentBounds) {
        var gameContainer = document.getElementById(game.parent);
        gameContainer.style.width = window.innerWidth + "px";
        gameContainer.style.height = window.innerHeight + "px";
    },

    //
    create: function () {
        game.state.add('load', LoadState);
        game.state.add('menu', MenuState);
        game.state.add('play', PlayState);

        var fontFaceObserver = new FontFaceObserver(R.fontName);
        fontFaceObserver.load(null, 5000).then(function () {
            game.state.start('load');
        }, this.fontLoadFailed);
    },

    fontLoadFailed: function () {
        R.fontName = 'Arial';
        game.state.start('load');
    },

    gameContainerResize: function () {
        var gameContainer = document.getElementById(game.parent);
        gameContainer.style.width = window.innerWidth + "px";
        gameContainer.style.height = window.innerHeight + "px";
    },

    onEnterIncorrectOrientation: function () {
        if (game.scale.incorrectOrientation) {
            game.paused = true;
        }
    },

    onLeaveIncorrectOrientation: function () {
        game.paused = false;
    },

    additionalAudioCheck: function () {
        //second check sound
        /*
            Sharp = SH-01F
            Fujitsu = F-01F
            Xperia A = SO-04E
            Sharp Mini = SHL24
            */

        function isStock() {
            var matches = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
            return matches && matches[1] < 537;
        }

        var ua = navigator.userAgent; // Returns a string which tells you what device you're using
        var isSharpStock = ((/SHL24|SH-01F/i).test(ua)) && isStock(); // Checks if device is, Sharp(SH-01F) or Sharp Mini(SHL24)
        var isXperiaAStock = ((/SO-04E/i).test(ua)) && isStock(); // Checks if device is, Xperia A(SO-04E)
        var isFujitsuStock = ((/F-01F/i).test(ua)) && isStock(); // Checks if device is, Fujitsu(F-01F)

        if (isSharpStock || isXperiaAStock || isFujitsuStock) R.canAudio = false;
    }
};