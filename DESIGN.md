# Interactive Teaching Page Design Guide

Design rules for every topic page in the MRCP curriculum. Each page is both the visual for a short YouTube video and a practice page viewers come back to. Carried over from the first page (Choosing the right test) and extended in September 2026 for the 16:9 video stage and the bolder look.

## Core principles

Every page teaches one decision process: show the skeleton first, and let the learner tap for the detail.

1. **One idea per slide.** A slide answers one question in its heading, e.g. "Three quick questions".
2. **Minimal text on screen.** Show names and labels only. Examples, answers and explanations stay hidden until tapped.
3. **No instruction sentences.** Slides never say "Tap a circle…" or "Drag…"; the circles, cards and buckets make the interaction obvious. `build.py` warns when a slide title reads like an instruction.
4. **Hook with a real question.** The first slide after the title is an exam-style stem and its question, with no options or answer. A later slide comes back to it and solves it.
5. **Learn, then practise.** "Learn" is the video deck; "Practise" applies the same steps to cases on the page.
6. **Same order everywhere.** Question flows, cases and summaries use one order and one wording.

## Visual system

A clinical look with conviction: one primary blue, one colour per concept family, big type sized for a 1080p recording.

| Element | Rule |
| --- | --- |
| Primary colour | Deep blue (#1F4E8C) for step numbers, stem accents, links, primary buttons and the progress bar |
| Concept families | One family per concept group, each with a background, ink, border and solid shade (coral = categorical, green = ranked, purple = numerical, grey = neutral) |
| Family use | A concept keeps its colour, label and letter on every slide, card, bucket, choice and flow box. Labels come from the topic's `concepts`, never retyped |
| Spectrum line | A coral → green → purple gradient, used only on the spectrum, where each colour stands for a family |
| Brand | The wordmark **mrcp_Gafar** (site title in `curriculum.yaml`): Inter 800, underscore in the primary blue. It opens the top bar on every page (so it is on camera in every video), heads the home page, and ends every page title ("Types of data · mrcp_Gafar") |
| Title rule | A single-colour gradient under the page title and the home page heading: primary blue fading to transparent |
| Headings | Serif (Source Serif 4), weight 600. On the stage: title 80 px, slide heading 44 px |
| Body text | Sans-serif (Inter). On the stage: 20 px body, 23 px stems, 16 px small text; contrast at least 4.5:1 |
| Small labels | Uppercase, letter-spaced, 13 px on the stage, muted or family ink |
| No eyebrows | No kicker or label above a heading: the heading carries the slide. The top bar reads: wordmark, specialty, topic, then the part and slide name |
| Cards | 16 px corners, thin border, soft offset shadow, a 4–6 px coloured **top** edge for the family. No thick coloured left borders |
| Circles | Outlined in the family colour; filled solid with a soft ring when selected |
| Feedback | Green for correct, red for wrong, each with a drawn tick or cross icon (never a text glyph) |
| Special states | Amber marks anything unscored, such as the solved example |
| Themes | Light by default (recording), dark as a toggle; every colour is a light and a dark token |
| Fonts and assets | Embedded in the file, so the page works offline |
| Figures | Our own SVG drawings in `content/figures/`, inlined by the build (no image files, no stock art). Two kinds: **diagrams** (scales, charts) drawn in the neutral primary blue and greys, never in a concept's family colour where that would hint at an answer; and **scenes**, flat cartoon characters with a dark outline (`--sc-line`, lighter in dark mode), fixed skin, hair and uniform colours, and a recurring cast (the patient and the nurse) so the slides read as one story. A figure pops in once as its slide opens. On phones a scene moves above its card |

## Interaction patterns

Each slide is one pattern, named in the topic's YAML (`pattern:`). Pick the one that matches the shape of the content.

| Pattern (`pattern:`) | Use it for | What the learner does |
| --- | --- | --- |
| Title (`title`, automatic) | Every page | Taps Learn (open-book icon: the video deck) or Practise (pencil icon: the cases). The title, its rule (fading out at both ends) and the two cards are centred |
| Hook (`hook`) | The opening exam question | Reads it; nothing to tap. Optional `figure` (a diagram inside the card, such as the pain scale) and `scene` (a cartoon beside the card) |
| Tap-to-reveal circles (`spectrum`) | A set of types or categories on a spectrum | Taps a circle; its examples appear beneath, one by one |
| Zoom circle (`spectrum` with `open: zoom`) | A spectrum whose examples deserve the whole slide | Taps a circle; the rest of the slide fades back and the circle grows out of its dot into a large centred circle holding its letter, its name (large serif, family ink) and its examples as soft pills (white, thin family border, family dot, dark ink; popping in one by one; sized as a share of the circle so they scale with it; a long name stays on one line at a smaller size, and a long list takes smaller pills, so nothing spills out of the circle), over a fine dot texture that shows only near the rim and a thin dashed inner ring. Tapping outside, or Esc, shrinks it back into its dot; tapping another dot swaps to that one |
| Sequential question flow (`question-flow`) | A short yes/no decision (2–4 questions) | Answers each question in turn; the next unlocks and the "No" result appears. Boxes show their question or name only |
| Decision tree (`decision-tree`) | A short yes/no decision taught top-down (2–4 questions) | The first question (an outlined blue pill) sits at the top with Yes and No centred beneath it. The chosen answer slides onto the centre line, pushing the other aside. Yes draws a green line down to the next question; No draws a coral line down to the final answer. The final answer is unique: a solid, glowing family-colour card with the letter in a white circle, the name in white serif and a faint dot texture, popping in. The other answer re-routes the branch, tapping a chosen answer again undoes it, a click anywhere else starts again. The tree grows downward, so nothing above moves. With `examples` (per answer: a list, or labelled sub-lists), tapping the final answer grows a zoom circle out of its letter; tapping it again, or anywhere else, closes the circle and leaves the tree as it was. A step's `figure` puts a small neutral-blue icon of what the question means beside its pill (hidden on phones); `charts` draws, beside each answer as it appears, the chart that type of data is shown with, in the answer's family colour (under the card on phones and tablets) |
| Live worked tree (`decision-tree` with `stem`) | Solving the hook in front of the viewer | The stem sits beside the tree (above it on phones and portrait tablets); the presenter answers Yes or No live, as in the decision tree. With `path` (the right answers) and `wrong` (one line per step), a wrong answer turns red, shakes, says "Not quite." and why beneath it, and the branch goes no further until the right answer is chosen. `side` lists figures under the stem: the first shows at the start, the next after each answer, and the last one stays |
| Worked flow (`question-flow` with `path` and `stem`) | Solving the hook with the flow | Taps each question; only the branch taken lights, and the answer it lands on stands out |
| Linked highlight (`clue-stem`) | Finding clues in a sample stem | Taps a phrase or a circle; the matching pair lights up together |
| Tap-to-reveal cards (`reveal-cards`) | Pairs of "situation → answer" | Taps a card; the answer appears inside that card only |
| Drag-to-bucket (`sort`) | Sorting practice (unscored) | Drags an item, or taps it then a bucket; wrong drops shake the item only |
| One-question case (`stem-quiz`) | Naming one thing in an exam stem | Taps one of the concept choices |
| Multi-step case | Applying a whole algorithm to a stem | One step per card while a "Your path" panel fills in (to be ported from Choosing the right test) |
| Question-type hub and routes | Topics where different questions need different steps | Taps a question type; Next and Back follow only that route (to be ported) |
| Progressive flowchart | The algorithm on one screen | Taps a box; the route lights up to the next split (to be ported) |
| End (`end`) | The last slide | Sees the score; deals new cases or goes back to the start |

## Behaviour rules

Every interactive element behaves the same way, so learners never have to relearn the page.

- **Tap again to close.** Tapping an open item hides it.
- **Click anywhere to clear.** A click anywhere else, including empty space and the bottom bar, returns the slide to its starting state. Clicks inside an opened list or card keep it open.
- **One open item per group.** Opening a circle closes its neighbour; reveal cards in a group open one at a time.
- **Re-entering a slide starts fresh.** Every pattern resets when its slide is shown again.
- **Only the tapped item grows.** Neighbouring cards keep their size; nothing stretches around empty space.
- **Reveal in sequence.** Lists appear one line after another (about 0.2 s apart); motion is off for users who prefer reduced motion.
- **Only the target is clickable.** In circle groups, only the circle responds, not its label.
- **No placeholders, no sub-labels.** Hidden answers leave no "?" marks; circles, cards, buckets and choices show only their name (and the concept's letter).
- **Cases are dealt in a random order.** Practise (or New cases) reshuffles the cases, numbers them by their place in the run, keeps the solved example first and restarts the score.
- **Answer positions are shuffled.** Each case fixes its own option order from its ID, so the answer is not always first and the order is the same every time that case is opened.
- **A case gives nothing away.** The stem, question and choices carry no hints; the clue phrase is highlighted only after a wrong answer (and in the solved example).
- **Wrong answers teach.** A wrong choice shakes, gives a one-line hint and lights the clue phrase. Scoring counts the first attempt only, once per case.
- **A right answer explains.** It shows why, then a "Next case" (or "See your score") button. In a multi-step case, a correct step moves on by itself after about 0.75 s.
- **Learn and Practise are separate paths.** Next, Back and the arrow keys never cross from one into the other: each part's first slide has no Back and its last slide has no Next, and the slide count and progress bar count within the part. Home returns to the title.
- **Navigation is always there.** Back, Home and Next sit in a bottom bar, and the arrow keys move between slides. The title slide has none of them. A hidden button takes no space.
- **Hidden slides.** A slide with `hidden: true` stays in the YAML and is still checked, but is left out of the page.
- **Keyboard and screen readers.** Every clickable element is a button or has a button role, is reachable with Tab, and opens with Enter or Space.
- **Every event goes through `record()`.** Views and answers are reported with permanent IDs through one function in the engine, so analytics and a results database can plug in later.

## Layout and responsiveness

- **The 16:9 stage.** In any landscape window at least 900 × 480 px (laptops, desktops, tablets held sideways), the page is a canvas at least 1280 × 720, scaled to fit and widened (or deepened) to the window's shape, so it fills the whole window with no letterbox. A 16:9 window gets exactly 1280 × 720, so every recording frames the same, and a 1920 × 1080 recording is the stage at 1.5×.
- **Fluid below that, and in portrait.** On phones, small windows and portrait tablets the page reflows and scrolls, with a sticky top and bottom bar and 16 px side margins. The window is measured by its real width (`clientWidth`), because a tablet widens `innerWidth` to fit the canvas.
- **Tablets are roomy, not shrunk.** A fluid page 601–1099 px wide uses a larger size unit, so type, dots and spacing stay near their stage size instead of shrinking with the width. Tablet layouts use the extra height: the decision tree gets longer links and bigger steps, question flows stack vertically, answer choices sit 2 × 2, warm-up buckets 2 × 2 and reveal cards three across.
- **Sizes are written once.** Engine sizes use `clamp(phone, n * var(--u), stage)`, where `--u` is 1% of the page width (1.4% on tablets), so they sit at their stage value on the canvas and shrink on phones. Never write a bare `cqw` size. Responsive rules use container queries on the page, not media queries.
- **A teaching slide fits the stage** with its answers open: no vertical scrolling. Shrink cards and spacing rather than letting it scroll. Practice slides (warm-up, end) may scroll.
- **Short slides are centred:** the heading stays at the top and the content sits in the middle of the space below it (hook, question flows, reveal cards, zoom spectra, end).
- **Question flows** run left to right on the stage and turn vertical on phones and portrait tablets.
- **Bottom bar on phones:** buttons show an icon only, except Next.

## Slide blueprint and checklist

A single-decision topic runs: title → hook → teach each step (one slide per step) → solve the hook → why it matters → practise (warm-up, solved example, cases) → end. A topic with several question types adds a hub and routes (to be ported).

Before publishing:

- [ ] `python build.py` passes: labels come from `concepts`, every case answer is an option, IDs are valid and none was dropped without retiring it
- [ ] `node checks/check.mjs dist/<specialty>/<topic>.html` passes: no overflow at 1280 × 720, 1920 × 1080 and 375 px with every reveal open, every case solves, the score adds up, no console errors or network requests
- [ ] The screenshots (`--shots`) look right, in light and dark mode
- [ ] Nothing on a case gives the answer away
- [ ] Content checked against the sources listed in the topic, and reviewed by a second clinician before the status moves to `reviewed`
- [ ] Description filled in; credits footer on the title and end slides
