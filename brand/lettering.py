# Mockup sheet: three custom letterings of "MRCP Gafar", drawn as strokes, beside the approved icon. Run: python lettering.py
import pathlib
OUT = pathlib.Path(__file__).parent
ICON = (OUT.parent / "engine" / "logo.svg").read_text(encoding="utf-8").strip()
NAVY, BLUE, GREY = "#12304F", "#1F7FBF", "#56657A"

# Each glyph: (advance width, path). Caps are 100 tall (y 0 to 100); lowercase x-height from y 36.
def glyphs(fbar="plain"):
    fcross = "M2,40 H38" if fbar == "plain" else "M2,40 H22 L29,22 L37,58 L43,40 H50"
    return {
      "M": (96, "M8,100 V6 L48,66 L88,6 V100"),
      "R": (74, "M8,100 V4 H38 A25,25 0 0 1 38,54 H8 M40,54 L66,100"),
      "C": (92, "M86,20 A48,48 0 1 0 86,80"),
      "P": (70, "M8,100 V4 H38 A25,25 0 0 1 38,54 H8"),
      " ": (34, ""),
      "G": (100, "M86,18 A48,48 0 1 0 98,52 H62"),
      "a": (76, "M66,36 V100 M66,68 A30,32 0 1 1 66,67.9"),
      "f": (44 if fbar == "plain" else 54, "M42,8 C30,-2 14,4 14,26 V100 " + fcross),
      "r": (46, "M8,100 V36 M8,70 C8,48 22,36 42,38"),
    }

def word(text, x, y, size, color, weight, g):
    s = size / 100
    parts, cx = [], 0
    for ch in text:
        adv, d = g[ch]
        if d:
            parts.append(f'<path transform="translate({cx:.1f},0)" d="{d}"/>')
        cx += adv + weight * 0.9
    body = "".join(parts)
    return (f'<g transform="translate({x},{y}) scale({s})" fill="none" stroke="{color}" stroke-width="{weight}" '
            f'stroke-linecap="round" stroke-linejoin="round">{body}</g>', cx * s)

STYLES = [
  ("1  Monoline", dict(caps=13, low=13, cap_col=NAVY, low_col=BLUE, fbar="plain")),
  ("2  Bold caps, light name", dict(caps=20, low=11, cap_col=NAVY, low_col=BLUE, fbar="plain")),
  ("3  As 2, heartbeat in the f", dict(caps=20, low=11, cap_col=NAVY, low_col=BLUE, fbar="beat")),
]
rows = []
for i, (label, st) in enumerate(STYLES):
    y = 40 + i * 260
    g = glyphs(st["fbar"])
    mrcp, w1 = word("MRCP", 250, y + 70, 76, st["cap_col"], st["caps"], g)
    gaf, w2 = word("Gafar", 250 + w1 + 30, y + 70, 76, st["low_col"], st["low"], g)
    rows.append(f'''<text x="40" y="{y+14}" font-family="Segoe UI,Arial" font-weight="700" font-size="20" fill="{GREY}">{label}</text>
<g transform="translate(40,{y+40})"><svg width="170" height="170" viewBox="0 0 210 210">{ICON[ICON.index(">")+1:ICON.rindex("</svg>")]}</svg></g>
{mrcp}{gaf}
<text x="252" y="{y+192}" font-family="Inter,Segoe UI,Arial" font-weight="500" font-size="22" fill="{GREY}" letter-spacing="4">INTERNAL MEDICINE EDUCATION</text>''')
Wd, Ht = 1100, 820
(OUT / "lettering.svg").write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {Wd} {Ht}" width="{Wd}" height="{Ht}"><rect width="{Wd}" height="{Ht}" fill="#fff"/>{"".join(rows)}</svg>', encoding="utf-8")
