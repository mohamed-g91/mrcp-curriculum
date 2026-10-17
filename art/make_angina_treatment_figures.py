"""Lesson 3 artwork; run python art/make_angina_treatment_figures.py.

Existing story/art pattern, token colours and cardiology patient/heart artwork.
Clinical copy follows notes/angina-treatment-plan.md (agreed order and mockup choices, 2026-10-16);
concept labels are filled from YAML slots. The painted heart needs Pillow.
No imports from the other figure generators: they write files at import time.
"""
from html import escape
from pathlib import Path
import re

OUT = Path(__file__).resolve().parents[1] / 'content' / 'figures'


def text(x, y, value='', size=20, fill='ink', anchor='middle', slot=None):
    attr = ' data-slot="%s"' % slot if slot else ''
    return ('<text x="%s" y="%s"%s style="font:500 %spx var(--sans);fill:var(--%s);text-anchor:%s">%s</text>'
            % (x, y, attr, size, fill, anchor, escape(value)))


def lines(x, y, values, size=20, gap=28, fill='ink'):
    return ''.join(text(x, y + i * gap, v, size, fill) for i, v in enumerate(values))


def rect(x, y, w, h, fam='gray', radius=14):
    return '<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="var(--%s-bg)" stroke="var(--%s-bd)" stroke-width="2"/>' % (x, y, w, h, radius, fam, fam)


def path(d, color='muted', width=3):
    return '<path d="%s" fill="none" stroke="var(--%s)" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round"/>' % (d, color, width)


def arrow(x1, y1, x2, y2):
    return path('M%s %s L%s %s' % (x1, y1, x2, y2)) + path('M%s %s l-8 -6 m8 6 l-8 6' % (x2, y2))


def down(x, y1, y2):
    return path('M%s %s V%s m-6 -8 l6 8 l6 -8' % (x, y1, y2))


def beat(n, body, until=None):
    return '<g data-beat="%s"%s>%s</g>' % (n, ' data-until="%s"' % until if until else '', body)


def concept(x, y, key, letter, fam, size=20):
    return ('<circle cx="%s" cy="%s" r="17" fill="var(--surface)" stroke="var(--%s-solid,var(--gray-bd))" stroke-width="2.5"/>'
            % (x, y - 6, fam) + text(x, y, letter, 18, fam + '-ink') + text(x + 27, y, size=size, fill=fam + '-ink', anchor='start', slot=key))


def heart(x, y, scale=.55):
    # The outline and LAD from the established lesson 2 drawing, with a fixed plaque.
    return ('<g transform="translate(%s %s) scale(%s)">'
            '<path d="M-10 -150 C90 -170 175 -105 165 -5 C155 90 60 160 -45 195 C-125 145 -175 60 -165 -30 C-155 -110 -85 -150 -10 -150 Z" fill="var(--gray-bg)" stroke="var(--wall)" stroke-width="4"/>'
            '<path d="M15 -145 C25 -70 10 50 -45 192" fill="none" stroke="var(--primary)" stroke-width="10" stroke-linecap="round"/>'
            '<ellipse cx="21" cy="-88" rx="11" ry="20" fill="var(--sol-bg)" stroke="var(--sol-solid)" stroke-width="3"/></g>') % (x, y, scale)


def vessel(x, y, w=140, spasm=False, stent=False, blocked=False):
    inner = 9 if spasm else 22
    out = path('M%s %s H%s M%s %s H%s' % (x, y-inner, x+w, x, y+inner, x+w), 'primary', 5)
    if stent:
        for k in range(9):
            a = x + 20 + k * (w-40) / 9
            out += path('M%.1f %s l12 %s l-12 %s' % (a, y-inner, inner, inner), 'wall', 2)
    if blocked:
        out += '<ellipse cx="%s" cy="%s" rx="20" ry="21" fill="var(--bad-solid)"/>' % (x+w/2, y)
    elif not spasm:
        out += arrow(x+12, y, x+w-12, y)
    return out


def spray(x, y):
    return rect(x-14, y-22, 28, 45, 'gray', 4) + path('M%s %s v-10 h20 v7 m-20 -7 h-7' % (x-8, y-22), 'primary') + path('M%s %s l-14 -8 m14 8 l-17 1 m17 -1 l-12 10' % (x-20, y-28), 'primary', 2)


def ambulance(x, y):
    return rect(x-44, y-24, 88, 44, 'gray', 5) + path('M%s %s h22 v22 h-22z M%s %s h18 m-9 -9 v18' % (x+13, y-17, x-30, y-2), 'primary') + ''.join('<circle cx="%s" cy="%s" r="8" fill="var(--ink)"/>' % (x+a, y+23) for a in [-26, 26])


