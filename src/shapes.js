var R = R || {};

//ShapeStates
var ShapeStates = function () {
  this.state = [];

  //
  //1
  this.state[0] = [
    [1]
  ];

  //2
  this.state[1] = [
    [1, 1]
  ];

  this.state[2] = [
    [1],
    [1]
  ];

  //3
  this.state[3] = [
    [1, 1, 1]
  ];

  this.state[4] = [
    [1],
    [1],
    [1]
  ];

  this.state[5] = [
    [1, 1],
    [0, 1]
  ];

  this.state[6] = [
    [1, 1],
    [1, 0]
  ];

  this.state[7] = [
    [1, 0],
    [1, 1]
  ];

  this.state[8] = [
    [0, 1],
    [1, 1]
  ];

  //4
  this.state[9] = [
    [1, 1, 1, 1]
  ];

  this.state[10] = [
    [1],
    [1],
    [1],
    [1]
  ];

  this.state[11] = [
    [1, 1],
    [1, 1]
  ];

  //5
  this.state[12] = [
    [1, 1, 1, 1, 1]
  ];

  this.state[13] = [
    [1],
    [1],
    [1],
    [1],
    [1]
  ];

  this.state[14] = [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1]
  ];

  this.state[15] = [
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0]
  ];

  this.state[16] = [
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1]
  ];

  this.state[17] = [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1]
  ];
  //9
  this.state[18] = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1]
  ];
};

//
ShapeStates.prototype = {
  getRnd: function () {
    return game.rnd.pick(this.state);
  }
};

//
ShapeStates.prototype.constructor = ShapeStates;

//Shepe
var quadSize = 58;
var quadPadding = 2;
var quadScaleMin = 0.6;

//
var Shape = function (nQuads, startX, startY) {
  this.state = null;
  this.startX = startX;
  this.startY = startY;
  this.padding = new Phaser.Point(0, 0);
  this.hh = 0;

  this.parent = game.add.sprite(startX, startY, null);

  this.quads = new Array(nQuads);

  for (var i = 0; i < nQuads; i++) {
    this.quads[i] = game.add.sprite(0, 0, "quads", 0);
    this.quads[i].anchor.setTo(0.5, 0.5);
    this.parent.addChild(this.quads[i]);
  }

  this.existsQuads = nQuads;
  this.frame = 0;
  this.well = null;

  //
  this.tweenDragScale = null;
  this.tweenDragPadding = null;
  this.tweenEndDragPosition = null;
  this.tweenEndDragScale = null;

  //
  this.readyForDrag = true;
};

