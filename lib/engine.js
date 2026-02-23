// ═══════════════════════════════════════════════════════
//  DEFAULT CODE
// ═══════════════════════════════════════════════════════
const DEFAULT_CODE = `# Skříňka 80 × 40 × 200 cm
# ── Proměnné ──────────────────────────
$T  = 18        # tloušťka desky [mm]
$W  = 800       # vnější šířka
$H  = 2000      # vnější výška
$D  = 400       # hloubka

# ── Desky ─────────────────────────────
board[dn]     $W x $T x $D    "Dno"         at 0, 0, 0              color #7a4f28  view ft
board[lt]     $T x $H x $D    "Levý bok"    at 0, 0, 0              color #9a6235  view sf
board[rt]     $T x $H x $D    "Pravý bok"   at {lt.right}+$W, 0, 0  color #9a6235  view sf
board[tp]     $W+{lt.w} x $T x $D "Strop"  at {lt.x}, {lt.top}-$T, 0  color #7a4f28  view ft
board[bk]     {lt.right}+$W x $H x $T "Záda" at {lt.x}, {lt.y}, $D-$T  color #5c3a1e
board[p1]     $W x $T x $D-$T  "Police 1"  at {lt.right}, {dn.top}+380, {dn.z}  view ft
board[p2]     $W x $T x $D-$T  "Police 2"  at {p1.x}, {p1.top}+380, {p1.z}  view ft
board[p3]     $W x $T x $D-$T  "Police 3"  at {p2.x}, {p2.top}+380, {p2.z}  view ft`;

// ═══════════════════════════════════════════════════════
//  EXAMPLES
// ═══════════════════════════════════════════════════════
const EXAMPLES = [
  { name: 'Skříňka', code: DEFAULT_CODE },
  { name: 'A-rám police', code: `# A-rám police
$T = 18
$H = 600
$W = 400
$D = 300

board[fl]  $W x $T x $D  "Floor"         at 0, 0, 0  view ft
board[la]  LEN(0,0,200,$H) x $T x $D  "Left leg"   from 0,0 to 200,$H  view fs
board[ra]  LEN($W,0,200,$H) x $T x $D  "Right leg"  from $W,0 to 200,$H  view fs
board[sh]  200 x $T x $D "Shelf"         at 100, 300, 0  view ft` },
  { name: 'Stůl se vzpěrami', code: `# Stůl se vzpěrami
$T  = 25
$W  = 1200
$H  = 750
$D  = 600

board[top]  $W x $T x $D  "Desktop"       at 0, $H-$T, 0      color #d4b87a  view ft
board[ll]   $T x $H-$T x $T  "Left leg"   at 0, 0, 0           color #a07040  view fs
board[rl]   $T x $H-$T x $T  "Right leg"  at $W-$T, 0, 0       color #a07040  view fs
board[br]   LEN($T,100,$W-$T,{ll.top}-100) x $T x $T "Brace"  from $T,100 to $W-$T,{ll.top}-100  color #8b6035  view fs` },
  { name: 'Lichoběžníky', code: `# Lichoběžníkové panely
$T = 18
$W = 500
$H = 400
$D = 300

board[left]   $T x $H x $D  "Left"   at 0, 0, 0  cut left 400 right 300  view fs
board[right]  $T x $H x $D  "Right"  at $W, 0, 0  cut left 400 right 300  view fs
board[bot]    $W x $T x $D  "Bottom" at 0, 0, 0  view ft
board[shelf]  $W x $T x $D  "Shelf"  at 0, 200, 0  cut bottom 400 top 350  view ft` },
];

// ═══════════════════════════════════════════════════════
//  PARSER
// ═══════════════════════════════════════════════════════
const AUTO_COLORS = [
  '#c9a05a','#b8864a','#d4b87a','#a07040',
  '#e8c99a','#8b6035','#daa060','#c08040',
  '#7a6050','#d4a080','#b09070','#9a7055',
];

class DSLParser {
  constructor(text) {
    this.text = text;
    this.vars = {};
    this.boards = [];
    this.errors = [];
    this.reg = {};
    this.varCount = 0;
  }

