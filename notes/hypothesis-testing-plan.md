# Hypothesis testing: where we are and what comes next

A hand-over for the next session, written 2026-10-01. The topic is `stats.hypothesis-testing`, `status: draft`, not pushed.
Everything below "Built so far" is committed locally on `main` (last commit `c03cd4a`).

## Built so far (one topic, 12 Learn slides)

| # | Slide (id) | What it does |
| --- | --- | --- |
| 1 | Could this be chance? (`hook`) | The trial: 400 people, BP fell 4 mmHg more on the drug (SD 15) |
| 2 | Innocent until proven guilty (`court`) | Story kind `art` (drawing `content/figures/ht-court.svg`): H₀ on the bench, the doctor's ↓ 4 mmHg, p = 0.008, Guilty · Reject H₀ |
| 3 | Is the coin fair? (`coin`) | Kind `coin`: H₀ the coin is fair; 10 heads, each toss halving the chance; all heads or all tails 2 in 1,024; p ≈ 0.002 |
| 4 | How big a gap can chance make? (`gap`) | Kind `gap`, 16 taps: placebo bell (mean systolic BP 140, SEM 1.1, dashed 2 SEM lines), drug bell (136); they join, Gap 4 mmHg; 3 trials, one per tap (gaps 2.9, 5.1, 3.6, each its own pair of bells); pile of 60 gaps, SE of the difference 1.5; drug bell slides onto placebo (no effect); 3 chance trials (1.2, −1.0, 0.6); their pile; the chance bell on its own tap; 2 SE lines; 4 lands (2.7 SEs); tails, p = 0.4% + 0.4% ≈ 0.008 |
| 5 | Three spreads (`recap`) | Reveal cards: SD (row of people), SEM (narrow bell), SE of the difference (two overlapping bells making one wider) |
| 6 | The same gap in 40 people (`court-small`) | The court drawing again: p = 0.4, Not guilty · ≠ innocent |
| 7 | Why does size matter? (`size`) | Kind `ncompare`: 400 vs 40 people side by side: SE 1.5 vs 4.7, chance bells true to scale, 2.7 vs 0.85 SEs, p 0.008 vs 0.4 |
| 8 | Where is the line? (`line`) | Kind `line`: first a small bell (2.5% beyond 2 SE each side, 5% = 1 in 20, Fisher, 1925); then a ruler of p-values with the 0.05 line; the two trials land on it |
| 9 | Where could the true effect be? (`ci`) | Kind `ci`: our trial's bell on 4, 2 SE lines, 95% CI = 4 ± 2 × 1.5 = 1 to 7; then chance's bell on 0 with its 95% (−3 to +3). Label "Our trial" kept by the user |
| 10 | The CI and p agree (`agree`) | Kind `slide`: a difference (no effect 0) and a ratio (no effect 1), a CI sliding towards no effect, p read out |
| 11 | Significant or important? (`important`) | Reveal cards, unchanged |
| 12 | Back to the trial (`hook-solved`) | Worked sum, unchanged |

Practise: warm-up w01–w08 (sort into Significant / Not significant), cases c01–c10.
Engine additions: story kinds `art`, `coin`, `gap`, `line`, `slide`, `ci`, `ncompare` in `engine/js/story.js`; a story can open on its first beats (`start`).
All of it is described in DESIGN.md (the Story row). The full check passed on both builds before the last two changes
(`size` opening on its headings; slide 4 as BP levels 140 and 136). Re-run it before pushing.

## Decided: split into three topics (lectures)

The user found one video too long. Decisions so far:

- **Three separate topics**, each with its own page, video and Practise.
- **Two-sided p throughout.**
- **No warm-up in lecture 1** (sorting p-values against 0.05 is too trivial) and none in lecture 2 (its skills are sums, better as cases).
  Keep the CI warm-up in lecture 3. Retire w01, w02, w07 from `stats.hypothesis-testing` (never reuse the IDs).

### Lecture 1 · Hypothesis testing (keeps `stats.hypothesis-testing`): the logic, no maths

1. Hook: the trial, "Could this be chance?"
2. Court, Guilty: H₀, evidence, p = 0.008, verdict (the p is given; lecture 2 shows where it comes from)
3. **The p-value, shown with a case or trial scenario, not the coin. Agreed in principle; which scenario is still open,
   to decide in the next session.** One proposal: run the trial 1,000 times with placebo in both groups; about 8 give
   a gap of 4 mmHg or more either way (about 4 with the drug arm lower, 4 higher): p = 0.008. A grid of 1,000 squares,
   the 8 lit in olive. Draw three mockups once the scenario is chosen.
4. The line: 1 in 20 = 5 in 100 = **50 in 1,000** (Fisher, 1925), set beside the 8 in 1,000
5. Court, Not guilty: the trial of 40, p = 0.4
6. The same scenario for the trial of 40 (in the grid proposal, about 400 in 1,000 light up, 200 each way)

