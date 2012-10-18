// Creates a sparse matrix which is meant as an EXACT COVER
// representation of a SUDOKU field.
//
//
// [1]: http://en.wikipedia.org/wiki/Exact_cover#Sudoku
// [2]: http://en.wikipedia.org/wiki/Algorithmics_of_sudoku#Exact_cover

var Reduction = {};

Reduction.SUDOKUtoEXACT_COVER = function (n) {
  var rows = n * n * n; // n numbers for every field, n * n fields.
  var cols = 4 * n * n; // 4 constraints for every field.

  // Create the row of heads for the sparse matrix.
  var head, heads = [], i, j;
  for (i = 0; i < cols; i++) {
    head = {size: n, col: i};
    head.head = head;
    if (i > 0) {
      head.left = heads[i - 1];
      head.left.right = head;
    }
    head.up = head;
    head.down = head;
    heads.push(head);
  }

  // Create the 'root' master header for the sparse matrix.
  var entry = {right: heads[0], left: heads[cols - 1]};
  entry.right.left = entry;
  entry.left.right = entry;

  // For every row, we calculate the positions of the elements and
  // insert them into the sparse matrix.
  var nodes, pos;
  for (i = 0; i < rows; i++) {
    nodes = [];
    pos = [Reduction.cellConstraint(i, n), Reduction.rowConstraint(i, n),
           Reduction.colConstraint(i, n), Reduction.boxConstraint(i, n)];

    for (j = 0; j < 4; j++) {
      nodes[j] = {row: i, head: heads[pos[j]]};
      nodes[j].up = nodes[j].head.up;
      nodes[j].up.down = nodes[j];
      nodes[j].head.up = nodes[j];
      nodes[j].down = nodes[j].head;
      if (nodes[j].head.down === nodes[j].head) {
        nodes[j].head.down = nodes[j];
      }
    }

    nodes[0].left = nodes[3];
    nodes[0].right = nodes[1];
    nodes[1].left = nodes[0];
    nodes[1].right = nodes[2];
    nodes[2].left = nodes[1];
    nodes[2].right = nodes[3];
    nodes[3].left = nodes[2];
    nodes[3].right = nodes[0];
  }

  return {entry: entry, heads: heads, fixedRows: []};
};


// There are only 4 elements for every row 'i' of the exact cover
// matrix. We calculate the column position (depending on the field
// size 'n') for each constraint using the following functions. Then
// we can directly add an element to the sparse matrix at that
// position.

Reduction.cellConstraint = function (i, n) {
  return Math.floor(i / n);
};

Reduction.rowConstraint = function (i, n) {
  var row = Math.floor(i / (n * n));
  var num = (i + 1) % n;
  num = num === 0 ? n : num;
  return (n * n) + (row * n) + num - 1;
};

Reduction.colConstraint = function (i, n) {
  return (2 * n * n) + (i % (n * n));
};

Reduction.boxConstraint = function (i, n) {
  var num = (i + 1) % n;
  num = num === 0 ? n : num;
  var sn = Math.sqrt(n);
  var offset1 = Math.floor(i / (n * sn)) % sn;
  var offset2 = Math.floor(i / (n * n * sn));
  return (3 * n * n) + (offset1 * n) + (offset2 * n * sn) + num - 1;
};

// Calculate the row, column and number at that position of the Sudoku
// field that corresponds to the row 'i' of the exact cover matrix.
Reduction.decode = function (i, n) {
  var row = Math.floor(i / (n * n));
  var col = Math.floor(i / n) % n;
  var num = (i + 1) % n;
  num = num === 0 ? n : num;
  return {row: row, col: col, num: num};
};

// Calculate the row of the exact cover matrix from a position of the
// Sudoku field.
Reduction.encode = function (num, row, col, n) {
  return ((row - 1) * n * n) + ((col - 1) * n) + num - 1;
};
