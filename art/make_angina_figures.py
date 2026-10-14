"""Makes the cardiology lesson 2 drawings in content/figures (python art/make_angina_figures.py): Is it angina?

The two patients of the hook and their ECGs, and the story drawings (860 x 420, parts joining beat by beat with
data-beat; see the art kind in engine/js/story.js). Colours are the page's tokens, so the drawings follow light and
dark; the patients are flat cartoons in the style of the case figures. Options chosen by the user on 2026-10-14
(notes/angina-diagnosis-plan.md): hook C, supply and demand B, features A, normal angiogram A."""
import math
import os
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, ROOT)
from engine.heartsvg import beat  # noqa: E402

OUT = os.path.join(ROOT, "content", "figures")


def svg(name, vb, label, body, cls="scene"):
    body = body.replace("ag-ar", "ag-ar-" + name)  # each drawing's arrowhead its own id
    with open(os.path.join(OUT, name + ".svg"), "w", encoding="utf-8") as f:
        f.write('<svg class="%s" viewBox="%s" role="img" aria-label="%s">\n%s\n</svg>\n' % (cls, vb, label, body))
    print(name)


DEFS = ('<defs><marker id="ag-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">'
        '<path d="M0 0 L10 5 L0 10 z" fill="var(--muted)"/></marker></defs>')


def arrow(x1, y1, x2, y2):
    return '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="var(--muted)" stroke-width="3" marker-end="url(#ag-ar)"/>' % (x1, y1, x2, y2)


def t(x, y, s, size=18, weight=750, fill=None, anchor="middle"):
    st = "font-size:%dpx;font-weight:%d;text-anchor:%s" % (size, weight, anchor)
    if fill:
        st += ";fill:" + fill
    return '<text x="%s" y="%s" style="%s">%s</text>' % (x, y, st, s)


def box(cx, y, w, h, label, fam=None, sub=None, size=18):
    fill, bd, ink = (("var(--%s-bg)" % fam, "var(--%s-solid)" % fam, "var(--%s-ink)" % fam) if fam
                     else ("var(--surface)", "var(--gray-bd)", "var(--ink)"))
    out = '<rect x="%.1f" y="%d" width="%d" height="%d" rx="14" fill="%s" stroke="%s" stroke-width="2.5"/>' % (cx - w / 2.0, y, w, h, fill, bd)
    if sub:
        out += t(cx, y + h / 2.0 - 4, label, size, 750, ink) + t(cx, y + h / 2.0 + 18, sub, 14, 550, "var(--muted)")
    else:
        out += t(cx, y + h / 2.0 + 6, label, size, 750, ink)
    return out


def tick(cx, cy, on=True, r=13):
    if on:
        return ('<circle cx="%d" cy="%d" r="%d" fill="var(--primary)"/>'
                '<path d="M%d %d l5 5 l9 -10" fill="none" stroke="var(--on-primary)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
                % (cx, cy, r, cx - 7, cy, ))
    return '<circle cx="%d" cy="%d" r="%d" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="2.5"/>' % (cx, cy, r)


# ---- the two patients, head and shoulders, a hand flat on the chest (flat cartoons, like the case figures)
def pain(cx, cy, r):
    return "".join('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#D85A30" stroke-width="3" stroke-linecap="round"/>'
                   % (cx + r * math.cos(a), cy + r * math.sin(a), cx + (r + 9) * math.cos(a), cy + (r + 9) * math.sin(a))
                   for a in [k * math.pi / 4 for k in range(8)])


