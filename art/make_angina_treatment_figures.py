"""Lesson 3 artwork; run python art/make_angina_treatment_figures.py.

Existing story/art pattern, token colours and cardiology patient/heart artwork.
Clinical copy follows notes/angina-treatment-plan.md; concepts are filled from YAML slots.
No imports from the other figure generators: they write files at import time.
"""
from html import escape
from pathlib import Path
import re
import sys

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


def main():
    b = beat(1, heart(125, 196, .52) + lines(125, 350, ['Supply and demand'], 20))
    b += beat(2, text(530, 36, 'Slow the heart', 25, 'cat-ink') + path('M310 66 h18 l8 -14 l12 29 l9 -15 h30', 'cat-solid')
              + concept(305, 110, 'bb', 'B', 'cat') + concept(535, 110, 'rlccb', 'C', 'cat', 18)
              + concept(305, 157, 'iva', 'I', 'cat') + text(657, 157, 'Demand ↓', 20, 'cat-ink'))
    b += beat(3, text(530, 219, 'Open the vessels', 25, 'se-ink')
              + concept(305, 265, 'dhp', 'D', 'se', 18) + concept(628, 265, 'nitrate', 'N', 'se')
              + concept(305, 312, 'nico', 'K', 'se') + text(660, 312, 'Load ↓ / supply ↑', 20, 'se-ink'))
    b += beat(4, concept(305, 368, 'rano', 'R', 'gray') + text(665, 368, 'Outside the two groups', 18))
    save('at-families', 'Two drug groups: heart rate and vascular load or supply', b)

    b = ''
    for i, (x, time, heading, detail) in enumerate([(135, '0 min', 'GTN under the tongue', 'Pain or planned exertion'), (430, '5 min', 'Pain persists: repeat GTN', ''), (725, '10 min', 'Pain persists: ambulance', '')]):
        b += beat(i+1, text(x, 36, time, 27) + (ambulance(x, 100) if i == 2 else spray(x, 100))
                  + text(x, 167, heading, 20) + text(x, 198, detail, 18, 'muted')
                  + (arrow(x-195, 99, x-75, 99) if i else ''))
    b += beat(4, text(430, 270, 'NO → cGMP ↑ → veins relax → preload ↓', 23)
              + text(430, 311, 'Headache · flushing · light-headedness', 20, 'muted') + text(430, 339, 'Sit down if light-headed', 18, 'muted'))
    b += beat(5, rect(40, 363, 780, 55, 'bad') + text(430, 386, 'GTN + sildenafil / other PDE5 inhibitors: avoid', 20, 'bad-ink') + text(430, 409, 'Severe hypotension', 18, 'bad-ink'))
    save('at-gtn', 'GTN doses at zero and five minutes; persistent pain at ten minutes needs an ambulance', b)

    b = beat(1, text(430, 32, 'First line', 26) + path('M430 48 V63 H220 V85 M430 63 H650 V85')
             + concept(115, 115, 'bb', 'B', 'cat') + text(430, 115, 'OR', 20, 'muted') + text(650, 115, 'Calcium channel blocker', 22))
    b += beat(2, path('M650 131 V150 H490 V172 M650 150 H740 V172')
              + concept(345, 204, 'rlccb', 'C', 'cat', 18) + concept(620, 204, 'dhp', 'D', 'se', 17)
              + text(430, 249, 'Choose by pulse, BP and comorbidities', 22))
    b += beat(3, text(430, 292, 'Active asthma: a suitable CCB', 22) + text(430, 323, 'Verapamil/diltiazem: no HFrEF or conduction disease', 19, 'muted'))
    b += beat(4, path('M190 395 h60 v-12 h60 v-12 h60', 'primary') + text(560, 374, 'Titrate as tolerated', 23) + text(560, 406, 'Review in 2–4 weeks', 20, 'muted'))
    save('at-first', 'First-line beta-blocker or calcium channel blocker, followed by dose review', b)

    b = beat(1, concept(70, 61, 'bb', 'B', 'cat') + heart(160, 165, .33)
              + lines(160, 282, ['Highest tolerated dose', 'Still angina'], 19))
    b += beat(2, arrow(280, 150, 490, 150) + concept(535, 61, 'dhp', 'D', 'se', 21)
              + vessel(570, 150, 190) + lines(665, 250, ['Amlodipine · felodipine', 'Nifedipine MR'], 20))
    b += beat(3, rect(30, 315, 800, 55, 'bad') + concept(65, 349, 'rlccb', 'C', 'cat')
              + text(565, 349, 'With beta-blocker: avoid', 21, 'bad-ink'))
    b += beat(4, text(430, 392, 'Bradycardia · AV block · worsening heart failure', 20, 'bad-ink')
              + text(430, 418, 'Amlodipine: ankle swelling · flushing · headache', 18, 'muted'))
    save('at-second', 'Add a dihydropyridine CCB; avoid verapamil or diltiazem with a beta-blocker', b)

    b = beat(1, text(430, 32, 'Two anti-anginal drugs', 26) + path('M430 49 V70 H205 V100 M430 70 H655 V100')
              + text(205, 129, 'Controlled', 24) + text(655, 129, 'Still symptomatic', 24)
              + down(205, 147, 173) + down(655, 147, 173)
              + lines(205, 206, ['Continue', 'No third drug'], 23) + text(655, 206, 'Coronary angiography', 23))
    b += beat(2, down(655, 223, 252) + text(655, 282, 'Consider PCI or CABG', 24))
    b += beat(3, lines(430, 346, ['Third drug: waiting for revascularisation,', 'or intervention unsuitable or declined'], 21, 29))
    save('at-escalation', 'Two-drug symptom control and escalation to angiography or revascularisation', b)

    b = beat(1, vessel(35, 45, 170, stent=True) + text(535, 51, 'Elective PCI for stable disease', 25))
    b += beat(2, rect(35, 104, 430, 88, 'np') + lines(250, 139, ['Aspirin + clopidogrel', 'Usually 6 months'], 23)
              + text(250, 221, 'No oral anticoagulation; low bleeding risk', 18, 'muted'))
    b += beat(3, arrow(480, 148, 550, 148) + lines(700, 130, ['Then one antiplatelet', 'Aspirin or clopidogrel,', 'as prescribed'], 20, 27))
    b += beat(4, vessel(40, 350, 160, stent=True, blocked=True)
              + lines(535, 345, ['Unplanned early interruption → stent thrombosis', 'May present as STEMI'], 21, 32, 'bad-ink'))
    save('at-stent', 'Elective coronary stent antiplatelet course and risk from unplanned interruption', b)

    b = beat(1, text(215, 36, 'Vasospastic', 25) + vessel(140, 95, 150, spasm=True)
              + text(645, 36, 'Microvascular', 25) + path('M560 100 h65 l50 -20 m-50 20 l50 25 m-50 -25 v40', 'primary', 4)
              + path('M675 80 l45 -15 m-45 15 l45 15 m-45 30 l45 -12 m-45 12 l45 18', 'primary', 3))
    b += beat(2, lines(215, 186, ['CCB first', 'Add nitrate if needed'], 24, 38)
              + lines(215, 280, ['Avoid beta-blockers', 'in isolated spasm'], 21, 28, 'bad-ink'))
    b += beat(3, lines(645, 186, ['Beta-blocker or CCB', 'Spasm-led: CCB'], 24, 38))
    b += beat(4, text(430, 367, 'Treat risk factors', 23))
    save('at-normal', 'Mechanism-directed treatment for vasospastic and microvascular angina', b)

    b = beat(1, patient(32, 70, .65) + lines(265, 65, ['61 years · diabetes', 'Hypertension · smoking', '70% proximal LAD'], 19, 30)
              + lines(215, 276, ['Bisoprolol 10 mg · pulse 52', 'BP 132/80', 'Preserved LV function'], 20, 33)
              + text(500, 65, '1', 25, 'muted') + concept(545, 65, 'bb', 'B', 'cat'))
    b += beat(2, down(645, 86, 122) + text(500, 163, '2', 25, 'muted') + text(660, 163, 'Pulse 52: no further titration', 20)
              + path('M95 285 H335', 'cat-solid', 3))
    b += beat(3, down(645, 182, 218) + text(500, 258, '3', 25, 'muted') + concept(545, 258, 'dhp', 'D', 'se', 20)
              + text(660, 304, 'Add amlodipine', 27, 'se-ink'))
    b += beat(4, text(430, 375, 'Verapamil + beta-blocker: avoid', 22, 'bad-ink'))
    save('at-solve', 'The same patient: pulse-limited bisoprolol and add-on amlodipine', b)

    b = vessel(15, 61, 115) + '<path d="M80 8 L114 23 V47 Q112 73 80 88 Q48 73 46 47 V23 Z" fill="var(--surface)" stroke="var(--primary)" stroke-width="4"/>'
    b += path('M65 45 l11 12 l22 -25', 'primary', 4)
    save('at-prevention-mini', 'A shield protecting a coronary artery', b, '0 0 160 100')
    save('at-rate-mini', 'A pulse trace', path('M8 12 H52 l8 -8 l12 16 l8 -8 H152', 'primary', 3), '0 0 160 24')

    # Small subject-specific illustrations for the five prevention cards.
    b = vessel(15, 55, 130)
    for x, y in [(53, 44), (73, 62), (101, 43)]:
        b += '<circle cx="%s" cy="%s" r="8" fill="var(--np-bg)" stroke="var(--primary)" stroke-width="2"/>' % (x, y)
    save('at-prevention-aspirin', 'Platelets kept apart inside an artery', b, '0 0 160 100')
    b = vessel(15, 55, 130) + '<path d="M55 33 Q80 67 105 33" fill="var(--sol-bg)" stroke="var(--primary)" stroke-width="3"/>'
    save('at-prevention-statin', 'An artery with an atherosclerotic plaque', b, '0 0 160 100')
    b = '<circle cx="80" cy="51" r="36" fill="var(--surface)" stroke="var(--primary)" stroke-width="4"/>' + path('M80 51 l20 -20 M80 19 v7 M48 51 h7 M112 51 h-7 M62 29 l5 5', 'primary')
    save('at-prevention-bp', 'A blood pressure gauge', b, '0 0 160 100')
    b = path('M40 65 H80 V30 H120 M80 30 V65 H120', 'primary', 4)
    b += '<rect x="58" y="43" width="44" height="18" rx="9" transform="rotate(-35 80 52)" fill="var(--np-bg)" stroke="var(--primary)" stroke-width="3"/>'
    save('at-prevention-ace', 'A tablet alongside a branching vessel', b, '0 0 160 100')
    b = rect(32, 54, 94, 15, 'gray', 2) + path('M103 55 v13 M48 39 Q38 29 50 19 M69 39 Q59 29 71 19', 'primary', 3)
    b += '<circle cx="80" cy="50" r="43" fill="none" stroke="var(--primary)" stroke-width="3"/>' + path('M48 82 L112 18', 'primary', 4)
    save('at-prevention-smoking', 'A crossed-out cigarette', b, '0 0 160 100')

    # Text-free thumbnail source: the established patient, heart and prevention shield.
    b = '<rect width="860" height="484" fill="#F7F9FC"/>' + patient(100, 65, 1.8) + heart(580, 255, .9)
    b += '<g transform="translate(595 292) scale(1.2)">' + (OUT / 'at-prevention-mini.svg').read_text(encoding='utf-8').split('>', 1)[1].rsplit('</svg>', 1)[0] + '</g>'
    save('at-cover', 'The patient with coronary disease, symptom treatment and prevention', b, '0 0 860 484')


