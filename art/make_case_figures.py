"""Makes the cardiology case cartoons in content/figures (python art/make_case_figures.py).

DESIGN.md, Behaviour rules: a case has a cartoon, one cast member with one prop for the case's subject, never its
type (and never its clue). Each is drawn like the existing cast (case-chest-man, case-smoking): a bust with a dark
outline, the prop held up by the right shoulder or standing beside, in the 160 x 200 scene box. The person pops in
first and the prop with its hand 0.16 s later (sc-pop). Chosen as style A, 2026-10-16."""
import os
import math
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "content", "figures")
LINE = "#22303F"
O = 'class="sc-o"'

SKIN = {"light": "#F1CBA7", "tan": "#E9B88F", "brown": "#A8724F", "dark": "#8D5A3B", "pale": "#F7E2CF"}
HAIR = {"grey": "#B9BEC6", "silver": "#8C8C8C", "black": "#15100C", "brown": "#5A3B28", "dark": "#2B1D14", "auburn": "#8A4B2A"}
SHIRT = {"blue": "#3D7CC9", "pink": "#C2557E", "amber": "#E2A13B", "teal": "#2E8B8B", "purple": "#8E6BB8",
         "green": "#4E9A6B", "coral": "#D9734E", "slate": "#5B6B82"}


# ---- the person: the cast's bust (body, neck, head, hair), long hair behind for some
def person(skin, hair, shirt, long=False, glasses=False, mouth="flat"):
    s = ""
    if long:
        s += '<path %s d="M48 60 C44 104 54 118 64 120 L96 120 C106 118 116 104 112 60 Z" fill="%s"/>' % (O, hair)
    s += '<path %s d="M26 200 C26 122 50 112 80 112 C110 112 134 122 134 200 Z" fill="%s"/>' % (O, shirt)
    s += '<rect %s x="72" y="86" width="16" height="18" rx="4" fill="%s"/>' % (O, skin)
    s += '<circle %s cx="80" cy="64" r="28" fill="%s"/>' % (O, skin)
    s += '<path %s d="M52 62 C50 38 70 30 82 32 C100 34 110 46 108 62 C98 50 70 48 52 62 Z" fill="%s"/>' % (O, hair)
    if glasses:
        s += ('<circle cx="70" cy="66" r="8" fill="none" stroke="%s" stroke-width="2.5"/>'
              '<circle cx="90" cy="66" r="8" fill="none" stroke="%s" stroke-width="2.5"/>'
              '<path d="M78 66 h4" stroke="%s" stroke-width="2.5"/>') % (LINE, LINE, LINE)
    s += '<circle cx="70" cy="66" r="3" fill="%s"/><circle cx="90" cy="66" r="3" fill="%s"/>' % (LINE, LINE)
    if mouth == "open":
        s += '<ellipse cx="80" cy="80" rx="4" ry="5" fill="%s"/>' % LINE
    else:
        m = {"flat": "M74 79 h12", "smile": "M73 77 q7 6 14 0", "sad": "M72 82 Q80 77 88 82"}[mouth]
        s += '<path d="%s" fill="none" stroke="%s" stroke-width="2.5" stroke-linecap="round"/>' % (m, LINE)
    return s


def raised_arm(shirt):
    d = "M112 150 C128 152 132 136 128 126"
    return ('<path d="%s" fill="none" stroke="%s" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>'
            '<path d="%s" fill="none" stroke="%s" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>') % (d, LINE, d, shirt)


def hand(x, y, skin, rx=8, ry=8):
    return '<ellipse %s cx="%s" cy="%s" rx="%s" ry="%s" fill="%s"/>' % (O, x, y, rx, ry, skin)


def rays(cx, cy, r1=9, r2=18):
    """The cast's pain burst: eight short coral strokes round a point."""
    out = ""
    for i in range(8):
        a = i * 3.14159265 / 4
        x1, y1 = cx + r1 * math.cos(a), cy + r1 * math.sin(a)
        x2, y2 = cx + r2 * math.cos(a), cy + r2 * math.sin(a)
        out += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#D85A30" stroke-width="3" stroke-linecap="round"/>' % (x1, y1, x2, y2)
    return out


# ---- props, drawn round (0, 0) in about 44 x 44
def p_ecg():
    s = '<rect %s x="-24" y="-12" width="48" height="24" rx="2" fill="#FBE3E6"/>' % O
    for x in range(-18, 24, 8):
        s += '<path d="M%d -11 V11" stroke="#F0B8C0" stroke-width="1"/>' % x
    s += '<path d="M-22 3 H-14 l3 -12 l3 16 l2 -4 H2 l3 -12 l3 16 l2 -4 H22" fill="none" stroke="%s" stroke-width="2" stroke-linejoin="round"/>' % LINE
    return s