def patient(name, label, skin, shirt, hair, woman=False, glasses=False):
    long_hair = ('<path class="sc-o" d="M48 60 C44 104 54 118 64 120 L96 120 C106 118 116 104 112 60 Z" fill="%s"/>' % hair) if woman else ""
    specs = ('<circle cx="70" cy="66" r="8" fill="none" stroke="#22303F" stroke-width="2.5"/><circle cx="90" cy="66" r="8" fill="none" stroke="#22303F" stroke-width="2.5"/>'
             '<line x1="78" y1="66" x2="82" y2="66" stroke="#22303F" stroke-width="2.5"/>') if glasses else \
        '<circle cx="71" cy="66" r="3" fill="#22303F"/><circle cx="89" cy="66" r="3" fill="#22303F"/>'
    body = ('<g class="sc-pop" style="--i:0">%s'
            '<path class="sc-o" d="M26 200 C26 122 50 112 80 112 C110 112 134 122 134 200 Z" fill="%s"/>'
            '<rect class="sc-o" x="72" y="86" width="16" height="18" rx="4" fill="%s"/>'
            '<circle class="sc-o" cx="80" cy="64" r="28" fill="%s"/>'
            '<path class="sc-o" d="M52 62 C50 38 70 30 82 32 C100 34 110 46 108 62 C98 50 70 48 52 62 Z" fill="%s"/>%s'
            '<path d="M72 82 Q80 77 88 82" fill="none" stroke="#22303F" stroke-width="2.5" stroke-linecap="round"/>'
            # the arm across the body, the hand flat on the sternum
            '<path class="sc-o" d="M120 200 C126 168 118 150 96 150 L92 164 C104 166 106 178 100 200 Z" fill="%s"/>'
            '<ellipse class="sc-o" cx="88" cy="155" rx="15" ry="11" fill="%s"/>%s</g>'
            % (long_hair, shirt, skin, skin, hair, specs, shirt, skin, pain(62, 152, 9)))
    svg(name, "0 0 160 200", label, body, "scene scene-case")


patient("case-chest-man", "A man in his sixties with a hand on his chest", "#F1CBA7", "#3D7CC9", "#B9BEC6", glasses=True)
patient("case-chest-woman", "A woman in her fifties with a hand on her chest", "#A8724F", "#C2557E", "#2B1D14", woman=True)


# ---- the hook's resting ECGs, V4 to V6 (no colour: the stem gives nothing away)
def leads(name, label, tw):
    cells = []
    for ci, lead in enumerate(["V4", "V5", "V6"]):
        x, y = 6 + ci * 108, 6
        cells.append('<rect x="%d" y="%d" width="100" height="84" rx="8" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="1.5"/>'
                     '<text x="%d" y="%d" style="font:700 15px var(--sans);fill:var(--text)">%s</text>'
                     '<path d="%s" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>'
                     % (x, y, x + 9, y + 20, lead, beat(x + 8, y + 60, 84, 34, st=0, r=1.0, t=tw)))
    svg(name, "0 0 334 96", label, "".join(cells))


leads("ecg-v4v6-normal", "His resting ECG, V4 to V6", .35)
leads("ecg-v4v6-tinv", "Her resting ECG, V4 to V6", -.35)


# ---- slide 2: supply and demand. A heart with its LAD and a plaque, and a zoom on the narrowing.
# At rest the muscle needs 2 and gets 2; on the hill it needs 4, the narrowing still lets 2 through, and the wall
# beyond it goes short (the arrows match the numbers: the user, 2026-10-14)
HEART = "M-10 -150 C90 -170 175 -105 165 -5 C155 90 60 160 -45 195 C-125 145 -175 60 -165 -30 C-155 -110 -85 -150 -10 -150 Z"
LAD = "M15 -145 C25 -70 10 50 -45 192"


