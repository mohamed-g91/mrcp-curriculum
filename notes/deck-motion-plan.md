# Slide changes and clinical animations: cardiology lessons 1 and 2

The question: what would make the recorded cardiology lessons feel premium (Lecturio-like) without changing the format? A smooth slide change for every lesson, and a few animations that show a process a still drawing only half shows. Each animation runs on the presenter's tap or Next, so it follows the voice by construction.

## 1. The slide change (engine-wide, every lesson)

Today: the old slide disappears at once and the new one rises 8 px while fading in over 0.45 s (`.slide.active`, `engine/css/base.css`), so the stage is blank for a moment: a hard swap.

Three options on one sheet (`art/drafts/deck-motion/transitions-ABC.png`, drawn from Three arteries → Leads and walls):

| | Option | Feel |
| --- | --- | --- |
| A | Dissolve: the whole stage crossfades, 0.4 s | Calm, but the two slides' drawings overlap halfway |
| B | Push: the old slide leaves left, the new one comes in from the right (Back reverses), 0.5 s | A clear "next page"; the most movement |
| C | The frame holds: the bars never move; the old title and body fade out, then the new ones rise in, 0.5 s | Calm and clean, nothing overlaps; the slide's own entrances (0.5 s, 0.16 s apart) follow as now |

**Chosen: C** (user, 16 October 2026). It suits a talking lecture (nothing big moves while you speak), never shows two drawings at once, and keeps the entrance rule. Reduced motion: an instant change, as now. Recording view and the candidate's page alike.

## 2. Animations, slide by slide (each one a candidate: keep or drop)

Lesson 1, Coronary arteries and the ECG

| Slide | Now | Candidate animation |
| --- | --- | --- |
| Which artery is blocked? | Six ECG leads shown at once | The leads write themselves left to right like a monitor, one after another (gives nothing away: every lead writes the same way) |
| Three arteries | Tap an artery: it is named, its walls light | The artery fills from its origin to its tip (a bright pulse running along it, about 0.8 s), then its walls light |
| Leads and walls | A wall's button lights its leads and the patient's electrodes | The electrodes pulse once as they light |
| The mirror | Tap a wall: the dashed line through the heart | The dashed line draws from the wall through to its mirror |
| From ECG leads to artery | Five cards | A card's small heart lights its territory as it opens |
| The right ventricle | RV → lungs → LV, then MI, JVP ↑, BP ↓ | Blood as dots moving along the arrows; at the MI step the flow from the RV thins and slows, BP ↓ lands as the LV empties; IV fluids restore the flow. **The strongest one: it shows why fluids, not nitrates** |
| MI and bradycardia | Inferior vs anterior, AV node and bundle branches | An impulse travels from the SA node; in inferior MI it pauses at the AV node and usually passes (narrow), in anterior MI it is stopped below in the bundle branches (wide, unstable) |

Lesson 2, Is it angina?

| Slide | Now | Candidate animation |
| --- | --- | --- |
| Two patients | Two stems with V4–V6 | The same writing ECG |
| Supply and demand | At rest vs on the hill | The pulse counts up 70 → 130 while "needs" grows 2 → 4 and "gets" stays at 2; the heart beats at the pulse's speed. **The second strongest** |
| Anginal or non-anginal? | Three features, then the type | Each feature ticks in as you name it; the count settles on its type (3 typical, 2 atypical, 1 or 0 non-anginal) |
| Angina with a normal angiogram | Syndrome X and Prinzmetal | The ST segment moves down on exertion (Syndrome X) and up at rest at dawn (Prinzmetal) as each is shown |

Also seen: Supply and demand, and Anginal or non-anginal?, open on an empty stage until the first Next. Opening them on their first step (as Typical and atypical already does, `start: 1`) removes a blank moment on the recording.

Left out on purpose: decorative motion (floating, looping, parallax), anything on Practise's cases (a case gives nothing away), sound.

## How it would be built (after the choice)

- The slide change: `engine/js/deck.js` keeps the old slide for 0.25 s while it fades, `engine/css/base.css` the two keyframes; DESIGN.md, Behaviour rules ("Entry is quick and in step") updated.
- Each kept animation: in its pattern's JS and CSS (`heartslice.js`, `story.js` with the art SVGs, the hook's ECG), driven by the existing taps and steps; checks in `build.py` and `checks/check.mjs` where they measure layout.
- Each kept animation starts as three mockups (DESIGN.md), on one sheet for all of them.
- Lesson 1 is being edited in another session; this waits until it is committed.

## 3. The first two animations: three options each

Sheet: `art/drafts/deck-motion/rv-and-supply-ABC.png`, drawn on the real slides at their steps.

| | The right ventricle | Supply and demand |
| --- | --- | --- |
| A | Dots along the route: blue before the lungs, red after; at the MI they dam in the vein and RV and only a trickle reaches the LV; IV fluids let more through | Pulse count and beat: ripples on the heart at the pulse's speed; 70 counts to 130, needs 2 to 4, gets stays at 2 |
| B | Filling levels: the RV brims, the LV runs low; fluids fill the LV again; the arrows' dashes run with the flow | Flow through the narrowing: inside the zoom circle the blood moves; on the hill it queues at the plaque and only two pass; the muscle beyond pulses red |
| C | One pulse per beat: a bright pulse runs the route and the chambers squeeze; after the MI the RV stops squeezing and the pulse fades | Needs and gets gauge: two bars in place of the pill; needs grows, gets stops at the narrowing's limit; the gap is the ischaemia |

**Chosen: B for both** (user, 16 October 2026). Built: the RV's levels (RV 60% → brim at the MI; LV 60% → 50% at the MI → 18% at BP ↓ → 50% with IV fluids) and the flow along its arrows (full, a trickle after the MI, more with fluids); the supply zooms' arrows slide in as each side comes on (the hill's queue slower), and the starved wall flushes red three times. Each runs a few times on its step, then rests. In `art/make_heart_figures.py`, `art/make_angina_figures.py` and the art rules in `engine/css/patterns.css` (`lvl`, `flow`, `fl`, `isch`); the slide change in `engine/js/deck.js` (handover) and `engine/css/base.css`.

Status: Built (slide change C, RV B, supply B), 16 October 2026; awaiting the user's review. The other animations in section 2 are still candidates.
