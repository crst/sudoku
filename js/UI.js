var UI = {};
UI.n = 9;
UI.sn = parseInt(Math.sqrt(UI.n), 10);

UI.FIELD_MIN_SIZE = 2;
UI.FIELD_MAX_SIZE = 6;
UI.PLACEHOLDER = 'placeholder' in document.createElement('input');


$(document).ready(function () {
  if (!UI.PLACEHOLDER) {
    $('#auto_solve').prop({checked: false, disabled: true});
    $('.autosolve')
      .css({color: '#c0c0c0'})
      .attr('title', 'Requires a browser that supports the input placeholder attribute.');
  }

  $('#solve-button').click(UI.solve);
  $('#reset-button').click(UI.reset);

  $('#inc-n').click(UI.changeFieldSize(function (sn) { return Math.min(UI.FIELD_MAX_SIZE, sn + 1); }));
  $('#dec-n').click(UI.changeFieldSize(function (sn) { return Math.max(UI.FIELD_MIN_SIZE, sn - 1); }));

  UI.size = $('#size');
  UI.status = $('#status');
  UI.error = $('#error');

  UI.init();
});

// Build the UI.
UI.init = function () {
  UI.size.html('Sudoku field: ' + UI.n + 'x' + UI.n);
  UI.mkMatrix('Input &notin; [1,' + UI.n + '] will be ignored.', 'input', 'input-form');
  UI.displayStatus('');
  UI.displayError('');

  UI.input = [];
  for (var i = 0; i < UI.n * UI.n; i++) {
    UI.input[i] = $('#input' + (i + 1));
    if (Math.floor(i / UI.n) % UI.sn === 0) { UI.input[i].addClass('border-top'); }
    if (i % UI.sn === 0) { UI.input[i].addClass('border-left'); }
  }

  var inputs = $('#input-form .inp');
  var auto = $('#auto_solve');
  var autosolve = function () {
    if (auto.is(':checked')) {
      inputs.bind('change keyup', UI.solve);
      UI.solve();
    } else {
      inputs.unbind('change keyup');
    }
  };
  $('#auto_solve').change(autosolve);
  autosolve();
};

// Create the input elements for the Sudoku field.
UI.mkMatrix = function (caption, id, form) {
  return (function (n) {
    var buffer = ['<p>', caption, '</p>'];
    buffer.push('<table>');
    var size = Math.ceil(Math.log(UI.n) / Math.log(10));
    var i, j, cnt = 1;
    for (i = 1; i <= n; i++) {
      buffer.push('<tr>');
      for (j = 0; j < n; j++) {
        buffer.push('<td>');
        buffer.push('<input class="inp" id="' + id + cnt + '" maxlength="' + size + '">');
        buffer.push('</td>');
        cnt += 1;
      }
      buffer.push('</tr>');
    }
    buffer.push('</table>');
    $('#' + form).html(buffer.join(''));
  })(UI.n);
};

// Initialize and run the solving algorithm, display the results.
UI.solve = function () {
  UI.displayStatus('');
  UI.displayError('');

  var timeStart = new Date().valueOf();
  DLX.init(UI.n);
  var timeInit = new Date().valueOf();

  var inp, col, row;
  for (var i = 0; i < UI.n * UI.n; i++) {
    inp = parseInt(UI.input[i].val(), 10);
    if (!isNaN(inp) && inp > 0 && inp <= UI.n) {
      col = Math.floor(i % UI.n);
      row = Math.floor(i / UI.n);
      DLX.setFixed(inp, col, row, UI.n);
    }
  }

  var timeSolve = new Date().valueOf();
  DLX.run();
  var timeEnd = new Date().valueOf();

  var buffer = ['Initializing: ' + (timeInit - timeStart) + 'ms.'];
  buffer.push('Solving: ' + (timeEnd - timeSolve) + 'ms. ');
  buffer.push('Overall (with I/O): ' + (timeEnd - timeStart) + 'ms.');
  UI.displayStatus(buffer.join(''));
};

UI.reset = function () {
  $('#input-form .inp').val('').attr('placeholder', '');
  UI.init();
};

UI.displayError = function (msg) { UI.error.html(msg); };
UI.displayStatus = function (msg) { UI.status.html(msg); };

// Display calculated solution.
UI.showSolution = function (solution) {
  var i, d, elem, size = solution.length;
  for (i = 0; i < size; i++) {
    d = Reduction.decode(solution[i], UI.n);
    elem = UI.input[d.col * UI.n + d.row];
    elem.attr('placeholder', d.num);
    if (!UI.PLACEHOLDER) { elem.val(d.num); }
  }
};

UI.changeFieldSize = function (f) {
  return function () {
    UI.sn = f(UI.sn);
    if (UI.sn === UI.FIELD_MIN_SIZE) { $('#dec-n').hide(); } else { $('#dec-n').show(); }
    if (UI.sn === UI.FIELD_MAX_SIZE) { $('#inc-n').hide(); } else { $('#inc-n').show(); }
    UI.n = UI.sn * UI.sn;
    UI.init();
  };
};
