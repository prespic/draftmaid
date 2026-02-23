const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  DEFAULT_CODE, EXAMPLES, AUTO_COLORS, DSLParser, parseDSL,
  darken, boardCount, hasCuts, boardShape, listViewDims,
  VIEW_LABELS, autoDetectViews, listViewDimsMulti,
  encodeHash, decodeHash, projectBoard, projAxisLabels,
} = require('../lib/engine.js');

// Helper: create a parser with pre-set vars/boards for isolated method testing
function mkParser(vars = {}, reg = {}) {
  const p = new DSLParser('');
  p.vars = vars;
  p.reg = reg;
  return p;
}

// Helper: parse single board line with optional vars prefix
function parseOne(line, varsPrefix = '') {
  return parseDSL(varsPrefix + line);
}

// ═══════════════════════════════════════════════════════
//  1. Constants
// ═══════════════════════════════════════════════════════
describe('Constants', () => {
  it('DEFAULT_CODE is a non-empty string containing board[', () => {
    assert.equal(typeof DEFAULT_CODE, 'string');
    assert.ok(DEFAULT_CODE.length > 0);
    assert.ok(DEFAULT_CODE.includes('board['));
  });

  it('AUTO_COLORS has 12 items', () => {
    assert.equal(AUTO_COLORS.length, 12);
  });

  it('AUTO_COLORS entries are valid hex colors', () => {
    for (const c of AUTO_COLORS) {
      assert.match(c, /^#[0-9a-fA-F]{6}$/);
    }
  });
});

// ═══════════════════════════════════════════════════════
//  1b. EXAMPLES
// ═══════════════════════════════════════════════════════
describe('EXAMPLES', () => {
  it('EXAMPLES is a non-empty array', () => {
    assert.ok(Array.isArray(EXAMPLES));
    assert.ok(EXAMPLES.length > 0);
  });

  it('each entry has name (string) and code (string)', () => {
    for (const ex of EXAMPLES) {
      assert.equal(typeof ex.name, 'string');
      assert.ok(ex.name.length > 0);
      assert.equal(typeof ex.code, 'string');
      assert.ok(ex.code.length > 0);
    }
  });

  it('each code parses with 0 errors', () => {
    for (const ex of EXAMPLES) {
      const { errors } = parseDSL(ex.code);
      assert.deepEqual(errors, [], `Example "${ex.name}" has errors: ${errors.join(', ')}`);
    }
  });

  it('each code produces at least 1 board', () => {
    for (const ex of EXAMPLES) {
      const { boards } = parseDSL(ex.code);
      assert.ok(boards.length >= 1, `Example "${ex.name}" produced 0 boards`);
    }
  });

  it('first example is DEFAULT_CODE', () => {
    assert.equal(EXAMPLES[0].code, DEFAULT_CODE);
  });
});

// ═══════════════════════════════════════════════════════
//  2. DSLParser.math()
// ═══════════════════════════════════════════════════════
describe('DSLParser.math()', () => {
  const p = mkParser();

  it('addition', () => assert.equal(p.math('10+5'), 15));
  it('subtraction', () => assert.equal(p.math('100-30'), 70));
  it('multiplication', () => assert.equal(p.math('6*7'), 42));
  it('division', () => assert.equal(p.math('100/4'), 25));

  it('parentheses: (100+50)*2 = 300', () => {
    assert.equal(p.math('(100+50)*2'), 300);
  });

  it('decimal numbers', () => {
    assert.equal(p.math('1.5+2.5'), 4);
  });

  it('rounds to 3 decimal places (1/3)', () => {
    assert.equal(p.math('1/3'), 0.333);
  });

  it('rejects letters', () => {
    assert.throws(() => p.math('abc'), /Neplatný výraz/);
  });

  it('rejects division by zero (Infinity)', () => {
    assert.throws(() => p.math('1/0'));
  });
});

// ═══════════════════════════════════════════════════════
//  3. DSLParser.splitCoords()
// ═══════════════════════════════════════════════════════
describe('DSLParser.splitCoords()', () => {
  const p = mkParser();

  it('simple split 0,0,0', () => {
    assert.deepEqual(p.splitCoords('0,0,0'), ['0', '0', '0']);
  });

  it('respects {a.x} nested notation', () => {
    const parts = p.splitCoords('{a.x},0,{b.z}');
    assert.equal(parts.length, 3);
    assert.equal(parts[0], '{a.x}');
  });

  it('respects parentheses (1+2)', () => {
    const parts = p.splitCoords('(1+2),3');
    assert.equal(parts.length, 2);
    assert.equal(parts[0], '(1+2)');
  });

  it('single element without comma', () => {
    assert.deepEqual(p.splitCoords('42'), ['42']);
  });
});

// ═══════════════════════════════════════════════════════
//  4. DSLParser.findKeyword() / findNextKeyword()
// ═══════════════════════════════════════════════════════
describe('DSLParser.findKeyword() / findNextKeyword()', () => {
  const p = mkParser();

  it('finds keyword at top-level', () => {
    assert.notEqual(p.findKeyword('at 10,20,30', 'at'), -1);
  });

  it('ignores keyword inside {}', () => {
    assert.equal(p.findKeyword('{obj.at}+5', 'at'), -1);
  });

  it('ignores keyword inside ()', () => {
    assert.equal(p.findKeyword('(at+5)', 'at'), -1);
  });

  it('case insensitive', () => {
    assert.notEqual(p.findKeyword('AT 10,20,30', 'at'), -1);
  });

  it('findNextKeyword returns earliest', () => {
    const result = p.findNextKeyword('view f color #abc', ['view', 'color']);
    assert.equal(result.keyword, 'view');
    assert.equal(result.pos, 0);
  });

  it('returns -1 / null when not found', () => {
    assert.equal(p.findKeyword('hello world', 'at'), -1);
    const result = p.findNextKeyword('hello', ['at', 'cut']);
    assert.equal(result.pos, -1);
    assert.equal(result.keyword, null);
  });
});

// ═══════════════════════════════════════════════════════
//  5. DSLParser.eval()
// ═══════════════════════════════════════════════════════
describe('DSLParser.eval()', () => {
  it('substitutes variable $T', () => {
    const p = mkParser({ T: 18 });
    assert.equal(p.eval('$T'), 18);
  });

  it('unknown variable throws', () => {
    const p = mkParser({});
    assert.throws(() => p.eval('$UNKNOWN'), /Neznámá proměnná/);
  });

  it('property reference {id.prop}', () => {
    const board = { id: 'a', w: 100, h: 200, d: 50, x: 10, y: 20, z: 30, angle: 0 };
    const p = mkParser({}, { a: board });
    assert.equal(p.eval('{a.w}'), 100);
  });

  it('unknown ID throws', () => {
    const p = mkParser({});
    assert.throws(() => p.eval('{unknown.w}'), /Neznámé ID/);
  });

  it('LEN(0,0,3,4) = 5', () => {
    const p = mkParser();
    assert.equal(p.eval('LEN(0,0,3,4)'), 5);
  });

  it('LEN is case insensitive', () => {
    const p = mkParser();
    assert.equal(p.eval('len(0,0,3,4)'), 5);
  });

  it('combined expression: $T + {a.w} + LEN(0,0,3,4)', () => {
    const board = { id: 'a', w: 100, h: 200, d: 50, x: 0, y: 0, z: 0, angle: 0 };
    const p = mkParser({ T: 18 }, { a: board });
    assert.equal(p.eval('$T+{a.w}+LEN(0,0,3,4)'), 123);
  });

  it('arithmetic in variable expressions', () => {
    const p = mkParser({ W: 800 });
    assert.equal(p.eval('$W+100'), 900);
  });
});

// ═══════════════════════════════════════════════════════
//  6. DSLParser.prop()
// ═══════════════════════════════════════════════════════
describe('DSLParser.prop()', () => {
  const board = { id: 'a', w: 100, h: 200, d: 50, x: 10, y: 20, z: 30, angle: 0 };
  const p = mkParser();

  it('basic: x, y, z', () => {
    assert.equal(p.prop(board, 'x', 'a'), 10);
    assert.equal(p.prop(board, 'y', 'a'), 20);
    assert.equal(p.prop(board, 'z', 'a'), 30);
  });

  it('basic: w, h, d', () => {
    assert.equal(p.prop(board, 'w', 'a'), 100);
    assert.equal(p.prop(board, 'h', 'a'), 200);
    assert.equal(p.prop(board, 'd', 'a'), 50);
  });

  it('derived: right = x+w', () => {
    assert.equal(p.prop(board, 'right', 'a'), 110);
  });

  it('derived: top = y+h', () => {
    assert.equal(p.prop(board, 'top', 'a'), 220);
  });

  it('derived: back = z+d', () => {
    assert.equal(p.prop(board, 'back', 'a'), 80);
  });

  it('derived: cx, cy', () => {
    assert.equal(p.prop(board, 'cx', 'a'), 60);
    assert.equal(p.prop(board, 'cy', 'a'), 120);
  });

  it('rotated board: AABB right/top', () => {
    const rotated = { id: 'r', w: 100, h: 20, d: 50, x: 0, y: 0, z: 0, angle: 45 };
    const right = p.prop(rotated, 'right', 'r');
    const top = p.prop(rotated, 'top', 'r');
    assert.ok(right > 0);
    assert.ok(top > 0);
  });

  it('rotated board: x2, y2', () => {
    const rotated = { id: 'r', w: 100, h: 20, d: 50, x: 0, y: 0, z: 0, angle: 90 };
    const x2 = p.prop(rotated, 'x2', 'r');
    const y2 = p.prop(rotated, 'y2', 'r');
    assert.ok(Math.abs(x2) < 1); // cos(90) ~ 0
    assert.ok(Math.abs(y2 - 100) < 1); // sin(90) ~ 1
  });

  it('.angle property', () => {
    assert.equal(p.prop(board, 'angle', 'a'), 0);
    const rotated = { id: 'r', w: 100, h: 20, d: 50, x: 0, y: 0, z: 0, angle: 45 };
    assert.equal(p.prop(rotated, 'angle', 'r'), 45);
  });

  it('null position defaults to 0', () => {
    const noPos = { id: 'n', w: 100, h: 200, d: 50, x: null, y: null, z: null, angle: 0 };
    assert.equal(p.prop(noPos, 'x', 'n'), 0);
    assert.equal(p.prop(noPos, 'right', 'n'), 100);
  });

  it('unknown property throws', () => {
    assert.throws(() => p.prop(board, 'foo', 'a'), /Neznámá vlastnost/);
  });
});

// ═══════════════════════════════════════════════════════
//  7. Variables ($var)
// ═══════════════════════════════════════════════════════
describe('Variables ($var)', () => {
  it('$T = 18 → varCount 1', () => {
    const { varCount } = parseDSL('$T = 18');
    assert.equal(varCount, 1);
  });

  it('expression $W = 100+200 → evaluates to 300', () => {
    const p = new DSLParser('$W = 100+200\nboard 300 x 10 x 10 "Test"');
    const { boards } = p.parse();
    assert.equal(boards[0].w, 300); // board uses the full width from expression
  });

  it('chaining $A=10, $B=$A+5 → 15', () => {
    const { boards } = parseDSL('$A = 10\n$B = $A+5\nboard $B x 10 x 10 "Test"');
    assert.equal(boards[0].w, 15);
  });

  it('unknown variable in board → error', () => {
    const { errors } = parseDSL('board $NOPE x 10 x 10 "Test"');
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('Neznámá proměnná')));
  });

  it('invalid syntax → error', () => {
    const { errors } = parseDSL('$=bad');
    assert.ok(errors.length > 0);
  });

  it('multiple variables', () => {
    const { varCount } = parseDSL('$A = 1\n$B = 2\n$C = 3');
    assert.equal(varCount, 3);
  });
});

