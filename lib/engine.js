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
board[dn] $W x $T x $D "Dno"
  at 0, 0, 0
  color #7a4f28
  view ft

board[lt] $T x $H x $D "Levý bok"
  at 0, 0, 0
  color #9a6235
  view sf

board[rt] $T x $H x $D "Pravý bok"
  at {lt.right}+$W, 0, 0
  color #9a6235
  view sf

board[tp] $W+{lt.w} x $T x $D "Strop"
  at {lt.x}, {lt.top}-$T, 0
  color #7a4f28
  view ft

board[bk] {lt.right}+$W x $H x $T "Záda"
  at {lt.x}, {lt.y}, $D-$T
  color #5c3a1e

board[p1] $W x $T x $D-$T "Police 1"
  at {lt.right}, {dn.top}+380, {dn.z}
  view ft

board[p2] $W x $T x $D-$T "Police 2"
  at {p1.x}, {p1.top}+380, {p1.z}
  view ft

board[p3] $W x $T x $D-$T "Police 3"
  at {p2.x}, {p2.top}+380, {p2.z}
  view ft`;

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
  { name: 'Kurník', code: `# Kurník – 3D model
# Rozměry: 1875 × 2500 mm, pultová střecha

$LX  = 1875    # hloubka kurníku
$LZ  = 2500    # šířka kurníku

$ZF  = 1990    # Y přední horní práh
$ZB  = 1305    # Y zadní horní práh

$FLB = 100     # Y spodní hrana podlahy OSB
$FLT = 115     # Y horní hrana podlahy OSB

$T12 = 12      # tloušťka OSB 12 mm
$T15 = 15      # tloušťka OSB 15 mm
$T3  = 3       # tloušťka sololit

$SP  = 40      # hloubka sloupku
$SP2 = 60      # šířka sloupku

$TR  = 100     # výška podlahového trámu
$TRS = 60      # šířka podlahového trámu

$RLEN = LEN(0, 2050, 1875, 1365)       # délka střešní OSB po spádu
$KLEN = LEN(-350, 2190, 2000, 1330)    # délka trámku (~2500 mm)
$MY = ($ZF+$ZB)/2                          # strop – Y v polovině spádu (1647.5)
$CHALF = LEN(0, $ZF, $LX/2, $MY)           # délka poloviny stropního spádu (~998 mm)

group "Patky"
# 1. Betonové patky
board[f1] 200 x 250 x 200 "Patka F1"
  at -100, -250, -100
  view fs
  color #9a9a9a
board[f2] 200 x 250 x 200 "Patka F2"
  at -100, -250, 1150
  view fs
  color #9a9a9a
board[f3] 200 x 250 x 200 "Patka F3"
  at -100, -250, 2400
  view fs
  color #9a9a9a
board[f4] 200 x 250 x 200 "Patka F4"
  at 1775, -250, -100
  view fs
  color #9a9a9a
board[f5] 200 x 250 x 200 "Patka F5"
  at 1775, -250, 1150
  view fs
  color #9a9a9a
board[f6] 200 x 250 x 200 "Patka F6"
  at 1775, -250, 2400
  view fs
  color #9a9a9a

group "Rám"
# 2. Podlahový rám – hranoly 60×100 mm
board[bm1] $TRS x $TR x $LZ "Trám BM1 (přední)"
  at 0, 0, 0
  view fs
  color #8B6914
board[bm2a] $TRS x $TR x $LZ "Trám BM2a"
  at 595, 0, 0
  view fs
  color #8B6914
board[bm2b] $TRS x $TR x $LZ "Trám BM2b"
  at 1220, 0, 0
  view fs
  color #8B6914
board[bm3] $TRS x $TR x $LZ "Trám BM3 (zadní)"
  at $LX-$TRS, 0, 0
  view fs
  color #8B6914
board[bm4] $LX-2*$TRS x $TR x $TRS "Trám BM4 (levý)"
  at $TRS, 0, 0
  view fs
  color #9a7520
board[bm5] $LX-2*$TRS x $TR x $TRS "Trám BM5 (střed)"
  at $TRS, 0, 1250
  view fs
  color #9a7520
board[bm6] $LX-2*$TRS x $TR x $TRS "Trám BM6 (pravý)"
  at $TRS, 0, $LZ-$TRS
  view fs
  color #9a7520

group "Podlaha"
# 3. Podlaha – OSB 15 mm
board[fl1] 625 x $T15 x $LZ "Podlaha FL1"
  at 0, $FLB, 0
  view t
  color #d4b87a
board[fl2] 625 x $T15 x $LZ "Podlaha FL2"
  at 625, $FLB, 0
  view t
  color #c9ae72
board[fl3] 625 x $T15 x $LZ "Podlaha FL3"
  at 1250, $FLB, 0
  view t
  color #d4b87a

group "Izolace"
# EPS 40 mm – podlaha (desky 1000×500 mm na OSB)
board[eps_f1a] 1000 x $SP x 500 "EPS podlaha 1A"
  at 0, $FLT, 0
  view t
  color #a8c8e8
board[eps_f1b] 1000 x $SP x 500 "EPS podlaha 1B"
  at 0, $FLT, 500
  view t
  color #b8d4f0
board[eps_f1c] 1000 x $SP x 500 "EPS podlaha 1C"
  at 0, $FLT, 1000
  view t
  color #a8c8e8
board[eps_f1d] 1000 x $SP x 500 "EPS podlaha 1D"
  at 0, $FLT, 1500
  view t
  color #b8d4f0
