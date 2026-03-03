# KURNÍK – SPECIFIKACE PRO 3D MODEL

## Souřadnicový systém

- **Počátek [0, 0, 0]**: levý přední dolní roh podlahového rámu (na úrovni horní hrany patek)
- **Osa X**: délka (přední→zadní stěna), 0…1875 mm
- **Osa Y**: šířka (levá→pravá strana), 0…2500 mm
- **Osa Z**: výška (nahoru), 0 = horní hrana patek (~365 mm nad zemí)

```
              Z ↑
              │
              │     Y
              │    ╱
              │   ╱
              │  ╱
              │ ╱
              │╱_________ X
            [0,0,0]

Pohled shora (půdorys):

         Y=0                    Y=2500
          ┌──────────────────────┐
  X=0     │                      │  ← PŘEDNÍ STĚNA (dveře)
          │                      │
          │      VNITŘEK         │
          │                      │
  X=1875  │                      │  ← ZADNÍ STĚNA
          └──────────────────────┘
```

---

## 1. ZÁKLAD – 6 BETONOVÝCH PATEK

Ztracené bednění 250×500×200mm, 2 řady po 3, zalité betonem.
Patky sahají od -250mm (v zemi) do +250mm (nad zemí).
Na vrchu kotevní U-patka s trámem.

| ID | Pozice středu [X, Y] | Rozměr | Z rozsah |
|---|---|---|---|
| F1 | [0, 0] | 500×200×500 | -250…+250 |
| F2 | [0, 1250] | 500×200×500 | -250…+250 |
| F3 | [0, 2500] | 500×200×500 | -250…+250 |
| F4 | [1875, 0] | 500×200×500 | -250…+250 |
| F5 | [1875, 1250] | 500×200×500 | -250…+250 |
| F6 | [1875, 2500] | 500×200×500 | -250…+250 |

> Patky jsou orientovány delší stranou (500mm) ve směru X. Horní hrana patky = Z +250mm. Na vrchu kotevní U-profil (100mm výška), ve kterém sedí trám.

---

## 2. PODLAHOVÝ RÁM – HRANOLY 60×100mm

Trámy sedí v U-patkách. Horní hrana trámů = Z=100mm (trám 100mm vysoký, spodek na Z=0).

### Podélné trámy (ve směru Y)

| ID | Od [X,Y,Z] | Do [X,Y,Z] | Profil |
|---|---|---|---|
| BM1 | [0, 0, 0] | [0, 2500, 0] | 60×100 (šířka×výška) |
| BM2 | [937, 0, 0] | [937, 2500, 0] | 60×100 |
| BM3 | [1875, 0, 0] | [1875, 2500, 0] | 60×100 |

### Příčné trámy (ve směru X)

| ID | Od [X,Y,Z] | Do [X,Y,Z] | Profil |
|---|---|---|---|
| BM4 | [0, 0, 0] | [1875, 0, 0] | 60×100 |
| BM5 | [0, 1250, 0] | [1875, 1250, 0] | 60×100 |
| BM6 | [0, 2500, 0] | [1875, 2500, 0] | 60×100 |

---

## 3. PODLAHA – OSB 15mm P+D

3 desky 625×2500mm, položené na trámech. Horní hrana = Z=115mm.

| ID | Roh [X,Y,Z] | Rozměr [šX, šY, tl] | Materiál |
|---|---|---|---|
| FL1 | [0, 0, 100] | 625×2500×15 | OSB 3 P+D 15mm |
| FL2 | [625, 0, 100] | 625×2500×15 | OSB 3 P+D 15mm |
| FL3 | [1250, 0, 100] | 625×2500×15 | OSB 3 P+D 15mm |

> P+D spoje mezi FL1–FL2 a FL2–FL3 ve směru X. Podlaha pokrývá celou plochu 1875×2500mm.

---

## 4. STĚNOVÝ RÁM – HRANOLY 40×60mm

Spodní práh stěny je integrovaný s podlahovým rámem (sdílený). Sloupky stojí na podlaze (Z=115mm).

### 4.1 Přední stěna (X=0, Y=0…2500)

Výška stěny: 1875mm. Spodní práh sdílený s podlahovým trámem BM1.