Cases: new **c11 (solved)** "p = 0.008: significant at 5%?", then c02 (H₀), c03 (meaning of p = 0.03), c08 (pilot p = 0.2), c10 (p = 0.06 "no effect").

The coin was dropped by the user: it is a detour from the trial, it drags in one- versus two-sided (one coin two-sided gives p = 1,
the user wanted 0.5, which is the one-sided answer), and "at least this extreme" never shows. Its slide and kind can be retired
or kept for later.

### Lecture 2 · Testing a difference (new, proposed slug `stats.testing-a-difference`): where p comes from

Hook ("the same 4 mmHg: 400 people p = 0.008, 40 people p = 0.4; why?") · Three spreads · the gap slide (slide 4) · Why does size matter?
· Back to the trial (SE 1.5, 2.7 SEs, p = 0.008). Fisher's small 2 SE bell may move here from the line slide.

Cases to **draft and send to the user before building**:
- solved: SD 15, 200 per group, gap 4 → SE 1.5, 2.7 SEs, significant
- SEM from SD and n; SE of a difference from SD and n per group
- 4 times as many people → SE halves
- the same gap in a small and a large trial: which gives the smaller p?
- gap 3, SE 2 → 1.5 SEs → not significant
- why the SE of a difference is bigger than either SEM
- **each arm significant against its own baseline**: the wrong comparison; test the difference between arms
  ("a difference in significance is not a significant difference"; Bland and Altman wrote on this, check the citation)
- possibly the user's weight example: two arms, mean weight (or change) in each, the difference, its SE and p

### Lecture 3 · Confidence intervals and p (new, proposed slug `stats.ci-and-p`)

Hook ("4 mmHg, 95% CI 1 to 7: what does 1 to 7 tell us?") · Where could the true effect be? · The CI and p agree · Significant or important?
· Back to the trial (CI = 4 ± 2 × 1.5). Cases c01, c04, c05, c06, c07, c09 move here with new IDs (retire them in lecture 1); warm-up items
w03–w06, w08 move here with new IDs.

Add both new topics to `curriculum.yaml` after Standard error, `status: draft`.

## Waiting on the user

1. Which case or trial scenario shows the p-value in lecture 1 (the 1,000 placebo-only trials grid is one proposal);
   then the lecture 1 slide list and three mockups of the chosen figure.
2. Titles and slugs for lectures 2 and 3 (slugs are permanent once published).
3. Go-ahead to draft lecture 2's cases for review.

## Points of statistics settled in discussion (keep the narration to these)

- **Two-sided:** a gap of 4 counts either way (drug arm 4 lower, or 4 higher); p = both tails.
- **Where the 8 in 1,000 comes from:** gaps between two placebo groups wobble round 0 with SE 1.5; 4 is 2.7 SEs out; about 0.4% beyond that
  each side. For 40 people the SE is 4.7, 4 is 0.85 SEs out, about 20% each side. These are expected counts: say "about 8", not "exactly 8".
- **α is not p.** α (0.05) is fixed before the trial and is the type I error rate: if the drug does nothing, about 50 in 1,000 trials still
  cross the line (false positives). p is found after the trial; significant means p < α. p = 0.008 does not mean "0.8% chance we are wrong".
- **History:** Fisher (1925) gave the p-value and suggested 0.05 as a convenient limit (about 2 SD). Neyman and Pearson (1928, 1933) turned it
  into a decision rule with α, type I and II errors, the alternative hypothesis and power. Today's practice is a hybrid. Check the citations
  before any goes on a slide.
- **SD → SE → SEs out → p.** The SD (spread of individuals) is not tested but feeds the SE: SEM = SD ÷ √n, SE of a difference = SD × √(2 ÷ n).
- **Tests compare an estimate with the value H₀ expects:** a difference (0), a ratio (1), or one mean against a fixed number.
- **Placebo arms fall too** (regression to the mean, getting used to measurement, lifestyle, a small placebo effect); the drug's effect is the
  difference between arms. Never judge a drug by its own change from baseline.
- **Slide 4 uses final BP (140 vs 136)** with the SD of the final BP taken as 15 by the author's choice, so the SEM and SE stay 1.1 and 1.5
  (noted in the topic YAML); in real trials the SD of final BP and of the change usually differ.
- **The CI** is our estimate ± 2 SE (1 to 7). Say "we are 95% confident", not "a 95% chance the true effect is in 1 to 7".
  0 lies outside our CI exactly when 4 lies outside chance's −3 to +3: the CI and p always agree.
- The later lesson **Errors and power** takes type I and II errors, power, and "Not guilty because the trial was too small".

## Working notes

- Another Claude session works on the same branch (the brand and logo work, `brand/` untracked). **Never `git add -A`**: stage your own
  files by name.
- `checks/check.mjs` uses a fixed Chrome port (9333): two sessions running it at once collide. The full check now takes about 15 minutes
  (slide 4 has 16 taps); run it in the background without a time limit.
- Some repo files have Windows line endings: edit them with a script that keeps `\r\n`, or the match fails.