board[eps_f1e] 1000 x $SP x 500 "EPS podlaha 1E"
  at 0, $FLT, 2000
  view t
  color #a8c8e8
board[eps_f2a] 875 x $SP x 500 "EPS podlaha 2A"
  at 1000, $FLT, 0
  view t
  color #b8d4f0
board[eps_f2b] 875 x $SP x 500 "EPS podlaha 2B"
  at 1000, $FLT, 500
  view t
  color #a8c8e8
board[eps_f2c] 875 x $SP x 500 "EPS podlaha 2C"
  at 1000, $FLT, 1000
  view t
  color #b8d4f0
board[eps_f2d] 875 x $SP x 500 "EPS podlaha 2D"
  at 1000, $FLT, 1500
  view t
  color #a8c8e8
board[eps_f2e] 875 x $SP x 500 "EPS podlaha 2E"
  at 1000, $FLT, 2000
  view t
  color #b8d4f0

# EPS 40 mm – přední stěna (mezi sloupky, moduly 1000×500)
# Pole 1: Z=40..625 (585 mm), plná výška
board[eps_wf11] $SP x 440 x 585 "EPS přední P1/1"
  at 0, $FLT+$SP2, $SP
  view s
  color #a8c8e8
board[eps_wf12] $SP x 500 x 585 "EPS přední P1/2"
  at 0, 615, $SP
  view s
  color #b8d4f0
board[eps_wf13] $SP x 500 x 585 "EPS přední P1/3"
  at 0, 1115, $SP
  view s
  color #a8c8e8
board[eps_wf14] $SP x 315 x 585 "EPS přední P1/4"
  at 0, 1615, $SP
  view s
  color #b8d4f0
# Pole 2: Z=665..1250 (585 mm), dveřní zona
board[eps_wf2a] $SP x 190 x 585 "EPS přední P2 pod"
  at 0, $FLT+$SP2, 665
  view s
  color #a8c8e8
board[eps_wf2b] $SP x 275 x 585 "EPS přední P2 nad"
  at 0, 1655, 665
  view s
  color #b8d4f0
# Pole 3: Z=1290..1875 (585 mm), dveřní zona
board[eps_wf3a] $SP x 190 x 585 "EPS přední P3 pod"
  at 0, $FLT+$SP2, 1290
  view s
  color #a8c8e8
board[eps_wf3b] $SP x 275 x 585 "EPS přední P3 nad"
  at 0, 1655, 1290
  view s
  color #b8d4f0
# Pole 4: Z=1915..2460 (545 mm), plná výška
board[eps_wf41] $SP x 440 x 545 "EPS přední P4/1"
  at 0, $FLT+$SP2, 1915
  view s
  color #a8c8e8
board[eps_wf42] $SP x 500 x 545 "EPS přední P4/2"
  at 0, 615, 1915
  view s
  color #b8d4f0
board[eps_wf43] $SP x 500 x 545 "EPS přední P4/3"
  at 0, 1115, 1915
  view s
  color #a8c8e8
board[eps_wf44] $SP x 315 x 545 "EPS přední P4/4"
  at 0, 1615, 1915
  view s
  color #b8d4f0

# EPS 40 mm – zadní stěna (mezi sloupky, moduly 1000×500)
# Pole 1: Z=40..625 (585 mm)
board[eps_wb11] $SP x 440 x 585 "EPS zadní P1/1"
  at $LX-$SP, $FLT+$SP2, $SP
  view s
  color #a8c8e8
board[eps_wb12] $SP x 500 x 585 "EPS zadní P1/2"
  at $LX-$SP, 615, $SP
  view s
  color #b8d4f0
board[eps_wb13] $SP x 190 x 585 "EPS zadní P1/3"
  at $LX-$SP, 1115, $SP
  view s
  color #a8c8e8
# Pole 2: Z=665..1250 (585 mm)
board[eps_wb21] $SP x 440 x 585 "EPS zadní P2/1"
  at $LX-$SP, $FLT+$SP2, 665
  view s
  color #b8d4f0
board[eps_wb22] $SP x 500 x 585 "EPS zadní P2/2"
  at $LX-$SP, 615, 665
  view s
  color #a8c8e8
board[eps_wb23] $SP x 190 x 585 "EPS zadní P2/3"
  at $LX-$SP, 1115, 665
  view s
  color #b8d4f0
# Pole 3: Z=1290..1875 (585 mm)
board[eps_wb31] $SP x 440 x 585 "EPS zadní P3/1"
  at $LX-$SP, $FLT+$SP2, 1290
  view s
  color #a8c8e8
board[eps_wb32] $SP x 500 x 585 "EPS zadní P3/2"
  at $LX-$SP, 615, 1290
  view s
  color #b8d4f0
board[eps_wb33] $SP x 190 x 585 "EPS zadní P3/3"
  at $LX-$SP, 1115, 1290
  view s
  color #a8c8e8
# Pole 4: Z=1915..2460 (545 mm)
board[eps_wb41] $SP x 440 x 545 "EPS zadní P4/1"
  at $LX-$SP, $FLT+$SP2, 1915
  view s
  color #b8d4f0
board[eps_wb42] $SP x 500 x 545 "EPS zadní P4/2"
  at $LX-$SP, 615, 1915
  view s
  color #a8c8e8
board[eps_wb43] $SP x 190 x 545 "EPS zadní P4/3"
  at $LX-$SP, 1115, 1915
  view s
  color #b8d4f0

