# Mockup sheet: three new logo ideas, each as an icon tile, a wordmark, and at 64 px and 32 px. Run: python concepts.py
import pathlib
OUT = pathlib.Path(__file__).parent
FONT = "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800&amp;display=swap');"
W, T = "#fff", "#9BE3D2"   # white and light teal on the blue tile

ICONS = {  # each drawn in a 200 x 200 box
  # 1: a heartbeat trace that runs into a play button
  "Heartbeat play": f'''
<path d="M28,100 H56 L68,66 L82,134 L92,100 H100" fill="none" stroke="{W}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M104,66 L158,100 L104,134 Z" fill="{T}" stroke="{T}" stroke-width="12" stroke-linejoin="round"/>''',
  # 2: a stethoscope whose chestpiece is the play button
  "Stethoscope": f'''<g transform="translate(-12,4)">
<g fill="none" stroke="{W}" stroke-width="11" stroke-linecap="round">
<path d="M62,34 V70 C62,112 118,112 118,70 V34"/>
<path d="M90,104 V126 C90,158 118,166 136,152"/></g>
<circle cx="62" cy="30" r="8" fill="{W}"/><circle cx="118" cy="30" r="8" fill="{W}"/>
<circle cx="146" cy="128" r="30" fill="{W}"/>
<path d="M137,114 L159,128 L137,142 Z" fill="#1E6FAE" stroke="#1E6FAE" stroke-width="5" stroke-linejoin="round"/></g>''',
  # 3: a G whose bar comes out of a play button's tip
  "G monogram": f'''
<path d="M137,63 A52,52 0 1 0 152,104" fill="none" stroke="{W}" stroke-width="22" stroke-linecap="round"/>
<path d="M116,104 H152" stroke="{W}" stroke-width="22" stroke-linecap="round"/>
<path d="M80,84 L106,100 L80,116 Z" fill="{T}" stroke="{T}" stroke-width="10" stroke-linejoin="round"/>''',
}

defs = '''<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2383C4"/><stop offset="1" stop-color="#1B5A96"/></linearGradient></defs>'''
F = 'font-family="Montserrat,Arial,sans-serif"'
rows = []
for i, (name, icon) in enumerate(ICONS.items()):
    y = 40 + i * 290
    rows.append(f'''
<text x="40" y="{y+20}" {F} font-weight="700" font-size="22" fill="#56657A">{i+1}  {name}</text>
<g transform="translate(40,{y+40})"><rect width="210" height="210" rx="48" fill="url(#bg)"/><g transform="translate(5,5)">{icon}</g></g>
<text x="290" y="{y+150}" {F} font-weight="800" font-size="78" fill="#12304F">MRCP <tspan font-weight="500" fill="#1F7FBF">Gafar</tspan></text>
<text x="294" y="{y+198}" {F} font-weight="500" font-size="24" fill="#56657A" letter-spacing="3">Internal Medicine Education</text>
<g transform="translate(1000,{y+80})"><rect width="64" height="64" rx="15" fill="url(#bg)"/><g transform="scale(0.32)">{icon}</g></g>
<g transform="translate(1100,{y+96})"><rect width="32" height="32" rx="8" fill="url(#bg)"/><g transform="scale(0.16)">{icon}</g></g>''')
Wd, Ht = 1200, 900
(OUT / "concepts.svg").write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {Wd} {Ht}" width="{Wd}" height="{Ht}"><style>{FONT}</style><rect width="{Wd}" height="{Ht}" fill="#fff"/>{defs}{"".join(rows)}</svg>', encoding="utf-8")
