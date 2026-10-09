# Drawing prompts

The home page's drawings are made with Codex image generation (`codex exec -m gpt-5.5`, which writes into `art/drafts/`),
always with approved drawings attached as references (`-i art/drafts/adult-hero-2.png -i art/drafts/line-se.png`; the drafts are
kept locally, not in git). A sample is shown and approved before a set is made. `art/make_site_images.py` then makes the approved
drawings small (WebP) into `art/site/`.

## Style (start every prompt with this)

Match the attached images exactly: editorial medical line illustration like an explainer figure in a leading medical journal,
fine confident dark navy line art with flat spot colour fills, adults with realistic proportions and calm professional
expressions, plain very light background #F7F9FC, lots of white space, no gradients. Every element sits fully inside the frame
with a clear margin on all four sides; nothing is cut off. Palette: navy #1F4E8C, sky blue #1F7FBF, teal #2A9D8F,
mint #5EE0C4, coral #D85A30 sparingly, warm grey. 16:9. Absolutely no text, letters, numbers or logos.

## Subjects so far

| File | Subject |
| --- | --- |
| hero (`adult-hero-2.png`) | The whole of internal medicine: a ward round, a consultant talking with an older patient in bed, a junior doctor with a tablet and a nurse; a bedside monitor; small icons of a heart, lungs, a kidney, a brain and a pill above them. The left 45% empty for the headline |
| `thumbs/data-types` | A doctor, head to shoes, beside a small table with a label tag, a three-step podium without numbers and a ruler |
| `thumbs/centre-shape-spread` | A row of patients in gowns; a curve with its hump to the left and a long tail to the right |
| `thumbs/standard-error` | Three women of different heights by a height measure; a wide bell with a much narrower bell beneath it |
| `thumbs/hypothesis-testing` | The court: a judge with a gavel, a doctor holding up a blood pressure cuff as evidence, a medicine bottle in the dock |
| `thumbs/testing-a-difference` | Two seated groups of patients, one with a white and one with a blue medicine bottle; two overlapping bells slightly apart |
| `thumbs/ci-and-p` | A doctor studies one interval bar (end caps, a dot in the middle) above an axis whose dashed no-effect line lies clearly to the left of the bar |
| `thumbs/errors` | A smoke alarm ringing with no fire, and a fishing net with a fish slipping out |
| `thumbs/power` | A doctor at a desk planning a trial, looking at a large group of adults in rows |
| `covers/statistics` | A doctor beside a whiteboard with a bell curve and a small bar chart |
| `covers/cardiology` | A doctor listening to a seated patient's chest; a monitor with a heart trace |
| `covers/nephrology` | A patient in a dialysis chair while a nurse checks the lines |
| `covers/neurology` | A doctor testing a seated patient's knee reflex |

A new lesson's thumbnail pictures its own example from the lesson (its hook or its story), never a generic clinical scene.
