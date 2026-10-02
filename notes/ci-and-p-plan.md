# Confidence intervals and p (lesson 6): plan

Proposed 2026-10-02. User agreed the slide list; ratios stay here (slide 7); slide 8 is a CI figure with a "worth having" line. Slide 3 mockups A/B/C sent (session scratchpad ci95/make.py), awaiting choice. Topic `stats.ci-and-p` (status planned). Leans on lesson 3 (95% CI of a mean = mean ± 2 SEM,
160 to 164 cm) and lesson 5 (SE of the difference 1.5, 2 SEs, 400 vs 40 people). Same trial and numbers throughout:
SD 15, 200 per group, gap 4 mmHg, SE 1.5, p ≈ 0.008, 95% CI = 4 ± 2 × 1.5 = 1 to 7 mmHg.
40 people: SE 4.7, CI = 4 ± 9.4 = −5.4 to 13.4, p ≈ 0.4. Two-sided throughout; 2 SE for 1.96, as in lessons 3 to 5.

## The question this lesson answers

p says whether a gap could be chance, not how big the effect is. The CI says both.

## Proposed slides

| # | Slide | What it shows | Figure |
| --- | --- | --- | --- |
| 1 | Hook: How big is the effect? | The trial: 4 mmHg, p = 0.008. "Not chance. But how big?" | Text, as lesson 5's hook |
| 2 | Where could the true effect be? | Our trial's bell round 4 (SE 1.5), 2 SE lines, middle 95%: CI 1 to 7 = 4 ± 2 × 1.5. Lesson 3's mean ± 2 SEM, now on a gap | Existing kind `ci`, first half only |
| 3 | What does 95% mean? | 20 repeat trials of the same drug, each with its CI as a bar, round a dashed true effect; one in 20 misses it (lit). "95% of such CIs catch the truth" | **New figure: 3 mockups** |
| 4 | Why do the CI and p agree? | Chance's bell round 0 (−3 to +3) and our CI round 4 (1 to 7) on one axis: 4 is more than 3 from 0 both ways, so 4 lies outside chance's 95% exactly when 0 lies outside ours | Existing kind `ci`, second half (needs mockups if reworked) |
| 5 | Sliding towards 0 | One CI of fixed width slides: 4 (1 to 7) p 0.008; 3 (0 to 6) p ≈ 0.05; 1.5 (−1.5 to 4.5) p ≈ 0.3 | Existing kind `slide`, the difference panel |
| 6 | Same gap, wider CI | 400 vs 40 people on lesson 5's two-row axis: 1 to 7 against −5.4 to 13.4; wide = unsure, crosses 0 = not significant | Lesson 5's `nrows` with CI bars (3 mockups) |
| 7 | A ratio: no effect is 1 | Relative risk 0.80 (0.65 to 0.98) misses 1; the line of no effect moves from 0 to 1 | `slide`, the ratio panel (see decision 2) |
| 8 | Significant or important? | CIs against 0 and a "worth having" line (e.g. 5 mmHg): huge trial 1 mmHg (0.6 to 1.4), small trial 10 mmHg crossing 0, our trial | Old reveal cards, or a new figure (3 mockups) |
| 9 | Back to the trial | Chain as lesson 5: SE 1.5 → 2 × 1.5 = 3 → 4 ± 3 = 1 to 7 → misses 0 → p < 0.05. Answer: "Probably a real fall, somewhere between 1 and 7 mmHg." | `working` with `rows` |

Checked numbers: huge trial 10,000 per group, SE = 15 × √(2 ÷ 10,000) ≈ 0.21, CI 1 ± 0.42 ≈ 0.6 to 1.4. 1.5 ÷ 1.5 = 1 SE, p = 0.32 ≈ 0.3;
3 ÷ 1.5 = 2 SEs, p ≈ 0.05 (0.046). Slide 3's 20 trials: CI half-width 3, centres drawn round a true effect (say 3 mmHg) with SE 1.5,
fixed so exactly one misses; our 4 (1 to 7) among them.

## Narration points

- "We are 95% confident the true effect is 1 to 7", not "a 95% chance it is in 1 to 7": the true effect is fixed; it is the CIs that move.
- The CI and p come from the same SE, so they always agree (for the same two-sided 5%).
- Width depends on SD and n (lesson 5), not on the effect.

## Practise

Warm-up (lesson 4 decided to keep a CI warm-up here): sort Significant / Not significant, from the moved items w03–w06, w08, with new IDs w01–w05,
plus new ones. Cases from the moved c01, c04, c05, c06, c07, c09 (new IDs here), and new:
- solved: 4 mmHg, SE 1.5 → CI 1 to 7 → significant
- build a CI from a gap and its SE
- what 95% confidence means (the misreading as an option)
- 4 × the people → CI half as wide
- given only the CI, is p above or below 0.05?

## Decisions for the user

1. The slide list and order above.
2. Ratios come in lesson 13 (Risk and odds). Keep slide 7 here with a one-line definition (risk on drug ÷ risk on placebo), or keep this
   lesson to differences only and move ratios and their cases to lesson 13?
3. Slide 8: keep the two reveal cards, or a CI figure with a "worth having" line?