def thumbnail():
    """Optional local render: python art/make_angina_treatment_figures.py --thumbnail.

    Needs Chrome and Pillow; normal SVG generation and the site build do not.
    """
    import subprocess
    import tempfile
    from PIL import Image
    root = OUT.parents[1]
    chrome = Path('C:/Program Files/Google/Chrome/Application/chrome.exe')
    with tempfile.TemporaryDirectory(prefix='mrcp-treatment-thumb-') as folder:
        scratch = Path(folder)
        html, png = scratch / 'thumbnail.html', scratch / 'thumbnail.png'
        css = (root / 'engine/css/tokens.css').read_text(encoding='utf-8')
        css += 'body{margin:0;background:#F7F9FC}svg{display:block;width:860px;height:484px}.sc-o{stroke:var(--sc-line);stroke-width:2.5;stroke-linejoin:round}'
        html.write_text('<!doctype html><meta charset="utf-8"><style>' + css + '</style>' +
                        (OUT / 'at-cover.svg').read_text(encoding='utf-8'), encoding='utf-8')
        subprocess.run([str(chrome), '--headless=new', '--no-first-run', '--hide-scrollbars',
                        '--user-data-dir=' + str(scratch / 'profile'), '--window-size=860,484',
                        '--screenshot=' + str(png), html.as_uri()], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        with Image.open(png) as source:
            im = source.convert('RGB').resize((640, 360), Image.Resampling.LANCZOS)
            exif = Image.Exif()
            exif[37510] = b'ASCII\x00\x00\x00Origin: local vector composite from art/make_angina_treatment_figures.py, using the established patient and heart artwork. No image generation.'
            im.save(root / 'art/site/thumbs/angina-treatment.webp', quality=90, exif=exif)
    print('art/site/thumbs/angina-treatment.webp')


if __name__ == '__main__':
    main()
    if '--thumbnail' in sys.argv:
        thumbnail()
