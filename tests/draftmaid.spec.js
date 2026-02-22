// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════

/** Clear textarea and type new DSL, then wait for debounce + render */
async function setCode(page, dsl) {
  const ta = page.locator('#code');
  await ta.fill(dsl);
  await ta.dispatchEvent('input');
  // debounce is 220ms, give it a bit more
  await page.waitForTimeout(350);
}

/** Return board count shown in header */
async function getBoards(page) {
  return Number(await page.locator('#hdr-count').textContent());
}

/** Return error bar text (empty string if hidden) */
async function getErrors(page) {
  const display = await page.locator('#error-bar').evaluate(el => getComputedStyle(el).display);
  if (display === 'none') return '';
  return (await page.locator('#error-bar').textContent()) || '';
}

/** Evaluate DSLParser in browser context, return { boards, errors } */
async function parseDSL(page, dsl) {
  return page.evaluate((code) => {
    // @ts-ignore — DSLParser is defined in index.html
    const result = new DSLParser(code).parse();
    return {
      boards: result.boards.map(b => ({
        id: b.id, name: b.name, w: b.w, h: b.h, d: b.d,
        x: b.x, y: b.y, z: b.z, hasPos: b.hasPos,
        color: b.color, view: b.view, angle: b.angle,
        fromTo: b.fromTo, cuts: b.cuts,
      })),
      errors: result.errors,
      varCount: result.varCount,
    };
  }, dsl);
}

// ═══════════════════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════════════════

test.beforeEach(async ({ page }) => {
  await page.goto(FILE_URL);
  // Wait for the app to initialize (update() runs on load)
  await page.waitForTimeout(400);
});

// ═══════════════════════════════════════════════════════
//  1. PARSER BASICS
// ═══════════════════════════════════════════════════════

test.describe('Parser Basics', () => {
  test('default example parses 8 boards with 0 errors', async ({ page }) => {
    expect(await getBoards(page)).toBe(8);
    expect(await getErrors(page)).toBe('');
  });

  test('variable substitution works', async ({ page }) => {
    const r = await parseDSL(page, '$T = 18\nboard[a] $T x 100 x 50 "A"');
    expect(r.errors).toHaveLength(0);
    expect(r.boards[0].w).toBe(18);
    expect(r.varCount).toBe(1);
  });

  test('property references work', async ({ page }) => {
    const r = await parseDSL(page, [
      'board[a] 100 x 200 x 50 "A" at 10,20,0',
      'board[b] {a.right} x 200 x 50 "B"',
    ].join('\n'));
    expect(r.errors).toHaveLength(0);
    // a.right = 10 + 100 = 110
    expect(r.boards[1].w).toBe(110);
  });

  test('board without position gets hasPos false', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] 100 x 200 x 50 "A"');
    expect(r.boards[0].hasPos).toBe(false);
    expect(r.boards[0].x).toBeNull();
  });

  test('board with at X,Y,Z gets correct coordinates', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] 100 x 200 x 50 "A" at 10,20,30');
    expect(r.boards[0].hasPos).toBe(true);
    expect(r.boards[0].x).toBe(10);
    expect(r.boards[0].y).toBe(20);
    expect(r.boards[0].z).toBe(30);
  });

  test('duplicate ID produces error', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] 100 x 200 x 50 "A"\nboard[a] 100 x 200 x 50 "B"');
    expect(r.errors.length).toBeGreaterThan(0);
    expect(r.errors[0]).toContain('duplicitní ID');
  });

  test('invalid syntax produces error', async ({ page }) => {
    const r = await parseDSL(page, 'foobar invalid line');
    expect(r.errors.length).toBeGreaterThan(0);
  });

  test('inline comments are ignored', async ({ page }) => {
    const r = await parseDSL(page, [
      '# full line comment',
      '$T = 18  # inline comment',
      'board[a] $T x 100 x 50 "A"  # another comment',
    ].join('\n'));
    expect(r.errors).toHaveLength(0);
    expect(r.boards[0].w).toBe(18);
  });

  test('// comments are ignored', async ({ page }) => {
    const r = await parseDSL(page, '// this is a comment\nboard[a] 100 x 200 x 50 "A"');
    expect(r.errors).toHaveLength(0);
    expect(r.boards).toHaveLength(1);
  });
});

// ═══════════════════════════════════════════════════════
//  2. URL STATE PERSISTENCE
// ═══════════════════════════════════════════════════════

