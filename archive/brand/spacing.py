# Mockup sheet: the MRCP Gafar lettering redrawn on a grid - one width for capitals, one for lowercase,
# and one gap between the ink of every pair of letters. Run: python spacing.py
import math, pathlib, sys
OUT = pathlib.Path(__file__).parent
sys.path.insert(0, str(OUT.parent))
from engine.patterns import lettering

def arc_pt(cx, cy, rx, ry, deg):
    t = math.radians(deg); return cx + rx * math.cos(t), cy + ry * math.sin(t)

def glyph(ch, w):
    """Centreline path for a letter whose stroke centreline spans x 0..w."""
    if ch == "M": return f"M0,100 V6 L{w/2:g},66 L{w:g},6 V100"
    if ch in "RP":
        bx = w - 26
        d = f"M0,100 V4 H{bx:g} A26,25 0 0 1 {bx:g},54 H0"
        return d + (f" M{bx+2:g},54 L{w:g},100" if ch == "R" else "")
    if ch == "C":
        rx, cx = w / 2, w / 2
        x0, y0 = arc_pt(cx, 50, rx, 48, -48); x1, y1 = arc_pt(cx, 50, rx, 48, 48)
        return f"M{x0:.1f},{y0:.1f} A{rx:g},48 0 1 0 {x1:.1f},{y1:.1f}"
    if ch == "G":
        rx, cx = w / 2, w / 2
        x0, y0 = arc_pt(cx, 50, rx, 48, -48); x1, y1 = arc_pt(cx, 50, rx, 48, 2)
        return f"M{x0:.1f},{y0:.1f} A{rx:g},48 0 1 0 {x1:.1f},{y1:.1f} H{w*0.58:.1f}"
    if ch == "a":
        rx = w / 2
        return f"M{w:g},36 V100 M{w:g},68 A{rx:g},32 0 1 1 {w:g},67.9"
    if ch == "f":
        s = w * 0.42
        return f"M{w:g},10 C{w-6:g},0 {s:g},-2 {s:g},24 V100 M0,40 H{w:g}"
    if ch == "r":
        return f"M0,100 V36 M0,70 C0,48 {w*0.4:g},36 {w:g},38"

def ink_width(ch, w):
    return w * (0.5 + 0.5 * math.cos(math.radians(48))) if ch == "C" else w  # the C's open side ends short

def word_svg(caps_w, low_w, gap, weights=(20, 11), colours=("#12304F", "#1F7FBF")):
    groups, x = [], 0
    for i, word in enumerate(["MRCP", "Gafar"]):
        sw = weights[i]; paths = []
        for ch in word:
            w = caps_w if ch.isupper() else low_w
            x += sw / 2                     # the stroke's left half
            paths.append(f'<path transform="translate({x:g},0)" d="{glyph(ch, w)}"/>')
            x += ink_width(ch, w) + sw / 2 + gap
        groups.append(f'<g stroke="{colours[i]}" stroke-width="{sw}">{"".join(paths)}</g>')
        x += 34 - gap                       # the space between the words
    return x - 34, "".join(groups)

def block(inner_w, inner, y, scale, x0=40):
    return (f'<g transform="translate({x0},{y}) scale({scale})" fill="none" stroke-linecap="round" stroke-linejoin="round">{inner}</g>')

V = [("1  Even: capitals 76 wide, lowercase 54, gap 18", (76, 54, 18)),
     ("2  Compact: capitals 68, lowercase 50, gap 15", (68, 50, 15)),
     ("3  Airy: capitals 76, lowercase 54, gap 26", (76, 54, 26))]
parts = []
now = lettering("MRCP Gafar").replace('class="wm-letters"', 'x="40" y="60" height="84"').replace('<g class="wm-caps"', '<g stroke="#12304F"').replace('<g class="wm-name"', '<g stroke="#1F7FBF"')
parts.append('<text x="40" y="44" font-family="Segoe UI" font-weight="700" font-size="20" fill="#56657A">Now</text>' + now)
for i, (label, (cw, lw, gap)) in enumerate(V):
    y = 190 + i * 150
    w, inner = word_svg(cw, lw, gap)
    parts.append(f'<text x="40" y="{y}" font-family="Segoe UI" font-weight="700" font-size="20" fill="#56657A">{label}</text>')
    parts.append(block(w, inner, y + 26, 0.72))
    parts.append(block(w, inner, y + 50, 0.2, x0=860))  # top-bar size
W, H = 1100, 640
(OUT / "spacing.svg").write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="#fff"/>{"".join(parts)}</svg>', encoding="utf-8")
