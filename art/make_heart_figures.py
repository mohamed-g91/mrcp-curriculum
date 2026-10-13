"""Makes the cardiology lesson 1 drawings in content/figures (python art/make_heart_figures.py).

The heart is the slice across both ventricles chosen on 2026-10-13 (mockup 1C): anterior at the top, the RV on the
left, the lateral wall on the right, the inferior wall at the bottom. Colours are the page's tokens, so the drawings
follow light and dark. Story drawings show their parts beat by beat (data-beat); a part with data-until leaves on
that beat (engine/js/story.js, the art kind)."""
import math
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "content", "figures")
FAM = {"lad": "cat", "lcx": "par", "rca": "se"}
# territories on the LV ring, in SVG degrees (0 = right, 90 = down)
TERR = {"lad": (160, 315), "lcx": (315, 405), "rca": (45, 160)}
WALL = {"anterior": (225, 315), "lateral": (315, 405), "inferior": (45, 135), "septal": (135, 225), "posterior": (20, 70)}


def pt(cx, cy, r, a):
    return cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))


def sector(cx, cy, r1, r2, a1, a2):
    big = 1 if (a2 - a1) % 360 > 180 else 0
    x1, y1 = pt(cx, cy, r2, a1); x2, y2 = pt(cx, cy, r2, a2)
    x3, y3 = pt(cx, cy, r1, a2); x4, y4 = pt(cx, cy, r1, a1)
    return (f"M{x1:.1f} {y1:.1f} A{r2} {r2} 0 {big} 1 {x2:.1f} {y2:.1f} L{x3:.1f} {y3:.1f} "
            f"A{r1} {r1} 0 {big} 0 {x4:.1f} {y4:.1f} Z")


def rv_path(cx, cy, R):
    s = R / 150
    a1x, a1y = pt(cx, cy, R, 128); a2x, a2y = pt(cx, cy, R, 232)
    return (f"M{a2x:.1f} {a2y:.1f} C{cx - 150 * s:.1f} {cy - 175 * s:.1f} {cx - 255 * s:.1f} {cy - 70 * s:.1f} "
            f"{cx - 245 * s:.1f} {cy + 10 * s:.1f} C{cx - 235 * s:.1f} {cy + 95 * s:.1f} {cx - 150 * s:.1f} "
            f"{cy + 165 * s:.1f} {a1x:.1f} {a1y:.1f} A{R} {R} 0 0 1 {a2x:.1f} {a2y:.1f} Z")


def fill(fam):
    return f'fill="var(--{fam}-bg)" stroke="var(--{fam}-solid)" stroke-width="3"'


GREY = 'fill="var(--gray-bg)" stroke="var(--wall)" stroke-width="2.5"'


def slice_base(cx, cy, R, r, gaps=True):
    """The grey slice: the RV crescent, then the LV ring with a thin gap between territories."""
    out = [f'<path d="{rv_path(cx, cy, R)}" {GREY}/>',
           f'<path fill-rule="evenodd" d="M{cx - R} {cy} a{R} {R} 0 1 0 {2 * R} 0 a{R} {R} 0 1 0 {-2 * R} 0 Z '
           f'M{cx - r} {cy} a{r} {r} 0 1 0 {2 * r} 0 a{r} {r} 0 1 0 {-2 * r} 0 Z" {GREY}/>']
    if gaps:
        for a in (160, 315, 45):
            x1, y1 = pt(cx, cy, r, a); x2, y2 = pt(cx, cy, R, a)
            out.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="var(--page)" stroke-width="4"/>')
    return "".join(out)


def territory(cx, cy, R, r, key, rv=False):
    fam = FAM[key]
    a1, a2 = TERR[key]
    out = f'<path d="{sector(cx, cy, r, R, a1, a2)}" {fill(fam)}/>'
    if rv:
        out = f'<path d="{rv_path(cx, cy, R)}" {fill(fam)}/>' + out
    return out


def wall(cx, cy, R, r, name, fam):
    a1, a2 = WALL[name]
    return f'<path d="{sector(cx, cy, r, R, a1, a2)}" {fill(fam)}/>'


DOT_AT = {"lad": 236, "lcx": 340, "rca": 128}


def dot(cx, cy, R, key, on=True):
    x, y = pt(cx, cy, R + 13, DOT_AT[key])
    fam = FAM[key]
    return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="11" fill="{"var(--%s-solid)" % fam if on else "var(--surface)"}" '
            f'stroke="var(--{fam}-solid)" stroke-width="3"/>')


