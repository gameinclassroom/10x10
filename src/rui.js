var R = R || {};

//
R.createText = function (x, y, size, text, fill, isStroke, strokeThicknes, isWrap) {
    if (!fill) fill = '#ffffff';
    var label = game.add.text(x, y, text);
    label.font = R.fontName;
    label.anchor.set(0.5);
    label.align = 'center';
    label.fontSize = size;
    label.fill = fill;

    if (isStroke) {
        label.stroke = '#000000';
        label.strokeThickness = strokeThicknes;
    }
    if (isWrap) {
        label.wordWrap = true;
        label.wordWrapWidth = game.width - 10;
    }
    return label;
};

//GUI
R.ui = {

    btnTheme: null,
    btnSound: null,

    buttonsEnabled: function (group, enabled) {
        var i = group.total;
        while (i--)
            if (group.children[i].type === Phaser.BUTTON) group.children[i].inputEnabled = enabled;

    },

    //
    createHomeButton: function (x, y, group) {
        var btn = game.add.button(x, y, 'gui', this.onHomeButton, this, 'btn_home', 'btn_home', 'btn_home_pressed', 'btn_home');
        btn.anchor.set(0.5);
        if (R.sfx.button) btn.setDownSound(R.sfx.button);
        if (group) group.add(btn);
    },

    onHomeButton: function () {
        R.saveGame();

        Publisher.showAdvertising();

        game.state.start('menu');
    },

    createThemeButton: function (x, y, group) {
        var frameNormal = R.playerData.theme === 0 ? 'btn_lamp_on' : 'btn_lamp_off';
        var framePressed = R.playerData.theme === 0 ? 'btn_lamp_on_pressed' : 'btn_lamp_off_pressed';

        var btn = game.add.button(x, y, 'gui', this.onThemeButton, this, frameNormal, frameNormal, framePressed, frameNormal);
        btn.anchor.set(0.5);
        if (R.sfx.button) btn.setDownSound(R.sfx.button);
        if (group) group.add(btn);
        this.btnTheme = btn;
    },

    onThemeButton: function () {
        R.playerData.theme = 1 - R.playerData.theme;
        if (game.device.localStorage) localStorage.setItem('Coolgames_10x10_PlayerData', JSON.stringify(R.playerData));

        var frameNormal = R.playerData.theme === 0 ? 'btn_lamp_on' : 'btn_lamp_off';
        var framePressed = R.playerData.theme === 0 ? 'btn_lamp_on_pressed' : 'btn_lamp_off_pressed';

        this.btnTheme.setFrames(frameNormal, frameNormal, framePressed, frameNormal);

        var state = game.state.getCurrentState();
        if (state.setTheme) state.setTheme();
    },

    createSoundButton: function (x, y, group) {
        var btn = game.add.button(x, y, 'gui', this.onSoundButton, this, 'btn_sound_on', 'btn_sound_on', 'btn_sound_on_pressed', 'btn_sound_on');
        btn.anchor.set(0.5);
        if (R.sfx.button) btn.setDownSound(R.sfx.button);
        if (group) group.add(btn);
        this.btnSound = btn;

        btn.visible = R.canAudio;
    },

    onSoundButton: function () {
        game.sound.mute = !game.sound.mute;

        var frameNormal = game.sound.mute ? 'btn_sound_off' : 'btn_sound_on';
        var framePressed = game.sound.mute ? 'btn_sound_off_pressed' : 'btn_sound_on_pressed';

        this.btnSound.setFrames(frameNormal, frameNormal, framePressed, frameNormal);
    },

    createSmallPlayButton: function (x, y, group, callback, context) {
        var btn = game.add.button(x, y, 'gui', callback, context, 'btn_small_play', 'btn_small_play', 'btn_small_play_pressed', 'btn_small_play');
        btn.anchor.set(0.5);
        if (R.sfx.button) btn.setDownSound(R.sfx.button);
        if (group) group.add(btn);
    },

    createBigPlayButton: function (x, y, group, callback, context) {
        var btn = game.add.button(x, y, 'gui', callback, context, 'btn_big_play', 'btn_big_play', 'btn_big_play_pressed', 'btn_big_play');
        btn.anchor.set(0.5);
        if (R.sfx.button) btn.setDownSound(R.sfx.button);
        if (group) group.add(btn);
    },

    createTextButton: function (x, y, group, callback, context, string) {
        var btn = game.add.button(x, y, 'gui', callback, context, 'button', 'button', 'button_pressed', 'button');
        btn.anchor.set(0.5);
        if (R.sfx.button) btn.setDownSound(R.sfx.button);
        if (group) group.add(btn);

        if (string) {
            var label = R.createText(0, 0, 45, string, '#ffffff', true, 4);
            label.stroke = '#000000';
            btn.addChild(label);
        }
    }
};