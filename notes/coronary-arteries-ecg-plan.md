# Coronary arteries and the ECG (cardiology, lesson 1): plan

Planned 2026-10-13, for the user's mark-up (gate 1). Nothing built.

The first cardiology lesson. Chapter 1 is coronary heart disease, seven lessons, chosen by bank weight (ACS 113 + stable
angina 39 verified questions, the biggest block in cardiology; Q banks folder, `Cardiology/MD/CHD/`):

1. **Coronary arteries and the ECG** (this note) · 2. Stable angina · 3. Diagnosing ACS · 4. Reperfusion ·
5. Antiplatelets and anticoagulants in ACS · 6. Complications of MI, by day · 7. After the MI

Proposed: specialty `cardiology`, prefix `cardio`, topic `cardio.coronary-arteries-ecg`, title "Coronary arteries and the ECG".
Cardiology moves from `coming:` to `specialties:` in curriculum.yaml when this is built. Sections (user, 2026-10-13: cardiomyopathy,
endocarditis and vessels standalone; proposed one per bank topic group): Coronary heart disease, Arrhythmias, Heart failure,
Cardiomyopathy and myocarditis, Valve disease, Infective endocarditis, Pericardial disease, Congenital heart disease, Hypertension,
Aorta and vessels, Pulmonary hypertension, VTE and anticoagulation.

## The question this lesson answers

Given the leads with ST changes, which wall of the heart is affected and which artery is blocked?

## What the bank asks (about 20 questions, ACS file)

- Leads to artery: II, III, aVF → RCA (6 questions); V1–V4 → LAD (3); I, aVL, V5–V6 → left circumflex (3).
- T waves without ST elevation: deep T-wave inversion V1–V2 → proximal LAD; T inversion V5–V6 → circumflex (3).
- Inferior MI with complete heart block or bradycardia → RCA (4); its management goes to lesson 6.
- Right ventricular infarction: inferior ST elevation, hypotension, nitrates make it worse (3).
- Reciprocal changes: V1–V4 elevation with inferior depression = complete LAD occlusion (1).
- Left for later lessons: STEMI thresholds and the 1 mm rule (lesson 3), persistent ST elevation = aneurysm (lesson 6).

## Concepts, explained

**The house and its three pipes.** The heart muscle is fed by three arteries running on its surface:
- **LAD** (left anterior descending): down the front. Feeds the front wall and the front two-thirds of the septum.
  The biggest territory, so the most dangerous to lose ("the widow-maker").
- **Circumflex** (LCx): round the left side in the groove. Feeds the side (lateral) wall, and often the back.
- **RCA** (right coronary artery): round the right side to the underside. Feeds the inferior wall, the right ventricle,
  and in most people the AV node (and often the SA node).
The left main splits into the LAD and circumflex within a centimetre or two.

**The 12 leads are 12 cameras.** Each lead looks at one wall from one side. Damage shows as ST elevation in the
cameras facing the damaged wall:

| Wall | Leads | Usual artery |
| --- | --- | --- |
| Inferior | II, III, aVF | RCA (circumflex in a left-dominant heart) |
| Septal | V1, V2 | LAD |
| Anterior | V3, V4 | LAD |
| Lateral | I, aVL, V5, V6 | Circumflex (I and aVL alone: a diagonal branch of the LAD, or the circumflex) |
| Anterior + lateral | V1–V6, I, aVL | Proximal LAD (or left main) |
| Posterior | none face it: ST depression V1–V3, tall R | Circumflex or RCA; confirm with V7–V9 |
| Right ventricle | V4R (a right-sided lead) | Proximal RCA |

Real example: the localisation table follows Zimetbaum and Josephson, "Use of the electrocardiogram in acute myocardial
infarction", NEJM 2003;348:933–40, and the ESC 2023 ACS guideline (in the Q banks `_guidelines/`). Check before build.

**The mirror (reciprocal changes).** A camera on the opposite side sees the same injury upside down: ST depression.
Inferior STEMI → depression in I and aVL. Anterior STEMI → depression in the inferior leads. Reciprocal depression makes a
STEMI more certain (pericarditis gives widespread elevation without it, apart from aVR).
Analogy: a shadow on the wall behind the person.