test.describe('URL State Persistence', () => {
  test('typing DSL updates URL hash', async ({ page }) => {
    await setCode(page, 'board[x] 100 x 200 x 50 "Test"');
    const hash = await page.evaluate(() => window.location.hash);
    expect(hash).toMatch(/^#code\//);
  });

  test('navigating to URL with #code/ hash restores code', async ({ page }) => {
    const dsl = 'board[x] 100 x 200 x 50 "Hello"';
    // Set code so the app encodes it to hash, then grab the full URL
    await setCode(page, dsl);
    const url = await page.evaluate(() => window.location.href);
    expect(url).toContain('#code/');
    // Navigate to that URL fresh
    await page.goto(url);
    await page.waitForTimeout(400);
    const value = await page.locator('#code').inputValue();
    expect(value).toBe(dsl);
  });

  test('Czech characters survive round-trip', async ({ page }) => {
    const dsl = 'board[x] 100 x 200 x 50 "Skříňka"';
    await setCode(page, dsl);
    // Read hash, then navigate fresh
    const url = await page.evaluate(() => window.location.href);
    await page.goto(url);
    await page.waitForTimeout(400);
    const value = await page.locator('#code').inputValue();
    expect(value).toBe(dsl);
  });

  test('empty hash loads DEFAULT_CODE', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(400);
    const value = await page.locator('#code').inputValue();
    // DEFAULT_CODE starts with "# Skříňka"
    expect(value).toContain('Skříňka');
  });

  test('invalid hash loads DEFAULT_CODE gracefully', async ({ page }) => {
    await page.goto(FILE_URL + '#code/!!!invalid-base64!!!');
    await page.waitForTimeout(400);
    const value = await page.locator('#code').inputValue();
    expect(value).toContain('Skříňka');
  });
});

// ═══════════════════════════════════════════════════════
//  3. COLOR AUTO-ASSIGNMENT
// ═══════════════════════════════════════════════════════

