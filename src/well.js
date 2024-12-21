var R = R || {};
//Well
var Well = function (
  left,
  top,
  rows,
  cols,
  padding,
  parentState,
  saveLast3Moves
) {
  this.left = left;
  this.top = top;
  this.rows = rows;
  this.cols = cols;

  this.n = rows * cols;

  //
  var grid = game.add.group();
  grid.createMultiple(this.n, "quads", 0, false);

  var cells = new Array(rows);

  var size = quadSize + quadPadding;

  var x = 0;
  var y = top + quadSize * 0.5;
  var c = 0;

  for (var j = 0; j < rows; j++) {
    x = left + quadSize * 0.5;
    cells[j] = new Array(cols);
    var cj = cells[j];
    for (var i = 0; i < cols; i++) {
      var q = grid.getAt(c++);
      q.anchor.setTo(0.5, 0.5);
      q.x = x;
      q.y = y;
      cj[i] = q;
      x += size;
    }
    y += size;
  }

  this.grid = grid;
  this.cells = cells;

  this.invSizeW = 1.0 / size;
  this.invSizeH = 1.0 / size;

  this.addingCells = [];

  this.parentState = parentState;

  this.scaleRemove = {
    x: 0.1,
    y: 0.1
  };

  this.waitLines = 0;

  //
  this.saveLast3Moves = saveLast3Moves;
  this.savedRowCells = [];
};

//
Well.prototype = {
  tryAddShape: function (shape) {
    if (this.addingCells.length > 0 || shape.isNotReadyForAdding())
      return false;

    var n = shape.existsQuads;
    var wx = 0;
    var wy = 0;

    for (var i = 0; i < n; ++i) {
      wx = Math.floor((shape.getQuadWorldX(i) - this.left) * this.invSizeW);
      wy = Math.floor((shape.getQuadWorldY(i) - this.top) * this.invSizeH);

      if (
        wx < 0 ||
        wx >= this.cols ||
        wy < 0 ||
        wy >= this.rows ||
        this.cells[wy][wx].exists
      )
        break;

      this.addingCells.push(this.cells[wy][wx]);
    }

    if (this.addingCells.length === n) {
      shape.beginAddingToWell(this, this.addingCells[0]);
      return true;
    }
    this.addingCells.length = 0;
    return false;
  },

  onCompliteAddingShape: function (frame) {
    if (this.saveLast3Moves) {
      if (this.savedRowCells.length > 2) this.savedRowCells.shift();
      this.savedRowCells.push(this.getRowCells());
    }

    //
    var i = this.addingCells.length;
    while (i--) {
      this.addingCells[i].frame = frame;
      this.addingCells[i].exists = true;
    }
    this.addingCells.length = 0;
    this.checkLines();
    this.parentState.onCompleteAddingShapeToWell();
  },

  checkLines: function () {
    var i = 0;
    var j = this.rows;
    var row = null;

    while (j--) {
      row = this.cells[j];
      i = this.cols;
      while (i--)
        if (!row[i].exists) break;
      if (i === -1) this.removeRow(j);
    }

    j = this.cols;
    while (j--) {
      i = this.rows;
      while (i--)
        if (!this.cells[i][j].exists) break;
      if (i === -1) this.removeCol(j);
    }
  },

  removeRow: function (j) {
    var row = this.cells[j];
    var i = this.rows;
    var tween = null;
    while (i--) {
      tween = game.add
        .tween(row[i].scale)
        .to(this.scaleRemove, 250, Phaser.Easing.Back.In, true, i * 50);
      tween.onComplete.add(R.onQuadScaleDown, row[i]);
      if (i === this.rows - 1)
        tween.onComplete.add(this.onCompleteRemoveLine, this);
    }
    ++this.waitLines;
    R.score += this.cols;
    if (R.sfx.row_removed) R.sfx.row_removed.play();
  },

  removeCol: function (j) {
    var tween = null;
    var i = this.cols;
    while (i--) {
      tween = game.add
        .tween(this.cells[i][j].scale)
        .to(this.scaleRemove, 250, Phaser.Easing.Back.In, true, i * 50);
      tween.onComplete.add(R.onQuadScaleDown, this.cells[i][j]);
      if (i === this.cols - 1)
        tween.onComplete.add(this.onCompleteRemoveLine, this);
    }
    ++this.waitLines;
    R.score += this.rows;
    if (R.sfx.row_removed) R.sfx.row_removed.play();
  },

  onCompleteRemoveLine: function () {
    if (--this.waitLines === 0) this.parentState.onComleteRemoveLines();
  },

  findShapePlace: function (state) {
    var ci = 0;
    var si = 0;
    var sj = 0;
    var ci2 = 0;
    var cj2 = 0;

    var lj = this.cols - state.length + 1;
    var li = this.rows - state[0].length + 1;

    var isNextCells = false;

    for (var cj = 0; cj < lj; ++cj) {
      for (ci = 0; ci < li; ++ci) {
        for (sj = 0, cj2 = cj; sj < state.length; ++sj, ++cj2) {
          for (si = 0, ci2 = ci; si < state[sj].length; ++si, ++ci2) {
            if (state[sj][si] === 1 && this.cells[cj2][ci2].exists) {
              isNextCells = true;
              break;
            }
          }
          if (isNextCells) break;
        }
        if (isNextCells) isNextCells = false;
        else return true;
      }
    }

    return false;
  },

  getRowCells: function () {
    var c = 0;
    var rowCells = [];
    for (var r = 0; r < 10; ++r) {
      var row = [];
      for (c = 0; c < 10; ++c)
        row.push(this.cells[r][c].exists ? this.cells[r][c].frame : -1);
      rowCells.push(row);
    }
    return rowCells;
  },

  remove3PastMoves: function () {
    var rowCells = this.savedRowCells[0];

    var r = rowCells.length;
    var c = 0;
    while (r--) {
      c = rowCells[r].length;
      while (c--) {
        if ((this.cells[r][c].exists = rowCells[r][c] !== -1))
          this.cells[r][c].frame = rowCells[r][c];
      }
    }

    this.savedRowCells.length = 0;
    this.saveLast3Moves = false;
  }
};

//
Well.prototype.constructor = Well;

//
R.onQuadScaleDown = function () {
  this.exists = false;
  this.scale.set(1);
};