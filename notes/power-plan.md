# Power and sample size (lesson 8): plan

**Built 2026-10-04** as `content/statistics/power.yaml` (status draft): 6 slides (hook; Power and β on lesson 7's errbells with a
`power` fill; Where do we start? as the new `plan` story; How far out must the truth sit? as the new `powrows` story; How many people?
and Back to the trials as `working`), cases c01–c09, no warm-up. Power in purple (par family), new icon `i-power`. Both checks pass.
Next: the user's review.

Re-planned 2026-10-04, for the user's review. Nothing built yet. Slug `stats.power`, "Power and sample size" (already in curriculum.yaml).
Replaces the parked 2026-10-03 combined proposal; its error slides, the 1,000-trial grid and multiple testing went to lesson 7 or were cut.
Kept short like lesson 7 (the user judged grids, a stricter line and multiple testing too deep for beginners): 5 slides, 9 cases, no warm-up.

Leans on lesson 5 (SE of a difference = SD × √(2 ÷ n), 2 SE line, 400 vs 40 people), lesson 6 ("Say the truth is 4") and lesson 7
(the two bells, errbells: chance's bell round 0, the truth's round 4; β = the truth's bell inside the lines, 25% for 400 people, 87% for 40).
Same trial and numbers: SD 15, 200 per group, SE 1.5, 2 SE = 3, truth 4 mmHg. Two-sided, "2 SE" for 1.96, as before.

## The question this lesson answers

How likely is a trial to catch a real effect, and how many people does it need?

## Checked numbers (python, 2026-10-04)

- Power, our trial: truth 4, SE 1.5, line at 3. 4 sits 0.67 SE past the line → 75% of the truth's bell clears it. Power 75% = 1 − β (25%).
- Power, 40 people: SE 4.7, line 9.4. 9.4 sits 1.15 SE above 4 → 12.4% clears it (+0.2% beyond −9.4, not drawn) → about 13%. Matches lesson 7's 87 misses in 100.
- Levers, each from the 400-people trial:
  - Twice the people (400 per group): SE 1.06, line 2.1 → power 96%.
  - A bigger true effect (5 mmHg): (5 − 3) ÷ 1.5 = 1.33 SE past the line → 91%.
  - A smaller SD (12 instead of 15): SE 1.2, line 2.4 → 91% (the same as a 5 mmHg effect: both put the truth 3.3 SEs out).
  - A stricter α (0.01): line at 2.58 SE = 3.9 → 53%. (Only if decision 3 keeps α.)
- Sample size for 80% power: 80% of the truth's bell must clear the line, so its centre sits 0.84 SE past it: 2 + 0.84 = 2.84 SE from 0.
  SE = 4 ÷ 2.84 = 1.41 → n = 2 × (15 ÷ 1.41)² ≈ 227 → **about 225 per group** (220 with 1.96; say "about 225" throughout).
  Our 200 per group was just short: 75%.
- Half the effect (2 mmHg) → 4 × the people: about 900 per group. Twice the SD → 4 × too. (n rises with (SD ÷ effect)².)
- Drop-outs: if 20% of 225 drop out (180 left), power falls to about 70%. So recruit extra: 225 ÷ 0.8 ≈ 280 per group.

## Worked example: sample size from power (given to the user 2026-10-04)

1. Our trial's power: SE = 15 × √(2 ÷ 200) = 1.5; line at 2 SE = 3; the truth (4) sits 1 mmHg = 0.67 SE past it → 75%.
2. 80% needs the truth's centre 0.84 SE past the line (0.67 → 75%, 0.84 → 80%, 1.28 → 90%), so 2 + 0.84 = 2.84 SE from 0.
3. The truth is 4 mmHg, so the SE must be 4 ÷ 2.84 = 1.41.
4. SE = SD × √(2 ÷ n) turned round: n = 2 × (SD ÷ SE)² = 2 × (15 ÷ 1.41)² ≈ 227 → about 225 per group, 450 in all.
5. Check: 225 per group → SE 1.41, line 2.83, truth 1.17 mmHg = 0.83 SE past it → 80%.
- One line: n = 2 × (SD × 2.84 ÷ effect)². With 1.96: 2 × (1.96 + 0.84)² × 15² ÷ 4² = 221 (the textbook form; 7.85 is (1.96 + 0.84)²).
- 90% power: 2 + 1.28 = 3.28 SE → about 300 per group. 2 mmHg at 80%: about 900. 20% drop-out: recruit 227 ÷ 0.8 ≈ 285.
- The 40-person trial (20 per group) needed the same 225 per group: it had about a tenth of the people it needed.

## Proposed slides (re-ordered by the user 2026-10-04)

The user's order: ask the question, show power and β on lesson 7's bells, then "Where do we start?": choose the tools (α, power) and work
back to the number of patients, split over slides if crowded, then back to the trials. The levers slide is dropped; its points stay in the cases.

| # | Slide | What it shows | Figure |
| --- | --- | --- | --- |
| 1 | Hook: How many people did the trial need? | Lesson 7's two trials: 400 people, p = 0.008; 40 people, p = 0.4 | Text, as earlier hooks |
| 2 | Power and β | Lesson 7's two bells (400 people). The truth's bell beyond the line lit in power's colour: power 75%. The part inside lit in β's colour (false negatives): β 25%. Power + β = 100% | `errbells`, power fill added |
| 3 | Where do we start? | Before the trial we choose our tools: α 0.05 (false positives we accept: the line at 2 SE) and power 80% (so β 20%: false negatives we accept). We also need the smallest effect worth finding (4 mmHg) and the SD (15) | **New figure: 3 mockups** (four tools, each value on tap) |
| 4 | How far out must the truth sit? | Two rows, as lesson 5's size slide. Top, our trial: 200 per group, SE 1.5, line at 3, the truth (4) 2.67 SE out: power 75%. Under it, the chosen power: SE 1.41, line at 2.83, the truth 2.84 SE out (2 + 0.84): power 80% (user, 2026-10-04) | `errbells`, two rows |
| 5 | How many people? | 4 mmHg must be 2.84 SE → SE = 4 ÷ 2.84 = 1.41 → n = 2 × (15 ÷ 1.41)² ≈ 225 per group, 450 in all | `working` chain |
| 6 | Back to the trials | We needed 225 per group. 200 per group: power 75%, just short. 20 per group: power 13%, a tenth of the people needed, so its Not guilty tells us little | `working` with `rows` |

## Narration points

- Power belongs to the plan: a planned trial and an assumed true effect. It is not worked out from the result afterwards (post hoc power adds nothing; look at the CI, lesson 6).
- 80% power and α 0.05 are the usual plan; 90% is common in large trials. β 0.2 means 1 in 5 such trials would miss the effect.
- The effect planned for should be the smallest that matters to patients (the minimal clinically important difference), not a hopeful guess.
  Planning for too big an effect makes the trial too small.
- More people raise power; they do not change the Type I rate (still α).
- A stricter α (0.01) cuts false alarms and costs power, unless n rises (aloud only if decision 3 leaves it off the slide).
- Trials report their sample size sum (CONSORT 2010, item 7a).

## Concepts, explained (for the narration and the user)

- **Power:** the chance a trial finds an effect that is really there (comes out significant), if the effect is the size planned for. Power = 1 − β.
  - Analogy: a telescope looking for a faint star. A bigger lens (more people), a brighter star (a bigger effect) and a clearer sky
    (a smaller SD) all make it easier to see. A small telescope that sees nothing has not shown the star is not there.
  - Analogy 2: a metal detector. A weak one passes over buried coins and says "nothing here".
- **Sample size calculation:** power turned round: choose α, power, the effect and the SD, and solve for n. Done before the trial.
- **Why n rises with the square:** SE shrinks with √n, so halving the effect needs SE halved, which needs 4 × the people.
- Real examples (check before any goes on a slide):
  - Freiman et al. (NEJM 1978): of 71 "negative" trials, most were too small to find even a 25–50% benefit (also in lesson 7's notes).
  - Moher, Dulberg and Wells (JAMA 1994): of 102 negative RCTs, only about 16% had 80% power to find a 25% relative difference,
    and about 36% to find a 50% one. **Figures need checking.**
  - Magnesium after MI: small trials and a meta-analysis suggested benefit; ISIS-4 (Lancet 1995, 58,000 patients) found none.
    The flip side: small trials give unstable answers both ways. **Better kept for Meta-analysis (lesson 23)**, aloud only here if at all.

## Pitfalls and exam tricks

- Power = 1 − β, not 1 − α (1 − α is the 95% of a CI). "α 0.05, β 0.2: power?" → 80%, not 95%.
- Sample size needs: α, power (or β), the smallest effect worth finding, and the SD (for yes/no outcomes, the expected event rates).
  It does not need the p-value (that comes after) or the result.
- Raising power lowers Type II errors, not Type I.
- Half the effect → 4 × the people; twice the SD → 4 × the people.
- Drop-outs lower power: recruit extra at the start.
- A non-significant underpowered trial is "too small to tell", not "no effect".

## Concepts (colours decided at build)

Power is new. It is the other part of the truth's bell from β (teal), so it may take a stronger teal or a new colour; it must not read as a right/wrong green.
Reused: Type II / β (teal), Type I / α (olive), SE.

## Practise

No warm-up (as lessons 4, 5 and 7). New topic, so IDs start at c01. Options listed answer first; the page shuffles them.

| ID | Case | Answer | Wrong options |
| --- | --- | --- | --- |
| c01 (solved) | 200 per group, SE 1.5, the 2 SE line at 3. Say the truth is 4 mmHg. Power? | About 75% | About 95%; About 25% |
| c02 | 20 per group, SE 4.7, the line at 9.4. Say the truth is 4 mmHg. Power? | About 13% | About 75%; About 87% |
| c03 | α 0.05, β 0.2. Power? | 80% | 95%; 20% |
| c04 | A trial is planned with 80% power for a 5 mmHg fall. This means? | If the true fall is 5 mmHg, 80 in 100 such trials will be significant | An 80% chance the drug works; A 20% chance of a false positive |
| c05 | Which raises the power of a planned trial? | Recruit more patients | Use an outcome with a wider SD; Plan for a smaller effect |
| c06 | Which is not needed to work out a trial's sample size? | The p-value the trial will find | The SD of the outcome; The smallest difference worth finding |
| c07 | 225 per group gives 80% power for 4 mmHg. For 2 mmHg, at the same power? | About 900 per group | About 450; About 225 |
| c08 (twist) | Planned for 80% power with 225 per group; a fifth of patients drop out. Power now? | Below 80% | Still 80%; Above 80% |
| c09 (twist) | The SD turns out twice the one planned for. To keep 80% power? | About 4 × the people | About 2 × the people; The same people |

2026-10-04: the user kept all four tools on slide 3 and gave power its own colour (purple, the par family; unused in this topic).
Mockups sent (scratchpad mk8/make.py): slide 2 A lesson 7's two rows + chips + "β + power = 100%", B the truth's bell alone with the parts
named on it, C two rows + a split 100% bar; slide 3 A four tool cards in a row → People ?, B the tools lit on the bells, C the tools in a
2 × 2 → a grey crowd; slide 4 A two rows + chips, B two rows + an SE ruler (2 SE, then 0.67 / 0.84 SE), C two rows + split bars.
User chose 2A and 4A (2026-10-04); slide 3 re-done as a story (user's words): power is set before the trial, not worked out after; we set our tolerance
for false positives (α 5%) and false negatives (β 20%, power 80%); the SD is known beforehand (earlier studies, 15 mmHg); we choose the
smallest clinically important change (4 mmHg); then how many people? Story mockups sent (mk8/story3.py): A a Before / The trial / After
timeline (power crossed off After), B the planner with four pills, C a "Power: before, not after" strip then four cards into one box.
User chose story A (2026-10-04), the fourth tool labelled "Clinically important change", and the last beat shows lesson 5's
SE = SD × √(2 ÷ n) with n = ? (mk8/slide3-A2.png). Slide 5 then turns it round: n = 2 × (SD ÷ SE)².

## Decisions for the user

1. The 6 slides above (levers dropped from the slides, kept in cases c05, c07, c09), and the 9 cases.
2. Power's colour: a stronger teal (β's family) or its own colour?
3. Slide 3 lists four tools (α, power, effect, SD); the user named α and power. Keep all four (the sum needs them)?
4. Mockups next: slide 2 (power and β on the bells), slide 3 (the tools), slide 4 (75% over 80%), three each.
