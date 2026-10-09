# Turns the approved drawings in art/drafts/ into the small WebP files the site uses (art/site/).
# Run by hand after a drawing is approved: python art/make_site_images.py
# It needs Pillow, so it runs on the author's machine only; build.py just copies art/site/ into the build.
# The drafts (large PNGs from Codex) stay out of git; art/site/ is committed.
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
DRAFTS, SITE = os.path.join(HERE, "drafts"), os.path.join(HERE, "site")
SKY = (0xE3, 0xEE, 0xF9)  # the pages' sky blue (--sky in engine/css/index.css)

# Drawings that stand on the sky-blue pages lose their background, so the pattern runs behind the figures and no
# edge shows. published name: (draft file, width in pixels, crop box or None, background colour to remove)
CUTOUTS = {
    "hero-tall.webp": ("hero-tall.png", 900, (0, 700, 1536, 2048), SKY),
    "hero-wide.webp": ("hero-wide.png", 1400, (700, 0, 2400, 1028), SKY),
    "covers/statistics.webp": ("line-cover-statistics.png", 800, None, None),
    "covers/cardiology.webp": ("line-cover-cardiology.png", 800, None, None),
    "covers/nephrology.webp": ("line-cover-nephrology.png", 800, None, None),
    "covers/neurology.webp": ("line-cover-neurology.png", 800, None, None),
}

# published name: (draft file, width in pixels)
IMAGES = {
    "thumbs/data-types.webp": ("line-1.png", 640),
    "thumbs/centre-shape-spread.webp": ("line-2.png", 640),
    "thumbs/standard-error.webp": ("line-se.png", 640),
    "thumbs/hypothesis-testing.webp": ("line-ht.png", 640),
    "thumbs/testing-a-difference.webp": ("line-5.png", 640),
    "thumbs/ci-and-p.webp": ("line-6.png", 640),
    "thumbs/errors.webp": ("line-7.png", 640),
    "thumbs/power.webp": ("line-8.png", 640),
}


def colour_to_alpha(im, ref):
    """Removes a background colour: each pixel becomes the least-transparent colour that, laid over ref, gives it
    back (as GIMP's Colour to Alpha), so line art keeps its anti-aliasing and soft shapes turn into tints."""
    a = np.asarray(im.convert("RGB"), dtype=float)
    ref = np.array(ref, dtype=float)
    hi = np.where(a > ref, (a - ref) / np.maximum(255 - ref, 1), 0)
    lo = np.where(a < ref, (ref - a) / np.maximum(ref, 1), 0)
    alpha = np.clip(np.max(np.maximum(hi, lo), axis=2), 0, 1)
    alpha[alpha < 0.05] = 0  # the faint grain of a flat background, which would only weigh down the file
    rgb = np.clip((a - ref) / np.maximum(alpha, 1e-6)[..., None] + ref, 0, 255)
    rgb[alpha == 0] = ref  # one flat colour under the clear parts, which compresses to almost nothing
    return Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")


def cut_out_paper(im, ref=(255, 255, 255), near=232):
    """A drawing on near-white paper: clears only the paper that reaches the edge of the picture, so white coats,
    sheets and boards inside the figures stay solid."""
    from PIL import ImageDraw
    rgb = im.convert("RGB")
    a = np.asarray(rgb)
    # a copy: an image made straight from an array shares its memory and flood fill would not write to it
    paper = Image.fromarray(np.where(a.min(axis=2) >= near, 255, 0).astype(np.uint8), "L").copy()
    w, h = paper.size
    for x, y in [(x, 0) for x in range(0, w, 6)] + [(x, h - 1) for x in range(0, w, 6)] + \
                [(0, y) for y in range(0, h, 6)] + [(w - 1, y) for y in range(0, h, 6)]:
        if paper.getpixel((x, y)) == 255:
            ImageDraw.floodfill(paper, (x, y), 128)
    outside = np.asarray(paper) == 128
    cut = np.asarray(colour_to_alpha(rgb, ref)).copy()
    cut[~outside, :3] = a[~outside]
    cut[~outside, 3] = 255
    return Image.fromarray(cut, "RGBA")


def pattern_tile(src, dest, size=600, strength=0.85):
    """The background tile: Codex's line icons moved onto the sky blue, their lines pulled most of the way back
    towards it so the pattern stays faint behind text."""
    p = np.asarray(Image.open(src).convert("RGB").resize((size, size), Image.LANCZOS), dtype=float)
    bg = np.median(p.reshape(-1, 3), axis=0)
    tile = np.clip(np.array(SKY, dtype=float) + (p - bg) * strength, 0, 255).astype(np.uint8)
    Image.fromarray(tile).save(dest, "WEBP", quality=82, method=6)


def save(im, out):
    dest = os.path.join(SITE, out)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    im.save(dest, "WEBP", quality=80, method=6, alpha_quality=70)
    print(f"{out}: {os.path.getsize(dest) // 1024} KB")


def main():
    for out, (src, w, box, ref) in CUTOUTS.items():
        path = os.path.join(DRAFTS, src)
        if not os.path.exists(path):
            print("missing:", src)
            continue
        im = Image.open(path).convert("RGB")
        if box:
            im = im.crop(box)
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        # a drawing on the sky blue loses that colour everywhere; one on the old near-white page loses only the
        # paper around the figures (cut against white, so its faint unevenness leaves no pale box)
        save(colour_to_alpha(im, ref) if ref else cut_out_paper(im), out)
    if os.path.exists(os.path.join(DRAFTS, "bg-pattern.png")):
        pattern_tile(os.path.join(DRAFTS, "bg-pattern.png"), os.path.join(SITE, "pattern.webp"))
        print("pattern.webp")
    for out, (src, w) in IMAGES.items():
        path = os.path.join(DRAFTS, src)
        if not os.path.exists(path):
            print("missing:", src)
            continue
        im = Image.open(path).convert("RGB")
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        save(im, out)


if __name__ == "__main__":
    main()
