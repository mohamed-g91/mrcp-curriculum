"""A wider book-page G, compared with the first vector refinement.

Keeps the first vector package intact. Run this script, then render-vector.cjs
with open-knowledge-vector-v2 as its asset-directory argument.
"""
import importlib.util
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("book_logo", HERE / "build-vector.py")
logo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(logo)

# Capture the previous geometry for comparison before refining the three paths.
old_symbol = logo.symbol()
logo.OUT = HERE / "open-knowledge-vector-v2"
logo.LEFT = "M30 44 C55 44 77 51 91 69 V174 C76 161 55 163 41 152 C33 146 30 139 30 129 Z"
logo.RIGHT = (
    "M99 69 C122 49 150 44 182 44 V74 H151 "
    "C130 74 117 87 117 108 C117 130 130 146 149 146 "
    "C161 146 168 138 168 128 V122 H146 V105 H186 V132 "
    "C186 152 169 160 146 164 C124 166 111 169 99 174 Z"
)
logo.FOLD = "M151 74 H182 L151 97 Z"
logo.FOLD_EDGE = "M151 74 H182"
logo.create_assets()

board = [
    '<rect width="1360" height="830" fill="#FFFFFF"/>',
    logo.text(54, 51, "Current", 22, logo.NAVY),
    logo.text(754, 51, "Wider G", 22, logo.NAVY),
    f'<g transform="translate(190 101) scale({260 / 210})">{old_symbol}</g>',
    logo.icon_at(890, 101, 260),
    logo.name_at(54, 418, 72),
    logo.name_at(754, 418, 72),
    logo.text(54, 546, "Tall, narrow inner space", 18),
    logo.text(754, 546, "Broader page, rounder inner space, shorter crossbar", 18),
]
for x in (54, 754):
    if x == 54:
        for offset, size in ((0, 32), (110, 64)):
            board.append(f'<g transform="translate({x + offset} {610 + (64-size)/2}) scale({size/210})">{old_symbol}</g>')
    else:
        board.extend((logo.icon_at(x, 626, 32), logo.icon_at(x+110, 610, 64)))
    board.extend((logo.text(x, 707, "32 px", 14), logo.text(x+110, 707, "64 px", 14)))
board.append(logo.text(54, 788, "Same lettering and colours; only the book/G proportions change.", 17, logo.NAVY))
(logo.OUT / "comparison.svg").write_text(
    logo.svg("".join(board), 1360, 830, "MRCP Gafar — current and wider G", "Two equal-size book symbols compared beside the same rounded wordmark, with native-size examples."),
    encoding="utf-8",
)
