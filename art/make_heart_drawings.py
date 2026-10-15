"""Codex's painted hearts for Coronary arteries and the ECG (art/drafts/cardiology, local only), each cropped to the
heart, its light background turned transparent so the page's own background (light or dark) shows through, and
saved small in content/figures: the whole heart from the front (Three arteries) and the heart cut across, as on an
echo's short axis (The mirror). The page places each back at its crop in the drawing's own 1672 x 941 grid, so the
points in the topic's YAML stay in the drawing's coordinates."""
import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# draft, figure, crop (left, top, right, bottom in the drawing's 1672 x 941 pixels); the crop is the topic's image_box
JOBS = [("heart-front.png", "heart-front", (400, 0, 1200, 900)),
        ("heart-section-a3.png", "heart-section", (320, 0, 1340, 870))]
SCALE = 0.6                  # the page shows them about half size; 0.6 keeps them sharp on a tablet


def colour_to_alpha(rgb, bg):
    """GIMP's colour to alpha: the least opacity that, laid over bg, still gives each pixel's colour."""
    a = np.zeros(rgb.shape[:2])
    for c in range(3):
        p, b = rgb[..., c], bg[c]
        # only what is darker than the background counts: the floor is a touch lighter, and should vanish
        a = np.maximum(a, np.where(p < b, (b - p) / b, 0))
    a = np.clip(a, 0, 1)
    safe = np.where(a > 0, a, 1)[..., None]
    fg = np.clip((rgb - (1 - a[..., None]) * bg) / safe, 0, 255)
    return np.dstack([fg, a * 255]).astype(np.uint8)


def make(src, name, crop):
    im = np.asarray(Image.open(os.path.join(ROOT, "art", "drafts", "cardiology", src)).convert("RGB")).astype(float)
    bg = np.median(np.concatenate([im[:20, :20].reshape(-1, 3), im[:20, -20:].reshape(-1, 3)]), axis=0)
    l, t, r, b = crop
    rgba = colour_to_alpha(im[t:b, l:r], bg).astype(float)
    # the faint floor shadow fades out towards the crop's edges, so no edge shows on the page
    h, w = rgba.shape[:2]
    edge = np.minimum.outer(np.minimum(np.arange(h), np.arange(h)[::-1]), np.minimum(np.arange(w), np.arange(w)[::-1]))
    rgba[..., 3] *= np.clip(edge / 40.0, 0, 1)
    out = Image.fromarray(rgba.astype(np.uint8), "RGBA")
    out = out.resize((round(out.width * SCALE), round(out.height * SCALE)), Image.LANCZOS)
    path = os.path.join(ROOT, "content", "figures", name + ".webp")
    out.save(path, "WEBP", quality=72, method=6, alpha_quality=60)
    print(path, os.path.getsize(path), "bytes")


if __name__ == "__main__":
    for job in JOBS:
        make(*job)