//
Shape.prototype = {
  isExists: function () {
    return this.parent.exists;
  },

  setState: function (state) {
    this.state = state;

    this.frame = game.rnd.integerInRange(0, 4);

    var i = this.quads.length;
    while (i--) {
      this.quads[i].exists = false;
      this.quads[i].frame = this.frame;
    }

    this.buildShape(quadPadding);

    this.parent.scale.set(quadScaleMin);
    this.parent.exists = true;
    this.padding.x = quadPadding;
  },

  setPosition: function (x, y) {
    this.parent.x = x;
    this.parent.y = y;
  },

  buildShape: function (padding) {
    var row = null;
    var i = 0;
    var idxQuad = 0;
    var size = quadSize + padding;
    var x = 0;
    var y = 0;
    var q = null;
    var maxX = 0;
    var maxY = 0;

    this.existsQuads = 0;

    for (var j = 0; j < this.state.length; ++j) {
      row = this.state[j];
      x = 0;
      for (i = 0; i < row.length; ++i) {
        if (row[i] === 1) {
          q = this.quads[idxQuad];
          q.x = x;
          q.y = y;
          q.exists = true;
          if (maxX < x) maxX = x;
          if (maxY < y) maxY = y;
          ++idxQuad;
        }
        x += size;
      }
      y += size;
    }

    this.existsQuads = idxQuad;

    //
    maxX *= 0.5;
    maxY *= 0.5;
    i = this.quads.length;

    while (i--) {
      if (this.quads[i].exists) {
        this.quads[i].x -= maxX;
        this.quads[i].y -= maxY;
      }
    }

    this.hh = maxY + size + 70;
  },

  updatePadding: function () {
    this.buildShape(this.padding.x);
  },

  startDrag: function () {
    this.readyForDrag = false;

    if (this.tweenEndDragPosition && this.tweenEndDragPosition.isRunning)
      this.tweenEndDragPosition.stop(true);
    if (this.tweenEndDragScale && this.tweenEndDragScale.isRunning)
      this.tweenEndDragScale.stop(true);

    this.tweenDragScale = game.add
      .tween(this.parent.scale)
      .to({
        x: 0.85,
        y: 0.85
      }, 100, Phaser.Easing.Linear.None, true);
    this.tweenDragScale.onComplete.add(function () {
      this.tweenDragScale = null;
    }, this);

    this.tweenDragPadding = game.add
      .tween(this.padding)
      .to({
        x: 12.588235294117647
      }, 100, Phaser.Easing.Linear.None, true);
    this.tweenDragPadding.onUpdateCallback(this.updatePadding, this);
    this.tweenDragPadding.onComplete.add(function () {
      this.updatePadding();
      this.tweenDragPadding = null;
    }, this);
  },

  isNotReadyForAdding: function () {
    return (
      (this.tweenDragScale && this.tweenDragScale.isRunning) ||
      (this.tweenDragPadding && this.tweenDragPadding.isRunning)
    );
  },

  endDrag: function () {
    if (this.tweenDragScale && this.tweenDragScale.isRunning)
      this.tweenDragScale.stop(true);
    if (this.tweenDragPadding && this.tweenDragPadding.isRunning)
      this.tweenDragPadding.stop(true);

    this.tweenDragPadding = game.add
      .tween(this.padding)
      .to({
        x: quadPadding
      }, 160, Phaser.Easing.Linear.None, true);
    this.tweenDragPadding.onUpdateCallback(this.updatePadding, this);
    this.tweenDragPadding.onComplete.add(function () {
      this.updatePadding();
      this.tweenDragPadding = null;
    }, this);

    this.tweenEndDragPosition = game.add
      .tween(this.parent)
      .to({
          x: this.startX,
          y: this.startY
        },
        160,
        Phaser.Easing.Linear.None,
        true
      );
    this.tweenEndDragPosition.onComplete.add(function () {
      this.onReadyForDrag();
      this.tweenEndDragPosition = null;
    }, this);

    this.tweenEndDragScale = game.add
      .tween(this.parent.scale)
      .to({
          x: quadScaleMin,
          y: quadScaleMin
        },
        160,
        Phaser.Easing.Linear.None,
        true
      );
    this.tweenEndDragScale.onComplete.add(function () {
      this.tweenEndDragScale = null;
    }, this);
  },

  getQuadWorldX: function (i) {
    return this.parent.x + this.quads[i].x * this.parent.scale.x;
  },

  getQuadWorldY: function (i) {
    return this.parent.y + this.quads[i].y * this.parent.scale.x;
  },

  beginAddingToWell: function (well, firstAddingCell) {
    if (this.tweenDragScale && this.tweenDragScale.isRunning)
      this.tweenDragScale.stop(true);
    if (this.tweenDragPadding && this.tweenDragPadding.isRunning)
      this.tweenDragPadding.stop(true);

    var tx =
      firstAddingCell.x - this.getQuadWorldX(0) + this.parent.x + well.grid.x;
    var ty =
      firstAddingCell.y - this.getQuadWorldY(0) + this.parent.y + well.grid.y;
    this.well = well;

    var tween = game.add
      .tween(this.padding)
      .to({
        x: quadPadding
      }, 100, Phaser.Easing.Linear.None, true);
    tween.onUpdateCallback(this.updatePadding, this);
    tween.onComplete.add(this.updatePadding, this);

    this.tweenDragScale = game.add
      .tween(this.parent.scale)
      .to({
        x: 1.0,
        y: 1.0
      }, 100, Phaser.Easing.Linear.None, true);
    this.tweenDragScale.onComplete.add(function () {
      this.tweenDragScale = null;
    }, this);

    tween = game.add
      .tween(this.parent)
      .to({
        x: tx,
        y: ty
      }, 100, Phaser.Easing.Linear.None, true);
    tween.onComplete.add(this.onCompleteAddingToWell, this);
  },

  onCompleteAddingToWell: function () {
    if (this.tweenDragScale && this.tweenDragScale.isRunning)
      this.tweenDragScale.stop(true);
    this.parent.exists = false;
    R.score += this.existsQuads;
    this.well.onCompliteAddingShape(this.frame);
  },

  reset: function (state) {
    this.setPosition(this.startX + game.width, this.startY);
    this.setState(state);

    var tween = game.add
      .tween(this.parent)
      .to({
        x: this.startX
      }, 300, Phaser.Easing.Quadratic.Out, true);
    tween.onComplete.add(this.onReadyForDrag, this);
  },

  onReadyForDrag: function () {
    this.readyForDrag = true;
  }
};

//
Shape.prototype.constructor = Shape;