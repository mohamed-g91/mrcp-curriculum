# Power (lesson 8): parked plan

On 2026-10-03 the user split lesson 7 in two: errors first (notes/errors-plan.md), power second. This file keeps the first combined
proposal; its power half (slides 4–7, the bells, the levers, sample size) is the starting point for lesson 8. Slides 2, 3, 8, the error
cases and multiple testing moved to lesson 7. Not yet re-planned.

Leans on lesson 4 (the court: H₀ on trial, Guilty / Not guilty; 1,000 placebo-only trials in a grid, the 0.05 line), lesson 5
(SE of a difference = SD × √(2 ÷ n), 2 SEs, 400 vs 40 people) and lesson 6 (a made-up truth, "Say the truth is 3"; two bells of one width).
Same trial and numbers throughout: SD 15, 200 per group, SE 1.5, 2 SE = 3, a gap of 4 mmHg. Two-sided; 2 SE for 1.96, as before.

## The question this lesson answers

The verdict can be wrong in two ways. How often, and how do we plan a trial big enough to find a real effect?

## Checked numbers

- Type I: if the drug does nothing, 5% of trials still cross the 2 SE line: about 50 in lesson 4's 1,000 placebo-only trials.
- Power, our trial: say the truth is 4 mmHg. The trial's gap lands round 4 with SE 1.5; it is significant when it lands beyond 3.
  (3 − 4) ÷ 1.5 = −0.67 SE → 75% land beyond 3. Power 75%, β 25% (about 1 in 4 such trials would miss a real 4 mmHg).
- Power, 40 people: SE 4.7, 2 SE = 9.4. (9.4 − 4) ÷ 4.7 = 1.15 SE → about 12.5% land beyond 9.4 (the far tail adds 0.2%).
  Power about 12%: 7 in 8 such trials miss it. This is lesson 4's "Not guilty" trial.
- Sample size for 80% power: the truth must sit 2 + 0.84 ≈ 2.8 SEs from 0 → SE = 4 ÷ 2.84 ≈ 1.41 → n = 2 × (15 ÷ 1.41)² ≈ 225 per group
  (220 with 1.96). Half the effect (2 mmHg) → 4 × the people: 900 per group. Twice the SD → 4 × the people too.
- Many tests: 20 outcomes, drug does nothing: chance of at least one p < 0.05 = 1 − 0.95²⁰ ≈ 64%. Bonferroni: 0.05 ÷ 20 = 0.0025.

## Proposed slides