| ID | Od [X,Y,Z] | Do [X,Y,Z] | Profil | Poznámka |
|---|---|---|---|---|
| WF_HP | [0, 0, 1990] | [0, 2500, 1990] | 40×60 | Horní práh (60mm výška → horní hrana Z=2050) |
| WF_S1 | [0, 0, 115] | [0, 0, 1990] | 40×60 | Rohový sloupek levý |
| WF_S2 | [0, 625, 115] | [0, 625, 1990] | 40×60 | Sloupek – hrana levého fixního panelu / levých dveří |
| WF_S3 | [0, 1250, 115] | [0, 1250, 1990] | 40×60 | Středový sloupek (mezi dveřmi) |
| WF_S4 | [0, 1875, 115] | [0, 1875, 1990] | 40×60 | Sloupek – hrana pravých dveří / pravého fixního panelu |
| WF_S5 | [0, 2500, 115] | [0, 2500, 1990] | 40×60 | Rohový sloupek pravý |
| WF_DH | [0, 625, 1365] | [0, 1875, 1365] | 40×60 | Překlad nad dveřmi (Z=1365 = 115+1250) |

> Dveřní otvor: Y=625…1875 (šířka 1250mm), Z=115…1365 (výška 1250mm).
> Nad překladem: nadpraží Y=625…1875, Z=1365…1990 (výška 625mm).

### 4.2 Zadní stěna (X=1875, Y=0…2500)

Výška stěny: 1250mm.

| ID | Od [X,Y,Z] | Do [X,Y,Z] | Profil | Poznámka |
|---|---|---|---|---|
| WB_SP | [1875, 0, 115] | [1875, 2500, 115] | 40×60 | Spodní práh |
| WB_HP | [1875, 0, 1305] | [1875, 2500, 1305] | 40×60 | Horní práh (horní hrana Z=1365) |
| WB_S1 | [1875, 0, 115] | [1875, 0, 1305] | 40×60 | Rohový sloupek levý |
| WB_S2 | [1875, 625, 115] | [1875, 625, 1305] | 40×60 | Mezisvislice |
| WB_S3 | [1875, 1250, 115] | [1875, 1250, 1305] | 40×60 | Mezisvislice |
| WB_S4 | [1875, 1875, 115] | [1875, 1875, 1305] | 40×60 | Mezisvislice |
| WB_S5 | [1875, 2500, 115] | [1875, 2500, 1305] | 40×60 | Rohový sloupek pravý |

### 4.3 Levá boční stěna (Y=0, X=0…1875)

Lichoběžníková – přední výška 1875mm, zadní 1250mm.

| ID | Od [X,Y,Z] | Do [X,Y,Z] | Profil | Poznámka |
|---|---|---|---|---|
| WL_SP | [0, 0, 115] | [1875, 0, 115] | 40×60 | Spodní práh |
| WL_HP | [0, 0, 1990] | [1875, 0, 1365] | 40×60 | Horní práh ŠIKMÝ |
| WL_S1 | [625, 0, 115] | [625, 0, 1782] | 40×60 | Mezisvislice (výška interpolována) |
| WL_S2 | [1250, 0, 115] | [1250, 0, 1573] | 40×60 | Mezisvislice (výška interpolována) |

> Interpolace výšky horního práhu: Z = 1990 - (X/1875) × 625.
> Při X=625: Z=1782. Při X=1250: Z=1573.

### 4.4 Pravá boční stěna (Y=2500, X=0…1875)

Zrcadlově stejná jako levá.

| ID | Od [X,Y,Z] | Do [X,Y,Z] | Profil | Poznámka |
|---|---|---|---|---|
| WR_SP | [0, 2500, 115] | [1875, 2500, 115] | 40×60 | Spodní práh |
| WR_HP | [0, 2500, 1990] | [1875, 2500, 1365] | 40×60 | Horní práh ŠIKMÝ |
| WR_S1 | [625, 2500, 115] | [625, 2500, 1782] | 40×60 | Mezisvislice |
| WR_S2 | [1250, 2500, 115] | [1250, 2500, 1573] | 40×60 | Mezisvislice |

---

## 5. VNĚJŠÍ OPLÁŠTĚNÍ – OSB 12mm P+D 625×2500

Všechny stěny opláštěny zvenku deskou OSB 12mm.
OSB je přišroubována na vnější stranu sloupků.

### 5.1 Přední stěna (na ploše X=-12, Y=0…2500)

3 horizontální pásy P+D. Desky orientovány 625mm na výšku, 2500mm na šířku.