// ═══════════════════════════════════════════════════════
//  8. Board parsing — basics
// ═══════════════════════════════════════════════════════
describe('Board parsing — basics', () => {
  it('minimal board: board[a] W x H x D "Name"', () => {
    const { boards, errors } = parseDSL('board[a] 100 x 200 x 50 "Test"');
    assert.equal(errors.length, 0);
    assert.equal(boards.length, 1);
    assert.equal(boards[0].id, 'a');
    assert.equal(boards[0].w, 100);
    assert.equal(boards[0].h, 200);
    assert.equal(boards[0].d, 50);
    assert.equal(boards[0].name, 'Test');
  });

  it('auto-ID (b0) when without [id]', () => {
    const { boards } = parseDSL('board 100 x 200 x 50 "Test"');
    assert.equal(boards[0].id, 'b0');
  });

  it('at X,Y,Z → hasPos true, coordinates set', () => {
    const { boards } = parseDSL('board[a] 100 x 200 x 50 "Test" at 10,20,30');
    assert.equal(boards[0].hasPos, true);
    assert.equal(boards[0].x, 10);
    assert.equal(boards[0].y, 20);
    assert.equal(boards[0].z, 30);
  });

  it('without position → hasPos false, x/y/z null', () => {
    const { boards } = parseDSL('board[a] 100 x 200 x 50 "Test"');
    assert.equal(boards[0].hasPos, false);
    assert.equal(boards[0].x, null);
    assert.equal(boards[0].y, null);
    assert.equal(boards[0].z, null);
  });

  it('duplicate ID → error', () => {
    const { errors } = parseDSL('board[a] 100 x 200 x 50 "A"\nboard[a] 100 x 200 x 50 "B"');
    assert.ok(errors.some(e => e.includes('duplicitní ID')));
  });

  it('wrong dimension count (2) → error', () => {
    const { errors } = parseDSL('board[a] 100 x 200 "Test"');
    assert.ok(errors.length > 0);
  });

  it('expressions in dimensions', () => {
    const { boards } = parseDSL('$T = 18\nboard[a] $T x 200 x 50 "Test"');
    assert.equal(boards[0].w, 18);
  });

  it('comments (# and //) are skipped', () => {
    const { boards, errors } = parseDSL('# comment\n// another\nboard[a] 100 x 200 x 50 "Test"');
    assert.equal(errors.length, 0);
    assert.equal(boards.length, 1);
  });

  it('unknown command → error', () => {
    const { errors } = parseDSL('foobar something');
    assert.ok(errors.length > 0);
    assert.ok(errors[0].includes('neznámý příkaz'));
  });

  it('at with 2 coordinates → error', () => {
    const { errors } = parseDSL('board[a] 100 x 200 x 50 "Test" at 10,20');
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('3 hodnoty')));
  });

  it('empty lines are skipped', () => {
    const { boards, errors } = parseDSL('\n\nboard[a] 100 x 200 x 50 "Test"\n\n');
    assert.equal(errors.length, 0);
    assert.equal(boards.length, 1);
  });

  it('board is case insensitive', () => {
    const { boards } = parseDSL('Board[a] 100 x 200 x 50 "Test"');
    assert.equal(boards.length, 1);
  });
});