def heart(cx, cy, sc, short, uid):
    out = '<g transform="translate(%d %d) scale(%.2f)"><clipPath id="%s"><path d="%s"/></clipPath>' % (cx, cy, sc, uid, HEART)
    for d, w in (("M-62 -128 Q-80 -200 -140 -205", 30), ("M-15 -140 L-15 -195 Q-15 -250 50 -250 Q118 -250 120 -195 L120 -160", 34)):
        out += ('<path d="%s" fill="none" stroke="var(--wall)" stroke-width="%d" stroke-linecap="round"/>'
                '<path d="%s" fill="none" stroke="var(--gray-bg)" stroke-width="%d" stroke-linecap="round"/>' % (d, w, d, w - 8))
    out += '<path d="%s" fill="var(--gray-bg)" stroke="var(--wall)" stroke-width="4"/>' % HEART
    if short:
        out += ('<g clip-path="url(#%s)"><path d="M18 -60 C12 50 -40 190 -45 200 L200 200 L200 -60 Z" fill="var(--cat-bg)"/>%s</g>'
                % (uid, "".join('<line x1="%d" y1="200" x2="%d" y2="-60" stroke="var(--cat-bd)" stroke-width="3"/>' % (20 + k * 26, 60 + k * 26) for k in range(8))))
    out += '<path d="%s" fill="none" stroke="var(--cat-solid)" stroke-width="10" stroke-linecap="round"/>' % LAD
    out += '<ellipse cx="21" cy="-88" rx="11" ry="20" fill="var(--sol-bg)" stroke="var(--sol-solid)" stroke-width="3"/>'
    return out + "</g>"


def flow(x, y, n, gap=24):
    return "".join('<path d="M%d %d l14 0 m-6 -6 l6 6 l-6 6" fill="none" stroke="var(--cat-solid)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
                   % (x + k * gap, y) for k in range(n))


def zoom(cx, cy, need, uid):
    out = '<clipPath id="%s"><circle cx="%d" cy="%d" r="88"/></clipPath>' % (uid, cx, cy)
    out += '<circle cx="%d" cy="%d" r="92" fill="var(--surface)" stroke="var(--muted)" stroke-width="3"/><g clip-path="url(#%s)">' % (cx, cy, uid)
    out += '<rect x="%d" y="%d" width="200" height="60" fill="var(--cat-bg)" stroke="var(--cat-solid)" stroke-width="3"/>' % (cx - 100, cy - 30)
    out += '<path d="M%d %d Q%d %d %d %d Z" fill="var(--sol-bg)" stroke="var(--sol-solid)" stroke-width="3"/>' % (cx - 22, cy - 30, cx, cy + 10, cx + 22, cy - 30)
    # what arrives before the narrowing, and what gets through it
    out += flow(cx - 84, cy + 14, need, 14 if need > 2 else 24) + flow(cx + 34, cy + 14, 2)
    return out + "</g>"


def scene(x0, title, need, short, uid):
    ok = need == 2
    return (t(x0 + 200, 34, title, 22) + heart(x0 + 105, 245, .62, short, uid + "h")
            + '<line x1="%d" y1="190" x2="%d" y2="170" stroke="var(--muted)" stroke-width="2.5" stroke-dasharray="5 6"/>' % (x0 + 128, x0 + 214)
            + zoom(x0 + 300, 170, need, uid + "z")
            + '<rect x="%d" y="296" width="190" height="44" rx="22" fill="var(--%s-bg)" stroke="var(--%s-solid)" stroke-width="2.5"/>' % (x0 + 205, "ok" if ok else "bad", "ok" if ok else "bad")
            + t(x0 + 300, 324, "Needs %d · gets 2" % need, 18, 750, "var(--%s-ink)" % ("ok" if ok else "bad"))
            + t(x0 + 300, 378, "Pulse 70" if ok else "Pulse 130", 16, 600, "var(--muted)"))


sd = ['<g data-beat="1">%s</g>' % scene(10, "At rest", 2, False, "sdr"),
      '<line x1="430" y1="20" x2="430" y2="400" stroke="var(--border)" stroke-width="2" stroke-dasharray="6 8" data-beat="2"/>',
      '<g data-beat="2">%s</g>' % scene(450, "On the hill", 4, True, "sdh")]