def p_gauge():
    return ('<path d="M10 14 C16 26 26 24 28 16" fill="none" stroke="%s" stroke-width="3"/>' % LINE
            + '<ellipse %s cx="28" cy="10" rx="7" ry="9" fill="#2E3A48"/>' % O
            + '<circle %s cx="-2" cy="-2" r="19" fill="#FFFFFF"/>' % O
            + ''.join('<path d="M%.1f %.1f L%.1f %.1f" stroke="%s" stroke-width="2"/>' % (
                -2 + 15 * c, -2 + 15 * s_, -2 + 12 * c, -2 + 12 * s_, LINE)
                for c, s_ in [(-1, 0), (-.7, -.7), (0, -1), (.7, -.7), (1, 0)])
            + '<path d="M-2 -2 L-2 -14" stroke="#D85A30" stroke-width="3" stroke-linecap="round"/><circle cx="-2" cy="-2" r="3" fill="%s"/>' % LINE)


def p_tube():
    return ('<rect %s x="-7" y="-14" width="14" height="38" rx="7" fill="#FFFFFF"/>' % O
            + '<path d="M-5.5 2 H5.5 V17 A5.5 5.5 0 0 1 -5.5 17 Z" fill="#C0392B"/>'
            + '<rect %s x="-9" y="-24" width="18" height="12" rx="3" fill="#8E6BB8"/>' % O)


def p_clock():
    return ('<circle %s cx="-11" cy="-15" r="7" fill="#E2A13B"/><circle %s cx="11" cy="-15" r="7" fill="#E2A13B"/>' % (O, O)
            + '<path d="M-10 16 l-5 7 M10 16 l5 7" stroke="%s" stroke-width="3" stroke-linecap="round"/>' % LINE
            + '<circle %s cx="0" cy="0" r="18" fill="#FFFFFF"/>' % O
            + '<path d="M0 0 V-11 M0 0 L-8 5" stroke="%s" stroke-width="3" stroke-linecap="round"/>' % LINE)


def p_cylinder():
    return ('<rect %s x="-11" y="-14" width="22" height="40" rx="9" fill="#4E9A6B"/>' % O
            + '<rect %s x="-5" y="-22" width="10" height="9" rx="2" fill="#B9BEC6"/>' % O)


def p_stairs():
    return '<path %s d="M-30 24 V8 H-10 V-8 H10 V-24 H30 V24 Z" fill="#C9D2DD"/>' % O


def p_shoe():
    return ('<path %s d="M-24 12 V-4 C-24 -14 -14 -16 -8 -10 L4 -2 C14 2 24 2 26 10 V12 Z" fill="#3D7CC9"/>' % O
            + '<rect %s x="-26" y="11" width="54" height="8" rx="4" fill="#FFFFFF"/>' % O
            + '<path d="M-10 -6 l4 -5 M-4 -2 l4 -5 M2 2 l4 -5" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>')


def p_clipboard():
    return ('<rect %s x="-17" y="-20" width="34" height="44" rx="3" fill="#B07A48"/>' % O
            + '<rect x="-12" y="-13" width="24" height="33" fill="#FFFFFF"/>'
            + '<path d="M-8 -6 H8 M-8 1 H8 M-8 8 H4" stroke="#9AA6B4" stroke-width="2.5" stroke-linecap="round"/>'
            + '<rect %s x="-7" y="-24" width="14" height="8" rx="2" fill="#B9BEC6"/>' % O)


def p_card():
    return ('<rect %s x="-20" y="-16" width="40" height="32" rx="3" fill="#FFFFFF"/>' % O
            + '<path d="M-8 -4 c0 -6 8 -6 8 0 c0 -6 8 -6 8 0 c0 6 -8 10 -8 12 c0 -2 -8 -6 -8 -12 Z" fill="#D85A30" transform="translate(-4 -1)"/>'
            + '<path d="M-14 10 H14" stroke="#9AA6B4" stroke-width="2.5" stroke-linecap="round"/>')


def p_lens():
    return ('<path d="M8 8 L22 22" stroke="%s" stroke-width="9" stroke-linecap="round"/>' % LINE
            + '<path d="M8 8 L22 22" stroke="#7A5230" stroke-width="5" stroke-linecap="round"/>'
            + '<circle cx="-4" cy="-4" r="16" fill="#DCEBF7" stroke="%s" stroke-width="5"/>' % LINE
            + '<path d="M-12 -10 q4 -6 10 -6" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>')