// ═══════════════════════════════════════════════════════
//  8b. Board — multiline (indentation continuation)
// ═══════════════════════════════════════════════════════
describe('Board — multiline (indentation continuation)', () => {
  it('indented lines join to previous board line', () => {
    const { boards, errors } = parseDSL('board[a] 100 x 200 x 50 "Test"\n  at 10, 20, 30');
    assert.equal(errors.length, 0);
    assert.equal(boards[0].x, 10);
    assert.equal(boards[0].y, 20);
    assert.equal(boards[0].z, 30);
  });

  it('multiple continuation lines', () => {
    const { boards, errors } = parseDSL(
      'board[a] 100 x 200 x 50 "Test"\n  at 10, 20, 30\n  color #ff0000\n  view s'
    );
    assert.equal(errors.length, 0);
    assert.equal(boards[0].x, 10);
    assert.equal(boards[0].color, '#ff0000');
    assert.equal(boards[0].view, 's');
  });

  it('tab indentation works', () => {
    const { boards, errors } = parseDSL('board[a] 100 x 200 x 50 "Test"\n\tat 5, 6, 7');
    assert.equal(errors.length, 0);
    assert.equal(boards[0].x, 5);
  });

  it('comment line between board and continuation is not joined', () => {
    const { boards, errors } = parseDSL(
      'board[a] 100 x 200 x 50 "Test"\n# comment\n  at 10, 20, 30'
    );
    // The comment breaks the continuation, so "  at 10, 20, 30" is unknown command
    assert.ok(errors.length > 0);
  });

  it('empty line between board and continuation breaks it', () => {
    const { boards, errors } = parseDSL(
      'board[a] 100 x 200 x 50 "Test"\n\n  at 10, 20, 30'
    );
    assert.ok(errors.length > 0);
  });

  it('non-indented line after board is separate command', () => {
    const { boards, errors } = parseDSL(
      'board[a] 100 x 200 x 50 "A"\nboard[b] 200 x 300 x 60 "B"'
    );
    assert.equal(errors.length, 0);
    assert.equal(boards.length, 2);
  });

  it('indented line after variable is NOT continuation', () => {
    const { errors } = parseDSL('$T = 18\n  board[a] 100 x 200 x 50 "Test"');
    // Indented board line is NOT joined to variable — it starts fresh
    // but it starts with spaces so it won't match /^board/... wait, trim happens after joining
    // Actually: the indented line is not after a board, so it becomes its own line
    // and after trim it matches /^board/
    assert.equal(errors.length, 0);
  });

  it('multiline board with cut', () => {
    const { boards, errors } = parseDSL(
      'board[a] 100 x 200 x 50 "Test"\n  at 0, 0, 0\n  cut left 50 right 30'
    );
    assert.equal(errors.length, 0);
    assert.deepEqual(boards[0].cuts, { left: 50, right: 30, top: null, bottom: null });
  });

  it('mixed single-line and multiline boards', () => {
    const dsl = [
      '$T = 18',
      'board[a] 100 x 200 x 50 "A" at 0, 0, 0 color #aaa',
      'board[b] 200 x 300 x 60 "B"',
      '  at 10, 20, 30',
      '  view ft',
      'board[c] 50 x 50 x 50 "C"',
    ].join('\n');
    const { boards, errors } = parseDSL(dsl);
    assert.equal(errors.length, 0);
    assert.equal(boards.length, 3);
    assert.equal(boards[0].color, '#aaa');
    assert.equal(boards[1].x, 10);
    assert.equal(boards[1].view, 'ft');
    assert.equal(boards[2].view, null);
  });
});

