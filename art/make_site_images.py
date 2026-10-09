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
SKY_SHAPES = (0xD2, 0xE4, 0xF6)  # the soft shapes Codex drew behind the figures, removed too: cut by the picture's
                                  # edge they would show as a box

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


def cut_out(im, ref, tol):
    """Clears only the background that reaches the edge of the picture (pixels within tol of ref, flood-filled from
    the border), so coats, sheets and boards inside the figures stay solid and the page's pattern never shows through
    them; the cleared edge keeps its anti-aliasing (colour to alpha against ref)."""
    from PIL import ImageDraw
    rgb = im.convert("RGB")
    a = np.asarray(rgb)
    near = np.abs(a.astype(int) - np.array(ref)).max(axis=2) <= tol
    # a copy: an image made straight from an array shares its memory and flood fill would not write to it
    mask = Image.fromarray(np.where(near, 255, 0).astype(np.uint8), "L").copy()
    w, h = mask.size
    for x, y in [(x, 0) for x in range(0, w, 4)] + [(x, h - 1) for x in range(0, w, 4)] + \
                [(0, y) for y in range(0, h, 4)] + [(w - 1, y) for y in range(0, h, 4)]:
        if mask.getpixel((x, y)) == 255:
            ImageDraw.floodfill(mask, (x, y), 128)
    outside = np.asarray(mask) == 128
    cut = np.asarray(colour_to_alpha(rgb, ref)).copy()
    cut[~outside, :3] = a[~outside]
    cut[~outside, 3] = 255
    return Image.fromarray(cut, "RGBA")


def trim(im, margin=16):
    """Crops a cut-out to its drawing, so the page sizes the figures rather than empty sky."""
    box = im.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
    if not box:
        return im
    l, t, r, b = box
    return im.crop((max(l - margin, 0), max(t - margin, 0), min(r + margin, im.width), min(b + margin, im.height)))


def pattern_tile(src, dest, size=600, strength=1.0, weight=5):
    """The background tile: Codex's line icons moved onto the sky blue, their hairlines thickened (a minimum filter
    spreads the darker lines) so they read at a glance, in a tint quiet enough to sit behind text."""
    from PIL import ImageFilter
    src_im = Image.open(src).convert("RGB").filter(ImageFilter.MinFilter(weight))
    p = np.asarray(src_im.resize((size, size), Image.LANCZOS), dtype=float)
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
        if ref:
            # the hero on sky blue: its soft background shapes become sky first, so they go with it, and the picture
            # is cropped to the figures
            a = np.asarray(im).astype(int)
            # every colour between the shapes and the sky (their anti-aliased edges too) counts as sky
            lo, hi = np.minimum(SKY, SKY_SHAPES), np.maximum(SKY, SKY_SHAPES)
            a[((a >= np.array(lo) - 4) & (a <= np.array(hi) + 4)).all(axis=2)] = SKY
            save(trim(cut_out(Image.fromarray(a.astype(np.uint8), "RGB"), ref, 8)), out)
        else:
            # a cover on the old near-white page: the paper around the figures goes
            save(cut_out(im, (255, 255, 255), 24), out)
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
        # thumbnails sit straight on the white lesson card: their paper goes too, so no box shows
        save(cut_out(im, (255, 255, 255), 24), out)


if __name__ == "__main__":
    main()
