"""Lesson 4 artwork (Diagnosing ACS); run python art/make_acs_figures.py.

The author's picks from the gate 2 mockup sheets (notes/diagnosing-acs-plan.md, 2026-10-17): 1B a table, 2A three
arteries with the muscle each feeds, 3A one beat on mm paper, 4A the thin filament, 5A one graph of the markers,
6A two joined dots, 7C card pictures with the ECGs on mm paper. Drawn in the slide's own coordinates (1280 x 720
stage, as the mockups were), each viewBox cropped to the part the figure uses. Every ECG is one smooth beat (`ecg`):
rounded P and T waves, a straight QRS. Colours come from the page's tokens, so dark mode follows; concept labels
come from the YAML's slots. No imports from the other figure generators: they write files at import time.
"""
from html import escape
from pathlib import Path
import math
import re

OUT = Path(__file__).resolve().parents[1] / 'content' / 'figures'

# blood, wall, plaque and clot, from the tokens
WALL = 'color-mix(in srgb,var(--bad-bd) 55%,var(--surface))'
BLOOD = 'color-mix(in srgb,var(--bad-solid) 72%,var(--surface))'
PALE = 'var(--bad-bg)'
CLOT = 'color-mix(in srgb,var(--bad-solid) 55%,#000)'
PAPER = 'color-mix(in srgb,var(--bad-bg) 55%,var(--surface))'


def paint(c):
    """A token name (ink, bad-solid) or a whole CSS colour."""
    return c if '(' in c or c.startswith('#') or c == 'none' else 'var(--%s)' % c


def T(x, y, s='', size=22, w=500, fill='text', anchor='start', slot=None, extra=''):
    attr = ' data-slot="%s"' % slot if slot else ''
    return ('<text x="%s" y="%s"%s style="font:%s %spx var(--sans);fill:%s;text-anchor:%s"%s>%s</text>'
            % (_n(x), _n(y), attr, w, size, paint(fill), anchor, extra, escape(str(s))))


def _n(v):
    return ('%.1f' % v).rstrip('0').rstrip('.') if isinstance(v, float) else str(v)


def P(d, color='muted', width=3, extra=''):
    return ('<path d="%s" fill="none" style="stroke:%s" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round"%s/>'
            % (d, paint(color), width, extra))


def R(x, y, w, h, fill, stroke='none', sw=2, rx=0, extra=''):
    return ('<rect x="%s" y="%s" width="%s" height="%s" rx="%s" style="fill:%s;stroke:%s" stroke-width="%s"%s/>'
            % (_n(x), _n(y), _n(w), _n(h), _n(rx), paint(fill), paint(stroke), sw, extra))


def C(cx, cy, r, fill, stroke='none', sw=2, extra=''):
    return ('<circle cx="%s" cy="%s" r="%s" style="fill:%s;stroke:%s" stroke-width="%s"%s/>'
            % (_n(cx), _n(cy), _n(r), paint(fill), paint(stroke), sw, extra))


def beat(n, body, until=None):
    return '<g data-beat="%s"%s>%s</g>' % (n, ' data-until="%s"' % until if until else '', body)


def until(n, body):
    return '<g data-until="%s">%s</g>' % (n, body)


def pill(x, y, label, fam, size=22, solid=True, slot=None, anchor='middle'):
    """A pill around a label; with a slot the page writes the concept's label, `label` only sizes it."""
    w = len(label) * size * .58 + 34
    x0 = x - w / 2 if anchor == 'middle' else x
    bg, ink = ('%s-solid' % fam, 'on-solid') if solid else ('%s-bg' % fam, '%s-ink' % fam)
    edge = 'gray-bd' if fam == 'gray' else '%s-solid' % fam
    return (R(x0, y - size - 8, w, size + 20, bg, edge, 2, (size + 20) / 2)
            + T(x0 + w / 2, y + 2, '' if slot else label, size, 650, ink, 'middle', slot))


def tick(cx, cy, color='np-solid'):
    return P('M%s %s l9 10 l19 -23' % (cx - 13, cy), color, 5)


