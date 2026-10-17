# Diagnosing ACS (cardiology, lesson 4): plan

Planned 2026-10-17. Nothing built. Topic `cardio.diagnosing-acs` (slug already in `curriculum.yaml`), title
"Diagnosing ACS" (تشخيص متلازمة الشريان التاجي الحادة, draft), section A.

Chapter: 1 Coronary arteries and the ECG · 2 Is it angina? · 3 Treating stable angina · **4 Diagnosing ACS** ·
5 Reperfusion · 6 Antiplatelets and anticoagulants in ACS · 7 Complications of MI · 8 After the MI.

## The question this lesson answers

Chest pain at rest, now: is it an acute coronary syndrome, and which of the three is it?

## What the bank asks (ACS file, 113 questions; read for weighting only)

Diagnosis 35, investigation 9, pathophysiology 7, treatment 62. Of the diagnosis and investigation questions:

- **Territory from the ECG (about 15).** Already lesson 1 (leads → wall → artery, mirror, posterior, RV, aVR).
  Used here only inside cases, never retaught.
- **Complications by day (about 14)**: aneurysm, tamponade, papillary muscle, VSD, cholesterol embolism, stent
  thrombosis. Lesson 7.
- **This lesson (about 12)**: STEMI threshold, 1 mm in two contiguous limb leads (PT-300); non-diagnostic 0.5 mm
  elevation → repeat the ECG (PT-46); do not wait for a blood test in STEMI (PT-161); troponin raised in NSTEMI
  (PT-140) and in myocarditis (PT-147); most specific marker troponin (PT-35); first to rise myoglobin (PM-461);
  troponin's place on the thin filament, binding tropomyosin (PM-128, PM-341); Takotsubo (PM-64); cocaine STEMI
  (PT-299, PT-326, treated as STEMI: lesson 5); acute pericarditis ECG (several, filed elsewhere in the bank).
- Treatment questions (62) go to lessons 5, 6 and 8.

## Sources (local PDFs in the Q banks `_guidelines/`; recheck online before build)

- ESC 2023 ACS guideline, sections 3.2.1 (STEMI criteria, BBB, extra leads), 3.2.2 (NSTE-ACS ECG), 3.3 (hs-cTn,
  0 h/1 h and 0 h/2 h algorithms).
- Fourth universal definition of MI (UDMI, 2018): myocardial injury, MI, types 1 and 2, acute versus chronic injury,
  the 99th percentile.
- NICE NG185 (ACS, 2020): early management; NICE CG95 1.1 (acute chest pain); NICE DG40 (high-sensitivity troponin).
- ESC 2025 myocarditis and pericarditis (pericarditis ECG); ESC 2024 aortic diseases (dissection); InterTAK
  criteria or ESC 2023 cardiomyopathies (Takotsubo). To be opened at the clinical check.

## Concepts, explained

**One plaque, three names.** All three start the same way: a plaque cracks and a clot forms on it. What differs is
how much of the artery the clot closes and for how long. Analogy: a burst water main. A partly blocked pipe still
lets some water through (the house downstream is short of water: **unstable angina** or **NSTEMI**); a fully blocked
pipe cuts it off (the house is dry: **STEMI**). In stable angina (lesson 2) the pipe was narrow but nothing burst.

**Two questions, in the order the answers arrive.**
1. *Is the ST segment raised (persistently)?* The ECG answers in minutes. Yes → **STEMI**: the artery is shut,
   reperfusion now. Do not wait for troponin (ESC 2023; PT-161).
2. *No: is the troponin raised, and rising or falling?* The blood answers in an hour or more. Yes → **NSTEMI**
   (muscle has died). No → **unstable angina** (ischaemic pain at rest, no muscle death).
Pitfall: ST depression or T inversion does not make it an NSTEMI. The troponin decides between NSTEMI and unstable
angina; the ECG of either can be normal (normal in more than a third of NSTE-ACS, ESC 2023 3.2.2).

**What counts as ST elevation (ESC 2023 3.2.1).** New elevation at the J point in at least two contiguous leads:
- **1 mm** in any lead other than V2–V3;
- in **V2–V3**: **2 mm** in men aged 40 or more, **2.5 mm** in men under 40, **1.5 mm** in women.
Contiguous means neighbours: II, III, aVF; I, aVL; V1 to V6 in order. Analogy: two witnesses on the same street
agreeing. Exam trick: 1 mm in II and aVF is a STEMI (PT-300); 1 mm in V2 and V3 in a man of 52 is not.