def patient(x, y, scale=.7):
    src = (OUT / 'case-chest-man.svg').read_text(encoding='utf-8')
    body = re.sub(r'^.*?<svg[^>]*>', '', src, flags=re.S)
    body = re.sub(r'</svg>\s*$', '', body)
    return '<g transform="translate(%s %s) scale(%s)">%s</g>' % (x, y, scale, body)


def save(name, label, body, vb='0 0 860 420'):
    out = '<svg xmlns="http://www.w3.org/2000/svg" class="scene" viewBox="%s" role="img" aria-label="%s">%s</svg>\n' % (vb, escape(label, quote=True), body)
    (OUT / (name + '.svg')).write_text(out, encoding='utf-8')
    print(name)


_HEART = {}


def heart_img(x, y, w):
    """The painted front heart from lesson 1 (heart-front.webp), embedded small so the page stays offline."""
    if not _HEART:
        import base64
        import io
        from PIL import Image
        with Image.open(OUT / 'heart-front.webp') as im:
            im = im.resize((300, round(300 * im.height / im.width)), Image.Resampling.LANCZOS)
            buf = io.BytesIO()
            im.save(buf, 'WEBP', quality=82)
        _HEART['uri'] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')
    return '<image href="%s" x="%s" y="%s" width="%s" height="%.0f"/>' % (_HEART['uri'], x, y, w, w * 540 / 480)


def shield(cx, cy, s=1):
    return ('<g transform="translate(%s %s) scale(%s)"><path d="M0 -40 L32 -27 V0 Q29 29 0 44 Q-29 29 -32 0 V-27 Z" fill="var(--np-bg)" stroke="var(--np-solid)" stroke-width="4"/>'
            % (cx, cy, s) + path('M-13 1 l9 11 l19 -23', 'np-solid', 5) + '</g>')


def cross(cx, cy, s=1):
    return path('M%s %s l%s %s M%s %s l%s %s' % (cx - 11 * s, cy - 11 * s, 22 * s, 22 * s, cx + 11 * s, cy - 11 * s, -22 * s, 22 * s), 'bad-solid', 5)


def tick(cx, cy):
    return path('M%s %s l8 9 l17 -21' % (cx - 12, cy), 'np-solid', 5)


def card(x, y, w, h, fam, stroke='bd', width=3):
    return ('<rect x="%s" y="%s" width="%s" height="%s" rx="20" fill="var(--%s-bg)" stroke="var(--%s-%s)" stroke-width="%s"/>'
            % (x, y, w, h, fam, fam, stroke, width))


def left(x, y, value, size=20, fill='ink'):
    return text(x, y, value, size, fill, 'start')