def strike(x1, x2, y):
    return P('M%s %s H%s' % (x1, y, x2), 'bad-solid', 4)


def save(name, label, body, vb):
    out = ('<svg xmlns="http://www.w3.org/2000/svg" class="scene" viewBox="%s" role="img" aria-label="%s">%s</svg>\n'
           % (vb, escape(label, quote=True), body))
    (OUT / (name + '.svg')).write_text(out, encoding='utf-8')
    print(name)


# ---------- the ECG: one smooth beat, and mm paper ----------
def ecg(x0, y0, mm, st=0.0, kx=None, tall_r=False, wide=False, t_inv=False, saddle=False, pr_dep=False):
    """One beat on a baseline at y0, mm = px per mm up, kx = px per unit across. P and T are rounded humps
    (cubic curves), the QRS straight. st = ST deviation in mm (+ up). Returns (path d, x and y of the J point)."""
    kx = mm * .8 if kx is None else kx

    def p(a, b):
        return '%.1f %.1f' % (x0 + a * kx, y0 + b * mm)
    pr = .6 if pr_dep else 0
    d = 'M%s L%s C%s %s %s L%s L%s' % (p(0, 0), p(6, 0), p(7.5, -2), p(12.5, -2), p(14, 0), p(19, pr), p(20.5, 1.5))
    if wide:   # a broad notched QRS (bundle branch block)
        d += ' L%s L%s L%s L%s' % (p(23, -8.4), p(25, -7), p(27, -14), p(30, 0))
        jx = 30
    elif tall_r:   # a tall R with no S (V1-V3 in a posterior MI)
        d += ' L%s L%s' % (p(22.5, -13), p(25.5, 0))
        jx = 25.5
    else:
        d += ' L%s L%s L%s' % (p(22.5, -14), p(24.5, 3.5), p(25.5, 0))
        jx = 25.5
    j = -st
    if saddle:   # concave ST rising smoothly into the T
        d += ' L%s C%s %s %s C%s %s %s L%s' % (p(jx + .5, j), p(jx + 6, j + .4), p(jx + 9, j - .5), p(jx + 12, j - 2.6),
                                             p(jx + 14, j - 4.2), p(jx + 18, j - 3.6), p(jx + 21, 0), p(jx + 30, 0))
    elif t_inv:
        d += ' L%s L%s C%s %s %s C%s %s %s L%s' % (p(jx + .5, j), p(jx + 5, j), p(jx + 8, j + .5), p(jx + 11, 3.2), p(jx + 14, 3.2),
                                                 p(jx + 17, 3.2), p(jx + 18, .4), p(jx + 20, 0), p(jx + 30, 0))
    else:
        d += ' L%s L%s C%s %s %s C%s %s %s L%s' % (p(jx + .5, j), p(jx + 5, j), p(jx + 8, j), p(jx + 10, j - 3.8), p(jx + 14, j - 3.8),
                                                 p(jx + 17, j - 3.8), p(jx + 18, -.4), p(jx + 20, 0), p(jx + 30, 0))
    return d, x0 + jx * kx, y0 + j * mm


def paper(x, y, w, h, mm):
    """mm paper: small squares, every fifth line heavier."""
    s = R(x, y, w, h, PAPER, 'bad-bd', 1)
    lines = []
    i, xx = 0, x
    while xx <= x + w + .01:
        lines.append('<line x1="%.1f" y1="%s" x2="%.1f" y2="%s" stroke-width="%s"/>' % (xx, y, xx, y + h, 1.3 if i % 5 == 0 else .5))
        xx += mm
        i += 1
    i, yy = 0, y
    while yy <= y + h + .01:
        lines.append('<line x1="%s" y1="%.1f" x2="%s" y2="%.1f" stroke-width="%s"/>' % (x, yy, x + w, yy, 1.3 if i % 5 == 0 else .5))
        yy += mm
        i += 1
    return s + '<g style="stroke:var(--bad-bd)" opacity=".6">%s</g>' % ''.join(lines)


