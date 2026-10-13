"""Makes the cardiology lesson 1 drawings in content/figures (python art/make_heart_figures.py).

The slice geometry is shared with the tappable slice (engine/heartsvg.py). Story drawings show their parts beat by
beat (data-beat) and may drop a part on a later beat (data-until); see the art kind in engine/js/story.js. Colours are
the page's tokens, so the drawings follow light and dark. Story drawings are 860 × 420, the story's own shape."""
import os
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, ROOT)
from engine.heartsvg import WALLS, FAM, GREY, pt, sector, ring, rv_path, beat, wide_beat  # noqa: E402

OUT = os.path.join(ROOT, "content", "figures")
WALL = dict((k, (a, art)) for k, _, a, art, _, _ in WALLS)


def svg(name, vb, label, body):
    with open(os.path.join(OUT, name + ".svg"), "w", encoding="utf-8") as f:
        f.write('<svg class="scene" viewBox="%s" role="img" aria-label="%s">\n%s\n</svg>\n' % (vb, label, body))
    print(name)


def grey_slice(cx, cy, R, r, rv=True):
    out = ('<path d="%s" %s/>' % (rv_path(cx, cy, R), GREY)) if rv else ""
    out += '<path fill-rule="evenodd" d="%s" %s/>' % (ring(cx, cy, R, r), GREY)
    for a in (135, 225, 315, 15, 60):
        x1, y1 = pt(cx, cy, r, a)
        x2, y2 = pt(cx, cy, R, a)
        out += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="var(--page)" stroke-width="3"/>' % (x1, y1, x2, y2)
    return out


def lit(cx, cy, R, r, key, fam=None, cls=""):
    (a1, a2), art = WALL[key]
    fam = fam or FAM[art]
    c = ' class="%s"' % cls if cls else ""
    return '<path%s d="%s" fill="var(--%s-bg)" stroke="var(--%s-solid)" stroke-width="3"/>' % (c, sector(cx, cy, r, R, a1, a2), fam, fam)


def pill(cx, cy, w, fam, label, strike=False):
    out = ('<rect x="%.1f" y="%d" width="%d" height="44" rx="22" fill="var(--%s-bg)" stroke="var(--%s-solid)" stroke-width="3"/>'
           '<text x="%.1f" y="%d" style="fill:var(--%s-ink)">%s</text>' % (cx - w / 2.0, cy - 22, w, fam, fam, cx, cy + 7, fam, label))
    if strike:
        out += '<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="var(--%s-solid)" stroke-width="3"/>' % (cx - w / 2.0 + 14, cy, cx + w / 2.0 - 14, cy, fam)
    return out


def arrow(x1, y1, x2, y2, dash=False, col="var(--muted)"):
    d = ' stroke-dasharray="6 7"' if dash else ""
    return ('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="3"%s marker-end="url(#hf-ar)"/>' % (x1, y1, x2, y2, col, d))


DEFS = ('<defs><marker id="hf-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">'
        '<path d="M0 0 L10 5 L0 10 z" fill="var(--muted)"/></marker></defs>')


def lead_card(x, y, label, st, fam, wide=False):
    path = wide_beat(x + 24, y + 72, 172, 44) if wide else beat(x + 24, y + 72, 172, 34, st=st)
    return ('<rect x="%d" y="%d" width="220" height="96" rx="14" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="2.5"/>'
            '<text x="%d" y="%d" style="text-anchor:start">%s</text>'
            '<path d="%s" fill="none" stroke="var(--%s-solid)" stroke-width="4" stroke-linejoin="round"/>' % (x, y, x + 16, y + 28, label, path, fam))