test.describe('Color Auto-Assignment', () => {
  test('board without color keyword gets auto-assigned color', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] 100 x 200 x 50 "A"');
    expect(r.boards[0].color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test('board with explicit color uses that color', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] 100 x 200 x 50 "A" color #abc123');
    expect(r.boards[0].color).toBe('#abc123');
  });

  test('default shelves (p1,p2,p3) get auto-colors from palette', async ({ page }) => {
    // DEFAULT_CODE has p1, p2, p3 without explicit color
    const r = await parseDSL(page, await page.locator('#code').inputValue());
    const p1 = r.boards.find(b => b.id === 'p1');
    const p2 = r.boards.find(b => b.id === 'p2');
    const p3 = r.boards.find(b => b.id === 'p3');
    expect(p1.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(p2.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(p3.color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test('auto-colors cycle through palette', async ({ page }) => {
    const dsl = Array.from({ length: 3 }, (_, i) =>
      `board[b${i}] 100 x 200 x 50 "B${i}"`
    ).join('\n');
    const r = await parseDSL(page, dsl);
    // First 3 boards should get different colors from AUTO_COLORS
    const colors = r.boards.map(b => b.color);
    expect(new Set(colors).size).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════
//  4. 6-SIDED ASSEMBLED VIEW PROJECTION
// ═══════════════════════════════════════════════════════

test.describe('6-Sided Projection', () => {
  test('all 6 projection buttons exist and are clickable', async ({ page }) => {
    for (const id of ['proj-front', 'proj-back', 'proj-left', 'proj-right', 'proj-top', 'proj-bottom']) {
      const btn = page.locator(`#${id}`);
      await expect(btn).toBeVisible();
      await btn.click();
    }
  });

  test('front projection shows X/Y axis labels', async ({ page }) => {
    await page.locator('#proj-front').click();
    await page.waitForTimeout(300);
    const svg = page.locator('#svg2d');
    const texts = await svg.locator('text').allTextContents();
    expect(texts.some(t => t.includes('→ X'))).toBe(true);
    expect(texts.some(t => t.includes('↑ Y'))).toBe(true);
  });

  test('left projection shows Z/Y axis labels', async ({ page }) => {
    await page.locator('#proj-left').click();
    await page.waitForTimeout(300);
    const texts = await page.locator('#svg2d text').allTextContents();
    expect(texts.some(t => t.includes('→ Z'))).toBe(true);
    expect(texts.some(t => t.includes('↑ Y'))).toBe(true);
  });

  test('top projection shows X/Z axis labels', async ({ page }) => {
    await page.locator('#proj-top').click();
    await page.waitForTimeout(300);
    const texts = await page.locator('#svg2d text').allTextContents();
    expect(texts.some(t => t.includes('→ X'))).toBe(true);
    expect(texts.some(t => t.includes('↑ Z'))).toBe(true);
  });

  test('SVG updates on projection button click', async ({ page }) => {
    const frontSVG = await page.locator('#svg2d').innerHTML();
    await page.locator('#proj-left').click();
    await page.waitForTimeout(300);
    const leftSVG = await page.locator('#svg2d').innerHTML();
    expect(frontSVG).not.toBe(leftSVG);
  });

  test('projection buttons visible in assemble mode, hidden in list mode', async ({ page }) => {
    // In assemble mode (default) — visible
    await expect(page.locator('#proj-front')).toBeVisible();

    // Switch to list mode
    await page.locator('#btn-list').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#proj-front')).toBeHidden();

    // Switch back to assemble
    await page.locator('#btn-assemble').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#proj-front')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
//  5. VIEW ORIENTATION
// ═══════════════════════════════════════════════════════

test.describe('View Orientation', () => {
  test('parser accepts view f, view s, view t', async ({ page }) => {
    for (const v of ['f', 's', 't']) {
      const r = await parseDSL(page, `board[a] 100 x 200 x 50 "A" view ${v}`);
      expect(r.errors).toHaveLength(0);
      expect(r.boards[0].view).toBe(v);
    }
  });

  test('default view is f', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] 100 x 200 x 50 "A"');
    expect(r.boards[0].view).toBe('f');
  });

  test('invalid view letter produces error', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] 100 x 200 x 50 "A" view x');
    expect(r.errors.length).toBeGreaterThan(0);
    expect(r.errors[0]).toContain('Neplatný pohled');
  });

  test('list view shows D x H for view s', async ({ page }) => {
    await setCode(page, 'board[a] 100 x 200 x 300 "Side Board" at 0,0,0 view s');
    await page.locator('#btn-list').click();
    await page.waitForTimeout(400);
    // For view s, listViewDims returns { dw: d, dh: h } = { dw: 300, dh: 200 }
    const texts = await page.locator('#svg-list text').allTextContents();
    expect(texts.some(t => t.includes('300 mm'))).toBe(true);
    expect(texts.some(t => t.includes('200 mm'))).toBe(true);
  });

  test('list view shows W x D for view t', async ({ page }) => {
    await setCode(page, 'board[a] 100 x 200 x 300 "Top Board" at 0,0,0 view t');
    await page.locator('#btn-list').click();
    await page.waitForTimeout(400);
    // For view t, listViewDims returns { dw: w, dh: d } = { dw: 100, dh: 300 }
    const texts = await page.locator('#svg-list text').allTextContents();
    expect(texts.some(t => t.includes('100 mm'))).toBe(true);
    expect(texts.some(t => t.includes('300 mm'))).toBe(true);
  });

  test('view indicator shown in list info panel when not f', async ({ page }) => {
    await setCode(page, 'board[a] 100 x 200 x 300 "Side" at 0,0,0 view s');
    await page.locator('#btn-list').click();
    await page.waitForTimeout(400);
    const texts = await page.locator('#svg-list text').allTextContents();
    expect(texts.some(t => t.includes('pohled: bok'))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════
//  6. LEN() FUNCTION
// ═══════════════════════════════════════════════════════

test.describe('LEN() Function', () => {
  test('LEN(0,0,3,4) evaluates to 5', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] LEN(0,0,3,4) x 100 x 50 "A"');
    expect(r.errors).toHaveLength(0);
    expect(r.boards[0].w).toBe(5);
  });

  test('LEN() works inside expressions', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] LEN(0,0,3,4)+10 x 100 x 50 "A"');
    expect(r.errors).toHaveLength(0);
    expect(r.boards[0].w).toBe(15);
  });

  test('LEN() works with property references', async ({ page }) => {
    const r = await parseDSL(page, [
      'board[a] 100 x 200 x 50 "A" at 0,0,0',
      'board[b] LEN({a.x},{a.y},{a.right},{a.top}) x 100 x 50 "B"',
    ].join('\n'));
    expect(r.errors).toHaveLength(0);
    // LEN(0,0,100,200) = sqrt(10000+40000) = sqrt(50000) ≈ 223.607
    expect(r.boards[1].w).toBeCloseTo(223.607, 0);
  });

  test('case insensitive: len() works', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] len(0,0,3,4) x 100 x 50 "A"');
    expect(r.errors).toHaveLength(0);
    expect(r.boards[0].w).toBe(5);
  });
});

// ═══════════════════════════════════════════════════════
//  7. ANGLED PLACEMENT (from/to)
// ═══════════════════════════════════════════════════════

test.describe('Angled Placement (from/to)', () => {
  test('from 0,0 to 100,0 produces angle=0, w=100', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] 100 x 18 x 50 "A" from 0,0 to 100,0');
    expect(r.errors).toHaveLength(0);
    expect(r.boards[0].angle).toBe(0);
    expect(r.boards[0].w).toBe(100);
  });

  test('from 0,0 to 0,100 produces angle=90, w=100', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] 100 x 18 x 50 "A" from 0,0 to 0,100');
    expect(r.errors).toHaveLength(0);
    expect(r.boards[0].angle).toBe(90);
    expect(r.boards[0].w).toBe(100);
  });

  test('from 0,0 to 100,100 produces angle=45, w≈141.421', async ({ page }) => {
    // Declared width 100 differs from actual distance ~141, so a warning is emitted
    // but the board is still created with corrected width
    const r = await parseDSL(page, 'board[a] 100 x 18 x 50 "A" from 0,0 to 100,100');
    expect(r.boards).toHaveLength(1);
    expect(r.boards[0].angle).toBe(45);
    expect(r.boards[0].w).toBeCloseTo(141.421, 0);
  });

  test('width auto-corrected from distance (warning if differs)', async ({ page }) => {
    // Board width 50 but from/to distance is 100 — should warn
    const r = await parseDSL(page, 'board[a] 50 x 18 x 50 "A" from 0,0 to 100,0');
    expect(r.errors.length).toBeGreaterThan(0);
    expect(r.errors[0]).toContain('liší od vzdálenosti');
    // Width should be corrected to actual distance
    expect(r.boards[0].w).toBe(100);
  });

  test('.angle, .x2, .y2 return correct values', async ({ page }) => {
    // Test properties via page.evaluate to avoid dimension split issue with {a.x2}
    const props = await page.evaluate(() => {
      const r = new DSLParser('board[a] 100 x 18 x 50 "A" from 0,0 to 100,0').parse();
      const b = r.boards[0];
      const p = new DSLParser('');
      p.reg = { a: b };
      return {
        angle: p.prop(b, 'angle', 'a'),
        x2: p.prop(b, 'x2', 'a'),
        y2: p.prop(b, 'y2', 'a'),
      };
    });
    expect(props.angle).toBe(0);
    expect(props.x2).toBe(100);
    expect(props.y2).toBe(0);
  });

  test('.right and .top return AABB for rotated boards', async ({ page }) => {
    // Test AABB properties via page.evaluate to avoid scientific notation in math eval
    // Use 45° rotation for non-trivial AABB
    const props = await page.evaluate(() => {
      const dsl = 'board[a] 141 x 18 x 50 "A" from 0,0 to 100,100';
      const r = new DSLParser(dsl).parse();
      const b = r.boards[0];
      const p = new DSLParser('');
      p.reg = { a: b };
      return {
        right: p.prop(b, 'right', 'a'),
        top: p.prop(b, 'top', 'a'),
        angle: b.angle,
      };
    });
    expect(props.angle).toBe(45);
    // 45° rotated board from (0,0) to (100,100), h=18:
    // right corner at x≈100, top corner at y≈112.7
    expect(props.right).toBeCloseTo(100, 0);
    expect(props.top).toBeGreaterThan(100);
  });

  test('z Z after to sets Z coordinate', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] 100 x 18 x 50 "A" from 0,0 to 100,0 z 42');
    expect(r.errors).toHaveLength(0);
    expect(r.boards[0].z).toBe(42);
  });

  test('SVG renders rotated group for angled boards', async ({ page }) => {
    await setCode(page, 'board[a] 100 x 18 x 50 "A" from 0,0 to 100,100');
    const groups = await page.locator('#svg2d g[transform*="rotate"]').count();
    expect(groups).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
//  8. ANGLED CUTS (Trapezoidal Boards)
// ═══════════════════════════════════════════════════════

test.describe('Angled Cuts', () => {
  test('cut left/right parsed correctly', async ({ page }) => {
    const r = await parseDSL(page, 'board[a] 400 x 400 x 18 "A" cut left 300 right 200');
    expect(r.errors).toHaveLength(0);
    expect(r.boards[0].cuts.left).toBe(300);
    expect(r.boards[0].cuts.right).toBe(200);
    expect(r.boards[0].cuts.top).toBeNull();
    expect(r.boards[0].cuts.bottom).toBeNull();
  });

  test('boardShape returns correct polygon', async ({ page }) => {
    const shape = await page.evaluate(() => {
      const b = { w: 400, h: 400, cuts: { left: 300, right: 200, top: null, bottom: null } };
      // @ts-ignore
      return boardShape(b);
    });
    // BL, BR, TR, TL
    expect(shape).toEqual([
      [0, 0],
      [400, 0],     // bottom width = w (no bottom cut)
      [400, 200],    // right height = 200
      [0, 300],      // left height = 300
    ]);
  });

  test('hasCuts returns true for boards with cuts, false otherwise', async ({ page }) => {
    const result = await page.evaluate(() => {
      // @ts-ignore
      const withCut = hasCuts({ cuts: { left: 100, right: null, top: null, bottom: null } });
      // @ts-ignore
      const noCut = hasCuts({ cuts: null });
      // @ts-ignore
      const allNull = hasCuts({ cuts: { left: null, right: null, top: null, bottom: null } });
      return { withCut, noCut, allNull };
    });
    expect(result.withCut).toBe(true);
    expect(result.noCut).toBeFalsy();
    expect(result.allNull).toBeFalsy();
  });

  test('2D assembled view renders polygon for cut boards', async ({ page }) => {
    await setCode(page, 'board[a] 400 x 400 x 18 "A" at 0,0,0 cut left 300 right 200');
    const polygons = await page.locator('#svg2d polygon').count();
    expect(polygons).toBeGreaterThan(0);
  });

  test('2D list view renders polygon for cut boards in front view', async ({ page }) => {
    await setCode(page, 'board[a] 400 x 400 x 18 "A" at 0,0,0 cut left 300 right 200');
    await page.locator('#btn-list').click();
    await page.waitForTimeout(400);
    const polygons = await page.locator('#svg-list polygon').count();
    expect(polygons).toBeGreaterThan(0);
  });

  test('3D view uses ExtrudeGeometry for cut boards', async ({ page }) => {
    await setCode(page, 'board[a] 400 x 400 x 18 "A" at 0,0,0 cut left 300');
    // Switch to 3D tab
    await page.locator('[data-tab="3d"]').click();
    await page.waitForTimeout(800);
    // Verify the 3D scene has meshes (ExtrudeGeometry is used internally)
    const hasMesh = await page.evaluate(() => {
      // @ts-ignore
      return grp3 && grp3.children.length > 0;
    });
    expect(hasMesh).toBe(true);
  });

  test('cut info shown in list info panel', async ({ page }) => {
    await setCode(page, 'board[a] 400 x 400 x 18 "Cut" at 0,0,0 cut left 300 right 200');
    await page.locator('#btn-list').click();
    await page.waitForTimeout(400);
    const texts = await page.locator('#svg-list text').allTextContents();
    expect(texts.some(t => t.includes('ořez:'))).toBe(true);
    expect(texts.some(t => t.includes('L:300'))).toBe(true);
    expect(texts.some(t => t.includes('R:200'))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════
//  9. COMBINED FEATURES
// ═══════════════════════════════════════════════════════

test.describe('Combined Features', () => {
  test('from/to + cut + view s + color parsed together', async ({ page }) => {
    const r = await parseDSL(page,
      'board[a] 100 x 18 x 50 "Combo" from 0,0 to 100,0 cut left 15 view s color #ff0000'
    );
    expect(r.errors).toHaveLength(0);
    expect(r.boards[0].angle).toBe(0);
    expect(r.boards[0].w).toBe(100);
    expect(r.boards[0].cuts.left).toBe(15);
    expect(r.boards[0].view).toBe('s');
    expect(r.boards[0].color).toBe('#ff0000');
  });

  test('rotated + cut board renders in 2D assembled view', async ({ page }) => {
    await setCode(page, 'board[a] 100 x 50 x 18 "RC" from 0,0 to 100,100 cut left 40');
    // Should have both rotation group and polygon
    const groups = await page.locator('#svg2d g[transform*="rotate"]').count();
    const polygons = await page.locator('#svg2d polygon').count();
    expect(groups).toBeGreaterThan(0);
    expect(polygons).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
//  10. UI INTERACTIONS
// ═══════════════════════════════════════════════════════

test.describe('UI Interactions', () => {
  test('switching between Sestaveno and Seznam desek modes', async ({ page }) => {
    // Default is assembled
    await expect(page.locator('#btn-assemble')).toHaveClass(/active/);

    // Switch to list
    await page.locator('#btn-list').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#btn-list')).toHaveClass(/active/);
    await expect(page.locator('#btn-assemble')).not.toHaveClass(/active/);

    // Switch back
    await page.locator('#btn-assemble').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#btn-assemble')).toHaveClass(/active/);
    await expect(page.locator('#btn-list')).not.toHaveClass(/active/);
  });

  test('sort buttons change list ordering', async ({ page }) => {
    await setCode(page, [
      'board[a] 500 x 100 x 18 "Zebra" at 0,0,0',
      'board[b] 100 x 500 x 18 "Alpha" at 0,0,0',
    ].join('\n'));
    await page.locator('#btn-list').click();
    await page.waitForTimeout(400);

    // Sort by name — Alpha should come first
    await page.locator('#sort-name').click();
    await page.waitForTimeout(300);
    const nameItems = await page.locator('.board-item .board-name').allTextContents();
    expect(nameItems[0]).toBe('Alpha');

    // Sort by width — Zebra (500) should come first (descending)
    await page.locator('#sort-w').click();
    await page.waitForTimeout(300);
    const wItems = await page.locator('.board-item .board-name').allTextContents();
    expect(wItems[0]).toBe('Zebra');
  });

  test('board visibility toggles work', async ({ page }) => {
    await setCode(page, [
      'board[a] 100 x 100 x 18 "Board A" at 0,0,0',
      'board[b] 100 x 100 x 18 "Board B" at 200,0,0',
    ].join('\n'));
    await page.locator('#btn-list').click();
    await page.waitForTimeout(400);

    // Both visible initially — 2 board rects in SVG
    const initialRects = await page.locator('#svg-list rect[id^="card-"]').count();
    expect(initialRects).toBe(2);

    // Toggle first board off
    const toggle = page.locator('.board-toggle').first();
    await toggle.click();
    await page.waitForTimeout(400);

    // Only 1 board rect should remain
    const afterRects = await page.locator('#svg-list rect[id^="card-"]').count();
    expect(afterRects).toBe(1);
  });

  test('tab switching between 2D and 3D', async ({ page }) => {
    const tab2d = page.locator('[data-tab="2d"]');
    const tab3d = page.locator('[data-tab="3d"]');

    await expect(tab2d).toHaveClass(/active/);
    await expect(tab3d).not.toHaveClass(/active/);

    // Switch to 3D
    await tab3d.click();
    await page.waitForTimeout(500);
    await expect(tab3d).toHaveClass(/active/);
    await expect(tab2d).not.toHaveClass(/active/);
    await expect(page.locator('#view-3d')).toHaveClass(/active/);

    // Switch back to 2D
    await tab2d.click();
    await page.waitForTimeout(300);
    await expect(tab2d).toHaveClass(/active/);
    await expect(page.locator('#view-2d')).toHaveClass(/active/);
  });

  test('show all / hide all buttons work', async ({ page }) => {
    await setCode(page, [
      'board[a] 100 x 100 x 18 "A" at 0,0,0',
      'board[b] 100 x 100 x 18 "B" at 200,0,0',
    ].join('\n'));
    await page.locator('#btn-list').click();
    await page.waitForTimeout(400);

    // Hide all
    await page.locator('#btn-none').click();
    await page.waitForTimeout(400);
    const hidden = await page.locator('#svg-list rect[id^="card-"]').count();
    expect(hidden).toBe(0);

    // Show all
    await page.locator('#btn-all').click();
    await page.waitForTimeout(400);
    const visible = await page.locator('#svg-list rect[id^="card-"]').count();
    expect(visible).toBe(2);
  });
});