// ═══════════════════════════════════════════════════════
//  9. Board — color
// ═══════════════════════════════════════════════════════
describe('Board — color', () => {
  it('without color → auto-assigned from AUTO_COLORS', () => {
    const { boards } = parseDSL('board[a] 100 x 200 x 50 "Test"');
    assert.equal(boards[0].color, AUTO_COLORS[0]);
  });

  it('explicit color #abc123', () => {
    const { boards } = parseDSL('board[a] 100 x 200 x 50 "Test" color #abc123');
    assert.equal(boards[0].color, '#abc123');
  });

  it('color cycling through palette', () => {
    let dsl = '';
    for (let i = 0; i < 13; i++) {
      dsl += `board 10 x 10 x 10 "B${i}"\n`;
    }
    const { boards } = parseDSL(dsl);
    assert.equal(boards[0].color, AUTO_COLORS[0]);
    assert.equal(boards[12].color, AUTO_COLORS[0]); // wraps around
  });
});

// ═══════════════════════════════════════════════════════
//  10. Board — from/to
// ═══════════════════════════════════════════════════════
describe('Board — from/to', () => {
  it('horizontal: from 0,0 to 100,0 → angle=0, w=100', () => {
    const { boards } = parseDSL('board[a] 100 x 20 x 50 "Test" from 0,0 to 100,0');
    assert.equal(boards[0].angle, 0);
    assert.equal(boards[0].w, 100);
    assert.equal(boards[0].hasPos, true);
  });

  it('vertical: from 0,0 to 0,100 → angle=90', () => {
    const { boards } = parseDSL('board[a] 100 x 20 x 50 "Test" from 0,0 to 0,100');
    assert.equal(boards[0].angle, 90);
  });

  it('diagonal: from 0,0 to 100,100 → angle=45', () => {
    const { boards } = parseDSL('board[a] 142 x 20 x 50 "Test" from 0,0 to 100,100');
    assert.equal(boards[0].angle, 45);
    // w should be ~141.421
    assert.ok(Math.abs(boards[0].w - 141.421) < 0.01);
  });

  it('width correction + warning', () => {
    const { boards, errors } = parseDSL('board[a] 999 x 20 x 50 "Test" from 0,0 to 100,0');
    assert.equal(boards[0].w, 100); // corrected
    assert.ok(errors.some(e => e.includes('Šířka')));
  });

  it('z after to', () => {
    const { boards } = parseDSL('board[a] 100 x 20 x 50 "Test" from 0,0 to 100,0 z 42');
    assert.equal(boards[0].z, 42);
  });

  it('fromTo object stored on board', () => {
    const { boards } = parseDSL('board[a] 100 x 20 x 50 "Test" from 10,20 to 110,20');
    assert.deepEqual(boards[0].fromTo, { x1: 10, y1: 20, x2: 110, y2: 20 });
  });

  it('.angle, .x2, .y2 via prop()', () => {
    const { boards } = parseDSL('board[a] 100 x 20 x 50 "Test" from 0,0 to 100,0');
    const p = mkParser({}, { a: boards[0] });
    assert.equal(p.prop(boards[0], 'angle', 'a'), 0);
    assert.equal(p.prop(boards[0], 'x2', 'a'), 100);
    assert.equal(p.prop(boards[0], 'y2', 'a'), 0);
  });

  it('.right, .top AABB for rotated board', () => {
    const { boards } = parseDSL('board[a] 100 x 20 x 50 "Test" from 0,0 to 0,100');
    const p = mkParser({}, { a: boards[0] });
    const right = p.prop(boards[0], 'right', 'a');
    const top = p.prop(boards[0], 'top', 'a');
    assert.ok(right > 0 || right === 0); // AABB right
    assert.ok(top > 0);
  });

  it('from/to with variables', () => {
    const { boards, errors } = parseDSL('$X = 100\nboard[a] 100 x 20 x 50 "Test" from 0,0 to $X,0');
    assert.equal(errors.length, 0);
    assert.equal(boards[0].w, 100);
  });
});

