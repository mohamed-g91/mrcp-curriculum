# Open knowledge — refinement

The author prefers option 02. The useful idea is already present: an open book with a personal monogram hidden in its right page. Improve its construction and hierarchy rather than adding symbols.

1. **Clearer G:** add a short crossbar joined to the lower-right page, so the shape reads as G as well as book.
2. **Simpler fold:** replace the quarter-circle mint wedge with a crisp triangular page corner. Align it to the page, leave breathing room around the crossbar, and preserve its silhouette in one colour.
3. **Lighter name:** keep MRCP bold navy, give Gafar lighter rounded blue lettering, and balance the spacing between them.
4. **Quieter tagline:** use smaller muted slate lettering with less tracking. The compact website header needs only the symbol and name.
5. **Flat master:** one solid blue tile, white pages and a mint fold. Consistent geometry across the main mark, avatar and monochrome version.

The refinement image is a raster visual proposal. If adopted, redraw the selected geometry in SVG, check the central spine and G counter at 16, 32 and 64 px, test circular cropping and both site themes, then update the production assets and DESIGN.md together. The exact generated lettering is not a production font specification.

Saved preview: `02-open-knowledge-v2.png`. The generated revision successfully quietens the tagline and removes it from the compact header. The G geometry, fold and lighter name lettering remain close to the original despite the requested changes; these still need deliberate vector refinement. Treat the five points above as the design specification, not a claim that the raster revision achieves every point.

## Authored vector refinement

The redraw is now in `open-knowledge-vector/`. The right page has a connected G crossbar, the mint fold is a straight triangle, and the name uses the existing project's heavier MRCP/lighter Gafar custom outlines. The tagline is smaller and muted, with its own outlined lettering; the compact lockup omits it. The folder includes standalone SVGs, monochrome and dark-background treatments, native PNG sizes, a circular-crop-safe avatar and a rendered review board. These assets implement the refinement rather than relying on the generated image to establish the geometry.

## Wider G

The author found the first vector G too tall and narrow beside the G in the wordmark. `open-knowledge-vector-v2/` widens the right page, rounds the inner space and shortens the crossbar; the spine and left page shift slightly to make room. Both complete vector packages are preserved. The comparison board shows the two shapes at equal sizes with identical lettering, so the proportion change can be judged directly.

## Rounded inner corners

`open-knowledge-vector-v3/` rounds the wider G's crossbar tip and attachment while keeping its thickness and the surrounding book geometry. All vector and raster treatments share the revised path; the new comparison board shows v2 and v3 at equal sizes.
