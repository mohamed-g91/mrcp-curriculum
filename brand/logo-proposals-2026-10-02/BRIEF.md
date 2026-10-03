# MRCP Gafar — logo proposals

These are exploratory mockups. No replacement logo or change to the site's design rules has been approved.

## Brand drawn from the project

The name is **MRCP Gafar**, the tagline **Internal Medicine Education**, and the author Mohamed Gafar (`curriculum.yaml`). The intended scope is the whole MRCP curriculum. The current spine contains 23 statistics topics: five drafted and 18 planned. All five drafted topics currently have no video ID. This is a medical education brand centred on a named teacher, with room to grow beyond its first statistics series.

The core teaching promise is to make reasoning visible. A lesson opens with a clinical question, teaches a short process through pictures and staged reveals, then returns to the question. Practice applies the same process to original cases. First-attempt scoring, explanations after answers, and hints after mistakes support understanding rather than answer memorisation. Repeated patients, clinicians and examples make abstract material approachable.

The build creates two experiences from the same YAML: a candidate page with a chaptered video and practice, and a private presenter deck containing the teaching slides. Assets and fonts are embedded for offline use. Permanent IDs and `record()` prepare the platform for results, analytics and future authenticated content. A logo must suit both today's teaching channel and the future learning platform.

## Existing identity

`DESIGN.md` specifies a G incorporating a heartbeat and play button on a blue tile, with custom rounded stroke lettering. MRCP is heavier and navy; Gafar is lighter and blue. The master small symbol is `engine/logo.svg`; the large glossy version and exports are in `logo/`. Existing untracked `brand/` material explores head/brain symbols, heartbeat/play, stethoscope, G monograms, custom lettering, spacing and finishes. These proposals use a new dated directory and preserve that work.

The teaching pages use Outfit Medium headings, Inter body text, a primary blue of #1F4E8C, wordmark navy #12304F and blue #1F7FBF. The current logo uses mint #5EE0C4. Coral, green, purple, teal and olive have teaching meanings, so the logo should avoid treating those families as decorative rainbow branding.

## Requirements for the proposals

- Clear, personal, clinically credible and approachable.
- Recognisable symbol without its wordmark, with a strong Gafar connection.
- Useful in page headers, the corner of 1280 × 720 recorded lessons, and circular YouTube avatars.
- Broad enough for all internal medicine, rather than identifying only statistics or cardiology.
- Simple geometry suitable for a final offline SVG, with light/dark and single-colour versions.
- Retain the established name, tagline and blue-led wordmark hierarchy.
- Explore flat master symbols first so that the underlying shape can be judged independently of effects. The existing large glossy finish remains the documented production rule until a new direction is selected.

## Three directions

1. **Clinical signature** — refine the established G, short pulse and play symbol. Best continuity with the existing identity; the challenge is keeping all three elements legible at small sizes.
2. **Open knowledge** — two curved book leaves form a G, with a mint page-turn accent. Emphasises education across specialties; the challenge is making it a distinctive monogram rather than a generic book icon.
3. **Clear reasoning** — a G-shaped route with restrained junctions and a mint endpoint. Reflects the decision processes and progressive teaching; the challenge is preventing an abstract route from reading as a technology logo.

Each mockup presents the main lockup, a compact website treatment, a circular avatar and a single-colour symbol. Generated previews are raster concept art; they do not establish tested favicon geometry or production typography. A selected design should be redrawn in SVG and checked at 16, 32 and 64 px, in both themes and in the recording header before replacing the current identity.

## Review scope

Reviewed: README, AGENTS.md, DESIGN.md, curriculum spine, all five topic structures and their teaching examples, build/render integration, custom lettering, CSS tokens and home-page layout, scoring and event hooks, and existing rendered logo exploration sheets. The in-app browser blocked local-file navigation; assessment of the existing visuals used local rendered artwork and source inspection. Content-only validation was attempted with the installed and bundled Python runtimes, but neither has PyYAML, so validation did not run. No dependency was installed for this design review. This is not a clinical accuracy audit or a full interaction regression check.

Generation: built-in image generation. The exact prompts are saved alongside this brief.

## Saved mockups and recommendation

- `01-clinical-signature.png`: the revised clinical signature board.
- `02-open-knowledge.png`: the education-led book/monogram board.
- `03-clear-reasoning.png`: the reasoning-led route/monogram board.

Preferred direction: **02 — Open knowledge**, selected by the author for further refinement. It places education at the centre and stays relevant across internal medicine. Refine the right page into a clearer G, replace the curved mint wedge with a simple page fold, retain the heavier MRCP/lighter Gafar hierarchy, and reduce the tagline's prominence. The compact header version should omit the tagline. Keep the book silhouette recognisable and avoid adding more medical or video symbols. A refined raster preview remains a proposal; the production identity and DESIGN.md rules have not been replaced.
