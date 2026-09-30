# Mockup sheet: three ways to join the heartbeat play (concept 1) with the G monogram (concept 3). Run: python mix.py
import pathlib
OUT = pathlib.Path(__file__).parent
FONT = "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800&amp;display=swap');"
W, T = "#fff", "#9BE3D2"

def g(width):  # the G's ring, open at the top right, ending at the bar's height
    return f'<path d="M140,60 A56,56 0 1 0 156,100" fill="none" stroke="{W}" stroke-width="{width}" stroke-linecap="round"/>'

def play(x0, x1, h):
    return f'<path d="M{x0},{100-h} L{x1},100 L{x0},{100+h} Z" fill="{T}" stroke="{T}" stroke-width="7" stroke-linejoin="round"/>'

ICONS = {
  # A: the whole heartbeat play sits inside the G; the play's tip becomes the bar
  "Inside the G": g(20) + f'''
<path d="M60,100 H70 L77,82 L85,118 L91,100 H96" fill="none" stroke="{W}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
{play(100, 124, 15)}<path d="M126,100 H156" stroke="{W}" stroke-width="20" stroke-linecap="round"/>''',
  # B: the play sits in the G; the bar is the heartbeat
  "Heartbeat bar": g(18) + f'''
{play(76, 106, 19)}
<path d="M112,100 H120 L126,86 L134,114 L140,100 H156" fill="none" stroke="{W}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>''',
  # C: the heartbeat runs in from outside, through the G's wall, into the play and out as the bar
  "Through the G": f'<g mask="url(#gap)">{g(20)}</g>' + f'''
<path d="M22,100 H72 L79,82 L87,118 L93,100 H98" fill="none" stroke="{W}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
{play(102, 126, 15)}<path d="M128,100 H156" stroke="{W}" stroke-width="20" stroke-linecap="round"/>''',
}

defs = f'<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2383C4"/><stop offset="1" stop-color="#1B5A96"/></linearGradient><mask id="gap" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><rect width="200" height="200" fill="#fff"/><path d="M22,100 H72" stroke="#000" stroke-width="19" stroke-linecap="round"/></mask></defs>'
F = 'font-family="Montserrat,Arial,sans-serif"'
rows = []
for i, (name, icon) in enumerate(ICONS.items()):
    y = 40 + i * 290
    rows.append(f'''
<text x="40" y="{y+20}" {F} font-weight="700" font-size="22" fill="#56657A">{"ABC"[i]}  {name}</text>
<g transform="translate(40,{y+40})"><rect width="210" height="210" rx="48" fill="url(#bg)"/><g transform="translate(5,5)">{icon}</g></g>
<text x="290" y="{y+150}" {F} font-weight="800" font-size="78" fill="#12304F">MRCP <tspan font-weight="500" fill="#1F7FBF">Gafar</tspan></text>
<text x="294" y="{y+198}" {F} font-weight="500" font-size="24" fill="#56657A" letter-spacing="3">Internal Medicine Education</text>
<g transform="translate(1000,{y+80})"><rect width="64" height="64" rx="15" fill="url(#bg)"/><g transform="scale(0.32)">{icon}</g></g>
<g transform="translate(1100,{y+96})"><rect width="32" height="32" rx="8" fill="url(#bg)"/><g transform="scale(0.16)">{icon}</g></g>''')
Wd, Ht = 1200, 900
(OUT / "mix.svg").write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {Wd} {Ht}" width="{Wd}" height="{Ht}"><style>{FONT}</style><rect width="{Wd}" height="{Ht}" fill="#fff"/>{defs}{"".join(rows)}</svg>', encoding="utf-8")
