# Mockup sheet: three softer head outlines, each as the C tile and the B mark. Run: python heads.py
import pathlib, re
OUT = pathlib.Path(__file__).parent
FONT = "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800&amp;display=swap');"

HEADS = {
  # 1: natural profile, smooth curves throughout
  "1": dict(d="M122,366 C118,330 86,302 74,256 C58,196 64,124 112,82 C158,42 236,40 276,82 "
             "C302,110 312,144 310,170 C318,184 330,202 334,214 C337,224 330,229 322,230 "
             "C320,238 322,244 320,250 C318,256 314,258 316,264 C318,278 310,290 292,292 "
             "C276,294 268,304 266,320 L264,366 C230,378 160,378 122,366 Z",
           lobes=[(96,120,40),(150,82,40),(76,180,38),(88,236,36),(140,262,30)], cut=260),
  # 2: pictogram, no lips, rounder skull
  "2": dict(d="M128,366 C126,330 96,302 80,258 C60,200 68,122 120,80 C172,40 254,46 292,96 "
             "C312,124 318,156 314,182 C324,196 334,210 336,220 C338,230 328,234 318,236 "
             "C320,252 320,268 312,280 C304,292 288,294 274,296 C270,320 270,346 272,366 C236,378 166,378 128,366 Z",
           lobes=[(104,112,42),(160,78,40),(80,176,40),(92,238,36),(146,266,30)], cut=262),
  # 3: big rounded cranium, short soft neck, friendly
  "3": dict(d="M140,366 C140,334 116,316 100,296 C64,254 56,184 84,130 C116,70 192,44 252,64 "
             "C302,82 326,126 326,170 C326,184 338,200 342,210 C346,220 338,226 330,228 "
             "C330,238 332,248 326,254 C320,260 320,270 316,278 C310,290 296,292 284,292 "
             "C276,300 274,316 276,340 C276,352 278,360 280,366 C240,378 180,378 140,366 Z",
           lobes=[(96,132,42),(156,76,42),(76,196,40),(106,256,36),(160,274,28)], cut=270),
}
SPLIT = 200

def outline(d, n=40):
    """Flatten an M/C/L path into points."""
    toks = re.findall(r"[MCLZ]|-?[\d.]+", d)
    pts, i, cmd = [], 0, None
    while i < len(toks):
        t = toks[i]
        if t in "MCLZ":
            cmd = t; i += 1
            if t == "Z": break
            continue
        if cmd == "M":
            cur = (float(toks[i]), float(toks[i+1])); pts.append(cur); i += 2
        elif cmd == "L":
            cur = (float(toks[i]), float(toks[i+1])); pts.append(cur); i += 2
        elif cmd == "C":
            c = [float(v) for v in toks[i:i+6]]; i += 6
            p0, p1, p2, p3 = cur, c[0:2], c[2:4], c[4:6]
            for k in range(1, n+1):
                u = k / n; a = (1-u)**3; b = 3*u*(1-u)**2; e = 3*u*u*(1-u); f = u**3
                pts.append((a*p0[0]+b*p1[0]+e*p2[0]+f*p3[0], a*p0[1]+b*p1[1]+e*p2[1]+f*p3[1]))
            cur = tuple(p3)
    return pts

def auto_lobes(d, cut, count, r, inset):
    pts = outline(d)
    start = next(j for j, (x, y) in enumerate(pts) if y < cut)
    end = next(j for j, (x, y) in enumerate(pts) if j > start and x >= SPLIT)
    seg = pts[start:end+1]
    L = [0.0]
    for a, b in zip(seg, seg[1:]):
        L.append(L[-1] + ((b[0]-a[0])**2 + (b[1]-a[1])**2) ** .5)
    out = []
    for k in range(count):
        target = L[-1] * (k + .5) / count
        j = min(range(len(L)), key=lambda q: abs(L[q]-target))
        (x0, y0), (x1, y1) = seg[max(j-1, 0)], seg[min(j+1, len(seg)-1)]
        tx, ty = x1-x0, y1-y0; m = (tx*tx+ty*ty) ** .5
        nx, ny = -ty/m, tx/m   # points into the head for this path direction
        out.append((round(seg[j][0]+nx*inset, 1), round(seg[j][1]+ny*inset, 1), r))
    bx = seg[0][0] + 10
    n = 2
    for k in range(n):
        x = bx + (SPLIT - bx) * (k + .5) / n
        out.append((round(x, 1), cut - inset, r))
    return out

for h in HEADS.values():
    h["lobes"] = auto_lobes(h["d"], h["cut"], 4, 44, 30)

def mark(k, head, brain, cut, tri):
    h = HEADS[k]
    lobes = "".join(f'<circle cx="{x}" cy="{y}" r="{r}"/>' for x, y, r in h["lobes"])
    return f'''<path d="{h['d']}" fill="{head}"/>
<g clip-path="url(#L)" fill="{brain}">{lobes}<rect x="0" y="0" width="{SPLIT}" height="{h['cut']-30}" clip-path="url(#H{k})"/></g>
<line x1="{SPLIT}" y1="0" x2="{SPLIT}" y2="400" stroke="{cut}" stroke-width="7" clip-path="url(#H{k})"/>
<circle cx="{SPLIT}" cy="172" r="42" fill="{cut}"/>
<path d="M188,150 L224,172 L188,194 Z" fill="{tri}" stroke="{tri}" stroke-width="7" stroke-linejoin="round"/>'''

defs = f'''<defs>
<linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="400" y2="400"><stop offset="0" stop-color="#2383C4"/><stop offset="1" stop-color="#1B5A96"/></linearGradient>
<linearGradient id="br" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="300"><stop offset="0" stop-color="#3DB39A"/><stop offset="1" stop-color="#1C8FB0"/></linearGradient>
<clipPath id="L"><rect x="-20" y="0" width="{SPLIT}" height="400"/></clipPath>
{"".join(f'<clipPath id="H{k}"><path d="{h["d"]}"/></clipPath>' for k, h in HEADS.items())}
</defs>'''

cols = []
for i, k in enumerate(HEADS):
    x = 60 + i * 480
    tile = mark(k, "#fff", "#9BE3D2", "#1E6FAE", "#fff")
    col = mark(k, "url(#bg)", "url(#br)", "#fff", "url(#br)")
    cols.append(f'''
<text x="{x+190}" y="50" font-family="Montserrat,Arial" font-weight="700" font-size="30" fill="#12304F" text-anchor="middle">{k}</text>
<g transform="translate({x+30},80)"><rect width="320" height="320" rx="72" fill="url(#bg)"/><g transform="translate(22,14) scale(0.68)">{tile}</g></g>
<g transform="translate({x},440)"><g transform="scale(0.62)">{col}</g></g>
<g transform="translate({x+270},470)"><rect width="64" height="64" rx="15" fill="url(#bg)"/><g transform="translate(5,5) scale(0.136)">{tile}</g></g>
<g transform="translate({x+270},560)"><rect width="32" height="32" rx="8" fill="url(#bg)"/><g transform="translate(2.5,2.5) scale(0.068)">{tile}</g></g>''')

W, H = 1500, 700
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><style>{FONT}</style><rect width="{W}" height="{H}" fill="#fff"/>{defs}{"".join(cols)}</svg>'
(OUT / "heads.svg").write_text(svg, encoding="utf-8")