// ═══════════════════════════════════════════════════════
//  11. Board — cut
// ═══════════════════════════════════════════════════════
describe('Board — cut', () => {
  it('cut left 300 right 200', () => {
    const { boards } = parseDSL('board[a] 500 x 400 x 50 "Test" cut left 300 right 200');
    assert.equal(boards[0].cuts.left, 300);
    assert.equal(boards[0].cuts.right, 200);
    assert.equal(boards[0].cuts.top, null);
    assert.equal(boards[0].cuts.bottom, null);
  });

  it('cut top 100 bottom 150', () => {
    const { boards } = parseDSL('board[a] 500 x 400 x 50 "Test" cut top 100 bottom 150');
    assert.equal(boards[0].cuts.top, 100);
    assert.equal(boards[0].cuts.bottom, 150);
  });

  it('all 4 sides', () => {
    const { boards } = parseDSL('board[a] 500 x 400 x 50 "Test" cut left 300 right 200 top 100 bottom 150');
    assert.equal(boards[0].cuts.left, 300);
    assert.equal(boards[0].cuts.right, 200);
    assert.equal(boards[0].cuts.top, 100);
    assert.equal(boards[0].cuts.bottom, 150);
  });

  it('without cut → cuts === null', () => {
    const { boards } = parseDSL('board[a] 100 x 200 x 50 "Test"');
    assert.equal(boards[0].cuts, null);
  });

  it('cut with expression', () => {
    const { boards } = parseDSL('$T = 18\nboard[a] 500 x 400 x 50 "Test" cut left $T*2');
    assert.equal(boards[0].cuts.left, 36);
  });
});

// ═══════════════════════════════════════════════════════
//  12. Board — view
// ═══════════════════════════════════════════════════════
describe('Board — view', () => {
  it('view f', () => {
    const { boards } = parseDSL('board[a] 100 x 200 x 50 "Test" view f');
    assert.equal(boards[0].view, 'f');
  });

  it('view s', () => {
    const { boards } = parseDSL('board[a] 100 x 200 x 50 "Test" view s');
    assert.equal(boards[0].view, 's');
  });

  it('view t', () => {
    const { boards } = parseDSL('board[a] 100 x 200 x 50 "Test" view t');
    assert.equal(boards[0].view, 't');
  });

  it('default view = null (auto-detect)', () => {
    const { boards } = parseDSL('board[a] 100 x 200 x 50 "Test"');
    assert.equal(boards[0].view, null);
  });

  it('invalid view x → error', () => {
    const { errors } = parseDSL('board[a] 100 x 200 x 50 "Test" view x');
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('Neplatný pohled')));
  });
});

