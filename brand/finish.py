# Mockup sheet: three finishes for the approved G logo (same geometry), at 180/64/32/16 px on light and dark. Run: python finish.py
import pathlib
OUT = pathlib.Path(__file__).parent

G_RING = "M145,65 A56,56 0 1 0 161,105"
BEAT = "M27,105 H77 L84,87 L92,123 L98,105 H103"
PLAY = "M107,90 L131,105 L107,120 Z"
BAR = "M133,105 H161"

def glyph(u, white, teal, extra=""):
    return f'''<path d="{G_RING}" fill="none" stroke="{white}" stroke-width="20" stroke-linecap="round" mask="url(#gap{u})" {extra}/>
<path d="{BEAT}" fill="none" stroke="{white}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" {extra}/>
<path d="{PLAY}" fill="{teal}" stroke="{teal}" stroke-width="7" stroke-linejoin="round" {extra}/>
<path d="{BAR}" stroke="{white}" stroke-width="20" stroke-linecap="round" {extra}/>'''

def gapmask(u):
    return f'<mask id="gap{u}" maskUnits="userSpaceOnUse" x="0" y="0" width="210" height="210"><rect width="210" height="210" fill="#fff"/><path d="M27,105 H77" stroke="#000" stroke-width="19" stroke-linecap="round"/></mask>'

def current(u):
    return f'''<defs><linearGradient id="bg{u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2383C4"/><stop offset="1" stop-color="#1B5A96"/></linearGradient>{gapmask(u)}</defs>
<rect width="210" height="210" rx="48" fill="url(#bg{u})"/>{glyph(u, "#fff", "#9BE3D2")}'''

# 1 Glossy: lit from above, a glass sheen over the top half, a raised white glyph with a soft shadow
def glossy(u):
    return f'''<defs>
<linearGradient id="bg{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3AA0E0"/><stop offset=".55" stop-color="#1E6FB4"/><stop offset="1" stop-color="#154C86"/></linearGradient>
<radialGradient id="glow{u}" cx=".5" cy="1.05" r=".6"><stop offset="0" stop-color="#3FD0C0" stop-opacity=".35"/><stop offset="1" stop-color="#3FD0C0" stop-opacity="0"/></radialGradient>
<linearGradient id="sheen{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".30"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="wg{u}" gradientUnits="userSpaceOnUse" x1="0" y1="45" x2="0" y2="165"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#DCEBF7"/></linearGradient>
<linearGradient id="tg{u}" gradientUnits="userSpaceOnUse" x1="0" y1="88" x2="0" y2="122"><stop offset="0" stop-color="#C4F5E9"/><stop offset="1" stop-color="#5FD3BA"/></linearGradient>
<filter id="lift{u}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#062A4F" flood-opacity=".45"/></filter>
<clipPath id="tile{u}"><rect width="210" height="210" rx="48"/></clipPath>{gapmask(u)}</defs>
<rect width="210" height="210" rx="48" fill="url(#bg{u})"/>
<rect width="210" height="210" rx="48" fill="url(#glow{u})"/>
<g filter="url(#lift{u})">{glyph(u, f"url(#wg{u})", f"url(#tg{u})")}</g>
<path clip-path="url(#tile{u})" d="M0,0 H210 V70 C150,88 60,88 0,70 Z" fill="url(#sheen{u})"/>
<rect x="2" y="2" width="206" height="206" rx="46" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2"/>'''

# 2 Soft depth: matte, the glyph pressed up out of the tile (a darker extrusion under it), no shine
def depth(u):
    ext = "".join(f'<g transform="translate(0,{k})">{glyph(u, "#0F3F6E", "#0F3F6E")}</g>' for k in (6, 4, 2))
    return f'''<defs><linearGradient id="bg{u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2B8AD0"/><stop offset="1" stop-color="#1A5694"/></linearGradient>
<radialGradient id="hi{u}" cx=".25" cy=".15" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>{gapmask(u)}</defs>
<rect width="210" height="210" rx="48" fill="url(#bg{u})"/><rect width="210" height="210" rx="48" fill="url(#hi{u})"/>
<g opacity=".55">{ext}</g>{glyph(u, "#fff", "#9BE3D2")}'''

# 3 Crisp flat: no effects; deeper two-tone tile, the play in full teal, a heavier heartbeat so it survives at 16 px
def crisp(u):
    g = glyph(u, "#fff", "#5EE0C4").replace('stroke-width="7" stroke-linecap="round" stroke-linejoin="round"', 'stroke-width="10" stroke-linecap="round" stroke-linejoin="round"', 1)
    return f'''<defs><linearGradient id="bg{u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1F78BE"/><stop offset="1" stop-color="#123F73"/></linearGradient>{gapmask(u)}</defs>
<rect width="210" height="210" rx="48" fill="url(#bg{u})"/>
<path d="M0,48 A48,48 0 0 1 48,0 H162 A48,48 0 0 1 210,48 V70 C140,40 70,40 0,70 Z" fill="#fff" opacity=".07"/>{g}'''

ROWS = [("Now", current), ("1  Glossy", glossy), ("2  Soft depth", depth), ("3  Crisp flat", crisp)]
n = 0
def icon(fn, x, y, size):
    global n; n += 1
    return f'<svg x="{x}" y="{y}" width="{size}" height="{size}" viewBox="0 0 210 210">{fn(n)}</svg>'

parts = ['<rect x="760" y="0" width="480" height="1000" fill="#0E1826"/>']
for i, (label, fn) in enumerate(ROWS):
    y = 30 + i * 240
    parts.append(f'<text x="30" y="{y+18}" font-family="Segoe UI,Arial" font-weight="700" font-size="20" fill="#56657A">{label}</text>')
    parts.append(icon(fn, 30, y + 34, 180))
    for x, s in ((260, 96), (390, 64), (490, 48), (570, 32), (630, 16)):
        parts.append(icon(fn, x, y + 34 + (180 - s) // 2, s))
    for x, s in ((800, 96), (930, 64), (1030, 48), (1110, 32), (1170, 16)):
        parts.append(icon(fn, x, y + 34 + (180 - s) // 2, s))
W, H = 1240, 1000
(OUT / "finish.svg").write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="#F7F9FC"/>{"".join(parts)}</svg>', encoding="utf-8")