# ---- slide 6: the right ventricle, right heart | lungs | left heart. Beats: the RV fails; the veins swell (JVP up);
# the lungs stay clear; the LV runs dry (BP down); V4R; what to do and what to avoid
def half(cx, cy, k, label, fill="var(--gray-bg)", bd="var(--wall)"):
    return ('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" rx="%.0f" fill="%s" stroke="%s" stroke-width="3"/>'
            '<path d="M%.0f %.0f H%.0f C%.0f %.0f %.0f %.0f %.0f %.0f C%.0f %.0f %.0f %.0f %.0f %.0f Z" fill="%s" stroke="%s" stroke-width="3"/>'
            '<text x="%.0f" y="%.0f">%s</text>'
            % (cx - 58 * k, cy - 100 * k, 116 * k, 66 * k, 26 * k, fill, bd,
               cx - 66 * k, cy - 26 * k, cx + 66 * k, cx + 66 * k, cy + 58 * k, cx + 16 * k, cy + 100 * k, cx, cy + 116 * k,
               cx - 16 * k, cy + 100 * k, cx - 66 * k, cy + 58 * k, cx - 66 * k, cy - 26 * k, fill, bd, cx, cy + 40 * k, label))


def lungs(cx, cy):
    return ('<path d="M%d %d C%d %d %d %d %d %d C%d %d %d %d %d %d Z" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="3"/>'
            '<path d="M%d %d C%d %d %d %d %d %d C%d %d %d %d %d %d Z" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="3"/>'
            '<path d="M%d %d V%d" stroke="var(--gray-bd)" stroke-width="5"/>'
            % (cx - 10, cy - 60, cx - 80, cy - 70, cx - 105, cy + 25, cx - 80, cy + 70, cx - 50, cy + 88, cx - 18, cy + 70, cx - 10, cy + 42,
               cx + 10, cy - 60, cx + 80, cy - 70, cx + 105, cy + 25, cx + 80, cy + 70, cx + 50, cy + 88, cx + 18, cy + 70, cx + 10, cy + 42,
               cx, cy - 96, cy - 52))


VEIN = "#6F7FB0"
rv = [DEFS,
      # the veins coming up into the right heart: thin, then swollen
      '<g data-until="2"><path d="M60 400 V250 Q60 205 110 205" fill="none" stroke="%s" stroke-width="12" stroke-linecap="round"/></g>' % VEIN,
      '<g data-beat="2"><path d="M60 400 V250 Q60 205 110 205" fill="none" stroke="%s" stroke-width="28" stroke-linecap="round"/>%s</g>'
      % (VEIN, pill(68, 150, 120, "bad", "JVP ↑")),
      '<g data-until="1">%s</g>' % half(190, 230, 1, "RV"),
      '<g data-beat="1">%s</g>' % half(190, 230, 1, "RV", "var(--se-bg)", "var(--se-solid)"),
      '<g data-until="3">%s%s</g>' % (arrow(265, 160, 330, 160), arrow(530, 160, 595, 160)),
      lungs(430, 200),
      '<g data-beat="3">%s%s%s</g>' % (arrow(265, 160, 330, 160, dash=True), arrow(530, 160, 595, 160, dash=True), pill(430, 330, 170, "ok", "Lungs clear")),
      '<g data-until="4">%s%s</g>' % (half(680, 230, 1, "LV"), arrow(680, 352, 680, 398)),
      '<g data-beat="4">%s%s%s</g>' % (half(680, 236, .78, "LV"), arrow(680, 335, 680, 380, col="var(--bad-solid)"), pill(780, 380, 110, "bad", "BP ↓")),
      '<g data-beat="5">%s</g>' % lead_card(540, 10, "V4R", .3, "se"),
      '<g data-beat="6">%s%s%s%s</g>' % (pill(150, 30, 150, "ok", "IV fluids"), pill(330, 30, 170, "ok", "Reperfusion"),
                                        pill(150, 84, 150, "bad", "Nitrates", True), pill(330, 84, 160, "bad", "Diuretics", True))]
svg("heart-rv", "0 0 860 420", "The right heart, the lungs and the left heart in a row: the RV fails, blood dams back, the lungs stay clear and the LV runs dry", "".join(rv))


