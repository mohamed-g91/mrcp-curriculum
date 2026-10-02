# Confidence intervals and p (lesson 6): plan

**Built 2026-10-03** as `content/statistics/ci-and-p.yaml` (status draft), cases c01–c13 and warm-up w01–w08 as drafted (c11 keeps HbA1c in both units). New story kinds `runs`, `mirror`, `cibars`; `ci` gained `chance: false`, `slide` one full-width panel and a log axis for ratios (`factor`). A CI bar that crosses no effect is grey in `cibars` (slide 6's 40 people too). Both checks pass. Next: the user's review, then push with the new logo branch.

Proposed 2026-10-02. User agreed the slide list; ratios stay here (slide 7); slide 8 is a CI figure with a "worth having" line. Slide 3: mockup A2 chosen (20 stacked horizontal CIs, ✓/✕ per row, the one miss high at 4.6 to 10.6 with a dotted gap to the line, chips "19 in 20 catch 3" and "95%"); the dashed line reads "Say the truth is 3" (a made-up truth, as a simulation sets it; the narration says a high miss overstates the drug, misses fall either side, and the 95% belongs to the method, not to our one CI). Mockup script: session scratchpad ci95/make.py, make2.py. Topic `stats.ci-and-p` (status planned). Leans on lesson 3 (95% CI of a mean = mean ± 2 SEM,
160 to 164 cm) and lesson 5 (SE of the difference 1.5, 2 SEs, 400 vs 40 people). Same trial and numbers throughout:
SD 15, 200 per group, gap 4 mmHg, SE 1.5, p ≈ 0.008, 95% CI = 4 ± 2 × 1.5 = 1 to 7 mmHg.
40 people: SE 4.7, CI = 4 ± 9.4 = −5.4 to 13.4, p ≈ 0.4. Two-sided throughout; 2 SE for 1.96, as in lessons 3 to 5.

Mockups for slides 4, 6 and 8 (script ci95/make3.py): user chose **4C** (two bells of the same width round 0 and 4, chips "4 outside chance's 95%" / "0 outside our 95%"), **6C** (two CI bars with sums 4 ± 2 × 1.5, 4 ± 2 × 4.7 and half-widths 3, 9.4; p pills), **8B** (shaded zones too small / worth having) with chips "Significant · small", "Significant · worth having", "Not significant · not proven" (mockup 8B2). The 400-people chip reads "Significant · may be worth having" (agreed: its CI 1 to 7 straddles 5). Slide 8 numbers: 20,000 people 1 mmHg (0.6 to 1.4, p < 0.001); 30 people (15 per group) 10 mmHg, SE 15 × √(2 ÷ 15) ≈ 5.5, CI −1 to 21, p ≈ 0.07; worth-having line 5 mmHg (author's choice; check BPLTTC, Lancet 2021: about 10% fewer major CV events per 5 mmHg).

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

## Draft cases (2026-10-02, for the user's review)

Options are listed answer first; the page shuffles them. New topic, so IDs start at c01.

| ID | Case | Answer | Wrong options |
| --- | --- | --- | --- |
| c01 (solved) | The trial: 200 per group, 4 mmHg more on the drug, SE 1.5. 95% CI? | 1 to 7 mmHg | 2.5 to 5.5 (± 1 SE); −26 to 34 (± 2 SD) |
| c02 | 4 mmHg (95% CI 1 to 7). Significant at 5%? | Yes: the CI misses 0 | No: it does not include 1; Not without p |
| c03 | Weight 2 kg more (95% CI −0.5 to 4.5). Significant? | No: the CI includes 0 | Yes: misses 1; Yes: 2 kg more |
| c04 | Stroke, relative risk 0.80 (0.65 to 0.98). Significant? | Yes: the CI misses 1 | No: misses 0; No: too wide |
| c05 | Solvent and lung cancer, odds ratio 1.3 (0.9 to 1.8). Significant? | No: the CI includes 1 | Yes: OR above 1; Yes: misses 0 |
| c06 | 20,000 people, 1 mmHg (95% CI 0.6 to 1.4), p < 0.001. Conclusion? | Significant, but too small to matter | Not significant; Large and important |
| c07 | Statin lowers LDL 0.5 mmol/L more, SE 0.1. 95% CI? | 0.3 to 0.7 | 0.4 to 0.6 (± 1 SE); 0.1 to 0.9 (± 4 SE) |
| c08 | A trial reports 95% CI 1 to 7 mmHg. What does 95% mean? | Of many trials done this way, about 95% of CIs contain the true effect | A 95% chance the true effect is 1 to 7; 95% of patients' BP fell 1 to 7 |
| c09 | 400 people: CI 1 to 7. 1,600 people, same SD and gap. New CI? | 2.5 to 5.5 | 3.25 to 4.75 (quartered); 1 to 7 |
| c10 | Difference 6 mmHg (95% CI 2 to 10). What is the SE? | 2 | 4 (the half-width); 8 (the width) |
| c11 | HbA1c 3 mmol/mol lower (95% CI 1 to 5); the smallest fall that matters is 5. Conclusion? | Significant, but it may be too small to matter | Significant and clinically important; Not significant |
| c12 (twist) | Small trial, 3 mmHg (95% CI −2 to 8), "the drug has no effect". Best response? | Not proven: the CI includes falls of up to 8 | Agreed: the CI includes 0; Agreed: p > 0.05 |
| c13 (twist) | Haemoglobin 3 g/L more, p = 0.04. Which 95% CI fits? | 0.2 to 5.8 | −0.3 to 6.3; −3 to 9 |

Checks: c01 4 ± 3; c06 SE = 15 × √(2 ÷ 10,000) ≈ 0.21; c07 0.5 ± 0.2; c09 √4 = 2, half-width 3 → 1.5; c10 half-width 4 = 2 SE;
c13 p = 0.04 → 2.05 SE, SE ≈ 1.46, CI ≈ 0.1 to 5.9 (0.2 to 5.8 kept from the old case). c11: 5 mmol/mol is a commonly quoted smallest
important change in HbA1c (check a source before use).
Old IDs: c02–c06 and c13 are the moved lesson-4 cases c01, c04, c05, c06, c07, c09.

## Draft warm-up: Significant or not? (sort)

w01 difference 5 mmHg (2 to 8) sig · w02 difference 2 kg (−1 to 5) ns · w03 RR 0.7 (0.5 to 0.9) sig · w04 OR 1.2 (0.8 to 1.9) ns ·
w05 RR 1.1 (0.9 to 1.3) ns · w06 difference −4 mmol/mol (−7 to −1) sig · w07 OR 2.5 (1.1 to 5.6) sig · w08 difference 0.5 (−0.1 to 1.1) ns.
w01–w05 are the moved lesson-4 items w03–w06, w08.