def beat(x, y, w, h, st=0.0, r=1.0, t=0.35, flip=False):
    """One PQRST complex; st, r and t are fractions of h (up is positive)."""
    pts = []
    add = lambda fx, fy: pts.append((x + fx * w, y - fy * h))
    add(0, 0); add(.08, 0)
    for i in range(1, 9):
        add(.08 + .10 * i / 8, .10 * math.sin(math.pi * i / 8))
    add(.24, 0); add(.27, -.06); add(.31, r); add(.35, -.18); add(.38, st); add(.48, st)
    for i in range(1, 13):
        f = i / 12
        add(.48 + .22 * f, st * (1 - f) + t * math.sin(math.pi * f))
    add(.78, 0); add(1, 0)
    if flip:
        pts = [(px, 2 * y - py) for px, py in pts]
    return "M" + " L".join(f"{px:.1f} {py:.1f}" for px, py in pts)


def trace_card(x, y, w, h, label, st, fam, r=1.0, t=.35, flip=False, dashed=False):
    dash = ' stroke-dasharray="8 6"' if dashed else ""
    base = y + h * (.42 if flip else .70)
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="2"{dash}/>'
            f'<text x="{x + 16}" y="{y + 28}" style="text-anchor:start">{label}</text>'
            f'<path d="{beat(x + 22, base, w - 44, h * .40, st=st, r=r, t=t, flip=flip)}" fill="none" '
            f'stroke="var(--{fam}-solid)" stroke-width="3.5" stroke-linejoin="round"/>')


def pill(cx, cy, w, fam, slot=None, text=None):
    inner = f'data-slot="{slot}"' if slot else ""
    return (f'<rect x="{cx - w / 2:.1f}" y="{cy - 22}" width="{w}" height="44" rx="22" fill="var(--{fam}-bg)" stroke="var(--{fam}-solid)" stroke-width="3"/>'
            f'<text x="{cx:.1f}" y="{cy + 7}" {inner} style="fill:var(--{fam}-ink)">{text or ""}</text>')


def svg(name, vb, label, body):
    # the story drawings share the story's shape (about 2 : 1): the 760 × 420 drawing sits in an 860 × 420 box
    if vb == "0 0 760 420":
        vb, body = "0 0 860 420", f'<g transform="translate(50 0)">{body}</g>'
    with open(os.path.join(OUT, name + ".svg"), "w", encoding="utf-8") as f:
        f.write(f'<svg class="scene" viewBox="{vb}" role="img" aria-label="{label}">\n{body}\n</svg>\n')
    print(name)


# ---- slide 2: three arteries, one per tap
CX, CY, R, r = 430, 215, 150, 92
parts = [slice_base(CX, CY, R, r)] + [dot(CX, CY, R, k, on=False) for k in ("lad", "lcx", "rca")]
LAB = {"lad": (250, 70), "lcx": (650, 120), "rca": (210, 380)}
for i, k in enumerate(("lad", "lcx", "rca"), 1):
    lx, ly = LAB[k]
    parts.append(f'<g data-beat="{i}">{territory(CX, CY, R, r, k, rv=(k == "rca"))}{dot(CX, CY, R, k)}'
                 f'{pill(lx, ly, 150, FAM[k], slot=k)}</g>')
svg("heart-arteries", "0 0 760 420", "A slice across both ventricles; each coronary artery lights the wall it feeds", "".join(parts))

# ---- slide 4: the mirror. Beat 1: the inferior wall, II below it (ST up), aVL across the heart (ST down);
# beat 2: the posterior wall, V1–V3 at the front (ST down), V7–V9 at the back (ST up)
CX, CY, R, r = 380, 210, 112, 68
parts = [slice_base(CX, CY, R, r, gaps=False)]
parts.append(f'<g data-beat="1" data-until="2">{wall(CX, CY, R, r, "inferior", "se")}'
             f'{trace_card(300, 334, 160, 78, "II", .3, "se")}{trace_card(560, 40, 160, 78, "aVL", -.3, "se", t=.25, dashed=True)}'
             f'<line x1="380" y1="334" x2="380" y2="{CY + r + 20}" stroke="var(--se-solid)" stroke-width="2.5" stroke-dasharray="5 7"/>'
             f'<line x1="560" y1="104" x2="{CX + 70}" y2="{CY - 60}" stroke="var(--wall)" stroke-width="2.5" stroke-dasharray="5 7"/>'
             f'<text x="380" y="{CY + 6}" data-slot="inf"></text></g>')
parts.append(f'<g data-beat="2">{wall(CX, CY, R, r, "posterior", "par")}'
             f'{trace_card(40, 40, 170, 78, "V1–V3", -.28, "par", r=1.25, t=.3, dashed=True)}'
             f'{trace_card(560, 320, 170, 86, "V7–V9", -.28, "par", r=1.25, t=.3, flip=True)}'
             f'<line x1="210" y1="96" x2="{CX - 60}" y2="{CY - 70}" stroke="var(--wall)" stroke-width="2.5" stroke-dasharray="5 7"/>'
             f'<line x1="560" y1="352" x2="{CX + 80}" y2="{CY + 75}" stroke="var(--par-solid)" stroke-width="2.5" stroke-dasharray="5 7"/>'
             f'<text x="380" y="{CY + 6}" data-slot="post"></text></g>')
