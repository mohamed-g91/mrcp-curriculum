"""Draw the selected book/G logo as offline SVG assets, without changing the site.

Run from any directory: python brand/logo-proposals-2026-10-02/build-vector.py
The symbol is defined once; every colour treatment uses identical geometry.
"""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from engine.patterns import lettering

OUT = Path(__file__).resolve().parent / "open-knowledge-vector"
BLUE, NAVY, NAME, MINT = "#1F4E8C", "#12304F", "#1F7FBF", "#5EE0C4"
LEFT = "M40 44 C65 44 87 51 101 69 V174 C86 161 65 163 51 152 C43 146 40 139 40 129 Z"
RIGHT = (
    "M109 69 C125 50 148 44 174 44 V74 H151 "
    "C135 74 125 87 125 105 V125 C125 138 130 145 140 146 "
    "C151 144 158 137 158 128 V122 H140 V105 H176 V132 "
    "C176 152 159 160 140 164 C127 166 118 169 109 174 Z"
)
FOLD = "M151 74 H174 L151 97 Z"
FOLD_EDGE = "M151 74 H174"


def symbol(*, mono=False, background=BLUE, foreground="#FFFFFF", tile=True):
    parts = [f'<rect width="210" height="210" rx="44" fill="{background}"/>'] if tile else []
    parts += [f'<path d="{LEFT}" fill="{foreground}"/>', f'<path d="{RIGHT}" fill="{foreground}"/>']
    parts.append(f'<path d="{FOLD}" fill="{foreground if mono else MINT}"/>')
    if mono:
        # A narrow cut separates the white fold from the white top edge.
        # This is the same fold geometry, with a knockout rather than a new mark.
        parts.append(f'<path d="{FOLD_EDGE}" stroke="{background}" stroke-width="4"/>')
    return "".join(parts)


def svg(body, width, height, title, description=""):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'width="{width}" height="{height}" role="img" aria-labelledby="title desc">'
        f'<title id="title">{title}</title><desc id="desc">{description}</desc>{body}</svg>\n'
    )


def icon_at(x, y, size, **kwargs):
    return f'<g transform="translate({x} {y}) scale({size / 210})">{symbol(**kwargs)}</g>'


def name_at(x, y, height, dark=False, mono=False):
    # Use the same outlined custom name as the current site, not a font substitute.
    body = lettering("MRCP Gafar")
    body = body.replace('class="wm-caps"', f'stroke="{"#FFFFFF" if dark else NAVY}"')
    body = body.replace('class="wm-name"', f'stroke="{"#FFFFFF" if dark and mono else "#6FB3E6" if dark else NAME}"')
    if mono:
        body = body.replace(f'stroke="{NAME}"', f'stroke="{NAVY}"')
    body = re.sub(r'\sclass="wm-letters"', "", body)
    view = re.search(r'viewBox="([^"]+)"', body).group(1)
    values = [float(v) for v in view.split()]
    width = values[2] / values[3] * height
    return body.replace('<svg ', f'<svg x="{x}" y="{y}" width="{width:g}" height="{height}" ', 1)


# A small outlined uppercase alphabet for the fixed tagline. No installed or
# remote fonts are needed by any delivered logo or lockup SVG.
TAG_LETTERS = {
    "I": (34, "M17 4 V96"),
    "N": (80, "M8 96 V4 L72 96 V4"),
    "T": (72, "M4 4 H68 M36 4 V96"),
    "E": (64, "M56 4 H8 V96 H56 M8 50 H49"),
    "R": (74, "M8 96 V4 H38 A25 25 0 0 1 38 54 H8 M40 54 L66 96"),
    "A": (80, "M4 96 L40 4 L76 96 M19 60 H61"),
    "L": (62, "M8 4 V96 H56"),
    "M": (96, "M8 96 V4 L48 64 L88 4 V96"),
    "D": (80, "M8 4 V96 H30 C84 96 84 4 30 4 Z"),
    "C": (92, "M86 20 A48 48 0 1 0 86 80"),
    "U": (80, "M8 4 V66 C8 111 72 111 72 66 V4"),
    "O": (92, "M46 0 C-10 0 -10 100 46 100 C102 100 102 0 46 0 Z"),
}


