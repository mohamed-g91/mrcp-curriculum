# Errors (lesson 7): plan

Proposed 2026-10-03, for the user's review. Nothing built yet. The user split the planned "Errors and power" into two lessons:
lesson 7 the two errors (this file), lesson 8 power and sample size (notes/power-plan.md, parked).
Proposed slugs (not published, so still free to change): `stats.errors` "Type I and type II errors" and `stats.power` "Power and sample size",
replacing `errors-and-power` in curriculum.yaml.

Leans on lesson 4 (the court: H₀ on trial, Guilty / Not guilty; 1,000 placebo-only trials in a grid; the 0.05 line), lesson 5 (2 SE = 3 for
400 people, 9.4 for 40) and lesson 6 ("Say the truth is 3": a made-up truth, as a simulation sets it). Same trial and numbers: SD 15,
200 per group, SE 1.5, gap 4 mmHg, p = 0.008; small trial 40 people, SE 4.7, p = 0.4. Two-sided; "2 SE" for 1.96, as before.

2026-10-03: user agreed the 5 slides, the 8 cases and the slugs (curriculum.yaml now lists `errors` and `power`). Mockups sent
(scratchpad mk7/make.py): slide 2 grid-A plain 2 × 2, grid-B court 2 × 2, grid-C two error cards; slides 3–4 bells-A overlapping on one
axis (olive chance, teal truth), bells-B one bell per row, bells-C neutral bells with coral Type I and purple Type II and a verdict strip.
Both slides share one axis (−14 to 18) so the widths are true to scale. Awaiting the user's choice.

**Built 2026-10-03** as `content/statistics/errors.yaml` (status draft): user chose grid-A for slide 2 and bells-B for slides 3–4,
with the errors in their bells' colours (Type I olive, Type II teal). New story kinds `errgrid` and `errbells`; worked-sum chains gained
per-chip `families`, `{key}` labels in results and smaller chips when one is long. Cases c01–c08, no warm-up. Both checks pass.
Next: the user's review.

## The question this lesson answers

Every verdict can be wrong. Which way, and how often?

## Kept short (user, 2026-10-03)

The first proposal (1,000-trial grids, a stricter line, many tests) was too deep for statistics-naive MRCP candidates. The errors and the
misses are shown with one figure: two overlapping bells, once for 400 people and once for 40. Nothing else is added. Multiple testing and
the stricter line are left out (multiple testing may suit a later lesson, e.g. Clinical trials).

## Checked numbers

- Chance's bell (the drug does nothing): round 0, SE 1.5, 2 SE lines at ± 3. Its tails beyond ± 3 = 5% = α (Type I).
- The truth's bell (say the truth is 4): round 4, same SE 1.5. The part inside the lines (below 3) = 25% = β (Type II misses);
  (3 − 4) ÷ 1.5 = 0.67 SE, the quartile point. The rest, 75%, clears the line.
- 40 people: both bells SE 4.7, lines at ± 9.4. Chance's tails still 5%. The truth's bell inside the lines ≈ 87% (9.4 is 1.15 SE above 4).
  The 0.2% of the truth's bell beyond −9.4 is not drawn or mentioned.

## Proposed slides

| # | Slide | What it shows | Figure |
| --- | --- | --- | --- |
| 1 | Hook: Could the verdict be wrong? | Lesson 4's two verdicts: 400 people, p = 0.008, Guilty; 40 people, p = 0.4, Not guilty | Text, as earlier hooks |
| 2 | Two ways to be wrong | Truth (does nothing / works) × verdict (significant / not): two right cells, Type I (false alarm) and Type II (a miss) | **New: 3 mockups** (2 × 2 grid) |
| 3 | Where do the errors live? (400 people) | Chance's bell round 0, the 2 SE lines at ± 3, its tails lit: α 5% (Type I). Then say the truth is 4: the truth's bell round 4 overlaps; the part inside the lines lit: β 25% (Type II) | **New: 3 mockups** (two overlapping bells) |
| 4 | The same truth in 40 people | Both bells wide, lines at ± 9.4: the tails stay 5%, the truth's bell is mostly inside the lines: β about 87% | Same kind |
| 5 | Back to the trials | Guilty (p = 0.008) could only be a Type I error; Not guilty (p = 0.4) only Type II, and with 40 people a miss is likely | `working` with `rows` |

