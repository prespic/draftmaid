# DraftMaid

A lightweight browser-based CAD tool for planning furniture boards — no installation, no backend, just a single HTML file.

🔗 **[Live demo via GitHub Pages](https://prespic.github.io/draftmaid/)**

---

## Features

- **DSL syntax** — describe boards in a simple text format
- **Variables** — define shared values like thickness, width, depth
- **Relative positioning** — reference other boards by ID (`{id.right}`, `{id.top}`, …)
- **2D assembled view** — front-view with dimension lines
- **2D list view** — each board as a separate card, sortable, with visibility toggles
- **3D preview** — Three.js render with orbit camera

---

## DSL Syntax

```
# Comment
$VAR = value

board[id]  W x H x D  "Name"  at X, Y, Z  color #hex
```

### Variables
```
$T = 18       # thickness
$W = 800      # outer width
$H = 2000     # outer height
$D = 400      # depth
```

### Boards
```
board[dn]  $W x $T x $D  "Bottom"      at 0, 0, 0
board[lt]  $T x $H x $D  "Left side"   at 0, 0, 0
board[rt]  $T x $H x $D  "Right side"  at {lt.right}+$W, 0, 0
board[tp]  $W x $T x $D  "Top"         at {lt.x}, {lt.top}-$T, 0
```

### Available board properties
| Property | Meaning |
|----------|---------|
| `.x .y .z` | Position (origin corner) |
| `.w .h .d` | Width / Height / Depth |
| `.right` | `x + w` |
| `.top`   | `y + h` |
| `.back`  | `z + d` |
| `.cx .cy` | Center X / Center Y |

---

## Running locally

Just open `index.html` in any modern browser — no build step, no dependencies to install. Three.js is loaded from cdnjs CDN.

---

## GitHub Pages setup

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from branch**, branch: `main`, folder: `/ (root)`
4. Save — your site will be live at `https://prespic.github.io/draftmaid/`

---

## Tech stack

- Vanilla JS + SVG (2D rendering)
- [Three.js r128](https://threejs.org/) (3D rendering)
- No build tools, no frameworks, no dependencies beyond CDN

---

## License

MIT