# EPS 40 mm – boční stěny (moduly max 500×1000 mm)
# Levá stěna – pole 1 (X=0..625, výška 1875→1667)
board[eps_wl1a] 625 x 460 x $SP "EPS levý P1/A"
  at 0, $FLT+$SP, 0
  view f
  color #a8c8e8
board[eps_wl1b] 625 x 500 x $SP "EPS levý P1/B"
  at 0, 615, 0
  view f
  color #b8d4f0
board[eps_wl1c] 625 x 500 x $SP "EPS levý P1/C"
  at 0, 1115, 0
  view f
  color #a8c8e8
board[eps_wl1d] 625 x 375 x $SP "EPS levý P1/D"
  at 0, 1615, 0
  cut left 375 right 147
  view f
  color #b8d4f0
# Levá stěna – pole 2 (X=665..1250, výška 1667→1458)
board[eps_wl2a] 585 x 460 x $SP "EPS levý P2/A"
  at 665, $FLT+$SP, 0
  view f
  color #a8c8e8
board[eps_wl2b] 585 x 500 x $SP "EPS levý P2/B"
  at 665, 615, 0
  view f
  color #b8d4f0
board[eps_wl2c] 585 x 500 x $SP "EPS levý P2/C"
  at 665, 1115, 0
  cut left 500 right 418
  view f
  color #a8c8e8
board[eps_wl2d] 585 x 132 x $SP "EPS levý P2/D"
  at 665, 1615, 0
  cut left 132 right 0
  view f
  color #b8d4f0
# Levá stěna – pole 3 (X=1290..1875, výška 1458→1190)
board[eps_wl3a] 585 x 460 x $SP "EPS levý P3/A"
  at 1290, $FLT+$SP, 0
  view f
  color #a8c8e8
board[eps_wl3b] 585 x 500 x $SP "EPS levý P3/B"
  at 1290, 615, 0
  view f
  color #b8d4f0
board[eps_wl3c] 585 x 404 x $SP "EPS levý P3/C"
  at 1290, 1115, 0
  cut left 404 right 190
  view f
  color #a8c8e8
# Pravá stěna – pole 1 (X=0..625, výška 1875→1667)
board[eps_wr1a] 625 x 460 x $SP "EPS pravý P1/A"
  at 0, $FLT+$SP, $LZ-$SP
  view f
  color #a8c8e8
board[eps_wr1b] 625 x 500 x $SP "EPS pravý P1/B"
  at 0, 615, $LZ-$SP
  view f
  color #b8d4f0
board[eps_wr1c] 625 x 500 x $SP "EPS pravý P1/C"
  at 0, 1115, $LZ-$SP
  view f
  color #a8c8e8
board[eps_wr1d] 625 x 375 x $SP "EPS pravý P1/D"
  at 0, 1615, $LZ-$SP
  cut left 375 right 147
  view f
  color #b8d4f0
# Pravá stěna – pole 2 (X=665..1250, výška 1667→1458)
board[eps_wr2a] 585 x 460 x $SP "EPS pravý P2/A"
  at 665, $FLT+$SP, $LZ-$SP
  view f
  color #a8c8e8
board[eps_wr2b] 585 x 500 x $SP "EPS pravý P2/B"
  at 665, 615, $LZ-$SP
  view f
  color #b8d4f0
board[eps_wr2c] 585 x 500 x $SP "EPS pravý P2/C"
  at 665, 1115, $LZ-$SP
  cut left 500 right 418
  view f
  color #a8c8e8
board[eps_wr2d] 585 x 132 x $SP "EPS pravý P2/D"
  at 665, 1615, $LZ-$SP
  cut left 132 right 0
  view f
  color #b8d4f0
# Pravá stěna – pole 3 (X=1290..1875, výška 1458→1190)
board[eps_wr3a] 585 x 460 x $SP "EPS pravý P3/A"
  at 1290, $FLT+$SP, $LZ-$SP
  view f
  color #a8c8e8
board[eps_wr3b] 585 x 500 x $SP "EPS pravý P3/B"
  at 1290, 615, $LZ-$SP
  view f
  color #b8d4f0
board[eps_wr3c] 585 x 404 x $SP "EPS pravý P3/C"
  at 1290, 1115, $LZ-$SP
  cut left 404 right 190
  view f
  color #a8c8e8

# EPS 40 mm – strop (moduly max 500×1000 mm, šikmý)
# Přední polovina spádu
board[eps_c1a] $CHALF x $SP x 500 "EPS strop 1A"
  from 0,$ZF to $LX/2,$MY
  z $SP2
  view t
  color #a8c8e8
board[eps_c1b] $CHALF x $SP x 500 "EPS strop 1B"
  from 0,$ZF to $LX/2,$MY
  z $SP2+500
  view t
  color #b8d4f0
board[eps_c1c] $CHALF x $SP x 500 "EPS strop 1C"
  from 0,$ZF to $LX/2,$MY
  z $SP2+1000
  view t
  color #a8c8e8
board[eps_c1d] $CHALF x $SP x 500 "EPS strop 1D"
  from 0,$ZF to $LX/2,$MY
  z $SP2+1500
  view t
  color #b8d4f0
board[eps_c1e] $CHALF x $SP x 380 "EPS strop 1E"
  from 0,$ZF to $LX/2,$MY
  z $SP2+2000
  view t
  color #a8c8e8
# Zadní polovina spádu
board[eps_c2a] $CHALF x $SP x 500 "EPS strop 2A"
  from $LX/2,$MY to $LX,$ZB
  z $SP2
  view t
  color #b8d4f0
board[eps_c2b] $CHALF x $SP x 500 "EPS strop 2B"
  from $LX/2,$MY to $LX,$ZB
  z $SP2+500
  view t
  color #a8c8e8
