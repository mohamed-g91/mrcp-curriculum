"""Codex's painted hearts for Coronary arteries and the ECG (art/drafts/cardiology, local only), each cropped to the
heart, its light background turned transparent so the page's own background (light or dark) shows through, and
saved small in content/figures (and Sol's line-drawn patient beside the slice, its background cleared): the whole heart from the front (Three arteries) and the heart cut across, as on an
echo's short axis (The mirror), and that slice alone, the rest of the heart masked away (Leads and walls). The page places each back at its crop in the drawing's own 1672 x 941 grid, so the
points in the topic's YAML stay in the drawing's coordinates."""
import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# draft, figure, crop (left, top, right, bottom in the drawing's 1672 x 941 pixels; the crop is the topic's
# image_box) and an optional oval (cx, cy, rx, ry) outside which the drawing is cleared
SLICE = (984, 596, 314, 256)   # the lifted slice, its cut face and its rim, in heart-section-a3
JOBS = [("heart-front.png", "heart-front", (400, 0, 1200, 900), None),
        ("heart-section-a3.png", "heart-section", (320, 0, 1340, 870), None),
        ("heart-section-a3.png", "heart-cut", (660, 330, 1310, 860), SLICE)]
SCALE = 0.6                  # the page shows them about half size; 0.6 keeps them sharp on a tablet


def colour_to_alpha(rgb, bg):
    """The heart solid, the page showing through round it: the heart is every pixel clearly darker than the
    background, its holes filled (pale highlights included); round it, the floor's grey shadow becomes a faint
    dark shadow, so it never shows as a pale smudge on a dark page."""
    from scipy import ndimage
    dark = ((bg - rgb) / bg).max(axis=2)
    # the floor's shadow is grey; the heart is coloured (even its blue-grey veins), or plainly dark
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    heart = ndimage.binary_fill_holes(ndimage.binary_closing((dark > .12) & ((sat > 28) | (dark > .35)), iterations=3))
    # a soft edge: a pixel or two of the heart's rim blends
    edge = np.clip(dark / .12, 0, 1)
    shade = np.clip(((bg - rgb) / bg).mean(axis=2), 0, 1) * .8
    a = np.where(heart, np.maximum(edge, ndimage.binary_erosion(heart, iterations=2)), shade)
    fg = np.where(heart[..., None], rgb, 0)
    # the rim's blended pixels take their colour back out of the background
    rim = heart & (a < 1)
    fg[rim] = np.clip((rgb[rim] - (1 - a[rim, None]) * bg) / np.maximum(a[rim, None], .05), 0, 255)
    return np.dstack([fg, a * 255]).astype(np.uint8)


def make(src, name, crop, oval):
    im = np.asarray(Image.open(os.path.join(ROOT, "art", "drafts", "cardiology", src)).convert("RGB")).astype(float)
    bg = np.median(np.concatenate([im[:20, :20].reshape(-1, 3), im[:20, -20:].reshape(-1, 3)]), axis=0)
    l, t, r, b = crop
    rgba = colour_to_alpha(im[t:b, l:r], bg).astype(float)
    # the faint floor shadow fades out towards the crop's edges, so no edge shows on the page
    h, w = rgba.shape[:2]
    edge = np.minimum.outer(np.minimum(np.arange(h), np.arange(h)[::-1]), np.minimum(np.arange(w), np.arange(w)[::-1]))
    rgba[..., 3] *= np.clip(edge / 40.0, 0, 1)
    if oval:
        # only the slice stays: everything outside the oval fades out over a few pixels
        cx, cy, rx, ry = oval
        yy, xx = np.mgrid[t:b, l:r]
        d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
        rgba[..., 3] *= np.clip((1 - d) * rx / 4.0 + .5, 0, 1)
    out = Image.fromarray(rgba.astype(np.uint8), "RGBA")
    out = out.resize((round(out.width * SCALE), round(out.height * SCALE)), Image.LANCZOS)
    path = os.path.join(ROOT, "content", "figures", name + ".webp")
    out.save(path, "WEBP", quality=72, method=6, alpha_quality=60)
    print(path, os.path.getsize(path), "bytes")


# Sol's line-drawn patient (Leads and walls), standing, no electrodes (the page draws them): the light background
# round him, everything joined to the frame's edge, turns transparent; his outline stops it
PATIENT = ("patient-leads-c.png", "patient-front", (180, 30, 900, 1400))


def make_line(src, name, crop):
    from scipy import ndimage
    im = np.asarray(Image.open(os.path.join(ROOT, "art", "drafts", "cardiology", src)).convert("RGB")).astype(float)
    bg = np.median(np.concatenate([im[:20, :20].reshape(-1, 3), im[:20, -20:].reshape(-1, 3)]), axis=0)
    l, t, r, b = crop
    rgb = im[t:b, l:r]
    near = np.abs(rgb - bg).max(axis=2) < 14
    lab, _ = ndimage.label(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    out = ~np.isin(lab, list(edge))
    # a soft rim of a pixel or two
    a = np.clip(ndimage.gaussian_filter(out.astype(float), .8) * 1.4, 0, 1)
    img = Image.fromarray(np.dstack([rgb, a * 255]).astype(np.uint8), "RGBA")
    img = img.resize((round(img.width * SCALE), round(img.height * SCALE)), Image.LANCZOS)
    path = os.path.join(ROOT, "content", "figures", name + ".webp")
    img.save(path, "WEBP", quality=78, method=6, alpha_quality=70)
    print(path, os.path.getsize(path), "bytes")


if __name__ == "__main__":
    for job in JOBS:
        make(*job)
    make_line(*PATIENT)