| # | Slide | What it shows | Figure |
| --- | --- | --- | --- |
| 1 | Hook: Could the verdict be wrong? | Lesson 4's two trials: 400 people p = 0.008 (Guilty), 40 people p = 0.4 (Not guilty). "Either verdict could be wrong." | Text, as earlier hooks |
| 2 | Two ways to be wrong | Truth (no effect / real effect) × verdict (significant / not): two right cells, Type I (false alarm, α) and Type II (a miss, β). Court: convict the innocent / free the guilty | **New figure: 3 mockups** (2 × 2 grid, court art reused) |
| 3 | How often is a false alarm? | Lesson 4's 1,000 placebo-only trials, the 0.05 line: about 50 cross it. α = 0.05 is chosen before the trial; it is not p | Existing kind `grid` |
| 4 | How often is a miss? | Say the truth is 4. Chance's bell round 0 with 2 SE lines at ± 3; the truth's bell round 4, same width. Beyond 3 = power 75%, inside = β 25% | **New figure: 3 mockups** (two bells, as lesson 6's `mirror`) |
| 5 | The same truth in 40 people | Same figure for 40 people: lines at ± 9.4, the truth's bell mostly inside: power about 12%. "Not guilty because the trial was too small" | Same kind, two rows as lesson 5's size slide |
| 6 | What raises power? | One tap per lever on slide 4's bells: more people (bells narrow), a bigger true effect (truth's bell moves out), a smaller SD (narrow), a looser α (lines move in, more false alarms) | Same kind, beats |
| 7 | How many people? | 80% power needs the truth 2.8 SEs out → SE 1.41 → about 225 per group. Half the effect → 4 × the people (900) | `working` with `rows`, or the bells (decide after slide 4's mockups) |
| 8 | Many tests, many false alarms | 20 outcomes on a drug that does nothing: about 64% chance at least one is significant. Bonferroni 0.05 ÷ 20 | **New figure: 3 mockups**, or leave out (decision 2) |
| 9 | Back to the trials | Our trial: power 75% for 4 mmHg, p = 0.008. The 40-person trial: power 12%, so its p = 0.4 tells us little. Answer: "Too small to tell" | `working` with `rows` |

## Narration points

- α is the false-alarm rate we accept, fixed before the trial; p is found after it. Significant means p < α.
- p = 0.008 is not "a 0.8% chance we are wrong" (that needs how likely the drug was to work beforehand; leave it there).
- Power belongs to a planned trial and an assumed true effect, not to the result. Do not work out power from the observed gap afterwards.
- Lowering α to 0.01 cuts false alarms and costs power: the two errors trade against each other unless n rises.
- 80% power and α 0.05 are the usual plan; 90% is common in large trials.
- History (said aloud only; check before any goes on a slide): Neyman and Pearson (1928, 1933) gave α, β, the two error types and power.

## Concepts (colours decided at build)

Type I error / α, Type II error / β, power, plus lesson 4–6's H₀, p-value, SE. Olive stays testing. Type I and Type II need two colours
that do not read as right/wrong greens; power is 1 − β, so it may share β's family.

## Practise

Warm-up (proposal): sort 8 short stories into Type I / Type II (e.g. "Trial says it works; later trials show it does not").

## Draft cases (for the user's review)

Options listed answer first; the page shuffles them. New topic, so IDs start at c01.

| ID | Case | Answer | Wrong options |
| --- | --- | --- | --- |
| c01 (solved) | The drug truly lowers BP 4 mmHg more. 200 per group, SE 1.5. Chance the trial comes out significant? | About 75% | 95%; 5% |
| c02 | A trial finds p = 0.03; larger trials later show the drug does nothing. Which error? | Type I | Type II; No error: p < 0.05 |
| c03 | A trial of 30 people finds p = 0.4; larger trials later show a real benefit. Which error? | Type II | Type I; No error: p > 0.05 |
| c04 | A trial is planned with 80% power for a 5 mmHg fall. This means? | If the true fall is 5 mmHg, 80% of such trials would be significant | An 80% chance the drug works; A 20% chance of a false positive |
| c05 | α is set at 0.05. This means? | If the drug does nothing, about 5 in 100 such trials are still significant | p will be 0.05; A 95% chance a significant result is true |
| c06 | Which raises the power of a planned trial? | Recruit more patients | Lower α to 0.01; Use an outcome with a wider SD |
| c07 | 225 per group gives 80% power for 4 mmHg. For 2 mmHg, at the same power? | About 900 per group | About 450; About 225 |
| c08 | A trial tests 20 outcomes; the drug does nothing. Chance of at least one p < 0.05? | About 64% | 5%; 100% |
| c09 | Ten outcomes tested. Bonferroni threshold for each? | 0.005 | 0.05; 0.5 |
| c10 | β is 0.1. Power? | 90% | 10%; 95% |
| c11 (twist) | 30 people, power 15% for the expected effect, p = 0.3; "the drug has no effect". Best response? | The trial was too small to tell | Agreed: p > 0.05; Agreed: a Type I error is ruled out |
| c12 (twist) | A trial is significant, p = 0.01. Which error could it have made? | Type I | Type II; Neither |

c08 and c09 go if slide 8 is left out.

## Decisions for the user

1. The slide list and order above.
2. Multiple testing (slide 8, c08, c09): keep it here, or move it to lesson 8 (Choosing the right test) or later?
3. Sample size (slide 7): keep the worked sum (2.8 SEs → 225 per group), or only the rule "half the effect, 4 × the people"?
4. Warm-up: Type I / Type II sort, or none (as lessons 4 and 5)?