# ---- slide 7: MI and bradycardia. First tap: inferior MI, the RCA's AV node, a narrow escape that usually passes;
# second tap: anterior MI, the septum's bundle branches, a wide escape that needs pacing
def conduction(cx, cy, k):
    heart = ('M%.0f %.0f C%.0f %.0f %.0f %.0f %.0f %.0f C%.0f %.0f %.0f %.0f %.0f %.0f C%.0f %.0f %.0f %.0f %.0f %.0f C%.0f %.0f %.0f %.0f %.0f %.0f Z'
             % (cx, cy - 170 * k, cx - 120 * k, cy - 170 * k, cx - 190 * k, cy - 90 * k, cx - 170 * k, cy + 30 * k,
                cx - 150 * k, cy + 150 * k, cx - 50 * k, cy + 230 * k, cx + 20 * k, cy + 270 * k,
                cx + 120 * k, cy + 210 * k, cx + 210 * k, cy + 130 * k, cx + 200 * k, cy + 10 * k,
                cx + 190 * k, cy - 100 * k, cx + 120 * k, cy - 170 * k, cx, cy - 170 * k))
    branches = ('M%.0f %.0f V%.0f M%.0f %.0f Q%.0f %.0f %.0f %.0f M%.0f %.0f Q%.0f %.0f %.0f %.0f'
                % (cx, cy - 15 * k, cy + 40 * k, cx, cy + 40 * k, cx - 40 * k, cy + 120 * k, cx - 80 * k, cy + 190 * k,
                   cx, cy + 40 * k, cx + 50 * k, cy + 120 * k, cx + 100 * k, cy + 180 * k))
    base = ('<path d="%s" fill="var(--gray-bg)" stroke="var(--wall)" stroke-width="3"/>'
            '<circle cx="%.0f" cy="%.0f" r="%.0f" fill="var(--wall)"/>'
            '<path d="%s" fill="none" stroke="var(--wall)" stroke-width="3" stroke-linecap="round"/>'
            '<circle cx="%.0f" cy="%.0f" r="%.0f" fill="var(--wall)"/>'
            % (heart, cx - 80 * k, cy - 120 * k, 9 * k, branches, cx, cy - 30 * k, 14 * k))
    node = '<circle cx="%.0f" cy="%.0f" r="%.0f" fill="var(--se-solid)"/>' % (cx, cy - 30 * k, 15 * k)
    lit_br = '<path d="%s" fill="none" stroke="var(--cat-solid)" stroke-width="6" stroke-linecap="round"/>' % branches
    return base, node, lit_br


def rhythm(x, y, w, wide=False, col="var(--ink)"):
    out = '<path d="M%d %d H%d" stroke="var(--gray-bd)" stroke-width="2"/>' % (x, y, x + w)
    for i in range(2):
        bx = x + 14 + i * w / 2.0
        p = wide_beat(bx, y, 70, 44) if wide else beat(bx, y, 70, 40)
        out += '<path d="%s" fill="none" stroke="%s" stroke-width="3.5" stroke-linejoin="round"/>' % (p, col)
    return out


base, node, lit_br = conduction(430, 200, .78)
br = [base,
      '<g data-beat="1"><text x="140" y="40">Inferior MI</text>%s%s%s%s%s</g>'
      % (grey_slice(140, 140, 82, 50, rv=False), lit(140, 140, 82, 50, "inferior"), node,
         rhythm(30, 300, 220), pill(140, 362, 250, "ok", "Narrow · usually passes")),
      '<g data-beat="2"><text x="720" y="40">Anterior MI</text>%s%s%s%s%s%s</g>'
      % (grey_slice(720, 140, 82, 50, rv=False), lit(720, 140, 82, 50, "anterior"), lit(720, 140, 82, 50, "septal"), lit_br,
         rhythm(610, 300, 220, wide=True, col="var(--bad-solid)"), pill(720, 362, 250, "bad", "Wide · unstable · pace"))]
svg("heart-brady", "0 0 860 420", "Bradycardia after MI: the AV node in inferior MI, the bundle branches in anterior MI", "".join(br))


# ---- slide 8: back to the hook, as an algorithm. The stem on the left lights as each step uses it:
# leads, then wall, then artery; then the two supporting clues point up into the artery
STEM = ["A 62-year-old man,", "40 minutes of chest pain.", ("p", "Pulse 42,"), ("b", "BP 88/56 mmHg,"),
        ("b", "JVP raised, chest clear."), ("l", "ST elevation in II, III, aVF;"), "ST depression in I and aVL."]