svg("angina-supply", "0 0 860 420", "Supply and demand: at rest the narrowed artery carries what the muscle needs; on the hill it cannot",
    "".join(sd))


# ---- slide 3: the three features, a figure in each row, then the count (option A, with figures: the user)
def ic_body(cx, cy):
    out = ('<path d="M%d %d" fill="none"/>' % (cx, cy)
           + '<g transform="translate(%d %d) scale(.42)">'
           '<path d="M-70 70 L-70 -10 Q-70 -40 -40 -45 L-14 -50 L-14 -62 Q-30 -70 -28 -95 Q-26 -120 0 -120 Q26 -120 28 -95 Q30 -70 14 -62 L14 -50 L40 -45 Q70 -40 70 -10 L70 70" fill="var(--surface)" stroke="var(--ink)" stroke-width="6" stroke-linejoin="round"/>'
           '<path d="M-70 -10 L-88 60 M70 -10 L88 60" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>' % (cx, cy + 20))
    for x, y, rx, ry in ((0, -10, 34, 26), (0, -56, 12, 8), (0, -78, 18, 7), (-80, 20, 8, 22), (80, 20, 8, 22)):
        out += '<ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="var(--cat-solid)" opacity=".6"/>' % (x, y, rx, ry)
    return out + "</g>"


def ic_stairs(cx, cy):
    return ('<g transform="translate(%d %d) scale(.5)">'
            '<path d="M-80 60 l0 -30 l40 0 l0 -30 l40 0 l0 -30 l40 0 l0 -30 l40 0" fill="none" stroke="var(--ink)" stroke-width="7" stroke-linejoin="round"/>'
            '<circle cx="-12" cy="-58" r="13" fill="var(--ink)"/>'
            '<path d="M-14 -44 L-18 -10 M-18 -10 L-34 6 M-18 -10 L-2 0 L-4 4 M-16 -36 L-34 -24 M-16 -36 L2 -30" stroke="var(--ink)" stroke-width="8" stroke-linecap="round" fill="none"/></g>' % (cx, cy + 4))


def ic_clock(cx, cy):
    return ('<circle cx="%d" cy="%d" r="24" fill="var(--surface)" stroke="var(--ink)" stroke-width="3"/>'
            '<path d="M%d %d L%d %d L%d %d" fill="none" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>'
            '<path d="M%d %d A24 24 0 0 1 %.1f %.1f" fill="none" stroke="var(--cat-solid)" stroke-width="5"/>'
            '<rect x="%d" y="%d" width="13" height="28" rx="3" fill="var(--se-bg)" stroke="var(--se-solid)" stroke-width="2"/>'
            '<rect x="%d" y="%d" width="9" height="8" rx="2" fill="var(--se-solid)"/>'
            % (cx - 10, cy, cx - 10, cy - 16, cx - 10, cy, cx + 1, cy + 7, cx - 10, cy - 24, cx - 10 + 24 * math.sin(math.radians(30)),
               cy - 24 * math.cos(math.radians(30)), cx + 22, cy - 10, cx + 24, cy - 19))


FEATS = [(ic_body, "Constricting: chest, neck, jaw or arms"), (ic_stairs, "Brought on by exertion"),
         (ic_clock, "Relieved by rest or GTN within 5 minutes")]
TYPES = [("Typical angina", 3, "cat"), ("Atypical angina", 2, "sol"), ("Non-anginal", 1, "se")]
ft = []
for i, (ic, label) in enumerate(FEATS):
    y = 34 + i * 104
    ft.append('<g data-beat="%d"><rect x="6" y="%d" width="520" height="88" rx="14" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="2"/>'
              '%s%s%s</g>' % (i + 1, y, ic(58, y + 44), t(110, y + 51, label, 18, 650, "var(--ink)", "start"), tick(494, y + 44)))