| ID | Roh [X,Y,Z] | Rozměr | Poznámka |
|---|---|---|---|
| EW_F_PRAH | [-12, 0, 115] | 12×2500×250 | Spodní práh pod dveřmi (ořez z desky 1) |
| EW_F_NADPR | [-12, 0, 1615] | 12×2500×375 | Nadpraží (ořez z téže desky 1) |
| EW_F_FIX_L | [-12, 0, 365] | 12×625×1250 | Fixní panel levý (½ desky 2) |
| EW_F_DOOR_L | [-12, 625, 365] | 12×625×1250 | Levé dveřní křídlo (½ desky 2) |
| EW_F_DOOR_R | [-12, 1250, 365] | 12×625×1250 | Pravé dveřní křídlo (½ desky 3) |
| EW_F_FIX_R | [-12, 1875, 365] | 12×625×1250 | Fixní panel pravý (½ desky 3) |

> Deska 1: 625×2500 → řez na práh 250×2500 + nadpraží 375×2500 (0 odpadu).
> Deska 2: 625×2500 → půlení na 2× 625×1250 (fixní L + dveře L).
> Deska 3: 625×2500 → půlení na 2× 625×1250 (dveře R + fixní R).
> Celkem: **3 desky, 0 odpadu**.

### 5.2 Zadní stěna (na ploše X=1887, Y=0…2500)

2 horizontální pásy P+D. 2×625 = 1250mm.

| ID | Roh [X,Y,Z] | Rozměr | Poznámka |
|---|---|---|---|
| EW_B1 | [1887, 0, 115] | 12×2500×625 | Spodní pás – celá deska |
| EW_B2 | [1887, 0, 740] | 12×2500×625 | Horní pás – celá deska |

> 2 desky, 0 řezů, 0 odpadu.

### 5.3 Levá boční stěna (na ploše Y=-12, X=0…1875)

3 svislé pásy P+D. 3×625 = 1875mm šířka – přesně.
Každý pás: šířka 625mm, výška podle sklonu, šikmý řez nahoře.

| ID | Roh [X,Y,Z] | Šířka | Výška přední→zadní | Poznámka |
|---|---|---|---|---|
| EW_L1 | [0, -12, 115] | 625 | 1875→1667 | Přední pás, šikmý řez nahoře |
| EW_L2 | [625, -12, 115] | 625 | 1667→1458 | Střední pás, šikmý řez |
| EW_L3 | [1250, -12, 115] | 625 | 1458→1250 | Zadní pás, šikmý řez |

> Horní hrana každé desky sleduje rovinu střechy: Z = 1990 - (X/1875)×625.
> EW_L1: [X=0: Z=1990, X=625: Z=1782]
> EW_L2: [X=625: Z=1782, X=1250: Z=1573]
> EW_L3: [X=1250: Z=1573, X=1875: Z=1365]
> 3 desky, každá 1 šikmý řez nahoře. Odřezky: lichoběžníky (použitelné).

### 5.4 Pravá boční stěna (na ploše Y=2512, X=0…1875)

Zrcadlově stejná jako levá.

| ID | Roh [X,Y,Z] | Šířka | Výška přední→zadní |
|---|---|---|---|
| EW_R1 | [0, 2512, 115] | 625 | 1875→1667 |
| EW_R2 | [625, 2512, 115] | 625 | 1667→1458 |
| EW_R3 | [1250, 2512, 115] | 625 | 1458→1250 |

---

## 6. IZOLACE – EPS 70F 40mm

Vložena mezi sloupky (60mm hloubka dutiny, EPS 40mm → 20mm vzduchová mezera u vnitřního obkladu).

| Umístění | Plocha (cca) | Tloušťka |
|---|---|---|
| Přední stěna (mimo dveře) | ~3.5 m² | 40mm |
| Zadní stěna | ~3.0 m² | 40mm |
| Boční stěny (2×) | ~2×2.5 m² | 40mm |
| Strop (mezi krokvemi) | ~4.7 m² | 40mm |
| **Celkem** | **~16 m²** | |

---

## 7. VNITŘNÍ OBKLAD – SOLOLIT 3mm

Přibitý na vnitřní stranu sloupků. Hladká strana dovnitř (anti-čmelík).