  parse() {
    const lines = this.text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) continue;
      if (line.startsWith('$')) { this.parseVar(line, i+1); continue; }
      if (/^board/i.test(line))  { this.parseBoard(line, i+1); continue; }
      this.errors.push(`Řádek ${i+1}: neznámý příkaz`);
    }
    return { boards: this.boards, errors: this.errors, varCount: this.varCount };
  }

  parseVar(line, ln) {
    const m = line.match(/^\$([a-zA-Z_]\w*)\s*=\s*(.+?)(?:\s*#.*)?$/);
    if (!m) { this.errors.push(`Řádek ${ln}: neplatná definice proměnné`); return; }
    try {
      this.vars[m[1]] = this.eval(m[2].trim());
      this.varCount++;
    } catch(e) { this.errors.push(`Řádek ${ln} ($${m[1]}): ${e.message}`); }
  }

  // Find keyword position respecting brace/paren nesting
  findKeyword(str, kw) {
    const re = new RegExp('\\b' + kw + '\\b', 'gi');
    let m;
    while ((m = re.exec(str)) !== null) {
      const before = str.slice(0, m.index);
      let depth = 0;
      for (const ch of before) {
        if (ch === '{' || ch === '(') depth++;
        else if (ch === '}' || ch === ')') depth--;
      }
      if (depth === 0) return m.index;
    }
    return -1;
  }

  // Find earliest keyword from list, respecting nesting
  findNextKeyword(str, keywords) {
    let best = -1, bestKw = null;
    for (const kw of keywords) {
      const pos = this.findKeyword(str, kw);
      if (pos !== -1 && (best === -1 || pos < best)) { best = pos; bestKw = kw; }
    }
    return { pos: best, keyword: bestKw };
  }

  parseBoard(line, ln) {
    // Phase 1: Extract core with simpler regex
    const re = /^board(?:\[([a-zA-Z_]\w*)\])?\s+(.+?)\s+"([^"]+)"\s*(.*?)$/i;
    const m = line.match(re);
    if (!m) { this.errors.push(`Řádek ${ln}: neplatný board (vzor: board[id] ŠxVxH "název")`); return; }

    const id    = m[1] || `b${this.boards.length}`;
    const dimRaw= m[2].trim();
    const name  = m[3];
    let rest    = m[4] ? m[4].trim() : '';

    if (this.reg[id]) { this.errors.push(`Řádek ${ln}: duplicitní ID [${id}]`); return; }

    try {
      // Split dimensions on 'x' that sits between value-like tokens
      const dims = dimRaw.split(/\s*[xXх]\s*(?=[0-9$({])/);
      if (dims.length !== 3) throw new Error(`Potřebuji 3 rozměry (Š x V x H), dostal jsem ${dims.length}: "${dimRaw}"`);
      let w = this.eval(dims[0].trim());
      const h = this.eval(dims[1].trim());
      const d = this.eval(dims[2].trim());

      // Phase 2: Parse rest for keywords
      let x=null, y=null, z=null, hasPos=false;
      let angle=0, fromTo=null;
      let cuts=null;
      let view=null;
      let color=null;

      // Strip inline comment: require # preceded by space and followed by space
      // to avoid eating color #hex values like color #7a4f28
      rest = rest.replace(/\s+#\s.*$/, '').trim();

      // 1. Position: at X,Y,Z  OR  from X1,Y1 to X2,Y2 [z Z]
      const fromPos = this.findKeyword(rest, 'from');
      const atPos   = this.findKeyword(rest, 'at');

      if (fromPos !== -1) {
        // Find 'to' keyword after 'from'
        const afterFrom = rest.slice(fromPos + 4);
        const toPos = this.findKeyword(afterFrom, 'to');
        if (toPos === -1) throw new Error(`'from' vyžaduje 'to'`);

        const fromCoords = this.splitCoords(afterFrom.slice(0, toPos).trim());
        if (fromCoords.length !== 2) throw new Error(`'from' potřebuje 2 hodnoty (X1,Y1)`);

        // After 'to', read until next keyword
        const afterTo = afterFrom.slice(toPos + 2).trim();
        const nextKw = this.findNextKeyword(afterTo, ['z','cut','view','color']);
        let toStr, afterToRest;
        if (nextKw.pos !== -1) {
          toStr = afterTo.slice(0, nextKw.pos).trim();
          afterToRest = afterTo.slice(nextKw.pos).trim();
        } else {
          toStr = afterTo.trim();
          afterToRest = '';
        }

        const toCoords = this.splitCoords(toStr);
        if (toCoords.length !== 2) throw new Error(`'to' potřebuje 2 hodnoty (X2,Y2)`);

        const x1 = this.eval(fromCoords[0].trim());
        const y1 = this.eval(fromCoords[1].trim());
        const x2 = this.eval(toCoords[0].trim());
        const y2 = this.eval(toCoords[1].trim());

        x = x1; y = y1; z = 0; hasPos = true;
        fromTo = { x1, y1, x2, y2 };
        angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const actualW = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
        if (Math.abs(w - actualW) > 1) {
          this.errors.push(`Řádek ${ln} (${name}): Šířka ${w} se liší od vzdálenosti from/to ${Math.round(actualW)}, použita vzdálenost`);
        }
        w = Math.round(actualW * 1000) / 1000;

        // Check for z after to coords
        rest = afterToRest;
        const zPos = this.findKeyword(rest, 'z');
        if (zPos !== -1 && rest.slice(0, zPos).trim() === '') {
          // z is at the start of remaining rest
          const afterZ = rest.slice(zPos + 1).trim();
          const nextKw2 = this.findNextKeyword(afterZ, ['cut','view','color']);
          let zStr;
          if (nextKw2.pos !== -1) {
            zStr = afterZ.slice(0, nextKw2.pos).trim();
            rest = afterZ.slice(nextKw2.pos).trim();
          } else {
            zStr = afterZ.trim();
            rest = '';
          }
          z = this.eval(zStr);
        }
      } else if (atPos !== -1) {
        const afterAt = rest.slice(atPos + 2).trim();
        const nextKw = this.findNextKeyword(afterAt, ['cut','view','color']);
        let atStr;
        if (nextKw.pos !== -1) {
          atStr = afterAt.slice(0, nextKw.pos).trim();
          rest = afterAt.slice(nextKw.pos).trim();
        } else {
          atStr = afterAt.trim();
          rest = '';
        }
        const coords = this.splitCoords(atStr);
        if (coords.length !== 3) throw new Error(`Pozice potřebuje 3 hodnoty (X, Y, Z)`);
        x = this.eval(coords[0].trim());
        y = this.eval(coords[1].trim());
        z = this.eval(coords[2].trim());
        hasPos = true;
      }

      // 2. Cut: cut <side> <value> [<side> <value> ...]
      const cutPos = this.findKeyword(rest, 'cut');
      if (cutPos !== -1) {
        const afterCut = rest.slice(cutPos + 3).trim();
        const nextKw = this.findNextKeyword(afterCut, ['view','color']);
        let cutStr;
        if (nextKw.pos !== -1) {
          cutStr = afterCut.slice(0, nextKw.pos).trim();
          rest = afterCut.slice(nextKw.pos).trim();
        } else {
          cutStr = afterCut.trim();
          rest = '';
        }
        cuts = { left: null, right: null, top: null, bottom: null };
        const cutRe = /\b(left|right|top|bottom)\s+([^\s]+)/gi;
        let cm;
        while ((cm = cutRe.exec(cutStr)) !== null) {
          cuts[cm[1].toLowerCase()] = this.eval(cm[2]);
        }
      }

      // 3. View: view f|s|t|ft|fst (multi-view for list)
      const viewPos = this.findKeyword(rest, 'view');
      if (viewPos !== -1) {
        const afterView = rest.slice(viewPos + 4).trim();
        const nextKw = this.findNextKeyword(afterView, ['color']);
        let viewStr;
        if (nextKw.pos !== -1) {
          viewStr = afterView.slice(0, nextKw.pos).trim();
          rest = afterView.slice(nextKw.pos).trim();
        } else {
          viewStr = afterView.trim();
          rest = '';
        }
        const seen = new Set();
        let validView = '';
        for (const ch of viewStr.toLowerCase()) {
          if (!'fst'.includes(ch)) throw new Error(`Neplatný pohled '${ch}', povoleno: f, s, t`);
          if (!seen.has(ch)) { seen.add(ch); validView += ch; }
        }
        if (!validView.length) throw new Error('Prázdný pohled');
        view = validView;
      }

      // 4. Color: color #hex
      const colorPos = this.findKeyword(rest, 'color');
      if (colorPos !== -1) {
        const afterColor = rest.slice(colorPos + 5).trim();
        const colorMatch = afterColor.match(/^(#[0-9a-fA-F]{3,6})/);
        if (colorMatch) color = colorMatch[1];
      }

      if (!color) color = AUTO_COLORS[this.boards.length % AUTO_COLORS.length];

      const board = { id, name, w, h, d, x, y, z, hasPos, color, visible: true,
                      view, angle, fromTo, cuts };
      this.boards.push(board);
      this.reg[id] = board;
    } catch(e) {
      this.errors.push(`Řádek ${ln} (${name}): ${e.message}`);
    }
  }

  // Split coords: X, Y, Z — but respect nested braces
  splitCoords(str) {
    const parts = []; let depth = 0; let cur = '';
    for (const ch of str) {
      if (ch === '{' || ch === '(') depth++;
      else if (ch === '}' || ch === ')') depth--;
      if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; }
      else cur += ch;
    }
    parts.push(cur);
    return parts;
  }

  eval(expr) {
    // 1. Replace $var
    let e = String(expr).replace(/\$([a-zA-Z_]\w*)/g, (_, n) => {
      if (this.vars[n] !== undefined) return this.vars[n];
      throw new Error(`Neznámá proměnná $${n}`);
    });
    // 2. Replace {id.prop}
    e = e.replace(/\{([a-zA-Z_]\w*)\.([a-zA-Z0-9]+)\}/g, (_, id, prop) => {
      const b = this.reg[id];
      if (!b) throw new Error(`Neznámé ID [${id}]`);
      return this.prop(b, prop, id);
    });
    // 3. LEN(x1,y1,x2,y2) -> Euclidean distance
    e = e.replace(/LEN\(([^,]+),([^,]+),([^,]+),([^)]+)\)/gi, (_, x1, y1, x2, y2) => {
      const vx1 = this.math(x1), vy1 = this.math(y1);
      const vx2 = this.math(x2), vy2 = this.math(y2);
      return Math.sqrt((vx2-vx1)**2 + (vy2-vy1)**2);
    });
    // 4. Safe math
    return this.math(e);
  }

  prop(b, p, id) {
    const x=b.x??0, y=b.y??0, z=b.z??0;
    if (p==='x') return x; if (p==='y') return y; if (p==='z') return z;
    if (p==='w') return b.w; if (p==='h') return b.h; if (p==='d') return b.d;
    if (p==='back') return z+b.d;
    if (p==='angle') return b.angle||0;

    if (b.angle && b.angle !== 0) {
      // AABB for rotated board
      const rad = b.angle * Math.PI / 180;
      const cos = Math.cos(rad), sin = Math.sin(rad);
      const corners = [
        [x, y], [x + b.w*cos, y + b.w*sin],
        [x + b.w*cos - b.h*sin, y + b.w*sin + b.h*cos],
        [x - b.h*sin, y + b.h*cos]
      ];
      const xs = corners.map(c=>c[0]), ys = corners.map(c=>c[1]);
      if (p==='right') return Math.max(...xs);
      if (p==='top') return Math.max(...ys);
      if (p==='cx') return (Math.min(...xs)+Math.max(...xs))/2;
      if (p==='cy') return (Math.min(...ys)+Math.max(...ys))/2;
      if (p==='x2') return x + b.w*cos;
      if (p==='y2') return y + b.w*sin;
    } else {
      if (p==='right') return x+b.w; if (p==='top') return y+b.h;
      if (p==='cx') return x+b.w/2; if (p==='cy') return y+b.h/2;
      if (p==='x2') return x+b.w; if (p==='y2') return y;
    }
    throw new Error(`Neznámá vlastnost .${p} na [${id}]`);
  }

  math(expr) {
    const e = String(expr).trim();
    if (!/^[\d\s\+\-\*\/\(\)\.]+$/.test(e))
      throw new Error(`Neplatný výraz: "${e}" (povoleny: čísla, +,-,*,/,()`);
    try {
      const r = Function(`"use strict";return (${e})`)();
      if (typeof r !== 'number' || !isFinite(r)) throw new Error('Výsledek není číslo');
      return Math.round(r * 1000) / 1000;
    } catch(err) { throw new Error(`Chyba výrazu "${e}"`); }
  }
}

function parseDSL(text) {
  return new DSLParser(text).parse();
}

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════
function darken(hex, f=0.5) {
  if (!hex) return '#333';
  // Expand 3-char hex to 6-char
  if (hex.length===4) hex = '#'+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
  if (hex.length<7) return '#333';
  const r=(parseInt(hex.slice(1,3),16)*f|0).toString(16).padStart(2,'0');
  const g=(parseInt(hex.slice(3,5),16)*f|0).toString(16).padStart(2,'0');
  const b=(parseInt(hex.slice(5,7),16)*f|0).toString(16).padStart(2,'0');
  return `#${r}${g}${b}`;
}
function boardCount(n) {
  if(n===0) return '0 desek'; if(n===1) return '1 deska';
  if(n<5) return `${n} desky`; return `${n} desek`;
}
function hasCuts(b) {
  return b.cuts && (b.cuts.left!==null||b.cuts.right!==null||b.cuts.top!==null||b.cuts.bottom!==null);
}
function boardShape(b) {
  const lh = b.cuts?.left ?? b.h;
  const rh = b.cuts?.right ?? b.h;
  const bw = b.cuts?.bottom ?? b.w;
  const tw = b.cuts?.top ?? b.w;
  // BL, BR, TR, TL  (bottom anchored at origin, left-aligned)
  return [
    [0, 0],
    [bw, 0],
    [tw, rh],
    [0, lh]
  ];
}
function listViewDims(b) {
  switch((b.view || 'f').charAt(0)) {
    case 's': return { dw: b.d, dh: b.h }; // side: D x H
    case 't': return { dw: b.w, dh: b.d }; // top: W x D
    default:  return { dw: b.w, dh: b.h }; // front: W x H
  }
}

const VIEW_LABELS = { f: 'přední', s: 'boční', t: 'shora' };

function autoDetectViews(b) {
  const faces = [
    { view: 'f', area: b.w * b.h },
    { view: 's', area: b.d * b.h },
    { view: 't', area: b.w * b.d },
  ];
  faces.sort((a, c) => c.area - a.area);
  return faces[0].view + faces[1].view;
}

function listViewDimsMulti(b) {
  const viewStr = b.view || autoDetectViews(b);
  return [...viewStr].map(v => {
    switch (v) {
      case 's': return { dw: b.d, dh: b.h, view: v, label: VIEW_LABELS[v] };
      case 't': return { dw: b.w, dh: b.d, view: v, label: VIEW_LABELS[v] };
      default:  return { dw: b.w, dh: b.h, view: v, label: VIEW_LABELS[v] };
    }
  });
}

// ═══════════════════════════════════════════════════════
//  HASH ENCODING
// ═══════════════════════════════════════════════════════
function encodeHash(text) {
  return btoa(encodeURIComponent(text));
}
function decodeHash(str) {
  try { return decodeURIComponent(atob(str)); } catch(e) { return null; }
}

// ═══════════════════════════════════════════════════════
//  2D PROJECTIONS
// ═══════════════════════════════════════════════════════
function projectBoard(b, proj) {
  const x = b.x ?? 0, y = b.y ?? 0, z = b.z ?? 0;
  switch(proj) {
    case 'front': return { lx: x,      ly: y, lw: b.w, lh: b.h };
    case 'back':  return { lx: -x-b.w, ly: y, lw: b.w, lh: b.h };
    case 'left':  return { lx: z,      ly: y, lw: b.d, lh: b.h };
    case 'right': return { lx: -z-b.d, ly: y, lw: b.d, lh: b.h };
    case 'top':   return { lx: x,      ly: z, lw: b.w, lh: b.d };
    case 'bottom':return { lx: x,      ly: -z-b.d, lw: b.w, lh: b.d };
  }
}

function projAxisLabels(proj) {
  switch(proj) {
    case 'front': case 'back': return ['→ X','↑ Y'];
    case 'left': case 'right': return ['→ Z','↑ Y'];
    case 'top': case 'bottom': return ['→ X','↑ Z'];
  }
}

// ═══════════════════════════════════════════════════════
//  MODULE EXPORT (Node.js)
// ═══════════════════════════════════════════════════════
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_CODE, EXAMPLES, AUTO_COLORS, DSLParser, parseDSL,
    darken, boardCount, hasCuts, boardShape, listViewDims,
    VIEW_LABELS, autoDetectViews, listViewDimsMulti,
    encodeHash, decodeHash, projectBoard, projAxisLabels,
  };
}