g = ""
for i, (label, n, fam) in enumerate(TYPES):
    y = 34 + i * 104
    g += ('<rect x="548" y="%d" width="300" height="88" rx="14" fill="var(--%s-bg)" stroke="var(--%s-bd)" stroke-width="2.5"/>'
          % (y, fam, fam) + t(568, y + 51, label, 20, 750, "var(--%s-ink)" % fam, "start")
          + "".join(tick(754 + k * 32, y + 44, k < n, 12) for k in range(3)))
g += t(834, y + 81, "1 or 0", 13, 650, "var(--se-ink)", "end")
ft.append('<g data-beat="4">%s</g>' % g)
ft.append('<g data-beat="5"><text x="430" y="384" style="font-size:16px;font-weight:650;fill:var(--muted)">Angina is unlikely if the pain is continuous, unrelated to activity,</text>'
          '<text x="430" y="408" style="font-size:16px;font-weight:650;fill:var(--muted)">brought on by breathing in, or comes with palpitations, dizziness or tingling</text></g>')
svg("angina-features", "0 0 860 420", "The three features of anginal pain, and how many make typical, atypical or non-anginal pain", "".join(ft))


# ---- the patients again, small, inside the story drawings (their case figures, without the pop-in)
def person(name, x, y, sc):
    with open(os.path.join(OUT, name + ".svg"), encoding="utf-8") as f:
        src = f.read()
    inner = src[src.index(">", src.index("<svg")) + 1:src.rindex("</svg>")].replace(' class="sc-pop" style="--i:0"', "")
    return '<g transform="translate(%d %d) scale(%.2f)">%s</g>' % (x, y, sc, inner)


def elbow(x1, y1, x2, y2, label=None, lx=None, ly=None):
    """A square connector: down, across, down, its arrowhead touching the top edge of the box below."""
    ym = (y1 + y2) // 2
    d = ("M%d %d V%d H%d V%d" % (x1, y1, ym, x2, y2 - 2)) if x1 != x2 else ("M%d %d V%d" % (x1, y1, y2 - 2))
    out = '<path d="%s" fill="none" stroke="var(--muted)" stroke-width="3" stroke-linejoin="round" marker-end="url(#ag-ar)"/>' % d
    if label:
        out += t(lx, ly, label, 15, 700, "var(--muted)", "start")
    return out


# small icons for the tests, drawn at the left of their box
def ic_ct(cx, cy):
    return ('<circle cx="%d" cy="%d" r="15" fill="none" stroke="var(--ink)" stroke-width="5"/>'
            '<rect x="%d" y="%d" width="34" height="6" rx="3" fill="var(--ink)"/>' % (cx, cy - 3, cx - 17, cy + 12))


def ic_stress(cx, cy):
    return ('<path d="M%d %d c-10 -10 -24 -2 -18 10 c4 8 18 16 18 16 c0 0 14 -8 18 -16 c6 -12 -8 -20 -18 -10 z" fill="var(--cat-bg)" stroke="var(--cat-solid)" stroke-width="2.5"/>'
            '<path d="M%d %d l5 0 l3 -6 l4 12 l3 -6 l5 0" fill="none" stroke="var(--cat-solid)" stroke-width="2.5" stroke-linejoin="round"/>'
            % (cx, cy - 6, cx - 10, cy + 2))


def ic_cath(cx, cy):
    return ('<path d="M%d %d C%d %d %d %d %d %d" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>'
            '<circle cx="%d" cy="%d" r="4" fill="var(--ink)"/>' % (cx - 16, cy + 14, cx - 6, cy - 16, cx + 12, cy - 16, cx + 14, cy - 4, cx + 14, cy - 4))


def ic_none(cx, cy):
    return ('<circle cx="%d" cy="%d" r="15" fill="var(--ok-bg)" stroke="var(--ok-solid)" stroke-width="2.5"/>'
            '<path d="M%d %d l5 5 l9 -10" fill="none" stroke="var(--ok-solid)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' % (cx, cy, cx - 7, cy))