board[eps_c2c] $CHALF x $SP x 500 "EPS strop 2C"
  from $LX/2,$MY to $LX,$ZB
  z $SP2+1000
  view t
  color #b8d4f0
board[eps_c2d] $CHALF x $SP x 500 "EPS strop 2D"
  from $LX/2,$MY to $LX,$ZB
  z $SP2+1500
  view t
  color #a8c8e8
board[eps_c2e] $CHALF x $SP x 380 "EPS strop 2E"
  from $LX/2,$MY to $LX,$ZB
  z $SP2+2000
  view t
  color #b8d4f0

group "Plášť"
# 4. Přední stěna – OSB 12 mm
board[ew_fp] $T12 x 250 x $LZ "Přední – spodní práh"
  at -$T12, $FLT, 0
  view s
  color #a07540
board[ew_fl] $T12 x 1250 x 625 "Přední – fixní L"
  at -$T12, 365, 0
  view s
  color #a07540
board[door_l] $T12 x 1250 x 625 "Dveře – levé křídlo"
  at -$T12, 365, 625
  view s
  color #7a4f28
board[door_r] $T12 x 1250 x 625 "Dveře – pravé křídlo"
  at -$T12, 365, 1250
  view s
  color #7a4f28
board[ew_fr] $T12 x 1250 x 625 "Přední – fixní R"
  at -$T12, 365, 1875
  view s
  color #a07540
board[ew_fn] $T12 x 375 x $LZ "Přední – nadpraží"
  at -$T12, 1615, 0
  view s
  color #a07540

# 5. Zadní stěna – OSB 12 mm
board[ew_b1] $T12 x 625 x $LZ "Zadní stěna – dolní pás"
  at $LX, $FLT, 0
  view s
  color #a07540
board[ew_b2] $T12 x 625 x $LZ "Zadní stěna – horní pás"
  at $LX, 740, 0
  view s
  color #a07540

# 6. Levá boční stěna – OSB 12 mm (lichoběžníky)
board[ew_l1] 625 x 1875 x $T12 "Levá boční – pás 1"
  at 0, $FLT, -$T12
  cut left 1875 right 1667
  view f
  color #b08050
board[ew_l2] 625 x 1667 x $T12 "Levá boční – pás 2"
  at 625, $FLT, -$T12
  cut left 1667 right 1458
  view f
  color #b08050
board[ew_l3] 625 x 1458 x $T12 "Levá boční – pás 3"
  at 1250, $FLT, -$T12
  cut left 1458 right 1250
  view f
  color #b08050

# 7. Pravá boční stěna – zrcadlová
board[ew_r1] 625 x 1875 x $T12 "Pravá boční – pás 1"
  at 0, $FLT, $LZ
  cut left 1875 right 1667
  view f
  color #b08050
board[ew_r2] 625 x 1667 x $T12 "Pravá boční – pás 2"
  at 625, $FLT, $LZ
  cut left 1667 right 1458
  view f
  color #b08050
board[ew_r3] 625 x 1458 x $T12 "Pravá boční – pás 3"
  at 1250, $FLT, $LZ
  cut left 1458 right 1250
  view f
  color #b08050

group "Stěnový rám"
# Přední stěna – rám 40×60 mm
board[wf_sp] $SP x $SP2 x $LZ "Přední spodní práh"
  at 0, $FLT, 0
  view fs
  color #8b6035
board[wf_hp] $SP x $SP2 x $LZ "Přední horní práh"
  at 0, $ZF-$SP2, 0
  view fs
  color #8b6035
board[wf_s1] $SP2 x $ZF-$FLT-2*$SP2 x $SP "Sloupek přední L"
  at 0, $FLT+$SP2, 0
  view fs
  color #a07040
board[wf_s2] $SP2 x $ZF-$FLT-2*$SP2 x $SP "Sloupek přední 2"
  at 0, $FLT+$SP2, 625
  view fs
  color #a07040
board[wf_s3a] $SP2 x 190 x $SP "Sloupek přední M – pod dveřmi"
  at 0, $FLT+$SP2, 1250
  view fs
  color #a07040
board[wf_s3b] $SP2 x 275 x $SP "Sloupek přední M – nad dveřmi"
  at 0, 1655, 1250
  view fs
  color #a07040
board[wf_s4] $SP2 x $ZF-$FLT-2*$SP2 x $SP "Sloupek přední 4"
  at 0, $FLT+$SP2, 1875
  view fs
  color #a07040
board[wf_s5] $SP2 x $ZF-$FLT-2*$SP2 x $SP "Sloupek přední R"
  at 0, $FLT+$SP2, $LZ-$SP
  view fs
  color #a07040
board[wf_dh] $SP2 x $SP x 1250 "Horní překlad dveří"
  at 0, 1615, 625
  view fs
  color #8b6035
board[wf_ds] $SP2 x $SP x 1250 "Spodní práh dveří"
  at 0, 365, 625
  view fs
  color #8b6035

# Zadní stěna – rám 40×60 mm
board[wb_sp] $SP x $SP2 x $LZ "Zadní spodní práh"
  at $LX-$SP2, $FLT, 0
  view fs
  color #8b6035
board[wb_hp] $SP x $SP2 x $LZ "Zadní horní práh"
  at $LX-$SP2, $ZB, 0
  view fs
  color #8b6035
board[wb_s1] $SP2 x $ZB-$FLT-$SP2 x $SP "Sloupek zadní L"
  at $LX-$SP2, $FLT+$SP2, 0
  view fs
  color #a07040