svg("heart-mirror", "0 0 760 420", "The same injury seen from opposite sides: ST elevation in the leads facing it, ST depression across the heart", "".join(parts))

# ---- slide 5: the right ventricle
CX, CY, R, r = 400, 205, 140, 86
parts = [slice_base(CX, CY, R, r), dot(CX, CY, R, "rca", on=False)]
parts.append(f'<g data-beat="1">{territory(CX, CY, R, r, "rca", rv=True)}{dot(CX, CY, R, "rca")}'
             f'{trace_card(40, 40, 170, 80, "", .3, "se")}<text x="56" y="68" data-slot="v4r" style="text-anchor:start"></text></g>')
parts.append(f'<g data-beat="2">{pill(640, 150, 170, "bad", slot="nogtn")}{pill(640, 230, 170, "ok", slot="fluids")}</g>')
svg("heart-rv", "0 0 760 420", "A proximal RCA blockage starves the right ventricle as well as the inferior wall", "".join(parts))

# ---- slide 6: the slow heart; the RCA's branch to the AV node at the top of the septum, then a slow rhythm
CX, CY, R, r = 330, 200, 140, 86
nx, ny = pt(CX, CY, r + 6, 180)
parts = [slice_base(CX, CY, R, r), dot(CX, CY, R, "rca", on=False)]
rx, ry = pt(CX, CY, R + 13, 128)
parts.append(f'<g data-beat="1">{dot(CX, CY, R, "rca")}'
             f'<path d="M{rx:.1f} {ry:.1f} Q{CX - 150:.1f} {CY + 40:.1f} {nx:.1f} {ny:.1f}" fill="none" stroke="var(--se-solid)" stroke-width="5" stroke-linecap="round"/>'
             f'<circle cx="{nx:.1f}" cy="{ny:.1f}" r="14" fill="var(--se-solid)"/>'
             f'{pill(nx - 10, ny - 150, 150, "se", slot="node")}'
             f'<line x1="{nx - 10:.1f}" y1="{ny - 128:.1f}" x2="{nx:.1f}" y2="{ny - 16:.1f}" stroke="var(--se-solid)" stroke-width="2.5" stroke-dasharray="5 7"/></g>')
strip = "".join(f'<path d="{beat(520 + i * 105, 250, 60, 70)}" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>' for i in range(2))
parts.append(f'<g data-beat="2"><path d="M500 250 H740" stroke="var(--gray-bd)" stroke-width="2"/>{strip}{pill(630, 140, 170, "se", slot="pulse")}</g>')
svg("heart-av", "0 0 760 420", "The RCA feeds the AV node in most hearts, so an inferior MI can slow the pulse", "".join(parts))

# ---- slide 5's cards: one small slice each, its territory shaded
CX, CY, R, r = 130, 95, 70, 43
cards = {"inferior": [("rca", "inferior")], "anterior": [("lad", "anterior"), ("lad", "septal")],
         "lateral": [("lcx", "lateral")], "extensive": [("lad", "anterior"), ("lad", "septal"), ("lcx", "lateral")]}
for name, walls in cards.items():
    body = slice_base(CX, CY, R, r, gaps=False) + "".join(
        wall(CX, CY, R, r, w, FAM["lad"] if name == "extensive" else FAM[k]) for k, w in walls)
    svg(f"heart-card-{name}", "0 0 260 190", f"The {name} territory on a slice of the heart", body)

# ---- the hook: his ECG, the six limb leads in one row (no colour: the stem gives nothing away)
UP, DOWN = {"II", "III", "aVF"}, {"I", "aVL"}
cells = []
for ci, lead in enumerate(["I", "II", "III", "aVR", "aVL", "aVF"]):
    x, y = 6 + ci * 108, 6
    st = .5 if lead in UP else (-.42 if lead in DOWN else 0)
    rr, tt = (-.6, -.3) if lead == "aVR" else (1.0, .35)
    cells.append(f'<rect x="{x}" y="{y}" width="100" height="84" rx="8" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="1.5"/>'
                 f'<text x="{x + 9}" y="{y + 20}" style="font:700 15px var(--sans);fill:var(--text)">{lead}</text>'
                 f'<path d="{beat(x + 8, y + 60, 84, 34, st=st, r=rr, t=tt)}" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>')
svg("ecg-inferior", "0 0 658 96", "His ECG, the six limb leads", "".join(cells))