def tagline_at(x, y, height=20, colour="#56657A"):
    paths, cursor = [], 0
    for char in "INTERNAL MEDICINE EDUCATION":
        if char == " ":
            cursor += 40
            continue
        advance, d = TAG_LETTERS[char]
        paths.append(f'<path transform="translate({cursor} 0)" d="{d}"/>')
        cursor += advance + 19
    return (
        f'<g transform="translate({x} {y}) scale({height / 110})" fill="none" '
        f'stroke="{colour}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">'
        + "".join(paths) + '</g>'
    )


def text(x, y, value, size=16, fill="#56657A"):
    # Text here labels the review board only. The logo assets themselves are paths.
    return f'<text x="{x}" y="{y}" font-family="Segoe UI,Arial,sans-serif" font-size="{size}" fill="{fill}">{value}</text>'


def create_assets():
    OUT.mkdir(exist_ok=True)
    desc = "An open book: its right page forms a G with a mint folded corner."
    assets = {
        "icon.svg": svg(symbol(), 210, 210, "MRCP Gafar — Open knowledge", desc),
        "icon-mono.svg": svg(symbol(mono=True, background=NAVY), 210, 210, "MRCP Gafar — monochrome", desc),
        "icon-reversed.svg": svg(symbol(mono=True, background="#FFFFFF", foreground=NAVY), 210, 210, "MRCP Gafar — reversed monochrome", desc),
        "lockup.svg": svg(icon_at(0, 0, 96) + name_at(119, 13, 70), 642, 96, "MRCP Gafar", desc),
        "lockup-dark.svg": svg(icon_at(0, 0, 96) + name_at(119, 13, 70, dark=True), 642, 96, "MRCP Gafar — for dark backgrounds", desc),
        "lockup-tagline.svg": svg(icon_at(0, 0, 140) + name_at(172, 15, 78) + tagline_at(182, 107, 22), 755, 140, "MRCP Gafar — Internal Medicine Education", desc),
        # Full-bleed square designed for a circular platform crop. The outer tile
        # is replaced by the same solid background; symbol geometry is unchanged.
        "avatar.svg": svg(f'<rect width="210" height="210" fill="{BLUE}"/>' + symbol(tile=False), 210, 210, "MRCP Gafar avatar", desc),
    }
    board = [
        '<rect width="1360" height="910" fill="#FFFFFF"/>',
        text(54, 42, "Open knowledge / vector refinement", 20, NAVY),
        icon_at(54, 112, 234),
        name_at(333, 155, 130),
        tagline_at(350, 307, 26),
        text(54, 419, "Header scale", 17),
        text(704, 419, "Dark background", 17),
        '<rect x="54" y="438" width="602" height="72" rx="12" fill="#F7F9FC"/>',
        icon_at(78, 459, 30), name_at(119, 463.5, 21),
        text(321, 482, "Statistics · Types of data", 14),
        '<rect x="704" y="438" width="602" height="72" rx="12" fill="#0E1826"/>',
        icon_at(728, 459, 30), name_at(769, 463.5, 21, dark=True),
        text(971, 482, "Statistics · Types of data", 14, "#A5B3C5"),
        text(54, 580, "Native sizes", 17),
        text(704, 580, "One colour", 17),
    ]
    for x, size in ((54, 16), (150, 32), (260, 64), (401, 96)):
        board.extend((icon_at(x, 610 + (96 - size) / 2, size), text(x, 736, f"{size} px", 14)))
    board += [icon_at(704, 610, 96, mono=True, background=NAVY),
              icon_at(836, 610, 96, mono=True, background="#FFFFFF", foreground=NAVY),
              text(1030, 580, "Circular avatar", 17),
              '<defs><clipPath id="avatar-crop"><circle cx="1078" cy="658" r="48"/></clipPath></defs>',
              f'<g clip-path="url(#avatar-crop)"><rect x="1030" y="610" width="96" height="96" fill="{BLUE}"/>' + icon_at(1030, 610, 96, tile=False) + '</g>',
              text(54, 829, "Book silhouette · connected G · mint page fold · existing custom lettering", 18, NAVY),
              text(54, 864, "Offline SVG artwork. Header examples show scale; this proposal has not replaced the site's logo.", 14)]
    assets["preview.svg"] = svg("".join(board), 1360, 910, "MRCP Gafar — refined open-book logo", "Review board with header treatments, native icon sizes, monochrome versions and a circular avatar.")
    for filename, body in assets.items():
        (OUT / filename).write_text(body, encoding="utf-8")
    print(f"Drew {len(assets)} SVG files in {OUT}")


if __name__ == "__main__":
    create_assets()