board[wb_s2] $SP2 x $ZB-$FLT-$SP2 x $SP "Sloupek zadní 2"
  at $LX-$SP2, $FLT+$SP2, 625
  view fs
  color #a07040
board[wb_s3] $SP2 x $ZB-$FLT-$SP2 x $SP "Sloupek zadní M"
  at $LX-$SP2, $FLT+$SP2, 1250
  view fs
  color #a07040
board[wb_s4] $SP2 x $ZB-$FLT-$SP2 x $SP "Sloupek zadní 4"
  at $LX-$SP2, $FLT+$SP2, 1875
  view fs
  color #a07040
board[wb_s5] $SP2 x $ZB-$FLT-$SP2 x $SP "Sloupek zadní R"
  at $LX-$SP2, $FLT+$SP2, $LZ-$SP
  view fs
  color #a07040

# Levá boční stěna – rám 40×60 mm
board[wl_sp] $LX x $SP x $SP2 "Levý spodní práh"
  at 0, $FLT, 0
  view fs
  color #8b6035
board[wl_hp] LEN(0,$ZF,$LX,$ZB) x $SP x $SP2 "Levý horní práh"
  from 0,$ZF to $LX,$ZB
  z 0
  view fs
  color #8b6035
board[wl_s1] $SP x 1607 x $SP2 "Sloupek levý 1"
  at 625, $FLT+$SP, 0
  view fs
  color #a07040
board[wl_s2] $SP x 1378 x $SP2 "Sloupek levý 2"
  at 1250, $FLT+$SP, 0
  view fs
  color #a07040

# Pravá boční stěna – rám 40×60 mm
board[wr_sp] $LX x $SP x $SP2 "Pravý spodní práh"
  at 0, $FLT, $LZ-$SP2
  view fs
  color #8b6035
board[wr_hp] LEN(0,$ZF,$LX,$ZB) x $SP x $SP2 "Pravý horní práh"
  from 0,$ZF to $LX,$ZB
  z $LZ-$SP2
  view fs
  color #8b6035
board[wr_s1] $SP x 1607 x $SP2 "Sloupek pravý 1"
  at 625, $FLT+$SP, $LZ-$SP2
  view fs
  color #a07040
board[wr_s2] $SP x 1378 x $SP2 "Sloupek pravý 2"
  at 1250, $FLT+$SP, $LZ-$SP2
  view fs
  color #a07040

group "Vnitřní obklad"
# Sololit 3mm – podlaha (pochozí vrstva na EPS)
board[sol_fl] $LX x $T3 x $LZ "Podlaha – sololit"
  at 0, $FLT+$SP, 0
  view t
  color #d4c4b0

# Sololit 3mm – přední stěna (bez dveří)
board[iw_fl] $T3 x $ZF-$FLT x 625 "Obklad přední L"
  at $SP2, $FLT, 0
  view s
  color #e8d8c0
board[iw_fr] $T3 x $ZF-$FLT x 625 "Obklad přední R"
  at $SP2, $FLT, $LZ-625
  view s
  color #e8d8c0
board[iw_fa] $T3 x $ZF-1615 x 1250 "Obklad nad dveřmi"
  at $SP2, 1615, 625
  view s
  color #e8d8c0

# Sololit 3mm – zadní stěna
board[iw_b] $T3 x $ZB-$FLT x $LZ "Obklad zadní"
  at $LX-$SP2-$T3, $FLT, 0
  view s
  color #e8d8c0

# Sololit 3mm – boční stěny (lichoběžníky)
board[iw_l] $LX x $ZF-$FLT x $T3 "Obklad levý"
  at 0, $FLT, $SP2
  cut left $ZF-$FLT right $ZB-$FLT
  view f
  color #e8d8c0
board[iw_r] $LX x $ZF-$FLT x $T3 "Obklad pravý"
  at 0, $FLT, $LZ-$SP2-$T3
  cut left $ZF-$FLT right $ZB-$FLT
  view f
  color #e8d8c0

# Sololit 3mm – strop (šikmý pod krokvemi)
board[ceil] LEN(0,$ZF,$LX,$ZB) x $T3 x $LZ-2*$SP2 "Strop – sololit"
  from 0,$ZF to $LX,$ZB
  z $SP2
  view t
  color #e8d8c0

group "Střecha"
# 8. Střešní bednění – OSB 12 mm (uzavírá stavbu na stěnách)
board[rf1] $RLEN x $T12 x 625 "Střešní OSB 1"
  from 0,2050 to $LX,1365
  z 0
  view t
  color #c4a35a
board[rf2] $RLEN x $T12 x 625 "Střešní OSB 2"
  from 0,2050 to $LX,1365
  z 625
  view t
  color #c9a050
board[rf3] $RLEN x $T12 x 625 "Střešní OSB 3"
  from 0,2050 to $LX,1365
  z 1250
  view t
  color #c4a35a
board[rf4] $RLEN x $T12 x 625 "Střešní OSB 4"
  from 0,2050 to $LX,1365
  z 1875
  view t
  color #c9a050

# 9. Střešní trámky 40×60 mm (na OSB, s přesahem)
# Okraje
board[k1] $KLEN x 60 x 40 "Trámek K1 – levý kraj"
  from -350,2190 to 2000,1330
  z 0
  view fs
  color #6b4226
board[k2] $KLEN x 60 x 40 "Trámek K2 – pravý kraj"
  from -350,2190 to 2000,1330
  z 2500
  view fs
  color #6b4226
