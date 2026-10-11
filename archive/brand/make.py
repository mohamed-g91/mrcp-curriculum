# Builds the logo SVGs. Run: python brand/make.py
import pathlib
OUT = pathlib.Path(__file__).parent
BLUE0, BLUE1 = "#1F7FBF", "#1B5A96"
TEAL0, TEAL1 = "#3DB39A", "#1C8FB0"
NAVY = "#12304F"
FONT = "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800&amp;display=swap');"

HEAD = ("M92,362 C70,300 40,252 40,190 C40,100 100,40 170,40 C232,40 268,92 272,146 "
        "L302,196 L283,206 C289,216 290,222 283,230 C290,240 287,250 277,258 "
        "C273,270 262,276 248,276 L237,292 L233,362 Z")
LOBES = [(78,108,46),(128,78,44),(48,170,44),(62,236,42),(118,270,36),(160,120,40)]

def defs(uid):
    return f"""<defs>
  <linearGradient id="b{uid}" gradientUnits="userSpaceOnUse" x1="40" y1="40" x2="300" y2="362"><stop offset="0" stop-color="{BLUE0}"/><stop offset="1" stop-color="{BLUE1}"/></linearGradient>
  <linearGradient id="t{uid}" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="300"><stop offset="0" stop-color="{TEAL0}"/><stop offset="1" stop-color="{TEAL1}"/></linearGradient>
  <clipPath id="L{uid}"><rect x="-20" y="0" width="195" height="400"/></clipPath>
  <clipPath id="H{uid}"><path d="{HEAD}"/></clipPath>
</defs>"""

def mark(uid, segments=True, rays=True, head=None, brain=None, cut="#fff", tri=None):
    head = head or f"url(#b{uid})"
    brain = brain or f"url(#t{uid})"
    tri = tri or brain
    lobes = "".join(f'<circle cx="{x}" cy="{y}" r="{r}"/>' for x,y,r in LOBES)
    s = [f'<path d="{HEAD}" fill="{head}"/>',
         f'<g clip-path="url(#L{uid})" fill="{brain}">{lobes}<rect x="40" y="90" width="140" height="170"/></g>',
         f'<line x1="175" y1="30" x2="175" y2="372" stroke="{cut}" stroke-width="7"/>']
    if segments:
        s.append(f'<g stroke="{cut}" stroke-width="6" fill="none" stroke-linecap="round">'
                 '<path d="M175,130 C140,130 120,110 110,70"/>'
                 '<path d="M140,175 C100,175 70,160 40,150"/>'
                 '<path d="M150,210 C120,240 100,250 70,285"/>'
                 f'<path d="M175,250 L233,300" clip-path="url(#H{uid})"/>'
                 f'<path d="M175,90 L268,150" clip-path="url(#H{uid})"/></g>')
    s.append(f'<circle cx="175" cy="175" r="44" fill="{cut}"/>')
    s.append(f'<path d="M162,152 L200,175 L162,198 Z" fill="{tri}" stroke="{tri}" stroke-width="6" stroke-linejoin="round"/>')
    if rays:
        import math
        cx, cy = 140, 170
        g = [f'<g stroke="{brain}" stroke-width="9" stroke-linecap="round">']
        for a in (-165,-135,-105,-75,-50):
            r = math.radians(a)
            g.append(f'<line x1="{cx+175*math.cos(r):.1f}" y1="{cy+175*math.sin(r):.1f}" x2="{cx+205*math.cos(r):.1f}" y2="{cy+205*math.sin(r):.1f}"/>')
        g.append('</g>')
        s += g
    return "\n".join(s)

def logo(name, body, w=1024, h=560):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">\n<style>{FONT}</style>\n<rect width="{w}" height="{h}" fill="#fff"/>\n{body}\n</svg>\n'
    (OUT / name).write_text(svg, encoding="utf-8")

T = 'font-family="Montserrat,Arial,sans-serif"'
# A: faithful to the original
logo("logo-a.svg", defs("a") + f'''
<g transform="translate(150,90) scale(1.05)">{mark("a")}</g>
<text x="530" y="250" {T} font-weight="800" font-size="92" fill="{NAVY}" letter-spacing="2">MRCP</text>
<text x="530" y="350" {T} font-weight="800" font-size="92" fill="{NAVY}" letter-spacing="2">GAFAR</text>
<text x="532" y="405" {T} font-weight="500" font-size="32" fill="{NAVY}">Internal Medicine</text>
<text x="532" y="447" {T} font-weight="500" font-size="32" fill="{NAVY}">Education</text>''')

# B: simplified mark, clearer type hierarchy, one-line tagline
logo("logo-b.svg", defs("b") + f'''
<g transform="translate(150,100)">{mark("b", segments=False, rays=False)}</g>
<text x="520" y="262" {T} font-weight="800" font-size="104" fill="{NAVY}" letter-spacing="1">MRCP</text>
<text x="522" y="340" {T} font-weight="500" font-size="62" fill="{BLUE0}" letter-spacing="14">GAFAR</text>
<rect x="524" y="372" width="56" height="5" rx="2.5" fill="{TEAL0}"/>
<text x="524" y="420" {T} font-weight="500" font-size="21" fill="#56657A" letter-spacing="3">INTERNAL MEDICINE EDUCATION</text>''')

# C: app-icon tile (works as favicon / YouTube avatar) + horizontal wordmark
logo("logo-c.svg", defs("c") + f'''
<rect x="110" y="120" width="320" height="320" rx="72" fill="url(#bc)"/>
<g transform="translate(142,142) scale(0.72)">{mark("c", segments=False, rays=False, head="#fff", brain="#9BE3D2", cut="#1E6FAE", tri="#fff")}</g>
<text x="490" y="268" {T} font-weight="800" font-size="100" fill="{NAVY}">MRCP <tspan font-weight="500" fill="{BLUE0}">Gafar</tspan></text>
<text x="494" y="330" {T} font-weight="500" font-size="30" fill="#56657A" letter-spacing="3">Internal Medicine Education</text>''', w=1200)