def tbox(cx, y, w, h, label, icon, fam=None, sub=None):
    """A test's box: its icon at the left, its name (and a line under it) to the right."""
    fill, bd, ink = (("var(--%s-bg)" % fam, "var(--%s-solid)" % fam, "var(--%s-ink)" % fam) if fam
                     else ("var(--surface)", "var(--gray-bd)", "var(--ink)"))
    x = cx - w / 2.0
    out = '<rect x="%.1f" y="%d" width="%d" height="%d" rx="14" fill="%s" stroke="%s" stroke-width="2.5"/>' % (x, y, w, h, fill, bd)
    out += icon(x + 34, y + h // 2)
    if sub:
        out += t(x + 62, y + h / 2.0 - 4, label, 18, 750, ink, "start") + t(x + 62, y + h / 2.0 + 17, sub, 13, 600, "var(--muted)", "start")
    else:
        out += t(x + 62, y + h / 2.0 + 6, label, 18, 750, ink, "start")
    return out


def qpill(cx, y, w, label):
    return ('<rect x="%.1f" y="%d" width="%d" height="48" rx="24" fill="var(--surface)" stroke="var(--primary)" stroke-width="3"/>'
            % (cx - w / 2.0, y, w) + t(cx, y + 31, label, 19, 750, "var(--primary)"))


def mini_ecg(x, y, tw):
    return ('<rect x="%d" y="%d" width="96" height="54" rx="8" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="1.5"/>'
            '<path d="%s" fill="none" stroke="var(--ink)" stroke-width="2.2" stroke-linejoin="round"/>' % (x, y, beat(x + 8, y + 36, 80, 22, st=0, r=1.0, t=tw)))


# ---- slide 4: typical and atypical angina, NICE CG95's path. The review (2026-10-14): no opening box, square arrows,
# icons and the patient; the last tap clears the path and leaves the exercise ECG line alone in the centre
tp = [DEFS, '<g data-until="6">',
      '<g data-beat="1">%s</g>' % qpill(430, 12, 290, "Known heart disease?"),
      '<g data-beat="2">%s%s%s</g>' % (elbow(380, 60, 260, 118, "No", 272, 110), person("case-chest-man", 14, 108, .4),
                                       tbox(260, 118, 300, 56, "CT coronary angiography", ic_ct, "se")),
      '<g data-beat="3">%s%s</g>' % (elbow(260, 174, 260, 206, "uncertain", 272, 196), tbox(260, 206, 300, 56, "Functional imaging", ic_stress)),
      '<g data-beat="4">%s%s</g>' % (elbow(260, 262, 260, 294, "inconclusive", 272, 284), tbox(260, 294, 300, 56, "Invasive angiography", ic_cath)),
      '<g data-beat="5">%s%s</g>' % (elbow(480, 60, 665, 118, "Yes", 677, 110),
                                     tbox(665, 118, 340, 64, "Functional test", ic_stress, None, "old MI, stent, bypass · or exercise ECG")),
      '</g>',
      '<g data-beat="6"><rect x="190" y="130" width="480" height="150" rx="20" fill="var(--bad-bg)" stroke="var(--bad-solid)" stroke-width="3"/>'
      '%s%s</g>' % (t(430, 196, "Exercise ECG is not", 30, 800, "var(--bad-ink)"), t(430, 238, "a first-line test", 30, 800, "var(--bad-ink)"))]
svg("angina-typical", "0 0 860 420", "Typical or atypical angina: no known heart disease, CT coronary angiography first; known disease, a functional test",
    "".join(tp))


# ---- slide 5: non-anginal chest pain, on the resting ECG (the same review: no opening box, square arrows, figures)
na = [DEFS,
      '<g data-beat="1">%s</g>' % qpill(430, 12, 240, "Resting ECG?"),
      '<g data-beat="2">%s%s%s</g>' % (elbow(380, 60, 220, 128, "Normal", 232, 120), mini_ecg(40, 72, .35),
                                       tbox(220, 128, 330, 70, "No cardiac test", ic_none, None, "look for another cause: gut, chest wall")),
      '<g data-beat="3">%s%s%s%s%s</g>' % (elbow(480, 60, 640, 128, "Abnormal", 652, 120), mini_ecg(758, 72, -.35),
                                           tbox(640, 128, 330, 70, "CT coronary angiography", ic_ct, "se", "ST-T changes or Q waves: as for angina"),
                                           person("case-chest-woman", 560, 214, .55), t(660, 300, "Patient B", 16, 750, "var(--muted)", "start"))]
svg("angina-nonanginal", "0 0 860 420", "Non-anginal chest pain: no cardiac test if the resting ECG is normal; CT coronary angiography if it is not",
    "".join(na))


# ---- slide 7: angina with a normal angiogram (option A). The review (2026-10-14): each card first without its name,
# explained in the presenter's words; the names come on the third and fourth taps; a patient in each card.
def tube(x, y, w, pinch=False):
    if pinch:
        def edge(s):
            return "M%d %d L%d %d C%d %d %d %d %d %d C%d %d %d %d %d %d L%d %d" % (
                x, y + s * 14, x + w * .38, y + s * 14, x + w * .44, y + s * 14, x + w * .45, y + s * 4, x + w * .5, y + s * 4,
                x + w * .55, y + s * 4, x + w * .56, y + s * 14, x + w * .62, y + s * 14, x + w, y + s * 14)
        top, bot = edge(-1), edge(1)
    else:
        top, bot = "M%d %d L%d %d" % (x, y - 14, x + w, y - 14), "M%d %d L%d %d" % (x, y + 14, x + w, y + 14)
    return "".join('<path d="%s" fill="none" stroke="var(--se-solid)" stroke-width="4" stroke-linecap="round"/>' % d for d in (top, bot))


def small_vessels(x, y):
    out = tube(x, y, 130)
    for dy in (-46, 0, 46):
        out += '<path d="M%d %d Q%d %.1f %d %d" fill="none" stroke="var(--se-solid)" stroke-width="3.5" stroke-linecap="round"/>' % (x + 130, y, x + 155, y + dy * .3, x + 180, y + dy)
        for ddy in (-14, 0, 14):
            ex, ey = x + 226, y + dy + ddy
            out += '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="var(--se-solid)" stroke-width="2"/>' % (x + 180, y + dy, ex, ey)
            out += '<circle cx="%.1f" cy="%.1f" r="4.5" fill="var(--bad-bd)" stroke="var(--bad-solid)" stroke-width="1.5"/>' % ((x + 180 + ex) / 2.0 + 4, (y + dy + ey) / 2.0)
    return out


def clamp(x, y):
    out = tube(x, y, 226, pinch=True)
    cx = x + 113
    return out + ('<path d="M%d %d l0 18 m-8 -8 l8 8 l8 -8 M%d %d l0 -18 m-8 8 l8 -8 l8 8" fill="none" stroke="var(--bad-solid)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
                  % (cx, y - 44, cx, y + 44))


def ecg_box(x, y, st):
    return ('<rect x="%d" y="%d" width="130" height="78" rx="10" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="2"/>'
            '<path d="%s" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>' % (x, y, beat(x + 12, y + 52, 106, 30, st=st, r=1.0, t=.35 if st >= 0 else .25)))


def nm_card(x, when, art, st, st_label, who, sc):
    return ('<rect x="%d" y="6" width="414" height="408" rx="18" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="2"/>' % x
            + '<rect x="%d" y="70" width="%d" height="36" rx="18" fill="var(--surface-2)" stroke="var(--border)" stroke-width="2"/>' % (x + 24, len(when) * 9 + 30)
            + t(x + 39, 94, when, 15, 650, "var(--text)", "start")
            + ecg_box(x + 264, 64, st) + t(x + 329, 162, st_label, 15, 700, "var(--muted)")
            + person(who, x + 18, 196, sc)
            + art + t(x + 24, 396, "Large arteries clear", 16, 600, "var(--muted)", "start"))


nm = ['<g data-beat="1">%s</g>' % nm_card(6, "On exertion", small_vessels(170, 280), -.3, "ST down", "case-chest-woman", .8),
      '<g data-beat="2">%s</g>' % nm_card(440, "At rest, often at dawn", clamp(612, 280), .45, "ST up", "case-smoking", .8),
      '<g data-beat="3">%s</g>' % t(30, 52, "Syndrome X", 26, 800, "var(--ink)", "start"),
      '<g data-beat="4">%s</g>' % t(464, 52, "Prinzmetal angina", 26, 800, "var(--ink)", "start")]
svg("angina-normal", "0 0 860 420", "Angina with clear coronary arteries: syndrome X in the small vessels, Prinzmetal angina in a spasm of the artery",
    "".join(nm))


# ---- slide 8: back to the hook. The two stems above, each with its patient (the review, 2026-10-14); three steps
# below, each lighting its words in both stems
A = [("61, diabetes, hypertension, smokes.", None), ("No heart disease before.", 3),
     ("Tight chest walking uphill,", 1), ("gone 3 minutes after he stops.", 1), ("Resting ECG normal.", 2)]
B = [("58, hypertension, smokes.", None), ("No heart disease before.", 3),
     ("Tight chest watching television,", 1), ("fades after half an hour.", 1), ("T waves inverted in V4–V6.", 2)]
sv = [DEFS]
for x0, name, who, lines in ((6, "A", "case-chest-man", A), (436, "B", "case-chest-woman", B)):
    sv.append('<rect x="%d" y="34" width="418" height="176" rx="16" fill="var(--surface)" stroke="var(--gray-bd)" stroke-width="2"/>' % x0)
    sv.append(person(who, x0 + 8, 44, .44) + t(x0 + 44, 150, "Patient " + name, 13, 750, "var(--muted)"))
    for i, (words, b) in enumerate(lines):
        y = 66 + i * 32
        if b:
            sv.append('<g data-beat="%d"><rect x="%d" y="%d" width="%d" height="28" rx="7" fill="var(--hl)"/></g>' % (b, x0 + 90, y - 19, int(len(words) * 8.6) + 14))
        sv.append(t(x0 + 96, y, words, 16, 550, "var(--text)", "start"))
steps = [("1", "Count the features", ("A: 3 · typical", "cat"), ("B: 1 · non-anginal", "se")),
         ("2", "The resting ECG", ("A: normal · excludes nothing", None), ("B: abnormal · onto the track", None))]
for i, (n, head, a, b) in enumerate(steps):
    cx = 150 + i * 290
    g = ('<circle cx="%d" cy="240" r="15" fill="var(--ink)"/>%s%s' % (cx - 120, t(cx - 120, 246, n, 15, 800, "var(--surface)"),
                                                                      t(cx - 96, 246, head, 18, 750, "var(--text)", "start")))
    for j, (label, fam) in enumerate((a, b)):
        g += box(cx, 266 + j * 64, 270, 50, label, fam, None, 16)
    sv.append('<g data-beat="%d">%s</g>' % (i + 1, g))
sv.append('<g data-beat="3"><circle cx="610" cy="240" r="15" fill="var(--ink)"/>%s%s%s</g>'
          % (t(610, 246, "3", 15, 800, "var(--surface)"), t(634, 246, "No known disease", 18, 750, "var(--text)", "start"),
             box(730, 266, 240, 114, "CT coronary angiography", "se", "for both", 17)))
svg("angina-solve", "0 0 860 420", "The hook solved: count the features, read the resting ECG, then no known disease: CT coronary angiography for both",
    "".join(sv))