**The back wall has no camera.** A posterior STEMI shows only as the mirror in V1–V3: ST depression with tall R waves and
upright T waves. Turn the picture over and it is an ST elevation with Q waves. Confirm with V7–V9 (leads on the back);
treat as a STEMI.

**The right ventricle.** A proximal RCA blockage also starves the right ventricle. Picture: inferior STEMI, low blood
pressure, raised JVP, clear lungs. The right ventricle cannot push, so the left fills poorly and depends on preload.
Nitrates (and diuretics) drop preload and the pressure falls further: avoid them; give fluids. Confirm with V4R.

**The slow heart.** The RCA feeds the AV node in most people, so inferior MI brings bradycardia and AV block. It is usually
at the node, with a narrow escape rhythm, and usually passes. Heart block with an anterior MI means a big septal infarct
below the node: worse, and more often paced. (The management is lesson 6; here only the artery.)

**T waves.** A patient now pain-free with deep, symmetrical T-wave inversion in V2–V3 (Wellens' pattern) has a critical
proximal LAD stenosis: about to occlude. Coronary angiography, not a stress test. T inversion in V5–V6 points to the circumflex.
Source: de Zwaan, Bär and Wellens, Am Heart J 1982;103:730–6. Check before build.

## Pitfalls and exam tricks

- Inferior STEMI + bradycardia or complete heart block → RCA.
- Inferior STEMI + hypotension + clear lungs + raised JVP → right ventricular infarct: no GTN, give fluids, V4R.
- ST depression in V1–V3 is not always anterior ischaemia: think posterior STEMI, ask for V7–V9.
- I and aVL alone = high lateral; V5–V6 = low lateral. Both lateral = circumflex.
- V1–V6 plus I and aVL = proximal LAD: the largest territory.
- ST elevation in aVR with widespread ST depression → left main or three-vessel disease (ESC 2023). Check before build.
- About 1 in 10 hearts are left-dominant: the circumflex then feeds the inferior wall. The exam answer for II, III, aVF is still RCA.
- Deep T inversion V1–V3 in a pain-free patient is not "old": it is Wellens, critical LAD.
- Persistent ST elevation weeks after an anterior MI = LV aneurysm (lesson 6, not here).

## Numbers (one patient for the whole lesson)

The hook's patient carries through every slide:
- A 62-year-old man, 40 minutes of central chest pain. Pulse 42, blood pressure 88/56, JVP raised, chest clear.
- ECG: ST elevation 2 mm in II, III and aVF; ST depression in I and aVL; ST elevation 1 mm in V4R (shown only on slide 6).
- He is the RCA (slide 4), his mirror is I and aVL (slide 5), his pressure is the right ventricle (slide 6),
  his pulse is the AV node (slide 7).

Dominance and supply figures to check before build: right-dominant about 70–80%, left about 10%, co-dominant the rest;
RCA supplies the AV node in about 90% and the SA node in about 60%.

## Slides (Learn)

| # | Title (Arabic draft) | Shows | Figure |
| --- | --- | --- | --- |
| 1 | Hook | The 62-year-old man; "Which artery is blocked?" Options shuffled: LAD, Circumflex, RCA, Left main | New: a small 12-lead strip, his leads only |
| 2 | Three arteries (ثلاثة شرايين) | Tap an artery: it draws on the heart, its territory shades in its colour | **New: the heart with three arteries** |
| 3 | Twelve cameras (اثنا عشر منظرًا) | The 12 leads in the usual 3 × 4 grid; tap a wall, its leads light in the wall's colour | **New: the lead grid** |
| 4 | Leads to artery (من رسم القلب إلى الشريان) | The table above as reveal cards: leads → wall → artery, each card's figure the heart with that territory | Reuses 2 and 3 |
| 5 | The mirror (المرآة) | One ST elevation and its upside-down reflection; then V1–V3 depression turned over = posterior STEMI | **New: an ST segment and its mirror** |
| 6 | The right ventricle (البطين الأيمن) | His low pressure: inferior + V4R; no GTN, fluids | Reuses 2 (RV shaded) |
| 7 | The slow heart (تباطؤ ضربات القلب) | His pulse of 42: the RCA's branch to the AV node | Reuses 2 (AV node marked) |
| 8 | Solve the hook | Clue stem: tap "II, III, aVF" and "pulse 42", each lights its slide's answer → RCA | Existing `clue-stem` |

Patterns: 1 `hook`, 2–3 new figures in `story` (each tap adds a beat), 4 `reveal-cards`, 5 `story`, 6–7 `story`,
8 `clue-stem`. The heart, lead grid and mirror are new story kinds in `engine/js/story.js` (an engine change, planned
with this lesson). Every new figure goes on one mockup sheet, three options each (gate 2).

Concepts (one label, letter and colour each, from the topic's `concepts` block): **LAD**, **Circumflex**, **RCA**;
the walls (inferior, anterior, lateral, posterior, right ventricle) take their artery's colour.
Arabic (drafts, for the user's review): الشريان الأمامي النازل الأيسر (LAD), الشريان المنعطف (circumflex),
الشريان التاجي الأيمن (RCA), سفلي (inferior), أمامي (anterior), جانبي (lateral), خلفي (posterior), تغيرات مرآتية (reciprocal).

## Cases (Practise, all original)

| ID | Stem (short) | Answer | Other options |
| --- | --- | --- | --- |
| c01 | The hook, solved | RCA | LAD; Circumflex; Left main |
| c02 | ST elevation V1–V4, ST depression II, III, aVF | LAD | Circumflex; RCA; Left main |
| c03 | ST elevation I, aVL, V5, V6 | Circumflex | LAD; RCA; Left main |
| c04 | ST elevation V1–V6, I and aVL | Proximal LAD | Circumflex; RCA; Distal LAD |
| c05 | ST depression V1–V3, tall R waves, upright T, ongoing pain. Next? | Posterior leads V7–V9 | Right-sided leads; Repeat troponin in 3 h; Echocardiogram |
| c06 | Inferior STEMI, BP 84/50, JVP raised, chest clear. Which drug to avoid? | GTN | Aspirin; Morphine; IV fluids |
| c07 | Pain-free, deep symmetrical T inversion V2–V3, troponin just raised | Critical proximal LAD stenosis | Old anterior infarct; Pericarditis; Left ventricular hypertrophy |
| c08 | Inferior STEMI: where is the reciprocal ST depression? | I and aVL | V1–V3; V5–V6; aVR |
| c09 | Inferior STEMI, pulse 38, complete heart block, narrow QRS. Which artery? | RCA | LAD; Circumflex; Left main |
| c10 | T inversion V5–V6, troponin raised, no ST elevation | Circumflex | LAD; RCA; Left main |
| c11 | ST elevation aVR, ST depression in eight leads | Left main (or three-vessel) | Proximal RCA; Circumflex; Posterior STEMI |

## Left out on purpose

- STEMI thresholds, new LBBB, reperfusion (lessons 3 and 4); heart block and aneurysm management (lesson 6).
- Coronary anatomy beyond the three arteries and the left main (diagonals and marginals named only where a lead needs them).
- Axis, bundle branch blocks and other ECG reading (later, the ECG topic).
- Sgarbossa criteria, de Winter T waves (beyond Part 1).

## To check before build

The localisation table (Zimetbaum and Josephson 2003; ESC 2023 ACS), dominance and nodal supply percentages, Wellens'
citation, the aVR rule in ESC 2023. Each against its source; uncertain points flagged to the user.

User's review (2026-10-13, in the Claude Doc https://claude.ai/code/artifact/51880f45-5ddf-4954-bfcb-cf57c7334826):
slide 7 stays here (RCA only); c11 stays; "left circumflex" in the bank table; Arabic slide titles 4, 5, 7 as above.

Gate 2 (2026-10-13): mockup sheet sent, https://claude.ai/artifact/2hNk5BXWwMKq3h2Co35EU3 (heart A front / B bullseye / C slice; leads A grid / B round the heart / C grid + slice; mirror A line / B cameras / C cards). Recommended C, C, A. Colours proposed: LAD coral, circumflex purple, RCA teal.

Picks (2026-10-13, comments on the mockup page): heart **C, the slice**; mirror **B, opposite cameras on the slice**; leads: the user asked for a human figure, so three new options were drawn (A leads on the body, B body beside the 12-lead grid, C body + chest slice; recommended B).

Leads chosen: **B, body beside the 12-lead grid**, with the user's changes: III on the patient's right leg, II on the left leg (as their axes, +120° and +60°), and I between aVR and aVL on the chest, since it measures arm to arm.

3D option (2026-10-13): the user asked for a turning 3D heart with leads. Prototype https://claude.ai/artifact/PyZQmRqS5CtpnBUekZuVQP (three.js r128 from cdnjs, a heart built from simple shapes, leads fixed to the body, wall chips turn the heart and light their leads; V7–V9 and V4R appear only with Posterior and Right ventricle). Version 2 (the user's layout): heart upright, anterior wall facing the viewer; V1–V6 on the chest in front of it; aVR, I and aVL above (I between them), III, aVF and II below; tapping a wall turns that wall and its leads to the front. Later versions: other leads hide when a wall is chosen, the reset button restores the front view and all leads, V3–V4 sit mid-screen, the heart was rebuilt (tapered LV, RV, atria, arch, pulmonary trunk, cavae, coronary branches; anatomical colours as a switch, plain by default). Mirror leads (ST depression, dashed) shown with each wall: inferior → I, aVL; lateral → III, aVF; anterior → II, III, aVF; posterior → V1–V3; septal and RV none. Check these pairs against the sources before build. Then: simpler vessels (short aorta and pulmonary trunk stubs), soft wall patches with flat light, one teal highlight for every wall (the arteries keep their colours), mirror leads placed far below the heart (above only for inferior, whose own leads are below), septal shown by making the RV see-through. Proposed as one extra slide, "Turn the heart", after Twelve cameras; the 2D figures stay. In the lesson the library would be embedded (pages are offline), only in topics that use it.

**3D slide approved by the user 2026-10-13** (prototype version 11; source in art/drafts/cardiology/turn-the-heart-prototype.html, local only).

**Slides agreed 2026-10-13: eight Learn slides.** The 3D slide replaces Twelve cameras (so the human-figure grid 2B drops out); The mirror (opposite cameras on the slice, 3B) stays, right after the 3D slide:
1 Hook (12-lead strip) · 2 Three arteries ثلاثة شرايين (slice) · 3 Turn the heart أدر القلب (3D) · 4 The mirror المرآة (opposite cameras on the slice) · 5 Leads to artery من رسم القلب إلى الشريان (reveal cards, slice) · 6 The right ventricle البطين الأيمن (slice, RV shaded) · 7 The slow heart تباطؤ ضربات القلب (slice, AV node) · 8 Solve the hook (clue-stem). Cases c01–c11 unchanged. This replaces the slide table above.

**Checked against sources 2026-10-13 (before build):**
- ESC 2023 ACS (local PDF, section 3.2.1): V1–V3 ST depression (positive terminal T) and/or V7–V9 elevation = posterior occlusion, often the circumflex; V3R/V4R elevation = RV ischaemia; ST depression ≥1 mm in ≥6 leads with ST elevation in aVR and/or V1 = multivessel or left main (c11 stem: "six or more leads"); Wellens' sign (biphasic or deep negative T) = severe proximal LAD stenosis; nitrates not given in RV infarction (4.2.2.2); V3R, V4R, V7–V9 recommended in inferior STEMI. STEMI thresholds there too (for lesson 3).
- Zimetbaum PJ, Josephson ME. Use of the electrocardiogram in acute myocardial infarction. N Engl J Med 2003;348:933–40 (PMID 12621138): citation confirmed.
- de Zwaan C, Bär FW, Wellens HJ. Am Heart J 1982;103:730–6: confirmed (types A biphasic and B deep T inversion in V2–V3, pain-free).
- Dominance and nodal supply vary by study: right-dominant about 70–85%, left about 10%; RCA supplies the AV node in about 85–90%, the SA node in about 55–60%. Slides say "most hearts" and "about 9 in 10" (AV node), no SA figure.
- Reciprocal pairs (inferior ↔ I, aVL; lateral ↔ III, aVF; anterior ↔ inferior leads; posterior ↔ V1–V3): standard teaching, consistent with ESC; septal and RV have none shown.

Cardiology sections agreed 2026-10-13 (the user): the twelve above, A Coronary heart disease first.

**Built 2026-10-13** (commit 102c89c, local): content/cardiology/coronary-arteries-ecg.yaml (status draft), the heart drawings (art/make_heart_figures.py), the heart3d pattern, cardiology on the site. All page and site checks pass; statistics lessons re-checked. Review copy of the deck: https://claude.ai/artifact/SbgjjWjMUAs5xhEzW1Rfmj. Codex QA running.

## Revision after the user's review (2026-10-13, agreed)

Seven comments on the review deck; agreed plan, nine Learn slides:
1. Three arteries: the slice opens grey with LV and RV labelled; every wall tappable on its own (not in sequence), a tap lights it with a pill "wall · artery"; tap again closes. New tappable figure (engine).
2. The mirror: the same tappable slice; a wall's own leads (ST up) and its mirror leads across the heart (ST down). Pairs: inferior → I, aVL (aVL most sensitive); lateral → III, aVF (often II); anterior → II, III, aVF (points to proximal LAD, Zimetbaum and Josephson 2003); posterior → V1–V3; septal alone and RV none.
3. Leads to artery: the closed card shows only the leads and a grey slice; opening it shows the coloured wall, the answer and the Arabic tag (the tag and colour gave the artery away).
4. The right ventricle, deeper, one beat per tap: proximal RCA starves the RV too (about a third of inferior MIs: to confirm); RV cannot pump, LV underfilled, BP falls; blood backs up, raised JVP (Kussmaul) with clear lungs (the triad); V4R ST elevation ≥ 1 mm; do fluids and early reperfusion, avoid nitrates and diuretics (ESC 2023 for nitrates; fluids: a checked source to cite).
5. The slow heart: the first tap lights the RCA, the inferior wall and the AV node together.
6. New slide after it, anterior MI with heart block: septal infarct (LAD) below the AV node, Mobitz II or complete heart block with a wide slow escape, unstable, worse prognosis, needs pacing; against inferior: AV nodal, narrow escape, usually passes (bank: Mobitz II after anterior MI → pace; CHB after inferior MI, stable → observe; ESC 2023 on pacing).
7. Back to the hook as an algorithm, a step per tap with the stem words lighting: leads → wall → artery, then supporting clues (pulse 42 → AV node → RCA; low BP + raised JVP + clear chest → RV → RCA).
Next: one mockup sheet (the tappable slice, RV in beats, anterior heart block, the algorithm), three options each.

Revision mockups sent 2026-10-13: https://claude.ai/artifact/RVah6aU3c53krWVKjS52h9 (recommended 1A pill by the wall, 2C two pumps, 3B conduction system, 4A numbered steps). New slide title: Anterior MI and heart block / الاحتشاء الأمامي وإحصار القلب (draft).

Picks (comments 2026-10-13): 1B card beside the slice (roomier lead cards); 4A numbered steps; RV figure rebuilt as right heart | lungs | left heart (new options); The slow heart and the anterior heart block merge into one slide, MI and bradycardia (الاحتشاء وبطء القلب, draft), inferior then anterior. Round 2 mockups on the same page.

Picks: RV A (side by side), MI and bradycardia A (walls with the conduction system between), lines kept between the five walls. **Revision built 2026-10-13**: heart-slice pattern (engine/heartsvg.py, engine/js/heartslice.js) for Three arteries and The mirror; blind reveal cards; drawings heart-rv, heart-brady, heart-algorithm. All checks pass. To verify before approval: a checked source for IV fluids in RV infarction (ESC 2023 main text covers only nitrates).

**Status: revision built; awaiting the user's review. Not pushed; Codex QA still to run.**