Lesson 8 (power) starts from these bells: power = the truth's bell beyond the line (75%, 12%), what raises it, how many people.

## Concepts, explained (for the narration and the user)

- **Type I error (false positive, false alarm):** H₀ is true (the drug does nothing) but the trial says significant. A smoke alarm going off
  for toast; a court convicting an innocent person. Its rate is α, set before the trial (usually 5%).
- **Type II error (false negative, a miss):** the drug works but the trial says not significant. The alarm silent in a real fire; a guilty
  person walking free. Its rate is β (planned at 10–20%).
- Real examples (check before any goes on a slide):
  - Type I: ISIS-2 (Lancet 1988) split its aspirin results by star sign; Gemini and Libra seemed to get no benefit, the other signs a large one.
    A chance subgroup difference, shown on purpose to warn against subgroup hunting.
  - Type I: candidate-gene associations; of 166 studied three or more times, only 6 replicated consistently (Hirschhorn et al., Genet Med 2002).
  - Type II: streptokinase after MI. Many early small trials were not significant; pooled in order (Lau et al., NEJM 1992), the benefit
    was clear by 1973, years before the large trials.
  - Type II: Freiman et al. (NEJM 1978): most of 71 "negative" trials were too small to find even a large benefit.
- Mnemonic: the boy who cried wolf. First the villagers believe a wolf that is not there (Type I), then ignore one that is (Type II).

## Worked detail (explained to the user 2026-10-03)

- α: chance's bell of gaps round 0, SE 1.5; 95% within ± 3, 2.5% beyond each side; 50 in 1,000 placebo-only trials. (Exactly 2 SE gives
  4.55%; "about 5%" because 2 stands for 1.96.)
- β: the truth moves the bell to 4, same width; the line stays at ± 3 (drawn from chance's bell). 3 is 0.67 SE below 4 → 25% of the bell.
  40 people: 9.4 is 1.15 SE above 4 → 12.5% clears it; about 87% miss.

## Pitfalls and exam tricks

- A significant result can only be a Type I error; a non-significant one only Type II. Ask "which verdict?" first.
- α is not p. α is the line, chosen before; p is the result, found after.
- p = 0.03 is not "a 3% chance this is a false positive": p assumes the drug does nothing.
- Not significant ≠ no effect: it may be a Type II error, most likely in a small trial.
- More people do not lower the Type I rate (it stays at α); they lower the Type II rate.
- Power = 1 − β, not 1 − α (1 − α is the 95% of a CI). Lesson 8.

## Practise

No warm-up (as lessons 4 and 5). Cases renumbered after the cut (none were ever built). Options listed answer first; the page shuffles them.

| ID | Case | Answer | Wrong options |
| --- | --- | --- | --- |
| c01 (solved) | 400 people, BP fell 4 mmHg more, p = 0.008. If this verdict is wrong, which error is it? | Type I | Type II; Neither: p < 0.05 |
| c02 | A trial of 30 people finds no benefit (p = 0.4); later large trials find a real one. Which error? | Type II | Type I; No error: p > 0.05 |
| c03 | A trial finds p = 0.03; larger trials later show the drug does nothing. Which error? | Type I | Type II; No error: p < 0.05 |
| c04 | α is set at 0.05. This means? | If the drug does nothing, about 5 in 100 such trials are still significant | The trial's p will be 0.05; A significant result is 95% sure to be true |
| c05 | β is 0.2. This means? | If the effect is real (of the size planned for), 20% of such trials miss it | 20% of significant results are false; p must be below 0.2 |
| c06 | The same trial is run with 10 times the people, α 0.05. Type I error rate? | Unchanged, 5% | Smaller; Larger |
| c07 (twist) | p = 0.03. "So there is a 3% chance this is a false positive." Best response? | No: p is worked out assuming the drug does nothing | Agreed; No: it is a 97% chance |
| c08 (twist) | 40 people, p = 0.4; "the drug has no effect". Best response? | Not shown: a Type II error is likely in a trial this small | Agreed: p > 0.05; Agreed: a Type I error is ruled out |

## Decisions for the user

1. Slugs: `errors` "Type I and type II errors" (7) and `power` "Power and sample size" (8)?
2. The 5 slides above, and the 8 cases.
3. Mockups next: slide 2 (the 2 × 2) and slides 3–4 (the two bells), three each.
