"""Makes the home page's Cairo: weight 500 cut down to the letters the home page uses, so it carries a few KB of
Arabic face instead of the whole font. cairo-home.woff2 holds the Arabic letters (HOME_ARABIC in build.py),
cairo-home-latin.woff2 the Latin letters inside the Arabic line (HOME_LATIN: MRCP), so they match the Arabic.
Run it again whenever the home page's Arabic changes; build.py fails if a letter is missing.
Needs fontTools and brotli (pip install fonttools brotli).

usage: python engine/fonts/make_cairo_home.py
"""
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(os.path.dirname(HERE)))
from build import HOME_ARABIC, HOME_LATIN  # noqa: E402


def make(src, text, out):
    font = instancer.instantiateVariableFont(TTFont(os.path.join(HERE, src)), {"wght": 500})
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]  # keep every shaping feature: the joined forms and ligatures depend on them
    opts.name_IDs = ["*"]
    s = subset.Subsetter(opts)
    s.populate(text="".join(sorted(set(text + " "))))
    s.subset(font)
    subset.save_font(font, os.path.join(HERE, out), opts)
    print("Made %s (%d bytes)" % (out, os.path.getsize(os.path.join(HERE, out))))


make("cairo-arabic.woff2", HOME_ARABIC, "cairo-home.woff2")
make("cairo-latin.woff2", HOME_LATIN, "cairo-home-latin.woff2")
# the letters they cover, for build.py to check against without fontTools
open(os.path.join(HERE, "cairo-home.txt"), "w", encoding="utf-8").write("".join(sorted(set(HOME_ARABIC + HOME_LATIN))) + "\n")