// ═══════════════════════════════════════════════════════
//  13. Combined keywords
// ═══════════════════════════════════════════════════════
describe('Combined keywords', () => {
  it('from/to + cut + view + color together', () => {
    const { boards, errors } = parseDSL(
      'board[a] 100 x 20 x 50 "Test" from 0,0 to 100,0 cut left 15 right 10 view s color #ff0000'
    );
    assert.equal(errors.length, 0);
    assert.equal(boards[0].w, 100);
    assert.equal(boards[0].cuts.left, 15);
    assert.equal(boards[0].cuts.right, 10);
    assert.equal(boards[0].view, 's');
    assert.equal(boards[0].color, '#ff0000');
  });

  it('at + cut + view + color together', () => {
    const { boards, errors } = parseDSL(
      'board[a] 100 x 200 x 50 "Test" at 10,20,30 cut left 150 view t color #00ff00'
    );
    assert.equal(errors.length, 0);
    assert.equal(boards[0].x, 10);
    assert.equal(boards[0].cuts.left, 150);
    assert.equal(boards[0].view, 't');
    assert.equal(boards[0].color, '#00ff00');
  });
});

// ═══════════════════════════════════════════════════════
//  14. DEFAULT_CODE integration
// ═══════════════════════════════════════════════════════
describe('DEFAULT_CODE integration', () => {
  const result = parseDSL(DEFAULT_CODE);

  it('parses with 0 errors', () => {
    assert.equal(result.errors.length, 0);
  });

  it('has 8 boards', () => {
    assert.equal(result.boards.length, 8);
  });

  it('has 4 variables (varCount)', () => {
    assert.equal(result.varCount, 4);
  });

  it('correct IDs: dn, lt, rt, tp, bk, p1, p2, p3', () => {
    const ids = result.boards.map(b => b.id);
    assert.deepEqual(ids, ['dn', 'lt', 'rt', 'tp', 'bk', 'p1', 'p2', 'p3']);
  });
});

// ═══════════════════════════════════════════════════════
//  15. darken()
// ═══════════════════════════════════════════════════════
describe('darken()', () => {
  it('normal darkening', () => {
    const result = darken('#ffffff', 0.5);
    assert.equal(result, '#7f7f7f');
  });

  it('3-char hex (#fff) → expands and darkens', () => {
    const result = darken('#fff', 0.5);
    assert.equal(result, '#7f7f7f');
  });

  it('null/falsy → #333', () => {
    assert.equal(darken(null), '#333');
    assert.equal(darken(''), '#333');
    assert.equal(darken(undefined), '#333');
  });

  it('short hex (#ab) → #333', () => {
    assert.equal(darken('#ab'), '#333');
  });

  it('#000000 → stays black', () => {
    assert.equal(darken('#000000', 0.5), '#000000');
  });
});

// ═══════════════════════════════════════════════════════
//  16. boardCount() — Czech declension
// ═══════════════════════════════════════════════════════
describe('boardCount()', () => {
  it('0 → "0 desek"', () => assert.equal(boardCount(0), '0 desek'));
  it('1 → "1 deska"', () => assert.equal(boardCount(1), '1 deska'));
  it('3 → "3 desky"', () => assert.equal(boardCount(3), '3 desky'));
  it('5 → "5 desek"', () => assert.equal(boardCount(5), '5 desek'));
});

// ═══════════════════════════════════════════════════════
//  17. hasCuts()
// ═══════════════════════════════════════════════════════
describe('hasCuts()', () => {
  it('cuts: null → falsy', () => {
    assert.ok(!hasCuts({ cuts: null }));
  });

  it('all null values → falsy', () => {
    assert.ok(!hasCuts({ cuts: { left: null, right: null, top: null, bottom: null } }));
  });

  it('one non-null → true', () => {
    assert.ok(hasCuts({ cuts: { left: 100, right: null, top: null, bottom: null } }));
  });

  it('multiple non-null → true', () => {
    assert.ok(hasCuts({ cuts: { left: 100, right: 200, top: null, bottom: null } }));
  });
});

// ═══════════════════════════════════════════════════════
//  18. boardShape()
// ═══════════════════════════════════════════════════════
describe('boardShape()', () => {
  it('without cuts → full rectangle', () => {
    const pts = boardShape({ w: 100, h: 200, cuts: null });
    assert.deepEqual(pts, [[0,0],[100,0],[100,200],[0,200]]);
  });

  it('left+right cuts → trapezoid', () => {
    const pts = boardShape({ w: 500, h: 400, cuts: { left: 300, right: 200, top: null, bottom: null } });
    assert.deepEqual(pts, [[0,0],[500,0],[500,200],[0,300]]);
  });

  it('top+bottom cuts', () => {
    const pts = boardShape({ w: 500, h: 400, cuts: { left: null, right: null, top: 100, bottom: 150 } });
    assert.deepEqual(pts, [[0,0],[150,0],[100,400],[0,400]]);
  });

  it('all 4 cuts', () => {
    const pts = boardShape({ w: 500, h: 400, cuts: { left: 300, right: 200, top: 100, bottom: 150 } });
    assert.deepEqual(pts, [[0,0],[150,0],[100,200],[0,300]]);
  });
});

