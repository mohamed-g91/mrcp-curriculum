"""The heart slice in SVG: one source for the tappable slice (engine/patterns.py, p_heart_slice) and the drawings that
art/make_heart_figures.py writes to content/figures.

The slice cuts across both ventricles, seen from below as on an echo: anterior at the top, the RV on the left, the
lateral wall on the right, the inferior wall at the bottom. The LV ring is split into the five walls the ECG speaks
of (a simplified AHA ring: posterior is roughly the inferolateral segment); the RV is the sixth part. Colours are
the page's tokens, so the drawings follow light and dark. Plain string formatting only: build.py runs on older
Pythons too."""
import math

FAM = {"lad": "cat", "lcx": "par", "rca": "se"}
# each part: (from, to) on the LV ring in SVG degrees (0 = right, 90 = down), its artery, its own leads, its mirror
WALLS = [
    ("anterior", "Anterior", (225, 315), "lad", "V3, V4", "II, III, aVF"),
    ("septal", "Septal", (135, 225), "lad", "V1, V2", None),
    ("lateral", "Lateral", (315, 375), "lcx", "I, aVL, V5, V6", "III, aVF"),
    ("posterior", "Posterior", (15, 60), "lcx", "V7–V9", "V1–V3"),
    ("inferior", "Inferior", (60, 135), "rca", "II, III, aVF", "I, aVL"),
]
RV = ("rv", "Right ventricle", None, "rca", "V4R", None)
GREY = 'fill="var(--gray-bg)" stroke="var(--wall)" stroke-width="2.5"'


def pt(cx, cy, r, a):
    return cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))


def sector(cx, cy, r1, r2, a1, a2):
    big = 1 if (a2 - a1) % 360 > 180 else 0
    x1, y1 = pt(cx, cy, r2, a1)
    x2, y2 = pt(cx, cy, r2, a2)
    x3, y3 = pt(cx, cy, r1, a2)
    x4, y4 = pt(cx, cy, r1, a1)
    return ("M%.1f %.1f A%s %s 0 %d 1 %.1f %.1f L%.1f %.1f A%s %s 0 %d 0 %.1f %.1f Z"
            % (x1, y1, r2, r2, big, x2, y2, x3, y3, r1, r1, big, x4, y4))


def ring(cx, cy, R, r):
    """The whole LV ring as one shape (two circles, even-odd)."""
    return ("M%s %s a%s %s 0 1 0 %s 0 a%s %s 0 1 0 %s 0 Z M%s %s a%s %s 0 1 0 %s 0 a%s %s 0 1 0 %s 0 Z"
            % (cx - R, cy, R, R, 2 * R, R, R, -2 * R, cx - r, cy, r, r, 2 * r, r, r, -2 * r))


def rv_path(cx, cy, R):
    s = R / 150.0
    a1x, a1y = pt(cx, cy, R, 128)
    a2x, a2y = pt(cx, cy, R, 232)
    return ("M%.1f %.1f C%.1f %.1f %.1f %.1f %.1f %.1f C%.1f %.1f %.1f %.1f %.1f %.1f A%s %s 0 0 1 %.1f %.1f Z"
            % (a2x, a2y, cx - 150 * s, cy - 175 * s, cx - 255 * s, cy - 70 * s, cx - 245 * s, cy + 10 * s,
               cx - 235 * s, cy + 95 * s, cx - 150 * s, cy + 165 * s, a1x, a1y, R, R, a2x, a2y))


def beat(x, y, w, h, st=0.0, r=1.0, t=0.35, flip=False):
    """One PQRST complex as a path; st, r and t are fractions of h (up is positive)."""
    pts = []

    def add(fx, fy):
        pts.append((x + fx * w, y - fy * h))
    add(0, 0)
    add(.08, 0)
    for i in range(1, 9):
        add(.08 + .10 * i / 8, .10 * math.sin(math.pi * i / 8))
    add(.24, 0)
    add(.27, -.06)
    add(.31, r)
    add(.35, -.18)
    add(.38, st)
    add(.48, st)
    for i in range(1, 13):
        f = i / 12.0
        add(.48 + .22 * f, st * (1 - f) + t * math.sin(math.pi * f))
    add(.78, 0)
    add(1, 0)
    if flip:
        pts = [(px, 2 * y - py) for px, py in pts]
    return "M" + " L".join("%.1f %.1f" % p for p in pts)


def wide_beat(x, y, w, h):
    """A wide, slow ventricular escape complex."""
    return ("M%.1f %.1f H%.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f H%.1f"
            % (x, y, x + w * .25, x + w * .33, y - h, x + w * .55, y + h * .3, x + w * .7, y, x + w))


def slice_parts(cx, cy, R, r):
    """The grey slice, each part its own path with data-part, the thin page-coloured lines between the walls,
    and LV and RV named. Returns (parts by name, the rest)."""
    parts = {"rv": '<path data-part="rv" d="%s" %s/>' % (rv_path(cx, cy, R), GREY)}
    for key, _, (a1, a2), _, _, _ in WALLS:
        parts[key] = '<path data-part="%s" d="%s" %s/>' % (key, sector(cx, cy, r, R, a1, a2), GREY)
    lines = ""
    for a in (135, 225, 315, 15, 60):
        x1, y1 = pt(cx, cy, r, a)
        x2, y2 = pt(cx, cy, R, a)
        lines += ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="var(--page)" stroke-width="4" pointer-events="none"/>'
                  % (x1, y1, x2, y2))
    s = R / 150.0
    names = ('<text x="%.1f" y="%.1f" class="hs-name">LV</text><text x="%.1f" y="%.1f" class="hs-name">RV</text>'
             % (cx, cy + 9 * s, cx - 200 * s, cy + 9 * s))
    return parts, lines + names
