# DraftMaid

A lightweight browser-based CAD tool for planning furniture boards — no installation, no backend, just a single HTML file with a DSL editor.

[Live demo via GitHub Pages](https://prespic.github.io/draftmaid/)

---

## Features

- **DSL syntax** — describe boards in a simple text format
- **Variables** — define shared values like thickness, width, depth
- **Relative positioning** — reference other boards by ID (`{id.right}`, `{id.top}`, ...)
- **Angled placement** — `from X1,Y1 to X2,Y2` for diagonal boards
- **Board cuts** — trapezoidal cuts on any side (`cut left 300 right 200`)
- **View orientation** — show boards from front, side, or top in list view
- **LEN() function** — calculate Euclidean distance in expressions
- **6-sided projection** — front, back, left, right, top, bottom views in 2D assembled mode
- **2D assembled view** — projection with dimension lines
- **2D list view** — each board as a separate card, sortable, with visibility toggles
- **3D preview** — Three.js render with orbit camera
- **URL persistence** — your design is saved in the URL hash, shareable via link

---

## DSL Syntax

```
# Comment
// Also a comment
$VAR = value

board[id]  W x H x D  "Name"  [at X,Y,Z]  [cut ...]  [view f|s|t]  [color #hex]
```

All keywords after `"Name"` are optional and can appear in any order.

### Variables

```
$T = 18       # thickness [mm]
$W = 800      # outer width
$H = 2000     # outer height
$D = 400      # depth
```

Variables can reference each other:
```
$A = 100
$B = $A + 50  # 150
```

### Boards — basic positioning

```
board[dn]  $W x $T x $D  "Bottom"      at 0, 0, 0
board[lt]  $T x $H x $D  "Left side"   at 0, 0, 0
board[rt]  $T x $H x $D  "Right side"  at {lt.right}+$W, 0, 0
board[tp]  $W x $T x $D  "Top"         at {lt.x}, {lt.top}-$T, 0
```

### Boards — angled placement (from/to)

```
board[diag]  200 x 20 x 50  "Diagonal brace"  from 0,0 to 100,100
board[shelf] 500 x 18 x 300 "Angled shelf"    from 0,200 to 500,250 z 50
```

The `from/to` syntax calculates angle and width automatically. If the declared width differs from the actual distance, the distance is used and a warning is shown. Optional `z` after `to` sets the Z coordinate.

### Boards — cuts

Trapezoidal cuts trim the board shape. Each side value specifies the resulting height (left/right) or width (top/bottom) after cutting:

```
board[trap]  500 x 400 x 50  "Trapezoid"  cut left 300 right 200
board[wedge] 300 x 200 x 50  "Wedge"      cut top 100 bottom 150
board[all4]  500 x 400 x 50  "All cuts"   cut left 300 right 200 top 100 bottom 150
```

### Boards — view orientation

Controls which face is shown in the list view:

```
board[side]  100 x 200 x 50  "Side panel"  view s   # shows D x H (side)
board[top]   100 x 200 x 50  "Top panel"   view t   # shows W x D (top)
board[front] 100 x 200 x 50  "Front"       view f   # shows W x H (default)
```

### Boards — color

```
board[a]  100 x 200 x 50  "Custom color"   color #7a4f28
board[b]  100 x 200 x 50  "Auto color"     # assigned from 12-color palette
```

### Combining keywords

All optional keywords can be combined freely:

```
board[x]  100 x 20 x 50  "Complex"  from 0,0 to 100,0 cut left 15 right 10 view s color #ff0000
board[y]  100 x 200 x 50 "Placed"   at 10,20,30 cut left 150 view t color #00ff00
```

### LEN() function

Calculates Euclidean distance between two points:

```
$dist = LEN(0,0,3,4)   # = 5 (3-4-5 triangle)
board[a]  LEN(0,0,100,100) x 20 x 50  "Measured board"
```

### Available board properties

| Property | Meaning |
|----------|---------|
| `.x` `.y` `.z` | Position (origin corner), defaults to 0 if unset |
| `.w` `.h` `.d` | Width / Height / Depth |
| `.right` | `x + w` (AABB for rotated boards) |
| `.top` | `y + h` (AABB for rotated boards) |
| `.back` | `z + d` |
| `.cx` `.cy` | Center X / Center Y |
| `.angle` | Rotation angle in degrees (from `from/to`) |
| `.x2` `.y2` | End point of `from/to` placement |

---

## Examples

### Simple cabinet (default example)

```
$T  = 18
$W  = 800
$H  = 2000
$D  = 400

board[dn]  $W x $T x $D      "Dno"         at 0, 0, 0              color #7a4f28
board[lt]  $T x $H x $D      "Levy bok"    at 0, 0, 0              color #9a6235
board[rt]  $T x $H x $D      "Pravy bok"   at {lt.right}+$W, 0, 0  color #9a6235
board[tp]  $W+{lt.w} x $T x $D "Strop"     at {lt.x}, {lt.top}-$T, 0  color #7a4f28
board[bk]  {lt.right}+$W x $H x $T "Zada" at {lt.x}, {lt.y}, $D-$T  color #5c3a1e
board[p1]  $W x $T x $D-$T   "Police 1"   at {lt.right}, {dn.top}+380, {dn.z}
board[p2]  $W x $T x $D-$T   "Police 2"   at {p1.x}, {p1.top}+380, {p1.z}
board[p3]  $W x $T x $D-$T   "Police 3"   at {p2.x}, {p2.top}+380, {p2.z}
```

### A-frame shelf

```
$T = 18
$H = 600
$W = 400
$D = 300

board[fl]  $W x $T x $D  "Floor"         at 0, 0, 0
board[la]  $H x $T x $D  "Left leg"      from 0,0 to 200,$H
board[ra]  $H x $T x $D  "Right leg"     from $W,0 to 200,$H
board[sh]  200 x $T x $D "Shelf"         at 100, 300, 0
```

### Desk with angled braces

```
$T  = 25
$W  = 1200
$H  = 750
$D  = 600

board[top]  $W x $T x $D  "Desktop"       at 0, $H-$T, 0      color #d4b87a
board[ll]   $T x $H-$T x $T  "Left leg"   at 0, 0, 0           color #a07040
board[rl]   $T x $H-$T x $T  "Right leg"  at $W-$T, 0, 0       color #a07040
board[br]   500 x $T x $T "Brace"         from $T,100 to $W-$T,{ll.top}-100  color #8b6035
```

### Trapezoid side panels

```
$T = 18
$W = 500
$H = 400
$D = 300

board[left]   $T x $H x $D  "Left"   at 0, 0, 0  cut left 400 right 300
board[right]  $T x $H x $D  "Right"  at $W, 0, 0  cut left 400 right 300
board[bot]    $W x $T x $D  "Bottom" at 0, 0, 0
board[shelf]  $W x $T x $D  "Shelf"  at 0, 200, 0  cut bottom 400 top 350
```

---

## Running locally

Just open `index.html` in any modern browser — no build step required. Three.js is loaded from CDN.

---

## Testing

```bash
npm install                # install Playwright (first time only)
npx playwright install     # install browser binaries (first time only)

npm run test:unit          # 123 unit tests, <0.5s (node:test)
npm run test:e2e           # 56 Playwright E2E tests, ~1.6min
npm test                   # both
```

### Architecture

Pure logic lives in `lib/engine.js` — works in both browser (`<script src>`) and Node.js (`require()`). DOM-dependent code stays in `index.html`.

---

## GitHub Pages setup

1. Push this repo to GitHub
2. Go to **Settings > Pages**
3. Source: **Deploy from branch**, branch: `main`, folder: `/ (root)`
4. Save — your site will be live at `https://prespic.github.io/draftmaid/`

---

## Tech stack

- Vanilla JS + SVG (2D rendering)
- [Three.js r128](https://threejs.org/) (3D rendering)
- [Playwright](https://playwright.dev/) (E2E tests)
- `node:test` + `node:assert` (unit tests, zero external deps)

---

## License

MIT