HL = {"l": 1, "p": 4, "b": 5}
al = [DEFS, '<rect x="4" y="20" width="380" height="380" rx="18" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="2"/>']
for i, line in enumerate(STEM):
    y = 72 + i * 48
    key, words = (line if isinstance(line, tuple) else (None, line))
    if key:
        al.append('<g data-beat="%d"><rect x="24" y="%d" width="%d" height="36" rx="8" fill="var(--hl)"/></g>' % (HL[key], y - 26, int(len(words) * 11.2) + 12))
    al.append('<text x="30" y="%d" style="text-anchor:start;font-weight:500;fill:var(--text)">%s</text>' % (y, words))
steps = [("1", "Leads", "II, III, aVF", None), ("2", "Wall", "Inferior", None), ("3", "Artery", "RCA", "se")]
for i, (n, k, v, fam) in enumerate(steps):
    y = 30 + i * 92
    fill, bd, ink = (("var(--se-bg)", "var(--se-solid)", "var(--se-ink)") if fam else ("var(--surface)", "var(--gray-bd)", "var(--ink)"))
    g = ('<circle cx="430" cy="%d" r="18" fill="var(--ink)"/><text x="430" y="%d" style="fill:var(--surface);font-size:16px">%s</text>'
         '<text x="464" y="%d" style="text-anchor:start;fill:var(--muted)">%s</text>'
         '<rect x="560" y="%d" width="270" height="58" rx="14" fill="%s" stroke="%s" stroke-width="2.5"/>'
         '<text x="695" y="%d" style="fill:%s">%s</text>' % (y + 29, y + 35, n, y + 35, k, y, fill, bd, y + 36, ink, v))
    if i < 2:
        g += arrow(695, y + 60, 695, y + 88)
    al.append('<g data-beat="%d">%s</g>' % (i + 1, g))
al.append('<g data-beat="4"><rect x="440" y="320" width="190" height="80" rx="14" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="2.5"/>'
          '<text x="535" y="352">Pulse 42</text><text x="535" y="380" style="font-weight:500;fill:var(--muted);font-size:16px">AV node</text>%s</g>'
          % arrow(560, 318, 640, 250))
al.append('<g data-beat="5"><rect x="650" y="320" width="205" height="80" rx="14" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="2.5"/>'
          '<text x="752" y="352" style="font-size:16px">BP ↓, JVP ↑, clear</text><text x="752" y="380" style="font-weight:500;fill:var(--muted);font-size:16px">RV infarct</text>%s</g>'
          % arrow(752, 318, 752, 250))
svg("heart-algorithm", "0 0 860 420", "The hook solved step by step: leads, wall, artery, then the supporting clues", "".join(al))

# ---- slide 5's cards: one small slice each; its territory grey until the card opens (class fig-lit)
CX, CY, R, r = 130, 95, 70, 43
cards = {"inferior": ["inferior"], "anterior": ["anterior", "septal"], "lateral": ["lateral"], "extensive": ["anterior", "septal", "lateral"]}
for name, walls in cards.items():
    body = grey_slice(CX, CY, R, r) + "".join(lit(CX, CY, R, r, w, "cat" if name == "extensive" else None, "fig-lit") for w in walls)
    svg("heart-card-" + name, "0 0 260 190", "A slice of the heart with one territory marked", body)

# ---- the hook: his ECG, the six limb leads in one row (no colour: the stem gives nothing away)
UP, DOWN = {"II", "III", "aVF"}, {"I", "aVL"}
cells = []
for ci, lead in enumerate(["I", "II", "III", "aVR", "aVL", "aVF"]):
    x, y = 6 + ci * 108, 6
    st = .5 if lead in UP else (-.42 if lead in DOWN else 0)
    rr, tt = (-.6, -.3) if lead == "aVR" else (1.0, .35)
    cells.append('<rect x="%d" y="%d" width="100" height="84" rx="8" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="1.5"/>'
                 '<text x="%d" y="%d" style="font:700 15px var(--sans);fill:var(--text)">%s</text>'
                 '<path d="%s" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>'
                 % (x, y, x + 9, y + 20, lead, beat(x + 8, y + 60, 84, 34, st=st, r=rr, t=tt)))
svg("ecg-inferior", "0 0 658 96", "His ECG, the six limb leads", "".join(cells))

# drawings this script no longer makes
for old in ("heart-arteries", "heart-mirror", "heart-av"):
    path = os.path.join(OUT, old + ".svg")
    if os.path.exists(path):
        os.remove(path)
        print("removed", old)