**STEMI without the classic elevation.** Treated as STEMI when the patient has ongoing ischaemic pain:
- **LBBB** (or a paced rhythm, or RBBB): the ST cannot be read. ESC 2023: manage as STEMI whether or not the block
  is known to be old. (Older teaching and many exam stems say "new LBBB": flagged below.)
- **Posterior MI**: ST depression in V1–V3, tall R; record V7–V9 (lesson 1, recapped in one card).
- **Elevation in aVR with ST depression in six or more leads**: left main or three vessels (lesson 1).
- **Not diagnostic yet** (0.5 mm, ongoing pain). An occlusion evolves over minutes: the first ECG can be taken
  before the ST has risen, showing only hyperacute T waves or elevation below the threshold (ESC 2023 3.2.2 lists
  hyperacute T waves among the early changes). One ECG is a snapshot; while the pain goes on, repeat it and
  compare, because the STEMI may appear on the next one and that, not the troponin, decides reperfusion.
  Sources: ESC 2023 3.2.1 recommends an additional 12-lead ECG with recurrent symptoms or diagnostic uncertainty
  (class I, level C), and gives no interval. The 15 to 30 minute interval is the AHA/ACC 2014 NSTE-ACS guideline's
  (serial ECGs at 15 to 30 minute intervals in the first hour if the first is not diagnostic); to be confirmed
  online at the clinical check. The bank's answer is 15 minutes (PT-46).

**Troponin.** Analogy: the muscle's contents spill into the blood when its cells die; troponin is a piece found only in
heart muscle, so it is the specific witness. Part of the thin filament: troponin C binds calcium, troponin I holds
actin back, **troponin T binds tropomyosin** (PM-341, PM-128).
- With high-sensitivity assays it rises within about an hour of the pain (ESC 2023 3.3.1) and stays raised for days.
- **Myoglobin** rises first but is not specific (also in skeletal muscle); exam answer to "first to rise" (PM-461).
- **CK-MB** falls back within two or three days. Older teaching used it for reinfarction; UDMI now uses a further
  rise of troponin of 20% or more. CK-MB is named only (flagged).