# Pod překryvy plechů
board[k3] $KLEN x 60 x 40 "Trámek K3 – překryv 1-2"
  from -350,2190 to 2000,1330
  z 800
  view fs
  color #6b4226
board[k4] $KLEN x 60 x 40 "Trámek K4 – překryv 2-3"
  from -350,2190 to 2000,1330
  z 1660
  view fs
  color #6b4226
# Uprostřed polí
board[k5] $KLEN x 60 x 40 "Trámek K5 – střed pole 1"
  from -350,2190 to 2000,1330
  z 400
  view fs
  color #6b4226
board[k6] $KLEN x 60 x 40 "Trámek K6 – střed pole 2"
  from -350,2190 to 2000,1330
  z 1230
  view fs
  color #6b4226
board[k7] $KLEN x 60 x 40 "Trámek K7 – střed pole 3"
  from -350,2190 to 2000,1330
  z 2080
  view fs
  color #6b4226

# 10. Střešní krytina – trapézový plech 2500×910 mm (na trámcích)
board[plech1] $KLEN x 1 x 910 "Plech T18 – 1"
  from -350,2250 to 2000,1390
  z -65
  view t
  color #b8c4cc
board[plech2] $KLEN x 1 x 910 "Plech T18 – 2"
  from -350,2250 to 2000,1390
  z 795
  view t
  color #c4ccd4
board[plech3] $KLEN x 1 x 910 "Plech T18 – 3"
  from -350,2250 to 2000,1390
  z 1655
  view t
  color #b8c4cc

