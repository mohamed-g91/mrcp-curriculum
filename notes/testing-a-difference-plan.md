# Testing a difference (lesson 5): plan

Planned with the user 2026-10-02. **Built 2026-10-02** as `content/statistics/testing-a-difference.yaml` (status draft), cases c01–c10 approved as drafted. New story kinds `samples`, `means`, `gaps`, `twose`, `far`, `nrows` (engine/js/story.js) and the chained `working` (`rows`, `head`, `results`). Next: user review of the built deck, then approval, recording, push. Same trial and numbers as lesson 4: SD 15, 200 per group, gap 4 mmHg,
SEM 15 ÷ √200 ≈ 1.1, SE of the difference 15 × √(2 ÷ 200) = 1.5, 4 ÷ 1.5 = 2.7 SEs, p ≈ 0.008; 40 people: SE 4.7, 0.85 SEs, p ≈ 0.4.
No warm-up.

## Slides agreed so far

| # | Slide | What it shows |
| --- | --- | --- |
| 1 | Hook: Same gap, different p | 4 mmHg in 400 people p = 0.008; in 40 people p = 0.4. Why? |
| 2 | Means differ, SD stays | Mockup B: left bell of people (mean 140, ±1 SD 15 band shaded purple); one tap adds the right bell (mean 141, SD 15) with the first bell dashed behind it. Words: "Means differ · SD stays 15" |
| 3 | How far do means move? | Mockup 3A (no teal band): slide 2's two means (140, 141) drop as dots, ringed, on an axis of means 135–145; more samples of 200; pile; narrow teal bell over the dot pile, arrow SEM 1.1, "15 ÷ √200 ≈ 1.1" top right; y "% of samples" per half-mmHg |
| 4 | How big a gap can chance make? | Mockup 4C: left, slide 2's pair of means 140 and 141 with a bracket "Gap 1", arrow to the right; right, a dot pile of gaps with a dashed vertical line at 0. Placebo-vs-placebo pairs: gap 141 − 140 = 1 drops on an axis of gaps round 0; more pairs; pile; bell, SE of the difference = 15 × √(2 ÷ 200) = 1.5 (wider: both means move) |
| 5 | Why 2 SEs? | Mockup 6B: bell in SEs from 0, dashed 2 SE lines, 2.5% olive beyond each, chips "5% = 1 in 20" and "Past 2 SE → p < 0.05", "Fisher, 1925"; no trial dot (the 4 first lands on slide 6); under the "SEs from 0" axis a double-headed teal arrow from −2 to +2 SE, "95% of trials", so the 5% left is 2.5% each side. Taps: bell, 2 SE lines, 95% arrow, the two 2.5% tails, "5% = 1 in 20" + Fisher, "Past 2 SE → p < 0.05". 1.96 said aloud only |
| 6 | How far out is 4? | Mockup 5A: labels "1 SE", "2 SE", "3 SE" over the lines, dot labelled "2.7 SEs", tails olive (thickened) labelled 0.4% each, chip "p ≈ 0.008"; dashed line at 0. The chance bell with dashed vertical lines at 1, 2 and 3 SE of the difference, both sides; our trial's 4 lands, lit, at 2.7 SEs (shown, not calculated on the slide); tails, p ≈ 0.008 |
| 7 | Why does size matter? | Mockup 7C: two rows on one shared gap axis (−15 to 15), true to scale; 400 people (SE 1.5) above with dashed 2 SE lines, 40 people (SE 4.7) below with dashed 1 SE lines only (4 sits inside even 1 SE); a dotted line drops from 4 through both rows; "2.7 SEs" / "0.85 SEs" beside the dots (not calculated); olive tails; p pills ≈ 0.008 and ≈ 0.4 on the right. Rework of kind `ncompare` |
| 8 | Back to the trial | Mockup 8C (chosen 2026-10-02 over the first build's two columns of pills): a chain per trial, SE → SEs out → p, equal chips joined by arrows, steps heading the columns (`rows`, `head`): SE = 15 × √(2 ÷ n) = 1.5 / ≈ 4.7; 4 ÷ SE = 2.7 / 0.85 SEs; p = 0.008 / 0.4. Answer: "Same gap. More people, smaller SE: 4 lands further out, so p is smaller." No CI line (lesson 6) |

Order swapped by the user 2026-10-02: Why 2 SEs? before How far out is 4?. Slides 3, 4 and 6 replace the old 16-tap gap slide (no drug-and-placebo pairs: chance gaps only, as in lesson 4's placebo-only trials).

## Points settled

- Slides 4 and 5 keep minus signs on the gap axis ("Gap between means (mmHg)", −6 to 6): chance gaps fall both ways (lesson 4's no-minus rule does not apply here).

- The SD does feed the SE (SE = SD × √(2 ÷ n)); slide 2 says only that the means move and the SD stays.
- The SD's own effect on the SE goes in a case, not a slide.
- A two-sample z-test in effect; not named on slides (Choosing the right test names tests).

## Cases (approved 2026-10-02; as built in the YAML)

c01 solved hook trial significant (2.7 SEs) · c02 SE of a difference, 50 per group SD 10 → 2 · c03 4 × people → SE 3 → 1.5 · c04 same gap, 60 vs 600
people · c05 gap 3, SE 2 → 1.5 SEs, ns · c06 why SE of a difference > SEM · c07 twist: each arm against baseline (Bland and Altman, Trials
2011;12:264, check) · c08 weight: 200 per group, 6.5 vs 4 kg, SD 10 → SE 1, 2.5 SEs · c09 1.8 SEs → ns, p ≈ 0.07
