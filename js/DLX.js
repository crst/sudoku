// Dancing Links implementation of the Algorithm X, to solve the
// corresponding EXACT COVER representation of a Sudoku.
//
//
// [1]: http://en.wikipedia.org/wiki/Knuth%27s_Algorithm_X
// [2]: http://en.wikipedia.org/wiki/Dancing_Links

var DLX = {};
DLX.matrices = {};


// Calculate the sparse matrix if it does not already exist, otherwise
// load the previously calculated one and restore it so that there are
// no fixed elements.
DLX.init = function (n) {
  if (DLX.matrices[n] === undefined) {
    DLX.matrices[n] = Reduction.SUDOKUtoEXACT_COVER(n);
    DLX.matrix = DLX.matrices[n];
  } else {
    DLX.matrix = DLX.matrices[n];
    DLX.restoreAllFixedFields();
  }
  DLX.solution = [];
  DLX.sNodes = [];
  DLX.k = 0;
  DLX.solved = false;
  DLX.conflict = false;
};

// Run the solving algorithm.
DLX.run = function () {
  if (DLX.conflict) {
    UI.displayError('Input breaks the rules!');
  } else {
    DLX.search(DLX.k);
    if (!DLX.solved) {
      UI.displayError('Sudoku is unsolvable!');
    }
  }
};

// Set a fixed entry of the Sudoku field.
DLX.setFixed = function (num, row, col, n) {
  var r = Reduction.encode(num, row + 1, col + 1, n);
  DLX.solution[DLX.k] = r;
  DLX.k += 1;
  DLX.fixed += 1;

  var heads = {0: Reduction.cellConstraint(r, n),
               1: Reduction.rowConstraint(r, n),
               2: Reduction.colConstraint(r, n),
               3: Reduction.boxConstraint(r, n)};
  var covering;
  for (var i = 0; i < 4; i++) {
    covering = DLX.matrix.heads[heads[i]];
    if (covering.left.right !== covering) {
      DLX.conflict = true;
    } else {
      DLX.matrix.fixedRows.push(covering);
      DLX.cover(covering);
    }
  }
};

// Remove all fixed elements previously set with 'setFixed'.
DLX.restoreAllFixedFields = function () {
  while (DLX.matrix.fixedRows.length > 0) {
    DLX.uncover(DLX.matrix.fixedRows.pop());
  }
};


// The algorithm.

DLX.search = function (k) {
  if (DLX.solved) {
    return;
  }

  if (DLX.matrix.entry.right === DLX.matrix.entry) {
    UI.showSolution(DLX.solution);
    DLX.solved = true;
    return;
  }

  var c = DLX.chooseColumn();
  DLX.cover(c);

  var r = c.down;
  while (r !== c) {
    DLX.solution[k] = r.row;
    DLX.sNodes[k] = r;
    
    var j = r.right;
    while (j !== r) {
      DLX.cover(j.head);
      j = j.right;
    }

    DLX.search(k + 1);

    DLX.solution[k] = -1;
    r = DLX.sNodes[k];
    c = r.head;

    j = r.left;
    while (j !== r) {
      DLX.uncover(j.head);
      j = j.left;
    }

    r = r.down;
  }

  DLX.uncover(c.head);
};

DLX.chooseColumn = function () {
  var result;
  var min = Number.POSITIVE_INFINITY;
  var tmp = DLX.matrix.entry.right;

  while (tmp !== DLX.matrix.entry) {
    if (tmp.size < min) {
      result = tmp;
      min = tmp.size;
    }
    tmp = tmp.right;
  }

  return result;
};

DLX.cover = function (c) {
  c.right.left = c.left;
  c.left.right = c.right;

  var i = c.down;
  while (i !== c) {
    var j = i.right;
    while (j !== i) {
      j.down.up = j.up;
      j.up.down = j.down;
      j.head.size -= 1;
      j = j.right;
    }
    i = i.down;
  }
};

DLX.uncover = function (c) {
  var i = c.up;

  while (i !== c) {
    var j = i.left;
    while (j !== i) {
      j.head.size += 1;
      j.down.up = j;
      j.up.down = j;
      j = j.left;
    }
    i = i.up;
  }
  c.right.left = c;
  c.left.right = c;
};