` },
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
    this.currentGroup = null;
  }

  parse() {
    // Pre-process: join indented continuation lines to previous board line
    const rawLines = this.text.split('\n');
    const lines = [];
    const lineNums = [];
    for (let i = 0; i < rawLines.length; i++) {
      const raw = rawLines[i];
      const trimmed = raw.trim();
      if (/^[ \t]+/.test(raw) && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')
          && lines.length > 0 && /^board/i.test(lines[lines.length - 1].trim())) {
        lines[lines.length - 1] += ' ' + trimmed;
      } else {
        lines.push(raw);
        lineNums.push(i + 1);
      }
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) continue;
      if (line.startsWith('$')) { this.parseVar(line, lineNums[i]); continue; }
      if (/^group\b/i.test(line)) { this.parseGroup(line, lineNums[i]); continue; }
      if (/^board/i.test(line))  { this.parseBoard(line, lineNums[i]); continue; }
      this.errors.push(`Řádek ${lineNums[i]}: neznámý příkaz`);
    }
    const groupMap = new Map();
    for (const b of this.boards) {
      const g = b.group || null;
      if (!groupMap.has(g)) groupMap.set(g, []);
      groupMap.get(g).push(b.id);
    }
    const groups = [...groupMap.entries()].map(([name, ids]) => ({ name, boards: ids }));
    return { boards: this.boards, errors: this.errors, varCount: this.varCount, groups };
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

  parseGroup(line, ln) {
    const m = line.match(/^group\s+"([^"]+)"\s*(?:#.*)?$/i);
    if (!m) { this.errors.push(`Řádek ${ln}: neplatná skupina (vzor: group "název")`); return; }
    this.currentGroup = m[1];
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

      // 2–4. Cut / View / Color — order-independent extraction
      const kwEntries = [];
      for (const kw of ['cut','view','color']) {
        const pos = this.findKeyword(rest, kw);
        if (pos !== -1) kwEntries.push({ kw, pos });
      }
      kwEntries.sort((a, b) => a.pos - b.pos);
      for (let ki = 0; ki < kwEntries.length; ki++) {
        const { kw, pos } = kwEntries[ki];
        const valStart = pos + kw.length;
        const valEnd = ki + 1 < kwEntries.length ? kwEntries[ki + 1].pos : rest.length;
        const val = rest.slice(valStart, valEnd).trim();
        switch (kw) {
          case 'cut': {
            cuts = { left: null, right: null, top: null, bottom: null };
            const cutRe = /\b(left|right|top|bottom)\s+([^\s]+)/gi;
            let cm;
            while ((cm = cutRe.exec(val)) !== null) {
              cuts[cm[1].toLowerCase()] = this.eval(cm[2]);
            }
            break;
          }
          case 'view': {
            const seen = new Set();
            let validView = '';
            for (const ch of val.toLowerCase()) {
              if (!'fst'.includes(ch)) throw new Error(`Neplatný pohled '${ch}', povoleno: f, s, t`);
              if (!seen.has(ch)) { seen.add(ch); validView += ch; }
            }
            if (!validView.length) throw new Error('Prázdný pohled');
            view = validView;
            break;
          }
          case 'color': {
            const colorMatch = val.match(/^(#[0-9a-fA-F]{3,6})/);
            if (colorMatch) color = colorMatch[1];
            break;
          }
        }
      }

      if (!color) color = AUTO_COLORS[this.boards.length % AUTO_COLORS.length];

      const board = { id, name, w, h, d, x, y, z, hasPos, color, visible: true,
                      view, angle, fromTo, cuts, group: this.currentGroup };
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
    case 'front': return { lx: z,      ly: y, lw: b.d, lh: b.h };
    case 'back':  return { lx: -z-b.d, ly: y, lw: b.d, lh: b.h };
    case 'left':  return { lx: x,      ly: y, lw: b.w, lh: b.h };
    case 'right': return { lx: -x-b.w, ly: y, lw: b.w, lh: b.h };
    case 'top':   return { lx: x,      ly: z, lw: b.w, lh: b.d };
    case 'bottom':return { lx: x,      ly: -z-b.d, lw: b.w, lh: b.d };
  }
}

function projAxisLabels(proj) {
  switch(proj) {
    case 'front': case 'back': return ['→ Z','↑ Y'];
    case 'left': case 'right': return ['→ X','↑ Y'];
    case 'top': case 'bottom': return ['→ X','↑ Z'];
  }
}

// ═══════════════════════════════════════════════════════
//  DEPTH SORT for 2D projections
// ═══════════════════════════════════════════════════════
function depthSort(layout, proj) {
  layout.sort((a, b) => {
    const az = a.z ?? 0, bz = b.z ?? 0;
    const ax = a.x ?? 0, bx = b.x ?? 0;
    const ay = a.y ?? 0, by = b.y ?? 0;
    switch (proj) {
      case 'front':  return (bx + (b.w||0)) - (ax + (a.w||0));
      case 'back':   return ax - bx;
      case 'left':   return (bz + (b.d||0)) - (az + (a.d||0));
      case 'right':  return az - bz;
      case 'top':    return ay - by;
      case 'bottom': return (by + (b.h||0)) - (ay + (a.h||0));
      default: return 0;
    }
  });
}

// ═══════════════════════════════════════════════════════
//  BOARD SOURCE EDITING
// ═══════════════════════════════════════════════════════
function reconstructBoardLine(b) {
  let line = `board[${b.id}] ${b.w} x ${b.h} x ${b.d} "${b.name}"`;
  if (b.fromTo) {
    line += `\n  from ${b.fromTo.x1},${b.fromTo.y1} to ${b.fromTo.x2},${b.fromTo.y2}`;
    if (b.z != null && b.z !== 0) line += ` z ${b.z}`;
  } else if (b.hasPos) {
    line += `\n  at ${b.x}, ${b.y}, ${b.z}`;
  }
  if (b.cuts) {
    const parts = [];
    if (b.cuts.left !== null) parts.push(`left ${b.cuts.left}`);
    if (b.cuts.right !== null) parts.push(`right ${b.cuts.right}`);
    if (b.cuts.top !== null) parts.push(`top ${b.cuts.top}`);
    if (b.cuts.bottom !== null) parts.push(`bottom ${b.cuts.bottom}`);
    if (parts.length) line += `\n  cut ${parts.join(' ')}`;
  }
  if (b.view) line += `\n  view ${b.view}`;
  if (b.color) line += `\n  color ${b.color}`;
  return line;
}

// Find start/end line indices for a board block in source
function findBoardRange(sourceText, boardId) {
  const lines = sourceText.split('\n');
  const boardRe = new RegExp(`^board\\[${boardId}\\]\\s`, 'i');
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (boardRe.test(lines[i].trim())) { startIdx = i; break; }
  }
  if (startIdx === -1) return null;

  let endIdx = startIdx;
  for (let i = startIdx + 1; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (/^[ \t]+/.test(raw) && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
      endIdx = i;
    } else {
      break;
    }
  }
  return { startIdx, endIdx, lines };
}

function extractBoardSource(sourceText, boardId) {
  const range = findBoardRange(sourceText, boardId);
  if (!range) return '';
  return range.lines.slice(range.startIdx, range.endIdx + 1).join('\n');
}

function editBoardInSource(sourceText, boardId, newBoardOrText) {
  const range = findBoardRange(sourceText, boardId);
  if (!range) return sourceText;
  const { startIdx, endIdx, lines } = range;

  let newLines;
  if (typeof newBoardOrText === 'string') {
    newLines = newBoardOrText.split('\n');
  } else {
    newLines = reconstructBoardLine(newBoardOrText).split('\n');
  }
  lines.splice(startIdx, endIdx - startIdx + 1, ...newLines);
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════
//  RAW DSL FIELD PARSING (for edit panel)
// ═══════════════════════════════════════════════════════
function parseBoardSourceRaw(rawText) {
  if (!rawText || !rawText.trim()) return null;
  const rawLines = rawText.split('\n');
  let joined = rawLines[0];
  for (let i = 1; i < rawLines.length; i++) {
    const raw = rawLines[i];
    const trimmed = raw.trim();
    if (/^[ \t]+/.test(raw) && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
      joined += ' ' + trimmed;
    }
  }

  const re = /^board(?:\[([a-zA-Z_]\w*)\])?\s+(.+?)\s+"([^"]+)"\s*(.*?)$/i;
  const m = joined.match(re);
  if (!m) return null;

  const result = {
    id: m[1] || '', name: m[3],
    w: '', h: '', d: '',
    posType: 'none', x: '', y: '', z: '',
    x1: '', y1: '', x2: '', y2: '', fz: '',
    cutLeft: '', cutRight: '', cutTop: '', cutBottom: '',
    view: '', color: ''
  };

  // Dimensions
  const dimRaw = m[2].trim();
  const dims = dimRaw.split(/\s*[xXх]\s*(?=[0-9$({LlEeNn])/);
  result.w = (dims[0] || '').trim();
  result.h = (dims[1] || '').trim();
  result.d = (dims[2] || '').trim();

  let rest = (m[4] || '').trim();
  rest = rest.replace(/\s+#\s.*$/, '').trim();

  // Helpers — same nesting-aware logic as the parser
  function splitCoords(str) {
    const parts = []; let depth = 0, cur = '';
    for (const ch of str) {
      if (ch === '{' || ch === '(') depth++;
      else if (ch === '}' || ch === ')') depth--;
      if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    parts.push(cur.trim());
    return parts;
  }
  function findKw(str, kw) {
    const re2 = new RegExp('\\b' + kw + '\\b', 'gi');
    let m2;
    while ((m2 = re2.exec(str)) !== null) {
      const before = str.slice(0, m2.index);
      let depth = 0;
      for (const ch of before) { if (ch === '{' || ch === '(') depth++; else if (ch === '}' || ch === ')') depth--; }
      if (depth === 0) return m2.index;
    }
    return -1;
  }
  function findNextKw(str, keywords) {
    let best = -1, bestKw = null;
    for (const kw of keywords) {
      const pos = findKw(str, kw);
      if (pos !== -1 && (best === -1 || pos < best)) { best = pos; bestKw = kw; }
    }
    return { pos: best, keyword: bestKw };
  }

  // Position: from/to or at
  const fromPos = findKw(rest, 'from');
  const atPos = findKw(rest, 'at');

  if (fromPos !== -1) {
    result.posType = 'from';
    const afterFrom = rest.slice(fromPos + 4);
    const toPos = findKw(afterFrom, 'to');
    if (toPos !== -1) {
      const fromStr = afterFrom.slice(0, toPos).trim();
      const fromCoords = splitCoords(fromStr);
      result.x1 = fromCoords[0] || '';
      result.y1 = fromCoords[1] || '';

      const afterTo = afterFrom.slice(toPos + 2).trim();
      const nextKw = findNextKw(afterTo, ['z', 'cut', 'view', 'color']);
      let toStr, afterToRest;
      if (nextKw.pos !== -1) {
        toStr = afterTo.slice(0, nextKw.pos).trim();
        afterToRest = afterTo.slice(nextKw.pos).trim();
      } else { toStr = afterTo; afterToRest = ''; }
      const toCoords = splitCoords(toStr);
      result.x2 = toCoords[0] || '';
      result.y2 = toCoords[1] || '';

      rest = afterToRest;
      const zPos = findKw(rest, 'z');
      if (zPos !== -1 && rest.slice(0, zPos).trim() === '') {
        const afterZ = rest.slice(zPos + 1).trim();
        const nk = findNextKw(afterZ, ['cut', 'view', 'color']);
        if (nk.pos !== -1) { result.fz = afterZ.slice(0, nk.pos).trim(); rest = afterZ.slice(nk.pos).trim(); }
        else { result.fz = afterZ.trim(); rest = ''; }
      }
    }
  } else if (atPos !== -1) {
    result.posType = 'at';
    const afterAt = rest.slice(atPos + 2).trim();
    const nextKw = findNextKw(afterAt, ['cut', 'view', 'color']);
    let atStr;
    if (nextKw.pos !== -1) { atStr = afterAt.slice(0, nextKw.pos).trim(); rest = afterAt.slice(nextKw.pos).trim(); }
    else { atStr = afterAt; rest = ''; }
    const coords = splitCoords(atStr);
    result.x = coords[0] || '';
    result.y = coords[1] || '';
    result.z = coords[2] || '';
  }

  // Cut / view / color
  const kwEntries = [];
  for (const kw of ['cut', 'view', 'color']) {
    const pos = findKw(rest, kw);
    if (pos !== -1) kwEntries.push({ kw, pos });
  }
  kwEntries.sort((a, b) => a.pos - b.pos);
  for (let ki = 0; ki < kwEntries.length; ki++) {
    const { kw, pos } = kwEntries[ki];
    const valStart = pos + kw.length;
    const valEnd = ki + 1 < kwEntries.length ? kwEntries[ki + 1].pos : rest.length;
    const val = rest.slice(valStart, valEnd).trim();
    switch (kw) {
      case 'cut': {
        const cutRe = /\b(left|right|top|bottom)\s+(\S+)/gi;
        let cm;
        while ((cm = cutRe.exec(val)) !== null) {
          const side = cm[1].toLowerCase();
          if (side === 'left') result.cutLeft = cm[2];
          else if (side === 'right') result.cutRight = cm[2];
          else if (side === 'top') result.cutTop = cm[2];
          else if (side === 'bottom') result.cutBottom = cm[2];
        }
        break;
      }
      case 'view': result.view = val; break;
      case 'color': {
        const colorMatch = val.match(/^(#[0-9a-fA-F]{3,6})/);
        if (colorMatch) result.color = colorMatch[1];
        break;
      }
    }
  }

  return result;
}

function reconstructBoardLineRaw(f) {
  let line = `board[${f.id}] ${f.w} x ${f.h} x ${f.d} "${f.name}"`;
  if (f.posType === 'from') {
    line += `\n  from ${f.x1},${f.y1} to ${f.x2},${f.y2}`;
    if (f.fz) line += ` z ${f.fz}`;
  } else if (f.posType === 'at') {
    line += `\n  at ${f.x}, ${f.y}, ${f.z}`;
  }
  const cutParts = [];
  if (f.cutLeft) cutParts.push(`left ${f.cutLeft}`);
  if (f.cutRight) cutParts.push(`right ${f.cutRight}`);
  if (f.cutTop) cutParts.push(`top ${f.cutTop}`);
  if (f.cutBottom) cutParts.push(`bottom ${f.cutBottom}`);
  if (cutParts.length) line += `\n  cut ${cutParts.join(' ')}`;
  if (f.view) line += `\n  view ${f.view}`;
  if (f.color) line += `\n  color ${f.color}`;
  return line;
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
    depthSort, reconstructBoardLine, extractBoardSource, editBoardInSource,
    parseBoardSourceRaw, reconstructBoardLineRaw,
  };
}