# ---------- the artery ----------
def artery(x, y, w, h=70, crack=False, clot=0.0, flow=True, px=None):
    """A horizontal artery: wall, lumen, a plaque from the top wall at px; clot as a share of what is left open."""
    px = x + w * .45 if px is None else px
    t = 12
    ly, lh = y + t, h - 2 * t
    s = R(x, y, w, h, WALL, 'wall', 2, h / 2) + R(x + 6, ly, w - 12, lh, BLOOD if flow else PALE, 'none', 0, lh / 2)
    ph = lh * .45
    s += ('<path d="M%s %s C%s %s %s %s %s %s C%s %s %s %s %s %s Z" style="fill:var(--sol-bd);stroke:var(--sol-solid)" stroke-width="2"/>'
          % (px - 70, ly, px - 40, ly, px - 30, ly + ph, px, ly + ph, px + 30, ly + ph, px + 40, ly, px + 70, ly))
    if crack:
        s += P('M%s %s L%s %s L%s %s' % (px - 6, ly + ph, px + 2, ly + ph - 10, px - 4, ly + ph - 18), 'sol-ink', 3)
    if clot >= .99:
        s += R(px - 40, ly, 90, lh, CLOT, 'none', 0, lh / 3)
    elif clot:
        ch = (lh - ph) * clot
        s += '<path d="M%s %s C%s %s %s %s %s %s Z" style="fill:%s"/>' % (px - 34, ly + ph - 2, px - 30, ly + ph + ch, px + 30, ly + ph + ch, px + 44, ly + ph - 2, CLOT)
    return s


def muscle(x, y, w, h, fill):
    s = R(x, y, w, h, fill, 'wall', 2, 10)
    return s + ''.join('<line x1="%s" y1="%.1f" x2="%s" y2="%.1f" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>' % (x + 8, y + i * h / 5, x + w - 8, y + i * h / 5) for i in range(1, 5))


def patient(x, y, scale=1.0):
    src = (OUT / 'case-chest-man.svg').read_text(encoding='utf-8')
    body = re.sub(r'^.*?<svg[^>]*>', '', src, flags=re.S)
    body = re.sub(r'</svg>\s*$', '', body)
    return '<g transform="translate(%s %s) scale(%s)">%s</g>' % (x, y, scale, body)


# ---------- the two troponins against the 99th percentile ----------
def pair_axes(x0, y0, w, h, vmax=50, ticks=(0, 10, 20, 30, 40, 50), label_x=None, label_dy=-12):
    s = P('M%s %s H%s' % (x0, y0, x0 + w), 'muted', 2) + P('M%s %s V%s' % (x0, y0, y0 - h), 'muted', 2)
    for v in ticks:
        yy = y0 - v / vmax * h
        s += P('M%s %.1f h-8' % (x0, yy), 'muted', 2) + T(x0 - 14, yy + 6, v, 17, 500, 'muted', 'end')
    s += T(x0 + 10, y0 - h - 14, 'Troponin, ng/L', 17, 500, 'muted')
    ly = y0 - 14 / vmax * h
    s += P('M%s %.1f H%s' % (x0, ly, x0 + w), 'ink', 3, ' stroke-dasharray="10 8"')
    s += T(label_x or x0 + w, ly + label_dy, '99th percentile · 14', 18, 600, 'ink', 'end')
    return s


def pair_dots(x0, y0, h, xa, xb, a, b, col, ink, vmax=50, which='both', later='1 h'):
    """Two troponins joined: the value over each dot, or under it when the dot sits below the 99th percentile."""
    ya, yb = y0 - a / vmax * h, y0 - b / vmax * h
    s = ''
    if which in ('both', 'line'):
        s += P('M%s %.1f L%s %.1f' % (xa, ya, xb, yb), col, 4)
    for xx, yy, v, lab, part in [(xa, ya, a, '0 h', 'a'), (xb, yb, b, later, 'b')]:
        if which == 'both' or which == part or (which == 'line' and part == 'b'):
            ty = yy + 36 if v < 14 else yy - 22
            s += C(xx, yy, 13, col) + T(xx, ty, v, 24, 700, ink, 'middle') + T(xx, y0 + 30, lab, 20, 500, 'muted', 'middle')
    return s