**One number is not enough (UDMI 2018).** The line is the **99th percentile** of healthy people (14 ng/L for the
high-sensitivity troponin T assay used in the lesson's numbers). Two samples, 0 h and 1 h (or 2 h):
- above the line and **rising or falling** → acute injury; with an ischaemic story → MI;
- above the line but **flat** → chronic injury (for example CKD, heart failure);
- below the line and flat, with pain that began long enough ago → MI ruled out (the exact rule-out cut-offs are
  assay-specific: named only).
Pitfall: a first troponin below the line does not exclude an MI if the pain began recently; the hook turns on this.

**Troponin up, not a blocked artery.** Myocardial injury from another cause, or a **type 2 MI** (supply cannot meet
demand without a new clot: fast AF, anaemia, hypotension, sepsis; lesson 2's supply and demand). Myocarditis, PE,
sepsis, CKD (chronic, flat), heart failure, aortic dissection, Takotsubo. Analogy: the alarm is real, but the fire
is not in the coronary artery.

**ST up, not a blocked artery (mimics).**
- **Acute pericarditis**: widespread, concave (saddle) elevation, not in one territory; **PR depression**; no mirror
  changes except in aVR (and V1); pain sharp, worse lying, better sitting forward.
- **Takotsubo**: after emotional or physical stress, often an older woman; ST elevation and raised troponin, but the
  coronaries are unobstructed and the apex balloons (PM-64).
- **Aortic dissection**: tearing pain to the back, unequal arm pressures; it can take the RCA and give a true inferior
  STEMI. Rule it out before giving antithrombotics.
- **Cocaine**: spasm and clot give a true STEMI; diagnosed as STEMI and treated as one (lesson 5).
- An old anterior MI's **aneurysm** (persistent elevation weeks later) is lesson 7.

## Pitfalls and exam tricks

- ST depression or T inversion → NSTE-ACS; troponin then decides NSTEMI or unstable angina.
- Normal first troponin, recent pain → repeat it; the second decides.
- Raised troponin with a flat curve and CKD → chronic injury, not NSTEMI.
- STEMI on the ECG → reperfusion now; never wait for the troponin.
- LBBB with ongoing ischaemic pain → manage as STEMI.
- V1–V3 ST depression with tall R → posterior STEMI, ask for V7–V9 (lesson 1).
- Widespread saddle ST elevation with PR depression → pericarditis.
- ST elevation, clean coronaries, ballooned apex after a bereavement → Takotsubo.
- "First marker to rise" → myoglobin; "most specific" → troponin.

## Numbers (the same man as lessons 2 and 3)

- Patient A, now 62: diabetes, hypertension, ex-smoker, 70% proximal LAD stenosis (lesson 3), on bisoprolol and
  amlodipine, controlled.
- Today: 40 minutes of central crushing pain **at rest**, sweaty; arrives 1 hour after it began. Pulse 92, BP 148/88.
- ECG: 1 mm horizontal ST depression in V4–V6; no ST elevation. (V4–V6, not V1–V3, so it never reads as posterior.)
- High-sensitivity troponin T, 99th percentile 14 ng/L: **0 h 9 ng/L, 1 h 38 ng/L.** The first value is below the
  line; the second is above it and has risen by 29 (above the ESC rule-in change for this assay; checked at build).
- Hook stem, in the house style (DESIGN.md, Explanations, Stems): *A 62-year-old man presents with central crushing
  chest pain that began at rest an hour ago and is still present. He has a past medical history of stable angina,
  type 2 diabetes and hypertension. He is an ex-smoker. His medications are bisoprolol 10 mg, amlodipine 5 mg,
  aspirin 75 mg, atorvastatin 80 mg, ramipril 10 mg and sublingual GTN. On examination, he is sweating, his heart
  rate is 92 and regular, and his BP is 148/88 mmHg. His ECG shows 1 mm horizontal ST depression in V4–V6. His high-sensitivity troponin T is
  9 ng/L on arrival and 38 ng/L at 1 hour (99th percentile 14 ng/L).* Every case stem follows the same style.
- Hook question: "What is the diagnosis?" No options on the Learn hook. c01 options shuffled: NSTEMI (answer),
  Unstable angina, STEMI, Stable angina.
- Why: no ST elevation, so not a STEMI; the troponin rose above the 99th percentile within an hour, so muscle has
  died: NSTEMI, not unstable angina; pain at rest for 40 minutes is not stable angina.

## Slides (Learn)

| # | Title (Arabic draft) | Shows | Figure |
| --- | --- | --- | --- |
| 1 | What is the diagnosis? (ما التشخيص؟) | The hook: Patient A's rest pain, ECG, two troponins | Reuse `hook` and Patient A's cartoon; the troponin pair as a small figure in the card |
| 2 | Stable angina or ACS? (ذبحة مستقرة أم متلازمة حادة؟) | Side by side. Stable: pain on exertion, eases with rest or GTN within minutes, a fixed narrowing. ACS (NICE CG95 1.2.1.3): pain at rest lasting more than 15 minutes, new pain, or angina that worsens quickly with little or no exertion; sweating, nausea, breathlessness; a cracked plaque with clot | **New: two columns**, one artery each (narrowed / cracked with clot) |
| 3 | One plaque, three outcomes (لويحة واحدة وثلاث نتائج) | A plaque cracks, a clot grows: partly closed (unstable angina, NSTEMI) or fully closed (STEMI) | **New: an artery with plaque and clot**, three states |
| 4 | Two questions (سؤالان) | ST raised? → STEMI. No: troponin rising above the line? → NSTEMI : unstable angina | Reuse `decision-tree` (in rows), the three concepts as its answers |
| 5 | What counts as ST elevation (متى نعتبر ST مرتفعًا) | J point, two contiguous leads; 1 mm; V2–V3: 2, 2.5, 1.5 mm | **New: a beat on mm paper with the J point and a ruler**; the thresholds on taps |
| 6 | STEMI without the elevation (احتشاء بدون ارتفاع واضح) | LBBB or paced; posterior (V1–V3 down, V7–V9); aVR up with widespread depression; not diagnostic yet → repeat the ECG (see Concepts) | Reuse `reveal-cards` (blind), small beat icons |
| 7 | What troponin is (ما هو التروبونين) | The thin filament: actin, tropomyosin, troponin C (binds calcium), I (holds actin back), T (binds tropomyosin); calcium moves tropomyosin and myosin can grip. The heart's own I and T are why the test is specific | **New: the thin filament**, beat by beat |
| 8 | Markers over time (المؤشرات عبر الوقت) | Myoglobin first, not specific; troponin within about an hour (high-sensitivity), lasts days; CK-MB back to normal in 2–3 days, so in the past a new CK-MB rise was how reinfarction was found; now a further troponin rise of 20% or more (UDMI 2018) | **New: three curves over days** |
| 9 | One number is not enough (رقم واحد لا يكفي) | The 99th percentile line; 0 h and 1 h: rising (acute), flat and high (chronic), flat and low (ruled out) | **New: two dots and a line**, three states |
| 10 | Troponin up, artery open (تروبونين مرتفع وشريان مفتوح) | Type 2 MI, myocarditis, PE, sepsis, CKD (flat) | Reuse `reveal-cards` (blind) |
| 11 | ST up, not a blocked artery (ارتفاع ST دون انسداد) | Pericarditis, Takotsubo, aortic dissection; cocaine is a true STEMI | Reuse `reveal-cards` (blind), small ECG and heart icons |
| 12 | Back to the hook (العودة إلى الحالة) | No ST elevation → not STEMI; 9 then 38 above 14 → rising → NSTEMI | Reuse `story`, `kind: art` (the slide 9 figure filled with his numbers) |

Twelve Learn slides, plus the title and the end (the author's review, 2026-10-17: a stable angina / ACS comparison
before the plaque, and troponin's structure on its own slide). Each teaching slide must fit the 1280 × 720 stage in its fullest state,
with Arabic on. The approved titles Back to the hook and Your score are reused unchanged.

## What carries over from lessons 1–3

- Lesson 1: leads → wall → artery, the mirror, posterior and V7–V9, aVR with widespread depression. Recapped in one
  card on slide 5; used in cases; not retaught.
- Lesson 2: supply and demand (type 2 MI), typical pain, Patient A. Lesson 3: Patient A's LAD stenosis and drugs.
- Reuse the approved Arabic for the walls and arteries (DESIGN.md, Arabic).

## Concepts (one label, letter and colour each; colours at the mockup sheet)

- **Unstable angina** U (الذبحة الصدرية غير المستقرة), **NSTEMI** N (احتشاء القلب بدون ارتفاع ST), **STEMI** S
  (احتشاء القلب مع ارتفاع ST; the author's wording, 2026-10-17). One family, **ACS** (متلازمة الشريان التاجي الحادة),
  in three shades from partly to fully closed.
- Neutral: Troponin (التروبونين), Myoglobin (الميوجلوبين), CK-MB, Myocardial injury (إصابة عضلة القلب), Type 2 MI
  (احتشاء القلب من النوع الثاني), Type 1 MI (احتشاء القلب من النوع الأول).
All Arabic here is draft.

## Gate 2 mockup brief (after this plan is approved)

One PNG sheet, three options each, on the real slide frame: the artery with plaque and clot (slide 2); the ST ruler
(slide 4); the marker curves and the thin filament (slide 6); the troponin pair (slides 7, 10 and the hook's card);
the card icons for slides 5, 8 and 9. Patient A's cartoon is reused.

## Cases (Practise, all original)

| ID | Stem (short) | Answer | Other options |
| --- | --- | --- | --- |
| c01 | The hook, solved | NSTEMI | Unstable angina; STEMI; Stable angina |
| c02 | 30 min crushing pain; 2 mm ST elevation in II, III, aVF; troponin pending | STEMI | NSTEMI; Unstable angina; Acute pericarditis |
| c03 | 25 min rest pain, settled; T inversion V4–V6; hs-troponin 0 h 6, 1 h 7 (99th percentile 14) | Unstable angina | NSTEMI; STEMI; Stable angina |
| c04 | Man of 52, ongoing pain. Which ECG finding meets STEMI criteria? | 1 mm ST elevation in II and aVF | 1 mm in V2 and V3; 1 mm in III alone; 0.5 mm in II, III and aVF |
| c05 | 40 min typical pain, ongoing; LBBB, no old ECG; stable | Manage as STEMI | Wait for the troponin; Treat as stable angina; Exercise ECG |
| c06 | Ongoing pain; 0.5 mm ST elevation V2–V4, criteria not met. Which test decides now whether he needs immediate reperfusion? | Repeat the ECG in 15 minutes | Discharge with GTN; Exercise ECG tomorrow; Repeat the troponin at 1 hour |
| c07 | Which marker rises first after an MI? | Myoglobin | Troponin T; CK-MB; LDH |
| c08 | Troponin T binds which protein? | Tropomyosin | Calcium; Actin; Myosin |
| c09 | Dialysis, pain settled, ECG unchanged; hs-troponin 0 h 40, 3 h 41 | Chronic myocardial injury | NSTEMI; Unstable angina; Type 2 MI |
| c10 | Man of 25, cold last week; sharp pain, better sitting forward; widespread saddle ST elevation, PR depression | Acute pericarditis | Anterior STEMI; Takotsubo; Pulmonary embolism |
| c11 | Woman of 68, the day after her husband's funeral; anterior ST elevation; coronaries unobstructed; apex balloons | Takotsubo cardiomyopathy | Anterior STEMI; Myocarditis; Acute pericarditis |
| c12 | Tearing pain to the back; BP 165/90 right arm, 125/70 left; inferior ST elevation | Aortic dissection | Inferior STEMI from plaque rupture; Acute pericarditis; Pulmonary embolism |
| c13 | Fast AF 170, chest tightness, troponin rising; settles with rate control; coronaries unobstructed | Type 2 MI | Type 1 MI; Unstable angina; Chronic myocardial injury |
| c14 | Three days after a hip replacement; pleuritic pain, SpO₂ 89%, pulse 118; troponin raised | Pulmonary embolism | NSTEMI; Acute pericarditis; Takotsubo cardiomyopathy |

c01 is the solved example; c02–c14 are 13 scored cases in random order. c02 and c03 pair with the hook: each lands
on a different branch of the tree. Full stems, Why, wrong-option notes and the tutor note are written in the house
style (DESIGN.md, Explanations) at build and sent as a review page.

## Left out on purpose

- Territory from the ECG (lesson 1); treatment, reperfusion, GRACE and the timing of angiography (lesson 5);
  the drugs (lesson 6); complications, aneurysm, tamponade, cholesterol embolism and stent thrombosis (lesson 7);
  secondary prevention (lesson 8).
- The assay-specific rule-out cut-offs of the 0 h/1 h algorithm: named only.
- MINOCA work-up, cardiac MRI, Wellens' (lesson 1), Sgarbossa criteria, the five UDMI types beyond 1 and 2.

## Open questions for the author

1. **LBBB.** ESC 2023: manage as STEMI with ongoing ischaemic symptoms whether or not the LBBB is old. Exam stems
   often say "new LBBB". Teach ESC and note the exam phrase in c05's Why?
2. **Patient A again** (now 62, his LAD) or a new patient for the hook?
3. **CK-MB**: named only on slide 6 (reinfarction now uses a 20% troponin rise), or left out?
4. **Repeat ECG interval**: "every 15 minutes" is common teaching; ESC 2023 says only "an additional 12-lead ECG".
   Keep 15 minutes in c06?
5. **Slides 8 and 9**: two slides (troponin mimics, ST mimics) or one?

## Status

Drafted 2026-10-17; sent to the author as a review page, https://claude.ai/artifact/Ei7Pw1W4D8mQx2djAiabcy
(verdicts in collection `reviews`, row keys `<section>-<row>`, e.g. `slides-s4`, `open-lbbb`).
**Status: Plan sent (gate 1).**

Round 1 (the author's verdicts and comments, 2026-10-17). Agreed as drafted: the question, scope, left out, hook,
slides 1 and 4–12 (old numbering 3–10), c01–c14, and all five open questions as suggested (ESC on LBBB, Patient A,
CK-MB named only, 15 minutes in c06, two mimic slides). Changed:
- Concepts' Arabic: احتشاء القلب مع / بدون ارتفاع ST, and احتشاء القلب for every MI term.
- A new slide 2 compares stable angina with ACS; the plaque slide follows as "One plaque, three outcomes".
- Troponin's structure gets its own slide (7); slide 8 says CK-MB was used for reinfarction in the past.
- "Not diagnostic yet" explained with its sources (above).
- c06: "Troponin at 12 hours only" becomes "Repeat the troponin at 1 hour"; the question now asks which test
  decides reperfusion, so the repeat ECG stays the one best answer (a 1-hour troponin is also done, but never
  decides reperfusion: ESC 2023; PT-161).
- The hook's stem is written in the house style; every case stem follows it.
Round 2 sent on the same page.

Round 2 (2026-10-17): all seven changed rows agreed. The hook stem: sweating moves into the examination sentence,
and the CT coronary angiography sentence is removed (both now stem rules in DESIGN.md, Explanations, Stems).
Next: the clinical check against the online sources (NICE NG185, CG95 1.2.1.3, ESC 2025 pericarditis, ESC 2024
aorta, the AHA/ACC 2014 15–30 minute ECG interval, the hs-cTnT rule-in change), then the gate 2 mockup sheet:
the stable angina / ACS columns, plaque and clot, ST ruler, thin filament, marker curves, troponin pair, card icons.
**Status: Agreed (gate 1), 2026-10-17.**

## Clinical check (2026-10-17): Q bank guidelines first, then online

**Local PDFs (Q banks `_guidelines/`).**
- ESC 2023 ACS 3.2.1: STEMI thresholds (V2–V3 2.5 mm men <40, 2 mm men ≥40, 1.5 mm women; 1 mm other leads);
  V3R/V4R in inferior STEMI, V7–V9 for posterior; BBB or paced rhythm with ischaemic symptoms managed as STEMI
  "regardless of whether the BBB is previously known"; an additional 12-lead ECG with recurrent symptoms or
  diagnostic uncertainty. Confirmed.
- ESC 2023 3.2.2: NSTE-ACS ECG may be normal in more than a third; hyperacute T waves among the early changes.
  3.3: hs-cTn rises usually within 1 h; 0 h/1 h best, 0 h/2 h alternative; a third sample at 3 h in the observe
  zone (so c09's 0 h 40, 3 h 41 is right). Myocardial injury acute (sepsis, myocarditis, Takotsubo) or chronic (HF,
  cardiomyopathy, valve disease); type 2 MI from supply-demand mismatch. Confirmed.
- UDMI 2018: injury = cTn above the 99th percentile; acute = rising and/or falling; MI = acute injury with
  ischaemia; CK-MB less sensitive and specific; reinfarction needs a >20% rise in the second sample (immediate
  sample, then 3–6 h, earlier with sensitive assays); CKD as a cause of raised cTn. Confirmed.
- ESC 2025 myocarditis and pericarditis: PR depression and widespread ST elevation as criteria; pain sharp, pleuritic,
  better sitting up and leaning forward, worse lying down. Confirmed.
- ESC 2023 cardiomyopathies 3.3.2: Takotsubo, apical ballooning without obstructive coronary disease, mostly
  post-menopausal women, after emotional or physical stress; ST elevation and a mild troponin rise can come first,
  then diffuse T inversion. Confirmed (c11 keeps "anterior ST elevation").
- ESC 2024 aorta 9.3.1: pulse deficit and differences in systolic BP between arms sought; ECG used to exclude
  STEMI; D-dimer and ECG-gated CT. Confirmed. It does not state the RCA mechanism (online, below).
- NICE NG185 is about management; nothing diagnostic in this lesson depends on it.

**Online.**
- NICE CG95: the ACS symptom list (pain lasting longer than 15 minutes; with nausea, vomiting, marked sweating or
  breathlessness; haemodynamic instability; new onset or abrupt deterioration of stable angina) is **1.2.1.3**,
  not 1.1.1.1 as the plan said; corrected on slide 2. The NICE page itself refused the fetch; the wording was
  confirmed from NICE's own documents ([evidence appendix](https://nice.org.uk/guidance/cg95/evidence/appendix-a-summary-of-evidence-pdf-6901592654),
  [addendum](https://nice.org.uk/guidance/cg95/documents/short-version-of-addendum)). Recheck the live page before build.
- Serial ECGs: the [2014 AHA/ACC NSTE-ACS guideline](https://professional.heart.org/en/science-news/-/media/9d8104729d0f477eb6f2967268095827.ashx)
  says, if the first ECG is not diagnostic but symptoms continue with high suspicion, serial ECGs "e.g., 15- to
  30-minute intervals during the first hour" (class I, level C). The 2025 ACC/AHA ACS guideline's wording was not
  found; c06's "15 minutes" rests on the 2014 text and the bank. Confirmed as an example interval.
- Hook troponin: the ESC 0 h/1 h cut-offs for Elecsys hs-cTnT ([Roche](https://diagnostics.roche.com/content/dam/diagnostics/Blueprint/en/pdf/cps/Roche%20Accelerated%20AMI%20Algorithm%20Brochure%20(1).pdf)):
  rule-in 0 h ≥52 or a 1 h change ≥5 ng/L; rule-out 0 h <12 with a change <3 (or <5 with pain over 3 h).
  9 → 38 is a change of 29: rule-in. Confirmed. **c03 changed from 0 h 6, 3 h 7 to 0 h 6, 1 h 7**, so it is the
  same 0 h/1 h algorithm (rule-out: below 12 with a change of 1).
- Markers: myoglobin earliest (about 1–3 h), CK-MB back to normal in 48–72 h (hence its old use for
  reinfarction), troponin T raised 10–14 days, I 7–10 days (teaching sources; timings vary between sources, so the
  slide shows the order and the shapes, not hours).
- Troponin subunits: C binds calcium, I inhibits the actin-myosin interaction, T anchors the complex to
  tropomyosin (FASEB/JCI reviews; bank PM-341). Confirmed.
- Aortic dissection: acute MI in about 1–2% of type A dissections, the RCA more often than the left, so it presents
  as inferior MI; thrombolysis given in error is catastrophic ([review, PMC3174121](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3174121/)).
  Slide 11 says "can involve the RCA" and "uncommon", per DESIGN.md's word rule.
- Cocaine: the [AHA 2008 statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC2643148) manages cocaine ACS like
  spontaneous ACS (benzodiazepines first, avoid beta-blockers acutely). Its STEMI reperfusion detail belongs to lesson 5.

**Result:** no clinical change to the agreed plan; one citation corrected (CG95 1.2.1.3) and c03's second troponin
moved to 1 h. **Status: Agreed and clinically checked, 2026-10-17. Next: gate 2 mockup sheet.**

## Gate 2 (2026-10-17)

Mockup sheet sent: https://claude.ai/artifact/CKSSHDhhDoqRek71S4yCup (picks in collection `reviews`, keys
`g2-m1` … `g2-m7`). Seven figures, three options each, drawn on lesson 3's real slide frame by a local script
(scratch only, not in the repo): 1 stable angina or ACS (A cards, B table, C split artery); 2 one plaque (A three
arteries, B one artery that builds, C cross-sections), with the proposed colours UA amber, NSTEMI orange, STEMI red;
3 ST elevation (A one beat + list, B calipers + chips, C 12-lead grid + zoom); 4 troponin (A filament, B padlock,
C zoom chain); 5 markers (A one graph, B bars, C small multiples); 6 troponin pair (A joined dots, B bars, C tubes);
7 card pictures (A grey line, B filled, C ECG on paper). Recommended B, B, A, A, A, A, A.
**Status: Mockups sent (gate 2), 2026-10-17.**


Picks (2026-10-17): 1 **B** (table), 2 **A** (three arteries with their muscle), 3 **A** (one beat + list),
4 **A** (filament), 5 **A** (one graph), 6 **A** (joined dots), 7 **C** (ECG cards on mm paper). Colours agreed:
unstable angina amber, NSTEMI orange, STEMI red. Comments, applied in round 2 on the same page: 1B's row names
(When, How long, Pattern) stand before any tap; every ECG has smooth rounded P and T waves; the filament corrected
after an online check (two actin strands, tropomyosin over the myosin-binding sites, a troponin every seven actins,
I on actin; calcium on C shifts tropomyosin aside; PMC5367448, PMC2693027).

Round 2 approved by the author, 2026-10-17. The mockup generator (one script drawing all seven sheets on lesson 3's
slide frame) is scratch only; the build draws the chosen figures afresh as `story`, `kind: art` drawings in a new
`art/make_acs_figures.py`, with the smooth ECG beat shared by every ECG in the lesson.
**Status: Agreed, clinically checked and mockups chosen (gates 1 and 2), 2026-10-17. Next: build.**
