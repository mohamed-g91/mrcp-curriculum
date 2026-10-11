# MRCP Gafar — Open knowledge

The selected book concept, redrawn as scalable SVG artwork. The right page forms a connected G; the mint fold is a straight triangle. The name uses the project's existing custom outlines, with MRCP at stroke weight 20 and Gafar at 11.

## Files

- `icon.svg`: primary flat symbol, white book and mint fold on #1F4E8C.
- `lockup.svg`: symbol with the name, without a tagline; for compact headers.
- `lockup-dark.svg`: the same lockup with lettering for dark backgrounds.
- `lockup-tagline.svg`: full name and the quieter outlined tagline.
- `icon-mono.svg`: white symbol on navy, with a knockout separating the fold.
- `icon-reversed.svg`: navy symbol on a white tile.
- `avatar.svg`: full-bleed blue square, with safe margins for a circular crop.
- `preview.svg` / `preview.png`: the visual review board.
- `icon-16.png`, `icon-32.png`, `icon-64.png`, `icon-180.png`, `icon-512.png`, `icon-1024.png`: raster exports.
- `youtube-800.png`: full-bleed square avatar export.

Logo and lockup SVGs contain vector paths only, with no external font, image or network dependencies. The review board's explanatory labels are ordinary text. PNG exports are generated from the SVGs using Sharp; no image generation is used for this redraw.

## Inspection

Inspected the visual board, full tagline lockup, 180 px symbol and native 16 and 32 px exports. The board also displays the 64 and 96 px symbol, light and dark header treatments, monochrome treatments and a circular avatar. The spine and G remain distinct at 16 px; the mint fold is a subtle accent at that size. These are representative header treatments using the site's current lettering, rather than screenshots of modified pages.

Every SVG was parsed as XML and checked for external assets, raster images and text dependencies. Circle crop safety was checked against the actual symbol extents. No curriculum content or engine behaviour is changed by this artwork package.

## Rebuild

`python brand/logo-proposals-2026-10-02/build-vector.py` redraws the SVGs. The script reads the current custom lettering from `engine/patterns.py`. To regenerate the PNGs, run `node brand/logo-proposals-2026-10-02/render-vector.cjs <path-to-installed-sharp>`.

Use the same silhouette at every size. Preserve its aspect ratio and the space inside the tile. Use the name-only lockup at compact sizes and reserve the tagline for larger contexts.