def main():
    # The engine draws an art story at most 860 px wide, so each drawing is laid out about 860 units across
    # (one unit to a pixel on the 1280 x 720 stage), with room at the top right for the Back and Next buttons.

    # 1. Stable angina or ACS? (1B): the two arteries head the columns; the row names stand from the start,
    #    each tap fills a row (NICE CG95 1.2.1.3 for the ACS side)
    rows = [('When', 'On exertion', 'At rest'), ('How long', 'A few minutes', 'Over 15 minutes'),
            ('Pattern', 'Same each time', 'New or worsening'), ('With it', 'Little else', 'Sweating · nausea')]
    ca, cb = 420, 720
    b = T(ca, 40, 'Stable angina', 24, 650, 'ink', 'middle') + T(cb, 40, 'ACS', 24, 650, 'bad-ink', 'middle')
    b += artery(ca - 110, 60, 220, 52) + artery(cb - 110, 60, 220, 52, crack=True, clot=.6)
    for k, (lab, a, c) in enumerate(rows):
        yy = 186 + k * 74
        b += P('M10 %s H850' % (yy - 40), 'border', 2) + T(24, yy, lab, 24, 600, 'muted')
        b += beat(k + 1, T(ca, yy, a, 27, 500, 'text', 'middle') + T(cb, yy, c, 27, 650, 'bad-ink', 'middle'))
    save('acs-compare', 'Stable angina against ACS: when the pain comes, how long it lasts, its pattern and what comes with it', b, '0 0 860 440')

    # 2. One plaque, three outcomes (2A): three arteries, each with the muscle it feeds; the plaque cracks on
    #    the first tap, then one outcome per tap, the clot growing from partly to fully closed
    outs = [('ua', 'Unstable angina', 'sol', .45, 'var(--sol-bd)'), ('nstemi', 'NSTEMI', 'cat', .75, 'color-mix(in srgb,var(--cat-solid) 78%,var(--surface))'),
            ('stemi', 'STEMI', 'bad', 1.0, 'var(--bad-solid)')]
    healthy = 'color-mix(in srgb,var(--bad-bd) 55%,var(--surface))'
    b = ''
    for k, (key, lab, fam, cl, fill) in enumerate(outs):
        x = 10 + k * 290
        b += until(1, artery(x, 70, 260, 84, px=x + 120)) + beat(1, artery(x, 70, 260, 84, crack=True, px=x + 120), until=k + 2)
        b += muscle(x + 40, 190, 180, 140, healthy)
        b += beat(k + 2, artery(x, 70, 260, 84, crack=True, clot=cl, flow=cl < 1, px=x + 120) + muscle(x + 40, 190, 180, 140, fill)
                  + pill(x + 130, 396, lab, fam, 25, slot=key))
    save('acs-plaque', 'Three arteries with the same plaque: it cracks, then a clot partly closes the first two and fully closes the third, and the muscle each feeds suffers more', b, '0 0 860 440')

    # 3. What counts as ST elevation (3A): one beat on mm paper with its J point; the ST rises and is measured;
    #    then the thresholds (ESC 2023 3.2.1)
    mm = 13
    # the baseline on a heavy line of the paper (40 + 20 small squares); the raised ST rests on top of the line
    # two small squares up, its 4 px stroke lifted by half its width so the line is drawn above the grid line
    base = 40 + 20 * mm
    b = paper(10, 40, 494, 390, mm)
    b += P('M10 %s H504' % base, 'muted', 2, ' stroke-dasharray="8 6"')
    for k, st in enumerate([0, 2]):
        d, jx, jy = ecg(22, base, mm, st + (2.0 / mm if st else 0), kx=8.5)
        body = (P(d, 'ink', 4) + C(jx, jy, 9, 'se-solid') + P('M%s %s V%s' % (jx + 2, jy + 12, base + 62), 'se-solid', 2)
                + T(jx + 10, base + 84, 'J point', 20, 650, 'se-ink'))
        if st:
            body += P('M%s %s V%s' % (jx + 28, base, base - st * mm), 'bad-solid', 4) + T(jx + 38, base + 28, '2 mm', 20, 700, 'bad-ink')
        b += until(1, body) if k == 0 else beat(1, body)
    b += beat(2, T(536, 110, 'Two neighbouring leads', 22, 650, 'ink') + T(536, 140, 'II, III, aVF · I, aVL · V1 → V6', 17, 500, 'muted')
              + T(536, 200, 'Other leads', 21, 500, 'text') + pill(800, 200, '1 mm', 'bad', 20, solid=False))
    for k, (a, c) in enumerate([('V2–V3, men ≥ 40', '2 mm'), ('V2–V3, men < 40', '2.5 mm'), ('V2–V3, women', '1.5 mm')]):
        b += beat(3, T(536, 262 + k * 60, a, 21, 500, 'text') + pill(800, 262 + k * 60, c, 'bad', 20, solid=False))
    save('acs-st', 'One beat on mm paper: the J point, the ST raised 2 mm and measured, then the thresholds in two neighbouring leads', b, '0 0 860 440')

    # 4. What troponin is (4A): two actin strands, tropomyosin over the myosin-binding sites, a troponin complex
    #    every seven actins (T on tropomyosin, I on actin, C beside I); calcium on C moves tropomyosin aside,
    #    the sites show and myosin binds (PMC5367448, PMC2693027)
    def filament(on):
        s = ''
        r, x0, n = 19, 330, 18
        for i in range(n):   # the back strand
            s += C(x0 + i * 36 + 18, 418 + 10 * math.sin(i * .45), r, 'color-mix(in srgb,var(--wall) 55%,var(--surface))', 'wall')
        for i in range(n):   # the front strand, each actin with its myosin-binding site
            x, y = x0 + i * 36, 392 - 10 * math.sin(i * .45)
            s += C(x, y, r, 'surface-2', 'wall')
            if on:
                s += C(x, y - 6, 6, CLOT)
        ty = 414 if on else 380   # tropomyosin covers the sites at rest and moves aside with calcium
        s += P('M%s %s ' % (x0 - 20, ty) + ' '.join('L%s %.1f' % (x0 + i * 36, ty - 10 * math.sin(i * .45)) for i in range(n)), 'se-solid', 12, ' stroke-opacity=".9"')
        for cx in (420, 420 + 7 * 36):
            i = round((cx - x0) / 36)
            ytm = ty - 10 * math.sin(i * .45)
            s += '<ellipse cx="%s" cy="%.1f" rx="30" ry="13" style="fill:color-mix(in srgb,var(--se-solid) 62%%,#000)"/>' % (cx, ytm)
            s += T(cx, ytm + 6, 'T', 16, 700, '#fff', 'middle')
            iy = ytm - 52 if on else ytm - 34
            ih = 30 if on else (ytm - 12) - (iy - 16)
            s += R(cx - 14, iy - 16, 28, ih, 'primary', 'none', 0, 12) + T(cx, iy + 4, 'I', 16, 700, '#fff', 'middle')
            s += C(cx + 30, iy - 12, 19, 'par-solid') + T(cx + 30, iy - 6, 'C', 16, 700, '#fff', 'middle')
            if on:
                for dx, dy in [(52, -32), (64, -10), (40, -48)]:
                    s += C(cx + dx, iy + dy, 7, 'hl', 'sol-solid')
        # the filament (x 310 to 961 at its own size) drawn 1.25 times larger, centred on the drawing
        return '<g transform="translate(430 200) scale(1.25) translate(-636 -400)">%s</g>' % s
    b = until(3, filament(False)) + beat(3, filament(True))
    b += beat(1, T(14, 140, 'Actin', 24, 600, 'muted') + T(846, 300, 'Tropomyosin', 24, 600, 'se-ink', 'end'))
    b += beat(2, T(430, 46, 'C binds calcium · I holds actin back · T holds tropomyosin', 22, 600, 'ink', 'middle'))
    b += beat(3, P('M500 420 C503 360 508 300 512 252', 'text', 13) + '<ellipse cx="512" cy="238" rx="24" ry="15" style="fill:var(--text)"/>'
              + T(530, 414, 'Myosin binds', 23, 600, 'ink') + T(700, 96, 'Ca²⁺', 24, 700, 'sol-ink'))
    b += beat(4, R(10, 370, 400, 56, 'se-bg', 'se-bd', 2, 14) + T(210, 405, 'Cardiac I and T: only in heart muscle', 20, 650, 'se-ink', 'middle'))
    save('acs-troponin', 'The thin filament: actin, tropomyosin and a troponin complex; calcium moves tropomyosin aside and myosin binds', b, '0 0 860 440')

    # 5. Markers over time (5A): one graph, a curve per tap; then a second CK-MB rise, how reinfarction was once
    #    found; now a further troponin rise of 20% or more (UDMI 2018). Shapes and order, not hours.
    x0, y0, w, h, days = 60, 360, 780, 300, 14

    def curve(kind, col, second=False):
        pts = []
        for i in range(0, 141):
            d = i / 10
            if kind == 'myo':
                v = .75 * (d / .4) ** 2 * math.exp(2 * (1 - d / .4)) if d > 0 else 0
            elif kind == 'ck':
                dd = d - 4 if second else d
                v = (.8 if second else 1) * (dd ** 3 * math.exp(3 * (1 - dd)) if dd > 0 else 0)
            else:
                v = (1 - math.exp(-d / .5)) * math.exp(-max(0, d - 1.5) / 3.2)
            pts.append((x0 + d / days * w, y0 - v * h))
        if second:
            pts = [p for p in pts if p[0] >= x0 + 3.6 / days * w]
        return P('M' + ' L'.join('%.1f %.1f' % p for p in pts), col, 5)
    b = P('M%s %s H%s M%s %s V%s' % (x0, y0, x0 + w, x0, y0, y0 - h), 'muted', 2)
    for d in [0, 1, 2, 3, 7, 10, 14]:
        b += P('M%.1f %s v8' % (x0 + d / days * w, y0), 'muted', 2) + T(x0 + d / days * w, y0 + 30, d, 18, 500, 'muted', 'middle')
    b += T(x0 + w / 2, y0 + 62, 'Days after the infarct', 19, 500, 'muted', 'middle')
    b += '<text transform="translate(%s %s) rotate(-90)" style="font:500 19px var(--sans);fill:var(--muted);text-anchor:middle">Level in the blood</text>' % (x0 - 26, y0 - h / 2)
    marks = [('myo', 'myoglobin', 'par-solid'), ('ck', 'ckmb', 'test-solid'), ('trop', 'troponin', 'se-solid')]
    for k, (kind, key, col) in enumerate(marks):
        ly = y0 - h + 40 + k * 40
        b += beat(k + 1, curve(kind, col) + P('M%s %s h40' % (x0 + w - 210, ly), col, 6) + T(x0 + w - 158, ly + 8, '', 22, 650, col, slot=key))
    b += beat(4, curve('ck', 'test-solid', True) + T(x0 + 5.1 / days * w, y0 - h * .8 - 24, 'Reinfarction (old test)', 20, 650, 'test-ink', 'middle'))
    b += beat(5, R(x0 + w - 250, y0 - h + 160, 250, 76, 'se-bg', 'se-bd', 2, 14) + T(x0 + w - 125, y0 - h + 192, 'Now: a new troponin', 20, 650, 'se-ink', 'middle')
              + T(x0 + w - 125, y0 - h + 220, 'rise of more than 20%', 20, 650, 'se-ink', 'middle'))
    save('acs-markers', 'Markers over days: myoglobin first, then CK-MB, then troponin for longest; a second CK-MB rise was the old sign of reinfarction', b, '0 30 860 410')

    # 6. One number is not enough (6A): two samples against the 99th percentile, one pattern per tap
    x0, y0, w, h = 60, 380, 780, 320
    b = pair_axes(x0, y0, w, h)
    pats = [(9, 38, 'bad-solid', 'bad-ink', 'Acute injury', 'bad'), (40, 41, 'muted', 'gray-ink', 'Chronic injury', 'gray'),
            (6, 7, 'se-solid', 'se-ink', 'Ruled out', 'se')]
    for k, (a, c, col, ink, verdict, fam) in enumerate(pats):
        # high and flat at 0 h/1 h is the observe zone, so its second sample is the one at 3 h (ESC 2023; c09)
        body = pair_dots(x0, y0, h, 220, 500, a, c, col, ink, later='3 h' if k == 1 else '1 h')
        yv = y0 - c / 50 * h + 8
        body += (R(570, yv - 30, 200, 44, ('%s-solid' % fam) if fam != 'gray' else 'muted', 'none', 0, 22)
                 + T(670, yv, verdict, 21, 650, 'on-solid', 'middle'))
        b += beat(k + 1, body, until=k + 2 if k < 2 else None)
    save('acs-pair', 'Two troponins against the 99th percentile: rising is acute injury, high and flat is chronic, low and flat is ruled out', b, '0 0 860 440')

    # the hook's small figure: his two troponins, 9 then 38, against the 14 line
    x0, y0, w, h = 20, 128, 360, 92
    b = P('M%s %s H%s' % (x0, y0, x0 + w), 'muted', 2)
    ly = y0 - 14 / 50 * h
    b += P('M%s %.1f H%s' % (x0, ly, x0 + w), 'ink', 3, ' stroke-dasharray="10 8"') + T(x0 + w + 16, ly + 9, '99th percentile · 14', 26, 600, 'ink')
    for xx, v, lab in [(110, 9, '0 h'), (300, 38, '1 h')]:
        b += C(xx, y0 - v / 50 * h, 11, 'bad-solid') + T(xx, y0 - v / 50 * h - 18, v, 28, 700, 'bad-ink', 'middle') + T(xx, y0 + 32, lab, 24, 500, 'muted', 'middle')
    b = P('M110 %.1f L300 %.1f' % (y0 - 9 / 50 * h, y0 - 38 / 50 * h), 'bad-solid', 4) + b
    save('acs-hook', 'His troponin: 9 on arrival, below the 14 line; 38 at one hour, above it', b, '0 22 680 146')

    # 12. Back to the hook: his two troponins on the slide 9 figure, the ECG first, then the answer
    x0, y0, w, h = 50, 400, 330, 340
    b = pair_axes(x0, y0, w, h, label_x=x0 + w, label_dy=26)
    b += T(420, 76, 'What is the diagnosis?', 24, 650, 'primary')
    b += beat(1, T(420, 136, 'ST raised?', 21, 600, 'muted') + T(540, 136, 'No · ST depression V4–V6', 21, 600, 'text')
              + pill(420, 190, 'STEMI', 'gray', 20, solid=False, slot='stemi', anchor='start') + strike(412, 520, 182))
    b += beat(2, pair_dots(x0, y0, h, 150, 320, 9, 38, 'bad-solid', 'bad-ink', which='a')
              + T(420, 256, '0 h · 9', 21, 600, 'muted') + T(510, 256, 'below the line: too early', 21, 500, 'text'))
    b += beat(3, pair_dots(x0, y0, h, 150, 320, 9, 38, 'bad-solid', 'bad-ink', which='line')
              + T(420, 296, '1 h · 38', 21, 600, 'muted') + T(510, 296, 'above it, and rising', 21, 650, 'bad-ink'))
    ua_w = len('Unstable angina') * 18 * .58 + 34
    b += beat(4, pill(420, 376, 'NSTEMI', 'cat', 26, slot='nstemi', anchor='start') + tick(588, 364)
              + pill(630, 376, 'Unstable angina', 'gray', 18, solid=False, slot='ua', anchor='start') + strike(622, 638 + ua_w, 369))
    save('acs-solve', 'His ECG shows no ST elevation; his troponin rises from 9, below the 99th percentile, to 38 above it: NSTEMI', b, '0 0 860 440')

    # 7. Card pictures (7C): the ECGs on mm paper, the rest small filled pictures in the slide blue
    def ecg_card(name, label, **kw):
        g = paper(10, 6, 180, 128, 9)
        d, jx, jy = ecg(14, 87, 3.6, kx=2.95, **kw)  # the baseline on a grid line (6 + 9 squares)
        save(name, label, g + P(d, 'primary', 3.5), '-60 0 320 140')
    ecg_card('acs-card-lbbb', 'A broad QRS with its T wave turned down: left bundle branch block', wide=True, t_inv=True)
    ecg_card('acs-card-posterior', 'A tall R wave with ST depression, as in V1 to V3', st=-1.5, tall_r=True)
    ecg_card('acs-card-avr', 'A beat with its ST raised, as in aVR', st=1.5)
    ecg_card('acs-card-peri', 'A beat with concave ST elevation and PR depression', st=1.2, saddle=True, pr_dep=True)
    cx, cy, col = 100, 70, 'primary'
    zig = ' '.join('L%s %s' % (cx + dx, cy + dy) for dx, dy in [(-50, 0), (-40, -40), (-28, 30), (-18, 0), (0, 0), (10, -40), (22, 30), (32, 0), (50, 0), (60, -40), (72, 30), (80, 0)])
    save('acs-card-af', 'A fast, irregular heart rhythm', P('M%s %s %s' % (cx - 80, cy, zig), col, 4), '-60 0 320 140')
    save('acs-card-pe', 'Two lungs with a clot in one',
         '<path d="M90 10 V50 C60 50 30 70 30 120 C50 130 80 120 86 80 Z M110 10 V50 C140 50 170 70 170 120 C150 130 120 120 114 80 Z" style="fill:var(--bad-bg);stroke:var(--primary)" stroke-width="4"/>'
         + C(140, 90, 11, CLOT), '-60 0 320 140')
    spikes = ''.join(P('M%.1f %.1f L%.1f %.1f' % (cx + 34 * math.cos(a), cy + 34 * math.sin(a), cx + 52 * math.cos(a), cy + 52 * math.sin(a)), col, 4)
                     + C(cx + 56 * math.cos(a), cy + 56 * math.sin(a), 6, col) for a in [i * math.pi / 4 for i in range(8)])
    save('acs-card-virus', 'A virus', C(cx, cy, 34, 'np-bg', col, 4) + spikes, '-60 0 320 140')
    save('acs-card-sepsis', 'A thermometer reading high',
         R(cx - 14, 4, 28, 104, 'surface', col, 4, 14) + C(cx, 112, 24, 'bad-solid', col, 4) + R(cx - 6, 40, 12, 70, 'bad-solid'), '-60 0 320 140')
    save('acs-card-ckd', 'A kidney',
         '<path d="M110 10 C40 0 30 130 110 130 C140 130 140 90 120 70 C140 50 140 10 110 10 Z" style="fill:var(--bad-bg);stroke:var(--primary)" stroke-width="4"/>', '-60 0 320 140')
    save('acs-card-tako', 'A heart shaped like a round-bottomed pot with a narrow neck',
         '<path d="M60 20 C10 60 20 130 100 130 C180 130 190 60 140 20 C120 30 110 18 100 16 C90 18 80 30 60 20 Z" style="fill:var(--bad-bg);stroke:var(--primary)" stroke-width="4"/>'
         + P('M76 20 L86 2 M124 20 L114 2', col, 4), '-60 0 320 140')
    save('acs-card-aorta', 'The aortic arch with a tear along its wall',
         P('M40 130 V60 C40 -10 160 -10 160 60 V136', 'primary', 22, ' stroke-opacity=".55"') + P('M148 128 V62 C148 14 110 8 80 12', 'bad-solid', 4), '-60 0 320 140')


if __name__ == '__main__':
    main()