def p_handbag():
    return ('<path d="M-10 -8 C-10 -24 10 -24 10 -8" fill="none" stroke="%s" stroke-width="7" stroke-linecap="round"/>' % LINE
            + '<path d="M-10 -8 C-10 -24 10 -24 10 -8" fill="none" stroke="#8A4B2A" stroke-width="3" stroke-linecap="round"/>'
            + '<path %s d="M-20 -8 H20 L24 20 H-24 Z" fill="#B5652E"/>' % O
            + '<rect %s x="-4" y="-4" width="8" height="6" rx="1" fill="#E2A13B"/>' % O)


def p_script():
    return ('<path %s d="M-16 -22 H10 L18 -14 V22 H-16 Z" fill="#FFFFFF"/>' % O
            + '<path d="M-10 -12 H4 M-10 -4 H10 M-10 4 H10 M-10 12 H2" stroke="#9AA6B4" stroke-width="2.5" stroke-linecap="round"/>'
            + '<path d="M10 -22 V-14 H18" fill="none" stroke="%s" stroke-width="2"/>' % LINE)


def p_blister():
    s = '<rect %s x="-16" y="-22" width="32" height="44" rx="4" fill="#D5DCE4"/>' % O
    for x in (-7, 7):
        for y in (-12, 0, 12):
            s += '<circle cx="%d" cy="%d" r="4.5" fill="#FFFFFF" stroke="#9AA6B4" stroke-width="1.5"/>' % (x, y)
    return s


def bottle(x=0, color="#E2A13B", w=28):
    h = w / 2
    return ('<rect %s x="%s" y="-12" width="%s" height="36" rx="5" fill="%s"/>' % (O, x - h, w, color)
            + '<rect %s x="%s" y="-22" width="%s" height="11" rx="3" fill="#FFFFFF"/>' % (O, x - h - 2, w + 4)
            + '<rect x="%s" y="-2" width="%s" height="16" rx="2" fill="#FFFFFF"/>' % (x - h + 5, w - 10))


def p_bottle():
    return bottle()


def p_two_bottles():
    return bottle(-13, "#E2A13B", 22) + bottle(13, "#4E9A6B", 22)


def p_glass():
    return ('<path %s d="M-14 -20 H14 L11 22 H-11 Z" fill="#FFFFFF"/>' % O
            + '<path d="M-12.6 -6 H12.6 L10.4 20 H-10.4 Z" fill="#BFDDF2"/>'
            + '<rect %s x="16" y="-28" width="14" height="7" rx="3.5" fill="#FFFFFF"/>' % O)


def p_medbag():
    return ('<path %s d="M-20 -18 H20 L22 24 H-22 Z" fill="#E6D3B3"/>' % O
            + '<path d="M-20 -18 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6" fill="none" stroke="%s" stroke-width="2"/>' % LINE
            + '<path d="M-3 -2 h6 v5 h5 v6 h-5 v5 h-6 v-5 h-5 v-6 h5 Z" fill="#4E9A6B"/>')


def p_box():
    return ('<path %s d="M-20 -10 L-10 -20 H20 V12 L10 22 H-20 Z" fill="#FFFFFF"/>' % O
            + '<path d="M-20 -10 H10 V22 M10 -10 L20 -20" fill="none" stroke="%s" stroke-width="2"/>' % LINE
            + '<rect x="-17" y="0" width="24" height="7" fill="#3D7CC9"/>')


def p_spray():
    return ('<rect %s x="-9" y="-8" width="18" height="32" rx="4" fill="#C0392B"/>' % O
            + '<rect %s x="-4" y="-16" width="8" height="9" rx="1" fill="#FFFFFF"/>' % O
            + '<rect %s x="-3" y="-24" width="13" height="7" rx="2" fill="#FFFFFF"/>' % O)


def p_can():
    return ('<path %s d="M14 -6 L24 -18 L28 -14 L18 -2 Z" fill="#4E9A6B"/>' % O
            + '<path d="M-10 -12 C-10 -30 10 -30 10 -12" fill="none" stroke="%s" stroke-width="7" stroke-linecap="round"/>' % LINE
            + '<path d="M-10 -12 C-10 -30 10 -30 10 -12" fill="none" stroke="#4E9A6B" stroke-width="3" stroke-linecap="round"/>'
            + '<rect %s x="-18" y="-12" width="36" height="32" rx="5" fill="#4E9A6B"/>' % O)