| Umístění | Plocha (cca) | Poznámka |
|---|---|---|
| Přední stěna (bez dveří) | ~2.5 m² | |
| Zadní stěna | ~2.9 m² | |
| Boční stěny | ~2×2.4 m² | |
| Strop | ~4.1 m² | |
| **Celkem** | **~14 m²** | 4× deska 1220×2750 |

> Vnitřní rozměr prostoru: 2350×1725mm (po odečtení 2×75mm stěna).
> Sololit je odsazen 75mm od vnějšího líce stěny na všech stranách.

---

## 8. STŘECHA

### 8.1 Krokve – hranoly 40×60mm

5 krokví ve směru spádu (X), rozteč ~625mm ve směru Y.
Krokve leží na horních prazích stěn.

| ID | Od [X,Y,Z] | Do [X,Y,Z] | Profil |
|---|---|---|---|
| RF_K1 | [-200, 0, 1990] | [1875, 0, 1365] | 40×60 |
| RF_K2 | [-200, 625, 1990] | [1875, 625, 1365] | 40×60 |
| RF_K3 | [-200, 1250, 1990] | [1875, 1250, 1365] | 40×60 |
| RF_K4 | [-200, 1875, 1990] | [1875, 1875, 1365] | 40×60 |
| RF_K5 | [-200, 2500, 1990] | [1875, 2500, 1365] | 40×60 |

> Krokve přesahují vpředu (X<0) o ~200mm = přesah střechy nad dveřmi.
> Vzadu (X=1875) krokve končí na úrovni zadní stěny.
> Spád: (1990-1365)/2075 ≈ 625/2075 ≈ 17° od horizontály.

### 8.2 Střešní bednění – OSB 12mm P+D 625×2500

4 desky položené na krokvích, P+D spoj ve směru Y.
Desky orientovány: 2500mm ve směru Y, 625mm ve směru spádu X.

| ID | Popis | Rozměr na střeše |
|---|---|---|
| RF_OSB1 | Přední pás (přesah vpředu) | 625×2500, začíná u X=-200 |
| RF_OSB2 | Druhý pás | 625×2500 |
| RF_OSB3 | Třetí pás | 625×2500 |
| RF_OSB4 | Zadní pás (přesah ~523mm) | 625×2500, končí za X=1875 |

> Délka po spádu: √(2075² + 625²) ≈ 2167mm. 4×625=2500mm.
> Zbývá ~333mm přesah vzadu (za zadní stěnou).
> Přesah vpředu: ~200mm (ochrana dveří).
> Přesah po stranách: 0 (desky končí na Y=0 a Y=2500).

### 8.3 Latě pod plech – 40×60mm

4 latě napříč (ve směru Y), na krokvích.

| ID | Od [X,Y,Z] | Do [X,Y,Z] | Profil |
|---|---|---|---|
| RF_L1 | [přesah, 0, na OSB] | [přesah, 2500, na OSB] | 40×60 |
| RF_L2 | [~600, 0, na OSB] | [~600, 2500, na OSB] | 40×60 |
| RF_L3 | [~1200, 0, na OSB] | [~1200, 2500, na OSB] | 40×60 |
| RF_L4 | [~1875, 0, na OSB] | [~1875, 2500, na OSB] | 40×60 |

### 8.4 Trapézový plech T18 pozink

Vlny ve směru spádu (X). 3 pásy přes celou šířku Y, na latích.

| Parametr | Hodnota |
|---|---|
| Typ | Trapézový plech T18, pozink 0.5mm |
| Krycí šířka pásu | ~1064mm |
| Počet pásů | 3 (přesah na stranách) |
| Délka pásu | ~2600mm (po spádu + přesah u okapu) |
| Celková plocha | ~8 m² |

---

## 9. STROP – SOLOLIT 3mm (zespodu krokví)

Hladký strop přibitý zespodu na krokve. Chrání EPS izolaci zespodu.
Mezi krokvemi je EPS 40mm, nad ním OSB bednění.

---

## 10. DVEŘE

### 10.1 Dveřní otvor

| Parametr | Hodnota |
|---|---|
| Pozice | Přední stěna, Y=625…1875 |
| Šířka otvoru | 1250mm (2×625mm křídla) |
| Výška otvoru | 1250mm (od Z=365 do Z=1615 zvenku) |
| Práh (vnější Z) | ~365mm od země |
| Nadpraží (vnější Z) | ~1615mm od země |

