# Turns the approved drawings in art/drafts/ into the small WebP files the site uses (art/site/).
# Run by hand after a drawing is approved: python art/make_site_images.py
# It needs Pillow, so it runs on the author's machine only; build.py just copies art/site/ into the build.
# The drafts (large PNGs from Codex) stay out of git; art/site/ is committed.
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
DRAFTS, SITE = os.path.join(HERE, "drafts"), os.path.join(HERE, "site")

# published name: (draft file, width in pixels)
IMAGES = {
    "hero.webp": ("adult-hero-2.png", 1600),
    "thumbs/data-types.webp": ("line-1.png", 640),
    "thumbs/centre-shape-spread.webp": ("line-2.png", 640),
    "thumbs/standard-error.webp": ("line-se.png", 640),
    "thumbs/hypothesis-testing.webp": ("line-ht.png", 640),
    "thumbs/testing-a-difference.webp": ("line-5.png", 640),
    "thumbs/ci-and-p.webp": ("line-6.png", 640),
    "thumbs/errors.webp": ("line-7.png", 640),
    "thumbs/power.webp": ("line-8.png", 640),
    "covers/statistics.webp": ("line-cover-statistics.png", 800),
    "covers/cardiology.webp": ("line-cover-cardiology.png", 800),
    "covers/nephrology.webp": ("line-cover-nephrology.png", 800),
    "covers/neurology.webp": ("line-cover-neurology.png", 800),
}


def main():
    for out, (src, w) in IMAGES.items():
        path = os.path.join(DRAFTS, src)
        if not os.path.exists(path):
            print("missing:", src)
            continue
        im = Image.open(path).convert("RGB")
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        dest = os.path.join(SITE, out)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        im.save(dest, "WEBP", quality=80, method=6)
        print(f"{out}: {os.path.getsize(dest) // 1024} KB")


if __name__ == "__main__":
    main()
