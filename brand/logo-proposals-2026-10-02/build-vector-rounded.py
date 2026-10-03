"""Round the wider G's inner crossbar while retaining its book silhouette.

Reads the authored v2 paths, then uses the shared builder for every new asset.
No earlier revision or production page is modified.
"""
import importlib.util
from pathlib import Path
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("book_logo", HERE / "build-vector.py")
logo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(logo)
NS = {"s": "http://www.w3.org/2000/svg"}
source = HERE / "open-knowledge-vector-v2"
paths = ET.parse(source / "icon.svg").findall("s:path", NS)
logo.LEFT, logo.RIGHT, logo.FOLD = [p.attrib["d"] for p in paths]
logo.FOLD_EDGE = ET.parse(source / "icon-mono.svg").findall("s:path", NS)[-1].attrib["d"]
before = logo.symbol()

# A semicircular 8.5-unit cap replaces the two sharp corners at the crossbar
# tip. A four-unit inner elbow and six-unit outer turn soften its attachment.
# The crossbar stays 17 units thick; its left extent and overall G width stay put.
old = "C161 146 168 138 168 128 V122 H146 V105 H186 V132"
new = (
    "C161 146 168 138 168 128 V126 Q168 122 164 122 H154.5 "
    "A8.5 8.5 0 0 1 154.5 105 H180 Q186 105 186 111 V132"
)
if logo.RIGHT.count(old) != 1:
    raise ValueError("The wider G's source geometry has changed; review the corner refinement.")
logo.RIGHT = logo.RIGHT.replace(old, new)
logo.OUT = HERE / "open-knowledge-vector-v3"
logo.create_assets()

parts = [
    '<rect width="1000" height="510" fill="#FFFFFF"/>',
    logo.text(54, 42, "Before", 20, logo.NAVY),
    logo.text(554, 42, "Rounded inner corners", 20, logo.NAVY),
    f'<g transform="translate(128 80) scale({230 / 210})">{before}</g>',
    logo.icon_at(628, 80, 230),
    logo.name_at(54, 342, 51),
    logo.name_at(554, 342, 51),
    logo.icon_at(554, 438, 32), logo.icon_at(628, 430, 48),
    logo.text(54, 464, "Same width, book silhouette and lettering", 15),
]
(logo.OUT / "comparison.svg").write_text(
    logo.svg("".join(parts), 1000, 510, "MRCP Gafar — rounded inner G corners", "The wider book G before and after rounding its inner crossbar corners, shown at equal sizes."),
    encoding="utf-8",
)