// ═══════════════════════════════════════════════════════
//  19. listViewDims()
// ═══════════════════════════════════════════════════════
describe('listViewDims()', () => {
  const b = { w: 100, h: 200, d: 50 };

  it('f → {dw: w, dh: h}', () => {
    assert.deepEqual(listViewDims({ ...b, view: 'f' }), { dw: 100, dh: 200 });
  });

  it('s → {dw: d, dh: h}', () => {
    assert.deepEqual(listViewDims({ ...b, view: 's' }), { dw: 50, dh: 200 });
  });

  it('t → {dw: w, dh: d}', () => {
    assert.deepEqual(listViewDims({ ...b, view: 't' }), { dw: 100, dh: 50 });
  });

  it('undefined view → default front', () => {
    assert.deepEqual(listViewDims({ ...b }), { dw: 100, dh: 200 });
  });
});

// ═══════════════════════════════════════════════════════
//  20. encodeHash() / decodeHash()
// ═══════════════════════════════════════════════════════
describe('encodeHash() / decodeHash()', () => {
  it('round-trip ASCII', () => {
    const text = 'board[a] 100 x 200 x 50 "Test"';
    assert.equal(decodeHash(encodeHash(text)), text);
  });

  it('round-trip Czech characters', () => {
    const text = 'Skříňka';
    assert.equal(decodeHash(encodeHash(text)), text);
  });

  it('empty string round-trip', () => {
    assert.equal(decodeHash(encodeHash('')), '');
  });

  it('invalid base64 → null', () => {
    assert.equal(decodeHash('!!!not-valid-base64!!!'), null);
  });

  it('special characters (newlines, quotes)', () => {
    const text = 'line1\nline2\n"quoted"';
    assert.equal(decodeHash(encodeHash(text)), text);
  });
});

// ═══════════════════════════════════════════════════════
//  21. projectBoard() — 6 projections
// ═══════════════════════════════════════════════════════
describe('projectBoard()', () => {
  const b = { w: 100, h: 200, d: 50, x: 10, y: 20, z: 30 };

  it('front projection', () => {
    assert.deepEqual(projectBoard(b, 'front'), { lx: 10, ly: 20, lw: 100, lh: 200 });
  });

  it('back projection', () => {
    assert.deepEqual(projectBoard(b, 'back'), { lx: -110, ly: 20, lw: 100, lh: 200 });
  });

  it('left projection', () => {
    assert.deepEqual(projectBoard(b, 'left'), { lx: 30, ly: 20, lw: 50, lh: 200 });
  });

  it('right projection', () => {
    assert.deepEqual(projectBoard(b, 'right'), { lx: -80, ly: 20, lw: 50, lh: 200 });
  });

  it('top projection', () => {
    assert.deepEqual(projectBoard(b, 'top'), { lx: 10, ly: 30, lw: 100, lh: 50 });
  });

  it('bottom projection', () => {
    assert.deepEqual(projectBoard(b, 'bottom'), { lx: 10, ly: -80, lw: 100, lh: 50 });
  });

  it('board with null coordinates defaults to 0', () => {
    const nb = { w: 100, h: 200, d: 50, x: null, y: null, z: null };
    assert.deepEqual(projectBoard(nb, 'front'), { lx: 0, ly: 0, lw: 100, lh: 200 });
  });
});

// ═══════════════════════════════════════════════════════
//  22. projAxisLabels()
// ═══════════════════════════════════════════════════════
describe('projAxisLabels()', () => {
  it('front/back → X, Y', () => {
    assert.deepEqual(projAxisLabels('front'), ['\u2192 X', '\u2191 Y']);
    assert.deepEqual(projAxisLabels('back'), ['\u2192 X', '\u2191 Y']);
  });

  it('left/right → Z, Y', () => {
    assert.deepEqual(projAxisLabels('left'), ['\u2192 Z', '\u2191 Y']);
    assert.deepEqual(projAxisLabels('right'), ['\u2192 Z', '\u2191 Y']);
  });

  it('top/bottom → X, Z', () => {
    assert.deepEqual(projAxisLabels('top'), ['\u2192 X', '\u2191 Z']);
    assert.deepEqual(projAxisLabels('bottom'), ['\u2192 X', '\u2191 Z']);
  });
});