def watch_arm(skin):
    """A raised forearm with a watch on the wrist (the slow pulse)."""
    return ('<rect %s x="117" y="128" width="20" height="10" rx="3" fill="#2E3A48"/>' % O
            + '<circle %s cx="127" cy="133" r="9" fill="#FFFFFF"/>' % O
            + '<path d="M127 133 V127 M127 133 h4" stroke="%s" stroke-width="2" stroke-linecap="round"/>' % LINE)


def cannula():
    c = "#7FB2DE"
    return ('<path d="M74 75 C66 77 56 75 52 66 M86 75 C94 77 104 75 108 66" fill="none" stroke="%s" stroke-width="3" stroke-linecap="round"/>'
            '<path d="M108 66 C116 84 122 116 138 140" fill="none" stroke="%s" stroke-width="3" stroke-linecap="round"/>'
            '<circle cx="80" cy="75" r="3" fill="%s" stroke="%s" stroke-width="1.5"/>') % (c, c, c, LINE)


def breath():
    return ('<path d="M100 82 q8 -4 14 0 M104 92 q8 -4 16 0 M100 102 q8 -4 12 0" fill="none" stroke="#9AA6B4" stroke-width="3" stroke-linecap="round"/>'
            '<path d="M58 44 q-5 8 0 10 q5 -2 0 -10 Z" fill="#9CC3E6" stroke="%s" stroke-width="1.5"/>') % LINE


def arm_pain(shirt, skin):
    """Right hand gripping the upper arm on the far side (his left arm), the burst on it."""
    return ('<path %s d="M40 200 C34 168 52 148 100 144 L104 158 C72 162 60 180 62 200 Z" fill="%s"/>' % (O, shirt)
            + hand(110, 150, skin, 13, 11) + rays(122, 174, 6, 13))


def side_hand(shirt, skin):
    return ('<path %s d="M124 200 C128 186 124 176 108 172 L104 184 C112 186 112 192 110 200 Z" fill="%s"/>' % (O, shirt)
            + hand(100, 178, skin, 13, 10) + rays(80, 178, 6, 13))


# ---- scenes: who, then how the prop sits
HELD, BESIDE = "held", "beside"
SCENES = [
    # Lesson 1, Coronary arteries and the ECG
    ("case-arm-man", "A man in his sixties holding his left arm in pain",
     dict(skin="light", hair="silver", shirt="slate", glasses=True, mouth="sad"), "arm", None),
    ("case-breathless-man", "A pale man, short of breath",
     dict(skin="pale", hair="brown", shirt="green", mouth="open"), "breath", None),
    ("case-ecg-woman", "A woman in her seventies holding an ECG strip",
     dict(skin="light", hair="grey", shirt="purple", long=True, glasses=True), HELD, p_ecg),
    ("case-bp-man", "A man in his sixties and a blood pressure gauge",
     dict(skin="brown", hair="black", shirt="blue"), HELD, p_gauge),
    ("case-tube-man", "A man in his fifties holding a blood sample tube",
     dict(skin="tan", hair="auburn", shirt="teal"), HELD, p_tube),
    ("case-watch-man", "A man in his seventies looking at his watch",
     dict(skin="dark", hair="grey", shirt="amber", glasses=True), "watch", None),
    ("case-clock-woman", "A woman in her fifties holding an alarm clock",
     dict(skin="tan", hair="brown", shirt="teal", long=True), HELD, p_clock),
    ("case-oxygen-man", "A man in his seventies on oxygen",
     dict(skin="light", hair="grey", shirt="purple", glasses=True), "oxygen", p_cylinder),
    # Lesson 2, Is it angina?
    ("case-stairs-man", "A man in his fifties at the foot of a flight of stairs",
     dict(skin="dark", hair="black", shirt="amber"), BESIDE, p_stairs),
    ("case-side-woman", "A young woman with a hand on her left side",
     dict(skin="brown", hair="dark", shirt="coral", long=True, mouth="sad"), "side", None),
    ("case-shoe-man", "A man in his sixties holding a trainer",
     dict(skin="dark", hair="silver", shirt="amber"), HELD, p_shoe),
    ("case-results-woman", "A woman in her fifties holding a clipboard of results",
     dict(skin="light", hair="auburn", shirt="blue", long=True), HELD, p_clipboard),
    ("case-request-man", "A man in his seventies holding a card with a heart on it",
     dict(skin="tan", hair="grey", shirt="green", glasses=True), HELD, p_card),
    ("case-lens-woman", "A woman in her fifties holding a magnifying glass",
     dict(skin="dark", hair="black", shirt="pink", long=True), HELD, p_lens),
    ("case-handbag-woman", "A young woman holding a handbag",
     dict(skin="light", hair="brown", shirt="slate", long=True), HELD, p_handbag),
    # Lesson 3, Treating stable angina
    ("case-script-man", "A man in his fifties holding a prescription",
     dict(skin="tan", hair="dark", shirt="teal"), HELD, p_script),
    ("case-script-woman", "A woman in her fifties holding a prescription",
     dict(skin="dark", hair="dark", shirt="amber", long=True), HELD, p_script),
    ("case-blister-man", "A man in his sixties holding a blister pack",
     dict(skin="light", hair="brown", shirt="coral"), HELD, p_blister),
    ("case-bottle-man", "A man in his sixties holding a pill bottle",
     dict(skin="brown", hair="silver", shirt="teal"), HELD, p_bottle),
    ("case-water-man", "A man holding a glass of water",
     dict(skin="light", hair="black", shirt="blue"), HELD, p_glass),
    ("case-medbag-man", "A man in his seventies holding a bag of medicines",
     dict(skin="tan", hair="grey", shirt="slate", glasses=True), HELD, p_medbag),
    ("case-box-woman", "A woman in her sixties holding a medicine box",
     dict(skin="brown", hair="silver", shirt="green", long=True), HELD, p_box),
    ("case-sort-man", "A man in his fifties holding two pill bottles",
     dict(skin="dark", hair="black", shirt="purple"), HELD, p_two_bottles),
    ("case-bottle-woman", "A woman in her sixties holding a pill bottle",
     dict(skin="tan", hair="auburn", shirt="blue", long=True, glasses=True), HELD, p_bottle),
    ("case-spray-man", "A man holding a spray",
     dict(skin="brown", hair="dark", shirt="green", mouth="sad"), HELD, p_spray),
    ("case-can-man", "A man in his sixties holding a watering can",
     dict(skin="light", hair="grey", shirt="blue", glasses=True, mouth="smile"), HELD, p_can),
]