def main():
    import math
    # Two goals (mockup A): two cards; the first lights, the second fades
    b = beat(1, card(110, 20, 300, 380, 'gray') + patient(180, 50, 1.0) + text(260, 330, 'Relieve the symptoms', 24)
             + card(450, 20, 300, 380, 'np') + heart_img(525, 40, 150) + shield(670, 210, 1.2) + text(600, 330, 'Protect the heart', 24, 'np-ink'))
    b += beat(2, card(110, 20, 300, 380, 'cat', 'solid', 4) + patient(180, 50, 1.0) + text(260, 330, 'Relieve the symptoms', 24, 'cat-ink')
              + '<rect x="448" y="18" width="304" height="384" rx="20" fill="var(--page)" opacity=".62"/>')
    save('at-goals', 'Two goals: relieve the symptoms, and protect the heart', b)

    # GTN (mockup A): the patient at each stop of a 10-minute line
    b = ''
    for i, (x, time, heading) in enumerate([(130, '0 min', 'GTN under the tongue'), (430, '5 min', 'Still pain: repeat'), (730, '10 min', 'Still pain: ambulance')]):
        ink = 'bad-ink' if i == 2 else 'ink'
        fig = ambulance(x, 110) if i == 2 else patient(x - 95, 40, .62) + spray(x + 40, 115)
        b += beat(i + 1, fig + text(x, 205, time, 25, ink) + text(x, 237, heading, 19, ink) + (arrow(x - 165, 115, x - 115, 115) if i else ''))
    b += beat(4, text(430, 292, 'NO → cGMP ↑ → veins relax', 21) + text(430, 324, 'Headache · flushing · sit down if light-headed', 18, 'muted'))
    b += beat(5, rect(190, 352, 480, 52, 'bad') + text(430, 386, 'Never with sildenafil', 21, 'bad-ink'))
    save('at-gtn', 'GTN at zero minutes, again at five, an ambulance at ten if the pain stays', b)

    # The first drug (mockup A): two doors, the patient between them, his tags point the way
    def door(x, fam):
        return ('<rect x="%s" y="30" width="170" height="250" rx="8" fill="var(--%s-bg)" stroke="var(--%s-bd)" stroke-width="3"/>' % (x, fam, fam)
                + '<circle cx="%s" cy="165" r="7" fill="var(--%s-bd)"/>' % (x + 148, fam))
    b = beat(1, door(130, 'cat') + concept(165, 320, 'bb', 'B', 'cat') + door(560, 'gray') + text(645, 130, 'CCB', 34, 'gray-ink')
             + text(645, 320, 'Calcium channel blocker', 19) + patient(370, 120, .75) + text(430, 70, 'or', 22, 'muted'))
    b += beat(2, rect(0, 140, 118, 40, 'gray', 20) + text(59, 166, 'Pulse · BP', 16)
              + rect(742, 140, 118, 40, 'sol', 20) + text(801, 166, 'Asthma', 17, 'sol-ink')
              + text(430, 368, 'Chosen for the patient', 20))
    b += beat(3, text(645, 404, 'Verapamil, diltiazem: not with HFrEF or heart block', 16, 'muted'))
    save('at-first', 'First-line doors: a beta-blocker or a calcium channel blocker, chosen for the patient', b)

    # Up to the highest tolerated dose (mockup A): bisoprolol's dial stops at his pulse, not at 20 mg
    cx, cy, r = 300, 330, 210
    pos = {'2.5': .06, '5': .3, '10': .56, '20 mg': .97}

    def at(f, rr):
        a = math.pi * (1 - f)
        return cx + rr * math.cos(a), cy - rr * math.sin(a)

    def arc(f, color):
        x2, y2 = at(f, r)
        return ('<path d="M%s %s A%s %s 0 0 1 %.1f %.1f" fill="none" stroke="var(--%s)" stroke-width="28" stroke-linecap="round"/>'
                % (cx - r, cy, r, r, x2, y2, color))

    def needle(f):
        x2, y2 = at(f, r - 40)
        return path('M%s %s L%.1f %.1f' % (cx, cy, x2, y2), 'ink', 7) + '<circle cx="%s" cy="%s" r="11" fill="var(--ink)"/>' % (cx, cy)

    def pulse(v, bad=False):
        return (rect(600, 110, 200, 104, 'bad' if bad else 'gray', 16) + text(700, 146, 'Pulse', 18, 'muted')
                + text(700, 192, v, 36, 'bad-ink' if bad else 'ink'))
    marks = ''.join(text('%.0f' % at(f, r + 36)[0], '%.0f' % (at(f, r + 36)[1] + 6), v, 17, 'muted') for v, f in pos.items())
    b = beat(1, arc(1, 'border') + marks + concept(cx - 70, cy + 52, 'bb', 'B', 'cat', 19))
    steps = [('2.5', '78'), ('5', '64'), ('10', '52')]
    for i, (d, pv) in enumerate(steps):
        b += beat(i + 1, arc(pos[d] + .02, 'cat-bd') + needle(pos[d]) + pulse(pv, d == '10'), until=i + 2 if i < 2 else None)
    b += beat(3, text(700, 252, 'Stop here', 22, 'bad-ink') + text(700, 280, 'not at 20 mg', 18, 'muted'))
    b += beat(4, text(700, 340, 'Review in 2–4 weeks', 19) + text(700, 368, 'Limit: pulse or BP', 19, 'muted'))
    save('at-titrate', 'Bisoprolol titrated step by step until the pulse, not the licensed maximum, stops it', b)

    # The add-on (mockup C): the heart slows, the artery opens, the rate-limiting CCB crossed between
    b = beat(1, heart_img(70, 10, 180) + concept(90, 262, 'bb', 'B', 'cat', 19) + text(160, 300, 'Highest tolerated dose', 17, 'muted')
             + text(160, 326, 'Still angina', 17, 'muted') + text(680, 60, 'The artery', 19, 'muted'))
    b += beat(1, vessel(560, 130, 240, spasm=True), until=2)
    b += beat(2, vessel(560, 130, 240) + concept(570, 262, 'dhp', 'D', 'se', 19) + text(680, 300, 'Amlodipine · nifedipine MR', 17, 'se-ink')
              + text(680, 326, 'Ankle swelling · flushing', 16, 'muted'))
    b += beat(3, text(430, 190, 'With a beta-blocker', 18, 'bad-ink') + rect(320, 210, 220, 52, 'bad') + concept(348, 243, 'rlccb', 'C', 'cat', 16)
              + cross(430, 300, 1.2))
    b += beat(4, text(430, 380, 'Slow pulse · heart block · heart failure', 17, 'bad-ink'))
    save('at-addon', 'Beta-blocker plus a dihydropyridine; never verapamil or diltiazem with it', b)

    # Still symptomatic? (mockup C): a traffic light, green, then red, then amber
    lights = [(85, 'bad-solid'), (210, 'sol-solid'), (335, 'np-solid')]
    b = beat(1, '<rect x="110" y="20" width="150" height="380" rx="34" fill="var(--sc-line)"/>'
             + ''.join('<circle cx="185" cy="%s" r="50" fill="var(--%s)" opacity=".2"/>' % (y, c) for y, c in lights)
             + left(300, 34, 'On two drugs', 20, 'muted'))
    b += beat(1, '<circle cx="185" cy="335" r="50" fill="var(--np-solid)"/>' + left(300, 330, 'Controlled', 24, 'np-ink')
              + left(300, 362, 'Continue · no third drug', 19, 'muted'))
    b += beat(2, '<circle cx="185" cy="85" r="50" fill="var(--bad-solid)"/>' + left(300, 92, 'Still in pain', 24, 'bad-ink')
              + left(300, 124, 'Angiography → PCI or CABG', 21))
    b += beat(3, '<circle cx="185" cy="210" r="50" fill="var(--sol-solid)"/>' + left(300, 205, 'A third drug', 24, 'sol-ink')
              + left(300, 237, 'Only while waiting, or if PCI or CABG', 19, 'muted') + left(300, 263, 'is unsuitable or declined', 19, 'muted'))
    save('at-escalation', 'Two drugs: controlled, continue; still in pain, angiography; a third drug only while waiting', b)

    # Protect the heart (mockup B): his own medicine list, the protecting ones light green
    rows = ['GTN', 'Bisoprolol 10 mg', 'Aspirin 75 mg', 'Atorvastatin 80 mg', 'Ramipril', 'BP 132/80', 'Stop smoking']
    notes = {2: 'Consider · weigh bleeding', 3: 'Whatever the cholesterol', 4: 'Consider with diabetes', 5: 'Treat high BP', 6: 'Exercise · diet · weight'}
    b = beat(1, patient(0, 150, .8) + '<rect x="160" y="14" width="330" height="396" rx="14" fill="var(--surface)" stroke="var(--border-strong)" stroke-width="2"/>'
             + left(185, 52, 'His medicines', 18, 'muted') + ''.join(left(185, 100 + i * 46, v, 20, 'text') for i, v in enumerate(rows)))
    for n, i in enumerate(range(2, 7)):
        y = 100 + i * 46
        b += beat(n + 2, '<rect x="172" y="%s" width="306" height="38" rx="9" fill="var(--np-bg)"/>' % (y - 26)
                  + left(185, y, rows[i], 20, 'np-ink') + tick(458, y - 8) + left(510, y, notes[i], 19, 'np-ink'))
    b += beat(6, shield(80, 90, 1.3))
    save('at-protect', 'His medicine list: aspirin, atorvastatin, ramipril, blood pressure and lifestyle protect the heart', b)

    # Angina with a normal angiogram (mockup B): two zoom circles on the painted heart
    b = beat(1, heart_img(330, 20, 200) + path('M390 120 L232 140', 'muted', 2.5) + path('M470 190 L628 150', 'muted', 2.5)
             + '<circle cx="140" cy="150" r="92" fill="var(--surface)" stroke="var(--muted)" stroke-width="3"/>'
             + path('M60 128 H105 Q140 146 175 128 H220 M60 172 H105 Q140 154 175 172 H220', 'primary', 5)
             + '<circle cx="720" cy="150" r="92" fill="var(--surface)" stroke="var(--muted)" stroke-width="3"/>'
             + path('M650 150 h40 l35 -26 m-35 26 l35 26 m-12 -42 l30 -14 m-30 70 l30 12', 'primary', 3)
             + text(140, 278, 'Vasospastic', 23) + text(720, 278, 'Microvascular', 23))
    b += beat(2, text(140, 316, 'CCB first', 21, 'se-ink') + text(140, 344, 'nitrate if needed', 18, 'muted') + text(140, 376, 'Avoid beta-blockers', 18, 'bad-ink'))
    b += beat(3, text(720, 316, 'Beta-blocker or CCB', 21, 'se-ink') + text(720, 344, 'Spasm-led: CCB', 18, 'muted'))
    b += beat(4, text(430, 400, 'Treat risk factors', 21))
    save('at-normal', 'Zoom circles: a spastic artery and the small vessels, with the treatment for each', b)

    # Back to the hook (mockup C): the hook card, the answer filled in
    b = beat(1, '<rect x="20" y="20" width="620" height="380" rx="16" fill="var(--surface)" stroke="var(--border)" stroke-width="2"/>'
             + '<rect x="20" y="20" width="620" height="6" rx="3" fill="var(--primary)"/>'
             + left(50, 80, '61 · diabetes · hypertension · IHD', 21, 'text') + left(50, 120, 'Chest pain on a hill, twice a week', 21, 'text')
             + left(50, 160, 'Bisoprolol 10 mg · pulse 52 · BP 132/80', 21, 'text')
             + left(50, 222, 'Best next step in management?', 25, 'primary') + patient(680, 140, .95))
    b += beat(2, path('M232 170 H316', 'bad-solid', 4) + left(50, 262, 'Pulse 52: no room to raise bisoprolol', 19, 'bad-ink'))
    b += beat(3, rect(50, 296, 260, 56, 'np', 28) + text(180, 332, 'Amlodipine', 23, 'np-ink') + tick(345, 324))
    b += beat(4, '<rect x="380" y="296" width="230" height="56" rx="28" fill="var(--gray-bg)" stroke="var(--gray-bd)" stroke-width="2" opacity=".7"/>'
              + text(495, 332, 'Verapamil', 21, 'muted') + path('M400 325 H590', 'bad-solid', 4))
    save('at-solve', 'The hook again: pulse 52 stops the titration; amlodipine is added, not verapamil', b)

    # The spare drugs' card pictures (mockup A), and the title page's shield
    b = vessel(15, 61, 115) + '<path d="M80 8 L114 23 V47 Q112 73 80 88 Q48 73 46 47 V23 Z" fill="var(--surface)" stroke="var(--primary)" stroke-width="4"/>'
    b += path('M65 45 l11 12 l22 -25', 'primary', 4)
    save('at-prevention-mini', 'A shield protecting a coronary artery', b, '0 0 160 100')
    b = ('<circle cx="70" cy="56" r="34" fill="var(--surface)" stroke="var(--se-solid)" stroke-width="4"/>' + path('M70 56 V34 M70 56 H88', 'se-solid', 4)
         + '<path d="M118 14 a18 18 0 1 0 18 22 a14 14 0 1 1 -18 -22z" fill="var(--sol-bd)"/>')
    save('at-spare-nitrate', 'A clock and the moon: a nitrate-low night', b, '0 0 160 100')
    b = ('<path d="M30 52 Q80 14 130 52 Q80 92 30 52 Z" fill="var(--cat-bg)" stroke="var(--cat-solid)" stroke-width="4"/>'
         + '<circle cx="92" cy="60" r="9" fill="var(--surface)" stroke="var(--bad-solid)" stroke-width="4"/>')
    save('at-spare-nico', 'A mouth with an ulcer', b, '0 0 160 100')
    b = ('<path d="M28 54 Q75 18 122 54 Q75 90 28 54 Z" fill="var(--surface)" stroke="var(--primary)" stroke-width="4"/>'
         + '<circle cx="75" cy="54" r="13" fill="var(--primary)"/>' + path('M126 26 l10 -12 M134 40 l14 -4 M134 56 l14 4', 'sol-solid', 4))
    save('at-spare-iva', 'An eye seeing flashes of light', b, '0 0 160 100')
    b = (path('M10 60 h18 l6 -34 l7 46 l5 -12 h22 q22 -30 44 0 h38', 'ink', 3.5) + path('M41 82 H116', 'bad-solid', 3.5)
         + text(78, 98, 'QT', 15, 'bad-ink'))
    save('at-spare-rano', 'An ECG with a long QT', b, '0 0 160 100')

    # Text-free thumbnail source: the established patient, heart and prevention shield.
    b = '<rect width="860" height="484" fill="#F7F9FC"/>' + patient(100, 65, 1.8) + heart(580, 255, .9)
    b += '<g transform="translate(595 292) scale(1.2)">' + (OUT / 'at-prevention-mini.svg').read_text(encoding='utf-8').split('>', 1)[1].rsplit('</svg>', 1)[0] + '</g>'
    save('at-cover', 'The patient with coronary disease, symptom treatment and prevention', b, '0 0 860 484')


if __name__ == '__main__':
    main()