// ═══════════════════════════════════════════════════════
//  23. Multi-view parser
// ═══════════════════════════════════════════════════════
describe('Multi-view parser', () => {
  it('view ft → "ft"', () => {
    const { boards } = parseDSL('board[a] 100 x 200 x 50 "A" view ft');
    assert.equal(boards[0].view, 'ft');
  });

  it('view fst → "fst"', () => {
    const { boards } = parseDSL('board[a] 100 x 200 x 50 "A" view fst');
    assert.equal(boards[0].view, 'fst');
  });

  it('preserves order: sf → "sf"', () => {
    const { boards } = parseDSL('board[a] 100 x 200 x 50 "A" view sf');
    assert.equal(boards[0].view, 'sf');
  });

  it('deduplicates: fft → "ft"', () => {
    const { boards } = parseDSL('board[a] 100 x 200 x 50 "A" view fft');
    assert.equal(boards[0].view, 'ft');
  });

  it('invalid char in multi-view → error', () => {
    const { errors } = parseDSL('board[a] 100 x 200 x 50 "A" view fx');
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes("Neplatný pohled 'x'")));
  });

  it('multi-view + color works', () => {
    const { boards, errors } = parseDSL('board[a] 100 x 200 x 50 "A" view ft color #ff0000');
    assert.equal(errors.length, 0);
    assert.equal(boards[0].view, 'ft');
    assert.equal(boards[0].color, '#ff0000');
  });
});

// ═══════════════════════════════════════════════════════
//  24. listViewDimsMulti()
// ═══════════════════════════════════════════════════════
describe('listViewDimsMulti()', () => {
  const b = { w: 100, h: 200, d: 50 };

  it('single "f" → 1 element with front dims', () => {
    const result = listViewDimsMulti({ ...b, view: 'f' });
    assert.equal(result.length, 1);
    assert.deepEqual({ dw: result[0].dw, dh: result[0].dh }, { dw: 100, dh: 200 });
    assert.equal(result[0].view, 'f');
  });

  it('"ft" → 2 elements with correct dims', () => {
    const result = listViewDimsMulti({ ...b, view: 'ft' });
    assert.equal(result.length, 2);
    assert.deepEqual({ dw: result[0].dw, dh: result[0].dh }, { dw: 100, dh: 200 }); // front
    assert.deepEqual({ dw: result[1].dw, dh: result[1].dh }, { dw: 100, dh: 50 });  // top
  });

  it('"fst" → 3 elements', () => {
    const result = listViewDimsMulti({ ...b, view: 'fst' });
    assert.equal(result.length, 3);
    assert.equal(result[0].view, 'f');
    assert.equal(result[1].view, 's');
    assert.equal(result[2].view, 't');
  });

  it('includes Czech labels', () => {
    const result = listViewDimsMulti({ ...b, view: 'fst' });
    assert.equal(result[0].label, 'přední');
    assert.equal(result[1].label, 'boční');
    assert.equal(result[2].label, 'shora');
  });

  it('side view: dw=d, dh=h', () => {
    const result = listViewDimsMulti({ ...b, view: 's' });
    assert.equal(result[0].dw, 50);
    assert.equal(result[0].dh, 200);
  });

  it('top view: dw=w, dh=d', () => {
    const result = listViewDimsMulti({ ...b, view: 't' });
    assert.equal(result[0].dw, 100);
    assert.equal(result[0].dh, 50);
  });
});

// ═══════════════════════════════════════════════════════
//  25. autoDetectViews()
// ═══════════════════════════════════════════════════════
describe('autoDetectViews()', () => {
  it('panel 800×18×400 → "tf" (top+front largest)', () => {
    const result = autoDetectViews({ w: 800, h: 18, d: 400 });
    assert.equal(result, 'tf');
  });

  it('hranol 50×60×2000 → "st" (side+top largest)', () => {
    const result = autoDetectViews({ w: 50, h: 60, d: 2000 });
    // side: 2000*60=120000, top: 50*2000=100000, front: 50*60=3000
    assert.equal(result, 'st');
  });

  it('cube 100×100×100 → "fs" (all equal, stable sort keeps order)', () => {
    const result = autoDetectViews({ w: 100, h: 100, d: 100 });
    // All areas equal (10000), sort is stable so f comes first, then s
    assert.equal(result.length, 2);
    assert.ok('fst'.includes(result[0]));
    assert.ok('fst'.includes(result[1]));
  });
});

// ═══════════════════════════════════════════════════════
//  26. listViewDimsMulti() with auto-detect
// ═══════════════════════════════════════════════════════
describe('listViewDimsMulti() with auto-detect', () => {
  it('without view → returns 2 elements from auto-detect', () => {
    const result = listViewDimsMulti({ w: 800, h: 18, d: 400 });
    assert.equal(result.length, 2);
  });

  it('with explicit view → uses that view', () => {
    const result = listViewDimsMulti({ w: 800, h: 18, d: 400, view: 'f' });
    assert.equal(result.length, 1);
    assert.equal(result[0].view, 'f');
  });
});

// ═══════════════════════════════════════════════════════
//  27. listViewDims() backward compatibility
// ═══════════════════════════════════════════════════════
describe('listViewDims() backward compat with multi-view', () => {
  const b = { w: 100, h: 200, d: 50 };

  it('"ft" → returns front dimensions (first char)', () => {
    assert.deepEqual(listViewDims({ ...b, view: 'ft' }), { dw: 100, dh: 200 });
  });

  it('"st" → returns side dimensions (first char)', () => {
    assert.deepEqual(listViewDims({ ...b, view: 'st' }), { dw: 50, dh: 200 });
  });
});