def pop(i, body):
    return '<g class="sc-pop" style="--i:%d">%s</g>' % (i, body)


def scene(who, how, prop):
    w = dict(who)
    skin, shirt = SKIN[w.pop("skin")], SHIRT[w.pop("shirt")]
    body = person(skin, HAIR[w.pop("hair")], shirt, **w)
    if how == HELD:
        return pop(0, body + raised_arm(shirt)) + pop(1, '<g transform="translate(126 92) scale(1.25)">%s</g>' % prop() + hand(126, 124, skin))
    if how == BESIDE:  # he stands to the left, the prop in front of his right side
        return pop(0, '<g transform="translate(-18 0)">%s</g>' % body) + pop(1, '<g transform="translate(130 172)">%s</g>' % prop())
    if how == "oxygen":
        return pop(0, body + cannula()) + pop(1, '<g transform="translate(138 166) scale(1.25)">%s</g>' % prop())
    if how == "watch":
        return pop(0, body + raised_arm(shirt) + hand(126, 120, skin)) + pop(1, watch_arm(skin))
    if how == "arm":
        return pop(0, body) + pop(1, arm_pain(shirt, skin))
    if how == "breath":
        return pop(0, body) + pop(1, breath())
    if how == "side":
        return pop(0, body) + pop(1, side_hand(shirt, skin))
    raise ValueError(how)


def two_patients():
    """Is it angina?'s solved example: its two patients, A and B, side by side (the one case with two)."""
    out = []
    for i, (name, x) in enumerate((("case-chest-man", -13), ("case-chest-woman", 70))):
        src = open(os.path.join(OUT, name + ".svg"), encoding="utf-8").read()
        inner = re.search(r'<g class="sc-pop"[^>]*>(.*)</g>\s*</svg>', src, re.S).group(1)
        out.append('<g class="sc-pop" style="--i:%d"><g transform="translate(%d 72) scale(.64)">%s</g></g>' % (i, x, inner))
    return "".join(out)


def save(name, label, body):
    svg = ('<svg class="scene scene-case" viewBox="0 0 160 200" role="img" aria-label="%s">\n%s\n</svg>\n' % (label, body))
    with open(os.path.join(OUT, name + ".svg"), "w", encoding="utf-8", newline="\n") as f:
        f.write(svg)


def main():
    for name, label, who, how, prop in SCENES:
        save(name, label, scene(who, how, prop))
    save("case-two-patients", "Two patients, a man in his sixties and a woman in her fifties, each with a hand on the chest", two_patients())
    print("Wrote %d case cartoons to content/figures" % (len(SCENES) + 1))


if __name__ == "__main__":
    main()