### 10.2 Dveřní křídla

Dvoukřídlé, panty na sloupkách WF_S2 a WF_S4.

| Křídlo | Rozměr | Panty na |
|---|---|---|
| Levé | 625×1250×12mm | Sloupek Y=625 (WF_S2) |
| Pravé | 625×1250×12mm | Sloupek Y=1875 (WF_S4) |

> Křídla jsou vyrobena z těchže P+D desek jako stěna (půlení desky).
> Na každém křídle: 2× pant + příčná výztuha z latě.

---

## 11. CELKOVÉ ROZMĚRY HOTOVÉ STAVBY

| Parametr | Hodnota |
|---|---|
| **Vnější půdorys** | 2500 × 1875 mm |
| **Vnitřní prostor** | 2350 × 1725 mm (4.05 m²) |
| **Tloušťka stěny** | 75mm (12 OSB + 60 sloupek + 3 sololit) |
| **Výška přední stěny (vnější)** | 1875mm od podlahy |
| **Výška zadní stěny (vnější)** | 1250mm od podlahy |
| **Podlaha nad zemí** | ~365mm |
| **Hřeben střechy od země** | ~2355mm (přední okap) |
| **Okap vzadu od země** | ~1730mm |
| **Vnitřní výška vpředu** | ~1815mm (stojí se s mírným předklonem) |
| **Vnitřní výška vzadu** | ~1190mm (hřady, hnízda) |
| **Sklon střechy** | ~18° (625mm pokles na 1875mm) |

---

## 12. SOUHRN MATERIÁLU

### Deskový materiál

| Materiál | Rozměr | Ks | Použití |
|---|---|---|---|
| OSB 3 P+D 15mm | 625×2500 | 3 | Podlaha |
| OSB 3 P+D 12mm | 625×2500 | 11 | Stěny (přední 3, zadní 2, boční 2×3) |
| OSB 3 P+D 12mm | 625×2500 | 4 | Střešní bednění |
| Sololit 3mm | 1220×2750 | 4 | Vnitřní obklad stěn + strop |

### Řezivo

| Profil | Celkem bm | Ks (3m) | Použití |
|---|---|---|---|
| 60×100mm | ~13 bm | 5 | Podlahové nosníky |
| 40×60mm | ~63 bm | ~20 | Sloupky, prahy, krokve, latě |

### Střešní krytina

| Materiál | Plocha | Poznámka |
|---|---|---|
| Trapézový plech T18 pozink | ~8 m² | 3 pásy, délka ~2.6m |

---

## 13. VIZUÁLNÍ SCHÉMA – ŘEZY

### Příčný řez (pohled z boku, řez ve směru X)

```
                              ╱ plech
                           ╱╱╱╱╱╱╱
                        ╱ latě     ╲
Z=2355              ╱ OSB 12mm      ╲
                 ╱ EPS 40mm          ╲
              ╱ sololit strop          ╲ Z=1730
           ╱                             ╲
    ┌─────╱───────────────────────────────╲────┐
    │  ┌──────────────────────────────────────┐│ Z=1990 (přední)
    │  │           VNITŘNÍ PROSTOR            ││
    │  │        2350 × 1725 mm               ││
    │  │        výška: 1815→1190mm            ││
    │  │                                      ││
    │  │  ┌─hřady─┐              ┌─hnízda─┐  ││
    │  │  │       │              │         │  ││
    │  └──┴───────┴──────────────┴─────────┴──┘│ Z=115 (podlaha)
    │     │  OSB 15mm P+D podlaha             ││
    │     │  trámy 60×100                     ││ Z=0
    └─────┴───────────────────────────────────┘│
          │                                    │
    ══════╧════════════════════════════════════╧══ Z=-250 (země)
    PATKA                                    PATKA

    X=0 (přední)                      X=1875 (zadní)
```

### Skladba stěny (řez stěnou)

```
    EXTERIÉR                    INTERIÉR

    ┌──┐┌──────────┐┌─┐
    │  ││          ││ │
    │O ││  EPS 40  ││S│
    │S ││  + 20mm  ││O│
    │B ││vzduch.   ││L│
    │  ││mezera    ││O│
    │12││          ││L│
    │mm││ hranol   ││I│
    │  ││ 40×60    ││T│
    │  ││          ││3│
    └──┘└──────────┘└─┘

    12   60          3  = 75mm celkem
```
