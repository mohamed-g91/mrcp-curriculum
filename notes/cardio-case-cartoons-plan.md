# Cardiology case cartoons: plan

DESIGN.md, Behaviour rules: "A case has a cartoon. One cast member with one prop for the case's subject, never its type." Only `cardio.angina-treatment` c01 has one today. This gives one to every case in the three cardiology lessons (the solved examples too), 32 in all.

Rules kept: the prop is the case's subject, never the answer and never the clue (the clue lights only after a wrong answer, so a prop never pictures it: no inhaler for asthma, no blue pill for sildenafil, no ECG with its leads). The person matches the stem's age and sex. New drawings go in `content/figures/case-*.svg`, made by one script (`art/make_case_figures.py`) from the shapes of the existing cast.

## Lesson 1, Coronary arteries and the ECG (`cardio.coronary-arteries-ecg`)

| Case | Patient | Prop | Drawing |
| --- | --- | --- | --- |
| c01 (solved) | Man, 62 | Hand on chest | reuse `case-chest-man` |
| c02 | Woman, 55 | Hand on chest | reuse `case-chest-woman` |
| c03 | Man, 68 | Pain rays down his left arm | new `case-arm-man` |
| c04 | Man, 49, pale | Breath puffs (breathless) | new `case-breathless-man` |
| c05 | Woman, 71, grey hair | A plain ECG strip (no leads, no ST) | new `case-ecg-woman` |
| c06 | Man, 60 | A blood pressure gauge | new `case-bp-man` |
| c07 | Man, 52 | A blood tube (the troponin) | new `case-tube-man` |
| c08 | Woman, 66 | A plain ECG strip | reuse `case-ecg-woman` |
| c09 | Man, 74 | A wristwatch (the slow pulse) | new `case-watch-man` |
| c10 | Woman, 58 | An alarm clock (this morning) | new `case-clock-woman` |
| c11 | Man, 77 | Oxygen nasal tubes | new `case-oxygen-man` |

## Lesson 2, Is it angina? (`cardio.angina-diagnosis`)

| Case | Patient | Prop | Drawing |
| --- | --- | --- | --- |
| c01 (solved) | The two patients, A and B | Each with a hand on the chest | new `case-two-patients` (both, small): the one exception to "one cast member" (agreed 2026-10-16) |
| c02 | Man, 57 | A flight of stairs | new `case-stairs-man` |
| c03 | Woman, 35 | Hand on her left side | new `case-side-woman` |
| c04 | Man, 66 | A trainer (walking fast) | new `case-shoe-man` |
| c05 | Woman, 59 | A clipboard of results | new `case-results-woman` |
| c06 | Man, 70 | A test request card with a heart | new `case-request-man` |
| c07 | Woman, 54 | A magnifying glass | new `case-lens-woman` |
| c08 | Woman, 38 | A handbag | new `case-handbag-woman` |

## Lesson 3, Treating stable angina (`cardio.angina-treatment`)

| Case | Patient | Prop | Drawing |
| --- | --- | --- | --- |
| c01 (solved) | Patient A, 61 | Hand on chest | `case-chest-man` (already there) |
| c02 | Man, 58 | A prescription | new `case-script-man` |
| c03 | Woman, 55 | A prescription | new `case-script-woman` |
| c04 | Man, 62 | A blister pack | new `case-blister-man` |
| c05 | Man, 67 | A pill bottle | new `case-bottle-man` |
| c06 | Man | A glass of water and a tablet | new `case-water-man` |
| c07 | Man, 71 | A bag of medicines (several drugs) | new `case-medbag-man` |
| c08 | Woman, 60 | A new medicine box | new `case-box-woman` |
| c09 | Man, 64 | A blood pressure gauge | reuse `case-bp-man` |
| c10 | Man, 59 | Two pill bottles (sorting his medicines) | new `case-sort-man` |
| c11 | Woman, 63 | A pill bottle | new `case-bottle-woman` |
| c12 | Man | GTN spray | new `case-spray-man` |
| c13 | Man, 68 | A flight of stairs | reuse `case-stairs-man` |
| c14 | Man, 68 | A watering can (getting on with life) | new `case-can-man` |
| c15 | Woman, 38 | A handbag | reuse `case-handbag-woman` |

Left out on purpose: inhaler (c06 lesson 2, c03 lesson 3), a perianal cushion (c07), sunglasses or a dim lamp (c08), a blue pill (c09), a glucose meter (c11), a thumbs-up (c14), a cigarette or a moon (c08 lesson 2, c15): each would picture the clue or point to the answer.

Status: agreed 2026-10-16 (style A, the two-patient drawing, a handbag for the vasospastic cases); built, awaiting review.
