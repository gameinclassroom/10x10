var R = R || {};

//
var PlayState = {
  bg: null,
  shapeStates: null,
  placeX: [],
  placeY: 850,
  shapes: [],
  selectedShape: null,
  inputPointOffset: null,
  tweenDragOffset: null,
  existsShapes: 0,
  well: null,
  isPostFindPlaces: false,
  labelScore: null,
  labelTotalScore: null,
  displayScore: 0,
  pauseGroup: null,
  gameoverGroup: null,
  continueGroup: null,
  curtain: null,

  //
  shutdown: function () {
    this.bg = null;
    this.shapeStates = null;
    this.placeX.length = 0;
    this.shapes.length = 0;
    this.selectedShape = null;
    this.inputPointOffset = null;
    this.tweenDragOffset = null;
    this.existsShapes = 0;
    this.well = null;
    this.isPostFindPlaces = false;
    this.labelScore = null;
    this.labelTotalScore = null;
    this.displayScore = 0;
    this.pauseGroup = null;
    this.gameoverGroup = null;
    this.continueGroup = null;
    this.curtain = null;
  },

  //
  create: function () {
    Publisher.rewardedVideoAd = true;

    //
    this.bg = game.add.image(0, 0, "bg_play", R.playerData.theme);

    this.well = new Well(
      21,
      120,
      10,
      10,
      quadPadding,
      this,
      Publisher.rewardedVideoAd
    );

    this.shapeStates = new ShapeStates();

    this.placeX[0] = 115;
    this.placeX[1] = game.width / 2;
    this.placeX[2] = game.width - this.placeX[0];

    this.placeY = 790;
    quadScaleMin = 0.46;

    for (var i = 0; i < 3; i++) {
      this.shapes.push(new Shape(9, this.placeX[i], this.placeY));
      this.shapes[i].setState(this.shapeStates.getRnd());
    }

    this.existsShapes = 3;

    //
    this.inputPointOffset = new Phaser.Point(0, 0);

    //score
    var label = R.createText(
      370,
      84,
      50,
      R.playerData.score.toString(),
      "#21c1ef"
    );
    label.anchor.set(0, 0.5);
    label.align = "left";
    label.fontSize = 50;

    this.labelTotalScore = label;

    this.displayScore = R.score = 0;

    label = R.createText(280, 84, 50, R.score.toString(), "#14b05d");
    label.anchor.set(1.0, 0.5);
    label.align = "right";

    this.labelScore = label;

    //GUI
    //pause
    var group = game.add.group();
    R.ui.createHomeButton(230, 366, group);
    R.ui.createThemeButton(410, 366, group);
    //CheckStock

    R.ui.createSoundButton(230, 543, group);

    R.ui.createSmallPlayButton(410, 543, group, this.onPlayPause, this);

    this.pauseGroup = group;
    this.pauseGroup.visible = false;
    R.ui.buttonsEnabled(this.pauseGroup, false);

    //game over
    group = game.add.group();

    label = R.createText(320, 200, 50, R.strings.no_moves_left);
    group.add(label);

    R.ui.createBigPlayButton(322, 520, group, this.onPlayButton, this);
    R.ui.createHomeButton(322, 688, group);

    this.gameoverGroup = group;
    this.gameoverGroup.visible = false;
    R.ui.buttonsEnabled(this.gameoverGroup, false);

    //continue group
    group = game.add.group();

    label = R.createText(320, 200, 50, R.strings.no_moves_left);
    group.add(label);

    label = R.createText(
      320,
      290,
      50,
      R.strings.remove_3_moves,
      "#ffffff",
      false,
      0,
      true
    );
    label.anchor.set(0.5, 0);
    group.add(label);

    R.ui.createTextButton(
      320,
      570,
      group,
      this.onWatchVideoButton,
      this,
      R.strings.watch_video
    );
    R.ui.createTextButton(
      320,
      720,
      group,
      this.onCancelButton,
      this,
      R.strings.cancel
    );

    this.continueGroup = group;
    this.continueGroup.visible = false;
    R.ui.buttonsEnabled(this.continueGroup, false);

    //
    this.curtain = game.add.image(0, 0, "gui", "curtain");
    this.curtain.scale.set(10);
    this.curtain.visible = false;

    //
    game.input.onDown.add(this.inputOnDown, this);
    game.input.onUp.add(this.inputOnUp, this);

    //
    game.time.events.loop(75, this.updateLabelScore, this);

    //
    if (R.sfx.new_game) R.sfx.new_game.play();
  },

  inputOnDown: function (e) {
    if (
      this.pauseGroup.visible ||
      this.gameoverGroup.visible ||
      this.continueGroup.visible
    )
      return;

    var input = game.input.activePointer;

    if (input.y < 740) {
      if (input.y < 115 && input.x > 540) this.showPauseMenu();
      return;
    }

    //
    if (input.x < 214) {
      if (this.shapes[0].readyForDrag) this.selectedShape = this.shapes[0];
    } else if (input.x < 428) {
      if (this.shapes[1].readyForDrag) this.selectedShape = this.shapes[1];
    } else {
      if (this.shapes[2].readyForDrag) this.selectedShape = this.shapes[2];
    }

    //
    if (this.selectedShape) {
      this.inputPointOffset.x = this.selectedShape.parent.x - input.x;
      this.inputPointOffset.y = this.selectedShape.parent.y - input.y;
      this.selectedShape.startDrag();

      if (!game.device.desktop) {
        this.tweenDragOffset = game.add
          .tween(this.inputPointOffset)
          .to({
              y: -this.selectedShape.hh
            },
            100,
            Phaser.Easing.Linear.None,
            true
          );
        this.tweenDragOffset.onComplete.add(function () {
          this.tweenDragOffset = null;
        }, this);
      }

      game.world.bringToTop(this.selectedShape.parent);
    }
  },

  inputOnUp: function (e) {
    if (!this.selectedShape) return;

    if (this.tweenDragOffset && this.tweenDragOffset.isRunning)
      this.tweenDragOffset.stop(true);

    if (this.well.tryAddShape(this.selectedShape)) {
      --this.existsShapes;
      if (R.sfx.put_stone) R.sfx.put_stone.play();
    } else {
      this.selectedShape.endDrag();
      if (R.sfx.error) R.sfx.error.play();
    }

    this.selectedShape = null;
  },

  generateNextShapes: function () {
    for (var i = 0; i < 3; ++i) this.shapes[i].reset(this.shapeStates.getRnd());

    this.existsShapes = 3;

    if (this.well.waitLines === 0) this.findPlaces();
    else this.isPostFindPlaces = true;

    if (R.sfx.new_shapes) R.sfx.new_shapes.play();
  },

  onCompleteAddingShapeToWell: function () {
    if (this.existsShapes === 0) this.generateNextShapes();
    else {
      if (this.well.waitLines === 0) this.findPlaces();
      else this.isPostFindPlaces = true;
    }
  },

  onComleteRemoveLines: function () {
    if (this.isPostFindPlaces) {
      this.isPostFindPlaces = false;
      if (this.existsShapes > 0) this.findPlaces();
    }
  },

  findPlaces: function () {
    var n = 0;

    for (var i = 0; i < 3; ++i) {
      if (this.shapes[i].isExists()) {
        if (this.well.findShapePlace(this.shapes[i].state)) break;
        ++n;
      }
    }

    if (n > 0 && n === this.existsShapes) {
      if (Publisher.rewardedVideoAd) this.showContinueMenu();
      else this.showGameoverMenu();
    }
  },

  update: function () {
    if (this.selectedShape) {
      var input = game.input.activePointer;
      this.selectedShape.setPosition(
        this.inputPointOffset.x + input.x,
        this.inputPointOffset.y + input.y
      );
    }
  },

  updateLabelScore: function () {
    if (this.displayScore < R.score) {
      ++this.displayScore;
      this.labelScore.text = this.displayScore.toString();
    }
  },

  setTheme: function () {
    this.bg.frame = R.playerData.theme;
    game.canvas.parentElement.style.backgroundColor =
      R.playerData.theme === 1 ? "#061528" : "#979ea5";
  },

  showPauseMenu: function () {
    game.world.bringToTop(this.curtain);
    game.world.bringToTop(this.pauseGroup);

    this.curtain.visible = true;
    this.pauseGroup.visible = true;

    this.curtain.alpha = 0.0;
    game.add
      .tween(this.curtain)
      .to({
        alpha: 1.0
      }, 200, Phaser.Easing.Linear.None, true);

    this.pauseGroup.y = 600;
    game.add
      .tween(this.pauseGroup)
      .to({
        y: 0
      }, 400, Phaser.Easing.Back.Out, true)
      .onComplete.add(function (pauseGroup) {
        R.ui.buttonsEnabled(pauseGroup, true);
      }, this);
  },

  onPlayPause: function (button) {
    R.ui.buttonsEnabled(button.parent, false);

    game.add
      .tween(this.curtain)
      .to({
        alpha: 0.0
      }, 200, Phaser.Easing.Linear.None, true);
    game.add
      .tween(this.pauseGroup)
      .to({
        y: 600
      }, 400, Phaser.Easing.Back.In, true)
      .onComplete.add(this.onHidePauseMenu, this);
  },

  onHidePauseMenu: function () {
    this.curtain.visible = false;
    this.pauseGroup.visible = false;
  },

  showGameoverMenu: function () {
    R.saveGame();

    game.world.bringToTop(this.curtain);
    game.world.bringToTop(this.gameoverGroup);

    this.curtain.visible = true;
    this.gameoverGroup.visible = true;

    this.curtain.alpha = 0.0;
    game.add
      .tween(this.curtain)
      .to({
        alpha: 1.0
      }, 200, Phaser.Easing.Linear.None, true);

    this.gameoverGroup.y = 800;
    game.add
      .tween(this.gameoverGroup)
      .to({
        y: 0
      }, 600, Phaser.Easing.Back.Out, true)
      .onComplete.add(function (gameoverGroup) {
        R.ui.buttonsEnabled(gameoverGroup, true);
      }, this);

    if (R.sfx.new_game) R.sfx.new_game.play();

    //
    Publisher.submitScore(R.playerData.score);
  },

  showContinueMenu: function () {
    game.world.bringToTop(this.curtain);
    game.world.bringToTop(this.continueGroup);

    this.curtain.visible = true;
    this.continueGroup.visible = true;

    this.curtain.alpha = 0.0;
    game.add
      .tween(this.curtain)
      .to({
        alpha: 1.0
      }, 200, Phaser.Easing.Linear.None, true);

    this.continueGroup.y = 800;
    game.add
      .tween(this.continueGroup)
      .to({
        y: 0
      }, 600, Phaser.Easing.Back.Out, true)
      .onComplete.add(function (continueGroup) {
        R.ui.buttonsEnabled(continueGroup, true);
      }, this);

    if (R.sfx.new_game) R.sfx.new_game.play();
  },

  onPlayButton: function (button) {
    game.add
      .tween(this.curtain)
      .to({
        alpha: 0.0
      }, 200, Phaser.Easing.Linear.None, true);
    game.add
      .tween(this.gameoverGroup)
      .to({
        y: 800
      }, 600, Phaser.Easing.Back.In, true)
      .onComplete.add(this.onHideGameoverMenu, this);
  },

  onHideGameoverMenu: function () {
    game.state.start("play");
  },

  onWatchVideoButton: function (button) {
    R.ui.buttonsEnabled(this.continueGroup, false);
    game.paused = true;
    Publisher.AdVideoPlayer.playVideo(this.onCompleteAdVideo, this);
    Publisher.rewardedVideoAd = false;
  },

  onCancelButton: function (button) {
    R.ui.buttonsEnabled(this.continueGroup, false);

    game.add
      .tween(this.curtain)
      .to({
        alpha: 0.0
      }, 200, Phaser.Easing.Linear.None, true);
    game.add
      .tween(this.continueGroup)
      .to({
        y: 600
      }, 400, Phaser.Easing.Back.In, true)
      .onComplete.add(this.onHideContinueMenuCancel, this);
  },

  onCompleteAdVideo: function () {
    game.paused = false;

    game.add
      .tween(this.curtain)
      .to({
        alpha: 0.0
      }, 200, Phaser.Easing.Linear.None, true);
    game.add
      .tween(this.continueGroup)
      .to({
        y: 600
      }, 400, Phaser.Easing.Back.In, true)
      .onComplete.add(this.onHideContinueMenu, this);
  },

  onHideContinueMenu: function () {
    this.curtain.visible = false;
    this.continueGroup.visible = false;

    this.well.remove3PastMoves();
    this.generateNextShapes();
  },

  onHideContinueMenuCancel: function () {
    this.curtain.visible = false;
    this.continueGroup.visible = false;

    this.showGameoverMenu();
  }
};